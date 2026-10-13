export interface Widget {
  id: string;
  type: "metric" | "chart" | "table" | "counter";
  title: string;
  query?: string;
  configuration: Record<string, unknown>;
}
