export interface UserActivitySummary {
  userId: string;
  totalActivities: number;
  successfulActivities: number;
  failedActivities: number;
  firstActivityAt?: Date;
  lastActivityAt?: Date;
}

export interface UserTrackerEvent {
  userId: string;
  action: string;
  timestamp?: Date;
  success?: boolean;
  metadata?: Record<string, unknown>;
}

function cloneSummary(
  summary: UserActivitySummary,
): UserActivitySummary {
  return {
    ...summary,
    firstActivityAt: summary.firstActivityAt
      ? new Date(summary.firstActivityAt)
      : undefined,
    lastActivityAt: summary.lastActivityAt
      ? new Date(summary.lastActivityAt)
      : undefined,
  };
}

export class UserTracker {
  private readonly summaries = new Map<
    string,
    UserActivitySummary
  >();

  track(event: UserTrackerEvent): UserActivitySummary {
    const timestamp = event.timestamp
      ? new Date(event.timestamp)
      : new Date();

    const existing = this.summaries.get(event.userId);

    if (!existing) {
      const summary: UserActivitySummary = {
        userId: event.userId,
        totalActivities: 1,
        successfulActivities: event.success === false ? 0 : 1,
        failedActivities: event.success === false ? 1 : 0,
        firstActivityAt: timestamp,
        lastActivityAt: timestamp,
      };

      this.summaries.set(event.userId, summary);

      return cloneSummary(summary);
    }

    existing.totalActivities += 1;

    if (event.success === false) {
      existing.failedActivities += 1;
    } else {
      existing.successfulActivities += 1;
    }

    if (
      !existing.firstActivityAt ||
      timestamp < existing.firstActivityAt
    ) {
      existing.firstActivityAt = timestamp;
    }

    if (
      !existing.lastActivityAt ||
      timestamp > existing.lastActivityAt
    ) {
      existing.lastActivityAt = timestamp;
    }

    return cloneSummary(existing);
  }

  getUser(userId: string): UserActivitySummary | undefined {
    const summary = this.summaries.get(userId);

    return summary ? cloneSummary(summary) : undefined;
  }

  getAllUsers(): UserActivitySummary[] {
    return Array.from(this.summaries.values()).map(
      cloneSummary,
    );
  }

  exists(userId: string): boolean {
    return this.summaries.has(userId);
  }

  deleteUser(userId: string): boolean {
    return this.summaries.delete(userId);
  }

  clear(): void {
    this.summaries.clear();
  }

  count(): number {
    return this.summaries.size;
  }

  health(): {
    healthy: boolean;
    trackedUsers: number;
  } {
    return {
      healthy: true,
      trackedUsers: this.summaries.size,
    };
  }
}

export const userTracker = new UserTracker();