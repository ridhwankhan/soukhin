import { useEffect, useRef, useState, type ReactElement } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';

/** Keep recently visited admin pages mounted (hidden) so forms/modals survive sidebar navigation. */
const MAX_CACHED_ROUTES = 10;

// Module-level cache survives AdminLayout remounts (e.g. brief auth flicker on alt-tab).
const persistentOutletCache = new Map<string, ReactElement>();

export default function CachedAdminOutlet() {
  const location = useLocation();
  const outlet = useOutlet();
  const path = location.pathname;
  const visitOrder = useRef<string[]>(Array.from(persistentOutletCache.keys()));
  const [, bump] = useState(0);

  useEffect(() => {
    if (!outlet) return;

    persistentOutletCache.set(path, outlet as ReactElement);

    visitOrder.current = [path, ...visitOrder.current.filter((p) => p !== path)];
    if (visitOrder.current.length > MAX_CACHED_ROUTES) {
      const drop = visitOrder.current.slice(MAX_CACHED_ROUTES);
      visitOrder.current = visitOrder.current.slice(0, MAX_CACHED_ROUTES);
      for (const stale of drop) persistentOutletCache.delete(stale);
    }

    bump((n) => n + 1);
  }, [path, outlet]);

  const paths = Array.from(persistentOutletCache.keys());
  if (paths.length === 0) {
    return outlet ?? null;
  }

  return (
    <>
      {paths.map((cachedPath) => (
        <div
          key={cachedPath}
          className={cachedPath === path ? undefined : 'hidden'}
          aria-hidden={cachedPath !== path}
        >
          {persistentOutletCache.get(cachedPath)}
        </div>
      ))}
    </>
  );
}
