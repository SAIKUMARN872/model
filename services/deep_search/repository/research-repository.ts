import type { Research } from "../schemas/research-schema.js";

function cloneResearch(item: Research): Research {
  return {
    ...item,
    sourceIds: [...item.sourceIds],
    citationIds: [...item.citationIds],
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  };
}

export class ResearchRepository {
  private readonly items = new Map<string, Research>();

  save(item: Research): Research {
    const copy = cloneResearch(item);
    this.items.set(copy.id, copy);
    return cloneResearch(copy);
  }

  getById(id: string): Research | undefined {
    const item = this.items.get(id);
    return item ? cloneResearch(item) : undefined;
  }

  list(): Research[] {
    return [...this.items.values()].map(cloneResearch);
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }
}
