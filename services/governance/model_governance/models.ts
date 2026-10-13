export interface GovernedModel {
    id: string;
    name: string;
    version: string;
    owner: string;
    riskLevel: "low" | "medium" | "high" | "critical";
    status: "registered" | "under_review" | "approved" | "rejected" | "retired";
    metadata: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

export function validateGovernedModel(model: GovernedModel): string[] {
    const errors: string[] = [];
    if (!model.id.trim()) errors.push("Model id is required");
    if (!model.name.trim()) errors.push("Model name is required");
    if (!model.version.trim()) errors.push("Model version is required");
    if (!model.owner.trim()) errors.push("Model owner is required");
    return errors;
}
