export interface SecurityRateLimitRule {
  id: string;
  limit: number;
  windowMs: number;
  enabled?: boolean;
}

export interface RateLimitRequest {
  key: string;
  ruleId?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  key: string;
  ruleId: string;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterMs: number;
}

interface RateLimitBucket {
  count: number;
  windowStart: number;
}

export interface RateLimitHealth {
  healthy: boolean;
  ruleCount: number;
  bucketCount: number;
}

export class SecurityRateLimiter {
  private readonly rules = new Map<
    string,
    SecurityRateLimitRule
  >();

  private readonly buckets = new Map<
    string,
    RateLimitBucket
  >();

  addRule(rule: SecurityRateLimitRule): void {
    if (!rule.id.trim()) {
      throw new Error("Rate limit rule id is required");
    }

    if (!Number.isInteger(rule.limit) || rule.limit <= 0) {
      throw new Error(
        "Rate limit must be a positive integer",
      );
    }

    if (
      !Number.isFinite(rule.windowMs) ||
      rule.windowMs <= 0
    ) {
      throw new Error(
        "Rate limit windowMs must be greater than zero",
      );
    }

    if (this.rules.has(rule.id)) {
      throw new Error(
        `Rate limit rule already exists: ${rule.id}`,
      );
    }

    this.rules.set(rule.id, {
      ...rule,
      enabled: rule.enabled ?? true,
    });
  }

  updateRule(
    id: string,
    updates: Partial<Omit<SecurityRateLimitRule, "id">>,
  ): SecurityRateLimitRule {
    const existing = this.rules.get(id);

    if (!existing) {
      throw new Error(`Rate limit rule not found: ${id}`);
    }

    const updated: SecurityRateLimitRule = {
      ...existing,
      ...updates,
      id,
    };

    if (!Number.isInteger(updated.limit) || updated.limit <= 0) {
      throw new Error(
        "Rate limit must be a positive integer",
      );
    }

    if (
      !Number.isFinite(updated.windowMs) ||
      updated.windowMs <= 0
    ) {
      throw new Error(
        "Rate limit windowMs must be greater than zero",
      );
    }

    this.rules.set(id, updated);

    return { ...updated };
  }

  getRule(id: string): SecurityRateLimitRule | undefined {
    const rule = this.rules.get(id);

    return rule ? { ...rule } : undefined;
  }

  getRules(): SecurityRateLimitRule[] {
    return [...this.rules.values()].map((rule) => ({
      ...rule,
    }));
  }

  removeRule(id: string): boolean {
    for (const bucketKey of this.buckets.keys()) {
      if (bucketKey.startsWith(`${id}:`)) {
        this.buckets.delete(bucketKey);
      }
    }

    return this.rules.delete(id);
  }

  check(request: RateLimitRequest): RateLimitResult {
    if (!request.key.trim()) {
      throw new Error("Rate limit key is required");
    }

    const rule = this.resolveRule(request.ruleId);

    if (!rule) {
      throw new Error("No enabled rate limit rule available");
    }

    const now = Date.now();
    const bucketKey = `${rule.id}:${request.key}`;

    let bucket = this.buckets.get(bucketKey);

    if (
      !bucket ||
      now - bucket.windowStart >= rule.windowMs
    ) {
      bucket = {
        count: 0,
        windowStart: now,
      };

      this.buckets.set(bucketKey, bucket);
    }

    const allowed = bucket.count < rule.limit;

    if (allowed) {
      bucket.count += 1;
    }

    const remaining = Math.max(
      0,
      rule.limit - bucket.count,
    );

    const resetAt = bucket.windowStart + rule.windowMs;

    return {
      allowed,
      key: request.key,
      ruleId: rule.id,
      limit: rule.limit,
      remaining,
      resetAt,
      retryAfterMs: allowed
        ? 0
        : Math.max(0, resetAt - now),
    };
  }

  checkWithoutConsume(
    request: RateLimitRequest,
  ): RateLimitResult {
    if (!request.key.trim()) {
      throw new Error("Rate limit key is required");
    }

    const rule = this.resolveRule(request.ruleId);

    if (!rule) {
      throw new Error("No enabled rate limit rule available");
    }

    const now = Date.now();
    const bucketKey = `${rule.id}:${request.key}`;
    const bucket = this.buckets.get(bucketKey);

    if (
      !bucket ||
      now - bucket.windowStart >= rule.windowMs
    ) {
      return {
        allowed: true,
        key: request.key,
        ruleId: rule.id,
        limit: rule.limit,
        remaining: rule.limit,
        resetAt: now + rule.windowMs,
        retryAfterMs: 0,
      };
    }

    const remaining = Math.max(
      0,
      rule.limit - bucket.count,
    );

    const resetAt = bucket.windowStart + rule.windowMs;

    return {
      allowed: bucket.count < rule.limit,
      key: request.key,
      ruleId: rule.id,
      limit: rule.limit,
      remaining,
      resetAt,
      retryAfterMs:
        bucket.count >= rule.limit
          ? Math.max(0, resetAt - now)
          : 0,
    };
  }

  reset(key?: string, ruleId?: string): void {
    if (!key && !ruleId) {
      this.buckets.clear();
      return;
    }

    for (const bucketKey of this.buckets.keys()) {
      const separatorIndex = bucketKey.indexOf(":");

      const bucketRuleId = bucketKey.slice(
        0,
        separatorIndex,
      );

      const bucketUserKey = bucketKey.slice(
        separatorIndex + 1,
      );

      const ruleMatches =
        !ruleId || bucketRuleId === ruleId;

      const keyMatches =
        !key || bucketUserKey === key;

      if (ruleMatches && keyMatches) {
        this.buckets.delete(bucketKey);
      }
    }
  }

  clear(): void {
    this.rules.clear();
    this.buckets.clear();
  }

  size(): number {
    return this.rules.size;
  }

  bucketSize(): number {
    return this.buckets.size;
  }

  health(): RateLimitHealth {
    return {
      healthy: true,
      ruleCount: this.rules.size,
      bucketCount: this.buckets.size,
    };
  }

  private resolveRule(
    requestedRuleId?: string,
  ): SecurityRateLimitRule | undefined {
    if (requestedRuleId) {
      const rule = this.rules.get(requestedRuleId);

      if (!rule || rule.enabled === false) {
        return undefined;
      }

      return rule;
    }

    return [...this.rules.values()].find(
      (rule) => rule.enabled !== false,
    );
  }
}

export const securityRateLimiter =
  new SecurityRateLimiter();