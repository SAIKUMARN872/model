import { IntegrationService } from "../services/integration.service.js";
import { ConnectionService } from "../connections/connection.service.js";
import { CredentialService } from "../credentials/credential.service.js";
import { SyncService } from "../services/sync.service.js";

export class IntegrationController {
    constructor(
        private readonly integrations: IntegrationService,
        private readonly connections: ConnectionService,
        private readonly credentials: CredentialService,
        private readonly sync: SyncService
    ) {}

    createIntegration(body: Parameters<IntegrationService["create"]>[0]) {
        return this.integrations.create(body);
    }

    listIntegrations() {
        return this.integrations.list();
    }

    getIntegration(id: string) {
        const integration = this.integrations.get(id);
        if (!integration) throw new Error("Integration not found");
        return integration;
    }

    deleteIntegration(id: string) {
        const deleted = this.integrations.delete(id);
        if (!deleted) throw new Error("Integration not found");
        return { deleted: true };
    }

    createConnection(body: Parameters<ConnectionService["create"]>[0]) {
        return this.connections.create(body);
    }

    listConnections(integrationId?: string) {
        return this.connections.list(integrationId);
    }

    createCredential(body: Parameters<CredentialService["create"]>[0]) {
        return this.credentials.create(body);
    }

    enqueueSync(body: Parameters<SyncService["enqueue"]>[0]) {
        return this.sync.enqueue(body);
    }

    getSyncJob(id: string) {
        const job = this.sync.get(id);
        if (!job) throw new Error("Sync job not found");
        return job;
    }
}
