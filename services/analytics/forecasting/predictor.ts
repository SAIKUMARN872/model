import { Forecast, ForecastPoint } from "./forecast.js";

export class Predictor {
  predict(
    metric: string,
    history: number[],
    periods: number,
  ): Forecast {
    if (!metric.trim()) {
      throw new Error("Metric is required");
    }

    if (history.length === 0) {
      throw new Error("History is required");
    }

    if (!Number.isInteger(periods) || periods < 1) {
      throw new Error("Periods must be a positive integer");
    }

    const average =
      history.reduce((sum, value) => sum + value, 0) /
      history.length;

    const points: ForecastPoint[] = [];

    for (let index = 1; index <= periods; index++) {
      points.push({
        timestamp: new Date(
          Date.now() + index * 86400000,
        ).toISOString(),
        value: average,
      });
    }

    return { metric, points };
  }
}
