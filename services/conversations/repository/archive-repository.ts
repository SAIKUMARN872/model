import type { ArchiveRecord } from "../interfaces.js";
import { cloneRecord } from "../utils.js";

export class ArchiveRepository {
  private readonly records = new Map<string, ArchiveRecord>();
  save(record: ArchiveRecord): ArchiveRecord {
    this.records.set(record.id, cloneRecord(record));
    return cloneRecord(record);
  }
  listByOwner(ownerId: string): ArchiveRecord[] {
    return [...this.records.values()].filter(item => item.ownerId === ownerId).map(item => cloneRecord(item));
  }
  listByConversation(conversationId: string): ArchiveRecord[] {
    return [...this.records.values()].filter(item => item.conversationId === conversationId).map(item => cloneRecord(item));
  }
}
