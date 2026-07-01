-- Manual staff orders (no customer account), customer notifications, auto-purge

-- ---------------------------------------------------------------------------
-- Orders: manual order metadata
-- ---------------------------------------------------------------------------
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS is_manual_order boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_by_admin_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_by_admin_name text,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS purge_after timestamptz;

CREATE INDEX IF NOT EXISTS orders_manual_purge_idx
  ON orders (purge_after)
  WHERE is_manual_order = true AND purge_after IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Customer notifications (in-app + email tracking)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  recipient_email text NOT NULL,
  recipient_name text,
  title text NOT NULL,
  body text NOT NULL,
  notification_type text NOT NULL DEFAULT 'general'
    CHECK (notification_type IN ('general', 'voucher', 'promo')),
  coupon_code text,
  sent_by_admin_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  sent_by_admin_name text,
  is_read boolean NOT NULL DEFAULT false,
  email_sent boolean NOT NULL DEFAULT false,
  email_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS customer_notifications_customer_idx
  ON customer_notifications (customer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS customer_notifications_email_idx
  ON customer_notifications (lower(recipient_email), created_at DESC);

ALTER TABLE customer_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customers_read_own_notifications" ON customer_notifications;
CREATE POLICY "customers_read_own_notifications" ON customer_notifications
  FOR SELECT TO authenticated
  USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
    OR lower(recipient_email) = lower(trim(COALESCE(auth.jwt() ->> 'email', '')))
  );

DROP POLICY IF EXISTS "customers_update_own_notifications" ON customer_notifications;
CREATE POLICY "customers_update_own_notifications" ON customer_notifications
  FOR UPDATE TO authenticated
  USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
    OR lower(recipient_email) = lower(trim(COALESCE(auth.jwt() ->> 'email', '')))
  )
  WITH CHECK (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
    OR lower(recipient_email) = lower(trim(COALESCE(auth.jwt() ->> 'email', '')))
  );

-- ---------------------------------------------------------------------------
-- Permissions: manual orders + customer notifications
-- ---------------------------------------------------------------------------
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
    WHEN 'create-manual-orders' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator', 'order-manager');
    WHEN 'view-products' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator', 'inventory-manager');
    WHEN 'manage-products' THEN
      RETURN v_role IN ('owner', 'admin', 'inventory-manager');
    WHEN 'view-inventory' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator', 'inventory-manager');
    WHEN 'manage-inventory' THEN
      RETURN v_role IN ('owner', 'admin', 'inventory-manager');
    WHEN 'view-customers' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator', 'order-manager');
    WHEN 'manage-customers' THEN
      RETURN v_role IN ('owner', 'admin');
    WHEN 'send-customer-notifications' THEN
      RETURN v_role IN ('owner', 'admin');
    WHEN 'view-reviews' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator');
    WHEN 'manage-reviews' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator');
    WHEN 'view-coupons' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator', 'order-manager', 'inventory-manager');
    WHEN 'manage-coupons' THEN
      RETURN v_role IN ('owner', 'admin', 'moderator', 'order-manager', 'inventory-manager');
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

-- ---------------------------------------------------------------------------
-- Purge completed manual orders after retention period (30 days)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION purge_expired_manual_orders()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted integer := 0;
  v_order_id uuid;
BEGIN
  FOR v_order_id IN
    SELECT id FROM orders
    WHERE is_manual_order = true
      AND purge_after IS NOT NULL
      AND purge_after <= now()
  LOOP
    DELETE FROM order_items WHERE order_id = v_order_id;
    DELETE FROM orders WHERE id = v_order_id;
    v_deleted := v_deleted + 1;
  END LOOP;
  RETURN v_deleted;
END;
$$;

-- ---------------------------------------------------------------------------
-- Staff manual order creation (no customer account / no OTP)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_order_admin(p_payload jsonb)
RETURNS json
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin admin_users%ROWTYPE;
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
  v_name text;
  v_phone text;
  v_email text;
