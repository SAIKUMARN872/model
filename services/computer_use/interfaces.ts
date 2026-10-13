export type SessionStatus =
  | "created"
  | "active"
  | "paused"
  | "completed"
  | "failed"
  | "closed";

export type ActionType =
  | "click"
  | "double_click"
  | "type"
  | "press_key"
  | "scroll"
  | "move"
  | "screenshot"
  | "wait";

export type ActionStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "rejected";

export interface ComputerDevice {
  id: string;
  name: string;
  platform: string;
  width: number;
  height: number;
  connected: boolean;
  metadata?: Record<string, unknown>;
}

export interface SessionRecord {
  id: string;
  computerId: string;
  status: SessionStatus;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, unknown>;
}

export interface ActionInput {
  type: ActionType;
  x?: number;
  y?: number;
  text?: string;
  key?: string;
  deltaX?: number;
  deltaY?: number;
  durationMs?: number;
  requiresApproval?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ActionRecord extends ActionInput {
  id: string;
  sessionId: string;
  status: ActionStatus;
  createdAt: Date;
  completedAt?: Date;
  result?: unknown;
  error?: string;
}

export interface ApprovalRecord {
  id: string;
  sessionId: string;
  actionId: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: Date;
  resolvedAt?: Date;
  reason?: string;
}

export interface ScreenshotRecord {
  id: string;
  sessionId: string;
  createdAt: Date;
  mimeType: string;
  data: string;
  width?: number;
  height?: number;
}

export interface VerificationResult {
  valid: boolean;
  sessionId: string;
  actionId?: string;
  checkedAt: Date;
  issues: string[];
  details?: Record<string, unknown>;
}

export interface ComputerEvent<T = unknown> {
  id: string;
  type: string;
  timestamp: Date;
  sessionId?: string;
  computerId?: string;
  payload: T;
}

export interface ComputerUseConfig {
  defaultTimeoutMs: number;
  maxTimeoutMs: number;
  requireApproval: boolean;
  maxScreenshots: number;
}

export interface ActionExecutor {
  execute(
    computer: ComputerDevice,
    session: SessionRecord,
    action: ActionInput
  ): Promise<unknown>;
}
