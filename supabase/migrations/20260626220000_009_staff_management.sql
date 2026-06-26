-- Staff / role management for owner and admin dashboard

-- Extend permissions: admin can view + manage non-admin staff
CREATE OR REPLACE FUNCTION admin_has_permission(p_permission text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_admin admin_users%ROWTYPE;
BEGIN
  v_admin := get_active_admin_row();
  IF v_admin.id IS NULL THEN
    RETURN false;
  END IF;
  v_role := replace(v_admin.role, '_', '-');

  CASE p_permission
    WHEN 'view-dashboard' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator', 'order-manager', 'inventory-manager');
    WHEN 'view-orders' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator', 'order-manager');
    WHEN 'update-orders' THEN
      RETURN v_role IN ('owner', 'admin', 'order-manager');
    WHEN 'view-products' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator', 'inventory-manager');
    WHEN 'manage-products' THEN
      RETURN v_role IN ('owner', 'admin', 'inventory-manager');
    WHEN 'view-inventory' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator', 'inventory-manager');
    WHEN 'manage-inventory' THEN
      RETURN v_role IN ('owner', 'admin', 'inventory-manager');
    WHEN 'view-customers' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator');
    WHEN 'manage-customers' THEN
      RETURN v_role IN ('owner', 'admin');
    WHEN 'view-reviews' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator');
    WHEN 'manage-reviews' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator');
    WHEN 'view-coupons' THEN
      RETURN v_role IN ('owner', 'admin');
    WHEN 'manage-coupons' THEN
      RETURN v_role IN ('owner', 'admin');
    WHEN 'view-content' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator');
    WHEN 'manage-content' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator');
    WHEN 'view-settings' THEN
      RETURN v_role IN ('owner', 'admin');
    WHEN 'manage-settings' THEN
      RETURN v_role IN ('owner', 'admin');
    WHEN 'view-users' THEN
      RETURN v_role IN ('owner', 'admin');
    WHEN 'manage-users' THEN
      RETURN v_role = 'owner';
    WHEN 'manage-staff' THEN
      RETURN v_role IN ('owner', 'admin');
    WHEN 'view-audit-log' THEN
      RETURN v_role IN ('owner', 'admin');
    ELSE
      RETURN false;
  END CASE;
END;
$$;

-- Helper: roles an actor may assign
CREATE OR REPLACE FUNCTION can_assign_staff_role(p_actor_role text, p_target_role text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_actor_role = 'owner' THEN p_target_role IN (
      'owner', 'admin', 'moderator', 'order-manager', 'inventory-manager'
    )
    WHEN p_actor_role = 'admin' THEN p_target_role IN (
      'moderator', 'order-manager', 'inventory-manager'
    )
    ELSE false
  END;
$$;

CREATE OR REPLACE FUNCTION get_actor_admin_role()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin admin_users%ROWTYPE;
BEGIN
  v_admin := get_active_admin_row();
  IF v_admin.id IS NULL THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = '42501';
  END IF;
  RETURN replace(v_admin.role, '_', '-');
END;
$$;

-- List all staff (owner + admin)
CREATE OR REPLACE FUNCTION list_staff_members()
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT admin_has_permission('view-users') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = '42501';
  END IF;

  RETURN (
    SELECT COALESCE(json_agg(row_to_json(s) ORDER BY s.created_at), '[]'::json)
    FROM (
      SELECT
        id, email, name,
        replace(role, '_', '-') AS role,
        avatar, is_active AS "isActive",
        auth_user_id IS NOT NULL AS "isLinked",
        last_login AS "lastLogin",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM admin_users
      ORDER BY created_at
    ) s
  );
END;
$$;

-- Create or update a staff member by email
CREATE OR REPLACE FUNCTION save_staff_member(p_payload jsonb)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_role text;
  v_id uuid;
  v_email text;
  v_name text;
  v_role text;
  v_existing admin_users%ROWTYPE;
  v_result json;
BEGIN
  v_actor_role := get_actor_admin_role();

  IF NOT admin_has_permission('manage-staff') AND NOT admin_has_permission('manage-users') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = '42501';
  END IF;

  v_email := lower(trim(p_payload->>'email'));
  v_name := trim(p_payload->>'name');
  v_role := replace(trim(p_payload->>'role'), '_', '-');

  IF v_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'invalid_email' USING ERRCODE = '22023';
  END IF;
  IF length(v_name) < 2 OR length(v_name) > 120 THEN
    RAISE EXCEPTION 'invalid_name' USING ERRCODE = '22023';
  END IF;
  IF NOT can_assign_staff_role(v_actor_role, v_role) THEN
    RAISE EXCEPTION 'cannot_assign_role' USING ERRCODE = '42501';
  END IF;

  v_id := NULLIF(p_payload->>'id', '')::uuid;

  IF v_id IS NOT NULL THEN
    SELECT * INTO v_existing FROM admin_users WHERE id = v_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'staff_not_found' USING ERRCODE = '22023';
    END IF;

    -- Protect owner accounts from non-owners
    IF replace(v_existing.role, '_', '-') = 'owner' AND v_actor_role <> 'owner' THEN
      RAISE EXCEPTION 'cannot_modify_owner' USING ERRCODE = '42501';
    END IF;
    IF replace(v_existing.role, '_', '-') = 'admin' AND v_actor_role <> 'owner' THEN
      RAISE EXCEPTION 'cannot_modify_admin' USING ERRCODE = '42501';
    END IF;

    -- Cannot change own role (prevents locking yourself out)
    IF v_existing.auth_user_id = auth.uid() AND v_role <> replace(v_existing.role, '_', '-') THEN
      RAISE EXCEPTION 'cannot_change_own_role' USING ERRCODE = '42501';
    END IF;

    UPDATE admin_users SET
      name = v_name,
      role = v_role,
      updated_at = now()
    WHERE id = v_id;
  ELSE
  -- New staff by email
    IF EXISTS (SELECT 1 FROM admin_users WHERE lower(email) = v_email) THEN
      RAISE EXCEPTION 'email_already_staff' USING ERRCODE = '22023';
    END IF;

    INSERT INTO admin_users (email, name, role, is_active)
    VALUES (v_email, v_name, v_role, true)
    RETURNING id INTO v_id;
  END IF;

  SELECT row_to_json(s) INTO v_result
  FROM (
    SELECT id, email, name, replace(role, '_', '-') AS role,
      is_active AS "isActive", auth_user_id IS NOT NULL AS "isLinked",
      last_login AS "lastLogin", created_at AS "createdAt"
    FROM admin_users WHERE id = v_id
  ) s;

  RETURN v_result;
END;
$$;

-- Activate / deactivate staff
CREATE OR REPLACE FUNCTION set_staff_active(p_staff_id uuid, p_is_active boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_role text;
  v_target admin_users%ROWTYPE;
  v_owner_count integer;
BEGIN
  v_actor_role := get_actor_admin_role();

  IF NOT admin_has_permission('manage-staff') AND NOT admin_has_permission('manage-users') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_target FROM admin_users WHERE id = p_staff_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'staff_not_found' USING ERRCODE = '22023';
  END IF;

  IF v_target.auth_user_id = auth.uid() THEN
    RAISE EXCEPTION 'cannot_deactivate_self' USING ERRCODE = '42501';
  END IF;

  IF replace(v_target.role, '_', '-') = 'owner' AND v_actor_role <> 'owner' THEN
    RAISE EXCEPTION 'cannot_modify_owner' USING ERRCODE = '42501';
  END IF;
  IF replace(v_target.role, '_', '-') = 'admin' AND v_actor_role <> 'owner' THEN
    RAISE EXCEPTION 'cannot_modify_admin' USING ERRCODE = '42501';
  END IF;

  IF NOT p_is_active AND replace(v_target.role, '_', '-') = 'owner' THEN
    SELECT COUNT(*) INTO v_owner_count
    FROM admin_users
    WHERE replace(role, '_', '-') = 'owner' AND is_active = true AND id <> p_staff_id;
    IF v_owner_count = 0 THEN
      RAISE EXCEPTION 'cannot_remove_last_owner' USING ERRCODE = '42501';
    END IF;
  END IF;

  UPDATE admin_users SET is_active = p_is_active, updated_at = now() WHERE id = p_staff_id;
END;
$$;

-- Update RLS so owner/admin can list all staff
DROP POLICY IF EXISTS "staff_read_admin_users" ON admin_users;
CREATE POLICY "staff_read_admin_users" ON admin_users FOR SELECT TO authenticated
  USING (
    auth_user_id = auth.uid()
    OR admin_has_permission('view-users')
  );

DROP POLICY IF EXISTS "owner_manage_admin_users" ON admin_users;
CREATE POLICY "owner_manage_admin_users" ON admin_users FOR ALL TO authenticated
  USING (admin_has_permission('manage-users'))
  WITH CHECK (admin_has_permission('manage-users'));

GRANT EXECUTE ON FUNCTION list_staff_members() TO authenticated;
GRANT EXECUTE ON FUNCTION save_staff_member(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION set_staff_active(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION get_actor_admin_role() TO authenticated;
