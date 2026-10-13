import type { SearchResult } from "../schemas/deep-search-schema.js";

export interface StoredSearch {
  id: string;
  researchId: string;
  result: SearchResult;
  createdAt: Date;
}

function cloneSearch(item: StoredSearch): StoredSearch {
  return {
    ...item,
    result: {
      query: item.result.query,
      sources: item.result.sources.map((source) => ({ ...source })),
    },
    createdAt: new Date(item.createdAt),
  };
}

export class SearchRepository {
  private readonly items = new Map<string, StoredSearch>();

  save(item: StoredSearch): StoredSearch {
    const copy = cloneSearch(item);
    this.items.set(copy.id, copy);
    return cloneSearch(copy);
  }

  getById(id: string): StoredSearch | undefined {
    const item = this.items.get(id);
    return item ? cloneSearch(item) : undefined;
  }

  listByResearchId(researchId: string): StoredSearch[] {
    return [...this.items.values()]
      .filter((item) => item.researchId === researchId)
      .map(cloneSearch);
  }

  list(): StoredSearch[] {
    return [...this.items.values()].map(cloneSearch);
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }
}
