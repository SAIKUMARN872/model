import apiClient from "../../api/client";

/**
 * Security API Service
 *
 * Responsible for:
 * - Security overview
 * - Security events
 * - API key security
 * - Sessions
 * - Security policies
 * - Access reviews
 * - Authentication activity
 * - Security audit logs
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
 * Get security overview.
 */
export const getSecurityOverview = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/security/overview",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get security status.
 */
export const getSecurityStatus = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/security/status",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get security events.
 */
export const getSecurityEvents = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/security/events",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get a single security event.
 */
export const getSecurityEvent = async (
 eventId
) => {
  if (!eventId) {
    throw new Error(
      "Security event ID is required."
    );
  }

  const response = await apiClient.get(
    `/security/events/${encodeURIComponent(
      eventId
    )}`
  );

  return getResponseData(response);
};

/**
 * Get API key security information.
 */
export const getApiKeySecurity = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/security/api-keys",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get security information for a specific API key.
 */
export const getApiKeySecurityDetails =
  async (apiKeyId) => {
    if (!apiKeyId) {
      throw new Error(
        "API key ID is required."
      );
    }

    const response = await apiClient.get(
      `/security/api-keys/${encodeURIComponent(
        apiKeyId
      )}`
    );

    return getResponseData(response);
  };

/**
 * Rotate an API key.
 */
export const rotateApiKey = async (
  apiKeyId
) => {
  if (!apiKeyId) {
    throw new Error(
      "API key ID is required."
    );
  }

  const response = await apiClient.post(
    `/security/api-keys/${encodeURIComponent(
      apiKeyId
    )}/rotate`
  );

  return getResponseData(response);
};

/**
 * Revoke an API key.
 */
export const revokeApiKey = async (
  apiKeyId,
  reason = ""
) => {
  if (!apiKeyId) {
    throw new Error(
      "API key ID is required."
    );
  }

  const response = await apiClient.post(
    `/security/api-keys/${encodeURIComponent(
      apiKeyId
    )}/revoke`,
    {
      reason,
    }
  );

  return getResponseData(response);
};

/**
 * Get active sessions.
 */
export const getSessions = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/security/sessions",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get a specific session.
 */
export const getSession = async (
  sessionId
) => {
  if (!sessionId) {
    throw new Error(
      "Session ID is required."
    );
  }

  const response = await apiClient.get(
    `/security/sessions/${encodeURIComponent(
      sessionId
    )}`
  );

  return getResponseData(response);
};

/**
 * Revoke a session.
 */
export const revokeSession = async (
  sessionId
) => {
  if (!sessionId) {
    throw new Error(
      "Session ID is required."
    );
  }

  const response = await apiClient.post(
    `/security/sessions/${encodeURIComponent(
      sessionId
    )}/revoke`
  );

  return getResponseData(response);
};

/**
 * Revoke all sessions.
 */
export const revokeAllSessions = async () => {
  const response = await apiClient.post(
    "/security/sessions/revoke-all"
  );

  return getResponseData(response);
};

/**
 * Get authentication activity.
 */
export const getAuthenticationActivity =
  async (params = {}) => {
    const response = await apiClient.get(
      "/security/authentication",
      {
        params: buildQueryParams(params),
      }
    );

    return getResponseData(response);
  };

/**
 * Get security policies.
 */
export const getSecurityPolicies = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/security/policies",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get a security policy.
 */
export const getSecurityPolicy = async (
  policyId
) => {
  if (!policyId) {
    throw new Error(
      "Security policy ID is required."
    );
  }

  const response = await apiClient.get(
    `/security/policies/${encodeURIComponent(
      policyId
    )}`
  );

  return getResponseData(response);
};

/**
 * Create security policy.
 */
export const createSecurityPolicy = async (
  policyData
) => {
  if (
    !policyData ||
    typeof policyData !== "object"
  ) {
    throw new Error(
      "Security policy data is required."
    );
  }

  const response = await apiClient.post(
    "/security/policies",
    policyData
  );

  return getResponseData(response);
};

/**
 * Update security policy.
 */
