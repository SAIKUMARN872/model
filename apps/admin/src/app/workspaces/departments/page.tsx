
"use client";

import { useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import {
  Activity,
  Building2,
  Check,
  ChevronDown,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";

type DepartmentStatus = "Active" | "Under Review" | "Archived";

type Department = {
  id: string;
  name: string;
  code: string;
  head: string;
  email: string;
  description: string;
  employees: number;
  teams: number;
  budget: string;
  status: DepartmentStatus;
  created: string;
};

const initialDepartments: Department[] = [
  {
    id: "DEPT-1001",
    name: "Engineering",
    code: "ENG",
    head: "Vikram Rao",
    email: "vikram@modelnow.example",
    description: "Platform engineering, infrastructure, and application development.",
    employees: 42,
    teams: 6,
    budget: "$240,000",
    status: "Active",
    created: "2026-05-12",
  },
  {
    id: "DEPT-1002",
    name: "AI Research",
    code: "AIR",
    head: "Rahul Verma",
    email: "rahul@modelnow.example",
    description: "Foundation models, model evaluation, and applied AI research.",
    employees: 28,
    teams: 4,
    budget: "$310,000",
    status: "Active",
    created: "2026-05-15",
  },
  {
    id: "DEPT-1003",
    name: "Product",
    code: "PRD",
    head: "Priya Reddy",
    email: "priya@modelnow.example",
    description: "Product strategy, customer experience, and roadmap planning.",
    employees: 16,
    teams: 3,
    budget: "$125,000",
    status: "Active",
    created: "2026-06-02",
  },
  {
    id: "DEPT-1004",
    name: "Security",
    code: "SEC",
    head: "Sneha Patel",
    email: "sneha@modelnow.example",
    description: "Security operations, governance, and platform trust.",
    employees: 12,
    teams: 2,
    budget: "$95,000",
    status: "Active",
    created: "2026-06-10",
  },
  {
    id: "DEPT-1005",
    name: "Operations",
    code: "OPS",
    head: "Arjun Kumar",
    email: "arjun@modelnow.example",
    description: "Internal operations, business processes, and administration.",
    employees: 9,
    teams: 2,
    budget: "$68,000",
    status: "Under Review",
    created: "2026-07-01",
  },
  {
    id: "DEPT-1006",
    name: "Finance",
    code: "FIN",
    head: "Unassigned",
    email: "",
    description: "Financial planning, expense management, and reporting.",
    employees: 5,
    teams: 1,
    budget: "$52,000",
    status: "Under Review",
    created: "2026-08-15",
  },
  {
    id: "DEPT-1007",
    name: "Human Resources",
    code: "HR",
    head: "Meera Nair",
    email: "meera@modelnow.example",
    description: "Talent acquisition, employee experience, and workforce planning.",
    employees: 7,
    teams: 2,
    budget: "$45,000",
    status: "Archived",
    created: "2026-04-20",
  },
];

const colors = {
  text: "#172033",
  muted: "#697586",
  border: "#E5EAF1",
  background: "#F7F9FC",
  blue: "#315FEA",
  green: "#15803D",
  red: "#B42318",
  amber: "#B54708",
};

const statusStyles: Record<
  DepartmentStatus,
  { color: string; background: string }
> = {
  Active: { color: "#15803D", background: "#EAF8EF" },
  "Under Review": { color: "#B54708", background: "#FFF5DF" },
  Archived: { color: "#697586", background: "#EEF1F5" },
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: `1px solid ${colors.border}`,
  borderRadius: 9,
  background: "#FFFFFF",
  color: colors.text,
  fontSize: 12,
  outline: "none",
};

const buttonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "10px 12px",
  border: `1px solid ${colors.border}`,
  borderRadius: 9,
  background: "#FFFFFF",
  color: colors.text,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const primaryButtonStyle: CSSProperties = {
  ...buttonStyle,
  color: "#FFFFFF",
  background: colors.blue,
  borderColor: colors.blue,
};

export default function DepartmentsPage() {
  const [departments, setDepartments] =
    useState<Department[]>(initialDepartments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState<Department | null>(null);
  const [editing, setEditing] = useState<Department | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const emptyForm = {
    name: "",
    code: "",
    head: "",
    email: "",
    description: "",
    budget: "",
    status: "Active" as DepartmentStatus,
  };

  const [form, setForm] = useState(emptyForm);

  const filteredDepartments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return departments.filter((department) => {
      const matchesSearch =
        !query ||
        [
          department.id,
          department.name,
          department.code,
          department.head,
          department.email,
          department.description,
        ].some((value) => value.toLowerCase().includes(query));

      return (
        matchesSearch &&
        (statusFilter === "All" || department.status === statusFilter)
      );
    });
  }, [departments, search, statusFilter]);

  const totalEmployees = departments.reduce(
    (sum, department) => sum + department.employees,
    0,
  );

  const totalTeams = departments.reduce(
    (sum, department) => sum + department.teams,
    0,
  );

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowCreate(true);
  }

  function openEdit(department: Department) {
    setEditing(department);
    setForm({
      name: department.name,
      code: department.code,
      head: department.head === "Unassigned" ? "" : department.head,
      email: department.email,
      description: department.description,
      budget: department.budget.replace(/[$,]/g, ""),
      status: department.status,
    });
    setMenuId(null);
    setShowCreate(true);
  }

  function saveDepartment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const duplicateCode = departments.some(
      (department) =>
        department.code.toLowerCase() === form.code.trim().toLowerCase() &&
        department.id !== editing?.id,
    );

    if (duplicateCode) {
      notify("That department code is already in use.");
      return;
    }

    if (editing) {
      const updated: Department = {
        ...editing,
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        head: form.head.trim() || "Unassigned",
        email: form.email.trim(),
        description: form.description.trim(),
        budget: form.budget.trim()
          ? `$${Number(form.budget).toLocaleString("en-US")}`
          : "Not set",
        status: form.status,
      };

      setDepartments((current) =>
        current.map((item) => (item.id === editing.id ? updated : item)),
      );

      setSelected((current) =>
        current?.id === editing.id ? updated : current,
      );

      notify("Department updated in the demo.");
    } else {
      const created: Department = {
        id: `DEPT-${Date.now().toString().slice(-6)}`,
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        head: form.head.trim() || "Unassigned",
        email: form.email.trim(),
        description: form.description.trim(),
        employees: 0,
        teams: 0,
        budget: form.budget.trim()
          ? `$${Number(form.budget).toLocaleString("en-US")}`
          : "Not set",
        status: form.status,
        created: new Date().toISOString().slice(0, 10),
      };

      setDepartments((current) => [created, ...current]);
      setSearch("");
      setStatusFilter("All");
      notify("Department created in the demo.");
    }

    setShowCreate(false);
    setEditing(null);
    setForm(emptyForm);
  }

  function changeStatus(department: Department) {
    const nextStatus: DepartmentStatus =
      department.status === "Archived" ? "Active" : "Archived";

    const updated = { ...department, status: nextStatus };

    setDepartments((current) =>
      current.map((item) => (item.id === department.id ? updated : item)),
    );

    setSelected((current) =>
      current?.id === department.id ? updated : current,
    );

    setMenuId(null);
    notify(`${department.name} marked ${nextStatus.toLowerCase()}.`);
  }

  function deleteDepartment(department: Department) {
    const confirmed = window.confirm(
      `Delete "${department.name}" from this demo directory?`,
    );

    if (!confirmed) return;

    setDepartments((current) =>
      current.filter((item) => item.id !== department.id),
    );

    setSelected((current) =>
      current?.id === department.id ? null : current,
    );

    setMenuId(null);
    notify("Department removed from the demo directory.");
  }

  function exportCsv() {
    const headers = [
      "Department ID",
      "Name",
      "Code",
      "Head",
      "Head Email",
      "Employees",
      "Teams",
      "Budget",
      "Status",
      "Created",
      "Description",
    ];

    const rows = filteredDepartments.map((item) => [
      item.id,
      item.name,
      item.code,
      item.head,
      item.email,
      String(item.employees),
      String(item.teams),
      item.budget,
      item.status,
      item.created,
      item.description,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${value.replace(/"/g, '""')}"`).join(","),
      )
      .join("\r\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-departments.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    notify("Department CSV exported.");
  }

  return (
    <main style={pageStyle}>
      {notice && (
        <div role="status" style={toastStyle}>
          <Check size={16} />
          <span>{notice}</span>
          <button
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
            style={{ ...buttonStyle, padding: 4 }}
          >
            <X size={13} />
          </button>
        </div>
      )}

      <header style={headerStyle}>
        <div>
          <div style={breadcrumbStyle}>
            <span>Admin Console</span>
            <span>/</span>
            <span>Workspace</span>
            <span>/</span>
            <span style={{ color: colors.blue }}>Departments</span>
          </div>

          <h1 style={titleStyle}>Department Management</h1>

          <p style={subtitleStyle}>
            Organize your workforce, assign department leadership, review
            headcount, and manage departmental lifecycle across ModelNow.
          </p>
        </div>

        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <button onClick={exportCsv} style={buttonStyle}>
            <Activity size={15} />
            Export CSV
          </button>
          <button onClick={openCreate} style={primaryButtonStyle}>
            <Plus size={16} />
            Create department
          </button>
        </div>
      </header>

      <section style={metricsGridStyle}>
        {[
          {
            title: "Total departments",
            value: departments.length,
            description: "Listed departments",
            icon: Building2,
            color: "#315FEA",
            background: "#EDF2FF",
          },
          {
            title: "Active departments",
            value: departments.filter((item) => item.status === "Active").length,
            description: "Currently operating",
            icon: Check,
            color: "#15803D",
            background: "#EAF8EF",
          },
          {
            title: "Total employees",
            value: totalEmployees,
            description: "Across department records",
            icon: Users,
            color: "#6941C6",
            background: "#F2EDFF",
          },
          {
            title: "Teams",
            value: totalTeams,
            description: "Across listed departments",
            icon: ShieldCheck,
            color: "#B54708",
            background: "#FFF5DF",
          },
        ].map((metric) => {
          const Icon = metric.icon;

          return (
            <article key={metric.title} style={metricCardStyle}>
              <div style={metricTopStyle}>
                <span style={metricLabelStyle}>{metric.title}</span>
                <span
                  style={{
                    ...metricIconStyle,
                    color: metric.color,
                    background: metric.background,
                  }}
                >
                  <Icon size={18} />
                </span>
              </div>
              <div style={metricValueStyle}>
                {metric.value.toLocaleString()}
              </div>
              <p style={metricDescriptionStyle}>{metric.description}</p>
            </article>
          );
        })}
      </section>

      <section style={panelStyle}>
        <div style={panelHeaderStyle}>
          <div>
            <h2 style={panelTitleStyle}>Department directory</h2>
            <p style={panelSubtitleStyle}>
              {filteredDepartments.length} of {departments.length} departments
            </p>
          </div>

          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("All");
            }}
            style={buttonStyle}
          >
            <Filter size={14} />
            Reset filters
          </button>
        </div>

        <div style={filtersStyle}>
          <div style={{ position: "relative" }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: 12,
                top: 12,
                color: colors.muted,
              }}
            />
            <input
              aria-label="Search departments"
              placeholder="Search name, code, department head..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{ ...inputStyle, paddingLeft: 36 }}
            />
          </div>

          <select
            aria-label="Filter departments by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            style={inputStyle}
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Under Review">Under Review</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                {[
                  "DEPARTMENT",
                  "DEPARTMENT HEAD",
                  "EMPLOYEES",
                  "TEAMS",
                  "BUDGET",
                  "STATUS",
                  "CREATED",
                  "ACTIONS",
                ].map((heading) => (
                  <th key={heading} style={thStyle}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredDepartments.map((department) => (
                <tr key={department.id}>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={avatarStyle}>
                        <Building2 size={17} />
                      </span>
                      <div>
                        <div style={{ fontWeight: 700 }}>{department.name}</div>
                        <div style={secondaryTextStyle}>
                          {department.code} · {department.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600 }}>{department.head}</div>
                    <div style={secondaryTextStyle}>
                      {department.email || "No email assigned"}
                    </div>
                  </td>

                  <td style={tdStyle}>
                    <span style={{ fontWeight: 700 }}>
                      {department.employees}
                    </span>
                  </td>

                  <td style={tdStyle}>{department.teams}</td>

                  <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                    {department.budget}
                  </td>

                  <td style={tdStyle}>
                    <span
                      style={{
                        ...statusStyles[department.status],
                        padding: "5px 9px",
                        borderRadius: 20,
                        fontSize: 10,
                        fontWeight: 650,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {department.status}
                    </span>
                  </td>

                  <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                    {department.created}
                  </td>

                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        title="View department"
                        aria-label={`View ${department.name}`}
                        onClick={() => setSelected(department)}
                        style={{ ...buttonStyle, padding: 7, border: "none" }}
                      >
                        <Eye size={15} />
                      </button>

                      <div style={{ position: "relative" }}>
                        <button
                          title="Department actions"
                          aria-label={`Actions for ${department.name}`}
                          onClick={() =>
                            setMenuId((current) =>
                              current === department.id ? null : department.id,
                            )
                          }
                          style={{ ...buttonStyle, padding: 7, border: "none" }}
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        {menuId === department.id && (
                          <div style={menuStyle}>
                            <button
                              style={menuItemStyle}
                              onClick={() => {
                                setSelected(department);
                                setMenuId(null);
                              }}
                            >
                              <Eye size={14} />
                              View details
                            </button>

                            <button
                              style={menuItemStyle}
                              onClick={() => openEdit(department)}
                            >
                              <Building2 size={14} />
                              Edit department
                            </button>

                            <button
                              style={menuItemStyle}
                              onClick={() => changeStatus(department)}
                            >
                              <ShieldCheck size={14} />
                              {department.status === "Archived"
                                ? "Reactivate"
                                : "Archive department"}
                            </button>

                            <button
                              style={{ ...menuItemStyle, color: colors.red }}
                              onClick={() => deleteDepartment(department)}
                            >
                              <Trash2 size={14} />
                              Delete department
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredDepartments.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      padding: 45,
                      textAlign: "center",
                      color: colors.muted,
                    }}
                  >
                    <Search size={22} />
                    <p>No departments match your search or filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={footerStyle}>
          <span>{filteredDepartments.length} department record(s)</span>
          <span>Demo data · Changes are stored in page state only</span>
        </div>
      </section>

      <section style={panelStyle}>
        <div style={panelHeaderStyle}>
          <div>
            <h2 style={panelTitleStyle}>Department operations</h2>
            <p style={panelSubtitleStyle}>
              Core functions for workspace administrators
            </p>
          </div>
        </div>

        <div style={capabilitiesGridStyle}>
          {[
            ["Organization structure", "Maintain clear departmental ownership and identity."],
            ["Headcount visibility", "Review employee counts and team distribution."],
            ["Leadership assignment", "Identify department heads and their contact details."],
            ["Lifecycle management", "Review active, under-review, and archived departments."],
          ].map(([title, description]) => (
            <article key={title} style={capabilityCardStyle}>
              <span style={capabilityIconStyle}>
                <ShieldCheck size={17} />
              </span>
              <div>
                <h3 style={{ margin: "0 0 6px", fontSize: 12 }}>{title}</h3>
                <p style={capabilityDescriptionStyle}>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {showCreate && (
        <div
          style={overlayStyle}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowCreate(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="department-form-title"
            style={modalStyle}
          >
            <div style={modalHeaderStyle}>
              <div>
                <h2 id="department-form-title" style={{ margin: 0, fontSize: 19 }}>
                  {editing ? "Edit department" : "Create department"}
                </h2>
                <p style={{ margin: "6px 0 0", color: colors.muted, fontSize: 12 }}>
                  {editing
                    ? "Update department information."
                    : "Add a department to the workspace directory."}
                </p>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                aria-label="Close form"
                style={{ ...buttonStyle, padding: 7 }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={saveDepartment} style={formStyle}>
              <label style={labelStyle}>
                Department name
                <input
                  required
                  maxLength={80}
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="e.g. Customer Success"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Department code
                <input
                  required
                  maxLength={10}
                  value={form.code}
                  onChange={(event) =>
                    setForm({ ...form, code: event.target.value.toUpperCase() })
                  }
                  placeholder="e.g. CS"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Department head
                <input
                  value={form.head}
                  onChange={(event) =>
                    setForm({ ...form, head: event.target.value })
                  }
                  placeholder="Name of department head"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Head email
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  placeholder="head@company.com"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Description
                <textarea
                  rows={3}
                  maxLength={300}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Department responsibilities..."
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </label>

              <label style={labelStyle}>
                Annual budget (USD)
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.budget}
                  onChange={(event) =>
                    setForm({ ...form, budget: event.target.value })
                  }
                  placeholder="e.g. 100000"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Status
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status: event.target.value as DepartmentStatus,
                    })
                  }
                  style={inputStyle}
                >
                  <option value="Active">Active</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Archived">Archived</option>
                </select>
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 9 }}>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  style={buttonStyle}
                >
                  Cancel
                </button>
                <button type="submit" style={primaryButtonStyle}>
                  <Plus size={15} />
                  {editing ? "Save changes" : "Create department"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selected && (
        <div
          style={overlayStyle}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="department-details-title"
            style={modalStyle}
          >
            <div style={modalHeaderStyle}>
              <div>
                <h2 id="department-details-title" style={{ margin: 0, fontSize: 19 }}>
                  Department details
                </h2>
                <p style={{ color: colors.muted, fontSize: 12, margin: "6px 0 0" }}>
                  {selected.id}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close details"
                style={{ ...buttonStyle, padding: 7 }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
                <span style={{ ...avatarStyle, width: 48, height: 48 }}>
                  <Building2 size={23} />
                </span>
                <div>
                  <h3 style={{ margin: "0 0 6px", fontSize: 18 }}>{selected.name}</h3>
                  <span style={{ color: colors.muted, fontSize: 12 }}>
                    Department code: {selected.code}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: 12, color: colors.muted, lineHeight: 1.7 }}>
                {selected.description || "No description provided."}
              </p>

              <div style={detailsGridStyle}>
                {[
                  ["Department head", selected.head],
                  ["Head email", selected.email || "Not assigned"],
                  ["Employees", String(selected.employees)],
                  ["Teams", String(selected.teams)],
                  ["Budget", selected.budget],
                  ["Created", selected.created],
                  ["Status", selected.status],
                  ["Department ID", selected.id],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, color: colors.muted, marginBottom: 6 }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 650, overflowWrap: "anywhere" }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 26 }}>
                <button
                  onClick={() => openEdit(selected)}
                  style={buttonStyle}
                >
                  <Building2 size={14} />
                  Edit
                </button>
                <button onClick={() => setSelected(null)} style={buttonStyle}>
                  Close
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  padding: 28,
  background: colors.background,
  color: colors.text,
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 18,
  flexWrap: "wrap",
  marginBottom: 25,
};

const breadcrumbStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  color: colors.muted,
  fontSize: 12,
  marginBottom: 12,
};

const titleStyle: CSSProperties = {
  margin: "0 0 9px",
  fontSize: 28,
  letterSpacing: -0.8,
  fontWeight: 750,
};

const subtitleStyle: CSSProperties = {
  margin: 0,
  maxWidth: 700,
  color: colors.muted,
  fontSize: 13,
  lineHeight: 1.7,
};

const metricsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))",
  gap: 15,
  marginBottom: 24,
};

const metricCardStyle: CSSProperties = {
  padding: 19,
  border: `1px solid ${colors.border}`,
  borderRadius: 13,
  background: "#FFFFFF",
};

const metricTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
};

const metricLabelStyle: CSSProperties = {
  color: colors.muted,
  fontSize: 12,
  fontWeight: 600,
};

const metricIconStyle: CSSProperties = {
  display: "grid",
  placeItems: "center",
  width: 36,
  height: 36,
  borderRadius: 10,
};

const metricValueStyle: CSSProperties = {
  marginTop: 13,
  fontSize: 29,
  fontWeight: 750,
  letterSpacing: -0.7,
};

const metricDescriptionStyle: CSSProperties = {
  margin: "7px 0 0",
  color: colors.muted,
  fontSize: 11,
};

const panelStyle: CSSProperties = {
  marginBottom: 22,
  border: `1px solid ${colors.border}`,
  borderRadius: 13,
  background: "#FFFFFF",
  overflow: "visible",
};

const panelHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 12,
  padding: "20px 21px",
  borderBottom: `1px solid ${colors.border}`,
};

const panelTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
};

const panelSubtitleStyle: CSSProperties = {
  margin: "6px 0 0",
  color: colors.muted,
  fontSize: 11,
};

const filtersStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 11,
  padding: "16px 21px",
  borderBottom: `1px solid ${colors.border}`,
};

const tableStyle: CSSProperties = {
  width: "100%",
  minWidth: 1050,
  borderCollapse: "collapse",
  textAlign: "left",
  fontSize: 12,
};

const thStyle: CSSProperties = {
  padding: "13px 15px",
  color: colors.muted,
  background: "#FAFBFD",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 0.5,
  whiteSpace: "nowrap",
  borderBottom: `1px solid ${colors.border}`,
};

const tdStyle: CSSProperties = {
  padding: 14,
  verticalAlign: "middle",
  borderBottom: `1px solid ${colors.border}`,
};

const avatarStyle: CSSProperties = {
  display: "grid",
  placeItems: "center",
  width: 36,
  height: 36,
  borderRadius: 10,
  flexShrink: 0,
  background: "#EDF2FF",
  color: colors.blue,
};

const secondaryTextStyle: CSSProperties = {
  marginTop: 4,
  color: colors.muted,
  fontSize: 10,
};

const footerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 10,
  padding: "13px 21px",
  color: colors.muted,
  fontSize: 10,
};

const capabilitiesGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 13,
  padding: 20,
};

const capabilityCardStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 11,
  padding: 15,
  border: `1px solid ${colors.border}`,
  borderRadius: 10,
};

const capabilityIconStyle: CSSProperties = {
  display: "grid",
  placeItems: "center",
  width: 35,
  height: 35,
  borderRadius: 9,
  background: "#EDF2FF",
  color: colors.blue,
  flexShrink: 0,
};

const capabilityDescriptionStyle: CSSProperties = {
  margin: 0,
  color: colors.muted,
  fontSize: 11,
  lineHeight: 1.6,
};

const toastStyle: CSSProperties = {
  position: "fixed",
  top: 20,
  right: 24,
  zIndex: 100,
  display: "flex",
  alignItems: "center",
  gap: 9,
  padding: "12px 15px",
  background: "#172033",
  color: "#FFFFFF",
  borderRadius: 10,
  boxShadow: "0 8px 28px #17203326",
  fontSize: 12,
};

const menuStyle: CSSProperties = {
  position: "absolute",
  right: 0,
  top: 35,
  width: 190,
  padding: 5,
  zIndex: 30,
  background: "#FFFFFF",
  border: `1px solid ${colors.border}`,
  borderRadius: 10,
  boxShadow: "0 10px 30px #1720331A",
};

const menuItemStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  width: "100%",
  padding: 10,
  border: "none",
  borderRadius: 7,
  background: "#FFFFFF",
  color: colors.text,
  textAlign: "left",
  fontSize: 11,
  cursor: "pointer",
};

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 90,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 18,
  background: "#10182880",
};

const modalStyle: CSSProperties = {
  width: "100%",
  maxWidth: 530,
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#FFFFFF",
  borderRadius: 15,
  boxShadow: "0 24px 70px #10182840",
};

const modalHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 15,
  padding: 22,
  borderBottom: `1px solid ${colors.border}`,
};

const formStyle: CSSProperties = {
  display: "grid",
  gap: 15,
  padding: 22,
};

const labelStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  color: colors.text,
  fontSize: 12,
  fontWeight: 600,
};

const detailsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 18,
};
