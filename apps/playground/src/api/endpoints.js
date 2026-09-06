const ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
  },

  USERS: {
    LIST: "/api/users",
    DETAIL: (id) =>
      `/api/users/${id}`,
    CREATE: "/api/users",
    UPDATE: (id) =>
      `/api/users/${id}`,
    DELETE: (id) =>
      `/api/users/${id}`,
  },

  CHAT: {
    SEND: "/api/chat",
    HISTORY: (conversationId) =>
      `/api/chat/${conversationId}`,
    CLEAR: (conversationId) =>
      `/api/chat/${conversationId}`,
  },

  MODELS: {
    LIST: "/api/models",
    DETAIL: (id) =>
      `/api/models/${id}`,
  },

  ANALYTICS: {
    OVERVIEW: "/api/analytics",
    EVENTS: "/api/analytics/events",
  },

  DOCUMENTS: {
    LIST: "/api/documents",
    DETAIL: (id) =>
      `/api/documents/${id}`,
    UPLOAD: "/api/documents/upload",
    DELETE: (id) =>
      `/api/documents/${id}`,
  },

  HEALTH: {
    CHECK: "/api/health",
  },
};

module.exports = ENDPOINTS;