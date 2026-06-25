/*
# Seed Data for Soukhin Ecommerce

This migration populates the database with realistic sample data for the Soukhin store.

## Data Added

1. **Products** - 18 sample products across all categories
2. **Coupons** - 3 discount codes
3. **Banners** - 3 homepage carousel banners
4. **Admin Users** - 5 sample admin users for role-based access demo

## Notes

- Product images use Pexels placeholder URLs - replace with real product images
- Admin passwords should be set through Supabase Auth, not stored in this table
- Coupons are active and valid throughout 2024
*/

-- Get category IDs using subqueries
INSERT INTO products (sku, name, name_bn, category_id, price, sale_price, images, stock, description, description_bn, size_options, color_options, food_note, delivery_note, tags, is_active, is_featured, badges)
SELECT 
  'LW-001',
  'Cotton Kameez - Morning Mist',
  'সুতি কামিজ - মর্নিং মিস্ট',
  c.id,
  1450,
  1250,
  ARRAY['https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg', 'https://images.pexels.com/photos/9778148/pexels-photo-9778148.jpeg'],
  25,
  'Breathable cotton kameez in soft pastel shade. Perfect for everyday wear with intricate embroidery on the neckline.',
  'প্রতিদিনের পোশাকের জন্য আরামদায়ক সুতি কামিজ, গলায় সুন্দর সূচিকর্ম.',
  ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  ARRAY['Mint Green', 'Sky Blue', 'Soft Pink'],
  NULL,
  NULL,
  ARRAY['everyday', 'cotton', 'embroidery'],
  true,
  true,
  ARRAY['best-seller']
FROM categories c WHERE c.slug = 'ladies-wear';

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, tags, is_active, is_featured, badges)
SELECT 
  'LW-002',
  'Muslin Saree - Golden Twilight',
  'মসলিন শাড়ি - গোল্ডেন টোইলাইট',
  c.id,
  3500,
  ARRAY['https://images.pexels.com/photos/10963904/pexels-photo-10963904.jpeg'],
  12,
  'Delicate muslin saree with golden border. A timeless piece for special occasions.',
  ARRAY['saree', 'muslin', 'occasion'],
  true,
  true,
  ARRAY['new']
FROM categories c WHERE c.slug = 'ladies-wear';

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, size_options, tags, is_active, is_featured, badges)
SELECT 
  'LW-003',
  'Festive Kurti - Ruby Red',
  'ফেস্টিভ কুর্তি - রুবি রেড',
  c.id,
  1850,
  ARRAY['https://images.pexels.com/photos/9778148/pexels-photo-9778148.jpeg'],
  30,
  'Elegant kurti in rich ruby red with block print design. Perfect for Eid celebrations.',
  ARRAY['S', 'M', 'L', 'XL'],
  ARRAY['kurti', 'festive', 'block-print'],
  true,
  true,
  ARRAY['eid-collection']
FROM categories c WHERE c.slug = 'ladies-wear';

-- Three Piece Products
INSERT INTO products (sku, name, name_bn, category_id, price, sale_price, images, stock, description, size_options, color_options, tags, is_active, is_featured, badges)
SELECT 
  'TP-001',
  'Designer Three Piece - Midnight Bloom',
  'ডিজাইনার থ্রি-পিস - মিডনাইট ব্লুম',
  c.id,
  4200,
  3800,
  ARRAY['https://images.pexels.com/photos/10963904/pexels-photo-10963904.jpeg', 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg'],
  15,
  'Premium three-piece set with kameez, palazzo, and matching dupatta. Features hand embroidery on premium cotton fabric.',
  ARRAY['S', 'M', 'L', 'XL'],
  ARRAY['Midnight Blue', 'Maroon', 'Emerald'],
  ARRAY['three-piece', 'designer', 'hand-embroidery'],
  true,
  true,
  ARRAY['best-seller']
FROM categories c WHERE c.slug = 'three-piece';

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, size_options, color_options, tags, is_active, is_featured, badges)
SELECT 
  'TP-002',
  'Cotton Three Piece - Terracotta Dreams',
  'সুতি থ্রি-পিস - টেরাকোটা ড্রিমস',
  c.id,
  2800,
  ARRAY['https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg'],
  20,
  'Comfortable daily wear three-piece in beautiful terracotta shade. Machine washable.',
  ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  ARRAY['Terracotta', 'Sage Green', 'Dusty Rose'],
  ARRAY['three-piece', 'cotton', 'everyday'],
  true,
  false,
  ARRAY[]::text[]
FROM categories c WHERE c.slug = 'three-piece';

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, size_options, tags, is_active, is_featured, badges)
SELECT 
  'TP-003',
  'Eid Collection Three Piece - Royal Gold',
  'ঈদ সংগ্রহ থ্রি-পিস - রয়্যাল গোল্ড',
  c.id,
  6500,
  ARRAY['https://images.pexels.com/photos/10963904/pexels-photo-10963904.jpeg'],
  8,
  'Exclusive Eid collection three-piece with intricate gold embroidery. Limited edition.',
  ARRAY['S', 'M', 'L'],
  ARRAY['three-piece', 'eid', 'limited-edition', 'gold-embroidery'],
  true,
  true,
  ARRAY['eid-collection', 'new']
