"use client";

import {
  PERMISSIONS,
  ROLES,
} from "./permissions";

/**
 * Enterprise Route Registry
 *
 * Responsibilities:
 * - Centralize application routes
 * - Define route metadata
 * - Define required permissions
 * - Define navigation visibility
 * - Support role-based navigation
 * - Provide route helper functions
 *
 * Route structure:
 *
 * {
 *   path,
 *   name,
 *   label,
 *   description,
 *   icon,
 *   permission,
 *   permissions,
 *   roles,
 *   navigation,
 *   category
 * }
 */

/**
 * Route categories.
 */
export const ROUTE_CATEGORIES =
  Object.freeze({
    CORE: "core",
    AI: "ai",
    OBSERVABILITY:
      "observability",
    FINANCE: "finance",
    SECURITY: "security",
    ADMINISTRATION:
      "administration",
    SYSTEM: "system",
  });

/**
 * Route paths.
 *
 * Always use these constants instead
 * of hard-coded paths throughout
 * the application.
 */
export const ROUTES =
  Object.freeze({
    /**
     * Public / Authentication
     */
    ROOT: "/",

    LOGIN: "/login",

    LOGOUT: "/logout",

    /**
     * Core
     */
    DASHBOARD: "/dashboard",

    /**
     * AI Platform
     */
    MODELS: "/models",

    PLAYGROUND: "/playground",

    PROMPTS: "/prompts",

    AGENTS: "/agents",

    /**
     * Security
     */
    API_KEYS: "/api-keys",

    /**
     * Finance
     */
    BILLING: "/billing",

    /**
     * Observability
     */
    USAGE: "/usage",

    LOGS: "/logs",

    /**
     * Administration
     */
    SETTINGS: "/settings",

    TEAMS: "/teams",

    USERS: "/users",

    ROLES: "/roles",

    /**
     * Governance
     */
    GOVERNANCE: "/governance",

    /**
     * Security Administration
     */
    SECURITY: "/security",

    /**
     * Analytics
     */
    ANALYTICS: "/analytics",

    /**
     * Integrations
     */
    INTEGRATIONS:
      "/integrations",

    /**
     * Error routes
     */
    UNAUTHORIZED:
      "/unauthorized",

    FORBIDDEN:
      "/forbidden",

    NOT_FOUND:
      "/404",

    ERROR: "/error",
  });

/**
 * Route names.
 */
export const ROUTE_NAMES =
  Object.freeze({
    DASHBOARD: "dashboard",

    MODELS: "models",

    PLAYGROUND:
      "playground",

    PROMPTS: "prompts",

    AGENTS: "agents",

    API_KEYS:
      "api_keys",

    BILLING:
      "billing",

    USAGE:
      "usage",

    LOGS:
      "logs",

    SETTINGS:
      "settings",

    TEAMS:
      "teams",

    USERS:
      "users",

    ROLES:
      "roles",

    GOVERNANCE:
      "governance",

    SECURITY:
      "security",

    ANALYTICS:
      "analytics",

    INTEGRATIONS:
      "integrations",
  });

/**
 * Central route registry.
 */
