-- ============================================================
-- SOUKHIN — ONE-CLICK DATABASE SETUP
-- 1. Open Supabase → SQL Editor → New query
-- 2. Paste THIS ENTIRE file
-- 3. Click RUN (green button)
-- ============================================================


-- >>>>> 20260625181910_001_initial_schema.sql <<<<<

/*
# Soukhin Ecommerce Database Schema

This migration creates the complete database schema for the Soukhin premium Bangladeshi lifestyle ecommerce store.

## Tables Created

### Core Ecommerce Tables (Public/Anon Access)
1. **categories** - Product categories (Ladies Wear, Three Piece, Food & Pitha, Snacks, Gifts)
2. **products** - Full product catalog with pricing, inventory, and metadata
3. **orders** - Customer orders with status tracking
4. **order_items** - Line items within orders
5. **customers** - Customer records (guest and registered)
6. **reviews** - Product reviews with ratings
7. **coupons** - Discount codes and promotions
8. **banners** - Homepage banner carousel
9. **messages** - Contact form submissions
10. **site_settings** - Store configuration

### Admin Tables (Authenticated Only)
11. **admin_users** - Admin dashboard users with role-based access
12. **audit_logs** - System activity tracking

## Security

- RLS enabled on ALL tables
- Public tables (products, categories): Readable by anon, writable by authenticated admins
- Order tables: Admin-only access
- Admin tables: Only accessible by authenticated admin users

## Important Notes

1. Categories have a hierarchical structure capability for future expansion
2. Products support variants (size, color) and food-specific notes
3. Orders track full payment and delivery status
4. Admin roles: owner, admin, moderator, order_manager, inventory_manager
5. Audit logs track all admin actions for compliance
*/

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  name_bn text,
  description text,
  image text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Categories are publicly readable
DROP POLICY IF EXISTS "anon_read_categories" ON categories;
CREATE POLICY "anon_read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

-- Only admins can insert categories
DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories" ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only admins can update categories
DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories" ON categories FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

-- Only admins can delete categories
DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories" ON categories FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE NOT NULL,
  name text NOT NULL,
  name_bn text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  price integer NOT NULL CHECK (price >= 0),
  sale_price integer CHECK (sale_price >= 0 AND sale_price < price),
  images text[] NOT NULL DEFAULT '{}',
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  description text,
  description_bn text,
  size_options text[] DEFAULT '{}',
  color_options text[] DEFAULT '{}',
  food_note text,
  delivery_note text,
  tags text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  badges text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Products are publicly readable
DROP POLICY IF EXISTS "anon_read_products" ON products;
CREATE POLICY "anon_read_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products" ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products" ON products FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products" ON products FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  phone text NOT NULL,
  name text NOT NULL,
  address text,
  total_orders integer DEFAULT 0,
  total_spent integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(phone)
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_customers" ON customers;
CREATE POLICY "admin_read_customers" ON customers FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_customers" ON customers;
CREATE POLICY "admin_insert_customers" ON customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_customers" ON customers;
CREATE POLICY "admin_update_customers" ON customers FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_customers" ON customers;
CREATE POLICY "admin_delete_customers" ON customers FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  
  shipping_address text NOT NULL,
  shipping_area text NOT NULL,
  shipping_notes text,
  
  subtotal integer NOT NULL CHECK (subtotal >= 0),
  delivery_fee integer NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  total integer NOT NULL CHECK (total >= 0),
  
  payment_method text NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending',
  payment_transaction_id text,
  
  status text NOT NULL DEFAULT 'pending',
  
  admin_notes text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_orders" ON orders;
CREATE POLICY "admin_read_orders" ON orders FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_orders" ON orders;
CREATE POLICY "admin_insert_orders" ON orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_orders" ON orders;
CREATE POLICY "admin_update_orders" ON orders FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_orders" ON orders;
CREATE POLICY "admin_delete_orders" ON orders FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- ORDER_ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_sku text,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price integer NOT NULL CHECK (unit_price >= 0),
  total_price integer NOT NULL CHECK (total_price >= 0),
  selected_size text,
  selected_color text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_order_items" ON order_items;
CREATE POLICY "admin_read_order_items" ON order_items FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_order_items" ON order_items;
CREATE POLICY "admin_insert_order_items" ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_order_items" ON order_items;
CREATE POLICY "admin_update_order_items" ON order_items FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_order_items" ON order_items;
CREATE POLICY "admin_delete_order_items" ON order_items FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  images text[] DEFAULT '{}',
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_approved_reviews" ON reviews;
CREATE POLICY "anon_read_approved_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (is_approved = true);

DROP POLICY IF EXISTS "admin_read_reviews" ON reviews;
CREATE POLICY "admin_read_reviews" ON reviews FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_reviews" ON reviews;
CREATE POLICY "admin_insert_reviews" ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_reviews" ON reviews;
CREATE POLICY "admin_update_reviews" ON reviews FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_reviews" ON reviews;
CREATE POLICY "admin_delete_reviews" ON reviews FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- COUPONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  type text NOT NULL,
  value integer NOT NULL CHECK (value >= 0),
  min_order_amount integer DEFAULT 0 CHECK (min_order_amount >= 0),
  max_uses integer,
  used_count integer DEFAULT 0,
  valid_from date NOT NULL,
  valid_until date NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_active_coupons" ON coupons;
CREATE POLICY "anon_read_active_coupons" ON coupons FOR SELECT
  TO anon, authenticated 
  USING (is_active = true AND valid_from <= CURRENT_DATE AND valid_until >= CURRENT_DATE);

DROP POLICY IF EXISTS "admin_read_coupons" ON coupons;
CREATE POLICY "admin_read_coupons" ON coupons FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_coupons" ON coupons;
CREATE POLICY "admin_insert_coupons" ON coupons FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_coupons" ON coupons;
CREATE POLICY "admin_update_coupons" ON coupons FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_coupons" ON coupons;
CREATE POLICY "admin_delete_coupons" ON coupons FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- BANNERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image text NOT NULL,
  link text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_active_banners" ON banners;
CREATE POLICY "anon_read_active_banners" ON banners FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "admin_read_banners" ON banners;
CREATE POLICY "admin_read_banners" ON banners FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_banners" ON banners;
CREATE POLICY "admin_insert_banners" ON banners FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_banners" ON banners;
CREATE POLICY "admin_update_banners" ON banners FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_banners" ON banners;
CREATE POLICY "admin_delete_banners" ON banners FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_messages" ON messages;
CREATE POLICY "admin_read_messages" ON messages FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_messages" ON messages;
CREATE POLICY "anon_insert_messages" ON messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_messages" ON messages;
CREATE POLICY "admin_update_messages" ON messages FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_messages" ON messages;
CREATE POLICY "admin_delete_messages" ON messages FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- SITE_SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_site_settings" ON site_settings;
CREATE POLICY "anon_read_site_settings" ON site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_site_settings" ON site_settings;
CREATE POLICY "admin_insert_site_settings" ON site_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_site_settings" ON site_settings;
CREATE POLICY "admin_update_site_settings" ON site_settings FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_site_settings" ON site_settings;
CREATE POLICY "admin_delete_site_settings" ON site_settings FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- ADMIN_USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'moderator',
  avatar text,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_admin_users" ON admin_users;
CREATE POLICY "admin_read_admin_users" ON admin_users FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_admin_users" ON admin_users;
CREATE POLICY "admin_insert_admin_users" ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_admin_users" ON admin_users;
CREATE POLICY "admin_update_admin_users" ON admin_users FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_admin_users" ON admin_users;
CREATE POLICY "admin_delete_admin_users" ON admin_users FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- AUDIT_LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  user_name text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_audit_logs" ON audit_logs;
CREATE POLICY "admin_read_audit_logs" ON audit_logs FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_audit_logs" ON audit_logs;
CREATE POLICY "admin_insert_audit_logs" ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_badges ON products USING GIN(badges);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved) WHERE is_approved = true;

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(is_read) WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================
-- INITIAL DATA
-- ============================================

INSERT INTO categories (slug, name, name_bn, description, display_order) VALUES
('ladies-wear', 'Ladies Wear', 'নারী পোশাক', 'Elegant traditional and contemporary wear for the modern Bangladeshi woman', 1),
('three-piece', 'Three Piece', 'থ্রি-পিস', 'Premium three-piece sets with matching dupatta and palazzo', 2),
('food-pitha', 'Food & Pitha', 'খাবার ও পিঠা', 'Homemade traditional pitha and authentic Bengali delicacies', 3),
('snacks', 'Snacks', 'স্ন্যাকস', 'Artisanal snacks and savories made with premium ingredients', 4),
('gifts', 'Gifts', 'উপহার', 'Curated gift hampers for every occasion', 5),
('new-arrivals', 'New Arrivals', 'নতুন সংগ্রহ', 'Our latest additions to the Soukhin family', 0)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO site_settings (setting_key, setting_value, description) VALUES
('hero', '{"title": "Tasteful Living, Delivered", "titleBn": "স্বাদের ঠিকানা, আপনার দোরগোড়ায়", "subtitle": "Premium Bangladeshi craftsmanship for the refined soul", "subtitleBn": "খাঁটি বাংলাদেশি হস্তশিল্প, শৌখিন মনের জন্য"}', 'Hero section content'),
('announcement', '{"text": "Free delivery on orders over ৳2000 | Use code: SOUKHIN10", "textBn": "২০০০ টাকার বেশি অর্ডারে ফ্রি ডেলিভারি | কোড: SOUKHIN10"}', 'Announcement bar text'),
('contact', '{"whatsapp": "", "facebook": "https://facebook.com/soukhin", "instagram": "https://instagram.com/soukhin.bd", "email": "hello@soukhin.com", "phone": ""}', 'Contact information'),
('delivery', '{"insideDhaka": 60, "outsideDhaka": 120, "freeShippingThreshold": 2000}', 'Delivery fees'),
('currency', '{"symbol": "৳", "code": "BDT"}', 'Currency settings')
ON CONFLICT (setting_key) DO NOTHING;


-- >>>>> 20260625183059_003_restructure_categories.sql <<<<<

/*
# Update Categories to Lifestyle Store Structure

This migration restructures categories from niche "Ladies Wear" to a broader lifestyle ecommerce structure.

## Changes
- Drops old categories
- Creates new hierarchical category structure:
  - Wearables (Women/Men/Kids/Accessories)
  - Home & Living
  - Food & Pitha  
  - Jewelry
  - Gifts
  - New Arrivals
- Updates to support subcategories

## New Category Hierarchy
1. Wearables
   - Women: Three Piece, Dresses, Sarees, Kurtis, Shawls
   - Men: Panjabi, Shirts, T-shirts, Waistcoats
   - Kids: Girls, Boys, Baby Wear
   - Accessories: Bags, Scarves, Watches
2. Home & Living: Bed Sheets, Cushion Covers, Curtains, Table Runners, Towels, Home Decor
3. Food & Pitha: (no subcategories needed)
4. Jewelry: Earrings, Necklaces, Bangles, Rings, Bridal/Festive
5. Gifts: (no subcategories needed)
6. New Arrivals: (no subcategories needed)
*/

