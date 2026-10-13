import { randomUUID } from "node:crypto";
import type {
  DeveloperSettings,
  UpdateDeveloperSettingsInput,
} from "./settings-schema.js";
import { validateUpdateDeveloperSettingsInput } from "./settings-schema.js";
import { SettingsRepository } from "./settings-repository.js";

export class SettingsService {
  constructor(private readonly repository = new SettingsRepository()) {}

  getOrCreate(ownerId: string): DeveloperSettings {
    if (!ownerId.trim()) throw new Error("ownerId is required.");

    const existing = this.repository.getByOwner(ownerId);
    if (existing) return existing;

    const now = new Date();
    return this.repository.save({
      id: randomUUID(),
      ownerId: ownerId.trim(),
      notificationsEnabled: true,
      usageAlertsEnabled: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  update(ownerId: string, input: UpdateDeveloperSettingsInput): DeveloperSettings {
    if (!ownerId.trim()) throw new Error("ownerId is required.");
    validateUpdateDeveloperSettingsInput(input);

    const existing = this.getOrCreate(ownerId);
    const updated: DeveloperSettings = {
      ...existing,
      updatedAt: new Date(),
      ...(input.defaultProjectId !== undefined
        ? { defaultProjectId: input.defaultProjectId || undefined }
        : {}),
      ...(input.notificationsEnabled !== undefined
        ? { notificationsEnabled: input.notificationsEnabled }
        : {}),
      ...(input.usageAlertsEnabled !== undefined
        ? { usageAlertsEnabled: input.usageAlertsEnabled }
        : {}),
      ...(input.monthlyLimit !== undefined
        ? input.monthlyLimit === null
          ? { monthlyLimit: undefined }
          : { monthlyLimit: input.monthlyLimit }
        : {}),
    };
    return this.repository.save(updated);
  }

  delete(ownerId: string): boolean {
    return this.repository.delete(ownerId);
  }
}
