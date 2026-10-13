import { randomUUID } from "node:crypto";
import { nowIso, type Integration } from "../integration.types.js";
import { IntegrationRepository } from "../repository/integration.repository.js";
import { validateIntegration } from "../schemas/integration.schema.js";

export class IntegrationService {
    constructor(
        private readonly repository = new IntegrationRepository(),
        private readonly idFactory: () => string = randomUUID
    ) {}

    create(input: {
        name: string;
        provider: string;
        description?: string;
        metadata?: Record<string, unknown>;
    }): Integration {
        const now = nowIso();

        const integration: Integration = {
            id: this.idFactory(),
            name: input.name.trim(),
            provider: input.provider.trim(),
            ...(input.description === undefined ? {} : { description: input.description }),
            status: "active",
            createdAt: now,
            updatedAt: now,
            metadata: structuredClone(input.metadata ?? {})
        };

        const errors = validateIntegration(integration);
        if (errors.length) throw new Error(errors.join("; "));
        return this.repository.create(integration);
    }

    get(id: string): Integration | undefined {
        return this.repository.get(id);
    }

    list(): Integration[] {
        return this.repository.list();
    }

    update(id: string, changes: Partial<Pick<Integration, "name" | "provider" | "description" | "status" | "metadata">>): Integration {
        const current = this.repository.get(id);
        if (!current) throw new Error("Integration not found");

        const updated = { ...current, ...changes };
        const errors = validateIntegration(updated);
        if (errors.length) throw new Error(errors.join("; "));

        return this.repository.update(id, changes);
    }

    delete(id: string): boolean {
        return this.repository.delete(id);
    }
}
