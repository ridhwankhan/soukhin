import { supabase } from './supabase';

export type PasswordOtpPurpose = 'forgot' | 'change';

export interface RequestOtpResult {
  ok: boolean;
  message: string;
  emailed?: boolean;
  devOtp?: string;
  expiresInMinutes?: number;
  error?: string;
}

export interface VerifyOtpResult {
  ok: boolean;
  message: string;
  error?: string;
}

async function callPasswordOtp(
  payload: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: anonKey,
  };

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  headers.Authorization = `Bearer ${token ?? anonKey}`;

  const res = await fetch(`${supabaseUrl}/functions/v1/password-otp`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(String(data.error ?? 'Request failed'));
  }
  return data;
}

export async function requestPasswordOtp(
  email: string,
  purpose: PasswordOtpPurpose
): Promise<RequestOtpResult> {
  const data = await callPasswordOtp({
    action: 'request',
    email: email.trim().toLowerCase(),
    purpose,
  });

  return {
    ok: Boolean(data.ok),
    message: String(data.message ?? 'PIN sent.'),
    emailed: data.emailed as boolean | undefined,
    devOtp: data.devOtp as string | undefined,
    expiresInMinutes: data.expiresInMinutes as number | undefined,
  };
}

export async function verifyPasswordOtp(
  email: string,
  otp: string,
  newPassword: string
): Promise<VerifyOtpResult> {
  const data = await callPasswordOtp({
    action: 'verify',
    email: email.trim().toLowerCase(),
    otp: otp.trim(),
    newPassword,
  });

  return {
    ok: Boolean(data.ok),
    message: String(data.message ?? 'Password updated.'),
  };
}
