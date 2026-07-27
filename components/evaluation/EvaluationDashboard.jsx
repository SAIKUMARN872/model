import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const EVALUATION_STATUS = Object.freeze({
  PASSED: "passed",
  FAILED: "failed",
  REVIEW: "review",
  RUNNING: "running",
});

const EvaluationDashboard = ({
  apiBaseUrl = "/api",
  workspaceId,
  agentId,
  agentName = "AI Agent",
}) => {
  const [evaluations, setEvaluations] =
    useState([]);

  const [metrics, setMetrics] =
    useState({
      total: 0,
      passed: 0,
      failed: 0,
      review: 0,
      averageScore: 0,
      passRate: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [running, setRunning] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [filter, setFilter] =
    useState("all");

  const loadEvaluations =
    useCallback(async () => {
      if (!agentId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params =
          new URLSearchParams();

        params.set(
          "agentId",
          agentId
        );

        if (workspaceId) {
          params.set(
            "workspaceId",
            workspaceId
          );
        }

        const response =
          await fetch(
            `${apiBaseUrl}/evaluations?${params.toString()}`,
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
            `Unable to load evaluations (${response.status}).`
          );
        }

        const data =
          await response.json();

        const items =
          Array.isArray(
            data.evaluations
          )
            ? data.evaluations
            : [];

        setEvaluations(items);

        if (data.metrics) {
          setMetrics({
            total:
              data.metrics.total || 0,

            passed:
              data.metrics.passed || 0,

            failed:
              data.metrics.failed || 0,

            review:
              data.metrics.review || 0,

            averageScore:
              data.metrics.averageScore ||
              0,

            passRate:
              data.metrics.passRate ||
              0,
          });
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load evaluation data."
        );
      } finally {
        setLoading(false);
      }
    }, [
      apiBaseUrl,
      agentId,
      workspaceId,
    ]);

  useEffect(() => {
    loadEvaluations();
  }, [
    loadEvaluations,
  ]);

  const filteredEvaluations =
    useMemo(() => {
      if (filter === "all") {
        return evaluations;
      }

      return evaluations.filter(
        (evaluation) =>
          evaluation.status === filter
      );
    }, [
      evaluations,
      filter,
    ]);

  const runEvaluation =
    async () => {
      if (!agentId) {
        setError(
          "An agent ID is required."
        );

        return;
      }

      setRunning(true);
      setError(null);

      try {
        const response =
          await fetch(
            `${apiBaseUrl}/evaluations/run`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },
              body: JSON.stringify({
                agentId,
                workspaceId,
              }),
            }
          );

        if (!response.ok) {
          throw new Error(
            "Failed to start evaluation."
          );
        }

        await loadEvaluations();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to run evaluation."
        );
      } finally {
        setRunning(false);
      }
    };

  if (loading) {
    return (
      <section className="evaluation-dashboard">
        <div className="evaluation-dashboard__loading">
          Loading evaluation dashboard...
        </div>
      </section>
    );
  }

  return (
    <section className="evaluation-dashboard">
      <header className="evaluation-dashboard__header">
        <div>
          <span className="evaluation-dashboard__eyebrow">
            AI Evaluation
          </span>

          <h2>
            Evaluation Dashboard
          </h2>

          <p>
            Monitor quality, reliability,
            safety, and performance for{" "}
            <strong>
              {agentName}
            </strong>
            .
          </p>
        </div>

        <div className="evaluation-dashboard__actions">
          <button
            type="button"
            onClick={loadEvaluations}
            disabled={loading}
          >
            Refresh
          </button>

          <button
            type="button"
            onClick={runEvaluation}
            disabled={running}
          >
            {running
              ? "Running..."
              : "Run Evaluation"}
          </button>
        </div>
      </header>

      {error && (
        <div
          className="evaluation-dashboard__error"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="evaluation-dashboard__metrics">
        <article className="evaluation-metric-card">
          <span>
            Total Evaluations
          </span>

          <strong>
            {metrics.total}
          </strong>

          <small>
            All evaluation runs
          </small>
        </article>

        <article className="evaluation-metric-card">
          <span>
            Average Score
          </span>

          <strong>
            {Number(
              metrics.averageScore
            ).toFixed(1)}
            %
          </strong>

          <small>
            Overall quality score
          </small>
        </article>

        <article className="evaluation-metric-card">
          <span>
            Pass Rate
          </span>

          <strong>
            {Number(
              metrics.passRate
            ).toFixed(1)}
            %
          </strong>

          <small>
            Successful evaluations
          </small>
        </article>

        <article className="evaluation-metric-card">
          <span>
            Failed
          </span>

          <strong>
            {metrics.failed}
          </strong>

          <small>
            Requires attention
          </small>
        </article>
      </div>

      <section className="evaluation-dashboard__overview">
        <div className="evaluation-dashboard__section-header">
          <div>
            <h3>
              Evaluation Results
            </h3>

            <p>
              Review the latest agent
              evaluation results.
            </p>
          </div>

          <select
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              All Results
            </option>

            <option
              value={
                EVALUATION_STATUS.PASSED
              }
            >
              Passed
            </option>

            <option
              value={
                EVALUATION_STATUS.FAILED
              }
            >
              Failed
            </option>

            <option
              value={
                EVALUATION_STATUS.REVIEW
              }
            >
              Review
            </option>

            <option
              value={
                EVALUATION_STATUS.RUNNING
              }
            >
              Running
            </option>
          </select>
        </div>

        {filteredEvaluations.length ===
        0 ? (
          <div className="evaluation-dashboard__empty">
            <strong>
              No evaluations found
            </strong>

            <p>
              Run an evaluation to
              generate performance
              results.
            </p>
          </div>
        ) : (
          <div className="evaluation-dashboard__table-wrapper">
            <table className="evaluation-dashboard__table">
              <thead>
                <tr>
                  <th>
                    Evaluation
                  </th>

                  <th>
                    Dataset
                  </th>

                  <th>
                    Score
                  </th>

                  <th>
                    Accuracy
                  </th>

                  <th>
                    Safety
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredEvaluations.map(
                  (evaluation) => (
                    <tr
                      key={
                        evaluation.id
                      }
                    >
                      <td>
                        <strong>
                          {evaluation.name ||
                            evaluation.id}
                        </strong>
                      </td>

                      <td>
                        {evaluation.dataset ||
                          "Default"}
                      </td>

                      <td>
                        <strong>
                          {Number(
                            evaluation.score ||
                              0
                          ).toFixed(1)}
                          %
                        </strong>
                      </td>

                      <td>
                        {Number(
                          evaluation.accuracy ||
                            0
                        ).toFixed(1)}
                        %
                      </td>

                      <td>
                        {Number(
                          evaluation.safetyScore ||
                            0
                        ).toFixed(1)}
                        %
                      </td>

                      <td>
                        <span
                          className={`evaluation-status evaluation-status--${evaluation.status}`}
                        >
                          {evaluation.status}
                        </span>
                      </td>

                      <td>
                        {evaluation.createdAt
                          ? new Date(
                              evaluation.createdAt
                            ).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="evaluation-dashboard__quality">
        <div className="evaluation-dashboard__section-header">
          <div>
            <h3>
              Quality Breakdown
            </h3>

            <p>
              Key evaluation dimensions.
            </p>
          </div>
        </div>

        <div className="evaluation-dashboard__quality-grid">
          <QualityMetric
            label="Accuracy"
            value={
              metrics.averageScore
            }
          />

          <QualityMetric
            label="Reliability"
            value={
              metrics.passRate
            }
          />

          <QualityMetric
            label="Safety"
            value={
              evaluations.length
                ? evaluations.reduce(
                    (
                      total,
                      item
                    ) =>
                      total +
                      Number(
                        item.safetyScore ||
                          0
                      ),
                    0
                  ) /
                  evaluations.length
                : 0
            }
          />

          <QualityMetric
            label="Consistency"
            value={
              evaluations.length
                ? evaluations.reduce(
                    (
                      total,
                      item
                    ) =>
                      total +
                      Number(
                        item.consistencyScore ||
                          0
                      ),
                    0
                  ) /
                  evaluations.length
                : 0
            }
          />
        </div>
      </section>
    </section>
  );
};

const QualityMetric = ({
  label,
  value,
}) => {
  const normalizedValue =
    Math.min(
      100,
      Math.max(
        0,
        Number(value) || 0
      )
    );

  return (
    <article className="quality-metric">
      <div className="quality-metric__header">
        <span>
          {label}
        </span>

        <strong>
          {normalizedValue.toFixed(1)}
          %
        </strong>
      </div>

      <div className="quality-metric__bar">
        <div
          className="quality-metric__progress"
          style={{
            width: `${normalizedValue}%`,
          }}
        />
      </div>
    </article>
  );
};

export default EvaluationDashboard;