import { supabase } from './supabase';
import { checkClientRateLimit, formatRetryAfter } from './rateLimit';
import { AdminRole, AdminUser } from '../types';

interface AdminProfileRow {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

function mapAdminProfile(row: AdminProfileRow): AdminUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    avatar: row.avatar,
    createdAt: row.createdAt,
    lastLogin: row.lastLogin,
  };
}

export async function fetchMyAdminProfile(): Promise<AdminUser | null> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return null;

  const { data, error } = await supabase.rpc('get_my_admin_profile');
  if (error || !data) return null;

  return mapAdminProfile(data as AdminProfileRow);
}

/** Retry profile fetch — helps right after sign-in before JWT is fully ready. */
export async function fetchMyAdminProfileWithRetry(attempts = 3): Promise<AdminUser | null> {
  for (let i = 0; i < attempts; i++) {
    const profile = await fetchMyAdminProfile();
    if (profile) return profile;
    if (i < attempts - 1) {
      await new Promise((r) => window.setTimeout(r, 400));
    }
  }
  return null;
}

export async function signInAdmin(email: string, password: string): Promise<{ admin?: AdminUser; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const attemptLimit = checkClientRateLimit(`admin_signin:${normalizedEmail}`, 8, 15 * 60 * 1000);
  if (!attemptLimit.allowed) {
    return { error: `Too many sign-in attempts. Try again in ${formatRetryAfter(attemptLimit.retryAfterMs)}.` };
  }

  const { data: isStaff, error: staffCheckError } = await supabase.rpc('is_staff_email', {
    p_email: normalizedEmail,
  });

  if (staffCheckError) {
    return { error: 'Could not verify staff access.' };
  }

  if (!isStaff) {
    return { error: 'This email is not authorized for admin access.' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user && !data.user.email_confirmed_at) {
    await supabase.auth.signOut();
    return { error: 'Please verify your email before signing in to the admin panel.' };
  }

  const admin = await fetchMyAdminProfile();
  if (!admin) {
    await supabase.auth.signOut();
    return { error: 'Your account is not linked to an active admin profile. Contact the store owner.' };
  }

  return { admin };
}

export async function signOutAdmin(): Promise<void> {
  await supabase.auth.signOut();
}

export async function checkStaffEmail(email: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_staff_email', { p_email: email.trim().toLowerCase() });
  if (error) return false;
  return Boolean(data);
}
