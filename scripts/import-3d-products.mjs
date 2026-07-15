#!/usr/bin/env node
/**
 * Bulk-import 3D product images from E:\BUSINESS products\3D products
 * into Supabase (storage + products table).
 *
 * Setup (pick one auth method):
 *   A) SUPABASE_SERVICE_ROLE_KEY in .env  (fastest — Dashboard → Settings → API)
 *   B) IMPORT_STAFF_EMAIL + IMPORT_STAFF_PASSWORD (staff with manage-products)
 *
 * Usage:
 *   node scripts/import-3d-products.mjs              # preview only
 *   node scripts/import-3d-products.mjs --apply      # upload + insert
 *   node scripts/import-3d-products.mjs --apply --force  # re-upload existing SKUs
 */

import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DEFAULT_SOURCE = 'E:\\BUSINESS products\\3D products';
const PRODUCT_IMAGES_BUCKET = 'product-images';
const MIN_FILE_BYTES = 8_000;

const FOLDER_TO_CATEGORY = {
  bookmarks: '3d-bookmarks',
  coaster: '3d-coasters',
  'key ring or chains': '3d-keyrings',
  gift: '3d-printed-gifts',
  'character models': '3d-character-models',
  'wall decor': '3d-wall-decor',
  penholder: '3d-printed-gifts',
  artifact: '3d-wall-decor',
};

const SKU_PREFIX = {
  '3d-bookmarks': 'BM',
  '3d-coasters': 'CS',
  '3d-keyrings': 'KC',
  '3d-printed-gifts': 'GF',
  '3d-character-models': 'CM',
  '3d-wall-decor': 'WD',
};

const FRANCHISE_TAGS = [
  ['naruto', 'Naruto'],
  ['sasuke', 'Naruto'],
  ['sakura', 'Naruto'],
  ['itachi', 'Naruto'],
  ['pain', 'Naruto'],
  ['kakashi', 'Naruto'],
  ['bleach', 'Bleach'],
  ['ichigo', 'Bleach'],
  ['one piece', 'One Piece'],
  ['luffy', 'One Piece'],
  ['zoro', 'One Piece'],
  ['demon slayer', 'Demon Slayer'],
  ['tanjiro', 'Demon Slayer'],
  ['nezuko', 'Demon Slayer'],
  ['muichiro', 'Demon Slayer'],
  ['jujutsu', 'Jujutsu Kaisen'],
  ['gojo', 'Jujutsu Kaisen'],
  ['chainsaw', 'Chainsaw Man'],
  ['aot', 'Attack on Titan'],
  ['harry potter', 'Harry Potter'],
  ['hogwarts', 'Harry Potter'],
  ['toothless', 'How to Train Your Dragon'],
  ['batman', 'DC Comics'],
  ['spiderman', 'Marvel'],
  ['marvel', 'Marvel'],
  ['messi', 'Football'],
  ['cr7', 'Football'],
  ['cr 7', 'Football'],
  ['goku', 'Dragon Ball'],
  ['solo leveling', 'Solo Leveling'],
  ['black clover', 'Black Clover'],
  ['beatles', 'Music'],
  ['kpop', 'K-Pop'],
  ['cyberpunk', 'Cyberpunk'],
  ['death note', 'Death Note'],
  ['micky mouse', 'Disney'],
  ['mickey', 'Disney'],
  ['jack sparrow', 'Pirates of the Caribbean'],
  ['jacksparow', 'Pirates of the Caribbean'],
  ['samurai', 'Japanese Art'],
  ['sakura', 'Anime'],
  ['cat', 'Cats'],
  ['frog', 'Nature'],
];

const CATEGORY_COPY = {
  '3d-bookmarks': {
    label: 'Designer Bookmark',
    desc: (name) =>
      `${name} — premium 3D-printed designer bookmark with crisp detail. Perfect for readers, students, and anime fans.`,
  },
  '3d-coasters': {
    label: 'Luxury Coaster',
    desc: (name) =>
      `${name} — statement drink coaster that protects your table in style. Ideal for desks, coffee tables, and gifting.`,
  },
  '3d-keyrings': {
    label: 'Charm Keychain',
    desc: (name) =>
      `${name} — carry-your-fandom charm keychain with durable finish. Fits keys, bags, and backpacks.`,
  },
  '3d-printed-gifts': {
    label: 'Curated Gift Piece',
    desc: (name) =>
      `${name} — hand-finished artisan desk or home gift piece. A memorable present for fans and collectors.`,
  },
  '3d-character-models': {
    label: 'Icon Figurine',
    desc: (name) =>
      `${name} — display-worthy collectible figurine with fine 3D-printed detail. Limited-style fan piece.`,
  },
  '3d-wall-decor': {
    label: 'Statement Wall Art',
    desc: (name) =>
      `${name} — bold wall art piece that transforms any room. Lightweight and ready to display.`,
  },
};