export const updateSecurityPolicy = async (
  policyId,
  policyData
) => {
  if (!policyId) {
    throw new Error(
      "Security policy ID is required."
    );
  }

  if (
    !policyData ||
    typeof policyData !== "object"
  ) {
    throw new Error(
      "Security policy data is required."
    );
  }

  const response = await apiClient.put(
    `/security/policies/${encodeURIComponent(
      policyId
    )}`,
    policyData
  );

  return getResponseData(response);
};

/**
 * Delete security policy.
 */
export const deleteSecurityPolicy = async (
  policyId
) => {
  if (!policyId) {
    throw new Error(
      "Security policy ID is required."
    );
  }

  const response = await apiClient.delete(
    `/security/policies/${encodeURIComponent(
      policyId
    )}`
  );

  return getResponseData(response);
};

/**
 * Enable security policy.
 */
export const enableSecurityPolicy = async (
  policyId
) => {
  if (!policyId) {
    throw new Error(
      "Security policy ID is required."
    );
  }

  const response = await apiClient.post(
    `/security/policies/${encodeURIComponent(
      policyId
    )}/enable`
  );

  return getResponseData(response);
};

/**
 * Disable security policy.
 */
export const disableSecurityPolicy = async (
  policyId
) => {
  if (!policyId) {
    throw new Error(
      "Security policy ID is required."
    );
  }

  const response = await apiClient.post(
    `/security/policies/${encodeURIComponent(
      policyId
    )}/disable`
  );

  return getResponseData(response);
};

/**
 * Get access reviews.
 */
export const getAccessReviews = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/security/access-reviews",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get a specific access review.
 */
export const getAccessReview = async (
  reviewId
) => {
  if (!reviewId) {
    throw new Error(
      "Access review ID is required."
    );
  }

  const response = await apiClient.get(
    `/security/access-reviews/${encodeURIComponent(
      reviewId
    )}`
  );

  return getResponseData(response);
};

/**
 * Create an access review.
 */
export const createAccessReview = async (
  reviewData
) => {
  if (
    !reviewData ||
    typeof reviewData !== "object"
  ) {
    throw new Error(
      "Access review data is required."
    );
  }

  const response = await apiClient.post(
    "/security/access-reviews",
    reviewData
  );

  return getResponseData(response);
};

/**
 * Complete an access review.
 */
export const completeAccessReview = async (
  reviewId,
  reviewData = {}
) => {
  if (!reviewId) {
    throw new Error(
      "Access review ID is required."
    );
  }

  const response = await apiClient.post(
    `/security/access-reviews/${encodeURIComponent(
      reviewId
    )}/complete`,
    reviewData
  );

  return getResponseData(response);
};

/**
 * Get security audit logs.
 */
export const getSecurityAuditLogs = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/security/audit-logs",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Export security audit logs.
 */
export const exportSecurityAuditLogs =
  async (params = {}) => {
    const response = await apiClient.get(
      "/security/audit-logs/export",
      {
        params: buildQueryParams(params),
        responseType: "blob",
      }
    );

    return response;
  };

/**
 * Get security alerts.
 */
export const getSecurityAlerts = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/security/alerts",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Resolve a security alert.
 */
export const resolveSecurityAlert = async (
  alertId,
  resolutionData = {}
) => {
  if (!alertId) {
    throw new Error(
      "Security alert ID is required."
    );
  }

  const response = await apiClient.post(
    `/security/alerts/${encodeURIComponent(
      alertId
    )}/resolve`,
    resolutionData
  );

  return getResponseData(response);
};

/**
 * Security API service.
 */
const securityApi = {
  getSecurityOverview,

  getSecurityStatus,

  getSecurityEvents,

  getSecurityEvent,

  getApiKeySecurity,

  getApiKeySecurityDetails,

  rotateApiKey,

  revokeApiKey,

  getSessions,

  getSession,

  revokeSession,

  revokeAllSessions,

  getAuthenticationActivity,

  getSecurityPolicies,

  getSecurityPolicy,

  createSecurityPolicy,

  updateSecurityPolicy,

  deleteSecurityPolicy,

  enableSecurityPolicy,

  disableSecurityPolicy,

  getAccessReviews,

  getAccessReview,

  createAccessReview,

  completeAccessReview,

  getSecurityAuditLogs,

  exportSecurityAuditLogs,

  getSecurityAlerts,

  resolveSecurityAlert,
};

export default securityApi;