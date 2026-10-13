import { randomUUID } from "node:crypto";
import type {
  ActionInput,
  ActionRecord,
  ApprovalRecord,
  ComputerDevice,
  ScreenshotRecord,
  SessionRecord
} from "./interfaces.js";

export function createComputer(
  input: Omit<ComputerDevice, "id"> & { id?: string }
): ComputerDevice {
  return {
    ...input,
    id: input.id ?? randomUUID(),
    metadata: { ...(input.metadata ?? {}) }
  };
}

export function createSession(
  input: Pick<SessionRecord, "computerId"> &
    Partial<Pick<SessionRecord, "id" | "status" | "metadata">>
): SessionRecord {
  const now = new Date();
  return {
    id: input.id ?? randomUUID(),
    computerId: input.computerId,
    status: input.status ?? "created",
    createdAt: now,
    updatedAt: now,
    metadata: { ...(input.metadata ?? {}) }
  };
}

export function createAction(
  sessionId: string,
  input: ActionInput
): ActionRecord {
  return {
    ...input,
    id: randomUUID(),
    sessionId,
    status: "pending",
    createdAt: new Date(),
    metadata: { ...(input.metadata ?? {}) }
  };
}

export function createApproval(
  sessionId: string,
  actionId: string
): ApprovalRecord {
  return {
    id: randomUUID(),
    sessionId,
    actionId,
    status: "pending",
    requestedAt: new Date()
  };
}

export function createScreenshot(
  input: Omit<ScreenshotRecord, "id" | "createdAt">
): ScreenshotRecord {
  return { ...input, id: randomUUID(), createdAt: new Date() };
}
