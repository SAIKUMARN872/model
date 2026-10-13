import type {
  ExecutionFilter,
  ExecutionRecord,
  ExecutionStatus
} from "../execution.types.js";

function cloneExecution(record: ExecutionRecord): ExecutionRecord {
  return structuredClone(record);
}

export class ExecutionRepository {
  private readonly records = new Map<string, ExecutionRecord>();

  async create(record: ExecutionRecord): Promise<ExecutionRecord> {
    if (this.records.has(record.id)) {
      throw new Error(`Execution '${record.id}' already exists.`);
    }

    this.records.set(record.id, cloneExecution(record));
    return cloneExecution(record);
  }

  async getById(id: string): Promise<ExecutionRecord | undefined> {
    const record = this.records.get(id);
    return record ? cloneExecution(record) : undefined;
  }

  async update(
    id: string,
    update: Partial<ExecutionRecord>
  ): Promise<ExecutionRecord> {
    const existing = this.records.get(id);

    if (!existing) {
      throw new Error(`Execution '${id}' was not found.`);
    }

    const updated = cloneExecution({
      ...existing,
      ...update,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date()
    });

    this.records.set(id, updated);
    return cloneExecution(updated);
  }

  async delete(id: string): Promise<boolean> {
    return this.records.delete(id);
  }

  async list(filter: ExecutionFilter = {}): Promise<ExecutionRecord[]> {
    let results = [...this.records.values()];

    if (filter.status) {
      results = results.filter((record) => record.status === filter.status);
    }

    if (filter.task) {
      results = results.filter((record) => record.task === filter.task);
    }

    results.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    const offset = Math.max(0, filter.offset ?? 0);
    const limit = Math.max(0, filter.limit ?? results.length);

    return results.slice(offset, offset + limit).map(cloneExecution);
  }

  async count(status?: ExecutionStatus): Promise<number> {
    if (!status) return this.records.size;

    return [...this.records.values()].filter(
      (record) => record.status === status
    ).length;
  }

  async clear(): Promise<void> {
    this.records.clear();
  }
}
