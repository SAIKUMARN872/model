import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const ReasoningEngine = ({
  apiBaseUrl = "/api",
  workspaceId,
  organizationId,
}) => {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [selectedRun, setSelectedRun] =
    useState(null);

  const [config, setConfig] = useState({
    model: "default",
    reasoningMode: "balanced",
    temperature: 0.2,
    maxTokens: 4096,
  });

  const loadReasoningRuns = useCallback(
    async () => {
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
          `${apiBaseUrl}/reasoning/runs?${params.toString()}`,
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
            `Failed to load reasoning runs (${response.status}).`
          );
        }

        const data = await response.json();

        setRuns(
          Array.isArray(data.runs)
            ? data.runs
            : []
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load reasoning runs."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      apiBaseUrl,
      workspaceId,
      organizationId,
    ]
  );

  useEffect(() => {
    loadReasoningRuns();
  }, [loadReasoningRuns]);

  const executeReasoning = async (
    event
  ) => {
    event.preventDefault();

    if (!query.trim()) {
      setError(
        "Please enter a reasoning query."
      );
      return;
    }

    try {
      setRunning(true);
      setError(null);

      const response = await fetch(
        `${apiBaseUrl}/reasoning/execute`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            workspaceId,
            organizationId,
            query: query.trim(),
            config,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Reasoning execution failed (${response.status}).`
        );
      }

      const data = await response.json();

      if (data.run) {
        setRuns((current) => [
          data.run,
          ...current,
        ]);

        setSelectedRun(data.run);
      }

      setQuery("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to execute reasoning."
      );
    } finally {
      setRunning(false);
    }
  };

  const filteredRuns = useMemo(() => {
    const search = query
      .trim()
      .toLowerCase();

    if (!search) {
      return runs;
    }

    return runs.filter((run) =>
      [
        run.query,
        run.model,
        run.status,
        run.reasoningMode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [runs, query]);

  const metrics = useMemo(() => {
    const completed = runs.filter(
      (run) =>
        run.status === "completed"
    );

    const totalTokens = runs.reduce(
      (sum, run) =>
        sum +
        Number(run.totalTokens || 0),
      0
    );

    const totalCost = runs.reduce(
      (sum, run) =>
        sum + Number(run.cost || 0),
      0
    );

    const averageLatency =
      runs.length > 0
        ? runs.reduce(
            (sum, run) =>
              sum +
              Number(
                run.latency || 0
              ),
            0
          ) / runs.length
        : 0;

    const averageConfidence =
      completed.length > 0
        ? completed.reduce(
            (sum, run) =>
              sum +
              Number(
                run.confidence || 0
              ),
            0
          ) / completed.length
        : 0;

    return {
      totalRuns: runs.length,
      completedRuns: completed.length,
      totalTokens,
      totalCost,
      averageLatency,
      averageConfidence,
    };
  }, [runs]);

  const formatNumber = (value) =>
    new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(Number(value) || 0);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 4,
    }).format(Number(value) || 0);

  const formatDate = (value) => {
    if (!value) return "Unknown";

    return new Intl.DateTimeFormat(
      "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(new Date(value));
  };

  if (loading) {
    return (
      <section className="reasoning-engine">
        <div className="reasoning-engine__loading">
          Loading reasoning engine...
        </div>
      </section>
    );
  }

  return (
    <section className="reasoning-engine">
      <header className="reasoning-engine__header">
        <div>
          <span className="reasoning-engine__eyebrow">
            AI Intelligence
          </span>

          <h1>
            Reasoning Engine
          </h1>

          <p>
            Execute and monitor advanced
            AI reasoning workflows with
            enterprise-grade observability.
          </p>
        </div>

        <button
          type="button"
          onClick={loadReasoningRuns}
        >
          Refresh
        </button>
      </header>

      {error && (
        <div
          className="reasoning-engine__error"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="reasoning-engine__metrics">
        <article>
          <span>Total Runs</span>
          <strong>
            {metrics.totalRuns}
          </strong>
        </article>

        <article>
          <span>Completed</span>
          <strong>
            {metrics.completedRuns}
          </strong>
        </article>

        <article>
          <span>Total Tokens</span>
          <strong>
            {formatNumber(
              metrics.totalTokens
            )}
          </strong>
        </article>

        <article>
          <span>Total Cost</span>
          <strong>
            {formatCurrency(
              metrics.totalCost
            )}
          </strong>
        </article>

        <article>
          <span>Avg. Latency</span>
          <strong>
            {metrics.averageLatency.toFixed(
              0
            )}
            ms
          </strong>
        </article>

        <article>
          <span>Avg. Confidence</span>
          <strong>
            {(
              metrics.averageConfidence *
              100
            ).toFixed(1)}
            %
          </strong>
        </article>
      </div>

      <div className="reasoning-engine__workspace">
        <form
          className="reasoning-engine__form"
          onSubmit={executeReasoning}
        >
          <div className="reasoning-engine__form-header">
            <h2>
              New Reasoning Task
            </h2>

            <span>
              Enterprise AI Execution
            </span>
          </div>

          <label>
            Reasoning Query

            <textarea
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value
                )
              }
              placeholder="Describe the problem you want the reasoning engine to analyze..."
              rows={8}
              maxLength={20000}
            />
          </label>

          <div className="reasoning-engine__config">
            <label>
              Model

              <select
                value={config.model}
                onChange={(event) =>
                  setConfig(
                    (current) => ({
                      ...current,
                      model:
                        event.target.value,
                    })
                  )
                }
              >
                <option value="default">
                  Default
                </option>

                <option value="reasoning">
                  Reasoning Model
                </option>

                <option value="advanced">
                  Advanced Model
                </option>
              </select>
            </label>

            <label>
              Reasoning Mode

              <select
                value={
                  config.reasoningMode
                }
                onChange={(event) =>
                  setConfig(
                    (current) => ({
                      ...current,
                      reasoningMode:
                        event.target.value,
                    })
                  )
                }
              >
                <option value="fast">
                  Fast
                </option>

                <option value="balanced">
                  Balanced
                </option>

                <option value="deep">
                  Deep
                </option>
              </select>
            </label>

            <label>
              Temperature

              <input
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={
                  config.temperature
                }
                onChange={(event) =>
                  setConfig(
                    (current) => ({
                      ...current,
                      temperature:
                        Number(
                          event.target.value
                        ),
                    })
                  )
                }
              />
            </label>

            <label>
              Max Tokens

              <input
                type="number"
                min="256"
                max="128000"
                step="256"
                value={
                  config.maxTokens
                }
                onChange={(event) =>
                  setConfig(
                    (current) => ({
                      ...current,
                      maxTokens:
                        Number(
                          event.target.value
                        ),
                    })
                  )
                }
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={
              running ||
              !query.trim()
            }
          >
            {running
              ? "Reasoning..."
              : "Run Reasoning"}
          </button>
        </form>

        <div className="reasoning-engine__history">
          <div className="reasoning-engine__history-header">
            <h2>
              Reasoning History
            </h2>

            <input
              type="search"
              placeholder="Search runs..."
              onChange={(event) =>
                setQuery(
                  event.target.value
                )
              }
            />
          </div>

          {filteredRuns.length ===
          0 ? (
            <div className="reasoning-engine__empty">
              No reasoning runs found.
            </div>
          ) : (
            <div className="reasoning-engine__runs">
              {filteredRuns.map(
                (run) => (
                  <article
                    key={run.id}
                    className="reasoning-engine__run"
                  >
                    <div>
                      <span
                        className={`reasoning-engine__status reasoning-engine__status--${run.status || "unknown"}`}
                      >
                        {run.status ||
                          "unknown"}
                      </span>

                      <h3>
                        {run.title ||
                          run.query ||
                          "Untitled Reasoning Run"}
                      </h3>

                      <p>
                        {run.summary ||
                          "No summary available."}
                      </p>
                    </div>

                    <div className="reasoning-engine__run-meta">
                      <span>
                        Model:{" "}
                        {run.model ||
                          "Default"}
                      </span>

                      <span>
                        Tokens:{" "}
                        {formatNumber(
                          run.totalTokens
                        )}
                      </span>

                      <span>
                        Latency:{" "}
                        {Number(
                          run.latency || 0
                        ).toFixed(0)}
                        ms
                      </span>

                      <span>
                        {formatDate(
                          run.createdAt
                        )}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedRun(
                          run
                        )
                      }
                    >
                      View Reasoning
                    </button>
                  </article>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {selectedRun && (
        <div
          className="reasoning-engine__modal-backdrop"
          onClick={() =>
            setSelectedRun(null)
          }
        >
          <div
            className="reasoning-engine__modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <header>
              <div>
                <span>
                  Reasoning Run
                </span>

                <h2>
                  {selectedRun.title ||
                    "Reasoning Analysis"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedRun(null)
                }
              >
                ×
              </button>
            </header>

            <div className="reasoning-engine__modal-body">
              <div className="reasoning-engine__detail-grid">
                <div>
                  <span>Status</span>
                  <strong>
                    {selectedRun.status ||
                      "Unknown"}
                  </strong>
                </div>

                <div>
                  <span>Model</span>
                  <strong>
                    {selectedRun.model ||
                      "Default"}
                  </strong>
                </div>

                <div>
                  <span>Tokens</span>
                  <strong>
                    {formatNumber(
                      selectedRun.totalTokens
                    )}
                  </strong>
                </div>

                <div>
                  <span>Cost</span>
                  <strong>
                    {formatCurrency(
                      selectedRun.cost
                    )}
                  </strong>
                </div>

                <div>
                  <span>Latency</span>
                  <strong>
                    {Number(
                      selectedRun.latency ||
                        0
                    ).toFixed(0)}
                    ms
                  </strong>
                </div>

                <div>
                  <span>Confidence</span>
                  <strong>
                    {(
                      Number(
                        selectedRun.confidence ||
                          0
                      ) * 100
                    ).toFixed(1)}
                    %
                  </strong>
                </div>
              </div>

              <div>
                <h3>
                  Original Query
                </h3>

                <p>
                  {selectedRun.query ||
                    "No query available."}
                </p>
              </div>

              {selectedRun.summary && (
                <div>
                  <h3>
                    Summary
                  </h3>

                  <p>
                    {selectedRun.summary}
                  </p>
                </div>
              )}

              {selectedRun.steps?.length >
                0 && (
                <div>
                  <h3>
                    Reasoning Steps
                  </h3>

                  <ol>
                    {selectedRun.steps.map(
                      (step, index) => (
                        <li
                          key={
                            step.id ||
                            index
                          }
                        >
                          {typeof step ===
                          "string"
                            ? step
                            : step.description ||
                              step.content}
                        </li>
                      )
                    )}
                  </ol>
                </div>
              )}

              {selectedRun.answer && (
                <div>
                  <h3>
                    Final Answer
                  </h3>

                  <div>
                    {
                      selectedRun.answer
                    }
                  </div>
                </div>
              )}
            </div>

            <footer>
              <button
                type="button"
                onClick={() =>
                  setSelectedRun(null)
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

export default ReasoningEngine;