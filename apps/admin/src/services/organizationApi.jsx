import apiClient from "../../api/client";

/**
 * Organization API Service
 * Handles organization management and related API requests.
 */

// Get all organizations
export const getOrganizations = async (params = {}) => {
  try {
    const response = await apiClient.get(
      "/organizations",
      {
        params,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch organizations:",
      error
    );
    throw error;
  }
};

// Get organization by ID
export const getOrganizationById = async (organizationId) => {
  try {
    const response = await apiClient.get(
      `/organizations/${organizationId}`
    );

    return response.data;
  } catch (error) {
    console.error(
      `Failed to fetch organization ${organizationId}:`,
      error
    );
    throw error;
  }
};

// Create a new organization
export const createOrganization = async (
  organizationData
) => {
  try {
    const response = await apiClient.post(
      "/organizations",
      organizationData
    );

    return response.data;
  } catch (error) {
    console.error(
      "Failed to create organization:",
      error
    );
    throw error;
  }
};

// Update organization
export const updateOrganization = async (
  organizationId,
  organizationData
) => {
  try {
    const response = await apiClient.put(
      `/organizations/${organizationId}`,
      organizationData
    );

    return response.data;
  } catch (error) {
    console.error(
      `Failed to update organization ${organizationId}:`,
      error
    );
    throw error;
  }
};

// Partially update organization
export const patchOrganization = async (
  organizationId,
  organizationData
) => {
  try {
    const response = await apiClient.patch(
      `/organizations/${organizationId}`,
      organizationData
    );

    return response.data;
  } catch (error) {
    console.error(
      `Failed to patch organization ${organizationId}:`,
      error
    );
    throw error;
  }
};

// Delete organization
export const deleteOrganization = async (
  organizationId
) => {
  try {
    const response = await apiClient.delete(
      `/organizations/${organizationId}`
    );

    return response.data;
  } catch (error) {
    console.error(
      `Failed to delete organization ${organizationId}:`,
      error
    );
    throw error;
  }
};

// Activate organization
export const activateOrganization = async (
  organizationId
) => {
  try {
    const response = await apiClient.patch(
      `/organizations/${organizationId}/activate`
    );

    return response.data;
  } catch (error) {
    console.error(
      `Failed to activate organization ${organizationId}:`,
      error
    );
    throw error;
  }
};

// Deactivate organization
export const deactivateOrganization = async (
  organizationId
) => {
  try {
    const response = await apiClient.patch(
      `/organizations/${organizationId}/deactivate`
    );

    return response.data;
  } catch (error) {
    console.error(
      `Failed to deactivate organization ${organizationId}:`,
      error
    );
    throw error;
  }
};

// Search organizations
export const searchOrganizations = async (
  query,
  params = {}
) => {
  try {
    const response = await apiClient.get(
      "/organizations/search",
      {
        params: {
          q: query,
          ...params,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Failed to search organizations:",
      error
    );
    throw error;
  }
};

// Get organization members
export const getOrganizationMembers = async (
  organizationId,
  params = {}
) => {
  try {
    const response = await apiClient.get(
      `/organizations/${organizationId}/members`,
      {
        params,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      `Failed to fetch members for organization ${organizationId}:`,
      error
    );
    throw error;
  }
};

// Add member to organization
export const addOrganizationMember = async (
  organizationId,
  memberData
) => {
  try {
    const response = await apiClient.post(
      `/organizations/${organizationId}/members`,
      memberData
    );

    return response.data;
  } catch (error) {
    console.error(
      `Failed to add member to organization ${organizationId}:`,
      error
    );
    throw error;
  }
};

// Remove member from organization
export const removeOrganizationMember = async (
  organizationId,
  memberId
) => {
  try {
    const response = await apiClient.delete(
      `/organizations/${organizationId}/members/${memberId}`
    );

    return response.data;
  } catch (error) {
    console.error(
      `Failed to remove member ${memberId}:`,
      error
    );
    throw error;
  }
};

// Get organization statistics
export const getOrganizationStats = async (
  organizationId
) => {
  try {
    const response = await apiClient.get(
      `/organizations/${organizationId}/stats`
    );

    return response.data;
  } catch (error) {
    console.error(
      `Failed to fetch organization stats for ${organizationId}:`,
      error
    );
    throw error;
  }
};

export default {
  getOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  patchOrganization,
  deleteOrganization,
  activateOrganization,
  deactivateOrganization,
  searchOrganizations,
  getOrganizationMembers,
  addOrganizationMember,
  removeOrganizationMember,
  getOrganizationStats,
};