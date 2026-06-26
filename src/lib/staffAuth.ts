import { AdminRole, AdminUser } from '../types';

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
  const safeReturn = returnTo.startsWith('/') ? returnTo : '/';

  // Owners & admins always land in the dashboard unless they were already heading there
  if (!canStaffUseStorefront(role)) {
    return '/admin';
  }

  // Other staff may shop — honour a real storefront return path, otherwise home
  if (isStorefrontReturnPath(safeReturn) && safeReturn !== '/') {
    return safeReturn;
  }

  return '/';
}

/** Any authenticated staff member (all roles) may open the admin dashboard. */
export function hasStaffDashboardAccess(admin: AdminUser | null | undefined): boolean {
  return Boolean(admin);
}

export function getUnifiedLoginPath(returnTo = '/admin'): string {
  const safe = returnTo.startsWith('/') ? returnTo : '/admin';
  return `/auth?mode=login&returnTo=${encodeURIComponent(safe)}`;
}
