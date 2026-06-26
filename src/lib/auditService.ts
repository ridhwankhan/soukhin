import { supabase } from './supabase';
import { AuditLog } from '../types';

export async function fetchAuditLogs(limit = 100): Promise<AuditLog[]> {
  const { data, error } = await supabase.rpc('list_audit_logs_admin', { p_limit: limit });
  if (error) throw error;
  return (data as AuditLog[]) ?? [];
}
