
"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Users,
  UserPlus,
  BriefcaseBusiness,
  X,
} from "lucide-react";

type EmployeeStatus = "Active" | "Pending" | "Suspended";

type Employee = {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: EmployeeStatus;
  lastActive: string;
};

const initialEmployees: Employee[] = [
  {
    id: "EMP-1001",
    name: "Ananya Sharma",
    email: "ananya@modelnow.example",
    department: "Engineering",
    role: "Workspace Admin",
    status: "Active",
    lastActive: "2 minutes ago",
  },
  {
    id: "EMP-1002",
    name: "Rahul Verma",
    email: "rahul@modelnow.example",
    department: "AI Research",
    role: "Research Lead",
    status: "Active",
    lastActive: "12 minutes ago",
  },
  {
    id: "EMP-1003",
    name: "Priya Reddy",
    email: "priya@modelnow.example",
    department: "Product",
    role: "Product Manager",
    status: "Active",
    lastActive: "35 minutes ago",
  },
  {
    id: "EMP-1004",
    name: "Arjun Kumar",
    email: "arjun@modelnow.example",
    department: "Operations",
    role: "Team Member",
    status: "Pending",
    lastActive: "Invitation sent",
  },
  {
    id: "EMP-1005",
    name: "Sneha Patel",
    email: "sneha@modelnow.example",
    department: "Security",
    role: "Security Analyst",
    status: "Active",
    lastActive: "1 hour ago",
  },
];

const departments = [
  { name: "Engineering", employees: 42, color: "#315FEA" },
  { name: "AI Research", employees: 28, color: "#6941C6" },
  { name: "Product", employees: 18, color: "#087E8B" },
  { name: "Operations", employees: 14, color: "#B54708" },
  { name: "Security", employees: 9, color: "#15803D" },
];

const recentActivity = [
  {
    title: "New employee invitation created",
    description: "An invitation was prepared for the Operations team.",
    time: "10 minutes ago",
    icon: UserPlus,
    color: "#315FEA",
  },
  {
    title: "Workspace access reviewed",
    description: "An administrator reviewed workspace permissions.",
    time: "32 minutes ago",
    icon: ShieldCheck,
    color: "#15803D",
  },
  {
    title: "Engineering team updated",
    description: "Team membership information was updated.",
    time: "1 hour ago",
    icon: Users,
    color: "#6941C6",
  },
  {
    title: "Project workspace created",
    description: "A new project workspace was added to the demo.",
    time: "3 hours ago",
    icon: BriefcaseBusiness,
    color: "#B54708",
  },
];

const palette = {
  text: "#172033",
  muted: "#697586",
  border: "#E5EAF1",
  background: "#F7F9FC",
  blue: "#315FEA",
  green: "#15803D",
};

const statusColors: Record<
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
  border: `1px solid ${palette.border}`,
  borderRadius: 9,
  padding: "10px 12px",
  background: "#FFFFFF",
  color: palette.text,
  fontSize: 13,
  outline: "none",
};

const buttonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  border: `1px solid ${palette.border}`,
  borderRadius: 9,
  padding: "10px 13px",
  background: "#FFFFFF",
  color: palette.text,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};