-- Drop existing data
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS banners CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;

-- Recreate categories with hierarchical structure
DROP TABLE IF EXISTS categories CASCADE;

CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  name_bn text,
  description text,
  image text,
  display_order integer DEFAULT 0,
  parent_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_categories" ON categories;
CREATE POLICY "anon_read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories" ON categories FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories" ON categories FOR DELETE
  TO authenticated USING (true);

-- Main categories (parent_id = NULL)
INSERT INTO categories (slug, name, name_bn, description, image, display_order) VALUES
('wearables', 'Wearables', 'পোশাক', 'Fashion for everyone - women, men, and kids', 'https://images.pexels.com/photos/9778148/pexels-photo-9778148.jpeg', 1),
('home-living', 'Home & Living', 'ঘর ও জীবনযাত্রা', 'Premium home textiles and decor', 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg', 2),
('food-pitha', 'Food & Pitha', 'খাবার ও পিঠা', 'Traditional homemade Bengali delicacies', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', 3),
('jewelry', 'Jewelry', 'গয়না', 'Handcrafted artisan jewelry', 'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg', 4),
('gifts', 'Gifts', 'উপহার', 'Curated gift hampers for every occasion', 'https://images.pexels.com/photos/2641170/pexels-photo-2641170.jpeg', 5),
('new-arrivals', 'New Arrivals', 'নতুন সংগ্রহ', 'Our latest additions', 'https://images.pexels.com/photos/606554/pexels-photo-606554.jpeg', 6);

-- Wearables subcategories
INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id)
SELECT 'wearables-women', 'Women', 'নারী', 'Women fashion collection', 'https://images.pexels.com/photos/9778148/pexels-photo-9778148.jpeg', 1, id FROM categories WHERE slug = 'wearables';

INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id)
SELECT 'wearables-men', 'Men', 'পুরুষ', 'Men fashion collection', 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg', 2, id FROM categories WHERE slug = 'wearables';

INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id)
SELECT 'wearables-kids', 'Kids', 'শিশু', 'Kids fashion collection', 'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg', 3, id FROM categories WHERE slug = 'wearables';

INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id)
SELECT 'wearables-accessories', 'Accessories', 'অ্যাক্সেসরিজ', 'Fashion accessories', 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg', 4, id FROM categories WHERE slug = 'wearables';

-- Women subcategories
INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id)
SELECT 'women-three-piece', 'Three Piece', 'থ্রি-পিস', 'Premium three-piece sets', 'https://images.pexels.com/photos/10963904/pexels-photo-10963904.jpeg', 1, id FROM categories WHERE slug = 'wearables-women';

INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id)
SELECT 'women-dresses', 'Dresses', 'পোশাক', 'Elegant dresses for every occasion', 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg', 2, id FROM categories WHERE slug = 'wearables-women';

INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id)
SELECT 'women-sarees', 'Sarees', 'শাড়ি', 'Beautiful traditional and designer sarees', 'https://images.pexels.com/photos/10963904/pexels-photo-10963904.jpeg', 3, id FROM categories WHERE slug = 'wearables-women';

INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id)
SELECT 'women-kurtis', 'Kurtis', 'কুর্তি', 'Stylish kurtis and tunics', 'https://images.pexels.com/photos/9778148/pexels-photo-9778148.jpeg', 4, id FROM categories WHERE slug = 'wearables-women';

INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id)
SELECT 'women-shawls', 'Shawls', 'শাল', 'Warm and elegant shawls', 'https://images.pexels.com/photos/9778148/pexels-photo-9778148.jpeg', 5, id FROM categories WHERE slug = 'wearables-women';

-- Men subcategories
INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id)
SELECT 'men-panjabi', 'Panjabi', 'পাঞ্জাবি', 'Traditional and modern panjabi', 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg', 1, id FROM categories WHERE slug = 'wearables-men';

INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id)
SELECT 'men-shirts', 'Shirts', 'শার্ট', 'Formal and casual shirts', 'https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg', 2, id FROM categories WHERE slug = 'wearables-men';

INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id)
SELECT 'men-tshirts', 'T-shirts', 'টি-শার্ট', 'Comfortable t-shirts', 'https://images.pexels.com/photos/493453/pexels-photo-493453.jpeg', 3, id FROM categories WHERE slug = 'wearables-men';

INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id)
SELECT 'men-waistcoats', 'Waistcoats', 'ওয়েস্টকোট', 'Stylish waistcoats for festive occasions', 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg', 4, id FROM categories WHERE slug = 'wearables-men';

-- Kids subcategories
INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id)
SELECT 'kids-girls', 'Girls', 'মেয়ে', 'Pretty dresses and outfits for girls', 'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg', 1, id FROM categories WHERE slug = 'wearables-kids';

INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id)
SELECT 'kids-boys', 'Boys', 'ছেলে', 'Smart outfits for boys', 'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg', 2, id FROM categories WHERE slug = 'wearables-kids';

INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id)
SELECT 'kids-baby', 'Baby Wear', 'বেবি পোশাক', 'Adorable baby clothes', 'https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg', 3, id FROM categories WHERE slug = 'wearables-kids';

-- Accessories subcategories
INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id)
SELECT 'accessories-bags', 'Bags', 'ব্যাগ', 'Stylish bags and purses', 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg', 1, id FROM categories WHERE slug = 'wearables-accessories';

INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id)
SELECT 'accessories-scarves', 'Scarves', 'স্কার্ফ', 'Beautiful scarves and stoles', 'https://images.pexels.com/photos/9778148/pexels-photo-9778148.jpeg', 2, id FROM categories WHERE slug = 'wearables-accessories';

INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id)
SELECT 'accessories-watches', 'Watches', 'ঘড়ি', 'Elegant watches', 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg', 3, id FROM categories WHERE slug = 'wearables-accessories';

-- Home & Living subcategories
INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id)
SELECT 'home-sheets', 'Bed Sheets', 'বিছানার চাদর', 'Premium bed sheets and bedcovers', 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg', 1, id FROM categories WHERE slug = 'home-living';

INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id)
SELECT 'home-cushions', 'Cushion Covers', 'তাকিয়া', 'Designer cushion covers', 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg', 2, id FROM categories WHERE slug = 'home-living';

INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id)
SELECT 'home-curtains', 'Curtains', 'পর্দা', 'Beautiful curtains for your home', 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg', 3, id FROM categories WHERE slug = 'home-living';

INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id)
SELECT 'home-runners', 'Table Runners', 'টেবিল রানার', 'Elegant table runners', 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg', 4, id FROM categories WHERE slug = 'home-living';

INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id)
SELECT 'home-towels', 'Towels', 'তোয়ালে', 'Soft and absorbent towels', 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg', 5, id FROM categories WHERE slug = 'home-living';

INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id)
SELECT 'home-decor', 'Home Decor', 'ঘর সাজসজ্জা', 'Decorative items for your home', 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg', 6, id FROM categories WHERE slug = 'home-living';

-- Jewelry subcategories
INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id)
SELECT 'jewelry-earrings', 'Earrings', 'কানের দুল', 'Beautiful earrings for every occasion', 'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg', 1, id FROM categories WHERE slug = 'jewelry';

INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id)
SELECT 'jewelry-necklaces', 'Necklaces', 'হার', 'Elegant necklaces and chains', 'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg', 2, id FROM categories WHERE slug = 'jewelry';

INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id)
SELECT 'jewelry-bangles', 'Bangles', 'চুড়ি', 'Traditional and modern bangles', 'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg', 3, id FROM categories WHERE slug = 'jewelry';

INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id)
SELECT 'jewelry-rings', 'Rings', 'আংটি', 'Stunning rings', 'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg', 4, id FROM categories WHERE slug = 'jewelry';

INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id)
SELECT 'jewelry-bridal', 'Bridal/Festive', 'বিয়ে/উৎসব', 'Special occasion jewelry sets', 'https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg', 5, id FROM categories WHERE slug = 'jewelry';

-- Recreate other tables
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE NOT NULL,
  name text NOT NULL,
  name_bn text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  price integer NOT NULL CHECK (price >= 0),
  sale_price integer CHECK (sale_price >= 0 AND sale_price < price),
  images text[] NOT NULL DEFAULT '{}',
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  description text,
  description_bn text,
  size_options text[] DEFAULT '{}',
  color_options text[] DEFAULT '{}',
  food_note text,
  delivery_note text,
  tags text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  badges text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_products" ON products;
CREATE POLICY "anon_read_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products" ON products FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products" ON products FOR DELETE
  TO authenticated USING (true);

CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  phone text NOT NULL,
  name text NOT NULL,
  address text,
  total_orders integer DEFAULT 0,
  total_spent integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(phone)
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_customers" ON customers;
CREATE POLICY "admin_read_customers" ON customers FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_customers" ON customers;
CREATE POLICY "admin_insert_customers" ON customers FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_customers" ON customers;
CREATE POLICY "admin_update_customers" ON customers FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_customers" ON customers;
CREATE POLICY "admin_delete_customers" ON customers FOR DELETE
  TO authenticated USING (true);

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  shipping_address text NOT NULL,
  shipping_area text NOT NULL,
  shipping_notes text,
  subtotal integer NOT NULL CHECK (subtotal >= 0),
  delivery_fee integer NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  total integer NOT NULL CHECK (total >= 0),
  payment_method text NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending',
  payment_transaction_id text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_orders" ON orders;
CREATE POLICY "admin_read_orders" ON orders FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_orders" ON orders;
CREATE POLICY "admin_insert_orders" ON orders FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_orders" ON orders;
CREATE POLICY "admin_update_orders" ON orders FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_orders" ON orders;
CREATE POLICY "admin_delete_orders" ON orders FOR DELETE
  TO authenticated USING (true);

CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_sku text,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price integer NOT NULL CHECK (unit_price >= 0),
  total_price integer NOT NULL CHECK (total_price >= 0),
  selected_size text,
  selected_color text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_order_items" ON order_items;
CREATE POLICY "admin_read_order_items" ON order_items FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_order_items" ON order_items;
CREATE POLICY "admin_insert_order_items" ON order_items FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_order_items" ON order_items;
CREATE POLICY "admin_update_order_items" ON order_items FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_order_items" ON order_items;
CREATE POLICY "admin_delete_order_items" ON order_items FOR DELETE
  TO authenticated USING (true);

CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  images text[] DEFAULT '{}',
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_approved_reviews" ON reviews;
CREATE POLICY "anon_read_approved_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (is_approved = true);

