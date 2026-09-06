"use client";

/**
 * Enterprise Configuration Entry Point
 *
 * Centralizes all application configuration exports.
 *
 * Usage:
 *
 * import config from "../config";
 *
 * or:
 *
 * import {
 *   environment,
 *   apiBaseUrl,
 *   features,
 * } from "../config";
 */

/**
 * Environment configuration.
 */
export {
  default as environment,
  apiBaseUrl,
  appEnvironment,
  nodeEnvironment,
  isProduction,
  isDevelopment,
  isStaging,
  authConfig,
  httpConfig,
  features,
  observability,
  security,
  validateEnvironment,
  isFeatureEnabled,
} from "./environment";

/**
 * Default configuration export.
 *
 * This provides a single object that can
 * be imported throughout the application.
 */
import environment from "./environment";

export default environment;