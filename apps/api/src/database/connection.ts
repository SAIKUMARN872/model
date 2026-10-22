import type { Pool } from "pg";

export async function verifyDatabaseConnection(pool: Pool): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query("SELECT 1");
  } finally {
    client.release();
  }
}

export async function isDatabaseReady(pool: Pool): Promise<boolean> {
  try {
    await verifyDatabaseConnection(pool);
    return true;
  } catch {
    return false;
  }
}
