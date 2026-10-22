import { Pool } from "pg";
import type { DatabaseConfig } from "./config.js";

export function createDatabasePool(config: DatabaseConfig): Pool {
  return new Pool({
    connectionString: config.connectionString,
    max: config.maxConnections,
    idleTimeoutMillis: config.idleTimeoutMillis,
    connectionTimeoutMillis: config.connectionTimeoutMillis,
    ssl: config.ssl ? { rejectUnauthorized: true } : false,
    application_name: "modelnow-api",
    allowExitOnIdle: false,
  });
}

export async function closeDatabasePool(pool: Pool): Promise<void> {
  await pool.end();
}
