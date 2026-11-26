export const PERMISSIONS = {
  VIEW_DASHBOARD: "view_dashboard",

  CHAT: "chat",
  AI: "ai",

  CREATE_AGENT: "create_agent",
  EDIT_AGENT: "edit_agent",
  DELETE_AGENT: "delete_agent",

  UPLOAD_FILES: "upload_files",
  DELETE_FILES: "delete_files",

  VIEW_ANALYTICS: "view_analytics",

  MANAGE_USERS: "manage_users",
  MANAGE_ORGANIZATION: "manage_organization",

  ADMIN_ACCESS: "admin_access",
};

export const ROLE_PERMISSIONS = {
  admin: Object.values(PERMISSIONS),

  manager: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.CHAT,
    PERMISSIONS.AI,
    PERMISSIONS.CREATE_AGENT,
    PERMISSIONS.EDIT_AGENT,
    PERMISSIONS.UPLOAD_FILES,
    PERMISSIONS.VIEW_ANALYTICS,
  ],

  user: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.CHAT,
    PERMISSIONS.AI,
    PERMISSIONS.UPLOAD_FILES,
  ],

  viewer: [
    PERMISSIONS.VIEW_DASHBOARD,
  ],
};

export default PERMISSIONS;