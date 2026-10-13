import type { GovernanceRule, RuleResult } from "./rules.js";

export class RuleEngine {
    private readonly rules = new Map<string, GovernanceRule>();

    register(rule: GovernanceRule): void {
        if (this.rules.has(rule.id)) throw new Error("Rule already registered");
        this.rules.set(rule.id, structuredClone(rule));
    }

    list(): GovernanceRule[] {
        return [...this.rules.values()].map((rule) => structuredClone(rule));
    }

    evaluate(context: Record<string, unknown>): RuleResult[] {
        return [...this.rules.values()]
            .filter((rule) => rule.enabled)
            .map((rule) => {
                const value = context[rule.predicate];
                const passed = value === true;
                return {
                    ruleId: rule.id,
                    passed,
                    severity: rule.severity,
                    message: passed ? "Rule passed" : `Rule failed: ${rule.description}`
                };
            });
    }
}
