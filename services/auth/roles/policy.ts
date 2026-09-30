import {
  RoleService,
  roleService,
  type Role,
} from "./role.js";

export interface RolePolicy {
  id: string;
  roleId: string;
  requiredPermissions: string[];
  allowAny: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PolicyCheckResult {
  allowed: boolean;
  role?: Role;
  matchedPermissions: string[];
  missingPermissions: string[];
}

export class RolePolicyService {
  private readonly policies = new Map<string, RolePolicy>();
  private readonly roleService: RoleService;

  constructor(roleStore: RoleService = roleService) {
    this.roleService = roleStore;
  }

  create(
    roleId: string,
    requiredPermissions?: string[],
    allowAny?: boolean,
  ): RolePolicy;
  create(
    policyId: string,
    roleId: string,
    requiredPermissions?: string[],
    allowAny?: boolean,
  ): RolePolicy;
  create(
    first: string,
    second?: string | string[],
    third?: boolean | string[],
    fourth = false,
  ): RolePolicy {
    let policyId: string;
    let normalizedRoleId: string;
    let requiredPermissions: string[];
    let allowAny: boolean;

    if (Array.isArray(second)) {
      policyId = first.trim().toLowerCase();
      normalizedRoleId = first.trim().toLowerCase();
      requiredPermissions = second;
      allowAny = Boolean(third);
    } else {
      policyId = first.trim().toLowerCase();
      normalizedRoleId = (second ?? first).trim().toLowerCase();
      requiredPermissions = Array.isArray(third)
        ? third
        : [];
      allowAny = Boolean(fourth ?? false);
    }

    if (!policyId) {
      throw new Error("Policy ID is required");
    }

    if (!normalizedRoleId) {
      throw new Error("Role ID is required");
    }

    const permissions = [
      ...new Set(
        requiredPermissions
          .map((permission) => permission.trim().toLowerCase())
          .filter(Boolean),
      ),
    ];

    const now = new Date();

    const policy: RolePolicy = {
      id: policyId,
      roleId: normalizedRoleId,
      requiredPermissions: permissions,
      allowAny,
      createdAt: now,
      updatedAt: now,
    };

    this.policies.set(policyId, this.clone(policy));

    return this.clone(policy);
  }

  get(id: string): RolePolicy | undefined {
    const policy = this.policies.get(id.trim().toLowerCase());

    return policy ? this.clone(policy) : undefined;
  }

  check(
    roleId: string,
    permissions: string[],
  ): PolicyCheckResult {
    const normalizedRoleId = roleId.trim().toLowerCase();

    const role = this.roleService.get(normalizedRoleId);
    const policy = this.policies.get(normalizedRoleId);

    const availablePermissions = new Set(
      [...(permissions ?? []).map((permission) => permission.trim().toLowerCase()),
        ...(role?.permissions ?? []).map((permission) => permission.toLowerCase())],
    );

    if (!policy) {
      return {
        allowed: true,
        role: role ? this.clone(role) : undefined,
        matchedPermissions: [...availablePermissions],
        missingPermissions: [],
      };
    }

    const required = policy.requiredPermissions;

    if (required.length === 0) {
      return {
        allowed: true,
        role: role ? this.clone(role) : undefined,
        matchedPermissions: [...availablePermissions],
        missingPermissions: [],
      };
    }

    const matchedRequired = required.filter((permission) =>
      availablePermissions.has(permission) || availablePermissions.has("*:*"),
    );

    const allowed = policy.allowAny
      ? matchedRequired.length > 0
      : matchedRequired.length === required.length;

    return {
      allowed,
      role: role ? this.clone(role) : undefined,
      matchedPermissions: matchedRequired,
      missingPermissions: required.filter(
        (permission) => !matchedRequired.includes(permission),
      ),
    };
  }

  delete(id: string): boolean {
    return this.policies.delete(id.trim().toLowerCase());
  }

  clear(): void {
    this.policies.clear();
  }

  count(): number {
    return this.policies.size;
  }

  health(): {
    healthy: boolean;
    policyCount: number;
    roleStoreHealthy: boolean;
  } {
    return {
      healthy: true,
      policyCount: this.policies.size,
      roleStoreHealthy: this.roleService.health().healthy,
    };
  }

  private clone(policy: RolePolicy): RolePolicy {
    return {
      ...policy,
      requiredPermissions: [...policy.requiredPermissions],
      createdAt: new Date(policy.createdAt),
      updatedAt: new Date(policy.updatedAt),
    };
  }
}

export const rolePolicyService = new RolePolicyService();
