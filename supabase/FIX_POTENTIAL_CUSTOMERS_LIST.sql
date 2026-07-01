-- Fix: list_potential_customers_admin was STABLE but called DELETE (read-only transaction error)
-- Run in Supabase SQL Editor → RUN

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

-- list_orders_admin had the same bug (purge inside STABLE)
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
