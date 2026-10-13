export interface GovernanceRule {
    id: string;
    description: string;
    enabled: boolean;
    severity: "info" | "warning" | "error";
    predicate: string;
    parameters?: Record<string, unknown>;
}

export interface RuleResult {
    ruleId: string;
    passed: boolean;
    severity: GovernanceRule["severity"];
    message: string;
}

export function validateRule(rule: GovernanceRule): string[] {
    const errors: string[] = [];
    if (!rule.id.trim()) errors.push("Rule id is required");
    if (!rule.description.trim()) errors.push("Rule description is required");
    if (!rule.predicate.trim()) errors.push("Rule predicate is required");
    return errors;
}
