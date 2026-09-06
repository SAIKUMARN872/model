import apiClient from "../api/client";

/**
 * Console API Service
 *
 * Responsible for:
 * - Console overview
 * - Dashboard metrics
 * - Organization information
 * - Workspace information
 * - Current user information
 * - Team members
 * - Activity feed
 * - System health
 * - Notifications
 */

/**
 * Extract response payload.
 */
const getResponseData = (response) => {
  if (
    response &&
    Object.prototype.hasOwnProperty.call(
      response,
      "data"
    )
  ) {
    return response.data;
  }

  return response;
};

/**
 * Build clean query parameters.
 */
const buildQueryParams = (params = {}) => {
  const query = {};

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        query[key] = value;
      }
    }
  );

  return query;
};

/**
 * Get console overview.
 */
export const getConsoleOverview = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/console/overview",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get dashboard metrics.
 */
export const getDashboardMetrics = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/console/dashboard/metrics",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get dashboard activity.
 */
export const getDashboardActivity = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/console/dashboard/activity",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get current user.
 */
export const getCurrentUser = async () => {
  const response = await apiClient.get(
    "/console/me"
  );

  return getResponseData(response);
};

/**
 * Update current user.
 */
export const updateCurrentUser = async (
  userData
) => {
  if (
    !userData ||
    typeof userData !== "object"
  ) {
    throw new Error(
      "User data is required."
    );
  }

  const response = await apiClient.put(
    "/console/me",
    userData
  );

  return getResponseData(response);
};

/**
 * Get organization information.
 */
export const getOrganization = async () => {
  const response = await apiClient.get(
    "/console/organization"
  );

  return getResponseData(response);
};

/**
 * Update organization information.
 */
export const updateOrganization = async (
  organizationData
) => {
  if (
    !organizationData ||
    typeof organizationData !== "object"
  ) {
    throw new Error(
      "Organization data is required."
    );
  }

  const response = await apiClient.put(
    "/console/organization",
    organizationData
  );

  return getResponseData(response);
};

/**
 * Get workspace information.
 */
export const getWorkspace = async () => {
  const response = await apiClient.get(
    "/console/workspace"
  );

  return getResponseData(response);
};

/**
 * Update workspace information.
 */
export const updateWorkspace = async (
  workspaceData
) => {
  if (
    !workspaceData ||
    typeof workspaceData !== "object"
  ) {
    throw new Error(
      "Workspace data is required."
    );
  }

  const response = await apiClient.put(
    "/console/workspace",
    workspaceData
  );

  return getResponseData(response);
};

/**
 * Get team members.
 */
export const getTeamMembers = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/console/team/members",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get a specific team member.
 */
export const getTeamMember = async (
  memberId
) => {
  if (!memberId) {
    throw new Error(
      "Member ID is required."
    );
  }

  const response = await apiClient.get(
    `/console/team/members/${encodeURIComponent(
      memberId
    )}`
  );

  return getResponseData(response);
};

/**
 * Invite a team member.
 */
export const inviteTeamMember = async (
  invitationData
) => {
  if (
    !invitationData ||
    typeof invitationData !== "object"
  ) {
    throw new Error(
      "Invitation data is required."
    );
  }

  const response = await apiClient.post(
    "/console/team/invitations",
    invitationData
  );

  return getResponseData(response);
};

/**
 * Update team member role.
 */
export const updateTeamMemberRole = async (
  memberId,
  roleData
) => {
  if (!memberId) {
    throw new Error(
      "Member ID is required."
    );
  }

  if (
    !roleData ||
    typeof roleData !== "object"
  ) {
    throw new Error(
      "Role data is required."
    );
  }

  const response = await apiClient.put(
    `/console/team/members/${encodeURIComponent(
      memberId
    )}/role`,
    roleData
  );

  return getResponseData(response);
};

/**
 * Remove team member.
 */
export const removeTeamMember = async (
  memberId
) => {
  if (!memberId) {
    throw new Error(
      "Member ID is required."
    );
  }

  const response = await apiClient.delete(
    `/console/team/members/${encodeURIComponent(
      memberId
    )}`
  );

  return getResponseData(response);
};

/**
 * Get activity feed.
 */
export const getActivityFeed = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/console/activity",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get system health.
 */
export const getSystemHealth = async () => {
  const response = await apiClient.get(
    "/console/health"
  );

  return getResponseData(response);
};

/**
 * Get system status.
 */
export const getSystemStatus = async () => {
  const response = await apiClient.get(
    "/console/status"
  );

  return getResponseData(response);
};

/**
 * Get notifications.
 */
export const getNotifications = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/console/notifications",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Mark notification as read.
 */
export const markNotificationAsRead =
  async (notificationId) => {
    if (!notificationId) {
      throw new Error(
        "Notification ID is required."
      );
    }

    const response = await apiClient.post(
      `/console/notifications/${encodeURIComponent(
        notificationId
      )}/read`
    );

    return getResponseData(response);
  };

/**
 * Mark all notifications as read.
 */
export const markAllNotificationsAsRead =
  async () => {
    const response = await apiClient.post(
      "/console/notifications/read-all"
    );

    return getResponseData(response);
  };

/**
 * Get console configuration.
 */
export const getConsoleConfig = async () => {
  const response = await apiClient.get(
    "/console/config"
  );

  return getResponseData(response);
};

/**
 * Get feature flags.
 */
export const getFeatureFlags = async () => {
  const response = await apiClient.get(
    "/console/features"
  );

  return getResponseData(response);
};

/**
 * Get available regions.
 */
export const getRegions = async () => {
  const response = await apiClient.get(
    "/console/regions"
  );

  return getResponseData(response);
};

/**
 * Console API service.
 */
const consoleApi = {
  getConsoleOverview,

  getDashboardMetrics,

  getDashboardActivity,

  getCurrentUser,

  updateCurrentUser,

  getOrganization,

  updateOrganization,

  getWorkspace,

  updateWorkspace,

  getTeamMembers,

  getTeamMember,

  inviteTeamMember,

  updateTeamMemberRole,

  removeTeamMember,

  getActivityFeed,

  getSystemHealth,

  getSystemStatus,

  getNotifications,

  markNotificationAsRead,

  markAllNotificationsAsRead,

  getConsoleConfig,

  getFeatureFlags,

  getRegions,
};

export default consoleApi;