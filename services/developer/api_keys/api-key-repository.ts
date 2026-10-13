import type { ApiKey } from "./api-key-schema.js";

function clone(item: ApiKey): ApiKey {
  return {
    ...item,
    createdAt: new Date(item.createdAt),
    ...(item.lastUsedAt ? { lastUsedAt: new Date(item.lastUsedAt) } : {}),
    ...(item.expiresAt ? { expiresAt: new Date(item.expiresAt) } : {}),
  };
}

export class ApiKeyRepository {
  private readonly items = new Map<string, ApiKey>();

  save(item: ApiKey): ApiKey {
    const copy = clone(item);
    this.items.set(copy.id, copy);
    return clone(copy);
  }

  getById(id: string): ApiKey | undefined {
    const item = this.items.get(id);
    return item ? clone(item) : undefined;
  }

  listByOwner(ownerId: string): ApiKey[] {
    return [...this.items.values()]
      .filter((item) => item.ownerId === ownerId)
      .map(clone);
  }

  findByHash(keyHash: string): ApiKey | undefined {
    const item = [...this.items.values()].find((entry) => entry.keyHash === keyHash);
    return item ? clone(item) : undefined;
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }
}
