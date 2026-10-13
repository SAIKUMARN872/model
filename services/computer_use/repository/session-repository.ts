import type { SessionRecord } from "../interfaces.js";
export class SessionRepository {
  private readonly records = new Map<string, SessionRecord>();
  save(record: SessionRecord): SessionRecord {
    this.records.set(record.id, structuredClone(record));
    return structuredClone(record);
  }
  get(id: string): SessionRecord | undefined {
    const value = this.records.get(id);
    return value ? structuredClone(value) : undefined;
  }
  list(): SessionRecord[] {
    return [...this.records.values()].map((item) => structuredClone(item));
  }
}
