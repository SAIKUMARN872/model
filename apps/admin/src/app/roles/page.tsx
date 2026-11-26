"use client";

import { useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import {
  ShieldCheck,
  Shield,
  Users,
  KeyRound,
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  X,
  Check,
  LockKeyhole,
  Globe,
  Building2,
  LayoutGrid,
  AlertTriangle,
  ChevronRight,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";

type RoleScope = "Global" | "Organization" | "Workspace";
type RoleStatus = "Active" | "Restricted" | "Review Required";
type RoleType = "All" | "Built-in" | "Custom";

type Role = {
  id: string;
  name: string;
  description: string;
  users: number;
  permissions: number;
  scope: RoleScope;
  status: RoleStatus;
  privileged: boolean;
  custom: boolean;
  permissionNames: string[];
};

const initialRoles: Role[] = [
  {
    id: "ROLE-1001",
    name: "Super Administrator",
    description: "Full platform administration and security access.",
    users: 4,
    permissions: 148,
    scope: "Global",
    status: "Active",
    privileged: true,
    custom: false,
    permissionNames: [
      "Manage users",
      "Manage organizations",
      "Manage billing",
      "Manage security",
      "Manage platform settings",
    ],
  },
  {
    id: "ROLE-1002",
    name: "Platform Administrator",
    description: "Manages platform configuration and operations.",
    users: 12,
    permissions: 112,
    scope: "Global",
    status: "Active",
    privileged: true,
    custom: false,
    permissionNames: [
      "Manage platform settings",
      "Manage users",
      "View analytics",
      "Manage models",
    ],
  },
  {
    id: "ROLE-1003",
    name: "Organization Administrator",
    description: "Manages organization resources, members, and settings.",
    users: 86,
    permissions: 74,
    scope: "Organization",
    status: "Active",
    privileged: true,
    custom: false,
    permissionNames: [
      "Manage organization members",
      "Manage organization settings",
      "View organization analytics",
    ],
  },
  {
    id: "ROLE-1004",
    name: "Workspace Administrator",
    description: "Manages workspace settings, members, and access.",
    users: 248,
    permissions: 52,
    scope: "Workspace",
    status: "Active",
    privileged: true,
    custom: false,
    permissionNames: [
      "Manage workspace members",
      "Manage workspace settings",
      "View workspace activity",
    ],
  },
  {
    id: "ROLE-1005",
    name: "Security Auditor",
    description: "Reviews security events, permissions, and audit activity.",
    users: 18,
    permissions: 34,
    scope: "Global",
    status: "Restricted",
    privileged: true,
    custom: false,
    permissionNames: [
      "View audit logs",
      "View security events",
      "Export audit reports",
    ],
  },
  {
    id: "ROLE-1006",
    name: "Billing Administrator",
    description: "Manages billing, invoices, and subscription operations.",
    users: 22,
    permissions: 28,
    scope: "Organization",
    status: "Review Required",
    privileged: true,
    custom: false,
    permissionNames: [
      "View invoices",
      "Manage subscriptions",
      "View payment history",
    ],
  },
];

const availablePermissions = [
  "View dashboard",
  "View analytics",
  "View audit logs",
  "Manage users",
  "Manage organizations",
  "Manage organization members",
  "Manage organization settings",
  "Manage workspace members",
  "Manage workspace settings",
  "Manage billing",
  "Manage subscriptions",
  "Manage models",
  "Manage platform settings",
  "View security events",
  "Export audit reports",
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
  purple: "#6941C6",
};

const statusColors: Record<
  RoleStatus,
  { color: string; background: string }
> = {
  Active: { color: "#15803D", background: "#EAF8EF" },
  Restricted: { color: "#B42318", background: "#FEF0EF" },
  "Review Required": { color: "#B54708", background: "#FFF5DF" },
};

const inputStyle: CSSProperties = {
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  border: `1px solid ${colors.border}`,
  borderRadius: 9,
  padding: "10px 12px",
  background: "#FFFFFF",
  color: colors.text,
  fontSize: 13,
  outline: "none",
};

const buttonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "10px 13px",
  borderRadius: 9,
  border: `1px solid ${colors.border}`,
  background: "#FFFFFF",
  color: colors.text,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const cardStyle: CSSProperties = {
  background: "#FFFFFF",
  border: `1px solid ${colors.border}`,
  borderRadius: 13,
};

const labelStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  color: colors.text,
  fontSize: 12,
  fontWeight: 600,
};

const menuItemStyle: CSSProperties = {
  display: "flex",
  width: "100%",
  alignItems: "center",
  gap: 9,
  border: "none",
  background: "#FFFFFF",
  borderRadius: 7,
  padding: 10,
  cursor: "pointer",
  textAlign: "left",
  fontSize: 12,
  color: colors.text,
};

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 100,
  background: "#10182880",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 18,
};

