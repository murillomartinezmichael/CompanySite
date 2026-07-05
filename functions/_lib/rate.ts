// Per-IP sliding-window rate limit. In-memory Map, so this is per-isolate,
// not per-account. That's an intentional MVP compromise:
//
//   Real abuse mitigation stack on this endpoint = honeypot (silent-swallow) +
//   validation + Michael reviewing every submission personally. This rate
//   limit only exists to blunt accidental double-submits and casual scripts.
//
// If we ever see abuse survive the honeypot + validation, upgrade this to
// a Cloudflare KV counter with a compound key of (ip, day-bucket).

export type RateResult = { ok: true } | { ok: false; retryAfter: number };

const buckets = new Map<string, number[]>();

// Every N calls, sweep buckets whose newest hit has aged past 2× window.
// Prevents unbounded growth under a long-tail scan-attack across many IPs.
let sinceLastGc = 0;
const GC_EVERY = 200;

function gc(now: number, windowSeconds: number): void {
  const cutoff = now - windowSeconds * 2;
  for (const [ip, hits] of buckets) {
    const newest = hits[hits.length - 1];
    if (newest === undefined || newest < cutoff) buckets.delete(ip);
  }
}

export function checkRate(ip: string, maxPerWindow: number, windowSeconds: number): RateResult {
  const now = Date.now() / 1000;
  if (++sinceLastGc >= GC_EVERY) {
    sinceLastGc = 0;
    gc(now, windowSeconds);
  }
  const hits = (buckets.get(ip) || []).filter((t) => now - t < windowSeconds);
  if (hits.length >= maxPerWindow) {
    const oldest = hits[0];
    const retryAfter = Math.max(1, Math.ceil(windowSeconds - (now - oldest)));
    return { ok: false, retryAfter };
  }
  hits.push(now);
  buckets.set(ip, hits);
  return { ok: true };
}

// Exposed for tests only. Not part of the runtime contract.
export function __resetBuckets(): void {
  buckets.clear();
  sinceLastGc = 0;
}
