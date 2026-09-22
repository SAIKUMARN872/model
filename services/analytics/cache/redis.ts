// services/analytics/cache/redis.ts

export interface RedisClient {
  get(key: string): Promise<string | null>;

  set(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<void>;

  delete(key: string): Promise<void>;

  exists(key: string): Promise<boolean>;

  expire(
    key: string,
    ttlSeconds: number,
  ): Promise<void>;

  clear(): Promise<void>;

  health(): Promise<{
    healthy: boolean;
  }>;
}

interface RedisEntry {
  value: string;
  expiresAt?: number;
}

/**
 * In-memory Redis-compatible implementation.
 *
 * This implementation keeps the cache module testable without
 * requiring an external Redis server.
 *
 * In production, this interface can be backed by Redis/Valkey.
 */
export class InMemoryRedisClient
  implements RedisClient
{
  private readonly store = new Map<
    string,
    RedisEntry
  >();

  async get(
    key: string,
  ): Promise<string | null> {
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    if (
      entry.expiresAt !== undefined &&
      entry.expiresAt <= Date.now()
    ) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<void> {
    if (!key || key.trim().length === 0) {
      throw new Error("Cache key must not be empty");
    }

    if (
      ttlSeconds !== undefined &&
      (!Number.isFinite(ttlSeconds) ||
        ttlSeconds <= 0)
    ) {
      throw new Error(
        "TTL must be a positive number",
      );
    }

    const expiresAt =
      ttlSeconds === undefined
        ? undefined
        : Date.now() +
          ttlSeconds * 1000;

    this.store.set(key, {
      value,
      expiresAt,
    });
  }

  async delete(
    key: string,
  ): Promise<void> {
    this.store.delete(key);
  }

  async exists(
    key: string,
  ): Promise<boolean> {
    const value = await this.get(key);

    return value !== null;
  }

  async expire(
    key: string,
    ttlSeconds: number,
  ): Promise<void> {
    if (
      !Number.isFinite(ttlSeconds) ||
      ttlSeconds <= 0
    ) {
      throw new Error(
        "TTL must be a positive number",
      );
    }

    const entry = this.store.get(key);

    if (!entry) {
      return;
    }

    entry.expiresAt =
      Date.now() + ttlSeconds * 1000;
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  async health(): Promise<{
    healthy: boolean;
  }> {
    return {
      healthy: true,
    };
  }
}