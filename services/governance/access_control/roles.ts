import type { Permission } from "./permissions.js";

export interface GovernanceRole {
    name: string;
    permissions: Permission[];
}

export const builtInRoles: GovernanceRole[] = [
    { name: "viewer", permissions: [{ resource: "*", actions: ["read"] }] },
    {
        name: "governance_admin",
        permissions: [{ resource: "*", actions: ["admin"] }]
    },
    {
        name: "approver",
        permissions: [
            { resource: "approvals", actions: ["read", "approve"] },
            { resource: "policies", actions: ["read"] }
        ]
    }
];

export function resolveRole(name: string): GovernanceRole | undefined {
    return builtInRoles.find((role) => role.name === name);
}
