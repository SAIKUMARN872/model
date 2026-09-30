export interface StorageRecord {
  id: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStorageRecordInput {
  id?: string;
  data: Record<string, unknown>;
}

export interface UpdateStorageRecordInput {
  data: Record<string, unknown>;
}

export class StorageRepository {
  private readonly records =
    new Map<string, StorageRecord>();

  create(
    input: CreateStorageRecordInput,
  ): StorageRecord {
    const id =
      input.id ?? this.generateId();

    if (this.records.has(id)) {
      throw new Error(
        `Storage record already exists: ${id}`,
      );
    }

    const now =
      new Date().toISOString();

    const record: StorageRecord = {
      id,
      data: { ...input.data },
      createdAt: now,
      updatedAt: now,
    };

    this.records.set(id, record);

    return this.clone(record);
  }

  getById(
    id: string,
  ): StorageRecord | undefined {
    const record =
      this.records.get(id);

    return record
      ? this.clone(record)
      : undefined;
  }

  update(
    id: string,
    input: UpdateStorageRecordInput,
  ): StorageRecord {
    const existing =
      this.records.get(id);

    if (!existing) {
      throw new Error(
        `Storage record not found: ${id}`,
      );
    }

    const updated: StorageRecord = {
      ...existing,
      data: {
        ...input.data,
      },
      updatedAt:
        new Date().toISOString(),
    };

    this.records.set(id, updated);

    return this.clone(updated);
  }

  upsert(
    input: CreateStorageRecordInput,
  ): StorageRecord {
    const id =
      input.id ?? this.generateId();

    const existing =
      this.records.get(id);

    if (existing) {
      return this.update(id, {
        data: input.data,
      });
    }

    return this.create({
      id,
      data: input.data,
    });
  }

  delete(id: string): boolean {
    return this.records.delete(id);
  }

  exists(id: string): boolean {
    return this.records.has(id);
  }

  find(
    predicate?: (
      record: StorageRecord,
    ) => boolean,
  ): StorageRecord[] {
    const records =
      Array.from(
        this.records.values(),
      );

    const filtered = predicate
      ? records.filter(predicate)
      : records;

    return filtered.map(
      (record) => this.clone(record),
    );
  }

  all(): StorageRecord[] {
    return this.find();
  }

  count(): number {
    return this.records.size;
  }

  clear(): void {
    this.records.clear();
  }

  health(): {
    healthy: boolean;
    recordCount: number;
    timestamp: string;
  } {
    return {
      healthy: true,
      recordCount: this.records.size,
      timestamp:
        new Date().toISOString(),
    };
  }

  private clone(
    record: StorageRecord,
  ): StorageRecord {
    return {
      ...record,
      data: {
        ...record.data,
      },
    };
  }

  private generateId(): string {
    return `storage-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  }
}

export const storageRepository =
  new StorageRepository();