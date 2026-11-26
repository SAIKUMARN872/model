
"use client";

import { useMemo, useState } from "react";
import {
  ClipboardCheck,
  Plus,
  Search,
  Download,
  X,
  Eye,
  MoreHorizontal,
  Trash2,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  CalendarDays,
  UserRound,
  Filter,
  RefreshCw,
  ListTodo,
  ShieldCheck,
} from "lucide-react";

type TaskStatus = "Open" | "In Progress" | "Completed" | "Blocked";
type TaskPriority = "Critical" | "High" | "Medium" | "Low";

type ComplianceTask = {
  id: string;
  title: string;
  description: string;
  category: string;
  framework: string;
  owner: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
};

const initialTasks: ComplianceTask[] = [
  {
    id: "TASK-101",
    title: "Review access control evidence",
    description:
      "Verify user access reviews, privileged access records, and supporting evidence for the current review period.",
    category: "Control Review",
    framework: "ISO 27001",
    owner: "Security Team",
    dueDate: "2026-11-08",
    priority: "Critical",
    status: "In Progress",
    createdAt: "2026-10-25",
  },
  {
    id: "TASK-102",
    title: "Complete vendor risk review",
    description:
      "Review vendor security questionnaires, contract requirements, and outstanding third-party risk actions.",
    category: "Vendor Review",
    framework: "SOC 2",
    owner: "Vendor Management",
    dueDate: "2026-11-10",
    priority: "High",
    status: "Open",
    createdAt: "2026-10-27",
  },
  {
    id: "TASK-103",
    title: "Update data retention policy",
    description:
      "Confirm retention periods, document approvals, and record policy changes for personal data.",
    category: "Policy Review",
    framework: "GDPR",
    owner: "Privacy Team",
    dueDate: "2026-11-12",
    priority: "High",
    status: "In Progress",
    createdAt: "2026-10-29",
  },
  {
    id: "TASK-104",
    title: "Collect model risk documentation",
    description:
      "Gather model cards, risk classifications, human oversight details, and evaluation documentation.",
    category: "AI Governance",
    framework: "EU AI Act",
    owner: "AI Governance",
    dueDate: "2026-11-15",
    priority: "Critical",
    status: "Open",
    createdAt: "2026-10-30",
  },
  {
    id: "TASK-105",
    title: "Validate incident response evidence",
    description:
      "Check incident response procedures, escalation records, and evidence from the latest tabletop exercise.",
    category: "Evidence Collection",
    framework: "SOC 2",
    owner: "IT Operations",
    dueDate: "2026-11-18",
    priority: "Medium",
    status: "Open",
    createdAt: "2026-10-30",
  },
  {
    id: "TASK-106",
    title: "Review privacy request workflow",
    description:
      "Check request intake, identity verification, response timelines, and closure documentation.",
    category: "Privacy Review",
    framework: "GDPR",
    owner: "Privacy Team",
    dueDate: "2026-10-28",
    priority: "High",
    status: "Blocked",
    createdAt: "2026-10-20",
  },
  {
    id: "TASK-107",
    title: "Approve security awareness policy",
    description:
      "Review the updated employee awareness policy and document the required approval.",
    category: "Policy Approval",
    framework: "ISO 27001",
    owner: "Compliance Team",
    dueDate: "2026-10-30",
    priority: "Medium",
    status: "Completed",
    createdAt: "2026-10-18",
  },
  {
    id: "TASK-108",
    title: "Review AI monitoring controls",
    description:
      "Check model monitoring responsibilities, incident escalation paths, and periodic review requirements.",
    category: "AI Governance",
    framework: "NIST AI RMF",
    owner: "AI Governance",
    dueDate: "2026-11-22",
    priority: "Low",
    status: "Open",
    createdAt: "2026-11-01",
  },
];

const statusOptions: TaskStatus[] = [
  "Open",
  "In Progress",
  "Completed",
  "Blocked",
];

const priorityOptions: TaskPriority[] = [
  "Critical",
  "High",
  "Medium",
  "Low",
];

const statusClass: Record<TaskStatus, string> = {
  Open: "open",
  "In Progress": "progress",
  Completed: "completed",
  Blocked: "blocked",
};

