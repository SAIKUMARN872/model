export interface AnalyticsMetricRow {
  id: string;
  metric: string;
  value: number;
  timestamp: string;
  dimensions: Record<string, string>;
}
