import { createAuditEvent, type AuditEvent, type AuditEventType } from "./events.js";
import { AuditHistory } from "./history.js";

export class AuditLogger {
    constructor(
        private readonly history: AuditHistory,
        private readonly idFactory: () => string
    ) {}

    log(input: {
        type: AuditEventType;
        actor: string;
        resource: string;
        details?: Record<string, unknown>;
    }): AuditEvent {
        const event = createAuditEvent({
            id: this.idFactory(),
            type: input.type,
            actor: input.actor,
            resource: input.resource,
            details: input.details ?? {}
        });
        this.history.append(event);
        return event;
    }
}
