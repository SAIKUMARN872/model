// services/analytics/forecasting/forecast.ts

export type ForecastMethod =
  | "moving_average"
  | "linear_trend";

export interface ForecastPoint {
  timestamp: string;
  value: number;
  lowerBound: number;
  upperBound: number;
}

export interface ForecastInput {
  values: number[];
  periods: number;
  method?: ForecastMethod;
  windowSize?: number;
  confidence?: number;
  intervalMinutes?: number;
  startTimestamp?: string;
}

export interface ForecastResult {
  method: ForecastMethod;
  periods: number;
  historicalCount: number;
  historicalMean: number;
  forecast: ForecastPoint[];
}

export interface ForecastSummary {
  minimum: number;
  maximum: number;
  mean: number;
  median: number;
  standardDeviation: number;
}

function assertFiniteNumber(
  value: number,
  field: string,
): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${field} must be a finite number`);
  }
}

export function validateForecastInput(
  input: ForecastInput,
): void {
  if (!Array.isArray(input.values)) {
    throw new Error("Values must be an array");
  }

  if (input.values.length === 0) {
    throw new Error("Values cannot be empty");
  }

  input.values.forEach((value, index) => {
    assertFiniteNumber(value, `Value at index ${index}`);
  });

  if (
    !Number.isInteger(input.periods) ||
    input.periods <= 0
  ) {
    throw new Error(
      "Periods must be a positive integer",
    );
  }

  const method = input.method ?? "moving_average";

  if (
    method !== "moving_average" &&
    method !== "linear_trend"
  ) {
    throw new Error(
      `Unsupported forecast method: ${method}`,
    );
  }

  if (input.windowSize !== undefined) {
    if (
      !Number.isInteger(input.windowSize) ||
      input.windowSize <= 0
    ) {
      throw new Error(
        "Window size must be a positive integer",
      );
    }

    if (input.windowSize > input.values.length) {
      throw new Error(
        "Window size cannot exceed number of values",
      );
    }
  }

  if (input.confidence !== undefined) {
    if (
      !Number.isFinite(input.confidence) ||
      input.confidence <= 0 ||
      input.confidence >= 1
    ) {
      throw new Error(
        "Confidence must be between 0 and 1",
      );
    }
  }

  if (input.intervalMinutes !== undefined) {
    if (
      !Number.isFinite(input.intervalMinutes) ||
      input.intervalMinutes <= 0
    ) {
      throw new Error(
        "Interval minutes must be greater than zero",
      );
    }
  }

  if (input.startTimestamp !== undefined) {
    if (
      Number.isNaN(
        Date.parse(input.startTimestamp),
      )
    ) {
      throw new Error(
        "Invalid start timestamp",
      );
    }
  }
}

export function summarizeValues(
  values: number[],
): ForecastSummary {
  if (values.length === 0) {
    throw new Error("Values cannot be empty");
  }

  values.forEach((value, index) => {
    assertFiniteNumber(value, `Value at index ${index}`);
  });

  const sorted = [...values].sort(
    (a, b) => a - b,
  );

  const mean =
    values.reduce(
      (sum, value) => sum + value,
      0,
    ) / values.length;

  const variance =
    values.reduce(
      (sum, value) =>
        sum + Math.pow(value - mean, 2),
      0,
    ) / values.length;

  const median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] +
          sorted[sorted.length / 2]) /
        2
      : sorted[Math.floor(sorted.length / 2)];

  return {
    minimum: sorted[0],
    maximum: sorted[sorted.length - 1],
    mean,
    median,
    standardDeviation: Math.sqrt(variance),
  };
}

export function createForecastTimestamp(
  startTimestamp: string | undefined,
  intervalMinutes: number,
  periodIndex: number,
): string {
  const start = startTimestamp
    ? new Date(startTimestamp)
    : new Date();

  const timestamp =
    start.getTime() +
    intervalMinutes *
      60_000 *
      (periodIndex + 1);

  return new Date(timestamp).toISOString();
}