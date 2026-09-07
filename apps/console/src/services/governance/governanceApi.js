import apiClient from "../../api/client";

/**
 * Governance API Service
 *
 * Responsible for:
 * - Governance policies
 * - Policy evaluation
 * - Approval workflows
 * - Approval requests
 * - Audit trails
 * - Compliance checks
 * - Governance decisions
 */

/**
 * Extract response payload.
 */
const getResponseData = (
  response
) => {
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
const buildQueryParams = (
  params = {}
) => {
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
 * Get governance overview.
 */
export const getGovernanceOverview =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/governance/overview",
        {
          params:
            buildQueryParams(
              params
            ),
        }
      );

    return getResponseData(
      response
    );
  };

/**
 * Get all governance policies.
 */
export const getPolicies =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/governance/policies",
        {
          params:
            buildQueryParams(
              params
            ),
        }
      );

    return getResponseData(
      response
    );
  };

/**
 * Get a single governance policy.
 */
export const getPolicy =
  async (policyId) => {
    if (!policyId) {
      throw new Error(
        "Policy ID is required."
      );
    }

    const response =
      await apiClient.get(
        `/governance/policies/${encodeURIComponent(
          policyId
        )}`
      );

    return getResponseData(
      response
    );
  };

/**
 * Create governance policy.
 */
export const createPolicy =
  async (policyData) => {
    if (
      !policyData ||
      typeof policyData !==
        "object"
    ) {
      throw new Error(
        "Policy data is required."
      );
    }

    const response =
      await apiClient.post(
        "/governance/policies",
        policyData
      );

    return getResponseData(
      response
    );
  };

/**
 * Update governance policy.
 */
export const updatePolicy =
  async (
    policyId,
    policyData
  ) => {
    if (!policyId) {
      throw new Error(
        "Policy ID is required."
      );
    }

    if (
      !policyData ||
      typeof policyData !==
        "object"
    ) {
      throw new Error(
        "Policy data is required."
      );
    }

    const response =
      await apiClient.put(
        `/governance/policies/${encodeURIComponent(
          policyId
        )}`,
        policyData
      );

    return getResponseData(
      response
    );
  };

/**
 * Delete governance policy.
 */
export const deletePolicy =
  async (policyId) => {
    if (!policyId) {
      throw new Error(
        "Policy ID is required."
      );
    }

    const response =
      await apiClient.delete(
        `/governance/policies/${encodeURIComponent(
          policyId
        )}`
      );

    return getResponseData(
      response
    );
  };

/**
 * Enable governance policy.
 */
export const enablePolicy =
  async (policyId) => {
    if (!policyId) {
      throw new Error(
        "Policy ID is required."
      );
    }

    const response =
      await apiClient.post(
        `/governance/policies/${encodeURIComponent(
          policyId
        )}/enable`
      );

    return getResponseData(
      response
    );
  };

/**
 * Disable governance policy.
 */
export const disablePolicy =
  async (policyId) => {
    if (!policyId) {
      throw new Error(
        "Policy ID is required."
      );
    }

    const response =
      await apiClient.post(
        `/governance/policies/${encodeURIComponent(
          policyId
        )}/disable`
      );

    return getResponseData(
      response
    );
  };

/**
 * Evaluate a policy.
 */
export const evaluatePolicy =
  async (
    policyId,
    evaluationData = {}
  ) => {
    if (!policyId) {
      throw new Error(
        "Policy ID is required."
      );
    }

    const response =
      await apiClient.post(
        `/governance/policies/${encodeURIComponent(
          policyId
        )}/evaluate`,
        evaluationData
      );

    return getResponseData(
      response
    );
  };

/**
 * Get approval requests.
 */
export const getApprovalRequests =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/governance/approvals",
        {
          params:
            buildQueryParams(
              params
            ),
        }
      );

    return getResponseData(
      response
    );
  };

/**
 * Get a single approval request.
 */
