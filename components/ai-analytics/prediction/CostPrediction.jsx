import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const FORECAST_PERIODS = Object.freeze({
  SEVEN_DAYS: "7d",
  THIRTY_DAYS: "30d",
  NINETY_DAYS: "90d",
  ONE_YEAR: "1y",
});

const RISK_LEVELS = Object.freeze({
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
});

const CostPrediction = ({
  apiBaseUrl = "/api",
  workspaceId,
  organizationId,
}) => {
  const [period, setPeriod] = useState(
    FORECAST_PERIODS.THIRTY_DAYS
  );

  const [data, setData] = useState({
    currentSpend: 0,
    predictedSpend: 0,
    budget: 0,
    projectedSavings: 0,
    confidence: 0,
    riskLevel: RISK_LEVELS.LOW,
    forecast: [],
    models: [],
    recommendations: [],
  });

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState(null);

  const loadPrediction =
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
            `${apiBaseUrl}/cost/prediction?${params.toString()}`,
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
            `Unable to load cost prediction (${response.status}).`
          );
        }

        const result =
          await response.json();

        setData({
          currentSpend:
            result.currentSpend || 0,

          predictedSpend:
            result.predictedSpend || 0,

          budget:
            result.budget || 0,

          projectedSavings:
            result.projectedSavings || 0,

          confidence:
            result.confidence || 0,

          riskLevel:
            result.riskLevel ||
            RISK_LEVELS.LOW,

          forecast:
            Array.isArray(
              result.forecast
            )
              ? result.forecast
              : [],

          models:
            Array.isArray(
              result.models
            )
              ? result.models
              : [],

          recommendations:
            Array.isArray(
              result.recommendations
            )
              ? result.recommendations
              : [],
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load cost prediction."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, [
      apiBaseUrl,
      period,
      workspaceId,
      organizationId,
    ]);

  useEffect(() => {
    loadPrediction();
  }, [loadPrediction]);

  const refreshPrediction =
    async () => {
      setRefreshing(true);

      try {
        const params =
          new URLSearchParams();

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
            `${apiBaseUrl}/cost/prediction/recalculate?${params.toString()}`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        if (!response.ok) {
          throw new Error(
            "Unable to recalculate prediction."
          );
        }

        await loadPrediction();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to refresh prediction."
        );

        setRefreshing(false);
      }
    };

  const formatCurrency = (
    value
  ) =>
    new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }
    ).format(Number(value) || 0);

  const formatNumber = (
    value
  ) =>
    new Intl.NumberFormat(
      "en-US",
      {
        notation: "compact",
        maximumFractionDigits: 1,
      }
    ).format(Number(value) || 0);

  const budgetUsage = useMemo(() => {
    if (!data.budget) {
      return 0;
    }

    return Math.min(
      100,
      (data.predictedSpend /
        data.budget) *
        100
    );
  }, [
    data.predictedSpend,
    data.budget,
  ]);

  const spendChange = useMemo(() => {
    if (!data.currentSpend) {
      return 0;
    }

    return (
      ((data.predictedSpend -
        data.currentSpend) /
        data.currentSpend) *
      100
    );
  }, [
    data.currentSpend,
    data.predictedSpend,
  ]);

  const maxForecast =
    useMemo(() => {
      if (!data.forecast.length) {
        return 1;
      }

      return Math.max(
        ...data.forecast.map(
          (item) =>
            Number(
              item.predictedCost || 0
            )
        ),
        1
      );
    }, [data.forecast]);

  if (loading) {
    return (
      <section className="cost-prediction">
        <div className="cost-prediction__loading">
          Calculating cost prediction...
        </div>
      </section>
    );
  }

  return (
    <section className="cost-prediction">
      <header className="cost-prediction__header">
        <div>
          <span className="cost-prediction__eyebrow">
            AI FinOps
          </span>

          <h2>
            Cost Prediction
          </h2>

          <p>
            Forecast AI infrastructure
            spending and identify
            opportunities to optimize
            future costs.
          </p>
        </div>

        <div className="cost-prediction__actions">
          <select
            value={period}
            onChange={(event) =>
              setPeriod(
                event.target.value
              )
            }
            aria-label="Forecast period"
          >
            <option
              value={
                FORECAST_PERIODS.SEVEN_DAYS
              }
            >
              Next 7 Days
            </option>

            <option
              value={
                FORECAST_PERIODS.THIRTY_DAYS
              }
            >
              Next 30 Days
            </option>

            <option
              value={
                FORECAST_PERIODS.NINETY_DAYS
              }
            >
              Next 90 Days
            </option>

            <option
              value={
                FORECAST_PERIODS.ONE_YEAR
              }
            >
              Next Year
            </option>
          </select>

          <button
            type="button"
            onClick={
              refreshPrediction
            }
            disabled={refreshing}
          >
            {refreshing
              ? "Recalculating..."
              : "Recalculate"}
          </button>
        </div>
      </header>

      {error && (
        <div
          className="cost-prediction__error"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="cost-prediction__metrics">
        <article className="cost-prediction__metric">
          <span>
            Current Spend
          </span>

          <strong>
            {formatCurrency(
              data.currentSpend
            )}
          </strong>

          <small>
            Current period consumption
          </small>
        </article>

        <article className="cost-prediction__metric">
          <span>
            Predicted Spend
          </span>

          <strong>
            {formatCurrency(
              data.predictedSpend
            )}
          </strong>

          <small
            className={
              spendChange > 0
                ? "cost-prediction__negative"
                : "cost-prediction__positive"
            }
          >
            {spendChange >= 0
              ? "+"
              : ""}
            {spendChange.toFixed(1)}%
            projected change
          </small>
        </article>

        <article className="cost-prediction__metric">
          <span>
            Budget
          </span>

          <strong>
            {formatCurrency(
              data.budget
            )}
          </strong>

          <small>
            Allocated spending limit
          </small>
        </article>

        <article className="cost-prediction__metric">
          <span>
            Projected Savings
          </span>

          <strong>
            {formatCurrency(
              data.projectedSavings
            )}
          </strong>

          <small>
            Potential optimization savings
          </small>
        </article>

        <article className="cost-prediction__metric">
          <span>
            Prediction Confidence
          </span>

          <strong>
            {Number(
              data.confidence
            ).toFixed(1)}
            %
          </strong>

          <small>
            Model confidence score
          </small>
        </article>
      </div>

      <section className="cost-prediction__budget">
        <div className="cost-prediction__section-header">
          <div>
            <h3>
              Budget Forecast
            </h3>

            <p>
              Expected spending compared
              with your allocated budget.
            </p>
          </div>

          <span
            className={`cost-prediction__risk cost-prediction__risk--${data.riskLevel}`}
          >
            {data.riskLevel} risk
          </span>
        </div>

        <div className="cost-prediction__budget-progress">
          <div className="cost-prediction__budget-labels">
            <span>
              Predicted:{" "}
              <strong>
                {formatCurrency(
                  data.predictedSpend
                )}
              </strong>
            </span>

            <span>
              Budget:{" "}
              <strong>
                {formatCurrency(
                  data.budget
                )}
              </strong>
            </span>
          </div>

          <div className="cost-prediction__progress-track">
            <div
              className="cost-prediction__progress"
              style={{
                width: `${budgetUsage}%`,
              }}
            />
          </div>

          <small>
            {budgetUsage.toFixed(1)}%
            of projected budget
            utilization
          </small>
        </div>
      </section>

      <section className="cost-prediction__section">
        <div className="cost-prediction__section-header">
          <div>
            <h3>
              Cost Forecast
            </h3>

            <p>
              AI-generated spending
              forecast over the selected
              period.
            </p>
          </div>
        </div>

        {data.forecast.length ===
        0 ? (
          <div className="cost-prediction__empty">
            No forecast data available.
          </div>
        ) : (
          <div className="cost-prediction__forecast">
            {data.forecast.map(
              (item) => {
                const value =
                  Number(
                    item.predictedCost ||
                      0
                  );

                const height =
                  Math.max(
                    5,
                    (value /
                      maxForecast) *
                      100
                  );

                return (
                  <div
                    key={
                      item.date
                    }
                    className="cost-prediction__forecast-item"
                  >
                    <strong>
                      {formatCurrency(
                        value
                      )}
                    </strong>

                    <div className="cost-prediction__forecast-bar-container">
                      <div
                        className="cost-prediction__forecast-bar"
                        style={{
                          height: `${height}%`,
                        }}
                        title={formatCurrency(
                          value
                        )}
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

      <section className="cost-prediction__section">
        <div className="cost-prediction__section-header">
          <div>
            <h3>
              Model Cost Breakdown
            </h3>

            <p>
              Predicted cost distribution
              across AI models.
            </p>
          </div>
        </div>

        {data.models.length ===
        0 ? (
          <div className="cost-prediction__empty">
            No model cost data
            available.
          </div>
        ) : (
          <div className="cost-prediction__table-wrapper">
            <table className="cost-prediction__table">
              <thead>
                <tr>
                  <th>
                    Model
                  </th>

                  <th>
                    Current Cost
                  </th>

                  <th>
                    Predicted Cost
                  </th>

                  <th>
                    Requests
                  </th>

                  <th>
                    Cost Share
                  </th>

                  <th>
                    Trend
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
                        {formatCurrency(
                          model.currentCost
                        )}
                      </td>

                      <td>
                        {formatCurrency(
                          model.predictedCost
                        )}
                      </td>

                      <td>
                        {formatNumber(
                          model.requests
                        )}
                      </td>

                      <td>
                        {Number(
                          model.costShare ||
                            0
                        ).toFixed(1)}
                        %
                      </td>

                      <td>
                        <span
                          className={
                            Number(
                              model.changePercentage
                            ) > 0
                              ? "cost-prediction__negative"
                              : "cost-prediction__positive"
                          }
                        >
                          {Number(
                            model.changePercentage ||
                              0
                          ) >= 0
                            ? "+"
                            : ""}
                          {Number(
                            model.changePercentage ||
                              0
                          ).toFixed(1)}
                          %
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="cost-prediction__section">
        <div className="cost-prediction__section-header">
          <div>
            <h3>
              Optimization Recommendations
            </h3>

            <p>
              Recommended actions to
              control future AI costs.
            </p>
          </div>
        </div>

        {data.recommendations.length ===
        0 ? (
          <div className="cost-prediction__empty">
            No optimization
            recommendations available.
          </div>
        ) : (
          <div className="cost-prediction__recommendations">
            {data.recommendations.map(
              (recommendation) => (
                <article
                  key={
                    recommendation.id ||
                    recommendation.title
                  }
                  className="cost-prediction__recommendation"
                >
                  <div>
                    <span
                      className={`cost-prediction__recommendation-priority cost-prediction__recommendation-priority--${recommendation.priority || "medium"}`}
                    >
                      {recommendation.priority ||
                        "medium"}
                    </span>

                    <h4>
                      {
                        recommendation.title
                      }
                    </h4>

                    <p>
                      {
                        recommendation.description
                      }
                    </p>
                  </div>

                  <div className="cost-prediction__recommendation-saving">
                    <span>
                      Potential Savings
                    </span>

                    <strong>
                      {formatCurrency(
                        recommendation.estimatedSavings
                      )}
                    </strong>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>
    </section>
  );
};

export default CostPrediction;