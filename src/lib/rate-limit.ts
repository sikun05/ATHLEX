/**
 * Fixed-window in-memory rate limiter. Per server instance — good enough to
 * blunt abuse on forms; swap for Upstash/Redis for strict multi-region limits.
 */
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    return { ok: true, remaining: max - 1 };
  }
  b.count++;
  return { ok: b.count <= max, remaining: Math.max(0, max - b.count) };
}
