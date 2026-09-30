export type ActivityAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "search"
  | "download"
  | "upload"
  | "execute"
  | "other";

export interface ActivityRecord {
  id: string;
  userId: string;
  action: ActivityAction;
  resource?: string;
  resourceId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
  success: boolean;
}

export interface TrackActivityInput {
  userId: string;
  action: ActivityAction;
  resource?: string;
  resourceId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  success?: boolean;
  timestamp?: Date;
}

export interface ActivityFilter {
  userId?: string;
  action?: ActivityAction;
  resource?: string;
  success?: boolean;
  from?: Date;
  to?: Date;
}

function cloneActivity(activity: ActivityRecord): ActivityRecord {
  return {
    ...activity,
    timestamp: new Date(activity.timestamp),
    metadata: activity.metadata
      ? { ...activity.metadata }
      : undefined,
  };
}

function generateId(): string {
  return `activity_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export class ActivityTracker {
  private readonly activities = new Map<string, ActivityRecord>();

  track(input: TrackActivityInput): ActivityRecord {
    const activity: ActivityRecord = {
      id: generateId(),
      userId: input.userId,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId,
      description: input.description,
      metadata: input.metadata ? { ...input.metadata } : undefined,
      timestamp: input.timestamp
        ? new Date(input.timestamp)
        : new Date(),
      success: input.success ?? true,
    };

    this.activities.set(activity.id, activity);

    return cloneActivity(activity);
  }

  getById(id: string): ActivityRecord | undefined {
    const activity = this.activities.get(id);

    return activity ? cloneActivity(activity) : undefined;
  }

  getUserActivities(userId: string): ActivityRecord[] {
    return Array.from(this.activities.values())
      .filter((activity) => activity.userId === userId)
      .sort(
        (a, b) =>
          b.timestamp.getTime() - a.timestamp.getTime(),
      )
      .map(cloneActivity);
  }

  find(filter: ActivityFilter = {}): ActivityRecord[] {
    return Array.from(this.activities.values())
      .filter((activity) => {
        if (
          filter.userId !== undefined &&
          activity.userId !== filter.userId
        ) {
          return false;
        }

        if (
          filter.action !== undefined &&
          activity.action !== filter.action
        ) {
          return false;
        }

        if (
          filter.resource !== undefined &&
          activity.resource !== filter.resource
        ) {
          return false;
        }

        if (
          filter.success !== undefined &&
          activity.success !== filter.success
        ) {
          return false;
        }

        if (
          filter.from !== undefined &&
          activity.timestamp < filter.from
        ) {
          return false;
        }

        if (
          filter.to !== undefined &&
          activity.timestamp > filter.to
        ) {
          return false;
        }

        return true;
      })
      .sort(
        (a, b) =>
          b.timestamp.getTime() - a.timestamp.getTime(),
      )
      .map(cloneActivity);
  }

  count(filter: ActivityFilter = {}): number {
    return this.find(filter).length;
  }

  delete(id: string): boolean {
    return this.activities.delete(id);
  }

  clear(): void {
    this.activities.clear();
  }

  all(): ActivityRecord[] {
    return Array.from(this.activities.values())
      .sort(
        (a, b) =>
          b.timestamp.getTime() - a.timestamp.getTime(),
      )
      .map(cloneActivity);
  }

  health(): {
    healthy: boolean;
    activityCount: number;
  } {
    return {
      healthy: true,
      activityCount: this.activities.size,
    };
  }
}

export const activityTracker = new ActivityTracker();