import { supabase } from './supabase';
import { normalizePhone } from './validators';
import { Customer } from '../types';

export interface CustomerProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
}

interface CustomerRow {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string;
  address: string | null;
  total_orders: number;
  total_spent: number;
}

function mapCustomer(row: CustomerRow): CustomerProfile {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    email: row.email ?? '',
    phone: row.phone,
    address: row.address ?? '',
    totalOrders: row.total_orders,
    totalSpent: row.total_spent,
  };
}

export async function fetchCustomerProfile(userId: string): Promise<CustomerProfile | null> {
  const { data, error } = await supabase
    .from('customers')
    .select('id, user_id, name, email, phone, address, total_orders, total_spent')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapCustomer(data as CustomerRow) : null;
}

export async function createCustomerProfile(input: {
  userId: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
}): Promise<CustomerProfile> {
  const { data, error } = await supabase
    .from('customers')
    .insert({
      user_id: input.userId,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: normalizePhone(input.phone),
      address: input.address?.trim() || null,
    })
    .select('id, user_id, name, email, phone, address, total_orders, total_spent')
    .single();

  if (error) throw error;
  return mapCustomer(data as CustomerRow);
}

export async function updateCustomerProfile(
  userId: string,
  updates: Partial<Pick<CustomerProfile, 'name' | 'phone' | 'address'>>
): Promise<CustomerProfile> {
  const payload: Record<string, string | null> = {};

  if (updates.name !== undefined) payload.name = updates.name.trim();
  if (updates.phone !== undefined) payload.phone = normalizePhone(updates.phone);
  if (updates.address !== undefined) payload.address = updates.address.trim() || null;
  payload.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('customers')
    .update(payload)
    .eq('user_id', userId)
    .select('id, user_id, name, email, phone, address, total_orders, total_spent')
    .single();

  if (error) throw error;
  return mapCustomer(data as CustomerRow);
}

export async function ensureCustomerProfile(
  userId: string,
  fallback: { name: string; email: string; phone: string; address?: string }
): Promise<CustomerProfile> {
  const existing = await fetchCustomerProfile(userId);
  if (existing) return existing;
  return createCustomerProfile({ userId, ...fallback });
}

export async function fetchAdminCustomers(
  search?: string,
  sort: 'spent' | 'orders' | 'newest' | 'name' = 'spent'
): Promise<Customer[]> {
  const { data, error } = await supabase.rpc('list_customers_admin', {
    p_search: search || null,
    p_sort: sort,
  });
  if (error) throw error;
  return ((data as Customer[]) ?? []).map((c) => ({
    ...c,
    orders: c.orders ?? 0,
    totalSpent: c.totalSpent ?? 0,
  }));
}
