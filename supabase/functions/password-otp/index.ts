import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OTP_TTL_MINUTES = 10;
const MAX_REQUESTS_PER_HOUR = 5;

async function hashOtp(email: string, otp: string): Promise<string> {
  const data = new TextEncoder().encode(`${email.toLowerCase()}:${otp}:soukhin-otp-v1`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function findUserIdByEmail(
  supabaseAdmin: ReturnType<typeof createClient>,
  email: string
): Promise<string | null> {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  const user = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  return user?.id ?? null;
}

async function sendOtpEmail(
  to: string,
  otp: string,
  purpose: 'forgot' | 'change',
  resendKey: string,
  fromEmail: string
): Promise<boolean> {
  if (!resendKey) return false;

  const title = purpose === 'forgot' ? 'Reset your Soukhin password' : 'Confirm your password change';
  const intro =
    purpose === 'forgot'
      ? 'You requested to reset your Soukhin account password.'
      : 'You requested to change your Soukhin account password.';

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;">
      <h2 style="color:#8B4513;">${title}</h2>
      <p>${intro}</p>
      <p style="font-size:15px;line-height:1.6;">Use this one-time PIN within <strong>${OTP_TTL_MINUTES} minutes</strong>:</p>
      <p style="margin:24px 0;padding:16px 24px;background:#f5f0eb;border-radius:8px;font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;color:#8B4513;">${otp}</p>
      <p style="font-size:13px;color:#666;">If you did not request this, you can ignore this email. Your password will stay the same.</p>
      <p style="font-size:12px;color:#999;margin-top:32px;">Soukhin — Premium Bangladeshi Lifestyle</p>
    </div>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [to],
      subject: `${title} — PIN ${otp}`,
      html,
    }),
  });

  return res.ok;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const resendKey = Deno.env.get('RESEND_API_KEY') ?? '';
    const fromEmail = Deno.env.get('NOTIFICATION_FROM_EMAIL') ?? 'Soukhin <onboarding@resend.dev>';

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    const body = await req.json();
    const action = String(body.action ?? '');

    if (action === 'request') {
      const email = String(body.email ?? '').trim().toLowerCase();
      const purpose = body.purpose === 'change' ? 'change' : 'forgot';

      if (!email || !email.includes('@')) {
        return json({ error: 'Valid email is required.' }, 400);
      }

      const authHeader = req.headers.get('Authorization');
      if (purpose === 'change') {
        if (!authHeader?.startsWith('Bearer ')) {
          return json({ error: 'Sign in first to change your password.' }, 401);
        }
        const supabaseUser = createClient(supabaseUrl, anonKey, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data: userData, error: userError } = await supabaseUser.auth.getUser();
        if (userError || !userData.user?.email) {
          return json({ error: 'Invalid session. Please sign in again.' }, 401);
        }
        if (userData.user.email.toLowerCase() !== email) {
          return json({ error: 'Email does not match your signed-in account.' }, 403);
        }
      }

      const userId = await findUserIdByEmail(supabaseAdmin, email);
      if (!userId) {
        // Do not reveal whether account exists
        return json({
          ok: true,
          message: 'If an account exists for this email, a PIN has been sent. Check your inbox.',
        });
      }

      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count } = await supabaseAdmin
        .from('password_otp_requests')
        .select('id', { count: 'exact', head: true })
        .eq('email', email)
        .gte('created_at', oneHourAgo);

      if ((count ?? 0) >= MAX_REQUESTS_PER_HOUR) {
        return json({ error: 'Too many PIN requests. Wait an hour and try again.' }, 429);
      }

      const otp = generateOtp();
      const otpHash = await hashOtp(email, otp);
      const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

      await supabaseAdmin.from('password_otp_requests').insert({
        email,
        otp_hash: otpHash,
        purpose,
        expires_at: expiresAt,
      });

      const emailed = await sendOtpEmail(email, otp, purpose, resendKey, fromEmail);

      return json({
        ok: true,
        emailed,
        expiresInMinutes: OTP_TTL_MINUTES,
        message: emailed
          ? `A ${OTP_TTL_MINUTES}-minute PIN was sent to ${email}. Check your inbox (and spam folder).`
          : `PIN generated. Email is not configured on the server — use the PIN shown below.`,
        ...(emailed ? {} : { devOtp: otp }),
      });
    }

    if (action === 'verify') {
      const email = String(body.email ?? '').trim().toLowerCase();
      const otp = String(body.otp ?? '').trim();
      const newPassword = String(body.newPassword ?? '');

      if (!email || otp.length !== 6) {
        return json({ error: 'Email and 6-digit PIN are required.' }, 400);
      }
      if (newPassword.length < 8) {
        return json({ error: 'New password must be at least 8 characters.' }, 400);
      }

      const userId = await findUserIdByEmail(supabaseAdmin, email);
      if (!userId) {
        return json({ error: 'Invalid or expired PIN.' }, 400);
      }

      const { data: rows, error: fetchError } = await supabaseAdmin
        .from('password_otp_requests')
        .select('id, otp_hash, purpose, expires_at, used_at')
        .eq('email', email)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError || !rows?.length) {
        return json({ error: 'Invalid or expired PIN. Request a new one.' }, 400);
      }

      const row = rows[0];
      const expectedHash = await hashOtp(email, otp);
      if (expectedHash !== row.otp_hash) {
        return json({ error: 'Incorrect PIN. Check the code and try again.' }, 400);
      }

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword,
      });
      if (updateError) throw updateError;

      await supabaseAdmin
        .from('password_otp_requests')
        .update({ used_at: new Date().toISOString() })
        .eq('id', row.id);

      return json({
        ok: true,
        message: 'Password updated successfully. You can sign in with your new password.',
      });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    return json({ error: message }, 500);
  }
});

function json(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
