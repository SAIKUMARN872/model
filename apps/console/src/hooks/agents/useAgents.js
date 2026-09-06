"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import agentApi from "../../services/agents/agentApi";

import {
  normalizeApiError,
} from "../../errors/ApiError";

/**
 * Enterprise Agents Hook
 *
 * Responsibilities:
 * - Fetch agents
 * - Create agents
 * - Update agents
 * - Delete agents
 * - Fetch single agent
 * - Search and filter agents
 * - Pagination
 * - Loading states
 * - Error normalization
 * - Optimistic local state updates
 * - Refresh support
 */

/**
 * Default pagination configuration.
 */
const DEFAULT_PAGE = 1;

const DEFAULT_PAGE_SIZE = 20;

/**
 * Default query state.
 */
const DEFAULT_QUERY = {
  search: "",
  status: "",
  type: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

/**
 * Safely extract list data from
 * different backend response formats.
 */
const normalizeAgentListResponse = (
  response
) => {
  /**
   * Direct array response.
   */
  if (
    Array.isArray(response)
  ) {
    return {
      items: response,
      total: response.length,
      page: DEFAULT_PAGE,
      pageSize: response.length,
      totalPages: 1,
    };
  }

  /**
   * Standard paginated response.
   */
  const items =
    response?.items ||
    response?.data ||
    response?.agents ||
    [];

  const total =
    response?.total ??
    response?.pagination?.total ??
    items.length;

  const page =
    response?.page ??
    response?.pagination?.page ??
    DEFAULT_PAGE;

  const pageSize =
    response?.pageSize ??
    response?.pagination?.pageSize ??
    DEFAULT_PAGE_SIZE;

  const totalPages =
    response?.totalPages ??
    response?.pagination?.totalPages ??
    Math.ceil(
      total / pageSize
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
 * Main useAgents hook.
 */
const useAgents = (
  options = {}
) => {
  const {
    enabled = true,

    initialPage =
      DEFAULT_PAGE,

    initialPageSize =
      DEFAULT_PAGE_SIZE,

    initialQuery = {},
  } = options;

  /**
   * Agent collection.
   */
  const [
    agents,
    setAgents,
  ] = useState([]);

  /**
   * Selected/current agent.
   */
  const [
    selectedAgent,
    setSelectedAgent,
  ] = useState(null);

  /**
   * Pagination state.
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
   * Search/filter state.
   */
  const [
    query,
    setQueryState,
  ] = useState({
    ...DEFAULT_QUERY,
    ...initialQuery,
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

  /**
   * Error state.
   */
  const [
    error,
    setError,
  ] = useState(null);

  /**
   * Last successful refresh.
   */
  const [
    lastFetchedAt,
    setLastFetchedAt,
  ] = useState(null);

  /**
   * Fetch agents.
   */
  const fetchAgents =
    useCallback(
      async (
        fetchOptions = {}
      ) => {
        if (
          !enabled &&
          !fetchOptions.force
        ) {
          return;
        }

        const {
          page =
            pagination.page,

          pageSize =
            pagination.pageSize,

          search =
            query.search,

          status =
            query.status,

          type =
            query.type,

          sortBy =
            query.sortBy,

          sortOrder =
            query.sortOrder,
        } =
          fetchOptions;

        setIsFetching(
          true
        );

        setError(null);

        try {
          const response =
            await agentApi.listAgents(
              {
                page,

                pageSize,

                search,

                status,

                type,

                sortBy,

                sortOrder,
              }
            );

          const normalized =
            normalizeAgentListResponse(
              response
            );

          setAgents(
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

          setLastFetchedAt(
            new Date()
          );

          return normalized;
        } catch (
          requestError
        ) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/agents",

                method:
                  "GET",
              }
            );

          setError(
            normalizedError
          );

          throw normalizedError;
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
        pagination.page,
        pagination.pageSize,
        query.search,
        query.status,
        query.type,
        query.sortBy,
        query.sortOrder,
      ]
    );

  /**
   * Fetch one agent by ID.
   */
  const fetchAgent =
    useCallback(
      async (
        agentId
      ) => {
        if (!agentId) {
          throw new Error(
            "Agent ID is required."
          );
        }

        setError(null);

        try {
          const response =
            await agentApi.getAgent(
              agentId
            );

          setSelectedAgent(
            response
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
                  `/agents/${agentId}`,

                method:
                  "GET",
              }
            );

          setError(
            normalizedError
          );

          throw normalizedError;
        }
      },
      []
    );

  /**
   * Create a new agent.
   */
  const createAgent =
    useCallback(
      async (
        payload
      ) => {
        if (!payload) {
          throw new Error(
            "Agent payload is required."
          );
        }

        setIsCreating(
          true
        );

        setError(null);

        try {
          const createdAgent =
            await agentApi.createAgent(
              payload
            );

          /**
           * Add newly created agent
           * to local state when possible.
           */
          if (
            createdAgent
          ) {
            setAgents(
              (
                currentAgents
              ) => [
                createdAgent,
                ...currentAgents,
              ]
            );
          }

          /**
           * Refresh server-side
           * pagination data.
           */
          await fetchAgents({
            force: true,
          });

          return createdAgent;
        } catch (
          requestError
        ) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/agents",

                method:
                  "POST",
              }
            );

          setError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsCreating(
            false
          );
        }
      },
      [
        fetchAgents,
      ]
    );

  /**
   * Update an existing agent.
   */
  const updateAgent =
    useCallback(
      async (
        agentId,
        payload
      ) => {
        if (!agentId) {
          throw new Error(
            "Agent ID is required."
          );
        }

        if (!payload) {
          throw new Error(
            "Agent payload is required."
          );
        }

        setIsUpdating(
          true
        );

        setError(null);

        try {
          const updatedAgent =
            await agentApi.updateAgent(
              agentId,
              payload
            );

          /**
           * Update local collection.
           */
          setAgents(
            (
              currentAgents
            ) =>
              currentAgents.map(
                (
                  agent
                ) =>
                  agent.id ===
                  agentId
                    ? {
                        ...agent,
                        ...updatedAgent,
                      }
                    : agent
              )
          );

          /**
           * Update selected agent.
           */
          setSelectedAgent(
            (
              currentAgent
            ) => {
              if (
                currentAgent?.id !==
                agentId
              ) {
                return currentAgent;
              }

              return {
                ...currentAgent,
                ...updatedAgent,
              };
            }
          );

          return updatedAgent;
        } catch (
          requestError
        ) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  `/agents/${agentId}`,

                method:
                  "PATCH",
              }
            );

          setError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsUpdating(
            false
          );
        }
      },
      []
    );

  /**
   * Delete an agent.
   */
  const deleteAgent =
    useCallback(
      async (
        agentId
      ) => {
        if (!agentId) {
          throw new Error(
            "Agent ID is required."
          );
        }

        setIsDeleting(
          true
        );

        setError(null);

        try {
          await agentApi.deleteAgent(
            agentId
          );

          /**
           * Remove deleted agent
           * from local state.
           */
          setAgents(
            (
              currentAgents
            ) =>
              currentAgents.filter(
                (
                  agent
                ) =>
                  agent.id !==
                  agentId
              )
          );

          /**
           * Clear selected agent
           * when it was deleted.
           */
          setSelectedAgent(
            (
              currentAgent
            ) =>
              currentAgent?.id ===
              agentId
                ? null
                : currentAgent
          );

          /**
           * Update total count.
           */
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
                  `/agents/${agentId}`,

                method:
                  "DELETE",
              }
            );

          setError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsDeleting(
            false
          );
        }
      },
      []
    );

  /**
   * Change current page.
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
   * Change page size.
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

            page:
              1,

            pageSize:
              nextPageSize,
          })
        );
      },
      []
    );

  /**
   * Update query filters.
   */
  const setQuery =
    useCallback(
      (
        updates
      ) => {
        setQueryState(
          (
            current
          ) => ({
            ...current,
            ...updates,
          })
        );

        /**
         * Reset pagination
         * after changing filters.
         */
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
   * Search agents.
   */
  const searchAgents =
    useCallback(
      (
        search
      ) => {
        setQuery({
          search:
            search || "",
        });
      },
      [
        setQuery,
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
        setQuery({
          status:
            status || "",
        });
      },
      [
        setQuery,
      ]
    );

  /**
   * Filter by agent type.
   */
  const filterByType =
    useCallback(
      (
        type
      ) => {
        setQuery({
          type:
            type || "",
        });
      },
      [
        setQuery,
      ]
    );

  /**
   * Change sorting.
   */
  const setSorting =
    useCallback(
      (
        sortBy,
        sortOrder =
          "desc"
      ) => {
        setQuery({
          sortBy,

          sortOrder,
        });
      },
      [
        setQuery,
      ]
    );

  /**
   * Reset filters.
   */
  const resetFilters =
    useCallback(
      () => {
        setQueryState(
          DEFAULT_QUERY
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
   * Clear selected agent.
   */
  const clearSelectedAgent =
    useCallback(
      () => {
        setSelectedAgent(
          null
        );
      },
      []
    );

  /**
   * Clear current error.
   */
  const clearError =
    useCallback(
      () => {
        setError(null);
      },
      []
    );

  /**
   * Refresh current page.
   */
  const refresh =
    useCallback(
      async () => {
        return fetchAgents({
          force: true,
        });
      },
      [
        fetchAgents,
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

      setIsLoading(
        true
      );

      fetchAgents().catch(
        () => {
          /**
           * Error is already normalized
           * and stored in state.
           */
        }
      );
    },
    [
      enabled,
      fetchAgents,
    ]
  );

  /**
   * Memoized derived state.
   */
  const hasAgents =
    useMemo(
      () =>
        agents.length >
        0,
      [
        agents,
      ]
    );

  const isEmpty =
    useMemo(
      () =>
        !isFetching &&
        agents.length ===
          0,
      [
        isFetching,
        agents,
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

  /**
   * Final hook API.
   */
  return {
    /**
     * Data.
     */
    agents,

    selectedAgent,

    pagination,

    query,

    /**
     * State.
     */
    isLoading,

    isFetching,

    isCreating,

    isUpdating,

    isDeleting,

    error,

    lastFetchedAt,

    hasAgents,

    isEmpty,

    hasNextPage,

    hasPreviousPage,

    /**
     * Fetching.
     */
    fetchAgents,

    fetchAgent,

    refresh,

    /**
     * CRUD.
     */
    createAgent,

    updateAgent,

    deleteAgent,

    /**
     * Pagination.
     */
    setPage,

    setPageSize,

    /**
     * Filtering.
     */
    setQuery,

    searchAgents,

    filterByStatus,

    filterByType,

    setSorting,

    resetFilters,

    /**
     * Selection.
     */
    setSelectedAgent,

    clearSelectedAgent,

    /**
     * Error handling.
     */
    clearError,
  };
};

export default useAgents;