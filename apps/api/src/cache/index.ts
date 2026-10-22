import { connectRedisClient } from "./redis.client";

const CACHE_PREFIX = "modelnow:cache:";

export interface CacheOptions {
  /** Expiration duration in seconds. Omit for no expiration. */
  ttlSeconds?: number;
}

export interface CacheRedisClient {
  set(key: string, value: string, options?: { EX: number }): Promise<unknown>;
  get(key: string): Promise<string | null>;
  del(key: string): Promise<number>;
  exists(key: string): Promise<number>;
}

function getCacheKey(key: string): string {
  if (typeof key !== "string" || key.trim().length === 0) {
    throw new TypeError("Cache key must be a non-empty string.");
  }

  return `${CACHE_PREFIX}${key}`;
}

function validateOptions(options: CacheOptions): void {
  if (options.ttlSeconds === undefined) return;

  if (!Number.isSafeInteger(options.ttlSeconds) || options.ttlSeconds <= 0) {
    throw new RangeError("ttlSeconds must be a positive safe integer.");
  }
}

export function createCache(getClient: () => Promise<CacheRedisClient>) {
  return {
    async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
      validateOptions(options);

      const serialized = JSON.stringify(value);
      if (serialized === undefined) {
        throw new TypeError("Cache value must be JSON-serializable.");
      }

      const cacheKey = getCacheKey(key);
      const client = await getClient();

      if (options.ttlSeconds !== undefined) {
        await client.set(cacheKey, serialized, { EX: options.ttlSeconds });
      } else {
        await client.set(cacheKey, serialized);
      }
    },

    async get<T>(key: string): Promise<T | null> {
      const cacheKey = getCacheKey(key);
      const client = await getClient();
      const serialized = await client.get(cacheKey);

      if (serialized === null) return null;
      return JSON.parse(serialized) as T;
    },

    async delete(key: string): Promise<boolean> {
      const cacheKey = getCacheKey(key);
      const client = await getClient();
      return (await client.del(cacheKey)) > 0;
    },

    async has(key: string): Promise<boolean> {
      const cacheKey = getCacheKey(key);
      const client = await getClient();
      return (await client.exists(cacheKey)) > 0;
    },
  };
}

const defaultCache = createCache(connectRedisClient);

export const setCache = defaultCache.set;
export const getCache = defaultCache.get;
export const deleteCache = defaultCache.delete;
export const hasCache = defaultCache.has;

export { closeRedisClient, isRedisReady } from "./redis.client";

export const cache = {
  get: getCache,
  set: setCache,
  delete: deleteCache,
  has: hasCache,
};