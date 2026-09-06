"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../api/client";

/**
 * Enterprise Audit Logs
 *
 * Responsibilities:
 * - Centralized audit event monitoring
 * - Advanced search
 * - Action filtering
 * - Severity filtering
 * - Resource filtering
 * - User filtering
 * - Event details
 * - Pagination
 * - Export-ready architecture
 */

/* =========================================================
   Constants
========================================================= */

const SEVERITIES = [
  "all",
  "info",
  "warning",
  "critical",
];

const ACTIONS = [
  "all",
  "create",
  "update",
  "delete",
  "login",
  "logout",
  "access",
  "export",
  "revoke",
];

const PAGE_SIZE_OPTIONS = [
  25,
  50,
  100,
];

/* =========================================================
   Utilities
========================================================= */

const formatDateTime = (
  value
) => {
  if (!value) {
    return "Unknown";
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
    return "Invalid date";
  }
};

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

/* =========================================================
   Audit Event Details
========================================================= */

const AuditLogDetails = ({
  event,
  onClose,
}) => {
  if (!event) {
    return null;
  }

  return (
    <div className="audit-log-modal-backdrop">
      <aside className="audit-log-details-panel">
        <div className="audit-log-details-header">
          <div>
            <span>
              AUDIT EVENT
            </span>

            <h2>
              Event Details
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
          >
            ×
          </button>
        </div>

        <div className="audit-log-details-body">
          <div className="audit-log-detail">
            <span>
              Event ID
            </span>

            <code>
              {event.id ||
                "—"}
            </code>
          </div>

          <div className="audit-log-detail">
            <span>
              Action
            </span>

            <strong>
              {formatLabel(
                event.action
              )}
            </strong>
          </div>

          <div className="audit-log-detail">
            <span>
              User
            </span>

            <strong>
              {event.userName ||
                "System"}
            </strong>
          </div>

          <div className="audit-log-detail">
            <span>
              Email
            </span>

            <span>
              {event.userEmail ||
                "—"}
            </span>
          </div>

          <div className="audit-log-detail">
            <span>
              Resource
            </span>

            <strong>
              {event.resourceType ||
                "—"}
            </strong>
          </div>

          <div className="audit-log-detail">
            <span>
              Resource ID
            </span>

            <code>
              {event.resourceId ||
                "—"}
            </code>
          </div>

          <div className="audit-log-detail">
            <span>
              IP Address
            </span>

            <code>
              {event.ipAddress ||
                "—"}
            </code>
          </div>

          <div className="audit-log-detail">
            <span>
              Timestamp
            </span>

            <strong>
              {formatDateTime(
                event.createdAt
              )}
            </strong>
          </div>

          <div className="audit-log-json-section">
            <h3>
              Metadata
            </h3>

            <pre>
              {JSON.stringify(
                event.metadata ||
                  {},
                null,
                2
              )}
            </pre>
          </div>

          <div className="audit-log-json-section">
            <h3>
              Changes
            </h3>

            <pre>
              {JSON.stringify(
                event.changes ||
                  {},
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </aside>
    </div>
  );
};

/* =========================================================
   Audit Logs Component
========================================================= */

const AuditLogs = () => {
  const [
    logs,
    setLogs,
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
    selectedLog,
    setSelectedLog,
  ] = useState(null);

  /* =======================================================
     Filters
  ======================================================= */

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    severity,
    setSeverity,
  ] = useState("all");

  const [
    action,
    setAction,
  ] = useState("all");

  const [
    resource,
    setResource,
  ] = useState("all");

  const [
    user,
    setUser,
  ] = useState("");

  /* =======================================================
     Pagination
  ======================================================= */

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    pageSize,
    setPageSize,
  ] = useState(25);

  const [
    total,
    setTotal,
  ] = useState(0);

  /* =======================================================
     Load Logs
  ======================================================= */

  const loadLogs =
    useCallback(
      async () => {
        try {
          setLoading(true);

          setError("");

          const params = {
            page,

            pageSize,

            search:
              search || undefined,

            severity:
              severity !== "all"
                ? severity
                : undefined,

            action:
              action !== "all"
                ? action
                : undefined,

            resource:
              resource !== "all"
                ? resource
                : undefined,

            user:
              user || undefined,
          };

          const response =
            await api.get(
              "/audit-logs",
              {
                params,
              }
            );

          const responseData =
            response.data;

          const items =
            responseData?.data ||
            responseData?.logs ||
            responseData?.events ||
            [];

          setLogs(
            Array.isArray(items)
              ? items
              : []
          );

          setTotal(
            responseData?.total ||
              responseData?.pagination
                ?.total ||
              items.length
          );
        } catch (err) {
          console.error(
            "Failed to load audit logs:",
            err
          );

          setError(
            err?.message ||
              "Unable to load audit logs."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        page,
        pageSize,
        search,
        severity,
        action,
        resource,
        user,
      ]
    );

  /* =======================================================
     Initial / Filter Load
  ======================================================= */

  useEffect(() => {
    loadLogs();
  }, [
    loadLogs,
  ]);

  /* =======================================================
     Resource Options
  ======================================================= */

  const resourceOptions =
    useMemo(() => {
      const values =
        logs
          .map(
            (log) =>
              log.resourceType
          )
          .filter(Boolean);

      return [
        ...new Set(values),
      ];
    }, [logs]);

  /* =======================================================
     Statistics
  ======================================================= */

  const statistics =
    useMemo(() => {
      return {
        total,

        critical:
          logs.filter(
            (log) =>
              log.severity ===
              "critical"
          ).length,

        warnings:
          logs.filter(
            (log) =>
              log.severity ===
              "warning"
          ).length,

        security:
          logs.filter(
            (log) =>
              [
                "login",
                "logout",
                "revoke",
              ].includes(
                log.action
              )
          ).length,
      };
    }, [logs, total]);

  /* =======================================================
     Pagination
  ======================================================= */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        total / pageSize
      )
    );

  /* =======================================================
     Clear Filters
  ======================================================= */

  const clearFilters = () => {
    setSearch("");

    setSeverity(
      "all"
    );

    setAction(
      "all"
    );

    setResource(
      "all"
    );

    setUser("");

    setPage(1);
  };

  /* =======================================================
     Render
  ======================================================= */

  return (
    <section className="audit-logs-page">
      {/* Header */}

      <header className="audit-logs-header">
        <div>
          <span className="audit-logs-eyebrow">
            SECURITY & COMPLIANCE
          </span>

          <h1>
            Audit Logs
          </h1>

          <p>
            Track and investigate
            administrative activity
            across your organization.
          </p>
        </div>

        <button
          type="button"
          onClick={
            loadLogs
          }
          disabled={loading}
        >
          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </header>

      {/* Error */}

      {error && (
        <div
          className="audit-logs-error"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Statistics */}

      <div className="audit-logs-statistics">
        <div>
          <span>
            Total Events
          </span>

          <strong>
            {statistics.total.toLocaleString()}
          </strong>
        </div>

        <div>
          <span>
            Critical
          </span>

          <strong>
            {statistics.critical}
          </strong>
        </div>

        <div>
          <span>
            Warnings
          </span>

          <strong>
            {statistics.warnings}
          </strong>
        </div>

        <div>
          <span>
            Security Events
          </span>

          <strong>
            {statistics.security}
          </strong>
        </div>
      </div>

      {/* Filters */}

      <div className="audit-logs-filters">
        <input
          type="search"
          value={search}
          placeholder="Search audit logs..."
          onChange={(event) => {
            setSearch(
              event.target.value
            );

            setPage(1);
          }}
        />

        <input
          type="text"
          value={user}
          placeholder="Filter by user..."
          onChange={(event) => {
            setUser(
              event.target.value
            );

            setPage(1);
          }}
        />

        <select
          value={action}
          onChange={(event) => {
            setAction(
              event.target.value
            );

            setPage(1);
          }}
        >
          {ACTIONS.map(
            (item) => (
              <option
                key={item}
                value={item}
              >
                {item === "all"
                  ? "All Actions"
                  : formatLabel(
                      item
                    )}
              </option>
            )
          )}
        </select>

        <select
          value={severity}
          onChange={(event) => {
            setSeverity(
              event.target.value
            );

            setPage(1);
          }}
        >
          {SEVERITIES.map(
            (item) => (
              <option
                key={item}
                value={item}
              >
                {item === "all"
                  ? "All Severity"
                  : formatLabel(
                      item
                    )}
              </option>
            )
          )}
        </select>

        <select
          value={resource}
          onChange={(event) => {
            setResource(
              event.target.value
            );

            setPage(1);
          }}
        >
          <option value="all">
            All Resources
          </option>

          {resourceOptions.map(
            (item) => (
              <option
                key={item}
                value={item}
              >
                {formatLabel(
                  item
                )}
              </option>
            )
          )}
        </select>

        <button
          type="button"
          onClick={
            clearFilters
          }
        >
          Clear
        </button>
      </div>

      {/* Table */}

      <div className="audit-logs-table-container">
        <div className="audit-logs-table-header">
          <div>
            <h2>
              Event Activity
            </h2>

            <span>
              {total.toLocaleString()}{" "}
              events
            </span>
          </div>
        </div>

        {loading ? (
          <div className="audit-logs-loading">
            Loading audit logs...
          </div>
        ) : (
          <div className="audit-logs-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>
                    User
                  </th>

                  <th>
                    Action
                  </th>

                  <th>
                    Resource
                  </th>

                  <th>
                    Severity
                  </th>

                  <th>
                    IP Address
                  </th>

                  <th>
                    Timestamp
                  </th>

                  <th>
                    Details
                  </th>
                </tr>
              </thead>

              <tbody>
                {logs.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="7"
                    >
                      No audit logs
                      found.
                    </td>
                  </tr>
                ) : (
                  logs.map(
                    (log) => (
                      <tr
                        key={
                          log.id
                        }
                      >
                        <td>
                          <div className="audit-log-user">
                            <strong>
                              {log.userName ||
                                "System"}
                            </strong>

                            <span>
                              {log.userEmail ||
                                "System Process"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className="audit-log-action">
                            {formatLabel(
                              log.action
                            )}
                          </span>
                        </td>

                        <td>
                          <div className="audit-log-resource">
                            <strong>
                              {log.resourceType ||
                                "Unknown"}
                            </strong>

                            <span>
                              {log.resourceName ||
                                log.resourceId ||
                                "—"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`audit-log-severity audit-log-severity-${log.severity || "info"}`}
                          >
                            {formatLabel(
                              log.severity ||
                                "info"
                            )}
                          </span>
                        </td>

                        <td>
                          <code>
                            {log.ipAddress ||
                              "—"}
                          </code>
                        </td>

                        <td>
                          {formatDateTime(
                            log.createdAt
                          )}
                        </td>

                        <td>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedLog(
                                log
                              )
                            }
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}

        <footer className="audit-logs-pagination">
          <div>
            <label>
              Rows
            </label>

            <select
              value={
                pageSize
              }
              onChange={(
                event
              ) => {
                setPageSize(
                  Number(
                    event.target
                      .value
                  )
                );

                setPage(1);
              }}
            >
              {PAGE_SIZE_OPTIONS.map(
                (size) => (
                  <option
                    key={size}
                    value={size}
                  >
                    {size}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="audit-logs-pagination-controls">
            <button
              type="button"
              disabled={
                page <= 1
              }
              onClick={() =>
                setPage(
                  (current) =>
                    current - 1
                )
              }
            >
              Previous
            </button>

            <span>
              Page {page} of{" "}
              {totalPages}
            </span>

            <button
              type="button"
              disabled={
                page >=
                totalPages
              }
              onClick={() =>
                setPage(
                  (current) =>
                    current + 1
                )
              }
            >
              Next
            </button>
          </div>
        </footer>
      </div>

      {/* Details */}

      {selectedLog && (
        <AuditLogDetails
          event={
            selectedLog
          }
          onClose={() =>
            setSelectedLog(
              null
            )
          }
        />
      )}
    </section>
  );
};

export default AuditLogs;