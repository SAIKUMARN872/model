export interface ResearchJob {
  id: string;
  researchId: string;
  query: string;
  depth: number;
  createdAt: Date;
}

export function createResearchJob(
  researchId: string,
  query: string,
  depth: number,
): ResearchJob {
  return {
    id: crypto.randomUUID(),
    researchId,
    query,
    depth,
    createdAt: new Date(),
  };
}
