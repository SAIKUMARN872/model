import apiClient from "../../api/client";

/**
 * Admin API Service
 * Handles all admin-related API requests.
 */

// Get admin dashboard data
export const getAdminDashboard = async () => {
  try {
    const response = await apiClient.get("/admin/dashboard");

    return response.data;
  } catch (error) {
    console.error("Failed to fetch admin dashboard:", error);
    throw error;
  }
};

// Get all administrators
export const getAdmins = async (params = {}) => {
  try {
    const response = await apiClient.get("/admin", {
      params,
    });

    return response.data;
  } catch (error) {
    console.error("Failed to fetch administrators:", error);
    throw error;
  }
};

// Get administrator by ID
export const getAdminById = async (adminId) => {
  try {
    const response = await apiClient.get(`/admin/${adminId}`);

    return response.data;
  } catch (error) {
    console.error(`Failed to fetch admin ${adminId}:`, error);
    throw error;
  }
};

// Create a new administrator
export const createAdmin = async (adminData) => {
  try {
    const response = await apiClient.post(
      "/admin",
      adminData
    );

    return response.data;
  } catch (error) {
    console.error("Failed to create administrator:", error);
    throw error;
  }
};

// Update administrator
export const updateAdmin = async (adminId, adminData) => {
  try {
    const response = await apiClient.put(
      `/admin/${adminId}`,
      adminData
    );

    return response.data;
  } catch (error) {
    console.error(`Failed to update admin ${adminId}:`, error);
    throw error;
  }
};

// Delete administrator
export const deleteAdmin = async (adminId) => {
  try {
    const response = await apiClient.delete(
      `/admin/${adminId}`
    );

    return response.data;
  } catch (error) {
    console.error(`Failed to delete admin ${adminId}:`, error);
    throw error;
  }
};

// Activate administrator
export const activateAdmin = async (adminId) => {
  try {
    const response = await apiClient.patch(
      `/admin/${adminId}/activate`
    );

    return response.data;
  } catch (error) {
    console.error(`Failed to activate admin ${adminId}:`, error);
    throw error;
  }
};

// Deactivate administrator
export const deactivateAdmin = async (adminId) => {
  try {
    const response = await apiClient.patch(
      `/admin/${adminId}/deactivate`
    );

    return response.data;
  } catch (error) {
    console.error(
      `Failed to deactivate admin ${adminId}:`,
      error
    );
    throw error;
  }
};

// Get admin activity logs
export const getAdminActivity = async (
  adminId,
  params = {}
) => {
  try {
    const response = await apiClient.get(
      `/admin/${adminId}/activity`,
      {
        params,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      `Failed to fetch admin activity for ${adminId}:`,
      error
    );
    throw error;
  }
};

// Get current admin profile
export const getCurrentAdmin = async () => {
  try {
    const response = await apiClient.get("/admin/me");

    return response.data;
  } catch (error) {
    console.error("Failed to fetch current admin:", error);
    throw error;
  }
};

// Update current admin profile
export const updateCurrentAdmin = async (adminData) => {
  try {
    const response = await apiClient.patch(
      "/admin/me",
      adminData
    );

    return response.data;
  } catch (error) {
    console.error(
      "Failed to update current admin:",
      error
    );
    throw error;
  }
};

export default {
  getAdminDashboard,
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  activateAdmin,
  deactivateAdmin,
  getAdminActivity,
  getCurrentAdmin,
  updateCurrentAdmin,
};