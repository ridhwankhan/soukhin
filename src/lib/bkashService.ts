import { supabase } from './supabase';

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const ALLOWED_ORIGIN = import.meta.env.VITE_SITE_URL ?? '';

export interface BkashCreatePaymentResult {
  bkashURL: string;
  paymentID: string;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('You must be signed in to pay with bKash.');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
}

export async function createBkashPayment(orderId: string, amount: number, orderNumber: string): Promise<BkashCreatePaymentResult> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${FUNCTIONS_URL}/bkash-payment`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      action: 'create',
      orderId,
      amount,
      orderNumber,
      callbackURL: `${window.location.origin}/payment/bkash/callback`,
      siteOrigin: ALLOWED_ORIGIN || window.location.origin,
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error ?? 'Failed to initiate bKash payment');
  }

  return result as BkashCreatePaymentResult;
}

export async function executeBkashPayment(paymentID: string, orderId: string): Promise<{ transactionId: string }> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${FUNCTIONS_URL}/bkash-payment`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      action: 'execute',
      paymentID,
      orderId,
      siteOrigin: ALLOWED_ORIGIN || window.location.origin,
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error ?? 'Failed to complete bKash payment');
  }

  return { transactionId: result.transactionId as string };
}

export function isBkashConfigured(): boolean {
  return Boolean(import.meta.env.VITE_BKASH_ENABLED === 'true');
}
