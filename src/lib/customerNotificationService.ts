import { supabase } from './supabase';
import { CustomerNotification, CustomerNotificationType } from '../types';

export interface SendNotificationInput {
  customerId?: string;
  recipientEmail: string;
  recipientName?: string;
  title: string;
  body: string;
  notificationType?: CustomerNotificationType;
  couponCode?: string;
}

export async function sendCustomerNotification(
  input: SendNotificationInput
): Promise<{ id: string; recipientEmail: string }> {
  const payload = {
    customer_id: input.customerId ?? '',
    recipient_email: input.recipientEmail,
    recipient_name: input.recipientName ?? '',
    title: input.title,
    body: input.body,
    notification_type: input.notificationType ?? 'general',
    coupon_code: input.couponCode ?? '',
  };

  const { data, error } = await supabase.rpc('send_customer_notification_admin', { p_payload: payload });
  if (error) throw error;

  const result = data as { id: string; recipientEmail: string };

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (token) {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      await fetch(`${supabaseUrl}/functions/v1/send-customer-notification`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId: result.id }),
      });
    }
  } catch {
    // In-app notification is saved; email is best-effort
  }

  return { id: result.id, recipientEmail: result.recipientEmail };
}

export async function fetchMyNotifications(): Promise<CustomerNotification[]> {
  const { data, error } = await supabase.rpc('get_my_customer_notifications', { p_limit: 50 });
  if (error) throw error;
  return (data as CustomerNotification[]) ?? [];
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const { error } = await supabase.rpc('mark_customer_notification_read', {
    p_notification_id: notificationId,
  });
  if (error) throw error;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const { data, error } = await supabase.rpc('get_unread_notification_count');
  if (error) return 0;
  return (data as number) ?? 0;
}
