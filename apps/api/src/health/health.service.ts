import { isRedisReady } from "../cache/redis.client.js";
import { settings } from "../config/settings.js";
import { isDatabaseConnectionReady } from "../database/runtime.js";
import { isChatRuntimeAvailable } from "../controllers/chat.controller.js";

export type RedisHealthStatus = "ready" | "not_connected" | "not_required";
export type DatabaseHealthStatus = "ready" | "not_connected" | "not_required";
export type RuntimeHealthStatus = "connected" | "not_connected";

export interface HealthStatus {
  readonly success: true;
  readonly service: "modelnow-api";
  readonly status: "healthy" | "degraded";
  readonly timestamp: string;
  readonly runtime: {
    readonly status: RuntimeHealthStatus;
    readonly chatAvailable: boolean;
  };
  readonly dependencies: {
    readonly redis: RedisHealthStatus;
    readonly database: DatabaseHealthStatus;
  };
}

export function getRedisHealthStatus(): RedisHealthStatus {
  if (!settings.isProduction) return "not_required";
  return isRedisReady() ? "ready" : "not_connected";
}

export async function getDatabaseHealthStatus(): Promise<DatabaseHealthStatus> {
  if (!settings.isProduction) return "not_required";
  return await isDatabaseConnectionReady() ? "ready" : "not_connected";
}

export function getRuntimeHealthStatus(): RuntimeHealthStatus {
  return isChatRuntimeAvailable() ? "connected" : "not_connected";
}

export async function getHealthStatus(): Promise<HealthStatus> {
  const runtimeStatus = getRuntimeHealthStatus();
  const redisStatus = getRedisHealthStatus();
  const databaseStatus = await getDatabaseHealthStatus();

  return {
    success: true,
    service: "modelnow-api",
    status:
      runtimeStatus === "connected" &&
      redisStatus !== "not_connected" &&
      databaseStatus !== "not_connected"
        ? "healthy"
        : "degraded",
    timestamp: new Date().toISOString(),
    runtime: {
      status: runtimeStatus,
      chatAvailable: runtimeStatus === "connected",
    },
    dependencies: {
      redis: redisStatus,
      database: databaseStatus,
    },
  };
}