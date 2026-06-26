/**
 * Rate limiting with an optional shared backend.
 *
 * If UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set, limits are
 * enforced GLOBALLY across all serverless instances (fixed-window counter in
 * Redis). Otherwise it falls back to a best-effort in-memory limiter (per warm
 * instance) so local dev and un-provisioned deploys still work — just with
 * weaker guarantees. Provision Upstash (free tier) for real protection.
 */
export interface RateLimitOptions {
  max: number;
  windowMs: number;
}
export interface RateLimitResult {
  limited: boolean;
  remaining: number;
}

const memHits = new Map<string, number[]>();
function memoryLimit(
  key: string,
  { max, windowMs }: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const recent = (memHits.get(key) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  memHits.set(key, recent);
  // Opportunistic cleanup so the map can't grow unbounded on a long-lived instance.
  if (memHits.size > 5000) {
    for (const [k, v] of memHits) {
      if (!v.some((t) => now - t < windowMs)) memHits.delete(k);
    }
  }
  return { limited: recent.length > max, remaining: Math.max(0, max - recent.length) };
}

async function upstash(command: (string | number)[]): Promise<{ result: unknown }> {
  const res = await fetch(process.env.UPSTASH_REDIS_REST_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN!}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}`);
  return res.json();
}

export async function rateLimit(
  key: string,
  opts: RateLimitOptions,
): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return memoryLimit(key, opts);
  try {
    const bucket = Math.floor(Date.now() / opts.windowMs);
    const k = `rl:${key}:${bucket}`;
    const { result } = await upstash(["INCR", k]);
    const count = Number(result) || 0;
    // Set the bucket's TTL once, on first hit.
    if (count === 1) await upstash(["PEXPIRE", k, opts.windowMs]);
    return { limited: count > opts.max, remaining: Math.max(0, opts.max - count) };
  } catch {
    // On a backend hiccup, degrade to in-memory rather than locking users out.
    return memoryLimit(key, opts);
  }
}