function loadEnvFile() {
  const envPath = join(ROOT, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

function walkImages(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkImages(full, acc);
      continue;
    }
    if (!/\.(jpe?g|png|webp|gif)$/i.test(entry.name)) continue;
    acc.push(full);
  }
  return acc;
}

function normalizeKey(name) {
  return name.toLowerCase().replace(/\.[^.]+$/, '').replace(/\s+/g, ' ').trim();
}

function shouldSkipPath(fullPath, sourceRoot, allFiles) {
  const rel = relative(sourceRoot, fullPath).replace(/\\/g, '/');
  const relLower = rel.toLowerCase();
  const base = basename(fullPath);
  const baseKey = normalizeKey(base);

  if (statSync(fullPath).size < MIN_FILE_BYTES) return 'too-small';
  if (relLower.includes('/output/')) {
    const parentDir = dirname(fullPath.replace(/[/\\]output[/\\]/i, '/'));
    const parentCandidate = join(parentDir, base);
    if (existsSync(parentCandidate) && parentCandidate !== fullPath) return 'duplicate-output';
  }
  if (!rel.includes('/')) return 'root-orphan';
  if (/whatsapp image/i.test(base)) return 'whatsapp-photo';

  const dupes = allFiles.filter((f) => normalizeKey(basename(f)) === baseKey);
  if (dupes.length > 1) {
    const sorted = [...dupes].sort((a, b) => a.length - b.length);
    if (sorted[0] !== fullPath) return 'duplicate-name';
  }

  return null;
}

function resolveCategory(fullPath, sourceRoot) {
  const rel = relative(sourceRoot, fullPath).replace(/\\/g, '/');
  const top = rel.split('/')[0]?.toLowerCase() ?? '';
  return FOLDER_TO_CATEGORY[top] ?? '3d-printed-gifts';
}

function parsePrice(nameStem) {
  const plus = nameStem.match(/(\d{2,4})\s*\+/);
  if (plus) return Number(plus[1]);
  const dash = nameStem.match(/-\s*(\d{2,4})(?:\s|$)/);
  if (dash) return Number(dash[1]);
  const trailing = nameStem.match(/\s(\d{3,4})(?:\s+g)?\s*$/i);
  if (trailing && Number(trailing[1]) >= 100) return Number(trailing[1]);
  return 0;
}

function parseWeightNote(nameStem) {
  const m = nameStem.match(/(\d+)\s*g\b/i);
  if (!m) return null;
  const grams = Number(m[1]);
  if (grams > 500) return null;
  return `Approx. print weight: ${grams}g`;
}

function finalizeName(rawName, categorySlug) {
  const copy = CATEGORY_COPY[categorySlug];
  const lower = rawName.toLowerCase();
  const typeWords = ['bookmark', 'coaster', 'keychain', 'key ring', 'figurine', 'wall art', 'wall decor', 'clock', 'pen holder', 'gift', 'hamper', 'campus', 'figurine'];
  if (typeWords.some((w) => lower.includes(w)) || /\bset\b/i.test(rawName)) {
    return rawName.replace(/\s+/g, ' ').trim();
  }
  return `${rawName} ${copy.label}`.replace(/\s+/g, ' ').trim();
}

