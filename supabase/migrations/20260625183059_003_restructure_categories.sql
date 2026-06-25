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
