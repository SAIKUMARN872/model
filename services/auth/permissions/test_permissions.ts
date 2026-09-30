import {
  PermissionChecker,
  PermissionService,
  RbacService,
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
    "Running permissions tests...\n",
  );

  const permissions =
    new PermissionService();

  const usersRead = permissions.create({
    resource: "users",
    action: "read",
    description: "Read users",
  });

  const usersCreate = permissions.create({
    resource: "users",
    action: "create",
    description: "Create users",
  });

  const usersDelete = permissions.create({
    resource: "users",
    action: "delete",
    description: "Delete users",
  });

  const reportsRead = permissions.create({
    resource: "reports",
    action: "read",
    description: "Read reports",
  });

  test(
    "Permission is created",
    usersRead.id === "users:read",
  );

  test(
    "Permission lookup works",
    permissions.get(
      "users:read",
    ) !== undefined,
  );

  test(
    "Permission count is correct",
    permissions.count() === 4,
  );

  test(
    "Resource filtering works",
    permissions.getByResource(
      "users",
    ).length === 3,
  );

  const rbac =
    new RbacService(permissions);

  const admin = rbac.createRole({
    name: "Admin",
    description: "Administrator",
    permissions: [
      usersRead.id,
      usersCreate.id,
      usersDelete.id,
      reportsRead.id,
    ],
  });

  const viewer = rbac.createRole({
    name: "Viewer",
    description: "Read-only user",
    permissions: [
      usersRead.id,
      reportsRead.id,
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
    "Admin has users:read",
    rbac.hasPermission(
      "admin",
      "users:read",
    ),
  );

  test(
    "Admin has users:delete",
    rbac.hasPermission(
      "admin",
      "users:delete",
    ),
  );

  test(
    "Viewer has users:read",
    rbac.hasPermission(
      "viewer",
      "users:read",
    ),
  );

  test(
    "Viewer does not have users:delete",
    !rbac.hasPermission(
      "viewer",
      "users:delete",
    ),
  );

  test(
    "Resource/action check works",
    rbac.hasResourceAction(
      "admin",
      "users",
      "create",
    ),
  );

  test(
    "Permission can be added",
    rbac.addPermission(
      "viewer",
      usersCreate.id,
    ).permissions.includes(
      usersCreate.id,
    ),
  );

  test(
    "Permission can be removed",
    !rbac.removePermission(
      "viewer",
      usersCreate.id,
    ).permissions.includes(
      usersCreate.id,
    ),
  );

  expectError(
    "Unknown permission is rejected",
    () => {
      rbac.addPermission(
        "viewer",
        "unknown:permission",
      );
    },
  );

  expectError(
    "Duplicate role is rejected",
    () => {
      rbac.createRole({
        name: "Admin",
      });
    },
  );

  const checker =
    new PermissionChecker();

  test(
    "Checker grants valid permission",
    checker.can(
      "admin",
      "users:read",
    ),
  );

  test(
    "Checker denies invalid permission",
    !checker.can(
      "viewer",
      "users:delete",
    ),
  );

  test(
    "check() returns allowed",
    checker.check({
      roleId: "admin",
      permissionId: "users:read",
    }).allowed,
  );

  test(
    "check() returns denied",
    !checker.check({
      roleId: "viewer",
      permissionId: "users:delete",
    }).allowed,
  );

  test(
    "checkAny works",
    checker.canAny(
      "viewer",
      [
        "users:delete",
        "users:read",
      ],
    ),
  );

  test(
    "checkAll works",
    checker.canAll(
      "admin",
      [
        "users:read",
        "users:create",
      ],
    ),
  );

  test(
    "checkAll denies missing permission",
    !checker.canAll(
      "viewer",
      [
        "users:read",
        "users:delete",
      ],
    ),
  );

  test(
    "Unknown role is denied",
    !checker.can(
      "unknown-role",
      "users:read",
    ),
  );

  const wildcardPermissions =
    new PermissionService();

  const wildcardRbac =
    new RbacService(
      wildcardPermissions,
    );

  wildcardRbac.createRole({
    name: "SuperAdmin",
    permissions: ["*:*"],
  });

  test(
    "Wildcard permission grants access",
    wildcardRbac.hasPermission(
      "superadmin",
      "anything:execute",
    ),
  );

  test(
    "Role listing works",
    rbac.listRoles().length === 2,
  );

  test(
    "Permission listing works",
    permissions.list().length === 4,
  );

  test(
    "RBAC health works",
    rbac.health().healthy,
  );

  test(
    "Permission service health works",
    permissions.health().healthy,
  );

  test(
    "Checker handles missing role",
    checker.check({
      roleId: "missing",
      permissionId: "users:read",
    }).reason === "Role not found",
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
      "\nAll permission tests passed.",
    );
  }
}

runTests();
