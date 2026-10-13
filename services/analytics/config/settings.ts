export interface AnalyticsConfig {
  environment: string;
  serviceName: string;
  port: number;
  cacheTtlMs: number;
}

export function loadAnalyticsConfig(): AnalyticsConfig {
  return {
    environment: process.env.NODE_ENV ?? "development",
    serviceName: process.env.ANALYTICS_SERVICE_NAME ?? "modelnow-analytics",
    port: Number(process.env.ANALYTICS_PORT ?? 4020),
    cacheTtlMs: Number(process.env.ANALYTICS_CACHE_TTL_MS ?? 60000),
  };
}
