import apiClient from "../../api/client";

/**
 * Governance API Service
 * Handles governance policies, rules, compliance,
 * and governance activity.
 */

// Get governance overview
export const getGovernanceOverview = async () => {
  try {
    const response = await apiClient.get(
      "/governance/overview"
    );

    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch governance overview:",
      error
    );
    throw error;
  }
};

// Get all governance policies
export const getGovernancePolicies = async (params = {}) => {
  try {
    const response = await apiClient.get(
      "/governance/policies",
      {
        params,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch governance policies:",
      error
    );
    throw error;
  }
};

// Get a governance policy by ID
export const getGovernancePolicyById = async (policyId) => {
  try {
    const response = await apiClient.get(
      `/governance/policies/${policyId}`
    );

    return response.data;
  } catch (error) {
    console.error(
      `Failed to fetch governance policy ${policyId}:`,
      error
    );
    throw error;
  }
};

// Create a governance policy
export const createGovernancePolicy = async (policyData) => {
  try {
    const response = await apiClient.post(
      "/governance/policies",
      policyData
    );

    return response.data;
  } catch (error) {
    console.error(
      "Failed to create governance policy:",
      error
    );
    throw error;
  }
};

// Update a governance policy
export const updateGovernancePolicy = async (
  policyId,
  policyData
) => {
  try {
    const response = await apiClient.put(
      `/governance/policies/${policyId}`,
      policyData
    );

    return response.data;
  } catch (error) {
    console.error(
      `Failed to update governance policy ${policyId}:`,
      error
    );
    throw error;
  }
};

// Delete a governance policy
export const deleteGovernancePolicy = async (policyId) => {
  try {
    const response = await apiClient.delete(
      `/governance/policies/${policyId}`
    );

    return response.data;
  } catch (error) {
    console.error(
      `Failed to delete governance policy ${policyId}:`,
      error
    );
    throw error;
  }
};

// Activate a governance policy
export const activateGovernancePolicy = async (policyId) => {
  try {
    const response = await apiClient.patch(
      `/governance/policies/${policyId}/activate`
    );

    return response.data;
  } catch (error) {
    console.error(
      `Failed to activate governance policy ${policyId}:`,
      error
    );
    throw error;
  }
};

// Deactivate a governance policy
export const deactivateGovernancePolicy = async (policyId) => {
  try {
    const response = await apiClient.patch(
      `/governance/policies/${policyId}/deactivate`
    );

    return response.data;
  } catch (error) {
    console.error(
      `Failed to deactivate governance policy ${policyId}:`,
      error
    );
    throw error;
  }
};

// Get governance rules
export const getGovernanceRules = async (params = {}) => {
  try {
    const response = await apiClient.get(
      "/governance/rules",
      {
        params,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch governance rules:",
      error
    );
    throw error;
  }
};

// Get governance compliance status
export const getGovernanceCompliance = async (
  params = {}
) => {
  try {
    const response = await apiClient.get(
      "/governance/compliance",
      {
        params,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch governance compliance:",
      error
    );
    throw error;
  }
};

// Get governance activity logs
export const getGovernanceActivity = async (
  params = {}
) => {
  try {
    const response = await apiClient.get(
      "/governance/activity",
      {
        params,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch governance activity:",
      error
    );
    throw error;
  }
};

// Get governance statistics
export const getGovernanceStats = async (params = {}) => {
  try {
    const response = await apiClient.get(
      "/governance/stats",
      {
        params,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch governance statistics:",
      error
    );
    throw error;
  }
};

export default {
  getGovernanceOverview,
  getGovernancePolicies,
  getGovernancePolicyById,
  createGovernancePolicy,
  updateGovernancePolicy,
  deleteGovernancePolicy,
  activateGovernancePolicy,
  deactivateGovernancePolicy,
  getGovernanceRules,
  getGovernanceCompliance,
  getGovernanceActivity,
  getGovernanceStats,
};