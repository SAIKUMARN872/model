import type { Pool } from "pg";
import { isDatabaseReady } from "./connection.js";

const DATABASE_HEALTH_CACHE_MS = 5_000;

let databasePool: Pool | undefined;
let lastCheckedAt = 0;
let lastReady = false;
let checkInFlight: Promise<boolean> | undefined;

export function setDatabasePool(pool: Pool | undefined): void {
  if (databasePool === pool) return;

  databasePool = pool;
  lastCheckedAt = 0;
  lastReady = false;
  checkInFlight = undefined;
}

export function hasDatabasePool(): boolean {
  return databasePool !== undefined;
}

export async function isDatabaseConnectionReady(): Promise<boolean> {
  const pool = databasePool;
  if (!pool) return false;

  if (
    lastCheckedAt > 0 &&
    Date.now() - lastCheckedAt < DATABASE_HEALTH_CACHE_MS
  ) {
    return lastReady;
  }

  if (checkInFlight) return checkInFlight;

  let check: Promise<boolean>;
  check = isDatabaseReady(pool)
    .then((ready) => {
      if (databasePool === pool) {
        lastReady = ready;
        lastCheckedAt = Date.now();
      }
      return ready;
    })
    .finally(() => {
      if (checkInFlight === check) {
        checkInFlight = undefined;
      }
    });

  checkInFlight = check;
  return check;
}