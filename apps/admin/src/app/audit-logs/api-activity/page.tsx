
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDownToLine,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  Eye,
  FileJson,
  Filter,
  Globe,
  RefreshCw,
  Search,
  ShieldAlert,
  X,
  XCircle,
  Zap,
} from "lucide-react";

type ApiEvent = {
  id: string;
  timestamp: string;
  organization: string;
  actor: string;
  method: string;
  endpoint: string;
  statusCode: number;
  latency: number;
  result: "Success" | "Error";
  requestId: string;
  ipAddress: string;
  userAgent: string;
  responseSize: string;
  errorMessage?: string;
};

const initialEvents: ApiEvent[] = [
  {
    id: "API-1001",
    timestamp: "2026-11-04 10:42:18",
    organization: "Acme Technologies",
    actor: "admin@acme.com",
    method: "GET",
    endpoint: "/api/v1/models",
    statusCode: 200,
    latency: 124,
    result: "Success",
    requestId: "req_mn_7f21a9",
    ipAddress: "192.168.1.24",
    userAgent: "Chrome / Windows",
    responseSize: "18.4 KB",
  },
  {
    id: "API-1002",
    timestamp: "2026-11-04 10:40:52",
    organization: "Nova AI",
    actor: "developer@nova.ai",
    method: "POST",
    endpoint: "/api/v1/chat/completions",
    statusCode: 200,
    latency: 842,
    result: "Success",
    requestId: "req_mn_8a42bc",
    ipAddress: "10.0.0.18",
    userAgent: "ModelNow SDK / Node.js",
    responseSize: "4.2 KB",
  },
  {
    id: "API-1003",
    timestamp: "2026-11-04 10:38:31",
    organization: "Acme Technologies",
    actor: "service-account",
    method: "POST",
    endpoint: "/api/v1/embeddings",
    statusCode: 429,
    latency: 42,
    result: "Error",
    requestId: "req_mn_3c19de",
    ipAddress: "192.168.1.28",
    userAgent: "Python SDK",
    responseSize: "0.8 KB",
    errorMessage: "Rate limit exceeded for the current API key.",
  },
  {
    id: "API-1004",
    timestamp: "2026-11-04 10:35:09",
    organization: "Vertex Labs",
    actor: "ops@vertexlabs.io",
    method: "GET",
    endpoint: "/api/v1/usage",
    statusCode: 200,
    latency: 96,
    result: "Success",
    requestId: "req_mn_2d82ff",
    ipAddress: "10.2.4.15",
    userAgent: "Firefox / Linux",
    responseSize: "9.1 KB",
  },
  {
    id: "API-1005",
    timestamp: "2026-11-04 10:31:47",
    organization: "Bright Systems",
    actor: "api-client",
    method: "POST",
    endpoint: "/api/v1/fine-tuning/jobs",
    statusCode: 500,
    latency: 2104,
    result: "Error",
    requestId: "req_mn_4e61aa",
    ipAddress: "172.16.0.12",
    userAgent: "ModelNow SDK / Python",
    responseSize: "1.2 KB",
    errorMessage: "Internal service error while creating the job.",
  },
  {
    id: "API-1006",
    timestamp: "2026-11-04 10:28:13",
    organization: "Nova AI",
    actor: "developer@nova.ai",
    method: "DELETE",
    endpoint: "/api/v1/keys/key_92",
    statusCode: 204,
    latency: 78,
    result: "Success",
    requestId: "req_mn_6a31cc",
    ipAddress: "10.0.0.18",
    userAgent: "Chrome / macOS",
    responseSize: "0 KB",
  },
  {
    id: "API-1007",
    timestamp: "2026-11-04 10:25:05",
    organization: "Vertex Labs",
    actor: "api-client",
    method: "PUT",
    endpoint: "/api/v1/routing/config",
    statusCode: 403,
    latency: 51,
    result: "Error",
    requestId: "req_mn_9b10ed",
    ipAddress: "10.2.4.15",
    userAgent: "Go SDK",
    responseSize: "0.6 KB",
    errorMessage: "The API key does not have permission for this resource.",
  },
  {
    id: "API-1008",
    timestamp: "2026-11-04 10:19:44",
    organization: "Acme Technologies",
    actor: "admin@acme.com",
    method: "GET",
    endpoint: "/api/v1/organizations",
    statusCode: 200,
    latency: 112,
    result: "Success",
    requestId: "req_mn_1f7c23",
    ipAddress: "192.168.1.24",
    userAgent: "Chrome / Windows",
    responseSize: "6.8 KB",
  },
  {
    id: "API-1009",
    timestamp: "2026-11-04 10:16:02",
    organization: "Bright Systems",
    actor: "api-client",
    method: "POST",
    endpoint: "/api/v1/chat/completions",
    statusCode: 502,
    latency: 3200,
    result: "Error",
    requestId: "req_mn_5a09bd",
    ipAddress: "172.16.0.12",
    userAgent: "ModelNow SDK / Python",
    responseSize: "0.9 KB",
    errorMessage: "Upstream model provider returned a gateway error.",
  },
  {
    id: "API-1010",
    timestamp: "2026-11-04 10:12:36",
    organization: "Nova AI",
    actor: "developer@nova.ai",
    method: "PATCH",
    endpoint: "/api/v1/projects/project_12",
    statusCode: 200,
    result: "Success",
    latency: 143,
    requestId: "req_mn_0e72ab",
    ipAddress: "10.0.0.18",
    userAgent: "Chrome / macOS",
    responseSize: "2.4 KB",
  },
];

