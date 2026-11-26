
"use client";

import { useMemo, useState } from "react";
import {
  FileBarChart,
  Download,
  Search,
  Plus,
  X,
  Eye,
  MoreHorizontal,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  ShieldCheck,
  CalendarDays,
  FileText,
  Filter,
  ChartColumnIncreasing,
  ChevronRight,
  Printer,
} from "lucide-react";

type ReportStatus = "Ready" | "Generating" | "Scheduled" | "Failed";
type ReportType =
  | "Compliance Overview"
  | "Control Effectiveness"
  | "Risk Assessment"
  | "Audit Summary"
  | "Evidence Status"
  | "Privacy Compliance"
  | "AI Governance";

type ComplianceReport = {
  id: string;
  name: string;
  type: ReportType;
  framework: string;
  owner: string;
  period: string;
  createdAt: string;
  nextRun: string;
  status: ReportStatus;
  coverage: number;
  findings: number;
  description: string;
};

const initialReports: ComplianceReport[] = [
  {
    id: "RPT-001",
    name: "Monthly Compliance Overview",
    type: "Compliance Overview",
    framework: "All frameworks",
    owner: "Compliance Team",
    period: "October 2026",
    createdAt: "2026-10-31",
    nextRun: "2026-11-30",
    status: "Ready",
    coverage: 92,
    findings: 4,
    description:
      "Executive overview of compliance posture, framework coverage, outstanding actions, and open findings.",
  },
  {
    id: "RPT-002",
    name: "Security Control Effectiveness",
    type: "Control Effectiveness",
    framework: "ISO 27001",
    owner: "Security Team",
    period: "Q4 2026",
    createdAt: "2026-10-28",
    nextRun: "2026-12-31",
    status: "Ready",
    coverage: 87,
    findings: 7,
    description:
      "Summary of control implementation, evidence availability, testing status, and control gaps.",
  },
  {
    id: "RPT-003",
    name: "Quarterly Risk Assessment",
    type: "Risk Assessment",
    framework: "Enterprise Risk",
    owner: "Risk Management",
    period: "Q4 2026",
    createdAt: "2026-10-25",
    nextRun: "2026-12-31",
    status: "Generating",
    coverage: 78,
    findings: 9,
    description:
      "Risk register summary covering severity, ownership, treatment plans, and unresolved risks.",
  },
  {
    id: "RPT-004",
    name: "Internal Audit Summary",
    type: "Audit Summary",
    framework: "SOC 2",
    owner: "Internal Audit",
    period: "October 2026",
    createdAt: "2026-10-22",
    nextRun: "2026-11-22",
    status: "Ready",
    coverage: 95,
    findings: 3,
    description:
      "Audit scope, audit activities, findings, corrective actions, and follow-up status.",
  },
  {
    id: "RPT-005",
    name: "Evidence Collection Status",
    type: "Evidence Status",
    framework: "All frameworks",
    owner: "Compliance Operations",
    period: "October 2026",
    createdAt: "2026-10-20",
    nextRun: "2026-11-20",
    status: "Scheduled",
    coverage: 68,
    findings: 12,
    description:
      "Evidence collection progress, missing documents, expiring evidence, and responsible owners.",
  },
  {
    id: "RPT-006",
    name: "Privacy Compliance Review",
    type: "Privacy Compliance",
    framework: "GDPR",
    owner: "Privacy Team",
    period: "Q4 2026",
    createdAt: "2026-10-18",
    nextRun: "2026-12-18",
    status: "Ready",
    coverage: 89,
    findings: 5,
    description:
      "Privacy request handling, data retention, consent records, and privacy control status.",
  },
  {
    id: "RPT-007",
    name: "AI Governance Readiness",
    type: "AI Governance",
    framework: "EU AI Act / NIST AI RMF",
    owner: "AI Governance",
    period: "October 2026",
    createdAt: "2026-10-15",
    nextRun: "2026-11-15",
    status: "Failed",
    coverage: 73,
    findings: 8,
    description:
      "AI inventory, risk classifications, oversight controls, model documentation, and open governance actions.",
  },
];

const reportTypes: ReportType[] = [
  "Compliance Overview",
  "Control Effectiveness",
  "Risk Assessment",
  "Audit Summary",
  "Evidence Status",
  "Privacy Compliance",
  "AI Governance",
];

const statusOptions: ReportStatus[] = [
  "Ready",
  "Generating",
  "Scheduled",
  "Failed",
];

const statusClass: Record<ReportStatus, string> = {
  Ready: "ready",
  Generating: "generating",
  Scheduled: "scheduled",
  Failed: "failed",
};

