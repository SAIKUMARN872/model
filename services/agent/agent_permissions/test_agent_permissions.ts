import test from "node:test";
import assert from "node:assert/strict";

import {
  PermissionService,
} from "./permission-service.js";

import {
  InMemoryPermissionRepository,
} from "./permission-repository.js";

import {
  DuplicatePermissionError,
  PermissionNotFoundError,
  PermissionVersionConflictError,
} from "./permission-schema.js";

function createService(): PermissionService {
  return new PermissionService(
    new InMemoryPermissionRepository(),
  );
}

function createPermissionInput(
  overrides: Record<string, unknown> = {},
) {
  return {
    tenantId: "tenant-1",

    subjectType: "user" as const,
    subjectId: "user-1",

    resourceType: "agent" as const,
    resourceId: "agent-1",

    action: "read" as const,
    effect: "allow" as const,

    createdBy: "admin-1",

    ...overrides,
  };
}

function createAccessInput(
  overrides: Record<string, unknown> = {},
) {
  return {
    tenantId: "tenant-1",

    subjectType: "user" as const,
    subjectId: "user-1",

    resourceType: "agent" as const,
    resourceId: "agent-1",

    action: "read" as const,

    ...overrides,
  };
}

test("should create a permission", async () => {
  const service = createService();

  const permission = await service.grantPermission(
    createPermissionInput(),
  );

  assert.ok(permission.id);
  assert.equal(permission.tenantId, "tenant-1");
  assert.equal(permission.subjectId, "user-1");
  assert.equal(permission.effect, "allow");
  assert.equal(permission.version, 1);
});

test("should reject an invalid permission", async () => {
  const service = createService();

  await assert.rejects(
    () =>
      service.grantPermission(
        createPermissionInput({
          tenantId: "",
        }),
      ),
    /Permission validation failed/,
  );
});

test("should reject invalid permission actions", async () => {
  const service = createService();

  await assert.rejects(
    () =>
      service.grantPermission(
        createPermissionInput({
          action: "invalid",
        }),
      ),
    /Invalid permission action/,
  );
});

test("should prevent duplicate permissions", async () => {
  const service = createService();

  await service.grantPermission(
    createPermissionInput(),
  );

  await assert.rejects(
    () =>
      service.grantPermission(
        createPermissionInput(),
      ),
    DuplicatePermissionError,
  );
});

test("should retrieve a permission by ID", async () => {
  const service = createService();

  const created = await service.grantPermission(
    createPermissionInput(),
  );

  const retrieved = await service.getPermission(
    "tenant-1",
    created.id,
  );

  assert.equal(retrieved.id, created.id);
});

test("should enforce tenant isolation", async () => {
  const service = createService();

  const created = await service.grantPermission(
    createPermissionInput(),
  );

  await assert.rejects(
    () =>
      service.getPermission(
        "tenant-2",
        created.id,
      ),
    PermissionNotFoundError,
  );
});

test("should list permissions by tenant", async () => {
  const service = createService();

  await service.grantPermission(
    createPermissionInput(),
  );

  await service.grantPermission(
    createPermissionInput({
      subjectId: "user-2",
    }),
  );

  const permissions = await service.listPermissions({
    tenantId: "tenant-1",
  });

  assert.equal(permissions.length, 2);
});

test("should allow access when an allow permission exists", async () => {
  const service = createService();

  await service.grantPermission(
    createPermissionInput(),
  );

  const result = await service.checkAccess(
    createAccessInput(),
  );

  assert.equal(result.allowed, true);
  assert.equal(result.reason, "explicit_allow");
});

test("should deny access when no permission exists", async () => {
  const service = createService();

  const result = await service.checkAccess(
    createAccessInput(),
  );

  assert.equal(result.allowed, false);
  assert.equal(result.reason, "no_matching_permission");
});

test("should give explicit deny precedence over allow", async () => {
  const service = createService();

  await service.grantPermission(
    createPermissionInput({
      effect: "allow",
    }),
  );

  await service.grantPermission(
    createPermissionInput({
      effect: "deny",
    }),
  );

  const result = await service.checkAccess(
    createAccessInput(),
  );

  assert.equal(result.allowed, false);
  assert.equal(result.reason, "explicit_deny");
});

test("should support wildcard resource permissions", async () => {
  const service = createService();

  await service.grantPermission(
    createPermissionInput({
      resourceId: "*",
    }),
  );

  const result = await service.checkAccess(
    createAccessInput({
      resourceId: "agent-999",
    }),
  );

  assert.equal(result.allowed, true);
});

test("should support wildcard action permissions", async () => {
  const service = createService();

  await service.grantPermission(
    createPermissionInput({
      action: "*",
    }),
  );

  const result = await service.checkAccess(
    createAccessInput({
      action: "execute",
    }),
  );

  assert.equal(result.allowed, true);
});

