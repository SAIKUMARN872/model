"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import usageApi from "../services/usageApi";

import {
  normalizeApiError,
} from "../errors/ApiError";

/**
 * Enterprise Usage Management Hook
 *
 * Responsibilities:
 * - Fetch usage data
 * - Filter usage
 * - Date range selection
 * - Model/provider filtering
 * - Pagination
 * - Usage summaries
 * - Token metrics
 * - Cost metrics
 * - Refresh
 * - Auto refresh
 * - Error normalization
 */

/**
 * Default filters.
 */
const DEFAULT_FILTERS = {
  search: "",
  model: "",
  provider: "",
  environment: "",
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
 * Normalize usage collection.
 */
const normalizeUsageCollection = (
  response
) => {
  const data =
    normalizeResponse(response);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.usage)) {
    return data.usage;
  }

  if (Array.isArray(data.items)) {
    return data.items;
  }

  if (Array.isArray(data.results)) {
    return data.results;
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
      : data.usage ||
        data.items ||
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
 * Convert numeric values safely.
 */
const toNumber = (
  value
) => {
  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

/**
 * Main useUsage hook.
 */
const useUsage = (
  options = {}
) => {
  const {
    enabled = true,
    initialFilters = {},
    initialPage = 1,
    initialPageSize = 50,
    autoRefresh = false,
    refreshInterval = 60000,
  } = options;

  /**
   * Usage records.
   */
  const [
    usage,
    setUsage,
  ] = useState([]);

  /**
   * Summary information.
   */
  const [
    summary,
    setSummary,
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
    isLoadingSummary,
    setIsLoadingSummary,
  ] = useState(false);

  /**
   * Errors.
   */
  const [
    error,
    setError,
  ] = useState(null);

  const [
    summaryError,
    setSummaryError,
  ] = useState(null);

  /**
   * Last fetched timestamp.
   */
  const [
    lastFetchedAt,
    setLastFetchedAt,
  ] = useState(null);

  /**
   * Build API request parameters.
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

        model:
          filters.model ||
          undefined,

        provider:
          filters.provider ||
          undefined,

        environment:
          filters.environment ||
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
        filters.model,
        filters.provider,
        filters.environment,
        filters.startDate,
        filters.endDate,
      ]
    );

  /**
   * Fetch usage records.
   */
  const fetchUsage =
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
          const response =
            await usageApi.listUsage(
              getRequestParams()
            );

          const normalized =
            normalizePaginatedResponse(
              response
            );

          setUsage(
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
                  "/usage",
                method: "GET",
              }
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
   * Fetch usage summary.
   */
  const fetchSummary =
    useCallback(
      async (
        summaryOptions = {}
      ) => {
        if (
          !enabled &&
          !summaryOptions.force
        ) {
          return null;
        }

        setIsLoadingSummary(
          true
        );

        setSummaryError(null);

        try {
          const response =
            await usageApi.getSummary(
              {
                ...getRequestParams(),
                ...summaryOptions,
              }
            );

          const data =
            normalizeResponse(
              response
            );

          setSummary(data);

          return data;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/usage/summary",
                method: "GET",
              }
            );

          setSummaryError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingSummary(
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
   * Fetch usage and summary.
   */
  const fetchAll =
    useCallback(
      async (
        requestOptions = {}
      ) => {
        const results =
          await Promise.allSettled([
            fetchUsage(
              requestOptions
            ),
            fetchSummary(
              requestOptions
            ),
          ]);

        return {
          usage:
            results[0].status ===
            "fulfilled"
              ? results[0].value
              : null,

          summary:
            results[1].status ===
            "fulfilled"
              ? results[1].value
              : null,
        };
      },
      [
        fetchUsage,
        fetchSummary,
      ]
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
            page:
              nextPage,
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
        if (!updates) {
          return;
        }

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
   * Search usage.
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
   * Filter by model.
   */
  const filterByModel =
    useCallback(
      (model) => {
        setFilters({
          model:
            model || "",
        });
      },
      [setFilters]
    );

  /**
   * Filter by provider.
   */
  const filterByProvider =
    useCallback(
      (provider) => {
        setFilters({
          provider:
            provider || "",
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
   * Set current month.
   */
  const setCurrentMonth =
    useCallback(
      () => {
        const now =
          new Date();

        const year =
          now.getFullYear();

        const month =
          String(
            now.getMonth() + 1
          ).padStart(
            2,
            "0"
          );

        const startDate =
          `${year}-${month}-01`;

        const lastDay =
          new Date(
            year,
            now.getMonth() + 1,
            0
          ).getDate();

        const endDate =
          `${year}-${month}-${String(
            lastDay
          ).padStart(
            2,
            "0"
          )}`;

        setDateRange(
          startDate,
          endDate
        );
      },
      [setDateRange]
    );

  /**
   * Set previous month.
   */
  const setPreviousMonth =
    useCallback(
      () => {
        const now =
          new Date();

        const previous =
          new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            1
          );

        const year =
          previous.getFullYear();

        const month =
          String(
            previous.getMonth() + 1
          ).padStart(
            2,
            "0"
          );

        const lastDay =
          new Date(
            year,
            previous.getMonth() + 1,
            0
          ).getDate();

        setDateRange(
          `${year}-${month}-01`,
          `${year}-${month}-${String(
            lastDay
          ).padStart(
            2,
            "0"
          )}`
        );
      },
      [setDateRange]
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
   * Refresh usage and summary.
   */
  const refresh =
    useCallback(
      async () => {
        return fetchAll({
          force: true,
        });
      },
      [fetchAll]
    );

  /**
   * Calculate metrics from
   * currently loaded usage.
   */
  const metrics =
    useMemo(
      () => {
        let totalTokens = 0;

        let inputTokens = 0;

        let outputTokens = 0;

        let totalCost = 0;

        let totalRequests = 0;

        let successfulRequests = 0;

        let failedRequests = 0;

        let totalLatency = 0;

        let latencyCount = 0;

        usage.forEach(
          (item) => {
            const itemInputTokens =
              toNumber(
                item.inputTokens ??
                  item.promptTokens ??
                  item.usage?.inputTokens ??
                  item.usage?.promptTokens
              );

            const itemOutputTokens =
              toNumber(
                item.outputTokens ??
                  item.completionTokens ??
                  item.usage?.outputTokens ??
                  item.usage?.completionTokens
              );

            const itemTotalTokens =
              toNumber(
                item.totalTokens ??
                  item.usage?.totalTokens
              ) ||
              itemInputTokens +
                itemOutputTokens;

            const itemCost =
              toNumber(
                item.cost ??
                  item.totalCost ??
                  item.usage?.cost
              );

            const itemLatency =
              toNumber(
                item.latency ??
                  item.latencyMs
              );

            totalTokens +=
              itemTotalTokens;

            inputTokens +=
              itemInputTokens;

            outputTokens +=
              itemOutputTokens;

            totalCost +=
              itemCost;

            totalRequests += 1;

            const status =
              String(
                item.status || ""
              ).toLowerCase();

            if (
              [
                "success",
                "completed",
                "succeeded",
                "ok",
              ].includes(status)
            ) {
              successfulRequests += 1;
            }

            if (
              [
                "failed",
                "error",
                "failure",
              ].includes(status)
            ) {
              failedRequests += 1;
            }

            if (
              itemLatency > 0
            ) {
              totalLatency +=
                itemLatency;

              latencyCount += 1;
            }
          }
        );

        const averageLatency =
          latencyCount > 0
            ? totalLatency /
              latencyCount
            : 0;

        const successRate =
          totalRequests > 0
            ? (
                successfulRequests /
                totalRequests
              ) *
              100
            : 0;

        return {
          totalTokens,

          inputTokens,

          outputTokens,

          totalCost,

          totalRequests,

          successfulRequests,

          failedRequests,

          averageLatency,

          successRate,
        };
      },
      [usage]
    );

  /**
   * Prefer server summary
   * when available.
   */
  const totalTokens =
    toNumber(
      summary?.totalTokens ??
        summary?.tokens ??
        summary?.usage?.totalTokens
    ) ||
    metrics.totalTokens;

  const inputTokens =
    toNumber(
      summary?.inputTokens ??
        summary?.promptTokens ??
        summary?.usage?.inputTokens
    ) ||
    metrics.inputTokens;

  const outputTokens =
    toNumber(
      summary?.outputTokens ??
        summary?.completionTokens ??
        summary?.usage?.outputTokens
    ) ||
    metrics.outputTokens;

  const totalCost =
    toNumber(
      summary?.totalCost ??
        summary?.cost ??
        summary?.usage?.totalCost
    ) ||
    metrics.totalCost;

  const totalRequests =
    toNumber(
      summary?.totalRequests ??
        summary?.requests ??
        summary?.usage?.totalRequests
    ) ||
    metrics.totalRequests;

  /**
   * Check whether usage exists.
   */
  const hasUsage =
    usage.length > 0;

  /**
   * Empty state.
   */
  const isEmpty =
    !isFetching &&
    usage.length === 0;

  /**
   * Clear errors.
   */
  const clearErrors =
    useCallback(
      () => {
        setError(null);

        setSummaryError(null);
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

      fetchAll().catch(
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
      fetchAll,
    ]
  );

  /**
   * Auto refresh.
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
            fetchAll({
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
      fetchAll,
    ]
  );

  /**
   * Return public API.
   */
  return {
    /**
     * Data.
     */
    usage,

    summary,

    metrics,

    /**
     * Aggregated values.
     */
    totalTokens,

    inputTokens,

    outputTokens,

    totalCost,

    totalRequests,

    /**
     * Filters.
     */
    filters,

    /**
     * Pagination.
     */
    pagination,

    /**
     * State.
     */
    hasUsage,

    isEmpty,

    /**
     * Loading.
     */
    isLoading,

    isFetching,

    isLoadingSummary,

    /**
     * Errors.
     */
    error,

    summaryError,

    /**
     * Metadata.
     */
    lastFetchedAt,

    /**
     * Fetch operations.
     */
    fetchUsage,

    fetchSummary,

    fetchAll,

    refresh,

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

    filterByModel,

    filterByProvider,

    filterByEnvironment,

    setDateRange,

    setCurrentMonth,

    setPreviousMonth,

    resetFilters,

    /**
     * Error handling.
     */
    clearErrors,
  };
};

export default useUsage;