/**
 * Permission identifiers for UI visibility and action descriptions.
 * These constants do not grant access. Protected operations must be
 * authorized by the backend for the authenticated user and tenant.
 */
export const PERMISSIONS = Object.freeze({
  modelsRead: "models:read",
  promptsRead: "prompts:read",
  promptsWrite: "prompts:write",
  agentsRead: "agents:read",
  agentsWrite: "agents:write",
  apiKeysRead: "api_keys:read",
  apiKeysManage: "api_keys:manage",
  usageRead: "usage:read",
  logsRead: "logs:read",
  billingRead: "billing:read",
  settingsRead: "settings:read",
  settingsWrite: "settings:write",
  governanceRead: "governance:read",
  securityRead: "security:read",
  auditRead: "audit:read",
  complianceRead: "compliance:read",
  rbacRead: "rbac:read",
  rbacManage: "rbac:manage",
  ssoRead: "sso:read",
  enterpriseRead: "enterprise:read"
});

export function isKnownPermission(permission) {
  return typeof permission === "string" &&
    Object.values(PERMISSIONS).includes(permission);
}
