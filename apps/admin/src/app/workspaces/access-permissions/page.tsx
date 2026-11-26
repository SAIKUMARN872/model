"use client";

import { useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import {
  ShieldCheck,
  LockKeyhole,
  KeyRound,
  Users,
  Search,
  Plus,
  Download,
  X,
  Check,
  Ban,
  Eye,
  Pencil,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

type AccessStatus = "Active" | "Restricted" | "Inactive";
type AccessAction = "Read" | "Create" | "Update" | "Delete" | "Manage";
type RequestStatus = "Pending" | "Approved" | "Rejected";
type Tab = "permissions" | "matrix" | "requests";

type Resource =
  | "Workspace"
  | "Employees"
  | "Teams"
  | "Projects"
  | "AI Models"
  | "Billing"
  | "Audit Logs"
  | "Security";

type Permission = {
  id: string;
  name: string;
  code: string;
  resource: Resource;
  action: AccessAction;
  description: string;
  roles: string[];
  assignedUsers: number;
  status: AccessStatus;
  system: boolean;
  updatedAt: string;
};

type AccessRequest = {
  id: string;
  requester: string;
  email: string;
  resource: string;
  permission: string;
  reason: string;
  requestedAt: string;
  status: RequestStatus;
};

const resources: Resource[] = [
  "Workspace",
  "Employees",
  "Teams",
  "Projects",
  "AI Models",
  "Billing",
  "Audit Logs",
  "Security",
];

const actions: AccessAction[] = [
  "Read",
  "Create",
  "Update",
  "Delete",
  "Manage",
];

const roles = [
  "Workspace Owner",
  "Workspace Admin",
  "Team Lead",
  "Developer",
  "AI Researcher",
  "Finance Analyst",
  "Security Auditor",
  "Read-only Viewer",
];

const initialPermissions: Permission[] = [
  {
    id: "PERM-001",
    name: "View workspace",
    code: "workspace.read",
    resource: "Workspace",
    action: "Read",
    description: "View workspace profile and general configuration.",
    roles: ["Workspace Owner", "Workspace Admin", "Team Lead", "Developer", "Read-only Viewer"],
    assignedUsers: 49,
    status: "Active",
    system: true,
    updatedAt: "2026-10-25",
  },
  {
    id: "PERM-002",
    name: "Manage workspace",
    code: "workspace.manage",
    resource: "Workspace",
    action: "Manage",
    description: "Update workspace settings and configuration.",
    roles: ["Workspace Owner", "Workspace Admin"],
    assignedUsers: 6,
    status: "Active",
    system: true,
    updatedAt: "2026-10-25",
  },
  {
    id: "PERM-003",
    name: "View employees",
    code: "employees.read",
    resource: "Employees",
    action: "Read",
    description: "View employee profiles and organization directory.",
    roles: ["Workspace Owner", "Workspace Admin", "Team Lead", "Developer", "Read-only Viewer"],
    assignedUsers: 49,
    status: "Active",
    system: true,
    updatedAt: "2026-10-24",
  },
  {
    id: "PERM-004",
    name: "Manage employees",
    code: "employees.manage",
    resource: "Employees",
    action: "Manage",
    description: "Invite employees and update membership.",
    roles: ["Workspace Owner", "Workspace Admin"],
    assignedUsers: 6,
    status: "Active",
    system: true,
    updatedAt: "2026-10-24",
  },
  {
    id: "PERM-005",
    name: "Manage teams",
    code: "teams.manage",
    resource: "Teams",
    action: "Manage",
    description: "Create teams and manage team membership.",
    roles: ["Workspace Owner", "Workspace Admin", "Team Lead"],
    assignedUsers: 14,
    status: "Active",
    system: true,
    updatedAt: "2026-10-23",
  },
  {
    id: "PERM-006",
    name: "Manage projects",
    code: "projects.manage",
    resource: "Projects",
    action: "Manage",
    description: "Create and update workspace projects.",
    roles: ["Workspace Owner", "Workspace Admin", "Team Lead", "Developer", "AI Researcher"],
    assignedUsers: 34,
    status: "Active",
    system: true,
    updatedAt: "2026-10-22",
  },
  {
    id: "PERM-007",
    name: "Use approved models",
    code: "models.use",
    resource: "AI Models",
    action: "Read",
    description: "Use AI models approved for the workspace.",
    roles: ["Workspace Owner", "Workspace Admin", "Team Lead", "Developer", "AI Researcher"],
    assignedUsers: 39,
    status: "Active",
    system: true,
    updatedAt: "2026-10-21",
  },
  {
    id: "PERM-008",
    name: "Manage model configuration",
    code: "models.manage",
    resource: "AI Models",
    action: "Manage",
    description: "Manage model availability and configuration.",
    roles: ["Workspace Owner", "Workspace Admin"],
    assignedUsers: 6,
    status: "Active",
    system: true,
    updatedAt: "2026-10-20",
  },
  {
    id: "PERM-009",
    name: "View billing",
    code: "billing.read",
    resource: "Billing",
    action: "Read",
    description: "Review billing records and usage costs.",
    roles: ["Workspace Owner", "Workspace Admin", "Finance Analyst"],
    assignedUsers: 9,
    status: "Active",
    system: true,
    updatedAt: "2026-10-19",
  },
  {
    id: "PERM-010",
    name: "Manage billing",
    code: "billing.manage",
    resource: "Billing",
    action: "Manage",
    description: "Manage billing settings and payment configuration.",
    roles: ["Workspace Owner"],
    assignedUsers: 2,
    status: "Restricted",
    system: true,
    updatedAt: "2026-10-18",
  },
  {
    id: "PERM-011",
    name: "View audit logs",
    code: "audit.read",
    resource: "Audit Logs",
    action: "Read",
    description: "Review security and administrative audit records.",
    roles: ["Workspace Owner", "Workspace Admin", "Security Auditor"],
    assignedUsers: 8,
    status: "Active",
    system: true,
    updatedAt: "2026-10-17",
  },
  {
    id: "PERM-012",
    name: "Manage security",
    code: "security.manage",
    resource: "Security",
    action: "Manage",
    description: "Configure security controls and access policies.",
    roles: ["Workspace Owner"],
    assignedUsers: 2,
    status: "Restricted",
    system: true,
    updatedAt: "2026-10-16",
  },
  {
    id: "PERM-013",
    name: "Export project reports",
    code: "projects.export",
    resource: "Projects",
    action: "Read",
    description: "Export approved project reports.",
    roles: ["Workspace Owner", "Workspace Admin", "Team Lead"],
    assignedUsers: 14,
    status: "Active",
    system: false,
    updatedAt: "2026-10-12",
  },
  {
    id: "PERM-014",
    name: "Manage employee sessions",
    code: "employees.sessions.manage",
    resource: "Security",
    action: "Manage",
    description: "Review and revoke employee sessions.",
    roles: ["Workspace Owner", "Workspace Admin"],
    assignedUsers: 6,
    status: "Inactive",
    system: false,
    updatedAt: "2026-10-09",
  },
];

const initialRequests: AccessRequest[] = [
  {
    id: "REQ-1001",
    requester: "Ananya Rao",
    email: "ananya@example.com",
    resource: "AI Models",
    permission: "models.manage",
    reason: "Need to evaluate model configurations for a project.",
    requestedAt: "2026-11-03",
    status: "Pending",
  },
  {
    id: "REQ-1002",
    requester: "Rahul Mehta",
    email: "rahul@example.com",
    resource: "Billing",
    permission: "billing.read",
    reason: "Need usage details for the monthly cost report.",
    requestedAt: "2026-11-02",
    status: "Pending",
  },
  {
    id: "REQ-1003",
    requester: "Priya Nair",
    email: "priya@example.com",
    resource: "Audit Logs",
    permission: "audit.read",
    reason: "Need to investigate a reported access issue.",
    requestedAt: "2026-10-29",
    status: "Approved",
  },
  {
    id: "REQ-1004",
    requester: "Kiran Das",
    email: "kiran@example.com",
    resource: "Employees",
    permission: "employees.manage",
    reason: "Need to coordinate employee onboarding.",
    requestedAt: "2026-10-27",
    status: "Rejected",
  },
];

const C = {
  text: "#172033",
  muted: "#697586",
  border: "#E5EAF1",
  background: "#F7F9FC",
  blue: "#315FEA",
  green: "#15803D",
  red: "#B42318",
  amber: "#B54708",
};

const buttonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "9px 12px",
  border: `1px solid ${C.border}`,
  borderRadius: 9,
  background: "#FFFFFF",
  color: C.text,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const primaryButtonStyle: CSSProperties = {
  ...buttonStyle,
  color: "#FFFFFF",
  background: C.blue,
  borderColor: C.blue,
};

const inputStyle: CSSProperties = {
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  padding: "10px 12px",
  border: `1px solid ${C.border}`,
  borderRadius: 9,
  background: "#FFFFFF",
  color: C.text,
  fontSize: 12,
  outline: "none",
};

const statusColors: Record<AccessStatus, CSSProperties> = {
  Active: { color: C.green, background: "#EAF8EF" },
  Restricted: { color: C.amber, background: "#FFF5DF" },
  Inactive: { color: C.muted, background: "#EEF1F5" },
};

const requestColors: Record<RequestStatus, CSSProperties> = {
  Pending: { color: C.amber, background: "#FFF5DF" },
  Approved: { color: C.green, background: "#EAF8EF" },
  Rejected: { color: C.red, background: "#FDECEC" },
};

const emptyForm = {
  name: "",
  code: "",
  resource: "Workspace" as Resource,
  action: "Read" as AccessAction,
  description: "",
  status: "Active" as AccessStatus,
};

function StatusPill({ status }: { status: AccessStatus | RequestStatus }) {
  const style =
    status in statusColors
      ? statusColors[status as AccessStatus]
      : requestColors[status as RequestStatus];

  return (
    <span
      style={{
        ...style,
        display: "inline-flex",
        padding: "5px 9px",
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

export default function AccessPermissionsPage() {
  const [permissions, setPermissions] =
    useState<Permission[]>(initialPermissions);
  const [requests, setRequests] =
    useState<AccessRequest[]>(initialRequests);
  const [search, setSearch] = useState("");
  const [resourceFilter, setResourceFilter] = useState("All");
  const [actionFilter, setActionFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeTab, setActiveTab] = useState<Tab>("permissions");
  const [selected, setSelected] = useState<Permission | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Permission | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState("");
  const [requestFilter, setRequestFilter] = useState("All");

  const filteredPermissions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return permissions.filter((permission) => {
      const searchable = [
        permission.id,
        permission.name,
        permission.code,
        permission.resource,
        permission.action,
        permission.description,
        ...permission.roles,
      ].join(" ").toLowerCase();

      return (
        (!query || searchable.includes(query)) &&
        (resourceFilter === "All" || permission.resource === resourceFilter) &&
        (actionFilter === "All" || permission.action === actionFilter) &&
        (statusFilter === "All" || permission.status === statusFilter)
      );
    });
  }, [permissions, search, resourceFilter, actionFilter, statusFilter]);

  const pendingCount = requests.filter(
    (request) => request.status === "Pending",
  ).length;

  const activeCount = permissions.filter(
    (permission) => permission.status === "Active",
  ).length;

  const restrictedCount = permissions.filter(
    (permission) => permission.status === "Restricted",
  ).length;

  const filteredRequests = requests.filter((request) => {
    const query = search.trim().toLowerCase();
    const matchesQuery =
      !query ||
      [
        request.id,
        request.requester,
        request.email,
        request.resource,
        request.permission,
        request.reason,
      ].some((value) => value.toLowerCase().includes(query));

    return (
      matchesQuery &&
      (requestFilter === "All" || request.status === requestFilter)
    );
  });

  function notify(message: string) {
    setNotice(message);
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm });
    setShowForm(true);
  }

  function openEdit(permission: Permission) {
    if (permission.system) {
      notify("System permissions cannot be edited in this demo.");
      return;
    }

    setEditing(permission);
    setForm({
      name: permission.name,
      code: permission.code,
      resource: permission.resource,
      action: permission.action,
      description: permission.description,
      status: permission.status,
    });
    setShowForm(true);
  }

  function savePermission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const code = form.code.trim().toLowerCase().replace(/\s+/g, ".");
    if (!form.name.trim() || !code) {
      notify("Enter a permission name and code.");
      return;
    }

    const duplicate = permissions.some(
      (permission) =>
        permission.code.toLowerCase() === code &&
        permission.id !== editing?.id,
    );

    if (duplicate) {
      notify("A permission with this code already exists.");
      return;
    }

    const updatedAt = new Date().toISOString().slice(0, 10);

    if (editing) {
      const updated: Permission = {
        ...editing,
        name: form.name.trim(),
        code,
        resource: form.resource,
        action: form.action,
        description: form.description.trim(),
        status: form.status,
        updatedAt,
      };

      setPermissions((current) =>
        current.map((item) => (item.id === editing.id ? updated : item)),
      );
      setSelected((current) =>
        current?.id === editing.id ? updated : current,
      );
      notify("Permission updated in demo state.");
    } else {
      const created: Permission = {
        id: `PERM-${Date.now().toString().slice(-6)}`,
        name: form.name.trim(),
        code,
        resource: form.resource,
        action: form.action,
        description: form.description.trim(),
        roles: [],
        assignedUsers: 0,
        status: form.status,
        system: false,
        updatedAt,
      };

      setPermissions((current) => [created, ...current]);
      setSearch("");
      setResourceFilter("All");
      setActionFilter("All");
      setStatusFilter("All");
      notify("Permission created in demo state.");
    }

    setShowForm(false);
    setEditing(null);
  }

  function togglePermissionStatus(permission: Permission) {
    if (permission.system) {
      notify("System permissions cannot be changed in this demo.");
      return;
    }

    const updated: Permission = {
      ...permission,
      status: permission.status === "Active" ? "Inactive" : "Active",
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    setPermissions((current) =>
      current.map((item) => (item.id === permission.id ? updated : item)),
    );
    setSelected((current) =>
      current?.id === permission.id ? updated : current,
    );
    notify(`Permission marked ${updated.status.toLowerCase()}.`);
  }

  function reviewRequest(request: AccessRequest, status: RequestStatus) {
    if (request.status !== "Pending") return;

    setRequests((current) =>
      current.map((item) =>
        item.id === request.id ? { ...item, status } : item,
      ),
    );
    notify(`${request.id} marked ${status.toLowerCase()} in demo state.`);
  }

  function exportCsv() {
    const headers = [
      "ID",
      "Name",
      "Code",
      "Resource",
      "Action",
      "Description",
      "Roles",
      "Assigned Users",
      "Status",
      "System",
      "Last Updated",
    ];

    const rows = filteredPermissions.map((permission) => [
      permission.id,
      permission.name,
      permission.code,
      permission.resource,
      permission.action,
      permission.description,
      permission.roles.join("; "),
      String(permission.assignedUsers),
      permission.status,
      permission.system ? "Yes" : "No",
      permission.updatedAt,
    ]);

    const escapeCsv = (value: string) =>
      `"${value.replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "modelnow-access-permissions.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    notify("Permissions CSV exported.");
  }

  function resetFilters() {
    setSearch("");
    setResourceFilter("All");
    setActionFilter("All");
    setStatusFilter("All");
    setRequestFilter("All");
  }

  return (
    <main style={styles.page}>
      {notice && (
        <div role="status" style={styles.toast}>
          <Check size={15} />
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
            style={{ ...buttonStyle, padding: 5 }}
          >
            <X size={13} />
          </button>
        </div>
      )}

      <header style={styles.header}>
        <div>
          <div style={styles.breadcrumb}>
            <span>Admin Console</span>
            <span>/</span>
            <span>Workspace</span>
            <span>/</span>
            <span style={{ color: C.blue }}>Access &amp; Permissions</span>
          </div>
          <h1 style={styles.title}>Access &amp; Permissions</h1>
          <p style={styles.subtitle}>
            Review workspace permissions, understand role access, and manage
            access requests from one centralized directory.
          </p>
        </div>

        <div style={styles.headerActions}>
          <button type="button" onClick={exportCsv} style={buttonStyle}>
            <Download size={15} />
            Export CSV
          </button>
          <button type="button" onClick={openCreate} style={primaryButtonStyle}>
            <Plus size={16} />
            Add permission
          </button>
        </div>
      </header>

      <section style={styles.metrics}>
        {[
          {
            label: "Permission records",
            value: permissions.length,
            description: "Configured definitions",
            icon: KeyRound,
            color: C.blue,
            bg: "#EDF2FF",
          },
          {
            label: "Active permissions",
            value: activeCount,
            description: "Currently marked active",
            icon: ShieldCheck,
            color: C.green,
            bg: "#EAF8EF",
          },
          {
            label: "Restricted permissions",
            value: restrictedCount,
            description: "Sensitive capabilities",
            icon: LockKeyhole,
            color: C.amber,
            bg: "#FFF5DF",
          },
          {
            label: "Pending requests",
            value: pendingCount,
            description: "Awaiting review",
            icon: Users,
            color: "#6941C6",
            bg: "#F2EDFF",
          },
        ].map((metric) => {
          const Icon = metric.icon;

          return (
            <article key={metric.label} style={styles.metricCard}>
              <div style={styles.metricTop}>
                <span style={styles.metricLabel}>{metric.label}</span>
                <span
                  style={{
                    ...styles.metricIcon,
                    color: metric.color,
                    background: metric.bg,
                  }}
                >
                  <Icon size={18} />
                </span>
              </div>
              <div style={styles.metricValue}>
                {metric.value.toLocaleString()}
              </div>
              <p style={styles.metricDescription}>{metric.description}</p>
            </article>
          );
        })}
      </section>

      <section style={styles.securityBanner}>
        <div style={styles.securityIcon}>
          <LockKeyhole size={19} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: "0 0 5px", fontSize: 13 }}>
            Least-privilege access model
          </h2>
          <p style={styles.bannerText}>
            Grant only the permissions needed for each role. These sample
            definitions and decisions are local demo state. Production access
            checks must be enforced on the server and recorded in audit logs.
          </p>
        </div>
        <span style={styles.securityPill}>Security overview</span>
      </section>

      <section style={styles.panel}>
        <nav style={styles.tabs} aria-label="Permission sections">
          {[
            { id: "permissions" as Tab, label: "Permission directory" },
            { id: "matrix" as Tab, label: "Role access matrix" },
            {
              id: "requests" as Tab,
              label: `Access requests${pendingCount ? ` (${pendingCount})` : ""}`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tab,
                color: activeTab === tab.id ? C.blue : C.muted,
                borderBottom:
                  activeTab === tab.id
                    ? `2px solid ${C.blue}`
                    : "2px solid transparent",
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === "permissions" && (
          <>
            <div style={styles.filters}>
              <div style={{ position: "relative" }}>
                <Search size={15} style={styles.searchIcon} />
                <input
                  aria-label="Search permissions"
                  placeholder="Search name, code, role..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  style={{ ...inputStyle, paddingLeft: 36 }}
                />
              </div>

              <select
                aria-label="Filter by resource"
                value={resourceFilter}
                onChange={(event) => setResourceFilter(event.target.value)}
                style={inputStyle}
              >
                <option value="All">All resources</option>
                {resources.map((resource) => (
                  <option key={resource} value={resource}>
                    {resource}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter by action"
                value={actionFilter}
                onChange={(event) => setActionFilter(event.target.value)}
                style={inputStyle}
              >
                <option value="All">All actions</option>
                {actions.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                style={inputStyle}
              >
                <option value="All">All statuses</option>
                <option value="Active">Active</option>
                <option value="Restricted">Restricted</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {[
                      "PERMISSION",
                      "RESOURCE",
                      "ACTION",
                      "ROLES",
                      "USERS",
                      "STATUS",
                      "UPDATED",
                      "DETAILS",
                    ].map((heading) => (
                      <th key={heading} style={styles.th}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPermissions.map((permission) => (
                    <tr key={permission.id}>
                      <td style={styles.td}>
                        <div style={styles.permissionCell}>
                          <span style={styles.permissionIcon}>
                            <KeyRound size={16} />
                          </span>
                          <div>
                            <div style={{ fontWeight: 700 }}>
                              {permission.name}
                            </div>
                            <div style={styles.secondaryText}>
                              {permission.code}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>{permission.resource}</td>
                      <td style={styles.td}>
                        <span style={styles.actionPill}>
                          {permission.action}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button
                          type="button"
                          onClick={() => setSelected(permission)}
                          style={{ ...buttonStyle, padding: "6px 9px" }}
                        >
                          <Users size={13} />
                          {permission.roles.length} roles
                        </button>
                      </td>
                      <td style={styles.td}>{permission.assignedUsers}</td>
                      <td style={styles.td}>
                        <StatusPill status={permission.status} />
                      </td>
                      <td style={{ ...styles.td, whiteSpace: "nowrap" }}>
                        {permission.updatedAt}
                      </td>
                      <td style={styles.td}>
                        <button
                          type="button"
                          onClick={() => setSelected(permission)}
                          style={{ ...buttonStyle, padding: 7 }}
                          aria-label={`View ${permission.name}`}
                          title="View details"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredPermissions.length === 0 && (
                    <tr>
                      <td colSpan={8} style={styles.emptyState}>
                        <Search size={22} />
                        <p>No permissions match these filters.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={styles.footer}>
              <span>{filteredPermissions.length} permission record(s)</span>
              <button
                type="button"
                onClick={resetFilters}
                style={{ ...buttonStyle, padding: "6px 9px" }}
              >
                <RefreshCw size={12} />
                Reset filters
              </button>
            </div>
          </>
        )}

        {activeTab === "matrix" && (
          <div style={{ padding: 20 }}>
            <h2 style={{ margin: "0 0 7px", fontSize: 15 }}>
              Role access matrix
            </h2>
            <p style={styles.matrixDescription}>
              A check indicates that the sample role is listed against the
              permission. This matrix is for review and does not enforce access.
            </p>

            <div style={{ overflowX: "auto" }}>
              <table style={styles.matrixTable}>
                <thead>
                  <tr>
                    <th style={styles.th}>PERMISSION</th>
                    {roles.map((role) => (
                      <th key={role} style={styles.matrixTh}>
                        {role}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((permission) => (
                    <tr key={permission.id}>
                      <td style={styles.td}>
                        <div style={{ fontWeight: 650 }}>{permission.name}</div>
                        <div style={styles.secondaryText}>
                          {permission.code}
                        </div>
                      </td>
                      {roles.map((role) => (
                        <td key={role} style={styles.matrixTd}>
                          {permission.roles.includes(role) ? (
                            <Check
                              size={16}
                              color={C.green}
                              style={{ verticalAlign: "middle" }}
                            />
                          ) : (
                            <span style={{ color: "#CBD2DC" }}>—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "requests" && (
          <div style={{ padding: 20 }}>
            <div style={styles.requestHeading}>
              <div>
                <h2 style={{ margin: 0, fontSize: 15 }}>Access requests</h2>
                <p style={{ margin: "6px 0 0", color: C.muted, fontSize: 11 }}>
                  Review requested access and record a demo decision.
                </p>
              </div>
              <span style={styles.requestCount}>{pendingCount} pending</span>
            </div>

            <div style={styles.requestFilters}>
              <div style={{ position: "relative", flex: "1 1 240px" }}>
                <Search size={15} style={styles.searchIcon} />
                <input
                  aria-label="Search access requests"
                  placeholder="Search requester, resource, permission..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  style={{ ...inputStyle, paddingLeft: 36 }}
                />
              </div>
              <select
                aria-label="Filter requests by status"
                value={requestFilter}
                onChange={(event) => setRequestFilter(event.target.value)}
                style={{ ...inputStyle, maxWidth: 200 }}
              >
                <option value="All">All request statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div style={styles.requestList}>
              {filteredRequests.map((request) => (
                <article key={request.id} style={styles.requestCard}>
                  <div style={styles.requestCardHeader}>
                    <div style={styles.requestPerson}>
                      <span style={styles.avatar}>
                        {request.requester
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 12 }}>
                          {request.requester}
                        </div>
                        <div style={styles.secondaryText}>{request.email}</div>
                        <div style={styles.secondaryText}>{request.id}</div>
                      </div>
                    </div>
                    <StatusPill status={request.status} />
                  </div>

                  <div style={styles.requestInfoGrid}>
                    <div>
                      <div style={styles.detailLabel}>Resource</div>
                      <div style={styles.detailValue}>{request.resource}</div>
                    </div>
                    <div>
                      <div style={styles.detailLabel}>Requested permission</div>
                      <div style={styles.detailValue}>{request.permission}</div>
                    </div>
                    <div>
                      <div style={styles.detailLabel}>Requested on</div>
                      <div style={styles.detailValue}>{request.requestedAt}</div>
                    </div>
                  </div>

                  <p style={styles.reasonText}>
                    <strong style={{ color: C.text }}>Reason: </strong>
                    {request.reason}
                  </p>

                  {request.status === "Pending" && (
                    <div style={styles.requestActions}>
                      <button
                        type="button"
                        onClick={() => reviewRequest(request, "Rejected")}
                        style={{ ...buttonStyle, color: C.red }}
                      >
                        <Ban size={14} />
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => reviewRequest(request, "Approved")}
                        style={primaryButtonStyle}
                      >
                        <Check size={14} />
                        Approve
                      </button>
                    </div>
                  )}
                </article>
              ))}

              {filteredRequests.length === 0 && (
                <div style={styles.emptyState}>
                  <Search size={22} />
                  <p>No access requests match these filters.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      <section style={styles.bottomNote}>
        <AlertTriangle size={17} />
        <div>
          <strong>Production security reminder</strong>
          <p style={{ margin: "5px 0 0", lineHeight: 1.7 }}>
            Permission definitions, approvals, role mappings, and authorization
            decisions on this page are client-side demo state. Connect a
            server-side authorization service before using these controls for
            real access management.
          </p>
        </div>
      </section>

      {showForm && (
        <div
          style={styles.overlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowForm(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="permission-form-title"
            style={styles.modal}
          >
            <div style={styles.modalHeader}>
              <div>
                <h2 id="permission-form-title" style={{ margin: 0, fontSize: 18 }}>
                  {editing ? "Edit permission" : "Add permission"}
                </h2>
                <p style={styles.modalSubtitle}>
                  Configure a permission definition for the directory.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
                style={{ ...buttonStyle, padding: 7 }}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={savePermission} style={styles.form}>
              <label style={styles.label}>
                Permission name
                <input
                  required
                  maxLength={80}
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. Export reports"
                  style={inputStyle}
                />
              </label>

              <label style={styles.label}>
                Permission code
                <input
                  required
                  maxLength={100}
                  pattern="[A-Za-z0-9._-]+"
                  title="Use letters, numbers, periods, underscores, or hyphens."
                  value={form.code}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      code: event.target.value.toLowerCase(),
                    }))
                  }
                  placeholder="e.g. reports.export"
                  style={inputStyle}
                />
              </label>

              <div style={styles.formGrid}>
                <label style={styles.label}>
                  Resource
                  <select
                    value={form.resource}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        resource: event.target.value as Resource,
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
                </label>

                <label style={styles.label}>
                  Action
                  <select
                    value={form.action}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        action: event.target.value as AccessAction,
                      }))
                    }
                    style={inputStyle}
                  >
                    {actions.map((action) => (
                      <option key={action} value={action}>
                        {action}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={styles.label}>
                  Status
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value as AccessStatus,
                      }))
                    }
                    style={inputStyle}
                  >
                    <option value="Active">Active</option>
                    <option value="Restricted">Restricted</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>
              </div>

              <label style={styles.label}>
                Description
                <textarea
                  rows={3}
                  maxLength={300}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Describe what this permission allows."
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </label>

              <div style={styles.infoBox}>
                <LockKeyhole size={15} />
                <span>
                  Creating a permission definition does not assign it to a role.
                  Role assignment and server-side enforcement require backend
                  integration.
                </span>
              </div>

              <div style={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={buttonStyle}
                >
                  Cancel
                </button>
                <button type="submit" style={primaryButtonStyle}>
                  <Check size={15} />
                  {editing ? "Save changes" : "Create permission"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selected && (
        <div
          style={styles.overlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="permission-details-title"
            style={styles.modal}
          >
            <div style={styles.modalHeader}>
              <div>
                <h2 id="permission-details-title" style={{ margin: 0, fontSize: 18 }}>
                  Permission details
                </h2>
                <p style={styles.modalSubtitle}>{selected.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close details"
                style={{ ...buttonStyle, padding: 7 }}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ padding: 22 }}>
              <div style={styles.permissionCell}>
                <span style={{ ...styles.permissionIcon, width: 44, height: 44 }}>
                  <KeyRound size={22} />
                </span>
                <div>
                  <h3 style={{ margin: "0 0 5px", fontSize: 16 }}>
                    {selected.name}
                  </h3>
                  <div style={{ color: C.muted, fontSize: 11 }}>
                    {selected.code}
                  </div>
                </div>
              </div>

              <p style={styles.detailDescription}>
                {selected.description || "No description provided."}
              </p>

              <div style={styles.detailsGrid}>
                {[
                  ["Resource", selected.resource],
                  ["Action", selected.action],
                  ["Status", selected.status],
                  ["Assigned users", String(selected.assignedUsers)],
                  ["Roles", String(selected.roles.length)],
                  ["Last updated", selected.updatedAt],
                  ["Permission type", selected.system ? "System" : "Custom"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={styles.detailLabel}>{label}</div>
                    <div style={styles.detailValue}>{value}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 22 }}>
                <h3 style={{ margin: "0 0 10px", fontSize: 13 }}>
                  Roles with this permission
                </h3>
                {selected.roles.length === 0 ? (
                  <p style={{ color: C.muted, fontSize: 11 }}>
                    No role mappings are configured in this demo.
                  </p>
                ) : (
                  <div style={styles.roleChipList}>
                    {selected.roles.map((role) => (
                      <span key={role} style={styles.roleChip}>
                        <ShieldCheck size={13} />
                        {role}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {!selected.system && (
                <div style={styles.detailActions}>
                  <button
                    type="button"
                    onClick={() => togglePermissionStatus(selected)}
                    style={buttonStyle}
                  >
                    <Ban size={14} />
                    {selected.status === "Active" ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const permission = selected;
                      setSelected(null);
                      openEdit(permission);
                    }}
                    style={primaryButtonStyle}
                  >
                    <Pencil size={14} />
                    Edit permission
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: 28,
    background: C.background,
    color: C.text,
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    boxSizing: "border-box",
  },
  toast: {
    position: "fixed",
    zIndex: 120,
    top: 18,
    right: 18,
    maxWidth: "calc(100vw - 36px)",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "11px 13px",
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    background: "#FFFFFF",
    boxShadow: "0 8px 30px #10182818",
    fontSize: 12,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 18,
    flexWrap: "wrap",
    marginBottom: 25,
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 9,
    color: C.muted,
    fontSize: 12,
    marginBottom: 12,
  },
  title: {
    margin: "0 0 9px",
    fontSize: 28,
    letterSpacing: -0.8,
    fontWeight: 750,
  },
  subtitle: {
    margin: 0,
    maxWidth: 720,
    color: C.muted,
    fontSize: 13,
    lineHeight: 1.7,
  },
  headerActions: {
    display: "flex",
    gap: 9,
    flexWrap: "wrap",
  },
  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))",
    gap: 15,
    marginBottom: 22,
  },
  metricCard: {
    padding: 19,
    border: `1px solid ${C.border}`,
    borderRadius: 13,
    background: "#FFFFFF",
  },
  metricTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  metricLabel: {
    color: C.muted,
    fontSize: 12,
    fontWeight: 600,
  },
  metricIcon: {
    display: "grid",
    placeItems: "center",
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  metricValue: {
    marginTop: 13,
    fontSize: 29,
    fontWeight: 750,
    letterSpacing: -0.7,
  },
  metricDescription: {
    margin: "7px 0 0",
    color: C.muted,
    fontSize: 11,
  },
  securityBanner: {
    display: "flex",
    alignItems: "center",
    gap: 13,
    flexWrap: "wrap",
    padding: 18,
    marginBottom: 22,
    border: "1px solid #D7E3FF",
    borderRadius: 12,
    background: "#F2F6FF",
  },
  securityIcon: {
    display: "grid",
    placeItems: "center",
    width: 38,
    height: 38,
    flexShrink: 0,
    borderRadius: 10,
    color: C.blue,
    background: "#E1E9FF",
  },
  bannerText: {
    margin: 0,
    fontSize: 11,
    lineHeight: 1.7,
    color: C.muted,
  },
  securityPill: {
    padding: "6px 10px",
    borderRadius: 20,
    background: "#E1E9FF",
    color: C.blue,
    fontSize: 10,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  panel: {
    marginBottom: 22,
    border: `1px solid ${C.border}`,
    borderRadius: 13,
    background: "#FFFFFF",
    overflow: "hidden",
  },
  tabs: {
    display: "flex",
    gap: 20,
    padding: "0 20px",
    borderBottom: `1px solid ${C.border}`,
    overflowX: "auto",
  },
  tab: {
    padding: "16px 2px",
    background: "transparent",
    border: "none",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  filters: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 11,
    padding: "16px 20px",
    borderBottom: `1px solid ${C.border}`,
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    top: 12,
    color: C.muted,
  },
  table: {
    width: "100%",
    minWidth: 1000,
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: 12,
  },
  th: {
    padding: "13px 14px",
    color: C.muted,
    background: "#FAFBFD",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.5,
    whiteSpace: "nowrap",
    borderBottom: `1px solid ${C.border}`,
  },
  td: {
    padding: 14,
    verticalAlign: "middle",
    borderBottom: `1px solid ${C.border}`,
  },
  permissionCell: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minWidth: 200,
  },
  permissionIcon: {
    display: "grid",
    placeItems: "center",
    width: 35,
    height: 35,
    flexShrink: 0,
    borderRadius: 9,
    background: "#EDF2FF",
    color: C.blue,
  },
  secondaryText: {
    marginTop: 4,
    color: C.muted,
    fontSize: 10,
    overflowWrap: "anywhere",
  },
  actionPill: {
    display: "inline-flex",
    padding: "5px 8px",
    borderRadius: 6,
    background: "#F0F3F8",
    color: "#475467",
    fontSize: 10,
    fontWeight: 650,
  },
  emptyState: {
    padding: 45,
    textAlign: "center",
    color: C.muted,
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
    padding: "13px 20px",
    color: C.muted,
    fontSize: 10,
    borderTop: `1px solid ${C.border}`,
  },
  matrixDescription: {
    margin: "0 0 16px",
    color: C.muted,
    fontSize: 11,
    lineHeight: 1.7,
  },
  matrixTable: {
    width: "100%",
    minWidth: 1300,
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: 11,
  },
  matrixTh: {
    padding: 12,
    minWidth: 120,
    color: C.muted,
    background: "#FAFBFD",
    fontSize: 10,
    textAlign: "center",
    borderBottom: `1px solid ${C.border}`,
  },
  matrixTd: {
    padding: 12,
    textAlign: "center",
    borderBottom: `1px solid ${C.border}`,
  },
  requestHeading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  requestCount: {
    padding: "6px 10px",
    borderRadius: 20,
    background: "#FFF5DF",
    color: C.amber,
    fontSize: 10,
    fontWeight: 700,
  },
  requestFilters: {
    display: "flex",
    gap: 11,
    flexWrap: "wrap",
    marginTop: 17,
  },
  requestList: {
    display: "grid",
    gap: 12,
    marginTop: 17,
  },
  requestCard: {
    padding: 17,
    border: `1px solid ${C.border}`,
    borderRadius: 11,
  },
  requestCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  requestPerson: {
    display: "flex",
    gap: 11,
    alignItems: "center",
    minWidth: 0,
  },
  avatar: {
    display: "grid",
    placeItems: "center",
    width: 38,
    height: 38,
    flexShrink: 0,
    borderRadius: "50%",
    background: "#EDF2FF",
    color: C.blue,
    fontSize: 11,
    fontWeight: 700,
  },
  requestInfoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 15,
    marginTop: 19,
  },
  detailLabel: {
    marginBottom: 6,
    color: C.muted,
    fontSize: 10,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: 650,
    overflowWrap: "anywhere",
  },
  reasonText: {
    fontSize: 11,
    color: C.muted,
    lineHeight: 1.7,
  },
  requestActions: {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },
  bottomNote: {
    display: "flex",
    alignItems: "flex-start",
    gap: 11,
    padding: 16,
    marginBottom: 20,
    border: "1px solid #F3D5A5",
    borderRadius: 11,
    background: "#FFFAF0",
    color: C.amber,
    fontSize: 11,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 90,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    background: "#10182880",
  },
  modal: {
    width: "100%",
    maxWidth: 620,
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#FFFFFF",
    borderRadius: 15,
    boxShadow: "0 24px 70px #10182840",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 15,
    padding: 22,
    borderBottom: `1px solid ${C.border}`,
  },
  modalSubtitle: {
    margin: "6px 0 0",
    color: C.muted,
    fontSize: 11,
  },
  form: {
    display: "grid",
    gap: 17,
    padding: 22,
  },
  label: {
    display: "grid",
    gap: 8,
    color: C.text,
    fontSize: 12,
    fontWeight: 600,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 14,
  },
  infoBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: 9,
    padding: 12,
    borderRadius: 9,
    background: "#EDF2FF",
    color: "#2949A5",
    fontSize: 11,
    lineHeight: 1.6,
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 9,
  },
  detailDescription: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 1.7,
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 18,
    marginTop: 22,
  },
  roleChipList: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  roleChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 10px",
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    background: "#FAFBFD",
    color: C.text,
    fontSize: 10,
  },
  detailActions: {
    display: "flex",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 9,
    marginTop: 24,
  },
};