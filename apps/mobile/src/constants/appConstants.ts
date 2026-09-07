export const APP_NAME = "ModelNow";

export const APP_VERSION = "1.0.0";

export const DEFAULT_MODEL = "default";

export const DEFAULT_PAGE_SIZE = 20;

export const MAX_PAGE_SIZE = 100;

export const REQUEST_TIMEOUT = 30000;

export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  AUTH_USER: "auth_user",
  THEME: "theme",
  LANGUAGE: "language",
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REGISTER: "/auth/register",
    ME: "/auth/me",
  },

  USERS: {
    LIST: "/users",
    CREATE: "/users",
    GET: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },

  CHAT: {
    CREATE: "/chat",
    MESSAGE: "/chat/message",
    STREAM: "/chat/stream",
  },

  MODELS: {
    LIST: "/models",
    GET: (id: string) => `/models/${id}`,
  },

  ANALYTICS: {
    EVENTS: "/analytics/events",
    SUMMARY: "/analytics/summary",
  },
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  CHAT: "/chat",
  USERS: "/users",
  MODELS: "/models",
  ANALYTICS: "/analytics",
  SETTINGS: "/settings",
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;