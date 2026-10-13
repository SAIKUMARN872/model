import { randomUUID } from "node:crypto";

export interface BillingAuditEntry {
    id: string;
    action: string;
    actorId?: string;
    customerId?: string;
    resourceId?: string;
    metadata: Record<string, unknown>;
    createdAt: Date;
}

export class BillingAuditLogger {
    private readonly entries:
        BillingAuditEntry[] = [];

    log(
        action: string,
        input: {
            actorId?: string;
            customerId?: string;
            resourceId?: string;
            metadata?: Record<string, unknown>;
        } = {}
    ): BillingAuditEntry {
        const entry: BillingAuditEntry = {
            id: randomUUID(),
            action,
            actorId: input.actorId,
            customerId:
                input.customerId,
            resourceId:
                input.resourceId,
            metadata:
                input.metadata ?? {},
            createdAt: new Date()
        };

        this.entries.push(entry);

        return entry;
    }

    list(
        customerId?: string
    ): BillingAuditEntry[] {
        return this.entries.filter(
            (entry) =>
                customerId ===
                    undefined ||
                entry.customerId ===
                    customerId
        );
    }

    clear(): void {
        this.entries.length = 0;
    }
}
