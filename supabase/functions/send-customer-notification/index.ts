import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const resendKey = Deno.env.get('RESEND_API_KEY') ?? '';
    const fromEmail = Deno.env.get('NOTIFICATION_FROM_EMAIL') ?? 'Soukhin <onboarding@resend.dev>';

    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: profile, error: profileError } = await supabaseUser.rpc('get_my_admin_profile');
    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'Staff access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const role = (profile as { role: string }).role;
    if (!['owner', 'admin'].includes(role)) {
      return new Response(JSON.stringify({ error: 'Only owner or admin can send customer notifications' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const notificationId = String(body.notificationId ?? '').trim();
    if (!notificationId) {
      return new Response(JSON.stringify({ error: 'notificationId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    const { data: notification, error: fetchError } = await supabaseAdmin
      .from('customer_notifications')
      .select('id, recipient_email, recipient_name, title, body, coupon_code, email_sent')
      .eq('id', notificationId)
      .maybeSingle();

    if (fetchError || !notification) {
      return new Response(JSON.stringify({ error: 'Notification not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (notification.email_sent) {
      return new Response(JSON.stringify({ sent: true, message: 'Already sent' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!resendKey) {
      return new Response(
        JSON.stringify({
          sent: false,
          message: 'In-app notification saved. Set RESEND_API_KEY to enable email delivery.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const siteUrl = Deno.env.get('SITE_URL') ?? 'https://soukhin.vercel.app';
    const greeting = notification.recipient_name
      ? `Hello ${notification.recipient_name},`
      : 'Hello,';
    const couponBlock = notification.coupon_code
      ? `<p style="margin:16px 0;padding:12px;background:#f5f0eb;border-radius:6px;font-family:monospace;font-size:18px;"><strong>${notification.coupon_code}</strong></p>`
      : '';

    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
        <p>${greeting}</p>
        <h2 style="color:#8B4513;">${notification.title}</h2>
        <p style="white-space:pre-wrap;line-height:1.6;">${notification.body}</p>
        ${couponBlock}
        <p style="margin-top:24px;">
          <a href="${siteUrl}/account" style="background:#8B4513;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">View on Soukhin</a>
        </p>
        <p style="margin-top:32px;font-size:12px;color:#666;">Soukhin — Premium Bangladeshi Lifestyle</p>
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
        to: [notification.recipient_email],
        subject: notification.title,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Email provider error: ${errText}`);
    }

    await supabaseAdmin.rpc('mark_notification_email_sent', { p_notification_id: notificationId });

    return new Response(JSON.stringify({ sent: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Send failed';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
