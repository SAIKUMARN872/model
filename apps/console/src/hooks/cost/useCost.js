"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import costApi from "../../services/cost/costApi";

import {
  normalizeApiError,
} from "../../errors/ApiError";

/**
 * Enterprise Cost Hook
 *
 * Responsibilities:
 * - Fetch cost overview
 * - Fetch cost time-series
 * - Fetch model-level cost data
 * - Fetch provider-level cost data
 * - Date range filtering
 * - Model/provider/environment filters
 * - Currency support
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
 * Default cost filters.
 */
const DEFAULT_FILTERS = {
  modelId: "",
  provider: "",
  environment: "",
  currency: "INR",
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
const normalizeCollection =
  (
    response
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

    return (
      data.items ||
      data.data ||
      data.models ||
      data.providers ||
      data.series ||
      []
    );
  };

/**
 * Main useCost hook.
 */
const useCost = (
  options = {}
) => {
  const {
    enabled = true,

    initialDateRange = {},

    initialFilters = {},
  } = options;

  /**
   * Cost overview.
   */
  const [
    overview,
    setOverview,
  ] = useState(null);

  /**
   * Time-series cost data.
   */
  const [
    timeSeries,
    setTimeSeries,
  ] = useState([]);

  /**
   * Model-level cost data.
   */
  const [
    modelCosts,
    setModelCosts,
  ] = useState([]);

  /**
   * Provider-level cost data.
   */
  const [
    providerCosts,
    setProviderCosts,
  ] = useState([]);

  /**
   * Cost breakdown.
   */
  const [
    breakdown,
    setBreakdown,
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
   * Cost filters.
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
    isLoadingBreakdown,
    setIsLoadingBreakdown,
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
    breakdownError,
    setBreakdownError,
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

        currency:
          filters.currency ||
          "INR",
      }),
      [
        dateRange.from,
        dateRange.to,
        filters.modelId,
        filters.provider,
        filters.environment,
        filters.currency,
      ]
    );

  /**
   * Fetch cost overview.
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
            await costApi.getOverview(
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
                  "/cost/overview",

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
   * Fetch cost time-series.
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
            await costApi.getTimeSeries(
              getRequestParams()
            );

          const items =
            normalizeCollection(
              response
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
                  "/cost/time-series",

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
   * Fetch model costs.
   */
  const fetchModelCosts =
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
            await costApi.getModelCosts(
              getRequestParams()
            );

          const items =
            normalizeCollection(
              response
            );

          setModelCosts(
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
                  "/cost/models",

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
   * Fetch provider costs.
   */
  const fetchProviderCosts =
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
            await costApi.getProviderCosts(
              getRequestParams()
            );

          const items =
            normalizeCollection(
              response
            );

          setProviderCosts(
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
                  "/cost/providers",

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
   * Fetch cost breakdown.
   */
  const fetchBreakdown =
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

        setIsLoadingBreakdown(
          true
        );

        setBreakdownError(
          null
        );

        try {
          const response =
            await costApi.getBreakdown(
              getRequestParams()
            );

          const data =
            normalizeResponse(
              response
            );

          setBreakdown(
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
                  "/cost/breakdown",

                method:
                  "GET",
              }
            );

          setBreakdownError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingBreakdown(
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
   * Fetch all cost data.
   *
   * Promise.allSettled allows
   * partial dashboard rendering.
   */
  const fetchCost =
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

                fetchModelCosts(
                  requestOptions
                ),

                fetchProviderCosts(
                  requestOptions
                ),

                fetchBreakdown(
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
        fetchModelCosts,
        fetchProviderCosts,
        fetchBreakdown,
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
   * Set predefined date range.
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
   * Update cost filters.
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
   * Set currency.
   */
  const setCurrency =
    useCallback(
      (
        currency
      ) => {
        setFiltersState(
          (
            current
          ) => ({
            ...current,

            currency:
              currency || "INR",
          })
        );
      },
      []
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

        setProviderError(
          null
        );

        setBreakdownError(
          null
        );
      },
      []
    );

  /**
   * Refresh all cost data.
   */
  const refresh =
    useCallback(
      async () => {
        return fetchCost({
          force: true,
        });
      },
      [
        fetchCost,
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

      fetchCost().catch(
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
      fetchCost,
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

  const hasModelCosts =
    useMemo(
      () =>
        modelCosts.length >
        0,
      [
        modelCosts,
      ]
    );

  const hasProviderCosts =
    useMemo(
      () =>
        providerCosts.length >
        0,
      [
        providerCosts,
      ]
    );

  const isEmpty =
    useMemo(
      () =>
        !isFetching &&
        !hasOverview &&
        !hasTimeSeries &&
        !hasModelCosts &&
        !hasProviderCosts &&
        !breakdown,
      [
        isFetching,
        hasOverview,
        hasTimeSeries,
        hasModelCosts,
        hasProviderCosts,
        breakdown,
      ]
    );

  /**
   * Return public hook API.
   */
  return {
    /**
     * Cost data.
     */
    overview,

    timeSeries,

    modelCosts,

    providerCosts,

    breakdown,

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

    isLoadingBreakdown,

    /**
     * Errors.
     */
    error,

    overviewError,

    timeSeriesError,

    modelError,

    providerError,

    breakdownError,

    /**
     * Metadata.
     */
    lastFetchedAt,

    hasOverview,

    hasTimeSeries,

    hasModelCosts,

    hasProviderCosts,

    isEmpty,

    /**
     * Fetch methods.
     */
    fetchOverview,

    fetchTimeSeries,

    fetchModelCosts,

    fetchProviderCosts,

    fetchBreakdown,

    fetchCost,

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

    setCurrency,

    resetFilters,

    /**
     * Error controls.
     */
    clearErrors,
  };
};

export default useCost;