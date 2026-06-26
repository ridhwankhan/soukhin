-- Storage for product images + clear seed products + product query RPCs

-- Remove placeholder seed products so categories start empty
DELETE FROM products;

-- Product images bucket (public read for storefront)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "public_read_product_images" ON storage.objects;
CREATE POLICY "public_read_product_images" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "upload_product_images" ON storage.objects;
CREATE POLICY "upload_product_images" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "update_product_images" ON storage.objects;
CREATE POLICY "update_product_images" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "delete_product_images" ON storage.objects;
CREATE POLICY "delete_product_images" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'product-images');

-- All descendant category IDs for a slug (includes the slug's own category)
CREATE OR REPLACE FUNCTION get_descendant_category_ids(p_slug text)
RETURNS uuid[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH RECURSIVE cat_tree AS (
    SELECT id FROM categories WHERE slug = p_slug AND is_active = true
    UNION ALL
    SELECT c.id FROM categories c
    JOIN cat_tree ct ON c.parent_id = ct.id
    WHERE c.is_active = true
  )
  SELECT COALESCE(array_agg(id), ARRAY[]::uuid[]) FROM cat_tree;
$$;

-- Products for storefront/admin by category slug (includes subcategories)
CREATE OR REPLACE FUNCTION get_products_by_category_slug(p_slug text, p_active_only boolean DEFAULT true)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(json_agg(row_to_json(p) ORDER BY p.created_at DESC), '[]'::json)
  FROM (
    SELECT
      pr.id,
      pr.sku,
      pr.name,
      pr.name_bn,
      c.slug AS category_slug,
      pr.price,
      pr.sale_price,
      pr.images,
      pr.stock,
      pr.description,
      pr.description_bn,
      pr.size_options,
      pr.color_options,
      pr.food_note,
      pr.delivery_note,
      pr.tags,
      pr.is_active,
      pr.is_featured,
      pr.badges,
      pr.category_id,
      pr.created_at,
      pr.updated_at
    FROM products pr
    JOIN categories c ON c.id = pr.category_id
    WHERE pr.category_id = ANY(get_descendant_category_ids(p_slug))
      AND (NOT p_active_only OR pr.is_active = true)
    ORDER BY pr.created_at DESC
  ) p;
$$;

-- Search products
CREATE OR REPLACE FUNCTION search_products_query(p_query text, p_limit integer DEFAULT 20)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(json_agg(row_to_json(p)), '[]'::json)
  FROM (
    SELECT
      pr.id, pr.sku, pr.name, pr.name_bn, c.slug AS category_slug,
      pr.price, pr.sale_price, pr.images, pr.stock, pr.description,
      pr.size_options, pr.color_options, pr.food_note, pr.delivery_note,
      pr.tags, pr.is_active, pr.is_featured, pr.badges, pr.created_at, pr.updated_at
    FROM products pr
    JOIN categories c ON c.id = pr.category_id
    WHERE pr.is_active = true
      AND (
        pr.name ILIKE '%' || p_query || '%'
        OR pr.name_bn ILIKE '%' || p_query || '%'
        OR pr.sku ILIKE '%' || p_query || '%'
        OR pr.description ILIKE '%' || p_query || '%'
      )
    ORDER BY pr.is_featured DESC, pr.created_at DESC
    LIMIT p_limit
  ) p;
$$;

-- Leaf categories for product assignment (categories with no children)
CREATE OR REPLACE FUNCTION get_assignable_categories()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(json_agg(row_to_json(c) ORDER BY c.name), '[]'::json)
  FROM (
    SELECT cat.id, cat.slug, cat.name, cat.name_bn,
      parent.slug AS parent_slug,
      root.slug AS root_slug
    FROM categories cat
    LEFT JOIN categories parent ON parent.id = cat.parent_id
    LEFT JOIN categories root ON root.id = COALESCE(
      CASE WHEN parent.parent_id IS NULL THEN parent.id END,
      (SELECT p2.id FROM categories p2 WHERE p2.id = parent.parent_id LIMIT 1)
    )
    WHERE cat.is_active = true
      AND NOT EXISTS (SELECT 1 FROM categories child WHERE child.parent_id = cat.id)
    ORDER BY cat.name
  ) c;
$$;

-- Category tree for navigation
CREATE OR REPLACE FUNCTION get_category_nav()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(json_agg(row_to_json(c) ORDER BY c.display_order), '[]'::json)
  FROM (
    SELECT id, slug, name, name_bn, description, image, display_order, parent_id
    FROM categories
    WHERE is_active = true
    ORDER BY display_order, name
  ) c;
$$;

-- Admin product mutations (SECURITY DEFINER for admin panel without strict auth yet)
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
  v_id := NULLIF(p_payload->>'id', '')::uuid;

  IF v_id IS NULL THEN
    INSERT INTO products (
      sku, name, name_bn, category_id, price, sale_price, images, stock,
      description, description_bn, size_options, color_options,
      food_note, delivery_note, tags, is_active, is_featured, badges
    ) VALUES (
      p_payload->>'sku',
      p_payload->>'name',
      NULLIF(p_payload->>'name_bn', ''),
      (p_payload->>'category_id')::uuid,
      (p_payload->>'price')::integer,
      NULLIF(p_payload->>'sale_price', '')::integer,
      ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_payload->'images', '[]'::jsonb))),
      COALESCE((p_payload->>'stock')::integer, 0),
      NULLIF(p_payload->>'description', ''),
      NULLIF(p_payload->>'description_bn', ''),
      ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_payload->'size_options', '[]'::jsonb))),
      ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_payload->'color_options', '[]'::jsonb))),
      NULLIF(p_payload->>'food_note', ''),
      NULLIF(p_payload->>'delivery_note', ''),
      ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_payload->'tags', '[]'::jsonb))),
      COALESCE((p_payload->>'is_active')::boolean, true),
      COALESCE((p_payload->>'is_featured')::boolean, false),
      ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_payload->'badges', '[]'::jsonb)))
    )
    RETURNING id INTO v_id;
  ELSE
    UPDATE products SET
      sku = p_payload->>'sku',
      name = p_payload->>'name',
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
  END IF;

  SELECT row_to_json(p) INTO v_result
  FROM (
    SELECT pr.*, c.slug AS category_slug
    FROM products pr
    JOIN categories c ON c.id = pr.category_id
    WHERE pr.id = v_id
  ) p;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION delete_product_admin(p_product_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM products WHERE id = p_product_id;
END;
$$;

GRANT EXECUTE ON FUNCTION get_descendant_category_ids(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_products_by_category_slug(text, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_products_query(text, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_assignable_categories() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_category_nav() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION upsert_product_admin(jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION delete_product_admin(uuid) TO anon, authenticated;
