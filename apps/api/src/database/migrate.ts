import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { existsSync } from "node:fs";
import type { PoolClient } from "pg";
import { closeDatabasePool, createDatabasePool } from "./client.js";
import { loadDatabaseConfig } from "./config.js";

const CURRENT_DIRECTORY = process.cwd();
const REPOSITORY_ROOT = existsSync(join(CURRENT_DIRECTORY, "database", "migrations", "versions"))
  ? CURRENT_DIRECTORY
  : resolve(CURRENT_DIRECTORY, "../..");
const MIGRATIONS_DIRECTORY = join(REPOSITORY_ROOT, "database", "migrations", "versions");
const SEED_FILE = join(REPOSITORY_ROOT, "database", "seeds", "initial_data.sql");

const MIGRATION_TABLE = "public.modelnow_schema_migrations";
const LOCK_NAMESPACE = 1297044047;
const LOCK_KEY = 1;
const INITIAL_MIGRATION = "001_initial.sql";

interface MigrationFile {
  readonly version: string;
  readonly checksum: string;
  readonly sql: string;
  readonly order: bigint;
}

interface AppliedMigration {
  version: string;
  checksum: string;
}

export function calculateChecksum(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

export function parseMigrationOrder(filename: string): bigint {
  const match = /^(\d+)_([a-z0-9][a-z0-9_-]*)\.sql$/i.exec(filename);

  if (!match) {
    throw new Error(`Invalid migration filename: ${filename}`);
  }

  return BigInt(match[1]);
}

export function stripTransactionWrapper(sql: string, sourceLabel: string): string {
  const withoutBom = sql.replace(/^\uFEFF/, "");
  const beginMatch = withoutBom.match(
    /^(?:\s|--[^\r\n]*(?:\r?\n|$)|\/\*[\s\S]*?\*\/)*BEGIN\s*;\s*/i,
  );
  const endsWithCommit = /\s*COMMIT\s*;\s*$/i.test(withoutBom);

  if (!beginMatch || !endsWithCommit) {
    throw new Error(
      `${sourceLabel} must have an outer BEGIN; ... COMMIT; wrapper`,
    );
  }

  const body = withoutBom
    .slice(beginMatch[0].length)
    .replace(/\s*COMMIT\s*;\s*$/i, "");

  if (!body.trim()) {
    throw new Error(`${sourceLabel} contains no SQL statements`);
  }

  return body;
}

async function loadMigrationFiles(): Promise<MigrationFile[]> {
  const entries = await readdir(MIGRATIONS_DIRECTORY, { withFileTypes: true });
  const filenames = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".sql"))
    .map((entry) => entry.name);

  const seenOrders = new Set<string>();
  const migrations: MigrationFile[] = [];

  for (const filename of filenames) {
    const order = parseMigrationOrder(filename);
    const orderKey = order.toString();

    if (seenOrders.has(orderKey)) {
      throw new Error(`Duplicate migration order: ${orderKey}`);
    }
    seenOrders.add(orderKey);

    const filePath = join(MIGRATIONS_DIRECTORY, filename);
    const sql = await readFile(filePath, "utf8");

    // Validate wrappers before any database work starts.
    stripTransactionWrapper(sql, filename);

    migrations.push({
      version: filename,
      checksum: calculateChecksum(sql),
      sql,
      order,
    });
  }

  migrations.sort((a, b) =>
    a.order < b.order ? -1 : a.order > b.order ? 1 : a.version.localeCompare(b.version),
  );

  if (migrations.length === 0) {
    throw new Error(`No SQL migrations found in ${MIGRATIONS_DIRECTORY}`);
  }

  return migrations;
}

async function readAppliedMigrations(
  client: PoolClient,
): Promise<AppliedMigration[]> {
  const result = await client.query<AppliedMigration>(
    `SELECT version, checksum
       FROM ${MIGRATION_TABLE}
      ORDER BY version`,
  );

  return result.rows;
}

async function verifyMigrationHistory(
  client: PoolClient,
  migrations: MigrationFile[],
): Promise<Set<string>> {
  const applied = await readAppliedMigrations(client);
  const currentByVersion = new Map(
    migrations.map((migration) => [migration.version, migration]),
  );
  const appliedVersions = new Set<string>();

  for (const record of applied) {
    const current = currentByVersion.get(record.version);

    if (!current) {
      throw new Error(
        `Applied migration ${record.version} is missing from the migration directory`,
      );
    }

    if (record.checksum !== current.checksum) {
      throw new Error(
        `Checksum mismatch for applied migration ${record.version}; refusing to continue`,
      );
    }

    appliedVersions.add(record.version);
  }

  return appliedVersions;
}

