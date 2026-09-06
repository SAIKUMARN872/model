import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

/* =========================================================
   Safety Constants
========================================================= */

export const SAFETY_STATUS = Object.freeze({
  SAFE: "safe",
  WARNING: "warning",
  BLOCKED: "blocked",
  REVIEW: "review",
  ERROR: "error",
});

export const SAFETY_ACTIONS = Object.freeze({
  ALLOW: "allow",
  WARN: "warn",
  BLOCK: "block",
  REVIEW: "review",
});

/* =========================================================
   Default Safety Policy
========================================================= */

const DEFAULT_POLICY = {
  enabled: true,

  blockUnsafeContent: true,

  requireHumanReview: true,

  detectPromptInjection: true,

  detectSensitiveData: true,

  detectToxicity: true,

  detectJailbreak: true,

  detectPii: true,

  logSafetyEvents: true,

  maxRiskScore: 0.7,
};

/* =========================================================
   Default Metrics
========================================================= */

const DEFAULT_METRICS = {
  totalScans: 0,

  safeRequests: 0,

  blockedRequests: 0,

  warningRequests: 0,

  reviewRequests: 0,

  promptInjectionAttempts: 0,

  piiDetections: 0,

  jailbreakAttempts: 0,

  averageRiskScore: 0,
};

/* =========================================================
   Utility Functions
========================================================= */

const getStatusLabel = (
  status
) => {
  const labels = {
    [SAFETY_STATUS.SAFE]:
      "Safe",

    [SAFETY_STATUS.WARNING]:
      "Warning",

    [SAFETY_STATUS.BLOCKED]:
      "Blocked",

    [SAFETY_STATUS.REVIEW]:
      "Human Review",

    [SAFETY_STATUS.ERROR]:
      "Error",
  };

  return (
    labels[status] ||
    "Unknown"
  );
};

const getRiskLevel = (
  score
) => {
  if (score >= 0.8) {
    return "critical";
  }

  if (score >= 0.6) {
    return "high";
  }

  if (score >= 0.3) {
    return "medium";
  }

  return "low";
};

const createSafetyEvent = (
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

    timestamp:
      new Date().toISOString(),

    metadata,
  };
};

/* =========================================================
   Safety Engine
========================================================= */

