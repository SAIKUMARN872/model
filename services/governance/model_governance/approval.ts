import type { GovernedModel } from "./models.js";
import { ModelRegistry } from "./registry.js";

export class ModelApprovalService {
    constructor(private readonly registry: ModelRegistry) {}

    requestReview(id: string): GovernedModel {
        return this.registry.updateStatus(id, "under_review");
    }

    approve(id: string): GovernedModel {
        const model = this.registry.get(id);
        if (!model) throw new Error("Model not found");
        if (model.status !== "under_review") throw new Error("Model must be under review before approval");
        return this.registry.updateStatus(id, "approved");
    }

    reject(id: string): GovernedModel {
        const model = this.registry.get(id);
        if (!model) throw new Error("Model not found");
        if (model.status !== "under_review") throw new Error("Model must be under review before rejection");
        return this.registry.updateStatus(id, "rejected");
    }
}
