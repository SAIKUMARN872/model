// services/analytics/forecasting/test_forecasting.ts

import {
  generateForecast,
  linearTrendForecast,
  movingAverageForecast,
  summarizeValues,
  validateForecastInput,
} from "./index.js";

const assert = {
  equal(actual: unknown, expected: unknown): void {
    if (actual !== expected) {
      throw new Error(
        `Expected ${String(expected)} but received ${String(actual)}`,
      );
    }
  },

  ok(value: unknown): void {
    if (!value) {
      throw new Error("Assertion failed");
    }
  },

  doesNotThrow(fn: () => void): void {
    try {
      fn();
    } catch (error) {
      throw new Error(
        `Expected function not to throw, but it threw ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  },

  throws(fn: () => void, expected?: RegExp | string): void {
    try {
      fn();
      throw new Error("Expected function to throw");
    } catch (error) {
      if (expected) {
        const message =
          error instanceof Error
            ? error.message
            : String(error);

        if (
          (typeof expected === "string" &&
            !message.includes(expected)) ||
          (expected instanceof RegExp &&
            !expected.test(message))
        ) {
          throw new Error(
            `Expected thrown error to match ${String(expected)}, got ${message}`,
          );
        }
      }
    }
  },
};

async function test(
  name: string,
  fn: () => Promise<void> | void,
): Promise<void> {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

await test("forecasting module", async () => {
  await test(
    "calculates summary statistics",
    () => {
      const result =
        summarizeValues([
          10,
          20,
          30,
          40,
          50,
        ]);

      assert.equal(
        result.minimum,
        10,
      );

      assert.equal(
        result.maximum,
        50,
      );

      assert.equal(
        result.mean,
        30,
      );

      assert.equal(
        result.median,
        30,
      );

      assert.equal(
        result.standardDeviation > 0,
        true,
      );
    },
  );

  await test(
    "creates moving average forecast",
    () => {
      const result =
        movingAverageForecast({
          values: [
            10,
            20,
            30,
            40,
            50,
          ],
          periods: 3,
          windowSize: 3,
        });

      assert.equal(
        result.method,
        "moving_average",
      );

      assert.equal(
        result.periods,
        3,
      );

      assert.equal(
        result.historicalCount,
        5,
      );

      assert.equal(
        result.forecast.length,
        3,
      );

      assert.equal(
        result.forecast[0].value,
        40,
      );

      assert.equal(
        result.forecast[1].value,
        40,
      );

      assert.equal(
        result.forecast[2].value,
        40,
      );
    },
  );

  await test(
    "creates linear trend forecast",
    () => {
      const result =
        linearTrendForecast({
          values: [
            10,
            20,
            30,
            40,
            50,
          ],
          periods: 3,
        });

      assert.equal(
        result.method,
        "linear_trend",
      );

      assert.equal(
        result.forecast.length,
        3,
      );

      assert.equal(
        result.forecast[0].value,
        60,
      );

      assert.equal(
        result.forecast[1].value,
        70,
      );

      assert.equal(
        result.forecast[2].value,
        80,
      );
    },
  );

  await test(
    "supports generateForecast",
    () => {
      const movingAverage =
        generateForecast({
          values: [
            10,
            20,
            30,
          ],
          periods: 2,
          method: "moving_average",
        });

      assert.equal(
        movingAverage.method,
        "moving_average",
      );

      const trend =
        generateForecast({
          values: [
            10,
            20,
            30,
          ],
          periods: 2,
          method: "linear_trend",
        });

      assert.equal(
        trend.method,
        "linear_trend",
      );
    },
  );

  await test(
    "generates timestamps",
    () => {
      const result =
        generateForecast({
          values: [
            10,
            20,
            30,
          ],
          periods: 2,
          method: "moving_average",
          intervalMinutes: 60,
          startTimestamp: "2026-09-01T10:00:00.000Z",
        });

      assert.equal(
        result.forecast[0].timestamp,
        "2026-09-01T11:00:00.000Z",
      );

      assert.equal(
        result.forecast[1].timestamp,
        "2026-09-01T12:00:00.000Z",
      );
    },
  );

  await test(
    "supports confidence bounds",
    () => {
      const result =
        generateForecast({
          values: [
            10,
            20,
            30,
            40,
            50,
          ],
          periods: 2,
          method: "moving_average",
          confidence: 0.95,
        });

      const point =
        result.forecast[0];

      assert.equal(
        Number.isFinite(point.lowerBound),
        true,
      );

      assert.equal(
        Number.isFinite(point.upperBound),
        true,
      );

      assert.equal(
        point.lowerBound <= point.value,
        true,
      );

      assert.equal(
        point.upperBound >= point.value,
        true,
      );
    },
  );

  await test(
    "rejects empty values",
    () => {
      assert.throws(
        () =>
          generateForecast({
            values: [],
            periods: 2,
          }),
        /Values cannot be empty/,
      );
    },
  );

  await test(
    "rejects invalid periods",
    () => {
      assert.throws(
        () =>
          generateForecast({
            values: [
              10,
              20,
            ],
            periods: 0,
          }),
        /Periods must be a positive integer/,
      );
    },
  );

  await test(
    "rejects invalid window size",
    () => {
      assert.throws(
        () =>
          generateForecast({
            values: [
              10,
              20,
            ],
            periods: 2,
            windowSize: 5,
          }),
        /Window size cannot exceed number of values/,
      );
    },
  );

  await test(
    "rejects invalid confidence",
    () => {
      assert.throws(
        () =>
          generateForecast({
            values: [
              10,
              20,
            ],
            periods: 2,
            confidence: 1.5,
          }),
        /Confidence must be between 0 and 1/,
      );
    },
  );

  await test(
    "rejects NaN values",
    () => {
      assert.throws(
        () =>
          generateForecast({
            values: [
              10,
              Number.NaN,
            ],
            periods: 2,
          }),
        /must be a finite number/,
      );
    },
  );

  await test(
    "validates correct input",
    () => {
      assert.doesNotThrow(() =>
        validateForecastInput({
          values: [
            10,
            20,
            30,
          ],
          periods: 3,
          method: "linear_trend",
          windowSize: 2,
          confidence: 0.95,
          intervalMinutes: 30,
        }),
      );
    },
  );

  console.log(
    "Forecasting test suite completed successfully.",
  );
});