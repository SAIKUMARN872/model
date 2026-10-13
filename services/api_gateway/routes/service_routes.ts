import type {
  Route,
} from "./router.js";

export const defaultServiceRoutes: Route[] = [
  {
    method: "GET",
    path: "/health",
    service: "health",
  },
  {
    method: "GET",
    path: "/api/v1/agents",
    service: "agents",
  },
];
