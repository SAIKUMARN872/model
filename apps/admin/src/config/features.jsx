/**
 * Enterprise Feature Flag Configuration
 *
 * Centralized feature management for the Admin Console.
 *
 * Responsibilities:
 * - Enable / disable application modules
 * - Support environment-based feature flags
 * - Provide safe defaults
 * - Allow controlled rollout of new functionality
 * - Keep feature configuration separate from UI code
 */

/* =========================================================
   Environment Variables
========================================================= */

const env =
  typeof import.meta !== "undefined" &&
  import.meta.env
    ? import.meta.env
    : {};

/* =========================================================
   Boolean Parser
========================================================= */

const parseBoolean = (
  value,
  defaultValue = false
) => {
  if (
    value === undefined ||
    value === null
  ) {
    return defaultValue;
  }

  if (
    typeof value ===
    "boolean"
  ) {
    return value;
  }

  return [
    "true",
    "1",
    "yes",
    "on",
    "enabled",
  ].includes(
    String(value)
      .toLowerCase()
      .trim()
  );
};

/* =========================================================
   Feature Flag Definitions
========================================================= */

const FEATURE_FLAGS = Object.freeze({
  /* -------------------------------------------------------
     Core Platform
  ------------------------------------------------------- */

  ADMIN_DASHBOARD: parseBoolean(
    env.VITE_FEATURE_ADMIN_DASHBOARD,
    true
  ),

  ORGANIZATIONS: parseBoolean(
    env.VITE_FEATURE_ORGANIZATIONS,
    true
  ),

  USERS: parseBoolean(
    env.VITE_FEATURE_USERS,
    true
  ),

  WORKSPACES: parseBoolean(
    env.VITE_FEATURE_WORKSPACES,
    true
  ),

  TEAMS: parseBoolean(
    env.VITE_FEATURE_TEAMS,
    true
  ),

  /* -------------------------------------------------------
     AI & Agents
  ------------------------------------------------------- */

  AGENTS: parseBoolean(
    env.VITE_FEATURE_AGENTS,
    true
  ),

  MODELS: parseBoolean(
    env.VITE_FEATURE_MODELS,
    true
  ),

  PROMPTS: parseBoolean(
    env.VITE_FEATURE_PROMPTS,
    true
  ),

  KNOWLEDGE: parseBoolean(
    env.VITE_FEATURE_KNOWLEDGE,
    true
  ),

  INTEGRATIONS: parseBoolean(
    env.VITE_FEATURE_INTEGRATIONS,
    true
  ),

  /* -------------------------------------------------------
     Analytics & Observability
  ------------------------------------------------------- */

  ANALYTICS: parseBoolean(
    env.VITE_FEATURE_ANALYTICS,
    true
  ),

  ANALYTICS_ENGINE: parseBoolean(
    env.VITE_FEATURE_ANALYTICS_ENGINE,
    true
  ),

  MONITORING: parseBoolean(
    env.VITE_FEATURE_MONITORING,
    true
  ),

  OBSERVABILITY: parseBoolean(
    env.VITE_FEATURE_OBSERVABILITY,
    true
  ),

  REPORTS: parseBoolean(
    env.VITE_FEATURE_REPORTS,
    true
  ),

  /* -------------------------------------------------------
     Security & Governance
  ------------------------------------------------------- */

  SECURITY: parseBoolean(
    env.VITE_FEATURE_SECURITY,
    true
  ),

  AUDIT: parseBoolean(
    env.VITE_FEATURE_AUDIT,
    true
  ),

  AUDIT_LOGS: parseBoolean(
    env.VITE_FEATURE_AUDIT_LOGS,
    true
  ),

  COMPLIANCE: parseBoolean(
    env.VITE_FEATURE_COMPLIANCE,
    true
  ),

  GOVERNANCE: parseBoolean(
    env.VITE_FEATURE_GOVERNANCE,
    true
  ),

  PERMISSIONS: parseBoolean(
    env.VITE_FEATURE_PERMISSIONS,
    true
  ),

  ROLES: parseBoolean(
    env.VITE_FEATURE_ROLES,
    true
  ),

  /* -------------------------------------------------------
     Billing & Cost
  ------------------------------------------------------- */

  BILLING: parseBoolean(
    env.VITE_FEATURE_BILLING,
    true
  ),

  COST_ENGINE: parseBoolean(
    env.VITE_FEATURE_COST_ENGINE,
    true
  ),

  USAGE: parseBoolean(
    env.VITE_FEATURE_USAGE,
    true
  ),

  API_KEYS: parseBoolean(
    env.VITE_FEATURE_API_KEYS,
    true
  ),

  /* -------------------------------------------------------
     Notifications & Settings
  ------------------------------------------------------- */

  NOTIFICATIONS: parseBoolean(
    env.VITE_FEATURE_NOTIFICATIONS,
    true
  ),

  SETTINGS: parseBoolean(
    env.VITE_FEATURE_SETTINGS,
    true
  ),

  /* -------------------------------------------------------
     Experimental Features
  ------------------------------------------------------- */

  EXPERIMENTAL_AI: parseBoolean(
    env.VITE_FEATURE_EXPERIMENTAL_AI,
    false
  ),

  ADVANCED_ANALYTICS: parseBoolean(
    env.VITE_FEATURE_ADVANCED_ANALYTICS,
    false
  ),

  BETA_FEATURES: parseBoolean(
    env.VITE_FEATURE_BETA_FEATURES,
    false
  ),
});

