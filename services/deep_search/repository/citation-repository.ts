import type { Citation } from "../schemas/citation-schema.js";

function cloneCitation(item: Citation): Citation {
  return { ...item, createdAt: new Date(item.createdAt) };
}

export class CitationRepository {
  private readonly items = new Map<string, Citation>();

  save(item: Citation): Citation {
    const copy = cloneCitation(item);
    this.items.set(copy.id, copy);
    return cloneCitation(copy);
  }

  getById(id: string): Citation | undefined {
    const item = this.items.get(id);
    return item ? cloneCitation(item) : undefined;
  }

  listByResearchId(researchId: string): Citation[] {
    return [...this.items.values()]
      .filter((item) => item.researchId === researchId)
      .map(cloneCitation);
  }

  listBySourceId(sourceId: string): Citation[] {
    return [...this.items.values()]
      .filter((item) => item.sourceId === sourceId)
      .map(cloneCitation);
  }

  list(): Citation[] {
    return [...this.items.values()].map(cloneCitation);
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }
}