DROP POLICY IF EXISTS "admin_read_reviews" ON reviews;
CREATE POLICY "admin_read_reviews" ON reviews FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_reviews" ON reviews;
CREATE POLICY "admin_insert_reviews" ON reviews FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_reviews" ON reviews;
CREATE POLICY "admin_update_reviews" ON reviews FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_reviews" ON reviews;
CREATE POLICY "admin_delete_reviews" ON reviews FOR DELETE
  TO authenticated USING (true);

CREATE TABLE coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  type text NOT NULL,
  value integer NOT NULL CHECK (value >= 0),
  min_order_amount integer DEFAULT 0 CHECK (min_order_amount >= 0),
  max_uses integer,
  used_count integer DEFAULT 0,
  valid_from date NOT NULL,
  valid_until date NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_active_coupons" ON coupons;
CREATE POLICY "anon_read_active_coupons" ON coupons FOR SELECT
  TO anon, authenticated USING (is_active = true AND valid_from <= CURRENT_DATE AND valid_until >= CURRENT_DATE);

DROP POLICY IF EXISTS "admin_read_coupons" ON coupons;
CREATE POLICY "admin_read_coupons" ON coupons FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_coupons" ON coupons;
CREATE POLICY "admin_insert_coupons" ON coupons FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_coupons" ON coupons;
CREATE POLICY "admin_update_coupons" ON coupons FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_coupons" ON coupons;
CREATE POLICY "admin_delete_coupons" ON coupons FOR DELETE
  TO authenticated USING (true);

CREATE TABLE banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image text NOT NULL,
  link text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_active_banners" ON banners;
CREATE POLICY "anon_read_active_banners" ON banners FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "admin_read_banners" ON banners;
CREATE POLICY "admin_read_banners" ON banners FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_banners" ON banners;
CREATE POLICY "admin_insert_banners" ON banners FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_banners" ON banners;
CREATE POLICY "admin_update_banners" ON banners FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_banners" ON banners;
CREATE POLICY "admin_delete_banners" ON banners FOR DELETE
  TO authenticated USING (true);

CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_messages" ON messages;
CREATE POLICY "admin_read_messages" ON messages FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_messages" ON messages;
CREATE POLICY "anon_insert_messages" ON messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_messages" ON messages;
CREATE POLICY "admin_update_messages" ON messages FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_messages" ON messages;
CREATE POLICY "admin_delete_messages" ON messages FOR DELETE
  TO authenticated USING (true);

CREATE TABLE site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_site_settings" ON site_settings;
CREATE POLICY "anon_read_site_settings" ON site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_site_settings" ON site_settings;
CREATE POLICY "admin_insert_site_settings" ON site_settings FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_site_settings" ON site_settings;
CREATE POLICY "admin_update_site_settings" ON site_settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_site_settings" ON site_settings;
CREATE POLICY "admin_delete_site_settings" ON site_settings FOR DELETE
  TO authenticated USING (true);

CREATE TABLE admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'moderator',
  avatar text,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_admin_users" ON admin_users;
CREATE POLICY "admin_read_admin_users" ON admin_users FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_admin_users" ON admin_users;
CREATE POLICY "admin_insert_admin_users" ON admin_users FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_admin_users" ON admin_users;
CREATE POLICY "admin_update_admin_users" ON admin_users FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_admin_users" ON admin_users;
CREATE POLICY "admin_delete_admin_users" ON admin_users FOR DELETE
  TO authenticated USING (true);

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  user_name text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_audit_logs" ON audit_logs;
CREATE POLICY "admin_read_audit_logs" ON audit_logs FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_audit_logs" ON audit_logs;
CREATE POLICY "admin_insert_audit_logs" ON audit_logs FOR INSERT
  TO authenticated WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- Default settings
INSERT INTO site_settings (setting_key, setting_value, description) VALUES
('hero', '{"title": "Tasteful Living, Delivered", "titleBn": "স্বাদের ঠিকানা, আপনার দোরগোড়ায়", "subtitle": "Premium Bangladeshi craftsmanship for the refined soul", "subtitleBn": "খাঁটি বাংলাদেশি হস্তশিল্প, শৌখিন মনের জন্য"}', 'Hero section content'),
('announcement', '{"text": "Free delivery on orders over ৳2000 | Use code: SOUKHIN10", "textBn": "২০০০ টাকার বেশি অর্ডারে ফ্রি ডেলিভারি | কোড: SOUKHIN10"}', 'Announcement bar text'),
('contact', '{"whatsapp": "", "facebook": "https://facebook.com/soukhin", "instagram": "https://instagram.com/soukhin.bd", "email": "hello@soukhin.com", "phone": ""}', 'Contact information'),
('delivery', '{"insideDhaka": 60, "outsideDhaka": 120, "freeShippingThreshold": 2000}', 'Delivery fees'),
('currency', '{"symbol": "৳", "code": "BDT"}', 'Currency settings')
ON CONFLICT (setting_key) DO NOTHING;

-- Sample products across new categories
INSERT INTO products (sku, name, name_bn, category_id, price, sale_price, images, stock, description, size_options, color_options, tags, is_active, is_featured, badges)
SELECT 'W-TP001', 'Designer Three Piece - Midnight Bloom', 'ডিজাইনার থ্রি-পিস - মিডনাইট ব্লুম', c.id, 4200, 3800, ARRAY['https://images.pexels.com/photos/10963904/pexels-photo-10963904.jpeg'], 15, 'Premium three-piece set with kameez, palazzo, and matching dupatta.', ARRAY['S', 'M', 'L', 'XL'], ARRAY['Midnight Blue', 'Maroon', 'Emerald'], ARRAY['three-piece', 'designer', 'hand-embroidery'], true, true, ARRAY['best-seller']
FROM categories c WHERE c.slug = 'women-three-piece';

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, size_options, color_options, tags, is_active, is_featured, badges)
SELECT 'W-SR001', 'Muslin Saree - Golden Twilight', 'মসলিন শাড়ি - গোল্ডেন টোইলাইট', c.id, 3500, ARRAY['https://images.pexels.com/photos/10963904/pexels-photo-10963904.jpeg'], 12, 'Delicate muslin saree with golden border.', ARRAY['Free Size'], ARRAY['Golden', 'Silver'], ARRAY['saree', 'muslin', 'occasion'], true, true, ARRAY['new']
FROM categories c WHERE c.slug = 'women-sarees';

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, size_options, tags, is_active, is_featured, badges)
SELECT 'W-KT001', 'Cotton Kurti - Spring Bloom', 'সুতি কুর্তি - স্প্রিং ব্লুম', c.id, 1450, ARRAY['https://images.pexels.com/photos/9778148/pexels-photo-9778148.jpeg'], 30, 'Fresh cotton kurti with floral print.', ARRAY['S', 'M', 'L', 'XL'], ARRAY['kurti', 'cotton', 'everyday'], true, true, ARRAY[]::text[]
FROM categories c WHERE c.slug = 'women-kurtis';

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, size_options, tags, is_active, is_featured, badges)
SELECT 'M-PB001', 'Panjabi - Classic Elegance', 'পাঞ্জাবি - ক্লাসিক এলিগ্যান্স', c.id, 2500, ARRAY['https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg'], 20, 'Traditional panjabi with modern styling.', ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['panjabi', 'traditional', 'eid'], true, true, ARRAY['eid-collection']
FROM categories c WHERE c.slug = 'men-panjabi';

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, size_options, tags, is_active, is_featured, badges)
SELECT 'M-SH001', 'Formal Shirt - Navy Blue', 'ফর্মাল শার্ট - নেভি ব্লু', c.id, 1800, ARRAY['https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg'], 25, 'Premium cotton formal shirt.', ARRAY['S', 'M', 'L', 'XL'], ARRAY['shirt', 'formal', 'office'], true, false, ARRAY[]::text[]
FROM categories c WHERE c.slug = 'men-shirts';

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, size_options, tags, is_active, is_featured, badges)
SELECT 'K-GL001', 'Girls Dress - Floral Dreams', 'মেয়েদের পোশাক - ফ্লোরাল ড্রিমস', c.id, 950, ARRAY['https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg'], 18, 'Pretty floral dress for girls.', ARRAY['3-4Y', '5-6Y', '7-8Y', '9-10Y'], ARRAY['dress', 'girls', 'floral'], true, true, ARRAY['new']
FROM categories c WHERE c.slug = 'kids-girls';

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, tags, is_active, is_featured, badges)
SELECT 'H-BS001', 'Premium Bed Sheet Set - Royal Blue', 'প্রিমিয়াম বিছানার চাদর সেট - রয়্যাল ব্লু', c.id, 2200, ARRAY['https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg'], 15, 'Luxurious cotton bed sheet set with pillow covers.', ARRAY['bedding', 'bedroom', 'premium'], true, true, ARRAY['best-seller']
FROM categories c WHERE c.slug = 'home-sheets';

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, tags, is_active, is_featured, badges)
SELECT 'H-DC001', 'Cushion Cover Set - Block Print', 'তাকিয়া সেট - ব্লক প্রিন্ট', c.id, 650, ARRAY['https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg'], 30, 'Hand block printed cushion covers. Set of 4.', ARRAY['cushion', 'decor', 'handmade'], true, false, ARRAY[]::text[]
FROM categories c WHERE c.slug = 'home-cushions';

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, food_note, delivery_note, tags, is_active, is_featured, badges)
SELECT 'F-PT001', 'Traditional Pitha Box - Winter Collection', 'ট্রেডিশনাল পিঠা বক্স - উইন্টার কালেকশন', c.id, 850, ARRAY['https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'], 50, 'Assorted traditional pitha.', 'Pre-order recommended.', 'Same-day delivery in Dhaka.', ARRAY['pitha', 'traditional', 'winter'], true, true, ARRAY['pre-order']
FROM categories c WHERE c.slug = 'food-pitha';

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, food_note, tags, is_active, is_featured, badges)
SELECT 'F-HM001', 'Homecooked Beef Bhuna - 500g', 'হোমকুকড বিফ ভুনা - ৫০০ গ্রাম', c.id, 650, ARRAY['https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'], 30, 'Authentic homemade beef bhuna.', 'Best consumed within 3 days.', ARRAY['cooked-food', 'beef', 'homemade'], true, true, ARRAY['best-seller']
FROM categories c WHERE c.slug = 'food-pitha';

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, tags, is_active, is_featured, badges)
SELECT 'J-ER001', 'Gold Plated Earrings - Jhumka Style', 'গোল্ড প্লেটেড কানের দুল - ঝুমকা স্টাইল', c.id, 550, ARRAY['https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg'], 25, 'Elegant gold plated jhumka earrings.', ARRAY['earrings', 'jhumka', 'gold-plated'], true, true, ARRAY['best-seller']
FROM categories c WHERE c.slug = 'jewelry-earrings';

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, tags, is_active, is_featured, badges)
SELECT 'J-NK001', 'Layered Necklace - Modern Elegance', 'লেয়ার্ড নেকলেস - মডার্ন এলিগ্যান্স', c.id, 850, ARRAY['https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg'], 18, 'Trendy layered necklace set.', ARRAY['necklace', 'layered', 'modern'], true, true, ARRAY['new']
FROM categories c WHERE c.slug = 'jewelry-necklaces';

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, tags, is_active, is_featured, badges)
SELECT 'J-BN001', 'Bridal Jewelry Set - Complete', 'ব্রাইডাল জুয়েলারি সেট - সম্পূর্ণ', c.id, 3500, ARRAY['https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg'], 8, 'Complete bridal jewelry set with necklace, earrings, and bangles.', ARRAY['bridal', 'wedding', 'complete-set'], true, true, ARRAY['eid-collection']
FROM categories c WHERE c.slug = 'jewelry-bridal';

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, tags, is_active, is_featured, badges)
SELECT 'G-HM001', 'Eid Gift Hamper - Premium', 'ঈদ গিফট হ্যাম্পার - প্রিমিয়াম', c.id, 2500, ARRAY['https://images.pexels.com/photos/2641170/pexels-photo-2641170.jpeg'], 20, 'Curated gift hamper with pitha, snacks, sweets, and handicraft.', ARRAY['gift', 'eid', 'premium'], true, true, ARRAY['eid-collection']
FROM categories c WHERE c.slug = 'gifts';

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, tags, is_active, is_featured, badges)
SELECT 'G-HM002', 'Birthday Celebration Box', 'বার্থডে সেলিব্রেশন বক্স', c.id, 1500, ARRAY['https://images.pexels.com/photos/2641170/pexels-photo-2641170.jpeg'], 25, 'Birthday gift box with cookies, chocolates, and card.', ARRAY['gift', 'birthday', 'celebration'], true, true, ARRAY['new']
FROM categories c WHERE c.slug = 'gifts';

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, size_options, color_options, tags, is_active, is_featured, badges)
SELECT 'N-KT002', 'Cotton Printed Kurti - New Arrival', 'সুতি প্রিন্টেড কুর্তি - নতুন সংগ্রহ', c.id, 1650, ARRAY['https://images.pexels.com/photos/9778148/pexels-photo-9778148.jpeg'], 35, 'Fresh spring collection kurti with floral print.', ARRAY['S', 'M', 'L', 'XL'], ARRAY['Soft Peach', 'Lilac', 'Mint'], ARRAY['kurti', 'cotton', 'spring'], true, true, ARRAY['new']
FROM categories c WHERE c.slug = 'new-arrivals';

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, tags, is_active, is_featured, badges)
SELECT 'N-JW001', 'Handmade Clay Jewelry Set', 'হ্যান্ডমেড ক্লে জুয়েলারি সেট', c.id, 850, ARRAY['https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg'], 18, 'Artisan-crafted clay jewelry set.', ARRAY['jewelry', 'clay', 'handmade'], true, true, ARRAY['new']
FROM categories c WHERE c.slug = 'new-arrivals';

