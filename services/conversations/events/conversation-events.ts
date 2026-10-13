import type { ConversationEvent } from "../interfaces.js";
type Listener = (event: ConversationEvent) => void;

export class ConversationEventEmitter {
  private readonly listeners = new Set<Listener>();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }
  emit(event: ConversationEvent): void {
    for (const listener of this.listeners) {
      listener({ ...event, timestamp: new Date(event.timestamp), data: event.data ? { ...event.data } : undefined });
    }
  }
}
export const conversationEvents = new ConversationEventEmitter();
