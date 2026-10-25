import assert from "node:assert/strict";
import test from "node:test";
import type { QueryResult, QueryResultRow } from "pg";
import {
  ApiKeyRepository,
  type ApiKeyOwner,
} from "./api-key.repository.js";
import type { QueryExecutor } from "./base.repository.js";

class FakeExecutor implements QueryExecutor {
  public calls: Array<{ sql: string; values: unknown[] }> = [];
  public rows: QueryResultRow[] = [];
  public rowCount = 0;

  public async query<R extends QueryResultRow = QueryResultRow>(
    sql: string,
    values: unknown[] = [],
  ): Promise<QueryResult<R>> {
    this.calls.push({ sql, values });
    return {
      command: "SELECT",
      rowCount: this.rowCount,
      oid: 0,
      fields: [],
      rows: this.rows as R[],
    };
  }
}

const owner: ApiKeyOwner = {
  userId: "a11e0000-0000-4000-8000-000000000001",
  organizationId: null,
};

const record = {
  id: "b22e0000-0000-4000-8000-000000000002",
  userId: owner.userId,
  organizationId: null,
  name: "Production inference key",
  keyPrefix: "mn_inf_abcd1234",
  scopes: ["inference:invoke"],
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  expiresAt: null,
  lastUsedAt: null,
  revokedAt: null,
};

const hash = "a".repeat(64);

test("create uses parameterized SQL and stores only a hash", async () => {
  const db = new FakeExecutor();
  db.rows = [record];
  const repository = new ApiKeyRepository(db);

  const result = await repository.create({
    owner,
    name: " Production inference key ",
    keyPrefix: "mn_inf_abcd1234",
    secretHash: hash,
    scopes: ["inference:invoke"],
  });

  assert.equal(result.name, record.name);
  assert.equal(db.calls.length, 1);
  assert.match(db.calls[0].sql, /INSERT INTO api_keys/);
  assert.match(db.calls[0].sql, /secret_hash/);
  assert.equal(db.calls[0].values[4], hash);
  assert.equal(JSON.stringify(result).includes(hash), false);
  assert.equal(db.calls[0].values.includes("raw-secret"), false);
});

test("create rejects a missing owner before querying", async () => {
  const db = new FakeExecutor();
  const repository = new ApiKeyRepository(db);

  await assert.rejects(
    repository.create({
      owner: { userId: null, organizationId: null },
      name: "test",
      keyPrefix: "mn_inf_test",
      secretHash: hash,
      scopes: ["inference:invoke"],
    }),
    /owner is required/,
  );

  assert.equal(db.calls.length, 0);
});

test("create rejects malformed hashes and duplicate scopes", async () => {
  const repository = new ApiKeyRepository(new FakeExecutor());

  await assert.rejects(
    repository.create({
      owner,
      name: "test",
      keyPrefix: "mn_inf_test",
      secretHash: "not-a-hash",
      scopes: ["inference:invoke"],
    }),
    /SHA-256/,
  );

  await assert.rejects(
    repository.create({
      owner,
      name: "test",
      keyPrefix: "mn_inf_test",
      secretHash: hash,
      scopes: ["inference:invoke", "inference:invoke"],
    }),
    /unique/,
  );
});

test("findActiveByHash queries exact hash and excludes expired or revoked keys", async () => {
  const db = new FakeExecutor();
  db.rows = [record];
  const repository = new ApiKeyRepository(db);

  const result = await repository.findActiveByHash(hash);

  assert.equal(result?.id, record.id);
  assert.match(db.calls[0].sql, /secret_hash = \$1/);
  assert.match(db.calls[0].sql, /revoked_at IS NULL/);
  assert.match(db.calls[0].sql, /expires_at > now\(\)/);
  assert.deepEqual(db.calls[0].values, [hash]);
});

test("listForOwner filters by both owner columns", async () => {
  const db = new FakeExecutor();
  db.rows = [record];
  const repository = new ApiKeyRepository(db);

  const result = await repository.listForOwner(owner);

  assert.equal(result.length, 1);
  assert.match(db.calls[0].sql, /user_id IS NOT DISTINCT FROM/);
  assert.match(db.calls[0].sql, /organization_id IS NOT DISTINCT FROM/);
  assert.deepEqual(db.calls[0].values, [owner.userId, null]);
});

test("revokeForOwner only reports a changed row", async () => {
  const db = new FakeExecutor();
  db.rowCount = 1;
  const repository = new ApiKeyRepository(db);

  assert.equal(await repository.revokeForOwner(record.id, owner), true);
  assert.match(db.calls[0].sql, /revoked_at = now\(\)/);
  assert.match(db.calls[0].sql, /organization_id IS NOT DISTINCT FROM/);

  db.rowCount = 0;
  assert.equal(await repository.revokeForOwner(record.id, owner), false);
});

test("markUsed updates only an active, unexpired key", async () => {
  const db = new FakeExecutor();
  db.rowCount = 1;
  const repository = new ApiKeyRepository(db);

  assert.equal(await repository.markUsed(record.id), true);
  assert.match(db.calls[0].sql, /last_used_at = now\(\)/);
  assert.match(db.calls[0].sql, /revoked_at IS NULL/);
  assert.match(db.calls[0].sql, /expires_at > now\(\)/);
});