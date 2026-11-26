
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Activity,
  AlertCircle,
  ArrowDownToLine,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  ExternalLink,
  FileClock,
  RefreshCw,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";

import { api } from "../../lib/api.js";
import { getResourceEndpoint } from "../../config/console.js";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type LogRow = Record<string, unknown>;

type SortOrder = "newest" | "oldest";

type LogLevel =
  | "debug"
  | "info"
  | "warn"
  | "warning"
  | "error"
  | "critical"
  | "fatal"
  | "success"
  | "unknown";

const PAGE_SIZE = 25;

const PREFERRED_COLUMNS = [
  "timestamp",
  "createdAt",
  "created_at",
  "time",
  "level",
  "severity",
  "message",
  "event",
  "status",
  "service",
  "source",
  "requestId",
  "request_id",
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function errorText(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load log records. Please try again.";
}

function isObject(value: unknown): value is LogRow {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function parseRows(value: unknown): LogRow[] | null {
  if (Array.isArray(value)) {
    return value.every(isObject) ? value : null;
  }

  if (!isObject(value)) {
    return null;
  }

  const possibleKeys = [
    "data",
    "items",
    "results",
    "logs",
    "records",
  ];

  for (const key of possibleKeys) {
    const nested = value[key];

    if (Array.isArray(nested)) {
      return parseRows(nested);
    }

    if (isObject(nested)) {
      const result = parseRows(nested);

      if (result !== null) {
        return result;
      }
    }
  }

  return null;
}

function textValue(value: unknown): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "[unavailable]";
  }
}

