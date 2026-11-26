
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileText,
  Plus,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

type Framework = {
  id: number;
  name: string;
  category: string;
  score: number;
  status: string;
  owner: string;
};

const startingFrameworks: Framework[] = [
  {
    id: 1,
    name: "SOC 2 Type II",
    category: "Security",
    score: 94,
    status: "Compliant",
    owner: "Security Team",
  },
  {
    id: 2,
    name: "ISO 27001",
    category: "Information Security",
    score: 88,
    status: "In progress",
    owner: "Governance Team",
  },
  {
    id: 3,
    name: "GDPR",
    category: "Data Privacy",
    score: 76,
    status: "Needs attention",
    owner: "Privacy Team",
  },
  {
    id: 4,
    name: "HIPAA",
    category: "Healthcare Data",
    score: 91,
    status: "Compliant",
    owner: "Compliance Team",
  },
  {
    id: 5,
    name: "PCI DSS",
    category: "Payment Security",
    score: 82,
    status: "In progress",
    owner: "Platform Team",
  },
];

const startingTasks = [
  { id: 1, title: "Review data retention policy", priority: "High" },
  { id: 2, title: "Collect SOC 2 audit evidence", priority: "Medium" },
  { id: 3, title: "Review AI model risk register", priority: "High" },
  { id: 4, title: "Complete vendor security review", priority: "Low" },
];

