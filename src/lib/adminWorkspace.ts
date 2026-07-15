const PREFIX = 'soukhin_admin_ws_';

export function saveAdminWorkspace<T>(routeKey: string, state: T): void {
  try {
    sessionStorage.setItem(`${PREFIX}${routeKey}`, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

export function loadAdminWorkspace<T>(routeKey: string): T | null {
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${routeKey}`);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearAdminWorkspace(routeKey: string): void {
  try {
    sessionStorage.removeItem(`${PREFIX}${routeKey}`);
  } catch {
    // ignore
  }
}
