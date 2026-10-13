import type { Conversation } from "../interfaces.js";
import { cloneRecord } from "../utils.js";

export class ConversationRepository {
  private readonly records = new Map<string, Conversation>();
  save(conversation: Conversation): Conversation {
    this.records.set(conversation.id, cloneRecord(conversation));
    return cloneRecord(conversation);
  }
  get(id: string): Conversation | undefined {
    const value = this.records.get(id);
    return value ? cloneRecord(value) : undefined;
  }
  listByOwner(ownerId: string, includeDeleted = false): Conversation[] {
    return [...this.records.values()]
      .filter(item => item.ownerId === ownerId && (includeDeleted || item.status !== "deleted"))
      .map(item => cloneRecord(item));
  }
  delete(id: string): boolean { return this.records.delete(id); }
}
