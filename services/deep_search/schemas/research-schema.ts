export type ResearchStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

export interface Research {
  id: string;
  query: string;
  status: ResearchStatus;
  depth: number;
  summary?: string;
  error?: string;
  sourceIds: string[];
  citationIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateResearchInput {
  query: string;
  depth?: number;
}

export function validateCreateResearchInput(input: CreateResearchInput): void {
  if (!input.query.trim()) throw new Error("query is required.");
  if (input.depth !== undefined && (!Number.isInteger(input.depth) || input.depth <= 0)) {
    throw new Error("depth must be a positive integer.");
  }
}
