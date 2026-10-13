export interface DeepSearchInput {
  query: string;
  maxQueries?: number;
  maxSources?: number;
  depth?: number;
}

export interface SearchResult {
  query: string;
  sources: Array<{
    url: string;
    title: string;
    snippet?: string;
  }>;
}

export function validateDeepSearchInput(input: DeepSearchInput): void {
  if (!input.query.trim()) throw new Error("query is required.");
  for (const [name, value] of [
    ["maxQueries", input.maxQueries],
    ["maxSources", input.maxSources],
    ["depth", input.depth],
  ] as const) {
    if (value !== undefined && (!Number.isInteger(value) || value <= 0)) {
      throw new Error(`${name} must be a positive integer.`);
    }
  }
}
