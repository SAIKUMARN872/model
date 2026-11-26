
"use client";

import { useMemo, useState } from "react";
import {
  ClipboardList,
  Search,
  Plus,
  Download,
  X,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  FileText,
  MoreHorizontal,
  Trash2,
  Filter,
  CircleDashed,
} from "lucide-react";

type Requirement = {
  id: number;
  title: string;
  framework: string;
  category: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Not started" | "In progress" | "Implemented" | "Needs review";
  owner: string;
  dueDate: string;
};

const initialRequirements: Requirement[] = [
  {
    id: 1,
    title: "Enforce multi-factor authentication",
    framework: "SOC 2 Type II",
    category: "Access Control",
    priority: "Critical",
    status: "Implemented",
    owner: "Security Team",
    dueDate: "Nov 08, 2026",
  },
  {
    id: 2,
    title: "Document data retention procedures",
    framework: "GDPR",
    category: "Data Privacy",
    priority: "High",
    status: "In progress",
    owner: "Privacy Team",
    dueDate: "Nov 10, 2026",
  },
  {
    id: 3,
    title: "Maintain incident response plan",
    framework: "ISO 27001",
    category: "Incident Management",
    priority: "High",
    status: "Needs review",
    owner: "Security Team",
    dueDate: "Nov 12, 2026",
  },
  {
    id: 4,
    title: "Review privileged account access",
    framework: "SOC 2 Type II",
    category: "Identity Management",
    priority: "Critical",
    status: "In progress",
    owner: "IT Operations",
    dueDate: "Nov 09, 2026",
  },
  {
    id: 5,
    title: "Maintain vendor processing agreements",
    framework: "GDPR",
    category: "Third-party Privacy",
    priority: "Medium",
    status: "Not started",
    owner: "Legal Team",
    dueDate: "Nov 18, 2026",
  },
  {
    id: 6,
    title: "Review encryption at rest",
    framework: "PCI DSS",
    category: "Data Protection",
    priority: "High",
    status: "Implemented",
    owner: "Platform Team",
    dueDate: "Nov 15, 2026",
  },
  {
    id: 7,
    title: "Validate AI model governance records",
    framework: "NIST AI RMF",
    category: "AI Governance",
    priority: "Medium",
    status: "Not started",
    owner: "AI Governance",
    dueDate: "Nov 20, 2026",
  },
];

const blue = "#315fea";
const ink = "#172033";
const muted = "#758096";
const border = "#e5eaf2";

