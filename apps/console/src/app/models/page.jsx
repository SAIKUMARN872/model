"use client";

import React, { useMemo, useState } from "react";

import useModels from "../../hooks/useModels";
import ModelCard from "../../components/model-card/ModelCard";
import Spinner from "../../components/loading/Spinner";

/**
 * Enterprise Models Management Page
 *
 * Route:
 * /models
 *
 * Responsibilities:
 * - Display registered AI models
 * - Search models
 * - Filter by provider
 * - Filter by status
 * - Display model capabilities
 * - Activate / deactivate models
 * - View model details
 * - Refresh model registry
 */
export default function ModelsPage() {
  const [search, setSearch] = useState("");

  const [providerFilter, setProviderFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [selectedModel, setSelectedModel] =
    useState(null);

  const [actionLoading, setActionLoading] =
    useState(false);

  /**
   * Models data hook.
   */
  const {
    data,
    loading,
    error,
    refetch,
  } = useModels();

  /**
   * Normalize API response.
   */
  const models = useMemo(() => {
    if (Array.isArray(data)) {
      return data;
    }

    return (
      data?.models ||
      data?.items ||
      data?.results ||
      []
    );
  }, [data]);

  /**
   * Get unique providers.
   */
  const providers = useMemo(() => {
    const providerSet = new Set();

    models.forEach((model) => {
      if (model?.provider) {
        providerSet.add(
          model.provider
        );
      }
    });

    return Array.from(
      providerSet
    ).sort();
  }, [models]);

  /**
   * Filter models.
   */
  const filteredModels = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return models.filter((model) => {
      const name =
        String(
          model?.name ||
            model?.modelName ||
            model?.id ||
            ""
        ).toLowerCase();

      const provider =
        String(
          model?.provider || ""
        ).toLowerCase();

      const description =
        String(
          model?.description || ""
        ).toLowerCase();

      const status =
        String(
          model?.status ||
            (model?.enabled
              ? "active"
              : "inactive")
        ).toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        name.includes(
          normalizedSearch
        ) ||
        provider.includes(
          normalizedSearch
        ) ||
        description.includes(
          normalizedSearch
        );

      const matchesProvider =
        providerFilter === "all" ||
        provider ===
          providerFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        status ===
          statusFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesProvider &&
        matchesStatus
      );
    });
  }, [
    models,
    search,
    providerFilter,
    statusFilter,
  ]);

  /**
   * Refresh model registry.
   */
  const handleRefresh = async () => {
    await refetch?.();
  };

  /**
   * Open model details.
   */
  const handleViewModel = (
    model
  ) => {
    setSelectedModel(model);
  };

  /**
   * Close model details.
   */
  const handleCloseModel = () => {
    setSelectedModel(null);
  };

  /**
   * Determine model status.
   */
  const getModelStatus = (
    model
  ) => {
    if (
      model?.status
    ) {
      return String(
        model.status
      ).toLowerCase();
    }

    return model?.enabled
      ? "active"
      : "inactive";
  };

  /**
   * Format model capabilities.
   */
  const getCapabilities = (
    model
  ) => {
    if (
      Array.isArray(
        model?.capabilities
      )
    ) {
      return model.capabilities;
    }

    const capabilities = [];

    if (
      model?.supportsChat
    ) {
      capabilities.push(
        "Chat"
      );
    }

    if (
      model?.supportsCompletion
    ) {
      capabilities.push(
        "Completion"
      );
    }

    if (
      model?.supportsVision
    ) {
      capabilities.push(
        "Vision"
      );
    }

    if (
      model?.supportsEmbeddings
    ) {
      capabilities.push(
        "Embeddings"
      );
    }

    if (
      model?.supportsTools
    ) {
      capabilities.push(
        "Tool Calling"
      );
    }

    return capabilities;
  };

  /**
   * Model action.
   *
   * This function is intentionally isolated
   * so it can later be connected to
   * modelApi.js or a dedicated model hook.
   */
  const handleModelAction = async (
    model
  ) => {
    const modelId =
      model?.id ||
      model?.modelId;

    if (!modelId) {
      return;
    }

    try {
      setActionLoading(true);

      /**
       * Add activation/deactivation API
       * integration here when your
       * modelApi.js is implemented.
       */
      console.log(
        "Model action requested:",
        modelId
      );

      await refetch?.();
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Initial loading state.
   */
  if (
    loading &&
    models.length === 0
  ) {
    return (
      <main
        className="console-models"
        aria-label="Models"
      >
        <div className="models-loading">
          <Spinner />

          <p>
            Loading model registry...
          </p>
        </div>
      </main>
    );
  }

  /**
   * Error state.
   */
  if (
    error &&
    models.length === 0
  ) {
    return (
      <main
        className="console-models"
        aria-label="Models"
      >
        <section className="models-error">
          <h1>
            Unable to load models
          </h1>

          <p>
            We couldn't retrieve the
            model registry.
          </p>

          <button
            type="button"
            onClick={handleRefresh}
            className="models-primary-button"
          >
            Try Again
          </button>
        </section>
      </main>
    );
  }

  return (
    <main
      className="console-models"
      aria-label="Model Management"
    >
      {/* ========================================
          Page Header
      ========================================= */}
      <header className="models-header">
        <div>
          <h1>
            Models
          </h1>

          <p>
            Manage AI models available
            across your platform.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="models-primary-button"
        >
          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </header>

      {/* ========================================
          Model Registry Summary
      ========================================= */}
      <section
        className="models-summary"
        aria-label="Model registry summary"
      >
        <div className="models-summary-card">
          <span>
            Total Models
          </span>

          <strong>
            {models.length}
          </strong>
        </div>

        <div className="models-summary-card">
          <span>
            Active Models
          </span>

          <strong>
            {
              models.filter(
                (model) =>
                  getModelStatus(
                    model
                  ) === "active"
              ).length
            }
          </strong>
        </div>

        <div className="models-summary-card">
          <span>
            Providers
          </span>

          <strong>
            {providers.length}
          </strong>
        </div>

        <div className="models-summary-card">
          <span>
            Filtered Results
          </span>

          <strong>
            {filteredModels.length}
          </strong>
        </div>
      </section>

      {/* ========================================
          Filters
      ========================================= */}
      <section
        className="models-toolbar"
        aria-label="Model filters"
      >
        {/* Search */}
        <div className="models-search">
          <label
            htmlFor="model-search"
            className="sr-only"
          >
            Search models
          </label>

          <input
            id="model-search"
            type="search"
            placeholder="Search models..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />
        </div>

        {/* Provider */}
        <div className="models-filter">
          <label htmlFor="model-provider">
            Provider
          </label>

          <select
            id="model-provider"
            value={providerFilter}
            onChange={(event) =>
              setProviderFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              All Providers
            </option>

            {providers.map(
              (provider) => (
                <option
                  key={provider}
                  value={provider}
                >
                  {provider}
                </option>
              )
            )}
          </select>
        </div>

        {/* Status */}
        <div className="models-filter">
          <label htmlFor="model-status">
            Status
          </label>

          <select
            id="model-status"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              All Statuses
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>

            <option value="disabled">
              Disabled
            </option>
          </select>
        </div>
      </section>

      {/* ========================================
          Models Grid
      ========================================= */}
      <section
        className="models-grid"
        aria-label="Available AI models"
      >
        {filteredModels.length ===
        0 ? (
          <div className="models-empty">
            <h2>
              No models found
            </h2>

            <p>
              No models match your
              current search and
              filter criteria.
            </p>
          </div>
        ) : (
          filteredModels.map(
            (model) => {
              const modelId =
                model?.id ||
                model?.modelId ||
                model?.name;

              return (
                <article
                  key={modelId}
                  className="model-item"
                >
                  <ModelCard
                    model={model}
                    onClick={() =>
                      handleViewModel(
                        model
                      )
                    }
                  />

                  <div className="model-item__actions">
                    <button
                      type="button"
                      onClick={() =>
                        handleViewModel(
                          model
                        )
                      }
                    >
                      View Details
                    </button>

                    <button
                      type="button"
                      disabled={
                        actionLoading
                      }
                      onClick={() =>
                        handleModelAction(
                          model
                        )
                      }
                    >
                      {getModelStatus(
                        model
                      ) === "active"
                        ? "Deactivate"
                        : "Activate"}
                    </button>
                  </div>
                </article>
              );
            }
          )
        )}
      </section>

      {/* ========================================
          Model Details Modal
      ========================================= */}
      {selectedModel && (
        <div
          className="model-details-overlay"
          role="presentation"
        >
          <div
            className="model-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="model-details-title"
          >
            <header className="model-details-header">
              <div>
                <span className="models-label">
                  Model Details
                </span>

                <h2 id="model-details-title">
                  {selectedModel.name ||
                    selectedModel.modelName ||
                    selectedModel.id}
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close model details"
                onClick={
                  handleCloseModel
                }
              >
                ×
              </button>
            </header>

            <div className="model-details-content">
              <div className="model-detail-row">
                <span>
                  Provider
                </span>

                <strong>
                  {selectedModel.provider ||
                    "—"}
                </strong>
              </div>

              <div className="model-detail-row">
                <span>
                  Model ID
                </span>

                <code>
                  {selectedModel.id ||
                    selectedModel.modelId ||
                    "—"}
                </code>
              </div>

              <div className="model-detail-row">
                <span>
                  Status
                </span>

                <strong>
                  {getModelStatus(
                    selectedModel
                  ).toUpperCase()}
                </strong>
              </div>

              <div className="model-detail-row">
                <span>
                  Context Window
                </span>

                <strong>
                  {selectedModel.contextWindow ||
                    selectedModel.maxTokens ||
                    "—"}
                </strong>
              </div>

              <div className="model-detail-row">
                <span>
                  Capabilities
                </span>

                <div className="model-capabilities">
                  {getCapabilities(
                    selectedModel
                  ).length > 0 ? (
                    getCapabilities(
                      selectedModel
                    ).map(
                      (capability) => (
                        <span
                          key={
                            capability
                          }
                          className="model-capability"
                        >
                          {capability}
                        </span>
                      )
                    )
                  ) : (
                    <span>
                      No capabilities
                      specified
                    </span>
                  )}
                </div>
              </div>

              <div className="model-detail-description">
                <span>
                  Description
                </span>

                <p>
                  {selectedModel.description ||
                    "No description available."}
                </p>
              </div>
            </div>

            <footer className="model-details-footer">
              <button
                type="button"
                onClick={
                  handleCloseModel
                }
              >
                Close
              </button>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}