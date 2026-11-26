
"use client";

import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import {
  Activity,
  Archive,
  ArrowDownToLine,
  CalendarDays,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  FolderKanban,
  LayoutGrid,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
  X,
  Pencil,
  Eye,
  CircleCheck,
  Target,
  BriefcaseBusiness,
} from "lucide-react";

type ProjectStatus =
  | "Planning"
  | "Active"
  | "On Hold"
  | "Completed"
  | "Archived";

type ProjectPriority = "Low" | "Medium" | "High" | "Critical";

type Project = {
  id: number;
  name: string;
  code: string;
  description: string;
  department: string;
  team: string;
  owner: string;
  members: number;
  startDate: string;
  dueDate: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  budget: number;
};

const initialProjects: Project[] = [
  {
    id: 1,
    name: "AI Gateway Optimization",
    code: "PRJ-001",
    description: "Improve model routing, inference latency, and request reliability.",
    department: "Engineering",
    team: "AI Infrastructure",
    owner: "Sai Kumar",
    members: 8,
    startDate: "2026-09-01",
    dueDate: "2026-12-20",
    status: "Active",
    priority: "Critical",
    progress: 68,
    budget: 120000,
  },
  {
    id: 2,
    name: "Enterprise Knowledge Hub",
    code: "PRJ-002",
    description: "Build secure document ingestion, retrieval, and knowledge workflows.",
    department: "Engineering",
    team: "Knowledge Systems",
    owner: "Pujitha",
    members: 6,
    startDate: "2026-09-15",
    dueDate: "2027-01-15",
    status: "Active",
    priority: "High",
    progress: 45,
    budget: 85000,
  },
  {
    id: 3,
    name: "Model Fine-Tuning Platform",
    code: "PRJ-003",
    description: "Provide dataset preparation, training jobs, evaluation, and model versions.",
    department: "Research",
    team: "Model Intelligence",
    owner: "Ananya Rao",
    members: 7,
    startDate: "2026-10-01",
    dueDate: "2027-02-28",
    status: "Planning",
    priority: "High",
    progress: 12,
    budget: 150000,
  },
  {
    id: 4,
    name: "Admin Governance Center",
    code: "PRJ-004",
    description: "Centralize workspace permissions, audit logs, and governance policies.",
    department: "Operations",
    team: "Platform Operations",
    owner: "Rahul Verma",
    members: 5,
    startDate: "2026-08-10",
    dueDate: "2026-11-30",
    status: "Active",
    priority: "Medium",
    progress: 82,
    budget: 45000,
  },
  {
    id: 5,
    name: "Multimodal Experience",
    code: "PRJ-005",
    description: "Improve image, document, and voice interaction experiences.",
    department: "Product",
    team: "Experience Design",
    owner: "Meera Shah",
    members: 4,
    startDate: "2026-07-01",
    dueDate: "2026-10-25",
    status: "Completed",
    priority: "Medium",
    progress: 100,
    budget: 60000,
  },
  {
    id: 6,
    name: "Legacy Model Migration",
    code: "PRJ-006",
    description: "Review and migrate legacy integrations to the current gateway.",
    department: "Engineering",
    team: "AI Infrastructure",
    owner: "Arjun Patel",
    members: 3,
    startDate: "2026-06-01",
    dueDate: "2026-10-15",
    status: "On Hold",
    priority: "Low",
    progress: 30,
    budget: 30000,
  },
  {
    id: 7,
    name: "Internal Analytics Pilot",
    code: "PRJ-007",
    description: "Prototype team analytics and operational reporting.",
    department: "Operations",
    team: "Platform Operations",
    owner: "Kiran Das",
    members: 2,
    startDate: "2026-05-01",
    dueDate: "2026-07-30",
    status: "Archived",
    priority: "Low",
    progress: 100,
    budget: 18000,
  },
];

const emptyProject: Omit<Project, "id"> = {
  name: "",
  code: "",
  description: "",
  department: "Engineering",
  team: "",
  owner: "",
  members: 1,
  startDate: "2026-11-04",
  dueDate: "2026-12-31",
  status: "Planning",
  priority: "Medium",
  progress: 0,
  budget: 0,
};