export const ROUTE_CONFIG =
  Object.freeze({
    DASHBOARD: {
      name:
        ROUTE_NAMES.DASHBOARD,

      path:
        ROUTES.DASHBOARD,

      label:
        "Dashboard",

      description:
        "Monitor platform activity and AI workload performance.",

      category:
        ROUTE_CATEGORIES.CORE,

      permission:
        PERMISSIONS.DASHBOARD_READ,

      navigation: true,

      icon:
        "dashboard",
    },

    MODELS: {
      name:
        ROUTE_NAMES.MODELS,

      path:
        ROUTES.MODELS,

      label:
        "Models",

      description:
        "Manage and explore available AI models.",

      category:
        ROUTE_CATEGORIES.AI,

      permission:
        PERMISSIONS.MODELS_READ,

      navigation: true,

      icon:
        "models",
    },

    PLAYGROUND: {
      name:
        ROUTE_NAMES.PLAYGROUND,

      path:
        ROUTES.PLAYGROUND,

      label:
        "Playground",

      description:
        "Experiment with AI models and prompts.",

      category:
        ROUTE_CATEGORIES.AI,

      permissions: [
        PERMISSIONS.PLAYGROUND_READ,
        PERMISSIONS.PLAYGROUND_EXECUTE,
      ],

      navigation: true,

      icon:
        "playground",
    },

    PROMPTS: {
      name:
        ROUTE_NAMES.PROMPTS,

      path:
        ROUTES.PROMPTS,

      label:
        "Prompts",

      description:
        "Create, manage, and version AI prompts.",

      category:
        ROUTE_CATEGORIES.AI,

      permission:
        PERMISSIONS.PROMPTS_READ,

      navigation: true,

      icon:
        "prompts",
    },

    AGENTS: {
      name:
        ROUTE_NAMES.AGENTS,

      path:
        ROUTES.AGENTS,

      label:
        "Agents",

      description:
        "Build and manage autonomous AI agents.",

      category:
        ROUTE_CATEGORIES.AI,

      permission:
        PERMISSIONS.AGENTS_READ,

      navigation: true,

      icon:
        "agents",
    },

    API_KEYS: {
      name:
        ROUTE_NAMES.API_KEYS,

      path:
        ROUTES.API_KEYS,

      label:
        "API Keys",

      description:
        "Manage API credentials and access keys.",

      category:
        ROUTE_CATEGORIES.SECURITY,

      permission:
        PERMISSIONS.API_KEYS_READ,

      navigation: true,

      icon:
        "key",
    },

    BILLING: {
      name:
        ROUTE_NAMES.BILLING,

      path:
        ROUTES.BILLING,

      label:
        "Billing",

      description:
        "Manage billing, invoices, and account costs.",

      category:
        ROUTE_CATEGORIES.FINANCE,

      permission:
        PERMISSIONS.BILLING_READ,

      navigation: true,

      icon:
        "billing",
    },

    USAGE: {
      name:
        ROUTE_NAMES.USAGE,

      path:
        ROUTES.USAGE,

      label:
        "Usage",

      description:
        "Monitor tokens, requests, and resource consumption.",

      category:
        ROUTE_CATEGORIES.OBSERVABILITY,

      permission:
        PERMISSIONS.USAGE_READ,

      navigation: true,

      icon:
        "usage",
    },

    LOGS: {
      name:
        ROUTE_NAMES.LOGS,

      path:
        ROUTES.LOGS,

      label:
        "Logs",

      description:
        "Inspect application and AI request logs.",

      category:
        ROUTE_CATEGORIES.OBSERVABILITY,

      permission:
        PERMISSIONS.LOGS_READ,

      navigation: true,

      icon:
        "logs",
    },

    ANALYTICS: {
      name:
        ROUTE_NAMES.ANALYTICS,

      path:
        ROUTES.ANALYTICS,

      label:
        "Analytics",

      description:
        "Analyze AI platform performance and business metrics.",

      category:
        ROUTE_CATEGORIES.OBSERVABILITY,

      permission:
        PERMISSIONS.ANALYTICS_READ,

      navigation: true,

      icon:
        "analytics",
    },

    GOVERNANCE: {
      name:
        ROUTE_NAMES.GOVERNANCE,

      path:
        ROUTES.GOVERNANCE,

      label:
        "Governance",

      description:
        "Manage AI policies, approvals, and compliance controls.",

      category:
        ROUTE_CATEGORIES.SECURITY,

      permission:
        PERMISSIONS.GOVERNANCE_READ,

      navigation: true,

      icon:
        "governance",
    },

    SECURITY: {
      name:
        ROUTE_NAMES.SECURITY,

      path:
        ROUTES.SECURITY,

      label:
        "Security",

      description:
        "Monitor security policies and platform controls.",

      category:
        ROUTE_CATEGORIES.SECURITY,

      permission:
        PERMISSIONS.SECURITY_READ,

      navigation: true,

      icon:
        "security",
    },

    TEAMS: {
      name:
        ROUTE_NAMES.TEAMS,

      path:
        ROUTES.TEAMS,

      label:
        "Teams",

      description:
        "Manage team members and organizational access.",

      category:
        ROUTE_CATEGORIES.ADMINISTRATION,

      permission:
        PERMISSIONS.TEAMS_READ,

      navigation: true,

      icon:
        "teams",
    },

    USERS: {
      name:
        ROUTE_NAMES.USERS,

      path:
        ROUTES.USERS,

      label:
        "Users",

      description:
        "Manage users and account access.",

      category:
        ROUTE_CATEGORIES.ADMINISTRATION,

      permission:
        PERMISSIONS.USERS_READ,

      navigation: true,

      icon:
        "users",
    },

    ROLES: {
      name:
        ROUTE_NAMES.ROLES,

      path:
        ROUTES.ROLES,

      label:
        "Roles",

      description:
        "Manage roles and permission assignments.",

      category:
        ROUTE_CATEGORIES.ADMINISTRATION,

      permission:
        PERMISSIONS.ROLES_READ,

      navigation: true,

      icon:
        "roles",
    },

    SETTINGS: {
      name:
        ROUTE_NAMES.SETTINGS,

      path:
        ROUTES.SETTINGS,

      label:
        "Settings",

      description:
        "Manage personal and application settings.",

      category:
        ROUTE_CATEGORIES.SYSTEM,

      permission:
        PERMISSIONS.SETTINGS_READ,

      navigation: true,

      icon:
        "settings",
    },

    INTEGRATIONS: {
      name:
        ROUTE_NAMES.INTEGRATIONS,

      path:
        ROUTES.INTEGRATIONS,

      label:
        "Integrations",

      description:
        "Connect external services and enterprise systems.",

      category:
        ROUTE_CATEGORIES.SYSTEM,

      permission:
        PERMISSIONS.INTEGRATIONS_READ,

      navigation: true,

      icon:
        "integrations",
    },
  });

