import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const ModelIntelligence = ({
  apiBaseUrl = "/api",
  workspaceId,
  organizationId,
}) => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] =
    useState("all");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [selectedModel, setSelectedModel] =
    useState(null);

  const loadModels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (workspaceId) {
        params.set(
          "workspaceId",
          workspaceId
        );
      }

      if (organizationId) {
        params.set(
          "organizationId",
          organizationId
        );
      }

      const response = await fetch(
        `${apiBaseUrl}/ai-analytics/model-intelligence?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load model intelligence (${response.status}).`
        );
      }

      const data = await response.json();

      setModels(
        Array.isArray(data.models)
          ? data.models
          : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load model intelligence."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [
    apiBaseUrl,
    workspaceId,
    organizationId,
  ]);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  const providers = useMemo(() => {
    return [
      ...new Set(
        models
          .map((model) => model.provider)
          .filter(Boolean)
      ),
    ];
  }, [models]);

  const filteredModels = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return models.filter((model) => {
      const matchesSearch =
        !query ||
        [
          model.name,
          model.provider,
          model.version,
          model.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesProvider =
        providerFilter === "all" ||
        model.provider === providerFilter;

      const matchesStatus =
        statusFilter === "all" ||
        model.status === statusFilter;

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

  const summary = useMemo(() => {
    const activeModels = models.filter(
      (model) =>
        model.status === "active"
    );

    const totalRequests = models.reduce(
      (total, model) =>
        total +
        Number(model.requests || 0),
      0
    );

    const totalCost = models.reduce(
      (total, model) =>
        total +
        Number(model.cost || 0),
      0
    );

    const averageLatency =
      models.length > 0
        ? models.reduce(
            (total, model) =>
              total +
              Number(
                model.latency || 0
              ),
            0
          ) / models.length
        : 0;

    const averageQuality =
      models.length > 0
        ? models.reduce(
            (total, model) =>
              total +
              Number(
                model.qualityScore || 0
              ),
            0
          ) / models.length
        : 0;

    return {
      totalModels: models.length,
      activeModels: activeModels.length,
      totalRequests,
      totalCost,
      averageLatency,
      averageQuality,
    };
  }, [models]);

  const formatNumber = (value) =>
    new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(Number(value) || 0);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);

  const formatPercentage = (value) =>
    `${Number(value || 0).toFixed(1)}%`;

  const refreshData = async () => {
    setRefreshing(true);
    await loadModels();
  };

  if (loading) {
    return (
      <section className="model-intelligence">
        <div className="model-intelligence__loading">
          Loading model intelligence...
        </div>
      </section>
    );
  }

  return (
    <section className="model-intelligence">
      <header className="model-intelligence__header">
        <div>
          <span className="model-intelligence__eyebrow">
            AI Operations
          </span>

          <h2>
            Model Intelligence
          </h2>

          <p>
            Monitor AI model performance,
            reliability, cost, quality,
            and operational efficiency.
          </p>
        </div>

        <button
          type="button"
          onClick={refreshData}
          disabled={refreshing}
        >
          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </header>

      {error && (
        <div
          className="model-intelligence__error"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="model-intelligence__summary">
        <article>
          <span>Total Models</span>
          <strong>
            {summary.totalModels}
          </strong>
        </article>

        <article>
          <span>Active Models</span>
          <strong>
            {summary.activeModels}
          </strong>
        </article>

        <article>
          <span>Total Requests</span>
          <strong>
            {formatNumber(
              summary.totalRequests
            )}
          </strong>
        </article>

        <article>
          <span>Total Cost</span>
          <strong>
            {formatCurrency(
              summary.totalCost
            )}
          </strong>
        </article>

        <article>
          <span>Avg. Latency</span>
          <strong>
            {summary.averageLatency.toFixed(
              0
            )}
            ms
          </strong>
        </article>

        <article>
          <span>Avg. Quality</span>
          <strong>
            {formatPercentage(
              summary.averageQuality
            )}
          </strong>
        </article>
      </div>

      <div className="model-intelligence__filters">
        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search models..."
          aria-label="Search models"
        />

        <select
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

          {providers.map((provider) => (
            <option
              key={provider}
              value={provider}
            >
              {provider}
            </option>
          ))}
        </select>

        <select
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

          <option value="degraded">
            Degraded
          </option>

          <option value="maintenance">
            Maintenance
          </option>
        </select>
      </div>

      {filteredModels.length === 0 ? (
        <div className="model-intelligence__empty">
          <strong>
            No models found
          </strong>

          <p>
            Try changing your search or
            filter criteria.
          </p>
        </div>
      ) : (
        <div className="model-intelligence__grid">
          {filteredModels.map((model) => (
            <article
              key={
                model.id ||
                `${model.provider}-${model.name}`
              }
              className="model-intelligence__card"
            >
              <header className="model-intelligence__card-header">
                <div>
                  <span className="model-intelligence__provider">
                    {model.provider ||
                      "Unknown Provider"}
                  </span>

                  <h3>
                    {model.name}
                  </h3>

                  {model.version && (
                    <small>
                      Version{" "}
                      {model.version}
                    </small>
                  )}
                </div>

                <span
                  className={`model-intelligence__status model-intelligence__status--${model.status || "unknown"}`}
                >
                  {model.status ||
                    "unknown"}
                </span>
              </header>

              {model.description && (
                <p className="model-intelligence__description">
                  {model.description}
                </p>
              )}

              <div className="model-intelligence__metrics">
                <div>
                  <span>
                    Requests
                  </span>

                  <strong>
                    {formatNumber(
                      model.requests
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Cost
                  </span>

                  <strong>
                    {formatCurrency(
                      model.cost
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Latency
                  </span>

                  <strong>
                    {Number(
                      model.latency || 0
                    ).toFixed(0)}
                    ms
                  </strong>
                </div>

                <div>
                  <span>
                    Error Rate
                  </span>

                  <strong>
                    {formatPercentage(
                      model.errorRate
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Quality
                  </span>

                  <strong>
                    {formatPercentage(
                      model.qualityScore
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Availability
                  </span>

                  <strong>
                    {formatPercentage(
                      model.availability
                    )}
                  </strong>
                </div>
              </div>

              <div className="model-intelligence__performance">
                <div>
                  <span>
                    Performance
                  </span>

                  <div className="model-intelligence__progress">
                    <div
                      style={{
                        width: `${Math.min(
                          100,
                          Number(
                            model.performanceScore ||
                              0
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <footer className="model-intelligence__card-footer">
                <span>
                  Updated{" "}
                  {model.updatedAt
                    ? new Date(
                        model.updatedAt
                      ).toLocaleString()
                    : "recently"}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedModel(
                      model
                    )
                  }
                >
                  View Details
                </button>
              </footer>
            </article>
          ))}
        </div>
      )}

      {selectedModel && (
        <div
          className="model-intelligence__modal-backdrop"
          onClick={() =>
            setSelectedModel(null)
          }
        >
          <div
            className="model-intelligence__modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <header>
              <div>
                <span>
                  {
                    selectedModel.provider
                  }
                </span>

                <h3>
                  {selectedModel.name}
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedModel(
                    null
                  )
                }
              >
                ×
              </button>
            </header>

            <div className="model-intelligence__modal-body">
              <div className="model-intelligence__detail-grid">
                <div>
                  <span>
                    Requests
                  </span>

                  <strong>
                    {formatNumber(
                      selectedModel.requests
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Cost
                  </span>

                  <strong>
                    {formatCurrency(
                      selectedModel.cost
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Average Latency
                  </span>

                  <strong>
                    {Number(
                      selectedModel.latency ||
                        0
                    ).toFixed(0)}
                    ms
                  </strong>
                </div>

                <div>
                  <span>
                    Error Rate
                  </span>

                  <strong>
                    {formatPercentage(
                      selectedModel.errorRate
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Quality Score
                  </span>

                  <strong>
                    {formatPercentage(
                      selectedModel.qualityScore
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Availability
                  </span>

                  <strong>
                    {formatPercentage(
                      selectedModel.availability
                    )}
                  </strong>
                </div>
              </div>

              {selectedModel.insights?.length >
                0 && (
                <div>
                  <h4>
                    AI Insights
                  </h4>

                  <ul>
                    {selectedModel.insights.map(
                      (insight, index) => (
                        <li
                          key={
                            insight.id ||
                            index
                          }
                        >
                          {insight}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {selectedModel.recommendations
                ?.length > 0 && (
                <div>
                  <h4>
                    Recommendations
                  </h4>

                  <ul>
                    {selectedModel.recommendations.map(
                      (
                        recommendation,
                        index
                      ) => (
                        <li
                          key={
                            recommendation.id ||
                            index
                          }
                        >
                          {recommendation}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>

            <footer>
              <button
                type="button"
                onClick={() =>
                  setSelectedModel(null)
                }
              >
                Close
              </button>
            </footer>
          </div>
        </div>
      )}
    </section>
  );
};

export default ModelIntelligence;