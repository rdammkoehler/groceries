/**
 * In-memory sliding window rate limiter for Next.js API routes.
 *
 * Tracks request counts per IP over a 60-second sliding window.
 * Suitable for single-instance deployments (Docker Swarm with one replica).
 *
 * Limit: 60 requests per IP per minute.
 */

const WINDOW_MS = 60_000; // 1 minute
export const MAX_REQUESTS = 60; // requests per window

// Map of IP → sorted list of request timestamps within current window
const ipTimestamps = new Map<string, number[]>();

// Evict stale IP entries periodically to prevent unbounded memory growth.
// Runs every 5 minutes; removes IPs whose last request is older than WINDOW_MS.
let lastEviction = Date.now();
const EVICTION_INTERVAL_MS = 5 * 60_000;

function evictStale(now: number): void {
  if (now - lastEviction < EVICTION_INTERVAL_MS) return;
  lastEviction = now;
  const cutoff = now - WINDOW_MS;
  for (const [ip, timestamps] of ipTimestamps) {
    if (timestamps.length === 0 || timestamps[timestamps.length - 1] < cutoff) {
      ipTimestamps.delete(ip);
    }
  }
}

export interface RateLimitResult {
  limited: boolean;
  remaining: number;
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  evictStale(now);

  const windowStart = now - WINDOW_MS;
  const existing = ipTimestamps.get(ip) ?? [];

  // Drop timestamps outside the current window
  let start = 0;
  while (start < existing.length && existing[start] <= windowStart) {
    start++;
  }
  const active = start > 0 ? existing.slice(start) : existing;

  if (active.length >= MAX_REQUESTS) {
    ipTimestamps.set(ip, active);
    return { limited: true, remaining: 0 };
  }

  active.push(now);
  ipTimestamps.set(ip, active);
  return { limited: false, remaining: MAX_REQUESTS - active.length };
}

/**
 * Reset all rate limit state. Intended for use in tests only.
 */
export function resetRateLimitState(): void {
  ipTimestamps.clear();
  lastEviction = Date.now();
}
