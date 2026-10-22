import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { test } from "node:test";
import type { PoolClient } from "pg";
import {
  calculateChecksum,
  parseMigrationOrder,
  runMigrations,
  runSeed,
  stripTransactionWrapper,
} from "./migrate.js";

interface QueryCall {
  sql: string;
  values?: unknown[];
}

interface MockOptions {
  failOnMigrationSql?: boolean;
  failOnSeedSql?: boolean;
  historyTableExists?: boolean;
  applied?: Array<{ version: string; checksum: string }>;
}

function createMockClient(options: MockOptions = {}) {
  const calls: QueryCall[] = [];
  let released = false;

  const client = {
    async query(sql: string, values?: unknown[]) {
      calls.push({ sql, values });

      if (
        options.failOnMigrationSql &&
        sql.includes("CREATE TABLE IF NOT EXISTS users")
      ) {
        throw new Error("Simulated migration failure");
      }

      if (
        options.failOnSeedSql &&
        sql.includes("INSERT INTO subscription_plans")
      ) {
        throw new Error("Simulated seed failure");
      }

      if (sql.includes("SELECT to_regclass")) {
        return {
          rows: [{
            table_name: options.historyTableExists === false
              ? null
              : "public.modelnow_schema_migrations",
          }],
          rowCount: 1,
        };
      }

      if (sql.includes("SELECT version, checksum")) {
        return { rows: options.applied ?? [], rowCount: options.applied?.length ?? 0 };
      }

      return { rows: [], rowCount: 0 };
    },
    release() {
      released = true;
    },
  };

  return {
    client: client as unknown as PoolClient,
    calls,
    wasReleased: () => released,
  };
}

async function getInitialMigrationRecord(): Promise<{
  version: string;
  checksum: string;
}> {
  const cwd = process.cwd();
  const repositoryRoot = existsSync(join(cwd, "database", "migrations", "versions"))
    ? cwd
    : resolve(cwd, "../..");

  const migrationPath = join(
    repositoryRoot,
    "database",
    "migrations",
    "versions",
    "001_initial.sql",
  );

  const sql = await readFile(migrationPath, "utf8");

  return {
    version: "001_initial.sql",
    checksum: calculateChecksum(sql),
  };
}

test("checksum is stable for identical content", () => {
  assert.equal(calculateChecksum("SELECT 1;"), calculateChecksum("SELECT 1;"));
});

test("checksum changes when migration content changes", () => {
  assert.notEqual(calculateChecksum("SELECT 1;"), calculateChecksum("SELECT 2;"));
});

test("migration order parses numeric prefixes", () => {
  assert.equal(parseMigrationOrder("001_initial.sql"), 1n);
  assert.equal(parseMigrationOrder("020_add_indexes.sql"), 20n);
});

test("migration filename must follow the required convention", () => {
  assert.throws(() => parseMigrationOrder("initial.sql"), /Invalid migration filename/);
});

test("transaction wrappers are removed for runner-managed transactions", () => {
  assert.equal(
    stripTransactionWrapper(
      "BEGIN;\nCREATE TABLE sample (id INT);\nCOMMIT;",
      "test.sql",
    ),
    "CREATE TABLE sample (id INT);",
  );
});

test("missing transaction wrappers are rejected", () => {
  assert.throws(
    () => stripTransactionWrapper("CREATE TABLE sample (id INT);", "test.sql"),
    /outer BEGIN/,
  );
});

test("migration runner locks, applies pending migration, records it, and releases client", async () => {
  const mock = createMockClient();

  const applied = await runMigrations(mock.client);

  assert.deepEqual(applied, ["001_initial.sql"]);
  assert.ok(mock.calls.some((call) => call.sql.includes("pg_advisory_lock")));
  assert.ok(mock.calls.some((call) => call.sql === "BEGIN"));
  assert.ok(mock.calls.some((call) => call.sql.includes("CREATE TABLE IF NOT EXISTS users")));
  assert.ok(mock.calls.some((call) =>
    call.sql.includes("INSERT INTO public.modelnow_schema_migrations"),
  ));
  assert.ok(mock.calls.some((call) => call.sql === "COMMIT"));
  assert.ok(mock.calls.some((call) => call.sql.includes("pg_advisory_unlock")));
  assert.equal(mock.wasReleased(), true);
});

test("migration failure triggers rollback, unlock, and client release", async () => {
  const mock = createMockClient({ failOnMigrationSql: true });

  await assert.rejects(
    runMigrations(mock.client),
    /Migration 001_initial\.sql failed/,
  );

  assert.ok(mock.calls.some((call) => call.sql === "ROLLBACK"));
  assert.ok(mock.calls.some((call) => call.sql.includes("pg_advisory_unlock")));
  assert.equal(mock.wasReleased(), true);
});

test("already-applied migration is skipped without executing schema SQL again", async () => {
  const record = await getInitialMigrationRecord();
  const mock = createMockClient({ applied: [record] });

  const applied = await runMigrations(mock.client);

  assert.deepEqual(applied, []);
  assert.equal(
    mock.calls.some((call) => call.sql.includes("CREATE TABLE IF NOT EXISTS users")),
    false,
  );
  assert.equal(
    mock.calls.some((call) =>
      call.sql.includes("INSERT INTO public.modelnow_schema_migrations"),
    ),
    false,
  );
  assert.equal(mock.wasReleased(), true);
});

test("checksum mismatch for an applied migration is rejected", async () => {
  const mock = createMockClient({
    applied: [{ version: "001_initial.sql", checksum: "0".repeat(64) }],
  });

  await assert.rejects(
    runMigrations(mock.client),
    /Checksum mismatch for applied migration 001_initial\.sql/,
  );

  assert.equal(
    mock.calls.some((call) => call.sql.includes("CREATE TABLE IF NOT EXISTS users")),
    false,
  );
  assert.equal(mock.wasReleased(), true);
});

test("seeding is rejected when migration history is missing", async () => {
  const mock = createMockClient({ historyTableExists: false });

  await assert.rejects(
    runSeed(mock.client),
    /Migration history is missing; run db:migrate first/,
  );

  assert.equal(
    mock.calls.some((call) => call.sql.includes("INSERT INTO subscription_plans")),
    false,
  );
  assert.equal(mock.wasReleased(), true);
});

test("seeding is rejected when migrations are still pending", async () => {
  const mock = createMockClient({ applied: [] });

  await assert.rejects(
    runSeed(mock.client),
    /Cannot seed while migrations are pending/,
  );

  assert.equal(
    mock.calls.some((call) => call.sql.includes("INSERT INTO subscription_plans")),
    false,
  );
  assert.equal(mock.wasReleased(), true);
});

test("seed failure triggers rollback, unlock, and client release", async () => {
  const record = await getInitialMigrationRecord();
  const mock = createMockClient({
    applied: [record],
    failOnSeedSql: true,
  });

  await assert.rejects(
    runSeed(mock.client),
    /Seed execution failed; its transaction was rolled back/,
  );

  assert.ok(mock.calls.some((call) => call.sql === "BEGIN"));
  assert.ok(mock.calls.some((call) => call.sql === "ROLLBACK"));
  assert.ok(mock.calls.some((call) => call.sql.includes("pg_advisory_unlock")));
  assert.equal(mock.wasReleased(), true);
});
