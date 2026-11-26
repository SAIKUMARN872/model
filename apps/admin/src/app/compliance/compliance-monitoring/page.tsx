
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Clock3,
  MoreHorizontal,
  Eye,
  Trash2,
  X,
  Download,
  Filter,
  Gauge,
  Bell,
  CalendarDays,
  TrendingUp,
  CircleAlert,
} from "lucide-react";

type MonitorStatus = "Healthy" | "Warning" | "Critical" | "Paused";

type Monitor = {
  id: string;
  name: string;
  category: string;
  framework: string;
  owner: string;
  status: MonitorStatus;
  compliance: number;
  lastChecked: string;
  nextCheck: string;
  description: string;
};

const initialMonitors: Monitor[] = [
  {
    id: "MON-001",
    name: "Privileged Access Review",
    category: "Access Control",
    framework: "SOC 2",
    owner: "Security Team",
    status: "Healthy",
    compliance: 98,
    lastChecked: "2026-11-04 09:15",
    nextCheck: "2026-11-05",
    description:
      "Continuously checks privileged account assignments and access review completion.",
  },
  {
    id: "MON-002",
    name: "Encryption Configuration",
    category: "Data Protection",
    framework: "ISO 27001",
    owner: "Platform Team",
    status: "Healthy",
    compliance: 96,
    lastChecked: "2026-11-04 09:10",
    nextCheck: "2026-11-05",
    description:
      "Monitors encryption configuration and data protection control coverage.",
  },
  {
    id: "MON-003",
    name: "Data Retention Compliance",
    category: "Privacy",
    framework: "GDPR",
    owner: "Privacy Team",
    status: "Warning",
    compliance: 78,
    lastChecked: "2026-11-04 08:45",
    nextCheck: "2026-11-04",
    description:
      "Checks retention schedules and identifies records that may need review.",
  },
  {
    id: "MON-004",
    name: "Security Incident Response",
    category: "Incident Management",
    framework: "SOC 2",
    owner: "Security Operations",
    status: "Critical",
    compliance: 54,
    lastChecked: "2026-11-04 08:30",
    nextCheck: "2026-11-04",
    description:
      "Tracks incident response evidence, unresolved actions, and escalation readiness.",
  },
  {
    id: "MON-005",
    name: "Vendor Risk Review",
    category: "Third-Party Risk",
    framework: "ISO 27001",
    owner: "Risk Team",
    status: "Warning",
    compliance: 72,
    lastChecked: "2026-11-04 08:00",
    nextCheck: "2026-11-06",
    description:
      "Tracks vendor security assessments and overdue third-party reviews.",
  },
  {
    id: "MON-006",
    name: "Employee Training Records",
    category: "Awareness",
    framework: "SOC 2",
    owner: "HR Team",
    status: "Paused",
    compliance: 88,
    lastChecked: "2026-11-03 17:00",
    nextCheck: "Not scheduled",
    description:
      "Monitors employee security awareness and training completion records.",
  },
];

const statusClasses: Record<MonitorStatus, string> = {
  Healthy: "healthy",
  Warning: "warning",
  Critical: "critical",
  Paused: "paused",
};

