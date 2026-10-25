import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ApiKeyManagementService,
  hashCustomerApiKey,
} from "./api-key-management.service.js";
import type {
  ApiKeyOwner,
  CreateStoredApiKey,
  StoredApiKey,
} from "../repositories/api-key.repository.js";
import type { AuthenticatedPrincipal } from "../types/request.types.js";

const principal: AuthenticatedPrincipal = {
  userId: "auth0|test-user",
  tenantId: "tenant-test",
  roles: ["user"],
  scopes: [],
};

const userId = "123e4567-e89b-42d3-a456-426614174000";

function makeStored(input: CreateStoredApiKey): StoredApiKey {
  return {
    id: "123e4567-e89b-42d3-a456-426614174001",
    userId: input.owner.userId,
    organizationId: input.owner.organizationId,
    name: input.name,
    keyPrefix: input.keyPrefix,
    scopes: input.scopes,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    expiresAt: input.expiresAt ?? null,
    lastUsedAt: null,
    revokedAt: null,
  };
}

function harness() {
  const created: CreateStoredApiKey[] = [];
  const listedOwners: ApiKeyOwner[] = [];
  const revoked: Array<{ id: string; owner: ApiKeyOwner }> = [];
  let activeIdentity = true;
  let revokeResult = true;

  const keys = {
    async create(input: CreateStoredApiKey) {
      created.push(input);
      return makeStored(input);
    },
    async listForOwner(owner: ApiKeyOwner) {
      listedOwners.push(owner);
      return created.map(makeStored);
    },
    async revokeForOwner(id: string, owner: ApiKeyOwner) {
      revoked.push({ id, owner });
      return revokeResult;
    },
  };

  const identities = {
    async findActiveByAuthSubject(subject: string) {
      assert.equal(subject, principal.userId);
      return activeIdentity ? { userId } : null;
    },
  };

  return {
    service: new ApiKeyManagementService(keys, identities),
    created,
    listedOwners,
    revoked,
    setActiveIdentity(value: boolean) { activeIdentity = value; },
    setRevokeResult(value: boolean) { revokeResult = value; },
  };
}

test("creates one customer key, stores only its SHA-256 hash, and returns the secret once", async () => {
  const h = harness();
  const result = await h.service.create(principal, { name: "Production" });

  assert.match(result.key, /^mn_[A-Za-z0-9_-]{43}$/);
  assert.equal(result.keyPrefix, result.key.slice(0, 11));
  assert.equal(h.created.length, 1);
  assert.equal(h.created[0].secretHash, hashCustomerApiKey(result.key));
  assert.notEqual(h.created[0].secretHash, result.key);
  assert.deepEqual(h.created[0].scopes, ["inference:invoke"]);
  assert.deepEqual(h.created[0].owner, {
    userId,
    organizationId: null,
  });
  assert.equal("secretHash" in result, false);
});

test("rejects invalid names before identity or database access", async () => {
  const h = harness();
  await assert.rejects(
    h.service.create(principal, { name: "   " }),
    { code: "INVALID_API_KEY_NAME" },
  );
  assert.equal(h.created.length, 0);
});

test("rejects invalid or past expiry dates", async () => {
  const h = harness();
  await assert.rejects(
    h.service.create(principal, { name: "test", expiresAt: "not-a-date" }),
    { code: "INVALID_API_KEY_EXPIRY" },
  );
  await assert.rejects(
    h.service.create(principal, { name: "test", expiresAt: "2000-01-01T00:00:00Z" }),
    { code: "INVALID_API_KEY_EXPIRY" },
  );
  assert.equal(h.created.length, 0);
});

test("refuses to manage keys for an inactive identity", async () => {
  const h = harness();
  h.setActiveIdentity(false);
  await assert.rejects(
    h.service.create(principal, { name: "test" }),
    { code: "ACTIVE_USER_REQUIRED" },
  );
  assert.equal(h.created.length, 0);
});

test("lists only user-owned keys and never returns secret hashes", async () => {
  const h = harness();
  await h.service.create(principal, { name: "test" });
  const result = await h.service.list(principal);

  assert.equal(h.listedOwners.length, 1);
  assert.deepEqual(h.listedOwners[0], { userId, organizationId: null });
  assert.equal(result.length, 1);
  assert.equal("secretHash" in result[0], false);
});

test("revokes by ID scoped to the active user's ownership", async () => {
  const h = harness();
  const id = "123e4567-e89b-42d3-a456-426614174001";
  await h.service.revoke(principal, id);
  assert.deepEqual(h.revoked, [{ id, owner: { userId, organizationId: null } }]);
});

test("does not reveal whether another user's key exists", async () => {
  const h = harness();
  h.setRevokeResult(false);
  await assert.rejects(
    h.service.revoke(principal, "123e4567-e89b-42d3-a456-426614174001"),
    { code: "API_KEY_NOT_FOUND" },
  );
});

test("rejects malformed key IDs", async () => {
  const h = harness();
  await assert.rejects(
    h.service.revoke(principal, "not-a-uuid"),
    { code: "INVALID_API_KEY_ID" },
  );
  assert.equal(h.revoked.length, 0);
});