function humanize(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getLogLevel(row: LogRow): string {
  return String(
    row.level ??
      row.severity ??
      row.status ??
      "unknown"
  ).toLowerCase();
}

function getTimestamp(row: LogRow): unknown {
  return (
    row.timestamp ??
    row.createdAt ??
    row.created_at ??
    row.time ??
    row.date ??
    null
  );
}

function getTimestampNumber(row: LogRow): number {
  const value = getTimestamp(row);

  if (typeof value === "number") {
    return value < 1_000_000_000_000
      ? value * 1000
      : value;
  }

  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

function formatTimestamp(
  value: unknown,
  mounted: boolean
): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const raw = textValue(value);

  if (!mounted) {
    return raw;
  }

  let date: Date;

  if (typeof value === "number") {
    date = new Date(
      value < 1_000_000_000_000
        ? value * 1000
        : value
    );
  } else {
    date = new Date(String(value));
  }

  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  return date.toLocaleString();
}

function getMessage(row: LogRow): string {
  return textValue(
    row.message ??
      row.event ??
      row.description ??
      row.action ??
      "Log event"
  );
}

function getRequestId(row: LogRow): string {
  return textValue(
    row.requestId ??
      row.request_id ??
      row.correlationId ??
      row.correlation_id
  );
}

function getLevelClass(level: string): string {
  switch (level.toLowerCase()) {
    case "critical":
    case "fatal":
    case "error":
      return "log-level log-level--error";

    case "warn":
    case "warning":
      return "log-level log-level--warning";

    case "success":
      return "log-level log-level--success";

    case "debug":
      return "log-level log-level--debug";

    case "info":
      return "log-level log-level--info";

    default:
      return "log-level";
  }
}

function csvEscape(value: unknown): string {
  const text = textValue(value);

  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCsv(
  records: LogRow[],
  columns: string[]
): void {
  const header = columns.map(csvEscape).join(",");

  const rows = records.map((record) =>
    columns
      .map((column) => csvEscape(record[column]))
      .join(",")
  );

  const csv = [header, ...rows].join("\r\n");

  const blob = new Blob(
    ["\uFEFF" + csv],
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `modelnow-logs-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function LogsPage() {
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [configError, setConfigError] = useState("");

  const [records, setRecords] = useState<LogRow[] | null>(null);

  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedLog, setSelectedLog] = useState<LogRow | null>(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  const requestSequence = useRef(0);

  /* ------------------------------------------------------------------------ */
  /* Initial setup                                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    setMounted(true);

    try {
      const configuredEndpoint = getResourceEndpoint("logs");

      if (
        typeof configuredEndpoint !== "string" ||
        !configuredEndpoint.trim()
      ) {
        throw new Error("The logs endpoint is empty.");
      }

      setEndpoint(configuredEndpoint);
    } catch (error) {
      setConfigError(errorText(error));
    }

    return () => {
      requestSequence.current += 1;
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Load logs                                                                */
  /* ------------------------------------------------------------------------ */

  const load = useCallback(async () => {
    if (!endpoint) return;

    const requestId = ++requestSequence.current;

    setLoading(true);
    setError("");

    try {
      const response = await api.get(endpoint);
      const result = parseRows(response);

      if (result === null) {
        throw new Error(
          "The logs API returned an unsupported response format."
        );
      }

      if (requestId !== requestSequence.current) return;

      setRecords(result);
      setLoaded(true);
      setCurrentPage(1);
    } catch (error) {
      if (requestId !== requestSequence.current) return;

      setError(errorText(error));
      setRecords(null);
      setLoaded(false);
    } finally {
      if (requestId === requestSequence.current) {
        setLoading(false);
      }
    }
  }, [endpoint]);

  useEffect(() => {
    if (endpoint) {
      void load();
    }
  }, [endpoint, load]);

  /* ------------------------------------------------------------------------ */
  /* Filter options                                                           */
  /* ------------------------------------------------------------------------ */

  const severities = useMemo(() => {
    return [
      ...new Set(
        (records ?? [])
          .map(getLogLevel)
          .filter((level) => level !== "unknown")
      ),
    ].sort();
  }, [records]);

  /* ------------------------------------------------------------------------ */
  /* Dynamic columns                                                          */
  /* ------------------------------------------------------------------------ */

  const columns = useMemo(() => {
    const keys = [
      ...new Set(
        (records ?? []).flatMap((record) =>
          Object.keys(record)
        )
      ),
    ];

    const preferred = PREFERRED_COLUMNS.filter((key) =>
      keys.includes(key)
    );

    const remaining = keys.filter(
      (key) => !PREFERRED_COLUMNS.includes(key)
    );

    return [...preferred, ...remaining].slice(0, 8);
  }, [records]);

  /* ------------------------------------------------------------------------ */
  /* Search, filter and sorting                                               */
  /* ------------------------------------------------------------------------ */

  const filteredRecords = useMemo(() => {
    const search = query.trim().toLowerCase();

    const result = (records ?? []).filter((row) => {
      const matchesSearch =
        !search ||
        Object.entries(row).some(([key, value]) =>
          `${key} ${textValue(value)}`
            .toLowerCase()
            .includes(search)
        );

      const matchesSeverity =
        severity === "all" ||
        getLogLevel(row) === severity;

      return matchesSearch && matchesSeverity;
    });

    return result.sort((a, b) => {
      const difference =
        getTimestampNumber(a) -
        getTimestampNumber(b);

      return sortOrder === "newest"
        ? -difference
        : difference;
    });
  }, [records, query, severity, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, severity, sortOrder]);

  /* ------------------------------------------------------------------------ */
  /* Pagination                                                               */
  /* ------------------------------------------------------------------------ */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecords.length / PAGE_SIZE)
  );

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return filteredRecords.slice(
      start,
      start + PAGE_SIZE
    );
  }, [filteredRecords, currentPage]);

  const startRecord =
    filteredRecords.length === 0
      ? 0
      : (currentPage - 1) * PAGE_SIZE + 1;

  const endRecord = Math.min(
    currentPage * PAGE_SIZE,
    filteredRecords.length
  );

  /* ------------------------------------------------------------------------ */
  /* Actions                                                                  */
  /* ------------------------------------------------------------------------ */

  const clearFilters = () => {
    setQuery("");
    setSeverity("all");
    setSortOrder("newest");
    setCurrentPage(1);
  };

  const handleExport = () => {
    if (!filteredRecords.length) return;

    const exportColumns =
      columns.length > 0
        ? columns
        : [
            ...new Set(
              filteredRecords.flatMap((record) =>
                Object.keys(record)
              )
            ),
          ];

    downloadCsv(filteredRecords, exportColumns);
  };

  const handleCopy = async () => {
    if (!selectedLog) return;

    try {
      await navigator.clipboard.writeText(
        JSON.stringify(selectedLog, null, 2)
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="page-stack">
      {/* Header */}

      <header className="page-heading">
        <div>
          <div className="page-eyebrow">
            OBSERVABILITY / MONITORING
          </div>

          <h1>Logs</h1>

          <p>
            Monitor application events, investigate errors,
            and inspect system activity.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            className="button button--secondary"
            onClick={handleExport}
            disabled={
              loading || filteredRecords.length === 0
            }
          >
            <ArrowDownToLine size={15} />
            Export CSV
          </button>

          <button
            type="button"
            className="button button--secondary"
            onClick={() => void load()}
            disabled={!endpoint || loading}
          >
            <RefreshCw
              size={15}
              className={loading ? "spin" : ""}
            />
            Refresh
          </button>
        </div>
      </header>

      {/* Overview */}

      <section className="resource-summary">
        <div className="resource-summary__icon">
          <FileClock size={22} />
        </div>

        <div>
          <strong>Application event logs</strong>
          <p>
            Records are retrieved from your configured logs API.
          </p>
        </div>

        <div className="resource-summary__right">
          {loading
            ? "Refreshing..."
            : error || configError
              ? "Unavailable"
              : loaded
                ? `${records?.length ?? 0} records`
                : "Not configured"}
        </div>
      </section>

      {/* Error state */}

      {(configError || error) && (
        <div
          className="notice notice--error"
          role="alert"
        >
          <AlertCircle size={18} />

          <div style={{ flex: 1 }}>
            <strong>Unable to load logs</strong>
            <p>{configError || error}</p>
          </div>

          {endpoint && (
            <button
              type="button"
              className="button button--secondary"
              onClick={() => void load()}
              disabled={loading}
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Missing endpoint */}

      {!endpoint && !configError && (
        <div className="notice">
          <AlertCircle size={18} />

          <div>
            <strong>Logs endpoint not configured</strong>
            <p>
              Configure{" "}
     <code>NEXT_PUBLIC_CONSOLE_ENDPOINT_LOGS</code>
              with a verified API path.
            </p>
          </div>
        </div>
      )}

      {/* Loading */}

      {loading && !loaded && (
        <div className="table-empty" role="status">
          <RefreshCw
            size={18}
            className="spin"
            style={{ marginRight: 8 }}
          />
          Loading log records...
        </div>
      )}

      {/* Empty API response */}

      {loaded && records?.length === 0 && (
        <div className="table-empty">
          <FileClock
            size={28}
            style={{ marginBottom: 10, opacity: 0.6 }}
          />

          <strong>No log records found</strong>

          <p>
            The API returned an empty log collection.
            New records will appear here when available.
          </p>
        </div>
      )}

      {/* Log table */}

      {loaded && records && records.length > 0 && (
        <section
          className="data-card"
          aria-label="Application log records"
        >
          {/* Toolbar */}

          <div className="data-card__toolbar">
            <div className="data-card__count">
              <Activity
                size={15}
                style={{ marginRight: 6 }}
              />

              {filteredRecords.length} of {records.length} records
            </div>

            <label className="table-search">
              <Search size={15} />

              <input
                type="search"
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Search messages, IDs, services..."
                aria-label="Search log records"
              />
            </label>

            <select
              value={severity}
              onChange={(event) =>
                setSeverity(event.target.value)
              }
              aria-label="Filter by log severity"
            >
              <option value="all">All levels</option>

              {severities.map((level) => (
                <option key={level} value={level}>
                  {humanize(level)}
                </option>
              ))}
            </select>

            <select
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(
                  event.target.value as SortOrder
                )
              }
              aria-label="Sort log records"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>

            {(query || severity !== "all") && (
              <button
                type="button"
                className="button button--secondary"
                onClick={clearFilters}
              >
                <X size={14} />
                Clear
              </button>
            )}
          </div>

          {/* Results */}

          {filteredRecords.length > 0 ? (
            <>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Severity</th>
                      <th>Message</th>
                      <th>Timestamp</th>
                      <th>Request ID</th>

                      {columns
                        .filter(
                          (column) =>
                            ![
                              "level",
                              "severity",
                              "message",
                              "event",
                              "timestamp",
                              "createdAt",
                              "created_at",
                              "time",
                              "requestId",
                              "request_id",
                            ].includes(column)
                        )
                        .slice(0, 3)
                        .map((column) => (
                          <th key={column}>
                            {humanize(column)}
                          </th>
                        ))}

                      <th>Details</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedRecords.map((row, index) => {
                      const level = getLogLevel(row);

                      const extraColumns = columns
                        .filter(
                          (column) =>
                            ![
                              "level",
                              "severity",
                              "message",
                              "event",
                              "timestamp",
                              "createdAt",
                              "created_at",
                              "time",
                              "requestId",
                              "request_id",
                            ].includes(column)
                        )
                        .slice(0, 3);

                      const uniqueKey = textValue(
                        row.id ??
                          row._id ??
                          row.requestId ??
                          row.request_id ??
                          `${currentPage}-${index}`
                      );

                      return (
                        <tr key={uniqueKey}>
                          <td>
                            <span className={getLevelClass(level)}>
                              {humanize(level)}
                            </span>
                          </td>

                          <td
                            style={{
                              maxWidth: 360,
                              minWidth: 200,
                            }}
                          >
                            <span
                              title={getMessage(row)}
                              style={{
                                display: "block",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {getMessage(row)}
                            </span>
                          </td>

                          <td style={{ whiteSpace: "nowrap" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <Clock3
                                size={13}
                                style={{ opacity: 0.6 }}
                              />

                              {formatTimestamp(
                                getTimestamp(row),
                                mounted
                              )}
                            </span>
                          </td>

                          <td>
                            <span
                              title={getRequestId(row)}
                              style={{
                                fontFamily: "monospace",
                                fontSize: 12,
                              }}
                            >
                              {getRequestId(row)}
                            </span>
                          </td>

                          {extraColumns.map((column) => (
                            <td key={column}>
                              <span title={textValue(row[column])}>
                                {textValue(row[column])}
                              </span>
                            </td>
                          ))}

                          <td>
                            <button
                              type="button"
                              className="button button--secondary"
                              style={{
                                padding: "6px 9px",
                                minWidth: "auto",
                              }}
                              onClick={() =>
                                setSelectedLog(row)
                              }
                              aria-label="View log details"
                            >
                              <ExternalLink size={14} />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 18px",
                  borderTop: "1px solid var(--border-color, #e5e7eb)",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    opacity: 0.7,
                  }}
                >
                  Showing {startRecord}–{endRecord} of{" "}
                  {filteredRecords.length} records
                </span>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <button
                    type="button"
                    className="button button--secondary"
                    disabled={currentPage <= 1}
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.max(1, page - 1)
                      )
                    }
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={15} />
                    Previous
                  </button>

                  <span
                    style={{
                      fontSize: 13,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    className="button button--secondary"
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(totalPages, page + 1)
                      )
                    }
                    aria-label="Next page"
                  >
                    Next
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="table-empty">
              <Search
                size={25}
                style={{ marginBottom: 10, opacity: 0.6 }}
              />

              <strong>No matching log records</strong>

              <p>
                Try changing your search or severity filters.
              </p>

              <button
                type="button"
                className="button button--secondary"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      )}

      {/* Log details modal */}

      {selectedLog && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedLog(null);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0, 0, 0, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="log-details-title"
            onMouseDown={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 760,
              maxHeight: "85vh",
              overflow: "auto",
              background: "var(--card, #fff)",
              color: "var(--foreground, #111827)",
              border: "1px solid var(--border-color, #e5e7eb)",
              borderRadius: 12,
              padding: 22,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <div>
                <div className="page-eyebrow">
                  LOG INSPECTOR
                </div>

                <h2
                  id="log-details-title"
                  style={{
                    fontSize: 20,
                    margin: "5px 0",
                  }}
                >
                  Log details
                </h2>
              </div>

              <button
                type="button"
                className="button button--secondary"
                onClick={() => setSelectedLog(null)}
                aria-label="Close log details"
              >
                <X size={17} />
              </button>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
                marginBottom: 18,
              }}
            >
              <span
                className={getLevelClass(
                  getLogLevel(selectedLog)
                )}
              >
                {humanize(getLogLevel(selectedLog))}
              </span>

              <span style={{ fontSize: 13, opacity: 0.7 }}>
                {formatTimestamp(
                  getTimestamp(selectedLog),
                  mounted
                )}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <strong style={{ fontSize: 14 }}>
                Complete record
              </strong>

              <button
                type="button"
                className="button button--secondary"
                onClick={() => void handleCopy()}
              >
                <Copy size={14} />
                {copied ? "Copied" : "Copy JSON"}
              </button>
            </div>

            <pre
              style={{
                margin: 0,
                padding: 16,
                borderRadius: 8,
                background: "var(--muted, #f3f4f6)",
                border: "1px solid var(--border-color, #e5e7eb)",
                overflow: "auto",
                maxHeight: "50vh",
                fontSize: 12,
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
                fontFamily:
                  "ui-monospace, SFMono-Regular, Consolas, monospace",
              }}
            >
              {JSON.stringify(selectedLog, null, 2)}
            </pre>
          </section>
        </div>
      )}

      {/* Footer */}

      <p className="page-footnote">
        Log data is provided by the configured API. This page
        does not generate synthetic events or modify stored logs.
      </p>
    </div>
  );
}
