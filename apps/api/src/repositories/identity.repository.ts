import type { QueryResultRow } from "pg";
import {
  BaseRepository,
  type QueryExecutor,
} from "./base.repository.js";

export interface ActiveIdentity extends QueryResultRow {
  readonly userId: string;
  readonly authSubject: string;
}

export class IdentityRepository extends BaseRepository {
  public constructor(executor: QueryExecutor) {
    super(executor);
  }

  public async findActiveByAuthSubject(
    authSubject: string,
  ): Promise<ActiveIdentity | null> {
    if (typeof authSubject !== "string" || authSubject.trim().length === 0) {
      throw new TypeError("authSubject must be a non-empty string.");
    }

    return this.queryOne<ActiveIdentity>(
      `SELECT id::text AS "userId", auth_subject AS "authSubject"
       FROM users
       WHERE auth_subject = $1
         AND status = 'active'
       LIMIT 1`,
      [authSubject],
    );
  }
  public async findActiveByUserId(
    userId: string,
  ): Promise<ActiveIdentity | null> {
    if (typeof userId !== "string" || userId.trim().length === 0) {
      throw new TypeError("userId must be a non-empty string.");
    }

    return this.queryOne<ActiveIdentity>(
      `SELECT id::text AS "userId", auth_subject AS "authSubject"
       FROM users
       WHERE id = $1::uuid
         AND status = 'active'
       LIMIT 1`,
      [userId],
    );
  }
}