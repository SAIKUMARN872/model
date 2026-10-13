export type OptimizationPriority = "balanced" | "cost" | "latency" | "quality";

export type OptimizationWeights = {
  cost: number;
  latency: number;
  quality: number;
  capability: number;
  reliability: number;
};

export type OptimizationResult = {
  model: string;
  provider: string;
  tier: "SLM" | "MLM" | "LLM";
  score: number;
  weights: OptimizationWeights;
  observed: boolean;
  observedLatencyMs: number | null;
  successRate: number | null;
};
