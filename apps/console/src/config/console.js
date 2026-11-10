const cleanBase = (value) => String(value || "").replace(/\/+$/, "");

export const consoleConfig = Object.freeze({
  productName: "ModelNow",
  productArea: "Enterprise AI Platform",
  apiBaseUrl: cleanBase(import.meta.env.VITE_API_BASE_URL),
  requestTimeoutMs: 12000
});

const endpointEnvironmentKeys = Object.freeze({
  models: "VITE_CONSOLE_ENDPOINT_MODELS",
  apiKeys: "VITE_CONSOLE_ENDPOINT_API_KEYS",
  usage: "VITE_CONSOLE_ENDPOINT_USAGE",
  logs: "VITE_CONSOLE_ENDPOINT_LOGS",
  prompts: "VITE_CONSOLE_ENDPOINT_PROMPTS",
  agents: "VITE_CONSOLE_ENDPOINT_AGENTS",
  billing: "VITE_CONSOLE_ENDPOINT_BILLING",
  settings: "VITE_CONSOLE_ENDPOINT_SETTINGS",
  governance: "VITE_CONSOLE_ENDPOINT_GOVERNANCE",
  security: "VITE_CONSOLE_ENDPOINT_SECURITY",
  audit: "VITE_CONSOLE_ENDPOINT_AUDIT",
  compliance: "VITE_CONSOLE_ENDPOINT_COMPLIANCE",
  rbac: "VITE_CONSOLE_ENDPOINT_RBAC",
  sso: "VITE_CONSOLE_ENDPOINT_SSO",
  sla: "VITE_CONSOLE_ENDPOINT_SLA",
  enterprise: "VITE_CONSOLE_ENDPOINT_ENTERPRISE"
});

export function getResourceEndpoint(resourceKey) {
  const environmentKey = endpointEnvironmentKeys[resourceKey];
  if (!environmentKey) return null;

  const configured = String(import.meta.env[environmentKey] || "").trim();
  if (!configured) return null;

  // Only relative API paths are accepted. This prevents an environment setting
  // from silently sending authenticated requests to an arbitrary external host.
  if (!configured.startsWith("/") || configured.startsWith("//")) {
    throw new Error(`${environmentKey} must be a same-origin path beginning with "/".`);
  }

  return configured;
}