import type { IntegrationCredential } from "../integration.types.js";
import { CredentialManager } from "./credential.manager.js";

export class CredentialService {
    constructor(private readonly manager: CredentialManager) {}

    create(input: {
        integrationId: string;
        connectionId?: string;
        kind: IntegrationCredential["kind"];
        secret: string;
    }): IntegrationCredential {
        return this.manager.store(input);
    }

    get(id: string): IntegrationCredential | undefined {
        return this.manager.get(id);
    }

    list(integrationId: string): IntegrationCredential[] {
        return this.manager.listByIntegration(integrationId);
    }

    delete(id: string): boolean {
        return this.manager.delete(id);
    }
}
