// services/analytics/database/connection.ts

import {
  validateEventType,
  validateOrganizationId,
  validateRecordStatus,
  type AnalyticsRecord,
  type CreateAnalyticsRecordInput,
  type DatabaseHealth,
  type DatabaseStats,
  type RecordFilter,
  type UpdateAnalyticsRecordInput,
} from "./models.js";

export interface DatabaseConnectionOptions {
  maxRecords?: number;
}

function createRandomId(): string {
  const cryptoApi =
    (globalThis as typeof globalThis & {
      crypto?: {
        randomUUID?: () => string;
      };
    }).crypto;

  if (
    cryptoApi &&
    typeof cryptoApi.randomUUID === "function"
  ) {
    return cryptoApi.randomUUID();
  }

  return `record_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

export class DatabaseConnection {
  private readonly records =
    new Map<string, AnalyticsRecord>();

  private readonly maxRecords: number;

  private connected = false;

  constructor(
    options: DatabaseConnectionOptions = {},
  ) {
    this.maxRecords =
      options.maxRecords ?? 10000;

    if (
      !Number.isInteger(this.maxRecords) ||
      this.maxRecords <= 0
    ) {
      throw new Error(
        "maxRecords must be a positive integer",
      );
    }
  }

  connect(): void {
    if (this.connected) {
      return;
    }

    this.connected = true;
  }

  disconnect(): void {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  private ensureConnected(): void {
    if (!this.connected) {
      throw new Error(
        "Database is not connected",
      );
    }
  }

  create(
    input: CreateAnalyticsRecordInput,
  ): AnalyticsRecord {
    this.ensureConnected();

    validateOrganizationId(
      input.organizationId,
    );

    validateEventType(input.eventType);

    const status =
      input.status ?? "active";

    validateRecordStatus(status);

    if (this.records.size >= this.maxRecords) {
      this.removeOldestRecord();
    }

    const now =
      new Date().toISOString();

    const record: AnalyticsRecord = {
      id: createRandomId(),
      organizationId:
        input.organizationId.trim(),
      eventType:
        input.eventType.trim(),
      status,
      data: {
        ...(input.data ?? {}),
      },
      createdAt: now,
      updatedAt: now,
    };

    this.records.set(
      record.id,
      record,
    );

    return this.cloneRecord(record);
  }

  getById(
    organizationId: string,
    id: string,
  ): AnalyticsRecord | undefined {
    this.ensureConnected();

    validateOrganizationId(
      organizationId,
    );

    if (!id || id.trim().length === 0) {
      throw new Error(
        "Record ID cannot be empty",
      );
    }

    const record =
      this.records.get(id);

    if (
      !record ||
      record.organizationId !==
        organizationId.trim()
    ) {
      return undefined;
    }

    return this.cloneRecord(record);
  }

  find(
    filter: RecordFilter = {},
  ): AnalyticsRecord[] {
    this.ensureConnected();

    if (filter.organizationId !== undefined) {
      validateOrganizationId(
        filter.organizationId,
      );
    }

    if (filter.eventType !== undefined) {
      validateEventType(
        filter.eventType,
      );
    }

    if (filter.status !== undefined) {
      validateRecordStatus(
        filter.status,
      );
    }

    return Array.from(
      this.records.values(),
    )
      .filter((record) => {
        if (
          filter.organizationId !== undefined &&
          record.organizationId !==
            filter.organizationId.trim()
        ) {
          return false;
        }

        if (
          filter.eventType !== undefined &&
          record.eventType !==
            filter.eventType.trim()
        ) {
          return false;
        }

        if (
          filter.status !== undefined &&
          record.status !== filter.status
        ) {
          return false;
        }

        if (
          filter.createdAfter !== undefined &&
          Date.parse(record.createdAt) <=
            Date.parse(filter.createdAfter)
        ) {
          return false;
        }

        if (
          filter.createdBefore !== undefined &&
          Date.parse(record.createdAt) >=
            Date.parse(filter.createdBefore)
        ) {
          return false;
        }

        return true;
      })
      .map((record) =>
        this.cloneRecord(record),
      );
  }

  update(
    organizationId: string,
    id: string,
    updates: UpdateAnalyticsRecordInput,
  ): AnalyticsRecord {
    this.ensureConnected();

    const record =
      this.requireRecord(
        organizationId,
        id,
      );

    if (updates.eventType !== undefined) {
      validateEventType(
        updates.eventType,
      );

      record.eventType =
        updates.eventType.trim();
    }

    if (updates.status !== undefined) {
      validateRecordStatus(
        updates.status,
      );

      record.status =
        updates.status;
    }

    if (updates.data !== undefined) {
      record.data = {
        ...updates.data,
      };
    }

    const nextUpdatedAt =
      new Date();
    const createdAtMs =
      Date.parse(record.createdAt);

    if (
      nextUpdatedAt.getTime() <=
      createdAtMs
    ) {
      nextUpdatedAt.setTime(
        createdAtMs + 1,
      );
    }

    record.updatedAt =
      nextUpdatedAt.toISOString();

    return this.cloneRecord(record);
  }

  delete(
    organizationId: string,
    id: string,
  ): boolean {
    this.ensureConnected();

    const record =
      this.requireRecord(
        organizationId,
        id,
      );

    return this.records.delete(
      record.id,
    );
  }

  softDelete(
    organizationId: string,
    id: string,
  ): AnalyticsRecord {
    this.ensureConnected();

    return this.update(
      organizationId,
      id,
      {
        status: "deleted",
      },
    );
  }

  count(
    organizationId?: string,
  ): number {
    this.ensureConnected();

    if (organizationId !== undefined) {
      validateOrganizationId(
        organizationId,
      );

      return this.find({
        organizationId,
      }).length;
    }

    return this.records.size;
  }

  stats(
    organizationId?: string,
  ): DatabaseStats {
    this.ensureConnected();

    const records =
      organizationId === undefined
        ? Array.from(
            this.records.values(),
          )
        : this.find({
            organizationId,
          });

    const organizations =
      new Set(
        records.map(
          (record) =>
            record.organizationId,
        ),
      );

    return {
      totalRecords: records.length,
      activeRecords: records.filter(
        (record) =>
          record.status === "active",
      ).length,
      inactiveRecords: records.filter(
        (record) =>
          record.status === "inactive",
      ).length,
      deletedRecords: records.filter(
        (record) =>
          record.status === "deleted",
      ).length,
      organizations:
        organizations.size,
    };
  }

  health(): DatabaseHealth {
    return {
      healthy:
        this.connected &&
        this.records.size <=
          this.maxRecords,
      connected: this.connected,
      totalRecords:
        this.records.size,
      organizations:
        new Set(
          Array.from(
            this.records.values(),
          ).map(
            (record) =>
              record.organizationId,
          ),
        ).size,
    };
  }

  clearOrganization(
    organizationId: string,
  ): number {
    this.ensureConnected();

    validateOrganizationId(
      organizationId,
    );

    let removed = 0;

    for (
      const [
        id,
        record,
      ] of this.records.entries()
    ) {
      if (
        record.organizationId ===
        organizationId.trim()
      ) {
        this.records.delete(id);
        removed += 1;
      }
    }

    return removed;
  }

  clear(): void {
    this.ensureConnected();

    this.records.clear();
  }

  size(): number {
    return this.records.size;
  }

  transaction<T>(
    operation: (
      database: DatabaseConnection,
    ) => T,
  ): T {
    this.ensureConnected();

    const snapshot =
      new Map<string, AnalyticsRecord>();

    for (
      const [
        id,
        record,
      ] of this.records.entries()
    ) {
      snapshot.set(
        id,
        this.cloneRecord(record),
      );
    }

    try {
      return operation(this);
    } catch (error) {
      this.records.clear();

      for (
        const [
          id,
          record,
        ] of snapshot.entries()
      ) {
        this.records.set(
          id,
          record,
        );
      }

      throw error;
    }
  }

  private requireRecord(
    organizationId: string,
    id: string,
  ): AnalyticsRecord {
    validateOrganizationId(
      organizationId,
    );

    if (!id || id.trim().length === 0) {
      throw new Error(
        "Record ID cannot be empty",
      );
    }

    const record =
      this.records.get(id);

    if (
      !record ||
      record.organizationId !==
        organizationId.trim()
    ) {
      throw new Error(
        `Record not found: ${id}`,
      );
    }

    return record;
  }

  private removeOldestRecord(): void {
    const oldest =
      Array.from(
        this.records.values(),
      ).sort(
        (a, b) =>
          Date.parse(a.createdAt) -
          Date.parse(b.createdAt),
      )[0];

    if (oldest) {
      this.records.delete(
        oldest.id,
      );
    }
  }

  private cloneRecord(
    record: AnalyticsRecord,
  ): AnalyticsRecord {
    return {
      ...record,
      data: {
        ...record.data,
      },
    };
  }
}