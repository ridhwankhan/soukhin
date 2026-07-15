-- Run AFTER SETUP_GIFTS_CATEGORIES_COMPLETE.sql
-- Adds sample Charm Keychain + Gift products so /category/3d-keyrings and /category/gifts are live.
-- Replace image URLs with your Supabase Storage URLs after uploading real photos in Admin → Products.

-- ── Charm Keychains (3d-keyrings) ────────────────────────────────────────────

INSERT INTO products (sku, name, name_bn, category_id, price, sale_price, images, stock, description, description_bn, tags, is_active, is_featured, badges)
SELECT
  'KC-001',
  'Anime Hero Charm Keychain',
  'অ্যানিমে হিরো চার্ম কীচেইন',
  c.id,
  350,
  NULL,
  ARRAY['https://images.pexels.com/photos/4489174/pexels-photo-4489174.jpeg'],
  50,
  'Premium 3D-printed charm keychain with smooth finish and sturdy ring. Lightweight for bags, keys, or gifting.',
  'প্রিমিয়াম ৩ডি-প্রিন্টেড চার্ম কীচেইন — মসৃণ ফিনিশ, মজবুত রিং। ব্যাগ, চাবি বা উপহারের জন্য ideal।',
  ARRAY['keychain', '3d-print', 'anime', 'gift'],
  true,
  true,
  ARRAY['new', 'featured']
FROM categories c WHERE c.slug = '3d-keyrings'
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  is_active = true,
  is_featured = EXCLUDED.is_featured,
  updated_at = now();

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, tags, is_active, is_featured, badges)
SELECT
  'KC-002',
  'Floral Monogram Keychain',
  'ফ্লোরাল মনোগ্রাম কীচেইন',
  c.id,
  299,
  ARRAY['https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg'],
  40,
  'Elegant floral monogram charm — personalized feel, artisan finish. Perfect everyday carry or small gift.',
  ARRAY['keychain', 'floral', 'personalized', 'gift'],
  true,
  true,
  ARRAY['new']
FROM categories c WHERE c.slug = '3d-keyrings'
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  is_active = true,
  updated_at = now();

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, tags, is_active, is_featured, badges)
SELECT
  'KC-003',
  'Mini Character Keychain Set',
  'মিনি ক্যারেক্টার কীচেইন সেট',
  c.id,
  450,
  ARRAY['https://images.pexels.com/photos/4489174/pexels-photo-4489174.jpeg'],
  30,
  'Set of two matching mini character keychains. Collectible detail, gift-box ready.',
  ARRAY['keychain', 'set', 'character', 'collectible'],
  true,
  false,
  ARRAY['limited']
FROM categories c WHERE c.slug = '3d-keyrings'
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  is_active = true,
  updated_at = now();

-- ── Curated Gift Pieces (3d-printed-gifts) ───────────────────────────────────

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, tags, is_active, is_featured, badges)
SELECT
  'GF-001',
  'Desk Glow Gift Piece',
  'ডেস্ক গ্লো উপহার',
  c.id,
  850,
  ARRAY['https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg'],
  25,
  'Statement desk décor with ambient glow — a conversation starter for home office or bedside.',
  ARRAY['gift', 'desk', 'decor', '3d-print'],
  true,
  true,
  ARRAY['featured']
FROM categories c WHERE c.slug = '3d-printed-gifts'
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  is_active = true,
  updated_at = now();

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, tags, is_active, is_featured, badges)
SELECT
  'GF-002',
  'Artisan Mini Clock Gift',
  'আর্টিসান মিনি ঘড়ি উপহার',
  c.id,
  1200,
  ARRAY['https://images.pexels.com/photos/279906/pexels-photo-279906.jpeg'],
  15,
  'Hand-finished mini clock — elegant shelf piece and memorable gift for birthdays or housewarmings.',
  ARRAY['gift', 'clock', 'artisan', 'premium'],
  true,
  true,
  ARRAY['new']
FROM categories c WHERE c.slug = '3d-printed-gifts'
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  is_active = true,
  updated_at = now();

-- ── Gift Hampers (gifts parent) ──────────────────────────────────────────────

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, tags, is_active, is_featured, badges)
SELECT
  'G-HM003',
  'Artisan Luxe Mini Hamper',
  'আর্টিসান লাক্স মিনি হ্যাম্পার',
  c.id,
  1800,
  ARRAY['https://images.pexels.com/photos/2641170/pexels-photo-2641170.jpeg'],
  20,
  'Curated mini hamper with keychain, bookmark, and artisan snack — beautifully wrapped for any occasion.',
  ARRAY['gift', 'hamper', 'artisan', 'premium'],
  true,
  true,
  ARRAY['featured', 'new']
FROM categories c WHERE c.slug = 'gifts'
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  description = EXCLUDED.description,
  is_active = true,
  updated_at = now();

-- Verify
SELECT p.sku, p.name, c.slug AS category, p.is_active
FROM products p
JOIN categories c ON c.id = p.category_id
WHERE p.sku IN ('KC-001', 'KC-002', 'KC-003', 'GF-001', 'GF-002', 'G-HM003')
ORDER BY c.slug, p.sku;
