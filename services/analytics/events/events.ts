export interface AnalyticsEventMessage {
  id: string;
  type: string;
  timestamp: string;
  payload: Record<string, unknown>;
}
