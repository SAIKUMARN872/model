import type { MultimodalEvent } from "./multimodal-events.js";

export function processingCompleted(assetId: string): MultimodalEvent {
  return { type: "processing.completed", assetId, timestamp: new Date() };
}
