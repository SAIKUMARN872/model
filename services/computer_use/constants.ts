export const COMPUTER_USE_DEFAULT_TIMEOUT_MS = 30000;
export const COMPUTER_USE_MAX_TIMEOUT_MS = 120000;
export const COMPUTER_USE_MAX_SCREENSHOTS = 100;
export const COMPUTER_USE_APPROVAL_REQUIRED = true;

export const COMPUTER_USE_ACTION_TYPES = [
  "click",
  "double_click",
  "type",
  "press_key",
  "scroll",
  "move",
  "screenshot",
  "wait"
] as const;

export const COMPUTER_USE_SESSION_STATUSES = [
  "created",
  "active",
  "paused",
  "completed",
  "failed",
  "closed"
] as const;

export const COMPUTER_USE_ACTION_STATUSES = [
  "pending",
  "running",
  "completed",
  "failed",
  "rejected"
] as const;
