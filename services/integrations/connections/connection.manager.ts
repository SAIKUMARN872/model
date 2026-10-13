import { randomUUID } from "node:crypto";
import { nowIso, requireText, type IntegrationConnection } from "../integration.types.js";
import { ConnectionRepository } from "../repository/connection.repository.js";
import { IntegrationRepository } from "../repository/integration.repository.js";
import { validateConnection } from "../schemas/connection.schema.js";
import { assertConnectionTransition } from "./connection.status.js";

export class ConnectionManager {
    constructor(
        private readonly integrations = new IntegrationRepository(),
        private readonly connections = new ConnectionRepository(),
        private readonly idFactory: () => string = randomUUID
    ) {}

    create(input: { integrationId: string; name: string; metadata?: Record<string, unknown> }): IntegrationConnection {
        requireText(input.integrationId, "integrationId");
        requireText(input.name, "Connection name");

        if (!this.integrations.get(input.integrationId)) {
            throw new Error("Integration not found");
        }

        const now = nowIso();
        const connection: IntegrationConnection = {
            id: this.idFactory(),
            integrationId: input.integrationId,
            name: input.name.trim(),
            status: "disconnected",
            createdAt: now,
            updatedAt: now,
            metadata: structuredClone(input.metadata ?? {})
        };

        const errors = validateConnection(connection);
        if (errors.length) throw new Error(errors.join("; "));
        return this.connections.create(connection);
    }

    get(id: string): IntegrationConnection | undefined {
        return this.connections.get(id);
    }

    list(integrationId?: string): IntegrationConnection[] {
        return integrationId
            ? this.connections.listByIntegration(integrationId)
            : this.connections.list();
    }

    setStatus(id: string, status: IntegrationConnection["status"], error?: string): IntegrationConnection {
        const current = this.connections.get(id);
        if (!current) throw new Error("Connection not found");

        if (current.status !== status) assertConnectionTransition(current.status, status);

        const changes: Partial<Omit<IntegrationConnection, "id" | "createdAt">> = {
            status,
            lastError: status === "error" ? (error ?? "Unknown connection error") : undefined
        };

        if (status === "connected") changes.lastConnectedAt = nowIso();
        return this.connections.update(id, changes);
    }

    delete(id: string): boolean {
        return this.connections.delete(id);
    }
}
