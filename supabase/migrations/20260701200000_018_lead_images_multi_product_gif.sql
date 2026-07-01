-- Optional reference images for potential customers + lead-images storage bucket

ALTER TABLE potential_customers
  ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}';

-- Lead reference images bucket (staff with manual-order permission)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lead-images',
  'lead-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "public_read_lead_images" ON storage.objects;
CREATE POLICY "public_read_lead_images" ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'lead-images');

DROP POLICY IF EXISTS "staff_upload_lead_images" ON storage.objects;
CREATE POLICY "staff_upload_lead_images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'lead-images' AND admin_has_permission('create-manual-orders'));

DROP POLICY IF EXISTS "staff_update_lead_images" ON storage.objects;
CREATE POLICY "staff_update_lead_images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'lead-images' AND admin_has_permission('create-manual-orders'));

DROP POLICY IF EXISTS "staff_delete_lead_images" ON storage.objects;
CREATE POLICY "staff_delete_lead_images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'lead-images' AND admin_has_permission('create-manual-orders'));

CREATE OR REPLACE FUNCTION create_potential_customer_admin(p_payload jsonb)
RETURNS json
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin admin_users%ROWTYPE;
  v_id uuid;
  v_name text;
  v_phone text;
  v_email text;
  v_social text;
  v_images text[];
BEGIN
  PERFORM assert_admin_permission('create-manual-orders');
  PERFORM purge_expired_potential_customers();
  v_admin := get_active_admin_row();

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

  INSERT INTO potential_customers (
    name, phone, email, social_link, notes, interest_summary, images,
    created_by_admin_id, created_by_admin_name, purge_after
  ) VALUES (
    v_name,
    v_phone,
    NULLIF(v_email, ''),
    v_social,
    NULLIF(trim(p_payload->>'notes'), ''),
    NULLIF(trim(p_payload->>'interest_summary'), ''),
    v_images,
    v_admin.id,
    v_admin.name,
    now() + interval '10 days'
  ) RETURNING id INTO v_id;

  RETURN json_build_object('id', v_id, 'name', v_name);
END;
$$;

CREATE OR REPLACE FUNCTION list_potential_customers_admin(p_search text DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM assert_admin_permission('view-orders');
  PERFORM purge_expired_potential_customers();

  RETURN COALESCE((
    SELECT json_agg(row_to_json(r) ORDER BY r."createdAt" DESC)
    FROM (
      SELECT
        id,
        name,
        phone,
        email,
        social_link AS "socialLink",
        notes,
        interest_summary AS "interestSummary",
        images,
        created_by_admin_name AS "createdByAdminName",
        created_at AS "createdAt",
        purge_after AS "purgeAfter"
      FROM potential_customers
      WHERE purge_after > now()
        AND (
          p_search IS NULL OR p_search = '' OR
          name ILIKE '%' || p_search || '%' OR
          COALESCE(phone, '') ILIKE '%' || p_search || '%' OR
          COALESCE(email, '') ILIKE '%' || p_search || '%' OR
          COALESCE(social_link, '') ILIKE '%' || p_search || '%' OR
          COALESCE(interest_summary, '') ILIKE '%' || p_search || '%'
        )
    ) r
  ), '[]'::json);
END;
$$;