test("should support wildcard resource types", async () => {
  const service = createService();

  await service.grantPermission(
    createPermissionInput({
      resourceType: "*",
      resourceId: "*",
      action: "*",
    }),
  );

  const result = await service.checkAccess(
    createAccessInput({
      resourceType: "execution",
      resourceId: "execution-1",
      action: "execute",
    }),
  );

  assert.equal(result.allowed, true);
});

test("should evaluate role-based permissions", async () => {
  const service = createService();

  await service.grantPermission(
    createPermissionInput({
      subjectType: "role",
      subjectId: "admin",
      action: "manage",
    }),
  );

  const result = await service.checkAccess(
    createAccessInput({
      subjectRoles: ["admin"],
      action: "manage",
    }),
  );

  assert.equal(result.allowed, true);
});

test("should not allow an expired permission", async () => {
  const service = createService();

  const permission = await service.grantPermission(
    createPermissionInput({
      expiresAt: new Date(
        Date.now() + 60_000,
      ).toISOString(),
    }),
  );

  const repository = new InMemoryPermissionRepository();

  await repository.create({
    ...permission,
    id: "expired-test-permission",
    expiresAt: new Date(
      Date.now() - 60_000,
    ).toISOString(),
  });

  const expiredService = new PermissionService(repository);

  const result = await expiredService.checkAccess(
    createAccessInput(),
  );

  assert.equal(result.allowed, false);
  assert.equal(result.reason, "expired_permission");
});

test("should revoke a permission", async () => {
  const service = createService();

  const permission = await service.grantPermission(
    createPermissionInput(),
  );

  await service.revokePermission(
    "tenant-1",
    permission.id,
  );

  await assert.rejects(
    () =>
      service.getPermission(
        "tenant-1",
        permission.id,
      ),
    PermissionNotFoundError,
  );
});

test("should reject revocation with an incorrect version", async () => {
  const service = createService();

  const permission = await service.grantPermission(
    createPermissionInput(),
  );

  await assert.rejects(
    () =>
      service.revokePermission(
        "tenant-1",
        permission.id,
        99,
      ),
    PermissionVersionConflictError,
  );
});

test("should revoke multiple permissions", async () => {
  const service = createService();

  const first = await service.grantPermission(
    createPermissionInput(),
  );

  const second = await service.grantPermission(
    createPermissionInput({
      subjectId: "user-2",
    }),
  );

  const deleted = await service.revokePermissions(
    "tenant-1",
    [first.id, second.id],
  );

  assert.equal(deleted, 2);

  const remaining = await service.listPermissions({
    tenantId: "tenant-1",
  });

  assert.equal(remaining.length, 0);
});

test("should isolate permissions between tenants", async () => {
  const service = createService();

  await service.grantPermission(
    createPermissionInput({
      tenantId: "tenant-1",
    }),
  );

  await service.grantPermission(
    createPermissionInput({
      tenantId: "tenant-2",
    }),
  );

  const firstTenantPermissions =
    await service.listPermissions({
      tenantId: "tenant-1",
    });

  assert.equal(firstTenantPermissions.length, 1);
});

test("should ignore permissions for a different resource", async () => {
  const service = createService();

  await service.grantPermission(
    createPermissionInput({
      resourceId: "agent-2",
    }),
  );

  const result = await service.checkAccess(
    createAccessInput({
      resourceId: "agent-1",
    }),
  );

  assert.equal(result.allowed, false);
  assert.equal(result.reason, "no_matching_permission");
});

test("should validate expiration dates", async () => {
  const service = createService();

  await assert.rejects(
    () =>
      service.grantPermission(
        createPermissionInput({
          expiresAt: "invalid-date",
        }),
      ),
    /expiresAt must be a valid date string/,
  );
});

test("should reject an invalid access request", async () => {
  const service = createService();

  await assert.rejects(
    () =>
      service.checkAccess(
        createAccessInput({
          tenantId: "",
        }),
      ),
    /tenantId is required/,
  );
});

test("should return matched permission IDs", async () => {
  const service = createService();

  const permission = await service.grantPermission(
    createPermissionInput(),
  );

  const result = await service.checkAccess(
    createAccessInput(),
  );

  assert.deepEqual(
    result.matchedPermissionIds,
    [permission.id],
  );
});

test("should not expose mutable repository references", async () => {
  const service = createService();

  const permission = await service.grantPermission(
    createPermissionInput({
      metadata: {
        source: "test",
      },
    }),
  );

  permission.metadata!.source = "modified";

  const retrieved = await service.getPermission(
    "tenant-1",
    permission.id,
  );

  assert.equal(retrieved.metadata?.source, "test");
});