import type { UserActivity } from "./activity.js";

export interface UserBehavior {
  userId: string;
  actionCount: number;
  uniqueActions: number;
  lastActivity?: string;
}

export function analyzeUserBehavior(
  activities: UserActivity[],
): UserBehavior[] {
  const groups = new Map<string, UserActivity[]>();

  for (const activity of activities) {
    const current = groups.get(activity.userId) ?? [];
    current.push(activity);
    groups.set(activity.userId, current);
  }

  return Array.from(groups.entries()).map(([userId, values]) => {
    const actions = new Set(
      values.map((value) => value.action),
    );

    const sorted = [...values].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() -
        new Date(a.timestamp).getTime(),
    );

    return {
      userId,
      actionCount: values.length,
      uniqueActions: actions.size,
      lastActivity: sorted[0]?.timestamp,
    };
  });
}
