import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { JWT } from 'npm:google-auth-library@9';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getGoogleAccessToken(serviceAccountJson: string): Promise<string> {
  const creds = JSON.parse(serviceAccountJson);
  const client = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const token = await client.getAccessToken();
  if (!token.token) throw new Error('Failed to get Google access token');
  return token.token;
}

async function writeSheet(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: string[][]
): Promise<void> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Sheets API error: ${err}`);
  }
}

function toRows(items: Record<string, unknown>[], columns: string[]): string[][] {
  return [
    columns,
    ...items.map((item) => columns.map((col) => String(item[col] ?? ''))),
  ];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON') ?? '';
    const defaultSpreadsheetId = Deno.env.get('GOOGLE_SPREADSHEET_ID') ?? '';

    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: profile } = await supabaseUser.rpc('get_my_admin_profile');
    if (!profile) {
      return new Response(JSON.stringify({ error: 'Staff access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const action = String(body.action ?? 'sync-all');
    const spreadsheetId = String(body.spreadsheetId ?? defaultSpreadsheetId).trim();

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    if (action === 'import-csv') {
      const rows = (body.rows ?? []) as Record<string, string>[];
      let imported = 0;

      for (const row of rows) {
        const sku = row.sku?.trim();
        const name = row.name?.trim();
        const categorySlug = (row.category ?? row.category_slug ?? 'gifts').trim();
        if (!sku || !name) continue;

        const { data: cat } = await supabaseAdmin
          .from('categories')
          .select('id')
          .eq('slug', categorySlug)
          .maybeSingle();
        if (!cat?.id) continue;

        const payload = {
          id: '',
          sku,
          name,
          name_bn: row.nameBn ?? row.name_bn ?? '',
          category_id: cat.id,
          price: Number(row.price ?? 0),
          sale_price: row.salePrice ?? row.sale_price ?? '',
          images: row.image ? [row.image] : [],
          stock: Number(row.stock ?? 0),
          description: row.description ?? '',
          description_bn: '',
          size_options: [],
          color_options: [],
          food_note: '',
          delivery_note: '',
          tags: [],
          is_active: (row.isActive ?? row.is_active ?? 'true') !== 'false',
          is_featured: (row.isFeatured ?? row.is_featured ?? 'false') === 'true',
          badges: [],
        };

        const { error } = await supabaseAdmin.rpc('upsert_product_admin', { p_payload: payload });
        if (!error) imported += 1;
      }

      return new Response(
        JSON.stringify({ imported, message: `Imported ${imported} product(s) from spreadsheet.` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!serviceAccountJson || !spreadsheetId) {
      return new Response(
        JSON.stringify({
          error: 'Set GOOGLE_SERVICE_ACCOUNT_JSON and GOOGLE_SPREADSHEET_ID in Supabase Edge Function secrets.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: exportData, error: exportError } = await supabaseUser.rpc('export_sync_data_admin');
    if (exportError) throw exportError;

    const products = (exportData?.products ?? []) as Record<string, unknown>[];
    const orders = (exportData?.orders ?? []) as Record<string, unknown>[];
    const categories = (exportData?.categories ?? []) as Record<string, unknown>[];

    const accessToken = await getGoogleAccessToken(serviceAccountJson);

    await writeSheet(
      accessToken,
      spreadsheetId,
      'Products!A1',
      toRows(products, ['sku', 'name', 'nameBn', 'category', 'price', 'salePrice', 'stock', 'isActive', 'isFeatured', 'updatedAt'])
    );
    await writeSheet(
      accessToken,
      spreadsheetId,
      'Orders!A1',
      toRows(orders, ['orderNumber', 'customerName', 'phone', 'total', 'status', 'paymentStatus', 'createdAt'])
    );
    await writeSheet(
      accessToken,
      spreadsheetId,
      'Categories!A1',
      toRows(categories, ['slug', 'name', 'nameBn', 'isActive', 'displayOrder'])
    );

    await supabaseAdmin.rpc('upsert_site_setting_admin', {
      p_key: 'google_sheets',
      p_value: { spreadsheetId, enabled: true, lastSyncAt: new Date().toISOString() },
    }).catch(() => {});

    return new Response(
      JSON.stringify({
        message: `Synced ${products.length} products, ${orders.length} orders, ${categories.length} categories to Google Sheets.`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sync failed';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
