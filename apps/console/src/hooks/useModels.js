"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import modelApi from "../services/modelApi";

import {
  normalizeApiError,
} from "../errors/ApiError";

/**
 * Enterprise Model Management Hook
 *
 * Responsibilities:
 * - Fetch AI models
 * - Search models
 * - Filter models
 * - Pagination
 * - Model details
 * - Create model
 * - Update model
 * - Delete model
 * - Enable / disable model
 * - Health checks
 * - Refresh
 * - Auto refresh
 * - Error normalization
 */

/**
 * Default filters.
 */
const DEFAULT_FILTERS = {
  search: "",
  provider: "",
  status: "",
  type: "",
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
 * Normalize model collection.
 */
const normalizeCollection = (
  response
) => {
  const data =
    normalizeResponse(response);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.models)) {
    return data.models;
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

  const models =
    Array.isArray(data)
      ? data
      : data.models ||
        data.items ||
        data.results ||
        data.data ||
        [];

  const total =
    data.total ??
    data.pagination?.total ??
    models.length;

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
    models: Array.isArray(models)
      ? models
      : [],
    total,
    page,
    pageSize,
    totalPages,
  };
};

/**
 * Main useModels hook.
 */
const useModels = (
  options = {}
) => {
  const {
    enabled = true,
    initialFilters = {},
    initialPage = 1,
    initialPageSize = 20,
    autoRefresh = false,
    refreshInterval = 60000,
  } = options;

  /**
   * Models collection.
   */
  const [
    models,
    setModels,
  ] = useState([]);

  /**
   * Selected model.
   */
  const [
    selectedModel,
    setSelectedModel,
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
    isLoadingModel,
    setIsLoadingModel,
  ] = useState(false);

  const [
    isCreating,
    setIsCreating,
  ] = useState(false);

  const [
    isUpdating,
    setIsUpdating,
  ] = useState(false);

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  const [
    isTogglingStatus,
    setIsTogglingStatus,
  ] = useState(false);

  const [
    isCheckingHealth,
    setIsCheckingHealth,
  ] = useState(false);

  /**
   * Errors.
   */
  const [
    error,
    setError,
  ] = useState(null);

  const [
    modelError,
    setModelError,
  ] = useState(null);

  const [
    createError,
    setCreateError,
  ] = useState(null);

  const [
    updateError,
    setUpdateError,
  ] = useState(null);

  const [
    deleteError,
    setDeleteError,
  ] = useState(null);

  const [
    healthError,
    setHealthError,
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

        provider:
          filters.provider ||
          undefined,

        status:
          filters.status ||
          undefined,

        type:
          filters.type ||
          undefined,

        environment:
          filters.environment ||
          undefined,
      }),
      [
        pagination.page,
        pagination.pageSize,
        filters.search,
        filters.provider,
        filters.status,
        filters.type,
        filters.environment,
      ]
    );

  /**
   * Fetch models.
   */
  const fetchModels =
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

        setModelError(null);

        try {
          const response =
            await modelApi.listModels(
              getRequestParams()
            );

          const normalized =
            normalizePaginatedResponse(
              response
            );

          setModels(
            normalized.models
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
                  "/models",
                method: "GET",
              }
            );

          setModelError(
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
   * Fetch a single model.
   */
  const fetchModel =
    useCallback(
      async (
        modelId
      ) => {
        if (!modelId) {
          throw new Error(
            "Model ID is required."
          );
        }

        setIsLoadingModel(
          true
        );

        setModelError(null);

        try {
          const response =
            await modelApi.getModel(
              modelId
            );

          const data =
            normalizeResponse(
              response
            );

          setSelectedModel(data);

          return data;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  `/models/${modelId}`,
                method: "GET",
              }
            );

          setModelError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingModel(
            false
          );
        }
      },
      []
    );

  /**
   * Select an existing model.
   */
  const selectModel =
    useCallback(
      (model) => {
        setSelectedModel(
          model || null
        );
      },
      []
    );

  /**
   * Clear selected model.
   */
  const clearSelectedModel =
    useCallback(
      () => {
        setSelectedModel(null);
      },
      []
    );

  /**
   * Create model.
   */
  const createModel =
    useCallback(
      async (
        payload
      ) => {
        if (!payload) {
          throw new Error(
            "Model data is required."
          );
        }

        setIsCreating(true);

        setCreateError(null);

        try {
          const response =
            await modelApi.createModel(
              payload
            );

          const createdModel =
            normalizeResponse(
              response
            );

          /**
           * Add newly created
           * model optimistically.
           */
          if (
            createdModel &&
            createdModel.id
          ) {
            setModels(
              (currentModels) => [
                createdModel,
                ...currentModels,
              ]
            );

            setPagination(
              (current) => ({
                ...current,
                total:
                  current.total + 1,
              })
            );
          }

          return createdModel;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/models",
                method: "POST",
              }
            );

          setCreateError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsCreating(false);
        }
      },
      []
    );

  /**
   * Update model.
   */
  const updateModel =
    useCallback(
      async (
        modelId,
        payload
      ) => {
        if (!modelId) {
          throw new Error(
            "Model ID is required."
          );
        }

        if (!payload) {
          throw new Error(
            "Model update data is required."
          );
        }

        setIsUpdating(true);

        setUpdateError(null);

        try {
          const response =
            await modelApi.updateModel(
              modelId,
              payload
            );

          const updatedModel =
            normalizeResponse(
              response
            );

          /**
           * Update collection.
           */
          setModels(
            (currentModels) =>
              currentModels.map(
                (model) =>
                  model.id === modelId
                    ? {
                        ...model,
                        ...updatedModel,
                      }
                    : model
              )
          );

          /**
           * Update selected model.
           */
          setSelectedModel(
            (current) =>
              current?.id === modelId
                ? {
                    ...current,
                    ...updatedModel,
                  }
                : current
          );

          return updatedModel;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  `/models/${modelId}`,
                method: "PATCH",
              }
            );

          setUpdateError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsUpdating(false);
        }
      },
      []
    );

  /**
   * Delete model.
   */
  const deleteModel =
    useCallback(
      async (
        modelId
      ) => {
        if (!modelId) {
          throw new Error(
            "Model ID is required."
          );
        }

        setIsDeleting(true);

        setDeleteError(null);

        try {
          await modelApi.deleteModel(
            modelId
          );

          setModels(
            (currentModels) =>
              currentModels.filter(
                (model) =>
                  model.id !== modelId
              )
          );

          setSelectedModel(
            (current) =>
              current?.id === modelId
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
                  `/models/${modelId}`,
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
   * Enable model.
   */
  const enableModel =
    useCallback(
      async (
        modelId
      ) => {
        if (!modelId) {
          throw new Error(
            "Model ID is required."
          );
        }

        setIsTogglingStatus(
          true
        );

        try {
          const response =
            await modelApi.enableModel(
              modelId
            );

          const updatedModel =
            normalizeResponse(
              response
            );

          setModels(
            (currentModels) =>
              currentModels.map(
                (model) =>
                  model.id === modelId
                    ? {
                        ...model,
                        ...updatedModel,
                        status:
                          updatedModel.status ||
                          "active",
                      }
                    : model
              )
          );

          return updatedModel;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  `/models/${modelId}/enable`,
                method: "POST",
              }
            );

          setModelError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsTogglingStatus(
            false
          );
        }
      },
      []
    );

  /**
   * Disable model.
   */
  const disableModel =
    useCallback(
      async (
        modelId
      ) => {
        if (!modelId) {
          throw new Error(
            "Model ID is required."
          );
        }

        setIsTogglingStatus(
          true
        );

        try {
          const response =
            await modelApi.disableModel(
              modelId
            );

          const updatedModel =
            normalizeResponse(
              response
            );

          setModels(
            (currentModels) =>
              currentModels.map(
                (model) =>
                  model.id === modelId
                    ? {
                        ...model,
                        ...updatedModel,
                        status:
                          updatedModel.status ||
                          "inactive",
                      }
                    : model
              )
          );

          return updatedModel;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  `/models/${modelId}/disable`,
                method: "POST",
              }
            );

          setModelError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsTogglingStatus(
            false
          );
        }
      },
      []
    );

  /**
   * Toggle model status.
   */
  const toggleModelStatus =
    useCallback(
      async (
        model
      ) => {
        if (!model?.id) {
          throw new Error(
            "Valid model is required."
          );
        }

        const status =
          String(
            model.status || ""
          ).toLowerCase();

        const isActive =
          [
            "active",
            "enabled",
            "available",
          ].includes(status);

        if (isActive) {
          return disableModel(
            model.id
          );
        }

        return enableModel(
          model.id
        );
      },
      [
        enableModel,
        disableModel,
      ]
    );

  /**
   * Check model health.
   */
  const checkModelHealth =
    useCallback(
      async (
        modelId
      ) => {
        if (!modelId) {
          throw new Error(
            "Model ID is required."
          );
        }

        setIsCheckingHealth(
          true
        );

        setHealthError(null);

        try {
          const response =
            await modelApi.checkHealth(
              modelId
            );

          const health =
            normalizeResponse(
              response
            );

          /**
           * Update health in
           * current model list.
           */
          setModels(
            (currentModels) =>
              currentModels.map(
                (model) =>
                  model.id === modelId
                    ? {
                        ...model,
                        health,
                      }
                    : model
              )
          );

          /**
           * Update selected model.
           */
          setSelectedModel(
            (current) =>
              current?.id === modelId
                ? {
                    ...current,
                    health,
                  }
                : current
          );

          return health;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  `/models/${modelId}/health`,
                method: "GET",
              }
            );

          setHealthError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsCheckingHealth(
            false
          );
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
   * Search models.
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
   * Filter by status.
   */
  const filterByStatus =
    useCallback(
      (status) => {
        setFilters({
          status:
            status || "",
        });
      },
      [setFilters]
    );

  /**
   * Filter by model type.
   */
  const filterByType =
    useCallback(
      (type) => {
        setFilters({
          type:
            type || "",
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
   * Refresh models.
   */
  const refresh =
    useCallback(
      async () => {
        return fetchModels({
          force: true,
        });
      },
      [fetchModels]
    );

  /**
   * Clear all errors.
   */
  const clearErrors =
    useCallback(
      () => {
        setError(null);

        setModelError(null);

        setCreateError(null);

        setUpdateError(null);

        setDeleteError(null);

        setHealthError(null);
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

      fetchModels().catch(
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
      fetchModels,
    ]
  );

  /**
   * Auto-refresh.
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
            fetchModels({
              force: true,
            }).catch(() => {
              /**
               * Background refresh
               * errors handled internally.
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
      fetchModels,
    ]
  );

  /**
   * Derived model counts.
   */
  const activeModels =
    useMemo(
      () =>
        models.filter(
          (model) =>
            [
              "active",
              "enabled",
              "available",
            ].includes(
              String(
                model.status || ""
              ).toLowerCase()
            )
        ),
      [models]
    );

  const inactiveModels =
    useMemo(
      () =>
        models.filter(
          (model) =>
            [
              "inactive",
              "disabled",
              "unavailable",
            ].includes(
              String(
                model.status || ""
              ).toLowerCase()
            )
        ),
      [models]
    );

  const healthyModels =
    useMemo(
      () =>
        models.filter(
          (model) =>
            [
              "healthy",
              "operational",
              "ok",
            ].includes(
              String(
                model.health?.status ||
                  model.healthStatus ||
                  ""
              ).toLowerCase()
            )
        ),
      [models]
    );

  /**
   * Unique providers.
   */
  const providers =
    useMemo(
      () =>
        [
          ...new Set(
            models
              .map(
                (model) =>
                  model.provider
              )
              .filter(Boolean)
          ),
        ],
      [models]
    );

  /**
   * Check whether models exist.
   */
  const hasModels =
    useMemo(
      () =>
        models.length > 0,
      [models]
    );

  /**
   * Empty state.
   */
  const isEmpty =
    useMemo(
      () =>
        !isFetching &&
        models.length === 0,
      [
        isFetching,
        models,
      ]
    );

  /**
   * Return public API.
   */
  return {
    /**
     * Data.
     */
    models,

    selectedModel,

    /**
     * Filters.
     */
    filters,

    /**
     * Pagination.
     */
    pagination,

    /**
     * Derived data.
     */
    activeModels,

    inactiveModels,

    healthyModels,

    providers,

    hasModels,

    isEmpty,

    /**
     * Loading.
     */
    isLoading,

    isFetching,

    isLoadingModel,

    isCreating,

    isUpdating,

    isDeleting,

    isTogglingStatus,

    isCheckingHealth,

    /**
     * Errors.
     */
    error,

    modelError,

    createError,

    updateError,

    deleteError,

    healthError,

    /**
     * Metadata.
     */
    lastFetchedAt,

    /**
     * Fetch operations.
     */
    fetchModels,

    fetchModel,

    refresh,

    /**
     * Selection.
     */
    selectModel,

    clearSelectedModel,

    /**
     * CRUD.
     */
    createModel,

    updateModel,

    deleteModel,

    /**
     * Status.
     */
    enableModel,

    disableModel,

    toggleModelStatus,

    /**
     * Health.
     */
    checkModelHealth,

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

    filterByProvider,

    filterByStatus,

    filterByType,

    filterByEnvironment,

    resetFilters,

    /**
     * Errors.
     */
    clearErrors,
  };
};

export default useModels;