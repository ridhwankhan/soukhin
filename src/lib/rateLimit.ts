const STORAGE_PREFIX = 'soukhin_rl_';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

function readEntry(key: string): RateLimitEntry | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as RateLimitEntry;
  } catch {
    return null;
  }
}

function writeEntry(key: string, entry: RateLimitEntry): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Storage full or disabled — allow request; server enforces limits
  }
}

export interface ClientRateLimitResult {
  allowed: boolean;
  retryAfterMs: number;
}

/** Client-side throttle — complements server rate limits */
export function checkClientRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): ClientRateLimitResult {
  const now = Date.now();
  const entry = readEntry(key);

  if (!entry || now >= entry.resetAt) {
    writeEntry(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false, retryAfterMs: Math.max(0, entry.resetAt - now) };
  }

  writeEntry(key, { count: entry.count + 1, resetAt: entry.resetAt });
  return { allowed: true, retryAfterMs: 0 };
}

export function formatRetryAfter(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  if (seconds < 60) return `${seconds} second${seconds === 1 ? '' : 's'}`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
}

export function isRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const message = 'message' in error ? String((error as { message: string }).message) : '';
  return message.includes('rate_limit_exceeded') || message.includes('P0001');
}
