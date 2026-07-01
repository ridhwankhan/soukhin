-- Optional phone/address, social link, potential customers leads

ALTER TABLE orders
  ALTER COLUMN customer_phone DROP NOT NULL,
  ALTER COLUMN shipping_address DROP NOT NULL;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS social_link text;

-- ---------------------------------------------------------------------------
-- Potential customers (interest leads — not orders)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS potential_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  social_link text,
  notes text,
  interest_summary text,
  created_by_admin_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  created_by_admin_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  purge_after timestamptz NOT NULL DEFAULT (now() + interval '10 days')
);

CREATE INDEX IF NOT EXISTS potential_customers_purge_idx
  ON potential_customers (purge_after);

ALTER TABLE potential_customers ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION purge_expired_potential_customers()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted integer;
BEGIN
  DELETE FROM potential_customers WHERE purge_after <= now();
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

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
  v_address text;
  v_social text;
  v_estimated text;
  v_labels text[];
BEGIN
  PERFORM assert_admin_permission('create-manual-orders');
  v_admin := get_active_admin_row();

  v_name := trim(p_payload->>'customer_name');
  v_phone := NULLIF(regexp_replace(trim(COALESCE(p_payload->>'customer_phone', '')), '\s+', '', 'g'), '');
  v_email := lower(trim(COALESCE(p_payload->>'customer_email', '')));
  v_address := NULLIF(trim(COALESCE(p_payload->>'shipping_address', '')), '');
  v_social := NULLIF(trim(COALESCE(p_payload->>'social_link', '')), '');

  IF length(v_name) < 2 OR length(v_name) > 120 THEN
    RAISE EXCEPTION 'invalid_name' USING ERRCODE = '22023';
  END IF;
  IF v_email <> '' AND v_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'invalid_email' USING ERRCODE = '22023';
  END IF;
  IF v_phone IS NOT NULL AND length(v_phone) > 0 AND length(v_phone) < 10 THEN
    RAISE EXCEPTION 'invalid_phone' USING ERRCODE = '22023';
  END IF;

  v_area_slug := COALESCE(NULLIF(trim(p_payload->>'shipping_area_slug'), ''), 'inside-dhaka');
  v_delivery_fee := resolve_delivery_fee(v_area_slug);
  IF v_delivery_fee IS NULL THEN
    RAISE EXCEPTION 'invalid_shipping_area' USING ERRCODE = '22023';
  END IF;

  v_estimated := NULLIF(trim(p_payload->>'estimated_delivery'), '');
  IF v_estimated IS NULL THEN
    v_estimated := resolve_estimated_delivery(v_area_slug);
  END IF;

  SELECT COALESCE(array_agg(trim(l)), '{}')
  INTO v_labels
  FROM jsonb_array_elements_text(COALESCE(p_payload->'order_labels', '[]'::jsonb)) AS l
  WHERE trim(l) <> '';

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
    is_manual_order, created_by_admin_id, created_by_admin_name, admin_notes,
    estimated_delivery, order_labels, social_link
  ) VALUES (
    v_order_number,
    NULL,
    v_name,
    v_phone,
    NULLIF(v_email, ''),
    COALESCE(v_address, 'Address not provided'),
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
    NULLIF(trim(p_payload->>'admin_notes'), ''),
    v_estimated,
    v_labels,
    v_social
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

CREATE OR REPLACE FUNCTION update_order_details_admin(p_order_id uuid, p_payload jsonb)
RETURNS json
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row orders%ROWTYPE;
  v_labels text[];
BEGIN
  PERFORM assert_admin_permission('update-order-details');

  SELECT COALESCE(array_agg(trim(l)), '{}')
  INTO v_labels
  FROM jsonb_array_elements_text(COALESCE(p_payload->'order_labels', '[]'::jsonb)) AS l
  WHERE trim(l) <> '';

  UPDATE orders
  SET
    estimated_delivery = COALESCE(NULLIF(trim(p_payload->>'estimated_delivery'), ''), estimated_delivery),
    order_labels = CASE WHEN p_payload ? 'order_labels' THEN v_labels ELSE order_labels END,
    shipping_notes = CASE WHEN p_payload ? 'shipping_notes' THEN NULLIF(trim(p_payload->>'shipping_notes'), '') ELSE shipping_notes END,
    admin_notes = CASE WHEN p_payload ? 'admin_notes' THEN NULLIF(trim(p_payload->>'admin_notes'), '') ELSE admin_notes END,
    social_link = CASE WHEN p_payload ? 'social_link' THEN NULLIF(trim(p_payload->>'social_link'), '') ELSE social_link END,
    customer_phone = CASE WHEN p_payload ? 'customer_phone' THEN NULLIF(regexp_replace(trim(p_payload->>'customer_phone'), '\s+', '', 'g'), '') ELSE customer_phone END,
    shipping_address = CASE WHEN p_payload ? 'shipping_address' THEN NULLIF(trim(p_payload->>'shipping_address'), '') ELSE shipping_address END,
    updated_at = now()
  WHERE id = p_order_id
  RETURNING * INTO v_row;

  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'order_not_found' USING ERRCODE = 'P0001';
  END IF;

  RETURN json_build_object('id', v_row.id);
END;
$$;

CREATE OR REPLACE FUNCTION list_orders_admin(
  p_search text DEFAULT NULL,
  p_status text DEFAULT NULL,
  p_payment_status text DEFAULT NULL,
  p_limit integer DEFAULT 100
)
RETURNS json
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM assert_admin_permission('view-orders');
  PERFORM purge_expired_potential_customers();
  RETURN (
    SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
    FROM (
      SELECT
        o.id, o.order_number, o.customer_name, o.customer_phone, o.customer_email,
        o.shipping_address, o.shipping_area, o.shipping_notes, o.subtotal, o.delivery_fee,
        o.total, o.payment_method, o.payment_status, o.payment_transaction_id, o.status,
        o.admin_notes, o.created_at, o.updated_at,
        o.is_manual_order, o.created_by_admin_id, o.created_by_admin_name,
        o.completed_at, o.purge_after, o.estimated_delivery, o.order_labels, o.social_link,
        (SELECT COALESCE(json_agg(json_build_object(
          'id', oi.id, 'product_id', oi.product_id, 'product_name', oi.product_name,
          'product_sku', oi.product_sku, 'quantity', oi.quantity, 'unit_price', oi.unit_price,
          'total_price', oi.total_price, 'selected_size', oi.selected_size, 'selected_color', oi.selected_color
        )), '[]'::json) FROM order_items oi WHERE oi.order_id = o.id) AS items
      FROM orders o
      WHERE (p_search IS NULL OR p_search = '' OR
        o.order_number ILIKE '%' || p_search || '%' OR
        o.customer_name ILIKE '%' || p_search || '%' OR
        COALESCE(o.customer_phone, '') ILIKE '%' || p_search || '%' OR
        COALESCE(o.customer_email, '') ILIKE '%' || p_search || '%' OR
        COALESCE(o.created_by_admin_name, '') ILIKE '%' || p_search || '%')
        AND (p_status IS NULL OR p_status = 'all' OR o.status = p_status)
        AND (p_payment_status IS NULL OR p_payment_status = 'all' OR o.payment_status = p_payment_status)
      ORDER BY o.created_at DESC
      LIMIT p_limit
    ) t
  );
END;
$$;

CREATE OR REPLACE FUNCTION create_potential_customer_admin(p_payload jsonb)
RETURNS json
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin admin_users%ROWTYPE;
  v_id uuid;
  v_name text;
  v_phone text;
  v_email text;
  v_social text;
BEGIN
  PERFORM assert_admin_permission('create-manual-orders');
  PERFORM purge_expired_potential_customers();
  v_admin := get_active_admin_row();

  v_name := trim(p_payload->>'name');
  v_phone := NULLIF(regexp_replace(trim(COALESCE(p_payload->>'phone', '')), '\s+', '', 'g'), '');
  v_email := lower(trim(COALESCE(p_payload->>'email', '')));
  v_social := NULLIF(trim(COALESCE(p_payload->>'social_link', '')), '');

  IF length(v_name) < 2 OR length(v_name) > 120 THEN
    RAISE EXCEPTION 'invalid_name' USING ERRCODE = '22023';
  END IF;
  IF v_email <> '' AND v_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'invalid_email' USING ERRCODE = '22023';
  END IF;
  IF v_phone IS NOT NULL AND length(v_phone) > 0 AND length(v_phone) < 10 THEN
    RAISE EXCEPTION 'invalid_phone' USING ERRCODE = '22023';
  END IF;
  IF COALESCE(v_phone, v_email, v_social) IS NULL THEN
    RAISE EXCEPTION 'contact_required' USING ERRCODE = '22023';
  END IF;

  INSERT INTO potential_customers (
    name, phone, email, social_link, notes, interest_summary,
    created_by_admin_id, created_by_admin_name, purge_after
  ) VALUES (
    v_name,
    v_phone,
    NULLIF(v_email, ''),
    v_social,
    NULLIF(trim(p_payload->>'notes'), ''),
    NULLIF(trim(p_payload->>'interest_summary'), ''),
    v_admin.id,
    v_admin.name,
    now() + interval '10 days'
  ) RETURNING id INTO v_id;

  RETURN json_build_object('id', v_id, 'name', v_name);
END;
$$;

CREATE OR REPLACE FUNCTION list_potential_customers_admin(p_search text DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM assert_admin_permission('view-orders');
  PERFORM purge_expired_potential_customers();

  RETURN COALESCE((
    SELECT json_agg(row_to_json(r) ORDER BY r."createdAt" DESC)
    FROM (
      SELECT
        id,
        name,
        phone,
        email,
        social_link AS "socialLink",
        notes,
        interest_summary AS "interestSummary",
        created_by_admin_name AS "createdByAdminName",
        created_at AS "createdAt",
        purge_after AS "purgeAfter"
      FROM potential_customers
      WHERE purge_after > now()
        AND (
          p_search IS NULL OR p_search = '' OR
          name ILIKE '%' || p_search || '%' OR
          COALESCE(phone, '') ILIKE '%' || p_search || '%' OR
          COALESCE(email, '') ILIKE '%' || p_search || '%' OR
          COALESCE(social_link, '') ILIKE '%' || p_search || '%' OR
          COALESCE(interest_summary, '') ILIKE '%' || p_search || '%'
        )
    ) r
  ), '[]'::json);
END;
$$;

CREATE OR REPLACE FUNCTION delete_potential_customer_admin(p_id uuid)
RETURNS void
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM assert_admin_permission('create-manual-orders');
  DELETE FROM potential_customers WHERE id = p_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'not_found' USING ERRCODE = 'P0001';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION create_potential_customer_admin(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION list_potential_customers_admin(text) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_potential_customer_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION purge_expired_potential_customers() TO authenticated;

REVOKE EXECUTE ON FUNCTION create_potential_customer_admin(jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION list_potential_customers_admin(text) FROM anon;
REVOKE EXECUTE ON FUNCTION delete_potential_customer_admin(uuid) FROM anon;
