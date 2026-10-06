import { telemetryService } from "../telemetry/telemetry-service.js";
import { PerformanceService } from "./performance-service.js";

export * from "./performance-types.js";
export * from "./performance-service.js";

export const performanceService = new PerformanceService(() => telemetryService.list());
