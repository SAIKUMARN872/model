import type { ApiUsage } from "./usage-schema.js";

function clone(item: ApiUsage): ApiUsage {
  return { ...item, createdAt: new Date(item.createdAt) };
}

export class UsageRepository {
  private readonly items = new Map<string, ApiUsage>();

  save(item: ApiUsage): ApiUsage {
    const copy = clone(item);
    this.items.set(copy.id, copy);
    return clone(copy);
  }

  getById(id: string): ApiUsage | undefined {
    const item = this.items.get(id);
    return item ? clone(item) : undefined;
  }

  listByOwner(ownerId: string): ApiUsage[] {
    return [...this.items.values()]
      .filter((item) => item.ownerId === ownerId)
      .map(clone);
  }

  list(): ApiUsage[] {
    return [...this.items.values()].map(clone);
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }
}
