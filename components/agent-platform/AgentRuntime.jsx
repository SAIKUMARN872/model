import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

/* =========================================================
   Constants
========================================================= */

const AGENT_STATUS = Object.freeze({
  IDLE: "idle",
  STARTING: "starting",
  RUNNING: "running",
  PAUSED: "paused",
  STOPPING: "stopping",
  STOPPED: "stopped",
  ERROR: "error",
});

const RUNTIME_ACTIONS = Object.freeze({
  START: "start",
  STOP: "stop",
  PAUSE: "pause",
  RESUME: "resume",
  RESTART: "restart",
});

/* =========================================================
   Default Configuration
========================================================= */

const DEFAULT_CONFIG = {
  temperature: 0.7,
  maxTokens: 2048,
  timeout: 30000,
  streaming: true,
  retries: 3,
};

/* =========================================================
   Utility Functions
========================================================= */

const getStatusLabel = (status) => {
  const labels = {
    [AGENT_STATUS.IDLE]: "Idle",
    [AGENT_STATUS.STARTING]: "Starting",
    [AGENT_STATUS.RUNNING]: "Running",
    [AGENT_STATUS.PAUSED]: "Paused",
    [AGENT_STATUS.STOPPING]: "Stopping",
    [AGENT_STATUS.STOPPED]: "Stopped",
    [AGENT_STATUS.ERROR]: "Error",
  };

  return labels[status] || "Unknown";
};

const getStatusClass = (status) => {
  return `agent-runtime-status agent-runtime-status-${status}`;
};

const createRuntimeEvent = (
  type,
  message,
  metadata = {}
) => {
  return {
    id: `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`,
    type,
    message,
    timestamp: new Date().toISOString(),
    metadata,
  };
};

/* =========================================================
   Agent Runtime Component
========================================================= */

