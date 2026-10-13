import type { Share } from "../interfaces.js";
import { cloneRecord } from "../utils.js";

export class ShareRepository {
  private readonly records = new Map<string, Share>();
  save(share: Share): Share {
    this.records.set(share.id, cloneRecord(share));
    return cloneRecord(share);
  }
  get(id: string): Share | undefined {
    const value = this.records.get(id);
    return value ? cloneRecord(value) : undefined;
  }
  getByToken(token: string): Share | undefined {
    const value = [...this.records.values()].find(item => item.token === token);
    return value ? cloneRecord(value) : undefined;
  }
  listByConversation(conversationId: string): Share[] {
    return [...this.records.values()].filter(item => item.conversationId === conversationId).map(item => cloneRecord(item));
  }
  listByOwner(ownerId: string): Share[] {
    return [...this.records.values()].filter(item => item.ownerId === ownerId).map(item => cloneRecord(item));
  }
  delete(id: string): boolean { return this.records.delete(id); }
}
