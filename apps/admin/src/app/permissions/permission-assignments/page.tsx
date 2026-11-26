
"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  ShieldCheck,
  Search,
  Plus,
  X,
  UserRound,
  UsersRound,
  Building2,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Trash2,
  Edit3,
  RefreshCw,
  KeyRound,
  AlertTriangle,
} from "lucide-react";

type PrincipalType = "User" | "Role";
type AssignmentStatus = "Active" | "Pending" | "Revoked";
type AssignmentScope = "Global" | "Organization" | "Workspace";

type Assignment = {
  id: string;
  principalType: PrincipalType;
  principal: string;
  email: string;
  permission: string;
  resource: string;
  scope: AssignmentScope;
  status: AssignmentStatus;
  assignedBy: string;
  assignedAt: string;
  expiresAt: string;
};

const initialAssignments: Assignment[] = [
  {
    id: "ASN-1001",
    principalType: "User",
    principal: "Pujitha Marikanti",
    email: "pujitha@modelnow.example",
    permission: "Manage Platform Settings",
    resource: "Platform Settings",
    scope: "Global",
    status: "Active",
    assignedBy: "Super Admin",
    assignedAt: "2026-10-20",
    expiresAt: "Never",
  },
  {
    id: "ASN-1002",
    principalType: "Role",
    principal: "Security Admin",
    email: "Role assignment",
    permission: "Manage API Keys",
    resource: "API Keys",
    scope: "Organization",
    status: "Active",
    assignedBy: "Super Admin",
    assignedAt: "2026-10-21",
    expiresAt: "Never",
  },
  {
    id: "ASN-1003",
    principalType: "User",
    principal: "Arjun Rao",
    email: "arjun@modelnow.example",
    permission: "View Audit Logs",
    resource: "Audit Logs",
    scope: "Global",
    status: "Active",
    assignedBy: "Security Admin",
    assignedAt: "2026-10-22",
    expiresAt: "2026-12-31",
  },
  {
    id: "ASN-1004",
    principalType: "Role",
    principal: "AI Admin",
    email: "Role assignment",
    permission: "Manage AI Models",
    resource: "AI Models",
    scope: "Workspace",
    status: "Active",
    assignedBy: "Super Admin",
    assignedAt: "2026-10-22",
    expiresAt: "Never",
  },
  {
    id: "ASN-1005",
    principalType: "User",
    principal: "Priya Sharma",
    email: "priya@modelnow.example",
    permission: "Manage Billing",
    resource: "Billing",
    scope: "Organization",
    status: "Pending",
    assignedBy: "Finance Admin",
    assignedAt: "2026-10-24",
    expiresAt: "2026-12-31",
  },
  {
    id: "ASN-1006",
    principalType: "Role",
    principal: "Analyst",
    email: "Role assignment",
    permission: "View Usage Analytics",
    resource: "Usage Analytics",
    scope: "Workspace",
    status: "Active",
    assignedBy: "Admin",
    assignedAt: "2026-10-25",
    expiresAt: "Never",
  },
  {
    id: "ASN-1007",
    principalType: "User",
    principal: "Rahul Kumar",
    email: "rahul@modelnow.example",
    permission: "Manage Agents",
    resource: "Agents",
    scope: "Workspace",
    status: "Revoked",
    assignedBy: "Admin",
    assignedAt: "2026-10-18",
    expiresAt: "2026-10-28",
  },
  {
    id: "ASN-1008",
    principalType: "Role",
    principal: "Knowledge Manager",
    email: "Role assignment",
    permission: "Manage Knowledge Sources",
    resource: "Knowledge Hub",
    scope: "Workspace",
    status: "Active",
    assignedBy: "Super Admin",
    assignedAt: "2026-10-26",
    expiresAt: "Never",
  },
];

const roles = [
  "Super Admin",
  "Admin",
  "Security Admin",
  "AI Admin",
  "Operator",
  "Viewer",
  "Analyst",
  "Knowledge Manager",
  "Finance Admin",
];

