import { environment } from "./environment.js";

export const settings = Object.freeze({
  serviceName: "ModelNow API",
  apiVersion: "v1",
  environment: environment.NODE_ENV,
  isProduction: environment.NODE_ENV === "production",
  isDevelopment: environment.NODE_ENV === "development",

  server: Object.freeze({
    host: environment.HOST,
    port: environment.PORT,
    requestTimeoutMs: environment.REQUEST_TIMEOUT_MS,
    bodyLimit: environment.BODY_LIMIT,
    trustProxy: environment.TRUST_PROXY,
  }),

  logging: Object.freeze({
    level: environment.LOG_LEVEL,
  }),

  rateLimit: Object.freeze({
    maxRequests: environment.RATE_LIMIT_MAX_REQUESTS,
    windowMs: environment.RATE_LIMIT_WINDOW_MS,
    maxKeys: environment.RATE_LIMIT_MAX_KEYS,
  }),

  security: Object.freeze({
    corsOrigins: Object.freeze([...environment.CORS_ORIGINS]),
  }),
});

export type RuntimeSettings = typeof settings;
