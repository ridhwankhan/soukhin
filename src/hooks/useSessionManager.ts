import { useCallback, useEffect, useRef, useState } from 'react';
import {
  SessionScope,
  SESSION_POLICIES,
  clearSessionMarkers,
  getIdleRemainingMs,
  getSessionStatus,
  markSessionActive,
  touchSession,
} from '../lib/sessionManager';

interface UseSessionManagerOptions {
  scope: SessionScope;
  isAuthenticated: boolean;
  onExpire: () => void | Promise<void>;
}

export function useSessionManager({ scope, isAuthenticated, onExpire }: UseSessionManagerOptions) {
  const [showWarning, setShowWarning] = useState(false);
  const [idleRemainingMs, setIdleRemainingMs] = useState(SESSION_POLICIES[scope].idleTimeoutMs);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const policy = SESSION_POLICIES[scope];

  const extendSession = useCallback(() => {
    touchSession(scope);
    setShowWarning(false);
    setIdleRemainingMs(getIdleRemainingMs(scope, policy));
  }, [scope, policy]);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowWarning(false);
      return;
    }

    markSessionActive(scope);

    const onActivity = () => touchSession(scope);
    const events: (keyof WindowEventMap)[] = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, onActivity, { passive: true }));

    const interval = window.setInterval(() => {
      const status = getSessionStatus(scope, policy);
      const remaining = getIdleRemainingMs(scope, policy);
      setIdleRemainingMs(remaining);

      if (status === 'expired') {
        clearSessionMarkers(scope);
        void onExpireRef.current();
        return;
      }

      setShowWarning(status === 'warning');
    }, 30_000);

    return () => {
      events.forEach((event) => window.removeEventListener(event, onActivity));
      window.clearInterval(interval);
    };
  }, [isAuthenticated, scope, policy]);

  return { showWarning, idleRemainingMs, extendSession, policy };
}
