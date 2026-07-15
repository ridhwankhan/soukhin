-- Fix: allow owners/admins with manage-settings OR manage-content to update storefront content settings.
-- Also ensure public settings include announcements + banners + new_releases.
-- Run in Supabase SQL Editor if admin saves silently fail with permission_denied.

CREATE OR REPLACE FUNCTION upsert_site_setting_admin(p_key text, p_value jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_content_keys text[] := ARRAY[
    'hero', 'announcement', 'announcements', 'banners', 'new_releases', 'contact'
  ];
BEGIN
  IF admin_has_permission('manage-settings') THEN
    NULL; -- full access
  ELSIF admin_has_permission('manage-content') AND p_key = ANY (v_content_keys) THEN
    NULL; -- content editors can update storefront content
  ELSE
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = '42501';
  END IF;

  INSERT INTO site_settings (setting_key, setting_value, description, updated_at)
  VALUES (p_key, p_value, p_key, now())
  ON CONFLICT (setting_key) DO UPDATE
  SET setting_value = EXCLUDED.setting_value, updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION get_public_site_settings()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(json_object_agg(setting_key, setting_value), '{}'::json)
  FROM site_settings
  WHERE setting_key IN (
    'hero', 'announcement', 'announcements', 'banners',
    'contact', 'delivery', 'currency', 'new_releases'
  );
$$;

GRANT EXECUTE ON FUNCTION upsert_site_setting_admin(text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION get_public_site_settings() TO anon, authenticated;

-- Seed announcements list from legacy single announcement if missing
INSERT INTO site_settings (setting_key, setting_value, description)
SELECT
  'announcements',
  jsonb_build_array(
    jsonb_build_object(
      'id', 'ann-legacy',
      'text', COALESCE(setting_value->>'text', 'Free delivery on orders over ৳2000 | Use code: SOUKHIN10'),
      'textBn', COALESCE(setting_value->>'textBn', ''),
      'isActive', true,
      'bgColor', 'green',
      'createdAt', now()::text,
      'updatedAt', now()::text
    )
  ),
  'Rotating announcement bar items'
FROM site_settings
WHERE setting_key = 'announcement'
ON CONFLICT (setting_key) DO NOTHING;
