import assert from "node:assert/strict";
import { test } from "node:test";

import {
  PermissionRegistry,
  PolicyEngine,
  RoleManager,
} from "./index.js";

test("permission registry", () => {
  const registry =
    new PermissionRegistry();

  const permission =
    registry.register({
      id: "user.read",
      resource: "users",
      action: "read",
      description:
        "Read user information",
    });

  assert.equal(
    permission.id,
    "user.read",
  );

  assert.equal(
    registry.size(),
    1,
  );

  assert.equal(
    registry.has("user.read"),
    true,
  );

  assert.deepEqual(
    registry.getById("user.read"),
    permission,
  );

  assert.equal(
    registry.checkPermission(
      "user.read",
      {
        resource: "users",
        action: "read",
      },
    ),
    true,
  );

  assert.equal(
    registry.checkPermission(
      "user.read",
      {
        resource: "users",
        action: "delete",
      },
    ),
    false,
  );
});

test("permission registry rejects duplicate permissions", () => {
  const registry =
    new PermissionRegistry();

  registry.register({
    id: "user.read",
    resource: "users",
    action: "read",
  });

  assert.throws(
    () =>
      registry.register({
        id: "user.read",
        resource: "users",
        action: "read",
      }),
    /Permission already exists/,
  );
});

test("permission registry resource filtering", () => {
  const registry =
    new PermissionRegistry();

  registry.register({
    id: "user.read",
    resource: "users",
    action: "read",
  });

  registry.register({
    id: "user.write",
    resource: "users",
    action: "write",
  });

  registry.register({
    id: "order.read",
    resource: "orders",
    action: "read",
  });

  assert.equal(
    registry.findByResource("users").length,
    2,
  );

  assert.equal(
    registry.findByResource("orders").length,
    1,
  );
});

test("role manager", () => {
  const registry =
    new PermissionRegistry();

  registry.register({
    id: "user.read",
    resource: "users",
    action: "read",
  });

  registry.register({
    id: "user.write",
    resource: "users",
    action: "write",
  });

  const roles =
    new RoleManager(registry);

  const admin =
    roles.createRole({
      id: "admin",
      name: "Administrator",
      permissionIds: [
        "user.read",
        "user.write",
      ],
      organizationId: "org-1",
    });

  assert.equal(
    admin.id,
    "admin",
  );

  assert.equal(
    roles.hasPermission(
      "admin",
      "user.read",
    ),
    true,
  );

  assert.equal(
    roles.hasPermission(
      "admin",
      "user.write",
    ),
    true,
  );

  assert.deepEqual(
    roles.getPermissions("admin"),
    [
      "user.read",
      "user.write",
    ],
  );
});

test("role permission assignment and removal", () => {
  const registry =
    new PermissionRegistry();

  registry.register({
    id: "document.read",
    resource: "documents",
    action: "read",
  });

  registry.register({
    id: "document.write",
    resource: "documents",
    action: "write",
  });

  const roles =
    new RoleManager(registry);

  roles.createRole({
    id: "editor",
    name: "Editor",
    permissionIds: [
      "document.read",
    ],
  });

  roles.assignPermission(
    "editor",
    "document.write",
  );

  assert.equal(
    roles.hasPermission(
      "editor",
      "document.write",
    ),
    true,
  );

  roles.removePermission(
    "editor",
    "document.write",
  );

  assert.equal(
    roles.hasPermission(
      "editor",
      "document.write",
    ),
    false,
  );
});

test("role manager validates permissions", () => {
  const registry =
    new PermissionRegistry();

  const roles =
    new RoleManager(registry);

  assert.throws(
    () =>
      roles.createRole({
        id: "admin",
        name: "Admin",
        permissionIds: [
          "missing.permission",
        ],
      }),
    /Permission not found/,
  );
});

test("role filtering by organization", () => {
  const roles =
    new RoleManager();

  roles.createRole({
    id: "org1-admin",
    name: "Org 1 Admin",
    organizationId: "org-1",
  });

  roles.createRole({
    id: "org2-admin",
    name: "Org 2 Admin",
    organizationId: "org-2",
  });

  roles.createRole({
    id: "system-admin",
    name: "System Admin",
    systemRole: true,
  });

  assert.equal(
    roles.find({
      organizationId: "org-1",
    }).length,
    1,
  );

  assert.equal(
    roles.find({
      organizationId: "org-2",
    }).length,
    1,
  );

  assert.equal(
    roles.find({
      systemRole: true,
    }).length,
    1,
  );
});

test("policy engine allows matching policy", () => {
  const registry =
    new PermissionRegistry();

  registry.register({
    id: "user.read",
    resource: "users",
    action: "read",
  });

  const roles =
    new RoleManager(registry);

  roles.createRole({
    id: "viewer",
    name: "Viewer",
    permissionIds: [
      "user.read",
    ],
  });

  const policy =
    new PolicyEngine(roles);

  policy.addPolicy({
    id: "allow-user-read",
    effect: "allow",
    resource: "users",
    actions: ["read"],
    roles: ["viewer"],
    priority: 10,
  });

  const decision =
    policy.evaluate({
      userId: "user-1",
      organizationId: "org-1",
      resource: "users",
      action: "read",
      roleIds: ["viewer"],
    });

  assert.equal(
    decision.allowed,
    true,
  );

  assert.equal(
    decision.effect,
    "allow",
  );

  assert.deepEqual(
    decision.matchedPolicyIds,
    ["allow-user-read"],
  );
});

