"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import logsApi from "../services/logsApi";

import {
  normalizeApiError,
} from "../errors/ApiError";

/**
 * Enterprise Logs Hook
 *
 * Responsibilities:
 * - Fetch logs
 * - Search logs
 * - Filter logs
 * - Pagination
 * - Log details
 * - Export logs
 * - Delete logs
 * - Refresh logs
 * - Optional polling
 * - Loading states
 * - Error normalization
 */

/**
 * Default log filters.
 */
const DEFAULT_FILTERS = {
  search: "",
  level: "",
  service: "",
  environment: "",
  source: "",
  requestId: "",
  userId: "",
  startDate: "",
  endDate: "",
};

/**
 * Default pagination.
 */
const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 50,
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
 * Normalize paginated log response.
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
        data.logs ||
        data.results ||
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
    50;

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
 * Main useLogs hook.
 */
const useLogs = (
  options = {}
) => {
  const {
    enabled = true,
    initialFilters = {},
    initialPage = 1,
    initialPageSize = 50,
    autoRefresh = false,
    refreshInterval = 30000,
  } = options;

  /**
   * Logs collection.
   */
  const [
    logs,
    setLogs,
  ] = useState([]);

  /**
   * Selected log.
   */
  const [
    selectedLog,
    setSelectedLog,
  ] = useState(null);

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
    isLoadingLog,
    setIsLoadingLog,
  ] = useState(false);

  const [
    isExporting,
    setIsExporting,
  ] = useState(false);

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  /**
   * Errors.
   */
  const [
    error,
    setError,
  ] = useState(null);

  const [
    logError,
    setLogError,
  ] = useState(null);

  const [
    exportError,
    setExportError,
  ] = useState(null);

  const [
    deleteError,
    setDeleteError,
  ] = useState(null);

  /**
   * Last fetched timestamp.
   */
  const [
    lastFetchedAt,
    setLastFetchedAt,
  ] = useState(null);

  /**
   * Build request parameters.
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

        level:
          filters.level ||
          undefined,

        service:
          filters.service ||
          undefined,

        environment:
          filters.environment ||
          undefined,

        source:
          filters.source ||
          undefined,

        requestId:
          filters.requestId ||
          undefined,

        userId:
          filters.userId ||
          undefined,

        startDate:
          filters.startDate ||
          undefined,

        endDate:
          filters.endDate ||
          undefined,
      }),
      [
        pagination.page,
        pagination.pageSize,
        filters.search,
        filters.level,
        filters.service,
        filters.environment,
        filters.source,
        filters.requestId,
        filters.userId,
        filters.startDate,
        filters.endDate,
      ]
    );

  /**
   * Fetch logs.
   */
  const fetchLogs =
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

        setLogError(null);

        try {
          const response =
            await logsApi.listLogs(
              getRequestParams()
            );

          const normalized =
            normalizePaginatedResponse(
              response
            );

          setLogs(
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

          setLastFetchedAt(
            new Date()
          );

          return normalized;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/logs",
                method: "GET",
              }
            );

          setLogError(
            normalizedError
          );

          setError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsFetching(false);

          setIsLoading(false);
        }
      },
      [
        enabled,
        getRequestParams,
      ]
    );

  /**
   * Fetch a single log.
   */
  const fetchLog =
    useCallback(
      async (
        logId
      ) => {
        if (!logId) {
          throw new Error(
            "Log ID is required."
          );
        }

        setIsLoadingLog(
          true
        );

        setLogError(null);

        try {
          const response =
            await logsApi.getLog(
              logId
            );

          const data =
            normalizeResponse(
              response
            );

          setSelectedLog(data);

          return data;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  `/logs/${logId}`,
                method: "GET",
              }
            );

          setLogError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingLog(
            false
          );
        }
      },
      []
    );

  /**
   * Select a log already
   * available in the collection.
   */
  const selectLog =
    useCallback(
      (log) => {
        setSelectedLog(
          log || null
        );
      },
      []
    );

  /**
   * Clear selected log.
   */
  const clearSelectedLog =
    useCallback(
      () => {
        setSelectedLog(null);
      },
      []
    );

  /**
   * Export logs.
   */
  const exportLogs =
    useCallback(
      async (
        exportOptions = {}
      ) => {
        setIsExporting(true);

        setExportError(null);

        try {
          const response =
            await logsApi.exportLogs(
              {
                ...getRequestParams(),
                ...exportOptions,
              }
            );

          return response;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/logs/export",
                method: "POST",
              }
            );

          setExportError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsExporting(false);
        }
      },
      [getRequestParams]
    );

  /**
   * Delete a single log.
   */
  const deleteLog =
    useCallback(
      async (
        logId
      ) => {
        if (!logId) {
          throw new Error(
            "Log ID is required."
          );
        }

        setIsDeleting(true);

        setDeleteError(null);

        try {
          await logsApi.deleteLog(
            logId
          );

          setLogs(
            (currentLogs) =>
              currentLogs.filter(
                (log) =>
                  log.id !== logId
              )
          );

          setSelectedLog(
            (current) =>
              current?.id === logId
                ? null
                : current
          );

          setPagination(
            (current) => ({
              ...current,
              total: Math.max(
                0,
                current.total - 1
              ),
            })
          );

          return true;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  `/logs/${logId}`,
                method: "DELETE",
              }
            );

          setDeleteError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsDeleting(false);
        }
      },
      []
    );

  /**
   * Delete multiple logs.
   */
  const deleteLogs =
    useCallback(
      async (
        logIds
      ) => {
        if (
          !Array.isArray(logIds) ||
          logIds.length === 0
        ) {
          throw new Error(
            "At least one log ID is required."
          );
        }

        setIsDeleting(true);

        setDeleteError(null);

        try {
          await logsApi.deleteLogs(
            logIds
          );

          const ids =
            new Set(logIds);

          setLogs(
            (currentLogs) =>
              currentLogs.filter(
                (log) =>
                  !ids.has(log.id)
              )
          );

          setSelectedLog(
            (current) =>
              current &&
              ids.has(current.id)
                ? null
                : current
          );

          setPagination(
            (current) => ({
              ...current,
              total: Math.max(
                0,
                current.total -
                  logIds.length
              ),
            })
          );

          return true;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/logs/bulk-delete",
                method: "POST",
              }
            );

          setDeleteError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsDeleting(false);
        }
      },
      []
    );

  /**
   * Set pagination page.
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
            Number(pageSize) || 50
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
   * Search logs.
   */
  const search =
    useCallback(
      (value) => {
        setFilters({
          search:
            value || "",
        });
      },
      [setFilters]
    );

  /**
   * Filter by log level.
   */
  const filterByLevel =
    useCallback(
      (level) => {
        setFilters({
          level:
            level || "",
        });
      },
      [setFilters]
    );

  /**
   * Filter by service.
   */
  const filterByService =
    useCallback(
      (service) => {
        setFilters({
          service:
            service || "",
        });
      },
      [setFilters]
    );

  /**
   * Filter by environment.
   */
  const filterByEnvironment =
    useCallback(
      (environment) => {
        setFilters({
          environment:
            environment || "",
        });
      },
      [setFilters]
    );

  /**
   * Filter by request ID.
   */
  const filterByRequestId =
    useCallback(
      (requestId) => {
        setFilters({
          requestId:
            requestId || "",
        });
      },
      [setFilters]
    );

  /**
   * Set date range.
   */
  const setDateRange =
    useCallback(
      (
        startDate,
        endDate
      ) => {
        setFilters({
          startDate:
            startDate || "",

          endDate:
            endDate || "",
        });
      },
      [setFilters]
    );

  /**
   * Reset all filters.
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
   * Refresh logs.
   */
  const refresh =
    useCallback(
      async () => {
        return fetchLogs({
          force: true,
        });
      },
      [fetchLogs]
    );

  /**
   * Clear errors.
   */
  const clearErrors =
    useCallback(
      () => {
        setError(null);

        setLogError(null);

        setExportError(null);

        setDeleteError(null);
      },
      []
    );

  /**
   * Initial fetch.
   */
  useEffect(
    () => {
      if (!enabled) {
        return;
      }

      fetchLogs().catch(
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
      fetchLogs,
    ]
  );

  /**
   * Auto-refresh logs.
   */
  useEffect(
    () => {
      if (
        !enabled ||
        !autoRefresh ||
        refreshInterval <= 0
      ) {
        return undefined;
      }

      const intervalId =
        setInterval(
          () => {
            fetchLogs({
              force: true,
            }).catch(() => {
              /**
               * Background refresh
               * errors are handled
               * internally.
               */
            });
          },
          refreshInterval
        );

      return () => {
        clearInterval(
          intervalId
        );
      };
    },
    [
      enabled,
      autoRefresh,
      refreshInterval,
      fetchLogs,
    ]
  );

  /**
   * Derived log counts.
   */
  const errorCount =
    useMemo(
      () =>
        logs.filter(
          (log) =>
            String(
              log.level || ""
            ).toLowerCase() ===
              "error" ||
            String(
              log.level || ""
            ).toLowerCase() ===
              "fatal"
        ).length,
      [logs]
    );

  const warningCount =
    useMemo(
      () =>
        logs.filter(
          (log) =>
            String(
              log.level || ""
            ).toLowerCase() ===
              "warn" ||
            String(
              log.level || ""
            ).toLowerCase() ===
              "warning"
        ).length,
      [logs]
    );

  const infoCount =
    useMemo(
      () =>
        logs.filter(
          (log) =>
            String(
              log.level || ""
            ).toLowerCase() ===
            "info"
        ).length,
      [logs]
    );

  /**
   * Check whether logs exist.
   */
  const hasLogs =
    useMemo(
      () =>
        logs.length > 0,
      [logs]
    );

  /**
   * Empty state.
   */
  const isEmpty =
    useMemo(
      () =>
        !isFetching &&
        logs.length === 0,
      [
        isFetching,
        logs,
      ]
    );

  /**
   * Return public API.
   */
  return {
    /**
     * Data.
     */
    logs,

    selectedLog,

    /**
     * Filters.
     */
    filters,

    /**
     * Pagination.
     */
    pagination,

    /**
     * Log statistics.
     */
    errorCount,

    warningCount,

    infoCount,

    hasLogs,

    isEmpty,

    /**
     * Loading states.
     */
    isLoading,

    isFetching,

    isLoadingLog,

    isExporting,

    isDeleting,

    /**
     * Errors.
     */
    error,

    logError,

    exportError,

    deleteError,

    /**
     * Metadata.
     */
    lastFetchedAt,

    /**
     * Fetch operations.
     */
    fetchLogs,

    fetchLog,

    refresh,

    /**
     * Selection.
     */
    selectLog,

    clearSelectedLog,

    /**
     * Log operations.
     */
    exportLogs,

    deleteLog,

    deleteLogs,

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

    filterByLevel,

    filterByService,

    filterByEnvironment,

    filterByRequestId,

    setDateRange,

    resetFilters,

    /**
     * Error handling.
     */
    clearErrors,
  };
};

export default useLogs;