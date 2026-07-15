-- Run in Supabase SQL Editor if staff cannot save product edits.
-- Improves upsert errors + keeps multi-role permission checks in sync.

CREATE OR REPLACE FUNCTION upsert_product_admin(p_payload jsonb)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_result json;
BEGIN
  PERFORM assert_admin_permission('manage-products');

  v_id := NULLIF(p_payload->>'id', '')::uuid;

  IF v_id IS NULL THEN
    INSERT INTO products (
      sku, name, name_bn, category_id, price, sale_price, images, stock,
      description, description_bn, size_options, color_options,
      food_note, delivery_note, tags, is_active, is_featured, badges
    ) VALUES (
      p_payload->>'sku', p_payload->>'name', NULLIF(p_payload->>'name_bn', ''),
      (p_payload->>'category_id')::uuid, (p_payload->>'price')::integer,
      NULLIF(p_payload->>'sale_price', '')::integer,
      ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_payload->'images', '[]'::jsonb))),
      COALESCE((p_payload->>'stock')::integer, 0),
      NULLIF(p_payload->>'description', ''), NULLIF(p_payload->>'description_bn', ''),
      ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_payload->'size_options', '[]'::jsonb))),
      ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_payload->'color_options', '[]'::jsonb))),
      NULLIF(p_payload->>'food_note', ''), NULLIF(p_payload->>'delivery_note', ''),
      ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_payload->'tags', '[]'::jsonb))),
      COALESCE((p_payload->>'is_active')::boolean, true),
      COALESCE((p_payload->>'is_featured')::boolean, false),
      ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_payload->'badges', '[]'::jsonb)))
    ) RETURNING id INTO v_id;
  ELSE
    UPDATE products SET
      sku = p_payload->>'sku', name = p_payload->>'name',
      name_bn = NULLIF(p_payload->>'name_bn', ''),
      category_id = (p_payload->>'category_id')::uuid,
      price = (p_payload->>'price')::integer,
      sale_price = NULLIF(p_payload->>'sale_price', '')::integer,
      images = ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_payload->'images', '[]'::jsonb))),
      stock = COALESCE((p_payload->>'stock')::integer, 0),
      description = NULLIF(p_payload->>'description', ''),
      description_bn = NULLIF(p_payload->>'description_bn', ''),
      size_options = ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_payload->'size_options', '[]'::jsonb))),
      color_options = ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_payload->'color_options', '[]'::jsonb))),
      food_note = NULLIF(p_payload->>'food_note', ''),
      delivery_note = NULLIF(p_payload->>'delivery_note', ''),
      tags = ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_payload->'tags', '[]'::jsonb))),
      is_active = COALESCE((p_payload->>'is_active')::boolean, true),
      is_featured = COALESCE((p_payload->>'is_featured')::boolean, false),
      badges = ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_payload->'badges', '[]'::jsonb))),
      updated_at = now()
    WHERE id = v_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'product_not_found' USING ERRCODE = '22023';
    END IF;
  END IF;

  SELECT row_to_json(p) INTO v_result
  FROM (
    SELECT pr.*, c.slug AS category_slug
    FROM products pr
    JOIN categories c ON c.id = pr.category_id
    WHERE pr.id = v_id
  ) p;

  IF v_result IS NULL THEN
    RAISE EXCEPTION 'invalid_category' USING ERRCODE = '22023';
  END IF;

  RETURN v_result;
EXCEPTION
  WHEN unique_violation THEN
    IF SQLERRM LIKE '%sku%' THEN
      RAISE EXCEPTION 'duplicate_sku' USING ERRCODE = '23505';
    END IF;
    RAISE;
END;
$$;
