import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const files = [
  '20260625181910_001_initial_schema.sql',
  '20260625183059_003_restructure_categories.sql',
  '20260625182007_002_seed_data.sql',
  '20260626120000_004_customer_auth.sql',
  '20260626140000_005_orders_analytics_notifications.sql',
  '20260626160000_006_products_storage.sql',
  '20260626180000_007_admin_security.sql',
  '20260626200000_008_production_hardening.sql',
  '20260626220000_009_staff_management.sql',
];

let sql = `-- ============================================================
-- SOUKHIN — ONE-CLICK DATABASE SETUP
-- 1. Open Supabase → SQL Editor → New query
-- 2. Paste THIS ENTIRE file
-- 3. Click RUN (green button)
-- ============================================================

`;

for (const file of files) {
  sql += `\n-- >>>>> ${file} <<<<<\n\n`;
  sql += readFileSync(join(root, 'supabase/migrations', file), 'utf8');
  sql += '\n';
}

sql += `
-- >>>>> OWNER ACCOUNT (change email if needed) <<<<<
INSERT INTO admin_users (email, name, role, is_active)
VALUES ('shoukhin.lifestyle.bd@gmail.com', 'Soukhin Owner', 'owner', true)
ON CONFLICT (email) DO UPDATE SET role = 'owner', is_active = true;
`;

const outPath = join(root, 'supabase/ONE_CLICK_DATABASE_SETUP.sql');
writeFileSync(outPath, sql, 'utf8');
console.log('Wrote', outPath, '(' + Math.round(sql.length / 1024) + ' KB)');
