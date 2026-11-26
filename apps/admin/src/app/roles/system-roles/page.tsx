
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Shield,
  LockKeyhole,
  Users,
  KeyRound,
  Eye,
  X,
  Check,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

type SystemRole = {
  id: string;
  name: string;
  description: string;
  scope: "Global" | "Organization" | "Workspace";
  users: number;
  permissions: number;
  status: "Active" | "Restricted" | "Review Required";
  level: "Critical" | "High" | "Standard";
};

const systemRoles: SystemRole[] = [
  {
    id: "SYS-1001",
    name: "Super Administrator",
    description:
      "Full platform administration, security configuration, and system-wide access.",
    scope: "Global",
    users: 4,
    permissions: 148,
    status: "Active",
    level: "Critical",
  },
  {
    id: "SYS-1002",
    name: "Platform Administrator",
    description:
      "Manages platform configuration, services, and operational settings.",
    scope: "Global",
    users: 12,
    permissions: 112,
    status: "Active",
    level: "Critical",
  },
  {
    id: "SYS-1003",
    name: "Organization Administrator",
    description:
      "Manages organization resources, members, and organization settings.",
    scope: "Organization",
    users: 86,
    permissions: 74,
    status: "Active",
    level: "High",
  },
  {
    id: "SYS-1004",
    name: "Workspace Administrator",
    description:
      "Manages workspace members, settings, and workspace-level resources.",
    scope: "Workspace",
    users: 248,
    permissions: 52,
    status: "Active",
    level: "High",
  },
  {
    id: "SYS-1005",
    name: "Security Auditor",
    description:
      "Reviews security events, audit trails, and access-control activity.",
    scope: "Global",
    users: 18,
    permissions: 34,
    status: "Restricted",
    level: "High",
  },
  {
    id: "SYS-1006",
    name: "Billing Administrator",
    description:
      "Oversees billing operations, subscriptions, and payment settings.",
    scope: "Organization",
    users: 22,
    permissions: 28,
    status: "Review Required",
    level: "Standard",
  },
];

