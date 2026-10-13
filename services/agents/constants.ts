export const AGENT_STATUSES = [
  "draft",
  "active",
  "paused",
  "archived",
] as const;

export const WORKFLOW_STATUSES = [
  "draft",
  "active",
  "paused",
  "completed",
  "failed",
  "archived",
] as const;

export const JOB_STATUSES = [
  "queued",
  "running",
  "completed",
  "failed",
  "cancelled",
] as const;

export const DEFAULT_AGENT_MODEL = "default";

export const DEFAULT_JOB_PRIORITY = 0;

export const MAX_AGENT_NAME_LENGTH = 200;

export const MAX_DESCRIPTION_LENGTH = 2000;

export const MAX_WORKFLOW_NAME_LENGTH = 200;

export const MAX_JOB_NAME_LENGTH = 200;

