export type JsonPrimitive = string | number | boolean | null;

export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonObject = { [key: string]: JsonValue };

export type ApiEnvironment =
  | "development"
  | "test"
  | "staging"
  | "production";

export type ApiHealthStatus =
  | "healthy"
  | "degraded"
  | "unhealthy";

export interface ApiHealthCheck {
  readonly name: string;
  readonly status: ApiHealthStatus;
  readonly durationMs?: number;
  readonly message?: string;
}

export interface ApiHealthReport {
  readonly status: ApiHealthStatus;
  readonly timestamp: string;
  readonly checks: readonly ApiHealthCheck[];
}

export interface ApiRequestMetadata {
  readonly requestId: string;
  readonly receivedAt: string;
}
