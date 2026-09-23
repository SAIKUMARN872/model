export type RateLimitKeyType =
  | "ip"
  | "user"
  | "organization"
  | "api_key"
  | "custom";

export interface RateLimitRule {
  id: string;
  name: string;
  keyType: RateLimitKeyType;
  limit: number;
  windowMs: number;
  burstLimit?: number;
  enabled?: boolean;
  description?: string;
}

export interface RateLimitRequest {
  ip?: string;
  userId?: string;
  organizationId?: string;
  apiKey?: string;
  customKey?: string;
}

export interface RateLimitRuleMatch {
  rule: RateLimitRule;
  key: string;
}

export function validateRateLimitRule(
  rule: RateLimitRule,
): void {
  if (!rule.id.trim()) {
    throw new Error("Rate limit rule id is required");
  }

  if (!rule.name.trim()) {
    throw new Error("Rate limit rule name is required");
  }

  if (!Number.isFinite(rule.limit) || rule.limit <= 0) {
    throw new Error(
      "Rate limit must be greater than 0",
    );
  }

  if (
    !Number.isFinite(rule.windowMs) ||
    rule.windowMs <= 0
  ) {
    throw new Error(
      "Rate limit windowMs must be greater than 0",
    );
  }

  if (
    rule.burstLimit !== undefined &&
    (!Number.isFinite(rule.burstLimit) ||
      rule.burstLimit <= 0)
  ) {
    throw new Error(
      "burstLimit must be greater than 0",
    );
  }
}

export function resolveRateLimitKey(
  rule: RateLimitRule,
  request: RateLimitRequest,
): string | undefined {
  switch (rule.keyType) {
    case "ip":
      return request.ip;

    case "user":
      return request.userId;

    case "organization":
      return request.organizationId;

    case "api_key":
      return request.apiKey;

    case "custom":
      return request.customKey;

    default:
      return undefined;
  }
}

export class RateLimitRuleRegistry {
  private readonly rules = new Map<
    string,
    RateLimitRule
  >();

  add(rule: RateLimitRule): RateLimitRule {
    validateRateLimitRule(rule);

    if (this.rules.has(rule.id)) {
      throw new Error(
        `Rate limit rule already exists: ${rule.id}`,
      );
    }

    const normalized: RateLimitRule = {
      ...rule,
      enabled: rule.enabled ?? true,
    };

    this.rules.set(rule.id, normalized);

    return { ...normalized };
  }

  update(
    id: string,
    changes: Partial<Omit<RateLimitRule, "id">>,
  ): RateLimitRule {
    const existing = this.rules.get(id);

    if (!existing) {
      throw new Error(
        `Rate limit rule not found: ${id}`,
      );
    }

    const updated: RateLimitRule = {
      ...existing,
      ...changes,
      id,
    };

    validateRateLimitRule(updated);

    this.rules.set(id, updated);

    return { ...updated };
  }

  get(id: string): RateLimitRule | undefined {
    const rule = this.rules.get(id);

    return rule ? { ...rule } : undefined;
  }

  getAll(): RateLimitRule[] {
    return [...this.rules.values()].map((rule) => ({
      ...rule,
    }));
  }

  getEnabled(): RateLimitRule[] {
    return this.getAll().filter(
      (rule) => rule.enabled !== false,
    );
  }

  remove(id: string): boolean {
    return this.rules.delete(id);
  }

  clear(): void {
    this.rules.clear();
  }

  size(): number {
    return this.rules.size;
  }

  match(
    request: RateLimitRequest,
  ): RateLimitRuleMatch[] {
    const matches: RateLimitRuleMatch[] = [];

    for (const rule of this.getEnabled()) {
      const key = resolveRateLimitKey(rule, request);

      if (key) {
        matches.push({
          rule,
          key,
        });
      }
    }

    return matches;
  }
}