BEGIN
  PERFORM assert_admin_permission('create-manual-orders');
  v_admin := get_active_admin_row();

  v_name := trim(p_payload->>'customer_name');
  v_phone := trim(p_payload->>'customer_phone');
  v_email := lower(trim(COALESCE(p_payload->>'customer_email', '')));

  IF length(v_name) < 2 OR length(v_name) > 120 THEN
    RAISE EXCEPTION 'invalid_name' USING ERRCODE = '22023';
  END IF;
  IF length(regexp_replace(v_phone, '\s+', '', 'g')) < 10 THEN
    RAISE EXCEPTION 'invalid_phone' USING ERRCODE = '22023';
  END IF;
  IF v_email <> '' AND v_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'invalid_email' USING ERRCODE = '22023';
  END IF;
  IF length(trim(COALESCE(p_payload->>'shipping_address', ''))) < 5 THEN
    RAISE EXCEPTION 'invalid_address' USING ERRCODE = '22023';
  END IF;

  v_area_slug := trim(p_payload->>'shipping_area_slug');
  v_delivery_fee := resolve_delivery_fee(v_area_slug);
  IF v_delivery_fee IS NULL THEN
    RAISE EXCEPTION 'invalid_shipping_area' USING ERRCODE = '22023';
  END IF;

  IF jsonb_array_length(COALESCE(p_payload->'items', '[]'::jsonb)) = 0 THEN
    RAISE EXCEPTION 'empty_cart' USING ERRCODE = '22023';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_payload->'items')
  LOOP
    v_qty := GREATEST(1, LEAST(99, (v_item->>'quantity')::integer));
    SELECT * INTO v_product
    FROM products
    WHERE id = (v_item->>'product_id')::uuid AND is_active = true;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'product_unavailable: %', v_item->>'product_id' USING ERRCODE = '22023';
    END IF;
    IF v_product.stock < v_qty THEN
      RAISE EXCEPTION 'insufficient_stock: %', v_product.sku USING ERRCODE = '22023';
    END IF;
    v_unit_price := COALESCE(v_product.sale_price, v_product.price);
    v_subtotal := v_subtotal + (v_unit_price * v_qty);
  END LOOP;

  v_total := v_subtotal + v_delivery_fee;
  v_order_number := generate_order_number();

  INSERT INTO orders (
    order_number, customer_id, customer_name, customer_phone, customer_email,
    shipping_address, shipping_area, shipping_notes,
    subtotal, delivery_fee, total,
    payment_method, payment_status, status,
    is_manual_order, created_by_admin_id, created_by_admin_name, admin_notes
  ) VALUES (
    v_order_number,
    NULL,
    v_name,
    v_phone,
    NULLIF(v_email, ''),
    trim(p_payload->>'shipping_address'),
    COALESCE(NULLIF(trim(p_payload->>'shipping_area_label'), ''), v_area_slug),
    NULLIF(trim(p_payload->>'shipping_notes'), ''),
    v_subtotal,
    v_delivery_fee,
    v_total,
    COALESCE(NULLIF(trim(p_payload->>'payment_method'), ''), 'cod'),
    COALESCE(NULLIF(trim(p_payload->>'payment_status'), ''), 'pending'),
    COALESCE(NULLIF(trim(p_payload->>'status'), ''), 'confirmed'),
    true,
    v_admin.id,
    v_admin.name,
    NULLIF(trim(p_payload->>'admin_notes'), '')
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
      v_order_id, v_product.id, v_product.name, v_product.sku,
      v_qty, v_unit_price, v_line_total,
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
    'total', v_total,
    'createdBy', v_admin.name
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- Update order status: schedule purge for completed manual orders
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_order_status_admin(p_order_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order orders%ROWTYPE;
BEGIN
  PERFORM assert_admin_permission('update-orders');

  SELECT * INTO v_order FROM orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'order_not_found' USING ERRCODE = 'P0001';
  END IF;

  UPDATE orders
  SET
    status = p_status,
    updated_at = now(),
    completed_at = CASE
      WHEN p_status = 'delivered' AND v_order.is_manual_order THEN now()
      WHEN p_status IN ('cancelled', 'refunded') THEN NULL
      ELSE completed_at
    END,
    purge_after = CASE
      WHEN p_status = 'delivered' AND v_order.is_manual_order THEN now() + interval '30 days'
      WHEN p_status IN ('cancelled', 'refunded') THEN NULL
      ELSE purge_after
    END
  WHERE id = p_order_id;

  PERFORM purge_expired_manual_orders();
END;
$$;

-- ---------------------------------------------------------------------------
-- List orders with manual order metadata
-- ---------------------------------------------------------------------------
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
      SELECT
        o.id, o.order_number, o.customer_name, o.customer_phone, o.customer_email,
        o.shipping_address, o.shipping_area, o.shipping_notes, o.subtotal, o.delivery_fee,
        o.total, o.payment_method, o.payment_status, o.payment_transaction_id, o.status,
        o.admin_notes, o.created_at, o.updated_at,
        o.is_manual_order,
        o.created_by_admin_id,
        o.created_by_admin_name,
        o.completed_at,
        o.purge_after,
        (SELECT COALESCE(json_agg(json_build_object(
          'id', oi.id, 'product_id', oi.product_id, 'product_name', oi.product_name,
          'product_sku', oi.product_sku, 'quantity', oi.quantity, 'unit_price', oi.unit_price,
          'total_price', oi.total_price, 'selected_size', oi.selected_size, 'selected_color', oi.selected_color
        )), '[]'::json) FROM order_items oi WHERE oi.order_id = o.id) AS items
      FROM orders o
      WHERE (p_search IS NULL OR p_search = '' OR
        o.order_number ILIKE '%' || p_search || '%' OR
        o.customer_name ILIKE '%' || p_search || '%' OR
        o.customer_phone ILIKE '%' || p_search || '%' OR
        o.customer_email ILIKE '%' || p_search || '%' OR
        o.created_by_admin_name ILIKE '%' || p_search || '%')
        AND (p_status IS NULL OR p_status = 'all' OR o.status = p_status)
        AND (p_payment_status IS NULL OR p_payment_status = 'all' OR o.payment_status = p_payment_status)
      ORDER BY o.created_at DESC
      LIMIT p_limit
    ) t
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- Enhanced customer list for owner outreach
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION list_customers_admin(
  p_search text DEFAULT NULL,
  p_sort text DEFAULT 'spent'
)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM assert_admin_permission('view-customers');

  RETURN COALESCE((
    SELECT json_agg(row_to_json(c))
    FROM (
      SELECT
        id,
        name,
        email,
        phone,
        address,
        total_orders AS orders,
        total_spent AS "totalSpent",
        created_at AS "createdAt"
      FROM customers
      WHERE p_search IS NULL OR p_search = '' OR
        name ILIKE '%' || p_search || '%' OR
        email ILIKE '%' || p_search || '%' OR
        phone ILIKE '%' || p_search || '%'
      ORDER BY
        CASE WHEN p_sort = 'spent' THEN total_spent END DESC NULLS LAST,
        CASE WHEN p_sort = 'orders' THEN total_orders END DESC NULLS LAST,
        CASE WHEN p_sort = 'newest' THEN created_at END DESC NULLS LAST,
        CASE WHEN p_sort = 'name' THEN name END ASC NULLS LAST
    ) c
  ), '[]'::json);
END;
$$;

-- ---------------------------------------------------------------------------
-- Customer notifications
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION send_customer_notification_admin(p_payload jsonb)
RETURNS json
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin admin_users%ROWTYPE;
  v_customer_id uuid;
  v_email text;
  v_name text;
  v_title text;
  v_body text;
  v_type text;
  v_coupon text;
  v_id uuid;
BEGIN
  PERFORM assert_admin_permission('send-customer-notifications');
  v_admin := get_active_admin_row();

  v_customer_id := NULLIF(trim(p_payload->>'customer_id'), '')::uuid;
  v_email := lower(trim(p_payload->>'recipient_email'));
  v_name := trim(COALESCE(p_payload->>'recipient_name', ''));
  v_title := trim(p_payload->>'title');
  v_body := trim(p_payload->>'body');
  v_type := COALESCE(NULLIF(trim(p_payload->>'notification_type'), ''), 'general');
  v_coupon := NULLIF(trim(p_payload->>'coupon_code'), '');

  IF v_customer_id IS NOT NULL THEN
    SELECT id, lower(trim(email)), name
    INTO v_customer_id, v_email, v_name
    FROM customers WHERE id = v_customer_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'customer_not_found' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  IF v_email IS NULL OR v_email = '' THEN
    RAISE EXCEPTION 'email_required' USING ERRCODE = '22023';
  END IF;
  IF length(v_title) < 2 OR length(v_title) > 200 THEN
    RAISE EXCEPTION 'invalid_title' USING ERRCODE = '22023';
  END IF;
  IF length(v_body) < 2 OR length(v_body) > 5000 THEN
    RAISE EXCEPTION 'invalid_body' USING ERRCODE = '22023';
  END IF;

  IF v_customer_id IS NULL THEN
    SELECT id, name INTO v_customer_id, v_name
    FROM customers WHERE lower(email) = v_email LIMIT 1;
  END IF;

  INSERT INTO customer_notifications (
    customer_id, recipient_email, recipient_name, title, body,
    notification_type, coupon_code, sent_by_admin_id, sent_by_admin_name
  ) VALUES (
    v_customer_id, v_email, NULLIF(v_name, ''), v_title, v_body,
    v_type, v_coupon, v_admin.id, v_admin.name
  ) RETURNING id INTO v_id;

  RETURN json_build_object(
    'id', v_id,
    'recipientEmail', v_email,
    'recipientName', v_name,
    'title', v_title,
    'couponCode', v_coupon
  );
END;
$$;

CREATE OR REPLACE FUNCTION mark_notification_email_sent(p_notification_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE customer_notifications
  SET email_sent = true, email_sent_at = now()
  WHERE id = p_notification_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_my_customer_notifications(p_limit integer DEFAULT 50)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN '[]'::json;
  END IF;

  v_email := lower(trim(COALESCE(auth.jwt() ->> 'email', '')));

  RETURN COALESCE((
    SELECT json_agg(row_to_json(n) ORDER BY n."createdAt" DESC)
    FROM (
      SELECT
        cn.id,
        cn.title,
        cn.body,
        cn.notification_type AS "notificationType",
        cn.coupon_code AS "couponCode",
        cn.is_read AS "isRead",
        cn.email_sent AS "emailSent",
        cn.sent_by_admin_name AS "sentBy",
        cn.created_at AS "createdAt"
      FROM customer_notifications cn
      WHERE cn.customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
         OR (v_email <> '' AND lower(cn.recipient_email) = v_email)
      ORDER BY cn.created_at DESC
      LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 50), 100))
    ) n
  ), '[]'::json);
