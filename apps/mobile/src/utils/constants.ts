export const APP_NAME = "AI Platform";

export const APP_VERSION = "1.0.0";

export const DEFAULT_LANGUAGE = "en";

export const DEFAULT_THEME = "light";

export const API_TIMEOUT = 30000;

export const MAX_CHAT_MESSAGES = 100;

export const MAX_MESSAGE_LENGTH = 10000;

export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER: "user",
  THEME: "theme",
  LANGUAGE: "language",
  CHAT: "chat",
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  CHAT: "/chat",
  MODELS: "/models",
  SETTINGS: "/settings",
  PROFILE: "/profile",
} as const;

export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
  MANAGER: "manager",
} as const;

export const NOTIFICATION_TYPES = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
} as const;

export const API_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
} as const;