function titleCase(text) {
  return text
    .split(' ')
    .filter(Boolean)
    .map((w) => (w.length <= 3 && !/^[A-Z0-9]+$/.test(w) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join(' ')
    .replace(/\bAot\b/g, 'AOT')
    .replace(/\bCr7\b/gi, 'CR7')
    .replace(/\bNf\b/g, 'NF')
    .replace(/\bKpop\b/gi, 'K-Pop')
    .replace(/\bDp\b/g, 'DP');
}

function cleanProductName(filename) {
  let stem = basename(filename, extname(filename));
  stem = stem.replace(/whatsapp image \d{4}-\d{2}-\d{2} at [\d. :apm]+/gi, 'Custom Piece');
  stem = stem.replace(/\boutput\b/gi, '');
  stem = stem.replace(/-\s*\d{2,4}\s*$/g, '');
  stem = stem.replace(/\s*\d{2,4}\s*\+/g, '');
  stem = stem.replace(/\s*\d+\s*g\b/gi, '');
  stem = stem.replace(/\s+/g, ' ').trim();
  stem = stem.replace(/[,_]+/g, ' ');
  return titleCase(stem);
}

function detectTags(name, categorySlug) {
  const lower = name.toLowerCase();
  const tags = new Set(['3d-print', 'artisan', categorySlug.replace('3d-', '')]);
  for (const [needle, tag] of FRANCHISE_TAGS) {
    if (lower.includes(needle)) tags.add(tag);
  }
  if (/set\b/i.test(name)) tags.add('set');
  if (/bookmark/i.test(name) || categorySlug === '3d-bookmarks') tags.add('bookmark');
  if (/coaster/i.test(name) || categorySlug === '3d-coasters') tags.add('coaster');
  if (/key/i.test(name) || categorySlug === '3d-keyrings') tags.add('keychain');
  if (/clock/i.test(name)) tags.add('clock');
  if (/pen holder|penholder/i.test(name)) tags.add('pen-holder');
  return [...tags];
}

function buildProduct(fullPath, sourceRoot, indexByCategory) {
  const categorySlug = resolveCategory(fullPath, sourceRoot);
  const rawName = cleanProductName(fullPath);
  const copy = CATEGORY_COPY[categorySlug];
  const isSet = /\bset\b/i.test(rawName);
  let productName = finalizeName(rawName, categorySlug);
  if (isSet && !/\bset\b/i.test(productName)) productName = `${productName} Set`;

  const stem = basename(fullPath, extname(fullPath));
  const price = parsePrice(stem);
  const weightNote = parseWeightNote(stem);
  const tags = detectTags(`${rawName} ${relative(sourceRoot, fullPath)}`, categorySlug);

  const prefix = SKU_PREFIX[categorySlug] ?? 'GP';
  indexByCategory[categorySlug] = (indexByCategory[categorySlug] ?? 0) + 1;
  const sku = `${prefix}-${String(indexByCategory[categorySlug]).padStart(3, '0')}`;

  const hash = createHash('md5').update(relative(sourceRoot, fullPath).toLowerCase()).digest('hex').slice(0, 8);
  const stableSku = `${prefix}-${hash.toUpperCase()}`;

  let description = copy.desc(rawName);
  if (isSet) description += ' Sold as a coordinated set.';
  if (weightNote) description += ` ${weightNote}.`;
  description += ' Hand-finished at Shoukhin — contact us to customize colors.';

  return {
    filePath: fullPath,
    sku: stableSku,
    name: productName.replace(/\s+/g, ' ').trim(),
    nameBn: '',
    categorySlug,
    price,
    stock: isSet ? 15 : 25,
    description,
    tags,
    isFeatured: tags.length > 3,
    badges: tags.includes('set') ? ['new'] : ['new', 'featured'].slice(0, tags.includes('Naruto') || tags.includes('Demon Slayer') ? 2 : 1),
  };
}

function mimeFor(filePath) {
  const ext = extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  return 'image/jpeg';
}

async function createSupabase() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url) throw new Error('Missing VITE_SUPABASE_URL in .env');

  if (serviceKey) {
    return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  }

  const email = process.env.IMPORT_STAFF_EMAIL;
  const password = process.env.IMPORT_STAFF_PASSWORD;
  if (!anonKey || !email || !password) {
    throw new Error(
      'Add SUPABASE_SERVICE_ROLE_KEY to .env, OR set IMPORT_STAFF_EMAIL + IMPORT_STAFF_PASSWORD'
    );
  }

  const client = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Staff sign-in failed: ${error.message}`);
  return client;
}

async function fetchCategoryMap(supabase) {
  const { data, error } = await supabase.from('categories').select('id, slug').eq('is_active', true);
  if (error) throw error;
  const map = Object.fromEntries((data ?? []).map((c) => [c.slug, c.id]));
  return map;
}

async function fetchExistingSkus(supabase) {
  const { data, error } = await supabase.from('products').select('sku, images');
  if (error) throw error;
  return new Map((data ?? []).map((p) => [p.sku, p.images]));
}

async function uploadImage(supabase, filePath, sku) {
  const buf = readFileSync(filePath);
  const ext = extname(filePath).toLowerCase().replace('.', '') || 'jpg';
  const storagePath = `import/${sku}/${basename(filePath).replace(/[^\w.\-()+ ]/g, '_')}`;

  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(storagePath, buf, {
    contentType: mimeFor(filePath),
    upsert: true,
    cacheControl: '31536000',
  });
  if (error) throw error;

  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

async function upsertProduct(supabase, product, categoryId, imageUrl) {
  const payload = {
    sku: product.sku,
    name: product.name,
    name_bn: product.nameBn || null,
    category_id: categoryId,
    price: product.price,
    sale_price: null,
    images: [imageUrl],
    stock: product.stock,
    description: product.description,
    description_bn: null,
    size_options: [],
    color_options: [],
    food_note: null,
    delivery_note: null,
    tags: product.tags,
    is_active: true,
    is_featured: product.isFeatured,
    badges: product.badges,
  };

  const { data: existing, error: findErr } = await supabase
    .from('products')
    .select('id')
    .eq('sku', product.sku)
    .maybeSingle();
  if (findErr) throw findErr;

  if (existing?.id) {
    const { error } = await supabase.from('products').update(payload).eq('id', existing.id);
    if (error) throw error;
    return 'updated';
  }

  const { error } = await supabase.from('products').insert(payload);
  if (error) throw error;
  return 'inserted';
}

async function main() {
  loadEnvFile();

  const apply = process.argv.includes('--apply');
  const force = process.argv.includes('--force');
  const source = process.env.IMPORT_SOURCE_DIR || DEFAULT_SOURCE;

  if (!existsSync(source)) {
    console.error(`Source folder not found: ${source}`);
    console.error('Set IMPORT_SOURCE_DIR if your photos live elsewhere.');
    process.exit(1);
  }

  const allFiles = walkImages(source);
  const indexByCategory = {};
  const skipped = [];
  const products = [];

  for (const file of allFiles) {
    const skip = shouldSkipPath(file, source, allFiles);
    if (skip) {
      skipped.push({ file: relative(source, file), reason: skip });
      continue;
    }
    products.push(buildProduct(file, source, indexByCategory));
  }

  console.log(`\nShoukhin 3D product import`);
  console.log(`Source: ${source}`);
  console.log(`Found ${allFiles.length} images → ${products.length} products (${skipped.length} skipped)\n`);

  const byCategory = {};
  for (const p of products) {
    byCategory[p.categorySlug] = (byCategory[p.categorySlug] ?? 0) + 1;
  }
  console.log('By category:');
  for (const [slug, count] of Object.entries(byCategory).sort()) {
    console.log(`  ${slug}: ${count}`);
  }

  console.log('\nSample products:');
  for (const p of products.slice(0, 8)) {
    console.log(`  [${p.sku}] ${p.name} → ${p.categorySlug}${p.price ? ` (৳${p.price})` : ''}`);
  }
  if (products.length > 8) console.log(`  ... and ${products.length - 8} more`);

  if (!apply) {
    console.log(`\nDry run only. Re-run with --apply to upload to Supabase.`);
    return;
  }

  const supabase = await createSupabase();
  const categoryMap = await fetchCategoryMap(supabase);
  const existingSkus = await fetchExistingSkus(supabase);

  const missingCats = [...new Set(products.map((p) => p.categorySlug))].filter((s) => !categoryMap[s]);
  if (missingCats.length) {
    console.error('\nMissing categories in database. Run these SQL files first:');
    console.error('  supabase/SETUP_GIFTS_CATEGORIES_COMPLETE.sql');
    console.error('Missing:', missingCats.join(', '));
    process.exit(1);
  }

  let ok = 0;
  let fail = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const label = `[${i + 1}/${products.length}] ${p.sku}`;
    try {
      if (existingSkus.has(p.sku) && !force) {
        console.log(`${label} skip (exists, use --force to replace)`);
        ok++;
        continue;
      }

      process.stdout.write(`${label} uploading… `);
      const imageUrl = await uploadImage(supabase, p.filePath, p.sku);
      const action = await upsertProduct(supabase, p, categoryMap[p.categorySlug], imageUrl);
      console.log(`${action} ✓`);
      ok++;
    } catch (err) {
      console.log(`FAILED`);
      console.error(`  ${err.message ?? err}`);
      fail++;
    }
  }

  console.log(`\nDone: ${ok} ok, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
