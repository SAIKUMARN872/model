import { randomUUID } from "node:crypto";
import {
  AuthAuditEvent,
  AuthAuditEventType
} from "./events.js";

export type AuthAuditData =
  Omit<AuthAuditEvent, "id" | "type" | "timestamp" | "metadata"> & {
    metadata?: Record<string, unknown>;
  };

export class AuthAuditLogger {
  private readonly events: AuthAuditEvent[] = [];

  log(
    type: AuthAuditEventType | string,
    data: AuthAuditData = {}
  ): AuthAuditEvent {
    const event: AuthAuditEvent = {
      id: randomUUID(),
      type: type as AuthAuditEventType,
      timestamp: new Date(),
      ...data,
      metadata: {
        ...(data.metadata ?? {})
      }
    };

    this.events.push(event);

    return event;
  }

  getAll(): AuthAuditEvent[] {
    return [...this.events];
  }

  findByUserId(userId: string): AuthAuditEvent[] {
    return this.events.filter((event) => event.userId === userId);
  }

  clear(): void {
    this.events.length = 0;
  }
}
