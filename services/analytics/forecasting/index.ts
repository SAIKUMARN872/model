// services/analytics/forecasting/index.ts

export {
  createForecastTimestamp,
  summarizeValues,
  validateForecastInput,
} from "./forecast.js";

export type {
  ForecastInput,
  ForecastMethod,
  ForecastPoint,
  ForecastResult,
  ForecastSummary,
} from "./forecast.js";

export {
  generateForecast,
  linearTrendForecast,
  movingAverageForecast,
} from "./predictor.js";