FROM categories c WHERE c.slug = 'three-piece';

-- Food & Pitha Products
INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, food_note, delivery_note, tags, is_active, is_featured, badges)
SELECT 
  'FP-001',
  'Traditional Pitha Box - Winter Collection',
  'ট্রেডিশনাল পিঠা বক্স - উইন্টার কালেকশন',
  c.id,
  850,
  ARRAY['https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'],
  50,
  'Assorted traditional pitha including chitoi, patishapta, and bhapa. Made fresh to order.',
  'Pre-order recommended. Pitha is made fresh and may have 2-3 day preparation time.',
  'Frozen items require temperature-controlled delivery. Additional fee may apply.',
  ARRAY['pitha', 'traditional', 'winter-special'],
  true,
  true,
  ARRAY['pre-order']
FROM categories c WHERE c.slug = 'food-pitha';

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, food_note, delivery_note, tags, is_active, is_featured, badges)
SELECT 
  'FP-002',
  'Homecooked Beef Bhuna - 500g',
  'হোমকুকড বিফ ভুনা - ৫০০ গ্রাম',
  c.id,
  650,
  ARRAY['https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'],
  30,
  'Authentic homemade beef bhuna with traditional spices. No preservatives.',
  'Freshly prepared. Best consumed within 3 days or freeze on arrival.',
  'Same-day delivery available in Dhaka.',
  ARRAY['cooked-food', 'beef', 'homemade'],
  true,
  false,
  ARRAY['best-seller']
FROM categories c WHERE c.slug = 'food-pitha';

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, food_note, tags, is_active, is_featured, badges)
SELECT 
  'FP-003',
  'Pitha Gift Hamper - Eid Special',
  'পিঠা গিফট হ্যাম্পার - ঈদ স্পেশাল',
  c.id,
  1200,
  ARRAY['https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'],
  25,
  'Premium pitha selection packed in gift box. Perfect for Eid gifting.',
  'Includes both instant and frozen varieties.',
  ARRAY['pitha', 'gift', 'eid-special'],
  true,
  true,
  ARRAY['eid-collection']
FROM categories c WHERE c.slug = 'food-pitha';

-- Snacks Products
INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, tags, is_active, is_featured, badges)
SELECT 
  'SN-001',
  'Artisan Cookies Box - Mixed',
  'আর্টিজান কুকিজ বক্স - মিক্সড',
  c.id,
  450,
  ARRAY['https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg'],
  40,
  'Handcrafted cookies with nuts, chocolate, and dried fruits. 12 pieces per box.',
  ARRAY['cookies', 'baked', 'gift-worthy'],
  true,
  true,
  ARRAY['best-seller']
FROM categories c WHERE c.slug = 'snacks';

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, tags, is_active, is_featured, badges)
SELECT 
  'SN-002',
  'Traditional Nimki - 250g',
  'ট্রেডিশনাল নিমকি - ২৫০ গ্রাম',
  c.id,
  180,
  ARRAY['https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg'],
  60,
  'Crispy traditional nimki made with pure ghee. Perfect with evening tea.',
  ARRAY['nimki', 'traditional', 'tea-snack'],
  true,
  false,
  ARRAY[]::text[]
FROM categories c WHERE c.slug = 'snacks';

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, tags, is_active, is_featured, badges)
SELECT 
  'SN-003',
  'Mixed Muri & Chanachur - Premium',
  'মিক্সড মুড়ি ও চানাচুর - প্রিমিয়াম',
  c.id,
  220,
  ARRAY['https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg'],
  55,
  'Premium mix of puffed rice, fried lentils, and spices with nuts.',
  ARRAY['chanachur', 'muri', 'street-food'],
  true,
  false,
  ARRAY[]::text[]
FROM categories c WHERE c.slug = 'snacks';

-- Gifts Products
INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, tags, is_active, is_featured, badges)
SELECT 
  'GF-001',
  'Eid Gift Hamper - Premium',
  'ঈদ গিফট হ্যাম্পার - প্রিমিয়াম',
  c.id,
  2500,
  ARRAY['https://images.pexels.com/photos/2641170/pexels-photo-2641170.jpeg'],
  20,
  'Curated gift hamper with pitha, snacks, sweets, and a small handicraft item. Beautifully wrapped.',
  ARRAY['gift', 'eid', 'premium'],
  true,
  true,
  ARRAY['eid-collection']
FROM categories c WHERE c.slug = 'gifts';

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, tags, is_active, is_featured, badges)
SELECT 
  'GF-002',
  'Housewarming Gift Set',
  'হোমওয়ার্মিং গিফট সেট',
  c.id,
  1800,
  ARRAY['https://images.pexels.com/photos/2641170/pexels-photo-2641170.jpeg'],
  15,
  'Elegant gift set with artisan snacks, decorative plate, and scented candles.',
  ARRAY['gift', 'housewarming', 'home-decor'],
  true,
  false,
  ARRAY[]::text[]
