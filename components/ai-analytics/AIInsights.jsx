import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

/* =========================================================
   Constants
========================================================= */

const INSIGHT_TYPES = Object.freeze({
  PERFORMANCE: "performance",
  COST: "cost",
  QUALITY: "quality",
  SECURITY: "security",
  USAGE: "usage",
  RELIABILITY: "reliability",
});

const SEVERITY_LEVELS = Object.freeze({
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
  INFO: "info",
});

const DEFAULT_FILTERS = {
  type: "all",
  severity: "all",
  search: "",
};

/* =========================================================
   Utility Functions
========================================================= */

const formatNumber = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  return new Intl.NumberFormat(
    "en-US"
  ).format(value);
};

const formatPercentage = (
  value
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  return `${Number(value).toFixed(
    1
  )}%`;
};

const formatCurrency = (
  value,
  currency = "USD"
) => {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency,
    }
  ).format(value || 0);
};

const formatDate = (
  value
) => {
  if (!value) {
    return "—";
  }

  try {
    return new Intl.DateTimeFormat(
      "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(
      new Date(value)
    );
  } catch {
    return value;
  }
};

const getSeverityClass = (
  severity
) => {
  return `insight-severity insight-severity-${severity}`;
};

/* =========================================================
   All Insights Component
========================================================= */

