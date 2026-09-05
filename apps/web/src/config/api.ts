export const API = {
  BASE_URL:
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",

  VERSION: "v1",

  TIMEOUT: 30000,

  ENDPOINTS: {
    AUTH: "/auth",
    USERS: "/users",
    PROFILE: "/profile",

    CHAT: "/chat",
    AI: "/ai",
    AGENTS: "/agents",

    DOCUMENTS: "/documents",
    FILES: "/files",

    SEARCH: "/search",
    VOICE: "/voice",

    DASHBOARD: "/dashboard",
    ANALYTICS: "/analytics",

    SETTINGS: "/settings",
    NOTIFICATIONS: "/notifications",
  },
};

export default API;