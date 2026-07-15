-- Fix broken list_categories_admin (column alias bug: display_order vs displayOrder)
-- Run in Supabase SQL Editor once.

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
    SELECT COALESCE(
      json_agg(
        row_to_json(c)
        ORDER BY c."displayOrder", c.name
      ),
      '[]'::json
    )
    FROM (
      SELECT
        cat.id,
        cat.slug,
        cat.name,
        cat.name_bn AS "nameBn",
        cat.description,
        cat.image,
        cat.display_order AS "displayOrder",
        cat.parent_id AS "parentId",
        cat.is_active AS "isActive",
        p.slug AS "parentSlug",
        (
          SELECT COUNT(*)::integer
          FROM products pr
          WHERE pr.category_id = cat.id
        ) AS "productCount"
      FROM categories cat
      LEFT JOIN categories p ON p.id = cat.parent_id
    ) c
  );
END;
$$;

GRANT EXECUTE ON FUNCTION list_categories_admin() TO authenticated;

-- Confirm
SELECT jsonb_array_length(list_categories_admin()::jsonb) AS category_count;
