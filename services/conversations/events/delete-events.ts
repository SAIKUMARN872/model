import type { ConversationEvent } from "../interfaces.js";
import { ConversationEventEmitter } from "./conversation-events.js";
export const deleteEvents = new ConversationEventEmitter();
export function emitDeleteEvent(conversationId: string, ownerId: string): void {
  const event: ConversationEvent = {
    type: "conversation.deleted", conversationId, ownerId, timestamp: new Date()
  };
  deleteEvents.emit(event);
}
