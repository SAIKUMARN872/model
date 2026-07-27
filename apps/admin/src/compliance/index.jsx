"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../api/client";

/**
 * Enterprise Compliance Management
 *
 * Features:
 * - Compliance framework overview
 * - Compliance score
 * - Control monitoring
 * - Policy status
 * - Compliance findings
 * - Risk tracking
 * - Audit readiness
 * - Remediation tracking
 */

/* =========================================================
   Constants
========================================================= */

const CONTROL_STATUS = [
  "all",
  "compliant",
  "non_compliant",
  "in_review",
  "not_applicable",
];

const RISK_LEVELS = [
  "all",
  "low",
  "medium",
  "high",
  "critical",
];

/* =========================================================
   Utilities
========================================================= */

const formatLabel = (
  value
) => {
  if (!value) {
    return "Unknown";
  }

  return value
    .replace(
      /[_-]/g,
      " "
    )
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
    );
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
      }
    ).format(
      new Date(value)
    );
  } catch {
    return "—";
  }
};

/* =========================================================
   Status Badge
========================================================= */

const StatusBadge = ({
  status,
}) => {
  return (
    <span
      className={`compliance-status compliance-status-${status}`}
    >
      {formatLabel(status)}
    </span>
  );
};

/* =========================================================
   Compliance Score
========================================================= */

const ComplianceScore = ({
  score,
}) => {
  const normalizedScore =
    Math.min(
      100,
      Math.max(
        0,
        Number(score || 0)
      )
    );

  return (
    <div className="compliance-score-card">
      <div className="compliance-card-header">
        <div>
          <span className="compliance-eyebrow">
            OVERALL POSTURE
          </span>

          <h2>
            Compliance Score
          </h2>
        </div>

        <strong>
          {normalizedScore}%
        </strong>
      </div>

      <div className="compliance-score-track">
        <div
          className="compliance-score-progress"
          style={{
            width: `${normalizedScore}%`,
          }}
        />
      </div>

      <p>
        Your organization's
        compliance posture is based
        on monitored controls,
        policies, and open findings.
      </p>
    </div>
  );
};

/* =========================================================
   Framework Card
========================================================= */

const FrameworkCard = ({
  framework,
}) => {
  const score = Math.min(
    100,
    Math.max(
      0,
      Number(
        framework.score || 0
      )
    )
  );

  return (
    <div className="compliance-framework-card">
      <div className="compliance-card-header">
        <div>
          <span className="compliance-eyebrow">
            FRAMEWORK
          </span>

          <h3>
            {framework.name ||
              "Compliance Framework"}
          </h3>
        </div>

        <strong>
          {score}%
        </strong>
      </div>

      <div className="compliance-score-track">
        <div
          className="compliance-score-progress"
          style={{
            width: `${score}%`,
          }}
        />
      </div>

      <div className="compliance-framework-details">
        <div>
          <span>
            Controls
          </span>

          <strong>
            {framework.totalControls ||
              0}
          </strong>
        </div>

        <div>
          <span>
            Compliant
          </span>

          <strong>
            {framework.compliantControls ||
              0}
          </strong>
        </div>

        <div>
          <span>
            Open Findings
          </span>

          <strong>
            {framework.openFindings ||
              0}
          </strong>
        </div>
      </div>

      <span className="compliance-framework-updated">
        Updated{" "}
        {formatDate(
          framework.updatedAt
        )}
      </span>
    </div>
  );
};

/* =========================================================
   Compliance Control Table
========================================================= */

