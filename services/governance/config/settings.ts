export interface GovernanceSettings {
    requireApprovalForPolicyChanges: boolean;
    requireApprovalForModelDeployment: boolean;
    auditRetentionDays: number;
    riskThreshold: number;
    allowedDataClassifications: string[];
}

export const defaultGovernanceSettings: GovernanceSettings = {
    requireApprovalForPolicyChanges: true,
    requireApprovalForModelDeployment: true,
    auditRetentionDays: 365,
    riskThreshold: 70,
    allowedDataClassifications: ["public", "internal", "confidential", "restricted"]
};

export function validateGovernanceSettings(settings: GovernanceSettings): string[] {
    const errors: string[] = [];
    if (!Number.isInteger(settings.auditRetentionDays) || settings.auditRetentionDays < 1) {
        errors.push("auditRetentionDays must be a positive integer");
    }
    if (!Number.isFinite(settings.riskThreshold) || settings.riskThreshold < 0 || settings.riskThreshold > 100) {
        errors.push("riskThreshold must be between 0 and 100");
    }
    if (settings.allowedDataClassifications.length === 0) {
        errors.push("At least one data classification must be allowed");
    }
    return errors;
}