const methodOptions = ["All methods", "GET", "POST", "PUT", "PATCH", "DELETE"];
const resultOptions = ["All results", "Success", "Error"];
const statusOptions = [
  "All status codes",
  "2xx Success",
  "4xx Client Error",
  "5xx Server Error",
];

function methodClass(method: string) {
  return `method method-${method.toLowerCase()}`;
}

function statusClass(code: number) {
  if (code >= 500) return "status status-server";
  if (code >= 400) return "status status-client";
  return "status status-success";
}

export default function ApiActivityPage() {
  const [events, setEvents] = useState<ApiEvent[]>(initialEvents);
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("All methods");
  const [result, setResult] = useState("All results");
  const [status, setStatus] = useState("All status codes");
  const [selected, setSelected] = useState<ApiEvent | null>(null);
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        !query ||
        [
          event.id,
          event.organization,
          event.actor,
          event.method,
          event.endpoint,
          event.requestId,
          event.ipAddress,
          String(event.statusCode),
        ].some((value) => value.toLowerCase().includes(query));

      const matchesMethod =
        method === "All methods" || event.method === method;

      const matchesResult =
        result === "All results" || event.result === result;

      const matchesStatus =
        status === "All status codes" ||
        (status === "2xx Success" &&
          event.statusCode >= 200 &&
          event.statusCode < 300) ||
        (status === "4xx Client Error" &&
          event.statusCode >= 400 &&
          event.statusCode < 500) ||
        (status === "5xx Server Error" &&
          event.statusCode >= 500 &&
          event.statusCode < 600);

      return (
        matchesSearch && matchesMethod && matchesResult && matchesStatus
      );
    });
  }, [events, search, method, result, status]);

  const totalRequests = events.length;
  const successCount = events.filter((e) => e.result === "Success").length;
  const errorCount = events.filter((e) => e.result === "Error").length;
  const averageLatency = totalRequests
    ? Math.round(
        events.reduce((sum, event) => sum + event.latency, 0) /
          totalRequests
      )
    : 0;

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageEvents = filteredEvents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function refreshEvents() {
    setEvents([...initialEvents]);
    setPage(1);
    setNotice("Demo API activity data refreshed.");
    window.setTimeout(() => setNotice(""), 2500);
  }

  function exportCsv() {
    const headers = [
      "Event ID",
      "Timestamp",
      "Organization",
      "Actor",
      "Method",
      "Endpoint",
      "Status Code",
      "Latency (ms)",
      "Result",
      "Request ID",
      "IP Address",
      "Error",
    ];

    const rows = filteredEvents.map((event) => [
      event.id,
      event.timestamp,
      event.organization,
      event.actor,
      event.method,
      event.endpoint,
      event.statusCode,
      event.latency,
      event.result,
      event.requestId,
      event.ipAddress,
      event.errorMessage ?? "",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\r\n");

    downloadFile(
      csv,
      "modelnow-api-activity.csv",
      "text/csv;charset=utf-8;"
    );
  }

  function exportJson() {
    downloadFile(
      JSON.stringify(filteredEvents, null, 2),
      "modelnow-api-activity.json",
      "application/json"
    );
  }

  function downloadFile(
    content: string,
    filename: string,
    contentType: string
  ) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setNotice(`${filename} exported successfully.`);
    window.setTimeout(() => setNotice(""), 2500);
  }

  function resetFilters() {
    setSearch("");
    setMethod("All methods");
    setResult("All results");
    setStatus("All status codes");
    setPage(1);
  }

  return (
    <main className="api-page">
      <header className="topbar">
        <div className="breadcrumbs">
          <Link href="/dashboard">Admin</Link>
          <span>/</span>
          <Link href="/audit-logs">Audit Logs</Link>
          <span>/</span>
          <strong>API Activity</strong>
        </div>
        <div className="top-actions">
          <span className="environment">
            <span className="environment-dot" />
            Production workspace
          </span>
          <button className="icon-button" onClick={refreshEvents} title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>
      </header>

      <section className="content">
        <div className="page-heading">
          <div className="heading-icon">
            <Activity size={23} />
          </div>
          <div className="heading-copy">
            <div className="eyebrow">ADMINISTRATION / AUDIT LOGS</div>
            <h1>API Activity</h1>
            <p>
              Inspect API requests, response codes, latency, and request-level
              failures across your organizations.
            </p>
          </div>
          <div className="heading-actions">
            <button className="button secondary" onClick={exportJson}>
              <FileJson size={16} /> Export JSON
            </button>
            <button className="button primary" onClick={exportCsv}>
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        {notice && (
          <div className="notice">
            <CheckCircle2 size={16} /> {notice}
            <button onClick={() => setNotice("")} aria-label="Dismiss">
              <X size={15} />
            </button>
          </div>
        )}

        <div className="demo-notice">
          <ShieldAlert size={17} />
          <span>
            <strong>Sample data:</strong> These events are frontend examples,
            not live production API traffic.
          </span>
        </div>

        <section className="metrics">
          <Metric
            title="Total API requests"
            value={totalRequests.toLocaleString()}
            detail="Requests in this sample"
            icon={<Globe size={19} />}
            tone="blue"
          />
          <Metric
            title="Successful requests"
            value={successCount.toLocaleString()}
            detail={`${totalRequests ? Math.round((successCount / totalRequests) * 100) : 0}% success rate`}
            icon={<CheckCircle2 size={19} />}
            tone="green"
          />
          <Metric
            title="Failed requests"
            value={errorCount.toLocaleString()}
            detail="Client and server errors"
            icon={<XCircle size={19} />}
            tone="red"
          />
          <Metric
            title="Average latency"
            value={`${averageLatency.toLocaleString()} ms`}
            detail="Mean response time"
            icon={<Zap size={19} />}
            tone="purple"
          />
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>API request events</h2>
              <p>Search and review recorded request metadata.</p>
            </div>
            <span className="record-count">
              {filteredEvents.length} records
            </span>
          </div>

          <div className="filters">
            <div className="search-field">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search endpoint, organization, request ID..."
              />
              {search && (
                <button onClick={() => setSearch("")} aria-label="Clear search">
                  <X size={15} />
                </button>
              )}
            </div>

            <FilterSelect
              value={method}
              onChange={(value) => {
                setMethod(value);
                setPage(1);
              }}
              options={methodOptions}
            />
            <FilterSelect
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
              options={statusOptions}
            />
            <FilterSelect
              value={result}
              onChange={(value) => {
                setResult(value);
                setPage(1);
              }}
              options={resultOptions}
            />

            <button className="button filter-reset" onClick={resetFilters}>
              <Filter size={15} /> Reset
            </button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>REQUEST</th>
                  <th>ORGANIZATION / ACTOR</th>
                  <th>ENDPOINT</th>
                  <th>STATUS</th>
                  <th>LATENCY</th>
                  <th>RESULT</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {pageEvents.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <div className="event-id">{event.id}</div>
                      <div className="muted small">{event.timestamp}</div>
                    </td>
                    <td>
                      <div className="cell-primary">{event.organization}</div>
                      <div className="muted small">{event.actor}</div>
                    </td>
                    <td>
                      <div className="endpoint">
                        <span className={methodClass(event.method)}>
                          {event.method}
                        </span>
                        <code>{event.endpoint}</code>
                      </div>
                    </td>
                    <td>
                      <span className={statusClass(event.statusCode)}>
                        {event.statusCode}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          event.latency >= 1000
                            ? "latency latency-slow"
                            : "latency"
                        }
                      >
                        <Clock3 size={13} /> {event.latency.toLocaleString()} ms
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          event.result === "Success"
                            ? "result result-success"
                            : "result result-error"
                        }
                      >
                        {event.result === "Success" ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <XCircle size={14} />
                        )}
                        {event.result}
                      </span>
                    </td>
                    <td>
                      <button
                        className="icon-button details-button"
                        onClick={() => setSelected(event)}
                        title="View request details"
                        aria-label={`View ${event.id}`}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {pageEvents.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">
                        <Search size={25} />
                        <strong>No matching API events</strong>
                        <span>Try changing your search or filters.</span>
                        <button className="button secondary" onClick={resetFilters}>
                          Clear filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <span>
              Showing{" "}
              {filteredEvents.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
              –{Math.min(currentPage * pageSize, filteredEvents.length)} of{" "}
              {filteredEvents.length} events
            </span>
            <div className="pagination">
              <button
                className="button secondary"
                disabled={currentPage <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="button secondary"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setPage((value) => Math.min(totalPages, value + 1))
                }
              >
                Next
              </button>
            </div>
          </div>
        </section>

        <section className="bottom-info">
          <div className="bottom-info-icon">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3>API observability and audit readiness</h3>
            <p>
              For production, capture request IDs, authenticated actors, HTTP
              status codes, timing, and redacted error metadata on the server.
              Avoid storing API secrets, authorization headers, or sensitive
              request bodies in audit logs.
            </p>
          </div>
        </section>
      </section>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <section
            className="details-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="details-title"
          >
            <div className="modal-header">
              <div>
                <div className="eyebrow">API REQUEST DETAILS</div>
                <h2 id="details-title">{selected.id}</h2>
                <p>{selected.timestamp}</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setSelected(null)}
                aria-label="Close details"
              >
                <X size={19} />
              </button>
            </div>

            <div className="modal-status-row">
              <span className={methodClass(selected.method)}>
                {selected.method}
              </span>
              <code className="modal-endpoint">{selected.endpoint}</code>
              <span className={statusClass(selected.statusCode)}>
                {selected.statusCode}
              </span>
            </div>

            <div className="detail-grid">
              <Detail label="Organization" value={selected.organization} />
              <Detail label="Actor" value={selected.actor} />
              <Detail label="Result" value={selected.result} />
              <Detail label="Latency" value={`${selected.latency} ms`} />
              <Detail label="Request ID" value={selected.requestId} />
              <Detail label="IP address" value={selected.ipAddress} />
              <Detail label="Response size" value={selected.responseSize} />
              <Detail label="User agent" value={selected.userAgent} />
            </div>

            {selected.errorMessage && (
              <div className="error-box">
                <div>
                  <XCircle size={17} /> Error details
                </div>
                <p>{selected.errorMessage}</p>
              </div>
            )}

            <div className="modal-footer">
              <button
                className="button secondary"
                onClick={() => {
                  navigator.clipboard?.writeText(
                    JSON.stringify(selected, null, 2)
                  );
                  setNotice("Request details copied when clipboard access is available.");
                  setSelected(null);
                  window.setTimeout(() => setNotice(""), 2500);
                }}
              >
                <ArrowDownToLine size={15} /> Copy JSON details
              </button>
              <button className="button primary" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      <style jsx>{`
        .api-page {
          min-height: 100vh;
          background: #f7f8fc;
          color: #172033;
          font-family: Arial, Helvetica, sans-serif;
        }
        .topbar {
          height: 64px;
          padding: 0 34px;
          background: #fff;
          border-bottom: 1px solid #e8ebf2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
        }
        .breadcrumbs,
        .top-actions,
        .environment {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .breadcrumbs {
          color: #9299a9;
          font-size: 13px;
        }
        .breadcrumbs a {
          color: #737d91;
          text-decoration: none;
        }
        .breadcrumbs a:hover {
          color: #315fe8;
        }
        .breadcrumbs strong {
          color: #202b40;
          font-weight: 600;
        }
        .environment {
          font-size: 12px;
          color: #667085;
          white-space: nowrap;
        }
        .environment-dot {
          width: 7px;
          height: 7px;
          background: #16a36a;
          border-radius: 50%;
        }
        .content {
          max-width: 1600px;
          padding: 32px 34px 48px;
          margin: 0 auto;
        }
        .page-heading {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 22px;
        }
        .heading-icon {
          width: 52px;
          height: 52px;
          display: grid;
          place-items: center;
          color: #315fe8;
          background: #eaf0ff;
          border: 1px solid #dce6ff;
          border-radius: 14px;
          flex-shrink: 0;
        }
        .heading-copy {
          min-width: 0;
          flex: 1;
        }
        .eyebrow {
          color: #78849a;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.1px;
          margin-bottom: 7px;
        }
        h1 {
          font-size: 27px;
          margin: 0 0 7px;
          letter-spacing: -0.7px;
          font-weight: 700;
        }
        .heading-copy p,
        .panel-heading p {
          margin: 0;
          color: #7b8496;
          font-size: 13px;
          line-height: 1.6;
        }
        .heading-actions {
          display: flex;
          gap: 9px;
          flex-shrink: 0;
        }
        .button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 13px;
          border-radius: 8px;
          border: 1px solid #dfe4ee;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s ease;
        }
        .button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .primary {
          color: #fff;
          background: #315fe8;
          border-color: #315fe8;
        }
        .primary:hover:not(:disabled) {
          background: #244fd0;
        }
        .secondary {
          background: #fff;
          color: #46516a;
        }
        .secondary:hover:not(:disabled) {
          background: #f4f6fa;
        }
        .icon-button {
          width: 34px;
          height: 34px;
          display: inline-grid;
          place-items: center;
          color: #68748a;
          background: #fff;
          border: 1px solid #e1e6ef;
          border-radius: 8px;
          cursor: pointer;
          flex-shrink: 0;
        }
        .icon-button:hover {
          color: #315fe8;
          background: #f4f7ff;
        }
        .notice {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 12px 14px;
          margin-bottom: 16px;
          background: #ecfdf3;
          color: #147b4b;
          border: 1px solid #c8f0d9;
          border-radius: 9px;
          font-size: 12px;
        }
        .notice button {
          display: grid;
          place-items: center;
          margin-left: auto;
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
        }
        .demo-notice {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 21px;
          padding: 12px 14px;
          background: #fff9e9;
          border: 1px solid #f4e5ba;
          border-radius: 9px;
          color: #8c6a19;
          font-size: 12px;
          line-height: 1.5;
        }
        .demo-notice svg {
          flex-shrink: 0;
        }
        .metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .metric-card {
          min-width: 0;
          background: #fff;
          border: 1px solid #e7eaf1;
          border-radius: 12px;
          padding: 18px;
          box-shadow: 0 2px 6px rgba(22, 34, 56, 0.025);
        }
        .metric-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 15px;
        }
        .metric-title {
          color: #737e92;
          font-size: 12px;
        }
        .metric-icon {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border-radius: 10px;
        }
        .metric-value {
          font-size: 27px;
          font-weight: 700;
          letter-spacing: -0.7px;
          margin-bottom: 7px;
        }
        .metric-detail {
          font-size: 11px;
          color: #929bad;
        }
        .tone-blue {
          color: #315fe8;
          background: #edf2ff;
        }
        .tone-green {
          color: #159764;
          background: #e8f8f0;
        }
        .tone-red {
          color: #d84b58;
          background: #fff0f1;
        }
        .tone-purple {
          color: #8856d9;
          background: #f3edff;
        }
        .panel {
          overflow: hidden;
          background: #fff;
          border: 1px solid #e7eaf1;
          border-radius: 12px;
          box-shadow: 0 2px 6px rgba(22, 34, 56, 0.025);
        }
        .panel-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 22px 22px 18px;
        }
        .panel-heading h2 {
          font-size: 16px;
          margin: 0 0 7px;
          font-weight: 700;
        }
        .record-count {
          padding: 6px 10px;
          border: 1px solid #e6eaf1;
          background: #f8f9fc;
          color: #647087;
          border-radius: 7px;
          font-size: 11px;
          white-space: nowrap;
        }
        .filters {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;
          padding: 0 22px 18px;
        }
        .search-field {
          min-width: 230px;
          flex: 1;
          height: 38px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 11px;
          border: 1px solid #e0e5ef;
          border-radius: 8px;
          color: #8993a6;
          background: #fff;
        }
        .search-field input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          color: #27344b;
          font-size: 12px;
          background: transparent;
        }
        .search-field input::placeholder {
          color: #9ba4b5;
        }
        .search-field button {
          display: grid;
          place-items: center;
          border: 0;
          background: transparent;
          color: #8993a6;
          cursor: pointer;
        }
        .filter-select {
          position: relative;
          display: flex;
          align-items: center;
        }
        .filter-select select {
          appearance: none;
          max-width: 165px;
          min-width: 125px;
          height: 38px;
          padding: 0 30px 0 11px;
          border: 1px solid #e0e5ef;
          border-radius: 8px;
          outline: 0;
          color: #536077;
          background: #fff;
          font-size: 11px;
          cursor: pointer;
        }
        .filter-select svg {
          position: absolute;
          right: 9px;
          color: #8791a3;
          pointer-events: none;
        }
        .filter-reset {
          padding: 10px;
          background: #fff;
          color: #647087;
        }
        .table-wrap {
          width: 100%;
          overflow-x: auto;
          border-top: 1px solid #edf0f5;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          white-space: nowrap;
        }
        thead {
          background: #fafbfe;
        }
        th {
          padding: 13px 16px;
          color: #929bad;
          font-size: 9px;
          letter-spacing: 0.7px;
          font-weight: 700;
          border-bottom: 1px solid #edf0f5;
        }
        td {
          padding: 15px 16px;
          border-bottom: 1px solid #f0f2f6;
          font-size: 12px;
          vertical-align: middle;
        }
        tbody tr:hover {
          background: #fafbff;
        }
        tbody tr:last-child td {
          border-bottom: 0;
        }
        .event-id {
          color: #34415a;
          font-weight: 700;
          font-size: 11px;
          margin-bottom: 6px;
        }
        .muted {
          color: #929bad;
        }
        .small {
          font-size: 10px;
        }
        .cell-primary {
          font-weight: 600;
          color: #34415a;
          margin-bottom: 6px;
        }
        .endpoint {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .endpoint code,
        .modal-endpoint {
          color: #45516a;
          font-size: 11px;
          font-family: Consolas, "Courier New", monospace;
        }
        .method {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 43px;
          padding: 5px 7px;
          border-radius: 5px;
          font-size: 9px;
          font-weight: 700;
          font-family: Consolas, monospace;
        }
        .method-get {
          background: #eaf2ff;
          color: #3267d6;
        }
        .method-post {
          background: #e7f8ef;
          color: #148755;
        }
        .method-put,
        .method-patch {
          background: #fff5df;
          color: #a76b0c;
        }
        .method-delete {
          background: #ffebed;
          color: #cb3f50;
        }
        .status {
          display: inline-flex;
          padding: 5px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
          font-family: Consolas, monospace;
        }
        .status-success {
          color: #168452;
          background: #eaf8f0;
        }
        .status-client {
          color: #a96a12;
          background: #fff5e4;
        }
        .status-server {
          color: #c33e4c;
          background: #ffedef;
        }
        .latency {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #647087;
          font-size: 11px;
        }
        .latency-slow {
          color: #c54d3f;
          font-weight: 700;
        }
        .result {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 600;
        }
        .result-success {
          color: #168452;
        }
        .result-error {
          color: #cc4553;
        }
        .details-button {
          width: 30px;
          height: 30px;
        }
        .empty-state {
          min-height: 220px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 11px;
          color: #8993a6;
          font-size: 12px;
        }
        .empty-state strong {
          color: #34415a;
          font-size: 14px;
        }
        .table-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 16px 22px;
          border-top: 1px solid #edf0f5;
          color: #8791a3;
          font-size: 11px;
        }
        .pagination {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .pagination .button {
          padding: 8px 11px;
          font-size: 11px;
        }
        .pagination span {
          white-space: nowrap;
        }
        .bottom-info {
          display: flex;
          gap: 13px;
          align-items: flex-start;
          margin-top: 22px;
          padding: 18px;
          border: 1px solid #e5eaff;
          border-radius: 11px;
          background: #f0f4ff;
        }
        .bottom-info-icon {
          color: #315fe8;
          flex-shrink: 0;
        }
        .bottom-info h3 {
          margin: 0 0 7px;
          color: #263c77;
          font-size: 13px;
        }
        .bottom-info p {
          margin: 0;
          color: #66779f;
          font-size: 12px;
          line-height: 1.7;
        }
        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(15, 23, 42, 0.48);
          backdrop-filter: blur(3px);
        }
        .details-modal {
          width: 100%;
          max-width: 680px;
          max-height: 90vh;
          overflow-y: auto;
          background: #fff;
          border: 1px solid #e5e9f1;
          border-radius: 15px;
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.2);
          padding: 25px;
        }
        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 21px;
        }
        .modal-header h2 {
          margin: 0 0 6px;
          font-size: 21px;
        }
        .modal-header p {
          margin: 0;
          color: #8993a6;
          font-size: 11px;
        }
        .modal-status-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          padding: 14px;
          margin-bottom: 20px;
          border: 1px solid #e8ebf2;
          border-radius: 9px;
          background: #fafbfe;
        }
        .modal-endpoint {
          flex: 1;
          overflow-wrap: anywhere;
        }
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 13px;
        }
        .detail-item {
          padding: 13px;
          border: 1px solid #edf0f5;
          border-radius: 8px;
          min-width: 0;
        }
        .detail-label {
          margin-bottom: 8px;
          color: #8a94a6;
          font-size: 10px;
        }
        .detail-value {
          color: #34415a;
          font-size: 12px;
          font-weight: 600;
          overflow-wrap: anywhere;
        }
        .error-box {
          margin-top: 18px;
          padding: 14px;
          border: 1px solid #ffd9dd;
          background: #fff5f5;
          border-radius: 9px;
        }
        .error-box div {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #c53d4d;
          font-size: 12px;
          font-weight: 700;
        }
        .error-box p {
          margin: 10px 0 0;
          color: #8f4650;
          font-size: 12px;
          line-height: 1.6;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          margin-top: 24px;
          padding-top: 18px;
          border-top: 1px solid #edf0f5;
        }
        @media (max-width: 1100px) {
          .metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .page-heading {
            flex-wrap: wrap;
          }
          .heading-actions {
            width: 100%;
            margin-left: 68px;
          }
        }
        @media (max-width: 700px) {
          .topbar {
            height: auto;
            min-height: 60px;
            padding: 14px 16px;
          }
          .environment {
            display: none;
          }
          .content {
            padding: 24px 14px 35px;
          }
          .heading-icon {
            width: 44px;
            height: 44px;
          }
          h1 {
            font-size: 23px;
          }
          .heading-copy p {
            font-size: 12px;
          }
          .heading-actions {
            margin-left: 0;
          }
          .heading-actions .button {
            flex: 1;
            padding: 10px 7px;
          }
          .metrics {
            gap: 10px;
          }
          .metric-card {
            padding: 14px;
          }
          .metric-value {
            font-size: 23px;
          }
          .metric-title {
            font-size: 11px;
          }
          .panel-heading {
            padding: 18px 14px;
          }
          .filters {
            padding: 0 14px 15px;
          }
          .search-field {
            flex-basis: 100%;
          }
          .filter-select {
            flex: 1;
          }
          .filter-select select {
            width: 100%;
            max-width: none;
            min-width: 0;
          }
          .filter-reset {
            flex: 1;
          }
          .table-footer {
            flex-direction: column;
            align-items: flex-start;
            padding: 15px;
          }
          .pagination {
            width: 100%;
            justify-content: space-between;
            gap: 7px;
          }
          .detail-grid {
            grid-template-columns: 1fr;
          }
          .details-modal {
            padding: 18px;
          }
          .breadcrumbs {
            flex-wrap: wrap;
            font-size: 11px;
          }
        }
      `}</style>
    </main>
  );
}

