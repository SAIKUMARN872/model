const permissions = {
  users: ["read", "create", "update", "delete"],
  organizations: ["read", "create", "update", "delete"],
  workspaces: ["read", "create", "update", "delete"],
  audit_logs: ["read"],
  billing: ["read", "update"],
  security: ["read", "update", "manage"],
  settings: ["read", "update"],
};

const rolePolicies = {
  super_admin: {
    resources: "*",
    permissions: "*",
  },

  admin: {
    resources: [
      "users",
      "organizations",
      "workspaces",
      "audit_logs",
      "billing",
      "security",
      "settings",
    ],
    permissions: ["read", "create", "update", "delete", "manage"],
  },

  security_admin: {
    resources: ["security", "audit_logs"],
    permissions: ["read", "update", "manage"],
  },

  auditor: {
    resources: ["audit_logs"],
    permissions: ["read"],
  },

  user: {
    resources: ["workspaces"],
    permissions: ["read"],
  },
};

export function hasPermission({
  role,
  resource,
  permission,
  customPermissions = [],
}) {
  if (!role || !resource || !permission) {
    return false;
  }

  const policy = rolePolicies[role];

  if (!policy) {
    return customPermissions.includes(`${resource}:${permission}`);
  }

  if (
    policy.resources === "*" &&
    policy.permissions === "*"
  ) {
    return true;
  }

  const resourceAllowed =
    policy.resources.includes(resource);

  const permissionAllowed =
    policy.permissions.includes(permission);

  if (resourceAllowed && permissionAllowed) {
    return true;
  }

  const exactPermission =
    `${resource}:${permission}`;

  const managePermission =
    `${resource}:manage`;

  return (
    customPermissions.includes(exactPermission) ||
    customPermissions.includes(managePermission)
  );
}

export function canAccessResource({
  role,
  resource,
}) {
  const policy = rolePolicies[role];

  if (!policy) {
    return false;
  }

  if (policy.resources === "*") {
    return true;
  }

  return policy.resources.includes(resource);
}

export function getRolePermissions(role) {
  const policy = rolePolicies[role];

  if (!policy) {
    return {};
  }

  if (
    policy.resources === "*" &&
    policy.permissions === "*"
  ) {
    return permissions;
  }

  const result = {};

  policy.resources.forEach((resource) => {
    result[resource] = policy.permissions;
  });

  return result;
}

export function isAdmin(role) {
  return (
    role === "admin" ||
    role === "super_admin"
  );
}

export function isSuperAdmin(role) {
  return role === "super_admin";
}

export default {
  hasPermission,
  canAccessResource,
  getRolePermissions,
  isAdmin,
  isSuperAdmin,
};