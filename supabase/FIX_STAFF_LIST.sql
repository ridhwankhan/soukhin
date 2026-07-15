-- Run entire file in Supabase → SQL Editor
-- Fixes empty Staff & Roles page + shows who is in admin_users (including Intisar)

-- 1) Ensure additional_roles column exists (migration 021)
ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS additional_roles text[] NOT NULL DEFAULT '{}';

-- 2) list_staff_members RPC (required by /admin/users page)
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
        COALESCE(
          (SELECT json_agg(replace(r, '_', '-')) FROM unnest(additional_roles) AS r),
          '[]'::json
        ) AS "additionalRoles",
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

GRANT EXECUTE ON FUNCTION list_staff_members() TO authenticated;

-- 3) Ensure store owner row exists (adjust email if needed)
INSERT INTO admin_users (email, name, role, is_active)
VALUES ('shoukhin.lifestyle.bd@gmail.com', 'Soukhin Owner', 'owner', true)
ON CONFLICT (email) DO UPDATE
SET role = 'owner', is_active = true, updated_at = now();

-- Link owner to auth account when they have signed up
UPDATE admin_users au
SET auth_user_id = u.id, updated_at = now()
FROM auth.users u
WHERE lower(au.email) = lower(u.email)
  AND lower(au.email) = 'shoukhin.lifestyle.bd@gmail.com'
  AND au.is_active = true;

-- 4) Re-add Intisar as admin (EDIT email/name if different — search results below)
-- Uncomment and fix email after checking section 5:
/*
INSERT INTO admin_users (email, name, role, is_active)
VALUES ('intisar@example.com', 'Intisar', 'admin', true)
ON CONFLICT (email) DO UPDATE
SET role = 'admin', is_active = true, name = EXCLUDED.name, updated_at = now();

UPDATE admin_users au
SET auth_user_id = u.id, updated_at = now()
FROM auth.users u
WHERE lower(au.email) = lower(u.email)
  AND lower(au.email) = 'intisar@example.com';
*/

-- 5) DIAGNOSTIC — who is staff right now?
SELECT id, email, name, role, is_active,
       auth_user_id IS NOT NULL AS is_linked,
       last_login, created_at, updated_at
FROM admin_users
ORDER BY created_at;

-- 6) Find Intisar in registered customers / auth (use email from here in section 4)
SELECT 'customers' AS source, c.id, c.name, c.email, c.phone, NULL::text AS role
FROM customers c
WHERE lower(c.name) LIKE '%intisar%' OR lower(coalesce(c.email, '')) LIKE '%intisar%'
UNION ALL
SELECT 'auth.users', u.id::text, coalesce(u.raw_user_meta_data->>'name', u.email), u.email, NULL, NULL
FROM auth.users u
WHERE lower(u.email) LIKE '%intisar%'
   OR lower(coalesce(u.raw_user_meta_data->>'name', '')) LIKE '%intisar%';
