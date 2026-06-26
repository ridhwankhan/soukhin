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
