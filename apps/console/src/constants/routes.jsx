export const ROUTES = Object.freeze({
  home: "/",
  logout: "/logout",
  playground: "/playground",
  models: "/models",
  prompts: "/prompts",
  agents: "/agents",
  apiKeys: "/api-keys",
  usage: "/usage",
  logs: "/logs",
  billing: "/billing",
  governance: "/governance",
  security: "/security",
  audit: "/audit",
  compliance: "/compliance",
  rbac: "/rbac",
  sso: "/sso",
  sla: "/sla",
  enterprise: "/enterprise",
  credits: "/credits",
  documents: "/documents",
  notifications: "/notifications",
  settings: "/settings"
});

export function isKnownRoute(path) {
  return typeof path === "string" &&
    Object.values(ROUTES).includes(path);
}
