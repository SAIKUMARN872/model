import {
  UserActivity,
  UserActivityFilter,
  UserActivityStore,
} from "./activity.js";

export interface UserBehaviorSummary {
  organizationId: string;
  userId: string;

  totalActivities: number;

  successfulActivities: number;
  failedActivities: number;

  successRate: number;

  averageDurationMs: number;

  firstActivityAt?: number;
  lastActivityAt?: number;

  activityTypes: Record<string, number>;

  topActivityType?: string;
}

export interface UserBehaviorOptions {
  organizationId: string;
  userId: string;
}

export interface UserActivityTrend {
  periodStart: number;
  periodEnd: number;
  activityCount: number;
  successCount: number;
  failureCount: number;
}

function calculateSummary(
  organizationId: string,
  userId: string,
  records: UserActivity[],
): UserBehaviorSummary {
  const totalActivities =
    records.length;

  const successfulActivities =
    records.filter(
      (record) => record.success,
    ).length;

  const failedActivities =
    totalActivities -
    successfulActivities;

  const durations =
    records.filter(
      (record) =>
        record.durationMs !==
        undefined,
    );

  const averageDurationMs =
    durations.length > 0
      ? durations.reduce(
          (sum, record) =>
            sum +
            (record.durationMs ?? 0),
          0,
        ) /
        durations.length
      : 0;

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

  const topActivityType =
    Object.entries(activityTypes)
      .sort(
        (a, b) =>
          b[1] - a[1],
      )[0]?.[0];

  const timestamps =
    records.map(
      (record) => record.timestamp,
    );

  return {
    organizationId,

    userId,

    totalActivities,

    successfulActivities,

    failedActivities,

    successRate:
      totalActivities > 0
        ? successfulActivities /
          totalActivities
        : 0,

    averageDurationMs,

    firstActivityAt:
      timestamps.length > 0
        ? Math.min(...timestamps)
        : undefined,

    lastActivityAt:
      timestamps.length > 0
        ? Math.max(...timestamps)
        : undefined,

    activityTypes,

    topActivityType,
  };
}

export function analyzeUserBehavior(
  store: UserActivityStore,
  options: UserBehaviorOptions,
): UserBehaviorSummary {
  const records =
    store.getUserActivity(
      options.organizationId,
      options.userId,
    );

  return calculateSummary(
    options.organizationId,
    options.userId,
    records,
  );
}

export function analyzeOrganizationBehavior(
  store: UserActivityStore,
  organizationId: string,
): UserBehaviorSummary[] {
  const records =
    store.find({
      organizationId,
    });

  const users =
    new Set(
      records.map(
        (record) => record.userId,
      ),
    );

  return [...users].map(
    (userId) =>
      calculateSummary(
        organizationId,
        userId,
        records.filter(
          (record) =>
            record.userId ===
            userId,
        ),
      ),
  );
}

export function getActiveUsers(
  store: UserActivityStore,
  filter: UserActivityFilter = {},
): string[] {
  const records =
    store.find(filter);

  return [
    ...new Set(
      records.map(
        (record) => record.userId,
      ),
    ),
  ];
}

export function getMostActiveUsers(
  store: UserActivityStore,
  organizationId: string,
  limit = 10,
): Array<{
  userId: string;
  activityCount: number;
}> {
  if (limit <= 0) {
    throw new Error(
      "limit must be greater than zero",
    );
  }

  const records =
    store.find({
      organizationId,
    });

  const counts =
    new Map<string, number>();

  for (const record of records) {
    counts.set(
      record.userId,
      (counts.get(
        record.userId,
      ) ?? 0) + 1,
    );
  }

  return [...counts.entries()]
    .map(
      ([userId, activityCount]) => ({
        userId,
        activityCount,
      }),
    )
    .sort(
      (a, b) =>
        b.activityCount -
        a.activityCount,
    )
    .slice(0, limit);
}

export function calculateActivityTrend(
  store: UserActivityStore,
  options: {
    organizationId: string;
    userId?: string;
    startTime: number;
    endTime: number;
    bucketMs: number;
  },
): UserActivityTrend[] {
  if (
    options.bucketMs <= 0
  ) {
    throw new Error(
      "bucketMs must be greater than zero",
    );
  }

  if (
    options.endTime <
    options.startTime
  ) {
    throw new Error(
      "endTime must be greater than or equal to startTime",
    );
  }

  const records =
    store.find({
      organizationId:
        options.organizationId,
      userId: options.userId,
      startTime:
        options.startTime,
      endTime:
        options.endTime,
    });

  const result: UserActivityTrend[] =
    [];

  for (
    let start =
      options.startTime;
    start < options.endTime;
    start += options.bucketMs
  ) {
    const end = Math.min(
      start + options.bucketMs,
      options.endTime,
    );

    const bucketRecords =
      records.filter(
        (record) =>
          record.timestamp >=
            start &&
          record.timestamp <
            end,
      );

    result.push({
      periodStart: start,

      periodEnd: end,

      activityCount:
        bucketRecords.length,

      successCount:
        bucketRecords.filter(
          (record) =>
            record.success,
        ).length,

      failureCount:
        bucketRecords.filter(
          (record) =>
            !record.success,
        ).length,
    });
  }

  return result;
}