INSERT INTO products (sku, name, name_bn, category_id, price, images, stock, description, tags, is_active, is_featured, badges)
SELECT 'A-BG001', 'Leather Handbag - Classic Brown', 'লেদার হ্যান্ডব্যাগ - ক্লাসিক ব্রাউন', c.id, 2800, ARRAY['https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg'], 15, 'Premium leather handbag.', ARRAY['bag', 'leather', 'premium'], true, false, ARRAY[]::text[]
FROM categories c WHERE c.slug = 'accessories-bags';

-- Coupons
INSERT INTO coupons (code, type, value, min_order_amount, max_uses, valid_from, valid_until, is_active) VALUES
('SOUKHIN10', 'percentage', 10, 1000, 1000, '2024-01-01', '2025-12-31', true),
('EID2024', 'fixed', 200, 2000, 500, '2024-04-01', '2025-07-31', true),
('WELCOME50', 'fixed', 50, 500, null, '2024-01-01', '2025-12-31', true)
ON CONFLICT (code) DO NOTHING;

-- Banners
INSERT INTO banners (title, subtitle, image, link, display_order, is_active) VALUES
('Eid Collection 2024', 'Shop the exclusive range', 'https://images.pexels.com/photos/10963904/pexels-photo-10963904.jpeg', '/category/wearables', 1, true),
('Home & Living Sale', 'Up to 30% off', 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg', '/category/home-living', 2, true),
('Gift Hampers', 'Curated for every occasion', 'https://images.pexels.com/photos/2641170/pexels-photo-2641170.jpeg', '/category/gifts', 3, true);

-- Admin users
INSERT INTO admin_users (email, name, role, is_active) VALUES
('owner@soukhin.com', 'Fatima Rahman', 'owner', true),
('admin@soukhin.com', 'Ayesha Khan', 'admin', true),
('mod@soukhin.com', 'Karim Hassan', 'moderator', true)
ON CONFLICT (email) DO NOTHING;


-- >>>>> 20260625182007_002_seed_data.sql <<<<<

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


-- >>>>> 20260626120000_004_customer_auth.sql <<<<<

-- Link customer profiles to Supabase Auth users and enable customer self-service

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS customers_user_id_unique ON customers(user_id)
  WHERE user_id IS NOT NULL;

-- Customers can manage their own profile
DROP POLICY IF EXISTS "customer_read_own_profile" ON customers;
CREATE POLICY "customer_read_own_profile" ON customers
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "customer_insert_own_profile" ON customers;
CREATE POLICY "customer_insert_own_profile" ON customers
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "customer_update_own_profile" ON customers;
CREATE POLICY "customer_update_own_profile" ON customers
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Customers can place and view their own orders
DROP POLICY IF EXISTS "customer_insert_orders" ON orders;
CREATE POLICY "customer_insert_orders" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "customer_read_own_orders" ON orders;
CREATE POLICY "customer_read_own_orders" ON orders
  FOR SELECT TO authenticated
  USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "customer_insert_order_items" ON order_items;
CREATE POLICY "customer_insert_order_items" ON order_items
  FOR INSERT TO authenticated
  WITH CHECK (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "customer_read_own_order_items" ON order_items;
CREATE POLICY "customer_read_own_order_items" ON order_items
  FOR SELECT TO authenticated
  USING (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

-- Contact form submissions from the public site
DROP POLICY IF EXISTS "anon_insert_messages" ON messages;
CREATE POLICY "anon_insert_messages" ON messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);


-- >>>>> 20260626140000_005_orders_analytics_notifications.sql <<<<<

-- Order numbering, analytics RPCs, customer stats, and admin helpers

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  next_num bigint;
BEGIN
  next_num := nextval('order_number_seq');
  RETURN 'SK-' || to_char(now(), 'YYYY') || '-' || lpad(next_num::text, 6, '0');
END;
$$;

-- Resolve product category to top-level parent for analytics
CREATE OR REPLACE FUNCTION get_root_category_slug(p_category_id uuid)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  WITH RECURSIVE category_tree AS (
    SELECT id, slug, parent_id
    FROM categories
    WHERE id = p_category_id
    UNION ALL
    SELECT c.id, c.slug, c.parent_id
    FROM categories c
    JOIN category_tree ct ON c.id = ct.parent_id
  )
  SELECT slug
  FROM category_tree
  WHERE parent_id IS NULL
  LIMIT 1;
$$;

-- Customer stats on order changes
CREATE OR REPLACE FUNCTION refresh_customer_order_stats(p_customer_id uuid)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE customers c
  SET
    total_orders = (
      SELECT COUNT(*)::integer
      FROM orders o
      WHERE o.customer_id = p_customer_id
        AND o.status NOT IN ('cancelled', 'refunded')
    ),
    total_spent = COALESCE((
      SELECT SUM(o.total)::integer
      FROM orders o
      WHERE o.customer_id = p_customer_id
        AND o.status = 'delivered'
        AND o.payment_status = 'paid'
    ), 0),
    updated_at = now()
  WHERE c.id = p_customer_id;
$$;

CREATE OR REPLACE FUNCTION trg_refresh_customer_stats()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.customer_id IS NOT NULL THEN
    PERFORM refresh_customer_order_stats(NEW.customer_id);
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.customer_id IS DISTINCT FROM NEW.customer_id AND OLD.customer_id IS NOT NULL THEN
    PERFORM refresh_customer_order_stats(OLD.customer_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_refresh_customer_stats ON orders;
CREATE TRIGGER orders_refresh_customer_stats
  AFTER INSERT OR UPDATE OF status, payment_status, customer_id, total ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trg_refresh_customer_stats();

-- Dashboard summary
CREATE OR REPLACE FUNCTION get_dashboard_summary()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'totalRevenue', COALESCE((
      SELECT SUM(total) FROM orders
      WHERE status = 'delivered' AND payment_status = 'paid'
    ), 0),
    'totalOrders', (SELECT COUNT(*) FROM orders WHERE status NOT IN ('cancelled', 'refunded')),
    'pendingOrders', (SELECT COUNT(*) FROM orders WHERE status IN ('pending', 'confirmed', 'processing')),
    'totalCustomers', (SELECT COUNT(*) FROM customers),
    'statusCounts', json_build_object(
      'pending', (SELECT COUNT(*) FROM orders WHERE status = 'pending'),
      'confirmed', (SELECT COUNT(*) FROM orders WHERE status = 'confirmed'),
      'processing', (SELECT COUNT(*) FROM orders WHERE status = 'processing'),
      'ready-to-deliver', (SELECT COUNT(*) FROM orders WHERE status = 'ready-to-deliver'),
      'delivered', (SELECT COUNT(*) FROM orders WHERE status = 'delivered'),
      'cancelled', (SELECT COUNT(*) FROM orders WHERE status = 'cancelled'),
      'refunded', (SELECT COUNT(*) FROM orders WHERE status = 'refunded')
    ),
    'paymentBreakdown', (
      SELECT COALESCE(json_agg(json_build_object('method', payment_method, 'count', cnt)), '[]'::json)
      FROM (
        SELECT payment_method, COUNT(*) AS cnt
        FROM orders
        WHERE status NOT IN ('cancelled', 'refunded')
        GROUP BY payment_method
      ) pm
    )
  );
$$;

-- Category revenue for bar chart
CREATE OR REPLACE FUNCTION get_category_revenue(
  p_start timestamptz,
  p_end timestamptz,
  p_category_slugs text[] DEFAULT NULL
)
RETURNS TABLE (
  category_slug text,
  category_name text,
  revenue bigint,
  order_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH item_revenue AS (
    SELECT
      COALESCE(get_root_category_slug(p.category_id), 'uncategorized') AS root_slug,
      oi.total_price,
      oi.order_id
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    LEFT JOIN products p ON p.id = oi.product_id
    WHERE o.created_at >= p_start
      AND o.created_at <= p_end
      AND o.status NOT IN ('cancelled', 'refunded')
  )
  SELECT
    ir.root_slug AS category_slug,
    COALESCE(c.name, initcap(replace(ir.root_slug, '-', ' '))) AS category_name,
    COALESCE(SUM(ir.total_price), 0)::bigint AS revenue,
    COUNT(DISTINCT ir.order_id)::bigint AS order_count
  FROM item_revenue ir
  LEFT JOIN categories c ON c.slug = ir.root_slug
  WHERE p_category_slugs IS NULL OR ir.root_slug = ANY(p_category_slugs)
  GROUP BY ir.root_slug, c.name
  ORDER BY revenue DESC;
$$;

-- List all categories for chart filter
CREATE OR REPLACE FUNCTION get_top_level_categories()
RETURNS TABLE (slug text, name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT slug, name
  FROM categories
  WHERE parent_id IS NULL AND is_active = true
  ORDER BY display_order, name;
$$;

-- Admin order list
CREATE OR REPLACE FUNCTION list_orders_admin(
  p_search text DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_payment_status text DEFAULT NULL,
  p_limit integer DEFAULT 100
)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
  FROM (
    SELECT
      o.id,
      o.order_number,
      o.customer_name,
      o.customer_phone,
      o.customer_email,
      o.shipping_address,
      o.shipping_area,
      o.shipping_notes,
      o.subtotal,
      o.delivery_fee,
      o.total,
      o.payment_method,
      o.payment_status,
      o.payment_transaction_id,
      o.status,
      o.admin_notes,
      o.created_at,
      o.updated_at,
      (
        SELECT COALESCE(json_agg(json_build_object(
          'id', oi.id,
          'product_id', oi.product_id,
          'product_name', oi.product_name,
          'product_sku', oi.product_sku,
          'quantity', oi.quantity,
          'unit_price', oi.unit_price,
          'total_price', oi.total_price,
          'selected_size', oi.selected_size,
          'selected_color', oi.selected_color
        )), '[]'::json)
        FROM order_items oi
        WHERE oi.order_id = o.id
      ) AS items
    FROM orders o
    WHERE (p_search IS NULL OR p_search = '' OR
      o.order_number ILIKE '%' || p_search || '%' OR
      o.customer_name ILIKE '%' || p_search || '%' OR
      o.customer_phone ILIKE '%' || p_search || '%')
      AND (p_status IS NULL OR p_status = 'all' OR o.status = p_status)
      AND (p_payment_status IS NULL OR p_payment_status = 'all' OR o.payment_status = p_payment_status)
    ORDER BY o.created_at DESC
    LIMIT p_limit
  ) t;
$$;

CREATE OR REPLACE FUNCTION update_order_status_admin(
  p_order_id uuid,
  p_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE orders
  SET status = p_status, updated_at = now()
  WHERE id = p_order_id;
END;
$$;

-- Customer orders by auth user
CREATE OR REPLACE FUNCTION get_customer_orders(p_user_id uuid)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
  FROM (
    SELECT
      o.id,
      o.order_number,
      o.status,
      o.payment_status,
      o.payment_method,
      o.payment_transaction_id,
      o.total,
      o.shipping_area,
      o.created_at,
      o.updated_at
    FROM orders o
    JOIN customers c ON c.id = o.customer_id
    WHERE c.user_id = p_user_id
    ORDER BY o.created_at DESC
  ) t;
$$;

-- Public order tracking by order number + phone
CREATE OR REPLACE FUNCTION track_order(p_order_number text, p_phone text)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT row_to_json(t)
  FROM (
    SELECT
      o.id,
      o.order_number,
      o.status,
      o.payment_status,
      o.payment_method,
      o.payment_transaction_id,
      o.total,
      o.subtotal,
      o.delivery_fee,
      o.shipping_address,
      o.shipping_area,
      o.customer_name,
      o.created_at,
      o.updated_at,
      (
        SELECT COALESCE(json_agg(json_build_object(
          'product_name', oi.product_name,
          'quantity', oi.quantity,
          'unit_price', oi.unit_price,
          'total_price', oi.total_price,
          'selected_size', oi.selected_size,
          'selected_color', oi.selected_color
        )), '[]'::json)
        FROM order_items oi
        WHERE oi.order_id = o.id
      ) AS items
    FROM orders o
    WHERE o.order_number = p_order_number
      AND regexp_replace(o.customer_phone, '\s+', '', 'g') = regexp_replace(p_phone, '\s+', '', 'g')
    LIMIT 1
  ) t;
$$;

-- Admin notifications (unread messages + recent pending orders)
CREATE OR REPLACE FUNCTION get_admin_notifications()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(json_agg(n ORDER BY n.created_at DESC), '[]'::json)
  FROM (
    SELECT
      'message'::text AS type,
      m.id::text AS id,
      m.subject AS title,
      m.name || ' sent a message' AS body,
      NOT m.is_read AS is_unread,
      m.created_at,
      '/admin/messages'::text AS link
    FROM messages m
    UNION ALL
    SELECT
      'order'::text,
      o.id::text,
      'New order ' || o.order_number,
      o.customer_name || ' — ৳' || o.total::text,
      (o.status = 'pending')::boolean,
      o.created_at,
      '/admin/orders'::text
    FROM orders o
    WHERE o.created_at >= now() - interval '7 days'
      AND o.status IN ('pending', 'confirmed')
  ) n;
$$;

CREATE OR REPLACE FUNCTION mark_message_read_admin(p_message_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE messages SET is_read = true WHERE id = p_message_id;
END;
$$;

CREATE OR REPLACE FUNCTION list_messages_admin()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(json_agg(row_to_json(m) ORDER BY m.created_at DESC), '[]'::json)
  FROM (
    SELECT id, name, email, phone, subject, message, is_read, created_at
    FROM messages
    ORDER BY created_at DESC
    LIMIT 200
  ) m;
$$;

-- Update payment after bKash
CREATE OR REPLACE FUNCTION complete_order_payment(
  p_order_id uuid,
  p_transaction_id text,
  p_payment_status text DEFAULT 'paid'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE orders
  SET
    payment_transaction_id = CASE
      WHEN p_transaction_id IS NOT NULL AND p_transaction_id <> '' THEN p_transaction_id
      ELSE payment_transaction_id
    END,
    payment_status = p_payment_status,
    status = CASE
      WHEN p_payment_status = 'paid' THEN 'confirmed'
      WHEN p_payment_status = 'failed' THEN status
      ELSE status
    END,
    updated_at = now()
  WHERE id = p_order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION generate_order_number() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_dashboard_summary() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_category_revenue(timestamptz, timestamptz, text[]) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_top_level_categories() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION list_orders_admin(text, text, text, integer) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION update_order_status_admin(uuid, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_customer_orders(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION track_order(text, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_admin_notifications() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION mark_message_read_admin(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION list_messages_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION complete_order_payment(uuid, text, text) TO authenticated, anon;


-- >>>>> 20260626160000_006_products_storage.sql <<<<<

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


-- >>>>> 20260626180000_007_admin_security.sql <<<<<

-- Admin security: link auth users, permission checks, revoke public admin access

ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

-- Normalize legacy role slugs
UPDATE admin_users SET role = replace(role, '_', '-') WHERE role LIKE '%\_%';

CREATE INDEX IF NOT EXISTS admin_users_auth_user_id_idx ON admin_users(auth_user_id)
  WHERE auth_user_id IS NOT NULL;

-- Resolve active admin row for current JWT (links email on first login)
CREATE OR REPLACE FUNCTION get_active_admin_row()
RETURNS admin_users
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin admin_users%ROWTYPE;
  v_email text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_admin
  FROM admin_users
  WHERE auth_user_id = auth.uid() AND is_active = true
  LIMIT 1;

  IF FOUND THEN
    RETURN v_admin;
  END IF;

  v_email := lower(trim(auth.jwt() ->> 'email'));
  IF v_email IS NULL OR v_email = '' THEN
    RETURN NULL;
  END IF;

  UPDATE admin_users
  SET auth_user_id = auth.uid(), updated_at = now()
  WHERE lower(email) = v_email
    AND is_active = true
    AND auth_user_id IS NULL
  RETURNING * INTO v_admin;

  RETURN v_admin;
END;
$$;

-- Server-side permission matrix (source of truth)
CREATE OR REPLACE FUNCTION admin_has_permission(p_permission text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_admin admin_users%ROWTYPE;
BEGIN
  v_admin := get_active_admin_row();
  IF v_admin.id IS NULL THEN
    RETURN false;
  END IF;
  v_role := replace(v_admin.role, '_', '-');

  CASE p_permission
    WHEN 'view-dashboard' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator', 'order-manager', 'inventory-manager');
    WHEN 'view-orders' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator', 'order-manager');
    WHEN 'update-orders' THEN
      RETURN v_role IN ('owner', 'admin', 'order-manager');
    WHEN 'view-products' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator', 'inventory-manager');
    WHEN 'manage-products' THEN
      RETURN v_role IN ('owner', 'admin', 'inventory-manager');
    WHEN 'view-inventory' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator', 'inventory-manager');
    WHEN 'manage-inventory' THEN
      RETURN v_role IN ('owner', 'admin', 'inventory-manager');
    WHEN 'view-customers' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator');
    WHEN 'manage-customers' THEN
      RETURN v_role IN ('owner', 'admin');
    WHEN 'view-reviews' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator');
    WHEN 'manage-reviews' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator');
    WHEN 'view-coupons' THEN
      RETURN v_role IN ('owner', 'admin');
    WHEN 'manage-coupons' THEN
      RETURN v_role IN ('owner', 'admin');
    WHEN 'view-content' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator');
    WHEN 'manage-content' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator');
    WHEN 'view-settings' THEN
      RETURN v_role IN ('owner', 'admin');
    WHEN 'manage-settings' THEN
      RETURN v_role IN ('owner', 'admin');
    WHEN 'view-users' THEN
      RETURN v_role IN ('owner', 'admin');
    WHEN 'manage-users' THEN
      RETURN v_role = 'owner';
    WHEN 'view-audit-log' THEN
      RETURN v_role IN ('owner', 'admin');
    ELSE
      RETURN false;
  END CASE;
END;
$$;

CREATE OR REPLACE FUNCTION assert_admin_permission(p_permission text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT admin_has_permission(p_permission) THEN
    RAISE EXCEPTION 'permission_denied: %', p_permission USING ERRCODE = '42501';
  END IF;
END;
$$;

-- Profile for authenticated staff (authenticated only)
CREATE OR REPLACE FUNCTION get_my_admin_profile()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin admin_users%ROWTYPE;
BEGIN
  v_admin := get_active_admin_row();
  IF v_admin.id IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE admin_users SET last_login = now(), updated_at = now() WHERE id = v_admin.id;

  RETURN json_build_object(
    'id', v_admin.id,
    'email', v_admin.email,
    'name', v_admin.name,
    'role', replace(v_admin.role, '_', '-'),
    'avatar', v_admin.avatar,
    'isActive', v_admin.is_active,
    'createdAt', v_admin.created_at,
    'lastLogin', now()
  );
END;
$$;

-- Block admin emails from becoming storefront customers
CREATE OR REPLACE FUNCTION is_staff_email(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE lower(email) = lower(trim(p_email)) AND is_active = true
  );
$$;

-- Harden admin RPCs
CREATE OR REPLACE FUNCTION list_orders_admin(
  p_search text DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_payment_status text DEFAULT NULL,
  p_limit integer DEFAULT 100
)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM assert_admin_permission('view-orders');
  RETURN (
    SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
    FROM (
      SELECT o.id, o.order_number, o.customer_name, o.customer_phone, o.customer_email,
        o.shipping_address, o.shipping_area, o.shipping_notes, o.subtotal, o.delivery_fee,
        o.total, o.payment_method, o.payment_status, o.payment_transaction_id, o.status,
        o.admin_notes, o.created_at, o.updated_at,
        (SELECT COALESCE(json_agg(json_build_object(
          'id', oi.id, 'product_id', oi.product_id, 'product_name', oi.product_name,
          'product_sku', oi.product_sku, 'quantity', oi.quantity, 'unit_price', oi.unit_price,
          'total_price', oi.total_price, 'selected_size', oi.selected_size, 'selected_color', oi.selected_color
        )), '[]'::json) FROM order_items oi WHERE oi.order_id = o.id) AS items
      FROM orders o
      WHERE (p_search IS NULL OR p_search = '' OR o.order_number ILIKE '%' || p_search || '%'
        OR o.customer_name ILIKE '%' || p_search || '%' OR o.customer_phone ILIKE '%' || p_search || '%')
        AND (p_status IS NULL OR p_status = 'all' OR o.status = p_status)
        AND (p_payment_status IS NULL OR p_payment_status = 'all' OR o.payment_status = p_payment_status)
      ORDER BY o.created_at DESC
      LIMIT p_limit
    ) t
  );
END;
$$;

CREATE OR REPLACE FUNCTION update_order_status_admin(p_order_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM assert_admin_permission('update-orders');
  UPDATE orders SET status = p_status, updated_at = now() WHERE id = p_order_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_dashboard_summary()
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM assert_admin_permission('view-dashboard');
  RETURN (
    SELECT json_build_object(
      'totalRevenue', COALESCE((SELECT SUM(total) FROM orders WHERE status = 'delivered' AND payment_status = 'paid'), 0),
      'totalOrders', (SELECT COUNT(*) FROM orders WHERE status NOT IN ('cancelled', 'refunded')),
      'pendingOrders', (SELECT COUNT(*) FROM orders WHERE status IN ('pending', 'confirmed', 'processing')),
      'totalCustomers', (SELECT COUNT(*) FROM customers),
      'statusCounts', json_build_object(
        'pending', (SELECT COUNT(*) FROM orders WHERE status = 'pending'),
        'confirmed', (SELECT COUNT(*) FROM orders WHERE status = 'confirmed'),
        'processing', (SELECT COUNT(*) FROM orders WHERE status = 'processing'),
        'ready-to-deliver', (SELECT COUNT(*) FROM orders WHERE status = 'ready-to-deliver'),
        'delivered', (SELECT COUNT(*) FROM orders WHERE status = 'delivered'),
        'cancelled', (SELECT COUNT(*) FROM orders WHERE status = 'cancelled'),
        'refunded', (SELECT COUNT(*) FROM orders WHERE status = 'refunded')
      ),
      'paymentBreakdown', (
        SELECT COALESCE(json_agg(json_build_object('method', payment_method, 'count', cnt)), '[]'::json)
        FROM (SELECT payment_method, COUNT(*) AS cnt FROM orders WHERE status NOT IN ('cancelled', 'refunded') GROUP BY payment_method) pm
      )
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION get_category_revenue(
  p_start timestamptz, p_end timestamptz, p_category_slugs text[] DEFAULT NULL
)
RETURNS TABLE (category_slug text, category_name text, revenue bigint, order_count bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM assert_admin_permission('view-dashboard');
  RETURN QUERY
  WITH item_revenue AS (
    SELECT COALESCE(get_root_category_slug(p.category_id), 'uncategorized') AS root_slug,
      oi.total_price, oi.order_id
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    LEFT JOIN products p ON p.id = oi.product_id
    WHERE o.created_at >= p_start AND o.created_at <= p_end
      AND o.status NOT IN ('cancelled', 'refunded')
  )
  SELECT ir.root_slug,
    COALESCE(c.name, initcap(replace(ir.root_slug, '-', ' ')))::text,
    COALESCE(SUM(ir.total_price), 0)::bigint,
    COUNT(DISTINCT ir.order_id)::bigint
  FROM item_revenue ir
  LEFT JOIN categories c ON c.slug = ir.root_slug
  WHERE p_category_slugs IS NULL OR ir.root_slug = ANY(p_category_slugs)
  GROUP BY ir.root_slug, c.name
  ORDER BY 3 DESC;
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
    ) n
  );
END;
$$;

CREATE OR REPLACE FUNCTION mark_message_read_admin(p_message_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM assert_admin_permission('manage-content');
  UPDATE messages SET is_read = true WHERE id = p_message_id;
END;
$$;

CREATE OR REPLACE FUNCTION list_messages_admin()
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM assert_admin_permission('view-content');
  RETURN (
    SELECT COALESCE(json_agg(row_to_json(m) ORDER BY m.created_at DESC), '[]'::json)
    FROM (
      SELECT id, name, email, phone, subject, message, is_read, created_at
      FROM messages ORDER BY created_at DESC LIMIT 200
    ) m
  );
END;
$$;

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
  END IF;

  SELECT row_to_json(p) INTO v_result
  FROM (SELECT pr.*, c.slug AS category_slug FROM products pr JOIN categories c ON c.id = pr.category_id WHERE pr.id = v_id) p;
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
  PERFORM assert_admin_permission('manage-products');
  DELETE FROM products WHERE id = p_product_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_assignable_categories()
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM assert_admin_permission('manage-products');
  RETURN (
    SELECT COALESCE(json_agg(row_to_json(c) ORDER BY c.name), '[]'::json)
    FROM (
      SELECT cat.id, cat.slug, cat.name, cat.name_bn, parent.slug AS parent_slug
      FROM categories cat
      LEFT JOIN categories parent ON parent.id = cat.parent_id
      WHERE cat.is_active = true
        AND NOT EXISTS (SELECT 1 FROM categories child WHERE child.parent_id = cat.id)
      ORDER BY cat.name
    ) c
  );
END;
$$;

CREATE OR REPLACE FUNCTION get_customer_orders(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR (p_user_id IS DISTINCT FROM auth.uid() AND NOT admin_has_permission('view-customers')) THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = '42501';
  END IF;

  RETURN (
    SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
    FROM (
      SELECT o.id, o.order_number, o.status, o.payment_status, o.payment_method,
        o.payment_transaction_id, o.total, o.shipping_area, o.created_at, o.updated_at
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      WHERE c.user_id = p_user_id
      ORDER BY o.created_at DESC
    ) t
  );
END;
$$;

CREATE OR REPLACE FUNCTION complete_order_payment(
  p_order_id uuid, p_transaction_id text, p_payment_status text DEFAULT 'paid'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
BEGIN
  -- Only order owner (customer) or staff with order permission
  SELECT c.user_id INTO v_owner
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  WHERE o.id = p_order_id;

  IF v_owner IS DISTINCT FROM auth.uid() AND NOT admin_has_permission('update-orders') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = '42501';
  END IF;

  UPDATE orders SET
    payment_transaction_id = CASE
      WHEN p_transaction_id IS NOT NULL AND p_transaction_id <> '' THEN p_transaction_id
      ELSE payment_transaction_id
    END,
    payment_status = p_payment_status,
    status = CASE WHEN p_payment_status = 'paid' THEN 'confirmed' ELSE status END,
    updated_at = now()
  WHERE id = p_order_id;
END;
$$;

-- Tighten direct table writes: staff permissions only
DROP POLICY IF EXISTS "admin_insert_products" ON products;
DROP POLICY IF EXISTS "admin_update_products" ON products;
DROP POLICY IF EXISTS "admin_delete_products" ON products;

CREATE POLICY "staff_insert_products" ON products FOR INSERT TO authenticated
  WITH CHECK (admin_has_permission('manage-products'));

CREATE POLICY "staff_update_products" ON products FOR UPDATE TO authenticated
  USING (admin_has_permission('manage-products'))
  WITH CHECK (admin_has_permission('manage-products'));

CREATE POLICY "staff_delete_products" ON products FOR DELETE TO authenticated
  USING (admin_has_permission('manage-products'));

DROP POLICY IF EXISTS "admin_read_orders" ON orders;
CREATE POLICY "staff_read_orders" ON orders FOR SELECT TO authenticated
  USING (admin_has_permission('view-orders') OR customer_id IN (
    SELECT id FROM customers WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "admin_update_orders" ON orders;
CREATE POLICY "staff_update_orders" ON orders FOR UPDATE TO authenticated
  USING (admin_has_permission('update-orders'))
  WITH CHECK (admin_has_permission('update-orders'));

-- Storage: only inventory/product managers may upload
DROP POLICY IF EXISTS "upload_product_images" ON storage.objects;
DROP POLICY IF EXISTS "update_product_images" ON storage.objects;
DROP POLICY IF EXISTS "delete_product_images" ON storage.objects;

CREATE POLICY "staff_upload_product_images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND admin_has_permission('manage-products'));

CREATE POLICY "staff_update_product_images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND admin_has_permission('manage-products'));

CREATE POLICY "staff_delete_product_images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND admin_has_permission('manage-products'));

-- Revoke anonymous access to staff RPCs
REVOKE EXECUTE ON FUNCTION get_my_admin_profile() FROM anon;
REVOKE EXECUTE ON FUNCTION list_orders_admin(text, text, text, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION update_order_status_admin(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION get_dashboard_summary() FROM anon;
REVOKE EXECUTE ON FUNCTION get_category_revenue(timestamptz, timestamptz, text[]) FROM anon;
REVOKE EXECUTE ON FUNCTION get_admin_notifications() FROM anon;
REVOKE EXECUTE ON FUNCTION mark_message_read_admin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION list_messages_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION upsert_product_admin(jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION delete_product_admin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION get_assignable_categories() FROM anon;
REVOKE EXECUTE ON FUNCTION complete_order_payment(uuid, text, text) FROM anon;

REVOKE EXECUTE ON FUNCTION get_customer_orders(uuid) FROM anon;

-- Lock down admin_users table (was open to any authenticated user)
DROP POLICY IF EXISTS "admin_read_admin_users" ON admin_users;
DROP POLICY IF EXISTS "admin_insert_admin_users" ON admin_users;
DROP POLICY IF EXISTS "admin_update_admin_users" ON admin_users;
DROP POLICY IF EXISTS "admin_delete_admin_users" ON admin_users;

CREATE POLICY "staff_read_admin_users" ON admin_users FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid() OR admin_has_permission('manage-users'));

CREATE POLICY "owner_manage_admin_users" ON admin_users FOR ALL TO authenticated
  USING (admin_has_permission('manage-users'))
  WITH CHECK (admin_has_permission('manage-users'));

GRANT EXECUTE ON FUNCTION get_my_admin_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_has_permission(text) TO authenticated;
GRANT EXECUTE ON FUNCTION is_staff_email(text) TO anon, authenticated;


-- >>>>> 20260626200000_008_production_hardening.sql <<<<<

-- Production hardening: rate limits, secure RPCs, close spam vectors

-- ---------------------------------------------------------------------------
-- Rate limiting (IP / user bucket)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rate_limit_events (
  id bigserial PRIMARY KEY,
  bucket_key text NOT NULL,
  action text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS rate_limit_events_lookup_idx
  ON rate_limit_events (bucket_key, action, created_at DESC);

ALTER TABLE rate_limit_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_request_bucket_key()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_headers json;
  v_ip text;
BEGIN
  IF auth.uid() IS NOT NULL THEN
    RETURN 'user:' || auth.uid()::text;
  END IF;

  BEGIN
    v_headers := current_setting('request.headers', true)::json;
    v_ip := COALESCE(
      NULLIF(trim(split_part(COALESCE(v_headers->>'x-forwarded-for', ''), ',', 1)), ''),
      NULLIF(trim(COALESCE(v_headers->>'x-real-ip', '')), ''),
      NULLIF(trim(COALESCE(v_headers->>'cf-connecting-ip', '')), '')
    );
  EXCEPTION WHEN OTHERS THEN
    v_ip := NULL;
  END;

  RETURN 'ip:' || COALESCE(v_ip, 'unknown');
END;
$$;

CREATE OR REPLACE FUNCTION assert_rate_limit(
  p_action text,
  p_max_requests integer,
  p_window_seconds integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_key text;
  v_count integer;
BEGIN
  v_key := get_request_bucket_key();

  DELETE FROM rate_limit_events
  WHERE created_at < now() - interval '2 days';

  SELECT COUNT(*) INTO v_count
  FROM rate_limit_events
  WHERE bucket_key = v_key
    AND action = p_action
    AND created_at > now() - make_interval(secs => p_window_seconds);

  IF v_count >= p_max_requests THEN
    RAISE EXCEPTION 'rate_limit_exceeded' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO rate_limit_events (bucket_key, action) VALUES (v_key, p_action);
END;
$$;

-- ---------------------------------------------------------------------------
-- Contact form (honeypot + rate limit; remove open anon insert)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION submit_contact_message(p_payload jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text;
  v_email text;
  v_subject text;
  v_message text;
BEGIN
  -- Honeypot field — bots fill this; pretend success
  IF COALESCE(trim(p_payload->>'website'), '') <> '' THEN
    RETURN;
  END IF;

  PERFORM assert_rate_limit('contact', 3, 3600);

  v_name := trim(p_payload->>'name');
  v_email := lower(trim(p_payload->>'email'));
  v_subject := trim(p_payload->>'subject');
  v_message := trim(p_payload->>'message');

  IF length(v_name) < 2 OR length(v_name) > 120 THEN
    RAISE EXCEPTION 'invalid_name' USING ERRCODE = '22023';
  END IF;
  IF v_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'invalid_email' USING ERRCODE = '22023';
  END IF;
  IF length(v_subject) < 3 OR length(v_subject) > 200 THEN
    RAISE EXCEPTION 'invalid_subject' USING ERRCODE = '22023';
  END IF;
  IF length(v_message) < 10 OR length(v_message) > 5000 THEN
    RAISE EXCEPTION 'invalid_message' USING ERRCODE = '22023';
  END IF;

  INSERT INTO messages (name, email, phone, subject, message, is_read)
  VALUES (
    v_name,
    v_email,
    NULLIF(trim(p_payload->>'phone'), ''),
    v_subject,
    v_message,
    false
  );
END;
$$;

DROP POLICY IF EXISTS "anon_insert_messages" ON messages;
REVOKE INSERT ON messages FROM anon;

GRANT EXECUTE ON FUNCTION submit_contact_message(jsonb) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Secure checkout — server-side price/stock validation
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION resolve_delivery_fee(p_area_slug text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_area_slug
    WHEN 'inside-dhaka' THEN 60
    WHEN 'outside-dhaka' THEN 120
    WHEN 'pickup' THEN 0
    ELSE NULL
  END;
$$;

CREATE OR REPLACE FUNCTION create_order_secure(p_payload jsonb)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_customer_id uuid;
  v_order_number text;
  v_order_id uuid;
  v_area_slug text;
  v_delivery_fee integer;
  v_subtotal integer := 0;
  v_total integer;
  v_item jsonb;
  v_product products%ROWTYPE;
  v_unit_price integer;
  v_line_total integer;
  v_qty integer;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'authentication_required' USING ERRCODE = '42501';
  END IF;

  PERFORM assert_rate_limit('create_order', 10, 3600);

  SELECT id INTO v_customer_id FROM customers WHERE user_id = v_user_id LIMIT 1;
  IF v_customer_id IS NULL THEN
    RAISE EXCEPTION 'customer_profile_required' USING ERRCODE = '42501';
  END IF;

  v_area_slug := trim(p_payload->>'shipping_area_slug');
  v_delivery_fee := resolve_delivery_fee(v_area_slug);
  IF v_delivery_fee IS NULL THEN
    RAISE EXCEPTION 'invalid_shipping_area' USING ERRCODE = '22023';
  END IF;

  IF jsonb_array_length(COALESCE(p_payload->'items', '[]'::jsonb)) = 0 THEN
    RAISE EXCEPTION 'empty_cart' USING ERRCODE = '22023';
  END IF;

  IF jsonb_array_length(p_payload->'items') > 30 THEN
    RAISE EXCEPTION 'too_many_items' USING ERRCODE = '22023';
  END IF;

  -- Validate line items against live product prices/stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_payload->'items')
  LOOP
    v_qty := GREATEST(1, LEAST(99, (v_item->>'quantity')::integer));

    SELECT * INTO v_product
    FROM products
    WHERE id = (v_item->>'product_id')::uuid
      AND is_active = true;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'product_unavailable: %', v_item->>'product_id' USING ERRCODE = '22023';
    END IF;

    IF v_product.stock < v_qty THEN
      RAISE EXCEPTION 'insufficient_stock: %', v_product.sku USING ERRCODE = '22023';
    END IF;

    v_unit_price := COALESCE(v_product.sale_price, v_product.price);
    v_line_total := v_unit_price * v_qty;
    v_subtotal := v_subtotal + v_line_total;
  END LOOP;

  v_total := v_subtotal + v_delivery_fee;

  v_order_number := generate_order_number();

  INSERT INTO orders (
    order_number, customer_id, customer_name, customer_phone, customer_email,
    shipping_address, shipping_area, shipping_notes,
    subtotal, delivery_fee, total,
    payment_method, payment_status, status
  ) VALUES (
    v_order_number,
    v_customer_id,
    trim(p_payload->>'customer_name'),
    trim(p_payload->>'customer_phone'),
    lower(trim(p_payload->>'customer_email')),
    trim(p_payload->>'shipping_address'),
    COALESCE(NULLIF(trim(p_payload->>'shipping_area_label'), ''), v_area_slug),
    NULLIF(trim(p_payload->>'shipping_notes'), ''),
    v_subtotal,
    v_delivery_fee,
    v_total,
    COALESCE(NULLIF(trim(p_payload->>'payment_method'), ''), 'cod'),
    'pending',
    'pending'
  ) RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_payload->'items')
  LOOP
    v_qty := GREATEST(1, LEAST(99, (v_item->>'quantity')::integer));

    SELECT * INTO v_product FROM products WHERE id = (v_item->>'product_id')::uuid;
    v_unit_price := COALESCE(v_product.sale_price, v_product.price);
    v_line_total := v_unit_price * v_qty;

    INSERT INTO order_items (
      order_id, product_id, product_name, product_sku,
      quantity, unit_price, total_price, selected_size, selected_color
    ) VALUES (
      v_order_id,
      v_product.id,
      v_product.name,
      v_product.sku,
      v_qty,
      v_unit_price,
      v_line_total,
      NULLIF(trim(v_item->>'selected_size'), ''),
      NULLIF(trim(v_item->>'selected_color'), '')
    );

    UPDATE products SET stock = GREATEST(0, stock - v_qty), updated_at = now()
    WHERE id = v_product.id;
  END LOOP;

  RETURN json_build_object(
    'orderId', v_order_id,
    'orderNumber', v_order_number,
    'subtotal', v_subtotal,
    'deliveryFee', v_delivery_fee,
    'total', v_total
  );
END;
$$;

GRANT EXECUTE ON FUNCTION create_order_secure(jsonb) TO authenticated;
REVOKE EXECUTE ON FUNCTION generate_order_number() FROM anon;

-- Block direct order inserts — checkout must use create_order_secure
DROP POLICY IF EXISTS "customer_insert_orders" ON orders;
DROP POLICY IF EXISTS "customer_insert_order_items" ON order_items;

-- ---------------------------------------------------------------------------
-- Rate-limited public endpoints
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION track_order(p_order_number text, p_phone text)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result json;
BEGIN
  PERFORM assert_rate_limit('track_order', 20, 3600);

  IF length(trim(p_order_number)) < 4 OR length(trim(p_order_number)) > 32 THEN
    RETURN NULL;
  END IF;

  SELECT row_to_json(t) INTO v_result
  FROM (
    SELECT
      o.id, o.order_number, o.status, o.payment_status, o.payment_method,
      o.total, o.shipping_area, o.created_at, o.updated_at,
      (
        SELECT COALESCE(json_agg(json_build_object(
          'product_name', oi.product_name,
          'quantity', oi.quantity,
          'unit_price', oi.unit_price,
          'total_price', oi.total_price,
          'selected_size', oi.selected_size,
          'selected_color', oi.selected_color
        )), '[]'::json)
        FROM order_items oi WHERE oi.order_id = o.id
      ) AS items
    FROM orders o
    WHERE o.order_number = trim(p_order_number)
      AND regexp_replace(o.customer_phone, '\s+', '', 'g') = regexp_replace(trim(p_phone), '\s+', '', 'g')
    LIMIT 1
  ) t;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION search_products_query(p_query text, p_limit integer DEFAULT 20)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_query text;
  v_limit integer;
BEGIN
  PERFORM assert_rate_limit('search', 60, 60);

  v_query := trim(p_query);
  IF length(v_query) < 3 OR length(v_query) > 80 THEN
    RETURN '[]'::json;
  END IF;

  v_limit := LEAST(GREATEST(COALESCE(p_limit, 20), 1), 30);

  RETURN (
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
          pr.name ILIKE '%' || v_query || '%'
          OR pr.name_bn ILIKE '%' || v_query || '%'
          OR pr.sku ILIKE '%' || v_query || '%'
        )
      ORDER BY pr.is_featured DESC, pr.created_at DESC
      LIMIT v_limit
    ) p
  );
END;
$$;

CREATE OR REPLACE FUNCTION is_staff_email(p_email text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM assert_rate_limit('staff_email_check', 30, 3600);

  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE lower(email) = lower(trim(p_email)) AND is_active = true
  );
END;
$$;

-- Verify order ownership for bKash edge function (service role)
CREATE OR REPLACE FUNCTION verify_order_for_payment(
  p_order_id uuid,
  p_user_id uuid,
  p_expected_amount numeric DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_owner uuid;
BEGIN
  SELECT * INTO v_order FROM orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'order_access_denied' USING ERRCODE = '42501';
  END IF;

  SELECT user_id INTO v_owner FROM customers WHERE id = v_order.customer_id;

  IF v_owner IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'order_access_denied' USING ERRCODE = '42501';
  END IF;

  IF v_order.payment_status = 'paid' THEN
    RAISE EXCEPTION 'order_already_paid' USING ERRCODE = '22023';
  END IF;

  IF p_expected_amount IS NOT NULL AND v_order.total::numeric <> p_expected_amount THEN
    RAISE EXCEPTION 'amount_mismatch' USING ERRCODE = '22023';
  END IF;

  RETURN json_build_object(
    'orderId', v_order.id,
    'orderNumber', v_order.order_number,
    'total', v_order.total,
    'paymentStatus', v_order.payment_status
  );
END;
$$;

GRANT EXECUTE ON FUNCTION verify_order_for_payment(uuid, uuid, numeric) TO service_role;


-- >>>>> 20260626220000_009_staff_management.sql <<<<<

-- Staff / role management for owner and admin dashboard

-- Extend permissions: admin can view + manage non-admin staff
CREATE OR REPLACE FUNCTION admin_has_permission(p_permission text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_admin admin_users%ROWTYPE;
BEGIN
  v_admin := get_active_admin_row();
  IF v_admin.id IS NULL THEN
    RETURN false;
  END IF;
  v_role := replace(v_admin.role, '_', '-');

  CASE p_permission
    WHEN 'view-dashboard' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator', 'order-manager', 'inventory-manager');
    WHEN 'view-orders' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator', 'order-manager');
    WHEN 'update-orders' THEN
      RETURN v_role IN ('owner', 'admin', 'order-manager');
    WHEN 'view-products' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator', 'inventory-manager');
    WHEN 'manage-products' THEN
      RETURN v_role IN ('owner', 'admin', 'inventory-manager');
    WHEN 'view-inventory' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator', 'inventory-manager');
    WHEN 'manage-inventory' THEN
      RETURN v_role IN ('owner', 'admin', 'inventory-manager');
    WHEN 'view-customers' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator');
    WHEN 'manage-customers' THEN
      RETURN v_role IN ('owner', 'admin');
    WHEN 'view-reviews' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator');
    WHEN 'manage-reviews' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator');
    WHEN 'view-coupons' THEN
      RETURN v_role IN ('owner', 'admin');
    WHEN 'manage-coupons' THEN
      RETURN v_role IN ('owner', 'admin');
    WHEN 'view-content' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator');
    WHEN 'manage-content' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator');
    WHEN 'view-settings' THEN
      RETURN v_role IN ('owner', 'admin');
    WHEN 'manage-settings' THEN
      RETURN v_role IN ('owner', 'admin');
    WHEN 'view-users' THEN
      RETURN v_role IN ('owner', 'admin');
    WHEN 'manage-users' THEN
      RETURN v_role = 'owner';
    WHEN 'manage-staff' THEN
      RETURN v_role IN ('owner', 'admin');
    WHEN 'view-audit-log' THEN
      RETURN v_role IN ('owner', 'admin');
    ELSE
      RETURN false;
  END CASE;
END;
$$;

-- Helper: roles an actor may assign
CREATE OR REPLACE FUNCTION can_assign_staff_role(p_actor_role text, p_target_role text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_actor_role = 'owner' THEN p_target_role IN (
      'owner', 'admin', 'moderator', 'order-manager', 'inventory-manager'
    )
    WHEN p_actor_role = 'admin' THEN p_target_role IN (
      'moderator', 'order-manager', 'inventory-manager'
    )
    ELSE false
  END;
$$;

CREATE OR REPLACE FUNCTION get_actor_admin_role()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin admin_users%ROWTYPE;
BEGIN
  v_admin := get_active_admin_row();
  IF v_admin.id IS NULL THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = '42501';
  END IF;
  RETURN replace(v_admin.role, '_', '-');
END;
$$;

-- List all staff (owner + admin)
CREATE OR REPLACE FUNCTION list_staff_members()
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT admin_has_permission('view-users') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = '42501';
  END IF;

  RETURN (
    SELECT COALESCE(json_agg(row_to_json(s) ORDER BY s.created_at), '[]'::json)
    FROM (
      SELECT
        id, email, name,
        replace(role, '_', '-') AS role,
        avatar, is_active AS "isActive",
        auth_user_id IS NOT NULL AS "isLinked",
        last_login AS "lastLogin",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM admin_users
      ORDER BY created_at
    ) s
  );
END;
$$;

-- Create or update a staff member by email
CREATE OR REPLACE FUNCTION save_staff_member(p_payload jsonb)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_role text;
  v_id uuid;
  v_email text;
  v_name text;
  v_role text;
  v_existing admin_users%ROWTYPE;
  v_result json;
BEGIN
  v_actor_role := get_actor_admin_role();

  IF NOT admin_has_permission('manage-staff') AND NOT admin_has_permission('manage-users') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = '42501';
  END IF;

  v_email := lower(trim(p_payload->>'email'));
  v_name := trim(p_payload->>'name');
  v_role := replace(trim(p_payload->>'role'), '_', '-');

  IF v_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'invalid_email' USING ERRCODE = '22023';
  END IF;
  IF length(v_name) < 2 OR length(v_name) > 120 THEN
    RAISE EXCEPTION 'invalid_name' USING ERRCODE = '22023';
  END IF;
  IF NOT can_assign_staff_role(v_actor_role, v_role) THEN
    RAISE EXCEPTION 'cannot_assign_role' USING ERRCODE = '42501';
  END IF;

  v_id := NULLIF(p_payload->>'id', '')::uuid;

  IF v_id IS NOT NULL THEN
    SELECT * INTO v_existing FROM admin_users WHERE id = v_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'staff_not_found' USING ERRCODE = '22023';
    END IF;

    -- Protect owner accounts from non-owners
    IF replace(v_existing.role, '_', '-') = 'owner' AND v_actor_role <> 'owner' THEN
      RAISE EXCEPTION 'cannot_modify_owner' USING ERRCODE = '42501';
    END IF;
    IF replace(v_existing.role, '_', '-') = 'admin' AND v_actor_role <> 'owner' THEN
      RAISE EXCEPTION 'cannot_modify_admin' USING ERRCODE = '42501';
    END IF;

    -- Cannot change own role (prevents locking yourself out)
    IF v_existing.auth_user_id = auth.uid() AND v_role <> replace(v_existing.role, '_', '-') THEN
      RAISE EXCEPTION 'cannot_change_own_role' USING ERRCODE = '42501';
    END IF;

    UPDATE admin_users SET
      name = v_name,
      role = v_role,
      updated_at = now()
    WHERE id = v_id;
  ELSE
  -- New staff by email
    IF EXISTS (SELECT 1 FROM admin_users WHERE lower(email) = v_email) THEN
      RAISE EXCEPTION 'email_already_staff' USING ERRCODE = '22023';
    END IF;

    INSERT INTO admin_users (email, name, role, is_active)
    VALUES (v_email, v_name, v_role, true)
    RETURNING id INTO v_id;
  END IF;

  SELECT row_to_json(s) INTO v_result
  FROM (
    SELECT id, email, name, replace(role, '_', '-') AS role,
      is_active AS "isActive", auth_user_id IS NOT NULL AS "isLinked",
      last_login AS "lastLogin", created_at AS "createdAt"
    FROM admin_users WHERE id = v_id
  ) s;

  RETURN v_result;
END;
$$;

-- Activate / deactivate staff
CREATE OR REPLACE FUNCTION set_staff_active(p_staff_id uuid, p_is_active boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_role text;
  v_target admin_users%ROWTYPE;
  v_owner_count integer;
BEGIN
  v_actor_role := get_actor_admin_role();

  IF NOT admin_has_permission('manage-staff') AND NOT admin_has_permission('manage-users') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_target FROM admin_users WHERE id = p_staff_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'staff_not_found' USING ERRCODE = '22023';
  END IF;

  IF v_target.auth_user_id = auth.uid() THEN
    RAISE EXCEPTION 'cannot_deactivate_self' USING ERRCODE = '42501';
  END IF;

  IF replace(v_target.role, '_', '-') = 'owner' AND v_actor_role <> 'owner' THEN
    RAISE EXCEPTION 'cannot_modify_owner' USING ERRCODE = '42501';
  END IF;
  IF replace(v_target.role, '_', '-') = 'admin' AND v_actor_role <> 'owner' THEN
    RAISE EXCEPTION 'cannot_modify_admin' USING ERRCODE = '42501';
  END IF;

  IF NOT p_is_active AND replace(v_target.role, '_', '-') = 'owner' THEN
    SELECT COUNT(*) INTO v_owner_count
    FROM admin_users
    WHERE replace(role, '_', '-') = 'owner' AND is_active = true AND id <> p_staff_id;
    IF v_owner_count = 0 THEN
      RAISE EXCEPTION 'cannot_remove_last_owner' USING ERRCODE = '42501';
    END IF;
  END IF;

  UPDATE admin_users SET is_active = p_is_active, updated_at = now() WHERE id = p_staff_id;
END;
$$;

-- Update RLS so owner/admin can list all staff
DROP POLICY IF EXISTS "staff_read_admin_users" ON admin_users;
CREATE POLICY "staff_read_admin_users" ON admin_users FOR SELECT TO authenticated
  USING (
    auth_user_id = auth.uid()
    OR admin_has_permission('view-users')
  );

DROP POLICY IF EXISTS "owner_manage_admin_users" ON admin_users;
CREATE POLICY "owner_manage_admin_users" ON admin_users FOR ALL TO authenticated
  USING (admin_has_permission('manage-users'))
  WITH CHECK (admin_has_permission('manage-users'));

GRANT EXECUTE ON FUNCTION list_staff_members() TO authenticated;
GRANT EXECUTE ON FUNCTION save_staff_member(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION set_staff_active(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION get_actor_admin_role() TO authenticated;


-- >>>>> OWNER ACCOUNT (change email if needed) <<<<<
INSERT INTO admin_users (email, name, role, is_active)
VALUES ('shoukhin.lifestyle.bd@gmail.com', 'Soukhin Owner', 'owner', true)
ON CONFLICT (email) DO UPDATE SET role = 'owner', is_active = true;
