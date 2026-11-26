
"use client";

import { useMemo, useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  LockKeyhole,
  ClipboardCheck,
  Search,
  Plus,
  X,
  Eye,
  Pencil,
  Check,
  ChevronDown,
  RefreshCw,
  KeyRound,
  Users,
  Building2,
  Layers3,
  FileText,
  CreditCard,
  Cpu,
  Settings2,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Filter,
  History,
  Ban,
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

type PermissionForm = {
  name: string;
  resource: string;
  action: string;
  scope: PermissionScope;
  status: PermissionStatus;
  description: string;
  sensitive: boolean;
  roles: string[];
};

const initialPermissions: Permission[] = [
  {
    id: "PERM-1001",
    name: "Manage Users",
    resource: "Users",
    action: "Create, Read, Update, Delete",
    scope: "Global",
    status: "Active",
    description: "Manage platform user accounts, profiles, and access assignments.",
    sensitive: true,
    roles: ["Super Admin", "User Administrator"],
    updatedAt: "Oct 28, 2026",
  },
  {
    id: "PERM-1002",
    name: "Manage Organizations",
    resource: "Organizations",
    action: "Create, Read, Update, Delete",
    scope: "Global",
    status: "Active",
    description: "Create and administer organizations across the ModelNow platform.",
    sensitive: true,
    roles: ["Super Admin", "Organization Admin"],
    updatedAt: "Oct 27, 2026",
  },
  {
    id: "PERM-1003",
    name: "Manage Workspaces",
    resource: "Workspaces",
    action: "Create, Read, Update, Delete",
    scope: "Organization",
    status: "Active",
    description: "Manage workspace settings, members, and workspace resources.",
    sensitive: false,
    roles: ["Super Admin", "Organization Admin", "Workspace Admin"],
    updatedAt: "Oct 27, 2026",
  },
  {
    id: "PERM-1004",
    name: "View Audit Logs",
    resource: "Audit",
    action: "Read",
    scope: "Global",
    status: "Active",
    description: "Read administrative activity, access events, and audit records.",
    sensitive: true,
    roles: ["Super Admin", "Security Auditor"],
    updatedAt: "Oct 26, 2026",
  },
  {
    id: "PERM-1005",
    name: "Manage Billing",
    resource: "Billing",
    action: "Read, Update",
    scope: "Organization",
    status: "Restricted",
    description: "Access billing records and update organization billing settings.",
    sensitive: true,
    roles: ["Super Admin", "Billing Admin"],
    updatedAt: "Oct 25, 2026",
  },
  {
    id: "PERM-1006",
    name: "Manage AI Models",
    resource: "Models",
    action: "Read, Update",
    scope: "Workspace",
    status: "Review Required",
    description: "Configure available AI models and workspace model settings.",
    sensitive: true,
    roles: ["Super Admin", "Workspace Admin"],
    updatedAt: "Oct 24, 2026",
  },
  {
    id: "PERM-1007",
    name: "Manage API Keys",
    resource: "API Keys",
    action: "Create, Read, Revoke",
    scope: "Workspace",
    status: "Active",
    description: "Create, inspect, and revoke workspace API credentials.",
    sensitive: true,
    roles: ["Super Admin", "Workspace Admin"],
    updatedAt: "Oct 23, 2026",
  },
  {
    id: "PERM-1008",
    name: "Manage Integrations",
    resource: "Integrations",
    action: "Read, Update",
    scope: "Workspace",
    status: "Active",
    description: "Configure connected applications and integration settings.",
    sensitive: false,
    roles: ["Super Admin", "Workspace Admin"],
    updatedAt: "Oct 22, 2026",
  },
  {
    id: "PERM-1009",
    name: "Manage Platform Settings",
    resource: "Platform",
    action: "Read, Update",
    scope: "Global",
    status: "Restricted",
    description: "Change global platform settings and operational configuration.",
    sensitive: true,
    roles: ["Super Admin"],
    updatedAt: "Oct 21, 2026",
  },
  {
    id: "PERM-1010",
    name: "View Usage Analytics",
    resource: "Analytics",
    action: "Read",
    scope: "Organization",
    status: "Active",
    description: "View organization usage, model consumption, and cost analytics.",
    sensitive: false,
    roles: ["Super Admin", "Organization Admin", "Analyst"],
    updatedAt: "Oct 20, 2026",
  },
  {
    id: "PERM-1011",
    name: "Manage Agents",
    resource: "Agents",
    action: "Create, Read, Update, Delete",
    scope: "Workspace",
    status: "Review Required",
    description: "Create and manage AI agents and their execution settings.",
    sensitive: false,
    roles: ["Super Admin", "Workspace Admin"],
    updatedAt: "Oct 19, 2026",
  },
  {
    id: "PERM-1012",
    name: "Manage Security Policies",
    resource: "Security",
    action: "Read, Update",
    scope: "Global",
    status: "Active",
    description: "Review and configure security and access-control policies.",
    sensitive: true,
    roles: ["Super Admin", "Security Administrator"],
    updatedAt: "Oct 18, 2026",
  },
];

const emptyForm: PermissionForm = {
  name: "",
  resource: "Users",
  action: "Read",
  scope: "Workspace",
  status: "Active",
  description: "",
  sensitive: false,
  roles: [],
};

const availableRoles = [
  "Super Admin",
  "Organization Admin",
  "Workspace Admin",
  "User Administrator",
  "Security Administrator",
  "Security Auditor",
  "Billing Admin",
  "Analyst",
];

const resourceOptions = [
  "Users",
  "Organizations",
  "Workspaces",
  "Billing",
  "Models",
  "Audit",
  "API Keys",
  "Integrations",
  "Platform",
  "Analytics",
  "Agents",
  "Security",
  "Settings",
];

const actionOptions = [
  "Read",
  "Create, Read",
  "Read, Update",
  "Create, Read, Update",
  "Create, Read, Update, Delete",
  "Create, Read, Revoke",
  "Read, Update, Delete",
];

const styles = {
  page: {
    color: "#172033",
    fontFamily: "inherit",
    padding: "28px",
    maxWidth: "1600px",
    margin: "0 auto",
  } as React.CSSProperties,
  muted: {
    color: "#64748b",
    fontSize: "13px",
  } as React.CSSProperties,
  panel: {
    background: "#ffffff",
    border: "1px solid #e5eaf1",
    borderRadius: "14px",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.025)",
  } as React.CSSProperties,
  button: {
    border: "1px solid #dce3ed",
    borderRadius: "9px",
    padding: "9px 12px",
    background: "#ffffff",
    color: "#334155",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    fontSize: "13px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  } as React.CSSProperties,
  primaryButton: {
    border: "1px solid #315fea",
    borderRadius: "9px",
    padding: "10px 14px",
    background: "#315fea",
    color: "#ffffff",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  } as React.CSSProperties,
  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #dce3ed",
    borderRadius: "8px",
    padding: "10px 11px",
    fontSize: "13px",
    color: "#172033",
    background: "#ffffff",
    outline: "none",
  } as React.CSSProperties,
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: "#475569",
    marginBottom: "7px",
  } as React.CSSProperties,
};

