import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateAccuracy,
  calculateExampleAccuracy,
  runBenchmark,
  runBenchmarkSuite,
  calculateQualityScore,
} from "./index.js";

// --------------------------------------------------
// Accuracy tests
// --------------------------------------------------

test("accuracy: all predictions correct", () => {
  const result = calculateAccuracy(
    ["cat", "dog", "bird"],
    ["cat", "dog", "bird"],
  );

  assert.equal(result.total, 3);
  assert.equal(result.correct, 3);
  assert.equal(result.incorrect, 0);
  assert.equal(result.accuracy, 1);
  assert.equal(result.accuracyPercent, 100);
});

test("accuracy: all predictions incorrect", () => {
  const result = calculateAccuracy(["cat", "dog"], ["fish", "bird"]);

  assert.equal(result.correct, 0);
  assert.equal(result.incorrect, 2);
  assert.equal(result.accuracy, 0);
  assert.equal(result.accuracyPercent, 0);
});

test("accuracy: calculates partial accuracy", () => {
  const result = calculateAccuracy(
    ["yes", "no", "yes", "no"],
    ["yes", "yes", "yes", "no"],
  );

  assert.equal(result.total, 4);
  assert.equal(result.correct, 3);
  assert.equal(result.incorrect, 1);
  assert.equal(result.accuracy, 0.75);
  assert.equal(result.accuracyPercent, 75);
});

test("accuracy: empty arrays return zero accuracy", () => {
  const result = calculateAccuracy([], []);

  assert.equal(result.total, 0);
  assert.equal(result.correct, 0);
  assert.equal(result.incorrect, 0);
  assert.equal(result.accuracy, 0);
  assert.equal(result.accuracyPercent, 0);
});

test("accuracy: rejects mismatched array lengths", () => {
  assert.throws(
    () => calculateAccuracy(["a", "b"], ["a"]),
    RangeError,
  );
});

test("accuracy: ignores case by default", () => {
  const result = calculateAccuracy(["Hello"], ["hello"]);

  assert.equal(result.correct, 1);
  assert.equal(result.accuracyPercent, 100);
});

test("accuracy: supports case-sensitive comparison", () => {
  const result = calculateAccuracy(["Hello"], ["hello"], {
    caseSensitive: true,
  });

  assert.equal(result.correct, 0);
  assert.equal(result.accuracyPercent, 0);
});

test("accuracy: trims whitespace by default", () => {
  const result = calculateAccuracy([" hello "], ["hello"]);

  assert.equal(result.correct, 1);
});

test("accuracy: supports whitespace-sensitive comparison", () => {
  const result = calculateAccuracy([" hello "], ["hello"], {
    trimWhitespace: false,
  });

  assert.equal(result.correct, 0);
});

test("accuracy: calculates accuracy from examples", () => {
  const result = calculateExampleAccuracy([
    { expected: "A", actual: "A" },
    { expected: "B", actual: "C" },
    { expected: "D", actual: "D" },
  ]);

  assert.equal(result.total, 3);
  assert.equal(result.correct, 2);
  assert.equal(result.incorrect, 1);
  assert.equal(result.accuracyPercent, (2 / 3) * 100);
});

test("accuracy: handles empty example lists", () => {
  const result = calculateExampleAccuracy([]);

  assert.equal(result.total, 0);
  assert.equal(result.accuracyPercent, 0);
});

// --------------------------------------------------
// Benchmark tests
// --------------------------------------------------

test("benchmark: runs the requested number of iterations", async () => {
  let calls = 0;

  const result = await runBenchmark(
    {
      name: "counter",
      run: () => {
        calls += 1;
      },
    },
    { iterations: 5, warmupIterations: 0 },
  );

  assert.equal(calls, 5);
  assert.equal(result.name, "counter");
  assert.equal(result.iterations, 5);
  assert.equal(result.errors, 0);
  assert.ok(result.totalDurationMs >= 0);
  assert.ok(result.averageDurationMs >= 0);
});

test("benchmark: includes warmup calls in execution but not measured iterations", async () => {
  let calls = 0;

  const result = await runBenchmark(
    {
      name: "warmup",
      run: () => {
        calls += 1;
      },
    },
    { iterations: 3, warmupIterations: 2 },
  );

  assert.equal(calls, 5);
  assert.equal(result.iterations, 3);
});

test("benchmark: records synchronous errors and continues", async () => {
  let calls = 0;

  const result = await runBenchmark(
    {
      name: "failing",
      run: () => {
        calls += 1;
        throw new Error("Expected test error");
      },
    },
    { iterations: 3, warmupIterations: 0 },
  );

  assert.equal(calls, 3);
  assert.equal(result.errors, 3);
  assert.equal(result.iterations, 3);
});

