import type { Message } from "../interfaces.js";
import { cloneRecord } from "../utils.js";

export class MessageRepository {
  private readonly records = new Map<string, Message>();
  save(message: Message): Message {
    this.records.set(message.id, cloneRecord(message));
    return cloneRecord(message);
  }
  get(id: string): Message | undefined {
    const value = this.records.get(id);
    return value ? cloneRecord(value) : undefined;
  }
  listByConversation(conversationId: string): Message[] {
    return [...this.records.values()]
      .filter(item => item.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map(item => cloneRecord(item));
  }
  deleteByConversation(conversationId: string): number {
    let count = 0;
    for (const [id, message] of this.records) {
      if (message.conversationId === conversationId) {
        this.records.delete(id);
        count++;
      }
    }
    return count;
  }
}
