import {
  RateLimiter,
} from "../rate_limit/limiter.js";
import type {
  RateLimitRule,
} from "../rate_limit/rules.js";

export function enforceRateLimit(
  limiter: RateLimiter,
  key: string,
  rule: RateLimitRule,
): boolean {
  return limiter.consume(key, rule);
}
