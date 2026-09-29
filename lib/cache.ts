import { createHash } from "crypto";

// In-memory cache keyed by input hash. Same caveat as rate-limit:
// resets on cold start, but still saves quota within a warm session.

const TTL_MS = 24 * 60 * 60 * 1000; // 24h
const MAX_ENTRIES = 200;

const store = new Map<string, { data: unknown; exp: number }>();

export function hashInput(obj: object): string {
  return createHash("sha256")
    .update(JSON.stringify(obj))
    .digest("hex")
    .slice(0, 32);
}

export function getCache<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.exp) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache(key: string, data: unknown): void {
  if (store.size >= MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest) store.delete(oldest);
  }
  store.set(key, { data, exp: Date.now() + TTL_MS });
}