const AgentRuntime = ({
  agentId,
  agentName = "AI Agent",
  initialStatus = AGENT_STATUS.IDLE,
  initialConfig = {},
  apiClient,
  onStatusChange,
  onRuntimeError,
}) => {
  /* =======================================================
     State
  ======================================================= */

  const [
    status,
    setStatus,
  ] = useState(initialStatus);

  const [
    config,
    setConfig,
  ] = useState({
    ...DEFAULT_CONFIG,
    ...initialConfig,
  });

  const [
    events,
    setEvents,
  ] = useState([]);

  const [
    error,
    setError,
  ] = useState(null);

  const [
    metrics,
    setMetrics,
  ] = useState({
    requests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageLatency: 0,
    tokensUsed: 0,
  });

  const [
    loading,
    setLoading,
  ] = useState(false);

  /* =======================================================
     Add Runtime Event
  ======================================================= */

  const addEvent = useCallback(
    (
      type,
      message,
      metadata = {}
    ) => {
      const event =
        createRuntimeEvent(
          type,
          message,
          metadata
        );

      setEvents((current) => [
        event,
        ...current,
      ]);
    },
    []
  );

  /* =======================================================
     Update Status
  ======================================================= */

  const updateStatus = useCallback(
    (nextStatus) => {
      setStatus(nextStatus);

      onStatusChange?.(
        nextStatus
      );
    },
    [onStatusChange]
  );

  /* =======================================================
     Runtime API Request
  ======================================================= */

  const executeRuntimeAction =
    useCallback(
      async (action) => {
        if (!agentId) {
          setError(
            "Agent ID is required."
          );

          return;
        }

        setLoading(true);
        setError(null);

        try {
          const endpoint =
            `/agents/${agentId}/runtime/${action}`;

          let response;

          if (apiClient) {
            response =
              await apiClient.post(
                endpoint,
                {
                  config,
                }
              );
          } else {
            response =
              await fetch(
                `/api${endpoint}`,
                {
                  method:
                    "POST",

                  credentials:
                    "include",

                  headers: {
                    "Content-Type":
                      "application/json",

                    Accept:
                      "application/json",
                  },

                  body: JSON.stringify({
                    config,
                  }),
                }
              );
          }

          if (
            !response ||
            !response.ok
          ) {
            throw new Error(
              `Failed to ${action} agent runtime.`
            );
          }

          let data = {};

          if (
            typeof response.json ===
            "function"
          ) {
            data =
              await response.json();
          }

          const nextStatus =
            data.status ||
            (
              action ===
                RUNTIME_ACTIONS.START ||
              action ===
                RUNTIME_ACTIONS.RESUME ||
              action ===
                RUNTIME_ACTIONS.RESTART
            )
              ? AGENT_STATUS.RUNNING
              : action ===
                    RUNTIME_ACTIONS.PAUSE
                ? AGENT_STATUS.PAUSED
                : AGENT_STATUS.STOPPED;

          updateStatus(
            nextStatus
          );

          addEvent(
            "runtime_action",
            `Agent ${action} operation completed.`,
            {
              action,
              agentId,
              status:
                nextStatus,
            }
          );
        } catch (
          runtimeError
        ) {
          const message =
            runtimeError instanceof
            Error
              ? runtimeError.message
              : "Runtime operation failed.";

          setError(message);

          updateStatus(
            AGENT_STATUS.ERROR
          );

          addEvent(
            "runtime_error",
            message,
            {
              action,
              agentId,
            }
          );

          onRuntimeError?.(
            runtimeError
          );
        } finally {
          setLoading(false);
        }
      },
      [
        agentId,
        config,
        apiClient,
        addEvent,
        updateStatus,
        onRuntimeError,
      ]
    );

  /* =======================================================
     Runtime Controls
  ======================================================= */

  const handleStart = () =>
    executeRuntimeAction(
      RUNTIME_ACTIONS.START
    );

  const handleStop = () =>
    executeRuntimeAction(
      RUNTIME_ACTIONS.STOP
    );

  const handlePause = () =>
    executeRuntimeAction(
      RUNTIME_ACTIONS.PAUSE
    );

  const handleResume = () =>
    executeRuntimeAction(
      RUNTIME_ACTIONS.RESUME
    );

  const handleRestart = () =>
    executeRuntimeAction(
      RUNTIME_ACTIONS.RESTART
    );

  /* =======================================================
     Configuration
  ======================================================= */

  const updateConfig = (
    key,
    value
  ) => {
    setConfig((current) => ({
      ...current,
      [key]: value,
    }));
  };

  /* =======================================================
     Metrics
  ======================================================= */

  const metricsSummary =
    useMemo(() => {
      const successRate =
        metrics.requests > 0
          ? (
              (metrics.successfulRequests /
                metrics.requests) *
              100
            ).toFixed(1)
          : "0.0";

      return {
        ...metrics,
        successRate,
      };
    }, [metrics]);

  /* =======================================================
     Runtime Health
  ======================================================= */

  const runtimeHealth =
    useMemo(() => {
      if (
        status ===
        AGENT_STATUS.ERROR
      ) {
        return "critical";
      }

      if (
        status ===
          AGENT_STATUS.RUNNING &&
        Number(
          metricsSummary.successRate
        ) >= 95
      ) {
        return "healthy";
      }

      if (
        status ===
        AGENT_STATUS.RUNNING
      ) {
        return "degraded";
      }

      return "inactive";
    }, [
      status,
      metricsSummary.successRate,
    ]);

  /* =======================================================
     Runtime Polling
  ======================================================= */

  useEffect(() => {
    if (
      status !==
      AGENT_STATUS.RUNNING
    ) {
      return undefined;
    }

    const interval =
      setInterval(
        async () => {
          try {
            const response =
              await fetch(
                `/api/agents/${agentId}/runtime`,
                {
                  credentials:
                    "include",
                }
              );

            if (
              !response.ok
            ) {
              return;
            }

            const data =
              await response.json();

            if (
              data.status
            ) {
              updateStatus(
                data.status
              );
            }

            if (
              data.metrics
            ) {
              setMetrics(
                data.metrics
              );
            }
          } catch (
            pollingError
          ) {
            console.error(
              "Runtime polling failed:",
              pollingError
            );
          }
        },
        10000
      );

    return () =>
      clearInterval(
        interval
      );
  }, [
    agentId,
    status,
    updateStatus,
  ]);

  /* =======================================================
     Render
  ======================================================= */

  return (
    <section className="agent-runtime">
      {/* ===================================================
          Header
      =================================================== */}

      <header className="agent-runtime-header">
        <div>
          <span className="agent-runtime-eyebrow">
            Agent Runtime
          </span>

          <h2>
            {agentName}
          </h2>

          <p>
            Runtime ID:{" "}
            {agentId ||
              "Not available"}
          </p>
        </div>

        <div className="agent-runtime-status-container">
          <span
            className={getStatusClass(
              status
            )}
          >
            <span className="agent-runtime-status-dot" />

            {getStatusLabel(
              status
            )}
          </span>
        </div>
      </header>

      {/* ===================================================
          Error
      =================================================== */}

      {error && (
        <div className="agent-runtime-error">
          <strong>
            Runtime Error
          </strong>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              setError(null)
            }
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ===================================================
          Controls
      =================================================== */}

      <div className="agent-runtime-controls">
        <button
          type="button"
          disabled={
            loading ||
            status ===
              AGENT_STATUS.RUNNING
          }
          onClick={
            handleStart
          }
        >
          Start
        </button>

        <button
          type="button"
          disabled={
            loading ||
            status !==
              AGENT_STATUS.RUNNING
          }
          onClick={
            handlePause
          }
        >
          Pause
        </button>

        <button
          type="button"
          disabled={
            loading ||
            status !==
              AGENT_STATUS.PAUSED
          }
          onClick={
            handleResume
          }
        >
          Resume
        </button>

        <button
          type="button"
          disabled={
            loading ||
            status ===
              AGENT_STATUS.STOPPED
          }
          onClick={
            handleStop
          }
        >
          Stop
        </button>

        <button
          type="button"
          disabled={
            loading
          }
          onClick={
            handleRestart
          }
        >
          Restart
        </button>
      </div>

      {/* ===================================================
          Runtime Health
      =================================================== */}

      <div className="agent-runtime-health">
        <span>
          Runtime Health
        </span>

        <strong>
          {runtimeHealth}
        </strong>
      </div>

      {/* ===================================================
          Metrics
      =================================================== */}

      <div className="agent-runtime-metrics">
        <article>
          <span>
            Requests
          </span>

          <strong>
            {
              metricsSummary.requests
            }
          </strong>
        </article>

        <article>
          <span>
            Success Rate
          </span>

          <strong>
            {
              metricsSummary.successRate
            }
            %
          </strong>
        </article>

        <article>
          <span>
            Failed
          </span>

          <strong>
            {
              metricsSummary.failedRequests
            }
          </strong>
        </article>

        <article>
          <span>
            Avg. Latency
          </span>

          <strong>
            {
              metricsSummary.averageLatency
            }
            ms
          </strong>
        </article>

        <article>
          <span>
            Tokens Used
          </span>

          <strong>
            {
              metricsSummary.tokensUsed
            }
          </strong>
        </article>
      </div>

      {/* ===================================================
          Configuration
      =================================================== */}

      <div className="agent-runtime-config">
        <div className="agent-runtime-section-header">
          <h3>
            Runtime Configuration
          </h3>

          <span>
            Enterprise Controls
          </span>
        </div>

        <div className="agent-runtime-config-grid">
          <label>
            <span>
              Temperature
            </span>

            <input
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={
                config.temperature
              }
              onChange={(event) =>
                updateConfig(
                  "temperature",
                  Number(
                    event.target
                      .value
                  )
                )
              }
            />
          </label>

          <label>
            <span>
              Max Tokens
            </span>

            <input
              type="number"
              min="1"
              value={
                config.maxTokens
              }
              onChange={(event) =>
                updateConfig(
                  "maxTokens",
                  Number(
                    event.target
                      .value
                  )
                )
              }
            />
          </label>

          <label>
            <span>
              Timeout
            </span>

            <input
              type="number"
              min="1000"
              value={
                config.timeout
              }
              onChange={(event) =>
                updateConfig(
                  "timeout",
                  Number(
                    event.target
                      .value
                  )
                )
              }
            />
          </label>

          <label>
            <span>
              Retries
            </span>

            <input
              type="number"
              min="0"
              max="10"
              value={
                config.retries
              }
              onChange={(event) =>
                updateConfig(
                  "retries",
                  Number(
                    event.target
                      .value
                  )
                )
              }
            />
          </label>

          <label className="agent-runtime-checkbox">
            <input
              type="checkbox"
              checked={
                config.streaming
              }
              onChange={(event) =>
                updateConfig(
                  "streaming",
                  event.target
                    .checked
                )
              }
            />

            <span>
              Enable Streaming
            </span>
          </label>
        </div>
      </div>

      {/* ===================================================
          Runtime Events
      =================================================== */}

      <div className="agent-runtime-events">
        <div className="agent-runtime-section-header">
          <h3>
            Runtime Events
          </h3>

          <span>
            {events.length} events
          </span>
        </div>

        {events.length ===
        0 ? (
          <div className="agent-runtime-empty">
            No runtime events
            recorded yet.
          </div>
        ) : (
          <div className="agent-runtime-event-list">
            {events
              .slice(0, 10)
              .map(
                (event) => (
                  <div
                    key={
                      event.id
                    }
                    className="agent-runtime-event"
                  >
                    <div>
                      <strong>
                        {
                          event.message
                        }
                      </strong>

                      <span>
                        {
                          event.type
                        }
                      </span>
                    </div>

                    <time>
                      {new Date(
                        event.timestamp
                      ).toLocaleString()}
                    </time>
                  </div>
                )
              )}
          </div>
        )}
      </div>
    </section>
  );
};

export {
  AGENT_STATUS,
  RUNTIME_ACTIONS,
};

export default AgentRuntime;