import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import modelApi from "../services/modelApi";

/**
 * Model Store
 *
 * Responsible for:
 * - Model listing
 * - Model details
 * - Model filtering
 * - Model creation
 * - Model updates
 * - Model deletion
 * - Model activation/deactivation
 * - Model deployment
 * - Model health
 * - Model configuration
 * - Model metrics
 * - Model usage
 * - Model versions
 * - Model providers
 * - Model capabilities
 */

/**
 * Initial state.
 */
const initialState = {
  models: [],

  selectedModel: null,

  selectedModelId: null,

  modelDetails: null,

  modelHealth: null,

  deploymentStatus: null,

  modelConfiguration: null,

  modelMetrics: null,

  modelUsage: null,

  modelVersions: [],

  selectedVersion: null,

  modelProviders: [],

  modelCapabilities: null,

  filters: {
    search: "",
    status: "",
    provider: "",
    type: "",
    page: 1,
    limit: 20,
  },

  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },

  isLoading: false,

  isRefreshing: false,

  isCreating: false,

  isUpdating: false,

  isDeleting: false,

  isDeploying: false,

  error: null,

  lastFetchedAt: null,
};

/**
 * Normalize API collection response.
 */
const normalizeCollection = (
  response
) => {
  if (Array.isArray(response)) {
    return {
      items: response,
      pagination: {
        page: 1,
        limit: response.length,
        total: response.length,
        totalPages: 1,
      },
    };
  }

  return {
    items:
      response?.items ||
      response?.models ||
      response?.data ||
      [],
    pagination: {
      page:
        response?.pagination?.page ||
        response?.page ||
        1,

      limit:
        response?.pagination?.limit ||
        response?.limit ||
        20,

      total:
        response?.pagination?.total ||
        response?.total ||
        0,

      totalPages:
        response?.pagination?.totalPages ||
        response?.totalPages ||
        0,
    },
  };
};

/**
 * Model Store.
 */
const useModelStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        /**
         * Set loading state.
         */
        setLoading: (isLoading) => {
          set(
            {
              isLoading,
            },
            false,
            "model/setLoading"
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
            "model/setRefreshing"
          );
        },

        /**
         * Set error.
         */
        setError: (error) => {
          set(
            {
              error:
                error?.message ||
                error ||
                "An unexpected error occurred.",
            },
            false,
            "model/setError"
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
            "model/clearError"
          );
        },

        /**
         * Set model filters.
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
            "model/setFilters"
          );
        },

        /**
         * Update a single filter.
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
            "model/setFilter"
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
            "model/resetFilters"
          );
        },

        /**
         * Set selected model.
         */
        setSelectedModel: (
          model
        ) => {
          set(
            {
              selectedModel:
                model,

              selectedModelId:
                model?.id ||
                model?.modelId ||
                null,
            },
            false,
            "model/setSelectedModel"
          );
        },

        /**
         * Set selected model ID.
         */
        setSelectedModelId: (
          modelId
        ) => {
          set(
            {
              selectedModelId:
                modelId,
            },
            false,
            "model/setSelectedModelId"
          );
        },

        /**
         * Fetch models.
         */
        fetchModels: async (
          params = {}
        ) => {
          try {
            set(
              {
                isLoading: true,
                error: null,
              },
              false,
              "model/fetchModels/start"
            );

            const state =
              get();

            const query = {
              ...state.filters,
              ...params,
            };

            const response =
              await modelApi.getModels(
                query
              );

            const normalized =
              normalizeCollection(
                response
              );

            set(
              {
                models:
                  normalized.items,

                pagination:
                  normalized.pagination,

                isLoading: false,

                lastFetchedAt:
                  new Date().toISOString(),
              },
              false,
              "model/fetchModels/success"
            );

            return response;
          } catch (error) {
            set(
              {
                isLoading: false,

                error:
                  error?.message ||
                  "Failed to fetch models.",
              },
              false,
              "model/fetchModels/error"
            );

            throw error;
          }
        },

        /**
         * Refresh models.
         */
        refreshModels: async (
          params = {}
        ) => {
          try {
            set(
              {
                isRefreshing: true,
                error: null,
              },
              false,
              "model/refreshModels/start"
            );

            const state =
              get();

            const query = {
              ...state.filters,
              ...params,
            };

            const response =
              await modelApi.getModels(
                query
              );

            const normalized =
              normalizeCollection(
                response
              );

            set(
              {
                models:
                  normalized.items,

                pagination:
                  normalized.pagination,

                isRefreshing: false,

                lastFetchedAt:
                  new Date().toISOString(),
              },
              false,
              "model/refreshModels/success"
            );

            return response;
          } catch (error) {
            set(
              {
                isRefreshing: false,

                error:
                  error?.message ||
                  "Failed to refresh models.",
              },
              false,
              "model/refreshModels/error"
            );

            throw error;
          }
        },

        /**
         * Fetch model details.
         */
        fetchModel: async (
          modelId
        ) => {
          try {
            if (!modelId) {
              throw new Error(
                "Model ID is required."
              );
            }

            set(
              {
                isLoading: true,
                error: null,
                selectedModelId:
                  modelId,
              },
              false,
              "model/fetchModel/start"
            );

            const data =
              await modelApi.getModel(
                modelId
              );

            set(
              {
                selectedModel:
                  data,

                modelDetails:
                  data,

                isLoading: false,
              },
              false,
              "model/fetchModel/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isLoading: false,

                error:
                  error?.message ||
                  "Failed to fetch model.",
              },
              false,
              "model/fetchModel/error"
            );

            throw error;
          }
        },

        /**
         * Create model.
         */
        createModel: async (
          modelData
        ) => {
          try {
            set(
              {
                isCreating: true,
                error: null,
              },
              false,
              "model/createModel/start"
            );

            const data =
              await modelApi.createModel(
                modelData
              );

            set(
              (state) => ({
                models: [
                  data,
                  ...state.models,
                ],

                isCreating: false,
              }),
              false,
              "model/createModel/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isCreating: false,

                error:
                  error?.message ||
                  "Failed to create model.",
              },
              false,
              "model/createModel/error"
            );

            throw error;
          }
        },

        /**
         * Update model.
         */
        updateModel: async (
          modelId,
          modelData
        ) => {
          try {
            set(
              {
                isUpdating: true,
                error: null,
              },
              false,
              "model/updateModel/start"
            );

            const data =
              await modelApi.updateModel(
                modelId,
                modelData
              );

            set(
              (state) => ({
                models:
                  state.models.map(
                    (model) =>
                      model.id ===
                        modelId ||
                      model.modelId ===
                        modelId
                        ? {
                            ...model,
                            ...data,
                          }
                        : model
                  ),

                selectedModel:
                  state.selectedModel?.id ===
                    modelId ||
                  state.selectedModel
                    ?.modelId === modelId
                    ? {
                        ...state.selectedModel,
                        ...data,
                      }
                    : state.selectedModel,

                modelDetails:
                  state.modelDetails?.id ===
                    modelId ||
                  state.modelDetails
                    ?.modelId === modelId
                    ? {
                        ...state.modelDetails,
                        ...data,
                      }
                    : state.modelDetails,

                isUpdating: false,
              }),
              false,
              "model/updateModel/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isUpdating: false,

                error:
                  error?.message ||
                  "Failed to update model.",
              },
              false,
              "model/updateModel/error"
            );

            throw error;
          }
        },

        /**
         * Delete model.
         */
        deleteModel: async (
          modelId
        ) => {
          try {
            set(
              {
                isDeleting: true,
                error: null,
              },
              false,
              "model/deleteModel/start"
            );

            const data =
              await modelApi.deleteModel(
                modelId
              );

            set(
              (state) => ({
                models:
                  state.models.filter(
                    (model) =>
                      model.id !==
                        modelId &&
                      model.modelId !==
                        modelId
                  ),

                selectedModel:
                  state.selectedModel?.id ===
                      modelId ||
                  state.selectedModel
                    ?.modelId === modelId
                    ? null
                    : state.selectedModel,

                modelDetails:
                  state.modelDetails?.id ===
                      modelId ||
                  state.modelDetails
                    ?.modelId === modelId
                    ? null
                    : state.modelDetails,

                selectedModelId:
                  state.selectedModelId ===
                    modelId
                    ? null
                    : state.selectedModelId,

                isDeleting: false,
              }),
              false,
              "model/deleteModel/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isDeleting: false,

                error:
                  error?.message ||
                  "Failed to delete model.",
              },
              false,
              "model/deleteModel/error"
            );

            throw error;
          }
        },

        /**
         * Activate model.
         */
        activateModel: async (
          modelId
        ) => {
          try {
            set(
              {
                isUpdating: true,
                error: null,
              },
              false,
              "model/activateModel/start"
            );

            const data =
              await modelApi.activateModel(
                modelId
              );

            set(
              (state) => ({
                models:
                  state.models.map(
                    (model) =>
                      model.id ===
                        modelId ||
                      model.modelId ===
                        modelId
                        ? {
                            ...model,
                            status:
                              "active",
                          }
                        : model
                  ),

                isUpdating: false,
              }),
              false,
              "model/activateModel/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isUpdating: false,

                error:
                  error?.message ||
                  "Failed to activate model.",
              },
              false,
              "model/activateModel/error"
            );

            throw error;
          }
        },

        /**
         * Deactivate model.
         */
        deactivateModel: async (
          modelId
        ) => {
          try {
            set(
              {
                isUpdating: true,
                error: null,
              },
              false,
              "model/deactivateModel/start"
            );

            const data =
              await modelApi.deactivateModel(
                modelId
              );

            set(
              (state) => ({
                models:
                  state.models.map(
                    (model) =>
                      model.id ===
                        modelId ||
                      model.modelId ===
                        modelId
                        ? {
                            ...model,
                            status:
                              "inactive",
                          }
                        : model
                  ),

                isUpdating: false,
              }),
              false,
              "model/deactivateModel/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isUpdating: false,

                error:
                  error?.message ||
                  "Failed to deactivate model.",
              },
              false,
              "model/deactivateModel/error"
            );

            throw error;
          }
        },

        /**
         * Deploy model.
         */
        deployModel: async (
          modelId,
          deploymentData = {}
        ) => {
          try {
            set(
              {
                isDeploying: true,
                error: null,
              },
              false,
              "model/deployModel/start"
            );

            const data =
              await modelApi.deployModel(
                modelId,
                deploymentData
              );

            set(
              {
                deploymentStatus:
                  data,

                isDeploying: false,
              },
              false,
              "model/deployModel/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isDeploying: false,

                error:
                  error?.message ||
                  "Failed to deploy model.",
              },
              false,
              "model/deployModel/error"
            );

            throw error;
          }
        },

        /**
         * Undeploy model.
         */
        undeployModel: async (
          modelId
        ) => {
          try {
            set(
              {
                isDeploying: true,
                error: null,
              },
              false,
              "model/undeployModel/start"
            );

            const data =
              await modelApi.undeployModel(
                modelId
              );

            set(
              {
                deploymentStatus:
                  data,

                isDeploying: false,
              },
              false,
              "model/undeployModel/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isDeploying: false,

                error:
                  error?.message ||
                  "Failed to undeploy model.",
              },
              false,
              "model/undeployModel/error"
            );

            throw error;
          }
        },

        /**
         * Fetch deployment status.
         */
        fetchDeploymentStatus:
          async (
            modelId
          ) => {
            try {
              const data =
                await modelApi.getModelDeploymentStatus(
                  modelId
                );

              set(
                {
                  deploymentStatus:
                    data,
                },
                false,
                "model/fetchDeploymentStatus/success"
              );

              return data;
            } catch (error) {
              set(
                {
                  error:
                    error?.message ||
                    "Failed to fetch deployment status.",
                },
                false,
                "model/fetchDeploymentStatus/error"
              );

              throw error;
            }
          },

        /**
         * Fetch model health.
         */
        fetchModelHealth: async (
          modelId
        ) => {
          try {
            const data =
              await modelApi.getModelHealth(
                modelId
              );

            set(
              {
                modelHealth:
                  data,
              },
              false,
              "model/fetchModelHealth/success"
            );

            return data;
          } catch (error) {
            set(
              {
                error:
                  error?.message ||
                  "Failed to fetch model health.",
              },
              false,
              "model/fetchModelHealth/error"
            );

            throw error;
          }
        },

        /**
         * Fetch model configuration.
         */
        fetchModelConfiguration:
          async (
            modelId
          ) => {
            try {
              const data =
                await modelApi.getModelConfiguration(
                  modelId
                );

              set(
                {
                  modelConfiguration:
                    data,
                },
                false,
                "model/fetchModelConfiguration/success"
              );

              return data;
            } catch (error) {
              set(
                {
                  error:
                    error?.message ||
                    "Failed to fetch model configuration.",
                },
                false,
                "model/fetchModelConfiguration/error"
              );

              throw error;
            }
          },

        /**
         * Update model configuration.
         */
        updateModelConfiguration:
          async (
            modelId,
            configurationData
          ) => {
            try {
              set(
                {
                  isUpdating: true,
                  error: null,
                },
                false,
                "model/updateModelConfiguration/start"
              );

              const data =
                await modelApi.updateModelConfiguration(
                  modelId,
                  configurationData
                );

              set(
                {
                  modelConfiguration:
                    data,

                  isUpdating: false,
                },
                false,
                "model/updateModelConfiguration/success"
              );

              return data;
            } catch (error) {
              set(
                {
                  isUpdating: false,

                  error:
                    error?.message ||
                    "Failed to update model configuration.",
                },
                false,
                "model/updateModelConfiguration/error"
              );

              throw error;
            }
          },

        /**
         * Fetch model metrics.
         */
        fetchModelMetrics: async (
          modelId,
          params = {}
        ) => {
          try {
            const data =
              await modelApi.getModelMetrics(
                modelId,
                params
              );

            set(
              {
                modelMetrics:
                  data,
              },
              false,
              "model/fetchModelMetrics/success"
            );

            return data;
          } catch (error) {
            set(
              {
                error:
                  error?.message ||
                  "Failed to fetch model metrics.",
              },
              false,
              "model/fetchModelMetrics/error"
            );

            throw error;
          }
        },

        /**
         * Fetch model usage.
         */
        fetchModelUsage: async (
          modelId,
          params = {}
        ) => {
          try {
            const data =
              await modelApi.getModelUsage(
                modelId,
                params
              );

            set(
              {
                modelUsage:
                  data,
              },
              false,
              "model/fetchModelUsage/success"
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
              "model/fetchModelUsage/error"
            );

            throw error;
          }
        },

        /**
         * Fetch model versions.
         */
        fetchModelVersions: async (
          modelId,
          params = {}
        ) => {
          try {
            const response =
              await modelApi.getModelVersions(
                modelId,
                params
              );

            const normalized =
              normalizeCollection(
                response
              );

            set(
              {
                modelVersions:
                  normalized.items,
              },
              false,
              "model/fetchModelVersions/success"
            );

            return response;
          } catch (error) {
            set(
              {
                error:
                  error?.message ||
                  "Failed to fetch model versions.",
              },
              false,
              "model/fetchModelVersions/error"
            );

            throw error;
          }
        },

        /**
         * Fetch specific model version.
         */
        fetchModelVersion: async (
          modelId,
          versionId
        ) => {
          try {
            const data =
              await modelApi.getModelVersion(
                modelId,
                versionId
              );

            set(
              {
                selectedVersion:
                  data,
              },
              false,
              "model/fetchModelVersion/success"
            );

            return data;
          } catch (error) {
            set(
              {
                error:
                  error?.message ||
                  "Failed to fetch model version.",
              },
              false,
              "model/fetchModelVersion/error"
            );

            throw error;
          }
        },

        /**
         * Create model version.
         */
        createModelVersion: async (
          modelId,
          versionData
        ) => {
          try {
            set(
              {
                isUpdating: true,
                error: null,
              },
              false,
              "model/createModelVersion/start"
            );

            const data =
              await modelApi.createModelVersion(
                modelId,
                versionData
              );

            set(
              (state) => ({
                modelVersions: [
                  data,
                  ...state.modelVersions,
                ],

                isUpdating: false,
              }),
              false,
              "model/createModelVersion/success"
            );

            return data;
          } catch (error) {
            set(
              {
                isUpdating: false,

                error:
                  error?.message ||
                  "Failed to create model version.",
              },
              false,
              "model/createModelVersion/error"
            );

            throw error;
          }
        },

        /**
         * Fetch model providers.
         */
        fetchModelProviders: async (
          params = {}
        ) => {
          try {
            const response =
              await modelApi.getModelProviders(
                params
              );

            const normalized =
              normalizeCollection(
                response
              );

            set(
              {
                modelProviders:
                  normalized.items,
              },
              false,
              "model/fetchModelProviders/success"
            );

            return response;
          } catch (error) {
            set(
              {
                error:
                  error?.message ||
                  "Failed to fetch model providers.",
              },
              false,
              "model/fetchModelProviders/error"
            );

            throw error;
          }
        },

        /**
         * Fetch model capabilities.
         */
        fetchModelCapabilities:
          async (
            modelId
          ) => {
            try {
              const data =
                await modelApi.getModelCapabilities(
                  modelId
                );

              set(
                {
                  modelCapabilities:
                    data,
                },
                false,
                "model/fetchModelCapabilities/success"
              );

              return data;
            } catch (error) {
              set(
                {
                  error:
                    error?.message ||
                    "Failed to fetch model capabilities.",
                },
                false,
                "model/fetchModelCapabilities/error"
              );

              throw error;
            }
          },

        /**
         * Test model connection.
         */
        testModelConnection:
          async (
            modelId,
            testData = {}
          ) => {
            try {
              set(
                {
                  isLoading: true,
                  error: null,
                },
                false,
                "model/testModelConnection/start"
              );

              const data =
                await modelApi.testModelConnection(
                  modelId,
                  testData
                );

              set(
                {
                  isLoading: false,
                },
                false,
                "model/testModelConnection/success"
              );

              return data;
            } catch (error) {
              set(
                {
                  isLoading: false,

                  error:
                    error?.message ||
                    "Failed to test model connection.",
                },
                false,
                "model/testModelConnection/error"
              );

              throw error;
            }
          },

        /**
         * Reset model store.
         */
        reset: () => {
          set(
            {
              ...initialState,
            },
            false,
            "model/reset"
          );
        },
      }),
      {
        name: "model-store",

        partialize: (
          state
        ) => ({
          filters:
            state.filters,

          selectedModelId:
            state.selectedModelId,
        }),
      }
    ),
    {
      name: "ModelStore",
    }
  )
);

export default useModelStore;