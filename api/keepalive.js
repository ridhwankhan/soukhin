/**
 * Vercel serverless ping. Cron + GitHub Action hit this URL so the Free
 * Supabase project receives database traffic and does not auto-pause.
 */
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    return res.status(204).end();
  }

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return res.status(500).json({ ok: false, error: 'Supabase env vars missing on Vercel' });
  }

  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
  };

  try {
    const [nav, products] = await Promise.all([
      fetch(`${url}/rest/v1/rpc/get_category_nav`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: '{}',
      }),
      fetch(`${url}/rest/v1/products?select=id&is_active=eq.true&limit=1`, {
        headers,
      }),
    ]);

    if (!nav.ok || !products.ok) {
      const detail = `${nav.status} ${products.status}`;
      return res.status(502).json({ ok: false, error: `Supabase responded ${detail}` });
    }

    return res.status(200).json({ ok: true, at: new Date().toISOString() });
  } catch (err) {
    return res.status(502).json({
      ok: false,
      error: err instanceof Error ? err.message : 'Keep-alive request failed',
    });
  }
}
