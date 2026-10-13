import { randomUUID } from "node:crypto";
import type { ApiUsage, CreateApiUsageInput } from "./usage-schema.js";
import { validateCreateApiUsageInput } from "./usage-schema.js";
import { UsageRepository } from "./usage-repository.js";

export class UsageService {
  constructor(private readonly repository = new UsageRepository()) {}

  record(input: CreateApiUsageInput): ApiUsage {
    validateCreateApiUsageInput(input);
    return this.repository.save({
      id: randomUUID(),
      ownerId: input.ownerId.trim(),
      ...(input.apiKeyId ? { apiKeyId: input.apiKeyId } : {}),
      endpoint: input.endpoint.trim(),
      method: input.method.trim().toUpperCase(),
      statusCode: input.statusCode,
      units: input.units ?? 1,
      durationMs: input.durationMs ?? 0,
      createdAt: new Date(),
    });
  }

  get(id: string): ApiUsage | undefined {
    return this.repository.getById(id);
  }

  list(ownerId: string): ApiUsage[] {
    return this.repository.listByOwner(ownerId);
  }

  getTotals(ownerId: string): { requests: number; units: number; errors: number } {
    const items = this.repository.listByOwner(ownerId);
    return {
      requests: items.length,
      units: items.reduce((sum, item) => sum + item.units, 0),
      errors: items.filter((item) => item.statusCode >= 400).length,
    };
  }
}