test("policy engine denies when no policy matches", () => {
  const policy =
    new PolicyEngine();

  const decision =
    policy.evaluate({
      userId: "user-1",
      organizationId: "org-1",
      resource: "users",
      action: "delete",
      roleIds: ["viewer"],
    });

  assert.equal(
    decision.allowed,
    false,
  );

  assert.equal(
    decision.effect,
    "deny",
  );

  assert.equal(
    decision.matchedPolicyIds.length,
    0,
  );
});

test("explicit deny policy overrides allow", () => {
  const policy =
    new PolicyEngine();

  policy.addPolicy({
    id: "allow-read",
    effect: "allow",
    resource: "documents",
    actions: ["read"],
    roles: ["editor"],
    priority: 10,
  });

  policy.addPolicy({
    id: "deny-sensitive",
    effect: "deny",
    resource: "documents",
    actions: ["read"],
    roles: ["editor"],
    priority: 20,
  });

  const decision =
    policy.evaluate({
      userId: "user-1",
      organizationId: "org-1",
      resource: "documents",
      action: "read",
      roleIds: ["editor"],
    });

  assert.equal(
    decision.allowed,
    false,
  );

  assert.equal(
    decision.effect,
    "deny",
  );

  assert.ok(
    decision.matchedPolicyIds.includes(
      "deny-sensitive",
    ),
  );
});

test("policy organization isolation", () => {
  const policy =
    new PolicyEngine();

  policy.addPolicy({
    id: "org1-read",
    effect: "allow",
    resource: "reports",
    actions: ["read"],
    organizations: ["org-1"],
  });

  const allowed =
    policy.evaluate({
      userId: "user-1",
      organizationId: "org-1",
      resource: "reports",
      action: "read",
      roleIds: [],
    });

  const denied =
    policy.evaluate({
      userId: "user-2",
      organizationId: "org-2",
      resource: "reports",
      action: "read",
      roleIds: [],
    });

  assert.equal(
    allowed.allowed,
    true,
  );

  assert.equal(
    denied.allowed,
    false,
  );
});

test("wildcard policy", () => {
  const policy =
    new PolicyEngine();

  policy.addPolicy({
    id: "system-access",
    effect: "allow",
    resource: "*",
    actions: ["*"],
    roles: ["system-admin"],
  });

  const decision =
    policy.evaluate({
      userId: "admin-1",
      organizationId: "org-1",
      resource: "billing",
      action: "delete",
      roleIds: ["system-admin"],
    });

  assert.equal(
    decision.allowed,
    true,
  );
});

test("policy conditions", () => {
  const policy =
    new PolicyEngine();

  policy.addPolicy({
    id: "production-read",
    effect: "allow",
    resource: "production",
    actions: ["read"],
    conditions: {
      environment: "production",
    },
  });

  const allowed =
    policy.evaluate({
      userId: "user-1",
      organizationId: "org-1",
      resource: "production",
      action: "read",
      roleIds: [],
      context: {
        environment: "production",
      },
    });

  const denied =
    policy.evaluate({
      userId: "user-1",
      organizationId: "org-1",
      resource: "production",
      action: "read",
      roleIds: [],
      context: {
        environment: "development",
      },
    });

  assert.equal(
    allowed.allowed,
    true,
  );

  assert.equal(
    denied.allowed,
    false,
  );
});

test("authorization health checks", () => {
  const registry =
    new PermissionRegistry();

  registry.register({
    id: "test.read",
    resource: "test",
    action: "read",
  });

  const roles =
    new RoleManager(registry);

  roles.createRole({
    id: "tester",
    name: "Tester",
  });

  const policy =
    new PolicyEngine(roles);

  policy.addPolicy({
    id: "test-policy",
    effect: "allow",
    resource: "test",
    actions: ["read"],
  });

  assert.equal(
    registry.health().healthy,
    true,
  );

  assert.equal(
    roles.health().healthy,
    true,
  );

  assert.equal(
    policy.health().healthy,
    true,
  );
});

test("authorization cleanup", () => {
  const registry =
    new PermissionRegistry();

  registry.register({
    id: "test.read",
    resource: "test",
    action: "read",
  });

  assert.equal(
    registry.size(),
    1,
  );

  assert.equal(
    registry.remove("test.read"),
    true,
  );

  assert.equal(
    registry.size(),
    0,
  );

  registry.clear();

  const roles =
    new RoleManager();

  roles.createRole({
    id: "tester",
    name: "Tester",
  });

  assert.equal(
    roles.delete("tester"),
    true,
  );

  const policy =
    new PolicyEngine();

  policy.addPolicy({
    id: "test",
    effect: "allow",
    resource: "*",
    actions: ["*"],
  });

  assert.equal(
    policy.remove("test"),
    true,
  );

  assert.equal(
    policy.size(),
    0,
  );
});