const permissions = [
  "Manage Users",
  "Manage Organizations",
  "Manage Workspaces",
  "View Audit Logs",
  "Manage Billing",
  "Manage AI Models",
  "Manage API Keys",
  "Manage Integrations",
  "Manage Platform Settings",
  "View Usage Analytics",
  "Manage Agents",
  "Manage Knowledge Sources",
  "Manage Security Policies",
];

const resources = [
  "Users",
  "Organizations",
  "Workspaces",
  "Audit Logs",
  "Billing",
  "AI Models",
  "API Keys",
  "Integrations",
  "Platform Settings",
  "Usage Analytics",
  "Agents",
  "Knowledge Hub",
  "Security Policies",
];

const scopes: AssignmentScope[] = [
  "Global",
  "Organization",
  "Workspace",
];

const statuses: AssignmentStatus[] = [
  "Active",
  "Pending",
  "Revoked",
];

const blue = "#315fea";

const inputStyle: CSSProperties = {
  width: "100%",
  minWidth: 0,
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  background: "#fff",
  color: "#111827",
  fontSize: 13,
  outline: "none",
};

const buttonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "9px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  background: "#fff",
  color: "#374151",
  fontSize: 12,
  fontWeight: 650,
  cursor: "pointer",
};

function statusStyle(status: AssignmentStatus): CSSProperties {
  if (status === "Active") {
    return { color: "#15803d", background: "#dcfce7" };
  }

  if (status === "Pending") {
    return { color: "#a16207", background: "#fef3c7" };
  }

  return { color: "#b91c1c", background: "#fee2e2" };
}

function scopeIcon(scope: AssignmentScope) {
  if (scope === "Global") return <ShieldCheck size={14} />;
  if (scope === "Organization") return <Building2 size={14} />;
  return <BriefcaseBusiness size={14} />;
}

