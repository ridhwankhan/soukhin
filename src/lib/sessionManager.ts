export type SessionScope = 'customer' | 'admin';

export interface SessionPolicy {
  scope: SessionScope;
  idleTimeoutMs: number;
  absoluteTimeoutMs: number;
  warningBeforeMs: number;
}

export const SESSION_POLICIES: Record<SessionScope, SessionPolicy> = {
  customer: {
    scope: 'customer',
    idleTimeoutMs: 60 * 60 * 1000, // 1 hour idle
    absoluteTimeoutMs: 7 * 24 * 60 * 60 * 1000, // 7 days
    warningBeforeMs: 5 * 60 * 1000, // warn 5 min before idle logout
  },
  admin: {
    scope: 'admin',
    idleTimeoutMs: 30 * 60 * 1000, // 30 min idle
    absoluteTimeoutMs: 8 * 60 * 60 * 1000, // 8 hour shift
    warningBeforeMs: 2 * 60 * 1000,
  },
};

const STORAGE_KEYS = {
  startedAt: (scope: SessionScope) => `soukhin_session_started_${scope}`,
  lastActivity: (scope: SessionScope) => `soukhin_session_activity_${scope}`,
  scope: 'soukhin_active_session_scope',
};

export function markSessionActive(scope: SessionScope): void {
  const now = Date.now().toString();
  try {
    if (!sessionStorage.getItem(STORAGE_KEYS.startedAt(scope))) {
      sessionStorage.setItem(STORAGE_KEYS.startedAt(scope), now);
    }
    sessionStorage.setItem(STORAGE_KEYS.lastActivity(scope), now);
    sessionStorage.setItem(STORAGE_KEYS.scope, scope);
  } catch {
    // Private browsing — session checks become no-ops
  }
}

export function touchSession(scope: SessionScope): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.lastActivity(scope), Date.now().toString());
  } catch {
    // ignore
  }
}

export function clearSessionMarkers(scope: SessionScope): void {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.startedAt(scope));
    sessionStorage.removeItem(STORAGE_KEYS.lastActivity(scope));
    if (sessionStorage.getItem(STORAGE_KEYS.scope) === scope) {
      sessionStorage.removeItem(STORAGE_KEYS.scope);
    }
  } catch {
    // ignore
  }
}

export type SessionStatus = 'active' | 'warning' | 'expired';

export function getSessionStatus(scope: SessionScope, policy = SESSION_POLICIES[scope]): SessionStatus {
  try {
    const startedAt = Number(sessionStorage.getItem(STORAGE_KEYS.startedAt(scope)) ?? Date.now());
    const lastActivity = Number(sessionStorage.getItem(STORAGE_KEYS.lastActivity(scope)) ?? startedAt);
    const now = Date.now();

    if (now - startedAt >= policy.absoluteTimeoutMs) return 'expired';
    if (now - lastActivity >= policy.idleTimeoutMs) return 'expired';
    if (now - lastActivity >= policy.idleTimeoutMs - policy.warningBeforeMs) return 'warning';
    return 'active';
  } catch {
    return 'active';
  }
}

export function getIdleRemainingMs(scope: SessionScope, policy = SESSION_POLICIES[scope]): number {
  try {
    const lastActivity = Number(sessionStorage.getItem(STORAGE_KEYS.lastActivity(scope)) ?? Date.now());
    return Math.max(0, policy.idleTimeoutMs - (Date.now() - lastActivity));
  } catch {
    return policy.idleTimeoutMs;
  }
}
