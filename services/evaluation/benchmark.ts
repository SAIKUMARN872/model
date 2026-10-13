export interface BenchmarkCase {
  name: string;
  run: () => unknown | Promise<unknown>;
}

export interface BenchmarkOptions {
  iterations?: number;
  warmupIterations?: number;
}

export interface BenchmarkResult {
  name: string;
  iterations: number;
  totalDurationMs: number;
  averageDurationMs: number;
  minDurationMs: number;
  maxDurationMs: number;
  operationsPerSecond: number;
  errors: number;
}

export interface BenchmarkSuiteResult {
  startedAt: string;
  completedAt: string;
  totalDurationMs: number;
  results: BenchmarkResult[];
}

function validateCount(value: number, name: string, allowZero: boolean): void {
  if (
    !Number.isSafeInteger(value) ||
    value < (allowZero ? 0 : 1)
  ) {
    throw new RangeError(
      `${name} must be a ${allowZero ? "non-negative" : "positive"} safe integer.`,
    );
  }
}

export async function runBenchmark(
  benchmarkCase: BenchmarkCase,
  options: BenchmarkOptions = {},
): Promise<BenchmarkResult> {
  const iterations = options.iterations ?? 10;
  const warmupIterations = options.warmupIterations ?? 1;

  validateCount(iterations, "iterations", false);
  validateCount(warmupIterations, "warmupIterations", true);

  if (!benchmarkCase.name.trim()) {
    throw new TypeError("Benchmark name must not be empty.");
  }

  if (typeof benchmarkCase.run !== "function") {
    throw new TypeError("Benchmark run must be a function.");
  }

  for (let i = 0; i < warmupIterations; i += 1) {
    await benchmarkCase.run();
  }

  const durations: number[] = [];
  let errors = 0;

  for (let i = 0; i < iterations; i += 1) {
    const start = performance.now();

    try {
      await benchmarkCase.run();
    } catch {
      errors += 1;
    }

    durations.push(Math.max(0, performance.now() - start));
  }

  const totalDurationMs = durations.reduce(
    (total, duration) => total + duration,
    0,
  );

  const averageDurationMs = totalDurationMs / iterations;
  const minDurationMs = Math.min(...durations);
  const maxDurationMs = Math.max(...durations);

  return {
    name: benchmarkCase.name,
    iterations,
    totalDurationMs,
    averageDurationMs,
    minDurationMs,
    maxDurationMs,
    operationsPerSecond:
      totalDurationMs === 0 ? 0 : (iterations / totalDurationMs) * 1000,
    errors,
  };
}

export async function runBenchmarkSuite(
  cases: readonly BenchmarkCase[],
  options: BenchmarkOptions = {},
): Promise<BenchmarkSuiteResult> {
  const startedAt = new Date();
  const start = performance.now();
  const results: BenchmarkResult[] = [];

  for (const benchmarkCase of cases) {
    results.push(await runBenchmark(benchmarkCase, options));
  }

  const completedAt = new Date();

  return {
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    totalDurationMs: Math.max(0, performance.now() - start),
    results,
  };
}
