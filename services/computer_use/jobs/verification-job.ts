import { randomUUID } from "node:crypto";
export interface VerificationJob {
  id: string;
  sessionId: string;
  actionId?: string;
  createdAt: Date;
}
export function createVerificationJob(
  sessionId: string,
  actionId?: string
): VerificationJob {
  return { id: randomUUID(), sessionId, actionId, createdAt: new Date() };
}
