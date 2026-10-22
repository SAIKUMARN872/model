import type { JsonObject } from "./api.types.js";

export interface AuthenticatedPrincipal {
  readonly userId: string;
  readonly tenantId?: string;
  readonly roles: readonly string[];
  readonly scopes: readonly string[];
}

export interface RequestContext {
  readonly requestId: string;
  readonly receivedAt: string;
  readonly principal?: AuthenticatedPrincipal;
  readonly metadata?: Readonly<JsonObject>;
}

export interface PaginationRequest {
  readonly page: number;
  readonly limit: number;
}

export interface CursorPaginationRequest {
  readonly cursor?: string;
  readonly limit: number;
}

export interface IdempotencyMetadata {
  readonly key: string;
}
