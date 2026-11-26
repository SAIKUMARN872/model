
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  ClipboardCheck,
  Download,
  Edit3,
  Eye,
  Filter,
  LockKeyhole,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  X,
} from "lucide-react";

type ActionStatus = "Active" | "Restricted" | "Review Required";

type ActionPermission = {
  id: string;
  action: string;
  resource: string;
  description: string;
  roles: string[];
  status: ActionStatus;
  sensitive: boolean;
  updatedAt: string;
};

const initialPermissions: ActionPermission[] = [
  {
    id: "ACT-1001",
    action: "View",
    resource: "Users",
    description: "View user profiles and account information.",
    roles: ["Super Admin", "Admin", "Viewer"],
    status: "Active",
    sensitive: false,
    updatedAt: "2026-10-28",
  },
  {
    id: "ACT-1002",
    action: "Create",
    resource: "Users",
    description: "Create new user accounts.",
    roles: ["Super Admin", "Admin"],
    status: "Active",
    sensitive: false,
    updatedAt: "2026-10-28",
  },
  {
    id: "ACT-1003",
    action: "Edit",
    resource: "Users",
    description: "Modify user profiles and account settings.",
    roles: ["Super Admin", "Admin"],
    status: "Active",
    sensitive: false,
    updatedAt: "2026-10-27",
  },
  {
    id: "ACT-1004",
    action: "Delete",
    resource: "Users",
    description: "Permanently delete user accounts.",
    roles: ["Super Admin"],
    status: "Restricted",
    sensitive: true,
    updatedAt: "2026-10-27",
  },
  {
    id: "ACT-1005",
    action: "Export",
    resource: "Audit Logs",
    description: "Export audit records for compliance review.",
    roles: ["Super Admin", "Security Admin"],
    status: "Active",
    sensitive: true,
    updatedAt: "2026-10-26",
  },
  {
    id: "ACT-1006",
    action: "Approve",
    resource: "Access Policies",
    description: "Approve changes to access policies.",
    roles: ["Super Admin", "Security Admin"],
    status: "Review Required",
    sensitive: true,
    updatedAt: "2026-10-26",
  },
  {
    id: "ACT-1007",
    action: "Manage",
    resource: "AI Models",
    description: "Manage model availability and configuration.",
    roles: ["Super Admin", "AI Admin"],
    status: "Active",
    sensitive: true,
    updatedAt: "2026-10-25",
  },
  {
    id: "ACT-1008",
    action: "Execute",
    resource: "Agents",
    description: "Execute configured AI agent workflows.",
    roles: ["Super Admin", "AI Admin", "Operator"],
    status: "Active",
    sensitive: false,
    updatedAt: "2026-10-25",
  },
  {
    id: "ACT-1009",
    action: "Manage",
    resource: "API Keys",
    description: "Create, rotate, and revoke API credentials.",
    roles: ["Super Admin", "Security Admin"],
    status: "Restricted",
    sensitive: true,
    updatedAt: "2026-10-24",
  },
  {
    id: "ACT-1010",
    action: "Export",
    resource: "Usage Analytics",
    description: "Export usage and cost analytics reports.",
    roles: ["Super Admin", "Admin", "Analyst"],
    status: "Active",
    sensitive: false,
    updatedAt: "2026-10-24",
  },
  {
    id: "ACT-1011",
    action: "Edit",
    resource: "Knowledge Hub",
    description: "Edit knowledge sources and document metadata.",
    roles: ["Super Admin", "Knowledge Manager"],
    status: "Review Required",
    sensitive: false,
    updatedAt: "2026-10-23",
  },
  {
    id: "ACT-1012",
    action: "Approve",
    resource: "Billing",
    description: "Approve billing and subscription changes.",
    roles: ["Super Admin", "Finance Admin"],
    status: "Restricted",
    sensitive: true,
    updatedAt: "2026-10-22",
  },
];

