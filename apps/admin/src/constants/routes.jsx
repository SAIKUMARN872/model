/**
 * Enterprise Application Routes
 *
 * Centralized route definitions for the Admin Console.
 *
 * Design goals:
 * - Single source of truth for navigation
 * - No hard-coded route strings across components
 * - Supports RBAC / permission guards
 * - Supports nested routes
 * - Supports dynamic parameters
 * - Supports route metadata
 * - Supports breadcrumbs
 * - Supports navigation visibility
 *
 * IMPORTANT:
 * Frontend route guards improve UX but do NOT replace
 * backend authorization.
 */

/* =========================================================
   Route Paths
========================================================= */

export const ROUTES =
  Object.freeze({
    /* -------------------------------------------------------
       Root
    ------------------------------------------------------- */

    ROOT:
      "/",

    LOGIN:
      "/login",

    UNAUTHORIZED:
      "/unauthorized",

    NOT_FOUND:
      "/404",

    /* -------------------------------------------------------
       Dashboard
    ------------------------------------------------------- */

    DASHBOARD:
      "/dashboard",

    /* -------------------------------------------------------
       Agents
    ------------------------------------------------------- */

    AGENTS:
      "/agents",

    AGENT_DETAILS:
      "/agents/:agentId",

    AGENT_CREATE:
      "/agents/new",

    AGENT_EDIT:
      "/agents/:agentId/edit",

    /* -------------------------------------------------------
       Analytics
    ------------------------------------------------------- */

    ANALYTICS:
      "/analytics",

    ANALYTICS_ENGINE:
      "/analytics-engine",

    /* -------------------------------------------------------
       API Keys
    ------------------------------------------------------- */

    API_KEYS:
      "/api-keys",

    API_KEY_CREATE:
      "/api-keys/new",

    /* -------------------------------------------------------
       Audit
    ------------------------------------------------------- */

    AUDIT:
      "/audit",

    AUDIT_LOGS:
      "/audit-logs",

    AUDIT_LOG_DETAILS:
      "/audit-logs/:logId",

    /* -------------------------------------------------------
       Billing
    ------------------------------------------------------- */

    BILLING:
      "/billing",

    BILLING_SUBSCRIPTION:
      "/billing/subscription",

    BILLING_INVOICES:
      "/billing/invoices",

    BILLING_INVOICE_DETAILS:
      "/billing/invoices/:invoiceId",

    /* -------------------------------------------------------
       Compliance
    ------------------------------------------------------- */

    COMPLIANCE:
      "/compliance",

    COMPLIANCE_CONTROLS:
      "/compliance/controls",

    COMPLIANCE_EVIDENCE:
      "/compliance/evidence",

    /* -------------------------------------------------------
       Cost
    ------------------------------------------------------- */

    COST:
      "/cost",

    COST_ENGINE:
      "/cost-engine",

    /* -------------------------------------------------------
       Governance
    ------------------------------------------------------- */

    GOVERNANCE:
      "/governance",

    /* -------------------------------------------------------
       Organizations
    ------------------------------------------------------- */

    ORGANIZATIONS:
      "/organizations",

    ORGANIZATION_DETAILS:
      "/organizations/:organizationId",

    ORGANIZATION_CREATE:
      "/organizations/new",

    ORGANIZATION_EDIT:
      "/organizations/:organizationId/edit",

    /* -------------------------------------------------------
       Workspaces
    ------------------------------------------------------- */

    WORKSPACES:
      "/workspaces",

    WORKSPACE_DETAILS:
      "/workspaces/:workspaceId",

    WORKSPACE_CREATE:
      "/workspaces/new",

    WORKSPACE_EDIT:
      "/workspaces/:workspaceId/edit",

    /* -------------------------------------------------------
       Users
    ------------------------------------------------------- */

    USERS:
      "/users",

    USER_DETAILS:
      "/users/:userId",

    USER_CREATE:
      "/users/new",

    USER_EDIT:
      "/users/:userId/edit",

    /* -------------------------------------------------------
       Teams
    ------------------------------------------------------- */

    TEAMS:
      "/teams",

    TEAM_DETAILS:
      "/teams/:teamId",

    TEAM_CREATE:
      "/teams/new",

    TEAM_EDIT:
      "/teams/:teamId/edit",

    /* -------------------------------------------------------
       Permissions
    ------------------------------------------------------- */

    PERMISSIONS:
      "/permissions",

    PERMISSION_POLICIES:
      "/permissions/policies",

    /* -------------------------------------------------------
       Roles
    ------------------------------------------------------- */

    ROLES:
      "/roles",

    ROLE_DETAILS:
      "/roles/:roleId",

    /* -------------------------------------------------------
       Security
    ------------------------------------------------------- */

    SECURITY:
      "/security",

    SECURITY_EVENTS:
      "/security/events",

    SECURITY_SESSIONS:
      "/security/sessions",

    /* -------------------------------------------------------
       Settings
    ------------------------------------------------------- */

    SETTINGS:
      "/settings",

    SETTINGS_PROFILE:
      "/settings/profile",

    SETTINGS_GENERAL:
      "/settings/general",

    SETTINGS_SECURITY:
      "/settings/security",

    SETTINGS_NOTIFICATIONS:
      "/settings/notifications",

    /* -------------------------------------------------------
       Usage
    ------------------------------------------------------- */

    USAGE:
      "/usage",

    /* -------------------------------------------------------
       Reports
    ------------------------------------------------------- */

    REPORTS:
      "/reports",

    REPORT_DETAILS:
      "/reports/:reportId",

    /* -------------------------------------------------------
       Notifications
    ------------------------------------------------------- */

    NOTIFICATIONS:
      "/notifications",

    /* -------------------------------------------------------
       Integrations
    ------------------------------------------------------- */

    INTEGRATIONS:
      "/integrations",

    INTEGRATION_DETAILS:
      "/integrations/:integrationId",

    /* -------------------------------------------------------
       Knowledge
    ------------------------------------------------------- */

    KNOWLEDGE:
      "/knowledge",

    /* -------------------------------------------------------
       Prompts
    ------------------------------------------------------- */

    PROMPTS:
      "/prompts",

    /* -------------------------------------------------------
       Models
    ------------------------------------------------------- */

    MODELS:
      "/models",

    MODEL_DETAILS:
      "/models/:modelId",

    /* -------------------------------------------------------
       Monitoring
    ------------------------------------------------------- */

    MONITORING:
      "/monitoring",

    /* -------------------------------------------------------
       Observability
    ------------------------------------------------------- */

    OBSERVABILITY:
      "/observability",
  });