function Metric({
  title,
  value,
  detail,
  icon,
  tone,
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  tone: "blue" | "green" | "red" | "purple";
}) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span className="metric-title">{title}</span>
        <span className={`metric-icon tone-${tone}`}>{icon}</span>
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-detail">{detail}</div>
      <style jsx>{`
        .metric-card {
          min-width: 0;
          background: #fff;
          border: 1px solid #e7eaf1;
          border-radius: 12px;
          padding: 18px;
          box-shadow: 0 2px 6px rgba(22, 34, 56, 0.025);
        }
        .metric-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 15px;
        }
        .metric-title {
          color: #737e92;
          font-size: 12px;
        }
        .metric-icon {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          flex-shrink: 0;
        }
        .tone-blue {
          color: #315fe8;
          background: #edf2ff;
        }
        .tone-green {
          color: #159764;
          background: #e8f8f0;
        }
        .tone-red {
          color: #d84b58;
          background: #fff0f1;
        }
        .tone-purple {
          color: #8856d9;
          background: #f3edff;
        }
        .metric-value {
          font-size: 27px;
          font-weight: 700;
          letter-spacing: -0.7px;
          margin-bottom: 7px;
          color: #172033;
        }
        .metric-detail {
          font-size: 11px;
          color: #929bad;
        }
        @media (max-width: 700px) {
          .metric-card {
            padding: 14px;
          }
          .metric-value {
            font-size: 23px;
          }
          .metric-title {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="filter-select">
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown size={14} />
      <style jsx>{`
        .filter-select {
          position: relative;
          display: flex;
          align-items: center;
        }
        select {
          appearance: none;
          max-width: 165px;
          min-width: 125px;
          height: 38px;
          padding: 0 30px 0 11px;
          border: 1px solid #e0e5ef;
          border-radius: 8px;
          outline: 0;
          color: #536077;
          background: #fff;
          font-size: 11px;
          cursor: pointer;
        }
        svg {
          position: absolute;
          right: 9px;
          color: #8791a3;
          pointer-events: none;
        }
        @media (max-width: 700px) {
          select {
            width: 100%;
            max-width: none;
            min-width: 0;
          }
        }
      `}</style>
    </label>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-item">
      <div className="detail-label">{label}</div>
      <div className="detail-value">{value}</div>
      <style jsx>{`
        .detail-item {
          padding: 13px;
          border: 1px solid #edf0f5;
          border-radius: 8px;
          min-width: 0;
        }
        .detail-label {
          margin-bottom: 8px;
          color: #8a94a6;
          font-size: 10px;
        }
        .detail-value {
          color: #34415a;
          font-size: 12px;
          font-weight: 600;
          overflow-wrap: anywhere;
        }
      `}</style>
    </div>
  );
}