const SafetyEngine = ({
  apiBaseUrl = "/api",

  agentId,

  organizationId,

  workspaceId,

  initialPolicy = {},

  onDecision,

  onViolation,

  onError,
}) => {
  /* =======================================================
     State
  ======================================================= */

  const [
    policy,
    setPolicy,
  ] = useState({
    ...DEFAULT_POLICY,
    ...initialPolicy,
  });

  const [
    status,
    setStatus,
  ] = useState(
    SAFETY_STATUS.SAFE
  );

  const [
    riskScore,
    setRiskScore,
  ] = useState(0);

  const [
    lastDecision,
    setLastDecision,
  ] = useState(null);

  const [
    events,
    setEvents,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);

  const [
    metrics,
    setMetrics,
  ] = useState(
    DEFAULT_METRICS
  );

  /* =======================================================
     Add Safety Event
  ======================================================= */

  const addEvent = useCallback(
    (
      type,
      message,
      metadata = {}
    ) => {
      if (
        !policy.logSafetyEvents
      ) {
        return;
      }

      const event =
        createSafetyEvent(
          type,
          message,
          metadata
        );

      setEvents(
        (current) => [
          event,
          ...current,
        ]
      );
    },
    [
      policy.logSafetyEvents,
    ]
  );

  /* =======================================================
     Scan Content
  ======================================================= */

  const scanContent =
    useCallback(
      async ({
        input,
        output,
        context = {},
      }) => {
        if (
          !policy.enabled
        ) {
          return {
            status:
              SAFETY_STATUS.SAFE,

            action:
              SAFETY_ACTIONS.ALLOW,

            riskScore: 0,

            violations: [],
          };
        }

        if (
          !input &&
          !output
        ) {
          throw new Error(
            "Safety scan requires input or output content."
          );
        }

        setLoading(true);

        setError(null);

        try {
          const response =
            await fetch(
              `${apiBaseUrl}/safety/scan`,
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
                  input,

                  output,

                  context,

                  agentId,

                  organizationId,

                  workspaceId,

                  policy,
                }),
              }
            );

          if (
            !response.ok
          ) {
            throw new Error(
              `Safety scan failed (${response.status}).`
            );
          }

          const result =
            await response.json();

          const nextStatus =
            result.status ||
            SAFETY_STATUS.SAFE;

          const nextRiskScore =
            Number(
              result.riskScore ||
                0
            );

          const violations =
            Array.isArray(
              result.violations
            )
              ? result.violations
              : [];

          setStatus(
            nextStatus
          );

          setRiskScore(
            nextRiskScore
          );

          setLastDecision(
            result
          );

          /* ===============================================
             Update Metrics
          =============================================== */

          setMetrics(
            (current) => {
              const totalScans =
                current.totalScans +
                1;

              const safeRequests =
                current.safeRequests +
                (nextStatus ===
                SAFETY_STATUS.SAFE
                  ? 1
                  : 0);

              const blockedRequests =
                current.blockedRequests +
                (nextStatus ===
                SAFETY_STATUS.BLOCKED
                  ? 1
                  : 0);

              const warningRequests =
                current.warningRequests +
                (nextStatus ===
                SAFETY_STATUS.WARNING
                  ? 1
                  : 0);

              const reviewRequests =
                current.reviewRequests +
                (nextStatus ===
                SAFETY_STATUS.REVIEW
                  ? 1
                  : 0);

              return {
                ...current,

                totalScans,

                safeRequests,

                blockedRequests,

                warningRequests,

                reviewRequests,

                promptInjectionAttempts:
                  current.promptInjectionAttempts +
                  violations.filter(
                    (item) =>
                      item.type ===
                      "prompt_injection"
                  ).length,

                piiDetections:
                  current.piiDetections +
                  violations.filter(
                    (item) =>
                      item.type ===
                      "pii"
                  ).length,

                jailbreakAttempts:
                  current.jailbreakAttempts +
                  violations.filter(
                    (item) =>
                      item.type ===
                      "jailbreak"
                  ).length,

                averageRiskScore:
                  (
                    (current.averageRiskScore *
                      current.totalScans +
                      nextRiskScore) /
                    totalScans
                  ).toFixed(3),
              };
            }
          );

          /* ===============================================
             Event Logging
          =============================================== */

          addEvent(
            "safety_scan",

            `Safety scan completed with ${nextStatus} status.`,

            {
              riskScore:
                nextRiskScore,

              violationCount:
                violations.length,

              agentId,
            }
          );

          if (
            violations.length >
            0
          ) {
            addEvent(
              "safety_violation",

              `${violations.length} safety violation(s) detected.`,

              {
                violations,
              }
            );

            onViolation?.(
              violations
            );
          }

          onDecision?.(
            result
          );

          return result;
        } catch (
          scanError
        ) {
          const message =
            scanError instanceof
            Error
              ? scanError.message
              : "Safety engine failed.";

          setStatus(
            SAFETY_STATUS.ERROR
          );

          setError(
            message
          );

          addEvent(
            "safety_error",
            message
          );

          onError?.(
            scanError
          );

          throw scanError;
        } finally {
          setLoading(false);
        }
      },
      [
        apiBaseUrl,
        agentId,
        organizationId,
        workspaceId,
        policy,
        addEvent,
        onDecision,
        onViolation,
        onError,
      ]
    );

  /* =======================================================
     Update Policy
  ======================================================= */

  const updatePolicy = (
    key,
    value
  ) => {
    setPolicy(
      (current) => ({
        ...current,
        [key]: value,
      })
    );
  };

  /* =======================================================
     Safety Health
  ======================================================= */

  const safetyHealth =
    useMemo(() => {
      if (
        status ===
        SAFETY_STATUS.ERROR
      ) {
        return "critical";
      }

      if (
        status ===
        SAFETY_STATUS.BLOCKED
      ) {
        return "blocked";
      }

      if (
        status ===
        SAFETY_STATUS.REVIEW
      ) {
        return "review";
      }

      if (
        riskScore >= 0.6
      ) {
        return "high-risk";
      }

      if (
        riskScore >= 0.3
      ) {
        return "medium-risk";
      }

      return "healthy";
    }, [
      status,
      riskScore,
    ]);

  /* =======================================================
     Load Safety Metrics
  ======================================================= */

  const loadMetrics =
    useCallback(
      async () => {
        try {
          const response =
            await fetch(
              `${apiBaseUrl}/safety/metrics`,
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
            return;
          }

          const data =
            await response.json();

          if (
            data.metrics
          ) {
            setMetrics(
              data.metrics
            );
          }
        } catch (
          metricsError
        ) {
          console.error(
            "Failed to load safety metrics:",
            metricsError
          );
        }
      },
      [apiBaseUrl]
    );

  /* =======================================================
     Initial Metrics
  ======================================================= */

  useEffect(() => {
    loadMetrics();
  }, [
    loadMetrics,
  ]);

  /* =======================================================
     Render
  ======================================================= */

  return (
    <section className="safety-engine">

      {/* ===================================================
          Header
      =================================================== */}

      <header className="safety-engine-header">

        <div>
          <span className="safety-engine-eyebrow">
            AI Safety
          </span>

          <h2>
            Safety Engine
          </h2>

          <p>
            Real-time AI safety
            monitoring, policy
            enforcement, and risk
            detection.
          </p>
        </div>

        <div className="safety-engine-status">

          <span
            className={`safety-status safety-status-${status}`}
          >
            <span className="safety-status-dot" />

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
        <div className="safety-engine-error">

          <div>
            <strong>
              Safety Engine Error
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

        </div>
      )}

      {/* ===================================================
          Risk Overview
      =================================================== */}

      <div className="safety-risk-overview">

        <article>
          <span>
            Current Risk Score
          </span>

          <strong>
            {(
              riskScore *
              100
            ).toFixed(1)}
            %
          </strong>

          <small>
            {getRiskLevel(
              riskScore
            )}
          </small>
        </article>

        <article>
          <span>
            Total Scans
          </span>

          <strong>
            {
              metrics.totalScans
            }
          </strong>

          <small>
            Safety evaluations
          </small>
        </article>

        <article>
          <span>
            Blocked
          </span>

          <strong>
            {
              metrics.blockedRequests
            }
          </strong>

          <small>
            Unsafe requests
          </small>
        </article>

        <article>
          <span>
            PII Detections
          </span>

          <strong>
            {
              metrics.piiDetections
            }
          </strong>

          <small>
            Sensitive data
          </small>
        </article>

      </div>

      {/* ===================================================
          Safety Policy
      =================================================== */}

      <section className="safety-policy">

        <div className="safety-section-header">

          <div>
            <h3>
              Safety Policy
            </h3>

            <p>
              Configure enterprise
              safety controls.
            </p>
          </div>

          <label className="safety-toggle">

            <input
              type="checkbox"
              checked={
                policy.enabled
              }
              onChange={(
                event
              ) =>
                updatePolicy(
                  "enabled",
                  event.target
                    .checked
                )
              }
            />

            <span>
              Enable Safety Engine
            </span>

          </label>

        </div>

        <div className="safety-policy-grid">

          <label>
            <input
              type="checkbox"
              checked={
                policy.blockUnsafeContent
              }
              onChange={(
                event
              ) =>
                updatePolicy(
                  "blockUnsafeContent",
                  event.target
                    .checked
                )
              }
            />

            <span>
              Block Unsafe Content
            </span>
          </label>

          <label>
            <input
              type="checkbox"
              checked={
                policy.requireHumanReview
              }
              onChange={(
                event
              ) =>
                updatePolicy(
                  "requireHumanReview",
                  event.target
                    .checked
                )
              }
            />

            <span>
              Require Human Review
            </span>
          </label>

          <label>
            <input
              type="checkbox"
              checked={
                policy.detectPromptInjection
              }
              onChange={(
                event
              ) =>
                updatePolicy(
                  "detectPromptInjection",
                  event.target
                    .checked
                )
              }
            />

            <span>
              Detect Prompt Injection
            </span>
          </label>

          <label>
            <input
              type="checkbox"
              checked={
                policy.detectJailbreak
              }
              onChange={(
                event
              ) =>
                updatePolicy(
                  "detectJailbreak",
                  event.target
                    .checked
                )
              }
            />

            <span>
              Detect Jailbreak Attempts
            </span>
          </label>

          <label>
            <input
              type="checkbox"
              checked={
                policy.detectSensitiveData
              }
              onChange={(
                event
              ) =>
                updatePolicy(
                  "detectSensitiveData",
                  event.target
                    .checked
                )
              }
            />

            <span>
              Detect Sensitive Data
            </span>
          </label>

          <label>
            <input
              type="checkbox"
              checked={
                policy.detectToxicity
              }
              onChange={(
                event
              ) =>
                updatePolicy(
                  "detectToxicity",
                  event.target
                    .checked
                )
              }
            />

            <span>
              Detect Toxicity
            </span>
          </label>

          <label>
            <input
              type="checkbox"
              checked={
                policy.detectPii
              }
              onChange={(
                event
              ) =>
                updatePolicy(
                  "detectPii",
                  event.target
                    .checked
                )
              }
            />

            <span>
              Detect PII
            </span>
          </label>

          <label className="safety-risk-threshold">

            <span>
              Maximum Risk Score
            </span>

            <input
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={
                policy.maxRiskScore
              }
              onChange={(
                event
              ) =>
                updatePolicy(
                  "maxRiskScore",
                  Number(
                    event.target
                      .value
                  )
                )
              }
            />

          </label>

        </div>

      </section>

      {/* ===================================================
          Safety Metrics
      =================================================== */}

      <section className="safety-metrics">

        <div className="safety-section-header">

          <div>
            <h3>
              Safety Metrics
            </h3>

            <p>
              Real-time safety
              performance.
            </p>
          </div>

        </div>

        <div className="safety-metrics-grid">

          <article>
            <span>
              Safe Requests
            </span>

            <strong>
              {
                metrics.safeRequests
              }
            </strong>
          </article>

          <article>
            <span>
              Warnings
            </span>

            <strong>
              {
                metrics.warningRequests
              }
            </strong>
          </article>

          <article>
            <span>
              Human Reviews
            </span>

            <strong>
              {
                metrics.reviewRequests
              }
            </strong>
          </article>

          <article>
            <span>
              Prompt Injection
            </span>

            <strong>
              {
                metrics.promptInjectionAttempts
              }
            </strong>
          </article>

          <article>
            <span>
              Jailbreak Attempts
            </span>

            <strong>
              {
                metrics.jailbreakAttempts
              }
            </strong>
          </article>

          <article>
            <span>
              Average Risk
            </span>

            <strong>
              {(
                Number(
                  metrics.averageRiskScore
                ) *
                100
              ).toFixed(1)}
              %
            </strong>
          </article>

        </div>

      </section>

      {/* ===================================================
          Last Decision
      =================================================== */}

      {lastDecision && (
        <section className="safety-last-decision">

          <div className="safety-section-header">

            <div>
              <h3>
                Last Safety Decision
              </h3>

              <p>
                Most recent safety
                evaluation.
              </p>
            </div>

            <span
              className={`safety-status safety-status-${lastDecision.status}`}
            >
              {
                lastDecision.status
              }
            </span>

          </div>

          <div className="safety-decision-content">

            <div>
              <span>
                Risk Score
              </span>

              <strong>
                {(
                  Number(
                    lastDecision.riskScore ||
                      0
                  ) *
                  100
                ).toFixed(1)}
                %
              </strong>
            </div>

            <div>
              <span>
                Action
              </span>

              <strong>
                {
                  lastDecision.action ||
                  "allow"
                }
              </strong>
            </div>

            <div>
              <span>
                Violations
              </span>

              <strong>
                {Array.isArray(
                  lastDecision.violations
                )
                  ? lastDecision
                      .violations
                      .length
                  : 0}
              </strong>
            </div>

          </div>

        </section>
      )}

      {/* ===================================================
          Event Log
      =================================================== */}

      <section className="safety-events">

        <div className="safety-section-header">

          <div>
            <h3>
              Safety Event Log
            </h3>

            <p>
              Recent safety engine
              activity.
            </p>
          </div>

          <span>
            {events.length} events
          </span>

        </div>

        {events.length ===
        0 ? (
          <div className="safety-empty">
            No safety events
            recorded yet.
          </div>
        ) : (
          <div className="safety-event-list">

            {events
              .slice(0, 20)
              .map(
                (event) => (
                  <div
                    key={
                      event.id
                    }
                    className="safety-event"
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

      </section>

      {/* ===================================================
          Test Safety Scan
      =================================================== */}

      <button
        type="button"
        className="safety-test-button"
        disabled={
          loading
        }
        onClick={() =>
          scanContent({
            input:
              "Test safety evaluation",
          })
        }
      >
        {loading
          ? "Scanning..."
          : "Run Safety Test"}
      </button>

    </section>
  );
};

export default SafetyEngine;