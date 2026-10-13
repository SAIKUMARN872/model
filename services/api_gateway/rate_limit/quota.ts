export interface Quota {
  key: string;
  limit: number;
  used: number;
  resetAt: number;
}

export class QuotaManager {
  private readonly quotas = new Map<string, Quota>();

  consume(
    key: string,
    limit: number,
    windowMs: number,
    amount = 1,
  ): Quota {
    if (!key.trim()) {
      throw new Error("Quota key is required");
    }

    if (
      !Number.isInteger(limit) ||
      limit <= 0 ||
      !Number.isFinite(windowMs) ||
      windowMs <= 0 ||
      !Number.isInteger(amount) ||
      amount <= 0
    ) {
      throw new Error("Invalid quota configuration");
    }

    const existing = this.quotas.get(key);
    const now = Date.now();

    let quota =
      existing && existing.resetAt > now
        ? existing
        : {
            key,
            limit,
            used: 0,
            resetAt: now + windowMs,
          };

    if (quota.used + amount > quota.limit) {
      throw new Error("Quota exceeded");
    }

    quota = {
      ...quota,
      limit,
      used: quota.used + amount,
    };

    this.quotas.set(key, quota);

    return { ...quota };
  }

  get(key: string): Quota | undefined {
    const quota = this.quotas.get(key);

    if (!quota) {
      return undefined;
    }

    if (quota.resetAt <= Date.now()) {
      this.quotas.delete(key);
      return undefined;
    }

    return { ...quota };
  }

  clear(): void {
    this.quotas.clear();
  }
}
