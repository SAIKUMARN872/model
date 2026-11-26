
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  Filter,
  Layers3,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

type ControlStatus =
  | "Implemented"
  | "In progress"
  | "Needs remediation"
  | "Not tested";

type Control = {
  id: string;
  name: string;
  framework: string;
  category: string;
  owner: string;
  effectiveness: number;
  status: ControlStatus;
  lastTested: string;
};

const initialControls: Control[] = [
  {
    id: "CTRL-001",
    name: "Multi-factor authentication",
    framework: "SOC 2, ISO 27001",
    category: "Access Control",
    owner: "Security Team",
    effectiveness: 96,
    status: "Implemented",
    lastTested: "2026-10-28",
  },
  {
    id: "CTRL-002",
    name: "Data encryption at rest",
    framework: "SOC 2, GDPR",
    category: "Data Protection",
    owner: "Platform Team",
    effectiveness: 94,
    status: "Implemented",
    lastTested: "2026-10-25",
  },
  {
    id: "CTRL-003",
    name: "Incident response procedures",
    framework: "SOC 2, ISO 27001",
    category: "Incident Management",
    owner: "Security Team",
    effectiveness: 72,
    status: "In progress",
    lastTested: "2026-10-20",
  },
  {
    id: "CTRL-004",
    name: "Employee security awareness",
    framework: "SOC 2, GDPR",
    category: "Training",
    owner: "People Operations",
    effectiveness: 48,
    status: "Needs remediation",
    lastTested: "2026-10-18",
  },
  {
    id: "CTRL-005",
    name: "Privileged access review",
    framework: "ISO 27001, SOC 2",
    category: "Access Control",
    owner: "IT Operations",
    effectiveness: 0,
    status: "Not tested",
    lastTested: "Not tested",
  },
  {
    id: "CTRL-006",
    name: "Backup and recovery validation",
    framework: "SOC 2, HIPAA",
    category: "Business Continuity",
    owner: "Platform Team",
    effectiveness: 89,
    status: "Implemented",
    lastTested: "2026-10-15",
  },
  {
    id: "CTRL-007",
    name: "Vendor security assessment",
    framework: "SOC 2, ISO 27001",
    category: "Third-Party Risk",
    owner: "Compliance Team",
    effectiveness: 61,
    status: "Needs remediation",
    lastTested: "2026-10-12",
  },
  {
    id: "CTRL-008",
    name: "Audit log monitoring",
    framework: "SOC 2, ISO 27001",
    category: "Monitoring",
    owner: "Security Team",
    effectiveness: 83,
    status: "In progress",
    lastTested: "2026-10-10",
  },
];

const statuses: ControlStatus[] = [
  "Implemented",
  "In progress",
  "Needs remediation",
  "Not tested",
];

const categories = [
  "Access Control",
  "Data Protection",
  "Incident Management",
  "Training",
  "Business Continuity",
  "Third-Party Risk",
  "Monitoring",
  "Change Management",
];

const emptyForm = {
  name: "",
  framework: "SOC 2",
  category: "Access Control",
  owner: "",
  status: "Not tested" as ControlStatus,
};

