import type { ConversationEvent } from "../interfaces.js";
import { ConversationEventEmitter } from "./conversation-events.js";
export const shareEvents = new ConversationEventEmitter();
export function emitShareEvent(conversationId: string, ownerId: string, shareId: string): void {
  const event: ConversationEvent = {
    type: "conversation.shared", conversationId, ownerId,
    timestamp: new Date(), data: { shareId }
  };
  shareEvents.emit(event);
}
