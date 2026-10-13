import type {
  RateLimitRule,
} from "./rules.js";
import {
  QuotaManager,
} from "./quota.js";

export class RateLimiter {
  constructor(
    private readonly quotaManager = new QuotaManager(),
  ) {}

  consume(
    key: string,
    rule: RateLimitRule,
    amount = 1,
  ): boolean {
    this.quotaManager.consume(
      key,
      rule.limit,
      rule.windowMs,
      amount,
    );

    return true;
  }

  remaining(
    key: string,
    rule: RateLimitRule,
  ): number {
    const quota = this.quotaManager.get(key);

    if (!quota) {
      return rule.limit;
    }

    return Math.max(
      0,
      rule.limit - quota.used,
    );
  }
}