const priorityClass: Record<TaskPriority, string> = {
  Critical: "critical",
  High: "high",
  Medium: "medium",
  Low: "low",
};

function isOverdue(task: ComplianceTask) {
  return task.status !== "Completed" &&
    Boolean(task.dueDate) &&
    task.dueDate < new Date().toISOString().slice(0, 10);
}

export default function ComplianceTasksPage() {
  const [tasks, setTasks] = useState<ComplianceTask[]>(initialTasks);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [frameworkFilter, setFrameworkFilter] = useState("All");
  const [activeTab, setActiveTab] = useState<
    "all" | "my-work" | "overdue" | "completed"
  >("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ComplianceTask | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Control Review",
    framework: "ISO 27001",
    owner: "",
    dueDate: "",
    priority: "Medium" as TaskPriority,
    status: "Open" as TaskStatus,
  });

  const frameworks = Array.from(
    new Set(tasks.map((task) => task.framework))
  );

  const overdueCount = tasks.filter(isOverdue).length;
  const openCount = tasks.filter(
    (task) => task.status === "Open"
  ).length;
  const progressCount = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;
  const completedCount = tasks.filter(
    (task) => task.status === "Completed"
  ).length;
  const criticalCount = tasks.filter(
    (task) => task.priority === "Critical" && task.status !== "Completed"
  ).length;

  const filteredTasks = useMemo(() => {
    const query = search.toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch = [
        task.id,
        task.title,
        task.description,
        task.category,
        task.framework,
        task.owner,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);

      const matchesStatus =
        statusFilter === "All" || task.status === statusFilter;
      const matchesPriority =
        priorityFilter === "All" || task.priority === priorityFilter;
      const matchesFramework =
        frameworkFilter === "All" || task.framework === frameworkFilter;

      const matchesTab =
        activeTab === "all" ||
        (activeTab === "my-work" && task.owner === "Compliance Team") ||
        (activeTab === "overdue" && isOverdue(task)) ||
        (activeTab === "completed" && task.status === "Completed");

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesFramework &&
        matchesTab
      );
    });
  }, [
    tasks,
    search,
    statusFilter,
    priorityFilter,
    frameworkFilter,
    activeTab,
  ]);

  function createTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const task: ComplianceTask = {
      id: `TASK-${String(Date.now()).slice(-5)}`,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      framework: form.framework,
      owner: form.owner.trim() || "Unassigned",
      dueDate: form.dueDate,
      priority: form.priority,
      status: form.status,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setTasks((current) => [task, ...current]);
    setShowForm(false);
    setForm({
      title: "",
      description: "",
      category: "Control Review",
      framework: "ISO 27001",
      owner: "",
      dueDate: "",
      priority: "Medium",
      status: "Open",
    });
    setNotice("Task created in the local compliance task list.");
  }

  function changeStatus(id: string, status: TaskStatus) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, status } : task
      )
    );
    setSelectedTask((current) =>
      current?.id === id ? { ...current, status } : current
    );
    setMenuId(null);
    setNotice(`Task status updated to ${status}.`);
  }

  function deleteTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
    setSelectedTask(null);
    setMenuId(null);
    setNotice("Task removed from the local list.");
  }

  function exportCSV() {
    const headers = [
      "Task ID",
      "Title",
      "Description",
      "Category",
      "Framework",
      "Owner",
      "Due Date",
      "Priority",
      "Status",
      "Created At",
      "Overdue",
    ];

    const rows = filteredTasks.map((task) => [
      task.id,
      task.title,
      task.description,
      task.category,
      task.framework,
      task.owner,
      task.dueDate,
      task.priority,
      task.status,
      task.createdAt,
      isOverdue(task) ? "Yes" : "No",
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
    link.download = "modelnow-compliance-tasks.csv";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Filtered tasks exported as CSV.");
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setFrameworkFilter("All");
  }

  return (
    <main className="tasks-page">
      <header className="page-header">
        <div>
          <div className="breadcrumb">
            Admin <span>/</span> Compliance <span>/</span> Compliance Tasks
          </div>
          <h1>Compliance Tasks</h1>
          <p>
            Assign compliance work, track deadlines, and manage remediation
            activities across your organization.
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
            <Plus size={17} /> Create Task
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
          icon={<ListTodo size={20} />}
          label="Open Tasks"
          value={openCount}
          note="Awaiting action"
          color="blue"
        />
        <StatCard
          icon={<RefreshCw size={20} />}
          label="In Progress"
          value={progressCount}
          note="Work currently underway"
          color="amber"
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          label="Overdue"
          value={overdueCount}
          note="Past due and not completed"
          color="red"
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="Completed"
          value={completedCount}
          note="Marked complete"
          color="green"
        />
      </section>

      <section className="summary-strip">
        <div>
          <span className="summary-icon critical">
            <AlertTriangle size={18} />
          </span>
          <div>
            <strong>{criticalCount} critical-priority tasks</strong>
            <p>Critical tasks not yet completed</p>
          </div>
        </div>
        <div>
          <span className="summary-icon blue">
            <ShieldCheck size={18} />
          </span>
          <div>
            <strong>{frameworks.length} frameworks represented</strong>
            <p>Based on the current task register</p>
          </div>
        </div>
        <div>
          <span className="summary-icon green">
            <ClipboardCheck size={18} />
          </span>
          <div>
            <strong>
              {tasks.length
                ? Math.round((completedCount / tasks.length) * 100)
                : 0}
              % completion
            </strong>
            <p>Completed tasks divided by total tasks</p>
          </div>
        </div>
      </section>

      <nav className="tabs">
        <Tab
          active={activeTab === "all"}
          label="All Tasks"
          count={tasks.length}
          onClick={() => setActiveTab("all")}
        />
        <Tab
          active={activeTab === "my-work"}
          label="Compliance Team"
          count={tasks.filter((task) => task.owner === "Compliance Team").length}
          onClick={() => setActiveTab("my-work")}
        />
        <Tab
          active={activeTab === "overdue"}
          label="Overdue"
          count={overdueCount}
          onClick={() => setActiveTab("overdue")}
        />
        <Tab
          active={activeTab === "completed"}
          label="Completed"
          count={completedCount}
          onClick={() => setActiveTab("completed")}
        />
      </nav>

      <section className="content-card">
        <div className="section-heading">
          <div>
            <h2>Task Register</h2>
            <p>Search, filter, and update compliance assignments.</p>
          </div>
          <span className="record-count">{filteredTasks.length} tasks</span>
        </div>

        <div className="filters">
          <div className="search-box">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tasks, owners, frameworks..."
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
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
          >
            <option>All</option>
            {priorityOptions.map((priority) => (
              <option key={priority}>{priority}</option>
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
                <th>Task</th>
                <th>Framework</th>
                <th>Owner</th>
                <th>Due Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <button
                      className="task-name"
                      onClick={() => setSelectedTask(task)}
                    >
                      <span className="task-icon">
                        <ClipboardCheck size={18} />
                      </span>
                      <span>
                        <strong>{task.title}</strong>
                        <small>
                          {task.id} · {task.category}
                        </small>
                      </span>
                    </button>
                  </td>
                  <td>
                    <span className="framework-label">{task.framework}</span>
                  </td>
                  <td>
                    <span className="owner-cell">
                      <UserRound size={14} />
                      {task.owner}
                    </span>
                  </td>
                  <td>
                    <span className={isOverdue(task) ? "overdue-date" : ""}>
                      {task.dueDate || "No due date"}
                    </span>
                    {isOverdue(task) && (
                      <small className="overdue-label">Overdue</small>
                    )}
                  </td>
                  <td>
                    <span className={`priority-badge ${priorityClass[task.priority]}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td>
                    <select
                      className={`status-select ${statusClass[task.status]}`}
                      value={task.status}
                      aria-label={`Status for ${task.title}`}
                      onChange={(event) =>
                        changeStatus(task.id, event.target.value as TaskStatus)
                      }
                    >
                      {statusOptions.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="icon-button"
                      aria-label="Task actions"
                      onClick={() =>
                        setMenuId(menuId === task.id ? null : task.id)
                      }
                    >
                      <MoreHorizontal size={19} />
                    </button>
                    {menuId === task.id && (
                      <div className="row-menu">
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setMenuId(null);
                          }}
                        >
                          <Eye size={15} /> View details
                        </button>
                        {statusOptions
                          .filter((status) => status !== task.status)
                          .map((status) => (
                            <button
                              key={status}
                              onClick={() => changeStatus(task.id, status)}
                            >
                              <RefreshCw size={15} /> Mark {status}
                            </button>
                          ))}
                        <button
                          className="delete-action"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash2 size={15} /> Delete task
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-state">
                    No tasks match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>
            Showing {filteredTasks.length} of {tasks.length} tasks
          </span>
          <span>ModelNow Compliance Operations</span>
        </div>
      </section>

      <section className="bottom-grid">
        <article className="info-card">
          <span className="info-icon blue">
            <CalendarDays size={20} />
          </span>
          <h3>Deadline management</h3>
          <p>
            Prioritize overdue work, assign clear owners, and keep review
            deadlines visible to the compliance team.
          </p>
        </article>
        <article className="info-card">
          <span className="info-icon green">
            <ShieldCheck size={20} />
          </span>
          <h3>Evidence-linked tasks</h3>
          <p>
            A future backend can connect each task to a control, evidence
            record, policy, or audit finding.
          </p>
        </article>
        <article className="info-card">
          <span className="info-icon amber">
            <UserRound size={20} />
          </span>
          <h3>Ownership and accountability</h3>
          <p>
            Track task ownership and status so teams can coordinate corrective
            actions and compliance reviews.
          </p>
        </article>
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
                <h2>Create Compliance Task</h2>
                <p>Assign a task and set a target completion date.</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={createTask}>
              <label>
                Task title *
                <input
                  required
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  placeholder="Enter a clear task title"
                />
              </label>

              <label>
                Description
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Describe the required action"
                />
              </label>

              <div className="form-row">
                <label>
                  Category
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                  >
                    <option>Control Review</option>
                    <option>Evidence Collection</option>
                    <option>Policy Review</option>
                    <option>Policy Approval</option>
                    <option>Risk Treatment</option>
                    <option>Vendor Review</option>
                    <option>Privacy Review</option>
                    <option>AI Governance</option>
                    <option>Audit Follow-up</option>
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
                    <option>ISO 27001</option>
                    <option>SOC 2</option>
                    <option>GDPR</option>
                    <option>EU AI Act</option>
                    <option>NIST AI RMF</option>
                    <option>Enterprise Risk</option>
                    <option>Internal</option>
                  </select>
                </label>
              </div>

              <div className="form-row">
                <label>
                  Owner
                  <input
                    value={form.owner}
                    onChange={(event) =>
                      setForm({ ...form, owner: event.target.value })
                    }
                    placeholder="Team or responsible person"
                  />
                </label>
                <label>
                  Due date
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(event) =>
                      setForm({ ...form, dueDate: event.target.value })
                    }
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Priority
                  <select
                    value={form.priority}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        priority: event.target.value as TaskPriority,
                      })
                    }
                  >
                    {priorityOptions.map((priority) => (
                      <option key={priority}>{priority}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Initial status
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        status: event.target.value as TaskStatus,
                      })
                    }
                  >
                    {statusOptions.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="form-note">
                <AlertTriangle size={16} />
                This creates a local task record. Assignment notifications and
                database persistence are not connected yet.
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
                  <Plus size={16} /> Create Task
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selectedTask && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedTask(null);
          }}
        >
          <section className="modal">
            <div className="modal-heading">
              <div>
                <span className="eyebrow">{selectedTask.id}</span>
                <h2>{selectedTask.title}</h2>
                <p>
                  {selectedTask.category} · {selectedTask.framework}
                </p>
              </div>
              <button
                className="icon-button"
                onClick={() => setSelectedTask(null)}
              >
                <X size={20} />
              </button>
            </div>

            <p className="detail-description">
              {selectedTask.description || "No description provided."}
            </p>

            <div className="detail-grid">
              <Detail label="Owner" value={selectedTask.owner} />
              <Detail label="Due date" value={selectedTask.dueDate || "Not set"} />
              <Detail label="Priority" value={selectedTask.priority} />
              <Detail label="Status" value={selectedTask.status} />
              <Detail label="Category" value={selectedTask.category} />
              <Detail label="Created on" value={selectedTask.createdAt} />
            </div>

            {isOverdue(selectedTask) && (
              <div className="form-note overdue-note">
                <AlertTriangle size={16} />
                This task is overdue. Update its status or review the due date.
              </div>
            )}

            <div className="modal-footer">
              <button
                className="secondary-button"
                onClick={() => setSelectedTask(null)}
              >
                Close
              </button>
              <label className="status-editor">
                Update status
                <select
                  value={selectedTask.status}
                  onChange={(event) =>
                    changeStatus(
                      selectedTask.id,
                      event.target.value as TaskStatus
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
        .tasks-page {
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
        .modal-footer {
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
          margin-bottom: 17px;
        }

        .summary-strip {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
          padding: 17px;
          background: white;
          border: 1px solid var(--line);
          border-radius: 12px;
        }

        .summary-strip > div {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .summary-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 38px;
          height: 38px;
          border-radius: 9px;
        }

        .summary-icon.critical {
          color: #c34242;
          background: #fff0f0;
        }

        .summary-icon.blue {
          color: #2856c7;
          background: #edf3ff;
        }

        .summary-icon.green {
          color: #16814a;
          background: #e9f9ef;
        }

        .summary-strip strong {
          display: block;
          color: #344054;
          font-size: 12px;
        }

        .summary-strip p {
          margin: 5px 0 0;
          color: #8791a1;
          font-size: 10px;
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

        .task-name {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0;
          color: inherit;
          text-align: left;
          background: transparent;
          border: 0;
        }

        .task-icon {
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

        .task-name strong {
          display: block;
          max-width: 240px;
          overflow: hidden;
          color: #263248;
          font-size: 11px;
          font-weight: 600;
          text-overflow: ellipsis;
        }

        .task-name small,
        .overdue-label {
          display: block;
          margin-top: 5px;
          color: #8b95a5;
          font-size: 10px;
        }

        .framework-label {
          display: inline-flex;
          padding: 6px 8px;
          color: #475467;
          background: #f0f2f6;
          border-radius: 6px;
          font-size: 10px;
        }

        .owner-cell {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .priority-badge {
          display: inline-flex;
          padding: 6px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 600;
        }

        .critical {
          color: #bf3030;
          background: #fff0f0;
        }

        .high {
          color: #b45309;
          background: #fff1df;
        }

        .medium {
          color: #8c650d;
          background: #fff8e5;
        }

        .low {
          color: #475467;
          background: #f0f2f6;
        }

        .status-select {
          max-width: 125px;
          padding: 6px 7px;
          border: 1px solid transparent;
          border-radius: 6px;
          outline: none;
          font-size: 10px;
          font-weight: 600;
        }

        .status-select.open {
          color: #475467;
          background: #f0f2f6;
        }

        .status-select.progress {
          color: #2856c7;
          background: #edf3ff;
        }

        .status-select.completed {
          color: #16814a;
          background: #e9f9ef;
        }

        .status-select.blocked {
          color: #bf3c3c;
          background: #fff0f0;
        }

        .overdue-date {
          color: #c34242;
          font-weight: 700;
        }

        .overdue-label {
          color: #c34242;
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
          width: 180px;
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

        .info-icon.blue {
          color: #2856c7;
          background: #edf3ff;
        }

        .info-icon.green {
          color: #16814a;
          background: #e9f9ef;
        }

        .info-icon.amber {
          color: #ad6b0b;
          background: #fff6e5;
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

        .overdue-note {
          margin-top: 16px;
        }

        .modal-footer {
          justify-content: flex-end;
          flex-wrap: wrap;
          margin-top: 8px;
          padding-top: 17px;
          border-top: 1px solid var(--line);
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

          .summary-strip,
          .bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 750px) {
          .tasks-page {
            padding: 17px;
          }

          .page-header {
            flex-direction: column;
          }

          .header-actions {
            width: 100%;
            flex-wrap: wrap;
          }

          .summary-strip {
            gap: 17px;
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

          .tasks-page {
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
  count: number;
}) {
  return (
    <button className={`tab-button ${active ? "active" : ""}`} onClick={onClick}>
      {label}
      <span>{count}</span>
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
