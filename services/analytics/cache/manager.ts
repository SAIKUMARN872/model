// services/analytics/cache/manager.ts

import type {
  RedisClient,
} from "./redis.js";

export interface CacheManagerOptions {
  defaultTtlSeconds?: number;

  keyPrefix?: string;

  maxValueSizeBytes?: number;
}

export interface CacheSetOptions {
  ttlSeconds?: number;
}

export interface CacheStats {
  hits: number;

  misses: number;

  sets: number;

  deletes: number;

  errors: number;

  hitRate: number;
}

export interface CacheHealth {
  healthy: boolean;

  hits: number;

  misses: number;

  hitRate: number;
}

const DEFAULT_TTL_SECONDS = 300;

const DEFAULT_KEY_PREFIX =
  "modelnow:cache";

const DEFAULT_MAX_VALUE_SIZE_BYTES =
  5 * 1024 * 1024;

function createHashHex(input: string): string {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
    0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
    0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
    0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  function rotr(value: number, bits: number): number {
    return (value >>> bits) | (value << (32 - bits));
  }

  function ch(x: number, y: number, z: number): number {
    return (x & y) ^ (~x & z);
  }

  function maj(x: number, y: number, z: number): number {
    return (x & y) ^ (x & z) ^ (y & z);
  }

  function sigma0(x: number): number {
    return rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22);
  }

  function sigma1(x: number): number {
    return rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25);
  }

  function gamma0(x: number): number {
    return rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3);
  }

  function gamma1(x: number): number {
    return rotr(x, 17) ^ rotr(x, 19) ^ (x >>> 10);
  }

  const bytes = new TextEncoder().encode(input);
  const bitLength = bytes.length * 8;
  const padded = new Uint8Array(((bytes.length + 9 + 63) & ~63));

  padded.set(bytes, 0);
  padded[bytes.length] = 0x80;

  const lengthBytes = new Uint8Array(8);
  for (let index = 0; index < 8; index += 1) {
    lengthBytes[7 - index] = (bitLength >>> (index * 8)) & 0xff;
  }

  padded.set(lengthBytes, padded.length - 8);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  for (let blockIndex = 0; blockIndex < padded.length; blockIndex += 64) {
    const schedule = new Uint32Array(64);

    for (let index = 0; index < 16; index += 1) {
      const offset = blockIndex + index * 4;
      schedule[index] =
        (padded[offset] << 24) |
        (padded[offset + 1] << 16) |
        (padded[offset + 2] << 8) |
        padded[offset + 3];
    }

    for (let index = 16; index < 64; index += 1) {
      schedule[index] =
        (gamma1(schedule[index - 2]) + schedule[index - 7] + gamma0(schedule[index - 15]) + schedule[index - 16]) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let index = 0; index < 64; index += 1) {
      const t1 =
        (h + sigma1(e) + ch(e, f, g) + K[index] + schedule[index]) >>> 0;
      const t2 = (sigma0(a) + maj(a, b, c)) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  return [
    h0, h1, h2, h3, h4, h5, h6, h7,
  ]
    .map((value) => value.toString(16).padStart(8, "0"))
    .join("");
}

function assertNonEmpty(
  value: string,
  field: string,
): void {
  if (!value || value.trim().length === 0) {
    throw new Error(
      `${field} must not be empty`,
    );
  }
}

function validateTtl(
  ttlSeconds: number,
): void {
  if (
    !Number.isFinite(ttlSeconds) ||
    ttlSeconds <= 0
  ) {
    throw new Error(
      "TTL must be a positive number",
    );
  }
}

function estimateBytes(
  value: string,
): number {
  return new TextEncoder().encode(value).length;
}

export class CacheManager {
  private readonly redis: RedisClient;

  private readonly defaultTtlSeconds: number;

  private readonly keyPrefix: string;

  private readonly maxValueSizeBytes: number;

  private hits = 0;

  private misses = 0;

  private sets = 0;

  private deletes = 0;

  private errors = 0;

  constructor(
    redis: RedisClient,
    options: CacheManagerOptions = {},
  ) {
    this.redis = redis;

    this.defaultTtlSeconds =
      options.defaultTtlSeconds ??
      DEFAULT_TTL_SECONDS;

    this.keyPrefix =
      options.keyPrefix ??
      DEFAULT_KEY_PREFIX;

    this.maxValueSizeBytes =
      options.maxValueSizeBytes ??
      DEFAULT_MAX_VALUE_SIZE_BYTES;

    validateTtl(
      this.defaultTtlSeconds,
    );

    assertNonEmpty(
      this.keyPrefix,
      "keyPrefix",
    );

    if (
      !Number.isInteger(
        this.maxValueSizeBytes,
      ) ||
      this.maxValueSizeBytes <= 0
    ) {
      throw new Error(
        "maxValueSizeBytes must be a positive integer",
      );
    }
  }

  /**
   * Generate a tenant-isolated cache key.
   */
  buildKey(
    organizationId: string,
    key: string,
  ): string {
    assertNonEmpty(
      organizationId,
      "organizationId",
    );

    assertNonEmpty(key, "key");

    return [
      this.keyPrefix,
      organizationId,
      key,
    ].join(":");
  }

  /**
   * Generate a deterministic hash suitable for
   * large/complex cache keys.
   */
  hashKey(
    value: string,
  ): string {
    assertNonEmpty(value, "value");

    return createHashHex(value);
  }

  /**
   * Store a JSON-serializable value.
   */
  async set<T>(
    organizationId: string,
    key: string,
    value: T,
    options: CacheSetOptions = {},
  ): Promise<void> {
    const cacheKey = this.buildKey(
      organizationId,
      key,
    );

    const ttlSeconds =
      options.ttlSeconds ??
      this.defaultTtlSeconds;

    validateTtl(ttlSeconds);

    let serialized: string;

    try {
      serialized = JSON.stringify(value);
    } catch (error) {
      this.errors++;

      throw new Error(
        `Failed to serialize cache value: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`,
      );
    }

    if (serialized === undefined) {
      this.errors++;

      throw new Error(
        "Cache value is not JSON serializable",
      );
    }

    const size = estimateBytes(
      serialized,
    );

    if (
      size > this.maxValueSizeBytes
    ) {
      this.errors++;

      throw new Error(
        `Cache value exceeds maximum size of ${this.maxValueSizeBytes} bytes`,
      );
    }

    try {
      await this.redis.set(
        cacheKey,
        serialized,
        ttlSeconds,
      );

      this.sets++;
    } catch (error) {
      this.errors++;

      throw error;
    }
  }

  /**
   * Retrieve a cached JSON value.
   */
  async get<T>(
    organizationId: string,
    key: string,
  ): Promise<T | null> {
    const cacheKey = this.buildKey(
      organizationId,
      key,
    );

    let serialized: string | null;

    try {
      serialized =
        await this.redis.get(cacheKey);
    } catch (error) {
      this.errors++;

      throw error;
    }

    if (serialized === null) {
      this.misses++;

      return null;
    }

    try {
      const value = JSON.parse(
        serialized,
      ) as T;

      this.hits++;

      return value;
    } catch (error) {
      this.errors++;

      await this.redis.delete(
        cacheKey,
      );

      throw new Error(
        `Invalid cached JSON for key ${cacheKey}: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`,
      );
    }
  }

  /**
   * Get a value or execute a loader on cache miss.
   */
  async getOrSet<T>(
    organizationId: string,
    key: string,
    loader: () => Promise<T>,
    options: CacheSetOptions = {},
  ): Promise<T> {
    const cached =
      await this.get<T>(
        organizationId,
        key,
      );

    if (cached !== null) {
      return cached;
    }

    const value = await loader();

    await this.set(
      organizationId,
      key,
      value,
      options,
    );

    return value;
  }

  /**
   * Check whether a cache entry exists.
   */
  async has(
    organizationId: string,
    key: string,
  ): Promise<boolean> {
    const cacheKey = this.buildKey(
      organizationId,
      key,
    );

    try {
      return await this.redis.exists(
        cacheKey,
      );
    } catch (error) {
      this.errors++;

      throw error;
    }
  }

  /**
   * Delete one cache entry.
   */
  async delete(
    organizationId: string,
    key: string,
  ): Promise<void> {
    const cacheKey = this.buildKey(
      organizationId,
      key,
    );

    try {
      await this.redis.delete(
        cacheKey,
      );

      this.deletes++;
    } catch (error) {
      this.errors++;

      throw error;
    }
  }

  /**
   * Update TTL for a cache entry.
   */
  async expire(
    organizationId: string,
    key: string,
    ttlSeconds: number,
  ): Promise<void> {
    validateTtl(ttlSeconds);

    const cacheKey = this.buildKey(
      organizationId,
      key,
    );

    try {
      await this.redis.expire(
        cacheKey,
        ttlSeconds,
      );
    } catch (error) {
      this.errors++;

      throw error;
    }
  }

  /**
   * Clear the configured cache backend.
   */
  async clear(): Promise<void> {
    try {
      await this.redis.clear();
    } catch (error) {
      this.errors++;

      throw error;
    }
  }

  /**
   * Return cache statistics.
   */
  stats(): CacheStats {
    const total =
      this.hits + this.misses;

    return {
      hits: this.hits,

      misses: this.misses,

      sets: this.sets,

      deletes: this.deletes,

      errors: this.errors,

      hitRate:
        total === 0
          ? 0
          : this.hits / total,
    };
  }

  /**
   * Check cache health.
   */
  async health(): Promise<CacheHealth> {
    try {
      const redisHealth =
        await this.redis.health();

      const stats = this.stats();

      return {
        healthy: redisHealth.healthy,

        hits: stats.hits,

        misses: stats.misses,

        hitRate: stats.hitRate,
      };
    } catch {
      return {
        healthy: false,

        hits: this.hits,

        misses: this.misses,

        hitRate: this.stats().hitRate,
      };
    }
  }
}