const ControlTable = ({
  controls,
  onSelect,
}) => {
  return (
    <div className="compliance-table-card">
      <div className="compliance-card-header">
        <div>
          <span className="compliance-eyebrow">
            CONTROL MONITORING
          </span>

          <h2>
            Compliance Controls
          </h2>
        </div>
      </div>

      <div className="compliance-table-wrapper">
        <table className="compliance-table">
          <thead>
            <tr>
              <th>
                Control
              </th>

              <th>
                Framework
              </th>

              <th>
                Owner
              </th>

              <th>
                Status
              </th>

              <th>
                Risk
              </th>

              <th>
                Last Checked
              </th>

              <th>
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {controls.length ===
            0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="compliance-empty"
                >
                  No compliance
                  controls found.
                </td>
              </tr>
            ) : (
              controls.map(
                (control) => (
                  <tr
                    key={
                      control.id
                    }
                  >
                    <td>
                      <div className="compliance-control-name">
                        <strong>
                          {control.name ||
                            control.title}
                        </strong>

                        <span>
                          {control.description ||
                            "No description available"}
                        </span>
                      </div>
                    </td>

                    <td>
                      {control.framework ||
                        "—"}
                    </td>

                    <td>
                      {control.owner ||
                        "Unassigned"}
                    </td>

                    <td>
                      <StatusBadge
                        status={
                          control.status ||
                          "in_review"
                        }
                      />
                    </td>

                    <td>
                      <StatusBadge
                        status={
                          control.riskLevel ||
                          "low"
                        }
                      />
                    </td>

                    <td>
                      {formatDate(
                        control.lastCheckedAt
                      )}
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() =>
                          onSelect(
                            control
                          )
                        }
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* =========================================================
   Control Details
========================================================= */

const ControlDetails = ({
  control,
  onClose,
}) => {
  if (!control) {
    return null;
  }

  return (
    <div className="compliance-modal-overlay">
      <aside className="compliance-details-panel">
        <div className="compliance-modal-header">
          <div>
            <span className="compliance-eyebrow">
              CONTROL REVIEW
            </span>

            <h2>
              {control.name ||
                control.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="compliance-details-body">
          <div>
            <span>
              Status
            </span>

            <StatusBadge
              status={
                control.status ||
                "in_review"
              }
            />
          </div>

          <div>
            <span>
              Risk Level
            </span>

            <StatusBadge
              status={
                control.riskLevel ||
                "low"
              }
            />
          </div>

          <div>
            <span>
              Framework
            </span>

            <strong>
              {control.framework ||
                "—"}
            </strong>
          </div>

          <div>
            <span>
              Control Owner
            </span>

            <strong>
              {control.owner ||
                "Unassigned"}
            </strong>
          </div>

          <div>
            <span>
              Last Checked
            </span>

            <strong>
              {formatDate(
                control.lastCheckedAt
              )}
            </strong>
          </div>

          <div>
            <span>
              Next Review
            </span>

            <strong>
              {formatDate(
                control.nextReviewAt
              )}
            </strong>
          </div>

          <div className="compliance-detail-description">
            <span>
              Description
            </span>

            <p>
              {control.description ||
                "No description available."}
            </p>
          </div>

          <div className="compliance-detail-description">
            <span>
              Evidence
            </span>

            <p>
              {control.evidence ||
                "No evidence has been attached."}
            </p>
          </div>

          <div className="compliance-detail-description">
            <span>
              Remediation
            </span>

            <p>
              {control.remediation ||
                "No remediation plan available."}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
};

/* =========================================================
   Main Compliance Component
========================================================= */

const Compliance = () => {
  const [
    score,
    setScore,
  ] = useState(0);

  const [
    frameworks,
    setFrameworks,
  ] = useState([]);

  const [
    controls,
    setControls,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    selectedControl,
    setSelectedControl,
  ] = useState(null);

  /* =======================================================
     Filters
  ======================================================= */

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    riskFilter,
    setRiskFilter,
  ] = useState("all");

  const [
    search,
    setSearch,
  ] = useState("");

  /* =======================================================
     Load Compliance Data
  ======================================================= */

  const loadCompliance =
    useCallback(
      async () => {
        try {
          setLoading(true);

          setError("");

          const [
            overviewResponse,
            frameworksResponse,
            controlsResponse,
          ] =
            await Promise.all([
              api.get(
                "/compliance/overview"
              ),

              api.get(
                "/compliance/frameworks"
              ),

              api.get(
                "/compliance/controls"
              ),
            ]);

          const overview =
            overviewResponse
              .data;

          setScore(
            overview?.score ||
              overview?.complianceScore ||
              0
          );

          setFrameworks(
            frameworksResponse
              .data?.data ||
              frameworksResponse
                .data?.frameworks ||
              []
          );

          setControls(
            controlsResponse
              .data?.data ||
              controlsResponse
                .data?.controls ||
              []
          );
        } catch (err) {
          console.error(
            "Failed to load compliance data:",
            err
          );

          setError(
            err?.message ||
              "Unable to load compliance data."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    loadCompliance();
  }, [
    loadCompliance,
  ]);

  /* =======================================================
     Filter Controls
  ======================================================= */

  const filteredControls =
    useMemo(() => {
      return controls.filter(
        (control) => {
          const matchesStatus =
            statusFilter ===
              "all" ||
            control.status ===
              statusFilter;

          const matchesRisk =
            riskFilter ===
              "all" ||
            control.riskLevel ===
              riskFilter;

          const searchValue =
            search
              .toLowerCase()
              .trim();

          const matchesSearch =
            !searchValue ||
            [
              control.name,
              control.title,
              control.description,
              control.framework,
              control.owner,
            ]
              .filter(Boolean)
              .some(
                (value) =>
                  String(
                    value
                  )
                    .toLowerCase()
                    .includes(
                      searchValue
                    )
              );

          return (
            matchesStatus &&
            matchesRisk &&
            matchesSearch
          );
        }
      );
    }, [
      controls,
      statusFilter,
      riskFilter,
      search,
    ]);

  /* =======================================================
     Summary Statistics
  ======================================================= */

  const statistics =
    useMemo(() => {
      return {
        total:
          controls.length,

        compliant:
          controls.filter(
            (control) =>
              control.status ===
              "compliant"
          ).length,

        nonCompliant:
          controls.filter(
            (control) =>
              control.status ===
              "non_compliant"
          ).length,

        critical:
          controls.filter(
            (control) =>
              control.riskLevel ===
              "critical"
          ).length,
      };
    }, [
      controls,
    ]);

  /* =======================================================
     Loading State
  ======================================================= */

  if (loading) {
    return (
      <main className="compliance-page">
        <div className="compliance-loading">
          Loading compliance
          information...
        </div>
      </main>
    );
  }

  /* =======================================================
     Render
  ======================================================= */

  return (
    <main className="compliance-page">
      {/* Header */}

      <header className="compliance-header">
        <div>
          <span className="compliance-eyebrow">
            RISK & COMPLIANCE
          </span>

          <h1>
            Compliance
          </h1>

          <p>
            Monitor regulatory
            controls, compliance
            posture, and remediation
            activities.
          </p>
        </div>

        <button
          type="button"
          onClick={
            loadCompliance
          }
        >
          Refresh
        </button>
      </header>

      {/* Error */}

      {error && (
        <div
          className="compliance-error"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Score */}

      <section className="compliance-section">
        <ComplianceScore
          score={score}
        />
      </section>

      {/* Statistics */}

      <section className="compliance-statistics">
        <div>
          <span>
            Total Controls
          </span>

          <strong>
            {statistics.total}
          </strong>
        </div>

        <div>
          <span>
            Compliant
          </span>

          <strong>
            {statistics.compliant}
          </strong>
        </div>

        <div>
          <span>
            Non-Compliant
          </span>

          <strong>
            {statistics.nonCompliant}
          </strong>
        </div>

        <div>
          <span>
            Critical Risk
          </span>

          <strong>
            {statistics.critical}
          </strong>
        </div>
      </section>

      {/* Frameworks */}

      <section className="compliance-section">
        <div className="compliance-section-header">
          <div>
            <span className="compliance-eyebrow">
              FRAMEWORKS
            </span>

            <h2>
              Compliance Frameworks
            </h2>
          </div>
        </div>

        <div className="compliance-framework-grid">
          {frameworks.length ===
          0 ? (
            <div className="compliance-empty-card">
              No compliance
              frameworks configured.
            </div>
          ) : (
            frameworks.map(
              (framework) => (
                <FrameworkCard
                  key={
                    framework.id
                  }
                  framework={
                    framework
                  }
                />
              )
            )
          )}
        </div>
      </section>

      {/* Controls */}

      <section className="compliance-section">
        <div className="compliance-filters">
          <input
            type="search"
            placeholder="Search controls..."
            value={search}
            onChange={(
              event
            ) =>
              setSearch(
                event.target
                  .value
              )
            }
          />

          <select
            value={
              statusFilter
            }
            onChange={(
              event
            ) =>
              setStatusFilter(
                event.target
                  .value
              )
            }
          >
            {CONTROL_STATUS.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status ===
                  "all"
                    ? "All Statuses"
                    : formatLabel(
                        status
                      )}
                </option>
              )
            )}
          </select>

          <select
            value={
              riskFilter
            }
            onChange={(
              event
            ) =>
              setRiskFilter(
                event.target
                  .value
              )
            }
          >
            {RISK_LEVELS.map(
              (risk) => (
                <option
                  key={risk}
                  value={risk}
                >
                  {risk === "all"
                    ? "All Risk Levels"
                    : formatLabel(
                        risk
                      )}
                </option>
              )
            )}
          </select>
        </div>

        <ControlTable
          controls={
            filteredControls
          }
          onSelect={
            setSelectedControl
          }
        />
      </section>

      {/* Control Details */}

      {selectedControl && (
        <ControlDetails
          control={
            selectedControl
          }
          onClose={() =>
            setSelectedControl(
              null
            )
          }
        />
      )}
    </main>
  );
};

export default Compliance;