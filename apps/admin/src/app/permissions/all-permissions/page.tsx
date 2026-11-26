
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Download,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Pencil,
  X,
  Check,
  ChevronDown,
  Filter,
  KeyRound,
  LockKeyhole,
  RefreshCw,
  FileText,
} from "lucide-react";

type PermissionScope = "Global" | "Organization" | "Workspace";

type PermissionStatus =
  | "Active"
  | "Restricted"
  | "Review Required";

type Permission = {
  id: string;
  name: string;
  resource: string;
  action: string;
  scope: PermissionScope;
  status: PermissionStatus;
  description: string;
  sensitive: boolean;
  roles: string[];
  updatedAt: string;
};

const initialPermissions: Permission[] = [
  {
    id: "PERM-1001",
    name: "Manage Users",
    resource: "Users",
    action: "Manage",
    scope: "Global",
    status: "Active",
    description: "Create, update, disable, and manage platform users.",
    sensitive: true,
    roles: ["Super Admin", "Admin"],
    updatedAt: "2026-10-28",
  },
  {
    id: "PERM-1002",
    name: "Manage Organizations",
    resource: "Organizations",
    action: "Manage",
    scope: "Global",
    status: "Active",
    description: "Manage organization settings and membership.",
    sensitive: true,
    roles: ["Super Admin"],
    updatedAt: "2026-10-27",
  },
  {
    id: "PERM-1003",
    name: "Manage Workspaces",
    resource: "Workspaces",
    action: "Manage",
    scope: "Organization",
    status: "Active",
    description: "Create and administer organization workspaces.",
    sensitive: false,
    roles: ["Super Admin", "Admin"],
    updatedAt: "2026-10-26",
  },
  {
    id: "PERM-1004",
    name: "View Audit Logs",
    resource: "Audit Logs",
    action: "Read",
    scope: "Global",
    status: "Active",
    description: "View platform activity and security audit records.",
    sensitive: true,
    roles: ["Super Admin", "Security Analyst"],
    updatedAt: "2026-10-25",
  },
  {
    id: "PERM-1005",
    name: "Manage Billing",
    resource: "Billing",
    action: "Manage",
    scope: "Organization",
    status: "Restricted",
    description: "Manage billing settings and subscription information.",
    sensitive: true,
    roles: ["Super Admin", "Billing Admin"],
    updatedAt: "2026-10-24",
  },
  {
    id: "PERM-1006",
    name: "Manage AI Models",
    resource: "AI Models",
    action: "Manage",
    scope: "Workspace",
    status: "Active",
    description: "Configure available models and model access.",
    sensitive: true,
    roles: ["Super Admin", "AI Engineer"],
    updatedAt: "2026-10-23",
  },
  {
    id: "PERM-1007",
    name: "Manage API Keys",
    resource: "API Keys",
    action: "Manage",
    scope: "Workspace",
    status: "Review Required",
    description: "Create, rotate, and revoke API credentials.",
    sensitive: true,
    roles: ["Super Admin", "Admin"],
    updatedAt: "2026-10-22",
  },
  {
    id: "PERM-1008",
    name: "Manage Integrations",
    resource: "Integrations",
    action: "Manage",
    scope: "Workspace",
    status: "Active",
    description: "Configure external service integrations.",
    sensitive: false,
    roles: ["Super Admin", "Admin"],
    updatedAt: "2026-10-21",
  },
  {
    id: "PERM-1009",
    name: "Manage Platform Settings",
    resource: "Settings",
    action: "Manage",
    scope: "Global",
    status: "Active",
    description: "Update platform-wide configuration settings.",
    sensitive: true,
    roles: ["Super Admin"],
    updatedAt: "2026-10-20",
  },
  {
    id: "PERM-1010",
    name: "View Usage Analytics",
    resource: "Analytics",
    action: "Read",
    scope: "Organization",
    status: "Active",
    description: "View usage metrics and organization analytics.",
    sensitive: false,
    roles: ["Super Admin", "Admin", "Analyst"],
    updatedAt: "2026-10-19",
  },
  {
    id: "PERM-1011",
    name: "Manage Agents",
    resource: "Agents",
    action: "Manage",
    scope: "Workspace",
    status: "Review Required",
    description: "Create, configure, and manage AI agents.",
    sensitive: false,
    roles: ["Super Admin", "AI Engineer"],
    updatedAt: "2026-10-18",
  },
  {
    id: "PERM-1012",
    name: "Manage Security Policies",
    resource: "Security",
    action: "Manage",
    scope: "Global",
    status: "Restricted",
    description: "Configure access restrictions and security policies.",
    sensitive: true,
    roles: ["Super Admin", "Security Analyst"],
    updatedAt: "2026-10-17",
  },
];

