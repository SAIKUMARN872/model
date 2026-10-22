import { isChatRuntimeAvailable } from "../controllers/chat.controller.js";
import {
  getDatabaseHealthStatus,
  getRedisHealthStatus,
  getRuntimeHealthStatus,
  type DatabaseHealthStatus,
  type RedisHealthStatus,
  type RuntimeHealthStatus,
} from "./health.service.js";

export interface ReadinessStatus {
  readonly success: boolean;
  readonly status: "ready" | "not_ready";
  readonly timestamp: string;
  readonly checks: {
    readonly api: "ready";
    readonly runtime: RuntimeHealthStatus;
    readonly chatAvailable: boolean;
    readonly redis: RedisHealthStatus;
    readonly database: DatabaseHealthStatus;
  };
}

export async function getReadinessStatus(): Promise<ReadinessStatus> {
  const runtime = getRuntimeHealthStatus();
  const redis = getRedisHealthStatus();
  const database = await getDatabaseHealthStatus();
  const chatAvailable = isChatRuntimeAvailable();

  const ready = chatAvailable &&
    runtime === "connected" &&
    redis !== "not_connected" &&
    database !== "not_connected";

  return {
    success: ready,
    status: ready ? "ready" : "not_ready",
    timestamp: new Date().toISOString(),
    checks: {
      api: "ready",
      runtime,
      chatAvailable,
      redis,
      database,
    },
  };
}