/* =========================================================
   Route Builders
========================================================= */

export const buildRoute = (
  route,
  params = {}
) => {
  if (
    typeof route !==
    "string"
  ) {
    return "";
  }

  return Object.keys(
    params
  ).reduce(
    (
      currentRoute,
      key
    ) =>
      currentRoute.replace(
        `:${key}`,
        encodeURIComponent(
          String(
            params[
              key
            ]
          )
        )
      ),
    route
  );
};

/* =========================================================
   Common Route Builders
========================================================= */

export const routeBuilders =
  Object.freeze({
    agent:
      (agentId) =>
        buildRoute(
          ROUTES.AGENT_DETAILS,
          {
            agentId,
          }
        ),

    editAgent:
      (agentId) =>
        buildRoute(
          ROUTES.AGENT_EDIT,
          {
            agentId,
          }
        ),

    auditLog:
      (logId) =>
        buildRoute(
          ROUTES.AUDIT_LOG_DETAILS,
          {
            logId,
          }
        ),

    invoice:
      (invoiceId) =>
        buildRoute(
          ROUTES.BILLING_INVOICE_DETAILS,
          {
            invoiceId,
          }
        ),

    organization:
      (organizationId) =>
        buildRoute(
          ROUTES.ORGANIZATION_DETAILS,
          {
            organizationId,
          }
        ),

    editOrganization:
      (organizationId) =>
        buildRoute(
          ROUTES.ORGANIZATION_EDIT,
          {
            organizationId,
          }
        ),

    workspace:
      (workspaceId) =>
        buildRoute(
          ROUTES.WORKSPACE_DETAILS,
          {
            workspaceId,
          }
        ),

    editWorkspace:
      (workspaceId) =>
        buildRoute(
          ROUTES.WORKSPACE_EDIT,
          {
            workspaceId,
          }
        ),

    user:
      (userId) =>
        buildRoute(
          ROUTES.USER_DETAILS,
          {
            userId,
          }
        ),

    editUser:
      (userId) =>
        buildRoute(
          ROUTES.USER_EDIT,
          {
            userId,
          }
        ),

    team:
      (teamId) =>
        buildRoute(
          ROUTES.TEAM_DETAILS,
          {
            teamId,
          }
        ),

    editTeam:
      (teamId) =>
        buildRoute(
          ROUTES.TEAM_EDIT,
          {
            teamId,
          }
        ),

    role:
      (roleId) =>
        buildRoute(
          ROUTES.ROLE_DETAILS,
          {
            roleId,
          }
        ),

    report:
      (reportId) =>
        buildRoute(
          ROUTES.REPORT_DETAILS,
          {
            reportId,
          }
        ),

    integration:
      (integrationId) =>
        buildRoute(
          ROUTES.INTEGRATION_DETAILS,
          {
            integrationId,
          }
        ),

    model:
      (modelId) =>
        buildRoute(
          ROUTES.MODEL_DETAILS,
          {
            modelId,
          }
        ),
  });

