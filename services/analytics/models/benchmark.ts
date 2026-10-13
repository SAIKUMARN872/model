export interface ModelBenchmark {
  model: string;
  latencyMs: number;
  qualityScore: number;
  costPer1KTokens: number;
  timestamp: string;
}