function ResourceIcon({ resource }: { resource: string }) {
  const iconProps = { size: 17, strokeWidth: 1.8 };

  switch (resource) {
    case "Users":
      return <Users {...iconProps} />;
    case "Organizations":
      return <Building2 {...iconProps} />;
    case "Workspaces":
      return <Layers3 {...iconProps} />;
    case "Billing":
      return <CreditCard {...iconProps} />;
    case "Models":
    case "Agents":
      return <Cpu {...iconProps} />;
    case "Audit":
      return <History {...iconProps} />;
    case "Security":
    case "API Keys":
      return <LockKeyhole {...iconProps} />;
    case "Analytics":
      return <ClipboardCheck {...iconProps} />;
    default:
      return <Settings2 {...iconProps} />;
  }
}

function StatusBadge({ status }: { status: PermissionStatus }) {
  const colors: Record<
    PermissionStatus,
    { background: string; color: string; border: string }
  > = {
    Active: {
      background: "#ecfdf3",
      color: "#15803d",
      border: "#bbf7d0",
    },
    Restricted: {
      background: "#fff7ed",
      color: "#c2410c",
      border: "#fed7aa",
    },
    "Review Required": {
      background: "#fff7ed",
      color: "#b45309",
      border: "#fde68a",
    },
  };

  const color = colors[status];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        border: `1px solid ${color.border}`,
        background: color.background,
        color: color.color,
        padding: "4px 8px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: 650,
        whiteSpace: "nowrap",
      }}
    >
      {status === "Active" ? (
        <CheckCircle2 size={12} />
      ) : status === "Restricted" ? (
        <Ban size={12} />
      ) : (
        <Clock3 size={12} />
      )}
      {status}
    </span>
  );
}