export default function WorkspaceOverviewPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showInvite, setShowInvite] = useState(false);
  const [notice, setNotice] = useState("");
  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    department: "Engineering",
    role: "Team Member",
  });

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !query ||
        [
          employee.name,
          employee.email,
          employee.department,
          employee.role,
          employee.id,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All" || employee.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [employees, search, statusFilter]);

  const activeCount = employees.filter(
    (employee) => employee.status === "Active",
  ).length;

  const pendingCount = employees.filter(
    (employee) => employee.status === "Pending",
  ).length;

  const metrics = [
    {
      title: "Total Employees",
      value: "111",
      detail: "Across all departments",
      change: "+8.2%",
      icon: Users,
      color: "#315FEA",
      background: "#EDF2FF",
      positive: true,
    },
    {
      title: "Active Employees",
      value: "96",
      detail: "86.5% of total employees",
      change: "+4.6%",
      icon: CheckCircle2,
      color: "#15803D",
      background: "#EAF8EF",
      positive: true,
    },
    {
      title: "Pending Invitations",
      value: String(pendingCount + 11),
      detail: "Awaiting acceptance",
      change: "Needs review",
      icon: Mail,
      color: "#B54708",
      background: "#FFF5DF",
      positive: false,
    },
    {
      title: "Departments",
      value: String(departments.length),
      detail: "Organized business units",
      change: "View departments",
      icon: Building2,
      color: "#6941C6",
      background: "#F2EDFF",
      positive: true,
    },
  ];

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }

  function inviteEmployee(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const email = inviteForm.email.trim().toLowerCase();

    if (employees.some((employee) => employee.email.toLowerCase() === email)) {
      notify("This email already exists in the employee directory.");
      return;
    }

    const employee: Employee = {
      id: `EMP-${Date.now().toString().slice(-6)}`,
      name: inviteForm.name.trim(),
      email,
      department: inviteForm.department,
      role: inviteForm.role,
      status: "Pending",
      lastActive: "Invitation prepared",
    };

    setEmployees((current) => [employee, ...current]);
    setInviteForm({
      name: "",
      email: "",
      department: "Engineering",
      role: "Team Member",
    });
    setShowInvite(false);
    setSearch("");
    setStatusFilter("All");
    notify("Employee added to the local demo directory.");
  }

  function changeEmployeeStatus(employee: Employee) {
    const nextStatus: EmployeeStatus =
      employee.status === "Suspended" ? "Active" : "Suspended";

    setEmployees((current) =>
      current.map((item) =>
        item.id === employee.id ? { ...item, status: nextStatus } : item,
      ),
    );

    setSelectedEmployee({ ...employee, status: nextStatus });
    notify(`${employee.name} marked ${nextStatus.toLowerCase()}.`);
  }

  function exportEmployees() {
    const header = [
      "Employee ID",
      "Name",
      "Email",
      "Department",
      "Role",
      "Status",
      "Last Active",
    ];

    const rows = employees.map((employee) => [
      employee.id,
      employee.name,
      employee.email,
      employee.department,
      employee.role,
      employee.status,
      employee.lastActive,
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((value) => `"${value.replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-workspace-employees.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    notify("Employee directory exported.");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 28,
        background: palette.background,
        color: palette.text,
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {notice && (
        <div
          role="status"
          style={{
            position: "fixed",
            top: 20,
            right: 24,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "13px 16px",
            background: "#172033",
            color: "#FFFFFF",
            borderRadius: 10,
            boxShadow: "0 8px 28px #17203326",
            fontSize: 12,
          }}
        >
          <CheckCircle2 size={17} />
          {notice}
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
            style={{
              ...buttonStyle,
              padding: 4,
              color: palette.text,
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 18,
          flexWrap: "wrap",
          marginBottom: 25,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              color: palette.muted,
              fontSize: 12,
              marginBottom: 12,
            }}
          >
            <span>Admin Console</span>
            <span>/</span>
            <span>Workspace</span>
            <span>/</span>
            <span style={{ color: palette.blue }}>Overview</span>
          </div>

          <h1
            style={{
              fontSize: 28,
              letterSpacing: -0.8,
              margin: "0 0 9px",
              fontWeight: 750,
            }}
          >
            Workspace Overview
          </h1>

          <p
            style={{
              color: palette.muted,
              fontSize: 13,
              lineHeight: 1.7,
              margin: 0,
              maxWidth: 700,
            }}
          >
            Monitor your organization, employee directory, departments, access,
            and workspace activity from one place.
          </p>
        </div>

        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <button onClick={exportEmployees} style={buttonStyle}>
            <Activity size={15} />
            Export employees
          </button>
          <button
            onClick={() => setShowInvite(true)}
            style={{
              ...buttonStyle,
              background: palette.blue,
              borderColor: palette.blue,
              color: "#FFFFFF",
            }}
          >
            <Plus size={16} />
            Invite employee
          </button>
        </div>
      </header>

      <section
        aria-label="Workspace metrics"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))",
          gap: 15,
          marginBottom: 24,
        }}
      >
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article
              key={metric.title}
              style={{
                background: "#FFFFFF",
                border: `1px solid ${palette.border}`,
                borderRadius: 13,
                padding: 19,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    color: palette.muted,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {metric.title}
                </span>
                <span
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: metric.background,
                    color: metric.color,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} />
                </span>
              </div>

              <div
                style={{
                  fontSize: 29,
                  fontWeight: 750,
                  letterSpacing: -0.7,
                  marginTop: 13,
                }}
              >
                {metric.value}
              </div>

              <p
                style={{
                  fontSize: 11,
                  color: palette.muted,
                  margin: "7px 0 0",
                }}
              >
                {metric.detail}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  marginTop: 14,
                  fontSize: 11,
                  color: metric.positive ? palette.green : "#B54708",
                  fontWeight: 600,
                }}
              >
                {metric.positive ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <Clock3 size={14} />
                )}
                {metric.change}
              </div>
            </article>
          );
        })}
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 440px), 1fr))",
          gap: 20,
          marginBottom: 22,
        }}
      >
        <section
          style={{
            background: "#FFFFFF",
            border: `1px solid ${palette.border}`,
            borderRadius: 13,
            padding: 21,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              alignItems: "flex-start",
              marginBottom: 20,
            }}
          >
            <div>
              <h2 style={{ fontSize: 16, margin: 0 }}>Department distribution</h2>
              <p style={{ color: palette.muted, fontSize: 11, margin: "6px 0 0" }}>
                Employees grouped by department
              </p>
            </div>
            <Building2 size={19} color={palette.muted} />
          </div>

          <div style={{ display: "grid", gap: 19 }}>
            {departments.map((department) => {
              const percentage = Math.round(
                (department.employees / 111) * 100,
              );

              return (
                <div key={department.name}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      marginBottom: 8,
                      fontSize: 12,
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{department.name}</span>
                    <span style={{ color: palette.muted }}>
                      {department.employees} employees · {percentage}%
                    </span>
                  </div>

                  <div
                    style={{
                      height: 7,
                      borderRadius: 10,
                      background: "#EEF1F6",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${percentage}%`,
                        background: department.color,
                        borderRadius: 10,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() =>
              notify("Connect the Departments page to manage department records.")
            }
            style={{ ...buttonStyle, marginTop: 22, width: "100%" }}
          >
            <Building2 size={15} />
            Manage departments
          </button>
        </section>

        <section
          style={{
            background: "#FFFFFF",
            border: `1px solid ${palette.border}`,
            borderRadius: 13,
            padding: 21,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              alignItems: "flex-start",
              marginBottom: 20,
            }}
          >
            <div>
              <h2 style={{ fontSize: 16, margin: 0 }}>Workspace activity</h2>
              <p style={{ color: palette.muted, fontSize: 11, margin: "6px 0 0" }}>
                Recent administrative events
              </p>
            </div>
            <Activity size={19} color={palette.muted} />
          </div>

          <div style={{ display: "grid", gap: 21 }}>
            {recentActivity.map((activity) => {
              const Icon = activity.icon;

              return (
                <div
                  key={activity.title}
                  style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
                >
                  <span
                    style={{
                      width: 35,
                      height: 35,
                      borderRadius: 10,
                      display: "grid",
                      placeItems: "center",
                      background: `${activity.color}14`,
                      color: activity.color,
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={16} />
                  </span>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 650 }}>
                      {activity.title}
                    </div>
                    <p
                      style={{
                        color: palette.muted,
                        fontSize: 11,
                        lineHeight: 1.6,
                        margin: "5px 0",
                      }}
                    >
                      {activity.description}
                    </p>
                    <span style={{ color: palette.muted, fontSize: 10 }}>
                      {activity.time}
                    </span>
                  </div>

                  <MoreHorizontal size={17} color={palette.muted} />
                </div>
              );
            })}
          </div>

          <button
            onClick={() =>
              notify("The complete activity history belongs on Workspace Activity.")
            }
            style={{ ...buttonStyle, marginTop: 19, width: "100%" }}
          >
            <CalendarDays size={15} />
            View activity history
          </button>
        </section>
      </div>

      <section
        style={{
          background: "#FFFFFF",
          border: `1px solid ${palette.border}`,
          borderRadius: 13,
          overflow: "hidden",
          marginBottom: 22,
        }}
      >
        <div
          style={{
            padding: "20px 21px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            borderBottom: `1px solid ${palette.border}`,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 16 }}>Employee directory</h2>
            <p style={{ margin: "6px 0 0", color: palette.muted, fontSize: 11 }}>
              {filteredEmployees.length} displayed · {employees.length} sample records
            </p>
          </div>

          <button onClick={() => setShowInvite(true)} style={buttonStyle}>
            <UserPlus size={15} />
            Add employee
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
            padding: "16px 21px",
            borderBottom: `1px solid ${palette.border}`,
          }}
        >
          <div style={{ position: "relative" }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: 12,
                top: 12,
                color: palette.muted,
              }}
            />
            <input
              aria-label="Search employees"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employees..."
              style={{ ...inputStyle, paddingLeft: 36 }}
            />
          </div>

          <select
            aria-label="Filter employee status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            style={inputStyle}
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Suspended">Suspended</option>
          </select>

          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("All");
            }}
            style={buttonStyle}
          >
            Reset filters
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: 820,
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: 12,
            }}
          >
            <thead>
              <tr style={{ background: "#FAFBFD", color: palette.muted }}>
                {["EMPLOYEE", "DEPARTMENT", "ROLE", "STATUS", "LAST ACTIVE", "DETAILS"].map(
                  (heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: "13px 16px",
                        fontSize: 10,
                        letterSpacing: 0.5,
                        borderBottom: `1px solid ${palette.border}`,
                      }}
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td
                    style={{
                      padding: 15,
                      borderBottom: `1px solid ${palette.border}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        style={{
                          width: 35,
                          height: 35,
                          borderRadius: "50%",
                          background: "#EDF2FF",
                          color: palette.blue,
                          display: "grid",
                          placeItems: "center",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {employee.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                      <div>
                        <div style={{ fontWeight: 650 }}>{employee.name}</div>
                        <div
                          style={{
                            fontSize: 10,
                            color: palette.muted,
                            marginTop: 4,
                          }}
                        >
                          {employee.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: 15, borderBottom: `1px solid ${palette.border}` }}>
                    {employee.department}
                  </td>
                  <td style={{ padding: 15, borderBottom: `1px solid ${palette.border}` }}>
                    {employee.role}
                  </td>

                  <td style={{ padding: 15, borderBottom: `1px solid ${palette.border}` }}>
                    <span
                      style={{
                        ...statusColors[employee.status],
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

                  <td
                    style={{
                      padding: 15,
                      borderBottom: `1px solid ${palette.border}`,
                      color: palette.muted,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {employee.lastActive}
                  </td>

                  <td style={{ padding: 15, borderBottom: `1px solid ${palette.border}` }}>
                    <button
                      aria-label={`View ${employee.name}`}
                      onClick={() => setSelectedEmployee(employee)}
                      style={{ ...buttonStyle, padding: 7 }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {filteredEmployees.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: 35,
                      textAlign: "center",
                      color: palette.muted,
                    }}
                  >
                    No employees match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            padding: "13px 21px",
            color: palette.muted,
            fontSize: 10,
          }}
        >
          Demo records only. Connect the employee API for live organization data.
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 13,
          marginBottom: 20,
        }}
      >
        {[
          {
            title: "Access & permissions",
            description: "Review roles and workspace access.",
            icon: ShieldCheck,
          },
          {
            title: "Teams & projects",
            description: "Organize employees around work.",
            icon: BriefcaseBusiness,
          },
          {
            title: "Invitations",
            description: `${pendingCount} pending sample invitation(s) in the directory.`,
            icon: Mail,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.title}
              style={{
                background: "#FFFFFF",
                border: `1px solid ${palette.border}`,
                borderRadius: 12,
                padding: 17,
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <span
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "#EDF2FF",
                  color: palette.blue,
                  flexShrink: 0,
                }}
              >
                <Icon size={17} />
              </span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{item.title}</div>
                <p
                  style={{
                    color: palette.muted,
                    fontSize: 11,
                    lineHeight: 1.6,
                    margin: "6px 0 0",
                  }}
                >
                  {item.description}
                </p>
              </div>
            </article>
          );
        })}
      </section>

      {showInvite && (
        <div
          style={overlayStyle}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowInvite(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-title"
            style={modalStyle}
          >
            <div style={modalHeaderStyle}>
              <div>
                <h2 id="invite-title" style={{ margin: 0, fontSize: 19 }}>
                  Invite employee
                </h2>
                <p style={{ margin: "6px 0 0", fontSize: 12, color: palette.muted }}>
                  Add an employee record to this demo directory.
                </p>
              </div>
              <button
                aria-label="Close invitation dialog"
                onClick={() => setShowInvite(false)}
                style={{ ...buttonStyle, padding: 7 }}
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={inviteEmployee}
              style={{ padding: 22, display: "grid", gap: 15 }}
            >
              <label style={labelStyle}>
                Employee name
                <input
                  required
                  maxLength={80}
                  value={inviteForm.name}
                  onChange={(event) =>
                    setInviteForm({ ...inviteForm, name: event.target.value })
                  }
                  placeholder="Full name"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Work email
                <input
                  required
                  type="email"
                  value={inviteForm.email}
                  onChange={(event) =>
                    setInviteForm({ ...inviteForm, email: event.target.value })
                  }
                  placeholder="employee@company.com"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Department
                <select
                  value={inviteForm.department}
                  onChange={(event) =>
                    setInviteForm({ ...inviteForm, department: event.target.value })
                  }
                  style={inputStyle}
                >
                  {departments.map((department) => (
                    <option key={department.name} value={department.name}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </label>

              <label style={labelStyle}>
                Employee role
                <select
                  value={inviteForm.role}
                  onChange={(event) =>
                    setInviteForm({ ...inviteForm, role: event.target.value })
                  }
                  style={inputStyle}
                >
                  <option>Team Member</option>
                  <option>Department Lead</option>
                  <option>Workspace Admin</option>
                  <option>Security Analyst</option>
                  <option>Research Lead</option>
                </select>
              </label>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 9,
                  marginTop: 5,
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowInvite(false)}
                  style={buttonStyle}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    ...buttonStyle,
                    background: palette.blue,
                    borderColor: palette.blue,
                    color: "#FFFFFF",
                  }}
                >
                  <Mail size={15} />
                  Add employee
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selectedEmployee && (
        <div
          style={overlayStyle}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedEmployee(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-details-title"
            style={modalStyle}
          >
            <div style={modalHeaderStyle}>
              <div>
                <h2 id="employee-details-title" style={{ margin: 0, fontSize: 19 }}>
                  Employee details
                </h2>
                <p style={{ margin: "6px 0 0", fontSize: 12, color: palette.muted }}>
                  {selectedEmployee.id}
                </p>
              </div>
              <button
                aria-label="Close employee details"
                onClick={() => setSelectedEmployee(null)}
                style={{ ...buttonStyle, padding: 7 }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: 22 }}>
              <h3 style={{ margin: "0 0 6px", fontSize: 18 }}>
                {selectedEmployee.name}
              </h3>
              <p style={{ color: palette.muted, fontSize: 12, margin: "0 0 22px" }}>
                {selectedEmployee.email}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 18 }}>
                {[
                  ["Department", selectedEmployee.department],
                  ["Role", selectedEmployee.role],
                  ["Status", selectedEmployee.status],
                  ["Last active", selectedEmployee.lastActive],
                ].map(([label, value]) => (
                  <div key={label} style={{ minWidth: 0 }}>
                    <div style={{ color: palette.muted, fontSize: 11, marginBottom: 6 }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 650, overflowWrap: "anywhere" }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 9,
                  marginTop: 25,
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => changeEmployeeStatus(selectedEmployee)}
                  style={buttonStyle}
                >
                  {selectedEmployee.status === "Suspended" ? "Reactivate" : "Suspend employee"}
                </button>
                <button
                  onClick={() => setSelectedEmployee(null)}
                  style={buttonStyle}
                >
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
  borderBottom: `1px solid ${palette.border}`,
};

const labelStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  color: palette.text,
  fontSize: 12,
  fontWeight: 600,
};
