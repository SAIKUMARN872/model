/**
 * Enterprise Configuration Entry Point
 *
 * Centralized configuration barrel.
 *
 * Responsibilities:
 * - Expose environment configuration
 * - Expose feature flags
 * - Provide a single import location
 * - Keep configuration access consistent
 */

/* =========================================================
   Environment Configuration
========================================================= */

export {
  NODE_ENV,

  API_BASE_URL,

  API_TIMEOUT,

  APP_NAME,

  APP_VERSION,

  APP_URL,

  AUTH_TOKEN_KEY,

  REFRESH_TOKEN_KEY,

  isDevelopment,

  isProduction,

  isStaging,

  isTest,
} from "./environment";

/* =========================================================
   Default Environment Configuration
========================================================= */

export {
  default as environment,
} from "./environment";

/* =========================================================
   Feature Flags
========================================================= */

export {
  FEATURE_FLAGS,

  FEATURE_GROUPS,

  FEATURE_METADATA,

  isFeatureEnabled,

  areFeaturesEnabled,

  isAnyFeatureEnabled,

  getFeatureGroup,

  getEnabledFeatures,
} from "./features";

/* =========================================================
   Default Feature Flags
========================================================= */

export {
  default as features,
} from "./features";

/* =========================================================
   Unified Configuration Object
========================================================= */

import environment from "./environment";

import features from "./features";

const config = Object.freeze({
  environment,

  features,
});

export default config;