import { randomUUID } from "node:crypto";
import { nowIso, type IntegrationCredential } from "../integration.types.js";
import { validateCredential } from "../schemas/credential.schema.js";

export class CredentialManager {
    private readonly credentials = new Map<string, IntegrationCredential>();

    constructor(private readonly idFactory: () => string = randomUUID) {}

    store(input: {
        integrationId: string;
        connectionId?: string;
        kind: IntegrationCredential["kind"];
        secret: string;
    }): IntegrationCredential {
        const now = nowIso();
        const credential: IntegrationCredential = {
            id: this.idFactory(),
            integrationId: input.integrationId,
            ...(input.connectionId === undefined ? {} : { connectionId: input.connectionId }),
            kind: input.kind,
            secret: input.secret,
            createdAt: now,
            updatedAt: now
        };

        const errors = validateCredential(credential);
        if (errors.length) throw new Error(errors.join("; "));

        this.credentials.set(credential.id, structuredClone(credential));
        return structuredClone(credential);
    }

    get(id: string): IntegrationCredential | undefined {
        const credential = this.credentials.get(id);
        return credential ? structuredClone(credential) : undefined;
    }

    listByIntegration(integrationId: string): IntegrationCredential[] {
        return [...this.credentials.values()]
            .filter((credential) => credential.integrationId === integrationId)
            .map((credential) => structuredClone(credential));
    }

    delete(id: string): boolean {
        return this.credentials.delete(id);
    }
}
