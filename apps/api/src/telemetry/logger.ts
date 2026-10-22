import { logger as applicationLogger } from "../config/logging.js";
import type { LogFields } from "../config/logging.js";

export const telemetryLogger = Object.freeze({
  debug(message: string, fields?: LogFields): void {
    applicationLogger.debug(message, fields);
  },
  info(message: string, fields?: LogFields): void {
    applicationLogger.info(message, fields);
  },
  warn(message: string, fields?: LogFields): void {
    applicationLogger.warn(message, fields);
  },
  error(message: string, fields?: LogFields): void {
    applicationLogger.error(message, fields);
  },
});

export type { LogFields };