export default function PermissionsPage() {
  const [permissions, setPermissions] =
    useState<Permission[]>(initialPermissions);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [scopeFilter, setScopeFilter] = useState("All");
  const [resourceFilter, setResourceFilter] = useState("All");
  const [sensitiveOnly, setSensitiveOnly] = useState(false);

  const [selectedPermission, setSelectedPermission] =
    useState<Permission | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PermissionForm>(emptyForm);
  const [notice, setNotice] = useState("");

  const metrics = useMemo(() => {
    const active = permissions.filter(
      (permission) => permission.status === "Active",
    ).length;

    const restricted = permissions.filter(
      (permission) => permission.status === "Restricted",
    ).length;

    const review = permissions.filter(
      (permission) => permission.status === "Review Required",
    ).length;

    const sensitive = permissions.filter(
      (permission) => permission.sensitive,
    ).length;

    return [
      {
        title: "Total Permissions",
        value: permissions.length.toString(),
        description: "Permission definitions in this directory",
        icon: ShieldCheck,
        color: "#315fea",
        background: "#eff6ff",
      },
      {
        title: "Active Permissions",
        value: active.toString(),
        description: "Currently marked active",
        icon: CheckCircle2,
        color: "#15803d",
        background: "#ecfdf3",
      },
      {
        title: "Sensitive Permissions",
        value: sensitive.toString(),
        description: "Permissions requiring extra care",
        icon: LockKeyhole,
        color: "#b45309",
        background: "#fff7ed",
      },
      {
        title: "Pending Reviews",
        value: review.toString(),
        description: "Permissions awaiting review",
        icon: ClipboardCheck,
        color: "#7c3aed",
        background: "#f5f3ff",
      },
      {
        title: "Restricted",
        value: restricted.toString(),
        description: "Permissions with restricted status",
        icon: ShieldAlert,
        color: "#c2410c",
        background: "#fff7ed",
      },
    ];
  }, [permissions]);

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
          permission.scope,
          permission.description,
          ...permission.roles,
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

      const matchesSensitive =
        !sensitiveOnly || permission.sensitive;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesScope &&
        matchesResource &&
        matchesSensitive
      );
    });
  }, [
    permissions,
    search,
    statusFilter,
    scopeFilter,
    resourceFilter,
    sensitiveOnly,
  ]);

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setNotice("");
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
    setSelectedPermission(null);
    setShowForm(true);
    setNotice("");
  }

  function toggleRole(role: string) {
    setForm((current) => ({
      ...current,
      roles: current.roles.includes(role)
        ? current.roles.filter((item) => item !== role)
        : [...current.roles, role],
    }));
  }

  function savePermission(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim() || !form.description.trim()) {
      setNotice("Enter a permission name and description.");
      return;
    }

    if (form.roles.length === 0) {
      setNotice("Assign at least one role to this permission.");
      return;
    }

    if (editingId) {
      setPermissions((current) =>
        current.map((permission) =>
          permission.id === editingId
            ? {
                ...permission,
                ...form,
                name: form.name.trim(),
                description: form.description.trim(),
                updatedAt: "Just now",
              }
            : permission,
        ),
      );

      setNotice("Permission updated successfully.");
    } else {
      const nextNumber =
        Math.max(
          1000,
          ...permissions.map((permission) => {
            const number = Number(permission.id.replace("PERM-", ""));
            return Number.isFinite(number) ? number : 1000;
          }),
        ) + 1;

      const newPermission: Permission = {
        ...form,
        id: `PERM-${nextNumber}`,
        name: form.name.trim(),
        description: form.description.trim(),
        updatedAt: "Just now",
      };

      setPermissions((current) => [newPermission, ...current]);
      setNotice("Permission created successfully.");
    }

    setShowForm(false);
    setEditingId(null);
  }

  function changeStatus(
    permission: Permission,
    status: PermissionStatus,
  ) {
    setPermissions((current) =>
      current.map((item) =>
        item.id === permission.id
          ? { ...item, status, updatedAt: "Just now" }
          : item,
      ),
    );

    setSelectedPermission((current) =>
      current?.id === permission.id
        ? { ...current, status, updatedAt: "Just now" }
        : current,
    );

    setNotice(`${permission.name} marked ${status.toLowerCase()}.`);
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("All");
    setScopeFilter("All");
    setResourceFilter("All");
    setSensitiveOnly(false);
  }

  return (
    <main style={styles.page}>
      <header
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "18px",
          flexWrap: "wrap",
          marginBottom: "25px",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "37px",
                height: "37px",
                borderRadius: "10px",
                background: "#eff6ff",
                color: "#315fea",
                display: "grid",
                placeItems: "center",
              }}
            >
              <ShieldCheck size={21} />
            </div>
            <h1
              style={{
                fontSize: "25px",
                letterSpacing: "-0.7px",
                fontWeight: 750,
                margin: 0,
              }}
            >
              Permissions &amp; Access Control
            </h1>
          </div>

          <p
            style={{
              margin: "0 0 0 46px",
              maxWidth: "800px",
              lineHeight: 1.7,
              color: "#64748b",
              fontSize: "13px",
            }}
          >
            Manage permission definitions, role assignments, privileged access,
            and authorization policies across the ModelNow platform.
          </p>
        </div>

        <div style={{ display: "flex", gap: "9px", flexWrap: "wrap" }}>
          <button
            type="button"
            style={styles.button}
            onClick={resetFilters}
          >
            <RefreshCw size={15} />
            Reset filters
          </button>

          <button
            type="button"
            style={styles.primaryButton}
            onClick={openCreateForm}
          >
            <Plus size={16} />
            Create permission
          </button>
        </div>
      </header>

      {notice && (
        <div
          role="status"
          style={{
            marginBottom: "18px",
            padding: "11px 13px",
            borderRadius: "9px",
            border: "1px solid #bbf7d0",
            background: "#f0fdf4",
            color: "#166534",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
            style={{
              border: 0,
              background: "transparent",
              color: "inherit",
              cursor: "pointer",
              display: "flex",
            }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      <section
        aria-label="Permission metrics"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))",
          gap: "14px",
          marginBottom: "24px",
        }}
      >
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article
              key={metric.title}
              style={{
                ...styles.panel,
                padding: "17px",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "16px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#64748b",
                  }}
                >
                  {metric.title}
                </span>

                <span
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "9px",
                    display: "grid",
                    placeItems: "center",
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
                  fontSize: "29px",
                  lineHeight: 1.15,
                  fontWeight: 750,
                  letterSpacing: "-0.8px",
                  color: "#172033",
                }}
              >
                {metric.value}
              </div>

              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "11px",
                  lineHeight: 1.5,
                  color: "#8490a2",
                }}
              >
                {metric.description}
              </p>
            </article>
          );
        })}
      </section>

      <section
        style={{
          ...styles.panel,
          padding: "20px",
          marginBottom: "22px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "18px",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: 750,
                margin: "0 0 6px",
              }}
            >
              Permission Directory
            </h2>
            <p style={{ ...styles.muted, margin: 0 }}>
              Search permissions and review their access scopes and assigned roles.
            </p>
          </div>

          <span
            style={{
              padding: "6px 9px",
              borderRadius: "7px",
              background: "#f1f5f9",
              color: "#475569",
              fontSize: "12px",
              fontWeight: 650,
            }}
          >
            {filteredPermissions.length} of {permissions.length} permissions
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
            gap: "10px",
            marginBottom: "15px",
          }}
        >
          <div style={{ position: "relative" }}>
            <Search
              size={16}
              color="#94a3b8"
              style={{
                position: "absolute",
                left: "11px",
                top: "11px",
              }}
            />
            <input
              aria-label="Search permissions"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search permissions..."
              style={{ ...styles.input, paddingLeft: "35px" }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <Filter
              size={15}
              color="#94a3b8"
              style={{
                position: "absolute",
                left: "10px",
                top: "11px",
                pointerEvents: "none",
              }}
            />
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              style={{
                ...styles.input,
                paddingLeft: "31px",
                appearance: "none",
              }}
            >
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Restricted">Restricted</option>
              <option value="Review Required">Review required</option>
            </select>
            <ChevronDown
              size={14}
              color="#94a3b8"
              style={{
                position: "absolute",
                right: "10px",
                top: "12px",
                pointerEvents: "none",
              }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <select
              aria-label="Filter by scope"
              value={scopeFilter}
              onChange={(event) => setScopeFilter(event.target.value)}
              style={{ ...styles.input, appearance: "none" }}
            >
              <option value="All">All scopes</option>
              <option value="Global">Global</option>
              <option value="Organization">Organization</option>
              <option value="Workspace">Workspace</option>
            </select>
            <ChevronDown
              size={14}
              color="#94a3b8"
              style={{
                position: "absolute",
                right: "10px",
                top: "12px",
                pointerEvents: "none",
              }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <select
              aria-label="Filter by resource"
              value={resourceFilter}
              onChange={(event) => setResourceFilter(event.target.value)}
              style={{ ...styles.input, appearance: "none" }}
            >
              <option value="All">All resources</option>
              {resourceOptions.map((resource) => (
                <option key={resource} value={resource}>
                  {resource}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              color="#94a3b8"
              style={{
                position: "absolute",
                right: "10px",
                top: "12px",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            fontSize: "12px",
            color: "#475569",
            marginBottom: "16px",
          }}
        >
          <input
            type="checkbox"
            checked={sensitiveOnly}
            onChange={(event) => setSensitiveOnly(event.target.checked)}
          />
          Show sensitive permissions only
          <LockKeyhole size={14} color="#b45309" />
        </label>

        <div style={{ overflowX: "auto", width: "100%" }}>
          <table
            style={{
              width: "100%",
              minWidth: "980px",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {[
                  "Permission",
                  "Resource",
                  "Actions",
                  "Scope",
                  "Assigned roles",
                  "Status",
                  "Manage",
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      padding: "12px 13px",
                      fontSize: "10px",
                      letterSpacing: "0.6px",
                      textTransform: "uppercase",
                      color: "#64748b",
                      fontWeight: 700,
                      borderTop: "1px solid #edf0f5",
                      borderBottom: "1px solid #edf0f5",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredPermissions.map((permission) => (
                <tr
                  key={permission.id}
                  style={{ borderBottom: "1px solid #edf0f5" }}
                >
                  <td style={{ padding: "14px 13px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "8px",
                          background: "#f1f5f9",
                          color: "#475569",
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        <ResourceIcon resource={permission.resource} />
                      </div>

                      <div>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#172033",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            flexWrap: "wrap",
                          }}
                        >
                          {permission.name}
                          {permission.sensitive && (
                            <LockKeyhole
                              size={12}
                              color="#b45309"
                              aria-label="Sensitive permission"
                            />
                          )}
                        </div>

                        <div
                          style={{
                            marginTop: "5px",
                            color: "#94a3b8",
                            fontSize: "10px",
                          }}
                        >
                          {permission.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: "14px 13px" }}>
                    <span
                      style={{
                        background: "#f1f5f9",
                        color: "#475569",
                        padding: "5px 8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                      }}
                    >
                      {permission.resource}
                    </span>
                  </td>

                  <td
                    style={{
                      padding: "14px 13px",
                      maxWidth: "200px",
                      fontSize: "11px",
                      color: "#64748b",
                      lineHeight: 1.6,
                    }}
                  >
                    {permission.action}
                  </td>

                  <td style={{ padding: "14px 13px" }}>
                    <span style={{ fontSize: "11px", color: "#475569" }}>
                      {permission.scope}
                    </span>
                  </td>

                  <td style={{ padding: "14px 13px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {permission.roles.slice(0, 2).map((role) => (
                        <span
                          key={role}
                          style={{
                            fontSize: "10px",
                            color: "#475569",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "5px",
                            padding: "4px 6px",
                          }}
                        >
                          {role}
                        </span>
                      ))}
                      {permission.roles.length > 2 && (
                        <span
                          style={{
                            fontSize: "10px",
                            color: "#64748b",
                            padding: "4px",
                          }}
                        >
                          +{permission.roles.length - 2}
                        </span>
                      )}
                    </div>
                  </td>

                  <td style={{ padding: "14px 13px" }}>
                    <StatusBadge status={permission.status} />
                  </td>

                  <td style={{ padding: "14px 13px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        title="View permission details"
                        aria-label={`View ${permission.name}`}
                        onClick={() => setSelectedPermission(permission)}
                        style={{
                          ...styles.button,
                          padding: "7px",
                          borderRadius: "7px",
                        }}
                      >
                        <Eye size={14} />
                      </button>

                      <button
                        type="button"
                        title="Edit permission"
                        aria-label={`Edit ${permission.name}`}
                        onClick={() => openEditForm(permission)}
                        style={{
                          ...styles.button,
                          padding: "7px",
                          borderRadius: "7px",
                        }}
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
                      textAlign: "center",
                      padding: "45px 20px",
                      color: "#64748b",
                    }}
                  >
                    <Search
                      size={26}
                      style={{ margin: "0 auto 10px", opacity: 0.5 }}
                    />
                    <div style={{ fontSize: "13px", fontWeight: 650 }}>
                      No permissions found
                    </div>
                    <p style={{ fontSize: "12px" }}>
                      Try changing your search or filters.
                    </p>
                    <button
                      type="button"
                      style={styles.button}
                      onClick={resetFilters}
                    >
                      Reset filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section
        style={{
          ...styles.panel,
          padding: "20px",
          marginBottom: "22px",
        }}
      >
        <div style={{ marginBottom: "18px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 750, margin: "0 0 6px" }}>
            Access Control Capabilities
          </h2>
          <p style={{ ...styles.muted, margin: 0 }}>
            Core controls to support safer, least-privilege access management.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
          }}
        >
          {[
            {
              title: "Role-based access control",
              description: "Map permissions to platform and workspace roles.",
              icon: Users,
            },
            {
              title: "Fine-grained permissions",
              description: "Separate actions by resource and access scope.",
              icon: KeyRound,
            },
            {
              title: "Privileged access management",
              description: "Identify sensitive permissions for extra review.",
              icon: LockKeyhole,
            },
            {
              title: "Organization authorization",
              description: "Limit access to the correct organization boundary.",
              icon: Building2,
            },
            {
              title: "Workspace authorization",
              description: "Scope access to individual workspaces.",
              icon: Layers3,
            },
            {
              title: "Permission review workflows",
              description: "Flag access definitions that need review.",
              icon: ClipboardCheck,
            },
            {
              title: "Access approval and revocation",
              description: "Represent approved, restricted, and review states.",
              icon: ShieldAlert,
            },
            {
              title: "Permission audit history",
              description: "Display the last update recorded for each permission.",
              icon: FileText,
            },
          ].map((capability) => {
            const Icon = capability.icon;

            return (
              <article
                key={capability.title}
                style={{
                  border: "1px solid #e8edf4",
                  borderRadius: "10px",
                  padding: "14px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "11px",
                }}
              >
                <div
                  style={{
                    width: "33px",
                    height: "33px",
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "8px",
                    background: "#eff6ff",
                    color: "#315fea",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={17} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      marginBottom: "5px",
                    }}
                  >
                    {capability.title}
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "11px",
                      color: "#64748b",
                      lineHeight: 1.6,
                    }}
                  >
                    {capability.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "flex-start",
          padding: "13px 15px",
          border: "1px solid #fde68a",
          borderRadius: "10px",
          background: "#fffbeb",
          color: "#92400e",
          fontSize: "12px",
          lineHeight: 1.6,
        }}
      >
        <AlertTriangle size={17} style={{ flexShrink: 0, marginTop: "1px" }} />
        <div>
          <strong>Authorization integration required.</strong> This page manages
          local demo data only. Enforce permissions on the server and validate
          every protected API request. Hiding a UI control or changing a status
          in this page does not secure an endpoint.
        </div>
      </div>

      {showForm && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(15, 23, 42, 0.48)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            overflowY: "auto",
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="permission-form-title"
            style={{
              width: "100%",
              maxWidth: "680px",
              maxHeight: "92vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: "15px",
              padding: "24px",
              boxShadow: "0 25px 70px rgba(15, 23, 42, 0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "12px",
                marginBottom: "22px",
              }}
            >
              <div>
                <h2
                  id="permission-form-title"
                  style={{ margin: "0 0 6px", fontSize: "19px", fontWeight: 750 }}
                >
                  {editingId ? "Edit permission" : "Create permission"}
                </h2>
                <p style={{ ...styles.muted, margin: 0 }}>
                  Configure resource access, scope, status, and role assignments.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close form"
                onClick={() => setShowForm(false)}
                style={{ ...styles.button, padding: "7px" }}
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={savePermission}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "16px",
                }}
              >
                <div>
                  <label style={styles.label} htmlFor="permission-name">
                    Permission name *
                  </label>
                  <input
                    id="permission-name"
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    placeholder="e.g. Manage API Keys"
                    required
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label} htmlFor="permission-resource">
                    Resource *
                  </label>
                  <select
                    id="permission-resource"
                    value={form.resource}
                    onChange={(event) =>
                      setForm({ ...form, resource: event.target.value })
                    }
                    style={styles.input}
                  >
                    {resourceOptions.map((resource) => (
                      <option key={resource} value={resource}>
                        {resource}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={styles.label} htmlFor="permission-action">
                    Allowed actions *
                  </label>
                  <select
                    id="permission-action"
                    value={form.action}
                    onChange={(event) =>
                      setForm({ ...form, action: event.target.value })
                    }
                    style={styles.input}
                  >
                    {actionOptions.map((action) => (
                      <option key={action} value={action}>
                        {action}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={styles.label} htmlFor="permission-scope">
                    Access scope *
                  </label>
                  <select
                    id="permission-scope"
                    value={form.scope}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        scope: event.target.value as PermissionScope,
                      })
                    }
                    style={styles.input}
                  >
                    <option value="Global">Global</option>
                    <option value="Organization">Organization</option>
                    <option value="Workspace">Workspace</option>
                  </select>
                </div>

                <div>
                  <label style={styles.label} htmlFor="permission-status">
                    Status *
                  </label>
                  <select
                    id="permission-status"
                    value={form.status}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        status: event.target.value as PermissionStatus,
                      })
                    }
                    style={styles.input}
                  >
                    <option value="Active">Active</option>
                    <option value="Restricted">Restricted</option>
                    <option value="Review Required">Review Required</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: "16px" }}>
                <label style={styles.label} htmlFor="permission-description">
                  Description *
                </label>
                <textarea
                  id="permission-description"
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Explain what this permission allows."
                  required
                  rows={3}
                  style={{
                    ...styles.input,
                    resize: "vertical",
                    lineHeight: 1.6,
                  }}
                />
              </div>

              <div style={{ marginTop: "20px" }}>
                <div style={styles.label}>Assign roles *</div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                    gap: "9px",
                  }}
                >
                  {availableRoles.map((role) => {
                    const checked = form.roles.includes(role);

                    return (
                      <label
                        key={role}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "10px",
                          border: `1px solid ${checked ? "#93b4ff" : "#e2e8f0"}`,
                          background: checked ? "#eff6ff" : "#ffffff",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "12px",
                          color: "#334155",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleRole(role)}
                        />
                        {role}
                      </label>
                    );
                  })}
                </div>
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  marginTop: "18px",
                  padding: "12px",
                  background: "#fff7ed",
                  border: "1px solid #fed7aa",
                  borderRadius: "9px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.sensitive}
                  onChange={(event) =>
                    setForm({ ...form, sensitive: event.target.checked })
                  }
                  style={{ marginTop: "2px" }}
                />
                <span>
                  <strong
                    style={{
                      display: "block",
                      fontSize: "12px",
                      color: "#9a3412",
                    }}
                  >
                    Sensitive permission
                  </strong>
                  <span
                    style={{
                      display: "block",
                      marginTop: "4px",
                      fontSize: "11px",
                      color: "#9a3412",
                      lineHeight: 1.5,
                    }}
                  >
                    Mark this permission for additional security review. This
                    checkbox is a label in the demo, not an enforcement control.
                  </span>
                </span>
              </label>

              {notice && (
                <p
                  role="alert"
                  style={{
                    margin: "14px 0 0",
                    fontSize: "12px",
                    color: "#b91c1c",
                  }}
                >
                  {notice}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "9px",
                  marginTop: "24px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  style={styles.button}
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.primaryButton}>
                  <Check size={15} />
                  {editingId ? "Save changes" : "Create permission"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selectedPermission && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedPermission(null);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(15, 23, 42, 0.48)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="permission-details-title"
            style={{
              width: "100%",
              maxWidth: "470px",
              height: "100%",
              overflowY: "auto",
              background: "#ffffff",
              padding: "25px",
              boxSizing: "border-box",
              boxShadow: "-15px 0 50px rgba(15, 23, 42, 0.12)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "43px",
                    height: "43px",
                    borderRadius: "11px",
                    display: "grid",
                    placeItems: "center",
                    background: "#eff6ff",
                    color: "#315fea",
                  }}
                >
                  <ResourceIcon resource={selectedPermission.resource} />
                </div>

                <div>
                  <h2
                    id="permission-details-title"
                    style={{
                      margin: "0 0 5px",
                      fontSize: "18px",
                      fontWeight: 750,
                    }}
                  >
                    {selectedPermission.name}
                  </h2>
                  <p style={{ ...styles.muted, margin: 0 }}>
                    {selectedPermission.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-label="Close details"
                onClick={() => setSelectedPermission(null)}
                style={{ ...styles.button, padding: "7px" }}
              >
                <X size={17} />
              </button>
            </div>

            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginTop: "18px",
              }}
            >
              <StatusBadge status={selectedPermission.status} />
              <span
                style={{
                  padding: "4px 8px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  background: "#f1f5f9",
                  color: "#475569",
                }}
              >
                {selectedPermission.scope} scope
              </span>
              {selectedPermission.sensitive && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "4px 8px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    background: "#fff7ed",
                    color: "#b45309",
                  }}
                >
                  <LockKeyhole size={12} />
                  Sensitive
                </span>
              )}
            </div>

            <div
              style={{
                borderTop: "1px solid #e8edf4",
                marginTop: "24px",
                paddingTop: "20px",
              }}
            >
              <h3 style={{ margin: "0 0 10px", fontSize: "13px" }}>
                Description
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  lineHeight: 1.7,
                  color: "#64748b",
                  margin: 0,
                }}
              >
                {selectedPermission.description}
              </p>
            </div>

            <div
              style={{
                borderTop: "1px solid #e8edf4",
                marginTop: "22px",
                paddingTop: "20px",
              }}
            >
              <h3 style={{ margin: "0 0 12px", fontSize: "13px" }}>
                Permission configuration
              </h3>

              {[
                ["Resource", selectedPermission.resource],
                ["Allowed actions", selectedPermission.action],
                ["Access scope", selectedPermission.scope],
                ["Last updated", selectedPermission.updatedAt],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "15px",
                    padding: "11px 0",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#172033",
                      fontWeight: 600,
                      textAlign: "right",
                      maxWidth: "65%",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                borderTop: "1px solid #e8edf4",
                marginTop: "22px",
                paddingTop: "20px",
              }}
            >
              <h3 style={{ margin: "0 0 12px", fontSize: "13px" }}>
                Assigned roles
              </h3>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                {selectedPermission.roles.map((role) => (
                  <span
                    key={role}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                      color: "#475569",
                      borderRadius: "7px",
                      padding: "7px 9px",
                      fontSize: "12px",
                    }}
                  >
                    <Users size={13} />
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div
              style={{
                borderTop: "1px solid #e8edf4",
                marginTop: "22px",
                paddingTop: "20px",
              }}
            >
              <h3 style={{ margin: "0 0 12px", fontSize: "13px" }}>
                Review actions
              </h3>

              {selectedPermission.status !== "Active" && (
                <button
                  type="button"
                  onClick={() => changeStatus(selectedPermission, "Active")}
                  style={{
                    ...styles.button,
                    width: "100%",
                    justifyContent: "flex-start",
                    marginBottom: "9px",
                    color: "#15803d",
                    background: "#f0fdf4",
                  }}
                >
                  <CheckCircle2 size={15} />
                  Mark active
                </button>
              )}

              {selectedPermission.status !== "Review Required" && (
                <button
                  type="button"
                  onClick={() =>
                    changeStatus(selectedPermission, "Review Required")
                  }
                  style={{
                    ...styles.button,
                    width: "100%",
                    justifyContent: "flex-start",
                    marginBottom: "9px",
                  }}
                >
                  <Clock3 size={15} />
                  Mark review required
                </button>
              )}

              {selectedPermission.status !== "Restricted" && (
                <button
                  type="button"
                  onClick={() => changeStatus(selectedPermission, "Restricted")}
                  style={{
                    ...styles.button,
                    width: "100%",
                    justifyContent: "flex-start",
                    color: "#c2410c",
                    background: "#fff7ed",
                  }}
                >
                  <Ban size={15} />
                  Restrict permission
                </button>
              )}

              <button
                type="button"
                onClick={() => openEditForm(selectedPermission)}
                style={{
                  ...styles.primaryButton,
                  width: "100%",
                  marginTop: "16px",
                }}
              >
                <Pencil size={15} />
                Edit permission
              </button>
            </div>

            <div
              style={{
                marginTop: "22px",
                padding: "12px",
                borderRadius: "9px",
                background: "#fffbeb",
                border: "1px solid #fde68a",
                color: "#92400e",
                fontSize: "11px",
                lineHeight: 1.6,
              }}
            >
              <AlertTriangle
                size={15}
                style={{
                  display: "inline",
                  verticalAlign: "middle",
                  marginRight: "6px",
                }}
              />
              These actions update local demo state only. Connect your
              authorization backend before relying on them for access control.
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
