const POLICY_RULES = {
  super_admin: {
    description: "Full platform access",
    rules: [
      {
        resource: "*",
        actions: ["*"],
        effect: "allow",
      },
    ],
  },

  admin: {
    description: "Administrative access across the organization",
    rules: [
      {
        resource: "users",
        actions: ["read", "create", "update", "delete"],
        effect: "allow",
      },
      {
        resource: "organizations",
        actions: ["read", "create", "update", "delete"],
        effect: "allow",
      },
      {
        resource: "workspaces",
        actions: ["read", "create", "update", "delete"],
        effect: "allow",
      },
      {
        resource: "audit_logs",
        actions: ["read"],
        effect: "allow",
      },
      {
        resource: "billing",
        actions: ["read", "update"],
        effect: "allow",
      },
    ],
  },

  security_admin: {
    description: "Security and compliance management",
    rules: [
      {
        resource: "security",
        actions: ["read", "update", "manage"],
        effect: "allow",
      },
      {
        resource: "audit_logs",
        actions: ["read"],
        effect: "allow",
      },
      {
        resource: "users",
        actions: ["read"],
        effect: "allow",
      },
    ],
  },

  auditor: {
    description: "Read-only audit and compliance access",
    rules: [
      {
        resource: "audit_logs",
        actions: ["read"],
        effect: "allow",
      },
      {
        resource: "security",
        actions: ["read"],
        effect: "allow",
      },
    ],
  },

  user: {
    description: "Standard workspace access",
    rules: [
      {
        resource: "workspaces",
        actions: ["read"],
        effect: "allow",
      },
    ],
  },
};

export function getPolicyRules(role) {
  if (!role) {
    return [];
  }

  return POLICY_RULES[role]?.rules ?? [];
}

export function getPolicyDescription(role) {
  return POLICY_RULES[role]?.description ?? "No policy assigned";
}

export function isPolicyAllowed(role, resource, action) {
  const rules = getPolicyRules(role);

  return rules.some((rule) => {
    const resourceAllowed =
      rule.resource === "*" ||
      rule.resource === resource;

    const actionAllowed =
      rule.actions.includes("*") ||
      rule.actions.includes(action);

    return (
      rule.effect === "allow" &&
      resourceAllowed &&
      actionAllowed
    );
  });
}

export function getAvailableRoles() {
  return Object.keys(POLICY_RULES);
}

export function getAllPolicies() {
  return POLICY_RULES;
}

export default POLICY_RULES;