export interface DeepSearchConfig {
  maxQueries: number;
  maxSources: number;
  maxCitations: number;
  maxResearchDepth: number;
  jobTimeoutMs: number;
}

function positiveInteger(name: string, value: number): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return value;
}

export function loadDeepSearchConfig(
  overrides: Partial<DeepSearchConfig> = {},
): DeepSearchConfig {
  return {
    maxQueries: positiveInteger("maxQueries", overrides.maxQueries ?? 10),
    maxSources: positiveInteger("maxSources", overrides.maxSources ?? 50),
    maxCitations: positiveInteger("maxCitations", overrides.maxCitations ?? 100),
    maxResearchDepth: positiveInteger("maxResearchDepth", overrides.maxResearchDepth ?? 3),
    jobTimeoutMs: positiveInteger("jobTimeoutMs", overrides.jobTimeoutMs ?? 120_000),
  };
}
