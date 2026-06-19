import type { Verdict } from './types.js';

interface CacheEntry {
  verdict: Verdict;
  expiresAt: number;
}

export class VerdictCache {
  private cache = new Map<string, CacheEntry>();

  get(address: string): Verdict | null {
    const entry = this.cache.get(address.toLowerCase());
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(address.toLowerCase());
      return null;
    }
    return entry.verdict;
  }

  set(address: string, verdict: Verdict, ttlMs: number = 3600_000): void {
    this.cache.set(address.toLowerCase(), {
      verdict,
      expiresAt: Date.now() + ttlMs,
    });
  }

  invalidate(address: string): void {
    this.cache.delete(address.toLowerCase());
  }

  cleanup(): number {
    const now = Date.now();
    let removed = 0;
    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removed++;
      }
    }
    return removed;
  }

  size(): number {
    return this.cache.size;
  }

  clear(): void {
    this.cache.clear();
  }
}
