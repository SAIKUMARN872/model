export interface AuditEntry {
  id: string;
  actorId: string;
  action: string;
  resource: string;
  timestamp: string;
}

export class AuditLogger {
  private readonly entries: AuditEntry[] = [];

  log(
    id: string,
    actorId: string,
    action: string,
    resource: string,
  ): AuditEntry {
    if (
      !id.trim() ||
      !actorId.trim() ||
      !action.trim() ||
      !resource.trim()
    ) {
      throw new Error("Audit fields are required");
    }

    const entry: AuditEntry = {
      id,
      actorId,
      action,
      resource,
      timestamp: new Date().toISOString(),
    };

    this.entries.push(entry);

    return { ...entry };
  }

  list(): AuditEntry[] {
    return this.entries.map((entry) => ({
      ...entry,
    }));
  }
}

export { GatewayLogger } from "./logger.js";
