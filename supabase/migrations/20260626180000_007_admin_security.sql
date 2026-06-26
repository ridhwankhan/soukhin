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
