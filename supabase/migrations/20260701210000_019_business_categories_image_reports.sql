-- Business product categories (from E:\BUSINESS products folder) + broken image reports

-- ---------------------------------------------------------------------------
-- Categories: Artisan Luxe, Luxury Bedding, Gallery Art, Profile Studio, Collector's Edition
-- (Luxury lifestyle naming — no "3D print" jargon)

INSERT INTO categories (slug, name, name_bn, description, display_order, parent_id, is_active)
VALUES
  ('3d-prints', 'Artisan Luxe', 'আর্টিসান লাক্স', 'Hand-finished collectibles — bookmarks, coasters, wall art & statement pieces', 7, NULL, true),
  ('bedsheets', 'Luxury Bedding', 'লাক্সারি বিছানা', 'Hotel-soft bedsheets — sleep like royalty', 8, NULL, true),
  ('2d-art', 'Gallery Prints', 'গ্যালারি আর্ট', 'Museum-worthy digital art for your walls & desk', 9, NULL, true),
  ('dp-covers', 'Profile Studio', 'প্রোফাইল স্টুডিও', 'Stunning DP & cover art that turns heads on every feed', 10, NULL, true),
  ('3d-models', 'Collector''s Edition', 'কালেক্টর''স এডিশন', 'Rare figurines & ambient glow pieces for true fans', 11, NULL, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  name_bn = EXCLUDED.name_bn,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true,
  updated_at = now();

INSERT INTO categories (slug, name, name_bn, description, display_order, parent_id, is_active)
SELECT v.slug, v.name, v.name_bn, v.description, v.ord, p.id, true
FROM (VALUES
  ('3d-bookmarks', 'Designer Bookmarks', 'ডিজাইনার বুকমার্ক', 'Anime & art bookmarks book lovers can''t resist', 1),
  ('3d-character-models', 'Icon Figurines', 'আইকন ফিগারিন', 'Display-worthy character pieces — limited & collectible', 2),
  ('3d-coasters', 'Luxury Coasters', 'লাক্সারি কোস্টার', 'Statement coasters that elevate your coffee table', 3),
  ('3d-printed-gifts', 'Curated Gift Pieces', 'কিউরেটেড উপহার', 'Desk décor, clocks & gifts they''ll talk about', 4),
  ('3d-keyrings', 'Charm Keychains', 'চার্ম কীচেইন', 'Carry your fandom in style — everyday luxury', 5),
  ('3d-wall-decor', 'Statement Wall Art', 'স্টেটমেন্ট ওয়াল আর্ট', 'Wall pieces that transform any room instantly', 6)
) AS v(slug, name, name_bn, description, ord)
CROSS JOIN categories p
WHERE p.slug = '3d-prints'
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  name_bn = EXCLUDED.name_bn,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  parent_id = EXCLUDED.parent_id,
  is_active = true,
  updated_at = now();

INSERT INTO categories (slug, name, name_bn, description, display_order, parent_id, is_active)
SELECT '3d-night-lights', 'Ambient Glow Lamps', 'অ্যাম্বিয়েন্ট গ্লো ল্যাম্প', 'Soft glow lamps — cozy room vibes fans adore', 1, p.id, true
FROM categories p WHERE p.slug = '3d-models'
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  name_bn = EXCLUDED.name_bn,
  description = EXCLUDED.description,
  parent_id = EXCLUDED.parent_id,
  is_active = true,
  updated_at = now();

-- Link existing home bedsheets subcategory note: standalone bedsheets category added above

-- ---------------------------------------------------------------------------
-- Broken image reports → admin notifications
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS image_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  image_url text NOT NULL,
  product_name text,
  page_path text,
  reporter_email text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS image_reports_unread_idx ON image_reports (created_at DESC) WHERE NOT is_read;

ALTER TABLE image_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_read_image_reports" ON image_reports;
CREATE POLICY "staff_read_image_reports" ON image_reports FOR SELECT TO authenticated
  USING (admin_has_permission('view-dashboard'));

CREATE OR REPLACE FUNCTION report_broken_image(p_payload jsonb)
RETURNS json
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_url text;
  v_product_id uuid;
BEGIN
  v_url := trim(p_payload->>'image_url');
  IF v_url = '' OR length(v_url) > 2000 THEN
    RAISE EXCEPTION 'invalid_image_url' USING ERRCODE = '22023';
  END IF;

  v_product_id := NULLIF(trim(p_payload->>'product_id'), '')::uuid;

  INSERT INTO image_reports (product_id, image_url, product_name, page_path, reporter_email)
  VALUES (
    v_product_id,
    v_url,
    NULLIF(trim(p_payload->>'product_name'), ''),
    NULLIF(trim(p_payload->>'page_path'), ''),
    NULLIF(trim(p_payload->>'reporter_email'), '')
  ) RETURNING id INTO v_id;

  RETURN json_build_object('id', v_id, 'ok', true);
END;
$$;

CREATE OR REPLACE FUNCTION mark_image_report_read_admin(p_report_id uuid)
RETURNS void
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM assert_admin_permission('view-dashboard');
  UPDATE image_reports SET is_read = true WHERE id = p_report_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_admin_notifications()
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM assert_admin_permission('view-dashboard');
  RETURN (
    SELECT COALESCE(json_agg(n ORDER BY n.created_at DESC), '[]'::json)
    FROM (
      SELECT 'message'::text AS type, m.id::text, m.subject AS title,
        m.name || ' sent a message' AS body, NOT m.is_read AS is_unread,
        m.created_at, '/admin/messages'::text AS link
      FROM messages m
      UNION ALL
      SELECT 'order'::text, o.id::text, 'New order ' || o.order_number,
        o.customer_name || ' — ৳' || o.total::text, (o.status = 'pending')::boolean,
        o.created_at, '/admin/orders'::text
      FROM orders o
      WHERE o.created_at >= now() - interval '7 days' AND o.status IN ('pending', 'confirmed')
      UNION ALL
      SELECT 'image'::text, ir.id::text,
        'Broken image: ' || COALESCE(NULLIF(ir.product_name, ''), 'Product photo'),
        'Customer reported missing image' || COALESCE(' on ' || ir.page_path, ''),
        NOT ir.is_read,
        ir.created_at,
        CASE WHEN ir.product_id IS NOT NULL THEN '/admin/products' ELSE '/admin/products' END
      FROM image_reports ir
      WHERE ir.created_at >= now() - interval '30 days'
    ) n
  );
END;
$$;

GRANT EXECUTE ON FUNCTION report_broken_image(jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION mark_image_report_read_admin(uuid) TO authenticated;
