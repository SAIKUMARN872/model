"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import securityApi from "../../services/security/securityApi";

import {
  normalizeApiError,
} from "../../errors/ApiError";

/**
 * Enterprise Security Hook
 *
 * Responsibilities:
 * - Security overview
 * - Security events
 * - API key security status
 * - Active sessions
 * - Vulnerability findings
 * - Access policies
 * - MFA status
 * - Revoke sessions
 * - Revoke API keys
 * - Resolve security findings
 * - Search and filtering
 * - Loading states
 * - Error normalization
 * - Refresh support
 */

/**
 * Default filters.
 */
const DEFAULT_FILTERS = {
  search: "",
  status: "",
  severity: "",
  eventType: "",
  resourceType: "",
  environment: "",
};

/**
 * Default pagination.
 */
const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 0,
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
    typeof response.data === "object"
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
    normalizeResponse(response);

  if (Array.isArray(data)) {
    return data;
  }

  for (const key of keys) {
    if (Array.isArray(data[key])) {
      return data[key];
    }
  }

  if (Array.isArray(data.items)) {
    return data.items;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  return [];
};

/**
 * Normalize paginated response.
 */
const normalizePaginatedResponse = (
  response
) => {
  const data =
    normalizeResponse(response);

  const items =
    Array.isArray(data)
      ? data
      : data.items ||
        data.events ||
        data.findings ||
        data.sessions ||
        data.data ||
        [];

  const total =
    data.total ??
    data.pagination?.total ??
    items.length;

  const page =
    data.page ??
    data.pagination?.page ??
    1;

  const pageSize =
    data.pageSize ??
    data.pagination?.pageSize ??
    20;

  const totalPages =
    data.totalPages ??
    data.pagination?.totalPages ??
    Math.ceil(
      total /
        Math.max(pageSize, 1)
    );

  return {
    items: Array.isArray(items)
      ? items
      : [],
    total,
    page,
    pageSize,
    totalPages,
  };
};

/**
 * Main useSecurity hook.
 */
