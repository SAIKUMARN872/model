import {
  RateLimitRuleRegistry,
  type RateLimitRequest,
  type RateLimitRule,
} from "./rules.js";

export interface RateLimitResult {
  allowed: boolean;
  ruleId: string;
  key: string;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterMs: number;
}

interface BucketState {
  count: number;
  windowStart: number;
}

export interface RateLimiterOptions {
  registry?: RateLimitRuleRegistry;
}

export class RateLimiter {
  private readonly registry: RateLimitRuleRegistry;

  private readonly buckets = new Map<
    string,
    BucketState
  >();

  constructor(options: RateLimiterOptions = {}) {
    this.registry =
      options.registry ??
      new RateLimitRuleRegistry();
  }

  getRegistry(): RateLimitRuleRegistry {
    return this.registry;
  }

  private getBucket(
    rule: RateLimitRule,
    key: string,
  ): BucketState {
    const bucketKey = `${rule.id}:${key}`;

    const now = Date.now();

    let bucket = this.buckets.get(
      bucketKey,
    );

    if (
      !bucket ||
      now >=
        bucket.windowStart + rule.windowMs
    ) {
      bucket = {
        count: 0,
        windowStart: now,
      };

      this.buckets.set(bucketKey, bucket);
    }

    return bucket;
  }

  private evaluateRule(
    rule: RateLimitRule,
    key: string,
  ): RateLimitResult {
    const now = Date.now();

    const bucket = this.getBucket(
      rule,
      key,
    );

    const effectiveLimit =
      rule.burstLimit !== undefined
        ? Math.min(
            rule.limit,
            rule.burstLimit,
          )
        : rule.limit;

    const resetAt =
      bucket.windowStart +
      rule.windowMs;

    if (bucket.count >= effectiveLimit) {
      return {
        allowed: false,
        ruleId: rule.id,
        key,
        limit: effectiveLimit,
        remaining: 0,
        resetAt,
        retryAfterMs: Math.max(
          0,
          resetAt - now,
        ),
      };
    }

    bucket.count += 1;

    return {
      allowed: true,
      ruleId: rule.id,
      key,
      limit: effectiveLimit,
      remaining: Math.max(
        0,
        effectiveLimit - bucket.count,
      ),
      resetAt,
      retryAfterMs: 0,
    };
  }

  check(
    request: RateLimitRequest,
  ): RateLimitResult[] {
    const matches =
      this.registry.match(request);

    return matches.map(({ rule, key }) =>
      this.evaluateRule(rule, key),
    );
  }

  allow(
    request: RateLimitRequest,
  ): boolean {
    const results = this.check(request);

    return results.every(
      (result) => result.allowed,
    );
  }

  checkWithoutConsume(
    request: RateLimitRequest,
  ): RateLimitResult[] {
    const matches =
      this.registry.match(request);

    return matches.map(({ rule, key }) => {
      const bucket = this.getBucket(
        rule,
        key,
      );

      const now = Date.now();

      const effectiveLimit =
        rule.burstLimit !== undefined
          ? Math.min(
              rule.limit,
              rule.burstLimit,
            )
          : rule.limit;

      const resetAt =
        bucket.windowStart +
        rule.windowMs;

      const allowed =
        bucket.count < effectiveLimit;

      return {
        allowed,
        ruleId: rule.id,
        key,
        limit: effectiveLimit,
        remaining: Math.max(
          0,
          effectiveLimit - bucket.count,
        ),
        resetAt,
        retryAfterMs: allowed
          ? 0
          : Math.max(
              0,
              resetAt - now,
            ),
      };
    });
  }

  reset(
    ruleId?: string,
    key?: string,
  ): void {
    if (!ruleId) {
      this.buckets.clear();
      return;
    }

    const prefix = key
      ? `${ruleId}:${key}`
      : `${ruleId}:`;

    for (const bucketKey of this.buckets.keys()) {
      if (
        key
          ? bucketKey === prefix
          : bucketKey.startsWith(prefix)
      ) {
        this.buckets.delete(bucketKey);
      }
    }
  }

  clear(): void {
    this.buckets.clear();
  }

  size(): number {
    return this.buckets.size;
  }

  health(): {
    healthy: boolean;
    rules: number;
    buckets: number;
    timestamp: string;
  } {
    return {
      healthy: true,
      rules: this.registry.size(),
      buckets: this.buckets.size,
      timestamp: new Date().toISOString(),
    };
  }
}

export const rateLimiter =
  new RateLimiter();