import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import usageApi from "../services/usageApi";

/**
 * Usage Store
 *
 * Responsible for:
 * - Usage overview
 * - Usage summary
 * - Usage statistics
 * - Token usage
 * - Request usage
 * - Model usage
 * - Provider usage
 * - Environment usage
 * - Usage trends
 * - Time-series data
 * - Cost breakdown
 * - API key usage
 * - User usage
 * - Usage limits
 * - Usage alerts
 * - Usage data export
 */

/**
 * Initial state.
 */
const initialState = {
  overview: null,

  summary: null,

  statistics: null,

  tokenUsage: null,

  tokenUsageTrends: [],

  requestUsage: null,

  requestUsageTrends: [],

  usageByModel: [],

  selectedModelUsage: null,

  usageByProvider: [],

  usageByEnvironment: [],

  usageTrends: [],

  usageTimeSeries: [],

  costBreakdown: null,

  usageByApiKey: [],

  selectedApiKeyUsage: null,

  usageByUser: [],

  usageLimits: null,

  usageAlerts: [],

  filters: {
    startDate: "",
    endDate: "",
    interval: "day",
    modelId: "",
    provider: "",
    environment: "",
    apiKeyId: "",
    userId: "",
  },

  isLoading: false,

  isRefreshing: false,

  isExporting: false,

  error: null,

  lastFetchedAt: null,
};

/**
 * Normalize collection responses.
 */
const normalizeCollection = (
  response
) => {
  if (Array.isArray(response)) {
    return response;
  }

  return (
    response?.items ||
    response?.data ||
    response?.results ||
    []
  );
};

/**
 * Usage Store.
 */
const useUsageStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        /**
         * Set loading state.
         */
        setLoading: (
          isLoading
        ) => {
          set(
            {
              isLoading,
            },
            false,
            "usage/setLoading"
          );
        },

        /**
         * Set refreshing state.
         */
        setRefreshing: (
          isRefreshing
        ) => {
          set(
            {
              isRefreshing,
            },
            false,
            "usage/setRefreshing"
          );
        },

        /**
         * Set exporting state.
         */
        setExporting: (
          isExporting
        ) => {
          set(
            {
              isExporting,
            },
            false,
            "usage/setExporting"
          );
        },

        /**
         * Set error.
         */
        setError: (
          error
        ) => {
          set(
            {
              error:
                error?.message ||
                error ||
                "An unexpected error occurred.",
            },
            false,
            "usage/setError"
          );
        },

        /**
         * Clear error.
         */
        clearError: () => {
          set(
            {
              error: null,
            },
            false,
            "usage/clearError"
          );
        },

        /**
         * Set all filters.
         */
        setFilters: (
          filters
        ) => {
          set(
            (state) => ({
              filters: {
                ...state.filters,
                ...filters,
              },
            }),
            false,
            "usage/setFilters"
          );
        },

        /**
         * Set one filter.
         */
        setFilter: (
          key,
          value
        ) => {
          set(
            (state) => ({
              filters: {
                ...state.filters,
                [key]: value,
              },
            }),
            false,
            "usage/setFilter"
          );
        },

        /**
         * Reset filters.
         */
        resetFilters: () => {
          set(
            {
              filters: {
                ...initialState.filters,
              },
            },
            false,
            "usage/resetFilters"
          );
        },

        /**
         * Fetch usage overview.
         */
        fetchOverview: async (
          params = {}
        ) => {
          try {
            set(
              {
                isLoading: true,
                error: null,
              },
              false,
              "usage/fetchOverview/start"
            );

            const state =
              get();

            const query = {
              ...state.filters,
              ...params,
            };

            const data =
              await usageApi.getUsageOverview(
                query
              );

            set(
              {
                overview: data,

                isLoading: false,

                lastFetchedAt:
                  new Date().toISOString(),
              },
              false,
              "usage/fetchOverview/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isLoading: false,

                error:
                  error?.message ||
                  "Failed to fetch usage overview.",
              },
              false,
              "usage/fetchOverview/error"
            );

            throw error;
          }
        },

        /**
         * Fetch usage summary.
         */
        fetchSummary: async (
          params = {}
        ) => {
          try {
            set(
              {
                isLoading: true,
                error: null,
              },
              false,
              "usage/fetchSummary/start"
            );

            const state =
              get();

            const data =
              await usageApi.getUsageSummary({
                ...state.filters,
                ...params,
              });

            set(
              {
                summary: data,

                isLoading: false,
              },
              false,
              "usage/fetchSummary/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isLoading: false,

                error:
                  error?.message ||
                  "Failed to fetch usage summary.",
              },
              false,
              "usage/fetchSummary/error"
            );

            throw error;
          }
        },

        /**
         * Fetch usage statistics.
         */
        fetchStatistics: async (
          params = {}
        ) => {
          try {
            const state =
              get();

            const data =
              await usageApi.getUsageStatistics({
                ...state.filters,
                ...params,
              });

            set(
              {
                statistics: data,
              },
              false,
              "usage/fetchStatistics/success"
            );

            return data;
          } catch (error) {
            set(
              {
                error:
                  error?.message ||
                  "Failed to fetch usage statistics.",
              },
              false,
              "usage/fetchStatistics/error"
            );

            throw error;
          }
        },

        /**
         * Fetch token usage.
         */
        fetchTokenUsage: async (
          params = {}
        ) => {
          try {
            const state =
              get();

            const data =
              await usageApi.getTokenUsage({
                ...state.filters,
                ...params,
              });

            set(
              {
                tokenUsage: data,
              },
              false,
              "usage/fetchTokenUsage/success"
            );

            return data;
          } catch (error) {
            set(
              {
                error:
                  error?.message ||
                  "Failed to fetch token usage.",
              },
              false,
              "usage/fetchTokenUsage/error"
            );

            throw error;
          }
        },

        /**
         * Fetch token usage trends.
         */
        fetchTokenUsageTrends:
          async (
            params = {}
          ) => {
            try {
              const state =
                get();

              const response =
                await usageApi.getTokenUsageTrends(
                  {
                    ...state.filters,
                    ...params,
                  }
                );

              set(
                {
                  tokenUsageTrends:
                    normalizeCollection(
                      response
                    ),
                },
                false,
                "usage/fetchTokenUsageTrends/success"
              );

              return response;
            } catch (error) {
              set(
                {
                  error:
                    error?.message ||
                    "Failed to fetch token usage trends.",
                },
                false,
                "usage/fetchTokenUsageTrends/error"
              );

              throw error;
            }
          },

        /**
         * Fetch request usage.
         */
        fetchRequestUsage: async (
          params = {}
        ) => {
          try {
            const state =
              get();

            const data =
              await usageApi.getRequestUsage({
                ...state.filters,
                ...params,
              });

            set(
              {
                requestUsage:
                  data,
              },
              false,
              "usage/fetchRequestUsage/success"
            );

            return data;
          } catch (error) {
            set(
              {
                error:
                  error?.message ||
                  "Failed to fetch request usage.",
              },
              false,
              "usage/fetchRequestUsage/error"
            );

            throw error;
          }
        },

        /**
         * Fetch request usage trends.
         */
        fetchRequestUsageTrends:
          async (
            params = {}
          ) => {
            try {
              const state =
                get();

              const response =
                await usageApi.getRequestUsageTrends(
                  {
                    ...state.filters,
                    ...params,
                  }
                );

              set(
                {
                  requestUsageTrends:
                    normalizeCollection(
                      response
                    ),
                },
                false,
                "usage/fetchRequestUsageTrends/success"
              );

              return response;
            } catch (error) {
              set(
                {
                  error:
                    error?.message ||
                    "Failed to fetch request usage trends.",
                },
                false,
                "usage/fetchRequestUsageTrends/error"
              );

              throw error;
            }
          },

        /**
         * Fetch usage by model.
         */
        fetchUsageByModel: async (
          params = {}
        ) => {
          try {
            const state =
              get();

            const response =
              await usageApi.getUsageByModel({
                ...state.filters,
                ...params,
              });

            set(
              {
                usageByModel:
                  normalizeCollection(
                    response
                  ),
              },
              false,
              "usage/fetchUsageByModel/success"
            );

            return response;
          } catch (error) {
            set(
              {
                error:
                  error?.message ||
                  "Failed to fetch usage by model.",
              },
              false,
              "usage/fetchUsageByModel/error"
            );

            throw error;
          }
        },

        /**
         * Fetch specific model usage.
         */
        fetchModelUsage: async (
          modelId,
          params = {}
        ) => {
          try {
            if (!modelId) {
              throw new Error(
                "Model ID is required."
              );
            }

            const state =
              get();

            const data =
              await usageApi.getModelUsage(
                modelId,
                {
                  ...state.filters,
                  ...params,
                }
              );

            set(
              {
                selectedModelUsage:
                  data,
              },
              false,
              "usage/fetchModelUsage/success"
            );

            return data;
          } catch (error) {
            set(
              {
                error:
                  error?.message ||
                  "Failed to fetch model usage.",
              },
              false,
              "usage/fetchModelUsage/error"
            );

            throw error;
          }
        },

        /**
         * Fetch usage by provider.
         */
        fetchUsageByProvider:
          async (
            params = {}
          ) => {
            try {
              const state =
                get();

              const response =
                await usageApi.getUsageByProvider(
                  {
                    ...state.filters,
                    ...params,
                  }
                );

              set(
                {
                  usageByProvider:
                    normalizeCollection(
                      response
                    ),
                },
                false,
                "usage/fetchUsageByProvider/success"
              );

              return response;
            } catch (error) {
              set(
                {
                  error:
                    error?.message ||
                    "Failed to fetch usage by provider.",
                },
                false,
                "usage/fetchUsageByProvider/error"
              );

              throw error;
            }
          },

        /**
         * Fetch usage by environment.
         */
        fetchUsageByEnvironment:
          async (
            params = {}
          ) => {
            try {
              const state =
                get();

              const response =
                await usageApi.getUsageByEnvironment(
                  {
                    ...state.filters,
                    ...params,
                  }
                );

              set(
                {
                  usageByEnvironment:
                    normalizeCollection(
                      response
                    ),
                },
                false,
                "usage/fetchUsageByEnvironment/success"
              );

              return response;
            } catch (error) {
              set(
                {
                  error:
                    error?.message ||
                    "Failed to fetch usage by environment.",
                },
                false,
                "usage/fetchUsageByEnvironment/error"
              );

              throw error;
            }
          },

        /**
         * Fetch usage trends.
         */
        fetchUsageTrends: async (
          params = {}
        ) => {
          try {
            const state =
              get();

            const response =
              await usageApi.getUsageTrends({
                ...state.filters,
                ...params,
              });

            set(
              {
                usageTrends:
                  normalizeCollection(
                    response
                  ),
              },
              false,
              "usage/fetchUsageTrends/success"
            );

            return response;
          } catch (error) {
            set(
              {
                error:
                  error?.message ||
                  "Failed to fetch usage trends.",
              },
              false,
              "usage/fetchUsageTrends/error"
            );

            throw error;
          }
        },

        /**
         * Fetch usage time series.
         */
        fetchUsageTimeSeries:
          async (
            params = {}
          ) => {
            try {
              const state =
                get();

              const response =
                await usageApi.getUsageTimeSeries(
                  {
                    ...state.filters,
                    ...params,
                  }
                );

              set(
                {
                  usageTimeSeries:
                    normalizeCollection(
                      response
                    ),
                },
                false,
                "usage/fetchUsageTimeSeries/success"
              );

              return response;
            } catch (error) {
              set(
                {
                  error:
                    error?.message ||
                    "Failed to fetch usage time series.",
                },
                false,
                "usage/fetchUsageTimeSeries/error"
              );

              throw error;
            }
          },

        /**
         * Fetch cost breakdown.
         */
        fetchCostBreakdown:
          async (
            params = {}
          ) => {
            try {
              const state =
                get();

              const data =
                await usageApi.getUsageCostBreakdown(
                  {
                    ...state.filters,
                    ...params,
                  }
                );

              set(
                {
                  costBreakdown:
                    data,
                },
                false,
                "usage/fetchCostBreakdown/success"
              );

              return data;
            } catch (error) {
              set(
                {
                  error:
                    error?.message ||
                    "Failed to fetch cost breakdown.",
                },
                false,
                "usage/fetchCostBreakdown/error"
              );

              throw error;
            }
          },

        /**
         * Fetch usage by API key.
         */
        fetchUsageByApiKey:
          async (
            params = {}
          ) => {
            try {
              const state =
                get();

              const response =
                await usageApi.getUsageByApiKey(
                  {
                    ...state.filters,
                    ...params,
                  }
                );

              set(
                {
                  usageByApiKey:
                    normalizeCollection(
                      response
                    ),
                },
                false,
                "usage/fetchUsageByApiKey/success"
              );

              return response;
            } catch (error) {
              set(
                {
                  error:
                    error?.message ||
                    "Failed to fetch usage by API key.",
                },
                false,
                "usage/fetchUsageByApiKey/error"
              );

              throw error;
            }
          },

        /**
         * Fetch specific API key usage.
         */
        fetchApiKeyUsage: async (
          apiKeyId,
          params = {}
        ) => {
          try {
            if (!apiKeyId) {
              throw new Error(
                "API key ID is required."
              );
            }

            const state =
              get();

            const data =
              await usageApi.getApiKeyUsage(
                apiKeyId,
                {
                  ...state.filters,
                  ...params,
                }
              );

            set(
              {
                selectedApiKeyUsage:
                  data,
              },
              false,
              "usage/fetchApiKeyUsage/success"
            );

            return data;
          } catch (error) {
            set(
              {
                error:
                  error?.message ||
                  "Failed to fetch API key usage.",
              },
              false,
              "usage/fetchApiKeyUsage/error"
            );

            throw error;
          }
        },

        /**
         * Fetch usage by user.
         */
        fetchUsageByUser: async (
          params = {}
        ) => {
          try {
            const state =
              get();

            const response =
              await usageApi.getUsageByUser({
                ...state.filters,
                ...params,
              });

            set(
              {
                usageByUser:
                  normalizeCollection(
                    response
                  ),
              },
              false,
              "usage/fetchUsageByUser/success"
            );

            return response;
          } catch (error) {
            set(
              {
                error:
                  error?.message ||
                  "Failed to fetch usage by user.",
              },
              false,
              "usage/fetchUsageByUser/error"
            );

            throw error;
          }
        },

        /**
         * Fetch usage limits.
         */
        fetchUsageLimits: async () => {
          try {
            const data =
              await usageApi.getUsageLimits();

            set(
              {
                usageLimits:
                  data,
              },
              false,
              "usage/fetchUsageLimits/success"
            );

            return data;
          } catch (error) {
            set(
              {
                error:
                  error?.message ||
                  "Failed to fetch usage limits.",
              },
              false,
              "usage/fetchUsageLimits/error"
            );

            throw error;
          }
        },

        /**
         * Update usage limits.
         */
        updateUsageLimits:
          async (
            limitData
          ) => {
            try {
              set(
                {
                  isLoading: true,
                  error: null,
                },
                false,
                "usage/updateUsageLimits/start"
              );

              const data =
                await usageApi.updateUsageLimits(
                  limitData
                );

              set(
                {
                  usageLimits:
                    data,

                  isLoading: false,
                },
                false,
                "usage/updateUsageLimits/success"
              );

              return data;
            } catch (error) {
              set(
                {
                  isLoading: false,

                  error:
                    error?.message ||
                    "Failed to update usage limits.",
                },
                false,
                "usage/updateUsageLimits/error"
              );

              throw error;
            }
          },

        /**
         * Fetch usage alerts.
         */
        fetchUsageAlerts:
          async (
            params = {}
          ) => {
            try {
              const state =
                get();

              const response =
                await usageApi.getUsageAlerts({
                  ...state.filters,
                  ...params,
                });

              set(
                {
                  usageAlerts:
                    normalizeCollection(
                      response
                    ),
                },
                false,
                "usage/fetchUsageAlerts/success"
              );

              return response;
            } catch (error) {
              set(
                {
                  error:
                    error?.message ||
                    "Failed to fetch usage alerts.",
                },
                false,
                "usage/fetchUsageAlerts/error"
              );

              throw error;
            }
          },

        /**
         * Create usage alert.
         */
        createUsageAlert:
          async (
            alertData
          ) => {
            try {
              set(
                {
                  isLoading: true,
                  error: null,
                },
                false,
                "usage/createUsageAlert/start"
              );

              const data =
                await usageApi.createUsageAlert(
                  alertData
                );

              set(
                (state) => ({
                  usageAlerts: [
                    data,
                    ...state.usageAlerts,
                  ],

                  isLoading: false,
                }),
                false,
                "usage/createUsageAlert/success"
              );

              return data;
            } catch (error) {
              set(
                {
                  isLoading: false,

                  error:
                    error?.message ||
                    "Failed to create usage alert.",
                },
                false,
                "usage/createUsageAlert/error"
              );

              throw error;
            }
          },

        /**
         * Update usage alert.
         */
        updateUsageAlert:
          async (
            alertId,
            alertData
          ) => {
            try {
              if (!alertId) {
                throw new Error(
                  "Alert ID is required."
                );
              }

              set(
                {
                  isLoading: true,
                  error: null,
                },
                false,
                "usage/updateUsageAlert/start"
              );

              const data =
                await usageApi.updateUsageAlert(
                  alertId,
                  alertData
                );

              set(
                (state) => ({
                  usageAlerts:
                    state.usageAlerts.map(
                      (alert) =>
                        alert.id ===
                        alertId
                          ? {
                              ...alert,
                              ...data,
                            }
                          : alert
                    ),

                  isLoading: false,
                }),
                false,
                "usage/updateUsageAlert/success"
              );

              return data;
            } catch (error) {
              set(
                {
                  isLoading: false,

                  error:
                    error?.message ||
                    "Failed to update usage alert.",
                },
                false,
                "usage/updateUsageAlert/error"
              );

              throw error;
            }
          },

        /**
         * Delete usage alert.
         */
        deleteUsageAlert:
          async (
            alertId
          ) => {
            try {
              if (!alertId) {
                throw new Error(
                  "Alert ID is required."
                );
              }

              set(
                {
                  isLoading: true,
                  error: null,
                },
                false,
                "usage/deleteUsageAlert/start"
              );

              const data =
                await usageApi.deleteUsageAlert(
                  alertId
                );

              set(
                (state) => ({
                  usageAlerts:
                    state.usageAlerts.filter(
                      (alert) =>
                        alert.id !==
                        alertId
                    ),

                  isLoading: false,
                }),
                false,
                "usage/deleteUsageAlert/success"
              );

              return data;
            } catch (error) {
              set(
                {
                  isLoading: false,

                  error:
                    error?.message ||
                    "Failed to delete usage alert.",
                },
                false,
                "usage/deleteUsageAlert/error"
              );

              throw error;
            }
          },

        /**
         * Export usage data.
         */
        exportUsageData:
          async (
            params = {}
          ) => {
            try {
              set(
                {
                  isExporting: true,
                  error: null,
                },
                false,
                "usage/exportUsageData/start"
              );

              const state =
                get();

              const response =
                await usageApi.exportUsageData(
                  {
                    ...state.filters,
                    ...params,
                  }
                );

              set(
                {
                  isExporting: false,
                },
                false,
                "usage/exportUsageData/success"
              );

              return response;
            } catch (error) {
              set(
                {
                  isExporting: false,

                  error:
                    error?.message ||
                    "Failed to export usage data.",
                },
                false,
                "usage/exportUsageData/error"
              );

              throw error;
            }
          },

        /**
         * Refresh complete usage dashboard.
         */
        refreshUsage: async (
          params = {}
        ) => {
          try {
            set(
              {
                isRefreshing: true,
                error: null,
              },
              false,
              "usage/refreshUsage/start"
            );

            const state =
              get();

            const query = {
              ...state.filters,
              ...params,
            };

            const [
              overview,
              summary,
              statistics,
              tokenUsage,
              requestUsage,
              usageTrends,
              costBreakdown,
            ] = await Promise.all([
              usageApi.getUsageOverview(
                query
              ),

              usageApi.getUsageSummary(
                query
              ),

              usageApi.getUsageStatistics(
                query
              ),

              usageApi.getTokenUsage(
                query
              ),

              usageApi.getRequestUsage(
                query
              ),

              usageApi.getUsageTrends(
                query
              ),

              usageApi.getUsageCostBreakdown(
                query
              ),
            ]);

            set(
              {
                overview,

                summary,

                statistics,

                tokenUsage,

                requestUsage,

                usageTrends:
                  normalizeCollection(
                    usageTrends
                  ),

                costBreakdown,

                isRefreshing: false,

                lastFetchedAt:
                  new Date().toISOString(),
              },
              false,
              "usage/refreshUsage/success"
            );

            return {
              overview,

              summary,

              statistics,

              tokenUsage,

              requestUsage,

              usageTrends,

              costBreakdown,
            };
          } catch (error) {
            set(
              {
                isRefreshing: false,

                error:
                  error?.message ||
                  "Failed to refresh usage data.",
              },
              false,
              "usage/refreshUsage/error"
            );

            throw error;
          }
        },

        /**
         * Reset usage store.
         */
        reset: () => {
          set(
            {
              ...initialState,
            },
            false,
            "usage/reset"
          );
        },
      }),
      {
        name: "usage-store",

        partialize: (
          state
        ) => ({
          filters:
            state.filters,
        }),
      }
    ),
    {
      name: "UsageStore",
    }
  )
);

export default useUsageStore;