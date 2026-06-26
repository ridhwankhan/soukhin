-- Fix staff profile linking: STABLE functions cannot perform writes (UPDATE/DELETE).
-- get_active_admin_row and is_staff_email were marked STABLE but mutate rows,
-- causing "cannot execute UPDATE/DELETE in a read-only transaction" and null profiles.

CREATE OR REPLACE FUNCTION get_active_admin_row()
RETURNS admin_users
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin admin_users%ROWTYPE;
  v_email text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_admin
  FROM admin_users
  WHERE auth_user_id = auth.uid() AND is_active = true
  LIMIT 1;

  IF FOUND THEN
    RETURN v_admin;
  END IF;

  SELECT lower(trim(email)) INTO v_email
  FROM auth.users
  WHERE id = auth.uid();

  IF v_email IS NULL OR v_email = '' THEN
    RETURN NULL;
  END IF;

  -- Detach stale links for this auth user on a different staff email
  UPDATE admin_users
  SET auth_user_id = NULL, updated_at = now()
  WHERE auth_user_id = auth.uid()
    AND lower(email) <> v_email;

  UPDATE admin_users
  SET auth_user_id = auth.uid(), updated_at = now()
  WHERE lower(email) = v_email
    AND is_active = true
  RETURNING * INTO v_admin;

  RETURN v_admin;
END;
$$;

CREATE OR REPLACE FUNCTION is_staff_email(p_email text)
RETURNS boolean
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM assert_rate_limit('staff_email_check', 30, 3600);

  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE lower(email) = lower(trim(p_email)) AND is_active = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION ensure_my_staff_profile()
RETURNS json
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin admin_users%ROWTYPE;
BEGIN
  v_admin := get_active_admin_row();
  IF v_admin.id IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE admin_users SET last_login = now(), updated_at = now() WHERE id = v_admin.id;

  RETURN json_build_object(
    'id', v_admin.id,
    'email', v_admin.email,
    'name', v_admin.name,
    'role', replace(v_admin.role, '_', '-'),
    'avatar', v_admin.avatar,
    'isActive', v_admin.is_active,
    'createdAt', v_admin.created_at,
    'lastLogin', now()
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION ensure_my_staff_profile() FROM anon;
GRANT EXECUTE ON FUNCTION ensure_my_staff_profile() TO authenticated;

-- Ensure owner row exists (safe to re-run)
INSERT INTO admin_users (email, name, role, is_active)
VALUES ('shoukhin.lifestyle.bd@gmail.com', 'Soukhin Owner', 'owner', true)
ON CONFLICT (email) DO UPDATE
SET role = 'owner', is_active = true, updated_at = now();
