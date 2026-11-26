
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  ClipboardCheck,
  CalendarDays,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  MoreHorizontal,
  Eye,
  Trash2,
  X,
  Download,
  Filter,
  ShieldCheck,
  FileText,
  Users,
  ArrowUpRight,
} from "lucide-react";

type AuditStatus =
  | "Planned"
  | "In Progress"
  | "Under Review"
  | "Completed"
  | "Overdue";

type Audit = {
  id: string;
  title: string;
  framework: string;
  auditor: string;
  department: string;
  startDate: string;
  dueDate: string;
  status: AuditStatus;
  scope: string;
  findings: number;
};

const initialAudits: Audit[] = [
  {
    id: "AUD-2026-001",
    title: "SOC 2 Type II Internal Audit",
    framework: "SOC 2",
    auditor: "Security Team",
    department: "Engineering",
    startDate: "2026-10-15",
    dueDate: "2026-11-15",
    status: "In Progress",
    scope: "Access control, change management, logging, and incident response.",
    findings: 3,
  },
  {
    id: "AUD-2026-002",
    title: "ISO 27001 Control Review",
    framework: "ISO 27001",
    auditor: "Compliance Team",
    department: "Security",
    startDate: "2026-10-20",
    dueDate: "2026-11-20",
    status: "Planned",
    scope: "Review of information security management system controls.",
    findings: 0,
  },
  {
    id: "AUD-2026-003",
    title: "GDPR Privacy Compliance Audit",
    framework: "GDPR",
    auditor: "Privacy Team",
    department: "Legal",
    startDate: "2026-10-01",
    dueDate: "2026-10-30",
    status: "Overdue",
    scope: "Data processing, retention, consent, and data subject rights.",
    findings: 4,
  },
  {
    id: "AUD-2026-004",
    title: "Vendor Risk Assessment Audit",
    framework: "SOC 2",
    auditor: "Risk Management",
    department: "Procurement",
    startDate: "2026-10-25",
    dueDate: "2026-11-10",
    status: "Under Review",
    scope: "Third-party security reviews and vendor risk documentation.",
    findings: 2,
  },
  {
    id: "AUD-2026-005",
    title: "Access Governance Review",
    framework: "ISO 27001",
    auditor: "IT Operations",
    department: "IT",
    startDate: "2026-09-01",
    dueDate: "2026-09-25",
    status: "Completed",
    scope: "User access approvals, privileged accounts, and access removal.",
    findings: 1,
  },
];

const statusClass: Record<AuditStatus, string> = {
  Planned: "planned",
  "In Progress": "progress",
  "Under Review": "review",
  Completed: "completed",
  Overdue: "overdue",
};

