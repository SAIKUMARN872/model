import type { GovernedModel } from "./models.js";

export class ModelRegistry {
    private readonly models = new Map<string, GovernedModel>();

    register(model: GovernedModel): GovernedModel {
        if (this.models.has(model.id)) throw new Error("Model is already registered");
        this.models.set(model.id, structuredClone(model));
        return structuredClone(model);
    }

    get(id: string): GovernedModel | undefined {
        const model = this.models.get(id);
        return model ? structuredClone(model) : undefined;
    }

    list(): GovernedModel[] {
        return [...this.models.values()].map((model) => structuredClone(model));
    }

    updateStatus(id: string, status: GovernedModel["status"]): GovernedModel {
        const model = this.models.get(id);
        if (!model) throw new Error("Model not found");
        model.status = status;
        model.updatedAt = new Date().toISOString();
        return structuredClone(model);
    }
}
