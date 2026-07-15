-- Multi-role staff, category admin CRUD, site settings RPCs, export for Google Sheets

ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS additional_roles text[] NOT NULL DEFAULT '{}';

-- Single-role permission check (immutable helper)
CREATE OR REPLACE FUNCTION role_has_permission(p_role text, p_permission text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_permission
    WHEN 'view-dashboard' THEN p_role IN ('owner', 'admin', 'moderator', 'order-manager', 'inventory-manager')
    WHEN 'view-orders' THEN p_role IN ('owner', 'admin', 'moderator', 'order-manager', 'inventory-manager')
    WHEN 'update-orders' THEN p_role IN ('owner', 'admin', 'order-manager')
    WHEN 'create-manual-orders' THEN p_role IN ('owner', 'admin', 'moderator', 'order-manager', 'inventory-manager')
    WHEN 'update-order-details' THEN p_role IN ('owner', 'admin', 'moderator', 'order-manager', 'inventory-manager')
    WHEN 'view-products' THEN p_role IN ('owner', 'admin', 'moderator', 'inventory-manager')
    WHEN 'manage-products' THEN p_role IN ('owner', 'admin', 'inventory-manager')
    WHEN 'view-inventory' THEN p_role IN ('owner', 'admin', 'moderator', 'inventory-manager')
    WHEN 'manage-inventory' THEN p_role IN ('owner', 'admin', 'inventory-manager')
    WHEN 'view-customers' THEN p_role IN ('owner', 'admin', 'moderator', 'order-manager')
    WHEN 'manage-customers' THEN p_role IN ('owner', 'admin')
    WHEN 'send-customer-notifications' THEN p_role IN ('owner', 'admin')
    WHEN 'view-reviews' THEN p_role IN ('owner', 'admin', 'moderator')
    WHEN 'manage-reviews' THEN p_role IN ('owner', 'admin', 'moderator')
    WHEN 'view-coupons' THEN p_role IN ('owner', 'admin', 'moderator', 'order-manager', 'inventory-manager')
    WHEN 'manage-coupons' THEN p_role IN ('owner', 'admin', 'moderator', 'order-manager', 'inventory-manager')
    WHEN 'view-content' THEN p_role IN ('owner', 'admin', 'moderator')
    WHEN 'manage-content' THEN p_role IN ('owner', 'admin', 'moderator')
    WHEN 'view-settings' THEN p_role IN ('owner', 'admin')
    WHEN 'manage-settings' THEN p_role IN ('owner', 'admin')
    WHEN 'view-users' THEN p_role IN ('owner', 'admin')
    WHEN 'manage-users' THEN p_role = 'owner'
    WHEN 'manage-staff' THEN p_role IN ('owner', 'admin')
    WHEN 'view-audit-log' THEN p_role IN ('owner', 'admin')
    ELSE false
  END;
$$;

CREATE OR REPLACE FUNCTION admin_has_permission(p_permission text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin admin_users%ROWTYPE;
  v_role text;
  v_roles text[];
BEGIN
  v_admin := get_active_admin_row();
  IF v_admin.id IS NULL THEN
    RETURN false;
  END IF;

  v_roles := ARRAY[replace(v_admin.role, '_', '-')]
    || COALESCE(
      (SELECT array_agg(replace(r, '_', '-')) FROM unnest(v_admin.additional_roles) AS r),
      '{}'
    );

  FOREACH v_role IN ARRAY v_roles LOOP
    IF role_has_permission(v_role, p_permission) THEN
      RETURN true;
    END IF;
  END LOOP;

  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION get_my_admin_profile()
RETURNS json
LANGUAGE plpgsql
VOLATILE
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
    'additionalRoles', COALESCE(
      (SELECT json_agg(replace(r, '_', '-')) FROM unnest(v_admin.additional_roles) AS r),
      '[]'::json
    ),
    'avatar', v_admin.avatar,
    'isActive', v_admin.is_active,
    'createdAt', v_admin.created_at,
    'lastLogin', now()
  );
END;
$$;

CREATE OR REPLACE FUNCTION list_staff_members()
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT admin_has_permission('view-users') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = '42501';
  END IF;

  RETURN (
    SELECT COALESCE(json_agg(row_to_json(s) ORDER BY s.created_at), '[]'::json)
    FROM (
      SELECT
        id, email, name,
        replace(role, '_', '-') AS role,
        COALESCE(
          (SELECT json_agg(replace(r, '_', '-')) FROM unnest(additional_roles) AS r),
          '[]'::json
        ) AS "additionalRoles",
        avatar, is_active AS "isActive",
        auth_user_id IS NOT NULL AS "isLinked",
        last_login AS "lastLogin",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM admin_users
      ORDER BY created_at
    ) s
  );
END;
$$;

CREATE OR REPLACE FUNCTION save_staff_member(p_payload jsonb)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_role text;
  v_id uuid;
  v_email text;
  v_name text;
  v_role text;
  v_additional text[];
  v_existing admin_users%ROWTYPE;
  v_result json;
  v_extra text;
BEGIN
  v_actor_role := get_actor_admin_role();

  IF NOT admin_has_permission('manage-staff') AND NOT admin_has_permission('manage-users') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = '42501';
  END IF;

  v_email := lower(trim(p_payload->>'email'));
  v_name := trim(p_payload->>'name');
  v_role := replace(trim(p_payload->>'role'), '_', '-');

  SELECT COALESCE(array_agg(replace(trim(x), '_', '-')), '{}')
  INTO v_additional
  FROM jsonb_array_elements_text(COALESCE(p_payload->'additionalRoles', '[]'::jsonb)) AS t(x)
  WHERE trim(x) <> '' AND replace(trim(x), '_', '-') <> v_role;

  IF v_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'invalid_email' USING ERRCODE = '22023';
  END IF;
  IF length(v_name) < 2 OR length(v_name) > 120 THEN
    RAISE EXCEPTION 'invalid_name' USING ERRCODE = '22023';
  END IF;
  IF NOT can_assign_staff_role(v_actor_role, v_role) THEN
    RAISE EXCEPTION 'cannot_assign_role' USING ERRCODE = '42501';
  END IF;

  FOREACH v_extra IN ARRAY v_additional LOOP
    IF NOT can_assign_staff_role(v_actor_role, v_extra) THEN
      RAISE EXCEPTION 'cannot_assign_role' USING ERRCODE = '42501';
    END IF;
  END LOOP;

  v_id := NULLIF(p_payload->>'id', '')::uuid;

  IF v_id IS NOT NULL THEN
    SELECT * INTO v_existing FROM admin_users WHERE id = v_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'staff_not_found' USING ERRCODE = '22023';
    END IF;

    IF replace(v_existing.role, '_', '-') = 'owner' AND v_actor_role <> 'owner' THEN
      RAISE EXCEPTION 'cannot_modify_owner' USING ERRCODE = '42501';
    END IF;
    IF replace(v_existing.role, '_', '-') = 'admin' AND v_actor_role <> 'owner' THEN
      RAISE EXCEPTION 'cannot_modify_admin' USING ERRCODE = '42501';
    END IF;

    IF v_existing.auth_user_id = auth.uid() AND v_role <> replace(v_existing.role, '_', '-') THEN
      RAISE EXCEPTION 'cannot_change_own_role' USING ERRCODE = '42501';
    END IF;

    UPDATE admin_users SET
      name = v_name,
      role = v_role,
      additional_roles = v_additional,
      updated_at = now()
    WHERE id = v_id;
  ELSE
    IF EXISTS (SELECT 1 FROM admin_users WHERE lower(email) = v_email) THEN
      RAISE EXCEPTION 'email_already_staff' USING ERRCODE = '22023';
    END IF;

    INSERT INTO admin_users (email, name, role, additional_roles, is_active)
    VALUES (v_email, v_name, v_role, v_additional, true)
    RETURNING id INTO v_id;
  END IF;

  UPDATE admin_users au
  SET auth_user_id = u.id, updated_at = now()
  FROM auth.users u
  WHERE au.id = v_id
    AND au.auth_user_id IS NULL
    AND lower(trim(u.email)) = v_email;

  SELECT row_to_json(s) INTO v_result
  FROM (
    SELECT id, email, name, replace(role, '_', '-') AS role,
      COALESCE(
        (SELECT json_agg(replace(r, '_', '-')) FROM unnest(additional_roles) AS r),
        '[]'::json
      ) AS "additionalRoles",
      is_active AS "isActive", auth_user_id IS NOT NULL AS "isLinked",
      last_login AS "lastLogin", created_at AS "createdAt"
    FROM admin_users WHERE id = v_id
  ) s;

  RETURN v_result;
END;
$$;

-- Site settings (admin read/write)
CREATE OR REPLACE FUNCTION get_site_settings_admin()
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT admin_has_permission('view-settings') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = '42501';
  END IF;

  RETURN (
    SELECT COALESCE(json_object_agg(setting_key, setting_value), '{}'::json)
    FROM site_settings
  );
END;
$$;

CREATE OR REPLACE FUNCTION upsert_site_setting_admin(p_key text, p_value jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT admin_has_permission('manage-settings') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = '42501';
  END IF;

  INSERT INTO site_settings (setting_key, setting_value, description, updated_at)
  VALUES (p_key, p_value, p_key, now())
  ON CONFLICT (setting_key) DO UPDATE
  SET setting_value = EXCLUDED.setting_value, updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION get_public_site_settings()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(json_object_agg(setting_key, setting_value), '{}'::json)
  FROM site_settings
  WHERE setting_key IN ('hero', 'announcement', 'announcements', 'banners', 'contact', 'delivery', 'currency');
$$;

GRANT EXECUTE ON FUNCTION get_public_site_settings() TO anon, authenticated;

-- Category admin CRUD
CREATE OR REPLACE FUNCTION save_category_admin(p_payload jsonb)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_slug text;
  v_parent_id uuid;
  v_result json;
BEGIN
  IF NOT admin_has_permission('manage-products') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = '42501';
  END IF;

  v_slug := lower(trim(p_payload->>'slug'));
  v_id := NULLIF(p_payload->>'id', '')::uuid;
  v_parent_id := NULLIF(p_payload->>'parentId', '')::uuid;

  IF v_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' THEN
    RAISE EXCEPTION 'invalid_slug' USING ERRCODE = '22023';
  END IF;

  IF v_id IS NOT NULL THEN
    UPDATE categories SET
      name = trim(p_payload->>'name'),
      name_bn = NULLIF(trim(p_payload->>'nameBn'), ''),
      description = NULLIF(trim(p_payload->>'description'), ''),
      image = NULLIF(trim(p_payload->>'image'), ''),
      display_order = COALESCE((p_payload->>'displayOrder')::integer, display_order),
      parent_id = v_parent_id,
      is_active = COALESCE((p_payload->>'isActive')::boolean, is_active),
      updated_at = now()
    WHERE id = v_id;
  ELSE
    INSERT INTO categories (slug, name, name_bn, description, image, display_order, parent_id, is_active)
    VALUES (
      v_slug,
      trim(p_payload->>'name'),
      NULLIF(trim(p_payload->>'nameBn'), ''),
      NULLIF(trim(p_payload->>'description'), ''),
      NULLIF(trim(p_payload->>'image'), ''),
      COALESCE((p_payload->>'displayOrder')::integer, 0),
      v_parent_id,
      COALESCE((p_payload->>'isActive')::boolean, true)
    )
    RETURNING id INTO v_id;
  END IF;

  SELECT row_to_json(c) INTO v_result
  FROM (
    SELECT id, slug, name, name_bn AS "nameBn", description, image,
      display_order AS "displayOrder", parent_id AS "parentId", is_active AS "isActive"
    FROM categories WHERE id = v_id
  ) c;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION list_categories_admin()
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT admin_has_permission('view-products') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = '42501';
  END IF;

  RETURN (
    SELECT COALESCE(json_agg(row_to_json(c) ORDER BY c.display_order, c.name), '[]'::json)
    FROM (
      SELECT
        cat.id, cat.slug, cat.name, cat.name_bn AS "nameBn", cat.description, cat.image,
        cat.display_order AS "displayOrder", cat.parent_id AS "parentId",
        cat.is_active AS "isActive",
        p.slug AS "parentSlug",
        (SELECT COUNT(*)::integer FROM products pr WHERE pr.category_id = cat.id) AS "productCount"
      FROM categories cat
      LEFT JOIN categories p ON p.id = cat.parent_id
      ORDER BY cat.display_order, cat.name
    ) c
  );
END;
$$;

-- Export payload for Google Sheets sync (service role / edge function)
CREATE OR REPLACE FUNCTION export_sync_data_admin()
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT admin_has_permission('manage-settings') AND NOT admin_has_permission('manage-products') THEN
    RAISE EXCEPTION 'permission_denied' USING ERRCODE = '42501';
  END IF;

  RETURN json_build_object(
    'products', (
      SELECT COALESCE(json_agg(row_to_json(p)), '[]'::json)
      FROM (
        SELECT pr.sku, pr.name, pr.name_bn AS "nameBn", c.slug AS category,
          pr.price, pr.sale_price AS "salePrice", pr.stock, pr.is_active AS "isActive",
          pr.is_featured AS "isFeatured", pr.updated_at AS "updatedAt"
        FROM products pr
        JOIN categories c ON c.id = pr.category_id
        ORDER BY pr.updated_at DESC
      ) p
    ),
    'orders', (
      SELECT COALESCE(json_agg(row_to_json(o)), '[]'::json)
      FROM (
        SELECT order_number AS "orderNumber", customer_name AS "customerName",
          customer_phone AS "phone", total, status, payment_status AS "paymentStatus",
          created_at AS "createdAt"
        FROM orders
        ORDER BY created_at DESC
        LIMIT 500
      ) o
    ),
    'categories', (
      SELECT COALESCE(json_agg(row_to_json(c)), '[]'::json)
      FROM (
        SELECT slug, name, name_bn AS "nameBn", is_active AS "isActive", display_order AS "displayOrder"
        FROM categories ORDER BY display_order
      ) c
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_site_settings_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_site_setting_admin(text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION save_category_admin(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION list_categories_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION export_sync_data_admin() TO authenticated;