const AllInsights = ({
  apiBaseUrl = "/api",
  organizationId,
  workspaceId,
}) => {
  /* =======================================================
     State
  ======================================================= */

  const [
    insights,
    setInsights,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState(null);

  const [
    filters,
    setFilters,
  ] = useState(
    DEFAULT_FILTERS
  );

  const [
    selectedInsight,
    setSelectedInsight,
  ] = useState(null);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  /* =======================================================
     Analytics Summary
  ======================================================= */

  const [
    summary,
    setSummary,
  ] = useState({
    totalInsights: 0,
    criticalInsights: 0,
    highPriorityInsights: 0,
    resolvedInsights: 0,
    potentialSavings: 0,
    currency: "USD",
  });

  /* =======================================================
     Fetch Insights
  ======================================================= */

  const fetchInsights =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        try {
          const params =
            new URLSearchParams();

          if (
            organizationId
          ) {
            params.set(
              "organizationId",
              organizationId
            );
          }

          if (
            workspaceId
          ) {
            params.set(
              "workspaceId",
              workspaceId
            );
          }

          const response =
            await fetch(
              `${apiBaseUrl}/ai-analytics/insights?${params.toString()}`,
              {
                method:
                  "GET",

                credentials:
                  "include",

                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          if (
            !response.ok
          ) {
            throw new Error(
              `Failed to load AI analytics insights (${response.status}).`
            );
          }

          const data =
            await response.json();

          setInsights(
            Array.isArray(
              data.insights
            )
              ? data.insights
              : []
          );

          setSummary({
            totalInsights:
              data.summary
                ?.totalInsights ||
              0,

            criticalInsights:
              data.summary
                ?.criticalInsights ||
              0,

            highPriorityInsights:
              data.summary
                ?.highPriorityInsights ||
              0,

            resolvedInsights:
              data.summary
                ?.resolvedInsights ||
              0,

            potentialSavings:
              data.summary
                ?.potentialSavings ||
              0,

            currency:
              data.summary
                ?.currency ||
              "USD",
          });
        } catch (
          fetchError
        ) {
          const message =
            fetchError instanceof
            Error
              ? fetchError.message
              : "Unable to load AI analytics insights.";

          setError(
            message
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        apiBaseUrl,
        organizationId,
        workspaceId,
      ]
    );

  /* =======================================================
     Initial Data Load
  ======================================================= */

  useEffect(() => {
    fetchInsights();
  }, [
    fetchInsights,
  ]);

  /* =======================================================
     Filtered Insights
  ======================================================= */

  const filteredInsights =
    useMemo(() => {
      const searchTerm =
        filters.search
          .trim()
          .toLowerCase();

      return insights.filter(
        (insight) => {
          const matchesType =
            filters.type ===
              "all" ||
            insight.type ===
              filters.type;

          const matchesSeverity =
            filters.severity ===
              "all" ||
            insight.severity ===
              filters.severity;

          const searchableText =
            [
              insight.title,
              insight.description,
              insight.category,
              insight.agentName,
              insight.modelName,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

          const matchesSearch =
            !searchTerm ||
            searchableText.includes(
              searchTerm
            );

          return (
            matchesType &&
            matchesSeverity &&
            matchesSearch
          );
        }
      );
    }, [
      insights,
      filters,
    ]);

  /* =======================================================
     Update Filter
  ======================================================= */

  const updateFilter = (
    key,
    value
  ) => {
    setFilters(
      (current) => ({
        ...current,
        [key]: value,
      })
    );
  };

  /* =======================================================
     Resolve Insight
  ======================================================= */

  const handleResolve =
    async (
      insightId
    ) => {
      try {
        const response =
          await fetch(
            `${apiBaseUrl}/ai-analytics/insights/${insightId}/resolve`,
            {
              method:
                "POST",

              credentials:
                "include",

              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        if (
          !response.ok
        ) {
          throw new Error(
            "Failed to resolve insight."
          );
        }

        setInsights(
          (current) =>
            current.map(
              (insight) =>
                insight.id ===
                insightId
                  ? {
                      ...insight,
                      resolved:
                        true,
                    }
                  : insight
            )
        );

        setSummary(
          (current) => ({
            ...current,
            resolvedInsights:
              current.resolvedInsights +
              1,
          })
        );
      } catch (
        resolveError
      ) {
        setError(
          resolveError instanceof
          Error
            ? resolveError.message
            : "Unable to resolve insight."
        );
      }
    };

  /* =======================================================
     Insight Priority
  ======================================================= */

  const activeInsights =
    useMemo(
      () =>
        filteredInsights.filter(
          (insight) =>
            !insight.resolved
        ),
      [filteredInsights]
    );

  /* =======================================================
     Render
  ======================================================= */

  return (
    <main className="all-insights-page">

      {/* ===================================================
          Header
      =================================================== */}

      <header className="insights-header">
        <div>
          <span className="insights-eyebrow">
            AI Analytics
          </span>

          <h1>
            All Insights
          </h1>

          <p>
            Monitor AI performance,
            cost, quality, usage,
            and operational risks
            across your platform.
          </p>
        </div>

        <button
          type="button"
          className="insights-refresh-button"
          disabled={
            loading ||
            refreshing
          }
          onClick={() =>
            fetchInsights({
              silent: true,
            })
          }
        >
          {refreshing
            ? "Refreshing..."
            : "Refresh Insights"}
        </button>
      </header>

      {/* ===================================================
          Error
      =================================================== */}

      {error && (
        <section className="insights-error">
          <div>
            <strong>
              Unable to load insights
            </strong>

            <p>
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setError(null)
            }
          >
            Dismiss
          </button>
        </section>
      )}

      {/* ===================================================
          KPI Summary
      =================================================== */}

      <section className="insights-summary-grid">

        <article className="insight-summary-card">
          <span>
            Total Insights
          </span>

          <strong>
            {formatNumber(
              summary.totalInsights
            )}
          </strong>

          <small>
            Generated by AI
            analytics
          </small>
        </article>

        <article className="insight-summary-card critical">
          <span>
            Critical
          </span>

          <strong>
            {formatNumber(
              summary.criticalInsights
            )}
          </strong>

          <small>
            Immediate attention
            required
          </small>
        </article>

        <article className="insight-summary-card high">
          <span>
            High Priority
          </span>

          <strong>
            {formatNumber(
              summary.highPriorityInsights
            )}
          </strong>

          <small>
            Recommended actions
          </small>
        </article>

        <article className="insight-summary-card">
          <span>
            Resolved
          </span>

          <strong>
            {formatNumber(
              summary.resolvedInsights
            )}
          </strong>

          <small>
            Successfully handled
          </small>
        </article>

        <article className="insight-summary-card savings">
          <span>
            Potential Savings
          </span>

          <strong>
            {formatCurrency(
              summary.potentialSavings,
              summary.currency
            )}
          </strong>

          <small>
            Estimated optimization
          </small>
        </article>

      </section>

      {/* ===================================================
          Filters
      =================================================== */}

      <section className="insights-filters">

        <div className="insights-search">
          <label htmlFor="insight-search">
            Search insights
          </label>

          <input
            id="insight-search"
            type="search"
            placeholder="Search by title, agent, model..."
            value={
              filters.search
            }
            onChange={(event) =>
              updateFilter(
                "search",
                event.target.value
              )
            }
          />
        </div>

        <div className="insight-filter">
          <label htmlFor="insight-type">
            Type
          </label>

          <select
            id="insight-type"
            value={
              filters.type
            }
            onChange={(event) =>
              updateFilter(
                "type",
                event.target.value
              )
            }
          >
            <option value="all">
              All Types
            </option>

            <option
              value={
                INSIGHT_TYPES.PERFORMANCE
              }
            >
              Performance
            </option>

            <option
              value={
                INSIGHT_TYPES.COST
              }
            >
              Cost
            </option>

            <option
              value={
                INSIGHT_TYPES.QUALITY
              }
            >
              Quality
            </option>

            <option
              value={
                INSIGHT_TYPES.SECURITY
              }
            >
              Security
            </option>

            <option
              value={
                INSIGHT_TYPES.USAGE
              }
            >
              Usage
            </option>

            <option
              value={
                INSIGHT_TYPES.RELIABILITY
              }
            >
              Reliability
            </option>
          </select>
        </div>

        <div className="insight-filter">
          <label htmlFor="insight-severity">
            Severity
          </label>

          <select
            id="insight-severity"
            value={
              filters.severity
            }
            onChange={(event) =>
              updateFilter(
                "severity",
                event.target.value
              )
            }
          >
            <option value="all">
              All Severity
            </option>

            <option
              value={
                SEVERITY_LEVELS.CRITICAL
              }
            >
              Critical
            </option>

            <option
              value={
                SEVERITY_LEVELS.HIGH
              }
            >
              High
            </option>

            <option
              value={
                SEVERITY_LEVELS.MEDIUM
              }
            >
              Medium
            </option>

            <option
              value={
                SEVERITY_LEVELS.LOW
              }
            >
              Low
            </option>

            <option
              value={
                SEVERITY_LEVELS.INFO
              }
            >
              Info
            </option>
          </select>
        </div>

      </section>

      {/* ===================================================
          Results
      =================================================== */}

      <section className="insights-results">

        <div className="insights-results-header">
          <div>
            <h2>
              Insights
            </h2>

            <p>
              Showing{" "}
              {
                filteredInsights.length
              }{" "}
              insights
            </p>
          </div>

          <span>
            {
              activeInsights.length
            }{" "}
            active
          </span>
        </div>

        {loading ? (
          <div className="insights-loading">
            <div className="insights-spinner" />

            <p>
              Analyzing AI platform
              data...
            </p>
          </div>
        ) : filteredInsights.length ===
          0 ? (
          <div className="insights-empty">
            <h3>
              No insights found
            </h3>

            <p>
              Try changing your
              filters or search
              criteria.
            </p>
          </div>
        ) : (
          <div className="insights-list">
            {filteredInsights.map(
              (insight) => (
                <article
                  key={
                    insight.id
                  }
                  className={`insight-card ${
                    insight.resolved
                      ? "insight-card-resolved"
                      : ""
                  }`}
                >
                  <div className="insight-card-header">

                    <div>
                      <span
                        className={getSeverityClass(
                          insight.severity
                        )}
                      >
                        {
                          insight.severity
                        }
                      </span>

                      <span className="insight-type">
                        {
                          insight.type
                        }
                      </span>
                    </div>

                    {insight.resolved && (
                      <span className="insight-resolved">
                        Resolved
                      </span>
                    )}
                  </div>

                  <div className="insight-card-body">

                    <h3>
                      {
                        insight.title
                      }
                    </h3>

                    <p>
                      {
                        insight.description
                      }
                    </p>

                    <div className="insight-metadata">

                      {insight.agentName && (
                        <span>
                          Agent:{" "}
                          <strong>
                            {
                              insight.agentName
                            }
                          </strong>
                        </span>
                      )}

                      {insight.modelName && (
                        <span>
                          Model:{" "}
                          <strong>
                            {
                              insight.modelName
                            }
                          </strong>
                        </span>
                      )}

                      {insight.createdAt && (
                        <span>
                          Detected:{" "}
                          <strong>
                            {formatDate(
                              insight.createdAt
                            )}
                          </strong>
                        </span>
                      )}

                    </div>

                    {insight.metric && (
                      <div className="insight-metric">

                        <span>
                          {
                            insight.metric.label
                          }
                        </span>

                        <strong>
                          {insight.metric.value}
                        </strong>

                        {insight.metric.change !==
                          undefined && (
                          <small>
                            {
                              insight.metric.change >
                              0
                                ? "+"
                                : ""
                            }
                            {
                              insight.metric.change
                            }
                            %
                          </small>
                        )}

                      </div>
                    )}

                  </div>

                  <div className="insight-card-actions">

                    <button
                      type="button"
                      className="insight-details-button"
                      onClick={() =>
                        setSelectedInsight(
                          insight
                        )
                      }
                    >
                      View Details
                    </button>

                    {!insight.resolved && (
                      <button
                        type="button"
                        className="insight-resolve-button"
                        onClick={() =>
                          handleResolve(
                            insight.id
                          )
                        }
                      >
                        Mark Resolved
                      </button>
                    )}

                  </div>
                </article>
              )
            )}
          </div>
        )}

      </section>

      {/* ===================================================
          Detail Modal
      =================================================== */}

      {selectedInsight && (
        <div
          className="insight-modal-overlay"
          onClick={() =>
            setSelectedInsight(
              null
            )
          }
        >
          <div
            className="insight-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <header className="insight-modal-header">

              <div>
                <span
                  className={getSeverityClass(
                    selectedInsight.severity
                  )}
                >
                  {
                    selectedInsight.severity
                  }
                </span>

                <h2>
                  {
                    selectedInsight.title
                  }
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedInsight(
                    null
                  )
                }
              >
                ×
              </button>

            </header>

            <div className="insight-modal-content">

              <p>
                {
                  selectedInsight.description
                }
              </p>

              {selectedInsight.recommendation && (
                <div className="insight-recommendation">
                  <h3>
                    Recommended Action
                  </h3>

                  <p>
                    {
                      selectedInsight.recommendation
                    }
                  </p>
                </div>
              )}

              {selectedInsight.impact && (
                <div className="insight-impact">
                  <h3>
                    Expected Impact
                  </h3>

                  <p>
                    {
                      selectedInsight.impact
                    }
                  </p>
                </div>
              )}

              <div className="insight-detail-grid">

                <div>
                  <span>
                    Type
                  </span>

                  <strong>
                    {
                      selectedInsight.type
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Severity
                  </span>

                  <strong>
                    {
                      selectedInsight.severity
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Agent
                  </span>

                  <strong>
                    {
                      selectedInsight.agentName ||
                      "—"
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Model
                  </span>

                  <strong>
                    {
                      selectedInsight.modelName ||
                      "—"
                    }
                  </strong>
                </div>

              </div>

            </div>

            <footer className="insight-modal-footer">

              {!selectedInsight.resolved && (
                <button
                  type="button"
                  className="insight-resolve-button"
                  onClick={() => {
                    handleResolve(
                      selectedInsight.id
                    );

                    setSelectedInsight(
                      null
                    );
                  }}
                >
                  Mark as Resolved
                </button>
              )}

              <button
                type="button"
                className="insight-details-button"
                onClick={() =>
                  setSelectedInsight(
                    null
                  )
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
};

export default AllInsights;