import type {
  QueryResult,
  QueryResultRow,
} from "pg";

/**
 * Minimal query contract implemented by PostgreSQL pools and transaction
 * clients. Repositories can therefore participate in an existing transaction.
 */
export interface QueryExecutor {
  query<R extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: unknown[],
  ): Promise<QueryResult<R>>;
}

/**
 * Shared PostgreSQL repository primitives.
 *
 * SQL statements must be defined by trusted application code. Pass all
 * external values through the values parameter rather than interpolating
 * them into SQL text.
 */
export abstract class BaseRepository {
  protected constructor(
    protected readonly executor: QueryExecutor,
  ) {}

  protected async query<R extends QueryResultRow = QueryResultRow>(
    sql: string,
    values: unknown[] = [],
  ): Promise<QueryResult<R>> {
    if (typeof sql !== "string" || sql.trim().length === 0) {
      throw new TypeError("Repository SQL must be a non-empty string.");
    }

    if (!Array.isArray(values)) {
      throw new TypeError("Repository query values must be an array.");
    }

    return this.executor.query<R>(sql, values);
  }

  /**
   * Returns the first row, or null when the query produces no rows.
   * Callers should use SQL with an appropriate LIMIT when only one row
   * is needed.
   */
  protected async queryOne<R extends QueryResultRow = QueryResultRow>(
    sql: string,
    values: unknown[] = [],
  ): Promise<R | null> {
    const result = await this.query<R>(sql, values);
    return result.rows[0] ?? null;
  }

  /**
   * Returns the number of rows affected by a statement.
   * Falls back to the returned row count when the driver reports null.
   */
  protected async execute(
    sql: string,
    values: unknown[] = [],
  ): Promise<number> {
    const result = await this.query(sql, values);
    return result.rowCount ?? result.rows.length;
  }
}
