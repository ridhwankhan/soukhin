import { supabase } from './supabase';
import { parseSupabaseError } from './parseSupabaseError';

export interface PotentialCustomer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  socialLink?: string;
  notes?: string;
  interestSummary?: string;
  images?: string[];
  createdByAdminName?: string;
  createdAt: string;
  purgeAfter: string;
}

export interface CreatePotentialCustomerInput {
  name: string;
  phone?: string;
  email?: string;
  socialLink?: string;
  notes?: string;
  interestSummary?: string;
  images?: string[];
}

export type UpdatePotentialCustomerInput = CreatePotentialCustomerInput;

export async function fetchPotentialCustomers(search?: string): Promise<PotentialCustomer[]> {
  const { data, error } = await supabase.rpc('list_potential_customers_admin', {
    p_search: search || null,
  });
  if (error) throw error;
  return (data as PotentialCustomer[]) ?? [];
}

export async function createPotentialCustomer(
  input: CreatePotentialCustomerInput
): Promise<{ id: string; name: string }> {
  const payload = buildPayload(input);
  const { data, error } = await supabase.rpc('create_potential_customer_admin', { p_payload: payload });
  if (error) throw new Error(parseSupabaseError(error));
  return data as { id: string; name: string };
}

export async function deletePotentialCustomer(id: string): Promise<void> {
  const { error } = await supabase.rpc('delete_potential_customer_admin', { p_id: id });
  if (error) throw error;
}

function buildPayload(input: CreatePotentialCustomerInput) {
  return {
    name: input.name,
    phone: input.phone ?? '',
    email: input.email ?? '',
    social_link: input.socialLink ?? '',
    notes: input.notes ?? '',
    interest_summary: input.interestSummary ?? '',
    images: input.images ?? [],
  };
}

export async function updatePotentialCustomer(
  id: string,
  input: UpdatePotentialCustomerInput
): Promise<{ id: string; name: string }> {
  const { data, error } = await supabase.rpc('update_potential_customer_admin', {
    p_id: id,
    p_payload: buildPayload(input),
  });
  if (error) throw new Error(parseSupabaseError(error));
  return data as { id: string; name: string };
}