/* =========================================================
   Route Access Levels
========================================================= */

export const ROUTE_ACCESS =
  Object.freeze({
    PUBLIC:
      "public",

    AUTHENTICATED:
      "authenticated",

    ADMIN:
      "admin",

    RESTRICTED:
      "restricted",
  });

/* =========================================================
   Route Metadata
========================================================= */

export const ROUTE_METADATA =
  Object.freeze({
    [ROUTES.DASHBOARD]: {
      title:
        "Dashboard",

      access:
        ROUTE_ACCESS.AUTHENTICATED,

      navigation:
        true,

      icon:
        "dashboard",
    },

    [ROUTES.AGENTS]: {
      title:
        "AI Agents",

      access:
        ROUTE_ACCESS.AUTHENTICATED,

      navigation:
        true,

      icon:
        "agents",
    },

    [ROUTES.ANALYTICS]: {
      title:
        "Analytics",

      access:
        ROUTE_ACCESS.AUTHENTICATED,

      navigation:
        true,

      icon:
        "analytics",
    },

    [ROUTES.API_KEYS]: {
      title:
        "API Keys",

      access:
        ROUTE_ACCESS.RESTRICTED,

      navigation:
        true,

      icon:
        "key",
    },

    [ROUTES.AUDIT]: {
      title:
        "Audit",

      access:
        ROUTE_ACCESS.RESTRICTED,

      navigation:
        true,

      icon:
        "audit",
    },

    [ROUTES.AUDIT_LOGS]: {
      title:
        "Audit Logs",

      access:
        ROUTE_ACCESS.RESTRICTED,

      navigation:
        true,

      icon:
        "history",
    },

    [ROUTES.BILLING]: {
      title:
        "Billing",

      access:
        ROUTE_ACCESS.RESTRICTED,

      navigation:
        true,

      icon:
        "billing",
    },

    [ROUTES.COMPLIANCE]: {
      title:
        "Compliance",

      access:
        ROUTE_ACCESS.RESTRICTED,

      navigation:
        true,

      icon:
        "compliance",
    },

    [ROUTES.GOVERNANCE]: {
      title:
        "Governance",

      access:
        ROUTE_ACCESS.RESTRICTED,

      navigation:
        true,

      icon:
        "governance",
    },

    [ROUTES.ORGANIZATIONS]: {
      title:
        "Organizations",

      access:
        ROUTE_ACCESS.ADMIN,

      navigation:
        true,

      icon:
        "organizations",
    },

    [ROUTES.WORKSPACES]: {
      title:
        "Workspaces",

      access:
        ROUTE_ACCESS.AUTHENTICATED,

      navigation:
        true,

      icon:
        "workspace",
    },

    [ROUTES.USERS]: {
      title:
        "Users",

      access:
        ROUTE_ACCESS.ADMIN,

      navigation:
        true,

      icon:
        "users",
    },

    [ROUTES.TEAMS]: {
      title:
        "Teams",

      access:
        ROUTE_ACCESS.AUTHENTICATED,

      navigation:
        true,

      icon:
        "teams",
    },

    [ROUTES.PERMISSIONS]: {
      title:
        "Permissions",

      access:
        ROUTE_ACCESS.RESTRICTED,

      navigation:
        true,

      icon:
        "permissions",
    },

    [ROUTES.ROLES]: {
      title:
        "Roles",

      access:
        ROUTE_ACCESS.RESTRICTED,

      navigation:
        true,

      icon:
        "roles",
    },

    [ROUTES.SECURITY]: {
      title:
        "Security",

      access:
        ROUTE_ACCESS.RESTRICTED,

      navigation:
        true,

      icon:
        "security",
    },

    [ROUTES.USAGE]: {
      title:
        "Usage",

      access:
        ROUTE_ACCESS.AUTHENTICATED,

      navigation:
        true,

      icon:
        "usage",
    },

    [ROUTES.REPORTS]: {
      title:
        "Reports",

      access:
        ROUTE_ACCESS.AUTHENTICATED,

      navigation:
        true,

      icon:
        "reports",
    },

    [ROUTES.NOTIFICATIONS]: {
      title:
        "Notifications",

      access:
        ROUTE_ACCESS.AUTHENTICATED,

      navigation:
        false,

      icon:
        "notifications",
    },

    [ROUTES.INTEGRATIONS]: {
      title:
        "Integrations",

      access:
        ROUTE_ACCESS.RESTRICTED,

      navigation:
        true,

      icon:
        "integrations",
    },

    [ROUTES.KNOWLEDGE]: {
      title:
        "Knowledge",

      access:
        ROUTE_ACCESS.AUTHENTICATED,

      navigation:
        true,

      icon:
        "knowledge",
    },

    [ROUTES.PROMPTS]: {
      title:
        "Prompts",

      access:
        ROUTE_ACCESS.AUTHENTICATED,

      navigation:
        true,

      icon:
        "prompts",
    },

    [ROUTES.MODELS]: {
      title:
        "Models",

      access:
        ROUTE_ACCESS.RESTRICTED,

      navigation:
        true,

      icon:
        "models",
    },

    [ROUTES.MONITORING]: {
      title:
        "Monitoring",

      access:
        ROUTE_ACCESS.RESTRICTED,

      navigation:
        true,

      icon:
        "monitoring",
    },

    [ROUTES.OBSERVABILITY]: {
      title:
        "Observability",

      access:
        ROUTE_ACCESS.RESTRICTED,

      navigation:
        true,

      icon:
        "observability",
    },

    [ROUTES.SETTINGS]: {
      title:
        "Settings",

      access:
        ROUTE_ACCESS.AUTHENTICATED,

      navigation:
        true,

      icon:
        "settings",
    },
  });