FROM categories c WHERE c.slug = 'gifts';

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, tags, is_active, is_featured, badges)
SELECT 
  'GF-003',
  'Birthday Celebration Box',
  'বার্থডে সেলিব্রেশন বক্স',
  c.id,
  1500,
  ARRAY['https://images.pexels.com/photos/2641170/pexels-photo-2641170.jpeg'],
  25,
  'Birthday gift box with cookies, chocolates, and a personalized card option.',
  ARRAY['gift', 'birthday', 'celebration'],
  true,
  true,
  ARRAY['new']
FROM categories c WHERE c.slug = 'gifts';

-- New Arrivals Products
INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, size_options, color_options, tags, is_active, is_featured, badges)
SELECT 
  'NA-001',
  'Cotton Printed Kurti - Spring Bloom',
  'সুতি প্রিন্টেড কুর্তি - স্প্রিং ব্লুম',
  c.id,
  1650,
  ARRAY['https://images.pexels.com/photos/9778148/pexels-photo-9778148.jpeg'],
  35,
  'Fresh spring collection kurti with floral print. Lightweight cotton fabric.',
  ARRAY['S', 'M', 'L', 'XL'],
  ARRAY['Soft Peach', 'Lilac', 'Mint'],
  ARRAY['kurti', 'cotton', 'spring'],
  true,
  true,
  ARRAY['new']
FROM categories c WHERE c.slug = 'new-arrivals';

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, tags, is_active, is_featured, badges)
SELECT 
  'NA-002',
  'Handmade Clay Jewelry Set',
  'হ্যান্ডমেড ক্লে জুয়েলারি সেট',
  c.id,
  850,
  ARRAY['https://images.pexels.com/photos/2641170/pexels-photo-2641170.jpeg'],
  18,
  'Artisan-crafted clay jewelry set with necklace and matching earrings. Every piece is unique.',
  ARRAY['jewelry', 'clay', 'handmade', 'artisan'],
  true,
  true,
  ARRAY['new']
FROM categories c WHERE c.slug = 'new-arrivals';

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, food_note, tags, is_active, is_featured, badges)
SELECT 
  'NA-003',
  'Frozen Pitha Pack - Instant Pack',
  'ফ্রোজেন পিঠা প্যাক - ইনস্ট্যান্ট প্যাক',
  c.id,
  600,
  ARRAY['https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'],
  40,
  'Ready-to-steam frozen pitha pack. Quick preparation, authentic taste. 10 pieces.',
  'Keep frozen. Steam for 8-10 minutes before serving.',
  ARRAY['pitha', 'frozen', 'instant'],
  true,
  false,
  ARRAY['new', 'pre-order']
FROM categories c WHERE c.slug = 'new-arrivals';

-- Coupons
INSERT INTO coupons (code, type, value, min_order_amount, max_uses, valid_from, valid_until, is_active) VALUES
('SOUKHIN10', 'percentage', 10, 1000, 1000, '2024-01-01', '2024-12-31', true),
('EID2024', 'fixed', 200, 2000, 500, '2024-04-01', '2024-07-31', true),
('WELCOME50', 'fixed', 50, 500, null, '2024-01-01', '2024-12-31', true)
ON CONFLICT (code) DO NOTHING;

-- Banners
INSERT INTO banners (title, subtitle, image, link, display_order, is_active) VALUES
('Eid Collection 2024', 'Shop the exclusive range', 'https://images.pexels.com/photos/10963904/pexels-photo-10963904.jpeg', '/category/three-piece', 1, true),
('Artisan Foods', 'Homemade with love', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', '/category/food-pitha', 2, true),
('Gift Hampers', 'Curated for every occasion', 'https://images.pexels.com/photos/2641170/pexels-photo-2641170.jpeg', '/category/gifts', 3, true)
ON CONFLICT DO NOTHING;

-- Sample Customers
INSERT INTO customers (email, phone, name, address, total_orders, total_spent) VALUES
('fatima@example.com', '01712345678', 'Fatima Rahman', '45/B, Road 12, Dhanmondi, Dhaka', 3, 5280),
('ayesha@example.com', '01898765432', 'Ayesha Khan', '78, Sector 3, Uttara, Dhaka', 2, 4760),
('nusrat@email.com', '01912345678', 'Nusrat Islam', '23, Station Road, Chittagong', 1, 7620),
(NULL, '01612345678', 'Salma Begum', '56, Main Road, Sylhet', 1, 1820),
('tahmina@email.com', '01512345678', 'Tahmina Akter', '12, Road 5, Banani, Dhaka', 1, 6560)
ON CONFLICT (phone) DO NOTHING;

-- Sample Admin Users
INSERT INTO admin_users (email, name, role, is_active) VALUES
('owner@soukhin.com', 'Fatima Rahman', 'owner', true),
('admin@soukhin.com', 'Ayesha Khan', 'admin', true),
('mod@soukhin.com', 'Karim Hassan', 'moderator', true),
('orders@soukhin.com', 'Nadia Islam', 'order_manager', true),
('inventory@soukhin.com', 'Rafiq Ahmed', 'inventory_manager', true)
ON CONFLICT (email) DO NOTHING;
