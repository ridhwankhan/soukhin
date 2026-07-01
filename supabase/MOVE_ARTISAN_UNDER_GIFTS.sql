-- Show Artisan Luxe & related collections UNDER Gifts (header + /category/gifts)
-- NOTE: Run SETUP_GIFTS_CATEGORIES_COMPLETE.sql first if collections don't exist yet.

UPDATE categories c
SET parent_id = g.id, updated_at = now()
FROM categories g
WHERE g.slug = 'gifts'
  AND c.slug IN ('3d-prints', 'bedsheets', '2d-art', 'dp-covers', '3d-models');

-- Verify tree under Gifts
SELECT
  g.name AS gifts_section,
  child.name AS collection,
  sub.name AS subcategory
FROM categories g
LEFT JOIN categories child ON child.parent_id = g.id
LEFT JOIN categories sub ON sub.parent_id = child.id
WHERE g.slug = 'gifts'
ORDER BY child.display_order, sub.display_order;