const useSecurity = (
  options = {}
) => {
  const {
    enabled = true,
    initialFilters = {},
    initialPage = 1,
    initialPageSize = 20,
  } = options;

  /**
   * Security overview.
   */
  const [
    overview,
    setOverview,
  ] = useState(null);

  /**
   * Security events.
   */
  const [
    securityEvents,
    setSecurityEvents,
  ] = useState([]);

  /**
   * Active sessions.
   */
  const [
    sessions,
    setSessions,
  ] = useState([]);

  /**
   * Vulnerability findings.
   */
  const [
    vulnerabilities,
    setVulnerabilities,
  ] = useState([]);

  /**
   * Access policies.
   */
  const [
    accessPolicies,
    setAccessPolicies,
  ] = useState([]);

  /**
   * API key security information.
   */
  const [
    apiKeys,
    setApiKeys,
  ] = useState([]);

  /**
   * MFA status.
   */
  const [
    mfaStatus,
    setMfaStatus,
  ] = useState(null);

  /**
   * Pagination.
   */
  const [
    pagination,
    setPagination,
  ] = useState({
    ...DEFAULT_PAGINATION,
    page: initialPage,
    pageSize: initialPageSize,
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
    isLoadingEvents,
    setIsLoadingEvents,
  ] = useState(false);

  const [
    isLoadingSessions,
    setIsLoadingSessions,
  ] = useState(false);

  const [
    isLoadingVulnerabilities,
    setIsLoadingVulnerabilities,
  ] = useState(false);

  const [
    isLoadingPolicies,
    setIsLoadingPolicies,
  ] = useState(false);

  const [
    isLoadingApiKeys,
    setIsLoadingApiKeys,
  ] = useState(false);

  const [
    isLoadingMfa,
    setIsLoadingMfa,
  ] = useState(false);

  const [
    isRevokingSession,
    setIsRevokingSession,
  ] = useState(false);

  const [
    isRevokingApiKey,
    setIsRevokingApiKey,
  ] = useState(false);

  const [
    isResolvingVulnerability,
    setIsResolvingVulnerability,
  ] = useState(false);

  /**
   * Error states.
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
    eventsError,
    setEventsError,
  ] = useState(null);

  const [
    sessionsError,
    setSessionsError,
  ] = useState(null);

  const [
    vulnerabilityError,
    setVulnerabilityError,
  ] = useState(null);

  const [
    policyError,
    setPolicyError,
  ] = useState(null);

  const [
    apiKeyError,
    setApiKeyError,
  ] = useState(null);

  const [
    mfaError,
    setMfaError,
  ] = useState(null);

  /**
   * Last successful fetch.
   */
  const [
    lastFetchedAt,
    setLastFetchedAt,
  ] = useState(null);

  /**
   * Build common request parameters.
   */
  const getRequestParams =
    useCallback(
      () => ({
        page: pagination.page,

        pageSize:
          pagination.pageSize,

        search:
          filters.search ||
          undefined,

        status:
          filters.status ||
          undefined,

        severity:
          filters.severity ||
          undefined,

        eventType:
          filters.eventType ||
          undefined,

        resourceType:
          filters.resourceType ||
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
        filters.severity,
        filters.eventType,
        filters.resourceType,
        filters.environment,
      ]
    );

  /**
   * Fetch security overview.
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

        setOverviewError(null);

        try {
          const response =
            await securityApi.getOverview();

          const data =
            normalizeResponse(
              response
            );

          setOverview(data);

          return data;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/security/overview",
                method: "GET",
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
      [enabled]
    );

  /**
   * Fetch security events.
   */
  const fetchSecurityEvents =
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

        setIsLoadingEvents(
          true
        );

        setEventsError(null);

        try {
          const response =
            await securityApi.listEvents(
              getRequestParams()
            );

          const normalized =
            normalizePaginatedResponse(
              response
            );

          setSecurityEvents(
            normalized.items
          );

          setPagination(
            (current) => ({
              ...current,
              page:
                normalized.page,
              pageSize:
                normalized.pageSize,
              total:
                normalized.total,
              totalPages:
                normalized.totalPages,
            })
          );

          return normalized;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/security/events",
                method: "GET",
              }
            );

          setEventsError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingEvents(
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
   * Fetch active sessions.
   */
  const fetchSessions =
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

        setIsLoadingSessions(
          true
        );

        setSessionsError(null);

        try {
          const response =
            await securityApi.listSessions(
              getRequestParams()
            );

          const items =
            normalizeCollection(
              response,
              [
                "sessions",
                "activeSessions",
              ]
            );

          setSessions(items);

          return items;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/security/sessions",
                method: "GET",
              }
            );

          setSessionsError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingSessions(
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
   * Fetch vulnerabilities.
   */
  const fetchVulnerabilities =
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

        setIsLoadingVulnerabilities(
          true
        );

        setVulnerabilityError(
          null
        );

        try {
          const response =
            await securityApi.listVulnerabilities(
              getRequestParams()
            );

          const normalized =
            normalizePaginatedResponse(
              response
            );

          setVulnerabilities(
            normalized.items
          );

          return normalized;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/security/vulnerabilities",
                method: "GET",
              }
            );

          setVulnerabilityError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingVulnerabilities(
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
   * Fetch access policies.
   */
  const fetchAccessPolicies =
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

        setIsLoadingPolicies(
          true
        );

        setPolicyError(null);

        try {
          const response =
            await securityApi.listAccessPolicies();

          const items =
            normalizeCollection(
              response,
              [
                "policies",
                "accessPolicies",
              ]
            );

          setAccessPolicies(
            items
          );

          return items;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/security/access-policies",
                method: "GET",
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
      [enabled]
    );

  /**
   * Fetch API key security data.
   */
  const fetchApiKeys =
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

        setIsLoadingApiKeys(
          true
        );

        setApiKeyError(null);

        try {
          const response =
            await securityApi.listApiKeys();

          const items =
            normalizeCollection(
              response,
              [
                "apiKeys",
                "keys",
              ]
            );

          setApiKeys(items);

          return items;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/security/api-keys",
                method: "GET",
              }
            );

          setApiKeyError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingApiKeys(
            false
          );
        }
      },
      [enabled]
    );

  /**
   * Fetch MFA status.
   */
  const fetchMfaStatus =
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

        setIsLoadingMfa(true);

        setMfaError(null);

        try {
          const response =
            await securityApi.getMfaStatus();

          const data =
            normalizeResponse(
              response
            );

          setMfaStatus(data);

          return data;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/security/mfa",
                method: "GET",
              }
            );

          setMfaError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingMfa(false);
        }
      },
      [enabled]
    );

  /**
   * Fetch all security data.
   *
   * Promise.allSettled allows
   * partial dashboard rendering.
   */
  const fetchSecurity =
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

        setIsFetching(true);

        setIsLoading(true);

        setError(null);

        try {
          const results =
            await Promise.allSettled(
              [
                fetchOverview(
                  requestOptions
                ),

                fetchSecurityEvents(
                  requestOptions
                ),

                fetchSessions(
                  requestOptions
                ),

                fetchVulnerabilities(
                  requestOptions
                ),

                fetchAccessPolicies(
                  requestOptions
                ),

                fetchApiKeys(
                  requestOptions
                ),

                fetchMfaStatus(
                  requestOptions
                ),
              ]
            );

          const rejected =
            results.filter(
              (result) =>
                result.status ===
                "rejected"
            );

          if (
            rejected.length > 0
          ) {
            setError(
              rejected[0].reason
            );
          }

          setLastFetchedAt(
            new Date()
          );

          return results;
        } finally {
          setIsFetching(false);

          setIsLoading(false);
        }
      },
      [
        enabled,
        fetchOverview,
        fetchSecurityEvents,
        fetchSessions,
        fetchVulnerabilities,
        fetchAccessPolicies,
        fetchApiKeys,
        fetchMfaStatus,
      ]
    );

  /**
   * Revoke an active session.
   */
  const revokeSession =
    useCallback(
      async (
        sessionId
      ) => {
        if (!sessionId) {
          throw new Error(
            "Session ID is required."
          );
        }

        setIsRevokingSession(
          true
        );

        setSessionsError(null);

        try {
          await securityApi.revokeSession(
            sessionId
          );

          setSessions(
            (currentSessions) =>
              currentSessions.filter(
                (session) =>
                  session.id !==
                  sessionId
              )
          );

          return true;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  `/security/sessions/${sessionId}/revoke`,
                method: "POST",
              }
            );

          setSessionsError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsRevokingSession(
            false
          );
        }
      },
      []
    );

  /**
   * Revoke API key.
   */
  const revokeApiKey =
    useCallback(
      async (
        apiKeyId
      ) => {
        if (!apiKeyId) {
          throw new Error(
            "API key ID is required."
          );
        }

        setIsRevokingApiKey(
          true
        );

        setApiKeyError(null);

        try {
          await securityApi.revokeApiKey(
            apiKeyId
          );

          setApiKeys(
            (currentKeys) =>
              currentKeys.map(
                (key) =>
                  key.id === apiKeyId
                    ? {
                        ...key,
                        status:
                          "revoked",
                      }
                    : key
              )
          );

          return true;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  `/security/api-keys/${apiKeyId}/revoke`,
                method: "POST",
              }
            );

          setApiKeyError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsRevokingApiKey(
            false
          );
        }
      },
      []
    );

  /**
   * Resolve vulnerability.
   */
  const resolveVulnerability =
    useCallback(
      async (
        vulnerabilityId,
        payload = {}
      ) => {
        if (!vulnerabilityId) {
          throw new Error(
            "Vulnerability ID is required."
          );
        }

        setIsResolvingVulnerability(
          true
        );

        setVulnerabilityError(
          null
        );

        try {
          const response =
            await securityApi.resolveVulnerability(
              vulnerabilityId,
              payload
            );

          setVulnerabilities(
            (currentItems) =>
              currentItems.map(
                (item) =>
                  item.id ===
                  vulnerabilityId
                    ? {
                        ...item,
                        status:
                          "resolved",
                        ...response,
                      }
                    : item
              )
          );

          return response;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  `/security/vulnerabilities/${vulnerabilityId}/resolve`,
                method: "POST",
              }
            );

          setVulnerabilityError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsResolvingVulnerability(
            false
          );
        }
      },
      []
    );

  /**
   * Set page.
   */
  const setPage =
    useCallback(
      (page) => {
        const nextPage =
          Math.max(
            1,
            Number(page) || 1
          );

        setPagination(
          (current) => ({
            ...current,
            page: nextPage,
          })
        );
      },
      []
    );

  /**
   * Set page size.
   */
  const setPageSize =
    useCallback(
      (pageSize) => {
        const nextPageSize =
          Math.max(
            1,
            Number(pageSize) || 20
          );

        setPagination(
          (current) => ({
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
      (updates) => {
        setFiltersState(
          (current) => ({
            ...current,
            ...updates,
          })
        );

        setPagination(
          (current) => ({
            ...current,
            page: 1,
          })
        );
      },
      []
    );

  /**
   * Search security events.
   */
  const search =
    useCallback(
      (value) => {
        setFilters({
          search: value || "",
        });
      },
      [setFilters]
    );

  /**
   * Filter by status.
   */
  const filterByStatus =
    useCallback(
      (status) => {
        setFilters({
          status: status || "",
        });
      },
      [setFilters]
    );

  /**
   * Filter by severity.
   */
  const filterBySeverity =
    useCallback(
      (severity) => {
        setFilters({
          severity:
            severity || "",
        });
      },
      [setFilters]
    );

  /**
   * Filter by event type.
   */
  const filterByEventType =
    useCallback(
      (eventType) => {
        setFilters({
          eventType:
            eventType || "",
        });
      },
      [setFilters]
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
          (current) => ({
            ...current,
            page: 1,
          })
        );
      },
      []
    );

  /**
   * Clear all errors.
   */
  const clearErrors =
    useCallback(
      () => {
        setError(null);

        setOverviewError(null);

        setEventsError(null);

        setSessionsError(null);

        setVulnerabilityError(
          null
        );

        setPolicyError(null);

        setApiKeyError(null);

        setMfaError(null);
      },
      []
    );

  /**
   * Refresh all security data.
   */
  const refresh =
    useCallback(
      async () => {
        return fetchSecurity({
          force: true,
        });
      },
      [fetchSecurity]
    );

  /**
   * Initial fetch.
   */
  useEffect(
    () => {
      if (!enabled) {
        return;
      }

      fetchSecurity().catch(
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
      fetchSecurity,
    ]
  );

  /**
   * Derived states.
   */
  const hasOverview =
    useMemo(
      () => Boolean(overview),
      [overview]
    );

  const hasSecurityEvents =
    useMemo(
      () =>
        securityEvents.length > 0,
      [securityEvents]
    );

  const hasSessions =
    useMemo(
      () =>
        sessions.length > 0,
      [sessions]
    );

  const hasVulnerabilities =
    useMemo(
      () =>
        vulnerabilities.length > 0,
      [vulnerabilities]
    );

  const hasAccessPolicies =
    useMemo(
      () =>
        accessPolicies.length > 0,
      [accessPolicies]
    );

  const hasApiKeys =
    useMemo(
      () =>
        apiKeys.length > 0,
      [apiKeys]
    );

  const isEmpty =
    useMemo(
      () =>
        !isFetching &&
        !hasOverview &&
        !hasSecurityEvents &&
        !hasSessions &&
        !hasVulnerabilities &&
        !hasAccessPolicies &&
        !hasApiKeys &&
        !mfaStatus,
      [
        isFetching,
        hasOverview,
        hasSecurityEvents,
        hasSessions,
        hasVulnerabilities,
        hasAccessPolicies,
        hasApiKeys,
        mfaStatus,
      ]
    );

  /**
   * Public hook API.
   */
  return {
    /**
     * Security data.
     */
    overview,

    securityEvents,

    sessions,

    vulnerabilities,

    accessPolicies,

    apiKeys,

    mfaStatus,

    /**
     * Pagination.
     */
    pagination,

    /**
     * Filters.
     */
    filters,

    /**
     * Loading states.
     */
    isLoading,

    isFetching,

    isLoadingOverview,

    isLoadingEvents,

    isLoadingSessions,

    isLoadingVulnerabilities,

    isLoadingPolicies,

    isLoadingApiKeys,

    isLoadingMfa,

    isRevokingSession,

    isRevokingApiKey,

    isResolvingVulnerability,

    /**
     * Errors.
     */
    error,

    overviewError,

    eventsError,

    sessionsError,

    vulnerabilityError,

    policyError,

    apiKeyError,

    mfaError,

    /**
     * Metadata.
     */
    lastFetchedAt,

    hasOverview,

    hasSecurityEvents,

    hasSessions,

    hasVulnerabilities,

    hasAccessPolicies,

    hasApiKeys,

    isEmpty,

    /**
     * Fetch methods.
     */
    fetchOverview,

    fetchSecurityEvents,

    fetchSessions,

    fetchVulnerabilities,

    fetchAccessPolicies,

    fetchApiKeys,

    fetchMfaStatus,

    fetchSecurity,

    refresh,

    /**
     * Security actions.
     */
    revokeSession,

    revokeApiKey,

    resolveVulnerability,

    /**
     * Pagination.
     */
    setPage,

    setPageSize,

    /**
     * Filters.
     */
    setFilters,

    search,

    filterByStatus,

    filterBySeverity,

    filterByEventType,

    resetFilters,

    /**
     * Error handling.
     */
    clearErrors,
  };
};

export default useSecurity;