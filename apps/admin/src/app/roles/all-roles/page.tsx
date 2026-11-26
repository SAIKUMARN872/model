
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  ShieldCheck,
  Shield,
  LockKeyhole,
  Users,
  Globe,
  Building2,
  LayoutGrid,
  Eye,
  X,
  RotateCcw,
} from "lucide-react";

type RoleScope = "Global" | "Organization" | "Workspace";
type RoleStatus = "Active" | "Restricted" | "Review Required";

type Role = {
  id: string;
  name: string;
  description: string;
  users: number;
  permissions: number;
  scope: RoleScope;
  status: RoleStatus;
  custom: boolean;
  privileged: boolean;
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
    custom: false,
    privileged: true,
  },
  {
    id: "ROLE-1002",
    name: "Platform Administrator",
    description: "Manages platform configuration and operations.",
    users: 12,
    permissions: 112,
    scope: "Global",
    status: "Active",
    custom: false,
    privileged: true,
  },
  {
    id: "ROLE-1003",
    name: "Organization Administrator",
    description: "Manages organization resources and members.",
    users: 86,
    permissions: 74,
    scope: "Organization",
    status: "Active",
    custom: false,
    privileged: true,
  },
  {
    id: "ROLE-1004",
    name: "Workspace Administrator",
    description: "Manages workspace settings and access.",
    users: 248,
    permissions: 52,
    scope: "Workspace",
    status: "Active",
    custom: false,
    privileged: true,
  },
  {
    id: "ROLE-1005",
    name: "Security Auditor",
    description: "Reviews security events and audit activity.",
    users: 18,
    permissions: 34,
    scope: "Global",
    status: "Restricted",
    custom: false,
    privileged: true,
  },
  {
    id: "ROLE-1006",
    name: "Billing Administrator",
    description: "Manages billing and subscription operations.",
    users: 22,
    permissions: 28,
    scope: "Organization",
    status: "Review Required",
    custom: false,
    privileged: true,
  },
];

const palette = {
  text: "#172033",
  muted: "#697586",
  border: "#E5EAF1",
  background: "#F7F9FC",
  blue: "#315FEA",
};

const statusStyle: Record<
  RoleStatus,
  { color: string; background: string }
> = {
  Active: { color: "#15803D", background: "#EAF8EF" },
  Restricted: { color: "#B42318", background: "#FEF0EF" },
  "Review Required": { color: "#B54708", background: "#FFF5DF" },
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  padding: "10px 12px",
  border: `1px solid ${palette.border}`,
  borderRadius: 9,
  background: "#FFFFFF",
  color: palette.text,
  fontSize: 13,
};

const buttonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "9px 12px",
  border: `1px solid ${palette.border}`,
  borderRadius: 9,
  background: "#FFFFFF",
  color: palette.text,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};

