-- Make ridhwankhan03@gmail.com the Soukhin store owner (safe to re-run)
-- Run in Supabase → SQL Editor → RUN

-- 1. Set new owner
INSERT INTO admin_users (email, name, role, is_active)
VALUES ('ridhwankhan03@gmail.com', 'Soukhin Owner', 'owner', true)
ON CONFLICT (email) DO UPDATE
SET role = 'owner', is_active = true, name = 'Soukhin Owner', updated_at = now();

-- 2. Demote old owner row (keeps history; no longer owner)
UPDATE admin_users
SET role = 'admin', is_active = true, updated_at = now()
WHERE lower(email) = 'shoukhin.lifestyle.bd@gmail.com';

-- 3. Link owner row to auth user if they already signed up
UPDATE admin_users
SET auth_user_id = (
  SELECT id FROM auth.users WHERE lower(email) = 'ridhwankhan03@gmail.com' LIMIT 1
),
updated_at = now()
WHERE lower(email) = 'ridhwankhan03@gmail.com'
  AND EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = 'ridhwankhan03@gmail.com');

-- Verify
SELECT email, role, is_active, auth_user_id IS NOT NULL AS is_linked
FROM admin_users
WHERE lower(email) IN ('ridhwankhan03@gmail.com', 'shoukhin.lifestyle.bd@gmail.com')
ORDER BY role DESC, email;
