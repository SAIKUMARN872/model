
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  ShieldCheck,
  Users,
  KeyRound,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  X,
  Check,
  LockKeyhole,
  RefreshCw,
} from "lucide-react";

type CustomRole = {
  id: string;
  name: string;
  description: string;
  scope: "Organization" | "Workspace" | "Global";
  status: "Active" | "Inactive" | "Review Required";
  users: number;
  permissions: string[];
  createdAt: string;
};

const availablePermissions = [
  "View dashboard",
  "View analytics",
  "View audit logs",
  "Manage users",
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

const initialRoles: CustomRole[] = [
  {
    id: "CROLE-1001",
    name: "Support Manager",
    description: "Manages customer support operations and team access.",
    scope: "Organization",
    status: "Active",
    users: 8,
    permissions: [
      "View dashboard",
      "View analytics",
      "Manage users",
    ],
    createdAt: "Oct 12, 2026",
  },
  {
    id: "CROLE-1002",
    name: "Workspace Analyst",
    description: "Views workspace analytics and operational reports.",
    scope: "Workspace",
    status: "Active",
    users: 15,
    permissions: [
      "View dashboard",
      "View analytics",
      "View audit logs",
    ],
    createdAt: "Oct 18, 2026",
  },
  {
    id: "CROLE-1003",
    name: "Billing Reviewer",
    description: "Reviews billing activity and subscription information.",
    scope: "Organization",
    status: "Review Required",
    users: 3,
    permissions: [
      "View dashboard",
      "Manage billing",
      "Manage subscriptions",
    ],
    createdAt: "Oct 22, 2026",
  },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 13px",
  border: "1px solid #dce3ee",
  borderRadius: 9,
  background: "#fff",
  color: "#172b4d",
  fontSize: 14,
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "10px 14px",
  borderRadius: 9,
  border: "1px solid #dce3ee",
  background: "#fff",
  color: "#243b60",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

export default function CustomRolesPage() {
  const [roles, setRoles] = useState<CustomRole[]>(initialRoles);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [scopeFilter, setScopeFilter] = useState("All scopes");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<CustomRole | null>(null);
  const [viewRole, setViewRole] = useState<CustomRole | null>(null);
  const [menuRoleId, setMenuRoleId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    scope: "Organization" as CustomRole["scope"],
    permissions: [] as string[],
  });

  const filteredRoles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return roles.filter((role) => {
      const matchesSearch =
        !query ||
        role.name.toLowerCase().includes(query) ||
        role.id.toLowerCase().includes(query) ||
        role.description.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All statuses" || role.status === statusFilter;

      const matchesScope =
        scopeFilter === "All scopes" || role.scope === scopeFilter;

      return matchesSearch && matchesStatus && matchesScope;
    });
  }, [roles, search, statusFilter, scopeFilter]);

  const activeCount = roles.filter((role) => role.status === "Active").length;
  const reviewCount = roles.filter(
    (role) => role.status === "Review Required",
  ).length;
  const assignedUsers = roles.reduce((total, role) => total + role.users, 0);

  function openCreateModal() {
    setSelectedRole(null);
    setForm({
      name: "",
      description: "",
      scope: "Organization",
      permissions: [],
    });
    setModalOpen(true);
    setNotice("");
  }

  function openEditModal(role: CustomRole) {
    setSelectedRole(role);
    setForm({
      name: role.name,
      description: role.description,
      scope: role.scope,
      permissions: [...role.permissions],
    });
    setModalOpen(true);
    setMenuRoleId(null);
    setNotice("");
  }

  function togglePermission(permission: string) {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((item) => item !== permission)
        : [...current.permissions, permission],
    }));
  }

  function saveRole() {
    if (!form.name.trim()) {
      setNotice("Enter a role name before saving.");
      return;
    }

    if (form.permissions.length === 0) {
      setNotice("Select at least one permission.");
      return;
    }

    const duplicate = roles.some(
      (role) =>
        role.name.toLowerCase() === form.name.trim().toLowerCase() &&
        role.id !== selectedRole?.id,
    );

    if (duplicate) {
      setNotice("A role with this name already exists.");
      return;
    }

    if (selectedRole) {
      setRoles((current) =>
        current.map((role) =>
          role.id === selectedRole.id
            ? {
                ...role,
                name: form.name.trim(),
                description: form.description.trim(),
                scope: form.scope,
                permissions: form.permissions,
              }
            : role,
        ),
      );
      setNotice("Custom role updated.");
    } else {
      const newRole: CustomRole = {
        id: `CROLE-${Date.now().toString().slice(-6)}`,
        name: form.name.trim(),
        description: form.description.trim(),
        scope: form.scope,
        status: "Active",
        users: 0,
        permissions: form.permissions,
        createdAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
      };

      setRoles((current) => [newRole, ...current]);
      setNotice("Custom role created.");
    }

    setModalOpen(false);
  }

  function toggleStatus(role: CustomRole) {
    setRoles((current) =>
      current.map((item) =>
        item.id === role.id
          ? {
              ...item,
              status: item.status === "Inactive" ? "Active" : "Inactive",
            }
          : item,
      ),
    );
    setMenuRoleId(null);
  }

  function deleteRole(role: CustomRole) {
    const confirmed = window.confirm(
      `Delete the custom role "${role.name}"?`,
    );

    if (!confirmed) return;

    setRoles((current) => current.filter((item) => item.id !== role.id));
    setMenuRoleId(null);
    setViewRole(null);
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("All statuses");
    setScopeFilter("All scopes");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "28px",
        color: "#172b4d",
      }}
    >
      <div style={{ maxWidth: 1450, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 18,
            flexWrap: "wrap",
            marginBottom: 26,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                color: "#7b8aa3",
                marginBottom: 12,
              }}
            >
              ModelNow　›　Roles　›　Custom Roles
            </div>

            <h1
              style={{
                fontSize: 30,
                fontWeight: 750,
                letterSpacing: "-0.8px",
                margin: "0 0 9px",
                color: "#102544",
              }}
            >
              Custom Roles
            </h1>

            <p
              style={{
                color: "#6b7d98",
                fontSize: 14,
                margin: 0,
                lineHeight: 1.7,
              }}
            >
              Create and manage organization-specific roles and their
              permissions across ModelNow.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            style={{
              ...buttonStyle,
              background: "#315efb",
              color: "#fff",
              borderColor: "#315efb",
              padding: "12px 16px",
            }}
          >
            <Plus size={17} />
            Create custom role
          </button>
        </div>

        {notice && !modalOpen && (
          <div
            style={{
              padding: 12,
              marginBottom: 18,
              background: "#ecfdf3",
              border: "1px solid #b7ebc9",
              borderRadius: 9,
              color: "#167747",
              fontSize: 13,
            }}
          >
            {notice}
            <button
              type="button"
              onClick={() => setNotice("")}
              style={{
                float: "right",
                border: 0,
                background: "transparent",
                cursor: "pointer",
              }}
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>
        )}

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {[
            {
              label: "Custom roles",
              value: roles.length,
              detail: "Organization-defined roles",
              icon: <ShieldCheck size={21} />,
              color: "#315efb",
              bg: "#edf2ff",
            },
            {
              label: "Active roles",
              value: activeCount,
              detail: "Currently available",
              icon: <Check size={21} />,
              color: "#13864b",
              bg: "#e8f8ef",
            },
            {
              label: "Assigned users",
              value: assignedUsers,
              detail: "Across custom roles",
              icon: <Users size={21} />,
              color: "#7c3aed",
              bg: "#f2eaff",
            },
            {
              label: "Needs review",
              value: reviewCount,
              detail: "Roles requiring attention",
              icon: <LockKeyhole size={21} />,
              color: "#c45b08",
              bg: "#fff3df",
            },
          ].map((metric) => (
            <div
              key={metric.label}
              style={{
                background: "#fff",
                border: "1px solid #e1e7f0",
                borderRadius: 15,
                padding: 22,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 18,
                }}
              >
                <span style={{ fontSize: 13, color: "#647692" }}>
                  {metric.label}
                </span>
                <span
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    color: metric.color,
                    background: metric.bg,
                  }}
                >
                  {metric.icon}
                </span>
              </div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 750,
                  color: "#102544",
                }}
              >
                {metric.value}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#8290a7",
                  marginTop: 5,
                }}
              >
                {metric.detail}
              </div>
            </div>
          ))}
        </section>

        <section
          style={{
            background: "#fff",
            border: "1px solid #e1e7f0",
            borderRadius: 15,
            overflow: "visible",
          }}
        >
          <div
            style={{
              padding: "21px 24px",
              borderBottom: "1px solid #e8edf4",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  color: "#102544",
                  fontWeight: 700,
                }}
              >
                Custom role directory
              </h2>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 13,
                  color: "#7b8aa3",
                }}
              >
                Showing {filteredRoles.length} of {roles.length} custom roles
              </p>
            </div>

            <button
              type="button"
              onClick={resetFilters}
              style={buttonStyle}
            >
              <RefreshCw size={15} />
              Reset filters
            </button>
          </div>

          <div
            style={{
              padding: "17px 24px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: 12,
              borderBottom: "1px solid #e8edf4",
            }}
          >
            <div style={{ position: "relative" }}>
              <Search
                size={17}
                style={{
                  position: "absolute",
                  left: 13,
                  top: 13,
                  color: "#8190a7",
                }}
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, ID, description..."
                aria-label="Search custom roles"
                style={{ ...inputStyle, paddingLeft: 39 }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
              style={inputStyle}
            >
              <option>All statuses</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Review Required</option>
            </select>

            <select
              value={scopeFilter}
              onChange={(event) => setScopeFilter(event.target.value)}
              aria-label="Filter by scope"
              style={inputStyle}
            >
              <option>All scopes</option>
              <option>Global</option>
              <option>Organization</option>
              <option>Workspace</option>
            </select>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 950,
                textAlign: "left",
              }}
            >
              <thead>
                <tr style={{ background: "#f8fafd" }}>
                  {[
                    "ROLE",
                    "SCOPE",
                    "USERS",
                    "PERMISSIONS",
                    "CREATED",
                    "STATUS",
                    "ACTIONS",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: "14px 18px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#75849d",
                        borderBottom: "1px solid #e4eaf2",
                        whiteSpace: "nowrap",
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
                        padding: "17px 18px",
                        borderBottom: "1px solid #edf0f5",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            flexShrink: 0,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: 11,
                            background: "#edf2ff",
                            color: "#315efb",
                          }}
                        >
                          <ShieldCheck size={19} />
                        </div>
                        <div>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: 13,
                              color: "#172b4d",
                            }}
                          >
                            {role.name}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "#8492a8",
                              marginTop: 5,
                            }}
                          >
                            {role.id}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#71819a",
                              marginTop: 5,
                              maxWidth: 300,
                              lineHeight: 1.5,
                            }}
                          >
                            {role.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td
                      style={{
                        padding: "17px 18px",
                        fontSize: 13,
                        borderBottom: "1px solid #edf0f5",
                      }}
                    >
                      {role.scope}
                    </td>

                    <td
                      style={{
                        padding: "17px 18px",
                        fontSize: 13,
                        borderBottom: "1px solid #edf0f5",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Users size={15} color="#8190a7" />
                        {role.users}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: "17px 18px",
                        fontSize: 13,
                        borderBottom: "1px solid #edf0f5",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <KeyRound size={14} color="#8190a7" />
                        {role.permissions.length}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: "17px 18px",
                        fontSize: 12,
                        color: "#647692",
                        borderBottom: "1px solid #edf0f5",
                      }}
                    >
                      {role.createdAt}
                    </td>

                    <td
                      style={{
                        padding: "17px 18px",
                        borderBottom: "1px solid #edf0f5",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          padding: "6px 10px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                          color:
                            role.status === "Active"
                              ? "#087443"
                              : role.status === "Inactive"
                                ? "#64748b"
                                : "#a45a00",
                          background:
                            role.status === "Active"
                              ? "#e8f8ef"
                              : role.status === "Inactive"
                                ? "#edf0f5"
                                : "#fff3df",
                        }}
                      >
                        {role.status}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: "17px 18px",
                        borderBottom: "1px solid #edf0f5",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 7,
                          alignItems: "center",
                        }}
                      >
                        <button
                          type="button"
                          title="View role"
                          aria-label={`View ${role.name}`}
                          onClick={() => setViewRole(role)}
                          style={{
                            ...buttonStyle,
                            padding: 9,
                          }}
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          type="button"
                          title="Edit role"
                          aria-label={`Edit ${role.name}`}
                          onClick={() => openEditModal(role)}
                          style={{
                            ...buttonStyle,
                            padding: 9,
                          }}
                        >
                          <Pencil size={15} />
                        </button>

                        <div style={{ position: "relative" }}>
                          <button
                            type="button"
                            title="More actions"
                            aria-label={`More actions for ${role.name}`}
                            onClick={() =>
                              setMenuRoleId(
                                menuRoleId === role.id ? null : role.id,
                              )
                            }
                            style={{
                              ...buttonStyle,
                              padding: 9,
                            }}
                          >
                            <MoreHorizontal size={16} />
                          </button>

                          {menuRoleId === role.id && (
                            <div
                              style={{
                                position: "absolute",
                                right: 0,
                                top: 40,
                                width: 175,
                                zIndex: 10,
                                padding: 6,
                                background: "#fff",
                                border: "1px solid #e1e7f0",
                                borderRadius: 10,
                                boxShadow: "0 12px 32px #14233a1a",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => toggleStatus(role)}
                                style={{
                                  ...buttonStyle,
                                  width: "100%",
                                  justifyContent: "flex-start",
                                  border: 0,
                                  padding: 10,
                                }}
                              >
                                <RefreshCw size={14} />
                                {role.status === "Inactive"
                                  ? "Activate role"
                                  : "Deactivate role"}
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteRole(role)}
                                style={{
                                  ...buttonStyle,
                                  width: "100%",
                                  justifyContent: "flex-start",
                                  border: 0,
                                  padding: 10,
                                  color: "#c0392b",
                                }}
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
                    <td
                      colSpan={7}
                      style={{
                        padding: 45,
                        textAlign: "center",
                        color: "#7b8aa3",
                      }}
                    >
                      <ShieldCheck
                        size={28}
                        style={{ margin: "0 auto 10px" }}
                      />
                      <div style={{ fontWeight: 700, color: "#334764" }}>
                        No custom roles found
                      </div>
                      <p style={{ fontSize: 13 }}>
                        Try changing your filters or create a new custom role.
                      </p>
                      <button
                        type="button"
                        onClick={openCreateModal}
                        style={{
                          ...buttonStyle,
                          background: "#315efb",
                          color: "#fff",
                          borderColor: "#315efb",
                        }}
                      >
                        <Plus size={15} />
                        Create custom role
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div
          style={{
            marginTop: 20,
            padding: 16,
            background: "#eef4ff",
            border: "1px solid #d9e5ff",
            borderRadius: 12,
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <LockKeyhole
            size={19}
            color="#315efb"
            style={{ flexShrink: 0, marginTop: 2 }}
          />
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 13,
                color: "#24478d",
              }}
            >
              Custom role governance
            </div>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 12,
                lineHeight: 1.7,
                color: "#55709e",
              }}
            >
              Assign only the permissions required for each role. Review
              privileged access regularly and deactivate roles that are no
              longer needed.
            </p>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalOpen(false);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "#10254480",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="custom-role-modal-title"
            style={{
              width: "100%",
              maxWidth: 720,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 25px 80px #10254433",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "22px 24px",
                borderBottom: "1px solid #e8edf4",
              }}
            >
              <div>
                <h2
                  id="custom-role-modal-title"
                  style={{
                    margin: 0,
                    fontSize: 20,
                    color: "#102544",
                  }}
                >
                  {selectedRole ? "Edit custom role" : "Create custom role"}
                </h2>
                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#7b8aa3",
                    fontSize: 12,
                  }}
                >
                  Define the role details, scope, and permissions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close dialog"
                style={{ ...buttonStyle, padding: 8 }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                padding: 24,
                display: "grid",
                gap: 18,
              }}
            >
              <label
                style={{
                  display: "grid",
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Role name *
                <input
                  autoFocus
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. Customer Success Manager"
                  style={inputStyle}
                />
              </label>

              <label
                style={{
                  display: "grid",
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Description
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Describe the responsibilities of this role..."
                  rows={3}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
              </label>

              <label
                style={{
                  display: "grid",
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Access scope
                <select
                  value={form.scope}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      scope: event.target.value as CustomRole["scope"],
                    }))
                  }
                  style={inputStyle}
                >
                  <option>Organization</option>
                  <option>Workspace</option>
                  <option>Global</option>
                </select>
              </label>

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#172b4d",
                      }}
                    >
                      Permissions
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#7b8aa3",
                        marginTop: 4,
                      }}
                    >
                      Choose what members assigned this role can access.
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#315efb",
                    }}
                  >
                    {form.permissions.length} selected
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(230px, 1fr))",
                    gap: 9,
                  }}
                >
                  {availablePermissions.map((permission) => {
                    const checked = form.permissions.includes(permission);

                    return (
                      <label
                        key={permission}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: 12,
                          border: `1px solid ${
                            checked ? "#9db5ff" : "#e1e7f0"
                          }`,
                          borderRadius: 9,
                          background: checked ? "#f1f5ff" : "#fff",
                          cursor: "pointer",
                          fontSize: 12,
                          color: "#334764",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePermission(permission)}
                          style={{
                            accentColor: "#315efb",
                            width: 15,
                            height: 15,
                          }}
                        />
                        {permission}
                      </label>
                    );
                  })}
                </div>
              </div>

              {notice && (
                <div
                  role="alert"
                  style={{
                    padding: 11,
                    borderRadius: 8,
                    color: "#a13225",
                    background: "#fff0ee",
                    fontSize: 13,
                  }}
                >
                  {notice}
                </div>
              )}
            </div>

            <div
              style={{
                padding: "17px 24px",
                borderTop: "1px solid #e8edf4",
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={buttonStyle}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveRole}
                style={{
                  ...buttonStyle,
                  background: "#315efb",
                  color: "#fff",
                  borderColor: "#315efb",
                }}
              >
                <Check size={16} />
                {selectedRole ? "Save changes" : "Create role"}
              </button>
            </div>
          </section>
        </div>
      )}

      {viewRole && (
        <div
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setViewRole(null);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "#10254480",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="view-custom-role-title"
            style={{
              width: "100%",
              maxWidth: 560,
              maxHeight: "85vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 25px 80px #10254433",
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
                <h2
                  id="view-custom-role-title"
                  style={{
                    fontSize: 21,
                    margin: "0 0 7px",
                    color: "#102544",
                  }}
                >
                  {viewRole.name}
                </h2>
                <div
                  style={{
                    fontSize: 12,
                    color: "#8492a8",
                  }}
                >
                  {viewRole.id}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewRole(null)}
                aria-label="Close details"
                style={{ ...buttonStyle, padding: 8 }}
              >
                <X size={17} />
              </button>
            </div>

            <p
              style={{
                color: "#647692",
                fontSize: 13,
                lineHeight: 1.7,
                margin: "16px 0",
              }}
            >
              {viewRole.description || "No description provided."}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 10,
                marginBottom: 22,
              }}
            >
              {[
                ["Scope", viewRole.scope],
                ["Users", String(viewRole.users)],
                ["Permissions", String(viewRole.permissions.length)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: "#f5f7fb",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "#8190a7",
                      marginBottom: 7,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#172b4d",
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <h3
              style={{
                fontSize: 14,
                margin: "0 0 12px",
                color: "#172b4d",
              }}
            >
              Assigned permissions
            </h3>

            <div style={{ display: "grid", gap: 9 }}>
              {viewRole.permissions.map((permission) => (
                <div
                  key={permission}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    fontSize: 13,
                    color: "#425875",
                  }}
                >
                  <Check size={15} color="#13864b" />
                  {permission}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                const role = viewRole;
                setViewRole(null);
                openEditModal(role);
              }}
              style={{
                ...buttonStyle,
                marginTop: 24,
                background: "#315efb",
                color: "#fff",
                borderColor: "#315efb",
              }}
            >
              <Pencil size={15} />
              Edit role
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