/**
 * Public routes that do not require
 * authentication.
 */
export const PUBLIC_ROUTES =
  Object.freeze([
    ROUTES.ROOT,
    ROUTES.LOGIN,
    ROUTES.LOGOUT,
    ROUTES.UNAUTHORIZED,
    ROUTES.FORBIDDEN,
    ROUTES.NOT_FOUND,
    ROUTES.ERROR,
  ]);

/**
 * Protected routes.
 */
export const PROTECTED_ROUTES =
  Object.freeze(
    Object.values(
      ROUTE_CONFIG
    ).map(
      (route) =>
        route.path
    )
  );

/**
 * Check whether a route is public.
 */
export const isPublicRoute = (
  pathname
) => {
  if (!pathname) {
    return false;
  }

  return PUBLIC_ROUTES.includes(
    pathname
  );
};

/**
 * Check whether a route is protected.
 */
export const isProtectedRoute =
  (
    pathname
  ) => {
    if (!pathname) {
      return false;
    }

    return PROTECTED_ROUTES.includes(
      pathname
    );
  };

/**
 * Get route configuration
 * by route name.
 */
export const getRouteByName =
  (
    routeName
  ) => {
    if (!routeName) {
      return null;
    }

    return (
      Object.values(
        ROUTE_CONFIG
      ).find(
        (route) =>
          route.name ===
          routeName
      ) || null
    );
  };

/**
 * Get route configuration
 * by pathname.
 */
export const getRouteByPath =
  (
    pathname
  ) => {
    if (!pathname) {
      return null;
    }

    return (
      Object.values(
        ROUTE_CONFIG
      ).find(
        (route) =>
          route.path ===
          pathname
      ) || null
    );
  };

/**
 * Get all navigation routes.
 */
export const getNavigationRoutes =
  () => {
    return Object.values(
      ROUTE_CONFIG
    ).filter(
      (route) =>
        route.navigation ===
        true
    );
  };

/**
 * Get routes by category.
 */
export const getRoutesByCategory =
  (
    category
  ) => {
    if (!category) {
      return [];
    }

    return Object.values(
      ROUTE_CONFIG
    ).filter(
      (route) =>
        route.category ===
        category
    );
  };

/**
 * Check whether a route requires
 * a specific permission.
 */
export const routeRequiresPermission =
  (
    pathname,
    permission
  ) => {
    const route =
      getRouteByPath(
        pathname
      );

    if (!route) {
      return false;
    }

    if (
      route.permission ===
      permission
    ) {
      return true;
    }

    return (
      Array.isArray(
        route.permissions
      ) &&
      route.permissions.includes(
        permission
      )
    );
  };

/**
 * Build a route with parameters.
 *
 * Example:
 *
 * buildRoute(
 *   "/models/:modelId",
 *   { modelId: "gpt-4o" }
 * )
 *
 * Returns:
 *
 * "/models/gpt-4o"
 */
export const buildRoute = (
  path,
  params = {}
) => {
  if (!path) {
    return "";
  }

  return path.replace(
    /:([a-zA-Z0-9_]+)/g,
    (
      _match,
      key
    ) => {
      const value =
        params[key];

      if (
        value ===
        undefined
      ) {
        return `:${key}`;
      }

      return encodeURIComponent(
        String(value)
      );
    }
  );
};

/**
 * Get navigation routes available
 * to a user.
 *
 * This function checks the user's
 * permissions before returning
 * navigation items.
 */
export const getAuthorizedNavigationRoutes =
  (
    user,
    hasPermission
  ) => {
    const navigationRoutes =
      getNavigationRoutes();

    if (
      typeof hasPermission !==
      "function"
    ) {
      return [];
    }

    return navigationRoutes.filter(
      (route) => {
        if (
          route.permission &&
          hasPermission(
            user,
            route.permission
          )
        ) {
          return true;
        }

        if (
          Array.isArray(
            route.permissions
          )
        ) {
          return route.permissions.some(
            (permission) =>
              hasPermission(
                user,
                permission
              )
          );
        }

        return false;
      }
    );
  };

/**
 * Default export.
 */
export default {
  ROUTES,
  ROUTE_NAMES,
  ROUTE_CATEGORIES,
  ROUTE_CONFIG,
  PUBLIC_ROUTES,
  PROTECTED_ROUTES,
  isPublicRoute,
  isProtectedRoute,
  getRouteByName,
  getRouteByPath,
  getNavigationRoutes,
  getRoutesByCategory,
  routeRequiresPermission,
  buildRoute,
  getAuthorizedNavigationRoutes,
};