async function withMigrationLock<T>(
  client: PoolClient,
  operation: () => Promise<T>,
): Promise<T> {
  let lockAcquired = false;

  try {
    await client.query("SELECT pg_advisory_lock($1, $2)", [
      LOCK_NAMESPACE,
      LOCK_KEY,
    ]);
    lockAcquired = true;

    return await operation();
  } finally {
    try {
      if (lockAcquired) {
        await client.query("SELECT pg_advisory_unlock($1, $2)", [
          LOCK_NAMESPACE,
          LOCK_KEY,
        ]);
      }
    } finally {
      client.release();
    }
  }
}

export async function runMigrations(client: PoolClient): Promise<string[]> {
  return withMigrationLock(client, async () => {
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${MIGRATION_TABLE} (
        version TEXT PRIMARY KEY,
        checksum TEXT NOT NULL CHECK (checksum ~ '^[0-9a-f]{64}$'),
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const migrations = await loadMigrationFiles();
    const appliedVersions = await verifyMigrationHistory(client, migrations);
    const newlyApplied: string[] = [];

    for (const migration of migrations) {
      if (appliedVersions.has(migration.version)) {
        continue;
      }

      await client.query("BEGIN");

      try {
        const body = stripTransactionWrapper(migration.sql, migration.version);
        await client.query(body);

        await client.query(
          `INSERT INTO ${MIGRATION_TABLE} (version, checksum)
           VALUES ($1, $2)`,
          [migration.version, migration.checksum],
        );

        await client.query("COMMIT");
        newlyApplied.push(migration.version);
      } catch (error) {
        try {
          await client.query("ROLLBACK");
        } catch {
          // Preserve the original migration failure.
        }

        throw new Error(
          `Migration ${migration.version} failed; its transaction was rolled back`,
          { cause: error },
        );
      }
    }

    return newlyApplied;
  });
}

export async function runSeed(client: PoolClient): Promise<void> {
  await withMigrationLock(client, async () => {
    const tableResult = await client.query<{ table_name: string | null }>(
      "SELECT to_regclass($1) AS table_name",
      [MIGRATION_TABLE],
    );

    if (!tableResult.rows[0]?.table_name) {
      throw new Error("Migration history is missing; run db:migrate first");
    }

    const migrations = await loadMigrationFiles();
    const appliedVersions = await verifyMigrationHistory(client, migrations);

    const pending = migrations.filter(
      (migration) => !appliedVersions.has(migration.version),
    );

    if (pending.length > 0) {
      throw new Error(
        `Cannot seed while migrations are pending: ${pending.map((item) => item.version).join(", ")}`,
      );
    }

    if (!appliedVersions.has(INITIAL_MIGRATION)) {
      throw new Error(`Required migration ${INITIAL_MIGRATION} has not been applied`);
    }

    const seedSql = await readFile(SEED_FILE, "utf8");
    const seedBody = stripTransactionWrapper(seedSql, "initial_data.sql");

    await client.query("BEGIN");

    try {
      await client.query(seedBody);
      await client.query("COMMIT");
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Preserve the original seed failure.
      }

      throw new Error("Seed execution failed; its transaction was rolled back", {
        cause: error,
      });
    }
  });
}

async function main(): Promise<void> {
  const command = process.argv[2];

  if (command !== "up" && command !== "seed") {
    throw new Error("Usage: migrate.ts <up|seed>");
  }

  const config = loadDatabaseConfig();
  const pool = createDatabasePool(config);

  try {
    const client = await pool.connect();

    if (command === "up") {
      const applied = await runMigrations(client);
      console.info(
        applied.length === 0
          ? "Migrations are already up to date."
          : `Applied migrations: ${applied.join(", ")}`,
      );
    } else {
      try {
        await runSeed(client);
        console.info("Seed completed successfully.");
      } finally {
        // runSeed releases its client through the migration-lock helper.
      }
    }
  } finally {
    await closeDatabasePool(pool);
  }
}

if (
  process.argv[1] &&
  ["migrate.ts", "migrate.js"].includes(basename(process.argv[1]))
) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown migration error";
    console.error(`Database command failed: ${message}`);
    process.exitCode = 1;
  });
}
