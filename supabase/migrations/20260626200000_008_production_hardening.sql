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
