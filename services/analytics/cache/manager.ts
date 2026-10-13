import type { CacheStore } from "./index.js";

export class CacheManager implements CacheStore {
  private readonly cache = new Map<string, {
    value: unknown;
    expiresAt?: number;
  }>();

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    if (
      entry.expiresAt !== undefined &&
      Date.now() >= entry.expiresAt
    ) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs?: number): void {
    if (!key.trim()) {
      throw new Error("Cache key is required");
    }

    if (
      ttlMs !== undefined &&
      (!Number.isFinite(ttlMs) || ttlMs < 0)
    ) {
      throw new Error("Invalid cache TTL");
    }

    this.cache.set(key, {
      value,
      ...(ttlMs !== undefined
        ? { expiresAt: Date.now() + ttlMs }
        : {}),
    });
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}