const resourceOptions = [
  "Users",
  "Organizations",
  "Workspaces",
  "Audit Logs",
  "Billing",
  "AI Models",
  "API Keys",
  "Integrations",
  "Settings",
  "Analytics",
  "Agents",
  "Security",
];

const actionOptions = [
  "Read",
  "Create",
  "Update",
  "Delete",
  "Manage",
];

const scopeOptions: PermissionScope[] = [
  "Global",
  "Organization",
  "Workspace",
];

const statusOptions: PermissionStatus[] = [
  "Active",
  "Restricted",
  "Review Required",
];

const availableRoles = [
  "Super Admin",
  "Admin",
  "Security Analyst",
  "Billing Admin",
  "AI Engineer",
  "Analyst",
];

const blankForm = {
  name: "",
  resource: "Users",
  action: "Read",
  scope: "Workspace" as PermissionScope,
  status: "Active" as PermissionStatus,
  description: "",
  sensitive: false,
  roles: [] as string[],
};

const colors = {
  primary: "#315fea",
  text: "#172033",
  muted: "#667085",
  border: "#e4e7ec",
  surface: "#ffffff",
  background: "#f8fafc",
  green: "#15803d",
  red: "#b42318",
  amber: "#b54708",
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "28px",
    background: colors.background,
    color: colors.text,
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "24px",
  },
  eyebrow: {
    color: colors.primary,
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "8px",
  },
  title: {
    fontSize: "27px",
    lineHeight: 1.25,
    fontWeight: 750,
    margin: "0 0 8px",
  },
  subtitle: {
    fontSize: "14px",
    lineHeight: 1.6,
    color: colors.muted,
    margin: 0,
    maxWidth: "650px",
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px 14px",
    border: `1px solid ${colors.border}`,
    borderRadius: "8px",
    background: colors.surface,
    color: colors.text,
    fontSize: "13px",
    fontWeight: 650,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  primaryButton: {
    background: colors.primary,
    color: "#ffffff",
    border: `1px solid ${colors.primary}`,
  },
  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
    gap: "14px",
    marginBottom: "22px",
  },
  metric: {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: "12px",
    padding: "18px",
  },
  metricLabel: {
    fontSize: "12px",
    color: colors.muted,
    marginBottom: "12px",
  },
  metricValue: {
    fontSize: "27px",
    fontWeight: 750,
    letterSpacing: "-0.5px",
  },
  metricFooter: {
    fontSize: "11px",
    color: colors.muted,
    marginTop: "8px",
  },
  panel: {
    border: `1px solid ${colors.border}`,
    borderRadius: "12px",
    background: colors.surface,
    overflow: "hidden",
  },
  toolbar: {
    padding: "18px",
    borderBottom: `1px solid ${colors.border}`,
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  searchWrap: {
    position: "relative",
    flex: "1 1 220px",
    minWidth: "180px",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#98a2b3",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    border: `1px solid ${colors.border}`,
    borderRadius: "8px",
    background: "#ffffff",
    color: colors.text,
    fontSize: "13px",
    outlineColor: colors.primary,
  },
  searchInput: {
    paddingLeft: "36px",
  },
  select: {
    padding: "10px 32px 10px 12px",
    border: `1px solid ${colors.border}`,
    borderRadius: "8px",
    background: "#ffffff",
    color: colors.text,
    fontSize: "12px",
    cursor: "pointer",
    maxWidth: "100%",
  },
  tableScroll: {
    overflowX: "auto",
    width: "100%",
  },
  table: {
    width: "100%",
    minWidth: "1050px",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    padding: "13px 16px",
    background: "#f9fafb",
    color: "#667085",
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    borderBottom: `1px solid ${colors.border}`,
    whiteSpace: "nowrap",
  },
  td: {
    padding: "15px 16px",
    borderBottom: `1px solid #eef0f3`,
    fontSize: "12px",
    verticalAlign: "middle",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "5px 8px",
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  iconButton: {
    width: "32px",
    height: "32px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: `1px solid ${colors.border}`,
    background: "#ffffff",
    borderRadius: "7px",
    cursor: "pointer",
    color: "#475467",
  },
  footer: {
    padding: "14px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "10px",
    fontSize: "12px",
    color: colors.muted,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(16, 24, 40, 0.45)",
    display: "flex",
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  drawer: {
    width: "min(480px, 100%)",
    height: "100%",
    overflowY: "auto",
    background: "#ffffff",
    boxShadow: "-8px 0 30px rgba(0,0,0,0.08)",
    padding: "24px",
    boxSizing: "border-box",
  },
  drawerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    paddingBottom: "18px",
    borderBottom: `1px solid ${colors.border}`,
    marginBottom: "20px",
  },
  fieldLabel: {
    display: "block",
    fontSize: "12px",
    fontWeight: 650,
    marginBottom: "7px",
    color: "#344054",
  },
  field: {
    marginBottom: "17px",
  },
  notice: {
    border: "1px solid #fedf89",
    background: "#fffaeb",
    color: "#93370d",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "12px",
    lineHeight: 1.6,
    marginBottom: "18px",
  },
};

function StatusBadge({ status }: { status: PermissionStatus }) {
  const config = {
    Active: {
      color: colors.green,
      background: "#ecfdf3",
    },
    Restricted: {
      color: colors.red,
      background: "#fef3f2",
    },
    "Review Required": {
      color: colors.amber,
      background: "#fffaeb",
    },
  }[status];

  return (
    <span
      style={{
        ...styles.badge,
        color: config.color,
        background: config.background,
      }}
    >
      {status === "Active" ? (
        <Check size={12} />
      ) : status === "Restricted" ? (
        <LockKeyhole size={12} />
      ) : (
        <ShieldAlert size={12} />
      )}
      {status}
    </span>
  );
}

function MetricCard({
  label,
  value,
  footer,
  icon,
  iconColor,
}: {
  label: string;
  value: number;
  footer: string;
  icon: React.ReactNode;
  iconColor: string;
}) {
  return (
    <div style={styles.metric}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <span style={styles.metricLabel}>{label}</span>
        <span
          style={{
            display: "inline-flex",
            padding: "8px",
            borderRadius: "8px",
            background: `${iconColor}12`,
            color: iconColor,
          }}
        >
          {icon}
        </span>
      </div>
      <div style={styles.metricValue}>{value}</div>
      <div style={styles.metricFooter}>{footer}</div>
    </div>
  );
}

export default function AllPermissionsPage() {
  const [permissions, setPermissions] =
    useState<Permission[]>(initialPermissions);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [scopeFilter, setScopeFilter] = useState("All");
  const [resourceFilter, setResourceFilter] = useState("All");
  const [actionFilter, setActionFilter] = useState("All");
  const [sensitiveOnly, setSensitiveOnly] = useState(false);

  const [selectedPermission, setSelectedPermission] =
    useState<Permission | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(blankForm);
  const [formError, setFormError] = useState("");

  const filteredPermissions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return permissions.filter((permission) => {
      const matchesSearch =
        !query ||
        [
          permission.id,
          permission.name,
          permission.resource,
          permission.action,
          permission.description,
          permission.roles.join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        permission.status === statusFilter;

      const matchesScope =
        scopeFilter === "All" ||
        permission.scope === scopeFilter;

      const matchesResource =
        resourceFilter === "All" ||
        permission.resource === resourceFilter;

      const matchesAction =
        actionFilter === "All" ||
        permission.action === actionFilter;

      const matchesSensitive =
        !sensitiveOnly || permission.sensitive;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesScope &&
        matchesResource &&
        matchesAction &&
        matchesSensitive
      );
    });
  }, [
    permissions,
    search,
    statusFilter,
    scopeFilter,
    resourceFilter,
    actionFilter,
    sensitiveOnly,
  ]);

  const activeCount = permissions.filter(
    (permission) => permission.status === "Active"
  ).length;

  const sensitiveCount = permissions.filter(
    (permission) => permission.sensitive
  ).length;

  const reviewCount = permissions.filter(
    (permission) => permission.status === "Review Required"
  ).length;

  function openCreateForm() {
    setEditingId(null);
    setForm({ ...blankForm });
    setFormError("");
    setShowForm(true);
  }

  function openEditForm(permission: Permission) {
    setEditingId(permission.id);
    setForm({
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      scope: permission.scope,
      status: permission.status,
      description: permission.description,
      sensitive: permission.sensitive,
      roles: [...permission.roles],
    });
    setFormError("");
    setSelectedPermission(null);
    setShowForm(true);
  }

  function savePermission(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Enter a permission name.");
      return;
    }

    if (form.roles.length === 0) {
      setFormError("Assign at least one role.");
      return;
    }

    const duplicate = permissions.some(
      (permission) =>
        permission.name.toLowerCase() === form.name.trim().toLowerCase() &&
        permission.id !== editingId
    );

    if (duplicate) {
      setFormError("A permission with this name already exists.");
      return;
    }

    const updatedAt = new Date().toISOString().slice(0, 10);

    if (editingId) {
      setPermissions((current) =>
        current.map((permission) =>
          permission.id === editingId
            ? {
                ...permission,
                ...form,
                name: form.name.trim(),
                description: form.description.trim(),
                roles: [...form.roles],
                updatedAt,
              }
            : permission
        )
      );
    } else {
      const nextNumber =
        Math.max(
          1000,
          ...permissions.map((permission) => {
            const number = Number(permission.id.replace("PERM-", ""));
            return Number.isFinite(number) ? number : 1000;
          })
        ) + 1;

      const newPermission: Permission = {
        id: `PERM-${nextNumber}`,
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        roles: [...form.roles],
        updatedAt,
      };

      setPermissions((current) => [newPermission, ...current]);
    }

    setShowForm(false);
    setEditingId(null);
  }

  function exportCsv() {
    const headers = [
      "Permission ID",
      "Permission Name",
      "Resource",
      "Action",
      "Scope",
      "Status",
      "Sensitive",
      "Roles",
      "Description",
      "Updated At",
    ];

    const escapeCsv = (value: string) =>
      `"${value.replace(/"/g, '""')}"`;

    const rows = filteredPermissions.map((permission) => [
      permission.id,
      permission.name,
      permission.resource,
      permission.action,
      permission.scope,
      permission.status,
      permission.sensitive ? "Yes" : "No",
      permission.roles.join("; "),
      permission.description,
      permission.updatedAt,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => escapeCsv(String(value))).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "modelnow-permissions.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("All");
    setScopeFilter("All");
    setResourceFilter("All");
    setActionFilter("All");
    setSensitiveOnly(false);
  }

  function toggleRole(role: string) {
    setForm((current) => ({
      ...current,
      roles: current.roles.includes(role)
        ? current.roles.filter((item) => item !== role)
        : [...current.roles, role],
    }));
  }

  return (
    <main style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>Access Control / Permissions</div>
          <h1 style={styles.title}>All Permissions</h1>
          <p style={styles.subtitle}>
            Browse, search, and manage permission definitions across
            the ModelNow platform. Review resource access, actions,
            scopes, and assigned roles in one place.
          </p>
        </div>

        <div style={{ display: "flex", gap: "9px", flexWrap: "wrap" }}>
          <button style={styles.button} onClick={exportCsv}>
            <Download size={15} />
            Export CSV
          </button>
          <button
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={openCreateForm}
          >
            <Plus size={16} />
            Create Permission
          </button>
        </div>
      </div>

      <section style={styles.metrics}>
        <MetricCard
          label="Total Permissions"
          value={permissions.length}
          footer="Permission definitions"
          icon={<KeyRound size={18} />}
          iconColor={colors.primary}
        />
        <MetricCard
          label="Active Permissions"
          value={activeCount}
          footer="Currently marked active"
          icon={<ShieldCheck size={18} />}
          iconColor={colors.green}
        />
        <MetricCard
          label="Sensitive Permissions"
          value={sensitiveCount}
          footer="Require careful access control"
          icon={<LockKeyhole size={18} />}
          iconColor="#7f56d9"
        />
        <MetricCard
          label="Review Required"
          value={reviewCount}
          footer="Awaiting review"
          icon={<ShieldAlert size={18} />}
          iconColor={colors.amber}
        />
      </section>

      <section style={styles.panel}>
        <div style={styles.toolbar}>
          <div style={styles.searchWrap}>
            <Search size={16} style={styles.searchIcon} />
            <input
              style={{ ...styles.input, ...styles.searchInput }}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, ID, resource, or role..."
              aria-label="Search permissions"
            />
          </div>

          <select
            style={styles.select}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="All">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            style={styles.select}
            value={scopeFilter}
            onChange={(event) => setScopeFilter(event.target.value)}
            aria-label="Filter by scope"
          >
            <option value="All">All scopes</option>
            {scopeOptions.map((scope) => (
              <option key={scope} value={scope}>
                {scope}
              </option>
            ))}
          </select>

          <select
            style={styles.select}
            value={resourceFilter}
            onChange={(event) => setResourceFilter(event.target.value)}
            aria-label="Filter by resource"
          >
            <option value="All">All resources</option>
            {resourceOptions.map((resource) => (
              <option key={resource} value={resource}>
                {resource}
              </option>
            ))}
          </select>

          <select
            style={styles.select}
            value={actionFilter}
            onChange={(event) => setActionFilter(event.target.value)}
            aria-label="Filter by action"
          >
            <option value="All">All actions</option>
            {actionOptions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              color: "#475467",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={sensitiveOnly}
              onChange={(event) => setSensitiveOnly(event.target.checked)}
              style={{ accentColor: colors.primary }}
            />
            <LockKeyhole size={14} />
            Sensitive permissions only
          </label>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: colors.muted,
                fontSize: "11px",
              }}
            >
              <Filter size={13} />
              {filteredPermissions.length} matching permissions
            </span>
            <button
              style={{ ...styles.button, padding: "6px 9px", fontSize: "11px" }}
              onClick={resetFilters}
            >
              <RefreshCw size={12} />
              Reset filters
            </button>
          </div>
        </div>

        <div style={styles.tableScroll}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Permission</th>
                <th style={styles.th}>Resource / Action</th>
                <th style={styles.th}>Scope</th>
                <th style={styles.th}>Assigned Roles</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Last Updated</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredPermissions.map((permission) => (
                <tr key={permission.id}>
                  <td style={styles.td}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "34px",
                          height: "34px",
                          borderRadius: "9px",
                          background: "#eff4ff",
                          color: colors.primary,
                          flexShrink: 0,
                        }}
                      >
                        <KeyRound size={16} />
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "12px",
                            marginBottom: "5px",
                          }}
                        >
                          {permission.name}
                        </div>
                        <div
                          style={{
                            fontSize: "10px",
                            color: colors.muted,
                          }}
                        >
                          {permission.id}
                        </div>
                        {permission.sensitive && (
                          <div
                            style={{
                              marginTop: "7px",
                              color: "#6941c6",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "10px",
                            }}
                          >
                            <LockKeyhole size={11} />
                            Sensitive
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td style={styles.td}>
                    <div style={{ fontWeight: 650, marginBottom: "5px" }}>
                      {permission.resource}
                    </div>
                    <span style={{ color: colors.muted, fontSize: "11px" }}>
                      {permission.action}
                    </span>
                  </td>

                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        background: "#f2f4f7",
                        color: "#475467",
                      }}
                    >
                      {permission.scope}
                    </span>
                  </td>

                  <td style={styles.td}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                      {permission.roles.slice(0, 2).map((role) => (
                        <span
                          key={role}
                          style={{
                            padding: "4px 7px",
                            borderRadius: "5px",
                            border: `1px solid ${colors.border}`,
                            fontSize: "10px",
                            color: "#475467",
                          }}
                        >
                          {role}
                        </span>
                      ))}
                      {permission.roles.length > 2 && (
                        <span
                          style={{
                            padding: "4px 7px",
                            borderRadius: "5px",
                            background: "#f2f4f7",
                            fontSize: "10px",
                            color: "#475467",
                          }}
                        >
                          +{permission.roles.length - 2}
                        </span>
                      )}
                    </div>
                  </td>

                  <td style={styles.td}>
                    <StatusBadge status={permission.status} />
                  </td>

                  <td style={{ ...styles.td, whiteSpace: "nowrap" }}>
                    {permission.updatedAt}
                  </td>

                  <td style={{ ...styles.td, textAlign: "right" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "6px",
                      }}
                    >
                      <button
                        style={styles.iconButton}
                        title="View permission"
                        aria-label={`View ${permission.name}`}
                        onClick={() => setSelectedPermission(permission)}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        style={styles.iconButton}
                        title="Edit permission"
                        aria-label={`Edit ${permission.name}`}
                        onClick={() => openEditForm(permission)}
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredPermissions.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      ...styles.td,
                      padding: "55px 20px",
                      textAlign: "center",
                    }}
                  >
                    <Search
                      size={28}
                      style={{ color: "#98a2b3", marginBottom: "12px" }}
                    />
                    <div style={{ fontWeight: 700, marginBottom: "6px" }}>
                      No permissions found
                    </div>
                    <div style={{ color: colors.muted, marginBottom: "14px" }}>
                      Try another search term or reset your filters.
                    </div>
                    <button style={styles.button} onClick={resetFilters}>
                      <RefreshCw size={13} />
                      Reset filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={styles.footer}>
          <span>
            Showing {filteredPermissions.length} of {permissions.length} permissions
          </span>
          <span>Permission Registry · ModelNow</span>
        </div>
      </section>

      <div
        style={{
          marginTop: "16px",
          display: "flex",
          gap: "10px",
          alignItems: "flex-start",
          border: "1px solid #d1e0ff",
          borderRadius: "10px",
          background: "#eff4ff",
          padding: "14px",
          color: "#3538cd",
          fontSize: "12px",
          lineHeight: 1.6,
        }}
      >
        <ShieldCheck size={17} style={{ flexShrink: 0, marginTop: "1px" }} />
        <div>
          <strong>Access control reminder</strong>
          <div>
            This page currently uses local demo data. In production, permission
            checks must be enforced by the backend for every protected operation.
            Hiding or displaying a UI control is not an authorization boundary.
          </div>
        </div>
      </div>

      {selectedPermission && (
        <div
          style={styles.overlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedPermission(null);
            }
          }}
        >
          <aside style={styles.drawer}>
            <div style={styles.drawerHeader}>
              <div>
                <div style={styles.eyebrow}>Permission Details</div>
                <h2 style={{ margin: 0, fontSize: "21px" }}>
                  {selectedPermission.name}
                </h2>
                <div
                  style={{
                    color: colors.muted,
                    fontSize: "12px",
                    marginTop: "7px",
                  }}
                >
                  {selectedPermission.id}
                </div>
              </div>
              <button
                style={styles.iconButton}
                onClick={() => setSelectedPermission(null)}
                aria-label="Close permission details"
              >
                <X size={17} />
              </button>
            </div>

            <div style={{ marginBottom: "22px" }}>
              <StatusBadge status={selectedPermission.status} />
            </div>

            <div style={styles.field}>
              <div style={styles.fieldLabel}>Description</div>
              <p
                style={{
                  fontSize: "13px",
                  color: "#475467",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {selectedPermission.description || "No description provided."}
              </p>
            </div>

            {[
              ["Resource", selectedPermission.resource],
              ["Action", selectedPermission.action],
              ["Scope", selectedPermission.scope],
              ["Last Updated", selectedPermission.updatedAt],
              ["Sensitive", selectedPermission.sensitive ? "Yes" : "No"],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "13px 0",
                  borderBottom: `1px solid ${colors.border}`,
                  fontSize: "12px",
                }}
              >
                <span style={{ color: colors.muted }}>{label}</span>
                <strong style={{ textAlign: "right" }}>{value}</strong>
              </div>
            ))}

            <div style={{ ...styles.field, marginTop: "22px" }}>
              <div style={styles.fieldLabel}>Assigned Roles</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                {selectedPermission.roles.map((role) => (
                  <span
                    key={role}
                    style={{
                      border: `1px solid ${colors.border}`,
                      background: "#f9fafb",
                      borderRadius: "7px",
                      padding: "7px 9px",
                      fontSize: "12px",
                    }}
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <button
              style={{ ...styles.button, ...styles.primaryButton, width: "100%" }}
              onClick={() => openEditForm(selectedPermission)}
            >
              <Pencil size={14} />
              Edit Permission
            </button>
          </aside>
        </div>
      )}

      {showForm && (
        <div
          style={styles.overlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
              setFormError("");
            }
          }}
        >
          <aside style={styles.drawer}>
            <div style={styles.drawerHeader}>
              <div>
                <div style={styles.eyebrow}>Permission Registry</div>
                <h2 style={{ margin: 0, fontSize: "21px" }}>
                  {editingId ? "Edit Permission" : "Create Permission"}
                </h2>
                <p
                  style={{
                    margin: "7px 0 0",
                    color: colors.muted,
                    fontSize: "12px",
                    lineHeight: 1.5,
                  }}
                >
                  Define the resource, action, scope, and roles for this permission.
                </p>
              </div>
              <button
                style={styles.iconButton}
                onClick={() => setShowForm(false)}
                aria-label="Close permission form"
              >
                <X size={17} />
              </button>
            </div>

            {formError && (
              <div
                role="alert"
                style={{
                  padding: "11px",
                  background: "#fef3f2",
                  color: colors.red,
                  borderRadius: "8px",
                  fontSize: "12px",
                  marginBottom: "16px",
                }}
              >
                {formError}
              </div>
            )}

            <form onSubmit={savePermission}>
              <div style={styles.field}>
                <label style={styles.fieldLabel} htmlFor="permission-name">
                  Permission Name *
                </label>
                <input
                  id="permission-name"
                  style={styles.input}
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="e.g. Manage Users"
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel} htmlFor="permission-description">
                  Description
                </label>
                <textarea
                  id="permission-description"
                  style={{ ...styles.input, minHeight: "80px", resize: "vertical" }}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Explain what this permission allows."
                />
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel} htmlFor="permission-resource">
                  Resource *
                </label>
                <select
                  id="permission-resource"
                  style={{ ...styles.input, cursor: "pointer" }}
                  value={form.resource}
                  onChange={(event) =>
                    setForm({ ...form, resource: event.target.value })
                  }
                >
                  {resourceOptions.map((resource) => (
                    <option key={resource} value={resource}>
                      {resource}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel} htmlFor="permission-action">
                  Action *
                </label>
                <select
                  id="permission-action"
                  style={{ ...styles.input, cursor: "pointer" }}
                  value={form.action}
                  onChange={(event) =>
                    setForm({ ...form, action: event.target.value })
                  }
                >
                  {actionOptions.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel} htmlFor="permission-scope">
                  Scope *
                </label>
                <select
                  id="permission-scope"
                  style={{ ...styles.input, cursor: "pointer" }}
                  value={form.scope}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      scope: event.target.value as PermissionScope,
                    })
                  }
                >
                  {scopeOptions.map((scope) => (
                    <option key={scope} value={scope}>
                      {scope}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.fieldLabel} htmlFor="permission-status">
                  Status *
                </label>
                <select
                  id="permission-status"
                  style={{ ...styles.input, cursor: "pointer" }}
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status: event.target.value as PermissionStatus,
                    })
                  }
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <div style={styles.fieldLabel}>Assigned Roles *</div>
                <div
                  style={{
                    border: `1px solid ${colors.border}`,
                    borderRadius: "8px",
                    padding: "8px 12px",
                  }}
                >
                  {availableRoles.map((role) => (
                    <label
                      key={role}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "9px",
                        padding: "9px 0",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={form.roles.includes(role)}
                        onChange={() => toggleRole(role)}
                        style={{ accentColor: colors.primary }}
                      />
                      {role}
                    </label>
                  ))}
                </div>
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "9px",
                  fontSize: "12px",
                  lineHeight: 1.6,
                  marginBottom: "20px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.sensitive}
                  onChange={(event) =>
                    setForm({ ...form, sensitive: event.target.checked })
                  }
                  style={{ accentColor: colors.primary, marginTop: "3px" }}
                />
                Mark as sensitive permission. This is a UI classification, not
                a substitute for server-side access enforcement.
              </label>

              <div style={{ display: "flex", gap: "9px" }}>
                <button
                  type="button"
                  style={{ ...styles.button, flex: 1 }}
                  onClick={() => {
                    setShowForm(false);
                    setFormError("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    ...styles.button,
                    ...styles.primaryButton,
                    flex: 1,
                  }}
                >
                  <Check size={15} />
                  {editingId ? "Save Changes" : "Create Permission"}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </main>
  );
}
