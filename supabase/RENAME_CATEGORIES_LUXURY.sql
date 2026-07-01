-- Rebrand business categories: luxury lifestyle names (no "3D print" jargon)
-- Run if you already applied migration 019 with old names

UPDATE categories SET name = 'Artisan Luxe', name_bn = 'আর্টিসান লাক্স',
  description = 'Hand-finished collectibles — bookmarks, coasters, wall art & statement pieces', updated_at = now()
WHERE slug = '3d-prints';

UPDATE categories SET name = 'Luxury Bedding', name_bn = 'লাক্সারি বিছানা',
  description = 'Hotel-soft bedsheets — sleep like royalty', updated_at = now()
WHERE slug = 'bedsheets';

UPDATE categories SET name = 'Gallery Prints', name_bn = 'গ্যালারি আর্ট',
  description = 'Museum-worthy digital art for your walls & desk', updated_at = now()
WHERE slug = '2d-art';

UPDATE categories SET name = 'Profile Studio', name_bn = 'প্রোফাইল স্টুডিও',
  description = 'Stunning DP & cover art that turns heads on every feed', updated_at = now()
WHERE slug = 'dp-covers';

UPDATE categories SET name = 'Collector''s Edition', name_bn = 'কালেক্টর''স এডিশন',
  description = 'Rare figurines & ambient glow pieces for true fans', updated_at = now()
WHERE slug = '3d-models';

UPDATE categories SET name = 'Designer Bookmarks', name_bn = 'ডিজাইনার বুকমার্ক',
  description = 'Anime & art bookmarks book lovers can''t resist', updated_at = now()
WHERE slug = '3d-bookmarks';

UPDATE categories SET name = 'Icon Figurines', name_bn = 'আইকন ফিগারিন',
  description = 'Display-worthy character pieces — limited & collectible', updated_at = now()
WHERE slug = '3d-character-models';

UPDATE categories SET name = 'Luxury Coasters', name_bn = 'লাক্সারি কোস্টার',
  description = 'Statement coasters that elevate your coffee table', updated_at = now()
WHERE slug = '3d-coasters';

UPDATE categories SET name = 'Curated Gift Pieces', name_bn = 'কিউরেটেড উপহার',
  description = 'Desk décor, clocks & gifts they''ll talk about', updated_at = now()
WHERE slug = '3d-printed-gifts';

UPDATE categories SET name = 'Charm Keychains', name_bn = 'চার্ম কীচেইন',
  description = 'Carry your fandom in style — everyday luxury', updated_at = now()
WHERE slug = '3d-keyrings';

UPDATE categories SET name = 'Statement Wall Art', name_bn = 'স্টেটমেন্ট ওয়াল আর্ট',
  description = 'Wall pieces that transform any room instantly', updated_at = now()
WHERE slug = '3d-wall-decor';

UPDATE categories SET name = 'Ambient Glow Lamps', name_bn = 'অ্যাম্বিয়েন্ট গ্লো ল্যাম্প',
  description = 'Soft glow lamps — cozy room vibes fans adore', updated_at = now()
WHERE slug = '3d-night-lights';

SELECT slug, name, description FROM categories
WHERE slug IN (
  '3d-prints', 'bedsheets', '2d-art', 'dp-covers', '3d-models',
  '3d-bookmarks', '3d-character-models', '3d-coasters', '3d-printed-gifts',
  '3d-keyrings', '3d-wall-decor', '3d-night-lights'
)
ORDER BY display_order, name;
