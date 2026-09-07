import apiClient from "../../api/client";

/**
 * Audit API Service
 * Handles all audit log related API requests.
 */

// Get all audit logs
export const getAuditLogs = async (params = {}) => {
  try {
    const response = await apiClient.get("/audit-logs", {
      params,
    });

    return response.data;
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    throw error;
  }
};

// Get a single audit log by ID
export const getAuditLogById = async (auditLogId) => {
  try {
    const response = await apiClient.get(
      `/audit-logs/${auditLogId}`
    );

    return response.data;
  } catch (error) {
    console.error(
      `Failed to fetch audit log ${auditLogId}:`,
      error
    );
    throw error;
  }
};

// Search audit logs
export const searchAuditLogs = async (query, params = {}) => {
  try {
    const response = await apiClient.get(
      "/audit-logs/search",
      {
        params: {
          q: query,
          ...params,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to search audit logs:", error);
    throw error;
  }
};

// Get audit logs for a specific user
export const getUserAuditLogs = async (
  userId,
  params = {}
) => {
  try {
    const response = await apiClient.get(
      `/audit-logs/user/${userId}`,
      {
        params,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      `Failed to fetch audit logs for user ${userId}:`,
      error
    );
    throw error;
  }
};

// Get audit logs for a specific resource
export const getResourceAuditLogs = async (
  resourceType,
  resourceId,
  params = {}
) => {
  try {
    const response = await apiClient.get(
      `/audit-logs/${resourceType}/${resourceId}`,
      {
        params,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      `Failed to fetch audit logs for ${resourceType} ${resourceId}:`,
      error
    );
    throw error;
  }
};

// Get audit log statistics
export const getAuditLogStats = async (params = {}) => {
  try {
    const response = await apiClient.get(
      "/audit-logs/stats",
      {
        params,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch audit log statistics:",
      error
    );
    throw error;
  }
};

// Export audit logs
export const exportAuditLogs = async (params = {}) => {
  try {
    const response = await apiClient.get(
      "/audit-logs/export",
      {
        params,
        responseType: "blob",
      }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to export audit logs:", error);
    throw error;
  }
};

// Delete an audit log
export const deleteAuditLog = async (auditLogId) => {
  try {
    const response = await apiClient.delete(
      `/audit-logs/${auditLogId}`
    );

    return response.data;
  } catch (error) {
    console.error(
      `Failed to delete audit log ${auditLogId}:`,
      error
    );
    throw error;
  }
};

export default {
  getAuditLogs,
  getAuditLogById,
  searchAuditLogs,
  getUserAuditLogs,
  getResourceAuditLogs,
  getAuditLogStats,
  exportAuditLogs,
  deleteAuditLog,
};