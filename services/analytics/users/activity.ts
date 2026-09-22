function generateId(): string {
  const cryptoApi =
    typeof globalThis !== "undefined" &&
    "crypto" in globalThis &&
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `activity-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return cryptoApi;
}

export type UserActivityType =
  | "login"
  | "logout"
  | "request"
  | "search"
  | "chat"
  | "upload"
  | "download"
  | "create"
  | "update"
  | "delete"
  | "error"
  | "custom";

export interface UserActivity {
  id: string;
  organizationId: string;
  userId: string;

  activityType: UserActivityType;

  action?: string;
  resource?: string;
  resourceId?: string;

  success: boolean;

  durationMs?: number;

  timestamp: number;

  metadata?: Record<string, unknown>;
}

export interface CreateUserActivityInput {
  organizationId: string;
  userId: string;

  activityType: UserActivityType;

  action?: string;
  resource?: string;
  resourceId?: string;

  success?: boolean;

  durationMs?: number;

  timestamp?: number;

  metadata?: Record<string, unknown>;
}

export interface UserActivityFilter {
  organizationId?: string;
  userId?: string;
  activityType?: UserActivityType;
  action?: string;
  resource?: string;
  success?: boolean;

  startTime?: number;
  endTime?: number;
}

export interface UserActivityStatistics {
  activityCount: number;
  successfulActivities: number;
  failedActivities: number;

  successRate: number;

  averageDurationMs: number;

  activityTypes: Record<string, number>;
}

export interface UserActivityHealth {
  connected: boolean;
  healthy: boolean;
  records: number;
  organizations: number;
  users: number;
}

export interface UserActivityOptions {
  maxRecords?: number;
  retentionMs?: number;
}

function validateRequired(
  value: string,
  field: string,
): void {
  if (!value || !value.trim()) {
    throw new Error(`${field} is required`);
  }
}

function validateNumber(
  value: number,
  field: string,
): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${field} must be a finite number`);
  }

  if (value < 0) {
    throw new Error(`${field} cannot be negative`);
  }
}

function cloneActivity(
  activity: UserActivity,
): UserActivity {
  return {
    ...activity,
    metadata: activity.metadata
      ? JSON.parse(JSON.stringify(activity.metadata))
      : undefined,
  };
}

export class UserActivityStore {
  private readonly records =
    new Map<string, UserActivity>();

  private connected = false;

  private readonly maxRecords: number;

  private readonly retentionMs: number;

  constructor(
    options: UserActivityOptions = {},
  ) {
    this.maxRecords =
      options.maxRecords ?? 100_000;

    this.retentionMs =
      options.retentionMs ??
      30 * 24 * 60 * 60 * 1000;

    if (this.maxRecords <= 0) {
      throw new Error(
        "maxRecords must be greater than zero",
      );
    }

    if (this.retentionMs <= 0) {
      throw new Error(
        "retentionMs must be greater than zero",
      );
    }
  }