export default function ControlsManagementPage() {
  const [controls, setControls] = useState<Control[]>(initialControls);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [showModal, setShowModal] = useState(false);
  const [selectedControl, setSelectedControl] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredControls = useMemo(() => {
    const term = search.toLowerCase().trim();

    return controls.filter((control) => {
      const matchesSearch =
        !term ||
        control.id.toLowerCase().includes(term) ||
        control.name.toLowerCase().includes(term) ||
        control.owner.toLowerCase().includes(term) ||
        control.framework.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "All statuses" ||
        control.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All categories" ||
        control.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [controls, search, statusFilter, categoryFilter]);

  const implemented = controls.filter(
    (control) => control.status === "Implemented"
  ).length;

  const remediation = controls.filter(
    (control) => control.status === "Needs remediation"
  ).length;

  const testedControls = controls.filter(
    (control) => control.status !== "Not tested"
  );

  const averageEffectiveness = testedControls.length
    ? Math.round(
        testedControls.reduce(
          (sum, control) => sum + control.effectiveness,
          0
        ) / testedControls.length
      )
    : 0;

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }

  function addControl() {
    if (!form.name.trim() || !form.owner.trim()) {
      showNotice("Enter a control name and owner.");
      return;
    }

    const nextControl: Control = {
      id: `CTRL-${String(
        Math.max(0, ...controls.map((c) => Number(c.id.split("-")[1]) || 0)) +
          1
      ).padStart(3, "0")}`,
      name: form.name.trim(),
      framework: form.framework,
      category: form.category,
      owner: form.owner.trim(),
      effectiveness: 0,
      status: form.status,
      lastTested: "Not tested",
    };

    setControls((current) => [nextControl, ...current]);
    setForm(emptyForm);
    setShowModal(false);
    showNotice("Control added successfully.");
  }

  function updateStatus(id: string, status: ControlStatus) {
    setControls((current) =>
      current.map((control) =>
        control.id === id
          ? {
              ...control,
              status,
              effectiveness:
                status === "Implemented"
                  ? Math.max(control.effectiveness, 90)
                  : status === "Needs remediation"
                    ? Math.min(control.effectiveness, 60)
                    : control.effectiveness,
            }
          : control
      )
    );

    setSelectedControl(null);
    showNotice("Control status updated.");
  }

  function deleteControl(id: string) {
    setControls((current) => current.filter((control) => control.id !== id));
    setSelectedIds((current) => current.filter((item) => item !== id));
    setSelectedControl(null);
    showNotice("Control deleted.");
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function toggleAll() {
    const visibleIds = filteredControls.map((control) => control.id);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));

    setSelectedIds((current) =>
      allSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds]))
    );
  }

  function exportCSV() {
    const exportControls = selectedIds.length
      ? filteredControls.filter((control) => selectedIds.includes(control.id))
      : filteredControls;

    const headers = [
      "Control ID",
      "Control Name",
      "Framework",
      "Category",
      "Owner",
      "Effectiveness",
      "Status",
      "Last Tested",
    ];

    const rows = exportControls.map((control) => [
      control.id,
      control.name,
      control.framework,
      control.category,
      control.owner,
      `${control.effectiveness}%`,
      control.status,
      control.lastTested,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-controls.csv";
    link.click();
    URL.revokeObjectURL(url);
    showNotice("Controls CSV exported.");
  }

  return (
    <main className="controls-page">
      <header className="page-header">
        <div>
          <div className="breadcrumb">
            Admin <span>/</span> Compliance <span>/</span>{" "}
            <strong>Controls Management</strong>
          </div>
          <div className="heading-row">
            <div className="heading-icon">
              <ShieldCheck size={25} />
            </div>
            <div>
              <h1>Controls Management</h1>
              <p>
                Define, monitor, and test the controls that protect your
                organization.
              </p>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button className="secondary-button" onClick={exportCSV}>
            <ArrowDownToLine size={16} />
            Export CSV
          </button>
          <button
            className="primary-button"
            onClick={() => {
              setForm(emptyForm);
              setShowModal(true);
            }}
          >
            <Plus size={17} />
            Add control
          </button>
        </div>
      </header>

      {notice && (
        <div className="notice">
          <CheckCircle2 size={17} />
          {notice}
          <button onClick={() => setNotice("")} aria-label="Dismiss notice">
            <X size={15} />
          </button>
        </div>
      )}

      <section className="summary-grid">
        <article className="metric-card">
          <div className="metric-top">
            <span>Total controls</span>
            <div className="metric-icon blue">
              <Layers3 size={19} />
            </div>
          </div>
          <div className="metric-value">{controls.length}</div>
          <div className="metric-note">Across all frameworks</div>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span>Implemented</span>
            <div className="metric-icon green">
              <CheckCircle2 size={19} />
            </div>
          </div>
          <div className="metric-value">{implemented}</div>
          <div className="metric-note">
            {controls.length
              ? `${Math.round((implemented / controls.length) * 100)}% of all controls`
              : "No controls yet"}
          </div>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span>Needs remediation</span>
            <div className="metric-icon red">
              <AlertTriangle size={19} />
            </div>
          </div>
          <div className="metric-value">{remediation}</div>
          <div className="metric-note">Requires corrective action</div>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span>Avg. effectiveness</span>
            <div className="metric-icon purple">
              <Activity size={19} />
            </div>
          </div>
          <div className="metric-value">{averageEffectiveness}%</div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${averageEffectiveness}%` }}
            />
          </div>
        </article>
      </section>

      <section className="attention-banner">
        <div className="attention-icon">
          <AlertTriangle size={20} />
        </div>
        <div className="attention-copy">
          <strong>Controls requiring attention</strong>
          <p>
            {remediation} control(s) need remediation. Review ownership,
            evidence, and corrective actions.
          </p>
        </div>
        <button
          className="text-button"
          onClick={() => setStatusFilter("Needs remediation")}
        >
          View controls
          <ChevronDown size={15} className="side-arrow" />
        </button>
      </section>

      <section className="table-card">
        <div className="table-heading">
          <div>
            <h2>Control inventory</h2>
            <p>Manage control ownership, status, and effectiveness.</p>
          </div>
          <div className="table-count">
            {filteredControls.length} controls
          </div>
        </div>

        <div className="filter-bar">
          <div className="search-box">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search controls, owners, frameworks..."
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </div>

          <label className="filter-select">
            <Filter size={15} />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>All statuses</option>
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>

          <label className="filter-select">
            <Layers3 size={15} />
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option>All categories</option>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
        </div>

        {selectedIds.length > 0 && (
          <div className="bulk-bar">
            <span>{selectedIds.length} selected</span>
            <button onClick={exportCSV}>
              <ArrowDownToLine size={15} /> Export selected
            </button>
            <button onClick={() => setSelectedIds([])}>Clear selection</button>
          </div>
        )}

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th className="check-cell">
                  <input
                    type="checkbox"
                    aria-label="Select all visible controls"
                    checked={
                      filteredControls.length > 0 &&
                      filteredControls.every((control) =>
                        selectedIds.includes(control.id)
                      )
                    }
                    onChange={toggleAll}
                  />
                </th>
                <th>CONTROL</th>
                <th>FRAMEWORK</th>
                <th>CATEGORY</th>
                <th>OWNER</th>
                <th>EFFECTIVENESS</th>
                <th>STATUS</th>
                <th>LAST TESTED</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredControls.map((control) => (
                <tr key={control.id}>
                  <td className="check-cell">
                    <input
                      type="checkbox"
                      aria-label={`Select ${control.id}`}
                      checked={selectedIds.includes(control.id)}
                      onChange={() => toggleSelected(control.id)}
                    />
                  </td>
                  <td>
                    <div className="control-name">{control.name}</div>
                    <div className="control-id">{control.id}</div>
                  </td>
                  <td>
                    <span className="framework-text">
                      {control.framework}
                    </span>
                  </td>
                  <td>
                    <span className="category-tag">{control.category}</span>
                  </td>
                  <td>
                    <div className="owner-cell">
                      <span className="owner-avatar">
                        <UserRound size={14} />
                      </span>
                      {control.owner}
                    </div>
                  </td>
                  <td>
                    {control.status === "Not tested" ? (
                      <span className="muted">—</span>
                    ) : (
                      <div className="effectiveness-cell">
                        <span>{control.effectiveness}%</span>
                        <div className="mini-track">
                          <div
                            className={`mini-fill ${
                              control.effectiveness < 65 ? "low" : ""
                            }`}
                            style={{
                              width: `${control.effectiveness}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={control.status} />
                  </td>
                  <td>
                    <div className="date-cell">
                      <CalendarDays size={14} />
                      {control.lastTested === "Not tested"
                        ? "Not tested"
                        : new Date(
                            `${control.lastTested}T12:00:00`
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                    </div>
                  </td>
                  <td className="action-cell">
                    <div className="action-wrap">
                      <button
                        className="icon-button"
                        aria-label={`Actions for ${control.id}`}
                        onClick={() =>
                          setSelectedControl(
                            selectedControl === control.id
                              ? null
                              : control.id
                          )
                        }
                      >
                        <MoreHorizontal size={19} />
                      </button>
                      {selectedControl === control.id && (
                        <div className="action-menu">
                          <div className="menu-heading">Update status</div>
                          {statuses.map((status) => (
                            <button
                              key={status}
                              onClick={() => updateStatus(control.id, status)}
                            >
                              {control.status === status ? (
                                <Check size={14} />
                              ) : (
                                <span className="menu-spacer" />
                              )}
                              {status}
                            </button>
                          ))}
                          <div className="menu-divider" />
                          <button
                            className="delete-action"
                            onClick={() => deleteControl(control.id)}
                          >
                            <Trash2 size={14} />
                            Delete control
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredControls.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      <ClipboardCheck size={28} />
                      <strong>No controls found</strong>
                      <p>
                        Try changing your search or filters, or add a new
                        control.
                      </p>
                      <button
                        className="primary-button"
                        onClick={() => setShowModal(true)}
                      >
                        <Plus size={16} /> Add control
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
            Showing {filteredControls.length} of {controls.length} controls
          </span>
          <span className="footer-demo">
            <Clock3 size={14} /> Demo data
          </span>
        </div>
      </section>

      <section className="bottom-grid">
        <article className="info-card">
          <div className="info-icon blue">
            <ClipboardCheck size={19} />
          </div>
          <div>
            <h3>Control testing</h3>
            <p>
              Schedule tests, document results, and record evidence for each
              control.
            </p>
            <button
              className="text-button"
              onClick={() =>
                showNotice("Control testing workflow can be connected next.")
              }
            >
              Explore testing <span>→</span>
            </button>
          </div>
        </article>

        <article className="info-card">
          <div className="info-icon green">
            <CheckCircle2 size={19} />
          </div>
          <div>
            <h3>Evidence and audit trail</h3>
            <p>
              Link control evidence and retain an auditable history of
              compliance activity.
            </p>
            <button
              className="text-button"
              onClick={() =>
                showNotice("Evidence management is a separate Compliance page.")
              }
            >
              Manage evidence <span>→</span>
            </button>
          </div>
        </article>
      </section>

      {showModal && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowModal(false);
          }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="modal-header">
              <div>
                <div className="modal-icon">
                  <ShieldCheck size={21} />
                </div>
                <h2 id="modal-title">Add a control</h2>
                <p>Create a control in your compliance inventory.</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowModal(false)}
                aria-label="Close modal"
              >
                <X size={19} />
              </button>
            </div>

            <div className="form-content">
              <label>
                Control name <span>*</span>
                <input
                  autoFocus
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="e.g. Access review policy"
                />
              </label>

              <div className="form-row">
                <label>
                  Framework
                  <select
                    value={form.framework}
                    onChange={(event) =>
                      setForm({ ...form, framework: event.target.value })
                    }
                  >
                    <option>SOC 2</option>
                    <option>ISO 27001</option>
                    <option>GDPR</option>
                    <option>HIPAA</option>
                    <option>PCI DSS</option>
                    <option>SOC 2, ISO 27001</option>
                    <option>SOC 2, GDPR</option>
                  </select>
                </label>
                <label>
                  Category
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                  >
                    {categories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                Control owner <span>*</span>
                <input
                  value={form.owner}
                  onChange={(event) =>
                    setForm({ ...form, owner: event.target.value })
                  }
                  placeholder="Team or responsible person"
                />
              </label>

              <label>
                Initial status
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status: event.target.value as ControlStatus,
                    })
                  }
                >
                  {statuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="modal-footer">
              <button
                className="secondary-button"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="primary-button" onClick={addControl}>
                <Plus size={16} /> Create control
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .controls-page {
          min-height: 100vh;
          padding: 30px;
          background: #f7f8fc;
          color: #172033;
          font-family: Arial, Helvetica, sans-serif;
        }

        .page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 27px;
        }

        .breadcrumb {
          margin-bottom: 18px;
          color: #8790a3;
          font-size: 12px;
        }

        .breadcrumb span {
          margin: 0 8px;
          color: #c1c7d2;
        }

        .breadcrumb strong {
          color: #49546a;
          font-weight: 600;
        }

        .heading-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .heading-icon {
          display: grid;
          place-items: center;
          width: 48px;
          height: 48px;
          border: 1px solid #dbe5ff;
          border-radius: 13px;
          background: #edf2ff;
          color: #315fe8;
        }

        h1 {
          margin: 0;
          font-size: 27px;
          letter-spacing: -0.7px;
          font-weight: 750;
        }

        .heading-row p {
          margin: 7px 0 0;
          color: #7b8498;
          font-size: 13px;
        }

        .header-actions {
          display: flex;
          gap: 10px;
          flex-shrink: 0;
        }

        button {
          font: inherit;
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
          font-weight: 650;
          transition: background 0.15s ease;
        }

        .primary-button {
          border: 1px solid #315fe8;
          background: #315fe8;
          color: white;
        }

        .primary-button:hover {
          background: #244bc4;
        }

        .secondary-button {
          border: 1px solid #dfe3eb;
          background: #fff;
          color: #39445a;
        }

        .secondary-button:hover {
          background: #f3f5f9;
        }

        .notice {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 18px;
          padding: 12px 15px;
          border: 1px solid #b9e8ce;
          border-radius: 9px;
          background: #effbf4;
          color: #197344;
          font-size: 13px;
        }

        .notice button {
          display: grid;
          place-items: center;
          margin-left: auto;
          border: 0;
          background: transparent;
          color: inherit;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 18px;
        }

        .metric-card {
          min-width: 0;
          padding: 19px;
          border: 1px solid #e7eaf1;
          border-radius: 12px;
          background: #fff;
          box-shadow: 0 2px 5px #18234405;
        }

        .metric-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          color: #737e92;
          font-size: 12px;
          font-weight: 550;
        }

        .metric-icon,
        .info-icon {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 37px;
          height: 37px;
          border-radius: 10px;
        }

        .blue {
          background: #edf2ff;
          color: #315fe8;
        }

        .green {
          background: #e9f9ef;
          color: #16834b;
        }

        .red {
          background: #fff0ed;
          color: #d34b39;
        }

        .purple {
          background: #f2edff;
          color: #7651ce;
        }

        .metric-value {
          margin-top: 15px;
          font-size: 29px;
          font-weight: 750;
          letter-spacing: -0.8px;
        }

        .metric-note {
          margin-top: 7px;
          color: #929bad;
          font-size: 11px;
        }

        .progress-track,
        .mini-track {
          overflow: hidden;
          background: #edf0f5;
          border-radius: 20px;
        }

        .progress-track {
          height: 5px;
          margin-top: 13px;
        }

        .progress-fill {
          height: 100%;
          border-radius: inherit;
          background: #7651ce;
        }

        .attention-banner {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 21px;
          padding: 15px 17px;
          border: 1px solid #f1dfb7;
          border-radius: 11px;
          background: #fffaf0;
        }

        .attention-icon {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          border-radius: 10px;
          background: #fff0cf;
          color: #a96b0b;
        }

        .attention-copy {
          min-width: 0;
        }

        .attention-copy strong {
          color: #6f4a0b;
          font-size: 13px;
        }

        .attention-copy p {
          margin: 5px 0 0;
          color: #92784b;
          font-size: 12px;
          line-height: 1.5;
        }

        .text-button {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 5px 0;
          border: 0;
          background: transparent;
          color: #315fe8;
          font-size: 12px;
          font-weight: 650;
          white-space: nowrap;
        }

        .attention-banner > .text-button {
          margin-left: auto;
        }

        .side-arrow {
          transform: rotate(-90deg);
        }

        .table-card {
          overflow: visible;
          border: 1px solid #e7eaf1;
          border-radius: 12px;
          background: white;
          box-shadow: 0 2px 5px #18234405;
        }

        .table-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 21px 21px 17px;
        }

        .table-heading h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 720;
        }

        .table-heading p {
          margin: 6px 0 0;
          color: #8a93a5;
          font-size: 12px;
        }

        .table-count {
          padding: 6px 10px;
          border: 1px solid #e7eaf1;
          border-radius: 7px;
          color: #657086;
          font-size: 11px;
          white-space: nowrap;
        }

        .filter-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          padding: 0 21px 17px;
        }

        .search-box,
        .filter-select {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 37px;
          padding: 0 11px;
          border: 1px solid #e2e6ee;
          border-radius: 8px;
          background: white;
          color: #8791a4;
        }

        .search-box {
          flex: 1 1 250px;
          min-width: 180px;
        }

        .search-box input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: #263147;
          font-size: 12px;
        }

        .search-box input::placeholder {
          color: #a2aaba;
        }

        .search-box button {
          display: grid;
          place-items: center;
          border: 0;
          background: transparent;
          color: #8791a4;
        }

        .filter-select {
          flex: 0 0 auto;
        }

        .filter-select select {
          max-width: 155px;
          border: 0;
          outline: 0;
          background: transparent;
          color: #59647a;
          font-size: 12px;
          cursor: pointer;
        }

        .bulk-bar {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px 21px;
          border-top: 1px solid #e7eaf1;
          background: #f4f7ff;
          color: #344b89;
          font-size: 12px;
        }

        .bulk-bar button {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border: 0;
          background: transparent;
          color: #315fe8;
          font-size: 12px;
          font-weight: 600;
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

        thead {
          background: #f8f9fc;
        }

        th {
          padding: 12px 13px;
          border-top: 1px solid #eef0f5;
          border-bottom: 1px solid #e9ecf2;
          color: #8b94a7;
          font-size: 9px;
          font-weight: 750;
          letter-spacing: 0.65px;
        }

        td {
          position: relative;
          padding: 15px 13px;
          border-bottom: 1px solid #eff1f5;
          color: #4c576c;
          font-size: 11px;
          vertical-align: middle;
        }

        tbody tr:last-child td {
          border-bottom: 0;
        }

        tbody tr:hover {
          background: #fbfcff;
        }

        .check-cell {
          width: 37px;
          padding-left: 20px;
          padding-right: 0;
        }

        input[type="checkbox"] {
          width: 14px;
          height: 14px;
          margin: 0;
          accent-color: #315fe8;
          cursor: pointer;
        }

        .control-name {
          max-width: 205px;
          overflow: hidden;
          color: #253047;
          font-size: 11px;
          font-weight: 650;
          text-overflow: ellipsis;
        }

        .control-id {
          margin-top: 5px;
          color: #9aa2b2;
          font-size: 10px;
        }

        .framework-text {
          color: #59647a;
          font-size: 10px;
        }

        .category-tag {
          display: inline-block;
          padding: 5px 7px;
          border: 1px solid #e7eaf1;
          border-radius: 5px;
          background: #fafbfe;
          color: #667188;
          font-size: 10px;
        }

        .owner-cell {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #59647a;
        }

        .owner-avatar {
          display: grid;
          place-items: center;
          width: 25px;
          height: 25px;
          border-radius: 7px;
          background: #edf2ff;
          color: #315fe8;
        }

        .effectiveness-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #465168;
          font-size: 11px;
        }

        .mini-track {
          width: 52px;
          height: 5px;
        }

        .mini-fill {
          height: 100%;
          border-radius: inherit;
          background: #21965b;
        }

        .mini-fill.low {
          background: #e6a23d;
        }

        .muted {
          color: #a6adba;
        }

        .date-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #7b8598;
          font-size: 10px;
        }

        .action-cell {
          width: 43px;
          padding-right: 16px;
        }

        .action-wrap {
          position: relative;
          display: flex;
          justify-content: flex-end;
        }

        .icon-button {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          border: 1px solid transparent;
          border-radius: 7px;
          background: transparent;
          color: #788297;
        }

        .icon-button:hover {
          border-color: #e4e8f0;
          background: #f7f8fc;
        }

        .action-menu {
          position: absolute;
          z-index: 20;
          top: 35px;
          right: 0;
          width: 195px;
          padding: 6px;
          border: 1px solid #e4e8f0;
          border-radius: 9px;
          background: white;
          box-shadow: 0 10px 30px #1924401a;
        }

        .menu-heading {
          padding: 8px 9px;
          color: #929bad;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .action-menu button {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 9px;
          border: 0;
          border-radius: 5px;
          background: transparent;
          color: #4d5870;
          text-align: left;
          font-size: 11px;
        }

        .action-menu button:hover {
          background: #f3f5fa;
        }

        .menu-spacer {
          width: 14px;
          flex-shrink: 0;
        }

        .menu-divider {
          height: 1px;
          margin: 5px 0;
          background: #eceef3;
        }

        .action-menu .delete-action {
          color: #d43f3f;
        }

        .table-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 21px;
          border-top: 1px solid #edf0f5;
          color: #939bad;
          font-size: 10px;
        }

        .footer-demo {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .empty-state {
          display: flex;
          align-items: center;
          flex-direction: column;
          gap: 10px;
          padding: 40px 15px;
          color: #8893a7;
          text-align: center;
          white-space: normal;
        }

        .empty-state strong {
          color: #37435a;
          font-size: 14px;
        }

        .empty-state p {
          margin: 0 0 6px;
          font-size: 12px;
        }

        .bottom-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-top: 20px;
        }

        .info-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 20px;
          border: 1px solid #e7eaf1;
          border-radius: 12px;
          background: white;
        }

        .info-icon {
          width: 40px;
          height: 40px;
        }

        .info-card h3 {
          margin: 2px 0 8px;
          color: #28334a;
          font-size: 13px;
        }

        .info-card p {
          max-width: 380px;
          margin: 0 0 9px;
          color: #858fa2;
          font-size: 11px;
          line-height: 1.7;
        }

        .modal-overlay {
          position: fixed;
          z-index: 100;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #11182770;
          backdrop-filter: blur(3px);
        }

        .modal {
          width: 100%;
          max-width: 540px;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          border: 1px solid #e5e8ef;
          border-radius: 15px;
          background: white;
          box-shadow: 0 24px 70px #10182e30;
        }

        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 24px 24px 19px;
          border-bottom: 1px solid #edf0f5;
        }

        .modal-icon {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          margin-bottom: 13px;
          border-radius: 11px;
          background: #edf2ff;
          color: #315fe8;
        }

        .modal-header h2 {
          margin: 0;
          color: #202b41;
          font-size: 19px;
        }

        .modal-header p {
          margin: 7px 0 0;
          color: #8b94a6;
          font-size: 12px;
        }

        .form-content {
          display: flex;
          flex-direction: column;
          gap: 17px;
          padding: 22px 24px;
        }

        .form-content label {
          display: flex;
          flex-direction: column;
          gap: 8px;
          color: #455067;
          font-size: 12px;
          font-weight: 650;
        }

        .form-content label span {
          display: inline;
          color: #d94444;
        }

        .form-content input,
        .form-content select {
          width: 100%;
          height: 40px;
          padding: 0 11px;
          border: 1px solid #dfe4ed;
          border-radius: 7px;
          outline: none;
          background: white;
          color: #354158;
          font: inherit;
          font-size: 12px;
        }

        .form-content input:focus,
        .form-content select:focus {
          border-color: #7190f5;
          box-shadow: 0 0 0 3px #315fe817;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 13px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 16px 24px;
          border-top: 1px solid #edf0f5;
          background: #fbfcfe;
        }

        @media (max-width: 1100px) {
          .controls-page {
            padding: 22px;
          }

          .summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .page-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .header-actions {
            align-self: flex-end;
          }
        }

        @media (max-width: 650px) {
          .controls-page {
            padding: 15px;
          }

          h1 {
            font-size: 22px;
          }

          .heading-row {
            align-items: flex-start;
          }

          .heading-icon {
            width: 42px;
            height: 42px;
          }

          .summary-grid {
            gap: 10px;
          }

          .metric-card {
            padding: 14px;
          }

          .metric-value {
            font-size: 25px;
          }

          .metric-top {
            font-size: 11px;
          }

          .metric-icon {
            width: 31px;
            height: 31px;
          }

          .attention-banner {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .attention-banner > .text-button {
            margin-left: 50px;
          }

          .filter-bar {
            padding: 0 14px 14px;
          }

          .search-box {
            flex-basis: 100%;
          }

          .filter-select {
            flex: 1 1 auto;
          }

          .filter-select select {
            max-width: 100%;
            width: 100%;
          }

          .table-heading {
            padding: 17px 14px;
          }

          .table-footer {
            padding: 13px 14px;
          }

          .bottom-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .modal-header,
          .form-content,
          .modal-footer {
            padding-left: 17px;
            padding-right: 17px;
          }
        }
      `}</style>
    </main>
  );
}

function StatusBadge({ status }: { status: ControlStatus }) {
  const className =
    status === "Implemented"
      ? "implemented"
      : status === "In progress"
        ? "in-progress"
        : status === "Needs remediation"
          ? "remediation"
          : "not-tested";

  return (
    <>
      <span className={`status-badge ${className}`}>
        <span className="status-dot" />
        {status}
      </span>
      <style jsx>{`
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
          border-radius: 50%;
          background: currentColor;
        }

        .implemented {
          background: #eaf8ef;
          color: #16834b;
        }

        .in-progress {
          background: #fff5df;
          color: #a46a08;
        }

        .remediation {
          background: #fff0ed;
          color: #d04435;
        }

        .not-tested {
          background: #f0f2f6;
          color: #778196;
        }
      `}</style>
    </>
  );
}
