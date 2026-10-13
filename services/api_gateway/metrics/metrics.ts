export interface GatewayMetric {
  name: string;
  value: number;
  timestamp: string;
  tags: Record<string, string>;
}
