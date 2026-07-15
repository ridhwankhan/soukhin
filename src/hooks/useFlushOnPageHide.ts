import { useEffect, useRef } from 'react';
import { registerFlushOnPageHide } from '../lib/adminSessionCache';

export function useFlushOnPageHide(flush: () => void) {
  const flushRef = useRef(flush);
  flushRef.current = flush;

  useEffect(() => {
    return registerFlushOnPageHide(() => flushRef.current());
  }, []);
}
