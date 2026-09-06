"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import governanceApi from "../../services/governance/governanceApi";

import {
  normalizeApiError,
} from "../../errors/ApiError";

/**
 * Enterprise Governance Hook
 *
 * Responsibilities:
 * - Fetch governance overview
 * - Fetch policies
 * - Fetch approval requests
 * - Fetch audit trail
 * - Fetch compliance status
 * - Create/update/delete policies
 * - Approve/reject requests
 * - Pagination
 * - Search/filtering
 * - Loading states
 * - Error normalization
 * - Refresh support
 */

/**
 * Default pagination.
 */
const DEFAULT_PAGE = 1;

const DEFAULT_PAGE_SIZE = 20;

/**
 * Default governance filters.
 */
const DEFAULT_FILTERS = {
  search: "",
  status: "",
  policyType: "",
  resourceType: "",
  severity: "",
  environment: "",
};

/**
 * Normalize API response.
 */
const normalizeResponse = (
  response
) => {
  if (!response) {
    return {};
  }

  if (
    response.data &&
    typeof response.data ===
      "object"
  ) {
    return response.data;
  }

  return response;
};

/**
 * Normalize collection response.
 */
const normalizeCollection = (
  response,
  keys = []
) => {
  const data =
    normalizeResponse(
      response
    );

  if (
    Array.isArray(data)
  ) {
    return data;
  }

  for (
    const key of keys
  ) {
    if (
      Array.isArray(
        data[key]
      )
    ) {
      return data[key];
    }
  }

  if (
    Array.isArray(
      data.items
    )
  ) {
    return data.items;
  }

  if (
    Array.isArray(
      data.data
    )
  ) {
    return data.data;
  }

  return [];
};

/**
 * Normalize paginated response.
 */
const normalizePaginatedResponse =
  (
    response
  ) => {
    const data =
      normalizeResponse(
        response
      );

    const items =
      Array.isArray(data)
        ? data
        : data.items ||
          data.policies ||
          data.requests ||
          data.auditLogs ||
          data.data ||
          [];

    const total =
      data.total ??
      data.pagination?.total ??
      items.length;

    const page =
      data.page ??
      data.pagination?.page ??
      DEFAULT_PAGE;

    const pageSize =
      data.pageSize ??
      data.pagination?.pageSize ??
      DEFAULT_PAGE_SIZE;

    const totalPages =
      data.totalPages ??
      data.pagination?.totalPages ??
      Math.ceil(
        total /
          Math.max(
            pageSize,
            1
          )
      );

    return {
      items: Array.isArray(
        items
      )
        ? items
        : [],

      total,

      page,

      pageSize,

      totalPages,
    };
  };

/**
 * Main useGovernance hook.
 */
