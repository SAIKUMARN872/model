export type ScheduleSection =
  | "Today"
  | "Upcoming"
  | "Recurring";

export type ScheduleStatus =
  | "Scheduled"
  | "Running"
  | "Completed"
  | "Cancelled"
  | "Failed"
  | "Paused";

export type ScheduleTaskType =
  | "AI Task"
  | "Agent Workflow"
  | "Browser Automation"
  | "Computer Use"
  | "Knowledge Hub"
  | "Plugin Workflow";

export type RecurrenceType =
  | "None"
  | "Daily"
  | "Weekly"
  | "Monthly"
  | "Custom";

export type ApprovalMode =
  | "Always"
  | "Risky Actions"
  | "Never";

export type NotificationSettings = {
  onSuccess: boolean;
  onFailure: boolean;
  beforeExecution: boolean;
};

export type ScheduleConditions = {
  runOnlyIf?: string;
  skipIf?: string;
};

export type ScheduleRecurrence = {
  type: RecurrenceType;
  interval?: number;
  daysOfWeek?: string[];
  dayOfMonth?: number;
};

export type ScheduleItem = {
  id: number;
  title: string;
  description: string;
  time: string;
  date: string;
  type: ScheduleSection;
  status: ScheduleStatus;
  taskType: ScheduleTaskType;
  timezone: string;
  recurrence: ScheduleRecurrence;
  conditions: ScheduleConditions;
  notifications: NotificationSettings;
  approval: ApprovalMode;
  nextRun?: string;
  lastRun?: string;
  executionStatus?: string;
};