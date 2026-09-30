import {
  AuditEventManager,
  auditEventManager,
  type AuditEvent,
  type CreateAuditEventInput,
} from "./events.js";

export interface AuditLoggerOptions {
  enabled?: boolean;
}

export class AuditLogger {
  private readonly manager: AuditEventManager;
  private enabled: boolean;

  constructor(
    manager: AuditEventManager = auditEventManager,
    options: AuditLoggerOptions = {},
  ) {
    this.manager = manager;
    this.enabled = options.enabled ?? true;
  }

  log(input: CreateAuditEventInput): AuditEvent | undefined {
    if (!this.enabled) {
      return undefined;
    }

    return this.manager.create(input);
  }

  info(
    action: CreateAuditEventInput["action"],
    message: string,
    metadata?: Record<string, unknown>,
  ): AuditEvent | undefined {
    return this.log({
      action,
      severity: "info",
      message,
      metadata,
    });
  }

  warning(
    action: CreateAuditEventInput["action"],
    message: string,
    metadata?: Record<string, unknown>,
  ): AuditEvent | undefined {
    return this.log({
      action,
      severity: "warning",
      message,
      metadata,
    });
  }

  error(
    action: CreateAuditEventInput["action"],
    message: string,
    metadata?: Record<string, unknown>,
  ): AuditEvent | undefined {
    return this.log({
      action,
      severity: "error",
      message,
      metadata,
      success: false,
    });
  }

  critical(
    action: CreateAuditEventInput["action"],
    message: string,
    metadata?: Record<string, unknown>,
  ): AuditEvent | undefined {
    return this.log({
      action,
      severity: "critical",
      message,
      metadata,
      success: false,
    });
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  health(): {
    healthy: boolean;
    enabled: boolean;
    eventCount: number;
  } {
    return {
      healthy: true,
      enabled: this.enabled,
      eventCount: this.manager.count(),
    };
  }
}

export const auditLogger = new AuditLogger();
