// services/analytics/forecasting/predictor.ts

import {
  createForecastTimestamp,
  ForecastInput,
  ForecastPoint,
  ForecastResult,
  summarizeValues,
  validateForecastInput,
} from "./forecast.js";

function calculateMovingAverage(
  values: number[],
  windowSize: number,
): number {
  const window = values.slice(-windowSize);

  return (
    window.reduce(
      (sum, value) => sum + value,
      0,
    ) / window.length
  );
}

function calculateLinearRegression(
  values: number[],
): {
  slope: number;
  intercept: number;
} {
  const n = values.length;

  if (n === 1) {
    return {
      slope: 0,
      intercept: values[0],
    };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let index = 0; index < n; index += 1) {
    const x = index;
    const y = values[index];

    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  const denominator =
    n * sumX2 - sumX * sumX;

  if (denominator === 0) {
    return {
      slope: 0,
      intercept: sumY / n,
    };
  }

  const slope =
    (n * sumXY - sumX * sumY) /
    denominator;

  const intercept =
    (sumY - slope * sumX) / n;

  return {
    slope,
    intercept,
  };
}

function calculateResidualStandardDeviation(
  values: number[],
  slope: number,
  intercept: number,
): number {
  if (values.length <= 2) {
    return 0;
  }

  let squaredError = 0;

  for (let index = 0; index < values.length; index += 1) {
    const predicted =
      intercept + slope * index;

    squaredError += Math.pow(
      values[index] - predicted,
      2,
    );
  }

  return Math.sqrt(
    squaredError /
      Math.max(values.length - 2, 1),
  );
}

function calculateConfidenceMultiplier(
  confidence: number,
): number {
  if (confidence >= 0.99) {
    return 2.576;
  }

  if (confidence >= 0.95) {
    return 1.96;
  }

  if (confidence >= 0.90) {
    return 1.645;
  }

  if (confidence >= 0.80) {
    return 1.282;
  }

  return 1;
}

export function movingAverageForecast(
  input: ForecastInput,
): ForecastResult {
  validateForecastInput(input);

  const windowSize =
    input.windowSize ??
    Math.min(5, input.values.length);

  const confidence =
    input.confidence ?? 0.95;

  const intervalMinutes =
    input.intervalMinutes ?? 60;

  const baseValue =
    calculateMovingAverage(
      input.values,
      windowSize,
    );

  const summary = summarizeValues(
    input.values,
  );

  const multiplier =
    calculateConfidenceMultiplier(
      confidence,
    );

  const margin =
    summary.standardDeviation *
    multiplier;

  const forecast: ForecastPoint[] = [];

  for (
    let index = 0;
    index < input.periods;
    index += 1
  ) {
    forecast.push({
      timestamp:
        createForecastTimestamp(
          input.startTimestamp,
          intervalMinutes,
          index,
        ),
      value: baseValue,
      lowerBound: Math.max(
        0,
        baseValue - margin,
      ),
      upperBound:
        baseValue + margin,
    });
  }

  return {
    method: "moving_average",
    periods: input.periods,
    historicalCount: input.values.length,
    historicalMean: summary.mean,
    forecast,
  };
}

export function linearTrendForecast(
  input: ForecastInput,
): ForecastResult {
  validateForecastInput(input);

  const confidence =
    input.confidence ?? 0.95;

  const intervalMinutes =
    input.intervalMinutes ?? 60;

  const {
    slope,
    intercept,
  } = calculateLinearRegression(
    input.values,
  );

  const residualStandardDeviation =
    calculateResidualStandardDeviation(
      input.values,
      slope,
      intercept,
    );

  const multiplier =
    calculateConfidenceMultiplier(
      confidence,
    );

  const forecast: ForecastPoint[] = [];

  const historicalCount =
    input.values.length;

  for (
    let index = 0;
    index < input.periods;
    index += 1
  ) {
    const futureIndex =
      historicalCount + index;

    const predicted =
      intercept +
      slope * futureIndex;

    const margin =
      residualStandardDeviation *
      multiplier;

    const value = Math.max(
      0,
      predicted,
    );

    forecast.push({
      timestamp:
        createForecastTimestamp(
          input.startTimestamp,
          intervalMinutes,
          index,
        ),
      value,
      lowerBound: Math.max(
        0,
        value - margin,
      ),
      upperBound:
        value + margin,
    });
  }

  return {
    method: "linear_trend",
    periods: input.periods,
    historicalCount,
    historicalMean:
      summarizeValues(input.values).mean,
    forecast,
  };
}

export function generateForecast(
  input: ForecastInput,
): ForecastResult {
  const method =
    input.method ?? "moving_average";

  if (method === "moving_average") {
    return movingAverageForecast(input);
  }

  if (method === "linear_trend") {
    return linearTrendForecast(input);
  }

  throw new Error(
    `Unsupported forecast method: ${method}`,
  );
}