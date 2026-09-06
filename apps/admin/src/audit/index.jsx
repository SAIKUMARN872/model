import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../api/client";
import API_ENDPOINTS from "../api/endpoints";

/**
 * Enterprise Audit Management
 *
 * Responsibilities:
 * - Display audit events
 * - Search audit logs
 * - Filter by action
 * - Filter by resource
 * - Filter by severity
 * - Filter by user
 * - Filter by date
 * - View event details
 * - Support pagination
 * - Support secure enterprise monitoring
 */

/* =========================================================
   Constants
========================================================= */

const AUDIT_SEVERITY = {
  INFO: "info",
  WARNING: "warning",
  CRITICAL: "critical",
};

const AUDIT_ACTIONS = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  LOGIN: "login",
  LOGOUT: "logout",
  ACCESS: "access",
  EXPORT: "export",
  REVOKE: "revoke",
};

/* =========================================================
   Utility Functions
========================================================= */

const formatDateTime = (
  value
) => {
  if (!value) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(
    new Date(value)
  );
};

const formatAction = (
  action
) => {
  if (!action) {
    return "Unknown";
  }

  return action
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

const getSeverity =
  (event) => {
    return (
      event.severity ||
      AUDIT_SEVERITY.INFO
    );
  };

const getSeverityClass =
  (severity) => {
    return `audit-severity-${severity}`;
  };

/* =========================================================
   Audit Event Row
========================================================= */

const AuditEventRow = ({
  event,
  onView,
}) => {
  const severity =
    getSeverity(event);

  return (
    <tr>
      <td>
        <div className="audit-event-user">
          <div className="audit-avatar">
            {(
              event.userName ||
              "S"
            )
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <strong>
              {event.userName ||
                "System"}
            </strong>

            <span>
              {event.userEmail ||
                "System Process"}
            </span>
          </div>
        </div>
      </td>

      <td>
        <span className="audit-action">
          {formatAction(
            event.action
          )}
        </span>
      </td>

      <td>
        <div className="audit-resource">
          <strong>
            {event.resourceType ||
              "Unknown"}
          </strong>

          <span>
            {event.resourceName ||
              event.resourceId ||
              "—"}
          </span>
        </div>
      </td>

      <td>
        <span
          className={`audit-severity ${getSeverityClass(
            severity
          )}`}
        >
          {severity}
        </span>
      </td>

      <td>
        <span className="audit-ip">
          {event.ipAddress ||
            "—"}
        </span>
      </td>

      <td>
        <span className="audit-timestamp">
          {formatDateTime(
            event.createdAt
          )}
        </span>
      </td>

      <td>
        <button
          type="button"
          className="audit-view-button"
          onClick={() =>
            onView(event)
          }
        >
          View
        </button>
      </td>
    </tr>
  );
};

/* =========================================================
   Audit Event Details
========================================================= */

const AuditEventDetails = ({
  event,
  onClose,
}) => {
  if (!event) {
    return null;
  }

  return (
    <div className="audit-details-overlay">
      <div className="audit-details-panel">
        <div className="audit-details-header">
          <div>
            <span className="audit-eyebrow">
              AUDIT EVENT
            </span>

            <h2>
              Event Details
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="audit-details-content">
          <div className="audit-detail-row">
            <span>
              Event ID
            </span>

            <code>
              {event.id ||
                "—"}
            </code>
          </div>

          <div className="audit-detail-row">
            <span>
              Action
            </span>

            <strong>
              {formatAction(
                event.action
              )}
            </strong>
          </div>

          <div className="audit-detail-row">
            <span>
              User
            </span>

            <strong>
              {event.userName ||
                "System"}
            </strong>
          </div>

          <div className="audit-detail-row">
            <span>
              Email
            </span>

            <strong>
              {event.userEmail ||
                "—"}
            </strong>
          </div>

          <div className="audit-detail-row">
            <span>
              Resource
            </span>

            <strong>
              {event.resourceType ||
                "—"}
            </strong>
          </div>

          <div className="audit-detail-row">
            <span>
              Resource ID
            </span>

            <code>
              {event.resourceId ||
                "—"}
            </code>
          </div>

          <div className="audit-detail-row">
            <span>
              IP Address
            </span>

            <code>
              {event.ipAddress ||
                "—"}
            </code>
          </div>

          <div className="audit-detail-row">
            <span>
              User Agent
            </span>

            <span>
              {event.userAgent ||
                "—"}
            </span>
          </div>

          <div className="audit-detail-row">
            <span>
              Timestamp
            </span>

            <strong>
              {formatDateTime(
                event.createdAt
              )}
            </strong>
          </div>

          <div className="audit-detail-section">
            <h3>
              Event Metadata
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

          <div className="audit-detail-section">
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
      </div>
    </div>
  );
};

/* =========================================================
   Main Audit Component
========================================================= */

const Audit = () => {
  const [
    events,
    setEvents,
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
    selectedEvent,
    setSelectedEvent,
  ] = useState(null);

  /* =======================================================
     Search
  ======================================================= */

  const [
    search,
    setSearch,
  ] = useState("");

  /* =======================================================
     Filters
  ======================================================= */

  const [
    actionFilter,
    setActionFilter,
  ] = useState("all");

  const [
    severityFilter,
    setSeverityFilter,
  ] = useState("all");

  const [
    resourceFilter,
    setResourceFilter,
  ] = useState("all");

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
     Load Audit Events
  ======================================================= */

  const loadAuditEvents =
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

            action:
              actionFilter !==
              "all"
                ? actionFilter
                : undefined,

            severity:
              severityFilter !==
              "all"
                ? severityFilter
                : undefined,

            resourceType:
              resourceFilter !==
              "all"
                ? resourceFilter
                : undefined,
          };

          const response =
            await api.get(
              API_ENDPOINTS.AUDIT
                .LIST,
              {
                params,
              }
            );

          const data =
            response.data;

          setEvents(
            data?.data ||
              data?.events ||
              data ||
              []
          );

          setTotal(
            data?.total ||
              data?.pagination
                ?.total ||
              0
          );
        } catch (err) {
          console.error(
            "Failed to load audit events:",
            err
          );

          setError(
            err.message ||
              "Unable to load audit events."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        page,
        pageSize,
        search,
        actionFilter,
        severityFilter,
        resourceFilter,
      ]
    );

  /* =======================================================
     Load Data
  ======================================================= */

  useEffect(() => {
    loadAuditEvents();
  }, [
    loadAuditEvents,
  ]);

  /* =======================================================
     Statistics
  ======================================================= */

  const statistics =
    useMemo(() => {
      return {
        total:
          events.length,

        critical:
          events.filter(
            (event) =>
              getSeverity(
                event
              ) ===
              AUDIT_SEVERITY.CRITICAL
          ).length,

        warnings:
          events.filter(
            (event) =>
              getSeverity(
                event
              ) ===
              AUDIT_SEVERITY.WARNING
          ).length,

        securityEvents:
          events.filter(
            (event) =>
              [
                AUDIT_ACTIONS.LOGIN,

                AUDIT_ACTIONS.LOGOUT,

                AUDIT_ACTIONS.REVOKE,
              ].includes(
                event.action
              )
          ).length,
      };
    }, [events]);

  /* =======================================================
     Resource Types
  ======================================================= */

  const resourceTypes =
    useMemo(() => {
      const types =
        events
          .map(
            (event) =>
              event.resourceType
          )
          .filter(Boolean);

      return [
        ...new Set(types),
      ];
    }, [events]);

  /* =======================================================
     Pagination
  ======================================================= */

  const totalPages =
    Math.ceil(
      total / pageSize
    );

  /* =======================================================
     Clear Filters
  ======================================================= */

  const clearFilters = () => {
    setSearch("");

    setActionFilter(
      "all"
    );

    setSeverityFilter(
      "all"
    );

    setResourceFilter(
      "all"
    );

    setPage(1);
  };

  /* =======================================================
     Loading
  ======================================================= */

  if (
    loading &&
    events.length === 0
  ) {
    return (
      <div className="audit-page">
        <div className="audit-loading">
          Loading audit events...
        </div>
      </div>
    );
  }

  /* =======================================================
     Render
  ======================================================= */

  return (
    <div className="audit-page">
      {/* Header */}

      <header className="audit-header">
        <div>
          <span className="audit-eyebrow">
            SECURITY & COMPLIANCE
          </span>

          <h1>
            Audit Logs
          </h1>

          <p>
            Monitor administrative
            activity and maintain a
            complete record of system
            events.
          </p>
        </div>

        <button
          type="button"
          className="audit-refresh-button"
          onClick={
            loadAuditEvents
          }
        >
          Refresh
        </button>
      </header>

      {/* Error */}

      {error && (
        <div className="audit-error">
          {error}
        </div>
      )}

      {/* Statistics */}

      <section className="audit-statistics">
        <div className="audit-stat-card">
          <span>
            Events Loaded
          </span>

          <strong>
            {statistics.total}
          </strong>
        </div>

        <div className="audit-stat-card">
          <span>
            Critical
          </span>

          <strong>
            {statistics.critical}
          </strong>
        </div>

        <div className="audit-stat-card">
          <span>
            Warnings
          </span>

          <strong>
            {statistics.warnings}
          </strong>
        </div>

        <div className="audit-stat-card">
          <span>
            Security Events
          </span>

          <strong>
            {
              statistics.securityEvents
            }
          </strong>
        </div>
      </section>

      {/* Filters */}

      <section className="audit-filters">
        <div className="audit-search">
          <input
            type="search"
            placeholder="Search users, resources, IDs..."
            value={search}
            onChange={(event) => {
              setSearch(
                event.target
                  .value
              );

              setPage(1);
            }}
          />
        </div>

        <select
          value={
            actionFilter
          }
          onChange={(event) => {
            setActionFilter(
              event.target.value
            );

            setPage(1);
          }}
        >
          <option value="all">
            All Actions
          </option>

          {Object.values(
            AUDIT_ACTIONS
          ).map(
            (action) => (
              <option
                key={action}
                value={action}
              >
                {formatAction(
                  action
                )}
              </option>
            )
          )}
        </select>

        <select
          value={
            severityFilter
          }
          onChange={(event) => {
            setSeverityFilter(
              event.target.value
            );

            setPage(1);
          }}
        >
          <option value="all">
            All Severity
          </option>

          {Object.values(
            AUDIT_SEVERITY
          ).map(
            (severity) => (
              <option
                key={severity}
                value={severity}
              >
                {formatAction(
                  severity
                )}
              </option>
            )
          )}
        </select>

        <select
          value={
            resourceFilter
          }
          onChange={(event) => {
            setResourceFilter(
              event.target.value
            );

            setPage(1);
          }}
        >
          <option value="all">
            All Resources
          </option>

          {resourceTypes.map(
            (resource) => (
              <option
                key={resource}
                value={resource}
              >
                {resource}
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
      </section>

      {/* Audit Table */}

      <section className="audit-table-container">
        <div className="audit-table-header">
          <div>
            <h2>
              Activity Log
            </h2>

            <span>
              {total.toLocaleString()}{" "}
              total events
            </span>
          </div>
        </div>

        <div className="audit-table-wrapper">
          <table className="audit-table">
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
              {events.length ===
              0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="audit-empty"
                  >
                    No audit events
                    found.
                  </td>
                </tr>
              ) : (
                events.map(
                  (event) => (
                    <AuditEventRow
                      key={
                        event.id
                      }
                      event={
                        event
                      }
                      onView={
                        setSelectedEvent
                      }
                    />
                  )
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}

        <div className="audit-pagination">
          <div>
            <span>
              Rows per page
            </span>

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
              <option value="10">
                10
              </option>

              <option value="25">
                25
              </option>

              <option value="50">
                50
              </option>

              <option value="100">
                100
              </option>
            </select>
          </div>

          <div className="audit-pagination-controls">
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
              {totalPages ||
                1}
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
        </div>
      </section>

      {/* Event Details */}

      {selectedEvent && (
        <AuditEventDetails
          event={
            selectedEvent
          }
          onClose={() =>
            setSelectedEvent(
              null
            )
          }
        />
      )}
    </div>
  );
};

export default Audit;