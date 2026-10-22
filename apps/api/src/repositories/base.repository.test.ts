import assert from "node:assert/strict";
import test from "node:test";
import type {
  QueryResult,
  QueryResultRow,
} from "pg";
import {
  BaseRepository,
  type QueryExecutor,
} from "./base.repository.js";

interface TestRow extends QueryResultRow {
  readonly id: number;
  readonly name: string;
}

class TestRepository extends BaseRepository {
  public constructor(executor: QueryExecutor) {
    super(executor);
  }

  public findRows(sql: string, values: unknown[] = []) {
    return this.query<TestRow>(sql, values);
  }

  public findOne(sql: string, values: unknown[] = []) {
    return this.queryOne<TestRow>(sql, values);
  }

  public run(sql: string, values: unknown[] = []) {
    return this.execute(sql, values);
  }
}

function createResult<R extends QueryResultRow>(
  rows: R[],
  rowCount: number | null = rows.length,
): QueryResult<R> {
  return {
    command: "SELECT",
    rowCount,
    oid: 0,
    rows,
    fields: [],
  };
}

test("forwards SQL and parameter values to the query executor", async () => {
  let receivedSql = "";
  let receivedValues: unknown[] | undefined;

  const executor: QueryExecutor = {
    async query<R extends QueryResultRow>(
      sql: string,
      values?: unknown[],
    ): Promise<QueryResult<R>> {
      receivedSql = sql;
      receivedValues = values;
      return createResult<R>([]);
    },
  };

  const repository = new TestRepository(executor);
  await repository.findRows(
    "SELECT id, name FROM users WHERE id = $1",
    [42],
  );

  assert.equal(
    receivedSql,
    "SELECT id, name FROM users WHERE id = $1",
  );
  assert.deepEqual(receivedValues, [42]);
});

test("returns the first row from a single-row query", async () => {
  const expected: TestRow = { id: 7, name: "Ada" };

  const executor: QueryExecutor = {
    async query<R extends QueryResultRow>(): Promise<QueryResult<R>> {
      return createResult<R>([expected as unknown as R]);
    },
  };

  const repository = new TestRepository(executor);

  assert.deepEqual(
    await repository.findOne(
      "SELECT id, name FROM users WHERE id = $1 LIMIT 1",
      [7],
    ),
    expected,
  );
});

test("returns null when a single-row query has no results", async () => {
  const executor: QueryExecutor = {
    async query<R extends QueryResultRow>(): Promise<QueryResult<R>> {
      return createResult<R>([]);
    },
  };

  const repository = new TestRepository(executor);

  assert.equal(
    await repository.findOne(
      "SELECT id, name FROM users WHERE id = $1 LIMIT 1",
      [999],
    ),
    null,
  );
});

test("returns the database affected-row count", async () => {
  const executor: QueryExecutor = {
    async query<R extends QueryResultRow>(): Promise<QueryResult<R>> {
      return createResult<R>([], 3);
    },
  };

  const repository = new TestRepository(executor);

  assert.equal(
    await repository.run(
      "UPDATE users SET active = $1 WHERE tenant_id = $2",
      [false, "tenant-1"],
    ),
    3,
  );
});

test("uses returned rows when the driver reports a null row count", async () => {
  const executor: QueryExecutor = {
    async query<R extends QueryResultRow>(): Promise<QueryResult<R>> {
      return createResult<R>(
        [{ id: 1, name: "Ada" } as unknown as R],
        null,
      );
    },
  };

  const repository = new TestRepository(executor);

  assert.equal(
    await repository.run("SELECT id, name FROM users"),
    1,
  );
});

test("rejects empty SQL before calling the executor", async () => {
  let called = false;

  const executor: QueryExecutor = {
    async query<R extends QueryResultRow>(): Promise<QueryResult<R>> {
      called = true;
      return createResult<R>([]);
    },
  };

  const repository = new TestRepository(executor);

  await assert.rejects(
    repository.findRows("   "),
    /non-empty string/,
  );

  assert.equal(called, false);
});

test("preserves database errors", async () => {
  const expectedError = new Error("database unavailable");

  const executor: QueryExecutor = {
    async query<R extends QueryResultRow>(): Promise<QueryResult<R>> {
      throw expectedError;
    },
  };

  const repository = new TestRepository(executor);

  await assert.rejects(
    repository.findRows("SELECT id FROM users"),
    (error: unknown) => error === expectedError,
  );
});
