import { randomUUID } from "node:crypto";

export interface ComputerJob<T> {
  id: string;
  type: string;
  payload: T;
  status: "pending" | "running" | "completed" | "failed";
  createdAt: Date;
  result?: unknown;
  error?: string;
}
export function createComputerJob<T>(type: string, payload: T): ComputerJob<T> {
  return { id: randomUUID(), type, payload, status: "pending", createdAt: new Date() };
}
