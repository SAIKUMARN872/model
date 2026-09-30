import {
  RoleManager,
  RolePolicyService,
  RoleService,
} from "./index.js";

let passed = 0;
let failed = 0;

function test(
  name: string,
  condition: boolean,
): void {
  if (condition) {
    console.log(`PASS: ${name}`);
    passed++;
  } else {
    console.log(`FAIL: ${name}`);
    failed++;
  }
}

function expectError(
  name: string,
  callback: () => void,
): void {
  try {
    callback();
    console.log(`FAIL: ${name}`);
    failed++;
  } catch {
    console.log(`PASS: ${name}`);
    passed++;
  }
}

function runTests(): void {
  console.log(
    "Running roles tests...\n",
  );

  const roles = new RoleService();

  const admin = roles.create({
    name: "Admin",
    description: "System administrator",
    permissions: [
      "users:read",
      "users:create",
      "users:delete",
    ],
    system: true,
  });

  const viewer = roles.create({
    name: "Viewer",
    description: "Read-only user",
    permissions: [
      "users:read",
      "reports:read",
    ],
  });

  test(
    "Admin role is created",
    admin.id === "admin",
  );

  test(
    "Viewer role is created",
    viewer.id === "viewer",
  );

  test(
    "Role lookup works",
    roles.get("admin") !== undefined,
  );

  test(
    "Role name lookup works",
    roles.getByName("Admin")?.id === "admin",
  );

  test(
    "Role count is correct",
    roles.count() === 2,
  );

  test(
    "Admin has users:read",
    roles.hasPermission(
      "admin",
      "users:read",
    ),
  );

  test(
    "Viewer does not have users:delete",
    !roles.hasPermission(
      "viewer",
      "users:delete",
    ),
  );

  const updated =
    roles.addPermission(
      "viewer",
      "users:create",
    );

  test(
    "Permission can be added",
    updated.permissions.includes(
      "users:create",
    ),
  );

  roles.removePermission(
    "viewer",
    "users:create",
  );

  test(
    "Permission can be removed",
    !roles.hasPermission(
      "viewer",
      "users:create",
    ),
  );

  const changed =
    roles.update("viewer", {
      description: "Updated viewer",
    });

  test(
    "Role can be updated",
    changed.description ===
      "Updated viewer",
  );

  expectError(
    "Duplicate role is rejected",
    () => {
      roles.create({
        name: "Admin",
      });
    },
  );

  expectError(
    "Empty role name is rejected",
    () => {
      roles.create({
        name: "   ",
      });
    },
  );

  expectError(
    "System role cannot be deleted",
    () => {
      roles.delete("admin");
    },
  );

  test(
    "Non-system role can be deleted",
    roles.delete("viewer"),
  );

  const manager =
    new RoleManager();

  manager.createRole({
    name: "Manager",
    permissions: [
      "employees:read",
      "employees:update",
    ],
  });

  manager.createRole({
    name: "Auditor",
    permissions: [
      "audit:read",
    ],
  });

  test(
    "Manager role exists",
    manager.getRole("manager") !== undefined,
  );

  test(
    "User can be assigned a role",
    manager.assignRole(
      "user-1",
      "manager",
    ).roleId === "manager",
  );

  test(
    "User has assigned role",
    manager.hasRole(
      "user-1",
      "manager",
    ),
  );

  test(
    "User roles can be retrieved",
    manager.getUserRoles(
      "user-1",
    ).length === 1,
  );

  test(
    "User permission is inherited from role",
    manager.hasPermission(
      "user-1",
      "employees:read",
    ),
  );

  test(
    "Unknown user does not have permission",
    !manager.hasPermission(
      "unknown-user",
      "employees:read",
    ),
  );

  test(
    "Role can be removed from user",
    manager.removeRole(
      "user-1",
      "manager",
    ),
  );

  test(
    "Removed role is no longer assigned",
    !manager.hasRole(
      "user-1",
      "manager",
    ),
  );

  expectError(
    "Assigning unknown role is rejected",
    () => {
      manager.assignRole(
        "user-2",
        "unknown-role",
      );
    },
  );

  const policyRoles =
    new RoleService();

  policyRoles.create({
    name: "PolicyAdmin",
    permissions: [
      "users:read",
      "users:update",
    ],
  });

  const policyService =
    new RolePolicyService();

  const policy =
    policyService.create(
      "policyadmin",
      [
        "users:read",
        "users:update",
      ],
      false,
    );

  test(
    "Role policy is created",
    policy.roleId === "policyadmin",
  );

  test(
    "Policy can be retrieved",
    policyService.get(
      "policyadmin",
    ) !== undefined,
  );

  const policyResult =
    policyService.check(
      "policyadmin",
      [
        "users:read",
        "users:update",
      ],
    );

  test(
    "All policy permissions are satisfied",
    policyResult.allowed,
  );

  const missingResult =
    policyService.check(
      "policyadmin",
      ["users:read"],
    );

  test(
    "Missing policy permission is denied",
    !missingResult.allowed,
  );

  policyService.create(
    "policyadmin",
    ["users:read"],
    true,
  );

  const anyResult =
    policyService.check(
      "policyadmin",
      ["users:read"],
    );

  test(
    "Allow-any policy works",
    anyResult.allowed,
  );

  test(
    "Role manager health works",
    manager.health().healthy,
  );

  test(
    "Role service health works",
    roles.health().healthy,
  );

  test(
    "Policy service health works",
    policyService.health().healthy,
  );

  console.log(
    `\nTests passed: ${passed}`,
  );

  console.log(
    `Tests failed: ${failed}`,
  );

  if (failed > 0) {
    process.exitCode = 1;
  } else {
    console.log(
      "\nAll role tests passed.",
    );
  }
}

runTests();

