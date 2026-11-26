
const cleanBase = (value) => String(value || "").replace(/\/+$/, "");

export const consoleConfig = Object.freeze({
  productName: "ModelNow",
  productArea: "Enterprise AI Platform",
  apiBaseUrl: cleanBase(process.env.NEXT_PUBLIC_API_BASE_URL),
  requestTimeoutMs: 12000
});

// Next.js requires statically referenced environment variables.
// Configure these in your .env.local file when the backend endpoints are ready.
const resourceEndpoints = Object.freeze({
  models: process.env.NEXT_PUBLIC_CONSOLE_ENDPOINT_MODELS,
  apiKeys: process.env.NEXT_PUBLIC_CONSOLE_ENDPOINT_API_KEYS,
  usage: process.env.NEXT_PUBLIC_CONSOLE_ENDPOINT_USAGE,
  logs: process.env.NEXT_PUBLIC_CONSOLE_ENDPOINT_LOGS,
  prompts: process.env.NEXT_PUBLIC_CONSOLE_ENDPOINT_PROMPTS,
  agents: process.env.NEXT_PUBLIC_CONSOLE_ENDPOINT_AGENTS,
  billing: process.env.NEXT_PUBLIC_CONSOLE_ENDPOINT_BILLING,
  settings: process.env.NEXT_PUBLIC_CONSOLE_ENDPOINT_SETTINGS,
  governance: process.env.NEXT_PUBLIC_CONSOLE_ENDPOINT_GOVERNANCE,
  security: process.env.NEXT_PUBLIC_CONSOLE_ENDPOINT_SECURITY,
  audit: process.env.NEXT_PUBLIC_CONSOLE_ENDPOINT_AUDIT,
  compliance: process.env.NEXT_PUBLIC_CONSOLE_ENDPOINT_COMPLIANCE,
  rbac: process.env.NEXT_PUBLIC_CONSOLE_ENDPOINT_RBAC,
  sso: process.env.NEXT_PUBLIC_CONSOLE_ENDPOINT_SSO,
  sla: process.env.NEXT_PUBLIC_CONSOLE_ENDPOINT_SLA,
  enterprise: process.env.NEXT_PUBLIC_CONSOLE_ENDPOINT_ENTERPRISE
});

export function getResourceEndpoint(resourceKey) {
  const configured = String(resourceEndpoints[resourceKey] || "").trim();

  if (!configured) return null;

  if (!configured.startsWith("/") || configured.startsWith("//")) {
    throw new Error(
      `NEXT_PUBLIC_CONSOLE_ENDPOINT_${String(resourceKey).toUpperCase()} must be a same-origin path beginning with "/".`
    );
  }

  return configured;
}
