import { randomUUID } from "node:crypto";
export interface SessionJob {
  id: string;
  sessionId: string;
  operation: "start" | "pause" | "resume" | "close";
  createdAt: Date;
}
export function createSessionJob(
  sessionId: string,
  operation: SessionJob["operation"]
): SessionJob {
  return { id: randomUUID(), sessionId, operation, createdAt: new Date() };
}
