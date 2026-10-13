export interface Policy {
  resource: string;
  action: string;
  effect: "allow" | "deny";
  roles: string[];
}

export class PolicyEngine {
  constructor(
    private readonly policies: Policy[] = [],
  ) {}

  addPolicy(policy: Policy): void {
    if (!policy.resource.trim()) {
      throw new Error("Policy resource is required");
    }

    if (!policy.action.trim()) {
      throw new Error("Policy action is required");
    }

    this.policies.push({
      ...policy,
      roles: [...policy.roles],
    });
  }

  authorize(
    role: string,
    resource: string,
    action: string,
  ): boolean {
    const matching = this.policies.filter(
      (policy) =>
        policy.resource === resource &&
        policy.action === action &&
        policy.roles.includes(role),
    );

    if (matching.some((policy) => policy.effect === "deny")) {
      return false;
    }

    return matching.some(
      (policy) => policy.effect === "allow",
    );
  }

  list(): Policy[] {
    return this.policies.map((policy) => ({
      ...policy,
      roles: [...policy.roles],
    }));
  }
}
