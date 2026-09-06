"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import latencyApi from "../../services/latency/latencyApi";

import {
  normalizeApiError,
} from "../../errors/ApiError";

/**
 * Enterprise Latency Hook
 *
 * Responsibilities:
 * - Fetch latency overview
 * - Fetch latency time-series
 * - Fetch model-level latency
 * - Fetch provider-level latency
 * - Fetch percentile metrics
 * - Filter by model/provider/environment
 * - Date range filtering
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
 * Default filters.
 */
const DEFAULT_FILTERS = {
  modelId: "",
  provider: "",
  environment: "",
  metric: "latency",
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
 * Main useLatency hook.
 */
const useLatency = (
  options = {}
) => {
  const {
    enabled = true,

    initialDateRange = {},

    initialFilters = {},
  } = options;

  /**
   * Latency overview.
   */
  const [
    overview,
    setOverview,
  ] = useState(null);

  /**
   * Latency time-series.
   */
  const [
    timeSeries,
    setTimeSeries,
  ] = useState([]);

  /**
   * Model latency.
   */
  const [
    modelLatency,
    setModelLatency,
  ] = useState([]);

  /**
   * Provider latency.
   */
  const [
    providerLatency,
    setProviderLatency,
  ] = useState([]);

  /**
   * Percentile metrics.
   */
  const [
    percentiles,
    setPercentiles,
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
    isLoadingTimeSeries,
    setIsLoadingTimeSeries,
  ] = useState(false);

  const [
    isLoadingModels,
    setIsLoadingModels,
  ] = useState(false);

  const [
    isLoadingProviders,
    setIsLoadingProviders,
  ] = useState(false);

  const [
    isLoadingPercentiles,
    setIsLoadingPercentiles,
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
    providerError,
    setProviderError,
  ] = useState(null);

  const [
    percentileError,
    setPercentileError,
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
        from:
          dateRange.from ||
          undefined,

        to:
          dateRange.to ||
          undefined,

        modelId:
          filters.modelId ||
          undefined,

        provider:
          filters.provider ||
          undefined,

        environment:
          filters.environment ||
          undefined,

        metric:
          filters.metric ||
          "latency",
      }),
      [
        dateRange.from,
        dateRange.to,
        filters.modelId,
        filters.provider,
        filters.environment,
        filters.metric,
      ]
    );

  /**
   * Fetch latency overview.
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
            await latencyApi.getOverview(
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
                  "/latency/overview",

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
   * Fetch latency time-series.
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
            await latencyApi.getTimeSeries(
              getRequestParams()
            );

          const items =
            normalizeCollection(
              response,
              [
                "series",
                "timeSeries",
                "data",
              ]
            );

          setTimeSeries(
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
                  "/latency/time-series",

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
   * Fetch model-level latency.
   */
  const fetchModelLatency =
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
            await latencyApi.getModelLatency(
              getRequestParams()
            );

          const items =
            normalizeCollection(
              response,
              [
                "models",
                "modelLatency",
                "data",
              ]
            );

          setModelLatency(
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
                  "/latency/models",

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
   * Fetch provider-level latency.
   */
  const fetchProviderLatency =
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

        setIsLoadingProviders(
          true
        );

        setProviderError(
          null
        );

        try {
          const response =
            await latencyApi.getProviderLatency(
              getRequestParams()
            );

          const items =
            normalizeCollection(
              response,
              [
                "providers",
                "providerLatency",
                "data",
              ]
            );

          setProviderLatency(
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
                  "/latency/providers",

                method:
                  "GET",
              }
            );

          setProviderError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingProviders(
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
   * Fetch percentile metrics.
   */
  const fetchPercentiles =
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

        setIsLoadingPercentiles(
          true
        );

        setPercentileError(
          null
        );

        try {
          const response =
            await latencyApi.getPercentiles(
              getRequestParams()
            );

          const data =
            normalizeResponse(
              response
            );

          setPercentiles(
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
                  "/latency/percentiles",

                method:
                  "GET",
              }
            );

          setPercentileError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingPercentiles(
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
   * Fetch all latency data.
   *
   * Promise.allSettled ensures
   * partial dashboard rendering.
   */
  const fetchLatency =
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

                fetchModelLatency(
                  requestOptions
                ),

                fetchProviderLatency(
                  requestOptions
                ),

                fetchPercentiles(
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
        fetchTimeSeries,
        fetchModelLatency,
        fetchProviderLatency,
        fetchPercentiles,
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
   * Set date preset.
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
   * Set latency metric.
   *
   * Supported examples:
   * - latency
   * - first_token_latency
   * - time_to_first_token
   * - time_to_last_token
   */
  const setMetric =
    useCallback(
      (
        metric
      ) => {
        setFiltersState(
          (
            current
          ) => ({
            ...current,

            metric:
              metric ||
              "latency",
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
   * Clear errors.
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

        setProviderError(
          null
        );

        setPercentileError(
          null
        );
      },
      []
    );

  /**
   * Refresh all latency data.
   */
  const refresh =
    useCallback(
      async () => {
        return fetchLatency({
          force: true,
        });
      },
      [
        fetchLatency,
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

      fetchLatency().catch(
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
      fetchLatency,
    ]
  );

  /**
   * Derived states.
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

  const hasModelLatency =
    useMemo(
      () =>
        modelLatency.length >
        0,
      [
        modelLatency,
      ]
    );

  const hasProviderLatency =
    useMemo(
      () =>
        providerLatency.length >
        0,
      [
        providerLatency,
      ]
    );

  const hasPercentiles =
    useMemo(
      () =>
        Boolean(
          percentiles
        ),
      [
        percentiles,
      ]
    );

  /**
   * Empty state.
   */
  const isEmpty =
    useMemo(
      () =>
        !isFetching &&
        !hasOverview &&
        !hasTimeSeries &&
        !hasModelLatency &&
        !hasProviderLatency &&
        !hasPercentiles,
      [
        isFetching,
        hasOverview,
        hasTimeSeries,
        hasModelLatency,
        hasProviderLatency,
        hasPercentiles,
      ]
    );

  /**
   * Public API.
   */
  return {
    /**
     * Data.
     */
    overview,

    timeSeries,

    modelLatency,

    providerLatency,

    percentiles,

    /**
     * Filters.
     */
    dateRange,

    filters,

    /**
     * Loading.
     */
    isLoading,

    isFetching,

    isLoadingOverview,

    isLoadingTimeSeries,

    isLoadingModels,

    isLoadingProviders,

    isLoadingPercentiles,

    /**
     * Errors.
     */
    error,

    overviewError,

    timeSeriesError,

    modelError,

    providerError,

    percentileError,

    /**
     * Metadata.
     */
    lastFetchedAt,

    hasOverview,

    hasTimeSeries,

    hasModelLatency,

    hasProviderLatency,

    hasPercentiles,

    isEmpty,

    /**
     * Fetch methods.
     */
    fetchOverview,

    fetchTimeSeries,

    fetchModelLatency,

    fetchProviderLatency,

    fetchPercentiles,

    fetchLatency,

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

    setMetric,

    resetFilters,

    /**
     * Error controls.
     */
    clearErrors,
  };
};

export default useLatency;