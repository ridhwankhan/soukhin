-- ONE FILE: Run entire script in Supabase SQL Editor
-- Fixes staff for users who already registered (customer account → staff access)

-- Link staff rows to existing auth.users by email (registered customers → staff)

CREATE OR REPLACE FUNCTION link_staff_member_account(p_staff_id uuid)
RETURNS json
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_staff admin_users%ROWTYPE;
  v_auth_id uuid;
  v_result json;
BEGIN
  IF NOT admin_has_permission('manage-staff') AND NOT admin_has_permission('manage-users') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_staff FROM admin_users WHERE id = p_staff_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'staff_not_found' USING ERRCODE = '22023';
  END IF;

  SELECT u.id INTO v_auth_id
  FROM auth.users u
  WHERE lower(trim(u.email)) = lower(trim(v_staff.email))
  LIMIT 1;

  IF v_auth_id IS NULL THEN
    RAISE EXCEPTION 'auth_user_not_found' USING ERRCODE = '22023';
  END IF;

  UPDATE admin_users
  SET auth_user_id = NULL, updated_at = now()
  WHERE auth_user_id = v_auth_id
    AND id <> p_staff_id;

  UPDATE admin_users
  SET auth_user_id = v_auth_id, updated_at = now()
  WHERE id = p_staff_id;

  SELECT row_to_json(s) INTO v_result
  FROM (
    SELECT id, email, name, replace(role, '_', '-') AS role,
      is_active AS "isActive", auth_user_id IS NOT NULL AS "isLinked",
      last_login AS "lastLogin", created_at AS "createdAt"
    FROM admin_users WHERE id = p_staff_id
  ) s;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION link_staff_by_email_internal(p_email text)
RETURNS json
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(p_email));
  v_staff admin_users%ROWTYPE;
  v_auth_id uuid;
BEGIN
  SELECT * INTO v_staff FROM admin_users WHERE lower(email) = v_email AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'staff_not_found' USING ERRCODE = '22023';
  END IF;

  SELECT u.id INTO v_auth_id
  FROM auth.users u
  WHERE lower(trim(u.email)) = v_email
  LIMIT 1;

  IF v_auth_id IS NULL THEN
    RETURN json_build_object('linked', false, 'message', 'No auth account for this email yet.');
  END IF;

  UPDATE admin_users
  SET auth_user_id = NULL, updated_at = now()
  WHERE auth_user_id = v_auth_id
    AND id <> v_staff.id;

  UPDATE admin_users
  SET auth_user_id = v_auth_id, updated_at = now()
  WHERE id = v_staff.id;

  RETURN json_build_object(
    'linked', true,
    'message', 'Account linked. They can sign in at /auth with their existing password.',
    'userId', v_auth_id
  );
END;
$$;

REVOKE ALL ON FUNCTION link_staff_by_email_internal(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION link_staff_by_email_internal(text) TO service_role;

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

    IF replace(v_existing.role, '_', '-') = 'owner' AND v_actor_role <> 'owner' THEN
      RAISE EXCEPTION 'cannot_modify_owner' USING ERRCODE = '42501';
    END IF;
    IF replace(v_existing.role, '_', '-') = 'admin' AND v_actor_role <> 'owner' THEN
      RAISE EXCEPTION 'cannot_modify_admin' USING ERRCODE = '42501';
    END IF;

    IF v_existing.auth_user_id = auth.uid() AND v_role <> replace(v_existing.role, '_', '-') THEN
      RAISE EXCEPTION 'cannot_change_own_role' USING ERRCODE = '42501';
    END IF;

    UPDATE admin_users SET
      name = v_name,
      role = v_role,
      updated_at = now()
    WHERE id = v_id;
  ELSE
    IF EXISTS (SELECT 1 FROM admin_users WHERE lower(email) = v_email) THEN
      RAISE EXCEPTION 'email_already_staff' USING ERRCODE = '22023';
    END IF;

    INSERT INTO admin_users (email, name, role, is_active)
    VALUES (v_email, v_name, v_role, true)
    RETURNING id INTO v_id;
  END IF;

  UPDATE admin_users au
  SET auth_user_id = u.id, updated_at = now()
  FROM auth.users u
  WHERE au.id = v_id
    AND au.auth_user_id IS NULL
    AND lower(trim(u.email)) = v_email;

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

GRANT EXECUTE ON FUNCTION link_staff_member_account(uuid) TO authenticated;
