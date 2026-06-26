#!/usr/bin/env node
/**
 * Soukhin load test — run against staging/production before launch.
 *
 * Usage:
 *   VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... node scripts/load-test.mjs
 *   SITE_URL=https://your-site.vercel.app node scripts/load-test.mjs
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
const SITE_URL = process.env.SITE_URL ?? 'http://localhost:4173';
const CONCURRENCY = Number(process.env.LOAD_CONCURRENCY ?? 10);
const REQUESTS = Number(process.env.LOAD_REQUESTS ?? 50);

if (!SUPABASE_URL || !ANON_KEY) {
  console.error('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const restHeaders = {
  apikey: ANON_KEY,
  Authorization: `Bearer ${ANON_KEY}`,
  'Content-Type': 'application/json',
};

async function timed(label, fn) {
  const start = performance.now();
  let ok = false;
  let status = 0;
  try {
    const result = await fn();
    ok = result.ok;
    status = result.status;
    return { label, ok, status, ms: performance.now() - start };
  } catch (err) {
    return { label, ok: false, status: 0, ms: performance.now() - start, error: String(err) };
  }
}

async function rpc(name, body = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: restHeaders,
    body: JSON.stringify(body),
  });
  return { ok: res.ok, status: res.status };
}

async function fetchSite(path = '/') {
  const res = await fetch(`${SITE_URL}${path}`);
  return { ok: res.ok, status: res.status };
}

const scenarios = [
  { label: 'search_products', run: () => rpc('search_products_query', { p_query: 'silk', p_limit: 10 }) },
  { label: 'category_nav', run: () => rpc('get_category_nav') },
  { label: 'track_order_miss', run: () => rpc('track_order', { p_order_number: 'SK-TEST', p_phone: '01700000000' }) },
  { label: 'static_home', run: () => fetchSite('/') },
];

async function runBurst(scenario) {
  const tasks = Array.from({ length: REQUESTS }, () => timed(scenario.label, scenario.run));
  const chunks = [];
  for (let i = 0; i < tasks.length; i += CONCURRENCY) {
    chunks.push(await Promise.all(tasks.slice(i, i + CONCURRENCY)));
  }
  return chunks.flat();
}

function summarize(results) {
  const ok = results.filter((r) => r.ok).length;
  const times = results.map((r) => r.ms).sort((a, b) => a - b);
  const p95 = times[Math.floor(times.length * 0.95)] ?? 0;
  const avg = times.reduce((a, b) => a + b, 0) / (times.length || 1);
  return { total: results.length, ok, fail: results.length - ok, avgMs: Math.round(avg), p95Ms: Math.round(p95) };
}

console.log(`\nSoukhin load test`);
console.log(`Site: ${SITE_URL}`);
console.log(`Supabase: ${SUPABASE_URL}`);
console.log(`Concurrency: ${CONCURRENCY} | Requests per scenario: ${REQUESTS}\n`);

let hasFailure = false;

for (const scenario of scenarios) {
  console.log(`→ ${scenario.label}`);
  const results = await runBurst(scenario);
  const summary = summarize(results);
  console.log(`  ${summary.ok}/${summary.total} ok | avg ${summary.avgMs}ms | p95 ${summary.p95Ms}ms`);

  if (summary.fail > summary.total * 0.1) {
    hasFailure = true;
    const sample = results.find((r) => !r.ok);
    console.log(`  ⚠ More than 10% failures (status ${sample?.status ?? 'n/a'})`);
  }

  const rateLimited = results.filter((r) => r.status === 500 || r.status === 429).length;
  if (rateLimited > 0) {
    console.log(`  ℹ ${rateLimited} requests may have hit rate limits (expected under stress)`);
  }
}

console.log(hasFailure ? '\n❌ Load test completed with high failure rate' : '\n✅ Load test completed');
process.exit(hasFailure ? 1 : 0);
