import { useCallback, useEffect, useRef, useState } from 'react';
import { useFlushOnPageHide } from './useFlushOnPageHide';

const PREFIX = 'soukhin_draft_';

function readDraft<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${key}`);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeDraft<T>(key: string, value: T): void {
  try {
    sessionStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

export function clearAdminFormDraft(key: string): void {
  try {
    sessionStorage.removeItem(`${PREFIX}${key}`);
  } catch {
    // ignore
  }
}

/** Persist form state to sessionStorage — survives alt-tab and brief remounts. */
export function useAdminFormDraft<T>(key: string, initial: T, enabled = true) {
  const [state, setState] = useState<T>(() => {
    if (!enabled) return initial;
    return readDraft<T>(key) ?? initial;
  });
  const stateRef = useRef(state);
  stateRef.current = state;

  const persist = useCallback(() => {
    if (!enabled) return;
    writeDraft(key, stateRef.current);
  }, [key, enabled]);

  useFlushOnPageHide(persist);

  useEffect(() => {
    if (!enabled) return;
    const timer = window.setTimeout(persist, 350);
    return () => window.clearTimeout(timer);
  }, [state, persist, enabled]);

  const clearDraft = useCallback(() => {
    clearAdminFormDraft(key);
  }, [key]);

  return { state, setState, persist, clearDraft } as const;
}

/** Save/restore existing useState fields without restructuring the form. */
export function usePersistFormDraft<T>(
  key: string,
  getSnapshot: () => T,
  applySnapshot: (draft: T) => void,
  deps: readonly unknown[],
  enabled = true
) {
  const getRef = useRef(getSnapshot);
  getRef.current = getSnapshot;
  const appliedRef = useRef(false);

  const persist = useCallback(() => {
    if (!enabled) return;
    writeDraft(key, getRef.current());
  }, [key, enabled]);

  const clearDraft = useCallback(() => {
    clearAdminFormDraft(key);
  }, [key]);

  useEffect(() => {
    if (!enabled || appliedRef.current) return;
    const draft = readDraft<T>(key);
    if (draft) applySnapshot(draft);
    appliedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  useFlushOnPageHide(persist);

  useEffect(() => {
    if (!enabled) return;
    const timer = window.setTimeout(persist, 350);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled]);

  return { persist, clearDraft };
}
