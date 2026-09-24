import type {
  StorageRecord,
} from "./repository.js";

export interface ArchivedRecord {
  id: string;
  originalId: string;
  data: Record<string, unknown>;
  archivedAt: string;
  reason?: string;
}

export interface ArchiveOptions {
  reason?: string;
}

export class StorageArchive {
  private readonly archived =
    new Map<string, ArchivedRecord>();

  archive(
    record: StorageRecord,
    options: ArchiveOptions = {},
  ): ArchivedRecord {
    const archivedRecord: ArchivedRecord = {
      id: this.generateId(),
      originalId: record.id,
      data: {
        ...record.data,
      },
      archivedAt:
        new Date().toISOString(),
      reason: options.reason,
    };

    this.archived.set(
      archivedRecord.id,
      archivedRecord,
    );

    return this.clone(
      archivedRecord,
    );
  }

  archiveMany(
    records: StorageRecord[],
    options: ArchiveOptions = {},
  ): ArchivedRecord[] {
    return records.map(
      (record) =>
        this.archive(
          record,
          options,
        ),
    );
  }

  getById(
    id: string,
  ): ArchivedRecord | undefined {
    const record =
      this.archived.get(id);

    return record
      ? this.clone(record)
      : undefined;
  }

  findByOriginalId(
    originalId: string,
  ): ArchivedRecord[] {
    return Array.from(
      this.archived.values(),
    )
      .filter(
        (record) =>
          record.originalId ===
          originalId,
      )
      .map((record) =>
        this.clone(record),
      );
  }

  all(): ArchivedRecord[] {
    return Array.from(
      this.archived.values(),
    ).map((record) =>
      this.clone(record),
    );
  }

  count(): number {
    return this.archived.size;
  }

  delete(id: string): boolean {
    return this.archived.delete(id);
  }

  clear(): void {
    this.archived.clear();
  }

  health(): {
    healthy: boolean;
    archivedCount: number;
    timestamp: string;
  } {
    return {
      healthy: true,
      archivedCount:
        this.archived.size,
      timestamp:
        new Date().toISOString(),
    };
  }

  private clone(
    record: ArchivedRecord,
  ): ArchivedRecord {
    return {
      ...record,
      data: {
        ...record.data,
      },
    };
  }

  private generateId(): string {
    return `archive-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  }
}

export const storageArchive =
  new StorageArchive();