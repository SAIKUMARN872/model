import type { DeveloperSettings } from "./settings-schema.js";

function clone(item: DeveloperSettings): DeveloperSettings {
  return {
    ...item,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  };
}

export class SettingsRepository {
  private readonly items = new Map<string, DeveloperSettings>();

  save(item: DeveloperSettings): DeveloperSettings {
    const copy = clone(item);
    this.items.set(copy.ownerId, copy);
    return clone(copy);
  }

  getByOwner(ownerId: string): DeveloperSettings | undefined {
    const item = this.items.get(ownerId);
    return item ? clone(item) : undefined;
  }

  delete(ownerId: string): boolean {
    return this.items.delete(ownerId);
  }
}
