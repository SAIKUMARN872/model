import type { ConversationEvent } from "../interfaces.js";
import { ConversationEventEmitter } from "./conversation-events.js";
export const archiveEvents = new ConversationEventEmitter();
export function emitArchiveEvent(conversationId: string, ownerId: string): void {
  const event: ConversationEvent = {
    type: "conversation.archived", conversationId, ownerId, timestamp: new Date()
  };
  archiveEvents.emit(event);
}