END;
$$;

CREATE OR REPLACE FUNCTION mark_customer_notification_read(p_notification_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication_required' USING ERRCODE = '42501';
  END IF;

  v_email := lower(trim(COALESCE(auth.jwt() ->> 'email', '')));

  UPDATE customer_notifications
  SET is_read = true
  WHERE id = p_notification_id
    AND (
      customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
      OR (v_email <> '' AND lower(recipient_email) = v_email)
    );
END;
$$;

CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM customer_notifications cn
  WHERE cn.is_read = false
    AND (
      cn.customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
      OR lower(cn.recipient_email) = lower(trim(COALESCE(auth.jwt() ->> 'email', '')))
    );
$$;

GRANT EXECUTE ON FUNCTION create_order_admin(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION purge_expired_manual_orders() TO authenticated;
GRANT EXECUTE ON FUNCTION send_customer_notification_admin(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_email_sent(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_my_customer_notifications(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_customer_notification_read(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notification_count() TO authenticated;

REVOKE EXECUTE ON FUNCTION create_order_admin(jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION send_customer_notification_admin(jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION get_my_customer_notifications(integer) FROM anon;
REVOKE EXECUTE ON FUNCTION mark_customer_notification_read(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION get_unread_notification_count() FROM anon;
