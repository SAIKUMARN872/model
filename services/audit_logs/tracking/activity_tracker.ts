import { randomUUID } from "node:crypto";

export interface Activity {
    id: string;
    userId: string;
    action: string;
    timestamp: Date;
    metadata: Record<string, unknown>;
}

export interface ActivityTrackerOptions {
    now?: () => Date;
}

export class ActivityTracker {
    private readonly activities: Activity[] = [];
    private readonly now: () => Date;

    constructor(options: ActivityTrackerOptions = {}) {
        this.now = options.now ?? (() => new Date());
    }

    track(
        userId: string,
        action: string,
        metadata: Record<string, unknown> = {}
    ): Activity {
        if (!userId.trim()) {
            throw new Error("User ID is required");
        }

        if (!action.trim()) {
            throw new Error("Activity action is required");
        }

        const activity: Activity = {
            id: randomUUID(),
            userId,
            action,
            timestamp: this.now(),
            metadata: { ...metadata }
        };

        this.activities.push(activity);

        return cloneActivity(activity);
    }

    getAll(): Activity[] {
        return this.activities.map(cloneActivity);
    }

    getByUser(userId: string): Activity[] {
        return this.activities
            .filter((activity) => activity.userId === userId)
            .map(cloneActivity);
    }

    count(userId?: string): number {
        if (userId === undefined) {
            return this.activities.length;
        }

        return this.activities.filter(
            (activity) => activity.userId === userId
        ).length;
    }

    clear(): void {
        this.activities.length = 0;
    }
}

function cloneActivity(
    activity: Activity
): Activity {
    return {
        ...activity,
        timestamp: new Date(activity.timestamp),
        metadata: { ...activity.metadata }
    };
}