const roleOptions = [
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

const actionOptions = [
  "View",
  "Create",
  "Edit",
  "Delete",
  "Export",
  "Approve",
  "Manage",
  "Execute",
];

const resourceOptions = [
  "Users",
  "Organizations",
  "Workspaces",
  "AI Models",
  "Agents",
  "Knowledge Hub",
  "Billing",
  "API Keys",
  "Audit Logs",
  "Access Policies",
  "Usage Analytics",
];

const statusOptions: ActionStatus[] = [
  "Active",
  "Restricted",
  "Review Required",
];

const blue = "#315fea";

function statusStyle(status: ActionStatus): React.CSSProperties {
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

function ActionIcon({ action }: { action: string }) {
  const common = { size: 16, strokeWidth: 1.8 };

  switch (action) {
    case "View":
      return <Eye {...common} />;
    case "Create":
      return <Plus {...common} />;
    case "Edit":
      return <Edit3 {...common} />;
    case "Delete":
      return <Trash2 {...common} />;
    case "Export":
      return <Download {...common} />;
    case "Approve":
      return <ClipboardCheck {...common} />;
    case "Execute":
      return <Activity {...common} />;
    default:
      return <Shield {...common} />;
  }
}

export default function ActionPermissionsPage() {
  const [permissions, setPermissions] =
    useState<ActionPermission[]>(initialPermissions);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [actionFilter, setActionFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [sensitiveOnly, setSensitiveOnly] = useState(false);

  const [selected, setSelected] =
    useState<ActionPermission | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    action: "View",
    resource: "Users",
    description: "",
    roles: ["Super Admin"] as string[],
    status: "Active" as ActionStatus,
    sensitive: false,
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return permissions.filter((item) => {
      const matchesSearch =
        !term ||
        item.id.toLowerCase().includes(term) ||
        item.action.toLowerCase().includes(term) ||
        item.resource.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.roles.some((role) =>
          role.toLowerCase().includes(term)
        );

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      const matchesAction =
        actionFilter === "All" || item.action === actionFilter;

      const matchesRole =
        roleFilter === "All" || item.roles.includes(roleFilter);

      const matchesSensitive =
        !sensitiveOnly || item.sensitive;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesAction &&
        matchesRole &&
        matchesSensitive
      );
    });
  }, [
    permissions,
    search,
    statusFilter,
    actionFilter,
    roleFilter,
    sensitiveOnly,
  ]);

  const activeCount = permissions.filter(
    (item) => item.status === "Active"
  ).length;

  const restrictedCount = permissions.filter(
    (item) => item.status === "Restricted"
  ).length;

  const reviewCount = permissions.filter(
    (item) => item.status === "Review Required"
  ).length;

  const sensitiveCount = permissions.filter(
    (item) => item.sensitive
  ).length;

  function toggleRole(role: string) {
    setForm((current) => ({
      ...current,
      roles: current.roles.includes(role)
        ? current.roles.filter((item) => item !== role)
        : [...current.roles, role],
    }));
  }

  function updateStatus(
    id: string,
    status: ActionStatus
  ) {
    setPermissions((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, status, updatedAt: new Date().toISOString().slice(0, 10) }
          : item
      )
    );

    setSelected((current) =>
      current?.id === id ? { ...current, status } : current
    );

    setNotice("Action permission status updated.");
  }

  function createPermission() {
    if (form.roles.length === 0) {
      setNotice("Select at least one role.");
      return;
    }

    const newPermission: ActionPermission = {
      id: `ACT-${Date.now().toString().slice(-6)}`,
      action: form.action,
      resource: form.resource,
      description:
        form.description.trim() ||
        `${form.action} access for ${form.resource}.`,
      roles: [...form.roles],
      status: form.status,
      sensitive: form.sensitive,
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    setPermissions((current) => [
      newPermission,
      ...current,
    ]);

    setShowCreate(false);
    setForm({
      action: "View",
      resource: "Users",
      description: "",
      roles: ["Super Admin"],
      status: "Active",
      sensitive: false,
    });

    setNotice("Action permission created in local demo data.");
  }

  function resetDemo() {
    setPermissions(initialPermissions);
    setSearch("");
    setStatusFilter("All");
    setActionFilter("All");
    setRoleFilter("All");
    setSensitiveOnly(false);
    setSelected(null);
    setNotice("Demo data has been reset.");
  }

  const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 18,
  };

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
        <div
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
                gap: 9,
                color: blue,
                fontSize: 12,
                fontWeight: 700,
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
              Action Permissions
            </h1>

            <p
              style={{
                color: "#6b7280",
                fontSize: 14,
                marginTop: 8,
                marginBottom: 0,
                maxWidth: 680,
                lineHeight: 1.6,
              }}
            >
              Control which actions each role can perform on
              ModelNow resources. Review sensitive operations,
              approval requirements, and access restrictions.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 9,
            }}
          >
            <button
              style={buttonStyle}
              onClick={resetDemo}
              type="button"
            >
              <RefreshCw size={15} />
              Reset demo
            </button>

            <button
              style={{
                ...buttonStyle,
                color: "#fff",
                background: blue,
                borderColor: blue,
              }}
              onClick={() => {
                setNotice("");
                setShowCreate(true);
              }}
              type="button"
            >
              <Plus size={16} />
              Add action permission
            </button>
          </div>
        </div>

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
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
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
              label: "Total actions",
              value: permissions.length,
              detail: "Configured action rules",
              icon: Shield,
              color: "#315fea",
              background: "#eff6ff",
            },
            {
              label: "Active",
              value: activeCount,
              detail: "Currently enabled",
              icon: CheckCircle2,
              color: "#15803d",
              background: "#dcfce7",
            },
            {
              label: "Restricted",
              value: restrictedCount,
              detail: "Limited access",
              icon: LockKeyhole,
              color: "#b91c1c",
              background: "#fee2e2",
            },
            {
              label: "Review required",
              value: reviewCount,
              detail: "Needs administrator review",
              icon: CircleAlert,
              color: "#a16207",
              background: "#fef3c7",
            },
            {
              label: "Sensitive actions",
              value: sensitiveCount,
              detail: "Require careful access control",
              icon: Activity,
              color: "#7c3aed",
              background: "#ede9fe",
            },
          ].map((metric) => {
            const Icon = metric.icon;

            return (
              <div key={metric.label} style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    alignItems: "center",
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
                      display: "grid",
                      placeItems: "center",
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      color: metric.color,
                      background: metric.background,
                    }}
                  >
                    <Icon size={17} />
                  </span>
                </div>

                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 750,
                    letterSpacing: "-0.6px",
                    marginTop: 12,
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
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr)",
            gap: 18,
          }}
        >
          <div
            style={{
              ...cardStyle,
              padding: 0,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: 18,
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  Action access rules
                </h2>
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: 12,
                    margin: "5px 0 0",
                  }}
                >
                  {filtered.length} of {permissions.length} rules
                  displayed
                </p>
              </div>

              <button
                type="button"
                style={buttonStyle}
                onClick={() => setSensitiveOnly((value) => !value)}
              >
                <Filter size={15} />
                {sensitiveOnly ? "Show all actions" : "Sensitive only"}
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(175px, 1fr))",
                gap: 10,
                padding: 16,
                borderBottom: "1px solid #e5e7eb",
                background: "#fafafa",
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
                  placeholder="Search actions, resources, roles..."
                  aria-label="Search action permissions"
                  style={{ ...inputStyle, paddingLeft: 35 }}
                />
              </div>

              <select
                value={actionFilter}
                onChange={(event) => setActionFilter(event.target.value)}
                aria-label="Filter by action"
                style={inputStyle}
              >
                <option value="All">All actions</option>
                {actionOptions.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>

              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                aria-label="Filter by role"
                style={inputStyle}
              >
                <option value="All">All roles</option>
                {roleOptions.map((role) => (
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
                  minWidth: 1000,
                  borderCollapse: "collapse",
                  textAlign: "left",
                }}
              >
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    {[
                      "Permission",
                      "Resource",
                      "Assigned roles",
                      "Sensitivity",
                      "Status",
                      "Updated",
                      "Manage",
                    ].map((heading) => (
                      <th
                        key={heading}
                        style={{
                          padding: "12px 14px",
                          color: "#6b7280",
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
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
                  {filtered.map((item) => (
                    <tr key={item.id}>
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
                              width: 34,
                              height: 34,
                              display: "grid",
                              placeItems: "center",
                              borderRadius: 9,
                              color: blue,
                              background: "#eff6ff",
                              flexShrink: 0,
                            }}
                          >
                            <ActionIcon action={item.action} />
                          </span>

                          <div>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 650,
                                color: "#111827",
                              }}
                            >
                              {item.action} {item.resource}
                            </div>
                            <div
                              style={{
                                color: "#9ca3af",
                                fontSize: 11,
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
                          padding: "15px 14px",
                          borderBottom: "1px solid #f1f5f9",
                          fontSize: 13,
                        }}
                      >
                        {item.resource}
                        <div
                          style={{
                            color: "#9ca3af",
                            fontSize: 11,
                            marginTop: 4,
                            maxWidth: 230,
                            lineHeight: 1.5,
                          }}
                        >
                          {item.description}
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
                            maxWidth: 260,
                          }}
                        >
                          {item.roles.slice(0, 3).map((role) => (
                            <span
                              key={role}
                              style={{
                                background: "#f3f4f6",
                                color: "#4b5563",
                                border: "1px solid #e5e7eb",
                                padding: "4px 7px",
                                borderRadius: 6,
                                fontSize: 10,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {role}
                            </span>
                          ))}

                          {item.roles.length > 3 && (
                            <span
                              style={{
                                color: "#6b7280",
                                fontSize: 11,
                                padding: 4,
                              }}
                            >
                              +{item.roles.length - 3}
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
                        {item.sensitive ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              color: "#b91c1c",
                              fontSize: 11,
                              fontWeight: 650,
                            }}
                          >
                            <LockKeyhole size={13} />
                            Sensitive
                          </span>
                        ) : (
                          <span
                            style={{
                              color: "#6b7280",
                              fontSize: 11,
                            }}
                          >
                            Standard
                          </span>
                        )}
                      </td>

                      <td
                        style={{
                          padding: "15px 14px",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        <span
                          style={{
                            ...statusStyle(item.status),
                            display: "inline-flex",
                            alignItems: "center",
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
                          padding: "15px 14px",
                          borderBottom: "1px solid #f1f5f9",
                          fontSize: 12,
                          color: "#6b7280",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.updatedAt}
                      </td>

                      <td
                        style={{
                          padding: "15px 14px",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setSelected(item)}
                          style={{
                            ...buttonStyle,
                            color: blue,
                            borderColor: "#bfdbfe",
                            padding: "7px 10px",
                          }}
                        >
                          Configure
                          <ChevronDown size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          textAlign: "center",
                          padding: 42,
                          color: "#6b7280",
                          fontSize: 13,
                        }}
                      >
                        No action permissions match your filters.
                        <div style={{ marginTop: 12 }}>
                          <button
                            type="button"
                            style={buttonStyle}
                            onClick={() => {
                              setSearch("");
                              setStatusFilter("All");
                              setActionFilter("All");
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
              Demo data only. Changes on this page are held in the
              current page session and are not saved to a backend.
            </div>
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                marginBottom: 9,
              }}
            >
              <Shield size={18} color={blue} />
              <h3 style={{ fontSize: 13, margin: 0 }}>
                Least-privilege access
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
              Grant only the actions required for each role. Sensitive
              actions should have narrower access.
            </p>
          </div>

          <div style={cardStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                marginBottom: 9,
              }}
            >
              <ClipboardCheck size={18} color="#15803d" />
              <h3 style={{ fontSize: 13, margin: 0 }}>
                Review and approval
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
              Review high-impact actions such as deleting users,
              changing policies, or approving billing operations.
            </p>
          </div>

          <div style={cardStyle}>
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
                Enforce on the server
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
              This interface is for administration. Real authorization
              must also be checked by your backend for every protected
              operation.
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
            background: "rgba(15, 23, 42, 0.35)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Configure action permission"
            style={{
              width: "min(460px, 100%)",
              height: "100%",
              overflowY: "auto",
              background: "#fff",
              boxShadow: "-12px 0 35px rgba(15,23,42,.12)",
              padding: 24,
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
                    letterSpacing: "0.6px",
                  }}
                >
                  ACTION CONFIGURATION
                </div>
                <h2
                  style={{
                    fontSize: 22,
                    margin: "8px 0",
                    letterSpacing: "-0.5px",
                  }}
                >
                  {selected.action} {selected.resource}
                </h2>
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: 12,
                    margin: 0,
                  }}
                >
                  {selected.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close configuration"
                style={{
                  ...buttonStyle,
                  padding: 7,
                }}
              >
                <X size={17} />
              </button>
            </div>

            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 14,
                marginTop: 22,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                Description
              </div>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: 13,
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {selected.description}
              </p>
            </div>

            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Permission status
            </label>

            <select
              value={selected.status}
              onChange={(event) =>
                updateStatus(
                  selected.id,
                  event.target.value as ActionStatus
                )
              }
              style={inputStyle}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <div style={{ marginTop: 22 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 10,
                }}
              >
                Roles currently allowed
              </div>

              <div style={{ display: "grid", gap: 9 }}>
                {selected.roles.map((role) => (
                  <div
                    key={role}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "10px 12px",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      fontSize: 12,
                      color: "#374151",
                    }}
                  >
                    <CheckCircle2 size={15} color="#15803d" />
                    {role}
                  </div>
                ))}
              </div>

              <p
                style={{
                  color: "#9ca3af",
                  fontSize: 11,
                  lineHeight: 1.6,
                  marginTop: 10,
                }}
              >
                Role assignment editing can be connected to the
                Permission Groups and Permission Assignments pages.
              </p>
            </div>

            <div style={{ marginTop: 22 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 9,
                }}
              >
                Risk classification
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: 12,
                  borderRadius: 9,
                  background: selected.sensitive ? "#fef2f2" : "#f0fdf4",
                  color: selected.sensitive ? "#b91c1c" : "#15803d",
                  fontSize: 12,
                  fontWeight: 650,
                }}
              >
                {selected.sensitive ? (
                  <LockKeyhole size={15} />
                ) : (
                  <Check size={15} />
                )}
                {selected.sensitive
                  ? "Sensitive action — limit access"
                  : "Standard action"}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 28,
                paddingTop: 18,
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <button
                type="button"
                style={{ ...buttonStyle, flex: 1 }}
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
          </aside>
        </div>
      )}

      {showCreate && (
        <div
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowCreate(false);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            background: "rgba(15, 23, 42, 0.4)",
            display: "grid",
            placeItems: "center",
            padding: 16,
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Add action permission"
            style={{
              width: "min(620px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: 14,
              boxShadow: "0 24px 70px rgba(15,23,42,.2)",
              padding: 24,
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
                    letterSpacing: "-0.5px",
                  }}
                >
                  Add action permission
                </h2>
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: 12,
                    lineHeight: 1.6,
                    margin: "7px 0 0",
                  }}
                >
                  Define an action, its resource, and the roles allowed
                  to perform it.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close add permission form"
                onClick={() => setShowCreate(false)}
                style={{
                  ...buttonStyle,
                  padding: 7,
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 14,
              }}
            >
              <div>
                <label
                  htmlFor="action-name"
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 7,
                  }}
                >
                  Action
                </label>
                <select
                  id="action-name"
                  value={form.action}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      action: event.target.value,
                    }))
                  }
                  style={inputStyle}
                >
                  {actionOptions.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="action-resource"
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
                  id="action-resource"
                  value={form.resource}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      resource: event.target.value,
                    }))
                  }
                  style={inputStyle}
                >
                  {resourceOptions.map((resource) => (
                    <option key={resource} value={resource}>
                      {resource}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  htmlFor="action-description"
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
                  id="action-description"
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Describe what this permission allows..."
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
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 9,
                  }}
                >
                  Allowed roles
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(170px, 1fr))",
                    gap: 8,
                  }}
                >
                  {roleOptions.map((role) => {
                    const checked = form.roles.includes(role);

                    return (
                      <label
                        key={role}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          border: `1px solid ${
                            checked ? "#bfdbfe" : "#e5e7eb"
                          }`,
                          background: checked ? "#eff6ff" : "#fff",
                          padding: "10px",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: 12,
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

              <div>
                <label
                  htmlFor="action-status"
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 7,
                  }}
                >
                  Initial status
                </label>
                <select
                  id="action-status"
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as ActionStatus,
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

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  alignSelf: "end",
                  minHeight: 40,
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
                Mark as sensitive
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
                onClick={() => setShowCreate(false)}
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
                onClick={createPermission}
              >
                <Plus size={15} />
                Create permission
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