export default function ComplianceReportsPage() {
  const [reports, setReports] =
    useState<ComplianceReport[]>(initialReports);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [frameworkFilter, setFrameworkFilter] = useState("All");
  const [activeTab, setActiveTab] = useState<
    "all" | "ready" | "scheduled"
  >("all");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<ComplianceReport | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    name: "",
    type: "Compliance Overview" as ReportType,
    framework: "All frameworks",
    owner: "",
    period: "November 2026",
    nextRun: "",
    description: "",
  });

  const frameworks = Array.from(
    new Set(reports.map((report) => report.framework))
  );

  const filteredReports = useMemo(() => {
    const query = search.toLowerCase();

    return reports.filter((report) => {
      const matchesSearch = [
        report.id,
        report.name,
        report.type,
        report.framework,
        report.owner,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);

      const matchesStatus =
        statusFilter === "All" || report.status === statusFilter;
      const matchesType =
        typeFilter === "All" || report.type === typeFilter;
      const matchesFramework =
        frameworkFilter === "All" ||
        report.framework === frameworkFilter;

      const matchesTab =
        activeTab === "all" ||
        (activeTab === "ready" && report.status === "Ready") ||
        (activeTab === "scheduled" &&
          (report.status === "Scheduled" ||
            report.status === "Generating"));

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesFramework &&
        matchesTab
      );
    });
  }, [
    reports,
    search,
    statusFilter,
    typeFilter,
    frameworkFilter,
    activeTab,
  ]);

  const readyCount = reports.filter(
    (report) => report.status === "Ready"
  ).length;

  const scheduledCount = reports.filter(
    (report) =>
      report.status === "Scheduled" || report.status === "Generating"
  ).length;

  const failedCount = reports.filter(
    (report) => report.status === "Failed"
  ).length;

  const averageCoverage = reports.length
    ? Math.round(
        reports.reduce((sum, report) => sum + report.coverage, 0) /
          reports.length
      )
    : 0;

  function addReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const report: ComplianceReport = {
      id: `RPT-${String(Date.now()).slice(-5)}`,
      name: form.name.trim(),
      type: form.type,
      framework: form.framework,
      owner: form.owner.trim() || "Unassigned",
      period: form.period,
      createdAt: new Date().toISOString().slice(0, 10),
      nextRun: form.nextRun,
      status: form.nextRun ? "Scheduled" : "Generating",
      coverage: 0,
      findings: 0,
      description: form.description.trim(),
    };

    setReports((current) => [report, ...current]);
    setShowForm(false);
    setForm({
      name: "",
      type: "Compliance Overview",
      framework: "All frameworks",
      owner: "",
      period: "November 2026",
      nextRun: "",
      description: "",
    });
    setNotice(
      "Report configuration added. Generation is currently simulated."
    );
  }

  function updateStatus(id: string, status: ReportStatus) {
    setReports((current) =>
      current.map((report) =>
        report.id === id ? { ...report, status } : report
      )
    );
    setSelected((current) =>
      current?.id === id ? { ...current, status } : current
    );
    setMenuId(null);
    setNotice(`Report status changed to ${status}.`);
  }

  function deleteReport(id: string) {
    setReports((current) =>
      current.filter((report) => report.id !== id)
    );
    setSelected(null);
    setMenuId(null);
    setNotice("Report removed from the local report list.");
  }

  function exportCSV() {
    const headers = [
      "Report ID",
      "Report Name",
      "Type",
      "Framework",
      "Owner",
      "Period",
      "Created Date",
      "Next Run",
      "Status",
      "Coverage %",
      "Findings",
      "Description",
    ];

    const rows = filteredReports.map((report) => [
      report.id,
      report.name,
      report.type,
      report.framework,
      report.owner,
      report.period,
      report.createdAt,
      report.nextRun,
      report.status,
      report.coverage,
      report.findings,
      report.description,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-compliance-reports.csv";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Compliance report list exported as CSV.");
  }

  function exportReport(report: ComplianceReport) {
    const content = [
      "MODELNOW — COMPLIANCE REPORT",
      "================================",
      `Report ID: ${report.id}`,
      `Name: ${report.name}`,
      `Type: ${report.type}`,
      `Framework: ${report.framework}`,
      `Owner: ${report.owner}`,
      `Reporting period: ${report.period}`,
      `Created: ${report.createdAt}`,
      `Status: ${report.status}`,
      `Coverage: ${report.coverage}%`,
      `Findings: ${report.findings}`,
      "",
      "Description",
      report.description,
      "",
      "NOTE: This file contains the current report configuration and sample metrics.",
      "It is not a generated audit opinion or certified compliance report.",
    ].join("\n");

    const url = URL.createObjectURL(
      new Blob([content], { type: "text/plain;charset=utf-8;" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.id.toLowerCase()}-summary.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Report summary exported as a text file.");
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("All");
    setTypeFilter("All");
    setFrameworkFilter("All");
  }

  return (
    <main className="reports-page">
      <header className="page-header">
        <div>
          <div className="breadcrumb">
            Admin <span>/</span> Compliance <span>/</span> Compliance Reports
          </div>
          <h1>Compliance Reports</h1>
          <p>
            Prepare compliance summaries, monitor report readiness, and
            organize reporting across frameworks and teams.
          </p>
        </div>

        <div className="header-actions">
          <button className="secondary-button" onClick={exportCSV}>
            <Download size={16} /> Export CSV
          </button>
          <button
            className="primary-button"
            onClick={() => setShowForm(true)}
          >
            <Plus size={17} /> Create Report
          </button>
        </div>
      </header>

      {notice && (
        <div className="notice">
          <CheckCircle2 size={17} />
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss notice">
            <X size={16} />
          </button>
        </div>
      )}

      <section className="stats-grid">
        <StatCard
          icon={<FileBarChart size={20} />}
          label="Total Reports"
          value={reports.length}
          note="Report configurations"
          color="blue"
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="Ready to Review"
          value={readyCount}
          note="Marked ready in this workspace"
          color="green"
        />
        <StatCard
          icon={<Clock3 size={20} />}
          label="Scheduled / Running"
          value={scheduledCount}
          note="Configured or simulated runs"
          color="amber"
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          label="Needs Attention"
          value={failedCount}
          note="Failed status records"
          color="red"
        />
      </section>

      <section className="insight-grid">
        <article className="insight-card">
          <div className="insight-top">
            <span className="insight-icon blue">
              <ChartColumnIncreasing size={19} />
            </span>
            <span className="insight-label">Average recorded coverage</span>
          </div>
          <div className="insight-value">{averageCoverage}%</div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${averageCoverage}%` }}
            />
          </div>
          <p>Average of the sample coverage values across listed reports.</p>
        </article>

        <article className="insight-card">
          <div className="insight-top">
            <span className="insight-icon green">
              <ShieldCheck size={19} />
            </span>
            <span className="insight-label">Reporting coverage</span>
          </div>
          <div className="insight-value">{frameworks.length} frameworks</div>
          <p>
            Frameworks represented in the current report register. A framework
            may appear in multiple reports.
          </p>
        </article>

        <article className="insight-card">
          <div className="insight-top">
            <span className="insight-icon amber">
              <CalendarDays size={19} />
            </span>
            <span className="insight-label">Upcoming report runs</span>
          </div>
          <div className="insight-value">{scheduledCount}</div>
          <p>
            Reports marked scheduled or generating. Automated execution is not
            connected yet.
          </p>
        </article>
      </section>

      <nav className="tabs">
        <Tab
          active={activeTab === "all"}
          onClick={() => setActiveTab("all")}
          label="All Reports"
          count={reports.length}
        />
        <Tab
          active={activeTab === "ready"}
          onClick={() => setActiveTab("ready")}
          label="Ready"
          count={readyCount}
        />
        <Tab
          active={activeTab === "scheduled"}
          onClick={() => setActiveTab("scheduled")}
          label="Scheduled / Running"
          count={scheduledCount}
        />
      </nav>

      <section className="content-card">
        <div className="section-heading">
          <div>
            <h2>Report Registry</h2>
            <p>Search and manage compliance report configurations.</p>
          </div>
          <span className="record-count">
            {filteredReports.length} records
          </span>
        </div>

        <div className="filters">
          <div className="search-box">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search reports, owners, frameworks..."
            />
          </div>

          <div className="filter-box">
            <Filter size={15} />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>All</option>
              {statusOptions.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>

          <select
            className="filter-select"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <option>All</option>
            {reportTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={frameworkFilter}
            onChange={(event) => setFrameworkFilter(event.target.value)}
          >
            <option>All</option>
            {frameworks.map((framework) => (
              <option key={framework}>{framework}</option>
            ))}
          </select>

          <button className="clear-button" onClick={clearFilters}>
            Clear
          </button>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Report</th>
                <th>Type / Framework</th>
                <th>Owner</th>
                <th>Period</th>
                <th>Coverage</th>
                <th>Findings</th>
                <th>Status</th>
                <th>Created</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <button
                      className="report-name"
                      onClick={() => setSelected(report)}
                    >
                      <span className="report-icon">
                        <FileText size={18} />
                      </span>
                      <span>
                        <strong>{report.name}</strong>
                        <small>{report.id}</small>
                      </span>
                    </button>
                  </td>
                  <td className="type-cell">
                    <strong>{report.type}</strong>
                    <small>{report.framework}</small>
                  </td>
                  <td>{report.owner}</td>
                  <td>{report.period}</td>
                  <td>
                    <div className="coverage-cell">
                      <strong>{report.coverage}%</strong>
                      <div className="mini-progress">
                        <div
                          style={{ width: `${report.coverage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`findings-badge ${
                        report.findings > 6 ? "findings-high" : ""
                      }`}
                    >
                      {report.findings}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${statusClass[report.status]}`}>
                      <span className="status-dot" />
                      {report.status}
                    </span>
                  </td>
                  <td>{report.createdAt}</td>
                  <td className="actions-cell">
                    <button
                      className="icon-button"
                      aria-label="Report actions"
                      onClick={() =>
                        setMenuId(menuId === report.id ? null : report.id)
                      }
                    >
                      <MoreHorizontal size={19} />
                    </button>

                    {menuId === report.id && (
                      <div className="row-menu">
                        <button
                          onClick={() => {
                            setSelected(report);
                            setMenuId(null);
                          }}
                        >
                          <Eye size={15} /> View details
                        </button>
                        <button
                          onClick={() => {
                            exportReport(report);
                            setMenuId(null);
                          }}
                        >
                          <Download size={15} /> Export summary
                        </button>
                        {statusOptions
                          .filter((status) => status !== report.status)
                          .map((status) => (
                            <button
                              key={status}
                              onClick={() => updateStatus(report.id, status)}
                            >
                              <RefreshCw size={15} /> Mark {status}
                            </button>
                          ))}
                        <button
                          className="delete-action"
                          onClick={() => deleteReport(report.id)}
                        >
                          <Trash2 size={15} /> Delete report
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={9} className="empty-state">
                    No reports match your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>
            Showing {filteredReports.length} of {reports.length} reports
          </span>
          <span>ModelNow Compliance Reporting</span>
        </div>
      </section>

      <section className="bottom-grid">
        <InfoCard
          icon={<ShieldCheck size={20} />}
          title="Executive reporting"
          description="Provide leadership with a concise view of compliance posture, key risks, open findings, and ownership."
          color="blue-bg"
        />
        <InfoCard
          icon={<FileText size={20} />}
          title="Audit-ready evidence"
          description="Reports should reference approved evidence and traceable control tests before being used for audits."
          color="green-bg"
        />
        <InfoCard
          icon={<CalendarDays size={20} />}
          title="Scheduled delivery"
          description="Connect a background job and notification service to generate and deliver reports automatically."
          color="amber-bg"
        />
      </section>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowForm(false);
          }}
        >
          <section className="modal">
            <div className="modal-heading">
              <div>
                <h2>Create Compliance Report</h2>
                <p>Configure a new report for your compliance workspace.</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addReport}>
              <label>
                Report name *
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="e.g. Monthly Compliance Overview"
                />
              </label>

              <div className="form-row">
                <label>
                  Report type *
                  <select
                    value={form.type}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        type: event.target.value as ReportType,
                      })
                    }
                  >
                    {reportTypes.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Framework
                  <select
                    value={form.framework}
                    onChange={(event) =>
                      setForm({ ...form, framework: event.target.value })
                    }
                  >
                    <option>All frameworks</option>
                    <option>ISO 27001</option>
                    <option>SOC 2</option>
                    <option>GDPR</option>
                    <option>EU AI Act</option>
                    <option>Enterprise Risk</option>
                    <option>Internal</option>
                  </select>
                </label>
              </div>

              <div className="form-row">
                <label>
                  Reporting period *
                  <input
                    required
                    value={form.period}
                    onChange={(event) =>
                      setForm({ ...form, period: event.target.value })
                    }
                    placeholder="e.g. November 2026"
                  />
                </label>

                <label>
                  Owner
                  <input
                    value={form.owner}
                    onChange={(event) =>
                      setForm({ ...form, owner: event.target.value })
                    }
                    placeholder="Team or role"
                  />
                </label>
              </div>

              <label>
                Next scheduled run
                <input
                  type="date"
                  value={form.nextRun}
                  onChange={(event) =>
                    setForm({ ...form, nextRun: event.target.value })
                  }
                />
              </label>

              <label>
                Report description
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="What should this report cover?"
                />
              </label>

              <div className="form-note">
                <AlertTriangle size={16} />
                Creating a report adds a local configuration. It does not run
                a real compliance analysis or create a certified report.
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  <Plus size={16} /> Create Report
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selected && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <section className="modal detail-modal">
            <div className="modal-heading">
              <div>
                <span className="eyebrow">{selected.id}</span>
                <h2>{selected.name}</h2>
                <p>{selected.type} · {selected.framework}</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setSelected(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="detail-status">
              <span className={`status-badge ${statusClass[selected.status]}`}>
                <span className="status-dot" />
                {selected.status}
              </span>
              <span className="record-count">{selected.period}</span>
            </div>

            <p className="detail-description">
              {selected.description || "No report description recorded."}
            </p>

            <div className="detail-grid">
              <Detail label="Report owner" value={selected.owner} />
              <Detail label="Created on" value={selected.createdAt} />
              <Detail label="Next scheduled run" value={selected.nextRun || "Not scheduled"} />
              <Detail label="Recorded coverage" value={`${selected.coverage}%`} />
              <Detail label="Recorded findings" value={String(selected.findings)} />
              <Detail label="Report type" value={selected.type} />
            </div>

            <div className="coverage-detail">
              <div className="coverage-heading">
                <strong>Recorded coverage</strong>
                <span>{selected.coverage}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${selected.coverage}%` }}
                />
              </div>
            </div>

            <div className="form-note">
              <AlertTriangle size={16} />
              This detail view reflects local sample data and report
              configuration, not a verified compliance assessment.
            </div>

            <div className="modal-footer">
              <button
                className="secondary-button"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
              <button
                className="primary-button"
                onClick={() => exportReport(selected)}
              >
                <Download size={16} /> Export Summary
              </button>
              <button
                className="secondary-button"
                onClick={() => {
                  setSelected(null);
                  setNotice("Use your browser print dialog to print this page.");
                  window.print();
                }}
              >
                <Printer size={16} /> Print
              </button>
              <label className="status-editor">
                Status
                <select
                  value={selected.status}
                  onChange={(event) =>
                    updateStatus(
                      selected.id,
                      event.target.value as ReportStatus
                    )
                  }
                >
                  {statusOptions.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
            </div>
          </section>
        </div>
      )}

      <style jsx>{`
        .reports-page {
          --text: #172033;
          --muted: #687386;
          --line: #e6eaf0;
          min-height: 100vh;
          padding: 30px;
          color: var(--text);
          background: #f7f9fc;
          font-family: Arial, Helvetica, sans-serif;
        }

        .page-header,
        .header-actions,
        .section-heading,
        .filters,
        .table-footer,
        .modal-heading,
        .modal-footer,
        .insight-top,
        .coverage-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .page-header {
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .breadcrumb {
          margin-bottom: 12px;
          color: var(--muted);
          font-size: 12px;
        }

        .breadcrumb span {
          margin: 0 7px;
          color: #a4adba;
        }

        h1 {
          margin: 0;
          font-size: 28px;
          letter-spacing: -0.7px;
        }

        .page-header p,
        .section-heading p,
        .modal-heading p {
          margin: 8px 0 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.6;
        }

        button,
        input,
        select,
        textarea {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .primary-button,
        .secondary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 39px;
          padding: 0 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .primary-button {
          color: white;
          background: #2459d3;
          border: 1px solid #2459d3;
        }

        .primary-button:hover {
          background: #1948b7;
        }

        .secondary-button {
          color: #354154;
          background: white;
          border: 1px solid #dce2ea;
        }

        .secondary-button:hover {
          background: #f5f7fa;
        }

        .notice {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
          padding: 12px 14px;
          color: #166534;
          background: #f0fdf4;
          border: 1px solid #bce7cc;
          border-radius: 9px;
          font-size: 12px;
        }

        .notice span {
          flex: 1;
        }

        .notice button {
          display: flex;
          color: inherit;
          background: transparent;
          border: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        }

        .stat-card {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          padding: 19px;
          background: white;
          border: 1px solid var(--line);
          border-radius: 12px;
        }

        .stat-icon,
        .insight-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          border-radius: 9px;
        }

        .blue {
          color: #2856c7;
          background: #edf3ff;
        }

        .green {
          color: #16814a;
          background: #e9f9ef;
        }

        .amber {
          color: #ad6b0b;
          background: #fff6e5;
        }

        .red {
          color: #c34242;
          background: #fff0f0;
        }

        .stat-label {
          margin: 2px 0 8px;
          color: var(--muted);
          font-size: 12px;
        }

        .stat-value {
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.7px;
        }

        .stat-note {
          margin-top: 7px;
          color: #8a94a4;
          font-size: 11px;
        }

        .insight-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 22px;
        }

        .insight-card {
          padding: 18px;
          background: white;
          border: 1px solid var(--line);
          border-radius: 11px;
        }

        .insight-top {
          justify-content: flex-start;
          color: #687386;
          font-size: 11px;
        }

        .insight-icon {
          width: 37px;
          height: 37px;
        }

        .insight-value {
          margin: 15px 0 12px;
          color: #172033;
          font-size: 24px;
          font-weight: 700;
        }

        .insight-card p {
          margin: 10px 0 0;
          color: #8791a1;
          font-size: 10px;
          line-height: 1.7;
        }

        .progress-track {
          height: 6px;
          overflow: hidden;
          background: #e9edf4;
          border-radius: 99px;
        }

        .progress-fill {
          height: 100%;
          background: #3567df;
          border-radius: inherit;
          transition: width 0.2s ease;
        }

        .tabs {
          display: flex;
          gap: 7px;
          margin-bottom: 16px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .content-card {
          min-width: 0;
          background: white;
          border: 1px solid var(--line);
          border-radius: 12px;
        }

        .section-heading {
          padding: 21px 22px;
        }

        .section-heading h2,
        .modal-heading h2 {
          margin: 0;
          font-size: 16px;
        }

        .record-count {
          padding: 6px 9px;
          color: #596579;
          border: 1px solid var(--line);
          border-radius: 7px;
          font-size: 11px;
          white-space: nowrap;
        }

        .filters {
          justify-content: flex-start;
          flex-wrap: wrap;
          padding: 0 22px 19px;
        }

        .search-box,
        .filter-box {
          display: flex;
          align-items: center;
          gap: 9px;
          min-height: 38px;
          padding: 0 11px;
          color: #758196;
          background: white;
          border: 1px solid #dfe5ed;
          border-radius: 8px;
        }

        .search-box {
          flex: 1;
          min-width: 220px;
        }

        .search-box input {
          width: 100%;
          min-width: 0;
          color: var(--text);
          background: transparent;
          border: 0;
          outline: 0;
          font-size: 12px;
        }

        .filter-box select,
        .filter-select {
          color: #435066;
          background: white;
          border: 0;
          outline: 0;
          font-size: 12px;
        }

        .filter-select {
          min-height: 38px;
          padding: 0 12px;
          border: 1px solid #dfe5ed;
          border-radius: 8px;
        }

        .clear-button {
          min-height: 36px;
          padding: 0 10px;
          color: #596579;
          background: #f7f9fc;
          border: 1px solid #dfe5ed;
          border-radius: 7px;
          font-size: 11px;
        }

        .table-scroll {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          white-space: nowrap;
        }

        th {
          padding: 12px 14px;
          color: #758196;
          background: #f8fafc;
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.45px;
        }

        th:first-child,
        td:first-child {
          padding-left: 22px;
        }

        td {
          position: relative;
          padding: 14px;
          color: #475467;
          border-bottom: 1px solid #edf0f4;
          font-size: 11px;
        }

        tbody tr:last-child td {
          border-bottom: 0;
        }

        tbody tr:hover {
          background: #fbfcfe;
        }

        .report-name {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0;
          color: inherit;
          text-align: left;
          background: transparent;
          border: 0;
        }

        .report-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          color: #3764c9;
          background: #edf3ff;
          border-radius: 9px;
        }

        .report-name strong {
          display: block;
          max-width: 220px;
          overflow: hidden;
          color: #263248;
          font-size: 11px;
          font-weight: 600;
          text-overflow: ellipsis;
        }

        .report-name small,
        .type-cell small {
          display: block;
          margin-top: 5px;
          color: #8b95a5;
          font-size: 10px;
        }

        .type-cell strong {
          color: #344054;
          font-size: 11px;
          font-weight: 500;
        }

        .coverage-cell strong {
          display: block;
          margin-bottom: 6px;
          color: #344054;
          font-size: 11px;
        }

        .mini-progress {
          width: 70px;
          height: 4px;
          overflow: hidden;
          background: #e9edf4;
          border-radius: 99px;
        }

        .mini-progress div {
          height: 100%;
          background: #3567df;
          border-radius: inherit;
        }

        .findings-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 27px;
          padding: 5px 7px;
          color: #475467;
          background: #f0f2f6;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
        }

        .findings-high {
          color: #b45309;
          background: #fff0df;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 600;
        }

        .ready {
          color: #16814a;
          background: #e9f9ef;
        }

        .generating {
          color: #2856c7;
          background: #edf3ff;
        }

        .scheduled {
          color: #8c650d;
          background: #fff6df;
        }

        .failed {
          color: #bf3c3c;
          background: #fff0f0;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          background: currentColor;
          border-radius: 50%;
        }

        .actions-cell {
          text-align: right;
        }

        .icon-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 33px;
          height: 33px;
          color: #667085;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 7px;
        }

        .icon-button:hover {
          background: #f7f9fc;
          border-color: var(--line);
        }

        .row-menu {
          position: absolute;
          z-index: 10;
          top: 47px;
          right: 12px;
          width: 190px;
          max-height: 300px;
          overflow-y: auto;
          padding: 5px;
          background: white;
          border: 1px solid var(--line);
          border-radius: 9px;
          box-shadow: 0 10px 30px #17203318;
        }

        .row-menu button {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 9px;
          color: #475467;
          text-align: left;
          background: white;
          border: 0;
          border-radius: 6px;
          font-size: 11px;
        }

        .row-menu button:hover {
          background: #f4f6fa;
        }

        .row-menu .delete-action {
          color: #c34242;
          border-top: 1px solid #edf0f4;
        }

        .empty-state {
          padding: 40px 20px;
          color: #8791a1;
          text-align: center;
        }

        .table-footer {
          padding: 14px 22px;
          color: #8791a1;
          border-top: 1px solid var(--line);
          font-size: 10px;
        }

        .bottom-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-top: 20px;
        }

        .info-card {
          padding: 20px;
        }

        .info-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 39px;
          height: 39px;
          margin-bottom: 15px;
          border-radius: 9px;
        }

        .blue-bg {
          color: #2856c7;
          background: #edf3ff;
        }

        .amber-bg {
          color: #ad6b0b;
          background: #fff6e5;
        }

        .green-bg {
          color: #16814a;
          background: #e9f9ef;
        }

        .info-card h3 {
          margin: 0 0 8px;
          font-size: 13px;
        }

        .info-card p {
          margin: 0;
          color: var(--muted);
          font-size: 11px;
          line-height: 1.7;
        }

        .modal-backdrop {
          position: fixed;
          z-index: 100;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow-y: auto;
          padding: 20px;
          background: #10182875;
        }

        .modal {
          width: 100%;
          max-width: 620px;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          padding: 24px;
          background: white;
          border-radius: 14px;
          box-shadow: 0 20px 70px #10182830;
        }

        .modal-heading {
          align-items: flex-start;
          margin-bottom: 22px;
        }

        .modal form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .modal label:not(.status-editor) {
          display: flex;
          flex-direction: column;
          gap: 7px;
          color: #344054;
          font-size: 11px;
          font-weight: 600;
        }

        .modal label input,
        .modal label select,
        .modal label textarea {
          box-sizing: border-box;
          width: 100%;
          padding: 11px 12px;
          color: #263248;
          background: white;
          border: 1px solid #dce2ea;
          border-radius: 8px;
          outline: none;
          font-size: 12px;
        }

        .modal label input:focus,
        .modal label select:focus,
        .modal label textarea:focus {
          border-color: #4778e8;
          box-shadow: 0 0 0 3px #4778e81a;
        }

        .modal label textarea {
          resize: vertical;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 13px;
        }

        .form-note {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px;
          color: #8b620f;
          background: #fff9e9;
          border: 1px solid #f5e4b4;
          border-radius: 8px;
          font-size: 11px;
          line-height: 1.7;
        }

        .form-note svg {
          flex-shrink: 0;
        }

        .modal-footer {
          justify-content: flex-end;
          flex-wrap: wrap;
          margin-top: 8px;
          padding-top: 17px;
          border-top: 1px solid var(--line);
        }

        .detail-status {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 16px;
        }

        .detail-description {
          color: #687386;
          font-size: 12px;
          line-height: 1.7;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 16px;
        }

        .detail-item {
          min-width: 0;
          padding: 13px;
          border: 1px solid var(--line);
          border-radius: 8px;
        }

        .detail-item span {
          display: block;
          margin-bottom: 7px;
          color: #8791a1;
          font-size: 10px;
        }

        .detail-item strong {
          display: block;
          overflow-wrap: anywhere;
          color: #344054;
          font-size: 12px;
        }

        .coverage-detail {
          margin-top: 17px;
          padding: 15px;
          border: 1px solid var(--line);
          border-radius: 9px;
        }

        .coverage-heading {
          margin-bottom: 10px;
          font-size: 11px;
        }

        .coverage-heading span {
          color: #2856c7;
          font-weight: 700;
        }

        .eyebrow {
          display: block;
          margin-bottom: 8px;
          color: #2459d3;
          font-size: 10px;
          font-weight: 700;
        }

        .status-editor {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #687386;
          font-size: 11px;
        }

        .status-editor select {
          padding: 8px;
          color: #344054;
          background: white;
          border: 1px solid #dce2ea;
          border-radius: 7px;
          font-size: 11px;
        }

        @media (max-width: 1100px) {
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .insight-grid,
          .bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 750px) {
          .reports-page {
            padding: 17px;
          }

          .page-header {
            flex-direction: column;
          }

          .header-actions {
            width: 100%;
            flex-wrap: wrap;
          }

          .stats-grid {
            gap: 9px;
          }

          .stat-card {
            gap: 9px;
            padding: 13px;
          }

          .stat-icon {
            width: 34px;
            height: 34px;
          }

          .stat-value {
            font-size: 22px;
          }

          .section-heading {
            align-items: flex-start;
            padding: 17px;
          }

          .filters {
            padding: 0 17px 17px;
          }

          .search-box {
            flex-basis: 100%;
          }

          .table-footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .form-row,
          .detail-grid {
            grid-template-columns: 1fr;
          }

          .modal {
            padding: 18px;
          }
        }

        @media print {
          .header-actions,
          .tabs,
          .filters,
          .actions-cell,
          .bottom-grid {
            display: none !important;
          }

          .reports-page {
            padding: 0;
            background: white;
          }
        }
      `}</style>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  note,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  note: string;
  color: string;
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-note">{note}</div>
      </div>
      <style jsx>{`
        .stat-card {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          padding: 19px;
          background: white;
          border: 1px solid #e6eaf0;
          border-radius: 12px;
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          border-radius: 9px;
        }

        .blue {
          color: #2856c7;
          background: #edf3ff;
        }

        .green {
          color: #16814a;
          background: #e9f9ef;
        }

        .amber {
          color: #ad6b0b;
          background: #fff6e5;
        }

        .red {
          color: #c34242;
          background: #fff0f0;
        }

        .stat-label {
          margin: 2px 0 8px;
          color: #687386;
          font-size: 12px;
        }

        .stat-value {
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.7px;
        }

        .stat-note {
          margin-top: 7px;
          color: #8a94a4;
          font-size: 11px;
        }

        @media (max-width: 750px) {
          .stat-card {
            gap: 9px;
            padding: 13px;
          }

          .stat-icon {
            width: 34px;
            height: 34px;
          }

          .stat-value {
            font-size: 22px;
          }
        }
      `}</style>
    </div>
  );
}

