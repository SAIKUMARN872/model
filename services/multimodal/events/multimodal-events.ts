export interface MultimodalEvent {
  type: string;
  assetId?: string;
  timestamp: Date;
  payload?: unknown;
}
