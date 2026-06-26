import { AdminRole } from '../types';

/** Owner & admin manage the store; other staff may also shop as customers. */
export function canStaffUseStorefront(role: AdminRole): boolean {
  return role !== 'owner' && role !== 'admin';
}

export function isStorefrontReturnPath(path: string): boolean {
  if (!path || !path.startsWith('/')) return false;
  if (path.startsWith('/admin')) return false;
  if (path.startsWith('/auth')) return false;
  return true;
}

/** Where to send someone after sign-in at /auth */
export function getStaffPostLoginPath(role: AdminRole, returnTo: string): string {
  if (canStaffUseStorefront(role) && isStorefrontReturnPath(returnTo)) {
    return returnTo;
  }
  return '/admin';
}

export function getUnifiedLoginPath(returnTo = '/admin'): string {
  const safe = returnTo.startsWith('/') ? returnTo : '/admin';
  return `/auth?mode=login&returnTo=${encodeURIComponent(safe)}`;
}