export default function AuditManagementPage() {
  const [audits, setAudits] = useState<Audit[]>(initialAudits);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [frameworkFilter, setFrameworkFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Audit | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    title: "",
    framework: "SOC 2",
    auditor: "",
    department: "Security",
    startDate: "",
    dueDate: "",
    scope: "",
  });

  const filtered = useMemo(() => {
    return audits.filter((audit) => {
      const text = [
        audit.id,
        audit.title,
        audit.framework,
        audit.auditor,
        audit.department,
      ]
        .join(" ")
        .toLowerCase();

      return (
        text.includes(search.toLowerCase()) &&
        (statusFilter === "All" || audit.status === statusFilter) &&
        (frameworkFilter === "All" ||
          audit.framework === frameworkFilter)
      );
    });
  }, [audits, search, statusFilter, frameworkFilter]);

  const inProgress = audits.filter(
    (audit) => audit.status === "In Progress"
  ).length;

  const completed = audits.filter(
    (audit) => audit.status === "Completed"
  ).length;

  const overdue = audits.filter(
    (audit) => audit.status === "Overdue"
  ).length;

  const openFindings = audits.reduce(
    (sum, audit) =>
      sum +
      (audit.status === "Completed" ? 0 : audit.findings),
    0
  );

  function updateStatus(id: string, status: AuditStatus) {
    setAudits((current) =>
      current.map((audit) =>
        audit.id === id ? { ...audit, status } : audit
      )
    );

    setSelected((current) =>
      current?.id === id ? { ...current, status } : current
    );

    setMenuId(null);
    setNotice(`Audit status changed to "${status}".`);
  }

  function addAudit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      form.startDate &&
      form.dueDate &&
      form.dueDate < form.startDate
    ) {
      setNotice("The due date cannot be earlier than the start date.");
      return;
    }

    const newAudit: Audit = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      title: form.title.trim(),
      framework: form.framework,
      auditor: form.auditor.trim(),
      department: form.department,
      startDate: form.startDate,
      dueDate: form.dueDate,
      status: "Planned",
      scope: form.scope.trim(),
      findings: 0,
    };

    setAudits((current) => [newAudit, ...current]);
    setShowForm(false);
    setForm({
      title: "",
      framework: "SOC 2",
      auditor: "",
      department: "Security",
      startDate: "",
      dueDate: "",
      scope: "",
    });
    setNotice("Audit created successfully.");
  }

  function deleteAudit(id: string) {
    setAudits((current) =>
      current.filter((audit) => audit.id !== id)
    );
    setSelected(null);
    setMenuId(null);
    setNotice("Audit record deleted.");
  }

  function exportCSV() {
    const headers = [
      "Audit ID",
      "Audit Name",
      "Framework",
      "Auditor",
      "Department",
      "Start Date",
      "Due Date",
      "Status",
      "Findings",
      "Scope",
    ];

    const rows = filtered.map((audit) => [
      audit.id,
      audit.title,
      audit.framework,
      audit.auditor,
      audit.department,
      audit.startDate,
      audit.dueDate,
      audit.status,
      String(audit.findings),
      audit.scope,
    ]);

    const escapeCSV = (value: string) =>
      `"${value.replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-audit-management.csv";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Audit register exported to CSV.");
  }

  return (
    <main className="audit-page">
      <header className="page-header">
        <div>
          <div className="breadcrumb">
            Admin <span>/</span> Compliance <span>/</span> Audit Management
          </div>
          <h1>Audit Management</h1>
          <p>
            Plan audits, coordinate reviewers, track findings, and
            monitor compliance audit progress.
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
            <Plus size={17} /> Create Audit
          </button>
        </div>
      </header>

      {notice && (
        <div className="notice">
          <CheckCircle2 size={17} />
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      )}

      <section className="stats-grid">
        <StatCard
          icon={<ClipboardCheck size={20} />}
          label="Total Audits"
          value={audits.length}
          note="All audit records"
          color="blue"
        />
        <StatCard
          icon={<Clock3 size={20} />}
          label="In Progress"
          value={inProgress}
          note="Currently underway"
          color="amber"
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="Completed"
          value={completed}
          note="Marked completed"
          color="green"
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          label="Overdue"
          value={overdue}
          note="Needs attention"
          color="red"
        />
      </section>

      <section className="summary-grid">
        <div className="summary-card">
          <div className="summary-top">
            <span>Open audit findings</span>
            <AlertTriangle size={17} />
          </div>
          <strong>{openFindings}</strong>
          <p>Findings associated with audits not marked completed.</p>
        </div>

        <div className="summary-card">
          <div className="summary-top">
            <span>Audit coverage</span>
            <ShieldCheck size={17} />
          </div>
          <strong>
            {audits.length
              ? Math.round((completed / audits.length) * 100)
              : 0}
            %
          </strong>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${
                  audits.length
                    ? (completed / audits.length) * 100
                    : 0
                }%`,
              }}
            />
          </div>
          <p>Share of audit records marked completed.</p>
        </div>

        <div className="summary-card">
          <div className="summary-top">
            <span>Audit teams</span>
            <Users size={17} />
          </div>
          <strong>
            {new Set(audits.map((audit) => audit.auditor)).size}
          </strong>
          <p>Distinct assigned audit owners or teams.</p>
        </div>
      </section>

      <section className="content-card">
        <div className="section-heading">
          <div>
            <h2>Audit Register</h2>
            <p>Manage audit schedules, ownership, and outcomes.</p>
          </div>
          <span className="record-count">{filtered.length} records</span>
        </div>

        <div className="filters">
          <div className="search-box">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search audits, owners, departments..."
            />
          </div>

          <div className="filter-box">
            <Filter size={15} />
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option>All</option>
              <option>Planned</option>
              <option>In Progress</option>
              <option>Under Review</option>
              <option>Completed</option>
              <option>Overdue</option>
            </select>
          </div>

          <select
            className="framework-select"
            value={frameworkFilter}
            onChange={(event) =>
              setFrameworkFilter(event.target.value)
            }
          >
            <option>All</option>
            <option>SOC 2</option>
            <option>ISO 27001</option>
            <option>GDPR</option>
            <option>HIPAA</option>
            <option>PCI DSS</option>
          </select>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Audit</th>
                <th>Framework</th>
                <th>Owner / Department</th>
                <th>Start Date</th>
                <th>Due Date</th>
                <th>Findings</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((audit) => (
                <tr key={audit.id}>
                  <td>
                    <button
                      className="audit-name"
                      onClick={() => setSelected(audit)}
                    >
                      <span className="audit-icon">
                        <ClipboardCheck size={18} />
                      </span>
                      <span>
                        <strong>{audit.title}</strong>
                        <small>{audit.id}</small>
                      </span>
                    </button>
                  </td>
                  <td>
                    <span className="framework-tag">
                      {audit.framework}
                    </span>
                  </td>
                  <td>
                    <strong className="owner-name">
                      {audit.auditor}
                    </strong>
                    <small className="department">
                      {audit.department}
                    </small>
                  </td>
                  <td>
                    <span className="date-cell">
                      <CalendarDays size={14} />
                      {audit.startDate || "—"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        audit.status === "Overdue"
                          ? "date-cell overdue-date"
                          : "date-cell"
                      }
                    >
                      {audit.dueDate || "—"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        audit.findings > 0
                          ? "finding-count"
                          : "finding-count none"
                      }
                    >
                      {audit.findings}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${statusClass[audit.status]}`}
                    >
                      <span className="status-dot" />
                      {audit.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="icon-button"
                      aria-label="Audit actions"
                      onClick={() =>
                        setMenuId(
                          menuId === audit.id ? null : audit.id
                        )
                      }
                    >
                      <MoreHorizontal size={19} />
                    </button>

                    {menuId === audit.id && (
                      <div className="row-menu">
                        <button
                          onClick={() => {
                            setSelected(audit);
                            setMenuId(null);
                          }}
                        >
                          <Eye size={15} /> View details
                        </button>

                        {(
                          [
                            "Planned",
                            "In Progress",
                            "Under Review",
                            "Completed",
                            "Overdue",
                          ] as AuditStatus[]
                        )
                          .filter((status) => status !== audit.status)
                          .map((status) => (
                            <button
                              key={status}
                              onClick={() =>
                                updateStatus(audit.id, status)
                              }
                            >
                              <CheckCircle2 size={15} />
                              Mark {status}
                            </button>
                          ))}

                        <button
                          className="delete-action"
                          onClick={() => deleteAudit(audit.id)}
                        >
                          <Trash2 size={15} /> Delete audit
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="empty-state">
                    <ClipboardCheck size={28} />
                    <strong>No audits found</strong>
                    <span>Try changing your search or filters.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>
            Showing {filtered.length} of {audits.length} audit records
          </span>
          <span>Audit Management · ModelNow</span>
        </div>
      </section>

      <section className="bottom-grid">
        <div className="content-card info-card">
          <div className="info-icon blue-info">
            <CalendarDays size={20} />
          </div>
          <h3>Audit planning</h3>
          <p>
            Schedule reviews, define audit scope, and assign clear
            ownership for each compliance initiative.
          </p>
        </div>

        <div className="content-card info-card">
          <div className="info-icon amber-info">
            <AlertTriangle size={20} />
          </div>
          <h3>Finding management</h3>
          <p>
            Identify outstanding findings and coordinate remediation
            with the responsible teams.
          </p>
        </div>

        <div className="content-card info-card">
          <div className="info-icon green-info">
            <FileText size={20} />
          </div>
          <h3>Audit reporting</h3>
          <p>
            Export audit register information for reviews and
            compliance reporting workflows.
          </p>
        </div>
      </section>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
            }
          }}
        >
          <section className="modal">
            <div className="modal-heading">
              <div>
                <h2>Create Audit</h2>
                <p>Set up a new compliance audit.</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addAudit}>
              <label>
                Audit title *
                <input
                  required
                  maxLength={120}
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  placeholder="e.g. Annual security controls audit"
                />
              </label>

              <div className="form-row">
                <label>
                  Framework
                  <select
                    value={form.framework}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        framework: event.target.value,
                      })
                    }
                  >
                    <option>SOC 2</option>
                    <option>ISO 27001</option>
                    <option>GDPR</option>
                    <option>HIPAA</option>
                    <option>PCI DSS</option>
                  </select>
                </label>

                <label>
                  Department
                  <select
                    value={form.department}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        department: event.target.value,
                      })
                    }
                  >
                    <option>Security</option>
                    <option>Engineering</option>
                    <option>Legal</option>
                    <option>IT</option>
                    <option>Finance</option>
                    <option>HR</option>
                    <option>Procurement</option>
                  </select>
                </label>
              </div>

              <label>
                Auditor / Owner *
                <input
                  required
                  value={form.auditor}
                  onChange={(event) =>
                    setForm({ ...form, auditor: event.target.value })
                  }
                  placeholder="e.g. Compliance Team"
                />
              </label>

              <div className="form-row">
                <label>
                  Start date *
                  <input
                    required
                    type="date"
                    value={form.startDate}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        startDate: event.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Due date *
                  <input
                    required
                    type="date"
                    min={form.startDate || undefined}
                    value={form.dueDate}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        dueDate: event.target.value,
                      })
                    }
                  />
                </label>
              </div>

              <label>
                Audit scope *
                <textarea
                  required
                  rows={3}
                  value={form.scope}
                  onChange={(event) =>
                    setForm({ ...form, scope: event.target.value })
                  }
                  placeholder="Describe the systems, processes, or controls to review..."
                />
              </label>

              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button className="primary-button" type="submit">
                  <Plus size={16} /> Create Audit
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
            if (event.target === event.currentTarget) {
              setSelected(null);
            }
          }}
        >
          <section className="modal detail-modal">
            <div className="modal-heading">
              <div>
                <span className="eyebrow">{selected.id}</span>
                <h2>{selected.title}</h2>
                <p>Audit overview and scope</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setSelected(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="detail-status">
              <span
                className={`status-badge ${statusClass[selected.status]}`}
              >
                <span className="status-dot" />
                {selected.status}
              </span>
              <span className="framework-tag">
                {selected.framework}
              </span>
            </div>

            <div className="detail-grid">
              <Detail label="Auditor / Owner" value={selected.auditor} />
              <Detail label="Department" value={selected.department} />
              <Detail
                label="Start date"
                value={selected.startDate || "Not set"}
              />
              <Detail
                label="Due date"
                value={selected.dueDate || "Not set"}
              />
              <Detail
                label="Findings"
                value={String(selected.findings)}
              />
            </div>

            <div className="description-box">
              <strong>Audit scope</strong>
              <p>{selected.scope || "No scope provided."}</p>
            </div>

            <div className="modal-footer">
              <button
                className="secondary-button"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
              {selected.status !== "Completed" && (
                <button
                  className="primary-button"
                  onClick={() =>
                    updateStatus(selected.id, "Completed")
                  }
                >
                  <CheckCircle2 size={16} /> Mark Completed
                </button>
              )}
            </div>
          </section>
        </div>
      )}

      <style jsx>{`
        .audit-page {
          --text: #172033;
          --muted: #687386;
          --line: #e6eaf0;
          min-height: 100vh;
          padding: 30px;
          background: #f7f9fc;
          color: var(--text);
          font-family: Arial, Helvetica, sans-serif;
        }

        .page-header,
        .header-actions,
        .section-heading,
        .filters,
        .table-footer,
        .modal-heading,
        .modal-footer,
        .detail-status {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .page-header {
          align-items: flex-start;
          margin-bottom: 25px;
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
          border: 1px solid #bce7cc;
          border-radius: 9px;
          background: #f0fdf4;
          color: #166534;
          font-size: 12px;
        }

        .notice span {
          flex: 1;
        }

        .notice button {
          display: flex;
          border: 0;
          background: transparent;
          color: inherit;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 18px;
        }

        .stat-card {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          min-width: 0;
          padding: 19px;
          background: white;
          border: 1px solid var(--line);
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

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .summary-card {
          padding: 19px;
          border: 1px solid var(--line);
          border-radius: 11px;
          background: white;
        }

        .summary-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          color: #687386;
          font-size: 12px;
        }

        .summary-top svg {
          color: #63738d;
        }

        .summary-card > strong {
          display: block;
          margin-top: 13px;
          font-size: 27px;
          letter-spacing: -0.7px;
        }

        .summary-card p {
          margin: 8px 0 0;
          color: #8791a1;
          font-size: 11px;
          line-height: 1.6;
        }

        .progress-track {
          height: 6px;
          margin-top: 12px;
          overflow: hidden;
          background: #e9edf4;
          border-radius: 10px;
        }

        .progress-fill {
          height: 100%;
          background: #238653;
          border-radius: 10px;
          transition: width 0.2s ease;
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
        .framework-select {
          color: #435066;
          background: white;
          border: 0;
          outline: 0;
          font-size: 12px;
        }

        .framework-select {
          min-height: 38px;
          padding: 0 12px;
          border: 1px solid #dfe5ed;
          border-radius: 8px;
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
          padding: 12px 15px;
          color: #758196;
          background: #f8fafc;
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        th:first-child,
        td:first-child {
          padding-left: 22px;
        }

        td {
          position: relative;
          padding: 15px;
          color: #475467;
          border-bottom: 1px solid #edf0f4;
          font-size: 12px;
        }

        tbody tr:last-child td {
          border-bottom: 0;
        }

        tbody tr:hover {
          background: #fbfcfe;
        }

        .audit-name {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 0;
          color: inherit;
          text-align: left;
          background: transparent;
          border: 0;
        }

        .audit-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 37px;
          height: 37px;
          color: #3764c9;
          background: #edf3ff;
          border-radius: 9px;
        }

        .audit-name strong {
          display: block;
          color: #263248;
          font-size: 12px;
          font-weight: 600;
        }

        .audit-name small,
        .department {
          display: block;
          margin-top: 5px;
          color: #8b95a5;
          font-size: 10px;
        }

        .owner-name {
          display: block;
          color: #475467;
          font-size: 11px;
          font-weight: 500;
        }

        .framework-tag {
          display: inline-flex;
          padding: 5px 8px;
          color: #495a78;
          background: #f0f3f8;
          border-radius: 5px;
          font-size: 10px;
          font-weight: 600;
        }

        .date-cell {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #687386;
          font-size: 11px;
        }

        .overdue-date {
          color: #c34242;
          font-weight: 600;
        }

        .finding-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 25px;
          height: 25px;
          padding: 0 5px;
          color: #b54708;
          background: #fff5e5;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
        }

        .finding-count.none {
          color: #16814a;
          background: #e9f9ef;
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

        .status-dot {
          width: 6px;
          height: 6px;
          background: currentColor;
          border-radius: 50%;
        }

        .status-badge.planned {
          color: #53627b;
          background: #eef1f6;
        }

        .status-badge.progress {
          color: #2856c7;
          background: #edf3ff;
        }

        .status-badge.review {
          color: #9b650c;
          background: #fff5df;
        }

        .status-badge.completed {
          color: #16814a;
          background: #e9f9ef;
        }

        .status-badge.overdue {
          color: #bf3c3c;
          background: #fff0f0;
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
          top: 48px;
          right: 14px;
          width: 185px;
          padding: 5px;
          background: white;
          border: 1px solid var(--line);
          border-radius: 9px;
          box-shadow: 0 10px 30px #17203318;
        }

        .row-menu button {
          display: flex;
          align-items: center;
          gap: 9px;
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
          border-radius: 0 0 6px 6px;
        }

        .empty-state {
          padding: 48px 20px;
          color: #8a94a4;
          text-align: center;
        }

        .empty-state svg,
        .empty-state strong,
        .empty-state span {
          display: block;
          margin: 0 auto 10px;
        }

        .empty-state strong {
          color: #344054;
        }

        .empty-state span {
          font-size: 11px;
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

        .blue-info {
          color: #2856c7;
          background: #edf3ff;
        }

        .amber-info {
          color: #ad6b0b;
          background: #fff6e5;
        }

        .green-info {
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
          max-width: 590px;
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

        .modal label {
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

        .modal-footer {
          justify-content: flex-end;
          margin-top: 8px;
          padding-top: 17px;
          border-top: 1px solid var(--line);
        }

        .eyebrow {
          display: block;
          margin-bottom: 8px;
          color: #6b7a94;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .detail-status {
          justify-content: flex-start;
          margin-bottom: 20px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
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

        .description-box {
          margin-top: 15px;
          padding: 15px;
          background: #f7f9fc;
          border-radius: 9px;
        }

        .description-box strong {
          font-size: 12px;
        }

        .description-box p {
          margin: 8px 0 0;
          color: #687386;
          font-size: 12px;
          line-height: 1.7;
        }

        @media (max-width: 1050px) {
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .audit-page {
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
            grid-template-columns: 1fr 1fr;
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

          .summary-grid {
            grid-template-columns: 1fr;
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
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value || "Not set"}</strong>
    </div>
  );
}
