export type ComplianceFrameworkName = "SOC2" | "ISO27001" | "GDPR" | "NIST_AI_RMF" | "CUSTOM";

export interface ComplianceFramework {
    name: ComplianceFrameworkName;
    version: string;
    controls: string[];
}

export const defaultFrameworks: ComplianceFramework[] = [
    { name: "SOC2", version: "2017", controls: ["access-control", "audit-logging", "change-management"] },
    { name: "ISO27001", version: "2022", controls: ["risk-assessment", "access-control", "incident-management"] },
    { name: "GDPR", version: "2016/679", controls: ["lawful-processing", "data-minimization", "retention"] },
    { name: "NIST_AI_RMF", version: "1.0", controls: ["govern", "map", "measure", "manage"] }
];
