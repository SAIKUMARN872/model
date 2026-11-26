
"use client";

import { useMemo, useState } from "react";
import {
  Users,
  Shield,
  Search,
  Plus,
  X,
  Edit3,
  Trash2,
  CheckCircle2,
  LockKeyhole,
  RefreshCw,
  ChevronRight,
  Layers3,
  ClipboardList,
  CircleAlert,
} from "lucide-react";

type GroupStatus = "Active" | "Restricted" | "Review Required";

type PermissionGroup = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  roles: string[];
  status: GroupStatus;
  sensitive: boolean;
  updatedAt: string;
};

const permissionCatalog = [
  "View Users",
  "Create Users",
  "Edit Users",
  "Delete Users",
  "Manage Organizations",
  "Manage Workspaces",
  "View Audit Logs",
  "Export Audit Logs",
  "Manage AI Models",
  "Execute Agents",
  "Manage API Keys",
  "Manage Billing",
  "Manage Access Policies",
  "Manage Knowledge Hub",
  "View Usage Analytics",
];

const roleCatalog = [
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

const initialGroups: PermissionGroup[] = [
  {
    id: "GRP-1001",
    name: "Platform Administrators",
    description:
      "Broad platform administration and configuration access.",
    permissions: [
      "View Users",
      "Create Users",
      "Edit Users",
      "Manage Organizations",
      "Manage Workspaces",
      "Manage AI Models",
      "View Audit Logs",
    ],
    roles: ["Super Admin", "Admin"],
    status: "Active",
    sensitive: true,
    updatedAt: "2026-10-30",
  },
  {
    id: "GRP-1002",
    name: "Security Operations",
    description:
      "Security monitoring, audit review, and access policy management.",
    permissions: [
      "View Audit Logs",
      "Export Audit Logs",
      "Manage API Keys",
      "Manage Access Policies",
      "View Users",
    ],
    roles: ["Super Admin", "Security Admin"],
    status: "Active",
    sensitive: true,
    updatedAt: "2026-10-29",
  },
  {
    id: "GRP-1003",
    name: "AI Operations",
    description:
      "Model configuration and controlled AI agent execution.",
    permissions: [
      "Manage AI Models",
      "Execute Agents",
      "View Usage Analytics",
      "Manage Knowledge Hub",
    ],
    roles: ["AI Admin", "Operator"],
    status: "Active",
    sensitive: false,
    updatedAt: "2026-10-28",
  },
  {
    id: "GRP-1004",
    name: "Read-Only Access",
    description:
      "Read-only access to approved operational information.",
    permissions: [
      "View Users",
      "View Audit Logs",
      "View Usage Analytics",
    ],
    roles: ["Viewer", "Analyst"],
    status: "Active",
    sensitive: false,
    updatedAt: "2026-10-27",
  },
  {
    id: "GRP-1005",
    name: "Finance Operations",
    description:
      "Billing management and financial reporting access.",
    permissions: [
      "Manage Billing",
      "View Usage Analytics",
    ],
    roles: ["Finance Admin"],
    status: "Review Required",
    sensitive: true,
    updatedAt: "2026-10-26",
  },
  {
    id: "GRP-1006",
    name: "Knowledge Management",
    description:
      "Manage approved knowledge sources and workspace content.",
    permissions: [
      "Manage Knowledge Hub",
      "View Usage Analytics",
    ],
    roles: ["Knowledge Manager"],
    status: "Restricted",
    sensitive: false,
    updatedAt: "2026-10-25",
  },
];

const statusOptions: GroupStatus[] = [
  "Active",
  "Restricted",
  "Review Required",
];

const blue = "#315fea";

const inputStyle: React.CSSProperties = {
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

const buttonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "9px 12px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  background: "#fff",
  color: "#374151",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

function getStatusStyle(status: GroupStatus): React.CSSProperties {
  if (status === "Active") {
    return {
      color: "#15803d",
      background: "#dcfce7",
      border: "1px solid #bbf7d0",
    };
  }

  if (status === "Restricted") {
    return {
      color: "#b91c1c",
      background: "#fee2e2",
      border: "1px solid #fecaca",
    };
  }

  return {
    color: "#a16207",
    background: "#fef3c7",
    border: "1px solid #fde68a",
  };
}

export default function PermissionGroupsPage() {
  const [groups, setGroups] =
    useState<PermissionGroup[]>(initialGroups);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [sensitiveOnly, setSensitiveOnly] = useState(false);

  const [selected, setSelected] =
    useState<PermissionGroup | null>(null);

  const [editing, setEditing] =
    useState<PermissionGroup | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
    roles: [] as string[],
    status: "Active" as GroupStatus,
    sensitive: false,
  });

  const filteredGroups = useMemo(() => {
    const term = search.trim().toLowerCase();

    return groups.filter((group) => {
      const matchesSearch =
        !term ||
        group.id.toLowerCase().includes(term) ||
        group.name.toLowerCase().includes(term) ||
        group.description.toLowerCase().includes(term) ||
        group.permissions.some((permission) =>
          permission.toLowerCase().includes(term)
        ) ||
        group.roles.some((role) =>
          role.toLowerCase().includes(term)
        );

      const matchesStatus =
        statusFilter === "All" || group.status === statusFilter;

      const matchesRole =
        roleFilter === "All" || group.roles.includes(roleFilter);

      const matchesSensitive =
        !sensitiveOnly || group.sensitive;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRole &&
        matchesSensitive
      );
    });
  }, [groups, search, statusFilter, roleFilter, sensitiveOnly]);

  const activeCount = groups.filter(
    (group) => group.status === "Active"
  ).length;

  const reviewCount = groups.filter(
    (group) => group.status === "Review Required"
  ).length;

  const sensitiveCount = groups.filter(
    (group) => group.sensitive
  ).length;

  const assignedRolesCount = new Set(
    groups.flatMap((group) => group.roles)
  ).size;

  function toggleFormPermission(permission: string) {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((item) => item !== permission)
        : [...current.permissions, permission],
    }));
  }

  function toggleFormRole(role: string) {
    setForm((current) => ({
      ...current,
      roles: current.roles.includes(role)
        ? current.roles.filter((item) => item !== role)
        : [...current.roles, role],
    }));
  }

  function openCreateForm() {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      permissions: [],
      roles: [],
      status: "Active",
      sensitive: false,
    });
    setShowForm(true);
    setNotice("");
  }

  function openEditForm(group: PermissionGroup) {
    setEditing(group);
    setForm({
      name: group.name,
      description: group.description,
      permissions: [...group.permissions],
      roles: [...group.roles],
      status: group.status,
      sensitive: group.sensitive,
    });
    setSelected(null);
    setShowForm(true);
    setNotice("");
  }

  function saveGroup() {
    if (!form.name.trim()) {
      setNotice("Enter a name for the permission group.");
      return;
    }

    if (form.permissions.length === 0) {
      setNotice("Select at least one permission.");
      return;
    }

    if (form.roles.length === 0) {
      setNotice("Assign at least one role to the group.");
      return;
    }

    const updatedAt = new Date().toISOString().slice(0, 10);

    if (editing) {
      const updated: PermissionGroup = {
        ...editing,
        name: form.name.trim(),
        description: form.description.trim(),
        permissions: [...form.permissions],
        roles: [...form.roles],
        status: form.status,
        sensitive: form.sensitive,
        updatedAt,
      };

      setGroups((current) =>
        current.map((group) =>
          group.id === editing.id ? updated : group
        )
      );

      setNotice("Permission group updated in local demo data.");
    } else {
      const created: PermissionGroup = {
        id: `GRP-${Date.now().toString().slice(-6)}`,
        name: form.name.trim(),
        description: form.description.trim(),
        permissions: [...form.permissions],
        roles: [...form.roles],
        status: form.status,
        sensitive: form.sensitive,
        updatedAt,
      };

      setGroups((current) => [created, ...current]);
      setNotice("Permission group created in local demo data.");
    }

    setShowForm(false);
    setEditing(null);
  }

  function deleteGroup(group: PermissionGroup) {
    const confirmed = window.confirm(
      `Delete the "${group.name}" permission group from the local demo?`
    );

    if (!confirmed) return;

    setGroups((current) =>
      current.filter((item) => item.id !== group.id)
    );

    setSelected(null);
    setNotice("Permission group deleted from local demo data.");
  }

  function resetDemo() {
    setGroups(initialGroups);
    setSearch("");
    setStatusFilter("All");
    setRoleFilter("All");
    setSensitiveOnly(false);
    setSelected(null);
    setShowForm(false);
    setEditing(null);
    setNotice("Demo data has been reset.");
  }

  const metricCard: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 18,
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
            flexWrap: "wrap",
            alignItems: "flex-start",
            justifyContent: "space-between",
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
              <LockKeyhole size={16} />
              MODELNOW ADMIN / PERMISSIONS
            </div>

            <h1
              style={{
                fontSize: 28,
                fontWeight: 750,
                letterSpacing: "-0.8px",
                margin: 0,
              }}
            >
              Permission Groups
            </h1>

            <p
              style={{
                color: "#6b7280",
                fontSize: 14,
                lineHeight: 1.7,
                marginTop: 8,
                marginBottom: 0,
                maxWidth: 700,
              }}
            >
              Organize individual permissions into reusable groups
              and assign them to the appropriate ModelNow roles.
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
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
                background: blue,
                borderColor: blue,
                color: "#fff",
              }}
              onClick={openCreateForm}
            >
              <Plus size={16} />
              Create group
            </button>
          </div>
        </header>

        {notice && (
          <div
            role="status"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "11px 14px",
              border: "1px solid #bfdbfe",
              borderRadius: 9,
              background: "#eff6ff",
              color: "#1d4ed8",
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            <span>{notice}</span>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setNotice("")}
              style={{
                border: 0,
                background: "transparent",
                cursor: "pointer",
                color: "inherit",
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 14,
            marginBottom: 20,
          }}
        >
          {[
            {
              label: "Permission groups",
              value: groups.length,
              detail: "Configured groups",
              icon: Layers3,
              color: "#315fea",
              bg: "#eff6ff",
            },
            {
              label: "Active groups",
              value: activeCount,
              detail: "Available in this demo",
              icon: CheckCircle2,
              color: "#15803d",
              bg: "#dcfce7",
            },
            {
              label: "Roles represented",
              value: assignedRolesCount,
              detail: "Distinct roles assigned",
              icon: Users,
              color: "#7c3aed",
              bg: "#ede9fe",
            },
            {
              label: "Sensitive groups",
              value: sensitiveCount,
              detail: "Require careful review",
              icon: LockKeyhole,
              color: "#b91c1c",
              bg: "#fee2e2",
            },
            {
              label: "Pending review",
              value: reviewCount,
              detail: "Need administrator review",
              icon: CircleAlert,
              color: "#a16207",
              bg: "#fef3c7",
            },
          ].map((metric) => {
            const Icon = metric.icon;

            return (
              <div key={metric.label} style={metricCard}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
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
                    marginTop: 12,
                    letterSpacing: "-0.5px",
                  }}
                >
                  {metric.value}
                </div>

                <div
                  style={{
                    color: "#9ca3af",
                    fontSize: 12,
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
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                Configured groups
              </h2>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: 12,
                  margin: "5px 0 0",
                }}
              >
                {filteredGroups.length} of {groups.length} groups
              </p>
            </div>

            <button
              type="button"
              style={buttonStyle}
              onClick={() => setSensitiveOnly((value) => !value)}
            >
              <Shield size={15} />
              {sensitiveOnly ? "Show all groups" : "Sensitive only"}
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(190px, 1fr))",
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
                  left: 11,
                  top: 11,
                  color: "#9ca3af",
                }}
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search groups, roles, permissions..."
                aria-label="Search permission groups"
                style={{ ...inputStyle, paddingLeft: 35 }}
              />
            </div>

            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              aria-label="Filter by role"
              style={inputStyle}
            >
              <option value="All">All roles</option>
              {roleCatalog.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
              style={inputStyle}
            >
              <option value="All">All statuses</option>
              {statusOptions.map((status) => (
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
                minWidth: 980,
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {[
                    "Group",
                    "Permissions",
                    "Assigned roles",
                    "Risk",
                    "Status",
                    "Updated",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: "12px 14px",
                        color: "#6b7280",
                        fontSize: 11,
                        fontWeight: 700,
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
                {filteredGroups.map((group) => (
                  <tr key={group.id}>
                    <td
                      style={{
                        padding: "15px 14px",
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
                            borderRadius: 9,
                            color: blue,
                            background: "#eff6ff",
                            flexShrink: 0,
                          }}
                        >
                          <Users size={17} />
                        </span>

                        <div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                            }}
                          >
                            {group.name}
                          </div>
                          <div
                            style={{
                              color: "#9ca3af",
                              fontSize: 11,
                              marginTop: 4,
                            }}
                          >
                            {group.id}
                          </div>
                          <div
                            style={{
                              color: "#6b7280",
                              fontSize: 11,
                              marginTop: 5,
                              maxWidth: 250,
                              lineHeight: 1.5,
                            }}
                          >
                            {group.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 5,
                          maxWidth: 270,
                        }}
                      >
                        {group.permissions.slice(0, 3).map((permission) => (
                          <span
                            key={permission}
                            style={{
                              color: "#4b5563",
                              background: "#f3f4f6",
                              border: "1px solid #e5e7eb",
                              borderRadius: 6,
                              padding: "4px 7px",
                              fontSize: 10,
                            }}
                          >
                            {permission}
                          </span>
                        ))}
                        {group.permissions.length > 3 && (
                          <span
                            style={{
                              color: blue,
                              fontSize: 11,
                              padding: 4,
                              fontWeight: 650,
                            }}
                          >
                            +{group.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>

                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 5,
                          maxWidth: 230,
                        }}
                      >
                        {group.roles.slice(0, 2).map((role) => (
                          <span
                            key={role}
                            style={{
                              color: "#315fea",
                              background: "#eff6ff",
                              border: "1px solid #dbeafe",
                              borderRadius: 6,
                              padding: "4px 7px",
                              fontSize: 10,
                            }}
                          >
                            {role}
                          </span>
                        ))}
                        {group.roles.length > 2 && (
                          <span
                            style={{
                              color: "#6b7280",
                              fontSize: 11,
                              padding: 4,
                            }}
                          >
                            +{group.roles.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          color: group.sensitive ? "#b91c1c" : "#6b7280",
                          fontSize: 11,
                          fontWeight: 650,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {group.sensitive ? (
                          <LockKeyhole size={13} />
                        ) : (
                          <Shield size={13} />
                        )}
                        {group.sensitive ? "Sensitive" : "Standard"}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <span
                        style={{
                          ...getStatusStyle(group.status),
                          display: "inline-flex",
                          padding: "5px 8px",
                          borderRadius: 20,
                          fontSize: 10,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {group.status}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: 12,
                        color: "#6b7280",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {group.updatedAt}
                    </td>

                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          title="View group"
                          aria-label={`View ${group.name}`}
                          onClick={() => setSelected(group)}
                          style={{
                            ...buttonStyle,
                            padding: 7,
                            color: blue,
                          }}
                        >
                          <ChevronRight size={16} />
                        </button>

                        <button
                          type="button"
                          title="Edit group"
                          aria-label={`Edit ${group.name}`}
                          onClick={() => openEditForm(group)}
                          style={{
                            ...buttonStyle,
                            padding: 7,
                          }}
                        >
                          <Edit3 size={15} />
                        </button>

                        <button
                          type="button"
                          title="Delete group"
                          aria-label={`Delete ${group.name}`}
                          onClick={() => deleteGroup(group)}
                          style={{
                            ...buttonStyle,
                            padding: 7,
                            color: "#b91c1c",
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredGroups.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        textAlign: "center",
                        padding: 40,
                        color: "#6b7280",
                        fontSize: 13,
                      }}
                    >
                      No permission groups match your filters.
                      <div style={{ marginTop: 12 }}>
                        <button
                          type="button"
                          style={buttonStyle}
                          onClick={() => {
                            setSearch("");
                            setStatusFilter("All");
                            setRoleFilter("All");
                            setSensitiveOnly(false);
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
            Demo data only. Group changes are not yet persisted to a
            backend or applied as server-side authorization rules.
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
          <div style={metricCard}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                marginBottom: 9,
              }}
            >
              <Layers3 size={18} color={blue} />
              <h3 style={{ fontSize: 13, margin: 0 }}>
                Reusable permission sets
              </h3>
            </div>
            <p
              style={{
                color: "#6b7280",
                fontSize: 12,
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Bundle related permissions into groups instead of
              configuring each permission separately for every role.
            </p>
          </div>

          <div style={metricCard}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                marginBottom: 9,
              }}
            >
              <ClipboardList size={18} color="#15803d" />
              <h3 style={{ fontSize: 13, margin: 0 }}>
                Review assignments
              </h3>
            </div>
            <p
              style={{
                color: "#6b7280",
                fontSize: 12,
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Periodically review groups, their roles, and sensitive
              permissions to reduce unnecessary access.
            </p>
          </div>

          <div style={metricCard}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                marginBottom: 9,
              }}
            >
              <LockKeyhole size={18} color="#b91c1c" />
              <h3 style={{ fontSize: 13, margin: 0 }}>
                Security boundary
              </h3>
            </div>
            <p
              style={{
                color: "#6b7280",
                fontSize: 12,
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              The backend must validate the signed-in user's role and
              permissions before allowing protected operations.
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
            background: "rgba(15, 23, 42, .35)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Permission group details"
            style={{
              width: "min(480px, 100%)",
              height: "100%",
              overflowY: "auto",
              background: "#fff",
              padding: 24,
              boxShadow: "-12px 0 35px rgba(15,23,42,.12)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    color: blue,
                    fontSize: 11,
                    fontWeight: 750,
                    letterSpacing: ".6px",
                  }}
                >
                  GROUP DETAILS
                </div>
                <h2
                  style={{
                    fontSize: 22,
                    margin: "8px 0",
                    letterSpacing: "-.5px",
                  }}
                >
                  {selected.name}
                </h2>
                <p
                  style={{
                    color: "#9ca3af",
                    fontSize: 12,
                    margin: 0,
                  }}
                >
                  {selected.id}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close group details"
                style={{ ...buttonStyle, padding: 7 }}
                onClick={() => setSelected(null)}
              >
                <X size={16} />
              </button>
            </div>

            <p
              style={{
                color: "#6b7280",
                fontSize: 13,
                lineHeight: 1.7,
                marginTop: 18,
              }}
            >
              {selected.description || "No description provided."}
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                margin: "18px 0",
              }}
            >
              <span
                style={{
                  ...getStatusStyle(selected.status),
                  padding: "6px 9px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {selected.status}
              </span>

              <span
                style={{
                  padding: "6px 9px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  color: selected.sensitive ? "#b91c1c" : "#4b5563",
                  background: selected.sensitive ? "#fee2e2" : "#f3f4f6",
                }}
              >
                {selected.sensitive ? "Sensitive group" : "Standard group"}
              </span>
            </div>

            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 14,
                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  fontSize: 13,
                  margin: "0 0 12px",
                }}
              >
                Permissions ({selected.permissions.length})
              </h3>

              <div style={{ display: "grid", gap: 9 }}>
                {selected.permissions.map((permission) => (
                  <div
                    key={permission}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 12,
                      color: "#374151",
                    }}
                  >
                    <CheckCircle2 size={15} color="#15803d" />
                    {permission}
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 14,
              }}
            >
              <h3
                style={{
                  fontSize: 13,
                  margin: "0 0 12px",
                }}
              >
                Assigned roles ({selected.roles.length})
              </h3>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 7,
                }}
              >
                {selected.roles.map((role) => (
                  <span
                    key={role}
                    style={{
                      padding: "6px 9px",
                      borderRadius: 7,
                      border: "1px solid #dbeafe",
                      background: "#eff6ff",
                      color: "#1d4ed8",
                      fontSize: 11,
                    }}
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 9, marginTop: 22 }}>
              <button
                type="button"
                style={{
                  ...buttonStyle,
                  flex: 1,
                  color: "#fff",
                  background: blue,
                  borderColor: blue,
                }}
                onClick={() => openEditForm(selected)}
              >
                <Edit3 size={15} />
                Edit group
              </button>

              <button
                type="button"
                style={{
                  ...buttonStyle,
                  color: "#b91c1c",
                }}
                onClick={() => deleteGroup(selected)}
              >
                <Trash2 size={15} />
                Delete
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
            background: "rgba(15,23,42,.4)",
            display: "grid",
            placeItems: "center",
            padding: 16,
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label={
              editing ? "Edit permission group" : "Create permission group"
            }
            style={{
              width: "min(760px, 100%)",
              maxHeight: "92vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: 14,
              padding: 24,
              boxShadow: "0 24px 70px rgba(15,23,42,.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: 21,
                    margin: 0,
                    letterSpacing: "-.5px",
                  }}
                >
                  {editing ? "Edit permission group" : "Create permission group"}
                </h2>
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: 12,
                    lineHeight: 1.6,
                    margin: "7px 0 0",
                  }}
                >
                  Configure the group, permissions, and role assignments.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close group form"
                style={{ ...buttonStyle, padding: 7 }}
                onClick={() => setShowForm(false)}
              >
                <X size={16} />
              </button>
            </div>

            {notice && (
              <div
                role="alert"
                style={{
                  color: "#b91c1c",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 14,
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
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 14,
              }}
            >
              <div>
                <label
                  htmlFor="group-name"
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 7,
                  }}
                >
                  Group name *
                </label>
                <input
                  id="group-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. Customer Support"
                  style={inputStyle}
                />
              </div>

              <div>
                <label
                  htmlFor="group-status"
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
                  id="group-status"
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as GroupStatus,
                    }))
                  }
                  style={inputStyle}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  htmlFor="group-description"
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 7,
                  }}
                >
                  Description
                </label>
                <textarea
                  id="group-description"
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Explain the purpose of this group..."
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 9,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700 }}>
                    Permissions *
                  </span>
                  <span style={{ fontSize: 11, color: "#6b7280" }}>
                    {form.permissions.length} selected
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(210px, 1fr))",
                    gap: 8,
                  }}
                >
                  {permissionCatalog.map((permission) => {
                    const checked = form.permissions.includes(permission);

                    return (
                      <label
                        key={permission}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: 10,
                          borderRadius: 8,
                          border: `1px solid ${
                            checked ? "#bfdbfe" : "#e5e7eb"
                          }`,
                          background: checked ? "#eff6ff" : "#fff",
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleFormPermission(permission)}
                        />
                        {permission}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 9,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700 }}>
                    Assigned roles *
                  </span>
                  <span style={{ fontSize: 11, color: "#6b7280" }}>
                    {form.roles.length} selected
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 8,
                  }}
                >
                  {roleCatalog.map((role) => {
                    const checked = form.roles.includes(role);

                    return (
                      <label
                        key={role}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: 10,
                          borderRadius: 8,
                          border: `1px solid ${
                            checked ? "#bfdbfe" : "#e5e7eb"
                          }`,
                          background: checked ? "#eff6ff" : "#fff",
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleFormRole(role)}
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
                  alignItems: "center",
                  gap: 9,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <input
                  type="checkbox"
                  checked={form.sensitive}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      sensitive: event.target.checked,
                    }))
                  }
                />
                Mark this group as sensitive
              </label>
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
                onClick={saveGroup}
              >
                <CheckCircle2 size={15} />
                {editing ? "Save changes" : "Create group"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
