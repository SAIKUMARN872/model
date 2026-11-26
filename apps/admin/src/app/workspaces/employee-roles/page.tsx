
"use client";

import { useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import {
  ShieldCheck,
  Plus,
  Search,
  Download,
  X,
  Check,
  Users,
  KeyRound,
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  LockKeyhole,
  Building2,
  CircleCheck,
  Ban,
} from "lucide-react";

type Permission =
  | "workspace.read"
  | "workspace.manage"
  | "employees.read"
  | "employees.manage"
  | "teams.manage"
  | "projects.manage"
  | "billing.read"
  | "billing.manage"
  | "models.use"
  | "models.manage"
  | "audit.read"
  | "security.manage";

type RoleStatus = "Active" | "Inactive" | "System";

type EmployeeRole = {
  id: string;
  name: string;
  code: string;
  description: string;
  category: string;
  permissions: Permission[];
  assignedUsers: number;
  status: RoleStatus;
  createdAt: string;
  updatedAt: string;
};

const permissionGroups: {
  title: string;
  description: string;
  permissions: { id: Permission; label: string }[];
}[] = [
  {
    title: "Workspace",
    description: "Workspace visibility and configuration",
    permissions: [
      { id: "workspace.read", label: "View workspace" },
      { id: "workspace.manage", label: "Manage workspace settings" },
    ],
  },
  {
    title: "Employees & Teams",
    description: "Employee directory and team administration",
    permissions: [
      { id: "employees.read", label: "View employees" },
      { id: "employees.manage", label: "Manage employees and invitations" },
      { id: "teams.manage", label: "Manage teams and departments" },
    ],
  },
  {
    title: "Projects",
    description: "Workspace project management",
    permissions: [
      { id: "projects.manage", label: "Create and manage projects" },
    ],
  },
  {
    title: "Billing",
    description: "Plan and billing visibility",
    permissions: [
      { id: "billing.read", label: "View billing and usage" },
      { id: "billing.manage", label: "Manage plans and billing" },
    ],
  },
  {
    title: "AI Models",
    description: "Model usage and configuration",
    permissions: [
      { id: "models.use", label: "Use approved AI models" },
      { id: "models.manage", label: "Manage model configuration" },
    ],
  },
  {
    title: "Security & Audit",
    description: "Security administration and audit visibility",
    permissions: [
      { id: "audit.read", label: "View audit logs" },
      { id: "security.manage", label: "Manage security policies" },
    ],
  },
];

const allPermissions = permissionGroups.flatMap((group) =>
  group.permissions.map((permission) => permission.id),
);

const initialRoles: EmployeeRole[] = [
  {
    id: "ROLE-001",
    name: "Workspace Owner",
    code: "WORKSPACE_OWNER",
    description: "Full administrative control over the workspace.",
    category: "Administration",
    permissions: allPermissions,
    assignedUsers: 2,
    status: "System",
    createdAt: "2026-04-01",
    updatedAt: "2026-10-20",
  },
  {
    id: "ROLE-002",
    name: "Workspace Admin",
    code: "WORKSPACE_ADMIN",
    description: "Manage employees, teams, workspace settings, and operations.",
    category: "Administration",
    permissions: [
      "workspace.read",
      "workspace.manage",
      "employees.read",
      "employees.manage",
      "teams.manage",
      "projects.manage",
      "billing.read",
      "models.use",
      "models.manage",
      "audit.read",
    ],
    assignedUsers: 4,
    status: "System",
    createdAt: "2026-04-01",
    updatedAt: "2026-10-20",
  },
  {
    id: "ROLE-003",
    name: "Team Lead",
    code: "TEAM_LEAD",
    description: "Coordinate teams and manage project delivery.",
    category: "Management",
    permissions: [
      "workspace.read",
      "employees.read",
      "teams.manage",
      "projects.manage",
      "billing.read",
      "models.use",
    ],
    assignedUsers: 8,
    status: "Active",
    createdAt: "2026-05-12",
    updatedAt: "2026-10-18",
  },
  {
    id: "ROLE-004",
    name: "Developer",
    code: "DEVELOPER",
    description: "Build products and use approved AI model services.",
    category: "Technical",
    permissions: [
      "workspace.read",
      "employees.read",
      "projects.manage",
      "models.use",
    ],
    assignedUsers: 18,
    status: "Active",
    createdAt: "2026-05-12",
    updatedAt: "2026-10-15",
  },
  {
    id: "ROLE-005",
    name: "AI Researcher",
    code: "AI_RESEARCHER",
    description: "Access approved AI models and research projects.",
    category: "Technical",
    permissions: ["workspace.read", "projects.manage", "models.use"],
    assignedUsers: 7,
    status: "Active",
    createdAt: "2026-06-03",
    updatedAt: "2026-10-11",
  },
  {
    id: "ROLE-006",
    name: "Finance Analyst",
    code: "FINANCE_ANALYST",
    description: "Review billing, usage, and workspace cost information.",
    category: "Finance",
    permissions: ["workspace.read", "billing.read"],
    assignedUsers: 3,
    status: "Active",
    createdAt: "2026-06-15",
    updatedAt: "2026-09-29",
  },
  {
    id: "ROLE-007",
    name: "Security Auditor",
    code: "SECURITY_AUDITOR",
    description: "Review security activity and audit records.",
    category: "Security",
    permissions: ["workspace.read", "employees.read", "audit.read"],
    assignedUsers: 2,
    status: "Active",
    createdAt: "2026-07-01",
    updatedAt: "2026-10-10",
  },
  {
    id: "ROLE-008",
    name: "Read-only Viewer",
    code: "READ_ONLY",
    description: "View workspace information without administrative changes.",
    category: "Standard",
    permissions: ["workspace.read", "employees.read"],
    assignedUsers: 5,
    status: "Active",
    createdAt: "2026-07-10",
    updatedAt: "2026-09-20",
  },
  {
    id: "ROLE-009",
    name: "Legacy Contributor",
    code: "LEGACY_CONTRIBUTOR",
    description: "Retired role retained for reference.",
    category: "Legacy",
    permissions: ["workspace.read"],
    assignedUsers: 0,
    status: "Inactive",
    createdAt: "2026-04-12",
    updatedAt: "2026-08-01",
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

const roleStatusStyles: Record<RoleStatus, CSSProperties> = {
  Active: { color: "#15803D", background: "#EAF8EF" },
  Inactive: { color: "#697586", background: "#EEF1F5" },
  System: { color: "#315FEA", background: "#EDF2FF" },
};

const buttonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "10px 12px",
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
  boxSizing: "border-box",
  padding: "10px 12px",
  border: `1px solid ${C.border}`,
  borderRadius: 9,
  background: "#FFFFFF",
  color: C.text,
  fontSize: 12,
  outline: "none",
};

const emptyForm = {
  name: "",
  code: "",
  description: "",
  category: "Standard",
  permissions: ["workspace.read"] as Permission[],
  status: "Active" as RoleStatus,
};

export default function EmployeeRolesPage() {
  const [roles, setRoles] = useState<EmployeeRole[]>(initialRoles);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EmployeeRole | null>(null);
  const [selected, setSelected] = useState<EmployeeRole | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState(emptyForm);

  const categories = Array.from(
    new Set(roles.map((role) => role.category)),
  ).sort();

  const filteredRoles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return roles.filter((role) => {
      const matchesSearch =
        !query ||
        [role.id, role.name, role.code, role.description, role.category].some(
          (value) => value.toLowerCase().includes(query),
        );

      return (
        matchesSearch &&
        (statusFilter === "All" || role.status === statusFilter) &&
        (categoryFilter === "All" || role.category === categoryFilter)
      );
    });
  }, [roles, search, statusFilter, categoryFilter]);

  const totalAssigned = roles.reduce(
    (sum, role) => sum + role.assignedUsers,
    0,
  );
  const activeCount = roles.filter(
    (role) => role.status === "Active" || role.status === "System",
  ).length;
  const systemCount = roles.filter((role) => role.status === "System").length;

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(role: EmployeeRole) {
    if (role.status === "System") {
      notify("System roles cannot be edited in this demo.");
      return;
    }

    setEditing(role);
    setForm({
      name: role.name,
      code: role.code,
      description: role.description,
      category: role.category,
      permissions: [...role.permissions],
      status: role.status,
    });
    setMenuId(null);
    setShowForm(true);
  }

  function togglePermission(permission: Permission) {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((item) => item !== permission)
        : [...current.permissions, permission],
    }));
  }

  function saveRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (form.permissions.length === 0) {
      notify("Select at least one permission.");
      return;
    }

    const normalizedCode = form.code.trim().toUpperCase();

    const duplicate = roles.some(
      (role) =>
        role.code.toLowerCase() === normalizedCode.toLowerCase() &&
        role.id !== editing?.id,
    );

    if (duplicate) {
      notify("That role code is already in use.");
      return;
    }

    const now = new Date().toISOString().slice(0, 10);

    if (editing) {
      const updated: EmployeeRole = {
        ...editing,
        name: form.name.trim(),
        code: normalizedCode,
        description: form.description.trim(),
        category: form.category,
        permissions: [...form.permissions],
        status: form.status === "System" ? "Active" : form.status,
        updatedAt: now,
      };

      setRoles((current) =>
        current.map((role) => (role.id === editing.id ? updated : role)),
      );
      setSelected((current) =>
        current?.id === editing.id ? updated : current,
      );
      notify("Role updated in the demo.");
    } else {
      const created: EmployeeRole = {
        id: `ROLE-${Date.now().toString().slice(-6)}`,
        name: form.name.trim(),
        code: normalizedCode,
        description: form.description.trim(),
        category: form.category,
        permissions: [...form.permissions],
        assignedUsers: 0,
        status: form.status === "System" ? "Active" : form.status,
        createdAt: now,
        updatedAt: now,
      };

      setRoles((current) => [created, ...current]);
      setSearch("");
      setStatusFilter("All");
      setCategoryFilter("All");
      notify("Role created in the demo.");
    }

    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
  }

  function toggleRoleStatus(role: EmployeeRole) {
    if (role.status === "System") {
      notify("System roles cannot be deactivated.");
      setMenuId(null);
      return;
    }

    if (role.assignedUsers > 0 && role.status === "Active") {
      notify("Reassign users before deactivating this role.");
      setMenuId(null);
      return;
    }

    const updated: EmployeeRole = {
      ...role,
      status: role.status === "Active" ? "Inactive" : "Active",
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    setRoles((current) =>
      current.map((item) => (item.id === role.id ? updated : item)),
    );
    setSelected((current) => (current?.id === role.id ? updated : current));
    setMenuId(null);
    notify(`Role marked ${updated.status.toLowerCase()}.`);
  }

  function deleteRole(role: EmployeeRole) {
    if (role.status === "System") {
      notify("System roles cannot be deleted.");
      setMenuId(null);
      return;
    }

    if (role.assignedUsers > 0) {
      notify("This role has assigned users and cannot be deleted.");
      setMenuId(null);
      return;
    }

    if (!window.confirm(`Delete the "${role.name}" role?`)) return;

    setRoles((current) => current.filter((item) => item.id !== role.id));
    setSelected((current) => (current?.id === role.id ? null : current));
    setMenuId(null);
    notify("Role removed from the demo directory.");
  }

  function exportCsv() {
    const headers = [
      "Role ID",
      "Role Name",
      "Role Code",
      "Category",
      "Description",
      "Assigned Users",
      "Status",
      "Permissions",
      "Created",
      "Updated",
    ];

    const rows = filteredRoles.map((role) => [
      role.id,
      role.name,
      role.code,
      role.category,
      role.description,
      String(role.assignedUsers),
      role.status,
      role.permissions.join("; "),
      role.createdAt,
      role.updatedAt,
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
    anchor.download = "modelnow-employee-roles.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    notify("Roles CSV exported.");
  }

  return (
    <main style={pageStyle}>
      {notice && (
        <div role="status" style={toastStyle}>
          <Check size={15} />
          {notice}
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
            <span style={{ color: C.blue }}>Employee Roles</span>
          </div>
          <h1 style={titleStyle}>Employee Roles</h1>
          <p style={subtitleStyle}>
            Define workspace roles, organize permissions, and review how
            access responsibilities are assigned across your organization.
          </p>
        </div>

        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <button onClick={exportCsv} style={buttonStyle}>
            <Download size={15} />
            Export CSV
          </button>
          <button onClick={openCreate} style={primaryButtonStyle}>
            <Plus size={16} />
            Create role
          </button>
        </div>
      </header>

      <section style={metricsGridStyle}>
        {[
          {
            label: "Total roles",
            value: roles.length,
            description: "System and custom roles",
            icon: ShieldCheck,
            color: "#315FEA",
            bg: "#EDF2FF",
          },
          {
            label: "Active roles",
            value: activeCount,
            description: "Available for assignment",
            icon: CircleCheck,
            color: "#15803D",
            bg: "#EAF8EF",
          },
          {
            label: "Assigned users",
            value: totalAssigned,
            description: "Sum across role records",
            icon: Users,
            color: "#6941C6",
            bg: "#F2EDFF",
          },
          {
            label: "System roles",
            value: systemCount,
            description: "Protected default roles",
            icon: LockKeyhole,
            color: "#B54708",
            bg: "#FFF5DF",
          },
        ].map((metric) => {
          const Icon = metric.icon;

          return (
            <article key={metric.label} style={metricCardStyle}>
              <div style={metricTopStyle}>
                <span style={metricLabelStyle}>{metric.label}</span>
                <span
                  style={{
                    ...metricIconStyle,
                    color: metric.color,
                    background: metric.bg,
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

      <section style={noticePanelStyle}>
        <div style={noticeIconStyle}>
          <LockKeyhole size={19} />
        </div>
        <div>
          <h2 style={{ margin: "0 0 5px", fontSize: 13 }}>
            Permission administration
          </h2>
          <p style={{ margin: 0, color: C.muted, fontSize: 11, lineHeight: 1.7 }}>
            This interface demonstrates role configuration. Production access
            control must be enforced by the backend on every protected request;
            hiding a button in the UI is not a security boundary.
          </p>
        </div>
      </section>

      <section style={panelStyle}>
        <div style={panelHeaderStyle}>
          <div>
            <h2 style={panelTitleStyle}>Role directory</h2>
            <p style={panelSubtitleStyle}>
              {filteredRoles.length} of {roles.length} roles
            </p>
          </div>
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("All");
              setCategoryFilter("All");
            }}
            style={buttonStyle}
          >
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
                color: C.muted,
              }}
            />
            <input
              aria-label="Search roles"
              placeholder="Search role name, code, description..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{ ...inputStyle, paddingLeft: 36 }}
            />
          </div>

          <select
            aria-label="Filter roles by category"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            style={inputStyle}
          >
            <option value="All">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter roles by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            style={inputStyle}
          >
            <option value="All">All statuses</option>
            <option value="System">System</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                {[
                  "ROLE",
                  "CATEGORY",
                  "PERMISSIONS",
                  "ASSIGNED USERS",
                  "STATUS",
                  "LAST UPDATED",
                  "ACTIONS",
                ].map((heading) => (
                  <th key={heading} style={thStyle}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRoles.map((role) => (
                <tr key={role.id}>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={avatarStyle}>
                        <ShieldCheck size={17} />
                      </span>
                      <div>
                        <div style={{ fontWeight: 700 }}>{role.name}</div>
                        <div style={secondaryTextStyle}>
                          {role.code} · {role.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={tdStyle}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <Building2 size={14} color={C.muted} />
                      {role.category}
                    </span>
                  </td>

                  <td style={tdStyle}>
                    <button
                      onClick={() => setSelected(role)}
                      style={{ ...buttonStyle, padding: "6px 9px" }}
                    >
                      <KeyRound size={13} />
                      {role.permissions.length} permissions
                    </button>
                  </td>

                  <td style={tdStyle}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <Users size={14} color={C.muted} />
                      {role.assignedUsers}
                    </span>
                  </td>

                  <td style={tdStyle}>
                    <span
                      style={{
                        ...roleStatusStyles[role.status],
                        padding: "5px 9px",
                        borderRadius: 20,
                        fontSize: 10,
                        fontWeight: 650,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {role.status}
                    </span>
                  </td>

                  <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                    {role.updatedAt}
                  </td>

                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        title="View role"
                        aria-label={`View ${role.name}`}
                        onClick={() => setSelected(role)}
                        style={{ ...buttonStyle, padding: 7, border: "none" }}
                      >
                        <Eye size={15} />
                      </button>

                      <div style={{ position: "relative" }}>
                        <button
                          title="More actions"
                          aria-label={`More actions for ${role.name}`}
                          onClick={() =>
                            setMenuId((current) =>
                              current === role.id ? null : role.id,
                            )
                          }
                          style={{ ...buttonStyle, padding: 7, border: "none" }}
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        {menuId === role.id && (
                          <div style={menuStyle}>
                            <button
                              onClick={() => {
                                setSelected(role);
                                setMenuId(null);
                              }}
                              style={menuItemStyle}
                            >
                              <Eye size={14} />
                              View details
                            </button>
                            <button
                              onClick={() => openEdit(role)}
                              style={menuItemStyle}
                            >
                              <Pencil size={14} />
                              Edit role
                            </button>
                            <button
                              onClick={() => toggleRoleStatus(role)}
                              style={menuItemStyle}
                            >
                              <Ban size={14} />
                              {role.status === "Active" ? "Deactivate" : "Activate"}
                            </button>
                            <button
                              onClick={() => deleteRole(role)}
                              style={{ ...menuItemStyle, color: C.red }}
                            >
                              <Trash2 size={14} />
                              Delete role
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredRoles.length === 0 && (
                <tr>
                  <td colSpan={7} style={emptyStateStyle}>
                    <Search size={22} />
                    <p>No roles match your current filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={footerStyle}>
          <span>{filteredRoles.length} role record(s)</span>
          <span>Demo data · Not connected to authorization services</span>
        </div>
      </section>

      <section style={panelStyle}>
        <div style={panelHeaderStyle}>
          <div>
            <h2 style={panelTitleStyle}>Permission catalog</h2>
            <p style={panelSubtitleStyle}>
              Permission groups available in this page's role editor
            </p>
          </div>
        </div>

        <div style={permissionCatalogGridStyle}>
          {permissionGroups.map((group) => (
            <article key={group.title} style={permissionGroupStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span style={catalogIconStyle}>
                  <KeyRound size={15} />
                </span>
                <h3 style={{ margin: 0, fontSize: 12 }}>{group.title}</h3>
              </div>
              <p style={capabilityDescriptionStyle}>{group.description}</p>
              <div style={{ display: "grid", gap: 9, marginTop: 13 }}>
                {group.permissions.map((permission) => (
                  <div
                    key={permission.id}
                    style={{ display: "flex", alignItems: "flex-start", gap: 7 }}
                  >
                    <Check size={13} color={C.green} />
                    <div>
                      <div style={{ fontSize: 11 }}>{permission.label}</div>
                      <div style={permissionCodeStyle}>{permission.id}</div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {showForm && (
        <div
          style={overlayStyle}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowForm(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-form-title"
            style={wideModalStyle}
          >
            <div style={modalHeaderStyle}>
              <div>
                <h2 id="role-form-title" style={{ margin: 0, fontSize: 19 }}>
                  {editing ? "Edit employee role" : "Create employee role"}
                </h2>
                <p style={{ margin: "6px 0 0", color: C.muted, fontSize: 12 }}>
                  Define the role identity and select its permissions.
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                aria-label="Close role form"
                style={{ ...buttonStyle, padding: 7 }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={saveRole} style={formStyle}>
              <div style={formGridStyle}>
                <label style={labelStyle}>
                  Role name
                  <input
                    required
                    maxLength={80}
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    placeholder="e.g. Support Specialist"
                    style={inputStyle}
                  />
                </label>

                <label style={labelStyle}>
                  Role code
                  <input
                    required
                    maxLength={40}
                    pattern="[A-Za-z0-9_-]+"
                    title="Use letters, numbers, underscores, or hyphens."
                    value={form.code}
                    onChange={(event) =>
                      setForm({ ...form, code: event.target.value.toUpperCase() })
                    }
                    placeholder="e.g. SUPPORT_SPECIALIST"
                    style={inputStyle}
                  />
                </label>

                <label style={labelStyle}>
                  Category
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                    style={inputStyle}
                  >
                    <option>Administration</option>
                    <option>Management</option>
                    <option>Technical</option>
                    <option>Finance</option>
                    <option>Security</option>
                    <option>Standard</option>
                    <option>Custom</option>
                  </select>
                </label>

                <label style={labelStyle}>
                  Status
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        status: event.target.value as RoleStatus,
                      })
                    }
                    style={inputStyle}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>
              </div>

              <label style={labelStyle}>
                Description
                <textarea
                  rows={3}
                  maxLength={300}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Describe this role's responsibilities."
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </label>

              <div>
                <div style={permissionHeaderStyle}>
                  <div>
                    <h3 style={{ margin: "0 0 5px", fontSize: 13 }}>
                      Role permissions
                    </h3>
                    <p style={{ margin: 0, color: C.muted, fontSize: 11 }}>
                      {form.permissions.length} of {allPermissions.length} selected
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, permissions: [...allPermissions] })
                    }
                    style={buttonStyle}
                  >
                    Select all
                  </button>
                </div>

                <div style={permissionEditorGridStyle}>
                  {permissionGroups.map((group) => (
                    <section key={group.title} style={permissionEditorGroupStyle}>
                      <h4 style={{ margin: "0 0 5px", fontSize: 12 }}>
                        {group.title}
                      </h4>
                      <p style={{ margin: "0 0 12px", color: C.muted, fontSize: 10 }}>
                        {group.description}
                      </p>
                      {group.permissions.map((permission) => (
                        <label
                          key={permission.id}
                          style={permissionCheckboxStyle}
                        >
                          <input
                            type="checkbox"
                            checked={form.permissions.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                          />
                          <span>
                            <span style={{ display: "block", fontSize: 11 }}>
                              {permission.label}
                            </span>
                            <span style={permissionCodeStyle}>
                              {permission.id}
                            </span>
                          </span>
                        </label>
                      ))}
                    </section>
                  ))}
                </div>
              </div>

              <div style={infoBoxStyle}>
                <LockKeyhole size={16} />
                <span>
                  Changes here are local to this demo. Connect the role editor
                  to your authorization backend before using it for real access control.
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 9 }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={buttonStyle}
                >
                  Cancel
                </button>
                <button type="submit" style={primaryButtonStyle}>
                  <Check size={15} />
                  {editing ? "Save changes" : "Create role"}
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
            aria-labelledby="role-details-title"
            style={wideModalStyle}
          >
            <div style={modalHeaderStyle}>
              <div>
                <h2 id="role-details-title" style={{ margin: 0, fontSize: 19 }}>
                  Role details
                </h2>
                <p style={{ margin: "6px 0 0", color: C.muted, fontSize: 12 }}>
                  {selected.id}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close role details"
                style={{ ...buttonStyle, padding: 7 }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ ...avatarStyle, width: 46, height: 46 }}>
                  <ShieldCheck size={23} />
                </span>
                <div>
                  <h3 style={{ margin: "0 0 5px", fontSize: 18 }}>
                    {selected.name}
                  </h3>
                  <p style={{ margin: 0, color: C.muted, fontSize: 11 }}>
                    {selected.code} · {selected.category}
                  </p>
                </div>
                <span
                  style={{
                    ...roleStatusStyles[selected.status],
                    marginLeft: "auto",
                    padding: "6px 10px",
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {selected.status}
                </span>
              </div>

              <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.7 }}>
                {selected.description || "No description provided."}
              </p>

              <div style={detailsGridStyle}>
                {[
                  ["Role ID", selected.id],
                  ["Category", selected.category],
                  ["Assigned users", String(selected.assignedUsers)],
                  ["Permission count", String(selected.permissions.length)],
                  ["Created", selected.createdAt],
                  ["Last updated", selected.updatedAt],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={detailLabelStyle}>{label}</div>
                    <div style={detailValueStyle}>{value}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 24 }}>
                <h3 style={{ fontSize: 13, margin: "0 0 12px" }}>
                  Granted permissions
                </h3>
                {selected.permissions.length === 0 ? (
                  <p style={{ fontSize: 12, color: C.muted }}>
                    No permissions configured.
                  </p>
                ) : (
                  <div style={permissionListStyle}>
                    {selected.permissions.map((permission) => {
                      const label =
                        permissionGroups
                          .flatMap((group) => group.permissions)
                          .find((item) => item.id === permission)?.label ??
                        permission;

                      return (
                        <div key={permission} style={permissionRowStyle}>
                          <CircleCheck size={15} color={C.green} />
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 600 }}>
                              {label}
                            </div>
                            <div style={permissionCodeStyle}>{permission}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 24 }}>
                {selected.status !== "System" && (
                  <button
                    onClick={() => openEdit(selected)}
                    style={buttonStyle}
                  >
                    <Pencil size={14} />
                    Edit role
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

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  padding: 28,
  background: C.background,
  color: C.text,
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
  color: C.muted,
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
  color: C.muted,
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
  border: `1px solid ${C.border}`,
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
  color: C.muted,
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
  color: C.muted,
  fontSize: 11,
};

const noticePanelStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 13,
  padding: 18,
  marginBottom: 22,
  border: "1px solid #D7E3FF",
  borderRadius: 12,
  background: "#F2F6FF",
};

const noticeIconStyle: CSSProperties = {
  display: "grid",
  placeItems: "center",
  width: 38,
  height: 38,
  flexShrink: 0,
  borderRadius: 10,
  color: C.blue,
  background: "#E1E9FF",
};

const panelStyle: CSSProperties = {
  marginBottom: 22,
  border: `1px solid ${C.border}`,
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
  borderBottom: `1px solid ${C.border}`,
};

const panelTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
};

const panelSubtitleStyle: CSSProperties = {
  margin: "6px 0 0",
  color: C.muted,
  fontSize: 11,
};

const filtersStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 11,
  padding: "16px 21px",
  borderBottom: `1px solid ${C.border}`,
};

const tableStyle: CSSProperties = {
  width: "100%",
  minWidth: 1000,
  borderCollapse: "collapse",
  textAlign: "left",
  fontSize: 12,
};

const thStyle: CSSProperties = {
  padding: "13px 15px",
  color: C.muted,
  background: "#FAFBFD",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 0.5,
  whiteSpace: "nowrap",
  borderBottom: `1px solid ${C.border}`,
};

const tdStyle: CSSProperties = {
  padding: 14,
  verticalAlign: "middle",
  borderBottom: `1px solid ${C.border}`,
};

const avatarStyle: CSSProperties = {
  display: "grid",
  placeItems: "center",
  width: 36,
  height: 36,
  borderRadius: 10,
  flexShrink: 0,
  background: "#EDF2FF",
  color: C.blue,
};

const secondaryTextStyle: CSSProperties = {
  marginTop: 4,
  color: C.muted,
  fontSize: 10,
};

const footerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 10,
  padding: "13px 21px",
  color: C.muted,
  fontSize: 10,
};

const emptyStateStyle: CSSProperties = {
  padding: 45,
  textAlign: "center",
  color: C.muted,
};

const permissionCatalogGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
  gap: 13,
  padding: 20,
};

const permissionGroupStyle: CSSProperties = {
  padding: 15,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
};

const catalogIconStyle: CSSProperties = {
  display: "grid",
  placeItems: "center",
  width: 30,
  height: 30,
  borderRadius: 8,
  background: "#EDF2FF",
  color: C.blue,
};

const capabilityDescriptionStyle: CSSProperties = {
  margin: "9px 0 0",
  color: C.muted,
  fontSize: 11,
  lineHeight: 1.65,
};

const permissionCodeStyle: CSSProperties = {
  marginTop: 3,
  color: C.muted,
  fontSize: 9,
  overflowWrap: "anywhere",
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
  width: 180,
  padding: 5,
  zIndex: 30,
  background: "#FFFFFF",
  border: `1px solid ${C.border}`,
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
  color: C.text,
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

const wideModalStyle: CSSProperties = {
  width: "100%",
  maxWidth: 760,
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
  borderBottom: `1px solid ${C.border}`,
};

const formStyle: CSSProperties = {
  display: "grid",
  gap: 17,
  padding: 22,
};

const formGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
};

const labelStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  color: C.text,
  fontSize: 12,
  fontWeight: 600,
};

const permissionHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 13,
};

const permissionEditorGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};

const permissionEditorGroupStyle: CSSProperties = {
  padding: 13,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
};

const permissionCheckboxStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 8,
  marginBottom: 12,
  cursor: "pointer",
};

const infoBoxStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 9,
  padding: 12,
  background: "#EDF2FF",
  color: "#2949A5",
  borderRadius: 9,
  fontSize: 11,
  lineHeight: 1.6,
};

const detailsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: 18,
  marginTop: 22,
};

const detailLabelStyle: CSSProperties = {
  fontSize: 11,
  color: C.muted,
  marginBottom: 6,
};

const detailValueStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 650,
  overflowWrap: "anywhere",
};

const permissionListStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 10,
};

const permissionRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 9,
  padding: 11,
  border: `1px solid ${C.border}`,
  borderRadius: 9,
};
