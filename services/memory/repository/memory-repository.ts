import type {
  CreateMemoryInput,
  MemoryRecord,
  UpdateMemoryInput,
} from "../schemas/memory-schema.js";

function clone<T>(value: T): T {
  if (value === undefined || value === null) return value;
  return structuredClone(value);
}

export class MemoryRepository {
  private readonly records = new Map<string, MemoryRecord>();
  private nextId = 1;

  create(input: CreateMemoryInput): MemoryRecord {
    const now = Date.now();
    const record: MemoryRecord = {
      id: String(this.nextId++),
      key: input.key,
      value: clone(input.value),
      metadata: clone(input.metadata ?? {}),
      createdAt: now,
      updatedAt: now,
    };

    this.records.set(record.id, record);
    return clone(record);
  }

  getById(id: string): MemoryRecord | undefined {
    const record = this.records.get(id);
    return record ? clone(record) : undefined;
  }

  getByKey(key: string): MemoryRecord | undefined {
    const record = [...this.records.values()].find((item) => item.key === key);
    return record ? clone(record) : undefined;
  }

  list(): MemoryRecord[] {
    return [...this.records.values()].map(clone);
  }

  update(id: string, input: UpdateMemoryInput): MemoryRecord | undefined {
    const existing = this.records.get(id);
    if (!existing) return undefined;

    const updated: MemoryRecord = {
      ...existing,
      value: input.value === undefined ? existing.value : clone(input.value),
      metadata:
        input.metadata === undefined
          ? existing.metadata
          : { ...existing.metadata, ...clone(input.metadata) },
      updatedAt: Date.now(),
    };

    this.records.set(id, updated);
    return clone(updated);
  }

  delete(id: string): boolean {
    return this.records.delete(id);
  }

  clear(): void {
    this.records.clear();
  }

  count(): number {
    return this.records.size;
  }
}
