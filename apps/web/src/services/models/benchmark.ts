export interface BenchmarkResult {
  model: string;
  latency: number;
  accuracy: number;
}

export async function benchmarkModels(): Promise<
  BenchmarkResult[]
> {
  return [
    {
      model: "GPT-4",
      latency: 220,
      accuracy: 98,
    },
    {
      model: "Claude",
      latency: 190,
      accuracy: 96,
    },
    {
      model: "Gemini",
      latency: 205,
      accuracy: 95,
    },
  ];
}