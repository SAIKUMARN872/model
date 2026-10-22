import assert from "node:assert/strict";
import test from "node:test";
import type { Pool, PoolClient } from "pg";
import {
  hasDatabasePool,
  isDatabaseConnectionReady,
  setDatabasePool,
} from "./runtime.js";

function makePool(onConnect: () => void = () => {}): Pool {
  const client = {
    query: async () => ({ rows: [{ "?column?": 1 }], rowCount: 1 }),
    release: () => {},
  };

  return {
    connect: async () => {
      onConnect();
      return client;
    },
  } as unknown as Pool;
}

test("reports not ready when no database pool is configured", async () => {
  setDatabasePool(undefined);

  try {
    assert.equal(hasDatabasePool(), false);
    assert.equal(await isDatabaseConnectionReady(), false);
  } finally {
    setDatabasePool(undefined);
  }
});

test("reuses the cached readiness result within the cache window", async () => {
  let connections = 0;
  setDatabasePool(makePool(() => { connections += 1; }));

  try {
    assert.equal(await isDatabaseConnectionReady(), true);
    assert.equal(await isDatabaseConnectionReady(), true);
    assert.equal(connections, 1);
  } finally {
    setDatabasePool(undefined);
  }
});

test("deduplicates concurrent readiness checks", async () => {
  let connections = 0;
  let unblockConnection!: () => void;
  const gate = new Promise<void>((resolve) => {
    unblockConnection = resolve;
  });

  const client = {
    query: async () => ({ rows: [{ "?column?": 1 }], rowCount: 1 }),
    release: () => {},
  };

  const pool = {
    connect: async () => {
      connections += 1;
      await gate;
      return client;
    },
  } as unknown as Pool;

  setDatabasePool(pool);

  try {
    const first = isDatabaseConnectionReady();
    const second = isDatabaseConnectionReady();

    unblockConnection();

    assert.deepEqual(await Promise.all([first, second]), [true, true]);
    assert.equal(connections, 1);
  } finally {
    setDatabasePool(undefined);
  }
});

test("rechecks readiness after the database pool is replaced", async () => {
  let firstConnections = 0;
  let secondConnections = 0;

  const firstPool = makePool(() => { firstConnections += 1; });
  const secondPool = makePool(() => { secondConnections += 1; });

  try {
    setDatabasePool(firstPool);
    assert.equal(await isDatabaseConnectionReady(), true);
    assert.equal(firstConnections, 1);

    setDatabasePool(secondPool);
    assert.equal(await isDatabaseConnectionReady(), true);
    assert.equal(secondConnections, 1);
  } finally {
    setDatabasePool(undefined);
  }
});