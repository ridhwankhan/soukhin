-- Admin data RPCs + extend coupon permissions to manager roles

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
      RETURN v_role IN ('owner', 'admin', 'moderator', 'order-manager');
    WHEN 'manage-customers' THEN
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

CREATE OR REPLACE FUNCTION update_product_stock_admin(p_product_id uuid, p_stock integer)
RETURNS json
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row products%ROWTYPE;
BEGIN
  PERFORM assert_admin_permission('manage-inventory');

  IF p_stock < 0 THEN
    RAISE EXCEPTION 'invalid_stock' USING ERRCODE = 'P0001';
  END IF;

  UPDATE products
  SET stock = p_stock, updated_at = now()
  WHERE id = p_product_id
  RETURNING * INTO v_row;

  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'product_not_found' USING ERRCODE = 'P0001';
  END IF;

  RETURN json_build_object('id', v_row.id, 'stock', v_row.stock);
END;
$$;

CREATE OR REPLACE FUNCTION list_coupons_admin()
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM assert_admin_permission('view-coupons');

  RETURN COALESCE((
    SELECT json_agg(row_to_json(c) ORDER BY c.created_at DESC)
    FROM (
      SELECT
        id,
        code,
        type,
        value,
        min_order_amount AS "minOrderAmount",
        max_uses AS "maxUses",
        used_count AS "usedCount",
        valid_from AS "validFrom",
        valid_until AS "validUntil",
        is_active AS "isActive",
        created_at AS "createdAt"
      FROM coupons
    ) c
  ), '[]'::json);
END;
$$;

CREATE OR REPLACE FUNCTION upsert_coupon_admin(p_payload jsonb)
RETURNS json
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_row coupons%ROWTYPE;
BEGIN
  PERFORM assert_admin_permission('manage-coupons');

  v_id := NULLIF(p_payload->>'id', '')::uuid;

  IF v_id IS NULL THEN
    INSERT INTO coupons (
      code, type, value, min_order_amount, max_uses,
      valid_from, valid_until, is_active
    ) VALUES (
      upper(trim(p_payload->>'code')),
      p_payload->>'type',
      (p_payload->>'value')::integer,
      COALESCE((p_payload->>'minOrderAmount')::integer, 0),
      NULLIF(p_payload->>'maxUses', '')::integer,
      (p_payload->>'validFrom')::date,
      (p_payload->>'validUntil')::date,
      COALESCE((p_payload->>'isActive')::boolean, true)
    )
    RETURNING * INTO v_row;
  ELSE
    UPDATE coupons SET
      code = upper(trim(p_payload->>'code')),
      type = p_payload->>'type',
      value = (p_payload->>'value')::integer,
      min_order_amount = COALESCE((p_payload->>'minOrderAmount')::integer, 0),
      max_uses = NULLIF(p_payload->>'maxUses', '')::integer,
      valid_from = (p_payload->>'validFrom')::date,
      valid_until = (p_payload->>'validUntil')::date,
      is_active = COALESCE((p_payload->>'isActive')::boolean, is_active),
      updated_at = now()
    WHERE id = v_id
    RETURNING * INTO v_row;
  END IF;

  RETURN json_build_object(
    'id', v_row.id,
    'code', v_row.code,
    'type', v_row.type,
    'value', v_row.value,
    'minOrderAmount', v_row.min_order_amount,
    'maxUses', v_row.max_uses,
    'usedCount', v_row.used_count,
    'validFrom', v_row.valid_from,
    'validUntil', v_row.valid_until,
    'isActive', v_row.is_active,
    'createdAt', v_row.created_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION set_coupon_active_admin(p_coupon_id uuid, p_is_active boolean)
RETURNS json
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row coupons%ROWTYPE;
BEGIN
  PERFORM assert_admin_permission('manage-coupons');

  UPDATE coupons
  SET is_active = p_is_active, updated_at = now()
  WHERE id = p_coupon_id
  RETURNING * INTO v_row;

  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'coupon_not_found' USING ERRCODE = 'P0001';
  END IF;

  RETURN json_build_object('id', v_row.id, 'isActive', v_row.is_active);
END;
$$;

CREATE OR REPLACE FUNCTION list_customers_admin()
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM assert_admin_permission('view-customers');

  RETURN COALESCE((
    SELECT json_agg(row_to_json(c) ORDER BY c."createdAt" DESC)
    FROM (
      SELECT
        id,
        name,
        email,
        phone,
        total_orders AS orders,
        total_spent AS "totalSpent",
        created_at AS "createdAt"
      FROM customers
    ) c
  ), '[]'::json);
END;
$$;

CREATE OR REPLACE FUNCTION list_reviews_admin()
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM assert_admin_permission('view-reviews');

  RETURN COALESCE((
    SELECT json_agg(row_to_json(r) ORDER BY r."createdAt" DESC)
    FROM (
      SELECT
        rv.id,
        rv.product_id AS "productId",
        p.name AS "productName",
        rv.customer_id AS "customerId",
        rv.customer_name AS "customerName",
        rv.rating,
        rv.title,
        rv.comment,
        rv.is_approved AS "isApproved",
        rv.created_at AS "createdAt"
      FROM reviews rv
      LEFT JOIN products p ON p.id = rv.product_id
    ) r
  ), '[]'::json);
END;
$$;

CREATE OR REPLACE FUNCTION set_review_approved_admin(p_review_id uuid, p_approved boolean)
RETURNS void
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM assert_admin_permission('manage-reviews');

  UPDATE reviews
  SET is_approved = p_approved, updated_at = now()
  WHERE id = p_review_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'review_not_found' USING ERRCODE = 'P0001';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION delete_review_admin(p_review_id uuid)
RETURNS void
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM assert_admin_permission('manage-reviews');

  DELETE FROM reviews WHERE id = p_review_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'review_not_found' USING ERRCODE = 'P0001';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION list_audit_logs_admin(p_limit integer DEFAULT 100)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM assert_admin_permission('view-audit-log');

  RETURN COALESCE((
    SELECT json_agg(row_to_json(a) ORDER BY a."timestamp" DESC)
    FROM (
      SELECT
        id,
        user_name AS "userName",
        action,
        entity_type AS "entityType",
        entity_id AS "entityId",
        old_value AS "oldValue",
        new_value AS "newValue",
        created_at AS "timestamp"
      FROM audit_logs
      ORDER BY created_at DESC
      LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 100), 500))
    ) a
  ), '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION update_product_stock_admin(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION list_coupons_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_coupon_admin(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION set_coupon_active_admin(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION list_customers_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION list_reviews_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION set_review_approved_admin(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_review_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION list_audit_logs_admin(integer) TO authenticated;

REVOKE EXECUTE ON FUNCTION update_product_stock_admin(uuid, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION list_coupons_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION upsert_coupon_admin(jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION set_coupon_active_admin(uuid, boolean) FROM anon;
REVOKE EXECUTE ON FUNCTION list_customers_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION list_reviews_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION set_review_approved_admin(uuid, boolean) FROM anon;
REVOKE EXECUTE ON FUNCTION delete_review_admin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION list_audit_logs_admin(integer) FROM anon;