export default function ComplianceMonitoringPage() {
  const [monitors, setMonitors] =
    useState<Monitor[]>(initialMonitors);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [frameworkFilter, setFrameworkFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Monitor | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "Access Control",
    framework: "SOC 2",
    owner: "",
    description: "",
  });

  const filtered = useMemo(() => {
    return monitors.filter((monitor) => {
      const searchable = [
        monitor.id,
        monitor.name,
        monitor.category,
        monitor.framework,
        monitor.owner,
      ]
        .join(" ")
        .toLowerCase();

      return (
        searchable.includes(search.toLowerCase()) &&
        (statusFilter === "All" ||
          monitor.status === statusFilter) &&
        (frameworkFilter === "All" ||
          monitor.framework === frameworkFilter)
      );
    });
  }, [monitors, search, statusFilter, frameworkFilter]);

  const healthy = monitors.filter(
    (monitor) => monitor.status === "Healthy"
  ).length;

  const warnings = monitors.filter(
    (monitor) => monitor.status === "Warning"
  ).length;

  const critical = monitors.filter(
    (monitor) => monitor.status === "Critical"
  ).length;

  const active = monitors.filter(
    (monitor) => monitor.status !== "Paused"
  ).length;

  const averageCompliance = monitors.length
    ? Math.round(
        monitors.reduce(
          (sum, monitor) => sum + monitor.compliance,
          0
        ) / monitors.length
      )
    : 0;

  function updateMonitor(
    id: string,
    updates: Partial<Monitor>
  ) {
    setMonitors((current) =>
      current.map((monitor) =>
        monitor.id === id ? { ...monitor, ...updates } : monitor
      )
    );

    setSelected((current) =>
      current?.id === id ? { ...current, ...updates } : current
    );
  }

  function changeStatus(id: string, status: MonitorStatus) {
    updateMonitor(id, { status });
    setMenuId(null);
    setNotice(`Monitor status updated to ${status}.`);
  }

  function runCheck(id: string) {
    const now = new Date();
    const timestamp = `${now.toISOString().slice(0, 10)} ${now
      .toTimeString()
      .slice(0, 5)}`;

    updateMonitor(id, {
      lastChecked: timestamp,
      nextCheck: "2026-11-05",
    });

    setMenuId(null);
    setNotice(
      "Check timestamp updated. This demo does not run a real compliance scan."
    );
  }

  function addMonitor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newMonitor: Monitor = {
      id: `MON-${Date.now().toString().slice(-6)}`,
      name: form.name.trim(),
      category: form.category,
      framework: form.framework,
      owner: form.owner.trim(),
      status: "Healthy",
      compliance: 100,
      lastChecked: "Not checked",
      nextCheck: "Not scheduled",
      description: form.description.trim(),
    };

    setMonitors((current) => [newMonitor, ...current]);
    setShowForm(false);
    setForm({
      name: "",
      category: "Access Control",
      framework: "SOC 2",
      owner: "",
      description: "",
    });
    setNotice(
      "Monitor created with an initial 100% demo score. No real scan has run."
    );
  }

  function deleteMonitor(id: string) {
    setMonitors((current) =>
      current.filter((monitor) => monitor.id !== id)
    );
    setSelected(null);
    setMenuId(null);
    setNotice("Monitor record deleted.");
  }

  function exportCSV() {
    const headers = [
      "Monitor ID",
      "Name",
      "Category",
      "Framework",
      "Owner",
      "Status",
      "Compliance Score",
      "Last Checked",
      "Next Check",
    ];

    const rows = filtered.map((monitor) => [
      monitor.id,
      monitor.name,
      monitor.category,
      monitor.framework,
      monitor.owner,
      monitor.status,
      `${monitor.compliance}%`,
      monitor.lastChecked,
      monitor.nextCheck,
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
    link.download = "modelnow-compliance-monitoring.csv";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Monitoring records exported to CSV.");
  }

  return (
    <main className="monitor-page">
      <header className="page-header">
        <div>
          <div className="breadcrumb">
            Admin <span>/</span> Compliance <span>/</span> Monitoring
          </div>
          <h1>Compliance Monitoring</h1>
          <p>
            Monitor control health, track compliance signals, and
            identify issues that need attention.
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
            <Plus size={17} /> Add Monitor
          </button>
        </div>
      </header>

      {notice && (
        <div className="notice">
          <CheckCircle2 size={17} />
          <span>{notice}</span>
          <button
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <section className="stats-grid">
        <StatCard
          icon={<Activity size={20} />}
          label="Total Monitors"
          value={monitors.length}
          note={`${active} not paused`}
          color="blue"
        />
        <StatCard
          icon={<ShieldCheck size={20} />}
          label="Healthy"
          value={healthy}
          note="No active warning status"
          color="green"
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          label="Warnings"
          value={warnings}
          note="Needs review"
          color="amber"
        />
        <StatCard
          icon={<CircleAlert size={20} />}
          label="Critical"
          value={critical}
          note="Requires attention"
          color="red"
        />
      </section>

      <section className="overview-grid">
        <div className="overview-card score-card">
          <div className="overview-card-heading">
            <div>
              <span className="eyebrow">OVERALL SCORE</span>
              <h2>Compliance health</h2>
            </div>
            <Gauge size={20} />
          </div>

          <div className="score-row">
            <strong>{averageCompliance}%</strong>
            <span className="score-label">Average demo score</span>
          </div>

          <div className="score-track">
            <div
              className="score-fill"
              style={{ width: `${averageCompliance}%` }}
            />
          </div>

          <p>
            Average of the compliance scores recorded for all monitors,
            including paused monitors.
          </p>
        </div>

        <div className="overview-card">
          <div className="overview-card-heading">
            <div>
              <span className="eyebrow">MONITOR STATUS</span>
              <h2>Health distribution</h2>
            </div>
            <Activity size={20} />
          </div>

          {(
            [
              ["Healthy", healthy, "healthy-bar"],
              ["Warning", warnings, "warning-bar"],
              ["Critical", critical, "critical-bar"],
              [
                "Paused",
                monitors.filter((item) => item.status === "Paused")
                  .length,
                "paused-bar",
              ],
            ] as [string, number, string][]
          ).map(([label, value, className]) => (
            <div className="distribution-row" key={label}>
              <span>{label}</span>
              <div className="distribution-track">
                <div
                  className={className}
                  style={{
                    width: `${
                      monitors.length
                        ? (value / monitors.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <strong>{value}</strong>
            </div>
          ))}
        </div>

        <div className="overview-card">
          <div className="overview-card-heading">
            <div>
              <span className="eyebrow">ATTENTION REQUIRED</span>
              <h2>Priority signals</h2>
            </div>
            <Bell size={20} />
          </div>

          <div className="priority-item">
            <span className="priority-icon red-bg">
              <AlertTriangle size={16} />
            </span>
            <div>
              <strong>{critical} critical monitors</strong>
              <p>Review affected controls and ownership.</p>
            </div>
          </div>

          <div className="priority-item">
            <span className="priority-icon amber-bg">
              <Clock3 size={16} />
            </span>
            <div>
              <strong>{warnings} warnings</strong>
              <p>Investigate incomplete or aging controls.</p>
            </div>
          </div>

          <div className="priority-item">
            <span className="priority-icon blue-bg">
              <TrendingUp size={16} />
            </span>
            <div>
              <strong>{active} active monitors</strong>
              <p>Currently not marked as paused.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="content-card">
        <div className="section-heading">
          <div>
            <h2>Monitoring Register</h2>
            <p>
              Review monitor status, control coverage, and check schedules.
            </p>
          </div>
          <span className="record-count">
            {filtered.length} records
          </span>
        </div>

        <div className="filters">
          <div className="search-box">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search monitors, owners, categories..."
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
              <option>Healthy</option>
              <option>Warning</option>
              <option>Critical</option>
              <option>Paused</option>
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
                <th>Monitor</th>
                <th>Framework</th>
                <th>Owner</th>
                <th>Compliance</th>
                <th>Last Checked</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((monitor) => (
                <tr key={monitor.id}>
                  <td>
                    <button
                      className="monitor-name"
                      onClick={() => setSelected(monitor)}
                    >
                      <span className="monitor-icon">
                        <Activity size={18} />
                      </span>
                      <span>
                        <strong>{monitor.name}</strong>
                        <small>
                          {monitor.id} · {monitor.category}
                        </small>
                      </span>
                    </button>
                  </td>

                  <td>
                    <span className="framework-tag">
                      {monitor.framework}
                    </span>
                  </td>

                  <td className="owner-cell">{monitor.owner}</td>

                  <td>
                    <div className="compliance-cell">
                      <div className="compliance-track">
                        <div
                          className={
                            monitor.compliance < 60
                              ? "compliance-fill low"
                              : monitor.compliance < 80
                                ? "compliance-fill medium"
                                : "compliance-fill"
                          }
                          style={{
                            width: `${monitor.compliance}%`,
                          }}
                        />
                      </div>
                      <strong>{monitor.compliance}%</strong>
                    </div>
                  </td>

                  <td>
                    <span className="date-cell">
                      <CalendarDays size={14} />
                      {monitor.lastChecked}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`status-badge ${statusClasses[monitor.status]}`}
                    >
                      <span className="status-dot" />
                      {monitor.status}
                    </span>
                  </td>

                  <td className="actions-cell">
                    <button
                      className="icon-button"
                      aria-label="Monitor actions"
                      onClick={() =>
                        setMenuId(
                          menuId === monitor.id ? null : monitor.id
                        )
                      }
                    >
                      <MoreHorizontal size={19} />
                    </button>

                    {menuId === monitor.id && (
                      <div className="row-menu">
                        <button
                          onClick={() => {
                            setSelected(monitor);
                            setMenuId(null);
                          }}
                        >
                          <Eye size={15} /> View details
                        </button>

                        <button onClick={() => runCheck(monitor.id)}>
                          <RefreshCw size={15} /> Record check
                        </button>

                        {(
                          [
                            "Healthy",
                            "Warning",
                            "Critical",
                            "Paused",
                          ] as MonitorStatus[]
                        )
                          .filter(
                            (status) => status !== monitor.status
                          )
                          .map((status) => (
                            <button
                              key={status}
                              onClick={() =>
                                changeStatus(monitor.id, status)
                              }
                            >
                              <CheckCircle2 size={15} />
                              Mark {status}
                            </button>
                          ))}

                        <button
                          className="delete-action"
                          onClick={() => deleteMonitor(monitor.id)}
                        >
                          <Trash2 size={15} /> Delete monitor
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-state">
                    <Activity size={28} />
                    <strong>No monitors found</strong>
                    <span>Try changing your search or filters.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>
            Showing {filtered.length} of {monitors.length} monitors
          </span>
          <span>Compliance Monitoring · ModelNow</span>
        </div>
      </section>

      <section className="bottom-grid">
        <div className="content-card info-card">
          <div className="info-icon blue-info">
            <Activity size={20} />
          </div>
          <h3>Continuous monitoring</h3>
          <p>
            Organize control checks by framework, category, and
            responsible team.
          </p>
        </div>

        <div className="content-card info-card">
          <div className="info-icon amber-info">
            <AlertTriangle size={20} />
          </div>
          <h3>Issue prioritization</h3>
          <p>
            Identify warning and critical statuses so teams can focus
            on high-priority compliance work.
          </p>
        </div>

        <div className="content-card info-card">
          <div className="info-icon green-info">
            <ShieldCheck size={20} />
          </div>
          <h3>Control visibility</h3>
          <p>
            Review recorded compliance scores and ownership in one
            centralized register.
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
                <h2>Add Monitor</h2>
                <p>Create a compliance monitoring record.</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={addMonitor}
              className="monitor-form"
            >
              <label>
                Monitor name *
                <input
                  required
                  maxLength={120}
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="e.g. Data access compliance"
                />
              </label>

              <div className="form-row">
                <label>
                  Category
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        category: event.target.value,
                      })
                    }
                  >
                    <option>Access Control</option>
                    <option>Data Protection</option>
                    <option>Privacy</option>
                    <option>Incident Management</option>
                    <option>Third-Party Risk</option>
                    <option>Awareness</option>
                    <option>Change Management</option>
                    <option>Other</option>
                  </select>
                </label>

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
              </div>

              <label>
                Responsible owner *
                <input
                  required
                  value={form.owner}
                  onChange={(event) =>
                    setForm({ ...form, owner: event.target.value })
                  }
                  placeholder="e.g. Security Team"
                />
              </label>

              <label>
                Description
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
                    })
                  }
                  placeholder="Describe what this monitor is intended to track..."
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
                  <Plus size={16} /> Create Monitor
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
                <h2>{selected.name}</h2>
                <p>Monitoring record details</p>
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
                className={`status-badge ${statusClasses[selected.status]}`}
              >
                <span className="status-dot" />
                {selected.status}
              </span>
              <span className="framework-tag">
                {selected.framework}
              </span>
            </div>

            <div className="detail-score">
              <span>Recorded compliance score</span>
              <strong>{selected.compliance}%</strong>
              <div className="score-track">
                <div
                  className="score-fill"
                  style={{ width: `${selected.compliance}%` }}
                />
              </div>
            </div>

            <div className="detail-grid">
              <Detail label="Category" value={selected.category} />
              <Detail label="Owner" value={selected.owner} />
              <Detail label="Last checked" value={selected.lastChecked} />
              <Detail label="Next check" value={selected.nextCheck} />
            </div>

            <div className="description-box">
              <strong>Description</strong>
              <p>{selected.description || "No description provided."}</p>
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
                onClick={() => runCheck(selected.id)}
              >
                <RefreshCw size={15} /> Record Check
              </button>
            </div>
          </section>
        </div>
      )}

      <style jsx>{`
        .monitor-page {
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
          margin-bottom: 20px;
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

        .overview-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
          margin-bottom: 22px;
        }

        .overview-card {
          min-width: 0;
          padding: 20px;
          background: white;
          border: 1px solid var(--line);
          border-radius: 12px;
        }

        .overview-card-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          color: #64748b;
        }

        .overview-card-heading h2 {
          margin: 6px 0 0;
          color: var(--text);
          font-size: 14px;
        }

        .eyebrow {
          color: #8791a1;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.8px;
        }

        .score-row {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 25px;
        }

        .score-row strong {
          font-size: 34px;
          letter-spacing: -1px;
        }

        .score-label {
          color: #8791a1;
          font-size: 10px;
        }

        .score-track {
          height: 8px;
          margin-top: 15px;
          overflow: hidden;
          background: #e9edf4;
          border-radius: 20px;
        }

        .score-fill {
          height: 100%;
          background: #2a9a60;
          border-radius: 20px;
          transition: width 0.2s ease;
        }

        .score-card > p {
          margin: 13px 0 0;
          color: #8791a1;
          font-size: 10px;
          line-height: 1.7;
        }

        .distribution-row {
          display: grid;
          grid-template-columns: 62px 1fr 18px;
          align-items: center;
          gap: 9px;
          margin-top: 19px;
          color: #687386;
          font-size: 10px;
        }

        .distribution-row strong {
          color: #344054;
          text-align: right;
        }

        .distribution-track {
          height: 7px;
          overflow: hidden;
          background: #edf0f5;
          border-radius: 10px;
        }

        .distribution-track > div {
          height: 100%;
          border-radius: 10px;
        }

        .healthy-bar {
          background: #259b61;
        }

        .warning-bar {
          background: #e8a23b;
        }

        .critical-bar {
          background: #d94b4b;
        }

        .paused-bar {
          background: #8a94a4;
        }

        .priority-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 16px;
        }

        .priority-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 30px;
          height: 30px;
          border-radius: 8px;
        }

        .red-bg {
          color: #c34242;
          background: #fff0f0;
        }

        .amber-bg {
          color: #ad6b0b;
          background: #fff6e5;
        }

        .blue-bg {
          color: #2856c7;
          background: #edf3ff;
        }

        .priority-item strong {
          display: block;
          margin-top: 1px;
          color: #344054;
          font-size: 11px;
        }

        .priority-item p {
          margin: 5px 0 0;
          color: #8791a1;
          font-size: 10px;
          line-height: 1.5;
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

        .monitor-name {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 0;
          color: inherit;
          text-align: left;
          background: transparent;
          border: 0;
        }

        .monitor-icon {
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

        .monitor-name strong {
          display: block;
          color: #263248;
          font-size: 12px;
          font-weight: 600;
        }

        .monitor-name small {
          display: block;
          margin-top: 5px;
          color: #8b95a5;
          font-size: 10px;
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

        .owner-cell {
          font-size: 11px;
        }

        .compliance-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .compliance-track {
          width: 65px;
          height: 6px;
          overflow: hidden;
          background: #e9edf4;
          border-radius: 10px;
        }

        .compliance-fill {
          height: 100%;
          background: #259b61;
          border-radius: 10px;
        }

        .compliance-fill.medium {
          background: #e8a23b;
        }

        .compliance-fill.low {
          background: #d94b4b;
        }

        .compliance-cell strong {
          color: #475467;
          font-size: 10px;
        }

        .date-cell {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #687386;
          font-size: 10px;
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

        .status-badge.healthy {
          color: #16814a;
          background: #e9f9ef;
        }

        .status-badge.warning {
          color: #a86a0b;
          background: #fff5df;
        }

        .status-badge.critical {
          color: #bf3c3c;
          background: #fff0f0;
        }

        .status-badge.paused {
          color: #687386;
          background: #eef1f5;
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

        .detail-status {
          justify-content: flex-start;
          margin-bottom: 18px;
        }

        .detail-score {
          padding: 15px;
          background: #f7f9fc;
          border-radius: 9px;
        }

        .detail-score > span {
          color: #687386;
          font-size: 11px;
        }

        .detail-score > strong {
          display: block;
          margin-top: 7px;
          font-size: 26px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 14px;
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

        @media (max-width: 1100px) {
          .overview-grid {
            grid-template-columns: 1fr 1fr;
          }

          .overview-card:last-child {
            grid-column: 1 / -1;
          }

          .bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 750px) {
          .monitor-page {
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

          .overview-grid {
            grid-template-columns: 1fr;
          }

          .overview-card:last-child {
            grid-column: auto;
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
