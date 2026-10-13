import type { MultimodalEvent } from "./multimodal-events.js";

export function sessionCreated(sessionId: string): MultimodalEvent {
  return { type: "session.created", assetId: sessionId, timestamp: new Date() };
}
