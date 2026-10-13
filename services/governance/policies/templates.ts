import type { GovernancePolicy } from "./policy.js";

export const policyTemplates: GovernancePolicy[] = [
    {
        id: "template-access-control",
        name: "Access Control",
        description: "Restrict access according to assigned roles and permissions.",
        version: 1,
        status: "draft",
        rules: { defaultDeny: true, reviewAccessPeriodDays: 90 },
        createdBy: "system",
        updatedAt: new Date(0).toISOString()
    },
    {
        id: "template-data-retention",
        name: "Data Retention",
        description: "Define retention periods and disposal requirements.",
        version: 1,
        status: "draft",
        rules: { requireRetentionPeriod: true, requireDisposalEvidence: true },
        createdBy: "system",
        updatedAt: new Date(0).toISOString()
    }
];
