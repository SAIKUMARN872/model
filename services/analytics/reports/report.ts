export interface AnalyticsReport {
  id: string;
  title: string;
  generatedAt: string;
  data: Record<string, unknown>;
}