test("benchmark: records asynchronous errors and continues", async () => {
  const result = await runBenchmark(
    {
      name: "async-failing",
      run: async () => {
        throw new Error("Expected async error");
      },
    },
    { iterations: 2, warmupIterations: 0 },
  );

  assert.equal(result.errors, 2);
});

test("benchmark: supports asynchronous operations", async () => {
  const result = await runBenchmark(
    {
      name: "async",
      run: async () => Promise.resolve("done"),
    },
    { iterations: 2, warmupIterations: 0 },
  );

  assert.equal(result.errors, 0);
  assert.equal(result.iterations, 2);
});

test("benchmark: rejects zero iterations", async () => {
  await assert.rejects(
    runBenchmark(
      { name: "invalid", run: () => undefined },
      { iterations: 0 },
    ),
    RangeError,
  );
});

test("benchmark: rejects negative iterations", async () => {
  await assert.rejects(
    runBenchmark(
      { name: "invalid", run: () => undefined },
      { iterations: -1 },
    ),
    RangeError,
  );
});

test("benchmark: rejects fractional iteration counts", async () => {
  await assert.rejects(
    runBenchmark(
      { name: "invalid", run: () => undefined },
      { iterations: 1.5 },
    ),
    RangeError,
  );
});

test("benchmark: rejects negative warmup iterations", async () => {
  await assert.rejects(
    runBenchmark(
      { name: "invalid", run: () => undefined },
      { warmupIterations: -1 },
    ),
    RangeError,
  );
});

test("benchmark: rejects an empty benchmark name", async () => {
  await assert.rejects(
    runBenchmark(
      { name: "  ", run: () => undefined },
      { warmupIterations: 0 },
    ),
    TypeError,
  );
});

test("benchmark: rejects a non-function runner", async () => {
  await assert.rejects(
    runBenchmark(
      { name: "invalid", run: 123 as unknown as () => unknown },
      { warmupIterations: 0 },
    ),
    TypeError,
  );
});

test("benchmark: returns non-negative timing values", async () => {
  const result = await runBenchmark(
    { name: "timing", run: () => undefined },
    { iterations: 2, warmupIterations: 0 },
  );

  assert.ok(result.totalDurationMs >= 0);
  assert.ok(result.minDurationMs >= 0);
  assert.ok(result.maxDurationMs >= result.minDurationMs);
  assert.ok(result.averageDurationMs >= 0);
  assert.ok(result.operationsPerSecond >= 0);
});

test("benchmark suite: runs multiple benchmarks", async () => {
  const suite = await runBenchmarkSuite(
    [
      { name: "first", run: () => 1 },
      { name: "second", run: () => 2 },
    ],
    { iterations: 2, warmupIterations: 0 },
  );

  assert.equal(suite.results.length, 2);
  assert.equal(suite.results[0]?.name, "first");
  assert.equal(suite.results[1]?.name, "second");
  assert.ok(suite.totalDurationMs >= 0);
  assert.ok(Number.isFinite(Date.parse(suite.startedAt)));
  assert.ok(Number.isFinite(Date.parse(suite.completedAt)));
});

test("benchmark suite: handles an empty suite", async () => {
  const suite = await runBenchmarkSuite([]);

  assert.deepEqual(suite.results, []);
  assert.ok(suite.totalDurationMs >= 0);
});

test("benchmark suite: preserves individual error counts", async () => {
  const suite = await runBenchmarkSuite(
    [
      { name: "good", run: () => undefined },
      {
        name: "bad",
        run: () => {
          throw new Error("Expected");
        },
      },
    ],
    { iterations: 2, warmupIterations: 0 },
  );

  assert.equal(suite.results[0]?.errors, 0);
  assert.equal(suite.results[1]?.errors, 2);
});

// --------------------------------------------------
// Quality score tests
// --------------------------------------------------

test("quality: perfect dimensions produce an excellent score", () => {
  const result = calculateQualityScore({
    accuracy: 1,
    relevance: 1,
    completeness: 1,
    consistency: 1,
    clarity: 1,
  });

  assert.equal(result.score, 1);
  assert.equal(result.percentage, 100);
  assert.equal(result.grade, "excellent");
});

test("quality: zero dimensions produce a poor score", () => {
  const result = calculateQualityScore({
    accuracy: 0,
    relevance: 0,
    completeness: 0,
    consistency: 0,
    clarity: 0,
  });

  assert.equal(result.score, 0);
  assert.equal(result.percentage, 0);
  assert.equal(result.grade, "poor");
});

