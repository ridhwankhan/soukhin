import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BkashTokenResponse {
  id_token: string;
  token_type: string;
  expires_in: number;
}

interface BkashCreateResponse {
  paymentID: string;
  bkashURL: string;
  statusCode: string;
  statusMessage: string;
}

interface BkashExecuteResponse {
  trxID: string;
  transactionStatus: string;
  statusCode: string;
  statusMessage: string;
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function assertEdgeRateLimit(key: string, max: number, windowMs: number): void {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  if (entry.count >= max) {
    throw new Error('Too many payment requests. Please wait and try again.');
  }
  entry.count += 1;
}

async function getBkashToken(baseUrl: string, appKey: string, appSecret: string): Promise<string> {
  const response = await fetch(`${baseUrl}/tokenized/checkout/token/grant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      username: Deno.env.get('BKASH_USERNAME') ?? '',
      password: Deno.env.get('BKASH_PASSWORD') ?? '',
    },
    body: JSON.stringify({
      app_key: appKey,
      app_secret: appSecret,
    }),
  });

  const data = (await response.json()) as BkashTokenResponse & { statusMessage?: string };
  if (!response.ok || !data.id_token) {
    throw new Error(data.statusMessage ?? 'Failed to get bKash token');
  }
  return data.id_token;
}

async function verifyCallerOwnsOrder(
  supabaseAdmin: ReturnType<typeof createClient>,
  authHeader: string | null,
  orderId: string,
  amount?: number
): Promise<{ userId: string; orderNumber: string; total: number }> {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Authentication required');
  }

  const token = authHeader.replace('Bearer ', '');
  const supabaseAuth = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: userData, error: userError } = await supabaseAuth.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('Invalid session');
  }

  const { data, error } = await supabaseAdmin.rpc('verify_order_for_payment', {
    p_order_id: orderId,
    p_user_id: userData.user.id,
    p_expected_amount: amount ?? null,
  });

  if (error) throw new Error(error.message);

  const verified = data as { orderNumber: string; total: number };
  return { userId: userData.user.id, orderNumber: verified.orderNumber, total: verified.total };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const appKey = Deno.env.get('BKASH_APP_KEY');
    const appSecret = Deno.env.get('BKASH_APP_SECRET');
    const baseUrl = Deno.env.get('BKASH_BASE_URL') ?? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';
    const allowedOrigins = (Deno.env.get('ALLOWED_SITE_ORIGINS') ?? '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);

    if (!appKey || !appSecret) {
      return new Response(JSON.stringify({ error: 'bKash credentials are not configured on the server.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { action, orderId, amount, orderNumber, callbackURL, paymentID, siteOrigin } = body;

    if (allowedOrigins.length > 0 && siteOrigin && !allowedOrigins.includes(siteOrigin)) {
      return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    assertEdgeRateLimit(`bkash:${orderId ?? 'unknown'}`, 10, 60 * 60 * 1000);

    const token = await getBkashToken(baseUrl, appKey, appSecret);

    if (action === 'create') {
      const verified = await verifyCallerOwnsOrder(supabase, authHeader, orderId, Number(amount));

      const createResponse = await fetch(`${baseUrl}/tokenized/checkout/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: token,
          'X-APP-Key': appKey,
        },
        body: JSON.stringify({
          mode: '0011',
          payerReference: orderId,
          callbackURL: `${callbackURL}?orderId=${orderId}`,
          amount: Number(verified.total).toFixed(2),
          currency: 'BDT',
          intent: 'sale',
          merchantInvoiceNumber: verified.orderNumber ?? orderNumber,
        }),
      });

      const createData = (await createResponse.json()) as BkashCreateResponse;
      if (!createResponse.ok || !createData.bkashURL) {
        throw new Error(createData.statusMessage ?? 'Failed to create bKash payment');
      }

      return new Response(
        JSON.stringify({ bkashURL: createData.bkashURL, paymentID: createData.paymentID }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'execute') {
      await verifyCallerOwnsOrder(supabase, authHeader, orderId);

      const executeResponse = await fetch(`${baseUrl}/tokenized/checkout/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: token,
          'X-APP-Key': appKey,
        },
        body: JSON.stringify({ paymentID }),
      });

      const executeData = (await executeResponse.json()) as BkashExecuteResponse;
      if (!executeResponse.ok || executeData.transactionStatus !== 'Completed') {
        throw new Error(executeData.statusMessage ?? 'bKash payment was not completed');
      }

      await supabase.rpc('complete_order_payment', {
        p_order_id: orderId,
        p_transaction_id: executeData.trxID,
        p_payment_status: 'paid',
      });

      return new Response(
        JSON.stringify({ transactionId: executeData.trxID, status: executeData.transactionStatus }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'bKash payment failed';
    const status = message.includes('Authentication') || message.includes('access_denied') ? 401 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
