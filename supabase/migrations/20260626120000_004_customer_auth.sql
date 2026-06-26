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
