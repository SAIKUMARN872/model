"use client";

import React, { useEffect, useMemo, useState } from "react";

import useLogs from "../../hooks/useLogs";
import Spinner from "../../components/loading/Spinner";
import LogViewer from "../../components/log-viewer/LogViewer";

/**
 * Enterprise Logs Page
 *
 * Route:
 * /logs
 *
 * Responsibilities:
 * - View platform logs
 * - Search logs
 * - Filter by log level
 * - Filter by service
 * - Filter by date range
 * - Pagination
 * - Refresh logs
 * - View detailed log information
 */
export default function LogsPage() {
  const [search, setSearch] = useState("");

  const [level, setLevel] = useState("all");

  const [service, setService] = useState("all");

  const [dateRange, setDateRange] =
    useState("24h");

  const [page, setPage] = useState(1);

  const [pageSize] = useState(25);

  const [selectedLog, setSelectedLog] =
    useState(null);

  /**
   * Logs hook.
   */
  const {
    data,
    loading,
    error,
    refetch,
  } = useLogs({
    search,
    level:
      level === "all"
        ? undefined
        : level,
    service:
      service === "all"
        ? undefined
        : service,
    range: dateRange,
    page,
    pageSize,
  });

  /**
   * Normalize API response.
   */
  const logs = useMemo(() => {
    if (Array.isArray(data)) {
      return data;
    }

    return (
      data?.logs ||
      data?.items ||
      data?.results ||
      []
    );
  }, [data]);

  /**
   * Pagination metadata.
   */
  const pagination = useMemo(() => {
    return {
      currentPage:
        data?.page ??
        data?.pagination?.page ??
        page,

      totalPages:
        data?.totalPages ??
        data?.pagination?.totalPages ??
        1,

      total:
        data?.total ??
        data?.pagination?.total ??
        logs.length,
    };
  }, [
    data,
    page,
    logs.length,
  ]);

  /**
   * Extract available services.
   *
   * This is useful as a fallback when the
   * backend does not provide a dedicated
   * services endpoint.
   */
  const services = useMemo(() => {
    const uniqueServices =
      new Set();

    logs.forEach((log) => {
      if (log?.service) {
        uniqueServices.add(
          log.service
        );
      }
    });

    return Array.from(
      uniqueServices
    ).sort();
  }, [logs]);

  /**
   * Refresh logs.
   */
  const handleRefresh = async () => {
    await refetch?.();
  };

  /**
   * Change filter and reset pagination.
   */
  const handleFilterChange = (
    setter,
    value
  ) => {
    setter(value);
    setPage(1);
  };

  /**
   * Format timestamp.
   */
  const formatTimestamp = (
    timestamp
  ) => {
    if (!timestamp) {
      return "—";
    }

    const date = new Date(timestamp);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return new Intl.DateTimeFormat(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "medium",
      }
    ).format(date);
  };

  /**
   * Normalize log level.
   */
  const getLogLevel = (log) => {
    return String(
      log?.level ||
        log?.severity ||
        "info"
    ).toLowerCase();
  };

  /**
   * Get readable log message.
   */
  const getLogMessage = (log) => {
    return (
      log?.message ||
      log?.msg ||
      log?.error?.message ||
      "No message available"
    );
  };

  /**
   * Initial loading state.
   */
  if (
    loading &&
    logs.length === 0
  ) {
    return (
      <main
        className="console-logs"
        aria-label="System Logs"
      >
        <div className="logs-loading">
          <Spinner />

          <p>
            Loading system logs...
          </p>
        </div>
      </main>
    );
  }

  /**
   * Error state.
   */
  if (
    error &&
    logs.length === 0
  ) {
    return (
      <main
        className="console-logs"
        aria-label="System Logs"
      >
        <section className="logs-error">
          <h1>
            Unable to load logs
          </h1>

          <p>
            We couldn't retrieve system
            logs at this time.
          </p>

          <button
            type="button"
            onClick={handleRefresh}
            className="logs-primary-button"
          >
            Try Again
          </button>
        </section>
      </main>
    );
  }

  return (
    <main
      className="console-logs"
      aria-label="System Logs"
    >
      {/* ========================================
          Page Header
      ========================================= */}
      <header className="logs-header">
        <div>
          <h1>
            Logs
          </h1>

          <p>
            Monitor application events,
            system activity, errors, and
            operational events.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="logs-primary-button"
        >
          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </header>

      {/* ========================================
          Filters
      ========================================= */}
      <section
        className="logs-filters"
        aria-label="Log filters"
      >
        {/* Search */}
        <div className="logs-filter-field">
          <label
            htmlFor="log-search"
            className="sr-only"
          >
            Search logs
          </label>

          <input
            id="log-search"
            type="search"
            placeholder="Search log messages..."
            value={search}
            onChange={(event) =>
              handleFilterChange(
                setSearch,
                event.target.value
              )
            }
          />
        </div>

        {/* Level */}
        <div className="logs-filter-field">
          <label htmlFor="log-level">
            Level
          </label>

          <select
            id="log-level"
            value={level}
            onChange={(event) =>
              handleFilterChange(
                setLevel,
                event.target.value
              )
            }
          >
            <option value="all">
              All Levels
            </option>

            <option value="debug">
              Debug
            </option>

            <option value="info">
              Info
            </option>

            <option value="warn">
              Warning
            </option>

            <option value="error">
              Error
            </option>

            <option value="fatal">
              Fatal
            </option>
          </select>
        </div>

        {/* Service */}
        <div className="logs-filter-field">
          <label htmlFor="log-service">
            Service
          </label>

          <select
            id="log-service"
            value={service}
            onChange={(event) =>
              handleFilterChange(
                setService,
                event.target.value
              )
            }
          >
            <option value="all">
              All Services
            </option>

            {services.map(
              (serviceName) => (
                <option
                  key={serviceName}
                  value={serviceName}
                >
                  {serviceName}
                </option>
              )
            )}
          </select>
        </div>

        {/* Time Range */}
        <div className="logs-filter-field">
          <label htmlFor="log-range">
            Time Range
          </label>

          <select
            id="log-range"
            value={dateRange}
            onChange={(event) =>
              handleFilterChange(
                setDateRange,
                event.target.value
              )
            }
          >
            <option value="1h">
              Last Hour
            </option>

            <option value="24h">
              Last 24 Hours
            </option>

            <option value="7d">
              Last 7 Days
            </option>

            <option value="30d">
              Last 30 Days
            </option>

            <option value="90d">
              Last 90 Days
            </option>
          </select>
        </div>
      </section>

      {/* ========================================
          Summary
      ========================================= */}
      <section
        className="logs-summary"
        aria-label="Log summary"
      >
        <span>
          Showing{" "}
          {logs.length} of{" "}
          {pagination.total} logs
        </span>

        {loading && (
          <span>
            Updating...
          </span>
        )}
      </section>

      {/* ========================================
          Log Table
      ========================================= */}
      <section
        className="logs-table-section"
        aria-label="Log entries"
      >
        {logs.length === 0 ? (
          <div className="logs-empty">
            <h2>
              No logs found
            </h2>

            <p>
              No log entries match the
              current filters.
            </p>
          </div>
        ) : (
          <div className="logs-table-container">
            <table className="logs-table">
              <thead>
                <tr>
                  <th scope="col">
                    Timestamp
                  </th>

                  <th scope="col">
                    Level
                  </th>

                  <th scope="col">
                    Service
                  </th>

                  <th scope="col">
                    Message
                  </th>

                  <th scope="col">
                    Request ID
                  </th>

                  <th scope="col">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {logs.map(
                  (log, index) => {
                    const logLevel =
                      getLogLevel(
                        log
                      );

                    const logId =
                      log?.id ||
                      log?.logId ||
                      `${pagination.currentPage}-${index}`;

                    return (
                      <tr
                        key={logId}
                        className={`log-row log-row--${logLevel}`}
                      >
                        <td>
                          {formatTimestamp(
                            log?.timestamp ||
                              log?.createdAt ||
                              log?.time
                          )}
                        </td>

                        <td>
                          <span
                            className={`log-level log-level--${logLevel}`}
                          >
                            {logLevel.toUpperCase()}
                          </span>
                        </td>

                        <td>
                          {log?.service ||
                            log?.source ||
                            "—"}
                        </td>

                        <td className="log-message">
                          {getLogMessage(
                            log
                          )}
                        </td>

                        <td>
                          <code>
                            {log?.requestId ||
                              log?.correlationId ||
                              "—"}
                          </code>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="logs-view-button"
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
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ========================================
          Pagination
      ========================================= */}
      {pagination.totalPages >
        1 && (
        <nav
          className="logs-pagination"
          aria-label="Logs pagination"
        >
          <button
            type="button"
            disabled={
              page <= 1 ||
              loading
            }
            onClick={() =>
              setPage(
                (currentPage) =>
                  Math.max(
                    1,
                    currentPage - 1
                  )
              )
            }
          >
            Previous
          </button>

          <span>
            Page{" "}
            {pagination.currentPage}{" "}
            of{" "}
            {pagination.totalPages}
          </span>

          <button
            type="button"
            disabled={
              page >=
                pagination.totalPages ||
              loading
            }
            onClick={() =>
              setPage(
                (currentPage) =>
                  Math.min(
                    pagination.totalPages,
                    currentPage + 1
                  )
              )
            }
          >
            Next
          </button>
        </nav>
      )}

      {/* ========================================
          Log Detail Modal
      ========================================= */}
      {selectedLog && (
        <div
          className="log-viewer-overlay"
          role="presentation"
        >
          <div
            className="log-viewer-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="log-viewer-title"
          >
            <header className="log-viewer-modal__header">
              <div>
                <h2 id="log-viewer-title">
                  Log Details
                </h2>

                <p>
                  Detailed information
                  about this event.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close log details"
                onClick={() =>
                  setSelectedLog(
                    null
                  )
                }
              >
                ×
              </button>
            </header>

            <div className="log-viewer-modal__content">
              <LogViewer
                log={selectedLog}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}