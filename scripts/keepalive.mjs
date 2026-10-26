#!/usr/bin/env node
/**
 * Ping the live database so a Free-plan project does not pause from inactivity.
 * Safe: uses the public (anon) key only — the same key the website already uses.
 */

import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

function loadEnvFile() {
  const envPath = join(dirname(fileURLToPath(import.meta.url)), '..', '.env');
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

export async function pingDatabase() {
  loadEnvFile();

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const nav = await supabase.rpc('get_category_nav');
  if (nav.error) throw new Error(`categories: ${nav.error.message}`);

  const settings = await supabase.rpc('get_public_site_settings');
  if (settings.error) throw new Error(`settings: ${settings.error.message}`);

  const products = await supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true);
  if (products.error) throw new Error(`products: ${products.error.message}`);

  return {
    ok: true,
    categories: Array.isArray(nav.data) ? nav.data.length : 0,
    products: products.count ?? 0,
  };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  pingDatabase()
    .then((result) => {
      console.log(`Keep-alive OK — ${result.categories} categories, ${result.products} products`);
    })
    .catch((err) => {
      console.error(`Keep-alive failed: ${err.message}`);
      process.exit(1);
    });
}