/* =========================================================
   Navigation Groups
========================================================= */

export const NAVIGATION_GROUPS =
  Object.freeze([
    {
      id:
        "overview",

      label:
        "Overview",

      items: [
        ROUTES.DASHBOARD,
        ROUTES.ANALYTICS,
        ROUTES.REPORTS,
      ],
    },

    {
      id:
        "ai-platform",

      label:
        "AI Platform",

      items: [
        ROUTES.AGENTS,
        ROUTES.MODELS,
        ROUTES.PROMPTS,
        ROUTES.KNOWLEDGE,
        ROUTES.INTEGRATIONS,
      ],
    },

    {
      id:
        "organization",

      label:
        "Organization",

      items: [
        ROUTES.ORGANIZATIONS,
        ROUTES.WORKSPACES,
        ROUTES.TEAMS,
        ROUTES.USERS,
      ],
    },

    {
      id:
        "security",

      label:
        "Security & Governance",

      items: [
        ROUTES.SECURITY,
        ROUTES.PERMISSIONS,
        ROUTES.ROLES,
        ROUTES.AUDIT,
        ROUTES.AUDIT_LOGS,
        ROUTES.COMPLIANCE,
        ROUTES.GOVERNANCE,
      ],
    },

    {
      id:
        "operations",

      label:
        "Operations",

      items: [
        ROUTES.MONITORING,
        ROUTES.OBSERVABILITY,
        ROUTES.USAGE,
        ROUTES.BILLING,
        ROUTES.API_KEYS,
      ],
    },

    {
      id:
        "system",

      label:
        "System",

      items: [
        ROUTES.SETTINGS,
      ],
    },
  ]);

/* =========================================================
   Route Helpers
========================================================= */

/**
 * Returns route metadata.
 */

export const getRouteMetadata = (
 path
) => {
  return (
    ROUTE_METADATA[
      path
    ] || null
  );
};

/**
 * Checks whether a route exists.
 */

export const isKnownRoute = (
  path
) => {
  return Boolean(
    ROUTE_METADATA[
      path
    ]
  );
};

/**
 * Returns navigation routes.
 */

export const getNavigationRoutes =
  () =>
    Object.entries(
      ROUTE_METADATA
    )
      .filter(
        ([, metadata]) =>
          metadata.navigation ===
          true
      )
      .map(
        ([path, metadata]) => ({
          path,
          ...metadata,
        })
      );

/* =========================================================
   Default Export
========================================================= */

const routes =
  Object.freeze({
    ROUTES,

    routeBuilders,

    ROUTE_ACCESS,

    ROUTE_METADATA,

    NAVIGATION_GROUPS,

    buildRoute,

    getRouteMetadata,

    isKnownRoute,

    getNavigationRoutes,
  });

export default routes;