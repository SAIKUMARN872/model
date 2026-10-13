import { randomUUID } from "node:crypto";
import { AuditAction, AuditEvent } from "./events.js";

export class AuditLogger {
  private readonly events: AuditEvent[] = [];

  log(
    actorId: string,
    action: AuditAction,
    resource: string,
    resourceId?: string,
    metadata: Record<string, unknown> = {},
  ): AuditEvent {
    if (!actorId.trim()) {
      throw new Error("actorId is required");
    }

    if (!resource.trim()) {
      throw new Error("resource is required");
    }

    const event: AuditEvent = {
      id: randomUUID(),
      actorId,
      action,
      resource,
      ...(resourceId ? { resourceId } : {}),
      timestamp: new Date().toISOString(),
      metadata: structuredClone(metadata),
    };

    this.events.push(event);

    return { ...event, metadata: structuredClone(event.metadata) };
  }

  list(): AuditEvent[] {
    return this.events.map((event) => ({
      ...event,
      metadata: structuredClone(event.metadata),
    }));
  }

  clear(): void {
    this.events.length = 0;
  }
}
