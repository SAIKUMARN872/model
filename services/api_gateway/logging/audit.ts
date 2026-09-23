import {
  appendFileSync,
  existsSync,
  mkdirSync,
} from "node:fs";
import { dirname } from "node:path";

export type AuditAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "authorize"
  | "deny"
  | "execute"
  | "export"
  | "import";

export type AuditOutcome =
  | "success"
  | "failure";

export interface AuditEvent {
  eventId: string;
  timestamp: string;
  action: AuditAction;
  outcome: AuditOutcome;
  resource: string;
  resourceId?: string;
  userId?: string;
  organizationId?: string;
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLoggerOptions {
  filePath?: string;
  consoleOutput?: boolean;
}

export interface AuditQuery {
  userId?: string;
  organizationId?: string;
  action?: AuditAction;
  outcome?: AuditOutcome;
  resource?: string;
  requestId?: string;
  limit?: number;
}

function generateEventId(): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

export class AuditLogger {
  private readonly filePath?: string;
  private readonly consoleOutput: boolean;

  private readonly events: AuditEvent[] = [];

  constructor(
    options: AuditLoggerOptions = {},
  ) {
    this.filePath = options.filePath;
    this.consoleOutput =
      options.consoleOutput ?? true;

    if (this.filePath) {
      const directory = dirname(this.filePath);

      if (!existsSync(directory)) {
        mkdirSync(directory, {
          recursive: true,
        });
      }
    }
  }

  record(
    input: Omit<
      AuditEvent,
      "eventId" | "timestamp"
    >,
  ): AuditEvent {
    const event: AuditEvent = {
      eventId: generateEventId(),
      timestamp: new Date().toISOString(),
      ...input,
    };

    this.events.push(event);

    const serialized = JSON.stringify(event);

    if (this.consoleOutput) {
      console.log(serialized);
    }

    if (this.filePath) {
      appendFileSync(
        this.filePath,
        `${serialized}\n`,
        "utf8",
      );
    }

    return event;
  }

  login(
    userId: string,
    organizationId?: string,
    requestId?: string,
  ): AuditEvent {
    return this.record({
      action: "login",
      outcome: "success",
      resource: "authentication",
      userId,
      organizationId,
      requestId,
    });
  }

  logout(
    userId: string,
    organizationId?: string,
    requestId?: string,
  ): AuditEvent {
    return this.record({
      action: "logout",
      outcome: "success",
      resource: "authentication",
      userId,
      organizationId,
      requestId,
    });
  }

  authorization(
    userId: string,
    resource: string,
    outcome: AuditOutcome,
    options: {
      organizationId?: string;
      requestId?: string;
      resourceId?: string;
      metadata?: Record<string, unknown>;
    } = {},
  ): AuditEvent {
    return this.record({
      action:
        outcome === "success"
          ? "authorize"
          : "deny",
      outcome,
      resource,
      resourceId: options.resourceId,
      userId,
      organizationId:
        options.organizationId,
      requestId: options.requestId,
      metadata: options.metadata,
    });
  }

  query(
    query: AuditQuery = {},
  ): AuditEvent[] {
    const filtered = this.events.filter(
      (event) => {
        if (
          query.userId !== undefined &&
          event.userId !== query.userId
        ) {
          return false;
        }

        if (
          query.organizationId !==
            undefined &&
          event.organizationId !==
            query.organizationId
        ) {
          return false;
        }

        if (
          query.action !== undefined &&
          event.action !== query.action
        ) {
          return false;
        }

        if (
          query.outcome !== undefined &&
          event.outcome !== query.outcome
        ) {
          return false;
        }

        if (
          query.resource !== undefined &&
          event.resource !== query.resource
        ) {
          return false;
        }

        if (
          query.requestId !== undefined &&
          event.requestId !== query.requestId
        ) {
          return false;
        }

        return true;
      },
    );

    if (
      query.limit !== undefined &&
      query.limit >= 0
    ) {
      return filtered.slice(-query.limit);
    }

    return filtered;
  }

  getAll(): AuditEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events.length = 0;
  }

  size(): number {
    return this.events.length;
  }

  health(): {
    status: "healthy";
    events: number;
  } {
    return {
      status: "healthy",
      events: this.events.length,
    };
  }
}

export const auditLogger =
  new AuditLogger();