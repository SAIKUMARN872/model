export interface GovernancePolicy {
    id: string;
    name: string;
    description: string;
    version: number;
    status: "draft" | "active" | "retired";
    rules: Record<string, unknown>;
    createdBy: string;
    updatedAt: string;
}

export function validatePolicy(policy: GovernancePolicy): string[] {
    const errors: string[] = [];
    if (!policy.id.trim()) errors.push("Policy id is required");
    if (!policy.name.trim()) errors.push("Policy name is required");
    if (!policy.description.trim()) errors.push("Policy description is required");
    if (!Number.isInteger(policy.version) || policy.version < 1) errors.push("Policy version must be positive");
    if (!policy.createdBy.trim()) errors.push("createdBy is required");
    return errors;
}
