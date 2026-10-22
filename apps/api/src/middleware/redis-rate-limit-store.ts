import { createHash } from "node:crypto";

export interface RateLimitConsumption {
  readonly count: number;
  readonly resetAt: number;
}

export interface RedisScriptExecutor {
  eval(
    script: string,
    options: {
      readonly keys: string[];
      readonly arguments: string[];
    },
  ): Promise<unknown>;
}

const CONSUME_RATE_LIMIT_SCRIPT = `
local count = redis.call("INCR", KEYS[1])
if count == 1 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
end
local ttl = redis.call("PTTL", KEYS[1])
return { count, ttl }
`;

function positiveInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive safe integer.`);
  }
}

/**
 * Redis-backed fixed-window counter.
 *
 * INCR and PEXPIRE execute in one Lua script, preventing concurrent API
 * instances from independently accepting requests against separate counters.
 */
export class RedisRateLimitStore {
  constructor(
    private readonly client: RedisScriptExecutor,
    private readonly prefix = "modelnow:ratelimit:v1",
    private readonly now: () => number = Date.now,
  ) {
    if (prefix.trim().length === 0) {
      throw new RangeError("Redis rate-limit prefix must not be empty.");
    }
  }

  async consume(
    key: string,
    windowMs: number,
  ): Promise<RateLimitConsumption> {
    if (typeof key !== "string" || key.trim().length === 0) {
      throw new RangeError("Rate-limit key must not be empty.");
    }
    positiveInteger(windowMs, "windowMs");

    const digest = createHash("sha256").update(key).digest("hex");
    const redisKey = `${this.prefix}:${digest}`;

    const result = await this.client.eval(CONSUME_RATE_LIMIT_SCRIPT, {
      keys: [redisKey],
      arguments: [String(windowMs)],
    });

    if (
      !Array.isArray(result) ||
      result.length !== 2 ||
      !Number.isSafeInteger(result[0]) ||
      (result[0] as number) <= 0 ||
      !Number.isSafeInteger(result[1]) ||
      (result[1] as number) < 0
    ) {
      throw new Error("Redis returned an invalid rate-limit counter result.");
    }

    return {
      count: result[0] as number,
      resetAt: this.now() + (result[1] as number),
    };
  }
}