const permissionGroups = [
  {
    name: "Platform access",
    permissions: [
      "View dashboard",
      "View analytics",
      "Manage platform settings",
      "Manage models",
    ],
  },
  {
    name: "Organization management",
    permissions: [
      "Manage organizations",
      "Manage organization members",
      "Manage organization settings",
    ],
  },
  {
    name: "Security and auditing",
    permissions: [
      "View audit logs",
      "View security events",
      "Export audit reports",
    ],
  },
  {
    name: "Billing and subscriptions",
    permissions: [
      "Manage billing",
      "Manage subscriptions",
    ],
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
  fontSize: 13,
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "10px 13px",
  border: "1px solid #dce3ee",
  borderRadius: 9,
  background: "#fff",
  color: "#304561",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

export default function SystemRolesPage() {
  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState("All scopes");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [selectedRole, setSelectedRole] = useState<SystemRole | null>(null);
  const [notice, setNotice] = useState("");

  const filteredRoles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return systemRoles.filter((role) => {
      const matchesSearch =
        !query ||
        role.name.toLowerCase().includes(query) ||
        role.id.toLowerCase().includes(query) ||
        role.description.toLowerCase().includes(query);

      const matchesScope =
        scopeFilter === "All scopes" || role.scope === scopeFilter;

      const matchesStatus =
        statusFilter === "All statuses" || role.status === statusFilter;

      return matchesSearch && matchesScope && matchesStatus;
    });
  }, [search, scopeFilter, statusFilter]);

  const activeRoles = systemRoles.filter(
    (role) => role.status === "Active",
  ).length;

  const criticalRoles = systemRoles.filter(
    (role) => role.level === "Critical",
  ).length;

  const assignedUsers = systemRoles.reduce(
    (total, role) => total + role.users,
    0,
  );

  function resetFilters() {
    setSearch("");
    setScopeFilter("All scopes");
    setStatusFilter("All statuses");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 28,
        background: "#f5f7fb",
        color: "#172b4d",
      }}
    >
      <div style={{ maxWidth: 1450, margin: "0 auto" }}>
        <div style={{ marginBottom: 26 }}>
          <div
            style={{
              fontSize: 12,
              color: "#7b8aa3",
              marginBottom: 12,
            }}
          >
            ModelNow　›　Roles　›　System Roles
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 18,
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 30,
                  fontWeight: 750,
                  letterSpacing: "-0.8px",
                  margin: "0 0 9px",
                  color: "#102544",
                }}
              >
                System Roles
              </h1>
              <p
                style={{
                  color: "#6b7d98",
                  fontSize: 14,
                  margin: 0,
                  lineHeight: 1.7,
                }}
              >
                Review ModelNow built-in roles, access scopes, and security
                privileges.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 13px",
                border: "1px solid #dce3ee",
                borderRadius: 10,
                background: "#fff",
                color: "#647692",
                fontSize: 12,
              }}
            >
              <LockKeyhole size={16} />
              System-managed roles
            </div>
          </div>
        </div>

        {notice && (
          <div
            role="status"
            style={{
              marginBottom: 18,
              padding: 12,
              borderRadius: 9,
              background: "#ecfdf3",
              border: "1px solid #b7ebc9",
              color: "#167747",
              fontSize: 13,
            }}
          >
            {notice}
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
              style={{
                float: "right",
                border: 0,
                background: "transparent",
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
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {[
            {
              label: "System roles",
              value: systemRoles.length,
              detail: "Built-in role definitions",
              icon: <Shield size={21} />,
              color: "#315efb",
              bg: "#edf2ff",
            },
            {
              label: "Active roles",
              value: activeRoles,
              detail: "Currently marked active",
              icon: <ShieldCheck size={21} />,
              color: "#13864b",
              bg: "#e8f8ef",
            },
            {
              label: "Critical roles",
              value: criticalRoles,
              detail: "Highest privilege level",
              icon: <LockKeyhole size={21} />,
              color: "#c45b08",
              bg: "#fff3df",
            },
            {
              label: "Role assignments",
              value: assignedUsers,
              detail: "Sample assignments across roles",
              icon: <Users size={21} />,
              color: "#7c3aed",
              bg: "#f2eaff",
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
            overflow: "hidden",
            marginBottom: 22,
          }}
        >
          <div
            style={{
              padding: "21px 24px",
              borderBottom: "1px solid #e8edf4",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 14,
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  color: "#102544",
                }}
              >
                Built-in role directory
              </h2>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 13,
                  color: "#7b8aa3",
                }}
              >
                Showing {filteredRoles.length} of {systemRoles.length} roles
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
                aria-label="Search system roles"
                style={{ ...inputStyle, paddingLeft: 39 }}
              />
            </div>

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

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
              style={inputStyle}
            >
              <option>All statuses</option>
              <option>Active</option>
              <option>Restricted</option>
              <option>Review Required</option>
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
                <tr style={{ background: "#f8fafd" }}>
                  {[
                    "SYSTEM ROLE",
                    "ACCESS SCOPE",
                    "USERS",
                    "PERMISSIONS",
                    "PRIVILEGE",
                    "STATUS",
                    "DETAILS",
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
                            display: "grid",
                            placeItems: "center",
                            borderRadius: 11,
                            background: "#fff3df",
                            color: "#c45b08",
                            flexShrink: 0,
                          }}
                        >
                          <LockKeyhole size={18} />
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
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
                              maxWidth: 330,
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
                        <KeyRound size={15} color="#8190a7" />
                        {role.permissions}
                      </span>
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
                          padding: "6px 9px",
                          borderRadius: 7,
                          background:
                            role.level === "Critical"
                              ? "#fff0ee"
                              : role.level === "High"
                                ? "#fff5e6"
                                : "#edf2ff",
                          color:
                            role.level === "Critical"
                              ? "#b42318"
                              : role.level === "High"
                                ? "#a45a00"
                                : "#315efb",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {role.level}
                      </span>
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
                              : role.status === "Restricted"
                                ? "#a45a00"
                                : "#315efb",
                          background:
                            role.status === "Active"
                              ? "#e8f8ef"
                              : role.status === "Restricted"
                                ? "#fff3df"
                                : "#edf2ff",
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
                      <button
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        style={buttonStyle}
                      >
                        <Eye size={15} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredRoles.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        padding: 40,
                        textAlign: "center",
                        color: "#7b8aa3",
                      }}
                    >
                      No system roles match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          <div
            style={{
              padding: 20,
              background: "#fff",
              border: "1px solid #e1e7f0",
              borderRadius: 13,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <LockKeyhole size={19} color="#c45b08" />
              <h3 style={{ margin: 0, fontSize: 14 }}>
                Protected system roles
              </h3>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                lineHeight: 1.8,
                color: "#71819a",
              }}
            >
              Built-in roles are system-managed. Role changes should be
              controlled through approved administrative workflows.
            </p>
          </div>

          <div
            style={{
              padding: 20,
              background: "#fff",
              border: "1px solid #e1e7f0",
              borderRadius: 13,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <AlertTriangle size={19} color="#315efb" />
              <h3 style={{ margin: 0, fontSize: 14 }}>
                Least-privilege access
              </h3>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                lineHeight: 1.8,
                color: "#71819a",
              }}
            >
              Grant users only the access they need. Review high-privilege
              assignments and remove unnecessary access.
            </p>
          </div>
        </section>
      </div>

      {selectedRole && (
        <div
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedRole(null);
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
            aria-labelledby="system-role-details-title"
            style={{
              width: "100%",
              maxWidth: 620,
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
                  id="system-role-details-title"
                  style={{
                    fontSize: 21,
                    margin: "0 0 7px",
                    color: "#102544",
                  }}
                >
                  {selectedRole.name}
                </h2>
                <div
                  style={{
                    fontSize: 12,
                    color: "#8492a8",
                  }}
                >
                  {selectedRole.id} · System-managed role
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                aria-label="Close role details"
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
              {selectedRole.description}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: 10,
                marginBottom: 22,
              }}
            >
              {[
                ["Scope", selectedRole.scope],
                ["Assigned users", String(selectedRole.users)],
                ["Permissions", String(selectedRole.permissions)],
                ["Privilege", selectedRole.level],
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
                margin: "0 0 13px",
                color: "#172b4d",
              }}
            >
              Example permission categories
            </h3>

            <div style={{ display: "grid", gap: 15 }}>
              {permissionGroups.map((group) => (
                <div key={group.name}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      marginBottom: 8,
                      color: "#425875",
                    }}
                  >
                    {group.name}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 7,
                    }}
                  >
                    {group.permissions.map((permission) => (
                      <span
                        key={permission}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          border: "1px solid #e1e7f0",
                          background: "#f8fafd",
                          color: "#536783",
                          padding: "7px 9px",
                          borderRadius: 7,
                          fontSize: 11,
                        }}
                      >
                        <Check size={12} color="#13864b" />
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p
              style={{
                fontSize: 11,
                color: "#8492a8",
                lineHeight: 1.7,
                marginTop: 20,
              }}
            >
              Permission categories above are illustrative. The exact
              permission mapping for each role must come from the ModelNow
              backend.
            </p>

            <button
              type="button"
              onClick={() => {
                setSelectedRole(null);
                setNotice(
                  "System roles are protected in this frontend demo.",
                );
              }}
              style={{
                ...buttonStyle,
                marginTop: 10,
              }}
            >
              Close details
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
