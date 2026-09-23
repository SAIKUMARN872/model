import { RoleManager } from "./roles.js";

export type PolicyEffect =
  | "allow"
  | "deny";

export interface PolicyRule {
  id: string;
  effect: PolicyEffect;
  resource: string;
  actions: string[];
  roles?: string[];
  organizations?: string[];
  conditions?: Record<string, unknown>;
  priority?: number;
}

export interface PolicyRequest {
  userId: string;
  organizationId: string;
  resource: string;
  action: string;
  roleIds: string[];
  context?: Record<string, unknown>;
}

export interface PolicyDecision {
  allowed: boolean;
  effect: PolicyEffect;
  matchedPolicyIds: string[];
  reason: string;
}

export interface PolicyEngineHealth {
  healthy: boolean;
  policyCount: number;
}

function validateText(
  value: string,
  field: string,
): void {
  if (!value.trim()) {
    throw new Error(`${field} cannot be empty`);
  }
}

function clonePolicy(
  policy: PolicyRule,
): PolicyRule {
  return {
    ...policy,
    actions: [...policy.actions],
    roles: policy.roles
      ? [...policy.roles]
      : undefined,
    organizations: policy.organizations
      ? [...policy.organizations]
      : undefined,
    conditions: policy.conditions
      ? { ...policy.conditions }
      : undefined,
  };
}

export class PolicyEngine {
  private readonly policies = new Map<
    string,
    PolicyRule
  >();

  constructor(
    private readonly roleManager?: RoleManager,
  ) {}

  addPolicy(policy: PolicyRule): PolicyRule {
    validateText(policy.id, "policy id");
    validateText(
      policy.resource,
      "policy resource",
    );

    if (policy.actions.length === 0) {
      throw new Error(
        "Policy must contain at least one action",
      );
    }

    if (this.policies.has(policy.id)) {
      throw new Error(
        `Policy already exists: ${policy.id}`,
      );
    }

    const normalized: PolicyRule = {
      ...policy,
      actions: [...policy.actions],
      roles: policy.roles
        ? [...policy.roles]
        : undefined,
      organizations: policy.organizations
        ? [...policy.organizations]
        : undefined,
      priority: policy.priority ?? 0,
    };

    this.policies.set(
      normalized.id,
      normalized,
    );

    return clonePolicy(normalized);
  }

  updatePolicy(
    policyId: string,
    updates: Partial<Omit<PolicyRule, "id">>,
  ): PolicyRule {
    const policy =
      this.policies.get(policyId);

    if (!policy) {
      throw new Error(
        `Policy not found: ${policyId}`,
      );
    }

    if (
      updates.resource !== undefined &&
      !updates.resource.trim()
    ) {
      throw new Error(
        "policy resource cannot be empty",
      );
    }

    if (
      updates.actions !== undefined &&
      updates.actions.length === 0
    ) {
      throw new Error(
        "Policy must contain at least one action",
      );
    }

    Object.assign(policy, updates);

    return clonePolicy(policy);
  }

  getById(
    policyId: string,
  ): PolicyRule | undefined {
    const policy =
      this.policies.get(policyId);

    return policy
      ? clonePolicy(policy)
      : undefined;
  }

  getAll(): PolicyRule[] {
    return [...this.policies.values()]
      .sort(
        (a, b) =>
          (b.priority ?? 0) -
          (a.priority ?? 0),
      )
      .map(clonePolicy);
  }

  remove(policyId: string): boolean {
    return this.policies.delete(policyId);
  }

  clear(): void {
    this.policies.clear();
  }

  size(): number {
    return this.policies.size;
  }

  evaluate(
    request: PolicyRequest,
  ): PolicyDecision {
    validateText(
      request.userId,
      "userId",
    );

    validateText(
      request.organizationId,
      "organizationId",
    );

    validateText(
      request.resource,
      "resource",
    );

    validateText(
      request.action,
      "action",
    );

    const matchingPolicies =
      this.getAll().filter((policy) =>
        this.matchesPolicy(policy, request),
      );

    if (matchingPolicies.length === 0) {
      return {
        allowed: false,
        effect: "deny",
        matchedPolicyIds: [],
        reason:
          "No matching policy found",
      };
    }

    const denyPolicy =
      matchingPolicies.find(
        (policy) =>
          policy.effect === "deny",
      );

    if (denyPolicy) {
      return {
        allowed: false,
        effect: "deny",
        matchedPolicyIds:
          matchingPolicies.map(
            (policy) => policy.id,
          ),
        reason:
          `Access denied by policy ${denyPolicy.id}`,
      };
    }

    return {
      allowed: true,
      effect: "allow",
      matchedPolicyIds:
        matchingPolicies.map(
          (policy) => policy.id,
        ),
      reason:
        "Access allowed by matching policy",
    };
  }

  private matchesPolicy(
    policy: PolicyRule,
    request: PolicyRequest,
  ): boolean {
    if (
      policy.resource !== "*" &&
      policy.resource !== request.resource
    ) {
      return false;
    }

    if (
      !policy.actions.includes("*") &&
      !policy.actions.includes(request.action)
    ) {
      return false;
    }

    if (
      policy.organizations &&
      policy.organizations.length > 0 &&
      !policy.organizations.includes("*") &&
      !policy.organizations.includes(
        request.organizationId,
      )
    ) {
      return false;
    }

    if (
      policy.roles &&
      policy.roles.length > 0 &&
      !policy.roles.includes("*")
    ) {
      const hasRole = request.roleIds.some(
        (roleId) =>
          policy.roles?.includes(roleId) &&
          this.roleExists(roleId),
      );

      if (!hasRole) {
        return false;
      }
    }

    if (
      policy.conditions &&
      !this.matchesConditions(
        policy.conditions,
        request.context ?? {},
      )
    ) {
      return false;
    }

    return true;
  }

  private roleExists(
    roleId: string,
  ): boolean {
    if (!this.roleManager) {
      return true;
    }

    return (
      this.roleManager.getById(roleId) !==
      undefined
    );
  }

  private matchesConditions(
    conditions: Record<string, unknown>,
    context: Record<string, unknown>,
  ): boolean {
    for (const [key, expected] of Object.entries(
      conditions,
    )) {
      if (context[key] !== expected) {
        return false;
      }
    }

    return true;
  }

  health(): PolicyEngineHealth {
    return {
      healthy: true,
      policyCount: this.policies.size,
    };
  }
}