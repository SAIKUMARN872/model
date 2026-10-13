import type { Webhook } from "./webhook-schema.js";

function clone(item: Webhook): Webhook {
  return {
    ...item,
    events: [...item.events],
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  };
}

export class WebhookRepository {
  private readonly items = new Map<string, Webhook>();

  save(item: Webhook): Webhook {
    const copy = clone(item);
    this.items.set(copy.id, copy);
    return clone(copy);
  }

  getById(id: string): Webhook | undefined {
    const item = this.items.get(id);
    return item ? clone(item) : undefined;
  }

  listByOwner(ownerId: string): Webhook[] {
    return [...this.items.values()]
      .filter((item) => item.ownerId === ownerId)
      .map(clone);
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }
}
