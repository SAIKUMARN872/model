export interface SearchJob {
  id: string;
  researchId: string;
  query: string;
  createdAt: Date;
}

export function createSearchJob(researchId: string, query: string): SearchJob {
  return {
    id: crypto.randomUUID(),
    researchId,
    query,
    createdAt: new Date(),
  };
}
