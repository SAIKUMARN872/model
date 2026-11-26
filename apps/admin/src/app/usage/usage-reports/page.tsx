
"use client";

import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

type ReportStatus = "Ready" | "Scheduled" | "Processing";
type ReportFormat = "CSV" | "JSON";

type Report = {
  id: string;
  name: string;
  type: string;
  period: string;
  format: ReportFormat;
  createdAt: string;
  createdBy: string;
  status: ReportStatus;
};

const reportTypes = [
  "Platform Usage",
  "User Usage",
  "Organization Usage",
  "API Usage",
  "AI Model Usage",
  "AI Provider Usage",
  "Token Analytics",
  "Credit Analytics",
  "GPU Usage",
  "Infrastructure Usage",
  "Cost Analytics",
  "Revenue Analytics",
];

const initialReports: Report[] = [
  {
    id: "RPT-1042",
    name: "Monthly Platform Usage",
    type: "Platform Usage",
    period: "October 2026",
    format: "CSV",
    createdAt: "2026-11-04 09:30",
    createdBy: "Admin",
    status: "Ready",
  },
  {
    id: "RPT-1041",
    name: "AI Model Consumption",
    type: "AI Model Usage",
    period: "Last 30 days",
    format: "JSON",
    createdAt: "2026-11-03 16:45",
    createdBy: "Admin",
    status: "Ready",
  },
  {
    id: "RPT-1040",
    name: "Organization Cost Breakdown",
    type: "Cost Analytics",
    period: "October 2026",
    format: "CSV",
    createdAt: "2026-11-03 11:20",
    createdBy: "Finance Admin",
    status: "Ready",
  },
  {
    id: "RPT-1039",
    name: "API Request Summary",
    type: "API Usage",
    period: "Last 7 days",
    format: "CSV",
    createdAt: "2026-11-02 15:10",
    createdBy: "Admin",
    status: "Ready",
  },
  {
    id: "RPT-1038",
    name: "Token Analytics",
    type: "Token Analytics",
    period: "November 2026",
    format: "JSON",
    createdAt: "2026-11-02 10:00",
    createdBy: "System",
    status: "Scheduled",
  },
];

const sampleRows = [
  {
    organization: "Acme Technologies",
    requests: 128450,
    tokens: 28450000,
    cost: 428.65,
  },
  {
    organization: "Nexus AI Labs",
    requests: 89420,
    tokens: 16200000,
    cost: 216.4,
  },
  {
    organization: "Vertex Systems",
    requests: 45280,
    tokens: 9800000,
    cost: 312.75,
  },
  {
    organization: "BrightPath Digital",
    requests: 67800,
    tokens: 0,
    cost: 86.2,
  },
  {
    organization: "CloudScale Inc.",
    requests: 28400,
    tokens: 4200000,
    cost: 64.85,
  },
];

const styles = {
  page: {
    maxWidth: 1600,
    margin: "0 auto",
    padding: "28px clamp(16px, 3vw, 32px)",
    color: "var(--foreground, #111827)",
  } as CSSProperties,
  panel: {
    border: "1px solid var(--border, #e5e7eb)",
    borderRadius: 14,
    background: "var(--panel, #fff)",
    padding: 20,
    minWidth: 0,
  } as CSSProperties,
  muted: {
    color: "var(--muted-foreground, #6b7280)",
    fontSize: 12,
  } as CSSProperties,
  input: {
    width: "100%",
    height: 40,
    border: "1px solid var(--border, #d1d5db)",
    borderRadius: 9,
    padding: "0 12px",
    background: "var(--panel, #fff)",
    color: "var(--foreground, #111827)",
    fontSize: 13,
    outline: "none",
  } as CSSProperties,
  button: {
    minHeight: 39,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    border: "1px solid var(--border, #d1d5db)",
    borderRadius: 9,
    padding: "0 13px",
    background: "var(--panel, #fff)",
    color: "var(--foreground, #111827)",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: "nowrap",
  } as CSSProperties,
  primaryButton: {
    minHeight: 39,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    border: "1px solid #4f46e5",
    borderRadius: 9,
    padding: "0 13px",
    background: "#4f46e5",
    color: "#fff",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: "nowrap",
  } as CSSProperties,
};

