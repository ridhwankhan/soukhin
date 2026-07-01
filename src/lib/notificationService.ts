import { supabase } from './supabase';

export interface AdminNotification {
  type: 'message' | 'order' | 'image';
  id: string;
  title: string;
  body: string;
  isUnread: boolean;
  createdAt: string;
  link: string;
}

interface NotificationRow {
  type: 'message' | 'order' | 'image';
  id: string;
  title: string;
  body: string;
  is_unread: boolean;
  created_at: string;
  link: string;
}

export async function fetchAdminNotifications(): Promise<AdminNotification[]> {
  const { data, error } = await supabase.rpc('get_admin_notifications');
  if (error) throw error;

  return ((data as NotificationRow[]) ?? []).map((row) => ({
    type: row.type,
    id: row.id,
    title: row.title,
    body: row.body,
    isUnread: row.is_unread,
    createdAt: row.created_at,
    link: row.link,
  }));
}

export async function markImageReportRead(reportId: string): Promise<void> {
  const { error } = await supabase.rpc('mark_image_report_read_admin', { p_report_id: reportId });
  if (error) throw error;
}

export async function markMessageRead(messageId: string): Promise<void> {
  const { error } = await supabase.rpc('mark_message_read_admin', { p_message_id: messageId });
  if (error) throw error;
}

export interface AdminMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export async function fetchAdminMessages(): Promise<AdminMessage[]> {
  const { data, error } = await supabase.rpc('list_messages_admin');
  if (error) throw error;

  return ((data as {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    subject: string;
    message: string;
    is_read: boolean;
    created_at: string;
  }[]) ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    subject: row.subject,
    message: row.message,
    isRead: row.is_read,
    createdAt: row.created_at,
  }));
}
