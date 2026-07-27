import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const PERIODS = Object.freeze({
  SEVEN_DAYS: "7d",
  THIRTY_DAYS: "30d",
  NINETY_DAYS: "90d",
  ONE_YEAR: "1y",
});

const UsageInsights = ({
  apiBaseUrl = "/api",
  workspaceId,
  organizationId,
}) => {
  const [period, setPeriod] =
    useState(PERIODS.THIRTY_DAYS);

  const [data, setData] = useState({
    summary: {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      activeUsers: 0,
      activeAgents: 0,
      averageLatency: 0,
    },

    trend: [],

    models: [],

    agents: [],

    users: [],
  });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const loadUsageInsights =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const params =
          new URLSearchParams();

        params.set(
          "period",
          period
        );

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

        const response =
          await fetch(
            `${apiBaseUrl}/usage/insights?${params.toString()}`,
            {
              method: "GET",
              credentials: "include",
              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        if (!response.ok) {
          throw new Error(
            `Unable to load usage insights (${response.status}).`
          );
        }

        const result =
          await response.json();

        setData({
          summary:
            result.summary || {
              totalRequests: 0,
              totalTokens: 0,
              totalCost: 0,
              activeUsers: 0,
              activeAgents: 0,
              averageLatency: 0,
            },

          trend: Array.isArray(
            result.trend
          )
            ? result.trend
            : [],

          models: Array.isArray(
            result.models
          )
            ? result.models
            : [],

          agents: Array.isArray(
            result.agents
          )
            ? result.agents
            : [],

          users: Array.isArray(
            result.users
          )
            ? result.users
            : [],
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load usage insights."
        );
      } finally {
        setLoading(false);
      }
    }, [
      apiBaseUrl,
      period,
      workspaceId,
      organizationId,
    ]);

  useEffect(() => {
    loadUsageInsights();
  }, [
    loadUsageInsights,
  ]);

  const maxTrendValue = useMemo(() => {
    if (!data.trend.length) {
      return 1;
    }

    return Math.max(
      ...data.trend.map(
        (item) =>
          Number(
            item.requests || 0
          )
      ),
      1
    );
  }, [data.trend]);

  const formatNumber = (
    value
  ) => {
    return new Intl.NumberFormat(
      "en-US",
      {
        notation: "compact",
        maximumFractionDigits: 1,
      }
    ).format(Number(value) || 0);
  };

  const formatCurrency = (
    value
  ) => {
    return new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }
    ).format(Number(value) || 0);
  };

  if (loading) {
    return (
      <section className="usage-insights">
        <div className="usage-insights__loading">
          Loading usage insights...
        </div>
      </section>
    );
  }

  return (
    <section className="usage-insights">
      <header className="usage-insights__header">
        <div>
          <span className="usage-insights__eyebrow">
            Platform Analytics
          </span>

          <h2>
            Usage Insights
          </h2>

          <p>
            Monitor AI usage,
            consumption, performance,
            and adoption.
          </p>
        </div>

        <div className="usage-insights__actions">
          <select
            value={period}
            onChange={(event) =>
              setPeriod(
                event.target.value
              )
            }
            aria-label="Usage period"
          >
            <option
              value={PERIODS.SEVEN_DAYS}
            >
              Last 7 Days
            </option>

            <option
              value={PERIODS.THIRTY_DAYS}
            >
              Last 30 Days
            </option>

            <option
              value={PERIODS.NINETY_DAYS}
            >
              Last 90 Days
            </option>

            <option
              value={PERIODS.ONE_YEAR}
            >
              Last Year
            </option>
          </select>

          <button
            type="button"
            onClick={
              loadUsageInsights
            }
          >
            Refresh
          </button>
        </div>
      </header>

      {error && (
        <div
          className="usage-insights__error"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Summary Metrics */}

      <div className="usage-insights__summary">
        <article className="usage-insights__metric">
          <span>
            Total Requests
          </span>

          <strong>
            {formatNumber(
              data.summary
                .totalRequests
            )}
          </strong>

          <small>
            API and AI requests
          </small>
        </article>

        <article className="usage-insights__metric">
          <span>
            Tokens Consumed
          </span>

          <strong>
            {formatNumber(
              data.summary
                .totalTokens
            )}
          </strong>

          <small>
            Input and output tokens
          </small>
        </article>

        <article className="usage-insights__metric">
          <span>
            Total Cost
          </span>

          <strong>
            {formatCurrency(
              data.summary
                .totalCost
            )}
          </strong>

          <small>
            Estimated platform cost
          </small>
        </article>

        <article className="usage-insights__metric">
          <span>
            Active Users
          </span>

          <strong>
            {formatNumber(
              data.summary
                .activeUsers
            )}
          </strong>

          <small>
            Unique active users
          </small>
        </article>

        <article className="usage-insights__metric">
          <span>
            Active Agents
          </span>

          <strong>
            {formatNumber(
              data.summary
                .activeAgents
            )}
          </strong>

          <small>
            AI agents in use
          </small>
        </article>

        <article className="usage-insights__metric">
          <span>
            Avg. Latency
          </span>

          <strong>
            {Number(
              data.summary
                .averageLatency
            ).toFixed(0)}
            ms
          </strong>

          <small>
            Average response time
          </small>
        </article>
      </div>

      {/* Usage Trend */}

      <section className="usage-insights__section">
        <div className="usage-insights__section-header">
          <div>
            <h3>
              Usage Trend
            </h3>

            <p>
              Request volume over time.
            </p>
          </div>
        </div>

        {data.trend.length ===
        0 ? (
          <div className="usage-insights__empty">
            No usage trend data
            available.
          </div>
        ) : (
          <div className="usage-insights__trend">
            {data.trend.map(
              (item) => {
                const requests =
                  Number(
                    item.requests || 0
                  );

                const height =
                  Math.max(
                    4,
                    (requests /
                      maxTrendValue) *
                      100
                  );

                return (
                  <div
                    key={
                      item.date
                    }
                    className="usage-insights__trend-item"
                  >
                    <div className="usage-insights__trend-value">
                      {formatNumber(
                        requests
                      )}
                    </div>

                    <div className="usage-insights__bar-container">
                      <div
                        className="usage-insights__bar"
                        style={{
                          height: `${height}%`,
                        }}
                        title={`${requests} requests`}
                      />
                    </div>

                    <span>
                      {item.label ||
                        item.date}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>

      {/* Model Usage */}

      <section className="usage-insights__section">
        <div className="usage-insights__section-header">
          <div>
            <h3>
              Model Usage
            </h3>

            <p>
              AI model consumption and
              cost distribution.
            </p>
          </div>
        </div>

        {data.models.length ===
        0 ? (
          <div className="usage-insights__empty">
            No model usage data
            available.
          </div>
        ) : (
          <div className="usage-insights__table-wrapper">
            <table className="usage-insights__table">
              <thead>
                <tr>
                  <th>
                    Model
                  </th>

                  <th>
                    Requests
                  </th>

                  <th>
                    Tokens
                  </th>

                  <th>
                    Cost
                  </th>

                  <th>
                    Avg. Latency
                  </th>

                  <th>
                    Usage
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.models.map(
                  (model) => (
                    <tr
                      key={
                        model.id ||
                        model.name
                      }
                    >
                      <td>
                        <strong>
                          {model.name}
                        </strong>
                      </td>

                      <td>
                        {formatNumber(
                          model.requests
                        )}
                      </td>

                      <td>
                        {formatNumber(
                          model.tokens
                        )}
                      </td>

                      <td>
                        {formatCurrency(
                          model.cost
                        )}
                      </td>

                      <td>
                        {Number(
                          model.latency ||
                            0
                        ).toFixed(0)}
                        ms
                      </td>

                      <td>
                        {Number(
                          model.usagePercentage ||
                            0
                        ).toFixed(1)}
                        %
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Agent Usage */}

      <section className="usage-insights__section">
        <div className="usage-insights__section-header">
          <div>
            <h3>
              Agent Usage
            </h3>

            <p>
              Most active AI agents.
            </p>
          </div>
        </div>

        <div className="usage-insights__agent-grid">
          {data.agents.map(
            (agent) => (
              <article
                key={
                  agent.id ||
                  agent.name
                }
                className="usage-insights__agent-card"
              >
                <div>
                  <strong>
                    {agent.name}
                  </strong>

                  <span>
                    {agent.status ||
                      "active"}
                  </span>
                </div>

                <div className="usage-insights__agent-stats">
                  <div>
                    <small>
                      Requests
                    </small>

                    <strong>
                      {formatNumber(
                        agent.requests
                      )}
                    </strong>
                  </div>

                  <div>
                    <small>
                      Tokens
                    </small>

                    <strong>
                      {formatNumber(
                        agent.tokens
                      )}
                    </strong>
                  </div>

                  <div>
                    <small>
                      Cost
                    </small>

                    <strong>
                      {formatCurrency(
                        agent.cost
                      )}
                    </strong>
                  </div>
                </div>
              </article>
            )
          )}
        </div>
      </section>

      {/* Top Users */}

      <section className="usage-insights__section">
        <div className="usage-insights__section-header">
          <div>
            <h3>
              Top Users
            </h3>

            <p>
              Users with the highest
              platform consumption.
            </p>
          </div>
        </div>

        {data.users.length ===
        0 ? (
          <div className="usage-insights__empty">
            No user usage data
            available.
          </div>
        ) : (
          <div className="usage-insights__users">
            {data.users
              .slice(0, 10)
              .map(
                (user, index) => (
                  <div
                    key={
                      user.id ||
                      user.email
                    }
                    className="usage-insights__user"
                  >
                    <span className="usage-insights__rank">
                      #{index + 1}
                    </span>

                    <div className="usage-insights__user-avatar">
                      {(
                        user.name ||
                        user.email ||
                        "U"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="usage-insights__user-info">
                      <strong>
                        {user.name ||
                          user.email}
                      </strong>

                      {user.name && (
                        <small>
                          {user.email}
                        </small>
                      )}
                    </div>

                    <div className="usage-insights__user-stats">
                      <strong>
                        {formatNumber(
                          user.requests
                        )}
                      </strong>

                      <small>
                        requests
                      </small>
                    </div>

                    <div className="usage-insights__user-stats">
                      <strong>
                        {formatCurrency(
                          user.cost
                        )}
                      </strong>

                      <small>
                        cost
                      </small>
                    </div>
                  </div>
                )
              )}
          </div>
        )}
      </section>
    </section>
  );
};

export default UsageInsights;