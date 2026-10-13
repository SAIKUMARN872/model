import type { ActionRecord } from "../interfaces.js";
export class ActionRepository {
  private readonly records = new Map<string, ActionRecord>();
  save(record: ActionRecord): ActionRecord {
    this.records.set(record.id, structuredClone(record));
    return structuredClone(record);
  }
  get(id: string): ActionRecord | undefined {
    const value = this.records.get(id);
    return value ? structuredClone(value) : undefined;
  }
  listBySession(sessionId: string): ActionRecord[] {
    return [...this.records.values()]
      .filter((item) => item.sessionId === sessionId)
      .map((item) => structuredClone(item));
  }
}
