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
  additionalRoles?: AdminRole[];
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
    additionalRoles: row.additionalRoles ?? [],
    avatar: row.avatar,
    createdAt: row.createdAt,
    lastLogin: row.lastLogin,
    isActive: row.isActive,
    isLinked: row.isLinked,
  };
}

async function callInviteStaff(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  if (!supabaseUrl || !anonKey) {
    throw new Error('Store configuration is missing. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('You must be signed in to invite staff.');
  }

  let response: Response;
  try {
    response = await fetch(`${supabaseUrl}/functions/v1/invite-staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      'Could not reach the invite service. Run LINK_EXISTING_STAFF.sql in Supabase, then deploy invite-staff (npm run deploy-invite-staff). For registered users, use Link account instead.'
    );
  }

  const text = await response.text();
  let result: Record<string, unknown> = {};
  try {
    result = text ? JSON.parse(text) as Record<string, unknown> : {};
  } catch {
    throw new Error('Invite service returned an invalid response. Deploy invite-staff or use Link account for existing users.');
  }

  if (!response.ok) {
    throw new Error(String(result.error ?? 'Failed to send invite'));
  }

  return result;
}

export async function fetchStaffMembers(): Promise<StaffMember[]> {
  const { data, error } = await supabase.rpc('list_staff_members');
  if (error) throw error;

  let rows: StaffRow[] = [];
  if (Array.isArray(data)) {
    rows = data as StaffRow[];
  } else if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data) as unknown;
      rows = Array.isArray(parsed) ? (parsed as StaffRow[]) : [];
    } catch {
      rows = [];
    }
  }

  return rows.map(mapStaff);
}

export async function saveStaffMember(input: {
  id?: string;
  email: string;
  name: string;
  role: AdminRole;
  additionalRoles?: AdminRole[];
}): Promise<StaffMember> {
  const { data, error } = await supabase.rpc('save_staff_member', {
    p_payload: {
      id: input.id ?? null,
      email: input.email.trim().toLowerCase(),
      name: input.name.trim(),
      role: input.role,
      additionalRoles: input.additionalRoles ?? [],
    },
  });
  if (error) throw error;
  return mapStaff(data as StaffRow);
}

export async function linkStaffMember(staffId: string): Promise<StaffMember> {
  const { data, error } = await supabase.rpc('link_staff_member_account', {
    p_staff_id: staffId,
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
  const result = await callInviteStaff({
    email: email.trim().toLowerCase(),
    redirectTo: getAuthRedirectUrl(`/auth?mode=login&returnTo=${encodeURIComponent('/admin')}`),
  });

  return {
    invited: Boolean(result.invited),
    message: String(result.message ?? 'Invite processed.'),
  };
}

export function mapStaffError(error: unknown): string {
  const message = error && typeof error === 'object' && 'message' in error
    ? String((error as { message: string }).message)
    : 'Something went wrong';

  if (message.includes('email_already_staff')) return 'This email is already a staff member.';
  if (message.includes('auth_user_not_found')) return 'No registered account for this email yet. Use Send invite for new users.';
  if (message.includes('cannot_assign_role')) return 'Your role cannot assign that permission level.';
  if (message.includes('cannot_modify_owner')) return 'Only the owner can change owner accounts.';
  if (message.includes('cannot_modify_admin')) return 'Only the owner can change admin accounts.';
  if (message.includes('cannot_change_own_role')) return 'You cannot change your own role.';
  if (message.includes('cannot_deactivate_self')) return 'You cannot deactivate your own account.';
  if (message.includes('cannot_remove_last_owner')) return 'Cannot deactivate the last active owner.';
  if (message.includes('permission_denied')) {
    return 'You do not have permission to view staff. Run FIX_STAFF_LIST.sql in Supabase SQL Editor.';
  }
  if (message.includes('Could not find the function') || message.includes('list_staff_members')) {
    return 'Staff list is not set up in the database yet. Run supabase/FIX_STAFF_LIST.sql in Supabase → SQL Editor.';
  }
  if (message.includes('Failed to fetch')) {
    return 'Network error talking to Supabase. Run LINK_EXISTING_STAFF.sql, then use Link account for registered users.';
  }
  return message;
}
