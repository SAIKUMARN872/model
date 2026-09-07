"use client";

/* Application */
export const APP_NAME =
  "AI Platform";

export const APP_VERSION =
  "1.0.0";

export const APP_DESCRIPTION =
  "Enterprise AI platform for managing models, agents, prompts, evaluations, and analytics.";

/* API */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000/api";

export const API_TIMEOUT =
  30000;

/* Routes */
export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  AGENTS: "/agents",
  MODELS: "/models",
  PROMPTS: "/prompts",
  PLAYGROUND: "/playground",
  EVALUATIONS: "/evaluations",
  ANALYTICS: "/analytics",
  HISTORY: "/history",
  SETTINGS: "/settings",
};

/* Authentication */
export const AUTH = {
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REGISTER: "/auth/register",
  REFRESH: "/auth/refresh",
  ME: "/auth/me",
};

/* User Roles */
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  DEVELOPER: "developer",
  VIEWER: "viewer",
};

/* Agent Status */
export const AGENT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  DRAFT: "draft",
  ERROR: "error",
};

/* Model Status */
export const MODEL_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  DEPRECATED: "deprecated",
};

/* Evaluation Status */
export const EVALUATION_STATUS = {
  PENDING: "pending",
  RUNNING: "running",
  COMPLETED: "completed",
  FAILED: "failed",
};

/* Request Status */
export const REQUEST_STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};

/* Message Roles */
export const MESSAGE_ROLES = {
  USER: "user",
  ASSISTANT: "assistant",
  SYSTEM: "system",
};

/* Storage Keys */
export const STORAGE_KEYS = {
  AUTH_USER: "auth_user",
  AUTH_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  THEME: "app_theme",
  LANGUAGE: "app_language",
};

/* Theme */
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
};

/* Languages */
export const LANGUAGES = {
  ENGLISH: "en",
  TELUGU: "te",
};

/* Pagination */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

/* Default Model Settings */
export const MODEL_DEFAULTS = {
  TEMPERATURE: 0.7,
  MAX_TOKENS: 2048,
  TOP_P: 1,
};

/* File Upload */
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  ALLOWED_TYPES: [
    "application/pdf",
    "text/plain",
    "text/markdown",
    "application/json",
    "text/csv",
  ],
};

/* Timeouts */
export const TIMEOUTS = {
  API: 30000,
  STREAM: 60000,
  DEBOUNCE: 300,
};

/* Feature Flags */
export const FEATURES = {
  PLAYGROUND: true,
  AGENTS: true,
  MODELS: true,
  PROMPTS: true,
  EVALUATIONS: true,
  ANALYTICS: true,
  RAG: true,
  STREAMING: true,
};

/* Error Messages */
export const ERROR_MESSAGES = {
  GENERIC:
    "Something went wrong. Please try again.",
  NETWORK:
    "Unable to connect to the server.",
  UNAUTHORIZED:
    "You are not authorized to perform this action.",
  NOT_FOUND:
    "The requested resource was not found.",
  VALIDATION:
    "Please check the provided information.",
  TIMEOUT:
    "The request timed out. Please try again.",
};

/* Success Messages */
export const SUCCESS_MESSAGES = {
  CREATED:
    "Created successfully.",
  UPDATED:
    "Updated successfully.",
  DELETED:
    "Deleted successfully.",
  SAVED:
    "Saved successfully.",
};

/* Date Formats */
export const DATE_FORMATS = {
  DATE: "DD/MM/YYYY",
  TIME: "HH:mm",
  DATETIME:
    "DD/MM/YYYY HH:mm",
};

export default {
  APP_NAME,
  APP_VERSION,
  APP_DESCRIPTION,
  API_BASE_URL,
  API_TIMEOUT,
  ROUTES,
  AUTH,
  ROLES,
  AGENT_STATUS,
  MODEL_STATUS,
  EVALUATION_STATUS,
  REQUEST_STATUS,
  MESSAGE_ROLES,
  STORAGE_KEYS,
  THEMES,
  LANGUAGES,
  PAGINATION,
  MODEL_DEFAULTS,
  FILE_UPLOAD,
  TIMEOUTS,
  FEATURES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DATE_FORMATS,
};