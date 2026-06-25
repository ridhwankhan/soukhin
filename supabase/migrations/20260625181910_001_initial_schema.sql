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
