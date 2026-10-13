import type { GovernanceRule } from "./rules.js";

export function validateRules(rules: readonly GovernanceRule[]): string[] {
    const errors: string[] = [];
    const ids = new Set<string>();

    for (const rule of rules) {
        if (ids.has(rule.id)) errors.push(`Duplicate rule id: ${rule.id}`);
        ids.add(rule.id);
        if (!rule.id.trim()) errors.push("Rule id is required");
        if (!rule.predicate.trim()) errors.push(`Rule ${rule.id || "(unnamed)"} needs a predicate`);
    }

    return errors;
}