/* =========================================================
   Feature Groups
========================================================= */

const FEATURE_GROUPS =
  Object.freeze({
    core: [
      "ADMIN_DASHBOARD",
      "ORGANIZATIONS",
      "USERS",
      "WORKSPACES",
      "TEAMS",
    ],

    ai: [
      "AGENTS",
      "MODELS",
      "PROMPTS",
      "KNOWLEDGE",
      "INTEGRATIONS",
    ],

    analytics: [
      "ANALYTICS",
      "ANALYTICS_ENGINE",
      "MONITORING",
      "OBSERVABILITY",
      "REPORTS",
    ],

    security: [
      "SECURITY",
      "AUDIT",
      "AUDIT_LOGS",
      "COMPLIANCE",
      "GOVERNANCE",
      "PERMISSIONS",
      "ROLES",
    ],

    billing: [
      "BILLING",
      "COST_ENGINE",
      "USAGE",
      "API_KEYS",
    ],

    system: [
      "NOTIFICATIONS",
      "SETTINGS",
    ],

    experimental: [
      "EXPERIMENTAL_AI",
      "ADVANCED_ANALYTICS",
      "BETA_FEATURES",
    ],
  });

/* =========================================================
   Feature Flag API
========================================================= */

const isFeatureEnabled = (
  feature
) => {
  if (
    !feature ||
    typeof feature !==
      "string"
  ) {
    return false;
  }

  return Boolean(
    FEATURE_FLAGS[
      feature
    ]
  );
};

const areFeaturesEnabled = (
  features = []
) => {
  if (
    !Array.isArray(features)
  ) {
    return false;
  }

  return features.every(
    (feature) =>
      isFeatureEnabled(
        feature
      )
  );
};

const isAnyFeatureEnabled = (
  features = []
) => {
  if (
    !Array.isArray(features)
  ) {
    return false;
  }

  return features.some(
    (feature) =>
      isFeatureEnabled(
        feature
      )
  );
};

const getFeatureGroup = (
  group
) => {
  if (
    !group ||
    !FEATURE_GROUPS[
      group
    ]
  ) {
    return [];
  }

  return FEATURE_GROUPS[
    group
  ];
};

const getEnabledFeatures = (
  group
) => {
  const features =
    getFeatureGroup(
      group
    );

  return features.filter(
    (feature) =>
      isFeatureEnabled(
        feature
      )
  );
};

/* =========================================================
   Feature Metadata
========================================================= */

const FEATURE_METADATA =
  Object.freeze({
    ADMIN_DASHBOARD: {
      name: "Admin Dashboard",
      description:
        "Main administrative dashboard",
      group: "core",
    },

    ORGANIZATIONS: {
      name: "Organizations",
      description:
        "Organization management",
      group: "core",
    },

    USERS: {
      name: "Users",
      description:
        "User administration",
      group: "core",
    },

    AGENTS: {
      name: "AI Agents",
      description:
        "AI agent management",
      group: "ai",
    },

    ANALYTICS: {
      name: "Analytics",
      description:
        "Platform analytics",
      group: "analytics",
    },

    AUDIT_LOGS: {
      name: "Audit Logs",
      description:
        "Security and compliance audit logs",
      group: "security",
    },

    BILLING: {
      name: "Billing",
      description:
        "Subscription and billing management",
      group: "billing",
    },

    SECURITY: {
      name: "Security",
      description:
        "Security administration",
      group: "security",
    },

    EXPERIMENTAL_AI: {
      name: "Experimental AI",
      description:
        "Experimental AI capabilities",
      group: "experimental",
    },
  });

/* =========================================================
   Exports
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
};

export default FEATURE_FLAGS;