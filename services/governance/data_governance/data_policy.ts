import type { DataClassification } from "./classification.js";

export interface DataPolicy {
    id: string;
    name: string;
    allowedClassifications: DataClassification[];
    retentionDays?: number;
    encryptionRequired: boolean;
    purpose: string;
}

export function validateDataPolicy(policy: DataPolicy): string[] {
    const errors: string[] = [];
    if (!policy.id.trim()) errors.push("Policy id is required");
    if (!policy.name.trim()) errors.push("Policy name is required");
    if (!policy.purpose.trim()) errors.push("Policy purpose is required");
    if (policy.allowedClassifications.length === 0) errors.push("At least one classification is required");
    if (policy.retentionDays !== undefined && (!Number.isInteger(policy.retentionDays) || policy.retentionDays < 1)) {
        errors.push("retentionDays must be a positive integer");
    }
    return errors;
}