const modalStyle: CSSProperties = {
  width: "100%",
  maxWidth: 600,
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

const initialForm = {
  name: "",
  description: "",
  scope: "Workspace" as RoleScope,
  permissionNames: ["View dashboard"],
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [scopeFilter, setScopeFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState<RoleType>("All");
  const [showForm, setShowForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [menuRoleId, setMenuRoleId] = useState<string | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState(initialForm);

  const filteredRoles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return roles.filter((role) => {
      const matchesSearch =
        !query ||
        [role.id, role.name, role.description].some((value) =>
          value.toLowerCase().includes(query),
        );

      const matchesStatus =
        statusFilter === "All" || role.status === statusFilter;

      const matchesScope =
        scopeFilter === "All" || role.scope === scopeFilter;

      const matchesType =
        typeFilter === "All" ||
        (typeFilter === "Custom" ? role.custom : !role.custom);

      return (
        matchesSearch && matchesStatus && matchesScope && matchesType
      );
    });
  }, [roles, search, statusFilter, scopeFilter, typeFilter]);

  const metrics = [
    {
      title: "Total Roles",
      value: roles.length.toLocaleString(),
      description: "Roles in the directory",
      icon: Shield,
      color: colors.blue,
      background: "#EDF2FF",
    },
    {
      title: "Active Roles",
      value: roles
        .filter((role) => role.status === "Active")
        .length.toLocaleString(),
      description: "Currently marked active",
      icon: ShieldCheck,
      color: colors.green,
      background: "#EAF8EF",
    },
    {
      title: "Privileged Roles",
      value: roles
        .filter((role) => role.privileged)
        .length.toLocaleString(),
      description: "Roles with elevated access",
      icon: LockKeyhole,
      color: colors.amber,
      background: "#FFF5DF",
    },
    {
      title: "Custom Roles",
      value: roles
        .filter((role) => role.custom)
        .length.toLocaleString(),
      description: "Organization-defined roles",
      icon: KeyRound,
      color: colors.purple,
      background: "#F2EDFF",
    },
  ];

  function notify(message: string) {
    setNotice(message);
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("All");
    setScopeFilter("All");
    setTypeFilter("All");
  }

  function closeForm() {
    setShowForm(false);
    setEditingRoleId(null);
    setForm(initialForm);
  }

  function startCreate() {
    setSelectedRole(null);
    setMenuRoleId(null);
    setEditingRoleId(null);
    setForm(initialForm);
    setShowForm(true);
  }

  function startEdit(role: Role) {
    setMenuRoleId(null);

    if (!role.custom) {
      notify("Built-in roles are protected from editing.");
      return;
    }

    setSelectedRole(null);
    setEditingRoleId(role.id);
    setForm({
      name: role.name,
      description: role.description,
      scope: role.scope,
      permissionNames: [...role.permissionNames],
    });
    setShowForm(true);
  }

  function saveRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const description = form.description.trim();

    if (!name || !description || form.permissionNames.length === 0) {
      notify("Enter the role details and select at least one permission.");
      return;
    }

    const duplicate = roles.some(
      (role) =>
        role.name.toLowerCase() === name.toLowerCase() &&
        role.id !== editingRoleId,
    );

    if (duplicate) {
      notify("A role with this name already exists.");
      return;
    }

    if (editingRoleId) {
      setRoles((current) =>
        current.map((role) =>
          role.id === editingRoleId
            ? {
                ...role,
                name,
                description,
                scope: form.scope,
                permissionNames: [...form.permissionNames],
                permissions: form.permissionNames.length,
              }
            : role,
        ),
      );

      notify("Custom role updated.");
    } else {
      const newRole: Role = {
        id: `ROLE-${Date.now().toString().slice(-6)}`,
        name,
        description,
        users: 0,
        permissions: form.permissionNames.length,
        scope: form.scope,
        status: "Active",
        privileged: false,
        custom: true,
        permissionNames: [...form.permissionNames],
      };

      setRoles((current) => [newRole, ...current]);
      notify("Custom role created.");
    }

    closeForm();
  }

  function changeRoleStatus(role: Role) {
    setMenuRoleId(null);

    if (!role.custom) {
      notify("Built-in role status is protected.");
      return;
    }

    const nextStatus: RoleStatus =
      role.status === "Active" ? "Restricted" : "Active";

    setRoles((current) =>
      current.map((item) =>
        item.id === role.id
          ? { ...item, status: nextStatus }
          : item,
      ),
    );

    setSelectedRole((current) =>
      current?.id === role.id
        ? { ...current, status: nextStatus }
        : current,
    );

    notify(`${role.name} marked ${nextStatus.toLowerCase()}.`);
  }

  function togglePermission(permission: string) {
    setForm((current) => ({
      ...current,
      permissionNames: current.permissionNames.includes(permission)
        ? current.permissionNames.filter((item) => item !== permission)
        : [...current.permissionNames, permission],
    }));
  }

  return (
    <main
      style={{
        minHeight: "100%",
        padding: "28px clamp(16px, 3vw, 32px)",
        background: colors.background,
        color: colors.text,
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
            zIndex: 150,
            maxWidth: "min(420px, calc(100vw - 32px))",
            padding: "13px 15px",
            borderRadius: 10,
            background: "#172033",
            color: "#FFFFFF",
            boxShadow: "0 8px 28px #17203326",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span>{notice}</span>
          <button
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
            style={{
              ...buttonStyle,
              padding: 4,
              color: colors.text,
            }}
          >
            <X size={13} />
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
          marginBottom: 27,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 9,
              color: colors.muted,
              fontSize: 12,
              marginBottom: 12,
            }}
          >
            <span>Admin Console</span>
            <ChevronRight size={13} />
            <span>Access Management</span>
            <ChevronRight size={13} />
            <span style={{ color: colors.blue }}>Roles</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(23px, 3vw, 29px)",
              letterSpacing: -0.7,
              margin: "0 0 9px",
              fontWeight: 750,
            }}
          >
            Roles &amp; Access Management
          </h1>

          <p
            style={{
              color: colors.muted,
              fontSize: 14,
              lineHeight: 1.7,
              margin: 0,
              maxWidth: 720,
            }}
          >
            Manage role definitions, permission sets, and access scopes
            across the ModelNow platform.
          </p>
        </div>

        <button
          onClick={startCreate}
          style={{
            ...buttonStyle,
            background: colors.blue,
            color: "#FFFFFF",
            borderColor: colors.blue,
            padding: "11px 15px",
          }}
        >
          <Plus size={16} />
          Create custom role
        </button>
      </header>

      <section
        aria-label="Role overview metrics"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))",
          gap: 16,
          marginBottom: 26,
        }}
      >
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article
              key={metric.title}
              style={{ ...cardStyle, padding: 19 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: colors.muted,
                  }}
                >
                  {metric.title}
                </span>

                <span
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: 37,
                    height: 37,
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
                  fontSize: 12,
                  color: colors.muted,
                  margin: "7px 0 0",
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
          ...cardStyle,
          marginBottom: 24,
          overflow: "visible",
        }}
      >
        <div
          style={{
            padding: "21px 22px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
              Role Directory
            </h2>
            <p
              style={{
                margin: "6px 0 0",
                color: colors.muted,
                fontSize: 12,
              }}
            >
              {filteredRoles.length} of {roles.length} roles
            </p>
          </div>

          <button onClick={resetFilters} style={buttonStyle}>
            <RotateCcw size={14} />
            Reset filters
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 175px), 1fr))",
            gap: 12,
            padding: "17px 22px",
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div style={{ position: "relative" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 12,
                top: 12,
                color: colors.muted,
              }}
            />
            <input
              aria-label="Search roles"
              placeholder="Search roles..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
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
            <option value="Restricted">Restricted</option>
            <option value="Review Required">Review Required</option>
          </select>

          <select
            aria-label="Filter by scope"
            value={scopeFilter}
            onChange={(event) => setScopeFilter(event.target.value)}
            style={inputStyle}
          >
            <option value="All">All scopes</option>
            <option value="Global">Global</option>
            <option value="Organization">Organization</option>
            <option value="Workspace">Workspace</option>
          </select>

          <select
            aria-label="Filter by role type"
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value as RoleType)
            }
            style={inputStyle}
          >
            <option value="All">All role types</option>
            <option value="Built-in">Built-in roles</option>
            <option value="Custom">Custom roles</option>
          </select>
        </div>

        <div style={{ overflowX: "auto", width: "100%" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: 12,
              minWidth: 950,
            }}
          >
            <thead>
              <tr style={{ background: "#FAFBFD", color: colors.muted }}>
                {[
                  "ROLE",
                  "DESCRIPTION",
                  "USERS",
                  "PERMISSIONS",
                  "SCOPE",
                  "STATUS",
                  "TYPE",
                  "ACTIONS",
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      padding: "13px 15px",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 0.6,
                      whiteSpace: "nowrap",
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredRoles.map((role) => (
                <tr key={role.id}>
                  <td
                    style={{
                      padding: 15,
                      borderBottom: `1px solid ${colors.border}`,
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
                          display: "grid",
                          placeItems: "center",
                          width: 36,
                          height: 36,
                          borderRadius: 9,
                          background: role.privileged
                            ? "#FFF5DF"
                            : "#EDF2FF",
                          color: role.privileged
                            ? colors.amber
                            : colors.blue,
                          flexShrink: 0,
                        }}
                      >
                        {role.privileged ? (
                          <LockKeyhole size={16} />
                        ) : (
                          <ShieldCheck size={17} />
                        )}
                      </span>

                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 12,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {role.name}
                        </div>
                        <div
                          style={{
                            color: colors.muted,
                            fontSize: 10,
                            marginTop: 5,
                          }}
                        >
                          {role.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td
                    style={{
                      padding: 15,
                      borderBottom: `1px solid ${colors.border}`,
                      minWidth: 210,
                      maxWidth: 270,
                      lineHeight: 1.6,
                    }}
                  >
                    {role.description}
                  </td>

                  <td
                    style={{
                      padding: 15,
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Users size={14} color={colors.muted} />
                      {role.users.toLocaleString()}
                    </span>
                  </td>

                  <td
                    style={{
                      padding: 15,
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    {role.permissions}
                  </td>

                  <td
                    style={{
                      padding: 15,
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {role.scope === "Global" ? (
                        <Globe size={14} />
                      ) : role.scope === "Organization" ? (
                        <Building2 size={14} />
                      ) : (
                        <LayoutGrid size={14} />
                      )}
                      {role.scope}
                    </span>
                  </td>

                  <td
                    style={{
                      padding: 15,
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    <span
                      style={{
                        ...statusColors[role.status],
                        padding: "5px 9px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 650,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {role.status}
                    </span>
                  </td>

                  <td
                    style={{
                      padding: 15,
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    <span
                      style={{
                        padding: "5px 8px",
                        border: `1px solid ${colors.border}`,
                        borderRadius: 6,
                        fontSize: 11,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {role.custom ? "Custom" : "Built-in"}
                    </span>
                  </td>

                  <td
                    style={{
                      padding: 15,
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <button
                        aria-label={`View ${role.name}`}
                        title="View role"
                        onClick={() => {
                          setMenuRoleId(null);
                          setSelectedRole(role);
                        }}
                        style={{
                          ...buttonStyle,
                          padding: 7,
                          border: "none",
                        }}
                      >
                        <Eye size={16} />
                      </button>

                      <div style={{ position: "relative" }}>
                        <button
                          aria-label={`Actions for ${role.name}`}
                          title="Role actions"
                          onClick={() =>
                            setMenuRoleId((current) =>
                              current === role.id ? null : role.id,
                            )
                          }
                          style={{
                            ...buttonStyle,
                            padding: 7,
                            border: "none",
                          }}
                        >
                          <MoreHorizontal size={17} />
                        </button>

                        {menuRoleId === role.id && (
                          <div
                            style={{
                              position: "absolute",
                              right: 0,
                              top: 35,
                              width: 180,
                              background: "#FFFFFF",
                              border: `1px solid ${colors.border}`,
                              borderRadius: 10,
                              boxShadow: "0 10px 30px #1720331A",
                              zIndex: 20,
                              padding: 5,
                            }}
                          >
                            <button
                              onClick={() => {
                                setSelectedRole(role);
                                setMenuRoleId(null);
                              }}
                              style={menuItemStyle}
                            >
                              <Eye size={14} />
                              View details
                            </button>

                            <button
                              onClick={() => startEdit(role)}
                              style={{
                                ...menuItemStyle,
                                color: role.custom
                                  ? colors.text
                                  : colors.muted,
                              }}
                            >
                              <Pencil size={14} />
                              Edit role
                            </button>

                            {role.custom && (
                              <button
                                onClick={() => changeRoleStatus(role)}
                                style={{
                                  ...menuItemStyle,
                                  color:
                                    role.status === "Active"
                                      ? colors.red
                                      : colors.green,
                                }}
                              >
                                <ShieldCheck size={14} />
                                {role.status === "Active"
                                  ? "Restrict role"
                                  : "Activate role"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredRoles.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      padding: 45,
                      textAlign: "center",
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    <Search size={23} color={colors.muted} />
                    <p
                      style={{
                        color: colors.muted,
                        marginBottom: 0,
                      }}
                    >
                      No roles match your search or filters.
                    </p>
                    <button
                      onClick={resetFilters}
                      style={{ ...buttonStyle, marginTop: 12 }}
                    >
                      Reset filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            padding: "14px 22px",
            color: colors.muted,
            fontSize: 11,
          }}
        >
          <span>Showing {filteredRoles.length} role(s)</span>
          <span>Roles &amp; Access · Overview</span>
        </div>
      </section>

      <section style={{ ...cardStyle, padding: 22 }}>
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 17, margin: "0 0 7px" }}>
            Access governance
          </h2>
          <p
            style={{
              fontSize: 12,
              color: colors.muted,
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Review the main controls used to govern access across ModelNow.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
            gap: 13,
          }}
        >
          {[
            [
              "Role-based access",
              "Organize permissions into reusable role definitions.",
            ],
            [
              "Permission management",
              "Define the actions each role is intended to allow.",
            ],
            [
              "Access scopes",
              "Separate global, organization, and workspace access.",
            ],
            [
              "Privileged access",
              "Identify roles marked as having elevated access.",
            ],
            [
              "Review workflow",
              "Highlight roles that require administrative review.",
            ],
            [
              "Custom role controls",
              "Create and update custom role definitions.",
            ],
          ].map(([title, description]) => (
            <article
              key={title}
              style={{
                border: `1px solid ${colors.border}`,
                borderRadius: 10,
                padding: 15,
                display: "flex",
                gap: 11,
              }}
            >
              <span style={{ color: colors.blue, paddingTop: 2 }}>
                <ShieldCheck size={17} />
              </span>
              <div>
                <h3 style={{ margin: "0 0 6px", fontSize: 12 }}>
                  {title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: colors.muted,
                    fontSize: 11,
                    lineHeight: 1.6,
                  }}
                >
                  {description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {showForm && (
        <div
          style={overlayStyle}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-form-title"
            style={modalStyle}
          >
            <div style={modalHeaderStyle}>
              <div>
                <h2
                  id="role-form-title"
                  style={{ margin: 0, fontSize: 19 }}
                >
                  {editingRoleId ? "Edit custom role" : "Create custom role"}
                </h2>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 12,
                    color: colors.muted,
                  }}
                >
                  Choose a scope and the permissions for this role.
                </p>
              </div>

              <button
                aria-label="Close form"
                onClick={closeForm}
                style={{ ...buttonStyle, padding: 7 }}
              >
                <X size={17} />
              </button>
            </div>

            <form
              onSubmit={saveRole}
              style={{ padding: 22, display: "grid", gap: 15 }}
            >
              <label style={labelStyle}>
                Role name
                <input
                  required
                  maxLength={80}
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="e.g. Analytics Reviewer"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Description
                <textarea
                  required
                  maxLength={250}
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
                    })
                  }
                  placeholder="Describe the responsibilities of this role"
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </label>

              <label style={labelStyle}>
                Access scope
                <select
                  value={form.scope}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      scope: event.target.value as RoleScope,
                    })
                  }
                  style={inputStyle}
                >
                  <option value="Global">Global</option>
                  <option value="Organization">Organization</option>
                  <option value="Workspace">Workspace</option>
                </select>
              </label>

              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 650,
                    marginBottom: 9,
                  }}
                >
                  Permissions
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
                    gap: 8,
                  }}
                >
                  {availablePermissions.map((permission) => (
                    <label
                      key={permission}
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        padding: 10,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 8,
                        fontSize: 11,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={form.permissionNames.includes(permission)}
                        onChange={() => togglePermission(permission)}
                      />
                      {permission}
                    </label>
                  ))}
                </div>

                <p
                  style={{
                    color: colors.muted,
                    fontSize: 11,
                    marginBottom: 0,
                  }}
                >
                  {form.permissionNames.length} permission(s) selected
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 9,
                  marginTop: 5,
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={closeForm}
                  style={buttonStyle}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    ...buttonStyle,
                    background: colors.blue,
                    color: "#FFFFFF",
                    borderColor: colors.blue,
                  }}
                >
                  <Check size={15} />
                  {editingRoleId ? "Save changes" : "Create role"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selectedRole && (
        <div
          style={overlayStyle}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedRole(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-details-title"
            style={modalStyle}
          >
            <div style={modalHeaderStyle}>
              <div>
                <h2
                  id="role-details-title"
                  style={{ margin: 0, fontSize: 19 }}
                >
                  Role details
                </h2>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 12,
                    color: colors.muted,
                  }}
                >
                  {selectedRole.id}
                </p>
              </div>

              <button
                aria-label="Close role details"
                onClick={() => setSelectedRole(null)}
                style={{ ...buttonStyle, padding: 7 }}
              >
                <X size={17} />
              </button>
            </div>

            <div style={{ padding: 22 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <span
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    background: "#EDF2FF",
                    color: colors.blue,
                  }}
                >
                  <ShieldCheck size={23} />
                </span>

                <div>
                  <h3
                    style={{
                      margin: "0 0 6px",
                      fontSize: 17,
                    }}
                  >
                    {selectedRole.name}
                  </h3>

                  <span
                    style={{
                      ...statusColors[selectedRole.status],
                      padding: "4px 9px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 650,
                    }}
                  >
                    {selectedRole.status}
                  </span>
                </div>
              </div>

              <p
                style={{
                  color: colors.muted,
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                {selectedRole.description}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 16,
                  margin: "20px 0",
                }}
              >
                {[
                  ["Assigned users", selectedRole.users.toLocaleString()],
                  ["Permissions", selectedRole.permissions.toLocaleString()],
                  ["Scope", selectedRole.scope],
                  ["Role type", selectedRole.custom ? "Custom" : "Built-in"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div
                      style={{
                        color: colors.muted,
                        fontSize: 11,
                        marginBottom: 6,
                      }}
                    >
                      {label}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 650 }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <h3 style={{ fontSize: 13, marginBottom: 10 }}>
                Permission summary
              </h3>

              {selectedRole.permissionNames.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 7,
                  }}
                >
                  {selectedRole.permissionNames.map((permission) => (
                    <span
                      key={permission}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "7px 9px",
                        borderRadius: 7,
                        border: `1px solid ${colors.border}`,
                        fontSize: 11,
                      }}
                    >
                      <Check size={12} color={colors.green} />
                      {permission}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 12, color: colors.muted }}>
                  No individual permissions are listed for this role.
                </p>
              )}

              {selectedRole.privileged && (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start",
                    padding: 12,
                    marginTop: 18,
                    borderRadius: 9,
                    background: "#FFF5DF",
                    color: "#8A4B08",
                    fontSize: 11,
                    lineHeight: 1.6,
                  }}
                >
                  <AlertTriangle size={16} />
                  <span>
                    This role is marked as privileged. Review its access
                    before assigning it to users.
                  </span>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 9,
                  marginTop: 24,
                  flexWrap: "wrap",
                }}
              >
                {selectedRole.custom && (
                  <button
                    onClick={() => startEdit(selectedRole)}
                    style={buttonStyle}
                  >
                    <Pencil size={14} />
                    Edit role
                  </button>
                )}

                <button
                  onClick={() => setSelectedRole(null)}
                  style={buttonStyle}
                >
                  Close
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          marginTop: 18,
          color: colors.muted,
          fontSize: 11,
        }}
      >
        <SlidersHorizontal size={13} />
        Overview of role definitions, access scopes, and permission controls.
      </div>
    </main>
  );
}