export default function PermissionAssignmentsPage() {
  const [assignments, setAssignments] =
    useState<Assignment[]>(initialAssignments);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [scopeFilter, setScopeFilter] = useState("All");
  const [principalFilter, setPrincipalFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [selected, setSelected] = useState<Assignment | null>(null);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    principalType: "User" as PrincipalType,
    principal: "",
    email: "",
    permission: "View Audit Logs",
    resource: "Audit Logs",
    scope: "Workspace" as AssignmentScope,
    status: "Active" as AssignmentStatus,
    assignedBy: "Super Admin",
    expiresAt: "Never",
  });

  const activeCount = assignments.filter(
    (item) => item.status === "Active"
  ).length;

  const pendingCount = assignments.filter(
    (item) => item.status === "Pending"
  ).length;

  const revokedCount = assignments.filter(
    (item) => item.status === "Revoked"
  ).length;

  const userCount = assignments.filter(
    (item) =>
      item.principalType === "User" && item.status === "Active"
  ).length;

  const filteredAssignments = useMemo(() => {
    const term = search.trim().toLowerCase();

    return assignments.filter((item) => {
      const matchesSearch =
        !term ||
        item.id.toLowerCase().includes(term) ||
        item.principal.toLowerCase().includes(term) ||
        item.email.toLowerCase().includes(term) ||
        item.permission.toLowerCase().includes(term) ||
        item.resource.toLowerCase().includes(term) ||
        item.assignedBy.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      const matchesScope =
        scopeFilter === "All" || item.scope === scopeFilter;

      const matchesPrincipal =
        principalFilter === "All" ||
        item.principalType === principalFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesScope &&
        matchesPrincipal
      );
    });
  }, [
    assignments,
    search,
    statusFilter,
    scopeFilter,
    principalFilter,
  ]);

  function openCreateForm() {
    setEditing(null);
    setForm({
      principalType: "User",
      principal: "",
      email: "",
      permission: "View Audit Logs",
      resource: "Audit Logs",
      scope: "Workspace",
      status: "Active",
      assignedBy: "Super Admin",
      expiresAt: "Never",
    });
    setNotice("");
    setShowForm(true);
  }

  function openEditForm(item: Assignment) {
    setEditing(item);
    setForm({
      principalType: item.principalType,
      principal: item.principal,
      email: item.email,
      permission: item.permission,
      resource: item.resource,
      scope: item.scope,
      status: item.status,
      assignedBy: item.assignedBy,
      expiresAt: item.expiresAt,
    });
    setSelected(null);
    setNotice("");
    setShowForm(true);
  }

  function saveAssignment() {
    if (!form.principal.trim()) {
      setNotice("Enter a user name or role.");
      return;
    }

    if (
      form.principalType === "User" &&
      !form.email.trim()
    ) {
      setNotice("Enter the user's email address.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);

    if (editing) {
      const updated: Assignment = {
        ...editing,
        ...form,
        principal: form.principal.trim(),
        email:
          form.principalType === "Role"
            ? "Role assignment"
            : form.email.trim(),
      };

      setAssignments((current) =>
        current.map((item) =>
          item.id === editing.id ? updated : item
        )
      );

      setNotice("Assignment updated in local demo data.");
    } else {
      const created: Assignment = {
        id: `ASN-${Date.now().toString().slice(-6)}`,
        ...form,
        principal: form.principal.trim(),
        email:
          form.principalType === "Role"
            ? "Role assignment"
            : form.email.trim(),
        assignedAt: today,
      };

      setAssignments((current) => [created, ...current]);
      setNotice("Assignment created in local demo data.");
    }

    setShowForm(false);
    setEditing(null);
  }

  function updateStatus(
    item: Assignment,
    status: AssignmentStatus
  ) {
    const updated = { ...item, status };

    setAssignments((current) =>
      current.map((entry) =>
        entry.id === item.id ? updated : entry
      )
    );

    setSelected(updated);
    setNotice(`Assignment marked ${status.toLowerCase()}.`);
  }

  function deleteAssignment(item: Assignment) {
    if (
      !window.confirm(
        `Remove assignment ${item.id} from the local demo?`
      )
    ) {
      return;
    }

    setAssignments((current) =>
      current.filter((entry) => entry.id !== item.id)
    );
    setSelected(null);
    setNotice("Assignment removed from local demo data.");
  }

  function resetDemo() {
    setAssignments(initialAssignments);
    setSearch("");
    setStatusFilter("All");
    setScopeFilter("All");
    setPrincipalFilter("All");
    setSelected(null);
    setShowForm(false);
    setEditing(null);
    setNotice("Demo assignments restored.");
  }

  const cardStyle: CSSProperties = {
    padding: 18,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#111827",
        padding: 26,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ maxWidth: 1500, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 22,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: blue,
                fontSize: 12,
                fontWeight: 750,
                marginBottom: 8,
              }}
            >
              <KeyRound size={16} />
              MODELNOW ADMIN / PERMISSIONS
            </div>

            <h1
              style={{
                fontSize: 28,
                letterSpacing: "-.8px",
                fontWeight: 750,
                margin: 0,
              }}
            >
              Permission Assignments
            </h1>

            <p
              style={{
                color: "#6b7280",
                fontSize: 14,
                lineHeight: 1.7,
                marginTop: 8,
                marginBottom: 0,
                maxWidth: 730,
              }}
            >
              Review and manage permission grants for individual
              users and roles across global, organization, and
              workspace scopes.
            </p>
          </div>

          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            <button
              type="button"
              style={buttonStyle}
              onClick={resetDemo}
            >
              <RefreshCw size={15} />
              Reset demo
            </button>

            <button
              type="button"
              style={{
                ...buttonStyle,
                color: "#fff",
                background: blue,
                borderColor: blue,
              }}
              onClick={openCreateForm}
            >
              <Plus size={16} />
              Assign permission
            </button>
          </div>
        </header>

        {notice && (
          <div
            role="status"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
              padding: "11px 14px",
              marginBottom: 16,
              border: "1px solid #bfdbfe",
              borderRadius: 9,
              background: "#eff6ff",
              color: "#1d4ed8",
              fontSize: 12,
            }}
          >
            {notice}
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setNotice("")}
              style={{
                border: 0,
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              <X size={15} />
            </button>
          </div>
        )}

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(185px, 1fr))",
            gap: 14,
            marginBottom: 20,
          }}
        >
          {[
            {
              label: "Total assignments",
              value: assignments.length,
              detail: "Recorded permission grants",
              icon: KeyRound,
              color: blue,
              bg: "#eff6ff",
            },
            {
              label: "Active assignments",
              value: activeCount,
              detail: "Currently marked active",
              icon: CheckCircle2,
              color: "#15803d",
              bg: "#dcfce7",
            },
            {
              label: "Pending",
              value: pendingCount,
              detail: "Awaiting review",
              icon: Clock3,
              color: "#a16207",
              bg: "#fef3c7",
            },
            {
              label: "Active user grants",
              value: userCount,
              detail: "Assignments to individual users",
              icon: UserRound,
              color: "#7c3aed",
              bg: "#ede9fe",
            },
            {
              label: "Revoked",
              value: revokedCount,
              detail: "No longer marked active",
              icon: AlertTriangle,
              color: "#b91c1c",
              bg: "#fee2e2",
            },
          ].map((metric) => {
            const Icon = metric.icon;

            return (
              <div key={metric.label} style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      color: "#6b7280",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {metric.label}
                  </span>
                  <span
                    style={{
                      width: 34,
                      height: 34,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 9,
                      color: metric.color,
                      background: metric.bg,
                    }}
                  >
                    <Icon size={17} />
                  </span>
                </div>

                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 750,
                    letterSpacing: "-.5px",
                    marginTop: 12,
                  }}
                >
                  {metric.value}
                </div>

                <div
                  style={{
                    color: "#9ca3af",
                    fontSize: 11,
                    marginTop: 5,
                  }}
                >
                  {metric.detail}
                </div>
              </div>
            );
          })}
        </section>

        <section
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: 18,
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
              Assignment directory
            </h2>
            <p
              style={{
                color: "#6b7280",
                fontSize: 12,
                margin: "5px 0 0",
              }}
            >
              Search, inspect, update, and revoke demo assignments.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(175px, 1fr))",
              gap: 10,
              padding: 16,
              background: "#fafafa",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  top: 11,
                  left: 11,
                  color: "#9ca3af",
                }}
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search assignments..."
                aria-label="Search permission assignments"
                style={{ ...inputStyle, paddingLeft: 35 }}
              />
            </div>

            <select
              aria-label="Filter by principal type"
              value={principalFilter}
              onChange={(event) =>
                setPrincipalFilter(event.target.value)
              }
              style={inputStyle}
            >
              <option value="All">All principals</option>
              <option value="User">Users</option>
              <option value="Role">Roles</option>
            </select>

            <select
              aria-label="Filter by scope"
              value={scopeFilter}
              onChange={(event) => setScopeFilter(event.target.value)}
              style={inputStyle}
            >
              <option value="All">All scopes</option>
              {scopes.map((scope) => (
                <option key={scope} value={scope}>
                  {scope}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by assignment status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              style={inputStyle}
            >
              <option value="All">All statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: 1050,
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {[
                    "Principal",
                    "Permission",
                    "Scope",
                    "Status",
                    "Assigned by",
                    "Assigned date",
                    "Expires",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: "12px 14px",
                        color: "#6b7280",
                        fontSize: 10,
                        fontWeight: 750,
                        textTransform: "uppercase",
                        letterSpacing: ".45px",
                        borderBottom: "1px solid #e5e7eb",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredAssignments.map((item) => (
                  <tr key={item.id}>
                    <td
                      style={{
                        padding: "14px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            width: 35,
                            height: 35,
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                            borderRadius: 9,
                            background:
                              item.principalType === "User"
                                ? "#eff6ff"
                                : "#f3e8ff",
                            color:
                              item.principalType === "User"
                                ? blue
                                : "#7c3aed",
                          }}
                        >
                          {item.principalType === "User" ? (
                            <UserRound size={17} />
                          ) : (
                            <UsersRound size={17} />
                          )}
                        </span>

                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.principal}
                          </div>
                          <div
                            style={{
                              color: "#9ca3af",
                              fontSize: 10,
                              marginTop: 4,
                            }}
                          >
                            {item.email}
                          </div>
                          <div
                            style={{
                              color: "#9ca3af",
                              fontSize: 10,
                              marginTop: 4,
                            }}
                          >
                            {item.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td
                      style={{
                        padding: "14px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 650 }}>
                        {item.permission}
                      </div>
                      <div
                        style={{
                          color: "#9ca3af",
                          fontSize: 10,
                          marginTop: 4,
                        }}
                      >
                        {item.resource}
                      </div>
                    </td>

                    <td
                      style={{
                        padding: "14px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 11,
                          color: "#4b5563",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {scopeIcon(item.scope)}
                        {item.scope}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: "14px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <span
                        style={{
                          ...statusStyle(item.status),
                          display: "inline-flex",
                          padding: "5px 8px",
                          borderRadius: 20,
                          fontSize: 10,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: "14px",
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: 11,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.assignedBy}
                    </td>

                    <td
                      style={{
                        padding: "14px",
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: 11,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.assignedAt}
                    </td>

                    <td
                      style={{
                        padding: "14px",
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: 11,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.expiresAt}
                    </td>

                    <td
                      style={{
                        padding: "14px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          aria-label={`View ${item.id}`}
                          title="View details"
                          onClick={() => setSelected(item)}
                          style={{ ...buttonStyle, padding: 7 }}
                        >
                          <ShieldCheck size={14} />
                        </button>

                        <button
                          type="button"
                          aria-label={`Edit ${item.id}`}
                          title="Edit assignment"
                          onClick={() => openEditForm(item)}
                          style={{ ...buttonStyle, padding: 7 }}
                        >
                          <Edit3 size={14} />
                        </button>

                        {item.status !== "Revoked" && (
                          <button
                            type="button"
                            aria-label={`Revoke ${item.id}`}
                            title="Revoke assignment"
                            onClick={() =>
                              updateStatus(item, "Revoked")
                            }
                            style={{
                              ...buttonStyle,
                              padding: 7,
                              color: "#b91c1c",
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredAssignments.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        padding: 40,
                        textAlign: "center",
                        color: "#6b7280",
                        fontSize: 13,
                      }}
                    >
                      No assignments match your filters.
                      <div style={{ marginTop: 12 }}>
                        <button
                          type="button"
                          style={buttonStyle}
                          onClick={() => {
                            setSearch("");
                            setStatusFilter("All");
                            setScopeFilter("All");
                            setPrincipalFilter("All");
                          }}
                        >
                          Clear filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div
            style={{
              padding: 13,
              color: "#9ca3af",
              fontSize: 11,
              borderTop: "1px solid #e5e7eb",
            }}
          >
            Local demo data only. Real permission assignments must be
            stored and validated by the backend.
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
            marginTop: 18,
          }}
        >
          <div style={cardStyle}>
            <UserRound size={19} color={blue} />
            <h3 style={{ fontSize: 13, margin: "10px 0 7px" }}>
              User assignments
            </h3>
            <p
              style={{
                color: "#6b7280",
                fontSize: 12,
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Grant specific permissions to an individual user when
              role-based access alone is insufficient.
            </p>
          </div>

          <div style={cardStyle}>
            <UsersRound size={19} color="#7c3aed" />
            <h3 style={{ fontSize: 13, margin: "10px 0 7px" }}>
              Role assignments
            </h3>
            <p
              style={{
                color: "#6b7280",
                fontSize: 12,
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Assign permissions to a role so authorized members can
              receive consistent access.
            </p>
          </div>

          <div style={cardStyle}>
            <Clock3 size={19} color="#a16207" />
            <h3 style={{ fontSize: 13, margin: "10px 0 7px" }}>
              Time-limited access
            </h3>
            <p
              style={{
                color: "#6b7280",
                fontSize: 12,
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Record expiration dates and implement automatic expiry
              checks in the backend for temporary access.
            </p>
          </div>
        </section>
      </div>

      {selected && (
        <div
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelected(null);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(15,23,42,.35)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Assignment details"
            style={{
              width: "min(450px, 100%)",
              height: "100%",
              overflowY: "auto",
              padding: 24,
              background: "#fff",
              boxShadow: "-12px 0 35px rgba(15,23,42,.12)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    color: blue,
                    fontSize: 11,
                    fontWeight: 750,
                  }}
                >
                  ASSIGNMENT DETAILS
                </div>
                <h2
                  style={{
                    fontSize: 21,
                    margin: "8px 0",
                    letterSpacing: "-.5px",
                  }}
                >
                  {selected.principal}
                </h2>
                <div style={{ color: "#9ca3af", fontSize: 12 }}>
                  {selected.id}
                </div>
              </div>

              <button
                type="button"
                aria-label="Close details"
                onClick={() => setSelected(null)}
                style={{ ...buttonStyle, padding: 7 }}
              >
                <X size={15} />
              </button>
            </div>

            <div
              style={{
                marginTop: 22,
                display: "grid",
                gap: 0,
              }}
            >
              {[
                ["Principal type", selected.principalType],
                ["Email", selected.email],
                ["Permission", selected.permission],
                ["Resource", selected.resource],
                ["Scope", selected.scope],
                ["Status", selected.status],
                ["Assigned by", selected.assignedBy],
                ["Assigned date", selected.assignedAt],
                ["Expiration", selected.expiresAt],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "125px 1fr",
                    gap: 12,
                    padding: "13px 0",
                    borderBottom: "1px solid #f1f5f9",
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: "#9ca3af" }}>{label}</span>
                  <span
                    style={{
                      color: "#374151",
                      fontWeight: 600,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gap: 9, marginTop: 24 }}>
              {selected.status === "Pending" && (
                <button
                  type="button"
                  style={{
                    ...buttonStyle,
                    color: "#fff",
                    background: "#15803d",
                    borderColor: "#15803d",
                  }}
                  onClick={() => updateStatus(selected, "Active")}
                >
                  <CheckCircle2 size={15} />
                  Approve demo assignment
                </button>
              )}

              {selected.status === "Active" && (
                <button
                  type="button"
                  style={{
                    ...buttonStyle,
                    color: "#b91c1c",
                  }}
                  onClick={() => updateStatus(selected, "Revoked")}
                >
                  <Trash2 size={15} />
                  Revoke assignment
                </button>
              )}

              {selected.status === "Revoked" && (
                <button
                  type="button"
                  style={{
                    ...buttonStyle,
                    color: "#15803d",
                  }}
                  onClick={() => updateStatus(selected, "Active")}
                >
                  <CheckCircle2 size={15} />
                  Reactivate demo assignment
                </button>
              )}

              <button
                type="button"
                style={buttonStyle}
                onClick={() => openEditForm(selected)}
              >
                <Edit3 size={15} />
                Edit assignment
              </button>

              <button
                type="button"
                style={{
                  ...buttonStyle,
                  color: "#b91c1c",
                }}
                onClick={() => deleteAssignment(selected)}
              >
                <Trash2 size={15} />
                Delete demo record
              </button>
            </div>
          </aside>
        </div>
      )}

      {showForm && (
        <div
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            display: "grid",
            placeItems: "center",
            padding: 16,
            background: "rgba(15,23,42,.4)",
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label={
              editing ? "Edit assignment" : "Assign permission"
            }
            style={{
              width: "min(680px, 100%)",
              maxHeight: "92vh",
              overflowY: "auto",
              padding: 24,
              borderRadius: 14,
              background: "#fff",
              boxShadow: "0 24px 70px rgba(15,23,42,.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div>
                <h2 style={{ fontSize: 21, margin: 0 }}>
                  {editing ? "Edit assignment" : "Assign permission"}
                </h2>
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: 12,
                    lineHeight: 1.6,
                    margin: "7px 0 0",
                  }}
                >
                  Configure a demo permission grant and its scope.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close assignment form"
                style={{ ...buttonStyle, padding: 7 }}
                onClick={() => setShowForm(false)}
              >
                <X size={15} />
              </button>
            </div>

            {notice && (
              <div
                role="alert"
                style={{
                  padding: 10,
                  marginBottom: 14,
                  border: "1px solid #fecaca",
                  borderRadius: 8,
                  color: "#b91c1c",
                  background: "#fef2f2",
                  fontSize: 12,
                }}
              >
                {notice}
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(210px, 1fr))",
                gap: 14,
              }}
            >
              <div>
                <label
                  htmlFor="principal-type"
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 7,
                  }}
                >
                  Principal type
                </label>
                <select
                  id="principal-type"
                  value={form.principalType}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      principalType: event.target.value as PrincipalType,
                      principal: "",
                      email: "",
                    }))
                  }
                  style={inputStyle}
                >
                  <option value="User">Individual user</option>
                  <option value="Role">Role</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="principal-name"
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 7,
                  }}
                >
                  {form.principalType === "User"
                    ? "User name *"
                    : "Role *"}
                </label>

                {form.principalType === "Role" ? (
                  <select
                    id="principal-name"
                    value={form.principal}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        principal: event.target.value,
                      }))
                    }
                    style={inputStyle}
                  >
                    <option value="">Select role</option>
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="principal-name"
                    value={form.principal}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        principal: event.target.value,
                      }))
                    }
                    placeholder="Enter user name"
                    style={inputStyle}
                  />
                )}
              </div>

              {form.principalType === "User" && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <label
                    htmlFor="principal-email"
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 700,
                      marginBottom: 7,
                    }}
                  >
                    Email address *
                  </label>
                  <input
                    id="principal-email"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder="user@example.com"
                    style={inputStyle}
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="assignment-permission"
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 7,
                  }}
                >
                  Permission
                </label>
                <select
                  id="assignment-permission"
                  value={form.permission}
                  onChange={(event) => {
                    const permission = event.target.value;
                    setForm((current) => ({
                      ...current,
                      permission,
                      resource:
                        permission === "View Audit Logs"
                          ? "Audit Logs"
                          : permission.replace(
                              /^(Manage|View)\s+/,
                              ""
                            ),
                    }));
                  }}
                  style={inputStyle}
                >
                  {permissions.map((permission) => (
                    <option key={permission} value={permission}>
                      {permission}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="assignment-resource"
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 7,
                  }}
                >
                  Resource
                </label>
                <select
                  id="assignment-resource"
                  value={form.resource}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      resource: event.target.value,
                    }))
                  }
                  style={inputStyle}
                >
                  {resources.map((resource) => (
                    <option key={resource} value={resource}>
                      {resource}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="assignment-scope"
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 7,
                  }}
                >
                  Scope
                </label>
                <select
                  id="assignment-scope"
                  value={form.scope}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      scope: event.target.value as AssignmentScope,
                    }))
                  }
                  style={inputStyle}
                >
                  {scopes.map((scope) => (
                    <option key={scope} value={scope}>
                      {scope}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="assignment-status"
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 7,
                  }}
                >
                  Status
                </label>
                <select
                  id="assignment-status"
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as AssignmentStatus,
                    }))
                  }
                  style={inputStyle}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="assignment-assigner"
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 7,
                  }}
                >
                  Assigned by
                </label>
                <select
                  id="assignment-assigner"
                  value={form.assignedBy}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      assignedBy: event.target.value,
                    }))
                  }
                  style={inputStyle}
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="assignment-expiration"
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 7,
                  }}
                >
                  Expiration date
                </label>
                <input
                  id="assignment-expiration"
                  type="date"
                  value={
                    form.expiresAt === "Never" ? "" : form.expiresAt
                  }
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      expiresAt: event.target.value || "Never",
                    }))
                  }
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      expiresAt: "Never",
                    }))
                  }
                  style={{
                    ...buttonStyle,
                    marginTop: 7,
                    padding: "6px 9px",
                  }}
                >
                  No expiration
                </button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                flexWrap: "wrap",
                gap: 9,
                marginTop: 24,
                paddingTop: 18,
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <button
                type="button"
                style={buttonStyle}
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                style={{
                  ...buttonStyle,
                  color: "#fff",
                  background: blue,
                  borderColor: blue,
                }}
                onClick={saveAssignment}
              >
                <CheckCircle2 size={15} />
                {editing ? "Save changes" : "Create assignment"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
