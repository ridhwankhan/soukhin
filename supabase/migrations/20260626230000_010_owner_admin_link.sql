-- Link staff profiles by email (re-link when auth user changes) and ensure store owner row exists

CREATE OR REPLACE FUNCTION get_active_admin_row()
RETURNS admin_users
LANGUAGE plpgsql
STABLE
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

  v_email := lower(trim(auth.jwt() ->> 'email'));
  IF v_email IS NULL OR v_email = '' THEN
    RETURN NULL;
  END IF;

  -- Link or re-link staff row for the signed-in auth user (handles new logins / password resets)
  UPDATE admin_users
  SET auth_user_id = auth.uid(), updated_at = now()
  WHERE lower(email) = v_email
    AND is_active = true
  RETURNING * INTO v_admin;

  RETURN v_admin;
END;
$$;

-- Store owner email used in production (safe to re-run)
INSERT INTO admin_users (email, name, role, is_active)
VALUES ('shoukhin.lifestyle.bd@gmail.com', 'Soukhin Owner', 'owner', true)
ON CONFLICT (email) DO UPDATE
SET role = 'owner', is_active = true, updated_at = now();