function Tab({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button className={`tab-button ${active ? "active" : ""}`} onClick={onClick}>
      {label}
      {count !== undefined && <span>{count}</span>}
      <style jsx>{`
        .tab-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 41px;
          padding: 0 13px;
          color: #667085;
          background: white;
          border: 1px solid #e6eaf0;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
        }

        .tab-button.active {
          color: #2459d3;
          background: #edf3ff;
          border-color: #bfd0ff;
        }

        .tab-button span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 21px;
          height: 21px;
          padding: 0 5px;
          color: #687386;
          background: #f0f2f6;
          border-radius: 5px;
          font-size: 10px;
        }
      `}</style>
    </button>
  );
}

function InfoCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="content-card info-card">
      <span className={`info-icon ${color}`}>{icon}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <style jsx>{`
        .info-card {
          padding: 20px;
          background: white;
          border: 1px solid #e6eaf0;
          border-radius: 12px;
        }

        .info-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 39px;
          height: 39px;
          margin-bottom: 15px;
          border-radius: 9px;
        }

        .blue-bg {
          color: #2856c7;
          background: #edf3ff;
        }

        .amber-bg {
          color: #ad6b0b;
          background: #fff6e5;
        }

        .green-bg {
          color: #16814a;
          background: #e9f9ef;
        }

        h3 {
          margin: 0 0 8px;
          font-size: 13px;
        }

        p {
          margin: 0;
          color: #687386;
          font-size: 11px;
          line-height: 1.7;
        }
      `}</style>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value || "Not set"}</strong>
      <style jsx>{`
        .detail-item {
          min-width: 0;
          padding: 13px;
          border: 1px solid #e6eaf0;
          border-radius: 8px;
        }

        span {
          display: block;
          margin-bottom: 7px;
          color: #8791a1;
          font-size: 10px;
        }

        strong {
          display: block;
          overflow-wrap: anywhere;
          color: #344054;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
