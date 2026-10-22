export interface ApiSuccessResponse<T> {
  readonly data: T;
  readonly requestId?: string;
}

export interface ApiPaginatedResponse<T> {
  readonly data: readonly T[];
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total?: number;
    readonly hasNextPage: boolean;
  };
  readonly requestId?: string;
}

export interface ApiCursorResponse<T> {
  readonly data: readonly T[];
  readonly pagination: {
    readonly nextCursor?: string;
    readonly hasMore: boolean;
  };
  readonly requestId?: string;
}

export interface ApiErrorIssue {
  readonly path: readonly (string | number)[];
  readonly code: string;
  readonly message: string;
}

export interface ApiErrorDetail {
  readonly code: string;
  readonly message: string;
  readonly issues?: readonly ApiErrorIssue[];
  readonly details?: unknown;
}

export interface ApiErrorResponse {
  readonly success: false;
  readonly error: ApiErrorDetail;
  readonly requestId?: string;
}

export type ApiResponse<T> =
  | ApiSuccessResponse<T>
  | ApiErrorResponse;
