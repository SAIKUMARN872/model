export interface GatewaySettings {
  requestTimeoutMs: number;
  maxBodySize: number;
  enableCors: boolean;
  enableLogging: boolean;
}

export function loadSettings(): GatewaySettings {
  return {
    requestTimeoutMs: Number(
      process.env.API_GATEWAY_REQUEST_TIMEOUT_MS ?? 30000,
    ),
    maxBodySize: Number(
      process.env.API_GATEWAY_MAX_BODY_SIZE ?? 10485760,
    ),
    enableCors:
      process.env.API_GATEWAY_CORS !== "false",
    enableLogging:
      process.env.API_GATEWAY_LOGGING !== "false",
  };
}
