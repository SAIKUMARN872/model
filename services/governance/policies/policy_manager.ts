import type { GovernancePolicy } from "./policy.js";

export class PolicyManager {
    private readonly policies = new Map<string, GovernancePolicy>();

    create(policy: GovernancePolicy): GovernancePolicy {
        if (this.policies.has(policy.id)) throw new Error("Policy already exists");
        this.policies.set(policy.id, structuredClone(policy));
        return structuredClone(policy);
    }

    get(id: string): GovernancePolicy | undefined {
        const policy = this.policies.get(id);
        return policy ? structuredClone(policy) : undefined;
    }

    list(): GovernancePolicy[] {
        return [...this.policies.values()].map((policy) => structuredClone(policy));
    }

    update(id: string, changes: Partial<Pick<GovernancePolicy, "name" | "description" | "rules" | "status">>): GovernancePolicy {
        const policy = this.policies.get(id);
        if (!policy) throw new Error("Policy not found");
        Object.assign(policy, changes, { version: policy.version + 1, updatedAt: new Date().toISOString() });
        return structuredClone(policy);
    }
}
