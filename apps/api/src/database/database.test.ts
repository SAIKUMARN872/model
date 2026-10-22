import assert from "node:assert/strict";
import test from "node:test";
import { Pool } from "pg";
import { loadDatabaseConfig } from "./config.js";
import { createDatabasePool, closeDatabasePool } from "./client.js";
import { runInTransaction } from "./transaction.js";
import type { PoolClient } from "pg";

const validEnvironment = {
  DATABASE_URL: "postgresql://modelnow:test-password@localhost:5432/modelnow_test",
};

test("loads bounded database pool defaults", () => {
  const config = loadDatabaseConfig(validEnvironment);

  assert.equal(config.maxConnections, 10);
  assert.equal(config.idleTimeoutMillis, 30000);
  assert.equal(config.connectionTimeoutMillis, 5000);
  assert.equal(config.ssl, false);
  assert.equal(Object.isFrozen(config), true);
});

test("rejects missing or invalid PostgreSQL URLs", () => {
  assert.throws(() => loadDatabaseConfig({}), /DATABASE_URL/);

  assert.throws(
    () => loadDatabaseConfig({ DATABASE_URL: "https://example.com" }),
    /PostgreSQL connection URL/,
  );
});

test("rejects unsafe pool limits", () => {
  assert.throws(
    () => loadDatabaseConfig({
      ...validEnvironment,
      DATABASE_POOL_MAX: "101",
    }),
    /DATABASE_POOL_MAX/,
  );
});

test("creates and closes a pool without connecting to a server", async () => {
  const config = loadDatabaseConfig({
    ...validEnvironment,
    DATABASE_POOL_MAX: "3",
  });

  const pool = createDatabasePool(config);

  try {
    assert.ok(pool instanceof Pool);
    assert.equal(pool.options.max, 3);
  } finally {
    await closeDatabasePool(pool);
  }
});

test("rolls back a failed transaction and releases its client", async () => {
  const calls: string[] = [];
  const expectedError = new Error("operation failed");

  const client = {
    query: async (sql: string) => {
      calls.push(sql);
      return { rows: [], rowCount: 0 };
    },
    release: () => {
      calls.push("RELEASE");
    },
  };

  const pool = {
    connect: async () => client,
  };

  await assert.rejects(
    runInTransaction(
      pool as unknown as Pool,
      async (_client: PoolClient) => {
        throw expectedError;
      },
    ),
    (error: unknown) => error === expectedError,
  );

  assert.deepEqual(calls, ["BEGIN", "ROLLBACK", "RELEASE"]);
});

test("commits successful transactions and releases the client", async () => {
  const calls: string[] = [];

  const client = {
    query: async (sql: string) => {
      calls.push(sql);
      return { rows: [], rowCount: 0 };
    },
    release: () => {
      calls.push("RELEASE");
    },
  };

  const pool = {
    connect: async () => client,
  };

  const result = await runInTransaction(
    pool as unknown as Pool,
    async () => "committed",
  );

  assert.equal(result, "committed");
  assert.deepEqual(calls, ["BEGIN", "COMMIT", "RELEASE"]);
});
