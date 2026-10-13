export interface ForecastPoint {
  timestamp: string;
  value: number;
}

export interface Forecast {
  metric: string;
  points: ForecastPoint[];
}
