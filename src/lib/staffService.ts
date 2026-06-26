import { supabase } from './supabase';
import { getAuthRedirectUrl } from '../config/site';
import { AdminRole, AdminUser } from '../types';

export interface StaffMember extends AdminUser {
  isActive: boolean;
  isLinked: boolean;
}

interface StaffRow {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  avatar?: string;
  isActive: boolean;
  isLinked: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

function mapStaff(row: StaffRow): StaffMember {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    avatar: row.avatar,
    createdAt: row.createdAt,
    lastLogin: row.lastLogin,
    isActive: row.isActive,
    isLinked: row.isLinked,
  };
}

export async function fetchStaffMembers(): Promise<StaffMember[]> {
  const { data, error } = await supabase.rpc('list_staff_members');
  if (error) throw error;
  return ((data as StaffRow[]) ?? []).map(mapStaff);
}

export async function saveStaffMember(input: {
  id?: string;
  email: string;
  name: string;
  role: AdminRole;
}): Promise<StaffMember> {
  const { data, error } = await supabase.rpc('save_staff_member', {
    p_payload: {
      id: input.id ?? null,
      email: input.email.trim().toLowerCase(),
      name: input.name.trim(),
      role: input.role,
    },
  });
  if (error) throw error;
  return mapStaff(data as StaffRow);
}

export async function setStaffActive(staffId: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.rpc('set_staff_active', {
    p_staff_id: staffId,
    p_is_active: isActive,
  });
  if (error) throw error;
}

export async function inviteStaffByEmail(email: string): Promise<{ invited: boolean; message: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('You must be signed in to invite staff.');
  }

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-staff`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      redirectTo: getAuthRedirectUrl(`/auth?mode=login&returnTo=${encodeURIComponent('/admin')}`),
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error ?? 'Failed to send invite');
  }

  return result as { invited: boolean; message: string };
}

export function mapStaffError(error: unknown): string {
  const message = error && typeof error === 'object' && 'message' in error
    ? String((error as { message: string }).message)
    : 'Something went wrong';

  if (message.includes('email_already_staff')) return 'This email is already a staff member.';
  if (message.includes('cannot_assign_role')) return 'Your role cannot assign that permission level.';
  if (message.includes('cannot_modify_owner')) return 'Only the owner can change owner accounts.';
  if (message.includes('cannot_modify_admin')) return 'Only the owner can change admin accounts.';
  if (message.includes('cannot_change_own_role')) return 'You cannot change your own role.';
  if (message.includes('cannot_deactivate_self')) return 'You cannot deactivate your own account.';
  if (message.includes('cannot_remove_last_owner')) return 'Cannot deactivate the last active owner.';
  if (message.includes('permission_denied')) return 'You do not have permission for this action.';
  return message;
}