const statusColors: Record<ProjectStatus, string> = {
  Planning: "#7c5ce7",
  Active: "#16845b",
  "On Hold": "#c17b16",
  Completed: "#2563eb",
  Archived: "#64748b",
};

const priorityColors: Record<ProjectPriority, string> = {
  Low: "#64748b",
  Medium: "#2563eb",
  High: "#c17b16",
  Critical: "#dc4545",
};

const inputStyle: CSSProperties = {
  width: "100%",
  border: "1px solid #dce2ea",
  borderRadius: 9,
  padding: "10px 12px",
  fontSize: 13,
  outline: "none",
  background: "#fff",
  color: "#172033",
  boxSizing: "border-box",
};

const buttonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  border: "1px solid #dce2ea",
  borderRadius: 9,
  background: "#fff",
  color: "#344054",
  padding: "9px 12px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  if (!value) return "Not set";
  return new Date(value + "T00:00:00").toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [showArchived, setShowArchived] = useState(false);
  const [modal, setModal] = useState<"create" | "edit" | "details" | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Project, "id">>(emptyProject);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [menuId, setMenuId] = useState<number | null>(null);

  const selectedProject = projects.find((p) => p.id === selectedId) ?? null;

  const filteredProjects = useMemo(() => {
    const query = search.toLowerCase().trim();

    return projects.filter((p) => {
      const matchesSearch =
        !query ||
        [
          p.name,
          p.code,
          p.description,
          p.department,
          p.team,
          p.owner,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All" || p.status === statusFilter;
      const matchesPriority =
        priorityFilter === "All" || p.priority === priorityFilter;
      const matchesDepartment =
        departmentFilter === "All" || p.department === departmentFilter;
      const matchesArchived = showArchived || p.status !== "Archived";

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesDepartment &&
        matchesArchived
      );
    });
  }, [
    projects,
    search,
    statusFilter,
    priorityFilter,
    departmentFilter,
    showArchived,
  ]);

  const activeCount = projects.filter((p) => p.status === "Active").length;
  const planningCount = projects.filter((p) => p.status === "Planning").length;
  const completedCount = projects.filter((p) => p.status === "Completed").length;
  const totalMembers = projects
    .filter((p) => p.status !== "Archived")
    .reduce((sum, p) => sum + p.members, 0);
  const totalBudget = projects
    .filter((p) => p.status !== "Archived")
    .reduce((sum, p) => sum + p.budget, 0);

  function openCreate() {
    setSelectedId(null);
    setForm({
      ...emptyProject,
      code: `PRJ-${String(Math.max(0, ...projects.map((p) => p.id)) + 1).padStart(3, "0")}`,
    });
    setFormError("");
    setModal("create");
  }

  function openEdit(project: Project) {
    const { id: _id, ...data } = project;
    setSelectedId(project.id);
    setForm(data);
    setFormError("");
    setMenuId(null);
    setModal("edit");
  }

  function openDetails(project: Project) {
    setSelectedId(project.id);
    setMenuId(null);
    setModal("details");
  }

  function updateForm<K extends keyof Omit<Project, "id">>(
    key: K,
    value: Omit<Project, "id">[K],
  ) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim() || !form.code.trim() || !form.owner.trim()) {
      setFormError("Project name, project code, and owner are required.");
      return;
    }

    if (form.dueDate < form.startDate) {
      setFormError("Due date cannot be earlier than the start date.");
      return;
    }

    if (modal === "edit" && selectedId !== null) {
      setProjects((previous) =>
        previous.map((p) =>
          p.id === selectedId
            ? { ...form, id: selectedId, name: form.name.trim(), code: form.code.trim() }
            : p,
        ),
      );
      setNotice("Project updated successfully.");
    } else {
      const newId = Math.max(0, ...projects.map((p) => p.id)) + 1;
      setProjects((previous) => [
        { ...form, id: newId, name: form.name.trim(), code: form.code.trim() },
        ...previous,
      ]);
      setNotice("Project created successfully.");
    }

    setModal(null);
    setFormError("");
  }

  function changeStatus(project: Project, status: ProjectStatus) {
    setProjects((previous) =>
      previous.map((p) => (p.id === project.id ? { ...p, status } : p)),
    );
    setMenuId(null);
    setNotice(`${project.name} moved to ${status}.`);
  }

  function exportCsv() {
    const headers = [
      "Project Code",
      "Project Name",
      "Department",
      "Team",
      "Owner",
      "Members",
      "Status",
      "Priority",
      "Progress",
      "Start Date",
      "Due Date",
      "Budget INR",
    ];

    const rows = filteredProjects.map((p) => [
      p.code,
      p.name,
      p.department,
      p.team,
      p.owner,
      p.members,
      p.status,
      p.priority,
      `${p.progress}%`,
      p.startDate,
      p.dueDate,
      p.budget,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-projects.csv";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Project CSV exported.");
  }

  const page: CSSProperties = {
    minHeight: "100vh",
    background: "#f6f8fb",
    color: "#172033",
    padding: "28px",
    fontFamily: "Arial, Helvetica, sans-serif",
  };

  const card: CSSProperties = {
    background: "#fff",
    border: "1px solid #e7ebf1",
    borderRadius: 14,
    padding: 18,
  };

  const muted: CSSProperties = { color: "#778195", fontSize: 12 };

  const fieldLabel: CSSProperties = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 7,
    color: "#475467",
  };

  return (
    <main style={page}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 18,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ ...muted, marginBottom: 8 }}>
            Admin / Workspace / Projects
          </div>
          <h1
            style={{
              fontSize: 27,
              letterSpacing: "-0.8px",
              margin: "0 0 8px",
              fontWeight: 750,
            }}
          >
            Projects
          </h1>
          <p style={{ ...muted, margin: 0, fontSize: 13 }}>
            Manage workspace projects, ownership, delivery, and team progress.
          </p>
        </div>

        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <button style={buttonStyle} onClick={exportCsv}>
            <ArrowDownToLine size={15} /> Export CSV
          </button>
          <button
            style={{
              ...buttonStyle,
              background: "#315fe9",
              borderColor: "#315fe9",
              color: "#fff",
              padding: "10px 15px",
            }}
            onClick={openCreate}
          >
            <Plus size={16} /> Create project
          </button>
        </div>
      </div>

      {notice && (
        <div
          role="status"
          style={{
            background: "#ecfdf3",
            border: "1px solid #abefc6",
            color: "#067647",
            borderRadius: 10,
            padding: "11px 14px",
            marginBottom: 18,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            fontSize: 13,
          }}
        >
          <span>
            <Check size={15} style={{ verticalAlign: "middle", marginRight: 7 }} />
            {notice}
          </span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
            style={{ ...buttonStyle, padding: 4, border: "none" }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
          gap: 14,
          marginBottom: 22,
        }}
      >
        {[
          {
            label: "Total projects",
            value: projects.length,
            detail: "Across this workspace",
            icon: FolderKanban,
            color: "#315fe9",
          },
          {
            label: "Active projects",
            value: activeCount,
            detail: "Currently in progress",
            icon: Activity,
            color: "#16845b",
          },
          {
            label: "In planning",
            value: planningCount,
            detail: "Awaiting execution",
            icon: Clock3,
            color: "#7c5ce7",
          },
          {
            label: "Completed",
            value: completedCount,
            detail: "Successfully delivered",
            icon: CircleCheck,
            color: "#2563eb",
          },
          {
            label: "Team members",
            value: totalMembers,
            detail: "Across non-archived projects",
            icon: Users,
            color: "#c17b16",
          },
          {
            label: "Allocated budget",
            value: formatCurrency(totalBudget),
            detail: "Non-archived project budgets",
            icon: Target,
            color: "#0f8b9a",
          },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} style={card}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 18,
                }}
              >
                <span style={{ ...muted, fontWeight: 600 }}>{metric.label}</span>
                <span
                  style={{
                    width: 34,
                    height: 34,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 10,
                    color: metric.color,
                    background: `${metric.color}12`,
                  }}
                >
                  <Icon size={17} />
                </span>
              </div>
              <div
                style={{
                  fontSize: typeof metric.value === "string" ? 22 : 27,
                  fontWeight: 750,
                  letterSpacing: "-0.6px",
                  marginBottom: 7,
                }}
              >
                {metric.value}
              </div>
              <div style={muted}>{metric.detail}</div>
            </div>
          );
        })}
      </section>

      <section style={{ ...card, padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "19px 20px",
            borderBottom: "1px solid #edf0f4",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h2 style={{ margin: "0 0 5px", fontSize: 16 }}>Project directory</h2>
            <p style={{ ...muted, margin: 0 }}>
              {filteredProjects.length} project{filteredProjects.length === 1 ? "" : "s"} found
            </p>
          </div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontSize: 12,
              color: "#475467",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
            />
            Include archived
          </label>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
            gap: 10,
            padding: "16px 20px",
            borderBottom: "1px solid #edf0f4",
          }}
        >
          <div style={{ position: "relative" }}>
            <Search
              size={16}
              color="#98a2b3"
              style={{
                position: "absolute",
                left: 11,
                top: 11,
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              style={{ ...inputStyle, paddingLeft: 35 }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <SlidersHorizontal
              size={14}
              color="#98a2b3"
              style={{ position: "absolute", left: 11, top: 12 }}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 32, appearance: "none" }}
            >
              {["All", "Planning", "Active", "On Hold", "Completed", "Archived"].map(
                (value) => (
                  <option key={value} value={value}>
                    {value === "All" ? "All statuses" : value}
                  </option>
                ),
              )}
            </select>
            <ChevronDown
              size={14}
              style={{ position: "absolute", right: 10, top: 12, pointerEvents: "none" }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ ...inputStyle, appearance: "none" }}
            >
              {["All", "Low", "Medium", "High", "Critical"].map((value) => (
                <option key={value} value={value}>
                  {value === "All" ? "All priorities" : value}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              style={{ position: "absolute", right: 10, top: 12, pointerEvents: "none" }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={{ ...inputStyle, appearance: "none" }}
            >
              {["All", "Engineering", "Research", "Operations", "Product"].map(
                (value) => (
                  <option key={value} value={value}>
                    {value === "All" ? "All departments" : value}
                  </option>
                ),
              )}
            </select>
            <ChevronDown
              size={14}
              style={{ position: "absolute", right: 10, top: 12, pointerEvents: "none" }}
            />
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 1050,
              textAlign: "left",
            }}
          >
            <thead>
              <tr style={{ background: "#fafbfc" }}>
                {[
                  "PROJECT",
                  "DEPARTMENT / TEAM",
                  "OWNER",
                  "STATUS",
                  "PRIORITY",
                  "PROGRESS",
                  "DUE DATE",
                  "",
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      padding: "13px 15px",
                      color: "#8490a2",
                      fontSize: 10,
                      letterSpacing: "0.7px",
                      fontWeight: 700,
                      borderBottom: "1px solid #edf0f4",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr
                  key={project.id}
                  style={{ borderBottom: "1px solid #f0f2f5" }}
                >
                  <td style={{ padding: "15px", maxWidth: 255 }}>
                    <button
                      onClick={() => openDetails(project)}
                      style={{
                        padding: 0,
                        border: 0,
                        background: "transparent",
                        color: "#172033",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: 13,
                        textAlign: "left",
                      }}
                    >
                      {project.name}
                    </button>
                    <div style={{ ...muted, marginTop: 5 }}>
                      {project.code} · {project.members} members
                    </div>
                  </td>
                  <td style={{ padding: "15px" }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>
                      {project.department}
                    </div>
                    <div style={{ ...muted, marginTop: 5 }}>{project.team}</div>
                  </td>
                  <td style={{ padding: "15px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      <span
                        style={{
                          width: 29,
                          height: 29,
                          borderRadius: "50%",
                          display: "grid",
                          placeItems: "center",
                          background: "#edf2ff",
                          color: "#315fe9",
                          fontSize: 10,
                          fontWeight: 750,
                        }}
                      >
                        {project.owner
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                      {project.owner}
                    </div>
                  </td>
                  <td style={{ padding: "15px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        color: statusColors[project.status],
                        background: `${statusColors[project.status]}12`,
                        borderRadius: 20,
                        padding: "6px 9px",
                        fontSize: 11,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: statusColors[project.status],
                        }}
                      />
                      {project.status}
                    </span>
                  </td>
                  <td style={{ padding: "15px" }}>
                    <span
                      style={{
                        color: priorityColors[project.priority],
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {project.priority}
                    </span>
                  </td>
                  <td style={{ padding: "15px", minWidth: 125 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 7,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      <span>{project.progress}%</span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        borderRadius: 8,
                        background: "#edf0f4",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${project.progress}%`,
                          height: "100%",
                          background:
                            project.status === "Completed" ? "#16845b" : "#315fe9",
                          borderRadius: 8,
                        }}
                      />
                    </div>
                  </td>
                  <td style={{ padding: "15px", whiteSpace: "nowrap" }}>
                    <div style={{ fontSize: 12 }}>{formatDate(project.dueDate)}</div>
                    <div style={{ ...muted, marginTop: 5 }}>
                      <CalendarDays
                        size={12}
                        style={{ verticalAlign: "middle", marginRight: 4 }}
                      />
                      Due date
                    </div>
                  </td>
                  <td style={{ padding: "15px", position: "relative" }}>
                    <button
                      aria-label={`Actions for ${project.name}`}
                      onClick={() =>
                        setMenuId(menuId === project.id ? null : project.id)
                      }
                      style={{ ...buttonStyle, padding: 7 }}
                    >
                      <MoreHorizontal size={16} />
                    </button>

                    {menuId === project.id && (
                      <div
                        style={{
                          position: "absolute",
                          zIndex: 10,
                          right: 14,
                          top: 48,
                          width: 175,
                          padding: 5,
                          background: "#fff",
                          border: "1px solid #e2e7ef",
                          borderRadius: 10,
                          boxShadow: "0 10px 30px #10182818",
                        }}
                      >
                        {[
                          {
                            label: "View details",
                            icon: Eye,
                            action: () => openDetails(project),
                          },
                          {
                            label: "Edit project",
                            icon: Pencil,
                            action: () => openEdit(project),
                          },
                          ...(project.status === "Archived"
                            ? [
                                {
                                  label: "Reactivate",
                                  icon: Check,
                                  action: () => changeStatus(project, "Planning"),
                                },
                              ]
                            : [
                                {
                                  label: "Archive project",
                                  icon: Archive,
                                  action: () => changeStatus(project, "Archived"),
                                },
                              ]),
                        ].map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.label}
                              onClick={item.action}
                              style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: 9,
                                border: 0,
                                background: "#fff",
                                padding: "10px 9px",
                                borderRadius: 7,
                                textAlign: "left",
                                cursor: "pointer",
                                fontSize: 12,
                                color: "#344054",
                              }}
                            >
                              <Icon size={14} /> {item.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProjects.length === 0 && (
            <div style={{ padding: "55px 20px", textAlign: "center" }}>
              <FolderKanban size={30} color="#98a2b3" />
              <h3 style={{ fontSize: 15, margin: "12px 0 6px" }}>
                No projects found
              </h3>
              <p style={{ ...muted, margin: "0 0 15px" }}>
                Try changing your search or filters, or create a new project.
              </p>
              <button style={buttonStyle} onClick={openCreate}>
                <Plus size={14} /> Create project
              </button>
            </div>
          )}
        </div>

        <div
          style={{
            padding: "13px 20px",
            borderTop: "1px solid #edf0f4",
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
            color: "#778195",
            fontSize: 11,
          }}
        >
          <span>
            Showing {filteredProjects.length} of {projects.length} projects
          </span>
          <span>Workspace project directory</span>
        </div>
      </section>

      {modal && (
        <div
          onClick={() => setModal(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "#10182880",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: modal === "details" ? 650 : 700,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 24px 70px #10182830",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: "21px 23px",
                borderBottom: "1px solid #edf0f4",
              }}
            >
              <div>
                <h2 style={{ fontSize: 18, margin: "0 0 6px" }}>
                  {modal === "create"
                    ? "Create project"
                    : modal === "edit"
                      ? "Edit project"
                      : selectedProject?.name}
                </h2>
                <p style={{ ...muted, margin: 0 }}>
                  {modal === "details"
                    ? selectedProject?.code
                    : "Configure project details and delivery settings."}
                </p>
              </div>
              <button
                aria-label="Close modal"
                onClick={() => setModal(null)}
                style={{ ...buttonStyle, padding: 6 }}
              >
                <X size={16} />
              </button>
            </div>

            {modal === "details" && selectedProject ? (
              <div style={{ padding: 23 }}>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: "#475467" }}>
                  {selectedProject.description || "No description provided."}
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                    gap: 12,
                    margin: "20px 0",
                  }}
                >
                  {[
                    ["Status", selectedProject.status],
                    ["Priority", selectedProject.priority],
                    ["Department", selectedProject.department],
                    ["Team", selectedProject.team || "Not assigned"],
                    ["Project owner", selectedProject.owner],
                    ["Team members", String(selectedProject.members)],
                    ["Start date", formatDate(selectedProject.startDate)],
                    ["Due date", formatDate(selectedProject.dueDate)],
                    ["Budget", formatCurrency(selectedProject.budget)],
                    ["Progress", `${selectedProject.progress}%`],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #edf0f4",
                        borderRadius: 10,
                        padding: 13,
                      }}
                    >
                      <div style={{ ...muted, marginBottom: 8 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: 18 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    <span>Project progress</span>
                    <span>{selectedProject.progress}%</span>
                  </div>
                  <div
                    style={{
                      height: 9,
                      background: "#edf0f4",
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${selectedProject.progress}%`,
                        height: "100%",
                        background: "#315fe9",
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 9 }}>
                  <button
                    style={buttonStyle}
                    onClick={() => setModal(null)}
                  >
                    Close
                  </button>
                  <button
                    style={{
                      ...buttonStyle,
                      background: "#315fe9",
                      borderColor: "#315fe9",
                      color: "#fff",
                    }}
                    onClick={() => openEdit(selectedProject)}
                  >
                    <Pencil size={14} /> Edit project
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={saveProject} style={{ padding: 23 }}>
                {formError && (
                  <div
                    style={{
                      color: "#b42318",
                      background: "#fef3f2",
                      border: "1px solid #fecdca",
                      borderRadius: 9,
                      padding: 11,
                      fontSize: 12,
                      marginBottom: 15,
                    }}
                  >
                    <CircleAlert
                      size={14}
                      style={{ verticalAlign: "middle", marginRight: 6 }}
                    />
                    {formError}
                  </div>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                    gap: 15,
                  }}
                >
                  <label>
                    <span style={fieldLabel}>Project name *</span>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => updateForm("name", e.target.value)}
                      placeholder="e.g. AI Gateway Optimization"
                      style={inputStyle}
                    />
                  </label>

                  <label>
                    <span style={fieldLabel}>Project code *</span>
                    <input
                      required
                      value={form.code}
                      onChange={(e) => updateForm("code", e.target.value)}
                      placeholder="PRJ-008"
                      style={inputStyle}
                    />
                  </label>

                  <label style={{ gridColumn: "1 / -1" }}>
                    <span style={fieldLabel}>Description</span>
                    <textarea
                      value={form.description}
                      onChange={(e) => updateForm("description", e.target.value)}
                      rows={3}
                      placeholder="Describe the project goals and scope..."
                      style={{ ...inputStyle, resize: "vertical" }}
                    />
                  </label>

                  <label>
                    <span style={fieldLabel}>Department</span>
                    <select
                      value={form.department}
                      onChange={(e) => updateForm("department", e.target.value)}
                      style={inputStyle}
                    >
                      {["Engineering", "Research", "Operations", "Product", "Finance", "Sales", "HR"].map(
                        (value) => (
                          <option key={value}>{value}</option>
                        ),
                      )}
                    </select>
                  </label>

                  <label>
                    <span style={fieldLabel}>Team</span>
                    <input
                      value={form.team}
                      onChange={(e) => updateForm("team", e.target.value)}
                      placeholder="Team name"
                      style={inputStyle}
                    />
                  </label>

                  <label>
                    <span style={fieldLabel}>Project owner *</span>
                    <input
                      required
                      value={form.owner}
                      onChange={(e) => updateForm("owner", e.target.value)}
                      placeholder="Owner name"
                      style={inputStyle}
                    />
                  </label>

                  <label>
                    <span style={fieldLabel}>Team members</span>
                    <input
                      type="number"
                      min={1}
                      max={10000}
                      value={form.members}
                      onChange={(e) =>
                        updateForm("members", Math.max(1, Number(e.target.value)))
                      }
                      style={inputStyle}
                    />
                  </label>

                  <label>
                    <span style={fieldLabel}>Status</span>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        updateForm("status", e.target.value as ProjectStatus)
                      }
                      style={inputStyle}
                    >
                      {["Planning", "Active", "On Hold", "Completed", "Archived"].map(
                        (value) => (
                          <option key={value}>{value}</option>
                        ),
                      )}
                    </select>
                  </label>

                  <label>
                    <span style={fieldLabel}>Priority</span>
                    <select
                      value={form.priority}
                      onChange={(e) =>
                        updateForm("priority", e.target.value as ProjectPriority)
                      }
                      style={inputStyle}
                    >
                      {["Low", "Medium", "High", "Critical"].map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span style={fieldLabel}>Start date</span>
                    <input
                      type="date"
                      required
                      value={form.startDate}
                      onChange={(e) => updateForm("startDate", e.target.value)}
                      style={inputStyle}
                    />
                  </label>

                  <label>
                    <span style={fieldLabel}>Due date</span>
                    <input
                      type="date"
                      required
                      value={form.dueDate}
                      onChange={(e) => updateForm("dueDate", e.target.value)}
                      style={inputStyle}
                    />
                  </label>

                  <label>
                    <span style={fieldLabel}>Progress (%)</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form.progress}
                      onChange={(e) =>
                        updateForm(
                          "progress",
                          Math.min(100, Math.max(0, Number(e.target.value))),
                        )
                      }
                      style={inputStyle}
                    />
                  </label>

                  <label>
                    <span style={fieldLabel}>Budget (INR)</span>
                    <input
                      type="number"
                      min={0}
                      value={form.budget}
                      onChange={(e) =>
                        updateForm("budget", Math.max(0, Number(e.target.value)))
                      }
                      style={inputStyle}
                    />
                  </label>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 9,
                    marginTop: 23,
                    paddingTop: 17,
                    borderTop: "1px solid #edf0f4",
                  }}
                >
                  <button
                    type="button"
                    style={buttonStyle}
                    onClick={() => setModal(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      ...buttonStyle,
                      background: "#315fe9",
                      borderColor: "#315fe9",
                      color: "#fff",
                      padding: "10px 16px",
                    }}
                  >
                    <Check size={15} />
                    {modal === "edit" ? "Save changes" : "Create project"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <footer
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          marginTop: 18,
          color: "#98a2b3",
          fontSize: 11,
        }}
      >
        <BriefcaseBusiness size={13} />
        ModelNow Workspace Management
        <span style={{ marginLeft: "auto" }}>Project administration</span>
      </footer>
    </main>
  );
}
