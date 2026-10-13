import type { IntegrationConnection } from "../integration.types.js";
import { ConnectionManager } from "./connection.manager.js";

export class ConnectionService {
    constructor(private readonly manager: ConnectionManager) {}

    create(input: { integrationId: string; name: string; metadata?: Record<string, unknown> }): IntegrationConnection {
        return this.manager.create(input);
    }

    connect(id: string): IntegrationConnection {
        return this.manager.setStatus(id, "connecting");
    }

    markConnected(id: string): IntegrationConnection {
        return this.manager.setStatus(id, "connected");
    }

    disconnect(id: string): IntegrationConnection {
        return this.manager.setStatus(id, "disconnected");
    }

    markError(id: string, message: string): IntegrationConnection {
        return this.manager.setStatus(id, "error", message);
    }

    get(id: string): IntegrationConnection | undefined {
        return this.manager.get(id);
    }

    list(integrationId?: string): IntegrationConnection[] {
        return this.manager.list(integrationId);
    }
}
