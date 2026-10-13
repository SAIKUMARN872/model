import type { Source } from "../schemas/source-schema.js";

function cloneSource(item: Source): Source {
  return {
    ...item,
    retrievedAt: new Date(item.retrievedAt),
    createdAt: new Date(item.createdAt),
  };
}

export class SourceRepository {
  private readonly items = new Map<string, Source>();

  save(item: Source): Source {
    const copy = cloneSource(item);
    this.items.set(copy.id, copy);
    return cloneSource(copy);
  }

  getById(id: string): Source | undefined {
    const item = this.items.get(id);
    return item ? cloneSource(item) : undefined;
  }

  listByResearchId(researchId: string): Source[] {
    return [...this.items.values()]
      .filter((item) => item.researchId === researchId)
      .map(cloneSource);
  }

  list(): Source[] {
    return [...this.items.values()].map(cloneSource);
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }
}
