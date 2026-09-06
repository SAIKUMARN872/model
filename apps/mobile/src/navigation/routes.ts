export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  CHAT: "/chat",
  MODELS: "/models",
  USERS: "/users",
  ANALYTICS: "/analytics",
  SETTINGS: "/settings",
  PROFILE: "/profile",
  HELP: "/help",
} as const;

export type Route =
  (typeof ROUTES)[keyof typeof ROUTES];

export function isValidRoute(
  path: string
): boolean {
  return Object.values(ROUTES).includes(
    path as Route
  );
}

export function getRoute(
  name: keyof typeof ROUTES
): string {
  return ROUTES[name];
}