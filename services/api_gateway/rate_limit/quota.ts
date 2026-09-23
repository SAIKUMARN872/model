export interface QuotaDefinition {
  id: string;
  name: string;
  limit: number;
  periodMs: number;
  enabled?: boolean;
}

export interface QuotaUsage {
  quotaId: string;
  key: string;
  used: number;
  limit: number;
  remaining: number;
  resetAt: number;
}

interface QuotaState {
  used: number;
  resetAt: number;
}

export class QuotaManager {
  private readonly definitions = new Map<
    string,
    QuotaDefinition
  >();

  private readonly usage = new Map<
    string,
    QuotaState
  >();

  addQuota(
    definition: QuotaDefinition,
  ): QuotaDefinition {
    if (!definition.id.trim()) {
      throw new Error("Quota id is required");
    }

    if (!definition.name.trim()) {
      throw new Error("Quota name is required");
    }

    if (
      !Number.isFinite(definition.limit) ||
      definition.limit <= 0
    ) {
      throw new Error(
        "Quota limit must be greater than 0",
      );
    }

    if (
      !Number.isFinite(definition.periodMs) ||
      definition.periodMs <= 0
    ) {
      throw new Error(
        "Quota periodMs must be greater than 0",
      );
    }

    if (this.definitions.has(definition.id)) {
      throw new Error(
        `Quota already exists: ${definition.id}`,
      );
    }

    const normalized: QuotaDefinition = {
      ...definition,
      enabled: definition.enabled ?? true,
    };

    this.definitions.set(
      definition.id,
      normalized,
    );

    return { ...normalized };
  }

  updateQuota(
    id: string,
    changes: Partial<Omit<QuotaDefinition, "id">>,
  ): QuotaDefinition {
    const existing = this.definitions.get(id);

    if (!existing) {
      throw new Error(
        `Quota not found: ${id}`,
      );
    }

    const updated: QuotaDefinition = {
      ...existing,
      ...changes,
      id,
    };

    if (
      !Number.isFinite(updated.limit) ||
      updated.limit <= 0
    ) {
      throw new Error(
        "Quota limit must be greater than 0",
      );
    }

    if (
      !Number.isFinite(updated.periodMs) ||
      updated.periodMs <= 0
    ) {
      throw new Error(
        "Quota periodMs must be greater than 0",
      );
    }

    this.definitions.set(id, updated);

    return { ...updated };
  }

  getQuota(
    id: string,
  ): QuotaDefinition | undefined {
    const quota = this.definitions.get(id);

    return quota ? { ...quota } : undefined;
  }

  getQuotas(): QuotaDefinition[] {
    return [...this.definitions.values()].map(
      (quota) => ({ ...quota }),
    );
  }

  private getUsageKey(
    quotaId: string,
    key: string,
  ): string {
    return `${quotaId}:${key}`;
  }

  private getState(
    definition: QuotaDefinition,
    key: string,
  ): QuotaState {
    const usageKey = this.getUsageKey(
      definition.id,
      key,
    );

    const now = Date.now();
    let state = this.usage.get(usageKey);

    if (!state || now >= state.resetAt) {
      state = {
        used: 0,
        resetAt: now + definition.periodMs,
      };

      this.usage.set(usageKey, state);
    }

    return state;
  }

  consume(
    quotaId: string,
    key: string,
    amount = 1,
  ): QuotaUsage {
    const definition =
      this.definitions.get(quotaId);

    if (!definition) {
      throw new Error(
        `Quota not found: ${quotaId}`,
      );
    }

    if (definition.enabled === false) {
      return {
        quotaId,
        key,
        used: 0,
        limit: definition.limit,
        remaining: definition.limit,
        resetAt: Date.now(),
      };
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      throw new Error(
        "Quota amount must be greater than 0",
      );
    }

    const state = this.getState(
      definition,
      key,
    );

    state.used += amount;

    return {
      quotaId,
      key,
      used: state.used,
      limit: definition.limit,
      remaining: Math.max(
        0,
        definition.limit - state.used,
      ),
      resetAt: state.resetAt,
    };
  }

  check(
    quotaId: string,
    key: string,
    amount = 1,
  ): QuotaUsage {
    const definition =
      this.definitions.get(quotaId);

    if (!definition) {
      throw new Error(
        `Quota not found: ${quotaId}`,
      );
    }

    const state = this.getState(
      definition,
      key,
    );

    const projectedUsage =
      state.used + amount;

    return {
      quotaId,
      key,
      used: state.used,
      limit: definition.limit,
      remaining: Math.max(
        0,
        definition.limit - projectedUsage,
      ),
      resetAt: state.resetAt,
    };
  }

  isAllowed(
    quotaId: string,
    key: string,
    amount = 1,
  ): boolean {
    const result = this.check(
      quotaId,
      key,
      amount,
    );

    return (
      result.used + amount <= result.limit
    );
  }

  reset(
    quotaId?: string,
    key?: string,
  ): void {
    if (!quotaId) {
      this.usage.clear();
      return;
    }

    const prefix = key
      ? `${quotaId}:${key}`
      : `${quotaId}:`;

    for (const usageKey of this.usage.keys()) {
      if (
        key
          ? usageKey === prefix
          : usageKey.startsWith(prefix)
      ) {
        this.usage.delete(usageKey);
      }
    }
  }

  clear(): void {
    this.definitions.clear();
    this.usage.clear();
  }

  size(): number {
    return this.definitions.size;
  }
}