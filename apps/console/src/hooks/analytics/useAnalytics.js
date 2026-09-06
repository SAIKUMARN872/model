"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import analyticsApi from "../../services/analytics/analyticsApi";

import {
  normalizeApiError,
} from "../../errors/ApiError";

/**
 * Enterprise Analytics Hook
 *
 * Responsibilities:
 * - Fetch analytics overview
 * - Fetch time-series metrics
 * - Fetch model analytics
 * - Fetch usage analytics
 * - Fetch performance analytics
 * - Date-range filtering
 * - Model filtering
 * - Refresh support
 * - Loading states
 * - Error normalization
 */

/**
 * Default date range.
 */
const DEFAULT_DATE_RANGE = {
  from: null,
  to: null,
};

/**
 * Default analytics filters.
 */
const DEFAULT_FILTERS = {
  modelId: "",
  provider: "",
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
 * Main analytics hook.
 */
const useAnalytics = (
  options = {}
) => {
  const {
    enabled = true,

    initialDateRange = {},

    initialFilters = {},
  } = options;

  /**
   * Analytics overview.
   */
  const [
    overview,
    setOverview,
  ] = useState(null);

  /**
   * Time-series data.
   */
  const [
    timeSeries,
    setTimeSeries,
  ] = useState([]);

  /**
   * Model analytics.
   */
  const [
    modelAnalytics,
    setModelAnalytics,
  ] = useState([]);

  /**
   * Usage analytics.
   */
  const [
    usageAnalytics,
    setUsageAnalytics,
  ] = useState(null);

  /**
   * Performance analytics.
   */
  const [
    performanceAnalytics,
    setPerformanceAnalytics,
  ] = useState(null);

  /**
   * Date range.
   */
  const [
    dateRange,
    setDateRangeState,
  ] = useState({
    ...DEFAULT_DATE_RANGE,
    ...initialDateRange,
  });

  /**
   * Analytics filters.
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
    isLoadingTimeSeries,
    setIsLoadingTimeSeries,
  ] = useState(false);

  const [
    isLoadingModels,
    setIsLoadingModels,
  ] = useState(false);

  const [
    isLoadingUsage,
    setIsLoadingUsage,
  ] = useState(false);

  const [
    isLoadingPerformance,
    setIsLoadingPerformance,
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
    timeSeriesError,
    setTimeSeriesError,
  ] = useState(null);

  const [
    modelError,
    setModelError,
  ] = useState(null);

  const [
    usageError,
    setUsageError,
  ] = useState(null);

  const [
    performanceError,
    setPerformanceError,
  ] = useState(null);

  /**
   * Last successful fetch.
   */
  const [
    lastFetchedAt,
    setLastFetchedAt,
  ] = useState(null);

  /**
   * Build common request params.
   */
  const getRequestParams =
    useCallback(
      () => ({
        from:
          dateRange.from,

        to:
          dateRange.to,

        modelId:
          filters.modelId ||
          undefined,

        provider:
          filters.provider ||
          undefined,

        environment:
          filters.environment ||
          undefined,
      }),
      [
        dateRange.from,
        dateRange.to,
        filters.modelId,
        filters.provider,
        filters.environment,
      ]
    );

  /**
   * Fetch analytics overview.
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
            await analyticsApi.getOverview(
              getRequestParams()
            );

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
                  "/analytics/overview",

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
        getRequestParams,
      ]
    );

  /**
   * Fetch time-series analytics.
   */
  const fetchTimeSeries =
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

        setIsLoadingTimeSeries(
          true
        );

        setTimeSeriesError(
          null
        );

        try {
          const response =
            await analyticsApi.getTimeSeries(
              getRequestParams()
            );

          const data =
            normalizeResponse(
              response
            );

          const items =
            Array.isArray(
              data
            )
              ? data
              : data.items ||
                data.series ||
                data.data ||
                [];

          setTimeSeries(
            Array.isArray(
              items
            )
              ? items
              : []
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
                  "/analytics/time-series",

                method:
                  "GET",
              }
            );

          setTimeSeriesError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingTimeSeries(
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
   * Fetch model analytics.
   */
  const fetchModelAnalytics =
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

        setIsLoadingModels(
          true
        );

        setModelError(
          null
        );

        try {
          const response =
            await analyticsApi.getModelAnalytics(
              getRequestParams()
            );

          const data =
            normalizeResponse(
              response
            );

          const items =
            Array.isArray(
              data
            )
              ? data
              : data.items ||
                data.models ||
                data.data ||
                [];

          setModelAnalytics(
            Array.isArray(
              items
            )
              ? items
              : []
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
                  "/analytics/models",

                method:
                  "GET",
              }
            );

          setModelError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingModels(
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
   * Fetch usage analytics.
   */
  const fetchUsageAnalytics =
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

        setIsLoadingUsage(
          true
        );

        setUsageError(
          null
        );

        try {
          const response =
            await analyticsApi.getUsageAnalytics(
              getRequestParams()
            );

          const data =
            normalizeResponse(
              response
            );

          setUsageAnalytics(
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
                  "/analytics/usage",

                method:
                  "GET",
              }
            );

          setUsageError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingUsage(
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
   * Fetch performance analytics.
   */
  const fetchPerformanceAnalytics =
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

        setIsLoadingPerformance(
          true
        );

        setPerformanceError(
          null
        );

        try {
          const response =
            await analyticsApi.getPerformanceAnalytics(
              getRequestParams()
            );

          const data =
            normalizeResponse(
              response
            );

          setPerformanceAnalytics(
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
                  "/analytics/performance",

                method:
                  "GET",
              }
            );

          setPerformanceError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingPerformance(
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
   * Fetch all analytics data.
   */
  const fetchAnalytics =
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

                fetchTimeSeries(
                  requestOptions
                ),

                fetchModelAnalytics(
                  requestOptions
                ),

                fetchUsageAnalytics(
                  requestOptions
                ),

                fetchPerformanceAnalytics(
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
            const firstError =
              rejected[0]
                .reason;

            setError(
              firstError
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
        fetchTimeSeries,
        fetchModelAnalytics,
        fetchUsageAnalytics,
        fetchPerformanceAnalytics,
      ]
    );

  /**
   * Update date range.
   */
  const setDateRange =
    useCallback(
      (
        range
      ) => {
        setDateRangeState(
          (
            current
          ) => ({
            ...current,
            ...range,
          })
        );
      },
      []
    );

  /**
   * Set custom date range.
   */
  const setCustomDateRange =
    useCallback(
      (
        from,
        to
      ) => {
        setDateRangeState({
          from,
          to,
        });
      },
      []
    );

  /**
   * Set predefined range.
   *
   * Examples:
   * - 7d
   * - 30d
   * - 90d
   * - 1y
   */
  const setDatePreset =
    useCallback(
      (
        preset
      ) => {
        const now =
          new Date();

        const from =
          new Date(
            now
          );

        switch (
          preset
        ) {
          case "24h":
            from.setHours(
              now.getHours() -
                24
            );
            break;

          case "7d":
            from.setDate(
              now.getDate() -
                7
            );
            break;

          case "30d":
            from.setDate(
              now.getDate() -
                30
            );
            break;

          case "90d":
            from.setDate(
              now.getDate() -
                90
            );
            break;

          case "1y":
            from.setFullYear(
              now.getFullYear() -
                1
            );
            break;

          default:
            setDateRangeState(
              DEFAULT_DATE_RANGE
            );

            return;
        }

        setDateRangeState({
          from:
            from.toISOString(),

          to:
            now.toISOString(),
        });
      },
      []
    );

  /**
   * Update analytics filters.
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
      },
      []
    );

  /**
   * Set model filter.
   */
  const setModelFilter =
    useCallback(
      (
        modelId
      ) => {
        setFiltersState(
          (
            current
          ) => ({
            ...current,

            modelId:
              modelId || "",
          })
        );
      },
      []
    );

  /**
   * Set provider filter.
   */
  const setProviderFilter =
    useCallback(
      (
        provider
      ) => {
        setFiltersState(
          (
            current
          ) => ({
            ...current,

            provider:
              provider || "",
          })
        );
      },
      []
    );

  /**
   * Set environment filter.
   */
  const setEnvironmentFilter =
    useCallback(
      (
        environment
      ) => {
        setFiltersState(
          (
            current
          ) => ({
            ...current,

            environment:
              environment || "",
          })
        );
      },
      []
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

        setDateRangeState(
          DEFAULT_DATE_RANGE
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

        setOverviewError(
          null
        );

        setTimeSeriesError(
          null
        );

        setModelError(
          null
        );

        setUsageError(
          null
        );

        setPerformanceError(
          null
        );
      },
      []
    );

  /**
   * Refresh all analytics.
   */
  const refresh =
    useCallback(
      async () => {
        return fetchAnalytics({
          force: true,
        });
      },
      [
        fetchAnalytics,
      ]
    );

  /**
   * Initial data fetch.
   */
  useEffect(
    () => {
      if (!enabled) {
        return;
      }

      fetchAnalytics().catch(
        () => {
          /**
           * Individual errors are
           * already normalized and
           * stored in state.
           */
        }
      );
    },
    [
      enabled,
      fetchAnalytics,
    ]
  );

  /**
   * Derived state.
   */
  const hasOverview =
    useMemo(
      () =>
        Boolean(
          overview
        ),
      [
        overview,
      ]
    );

  const hasTimeSeries =
    useMemo(
      () =>
        timeSeries.length >
        0,
      [
        timeSeries,
      ]
    );

  const hasModelAnalytics =
    useMemo(
      () =>
        modelAnalytics.length >
        0,
      [
        modelAnalytics,
      ]
    );

  const isEmpty =
    useMemo(
      () =>
        !isFetching &&
        !hasOverview &&
        !hasTimeSeries &&
        !hasModelAnalytics &&
        !usageAnalytics &&
        !performanceAnalytics,
      [
        isFetching,
        hasOverview,
        hasTimeSeries,
        hasModelAnalytics,
        usageAnalytics,
        performanceAnalytics,
      ]
    );

  /**
   * Return public hook API.
   */
  return {
    /**
     * Analytics data.
     */
    overview,

    timeSeries,

    modelAnalytics,

    usageAnalytics,

    performanceAnalytics,

    /**
     * Filters.
     */
    dateRange,

    filters,

    /**
     * Loading states.
     */
    isLoading,

    isFetching,

    isLoadingOverview,

    isLoadingTimeSeries,

    isLoadingModels,

    isLoadingUsage,

    isLoadingPerformance,

    /**
     * Errors.
     */
    error,

    overviewError,

    timeSeriesError,

    modelError,

    usageError,

    performanceError,

    /**
     * Metadata.
     */
    lastFetchedAt,

    hasOverview,

    hasTimeSeries,

    hasModelAnalytics,

    isEmpty,

    /**
     * Fetch methods.
     */
    fetchOverview,

    fetchTimeSeries,

    fetchModelAnalytics,

    fetchUsageAnalytics,

    fetchPerformanceAnalytics,

    fetchAnalytics,

    refresh,

    /**
     * Date controls.
     */
    setDateRange,

    setCustomDateRange,

    setDatePreset,

    /**
     * Filter controls.
     */
    setFilters,

    setModelFilter,

    setProviderFilter,

    setEnvironmentFilter,

    resetFilters,

    /**
     * Error controls.
     */
    clearErrors,
  };
};

export default useAnalytics;