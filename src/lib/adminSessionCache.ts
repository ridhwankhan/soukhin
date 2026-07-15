import { AdminUser } from '../types';

const ADMIN_PROFILE_KEY = 'soukhin_admin_profile_v1';
const STAFF_ACCESS_KEY = 'soukhin_staff_access_granted_v1';

export function markStaffAccessGranted(): void {
  try {
    sessionStorage.setItem(STAFF_ACCESS_KEY, '1');
  } catch {
    // ignore
  }
}

export function hasStaffAccessGranted(): boolean {
  try {
    return sessionStorage.getItem(STAFF_ACCESS_KEY) === '1';
  } catch {
    return false;
  }
}

export function clearStaffAccessGranted(): void {
  try {
    sessionStorage.removeItem(STAFF_ACCESS_KEY);
  } catch {
    // ignore
  }
}

const LAST_ADMIN_PATH_KEY = 'soukhin_last_admin_path_v1';

export function saveLastAdminPath(path: string): void {
  try {
    if (path.startsWith('/admin') && path !== '/admin/login') {
      sessionStorage.setItem(LAST_ADMIN_PATH_KEY, path);
    }
  } catch {
    // ignore
  }
}

export function readLastAdminPath(): string | null {
  try {
    const path = sessionStorage.getItem(LAST_ADMIN_PATH_KEY);
    if (path?.startsWith('/admin') && path !== '/admin/login') return path;
    return null;
  } catch {
    return null;
  }
}

export function clearLastAdminPath(): void {
  try {
    sessionStorage.removeItem(LAST_ADMIN_PATH_KEY);
  } catch {
    // ignore
  }
}

export function cacheAdminProfile(admin: AdminUser): void {
  try {
    sessionStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(admin));
  } catch {
    // ignore quota errors
  }
}

export function readCachedAdminProfile(): AdminUser | null {
  try {
    const raw = sessionStorage.getItem(ADMIN_PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function clearCachedAdminProfile(): void {
  try {
    sessionStorage.removeItem(ADMIN_PROFILE_KEY);
  } catch {
    // ignore
  }
}

/** Flush sessionStorage drafts when the tab is hidden (before blur/unload). */
export function registerFlushOnPageHide(flush: () => void): () => void {
  const onHide = () => {
    if (document.visibilityState === 'hidden') flush();
  };
  window.addEventListener('pagehide', onHide);
  document.addEventListener('visibilitychange', onHide);
  return () => {
    window.removeEventListener('pagehide', onHide);
    document.removeEventListener('visibilitychange', onHide);
  };
}