test("quality: applies default weights", () => {
  const result = calculateQualityScore({
    accuracy: 1,
    relevance: 0,
    completeness: 0,
    consistency: 0,
    clarity: 0,
  });

  assert.equal(result.weights.accuracy, 0.4);
  assert.equal(result.weights.relevance, 0.2);
  assert.equal(result.weights.completeness, 0.2);
  assert.equal(result.weights.consistency, 0.1);
  assert.equal(result.weights.clarity, 0.1);
  assert.equal(result.score, 0.4);
});

test("quality: normalizes score using supplied weights", () => {
  const result = calculateQualityScore(
    {
      accuracy: 1,
      relevance: 0,
      completeness: 0,
      consistency: 0,
      clarity: 0,
    },
    {
      accuracy: 3,
      relevance: 1,
      completeness: 0,
      consistency: 0,
      clarity: 0,
    },
  );

  assert.equal(result.score, 0.75);
  assert.equal(result.percentage, 75);
  assert.equal(result.grade, "good");
});

test("quality: missing dimensions default to zero", () => {
  const result = calculateQualityScore({ accuracy: 1 });

  assert.equal(result.dimensions.accuracy, 1);
  assert.equal(result.dimensions.relevance, 0);
  assert.equal(result.dimensions.completeness, 0);
  assert.equal(result.dimensions.consistency, 0);
  assert.equal(result.dimensions.clarity, 0);
});

test("quality: validates dimensions below zero", () => {
  assert.throws(
    () => calculateQualityScore({ accuracy: -0.1 }),
    RangeError,
  );
});

test("quality: validates dimensions above one", () => {
  assert.throws(
    () => calculateQualityScore({ accuracy: 1.1 }),
    RangeError,
  );
});

test("quality: rejects NaN dimension values", () => {
  assert.throws(
    () => calculateQualityScore({ accuracy: Number.NaN }),
    RangeError,
  );
});

test("quality: rejects infinite dimension values", () => {
  assert.throws(
    () => calculateQualityScore({ clarity: Number.POSITIVE_INFINITY }),
    RangeError,
  );
});

test("quality: rejects negative weights", () => {
  assert.throws(
    () =>
      calculateQualityScore(
        { accuracy: 1 },
        { accuracy: -1 },
      ),
    RangeError,
  );
});

test("quality: rejects infinite weights", () => {
  assert.throws(
    () =>
      calculateQualityScore(
        { accuracy: 1 },
        { accuracy: Number.POSITIVE_INFINITY },
      ),
    RangeError,
  );
});

test("quality: rejects all-zero weights", () => {
  assert.throws(
    () =>
      calculateQualityScore(
        { accuracy: 1 },
        {
          accuracy: 0,
          relevance: 0,
          completeness: 0,
          consistency: 0,
          clarity: 0,
        },
      ),
    RangeError,
  );
});

test("quality: supports zero weights for individual dimensions", () => {
  const result = calculateQualityScore(
    {
      accuracy: 1,
      relevance: 0,
      completeness: 0,
      consistency: 0,
      clarity: 0,
    },
    {
      accuracy: 1,
      relevance: 0,
      completeness: 0,
      consistency: 0,
      clarity: 0,
    },
  );

  assert.equal(result.score, 1);
  assert.equal(result.grade, "excellent");
});

test("quality: grade threshold at 90 is excellent", () => {
  const result = calculateQualityScore(
    {
      accuracy: 0.9,
      relevance: 0.9,
      completeness: 0.9,
      consistency: 0.9,
      clarity: 0.9,
    },
  );

  assert.equal(result.grade, "excellent");
});

test("quality: grade threshold at 75 is good", () => {
  const result = calculateQualityScore(
    {
      accuracy: 0.75,
      relevance: 0.75,
      completeness: 0.75,
      consistency: 0.75,
      clarity: 0.75,
    },
  );

  assert.equal(result.grade, "good");
});

test("quality: grade threshold at 50 is fair", () => {
  const result = calculateQualityScore(
    {
      accuracy: 0.5,
      relevance: 0.5,
      completeness: 0.5,
      consistency: 0.5,
      clarity: 0.5,
    },
  );

  assert.equal(result.grade, "fair");
});

test("quality: score below 50 is poor", () => {
  const result = calculateQualityScore(
    {
      accuracy: 0.49,
      relevance: 0.49,
      completeness: 0.49,
      consistency: 0.49,
      clarity: 0.49,
    },
  );

  assert.equal(result.grade, "poor");
});

test("quality: returns normalized dimensions and weights", () => {
  const result = calculateQualityScore(
    { accuracy: 0.8, relevance: 0.6 },
    { accuracy: 2, relevance: 1 },
  );

  assert.equal(result.dimensions.accuracy, 0.8);
  assert.equal(result.dimensions.relevance, 0.6);
  assert.equal(result.weights.accuracy, 2);
  assert.equal(result.weights.relevance, 1);
  assert.ok(result.percentage >= 0 && result.percentage <= 100);
});