export const getApprovalRequest =
  async (approvalId) => {
    if (!approvalId) {
      throw new Error(
        "Approval ID is required."
      );
    }

    const response =
      await apiClient.get(
        `/governance/approvals/${encodeURIComponent(
          approvalId
        )}`
      );

    return getResponseData(
      response
    );
  };

/**
 * Create approval request.
 */
export const createApprovalRequest =
  async (approvalData) => {
    if (
      !approvalData ||
      typeof approvalData !==
        "object"
    ) {
      throw new Error(
        "Approval data is required."
      );
    }

    const response =
      await apiClient.post(
        "/governance/approvals",
        approvalData
      );

    return getResponseData(
      response
    );
  };

/**
 * Approve an approval request.
 */
export const approveRequest =
  async (
    approvalId,
    decisionData = {}
  ) => {
    if (!approvalId) {
      throw new Error(
        "Approval ID is required."
      );
    }

    const response =
      await apiClient.post(
        `/governance/approvals/${encodeURIComponent(
          approvalId
        )}/approve`,
        decisionData
      );

    return getResponseData(
      response
    );
  };

/**
 * Reject an approval request.
 */
export const rejectRequest =
  async (
    approvalId,
    decisionData = {}
  ) => {
    if (!approvalId) {
      throw new Error(
        "Approval ID is required."
      );
    }

    const response =
      await apiClient.post(
        `/governance/approvals/${encodeURIComponent(
          approvalId
        )}/reject`,
        decisionData
      );

    return getResponseData(
      response
    );
  };

/**
 * Cancel an approval request.
 */
export const cancelApprovalRequest =
  async (approvalId) => {
    if (!approvalId) {
      throw new Error(
        "Approval ID is required."
      );
    }

    const response =
      await apiClient.post(
        `/governance/approvals/${encodeURIComponent(
          approvalId
        )}/cancel`
      );

    return getResponseData(
      response
    );
  };

/**
 * Get audit trail.
 */
export const getAuditTrail =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/governance/audit-trail",
        {
          params:
            buildQueryParams(
              params
            ),
        }
      );

    return getResponseData(
      response
    );
  };

/**
 * Get a single audit event.
 */
export const getAuditEvent =
  async (eventId) => {
    if (!eventId) {
      throw new Error(
        "Audit event ID is required."
      );
    }

    const response =
      await apiClient.get(
        `/governance/audit-trail/${encodeURIComponent(
          eventId
        )}`
      );

    return getResponseData(
      response
    );
  };

/**
 * Get compliance status.
 */
export const getComplianceStatus =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/governance/compliance",
        {
          params:
            buildQueryParams(
              params
            ),
        }
      );

    return getResponseData(
      response
    );
  };

/**
 * Run compliance check.
 */
export const runComplianceCheck =
  async (checkData = {}) => {
    const response =
      await apiClient.post(
        "/governance/compliance/check",
        checkData
      );

    return getResponseData(
      response
    );
  };

/**
 * Get governance decisions.
 */
export const getGovernanceDecisions =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/governance/decisions",
        {
          params:
            buildQueryParams(
              params
            ),
        }
      );

    return getResponseData(
      response
    );
  };

/**
 * Export audit trail.
 */
export const exportAuditTrail =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/governance/audit-trail/export",
        {
          params:
            buildQueryParams(
              params
            ),
          responseType: "blob",
        }
      );

    return response;
  };

/**
 * Governance API service.
 */
const governanceApi = {
  getGovernanceOverview,

  getPolicies,

  getPolicy,

  createPolicy,

  updatePolicy,

  deletePolicy,

  enablePolicy,

  disablePolicy,

  evaluatePolicy,

  getApprovalRequests,

  getApprovalRequest,

  createApprovalRequest,

  approveRequest,

  rejectRequest,

  cancelApprovalRequest,

  getAuditTrail,

  getAuditEvent,

  getComplianceStatus,

  runComplianceCheck,

  getGovernanceDecisions,

  exportAuditTrail,
};

export default governanceApi;