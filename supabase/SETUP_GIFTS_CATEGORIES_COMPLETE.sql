-- ONE FILE: Create gift collections + nest under Gifts (run entire file in SQL Editor)
-- Your screenshot showed NULL because migration 019 was never run — only MOVE was run.

-- Step 0: ensure Gifts exists
INSERT INTO categories (slug, name, name_bn, description, display_order, parent_id, is_active)
VALUES ('gifts', 'Gifts', 'উপহার', 'Curated gift hampers and artisan collectibles', 5, NULL, true)
ON CONFLICT (slug) DO UPDATE SET is_active = true, updated_at = now();

-- Step 1: create collections (luxury names)
INSERT INTO categories (slug, name, name_bn, description, display_order, parent_id, is_active)
VALUES
  ('3d-prints', 'Artisan Luxe', 'আর্টিসান লাক্স', 'Hand-finished collectibles — bookmarks, coasters, wall art & statement pieces', 1, NULL, true),
  ('bedsheets', 'Luxury Bedding', 'লাক্সারি বিছানা', 'Hotel-soft bedsheets — sleep like royalty', 2, NULL, true),
  ('2d-art', 'Gallery Prints', 'গ্যালারি আর্ট', 'Museum-worthy digital art for your walls & desk', 3, NULL, true),
  ('dp-covers', 'Profile Studio', 'প্রোফাইল স্টুডিও', 'Stunning DP & cover art that turns heads on every feed', 4, NULL, true),
  ('3d-models', 'Collector''s Edition', 'কালেক্টর''স এডিশন', 'Rare figurines & ambient glow pieces for true fans', 5, NULL, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  name_bn = EXCLUDED.name_bn,
  description = EXCLUDED.description,
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

-- Step 2: nest collections under Gifts
UPDATE categories c
SET parent_id = g.id, updated_at = now()
FROM categories g
WHERE g.slug = 'gifts'
  AND c.slug IN ('3d-prints', 'bedsheets', '2d-art', 'dp-covers', '3d-models');

-- Step 3: verify (should show many rows, NOT null)
SELECT
  g.name AS gifts_section,
  child.name AS collection,
  sub.name AS subcategory
FROM categories g
LEFT JOIN categories child ON child.parent_id = g.id
LEFT JOIN categories sub ON sub.parent_id = child.id
WHERE g.slug = 'gifts'
ORDER BY child.display_order, sub.display_order;
