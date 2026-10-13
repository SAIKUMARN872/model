import type { ScreenshotRecord } from "../interfaces.js";
export class ScreenshotRepository {
  private readonly records = new Map<string, ScreenshotRecord>();
  constructor(private readonly maxRecords = 100) {}
  save(record: ScreenshotRecord): ScreenshotRecord {
    this.records.set(record.id, structuredClone(record));
    while (this.records.size > this.maxRecords) {
      const oldest = this.records.keys().next().value as string | undefined;
      if (oldest === undefined) break;
      this.records.delete(oldest);
    }
    return structuredClone(record);
  }
  get(id: string): ScreenshotRecord | undefined {
    const value = this.records.get(id);
    return value ? structuredClone(value) : undefined;
  }
  listBySession(sessionId: string): ScreenshotRecord[] {
    return [...this.records.values()]
      .filter((item) => item.sessionId === sessionId)
      .map((item) => structuredClone(item));
  }
}
