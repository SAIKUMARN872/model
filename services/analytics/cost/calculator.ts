export interface CostRecord {
  id: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  inputRate: number;
  outputRate: number;
  timestamp: string;
}

export interface CostResult {
  inputCost: number;
  outputCost: number;
  totalCost: number;
}
