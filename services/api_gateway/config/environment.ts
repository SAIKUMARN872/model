export interface GatewayEnvironment {
  nodeEnv: string;
  host: string;
  port: number;
  jwtSecret: string;
}

export function loadEnvironment(): GatewayEnvironment {
  return {
    nodeEnv: process.env.NODE_ENV ?? "development",
    host: process.env.API_GATEWAY_HOST ?? "0.0.0.0",
    port: Number(process.env.API_GATEWAY_PORT ?? 4000),
    jwtSecret:
      process.env.API_GATEWAY_JWT_SECRET ??
      "modelnow-development-secret",
  };
}