const useGovernance = (
  options = {}
) => {
  const {
    enabled = true,

    initialPage =
      DEFAULT_PAGE,

    initialPageSize =
      DEFAULT_PAGE_SIZE,

    initialFilters = {},
  } = options;

  /**
   * Governance overview.
   */
  const [
    overview,
    setOverview,
  ] = useState(null);

  /**
   * Policies.
   */
  const [
    policies,
    setPolicies,
  ] = useState([]);

  /**
   * Approval requests.
   */
  const [
    approvalRequests,
    setApprovalRequests,
  ] = useState([]);

  /**
   * Audit trail.
   */
  const [
    auditTrail,
    setAuditTrail,
  ] = useState([]);

  /**
   * Compliance status.
   */
  const [
    compliance,
    setCompliance,
  ] = useState(null);

  /**
   * Selected policy.
   */
  const [
    selectedPolicy,
    setSelectedPolicy,
  ] = useState(null);

  /**
   * Selected approval request.
   */
  const [
    selectedApprovalRequest,
    setSelectedApprovalRequest,
  ] = useState(null);

  /**
   * Pagination.
   */
  const [
    pagination,
    setPagination,
  ] = useState({
    page:
      initialPage,

    pageSize:
      initialPageSize,

    total: 0,

    totalPages: 0,
  });

  /**
   * Filters.
   */
  const [
    filters,
    setFiltersState,
  ] = useState({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  /**
   * Loading states.
   */
  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    isFetching,
    setIsFetching,
  ] = useState(false);

  const [
    isLoadingOverview,
    setIsLoadingOverview,
  ] = useState(false);

  const [
    isLoadingPolicies,
    setIsLoadingPolicies,
  ] = useState(false);

  const [
    isLoadingApprovals,
    setIsLoadingApprovals,
  ] = useState(false);

  const [
    isLoadingAudit,
    setIsLoadingAudit,
  ] = useState(false);

  const [
    isLoadingCompliance,
    setIsLoadingCompliance,
  ] = useState(false);

  const [
    isCreatingPolicy,
    setIsCreatingPolicy,
  ] = useState(false);

  const [
    isUpdatingPolicy,
    setIsUpdatingPolicy,
  ] = useState(false);

  const [
    isDeletingPolicy,
    setIsDeletingPolicy,
  ] = useState(false);

  const [
    isProcessingApproval,
    setIsProcessingApproval,
  ] = useState(false);

  /**
   * Error state.
   */
  const [
    error,
    setError,
  ] = useState(null);

  const [
    overviewError,
    setOverviewError,
  ] = useState(null);

  const [
    policyError,
    setPolicyError,
  ] = useState(null);

  const [
    approvalError,
    setApprovalError,
  ] = useState(null);

  const [
    auditError,
    setAuditError,
  ] = useState(null);

  const [
    complianceError,
    setComplianceError,
  ] = useState(null);

  /**
   * Last successful fetch.
   */
  const [
    lastFetchedAt,
    setLastFetchedAt,
  ] = useState(null);

  /**
   * Build common API parameters.
   */
  const getRequestParams =
    useCallback(
      () => ({
        page:
          pagination.page,

        pageSize:
          pagination.pageSize,

        search:
          filters.search ||
          undefined,

        status:
          filters.status ||
          undefined,

        policyType:
          filters.policyType ||
          undefined,

        resourceType:
          filters.resourceType ||
          undefined,

        severity:
          filters.severity ||
          undefined,

        environment:
          filters.environment ||
          undefined,
      }),
      [
        pagination.page,
        pagination.pageSize,
        filters.search,
        filters.status,
        filters.policyType,
        filters.resourceType,
        filters.severity,
        filters.environment,
      ]
    );

  /**
   * Fetch governance overview.
   */
  const fetchOverview =
    useCallback(
      async (
        requestOptions = {}
      ) => {
        if (
          !enabled &&
          !requestOptions.force
        ) {
          return null;
        }

        setIsLoadingOverview(
          true
        );

        setOverviewError(
          null
        );

        try {
          const response =
            await governanceApi.getOverview();

          const data =
            normalizeResponse(
              response
            );

          setOverview(
            data
          );

          return data;
        } catch (
          requestError
        ) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/governance/overview",

                method:
                  "GET",
              }
            );

          setOverviewError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingOverview(
            false
          );
        }
      },
      [
        enabled,
      ]
    );

  /**
   * Fetch governance policies.
   */
  const fetchPolicies =
    useCallback(
      async (
        requestOptions = {}
      ) => {
        if (
          !enabled &&
          !requestOptions.force
        ) {
          return null;
        }

        setIsLoadingPolicies(
          true
        );

        setPolicyError(
          null
        );

        try {
          const response =
            await governanceApi.listPolicies(
              getRequestParams()
            );

          const normalized =
            normalizePaginatedResponse(
              response
            );

          setPolicies(
            normalized.items
          );

          setPagination({
            page:
              normalized.page,

            pageSize:
              normalized.pageSize,

            total:
              normalized.total,

            totalPages:
              normalized.totalPages,
          });

          return normalized;
        } catch (
          requestError
        ) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/governance/policies",

                method:
                  "GET",
              }
            );

          setPolicyError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingPolicies(
            false
          );
        }
      },
      [
        enabled,
        getRequestParams,
      ]
    );

  /**
   * Fetch approval requests.
   */
  const fetchApprovalRequests =
    useCallback(
      async (
        requestOptions = {}
      ) => {
        if (
          !enabled &&
          !requestOptions.force
        ) {
          return [];
        }

        setIsLoadingApprovals(
          true
        );

        setApprovalError(
          null
        );

        try {
          const response =
            await governanceApi.listApprovalRequests(
              getRequestParams()
            );

          const items =
            normalizeCollection(
              response,
              [
                "requests",
                "approvals",
              ]
            );

          setApprovalRequests(
            items
          );

          return items;
        } catch (
          requestError
        ) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/governance/approvals",

                method:
                  "GET",
              }
            );

          setApprovalError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingApprovals(
            false
          );
        }
      },
      [
        enabled,
        getRequestParams,
      ]
    );

  /**
   * Fetch audit trail.
   */
  const fetchAuditTrail =
    useCallback(
      async (
        requestOptions = {}
      ) => {
        if (
          !enabled &&
          !requestOptions.force
        ) {
          return [];
        }

        setIsLoadingAudit(
          true
        );

        setAuditError(
          null
        );

        try {
          const response =
            await governanceApi.getAuditTrail(
              getRequestParams()
            );

          const items =
            normalizeCollection(
              response,
              [
                "auditLogs",
                "logs",
                "events",
              ]
            );

          setAuditTrail(
            items
          );

          return items;
        } catch (
          requestError
        ) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/governance/audit",

                method:
                  "GET",
              }
            );

          setAuditError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingAudit(
            false
          );
        }
      },
      [
        enabled,
        getRequestParams,
      ]
    );

  /**
   * Fetch compliance status.
   */
  const fetchCompliance =
    useCallback(
      async (
        requestOptions = {}
      ) => {
        if (
          !enabled &&
          !requestOptions.force
        ) {
          return null;
        }

        setIsLoadingCompliance(
          true
        );

        setComplianceError(
          null
        );

        try {
          const response =
            await governanceApi.getCompliance();

          const data =
            normalizeResponse(
              response
            );

          setCompliance(
            data
          );

          return data;
        } catch (
          requestError
        ) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/governance/compliance",

                method:
                  "GET",
              }
            );

          setComplianceError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingCompliance(
            false
          );
        }
      },
      [
        enabled,
      ]
    );

  /**
   * Fetch all governance data.
   */
  const fetchGovernance =
    useCallback(
      async (
        requestOptions = {}
      ) => {
        if (
          !enabled &&
          !requestOptions.force
        ) {
          return null;
        }

        setIsFetching(
          true
        );

        setIsLoading(
          true
        );

        setError(null);

        try {
          const results =
            await Promise.allSettled(
              [
                fetchOverview(
                  requestOptions
                ),

                fetchPolicies(
                  requestOptions
                ),

                fetchApprovalRequests(
                  requestOptions
                ),

                fetchAuditTrail(
                  requestOptions
                ),

                fetchCompliance(
                  requestOptions
                ),
              ]
            );

          const rejected =
            results.filter(
              (
                result
              ) =>
                result.status ===
                "rejected"
            );

          if (
            rejected.length >
            0
          ) {
            setError(
              rejected[0]
                .reason
            );
          }

          setLastFetchedAt(
            new Date()
          );

          return results;
        } finally {
          setIsFetching(
            false
          );

          setIsLoading(
            false
          );
        }
      },
      [
        enabled,
        fetchOverview,
        fetchPolicies,
        fetchApprovalRequests,
        fetchAuditTrail,
        fetchCompliance,
      ]
    );

  /**
   * Fetch single policy.
   */
  const fetchPolicy =
    useCallback(
      async (
        policyId
      ) => {
        if (!policyId) {
          throw new Error(
            "Policy ID is required."
          );
        }

        setPolicyError(
          null
        );

        try {
          const response =
            await governanceApi.getPolicy(
              policyId
            );

          const data =
            normalizeResponse(
              response
            );

          setSelectedPolicy(
            data
          );

          return data;
        } catch (
          requestError
        ) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  `/governance/policies/${policyId}`,

                method:
                  "GET",
              }
            );

          setPolicyError(
            normalizedError
          );

          throw normalizedError;
        }
      },
      []
    );

  /**
   * Create policy.
   */
  const createPolicy =
    useCallback(
      async (
        payload
      ) => {
        if (!payload) {
          throw new Error(
            "Policy payload is required."
          );
        }

        setIsCreatingPolicy(
          true
        );

        setPolicyError(
          null
        );

        try {
          const response =
            await governanceApi.createPolicy(
              payload
            );

          /**
           * Refresh server state.
           */
          await fetchPolicies({
            force: true,
          });

          return response;
        } catch (
          requestError
        ) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/governance/policies",

                method:
                  "POST",
              }
            );

          setPolicyError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsCreatingPolicy(
            false
          );
        }
      },
      [
        fetchPolicies,
      ]
    );

  /**
   * Update policy.
   */
  const updatePolicy =
    useCallback(
      async (
        policyId,
        payload
      ) => {
        if (!policyId) {
          throw new Error(
            "Policy ID is required."
          );
        }

        if (!payload) {
          throw new Error(
            "Policy payload is required."
          );
        }

        setIsUpdatingPolicy(
          true
        );

        setPolicyError(
          null
        );

        try {
          const response =
            await governanceApi.updatePolicy(
              policyId,
              payload
            );

          /**
           * Update local collection.
           */
          setPolicies(
            (
              currentPolicies
            ) =>
              currentPolicies.map(
                (
                  policy
                ) =>
                  policy.id ===
                  policyId
                    ? {
                        ...policy,
                        ...response,
                      }
                    : policy
              )
          );

          /**
           * Update selected policy.
           */
          setSelectedPolicy(
            (
              currentPolicy
            ) => {
              if (
                currentPolicy?.id !==
                policyId
              ) {
                return currentPolicy;
              }

              return {
                ...currentPolicy,
                ...response,
              };
            }
          );

          return response;
        } catch (
          requestError
        ) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  `/governance/policies/${policyId}`,

                method:
                  "PATCH",
              }
            );

          setPolicyError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsUpdatingPolicy(
            false
          );
        }
      },
      []
    );

  /**
   * Delete policy.
   */
  const deletePolicy =
    useCallback(
      async (
        policyId
      ) => {
        if (!policyId) {
          throw new Error(
            "Policy ID is required."
          );
        }

        setIsDeletingPolicy(
          true
        );

        setPolicyError(
          null
        );

        try {
          await governanceApi.deletePolicy(
            policyId
          );

          setPolicies(
            (
              currentPolicies
            ) =>
              currentPolicies.filter(
                (
                  policy
                ) =>
                  policy.id !==
                  policyId
              )
          );

          setSelectedPolicy(
            (
              currentPolicy
            ) =>
              currentPolicy?.id ===
              policyId
                ? null
                : currentPolicy
          );

          setPagination(
            (
              current
            ) => ({
              ...current,

              total:
                Math.max(
                  0,
                  current.total -
                    1
                ),
            })
          );

          return true;
        } catch (
          requestError
        ) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  `/governance/policies/${policyId}`,

                method:
                  "DELETE",
              }
            );

          setPolicyError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsDeletingPolicy(
            false
          );
        }
      },
      []
    );

  /**
   * Approve an approval request.
   */
  const approveRequest =
    useCallback(
      async (
        requestId,
        payload = {}
      ) => {
        if (!requestId) {
          throw new Error(
            "Approval request ID is required."
          );
        }

        setIsProcessingApproval(
          true
        );

        setApprovalError(
          null
        );

        try {
          const response =
            await governanceApi.approveRequest(
              requestId,
              payload
            );

          /**
           * Update request locally.
           */
          setApprovalRequests(
            (
              currentRequests
            ) =>
              currentRequests.map(
                (
                  request
                ) =>
                  request.id ===
                  requestId
                    ? {
                        ...request,
                        status:
                          "approved",
                        ...response,
                      }
                    : request
              )
          );

          return response;
        } catch (
          requestError
        ) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  `/governance/approvals/${requestId}/approve`,

                method:
                  "POST",
              }
            );

          setApprovalError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsProcessingApproval(
            false
          );
        }
      },
      []
    );

  /**
   * Reject an approval request.
   */
  const rejectRequest =
    useCallback(
      async (
        requestId,
        payload = {}
      ) => {
        if (!requestId) {
          throw new Error(
            "Approval request ID is required."
          );
        }

        setIsProcessingApproval(
          true
        );

        setApprovalError(
          null
        );

        try {
          const response =
            await governanceApi.rejectRequest(
              requestId,
              payload
            );

          setApprovalRequests(
            (
              currentRequests
            ) =>
              currentRequests.map(
                (
                  request
                ) =>
                  request.id ===
                  requestId
                    ? {
                        ...request,
                        status:
                          "rejected",
                        ...response,
                      }
                    : request
              )
          );

          return response;
        } catch (
          requestError
        ) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  `/governance/approvals/${requestId}/reject`,

                method:
                  "POST",
              }
            );

          setApprovalError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsProcessingApproval(
            false
          );
        }
      },
      []
    );

  /**
   * Fetch a single approval request.
   */
  const fetchApprovalRequest =
    useCallback(
      async (
        requestId
      ) => {
        if (!requestId) {
          throw new Error(
            "Approval request ID is required."
          );
        }

        setApprovalError(
          null
        );

        try {
          const response =
            await governanceApi.getApprovalRequest(
              requestId
            );

          const data =
            normalizeResponse(
              response
            );

          setSelectedApprovalRequest(
            data
          );

          return data;
        } catch (
          requestError
        ) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  `/governance/approvals/${requestId}`,

                method:
                  "GET",
              }
            );

          setApprovalError(
            normalizedError
          );

          throw normalizedError;
        }
      },
      []
    );

  /**
   * Pagination.
   */
  const setPage =
    useCallback(
      (
        page
      ) => {
        const nextPage =
          Math.max(
            1,
            Number(page) ||
              1
          );

        setPagination(
          (
            current
          ) => ({
            ...current,

            page:
              nextPage,
          })
        );
      },
      []
    );

  /**
   * Page size.
   */
  const setPageSize =
    useCallback(
      (
        pageSize
      ) => {
        const nextPageSize =
          Math.max(
            1,
            Number(
              pageSize
            ) ||
              DEFAULT_PAGE_SIZE
          );

        setPagination(
          (
            current
          ) => ({
            ...current,

            page: 1,

            pageSize:
              nextPageSize,
          })
        );
      },
      []
    );

  /**
   * Update filters.
   */
  const setFilters =
    useCallback(
      (
        updates
      ) => {
        setFiltersState(
          (
            current
          ) => ({
            ...current,
            ...updates,
          })
        );

        setPagination(
          (
            current
          ) => ({
            ...current,

            page: 1,
          })
        );
      },
      []
    );

  /**
   * Search policies.
   */
  const searchPolicies =
    useCallback(
      (
        search
      ) => {
        setFilters({
          search:
            search || "",
        });
      },
      [
        setFilters,
      ]
    );

  /**
   * Filter by status.
   */
  const filterByStatus =
    useCallback(
      (
        status
      ) => {
        setFilters({
          status:
            status || "",
        });
      },
      [
        setFilters,
      ]
    );

  /**
   * Filter by policy type.
   */
  const filterByPolicyType =
    useCallback(
      (
        policyType
      ) => {
        setFilters({
          policyType:
            policyType || "",
        });
      },
      [
        setFilters,
      ]
    );

  /**
   * Filter by severity.
   */
  const filterBySeverity =
    useCallback(
      (
        severity
      ) => {
        setFilters({
          severity:
            severity || "",
        });
      },
      [
        setFilters,
      ]
    );

  /**
   * Reset filters.
   */
  const resetFilters =
    useCallback(
      () => {
        setFiltersState(
          DEFAULT_FILTERS
        );

        setPagination(
          (
            current
          ) => ({
            ...current,

            page: 1,
          })
        );
      },
      []
    );

  /**
   * Clear selected policy.
   */
  const clearSelectedPolicy =
    useCallback(
      () => {
        setSelectedPolicy(
          null
        );
      },
      []
    );

  /**
   * Clear selected approval.
   */
  const clearSelectedApprovalRequest =
    useCallback(
      () => {
        setSelectedApprovalRequest(
          null
        );
      },
      []
    );

  /**
   * Clear errors.
   */
  const clearErrors =
    useCallback(
      () => {
        setError(null);

        setOverviewError(
          null
        );

        setPolicyError(
          null
        );

        setApprovalError(
          null
        );

        setAuditError(
          null
        );

        setComplianceError(
          null
        );
      },
      []
    );

  /**
   * Refresh governance data.
   */
  const refresh =
    useCallback(
      async () => {
        return fetchGovernance({
          force: true,
        });
      },
      [
        fetchGovernance,
      ]
    );

  /**
   * Initial fetch.
   */
  useEffect(
    () => {
      if (!enabled) {
        return;
      }

      fetchGovernance().catch(
        () => {
          /**
           * Errors are already
           * normalized and stored.
           */
        }
      );
    },
    [
      enabled,
      fetchGovernance,
    ]
  );

  /**
   * Derived state.
   */
  const hasPolicies =
    useMemo(
      () =>
        policies.length >
        0,
      [
        policies,
      ]
    );

  const hasApprovalRequests =
    useMemo(
      () =>
        approvalRequests.length >
        0,
      [
        approvalRequests,
      ]
    );

  const hasAuditTrail =
    useMemo(
      () =>
        auditTrail.length >
        0,
      [
        auditTrail,
      ]
    );

  const hasNextPage =
    useMemo(
      () =>
        pagination.page <
        pagination.totalPages,
      [
        pagination.page,
        pagination.totalPages,
      ]
    );

  const hasPreviousPage =
    useMemo(
      () =>
        pagination.page >
        1,
      [
        pagination.page,
      ]
    );

  const isEmpty =
    useMemo(
      () =>
        !isFetching &&
        !overview &&
        !hasPolicies &&
        !hasApprovalRequests &&
        !hasAuditTrail &&
        !compliance,
      [
        isFetching,
        overview,
        hasPolicies,
        hasApprovalRequests,
        hasAuditTrail,
        compliance,
      ]
    );

  /**
   * Public hook API.
   */
  return {
    /**
     * Governance data.
     */
    overview,

    policies,

    approvalRequests,

    auditTrail,

    compliance,

    selectedPolicy,

    selectedApprovalRequest,

    /**
     * Pagination.
     */
    pagination,

    /**
     * Filters.
     */
    filters,

    /**
     * Loading.
     */
    isLoading,

    isFetching,

    isLoadingOverview,

    isLoadingPolicies,

    isLoadingApprovals,

    isLoadingAudit,

    isLoadingCompliance,

    isCreatingPolicy,

    isUpdatingPolicy,

    isDeletingPolicy,

    isProcessingApproval,

    /**
     * Errors.
     */
    error,

    overviewError,

    policyError,

    approvalError,

    auditError,

    complianceError,

    /**
     * Metadata.
     */
    lastFetchedAt,

    hasPolicies,

    hasApprovalRequests,

    hasAuditTrail,

    hasNextPage,

    hasPreviousPage,

    isEmpty,

    /**
     * Fetch methods.
     */
    fetchOverview,

    fetchPolicies,

    fetchApprovalRequests,

    fetchApprovalRequest,

    fetchAuditTrail,

    fetchCompliance,

    fetchPolicy,

    fetchGovernance,

    refresh,

    /**
     * Policy CRUD.
     */
    createPolicy,

    updatePolicy,

    deletePolicy,

    /**
     * Approval workflow.
     */
    approveRequest,

    rejectRequest,

    /**
     * Pagination controls.
     */
    setPage,

    setPageSize,

    /**
     * Filter controls.
     */
    setFilters,

    searchPolicies,

    filterByStatus,

    filterByPolicyType,

    filterBySeverity,

    resetFilters,

    /**
     * Selection controls.
     */
    setSelectedPolicy,

    clearSelectedPolicy,

    setSelectedApprovalRequest,

    clearSelectedApprovalRequest,

    /**
     * Error controls.
     */
    clearErrors,
  };
};

export default useGovernance;