function statusStyle(status: ReportStatus): CSSProperties {
  const colors: Record<ReportStatus, { color: string; background: string }> = {
    Ready: { color: "#047857", background: "#d1fae5" },
    Scheduled: { color: "#92400e", background: "#fef3c7" },
    Processing: { color: "#1d4ed8", background: "#dbeafe" },
  };

  return {
    ...colors[status],
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    padding: "5px 9px",
    fontSize: 11,
    fontWeight: 650,
    whiteSpace: "nowrap",
  };
}

export default function UsageReportsPage() {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [typeFilter, setTypeFilter] = useState("All report types");
  const [showCreate, setShowCreate] = useState(false);
  const [reportName, setReportName] = useState("");
  const [reportType, setReportType] = useState("Platform Usage");
  const [reportPeriod, setReportPeriod] = useState("Last 30 days");
  const [reportFormat, setReportFormat] = useState<ReportFormat>("CSV");
  const [notice, setNotice] = useState("");
  const [lastUpdated, setLastUpdated] = useState("Just now");

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesSearch = [
        report.id,
        report.name,
        report.createdBy,
        report.type,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);

      const matchesStatus =
        statusFilter === "All statuses" || report.status === statusFilter;

      const matchesType =
        typeFilter === "All report types" || report.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [reports, search, statusFilter, typeFilter]);

  const readyCount = reports.filter((report) => report.status === "Ready").length;
  const scheduledCount = reports.filter(
    (report) => report.status === "Scheduled"
  ).length;

  const exportReport = (report: Report) => {
    const rows = sampleRows.map((row) => ({
      report_id: report.id,
      report_name: report.name,
      report_type: report.type,
      reporting_period: report.period,
      ...row,
    }));

    let content: string;
    let mimeType: string;

    if (report.format === "JSON") {
      content = JSON.stringify(rows, null, 2);
      mimeType = "application/json";
    } else {
      const headers = [
        "Report ID",
        "Report Name",
        "Report Type",
        "Reporting Period",
        "Organization",
        "Requests",
        "Tokens",
        "Cost USD",
      ];

      const data = rows.map((row) => [
        row.report_id,
        row.report_name,
        row.report_type,
        row.reporting_period,
        row.organization,
        row.requests,
        row.tokens,
        row.cost,
      ]);

      content = [headers, ...data]
        .map((row) =>
          row
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");

      mimeType = "text/csv;charset=utf-8;";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `${report.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}.${report.format.toLowerCase()}`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    setNotice(`Exported sample ${report.format} data for "${report.name}".`);
  };

  const createReport = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = reportName.trim();
    if (!name) return;

    const newReport: Report = {
      id: `RPT-${Date.now().toString().slice(-6)}`,
      name,
      type: reportType,
      period: reportPeriod,
      format: reportFormat,
      createdAt: new Date().toLocaleString(),
      createdBy: "Admin",
      status: "Ready",
    };

    setReports((current) => [newReport, ...current]);
    setShowCreate(false);
    setReportName("");
    setNotice(`Report "${name}" was added to the local list.`);
  };

  const removeReport = (id: string) => {
    setReports((current) => current.filter((report) => report.id !== id));
    setNotice(`Report ${id} was removed from the local list.`);
  };

  const refreshReports = () => {
    setLastUpdated(new Date().toLocaleTimeString());
    setNotice("Report list refreshed. The displayed records are sample data.");
  };

  return (
    <main style={styles.page}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 20,
          marginBottom: 25,
        }}
      >
        <div>
          <div style={{ ...styles.muted, marginBottom: 8 }}>
            <Link href="/usage" style={{ color: "inherit", textDecoration: "none" }}>
              Usage &amp; Analytics
            </Link>{" "}
            / Usage Reports
          </div>
          <h1
            style={{
              margin: "0 0 8px",
              fontSize: "clamp(26px, 3vw, 33px)",
              fontWeight: 750,
              letterSpacing: "-0.8px",
            }}
          >
            Usage Reports
          </h1>
          <p style={{ ...styles.muted, fontSize: 14, margin: 0 }}>
            Create, manage, filter, and export usage analytics reports.
          </p>
        </div>

        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <button style={styles.button} onClick={refreshReports}>
            <RefreshCw size={15} />
            Refresh
          </button>
          <button style={styles.primaryButton} onClick={() => setShowCreate(true)}>
            <Plus size={16} />
            Create report
          </button>
        </div>
      </header>

      {notice && (
        <div
          role="status"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 14px",
            marginBottom: 18,
            border: "1px solid #a7f3d0",
            background: "#ecfdf5",
            color: "#065f46",
            borderRadius: 10,
            fontSize: 13,
          }}
        >
          <CheckCircle2 size={17} />
          <span style={{ flex: 1 }}>{notice}</span>
          <button
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
            style={{ ...styles.button, minHeight: 28, padding: "0 7px" }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 15,
          marginBottom: 22,
        }}
      >
        {[
          {
            label: "Total reports",
            value: reports.length,
            description: "Reports in this workspace",
            icon: FileText,
            color: "#6366f1",
          },
          {
            label: "Ready to export",
            value: readyCount,
            description: "Available for download",
            icon: CheckCircle2,
            color: "#059669",
          },
          {
            label: "Scheduled reports",
            value: scheduledCount,
            description: "Awaiting scheduled execution",
            icon: Clock3,
            color: "#d97706",
          },
          {
            label: "Export formats",
            value: "2",
            description: "CSV and JSON",
            icon: FileSpreadsheet,
            color: "#0284c7",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} style={styles.panel}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 18,
                }}
              >
                <span style={styles.muted}>{item.label}</span>
                <Icon size={19} color={item.color} />
              </div>
              <div style={{ fontSize: 29, fontWeight: 750 }}>{item.value}</div>
              <div style={{ ...styles.muted, marginTop: 8 }}>{item.description}</div>
            </div>
          );
        })}
      </section>

      <section style={{ ...styles.panel, marginBottom: 22 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>
          Quick report templates
        </h2>
        <p style={{ ...styles.muted, margin: "0 0 17px" }}>
          Select a template to preconfigure a new report.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 12,
          }}
        >
          {[
            {
              title: "Platform Usage",
              description: "Request volume and service adoption",
              icon: BarChart3,
              color: "#6366f1",
            },
            {
              title: "AI Model Usage",
              description: "Model requests and token consumption",
              icon: Activity,
              color: "#0284c7",
            },
            {
              title: "Cost Analytics",
              description: "Cost by provider and service",
              icon: FileSpreadsheet,
              color: "#059669",
            },
            {
              title: "Revenue Analytics",
              description: "Revenue and billing summaries",
              icon: CalendarDays,
              color: "#d97706",
            },
          ].map((template) => {
            const Icon = template.icon;

            return (
              <button
                key={template.title}
                onClick={() => {
                  setReportType(template.title);
                  setReportName(template.title);
                  setShowCreate(true);
                }}
                style={{
                  ...styles.panel,
                  textAlign: "left",
                  cursor: "pointer",
                  padding: 16,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: `${template.color}15`,
                    marginBottom: 13,
                  }}
                >
                  <Icon size={19} color={template.color} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                  {template.title}
                </div>
                <div style={{ ...styles.muted, lineHeight: 1.6 }}>
                  {template.description}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section style={{ ...styles.panel, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: 20, borderBottom: "1px solid var(--border, #e5e7eb)" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 17,
            }}
          >
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 5px" }}>
                Generated reports
              </h2>
              <p style={{ ...styles.muted, margin: 0 }}>
                Last refreshed: {lastUpdated}
              </p>
            </div>
            <span style={styles.muted}>{filteredReports.length} reports</span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 10,
            }}
          >
            <div style={{ position: "relative" }}>
              <Search
                size={15}
                style={{
                  position: "absolute",
                  left: 11,
                  top: 12,
                  color: "#9ca3af",
                }}
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search reports..."
                aria-label="Search reports"
                style={{ ...styles.input, paddingLeft: 34 }}
              />
            </div>

            <div style={{ position: "relative" }}>
              <Filter
                size={15}
                style={{
                  position: "absolute",
                  left: 11,
                  top: 12,
                  color: "#9ca3af",
                  pointerEvents: "none",
                }}
              />
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                aria-label="Filter by report type"
                style={{ ...styles.input, paddingLeft: 34 }}
              >
                <option>All report types</option>
                {reportTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
              style={styles.input}
            >
              <option>All statuses</option>
              <option>Ready</option>
              <option>Scheduled</option>
              <option>Processing</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: 940,
              borderCollapse: "collapse",
              fontSize: 13,
            }}
          >
            <thead>
              <tr style={{ background: "var(--muted, #f9fafb)" }}>
                {[
                  "Report",
                  "Type",
                  "Period",
                  "Format",
                  "Created",
                  "Owner",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      textAlign: "left",
                      padding: "13px 15px",
                      color: "var(--muted-foreground, #6b7280)",
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.4px",
                      whiteSpace: "nowrap",
                      borderBottom: "1px solid var(--border, #e5e7eb)",
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr
                  key={report.id}
                  style={{ borderBottom: "1px solid var(--border, #f0f0f0)" }}
                >
                  <td style={{ padding: "15px" }}>
                    <div style={{ fontWeight: 700 }}>{report.name}</div>
                    <div style={{ ...styles.muted, marginTop: 4 }}>{report.id}</div>
                  </td>
                  <td style={{ padding: "15px", whiteSpace: "nowrap" }}>
                    {report.type}
                  </td>
                  <td style={{ padding: "15px", whiteSpace: "nowrap" }}>
                    {report.period}
                  </td>
                  <td style={{ padding: "15px" }}>{report.format}</td>
                  <td style={{ padding: "15px", whiteSpace: "nowrap" }}>
                    {report.createdAt}
                  </td>
                  <td style={{ padding: "15px", whiteSpace: "nowrap" }}>
                    {report.createdBy}
                  </td>
                  <td style={{ padding: "15px" }}>
                    <span style={statusStyle(report.status)}>
                      {report.status === "Ready" ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <Clock3 size={12} />
                      )}
                      {report.status}
                    </span>
                  </td>
                  <td style={{ padding: "15px" }}>
                    <div style={{ display: "flex", gap: 7 }}>
                      <button
                        style={{ ...styles.button, minHeight: 32, padding: "0 9px" }}
                        onClick={() => exportReport(report)}
                        title="Export report"
                        aria-label={`Export ${report.name}`}
                      >
                        <Download size={14} />
                      </button>
                      <button
                        style={{
                          ...styles.button,
                          minHeight: 32,
                          padding: "0 9px",
                          color: "#dc2626",
                        }}
                        onClick={() => removeReport(report.id)}
                        title="Delete report"
                        aria-label={`Delete ${report.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{ padding: 40, textAlign: "center", ...styles.muted }}
                  >
                    No reports match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid var(--border, #e5e7eb)",
            ...styles.muted,
          }}
        >
          Showing {filteredReports.length} of {reports.length} reports
        </div>
      </section>

      <section style={{ ...styles.panel, marginTop: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <FileSpreadsheet size={20} color="#6366f1" />
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 6px" }}>
              Reporting data
            </h3>
            <p style={{ ...styles.muted, margin: 0, lineHeight: 1.7 }}>
              This interface currently uses illustrative records and local state.
              Exported files contain sample data. Connect your reporting API and
              background job service to generate production reports.
            </p>
          </div>
        </div>
      </section>

      {showCreate && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Create usage report"
          onClick={() => setShowCreate(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(15, 23, 42, 0.48)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
          }}
        >
          <form
            onSubmit={createReport}
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(100%, 510px)",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 25,
              borderRadius: 16,
              background: "var(--background, #fff)",
              color: "var(--foreground, #111827)",
              border: "1px solid var(--border, #e5e7eb)",
              boxShadow: "0 24px 70px rgba(0,0,0,0.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 22,
              }}
            >
              <div>
                <h2 style={{ fontSize: 21, fontWeight: 750, margin: "0 0 6px" }}>
                  Create usage report
                </h2>
                <p style={{ ...styles.muted, margin: 0 }}>
                  Configure your report details.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                style={styles.button}
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "grid", gap: 17 }}>
              <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 650 }}>
                Report name
                <input
                  required
                  autoFocus
                  value={reportName}
                  onChange={(event) => setReportName(event.target.value)}
                  placeholder="Monthly AI usage"
                  style={styles.input}
                />
              </label>

              <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 650 }}>
                Report type
                <select
                  value={reportType}
                  onChange={(event) => setReportType(event.target.value)}
                  style={styles.input}
                >
                  {reportTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>

              <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 650 }}>
                Reporting period
                <select
                  value={reportPeriod}
                  onChange={(event) => setReportPeriod(event.target.value)}
                  style={styles.input}
                >
                  <option>Last 24 hours</option>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>Current month</option>
                  <option>Previous month</option>
                  <option>Current year</option>
                </select>
              </label>

              <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 650 }}>
                Export format
                <select
                  value={reportFormat}
                  onChange={(event) =>
                    setReportFormat(event.target.value as ReportFormat)
                  }
                  style={styles.input}
                >
                  <option value="CSV">CSV spreadsheet</option>
                  <option value="JSON">JSON data</option>
                </select>
              </label>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 25,
              }}
            >
              <button
                type="button"
                style={styles.button}
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
              <button type="submit" style={styles.primaryButton}>
                <Plus size={15} />
                Create report
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