export default function ComplianceOverviewPage() {
  const [frameworks, setFrameworks] = useState(startingFrameworks);
  const [tasks, setTasks] = useState(startingTasks);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Security");
  const [message, setMessage] = useState("");

  const filteredFrameworks = useMemo(() => {
    return frameworks.filter((framework) => {
      const matchesSearch =
        framework.name.toLowerCase().includes(search.toLowerCase()) ||
        framework.category.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" || framework.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [frameworks, search, filter]);

  const averageScore = frameworks.length
    ? Math.round(
        frameworks.reduce((sum, item) => sum + item.score, 0) /
          frameworks.length
      )
    : 0;

  const compliantCount = frameworks.filter(
    (item) => item.status === "Compliant"
  ).length;

  const attentionCount = frameworks.filter(
    (item) => item.status === "Needs attention"
  ).length;

  function addFramework() {
    const name = newName.trim();

    if (!name) {
      setMessage("Please enter a framework name.");
      return;
    }

    if (
      frameworks.some(
        (item) => item.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      setMessage("This framework already exists.");
      return;
    }

    setFrameworks((current) => [
      ...current,
      {
        id: Date.now(),
        name,
        category: newCategory,
        score: 0,
        status: "In progress",
        owner: "Unassigned",
      },
    ]);

    setNewName("");
    setModalOpen(false);
    setMessage("Framework added successfully.");
  }

  function exportReport() {
    const header = ["Framework", "Category", "Score", "Status", "Owner"];

    const rows = frameworks.map((item) => [
      item.name,
      item.category,
      String(item.score),
      item.status,
      item.owner,
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((value) => `"${value.replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "modelnow-compliance-report.csv";
    link.click();

    URL.revokeObjectURL(url);
    setMessage("Report exported.");
  }

  const colors = {
    blue: "#315fea",
    green: "#16845b",
    orange: "#bd7518",
    red: "#d64545",
    text: "#172033",
    muted: "#758096",
    border: "#e6eaf1",
  };

  return (
    <main className="page">
      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          padding: 28px;
          background: #f5f7fb;
          color: ${colors.text};
          font-family: Arial, Helvetica, sans-serif;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 25px;
        }

        .eyebrow {
          color: ${colors.blue};
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          margin-bottom: 9px;
        }

        h1 {
          font-size: 29px;
          margin: 0;
          letter-spacing: -0.7px;
        }

        h2 {
          font-size: 16px;
          margin: 0;
        }

        .subtitle {
          color: ${colors.muted};
          font-size: 13px;
          line-height: 1.7;
          margin-top: 9px;
        }

        .actions {
          display: flex;
          gap: 9px;
          flex-wrap: wrap;
        }

        .button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border: 1px solid ${colors.border};
          background: white;
          color: ${colors.text};
          padding: 10px 13px;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .primary {
          background: ${colors.blue};
          color: white;
          border-color: ${colors.blue};
        }

        .metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 19px;
        }

        .card {
          background: white;
          border: 1px solid ${colors.border};
          border-radius: 14px;
          padding: 19px;
          min-width: 0;
        }

        .metric-label {
          font-size: 12px;
          color: ${colors.muted};
          margin-top: 12px;
        }

        .metric-number {
          font-size: 29px;
          font-weight: 800;
          margin: 12px 0 8px;
        }

        .metric-note {
          font-size: 11px;
          color: ${colors.muted};
        }

        .icon-box {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 10px;
        }

        .layout {
          display: grid;
          grid-template-columns: minmax(0, 1.7fr) minmax(270px, 1fr);
          gap: 18px;
          align-items: start;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 17px;
        }

        .muted {
          color: ${colors.muted};
          font-size: 12px;
          margin-top: 6px;
        }

        .filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .search,
        .select,
        .field {
          border: 1px solid ${colors.border};
          background: white;
          border-radius: 8px;
          padding: 10px;
          font-size: 12px;
          color: ${colors.text};
          outline: none;
        }

        .search {
          width: 175px;
          max-width: 100%;
        }

        .select {
          max-width: 100%;
        }

        .table-wrap {
          overflow-x: auto;
        }

        table {
          border-collapse: collapse;
          width: 100%;
          min-width: 540px;
        }

        th {
          text-align: left;
          color: ${colors.muted};
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 12px 9px;
          border-bottom: 1px solid ${colors.border};
        }

        td {
          padding: 14px 9px;
          font-size: 12px;
          border-bottom: 1px solid #edf0f5;
        }

        tbody tr:last-child td {
          border-bottom: 0;
        }

        .name {
          font-weight: 700;
        }

        .category {
          color: ${colors.muted};
          font-size: 11px;
          margin-top: 5px;
        }

        .status {
          display: inline-block;
          padding: 5px 8px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }

        .score {
          font-weight: 700;
        }

        .progress {
          width: 65px;
          height: 5px;
          background: #edf0f5;
          border-radius: 5px;
          overflow: hidden;
          margin-top: 6px;
        }

        .progress-fill {
          height: 100%;
          background: ${colors.blue};
        }

        .task {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 14px 0;
          border-bottom: 1px solid #edf0f5;
        }

        .task:last-child {
          border-bottom: 0;
        }

        .task-title {
          font-size: 12px;
          font-weight: 700;
          line-height: 1.6;
        }

        .priority {
          font-size: 10px;
          padding: 5px 7px;
          border-radius: 6px;
          font-weight: 700;
          white-space: nowrap;
        }

        .empty {
          text-align: center;
          color: ${colors.muted};
          font-size: 12px;
          padding: 25px 10px;
        }

        .workspace {
          margin-top: 18px;
        }

        .workspace-links {
          display: flex;
          gap: 9px;
          flex-wrap: wrap;
          margin-top: 15px;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          background: #11182780;
        }

        .modal {
          width: 100%;
          max-width: 420px;
          background: white;
          border-radius: 15px;
          padding: 23px;
          box-shadow: 0 20px 60px #0002;
        }

        .modal-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          margin: 15px 0 7px;
        }

        .field {
          width: 100%;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          margin-top: 22px;
        }

        .notice {
          position: fixed;
          right: 20px;
          bottom: 20px;
          z-index: 110;
          background: #172033;
          color: white;
          border: 0;
          border-radius: 9px;
          padding: 12px 16px;
          font-size: 12px;
          cursor: pointer;
        }

        @media (max-width: 1050px) {
          .metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .page {
            padding: 15px;
          }

          h1 {
            font-size: 24px;
          }

          .metrics {
            gap: 10px;
          }

          .card {
            padding: 14px;
          }

          .metric-number {
            font-size: 24px;
          }

          .search {
            width: 100%;
          }
        }
      `}</style>

      <header className="header">
        <div>
          <div className="eyebrow">ModelNow / Admin / Compliance</div>
          <h1>Compliance Overview</h1>
          <p className="subtitle">
            Monitor compliance readiness, manage frameworks, and track
            important actions across your organization.
          </p>
        </div>

        <div className="actions">
          <button className="button" onClick={exportReport}>
            <Download size={15} /> Export report
          </button>
          <button
            className="button primary"
            onClick={() => setModalOpen(true)}
          >
            <Plus size={15} /> Add framework
          </button>
        </div>
      </header>

      <section className="metrics">
        <div className="card">
          <div className="icon-box" style={{ background: "#eaf0ff", color: colors.blue }}>
            <ShieldCheck size={20} />
          </div>
          <div className="metric-label">Average compliance score</div>
          <div className="metric-number">{averageScore}%</div>
          <div className="metric-note">Across all tracked frameworks</div>
        </div>

        <div className="card">
          <div className="icon-box" style={{ background: "#e7f7ef", color: colors.green }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="metric-label">Compliant frameworks</div>
          <div className="metric-number">{compliantCount}</div>
          <div className="metric-note">Currently marked compliant</div>
        </div>

        <div className="card">
          <div className="icon-box" style={{ background: "#fff2e3", color: colors.orange }}>
            <AlertTriangle size={20} />
          </div>
          <div className="metric-label">Needs attention</div>
          <div className="metric-number">{attentionCount}</div>
          <div className="metric-note">Frameworks requiring review</div>
        </div>

        <div className="card">
          <div className="icon-box" style={{ background: "#f0eaff", color: "#7651c9" }}>
            <ClipboardCheck size={20} />
          </div>
          <div className="metric-label">Open tasks</div>
          <div className="metric-number">{tasks.length}</div>
          <div className="metric-note">Outstanding compliance actions</div>
        </div>
      </section>

      <div className="layout">
        <section className="card">
          <div className="section-header">
            <div>
              <h2>Compliance frameworks</h2>
              <div className="muted">Readiness and framework status</div>
            </div>

            <div className="filters">
              <input
                className="search"
                placeholder="Search frameworks..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search frameworks"
              />

              <select
                className="select"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                aria-label="Filter frameworks"
              >
                <option value="All">All statuses</option>
                <option value="Compliant">Compliant</option>
                <option value="In progress">In progress</option>
                <option value="Needs attention">Needs attention</option>
              </select>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Framework</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Owner</th>
                </tr>
              </thead>

              <tbody>
                {filteredFrameworks.map((framework) => {
                  const statusColor =
                    framework.status === "Compliant"
                      ? colors.green
                      : framework.status === "Needs attention"
                        ? colors.red
                        : colors.orange;

                  const statusBackground =
                    framework.status === "Compliant"
                      ? "#e7f7ef"
                      : framework.status === "Needs attention"
                        ? "#fff0ef"
                        : "#fff4e3";

                  return (
                    <tr key={framework.id}>
                      <td>
                        <div className="name">{framework.name}</div>
                        <div className="category">{framework.category}</div>
                      </td>

                      <td>
                        <div className="score">{framework.score}%</div>
                        <div className="progress">
                          <div
                            className="progress-fill"
                            style={{ width: `${framework.score}%` }}
                          />
                        </div>
                      </td>

                      <td>
                        <span
                          className="status"
                          style={{
                            color: statusColor,
                            background: statusBackground,
                          }}
                        >
                          {framework.status}
                        </span>
                      </td>

                      <td>{framework.owner}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredFrameworks.length === 0 && (
              <div className="empty">No matching frameworks found.</div>
            )}
          </div>
        </section>

        <section className="card">
          <div className="section-header">
            <div>
              <h2>Priority tasks</h2>
              <div className="muted">Actions for your compliance team</div>
            </div>
            <Activity size={20} color={colors.blue} />
          </div>

          {tasks.length === 0 ? (
            <div className="empty">
              <CheckCircle2 size={25} />
              <p>All listed tasks are complete.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div className="task" key={task.id}>
                <button
                  className="button"
                  title="Mark task complete"
                  aria-label={`Complete ${task.title}`}
                  style={{ padding: 6, color: colors.green }}
                  onClick={() =>
                    setTasks((current) =>
                      current.filter((item) => item.id !== task.id)
                    )
                  }
                >
                  <CheckCircle2 size={15} />
                </button>

                <div style={{ flex: 1 }}>
                  <div className="task-title">{task.title}</div>
                  <div className="muted">Compliance action</div>
                </div>

                <span
                  className="priority"
                  style={{
                    color:
                      task.priority === "High"
                        ? colors.red
                        : task.priority === "Medium"
                          ? colors.orange
                          : colors.green,
                    background:
                      task.priority === "High"
                        ? "#fff0ef"
                        : task.priority === "Medium"
                          ? "#fff4e3"
                          : "#e7f7ef",
                  }}
                >
                  {task.priority}
                </span>
              </div>
            ))
          )}
        </section>
      </div>

      <section className="card workspace">
        <div className="section-header">
          <div>
            <h2>Compliance workspace</h2>
            <div className="muted">
              Open a dedicated area to continue managing your compliance program.
            </div>
          </div>
          <FileText size={21} color={colors.blue} />
        </div>

        <div className="workspace-links">
          <button
            className="button"
            onClick={() => (window.location.href = "/compliance/compliance-frameworks")}
          >
            Frameworks <ArrowRight size={14} />
          </button>

          <button
            className="button"
            onClick={() => (window.location.href = "/compliance/compliance-requirements")}
          >
            Requirements <ArrowRight size={14} />
          </button>

          <button
            className="button"
            onClick={() => (window.location.href = "/compliance/controls-management")}
          >
            Controls <ArrowRight size={14} />
          </button>

          <button
            className="button"
            onClick={() => (window.location.href = "/compliance/evidence-management")}
          >
            Evidence <ArrowRight size={14} />
          </button>

          <button
            className="button"
            onClick={() => (window.location.href = "/compliance/risk-assessments")}
          >
            Risk assessments <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <section className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <h2>Add compliance framework</h2>
              <button
                className="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close dialog"
              >
                <X size={15} />
              </button>
            </div>

            <label className="field-label" htmlFor="framework-name">
              Framework name
            </label>
            <input
              id="framework-name"
              className="field"
              placeholder="e.g. NIST AI RMF"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
            />

            <label className="field-label" htmlFor="framework-category">
              Category
            </label>
            <select
              id="framework-category"
              className="field"
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
            >
              <option>Security</option>
              <option>Information Security</option>
              <option>Data Privacy</option>
              <option>AI Governance</option>
              <option>Payment Security</option>
              <option>Healthcare Data</option>
              <option>Other</option>
            </select>

            <div className="modal-actions">
              <button className="button" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button className="button primary" onClick={addFramework}>
                <Plus size={14} /> Add framework
              </button>
            </div>
          </section>
        </div>
      )}

      {message && (
        <button className="notice" onClick={() => setMessage("")}>
          {message} <span style={{ marginLeft: 8 }}>×</span>
        </button>
      )}
    </main>
  );
}