  connect(): void {
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
        "UserActivityStore is not connected",
      );
    }
  }

  record(
    input: CreateUserActivityInput,
  ): UserActivity {
    this.ensureConnected();

    validateRequired(
      input.organizationId,
      "organizationId",
    );

    validateRequired(
      input.userId,
      "userId",
    );

    validateRequired(
      input.activityType,
      "activityType",
    );

    const durationMs =
      input.durationMs;

    if (durationMs !== undefined) {
      validateNumber(
        durationMs,
        "durationMs",
      );
    }

    const timestamp =
      input.timestamp ?? Date.now();

    if (!Number.isFinite(timestamp)) {
      throw new Error(
        "timestamp must be a finite number",
      );
    }

    const activity: UserActivity = {
      id: generateId(),

      organizationId:
        input.organizationId,

      userId: input.userId,

      activityType:
        input.activityType,

      action: input.action,

      resource: input.resource,

      resourceId:
        input.resourceId,

      success:
        input.success ?? true,

      durationMs,

      timestamp,

      metadata: input.metadata
        ? JSON.parse(
            JSON.stringify(input.metadata),
          )
        : undefined,
    };

    this.records.set(
      activity.id,
      activity,
    );

    this.cleanup();

    return cloneActivity(activity);
  }

  getById(
    id: string,
  ): UserActivity | undefined {
    this.ensureConnected();

    const activity =
      this.records.get(id);

    return activity
      ? cloneActivity(activity)
      : undefined;
  }

  find(
    filter: UserActivityFilter = {},
  ): UserActivity[] {
    this.ensureConnected();

    return [...this.records.values()]
      .filter((activity) => {
        if (
          filter.organizationId !==
            undefined &&
          activity.organizationId !==
            filter.organizationId
        ) {
          return false;
        }

        if (
          filter.userId !== undefined &&
          activity.userId !==
            filter.userId
        ) {
          return false;
        }

        if (
          filter.activityType !==
            undefined &&
          activity.activityType !==
            filter.activityType
        ) {
          return false;
        }

        if (
          filter.action !== undefined &&
          activity.action !==
            filter.action
        ) {
          return false;
        }

        if (
          filter.resource !==
            undefined &&
          activity.resource !==
            filter.resource
        ) {
          return false;
        }

        if (
          filter.success !== undefined &&
          activity.success !==
            filter.success
        ) {
          return false;
        }

        if (
          filter.startTime !==
            undefined &&
          activity.timestamp <
            filter.startTime
        ) {
          return false;
        }

        if (
          filter.endTime !== undefined &&
          activity.timestamp >
            filter.endTime
        ) {
          return false;
        }

        return true;
      })
      .sort(
        (a, b) =>
          b.timestamp - a.timestamp,
      )
      .map(cloneActivity);
  }

  getAll(): UserActivity[] {
    return this.find();
  }

  getUserActivity(
    organizationId: string,
    userId: string,
  ): UserActivity[] {
    validateRequired(
      organizationId,
      "organizationId",
    );

    validateRequired(
      userId,
      "userId",
    );

    return this.find({
      organizationId,
      userId,
    });
  }

  getStatistics(
    filter: UserActivityFilter = {},
  ): UserActivityStatistics {
    const records =
      this.find(filter);

    const activityCount =
      records.length;

    const successfulActivities =
      records.filter(
        (record) => record.success,
      ).length;

    const failedActivities =
      activityCount -
      successfulActivities;

    const activityTypes:
      Record<string, number> = {};

    for (const record of records) {
      activityTypes[
        record.activityType
      ] =
        (activityTypes[
          record.activityType
        ] ?? 0) + 1;
    }

    const durationRecords =
      records.filter(
        (record) =>
          record.durationMs !==
          undefined,
      );

    const averageDurationMs =
      durationRecords.length > 0
        ? durationRecords.reduce(
            (sum, record) =>
              sum +
              (record.durationMs ?? 0),
            0,
          ) /
          durationRecords.length
        : 0;

    return {
      activityCount,

      successfulActivities,

      failedActivities,

      successRate:
        activityCount > 0
          ? successfulActivities /
            activityCount
          : 0,

      averageDurationMs,

      activityTypes,
    };
  }

  clearUser(
    organizationId: string,
    userId: string,
  ): number {
    this.ensureConnected();

    validateRequired(
      organizationId,
      "organizationId",
    );

    validateRequired(
      userId,
      "userId",
    );

    let deleted = 0;

    for (
      const [
        id,
        activity,
      ] of this.records.entries()
    ) {
      if (
        activity.organizationId ===
          organizationId &&
        activity.userId === userId
      ) {
        this.records.delete(id);
        deleted++;
      }
    }

    return deleted;
  }

  clearOrganization(
    organizationId: string,
  ): number {
    this.ensureConnected();

    validateRequired(
      organizationId,
      "organizationId",
    );

    let deleted = 0;

    for (
      const [
        id,
        activity,
      ] of this.records.entries()
    ) {
      if (
        activity.organizationId ===
        organizationId
      ) {
        this.records.delete(id);
        deleted++;
      }
    }

    return deleted;
  }

  clear(): void {
    this.ensureConnected();

    this.records.clear();
  }

  size(): number {
    return this.records.size;
  }

  getOrganizationIds(): string[] {
    return [
      ...new Set(
        [...this.records.values()].map(
          (record) =>
            record.organizationId,
        ),
      ),
    ];
  }

  getUserIds(): string[] {
    return [
      ...new Set(
        [...this.records.values()].map(
          (record) =>
            record.userId,
        ),
      ),
    ];
  }

  health(): UserActivityHealth {
    return {
      connected: this.connected,
      healthy: this.connected,
      records: this.records.size,
      organizations:
        this.getOrganizationIds()
          .length,
      users:
        this.getUserIds().length,
    };
  }

  private cleanup(): void {
    const now = Date.now();

    for (
      const [
        id,
        activity,
      ] of this.records.entries()
    ) {
      if (
        now - activity.timestamp >
        this.retentionMs
      ) {
        this.records.delete(id);
      }
    }

    if (
      this.records.size <=
      this.maxRecords
    ) {
      return;
    }

    const sorted =
      [...this.records.values()]
        .sort(
          (a, b) =>
            a.timestamp -
            b.timestamp,
        );

    const removeCount =
      this.records.size -
      this.maxRecords;

    for (
      let index = 0;
      index < removeCount;
      index++
    ) {
      this.records.delete(
        sorted[index].id,
      );
    }
  }
}