export default function AllRolesPage() {
  const [roles] = useState<Role[]>(initialRoles);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [scopeFilter, setScopeFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

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
        matchesSearch &&
        matchesStatus &&
        matchesScope &&
        matchesType
      );
    });
  }, [roles, search, statusFilter, scopeFilter, typeFilter]);

  function resetFilters() {
    setSearch("");
    setStatusFilter("All");
    setScopeFilter("All");
    setTypeFilter("All");
  }

  return (
    <main
      style={{
        minHeight: "100%",
        padding: "28px clamp(16px, 3vw, 32px)",
        background: palette.background,
        color: palette.text,
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <header style={{ marginBottom: 26 }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            color: palette.muted,
            fontSize: 12,
            marginBottom: 12,
          }}
        >
          <span>Roles</span>
          <span>/</span>
          <span style={{ color: palette.blue }}>All Roles</span>
        </div>

        <h1
          style={{
            fontSize: "clamp(24px, 3vw, 29px)",
            letterSpacing: -0.7,
            margin: "0 0 9px",
            fontWeight: 750,
          }}
        >
          All Roles
        </h1>

        <p
          style={{
            margin: 0,
            color: palette.muted,
            fontSize: 14,
            lineHeight: 1.7,
            maxWidth: 720,
          }}
        >
          View and search all built-in and custom role definitions,
          their permissions, access scopes, and current status.
        </p>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
          gap: 15,
          marginBottom: 24,
        }}
      >
        {[
          {
            label: "Total roles",
            value: roles.length,
            icon: Shield,
            color: "#315FEA",
            background: "#EDF2FF",
          },
          {
            label: "Active roles",
            value: roles.filter((role) => role.status === "Active").length,
            icon: ShieldCheck,
            color: "#15803D",
            background: "#EAF8EF",
          },
          {
            label: "Privileged roles",
            value: roles.filter((role) => role.privileged).length,
            icon: LockKeyhole,
            color: "#B54708",
            background: "#FFF5DF",
          },
          {
            label: "Assigned users",
            value: roles.reduce((sum, role) => sum + role.users, 0),
            icon: Users,
            color: "#6941C6",
            background: "#F2EDFF",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.label}
              style={{
                background: "#FFFFFF",
                border: `1px solid ${palette.border}`,
                borderRadius: 13,
                padding: 19,
              }}
            >
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
                    color: palette.muted,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {item.label}
                </span>

                <span
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    color: item.color,
                    background: item.background,
                  }}
                >
                  <Icon size={18} />
                </span>
              </div>

              <div
                style={{
                  fontSize: 28,
                  fontWeight: 750,
                  marginTop: 12,
                }}
              >
                {item.value.toLocaleString()}
              </div>
            </article>
          );
        })}
      </section>

      <section
        style={{
          background: "#FFFFFF",
          border: `1px solid ${palette.border}`,
          borderRadius: 13,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            borderBottom: `1px solid ${palette.border}`,
          }}
        >
          <div>
            <h2 style={{ fontSize: 17, margin: 0 }}>
              Role directory
            </h2>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 12,
                color: palette.muted,
              }}
            >
              Showing {filteredRoles.length} of {roles.length} roles
            </p>
          </div>

          <button onClick={resetFilters} style={buttonStyle}>
            <RotateCcw size={14} />
            Reset filters
          </button>
        </div>

        <div
          style={{
            padding: "16px 22px",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 175px), 1fr))",
            gap: 12,
            borderBottom: `1px solid ${palette.border}`,
          }}
        >
          <div style={{ position: "relative" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 12,
                top: 12,
                color: palette.muted,
              }}
            />
            <input
              aria-label="Search roles"
              placeholder="Search name, ID, description..."
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
            onChange={(event) => setTypeFilter(event.target.value)}
            style={inputStyle}
          >
            <option value="All">All role types</option>
            <option value="Built-in">Built-in roles</option>
            <option value="Custom">Custom roles</option>
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: 900,
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: 12,
            }}
          >
            <thead>
              <tr style={{ background: "#FAFBFD", color: palette.muted }}>
                {[
                  "ROLE",
                  "DESCRIPTION",
                  "USERS",
                  "PERMISSIONS",
                  "SCOPE",
                  "STATUS",
                  "TYPE",
                  "DETAILS",
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      padding: "13px 15px",
                      borderBottom: `1px solid ${palette.border}`,
                      fontSize: 10,
                      letterSpacing: 0.5,
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
                      padding: 15,
                      borderBottom: `1px solid ${palette.border}`,
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
                          width: 35,
                          height: 35,
                          flexShrink: 0,
                          borderRadius: 9,
                          background: role.privileged ? "#FFF5DF" : "#EDF2FF",
                          color: role.privileged ? "#B54708" : palette.blue,
                        }}
                      >
                        {role.privileged ? (
                          <LockKeyhole size={16} />
                        ) : (
                          <ShieldCheck size={16} />
                        )}
                      </span>

                      <div>
                        <div style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                          {role.name}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            marginTop: 5,
                            color: palette.muted,
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
                      minWidth: 200,
                      maxWidth: 260,
                      lineHeight: 1.6,
                      borderBottom: `1px solid ${palette.border}`,
                    }}
                  >
                    {role.description}
                  </td>

                  <td style={{ padding: 15, borderBottom: `1px solid ${palette.border}` }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <Users size={14} color={palette.muted} />
                      {role.users.toLocaleString()}
                    </span>
                  </td>

                  <td style={{ padding: 15, borderBottom: `1px solid ${palette.border}` }}>
                    {role.permissions}
                  </td>

                  <td style={{ padding: 15, borderBottom: `1px solid ${palette.border}` }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
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

                  <td style={{ padding: 15, borderBottom: `1px solid ${palette.border}` }}>
                    <span
                      style={{
                        ...statusStyle[role.status],
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

                  <td style={{ padding: 15, borderBottom: `1px solid ${palette.border}` }}>
                    <span
                      style={{
                        border: `1px solid ${palette.border}`,
                        borderRadius: 6,
                        padding: "5px 8px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {role.custom ? "Custom" : "Built-in"}
                    </span>
                  </td>

                  <td style={{ padding: 15, borderBottom: `1px solid ${palette.border}` }}>
                    <button
                      onClick={() => setSelectedRole(role)}
                      aria-label={`View ${role.name}`}
                      style={buttonStyle}
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRoles.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      padding: 40,
                      textAlign: "center",
                      color: palette.muted,
                    }}
                  >
                    No roles match your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            padding: "14px 22px",
            color: palette.muted,
            fontSize: 11,
          }}
        >
          {filteredRoles.length} role(s) displayed
        </div>
      </section>

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
            background: "#10182880",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 18,
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-detail-title"
            style={{
              width: "100%",
              maxWidth: 520,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#FFFFFF",
              borderRadius: 15,
              boxShadow: "0 24px 70px #10182840",
            }}
          >
            <div
              style={{
                padding: 22,
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                borderBottom: `1px solid ${palette.border}`,
              }}
            >
              <div>
                <h2 id="role-detail-title" style={{ margin: 0, fontSize: 19 }}>
                  {selectedRole.name}
                </h2>
                <p style={{ margin: "7px 0 0", color: palette.muted, fontSize: 12 }}>
                  {selectedRole.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedRole(null)}
                aria-label="Close role details"
                style={{ ...buttonStyle, padding: 7, alignSelf: "flex-start" }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: 22 }}>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: palette.muted }}>
                {selectedRole.description}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 18,
                  margin: "22px 0",
                }}
              >
                {[
                  ["Assigned users", selectedRole.users.toLocaleString()],
                  ["Permissions", selectedRole.permissions.toLocaleString()],
                  ["Access scope", selectedRole.scope],
                  ["Role type", selectedRole.custom ? "Custom" : "Built-in"],
                  ["Status", selectedRole.status],
                  ["Privileged access", selectedRole.privileged ? "Yes" : "No"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ color: palette.muted, fontSize: 11, marginBottom: 6 }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 650 }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              {selectedRole.privileged && (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 9,
                    background: "#FFF5DF",
                    color: "#8A4B08",
                    fontSize: 12,
                    lineHeight: 1.6,
                    display: "flex",
                    gap: 8,
                  }}
                >
                  <LockKeyhole size={16} />
                  This role has elevated access. Review carefully before assigning it.
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 22 }}>
                <button onClick={() => setSelectedRole(null)} style={buttonStyle}>
                  Close details
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
