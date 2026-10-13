export interface GatewayRequest {
  id: string;
  method: string;
  path: string;
  headers: Record<string, string>;
  body?: unknown;
}

export interface GatewayContext {
  request: GatewayRequest;
  startedAt: number;
  metadata: Record<string, unknown>;
}

export type RequestHandler = (
  context: GatewayContext,
) => Promise<GatewayResponse> | GatewayResponse;

export interface GatewayResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
}