export default function ComplianceRequirementsPage() {
  const [requirements, setRequirements] = useState(initialRequirements);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [menuId, setMenuId] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({
    title: "",
    framework: "SOC 2 Type II",
    category: "Security",
    priority: "Medium" as Requirement["priority"],
    owner: "",
    dueDate: "2026-11-20",
  });

  const filtered = useMemo(() => {
    const term = search.toLowerCase();

    return requirements.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(term) ||
        item.framework.toLowerCase().includes(term) ||
        item.owner.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" || item.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [requirements, search, statusFilter, priorityFilter]);

  const implemented = requirements.filter(
    (item) => item.status === "Implemented"
  ).length;

  const inProgress = requirements.filter(
    (item) => item.status === "In progress"
  ).length;

  const notStarted = requirements.filter(
    (item) => item.status === "Not started"
  ).length;

  const needsReview = requirements.filter(
    (item) => item.status === "Needs review"
  ).length;

  function updateStatus(id: number, status: Requirement["status"]) {
    setRequirements((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item))
    );
    setMenuId(null);
    setNotice("Requirement status updated.");
  }

  function addRequirement() {
    if (!form.title.trim()) {
      setNotice("Enter a requirement title.");
      return;
    }

    const newRequirement: Requirement = {
      id: Date.now(),
      title: form.title.trim(),
      framework: form.framework,
      category: form.category,
      priority: form.priority,
      status: "Not started",
      owner: form.owner.trim() || "Unassigned",
      dueDate: form.dueDate
        ? new Date(`${form.dueDate}T12:00:00`).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })
        : "Not scheduled",
    };

    setRequirements((current) => [newRequirement, ...current]);
    setForm({
      title: "",
      framework: "SOC 2 Type II",
      category: "Security",
      priority: "Medium",
      owner: "",
      dueDate: "2026-11-20",
    });
    setShowModal(false);
    setNotice("Requirement added.");
  }

  function exportCsv() {
    const header = [
      "Requirement",
      "Framework",
      "Category",
      "Priority",
      "Status",
      "Owner",
      "Due Date",
    ];

    const rows = requirements.map((item) => [
      item.title,
      item.framework,
      item.category,
      item.priority,
      item.status,
      item.owner,
      item.dueDate,
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row.map((value) => `"${value.replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-compliance-requirements.csv";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Requirements exported.");
  }

  function removeRequirement(id: number) {
    setRequirements((current) => current.filter((item) => item.id !== id));
    setMenuId(null);
    setNotice("Requirement removed from this demo view.");
  }

  function statusStyle(status: Requirement["status"]) {
    switch (status) {
      case "Implemented":
        return { color: "#16845b", background: "#e7f7ef" };
      case "In progress":
        return { color: "#bd7518", background: "#fff4e3" };
      case "Needs review":
        return { color: "#7651c9", background: "#f0eaff" };
      default:
        return { color: "#697386", background: "#edf0f5" };
    }
  }

  function priorityStyle(priority: Requirement["priority"]) {
    switch (priority) {
      case "Critical":
        return { color: "#c62828", background: "#ffebeb" };
      case "High":
        return { color: "#d64545", background: "#fff0ef" };
      case "Medium":
        return { color: "#bd7518", background: "#fff4e3" };
      default:
        return { color: "#16845b", background: "#e7f7ef" };
    }
  }

  return (
    <main className="requirements-page">
      <style jsx>{`
        * { box-sizing: border-box; }
        .requirements-page {
          min-height: 100vh;
          padding: 28px;
          background: #f5f7fb;
          color: ${ink};
          font-family: Arial, Helvetica, sans-serif;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }
        .eyebrow {
          font-size: 11px;
          font-weight: 800;
          color: ${blue};
          text-transform: uppercase;
          letter-spacing: 1.2px;
          margin-bottom: 9px;
        }
        h1 { font-size: 28px; margin: 0; letter-spacing: -.6px; }
        h2 { font-size: 16px; margin: 0; }
        .subtitle { font-size: 13px; color: ${muted}; margin-top: 9px; line-height: 1.6; }
        .actions, .filters { display: flex; gap: 9px; flex-wrap: wrap; }
        .button {
          display: inline-flex; align-items: center; justify-content: center;
          gap: 7px; border: 1px solid ${border}; background: white;
          color: ${ink}; border-radius: 9px; padding: 10px 13px;
          font-size: 12px; font-weight: 700; cursor: pointer;
        }
        .primary { background: ${blue}; border-color: ${blue}; color: white; }
        .metrics {
          display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px; margin-bottom: 18px;
        }
        .card {
          background: white; border: 1px solid ${border};
          border-radius: 14px; padding: 19px; min-width: 0;
        }
        .metric-icon {
          display: grid; place-items: center; width: 38px; height: 38px;
          border-radius: 10px; margin-bottom: 13px;
        }
        .metric-label { font-size: 12px; color: ${muted}; }
        .metric-number { font-size: 27px; font-weight: 800; margin: 12px 0 7px; }
        .metric-foot { color: ${muted}; font-size: 11px; }
        .toolbar {
          display: flex; align-items: center; justify-content: space-between;
          gap: 14px; flex-wrap: wrap; margin-bottom: 18px;
        }
        .muted { font-size: 12px; color: ${muted}; margin-top: 6px; }
        .search, .select, .field {
          border: 1px solid ${border}; border-radius: 8px; padding: 10px;
          font-size: 12px; color: ${ink}; background: white; outline: none;
        }
        .search { width: 230px; max-width: 100%; }
        .select { max-width: 100%; }
        .table-wrap { overflow-x: auto; }
        table { border-collapse: collapse; width: 100%; min-width: 850px; }
        th {
          text-align: left; padding: 13px 10px; color: ${muted};
          font-size: 10px; text-transform: uppercase; letter-spacing: .5px;
          border-bottom: 1px solid ${border};
        }
        td { padding: 14px 10px; font-size: 12px; border-bottom: 1px solid #edf0f5; }
        tbody tr:last-child td { border-bottom: 0; }
        .requirement-title { font-weight: 700; line-height: 1.5; max-width: 290px; }
        .category { color: ${muted}; font-size: 11px; margin-top: 5px; }
        .badge {
          display: inline-flex; align-items: center; border-radius: 20px;
          padding: 5px 8px; font-size: 10px; font-weight: 700; white-space: nowrap;
        }
        .row-actions { position: relative; display: flex; justify-content: flex-end; }
        .menu {
          position: absolute; right: 0; top: 35px; z-index: 10;
          width: 175px; background: white; border: 1px solid ${border};
          border-radius: 10px; padding: 5px; box-shadow: 0 10px 30px #00000012;
        }
        .menu button {
          display: flex; align-items: center; gap: 8px; width: 100%;
          padding: 9px; border: 0; background: white; border-radius: 6px;
          text-align: left; font-size: 11px; color: ${ink}; cursor: pointer;
        }
        .menu button:hover { background: #f5f7fb; }
        .empty { text-align: center; padding: 30px; color: ${muted}; font-size: 13px; }
        .modal-backdrop {
          position: fixed; inset: 0; background: #11182780; z-index: 50;
          display: flex; align-items: center; justify-content: center; padding: 18px;
        }
        .modal {
          background: white; width: 100%; max-width: 480px;
          max-height: 90vh; overflow-y: auto; border-radius: 15px;
          padding: 24px; box-shadow: 0 20px 60px #0002;
        }
        .modal-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .field-label { display: block; font-size: 12px; font-weight: 700; margin: 14px 0 7px; }
        .field { width: 100%; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 9px; margin-top: 22px; }
        .notice {
          position: fixed; bottom: 20px; right: 20px; z-index: 100;
          border: 0; background: ${ink}; color: white; border-radius: 9px;
          padding: 12px 16px; font-size: 12px; cursor: pointer;
        }
        @media (max-width: 1000px) {
          .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 600px) {
          .requirements-page { padding: 15px; }
          h1 { font-size: 23px; }
          .metrics { gap: 9px; }
          .card { padding: 14px; }
          .metric-number { font-size: 23px; }
          .search { width: 100%; }
        }
      `}</style>

      <header className="header">
        <div>
          <div className="eyebrow">ModelNow / Admin / Compliance</div>
          <h1>Compliance Requirements</h1>
          <p className="subtitle">
            Track regulatory obligations, assign ownership, and monitor implementation progress.
          </p>
        </div>
        <div className="actions">
          <button className="button" onClick={exportCsv}>
            <Download size={15} /> Export CSV
          </button>
          <button className="button primary" onClick={() => setShowModal(true)}>
            <Plus size={15} /> Add requirement
          </button>
        </div>
      </header>

      <section className="metrics">
        <div className="card">
          <div className="metric-icon" style={{ background: "#eaf0ff", color: blue }}>
            <ClipboardList size={20} />
          </div>
          <div className="metric-label">Total requirements</div>
          <div className="metric-number">{requirements.length}</div>
          <div className="metric-foot">Across tracked frameworks</div>
        </div>
        <div className="card">
          <div className="metric-icon" style={{ background: "#e7f7ef", color: "#16845b" }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="metric-label">Implemented</div>
          <div className="metric-number">{implemented}</div>
          <div className="metric-foot">Marked as implemented</div>
        </div>
        <div className="card">
          <div className="metric-icon" style={{ background: "#fff4e3", color: "#bd7518" }}>
            <Clock3 size={20} />
          </div>
          <div className="metric-label">In progress</div>
          <div className="metric-number">{inProgress}</div>
          <div className="metric-foot">Work underway</div>
        </div>
        <div className="card">
          <div className="metric-icon" style={{ background: "#fff0ef", color: "#d64545" }}>
            <AlertTriangle size={20} />
          </div>
          <div className="metric-label">Outstanding</div>
          <div className="metric-number">{notStarted + needsReview}</div>
          <div className="metric-foot">{needsReview} require review</div>
        </div>
      </section>

      <section className="card">
        <div className="toolbar">
          <div>
            <h2>Requirements register</h2>
            <div className="muted">
              Showing {filtered.length} of {requirements.length} requirements
            </div>
          </div>
          <div className="filters">
            <input
              className="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search requirements..."
              aria-label="Search requirements"
            />
            <select
              className="select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
            >
              <option value="All">All statuses</option>
              <option value="Not started">Not started</option>
              <option value="In progress">In progress</option>
              <option value="Implemented">Implemented</option>
              <option value="Needs review">Needs review</option>
            </select>
            <select
              className="select"
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              aria-label="Filter by priority"
            >
              <option value="All">All priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Requirement</th>
                <th>Framework</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Due date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="requirement-title">{item.title}</div>
                    <div className="category">{item.category}</div>
                  </td>
                  <td>{item.framework}</td>
                  <td>
                    <span className="badge" style={priorityStyle(item.priority)}>
                      {item.priority}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={statusStyle(item.status)}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item.owner}</td>
                  <td>{item.dueDate}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="button"
                        style={{ padding: 7 }}
                        aria-label={`Actions for ${item.title}`}
                        onClick={() => setMenuId(menuId === item.id ? null : item.id)}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {menuId === item.id && (
                        <div className="menu">
                          <button onClick={() => updateStatus(item.id, "Not started")}>
                            <CircleDashed size={14} /> Not started
                          </button>
                          <button onClick={() => updateStatus(item.id, "In progress")}>
                            <Clock3 size={14} /> In progress
                          </button>
                          <button onClick={() => updateStatus(item.id, "Implemented")}>
                            <CheckCircle2 size={14} /> Implemented
                          </button>
                          <button onClick={() => updateStatus(item.id, "Needs review")}>
                            <AlertTriangle size={14} /> Needs review
                          </button>
                          <button onClick={() => removeRequirement(item.id)} style={{ color: "#d64545" }}>
                            <Trash2 size={14} /> Delete requirement
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="empty">
              <Search size={24} />
              <p>No requirements match your filters.</p>
            </div>
          )}
        </div>
      </section>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <h2>Add compliance requirement</h2>
              <button className="button" onClick={() => setShowModal(false)} aria-label="Close">
                <X size={15} />
              </button>
            </div>

            <label className="field-label" htmlFor="req-title">Requirement title</label>
            <input
              id="req-title"
              className="field"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Enter the obligation or control"
            />

            <label className="field-label" htmlFor="req-framework">Framework</label>
            <select
              id="req-framework"
              className="field"
              value={form.framework}
              onChange={(event) => setForm({ ...form, framework: event.target.value })}
            >
              <option>SOC 2 Type II</option>
              <option>ISO 27001</option>
              <option>GDPR</option>
              <option>HIPAA</option>
              <option>PCI DSS</option>
              <option>NIST AI RMF</option>
            </select>

            <label className="field-label" htmlFor="req-category">Category</label>
            <input
              id="req-category"
              className="field"
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              placeholder="e.g. Data Protection"
            />

            <label className="field-label" htmlFor="req-priority">Priority</label>
            <select
              id="req-priority"
              className="field"
              value={form.priority}
              onChange={(event) =>
                setForm({ ...form, priority: event.target.value as Requirement["priority"] })
              }
            >
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <label className="field-label" htmlFor="req-owner">Owner</label>
            <input
              id="req-owner"
              className="field"
              value={form.owner}
              onChange={(event) => setForm({ ...form, owner: event.target.value })}
              placeholder="Responsible person or team"
            />

            <label className="field-label" htmlFor="req-due">Due date</label>
            <input
              id="req-due"
              type="date"
              className="field"
              value={form.dueDate}
              onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
            />

            <div className="modal-actions">
              <button className="button" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="button primary" onClick={addRequirement}>
                <Plus size={14} /> Add requirement
              </button>
            </div>
          </div>
        </div>
      )}

      {notice && (
        <button className="notice" onClick={() => setNotice("")}>
          {notice} <X size={12} style={{ display: "inline", marginLeft: 7 }} />
        </button>
      )}
    </main>
  );
}
