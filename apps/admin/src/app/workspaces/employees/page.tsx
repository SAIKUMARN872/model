
"use client";

import { useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import {
  ArrowDownToLine,
  Check,
  CheckCircle2,
  ChevronDown,
  CirclePause,
  Eye,
  Filter,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";

type EmployeeStatus = "Active" | "Pending" | "Suspended";
type EmployeeRole =
  | "Workspace Admin"
  | "Department Lead"
  | "Research Lead"
  | "Security Analyst"
  | "Product Manager"
  | "Team Member";

type Employee = {
  id: string;
  name: string;
  email: string;
  department: string;
  team: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  joined: string;
  lastActive: string;
};

const initialEmployees: Employee[] = [
  {
    id: "EMP-1001",
    name: "Ananya Sharma",
    email: "ananya@modelnow.example",
    department: "Engineering",
    team: "Platform Engineering",
    role: "Workspace Admin",
    status: "Active",
    joined: "2026-08-12",
    lastActive: "2 minutes ago",
  },
  {
    id: "EMP-1002",
    name: "Rahul Verma",
    email: "rahul@modelnow.example",
    department: "AI Research",
    team: "Foundation Models",
    role: "Research Lead",
    status: "Active",
    joined: "2026-08-15",
    lastActive: "12 minutes ago",
  },
  {
    id: "EMP-1003",
    name: "Priya Reddy",
    email: "priya@modelnow.example",
    department: "Product",
    team: "Product Strategy",
    role: "Product Manager",
    status: "Active",
    joined: "2026-08-20",
    lastActive: "35 minutes ago",
  },
  {
    id: "EMP-1004",
    name: "Arjun Kumar",
    email: "arjun@modelnow.example",
    department: "Operations",
    team: "Business Operations",
    role: "Team Member",
    status: "Pending",
    joined: "2026-11-03",
    lastActive: "Invitation pending",
  },
  {
    id: "EMP-1005",
    name: "Sneha Patel",
    email: "sneha@modelnow.example",
    department: "Security",
    team: "Trust & Safety",
    role: "Security Analyst",
    status: "Active",
    joined: "2026-09-01",
    lastActive: "1 hour ago",
  },
  {
    id: "EMP-1006",
    name: "Vikram Rao",
    email: "vikram@modelnow.example",
    department: "Engineering",
    team: "AI Gateway",
    role: "Department Lead",
    status: "Active",
    joined: "2026-07-22",
    lastActive: "3 hours ago",
  },
  {
    id: "EMP-1007",
    name: "Meera Nair",
    email: "meera@modelnow.example",
    department: "AI Research",
    team: "Evaluation",
    role: "Team Member",
    status: "Suspended",
    joined: "2026-06-10",
    lastActive: "5 days ago",
  },
  {
    id: "EMP-1008",
    name: "Karthik Reddy",
    email: "karthik@modelnow.example",
    department: "Product",
    team: "Product Strategy",
    role: "Team Member",
    status: "Active",
    joined: "2026-10-02",
    lastActive: "Yesterday",
  },
];

const departments = [
  "Engineering",
  "AI Research",
  "Product",
  "Operations",
  "Security",
  "Finance",
  "Human Resources",
];

const roles: EmployeeRole[] = [
  "Workspace Admin",
  "Department Lead",
  "Research Lead",
  "Security Analyst",
  "Product Manager",
  "Team Member",
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
  EmployeeStatus,
  { color: string; background: string }
> = {
  Active: { color: "#15803D", background: "#EAF8EF" },
  Pending: { color: "#B54708", background: "#FFF5DF" },
  Suspended: { color: "#B42318", background: "#FEF0EF" },
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${colors.border}`,
  borderRadius: 9,
  padding: "10px 12px",
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
  border: `1px solid ${colors.border}`,
  borderRadius: 9,
  padding: "10px 12px",
  background: "#FFFFFF",
  color: colors.text,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showInvite, setShowInvite] = useState(false);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "Engineering",
    team: "",
    role: "Team Member" as EmployeeRole,
  });

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !query ||
        [
          employee.id,
          employee.name,
          employee.email,
          employee.department,
          employee.team,
          employee.role,
        ].some((value) => value.toLowerCase().includes(query));

      return (
        matchesSearch &&
        (statusFilter === "All" || employee.status === statusFilter) &&
        (departmentFilter === "All" ||
          employee.department === departmentFilter) &&
        (roleFilter === "All" || employee.role === roleFilter)
      );
    });
  }, [employees, search, statusFilter, departmentFilter, roleFilter]);

  const activeCount = employees.filter((item) => item.status === "Active").length;
  const pendingCount = employees.filter((item) => item.status === "Pending").length;
  const suspendedCount = employees.filter(
    (item) => item.status === "Suspended",
  ).length;

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }

  function addEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const email = form.email.trim().toLowerCase();

    if (employees.some((item) => item.email.toLowerCase() === email)) {
      notify("An employee with this email already exists.");
      return;
    }

    const employee: Employee = {
      id: `EMP-${Date.now().toString().slice(-6)}`,
      name: form.name.trim(),
      email,
      department: form.department,
      team: form.team.trim() || "Unassigned",
      role: form.role,
      status: "Pending",
      joined: new Date().toISOString().slice(0, 10),
      lastActive: "Invitation prepared",
    };

    setEmployees((current) => [employee, ...current]);
    setForm({
      name: "",
      email: "",
      department: "Engineering",
      team: "",
      role: "Team Member",
    });
    setShowInvite(false);
    setSearch("");
    setStatusFilter("All");
    setDepartmentFilter("All");
    setRoleFilter("All");
    notify("Employee added to the demo directory as pending.");
  }

  function toggleStatus(employee: Employee) {
    const nextStatus: EmployeeStatus =
      employee.status === "Suspended" ? "Active" : "Suspended";

    setEmployees((current) =>
      current.map((item) =>
        item.id === employee.id ? { ...item, status: nextStatus } : item,
      ),
    );

    setSelected((current) =>
      current?.id === employee.id ? { ...current, status: nextStatus } : current,
    );
    setMenuId(null);
    notify(`${employee.name} marked ${nextStatus.toLowerCase()}.`);
  }

  function activateEmployee(employee: Employee) {
    setEmployees((current) =>
      current.map((item) =>
        item.id === employee.id
          ? {
              ...item,
              status: "Active",
              lastActive: "Recently activated",
            }
          : item,
      ),
    );
    setSelected((current) =>
      current?.id === employee.id
        ? { ...current, status: "Active", lastActive: "Recently activated" }
        : current,
    );
    setMenuId(null);
    notify(`${employee.name} activated in the demo.`);
  }

  function exportCsv() {
    const headers = [
      "Employee ID",
      "Name",
      "Email",
      "Department",
      "Team",
      "Role",
      "Status",
      "Joined",
      "Last Active",
    ];

    const rows = filteredEmployees.map((item) => [
      item.id,
      item.name,
      item.email,
      item.department,
      item.team,
      item.role,
      item.status,
      item.joined,
      item.lastActive,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${value.replace(/"/g, '""')}"`).join(","),
      )
      .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-employees.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    notify("Employee CSV exported.");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 28,
        background: colors.background,
        color: colors.text,
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      }}
    >
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
            <span style={{ color: colors.blue }}>Employees</span>
          </div>
          <h1 style={titleStyle}>Employee Management</h1>
          <p style={subtitleStyle}>
            Manage employee records, organizational assignments, roles, and
            account lifecycle across your ModelNow workspace.
          </p>
        </div>

        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <button onClick={exportCsv} style={buttonStyle}>
            <ArrowDownToLine size={15} />
            Export CSV
          </button>
          <button
            onClick={() => setShowInvite(true)}
            style={primaryButtonStyle}
          >
            <Plus size={16} />
            Add employee
          </button>
        </div>
      </header>

      <section style={metricsGridStyle}>
        {[
          {
            title: "Total employees",
            value: employees.length,
            description: "Employee records",
            icon: Users,
            color: "#315FEA",
            background: "#EDF2FF",
          },
          {
            title: "Active employees",
            value: activeCount,
            description: "Accounts currently active",
            icon: CheckCircle2,
            color: "#15803D",
            background: "#EAF8EF",
          },
          {
            title: "Pending invitations",
            value: pendingCount,
            description: "Awaiting onboarding",
            icon: Mail,
            color: "#B54708",
            background: "#FFF5DF",
          },
          {
            title: "Suspended accounts",
            value: suspendedCount,
            description: "Access currently suspended",
            icon: ShieldCheck,
            color: "#B42318",
            background: "#FEF0EF",
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
              <div style={metricValueStyle}>{metric.value.toLocaleString()}</div>
              <p style={metricDescriptionStyle}>{metric.description}</p>
            </article>
          );
        })}
      </section>

      <section style={panelStyle}>
        <div style={panelHeaderStyle}>
          <div>
            <h2 style={panelTitleStyle}>Employee directory</h2>
            <p style={panelSubtitleStyle}>
              Showing {filteredEmployees.length} of {employees.length} employees
            </p>
          </div>
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("All");
              setDepartmentFilter("All");
              setRoleFilter("All");
            }}
            style={buttonStyle}
          >
            <Filter size={14} />
            Clear filters
          </button>
        </div>

        <div style={filtersGridStyle}>
          <div style={{ position: "relative" }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                color: colors.muted,
              }}
            />
            <input
              aria-label="Search employees"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, ID, team..."
              style={{ ...inputStyle, paddingLeft: 36 }}
            />
          </div>

          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            style={inputStyle}
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Suspended">Suspended</option>
          </select>

          <select
            aria-label="Filter by department"
            value={departmentFilter}
            onChange={(event) => setDepartmentFilter(event.target.value)}
            style={inputStyle}
          >
            <option value="All">All departments</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by role"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            style={inputStyle}
          >
            <option value="All">All roles</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                {[
                  "EMPLOYEE",
                  "DEPARTMENT / TEAM",
                  "ROLE",
                  "STATUS",
                  "JOINED",
                  "LAST ACTIVE",
                  "ACTIONS",
                ].map((heading) => (
                  <th key={heading} style={thStyle}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={avatarStyle}>
                        {employee.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                      <div>
                        <div style={{ fontWeight: 650 }}>{employee.name}</div>
                        <div style={secondaryTextStyle}>{employee.email}</div>
                        <div style={idTextStyle}>{employee.id}</div>
                      </div>
                    </div>
                  </td>

                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600 }}>{employee.department}</div>
                    <div style={secondaryTextStyle}>{employee.team}</div>
                  </td>

                  <td style={tdStyle}>
                    <span style={roleBadgeStyle}>{employee.role}</span>
                  </td>

                  <td style={tdStyle}>
                    <span
                      style={{
                        ...statusStyles[employee.status],
                        padding: "5px 9px",
                        borderRadius: 20,
                        fontSize: 10,
                        fontWeight: 650,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {employee.status}
                    </span>
                  </td>

                  <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                    {employee.joined}
                  </td>

                  <td style={{ ...tdStyle, color: colors.muted, whiteSpace: "nowrap" }}>
                    {employee.lastActive}
                  </td>

                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <button
                        aria-label={`View ${employee.name}`}
                        title="View details"
                        onClick={() => setSelected(employee)}
                        style={{ ...buttonStyle, padding: 7, border: "none" }}
                      >
                        <Eye size={15} />
                      </button>

                      <div style={{ position: "relative" }}>
                        <button
                          aria-label={`Actions for ${employee.name}`}
                          title="More actions"
                          onClick={() =>
                            setMenuId((current) =>
                              current === employee.id ? null : employee.id,
                            )
                          }
                          style={{ ...buttonStyle, padding: 7, border: "none" }}
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        {menuId === employee.id && (
                          <div style={menuStyle}>
                            <button
                              style={menuItemStyle}
                              onClick={() => {
                                setSelected(employee);
                                setMenuId(null);
                              }}
                            >
                              <Eye size={14} />
                              View details
                            </button>

                            {employee.status === "Pending" ? (
                              <button
                                style={menuItemStyle}
                                onClick={() => activateEmployee(employee)}
                              >
                                <CheckCircle2 size={14} />
                                Activate employee
                              </button>
                            ) : (
                              <button
                                style={{
                                  ...menuItemStyle,
                                  color:
                                    employee.status === "Active"
                                      ? colors.red
                                      : colors.green,
                                }}
                                onClick={() => toggleStatus(employee)}
                              >
                                <CirclePause size={14} />
                                {employee.status === "Active"
                                  ? "Suspend employee"
                                  : "Reactivate employee"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredEmployees.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: 45,
                      textAlign: "center",
                      color: colors.muted,
                    }}
                  >
                    <Search size={22} />
                    <p>No employees match the current filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={tableFooterStyle}>
          <span>{filteredEmployees.length} employee record(s)</span>
          <span>Local demo data</span>
        </div>
      </section>

      <section style={panelStyle}>
        <div style={panelHeaderStyle}>
          <div>
            <h2 style={panelTitleStyle}>Employee management capabilities</h2>
            <p style={panelSubtitleStyle}>
              Key administrative responsibilities
            </p>
          </div>
        </div>

        <div style={capabilitiesGridStyle}>
          {[
            {
              title: "Employee onboarding",
              description: "Prepare employee records and track pending invitations.",
              icon: UserRound,
            },
            {
              title: "Role assignment",
              description: "Review employee roles and organizational responsibilities.",
              icon: ShieldCheck,
            },
            {
              title: "Department allocation",
              description: "Organize employees into business departments and teams.",
              icon: Users,
            },
            {
              title: "Account lifecycle",
              description: "Review active, pending, and suspended account states.",
              icon: CheckCircle2,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.title} style={capabilityCardStyle}>
                <span style={capabilityIconStyle}>
                  <Icon size={17} />
                </span>
                <div>
                  <h3 style={{ margin: "0 0 6px", fontSize: 12 }}>
                    {item.title}
                  </h3>
                  <p style={capabilityDescriptionStyle}>{item.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {showInvite && (
        <div
          style={overlayStyle}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowInvite(false);
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="invite-title" style={modalStyle}>
            <div style={modalHeaderStyle}>
              <div>
                <h2 id="invite-title" style={{ margin: 0, fontSize: 19 }}>
                  Add employee
                </h2>
                <p style={{ margin: "6px 0 0", color: colors.muted, fontSize: 12 }}>
                  Create a local employee record.
                </p>
              </div>
              <button
                aria-label="Close dialog"
                onClick={() => setShowInvite(false)}
                style={{ ...buttonStyle, padding: 7 }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={addEmployee} style={formStyle}>
              <label style={labelStyle}>
                Full name
                <input
                  required
                  maxLength={80}
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Employee name"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Work email
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  placeholder="employee@company.com"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Department
                <select
                  value={form.department}
                  onChange={(event) => setForm({ ...form, department: event.target.value })}
                  style={inputStyle}
                >
                  {departments.map((department) => (
                    <option key={department}>{department}</option>
                  ))}
                </select>
              </label>

              <label style={labelStyle}>
                Team
                <input
                  value={form.team}
                  onChange={(event) => setForm({ ...form, team: event.target.value })}
                  placeholder="e.g. Platform Engineering"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Role
                <select
                  value={form.role}
                  onChange={(event) =>
                    setForm({ ...form, role: event.target.value as EmployeeRole })
                  }
                  style={inputStyle}
                >
                  {roles.map((role) => (
                    <option key={role}>{role}</option>
                  ))}
                </select>
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 9 }}>
                <button type="button" onClick={() => setShowInvite(false)} style={buttonStyle}>
                  Cancel
                </button>
                <button type="submit" style={primaryButtonStyle}>
                  <Mail size={15} />
                  Add employee
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
          <section role="dialog" aria-modal="true" aria-labelledby="details-title" style={modalStyle}>
            <div style={modalHeaderStyle}>
              <div>
                <h2 id="details-title" style={{ margin: 0, fontSize: 19 }}>
                  Employee details
                </h2>
                <p style={{ color: colors.muted, fontSize: 12, margin: "6px 0 0" }}>
                  {selected.id}
                </p>
              </div>
              <button
                aria-label="Close details"
                onClick={() => setSelected(null)}
                style={{ ...buttonStyle, padding: 7 }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
                <span style={{ ...avatarStyle, width: 48, height: 48, fontSize: 15 }}>
                  {selected.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <div>
                  <h3 style={{ margin: "0 0 5px", fontSize: 17 }}>{selected.name}</h3>
                  <span style={{ color: colors.muted, fontSize: 12 }}>{selected.email}</span>
                </div>
              </div>

              <div style={detailsGridStyle}>
                {[
                  ["Department", selected.department],
                  ["Team", selected.team],
                  ["Role", selected.role],
                  ["Status", selected.status],
                  ["Joined", selected.joined],
                  ["Last active", selected.lastActive],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ color: colors.muted, fontSize: 11, marginBottom: 6 }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 650, overflowWrap: "anywhere" }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 26 }}>
                {selected.status === "Pending" ? (
                  <button onClick={() => activateEmployee(selected)} style={primaryButtonStyle}>
                    <CheckCircle2 size={15} />
                    Activate employee
                  </button>
                ) : (
                  <button onClick={() => toggleStatus(selected)} style={buttonStyle}>
                    <CirclePause size={15} />
                    {selected.status === "Active" ? "Suspend employee" : "Reactivate employee"}
                  </button>
                )}
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
  fontSize: 28,
  letterSpacing: -0.8,
  margin: "0 0 9px",
  fontWeight: 750,
};

const subtitleStyle: CSSProperties = {
  color: colors.muted,
  fontSize: 13,
  lineHeight: 1.7,
  margin: 0,
  maxWidth: 700,
};

const metricsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))",
  gap: 15,
  marginBottom: 24,
};

const metricCardStyle: CSSProperties = {
  background: "#FFFFFF",
  border: `1px solid ${colors.border}`,
  borderRadius: 13,
  padding: 19,
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
  fontSize: 29,
  fontWeight: 750,
  letterSpacing: -0.7,
  marginTop: 13,
};

const metricDescriptionStyle: CSSProperties = {
  fontSize: 11,
  color: colors.muted,
  margin: "7px 0 0",
};

const panelStyle: CSSProperties = {
  background: "#FFFFFF",
  border: `1px solid ${colors.border}`,
  borderRadius: 13,
  overflow: "visible",
  marginBottom: 22,
};

const panelHeaderStyle: CSSProperties = {
  padding: "20px 21px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
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

const filtersGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
  gap: 11,
  padding: "16px 21px",
  borderBottom: `1px solid ${colors.border}`,
};

const tableStyle: CSSProperties = {
  width: "100%",
  minWidth: 1060,
  borderCollapse: "collapse",
  textAlign: "left",
  fontSize: 12,
};

const thStyle: CSSProperties = {
  padding: "13px 15px",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 0.5,
  whiteSpace: "nowrap",
  color: colors.muted,
  background: "#FAFBFD",
  borderBottom: `1px solid ${colors.border}`,
};

const tdStyle: CSSProperties = {
  padding: 14,
  borderBottom: `1px solid ${colors.border}`,
  verticalAlign: "middle",
};

const avatarStyle: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
  background: "#EDF2FF",
  color: colors.blue,
  fontWeight: 750,
  fontSize: 11,
};

const secondaryTextStyle: CSSProperties = {
  color: colors.muted,
  fontSize: 10,
  marginTop: 4,
};

const idTextStyle: CSSProperties = {
  color: "#98A2B3",
  fontSize: 9,
  marginTop: 4,
};

const roleBadgeStyle: CSSProperties = {
  display: "inline-flex",
  border: `1px solid ${colors.border}`,
  borderRadius: 6,
  padding: "5px 8px",
  fontSize: 10,
  whiteSpace: "nowrap",
};

const tableFooterStyle: CSSProperties = {
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
  gap: 11,
  alignItems: "flex-start",
  border: `1px solid ${colors.border}`,
  borderRadius: 10,
  padding: 15,
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

const primaryButtonStyle: CSSProperties = {
  ...buttonStyle,
  background: colors.blue,
  borderColor: colors.blue,
  color: "#FFFFFF",
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
  zIndex: 30,
  padding: 5,
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
  background: "#10182880",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 18,
};

const modalStyle: CSSProperties = {
  width: "100%",
  maxWidth: 510,
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
  padding: 22,
  display: "grid",
  gap: 15,
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

