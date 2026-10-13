import type { Activity } from "./activity_tracker.js";

export interface UserActivitySummary {
    userId: string;
    totalActivities: number;
    actions: Record<string, number>;
    firstActivity?: Date;
    lastActivity?: Date;
}

export class UserTracker {
    constructor(
        private readonly activitySource: {
            getByUser(userId: string): Activity[];
        }
    ) {}

    getUserSummary(userId: string): UserActivitySummary {
        const activities = this.activitySource.getByUser(userId);

        const actions: Record<string, number> = {};

        for (const activity of activities) {
            actions[activity.action] =
                (actions[activity.action] ?? 0) + 1;
        }

        const timestamps = activities
            .map((activity) => activity.timestamp.getTime())
            .sort((a, b) => a - b);

        return {
            userId,
            totalActivities: activities.length,
            actions,
            firstActivity:
                timestamps.length > 0
                    ? new Date(timestamps[0])
                    : undefined,
            lastActivity:
                timestamps.length > 0
                    ? new Date(timestamps[timestamps.length - 1])
                    : undefined
        };
    }

    hasActivity(userId: string, action?: string): boolean {
        const activities = this.activitySource.getByUser(userId);

        if (action === undefined) {
            return activities.length > 0;
        }

        return activities.some(
            (activity) => activity.action === action
        );
    }
}
