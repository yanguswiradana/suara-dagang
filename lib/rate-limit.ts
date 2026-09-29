// In-memory per-IP rate limit. NOTE: resets on serverless cold start /
// across instances - good enough for MVP quota protection, not abuse-proof.

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_HITS = 10;

const hits = new Map<string, number[]>();

export function checkRateLimit(ip: string): {
  allowed: boolean;
  retryAfterSec: number;
} {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_HITS) {
    const retryAfterSec = Math.ceil((arr[0] + WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSec };
  }
  arr.push(now);
  hits.set(ip, arr);
  return { allowed: true, retryAfterSec: 0 };
}
