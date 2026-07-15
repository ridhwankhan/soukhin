-- Edit potential customers, homepage new releases, store contact email fix

CREATE OR REPLACE FUNCTION update_potential_customer_admin(p_id uuid, p_payload jsonb)
RETURNS json
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text;
  v_phone text;
  v_email text;
  v_social text;
  v_images text[];
BEGIN
  PERFORM assert_admin_permission('create-manual-orders');

  IF p_id IS NULL THEN
    RAISE EXCEPTION 'invalid_id' USING ERRCODE = '22023';
  END IF;

  v_name := trim(p_payload->>'name');
  v_phone := NULLIF(regexp_replace(trim(COALESCE(p_payload->>'phone', '')), '\s+', '', 'g'), '');
  v_email := lower(trim(COALESCE(p_payload->>'email', '')));
  v_social := NULLIF(trim(COALESCE(p_payload->>'social_link', '')), '');

  SELECT COALESCE(array_agg(trim(elem)), '{}')
  INTO v_images
  FROM jsonb_array_elements_text(COALESCE(p_payload->'images', '[]'::jsonb)) AS elem
  WHERE trim(elem) <> '';

  IF length(v_name) < 2 OR length(v_name) > 120 THEN
    RAISE EXCEPTION 'invalid_name' USING ERRCODE = '22023';
  END IF;
  IF v_email <> '' AND v_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'invalid_email' USING ERRCODE = '22023';
  END IF;
  IF v_phone IS NOT NULL AND length(v_phone) > 0 AND length(v_phone) < 10 THEN
    RAISE EXCEPTION 'invalid_phone' USING ERRCODE = '22023';
  END IF;
  IF COALESCE(v_phone, v_email, v_social) IS NULL AND COALESCE(array_length(v_images, 1), 0) = 0 THEN
    RAISE EXCEPTION 'contact_required' USING ERRCODE = '22023';
  END IF;

  UPDATE potential_customers SET
    name = v_name,
    phone = v_phone,
    email = NULLIF(v_email, ''),
    social_link = v_social,
    notes = NULLIF(trim(p_payload->>'notes'), ''),
    interest_summary = NULLIF(trim(p_payload->>'interest_summary'), ''),
    images = v_images
  WHERE id = p_id AND purge_after > now();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'not_found' USING ERRCODE = 'P0002';
  END IF;

  RETURN json_build_object('id', p_id, 'name', v_name);
END;
$$;

GRANT EXECUTE ON FUNCTION update_potential_customer_admin(uuid, jsonb) TO authenticated;
REVOKE EXECUTE ON FUNCTION update_potential_customer_admin(uuid, jsonb) FROM anon;

-- Fix legacy placeholder contact email in site settings
UPDATE site_settings
SET setting_value = jsonb_set(
  setting_value,
  '{email}',
  '"shoukhin.lifestyle.bd@gmail.com"'::jsonb,
  true
)
WHERE setting_key = 'contact'
  AND COALESCE(setting_value->>'email', '') IN ('hello@soukhin.com', '', 'hello@shoukhin.com');

INSERT INTO site_settings (setting_key, setting_value, description)
VALUES (
  'new_releases',
  '[]'::jsonb,
  'Homepage NEW releases slideshow — photography and launch highlights'
)
ON CONFLICT (setting_key) DO NOTHING;

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
    'hero', 'announcement', 'announcements', 'banners', 'contact', 'delivery', 'currency', 'new_releases'
  );
$$;
