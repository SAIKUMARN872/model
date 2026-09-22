// services/analytics/cost/test_cost.ts

import {
  calculateCost,
} from "./calculator.js";

import {
  CostAnalyzer,
} from "./analyzer.js";

import {
  createCostReport,
  createModelCostReport,
  reportToJson,
  reportToCsv,
} from "./reports.js";

type TestFunction =
  () => void | Promise<void>;

let passed = 0;
let failed = 0;

function assert(
  condition: boolean,
  message: string,
): void {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual<T>(
  actual: T,
  expected: T,
  message: string,
): void {
  if (actual !== expected) {
    throw new Error(
      `${message}\nExpected: ${String(expected)}\nActual: ${String(actual)}`,
    );
  }
}

function assertClose(
  actual: number,
  expected: number,
  message: string,
): void {
  if (
    Math.abs(actual - expected) >
    0.000000001
  ) {
    throw new Error(
      `${message}\nExpected: ${expected}\nActual: ${actual}`,
    );
  }
}

function assertThrows(
  fn: () => unknown,
  message: string,
): void {
  let threw = false;

  try {
    fn();
  } catch {
    threw = true;
  }

  assert(threw, message);
}

async function test(
  name: string,
  fn: TestFunction,
): Promise<void> {
  try {
    await fn();

    passed++;

    console.log(`✓ ${name}`);
  } catch (error) {
    failed++;

    console.error(`✗ ${name}`);

    throw error;
  }
}

const pricing = {
  provider: "openai",
  model: "gpt-test",
  inputPer1KTokens: 0.01,
  outputPer1KTokens: 0.03,
};

await test(
  "calculates input and output cost",
  () => {
    const result =
      calculateCost(
        pricing,
        {
          inputTokens: 1000,
          outputTokens: 1000,
        },
      );

    assertClose(
      result.inputCost,
      0.01,
      "Input cost is incorrect",
    );

    assertClose(
      result.outputCost,
      0.03,
      "Output cost is incorrect",
    );

    assertClose(
      result.totalCost,
      0.04,
      "Total cost is incorrect",
    );
  },
);

await test(
  "calculates cached input cost",
  () => {
    const result =
      calculateCost(
        {
          ...pricing,
          cachedInputPer1KTokens:
            0.002,
        },
        {
          inputTokens: 2000,
          outputTokens: 1000,
          cachedInputTokens: 1000,
        },
      );

    assertClose(
      result.inputCost,
      0.01,
      "Non-cached input cost is incorrect",
    );

    assertClose(
      result.cachedInputCost,
      0.002,
      "Cached input cost is incorrect",
    );

    assertClose(
      result.outputCost,
      0.03,
      "Output cost is incorrect",
    );

    assertClose(
      result.totalCost,
      0.042,
      "Total cost is incorrect",
    );
  },
);

await test(
  "rejects negative token usage",
  () => {
    assertThrows(
      () =>
        calculateCost(
          pricing,
          {
            inputTokens: -1,
            outputTokens: 100,
          },
        ),
      "Negative tokens should throw",
    );
  },
);

await test(
  "rejects cached tokens greater than input tokens",
  () => {
    assertThrows(
      () =>
        calculateCost(
          {
            ...pricing,
            cachedInputPer1KTokens:
              0.002,
          },
          {
            inputTokens: 100,
            outputTokens: 100,
            cachedInputTokens: 200,
          },
        ),
      "Cached input tokens cannot exceed input tokens",
    );
  },
);

await test(
  "records cost usage",
  () => {
    const analyzer =
      new CostAnalyzer();

    const record =
      analyzer.record(
        "org-1",
        pricing,
        {
          inputTokens: 1000,
          outputTokens: 500,
        },
      );

    assert(
      record.id.length > 0,
      "Record ID should exist",
    );

    assertEqual(
      record.organizationId,
      "org-1",
      "Organization is incorrect",
    );

    assertEqual(
      record.provider,
      "openai",
      "Provider is incorrect",
    );

    assertEqual(
      record.model,
      "gpt-test",
      "Model is incorrect",
    );

    assertClose(
      record.totalCost,
      0.025,
      "Record cost is incorrect",
    );
  },
);

await test(
  "isolates organizations",
  () => {
    const analyzer =
      new CostAnalyzer();

    analyzer.record(
      "org-1",
      pricing,
      {
        inputTokens: 1000,
        outputTokens: 1000,
      },
    );

    analyzer.record(
      "org-2",
      pricing,
      {
        inputTokens: 2000,
        outputTokens: 1000,
      },
    );

    const org1 =
      analyzer.summarize({
        organizationId: "org-1",
      });

    const org2 =
      analyzer.summarize({
        organizationId: "org-2",
      });

    assertEqual(
      org1.requestCount,
      1,
      "Org 1 request count is incorrect",
    );

    assertEqual(
      org2.requestCount,
      1,
      "Org 2 request count is incorrect",
    );

    assertEqual(
      org1.inputTokens,
      1000,
      "Org 1 tokens are incorrect",
    );

    assertEqual(
      org2.inputTokens,
      2000,
      "Org 2 tokens are incorrect",
    );
  },
);

await test(
  "summarizes total costs",
  () => {
    const analyzer =
      new CostAnalyzer();

    analyzer.record(
      "org-1",
      pricing,
      {
        inputTokens: 1000,
        outputTokens: 1000,
      },
    );

    analyzer.record(
      "org-1",
      pricing,
      {
        inputTokens: 2000,
        outputTokens: 1000,
      },
    );

    const summary =
      analyzer.summarize({
        organizationId: "org-1",
      });

    assertEqual(
      summary.requestCount,
      2,
      "Request count is incorrect",
    );

    assertEqual(
      summary.inputTokens,
      3000,
      "Input tokens are incorrect",
    );

    assertEqual(
      summary.outputTokens,
      2000,
      "Output tokens are incorrect",
    );

    assertClose(
      summary.totalCost,
      0.09,
      "Total summary cost is incorrect",
    );
  },
);

await test(
  "filters by provider and model",
  () => {
    const analyzer =
      new CostAnalyzer();

    analyzer.record(
      "org-1",
      pricing,
      {
        inputTokens: 1000,
        outputTokens: 1000,
      },
    );

    analyzer.record(
      "org-1",
      {
        provider: "anthropic",
        model: "claude-test",
        inputPer1KTokens: 0.02,
        outputPer1KTokens: 0.04,
      },
      {
        inputTokens: 1000,
        outputTokens: 1000,
      },
    );

    const result =
      analyzer.summarize({
        provider: "openai",
        model: "gpt-test",
      });

    assertEqual(
      result.requestCount,
      1,
      "Provider/model filtering failed",
    );
  },
);

await test(
  "filters by time range",
  () => {
    const analyzer =
      new CostAnalyzer();

    analyzer.record(
      "org-1",
      pricing,
      {
        inputTokens: 1000,
        outputTokens: 1000,
      },
      {
        timestamp: 1000,
      },
    );

    analyzer.record(
      "org-1",
      pricing,
      {
        inputTokens: 2000,
        outputTokens: 1000,
      },
      {
        timestamp: 2000,
      },
    );

    const result =
      analyzer.getRecords({
        startTime: 1500,
        endTime: 2500,
      });

    assertEqual(
      result.length,
      1,
      "Time filtering failed",
    );

    assertEqual(
      result[0].timestamp,
      2000,
      "Wrong record returned",
    );
  },
);

await test(
  "summarizes by organization",
  () => {
    const analyzer =
      new CostAnalyzer();

    analyzer.record(
      "org-a",
      pricing,
      {
        inputTokens: 1000,
        outputTokens: 1000,
      },
    );

    analyzer.record(
      "org-b",
      pricing,
      {
        inputTokens: 2000,
        outputTokens: 1000,
      },
    );

    const summaries =
      analyzer.summarizeByOrganization();

    assertEqual(
      summaries.length,
      2,
      "Organization summary count is incorrect",
    );
  },
);

await test(
  "summarizes by model",
  () => {
    const analyzer =
      new CostAnalyzer();

    analyzer.record(
      "org-1",
      pricing,
      {
        inputTokens: 1000,
        outputTokens: 1000,
      },
    );

    analyzer.record(
      "org-1",
      {
        provider: "anthropic",
        model: "claude-test",
        inputPer1KTokens: 0.02,
        outputPer1KTokens: 0.04,
      },
      {
        inputTokens: 1000,
        outputTokens: 1000,
      },
    );

    const summaries =
      analyzer.summarizeByModel();

    assertEqual(
      summaries.length,
      2,
      "Model summary count is incorrect",
    );
  },
);

await test(
  "creates JSON cost report",
  () => {
    const analyzer =
      new CostAnalyzer();

    analyzer.record(
      "org-1",
      pricing,
      {
        inputTokens: 1000,
        outputTokens: 1000,
      },
    );

    const report =
      createCostReport(
        analyzer,
        {
          organizationId: "org-1",
        },
      );

    assertEqual(
      report.summary.requestCount,
      1,
      "Report request count is incorrect",
    );

    const json =
      reportToJson(report);

    assert(
      json.includes("org-1"),
      "JSON report should contain organization",
    );

    assert(
      json.includes("totalCost"),
      "JSON report should contain totalCost",
    );
  },
);

await test(
  "creates model cost report",
  () => {
    const analyzer =
      new CostAnalyzer();

    analyzer.record(
      "org-1",
      pricing,
      {
        inputTokens: 1000,
        outputTokens: 1000,
      },
    );

    const report =
      createModelCostReport(
        analyzer,
        "org-1",
      );

    assertEqual(
      report.length,
      1,
      "Model report should contain one model",
    );

    assertEqual(
      report[0].model,
      "gpt-test",
      "Model report model is incorrect",
    );
  },
);

await test(
  "creates CSV cost report",
  () => {
    const analyzer =
      new CostAnalyzer();

    analyzer.record(
      "org-1",
      pricing,
      {
        inputTokens: 1000,
        outputTokens: 1000,
      },
    );

    const report =
      createCostReport(analyzer);

    const csv =
      reportToCsv(report);

    assert(
      csv.startsWith("id,organizationId"),
      "CSV header is incorrect",
    );

    assert(
      csv.includes("org-1"),
      "CSV should contain organization",
    );

    assert(
      csv.includes("gpt-test"),
      "CSV should contain model",
    );
  },
);

await test(
  "returns records by ID",
  () => {
    const analyzer =
      new CostAnalyzer();

    const record =
      analyzer.record(
        "org-1",
        pricing,
        {
          inputTokens: 100,
          outputTokens: 100,
        },
      );

    const found =
      analyzer.getById(record.id);

    assert(
      found !== null,
      "Record should be found",
    );

    assertEqual(
      found?.id,
      record.id,
      "Returned ID is incorrect",
    );
  },
);

await test(
  "enforces record retention",
  () => {
    const analyzer =
      new CostAnalyzer({
        maxRecords: 2,
      });

    analyzer.record(
      "org-1",
      pricing,
      {
        inputTokens: 100,
        outputTokens: 100,
      },
    );

    analyzer.record(
      "org-1",
      pricing,
      {
        inputTokens: 200,
        outputTokens: 100,
      },
    );

    analyzer.record(
      "org-1",
      pricing,
      {
        inputTokens: 300,
        outputTokens: 100,
      },
    );

    assertEqual(
      analyzer.size(),
      2,
      "Record retention limit failed",
    );
  },
);

await test(
  "validates organization ID",
  () => {
    const analyzer =
      new CostAnalyzer();

    assertThrows(
      () =>
        analyzer.record(
          "",
          pricing,
          {
            inputTokens: 100,
            outputTokens: 100,
          },
        ),
      "Empty organization should throw",
    );
  },
);

await test(
  "validates max records",
  () => {
    assertThrows(
      () =>
        new CostAnalyzer({
          maxRecords: 0,
        }),
      "Invalid maxRecords should throw",
    );
  },
);

await test(
  "returns analyzer health",
  () => {
    const analyzer =
      new CostAnalyzer();

    analyzer.record(
      "org-1",
      pricing,
      {
        inputTokens: 100,
        outputTokens: 100,
      },
    );

    const health =
      analyzer.health();

    assertEqual(
      health.healthy,
      true,
      "Analyzer should be healthy",
    );

    assertEqual(
      health.records,
      1,
      "Health record count is incorrect",
    );
  },
);

await test(
  "clears records",
  () => {
    const analyzer =
      new CostAnalyzer();

    analyzer.record(
      "org-1",
      pricing,
      {
        inputTokens: 100,
        outputTokens: 100,
      },
    );

    analyzer.clear();

    assertEqual(
      analyzer.size(),
      0,
      "Analyzer should be empty after clear",
    );
  },
);

console.log("");
console.log(
  "Cost test suite completed successfully.",
);
console.log(
  `Passed: ${passed}, Failed: ${failed}`,
);