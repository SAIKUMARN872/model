
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Network,
  ShieldCheck,
  LockKeyhole,
  Users,
  ChevronDown,
  ChevronRight,
  Eye,
  X,
  Layers3,
  Building2,
  GitBranch,
  Info,
} from "lucide-react";

type RoleNode = {
  id: string;
  name: string;
  level: number;
  scope: "Global" | "Organization" | "Workspace";
  users: number;
  permissions: number;
  description: string;
  parentId: string | null;
  color: string;
  background: string;
};

const roleNodes: RoleNode[] = [
  {
    id: "ROLE-1001",
    name: "Super Administrator",
    level: 1,
    scope: "Global",
    users: 4,
    permissions: 148,
    description:
      "Top-level platform administration and security oversight.",
    parentId: null,
    color: "#b45309",
    background: "#fff3df",
  },
  {
    id: "ROLE-1002",
    name: "Platform Administrator",
    level: 2,
    scope: "Global",
    users: 12,
    permissions: 112,
    description:
      "Manages platform configuration, services, and operational settings.",
    parentId: "ROLE-1001",
    color: "#315efb",
    background: "#edf2ff",
  },
  {
    id: "ROLE-1003",
    name: "Organization Administrator",
    level: 3,
    scope: "Organization",
    users: 86,
    permissions: 74,
    description:
      "Manages organization members, resources, and organization settings.",
    parentId: "ROLE-1002",
    color: "#7c3aed",
    background: "#f2eaff",
  },
  {
    id: "ROLE-1004",
    name: "Workspace Administrator",
    level: 4,
    scope: "Workspace",
    users: 248,
    permissions: 52,
    description:
      "Manages workspace members, settings, and workspace resources.",
    parentId: "ROLE-1003",
    color: "#13864b",
    background: "#e8f8ef",
  },
  {
    id: "ROLE-1005",
    name: "Security Auditor",
    level: 2,
    scope: "Global",
    users: 18,
    permissions: 34,
    description:
      "Reviews security events, audit trails, and access-control activity.",
    parentId: "ROLE-1001",
    color: "#c0392b",
    background: "#fff0ee",
  },
  {
    id: "ROLE-1006",
    name: "Billing Administrator",
    level: 3,
    scope: "Organization",
    users: 22,
    permissions: 28,
    description:
      "Manages billing operations and subscription administration.",
    parentId: "ROLE-1003",
    color: "#0e7490",
    background: "#e6f7fb",
  },
];

const buttonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "9px 12px",
  border: "1px solid #dce3ee",
  borderRadius: 9,
  background: "#fff",
  color: "#304561",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};

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

export default function RoleHierarchyPage() {
  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState("All scopes");
  const [selectedRole, setSelectedRole] = useState<RoleNode | null>(null);
  const [collapsed, setCollapsed] = useState<string[]>([]);

  const totalUsers = roleNodes.reduce((sum, role) => sum + role.users, 0);

  const filteredRoles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return roleNodes.filter((role) => {
      const matchesSearch =
        !query ||
        role.name.toLowerCase().includes(query) ||
        role.id.toLowerCase().includes(query) ||
        role.description.toLowerCase().includes(query);

      const matchesScope =
        scopeFilter === "All scopes" || role.scope === scopeFilter;

      return matchesSearch && matchesScope;
    });
  }, [search, scopeFilter]);

  const filteredIds = new Set(filteredRoles.map((role) => role.id));

  function toggleCollapse(roleId: string) {
    setCollapsed((current) =>
      current.includes(roleId)
        ? current.filter((id) => id !== roleId)
        : [...current, roleId],
    );
  }

  function getChildren(roleId: string) {
    return roleNodes.filter((role) => role.parentId === roleId);
  }

  function isHiddenByCollapsedParent(role: RoleNode) {
    let parentId = role.parentId;

    while (parentId) {
      if (collapsed.includes(parentId)) return true;

      const parent = roleNodes.find((item) => item.id === parentId);
      parentId = parent?.parentId ?? null;
    }

    return false;
  }

  const visibleRoles = filteredRoles.filter(
    (role) => !isHiddenByCollapsedParent(role),
  );

  function renderNode(role: RoleNode) {
    const children = getChildren(role.id);
    const isCollapsed = collapsed.includes(role.id);

    return (
      <div key={role.id}>
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <button
            type="button"
            onClick={() => toggleCollapse(role.id)}
            aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${role.name}`}
            style={{
              ...buttonStyle,
              width: 34,
              minWidth: 34,
              padding: 0,
              alignSelf: "center",
              height: 34,
              border: "none",
              background: "transparent",
              color: "#8190a7",
            }}
          >
            {children.length > 0 ? (
              isCollapsed ? (
                <ChevronRight size={17} />
              ) : (
                <ChevronDown size={17} />
              )
            ) : (
              <span style={{ width: 17 }} />
            )}
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole(role)}
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              alignItems: "center",
              gap: 13,
              padding: 15,
              textAlign: "left",
              borderRadius: 12,
              border:
                selectedRole?.id === role.id
                  ? "1px solid #315efb"
                  : "1px solid #e1e7f0",
              background:
                selectedRole?.id === role.id ? "#f5f8ff" : "#fff",
              cursor: "pointer",
              boxShadow:
                selectedRole?.id === role.id
                  ? "0 0 0 2px #315efb12"
                  : "none",
            }}
          >
            <div
              style={{
                width: 43,
                height: 43,
                minWidth: 43,
                display: "grid",
                placeItems: "center",
                borderRadius: 11,
                color: role.color,
                background: role.background,
              }}
            >
              <ShieldCheck size={21} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    color: "#172b4d",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {role.name}
                </span>

                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "4px 7px",
                    borderRadius: 6,
                    color: role.color,
                    background: role.background,
                  }}
                >
                  Level {role.level}
                </span>
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
                  lineHeight: 1.6,
                  color: "#647692",
                  marginTop: 6,
                }}
              >
                {role.description}
              </div>
            </div>

            <div
              style={{
                textAlign: "right",
                minWidth: 72,
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 750,
                  color: "#172b4d",
                }}
              >
                {role.users}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "#8492a8",
                  marginTop: 4,
                }}
              >
                users
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "#647692",
                  marginTop: 7,
                }}
              >
                {role.permissions} permissions
              </div>
            </div>

            <Eye size={16} color="#8492a8" />
          </button>
        </div>

        {!isCollapsed && children.length > 0 && (
          <div
            style={{
              marginLeft: 24,
              paddingLeft: 20,
              borderLeft: "2px solid #dce5f4",
            }}
          >
            {children
              .filter((child) => filteredIds.has(child.id))
              .map((child) => renderNode(child))}
          </div>
        )}
      </div>
    );
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
            ModelNow　›　Roles　›　Role Hierarchy
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
            Role Hierarchy
          </h1>

          <p
            style={{
              color: "#6b7d98",
              fontSize: 14,
              margin: 0,
              lineHeight: 1.7,
            }}
          >
            Explore role relationships, privilege levels, and the access
            structure across ModelNow.
          </p>
        </div>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {[
            {
              label: "Defined roles",
              value: roleNodes.length,
              icon: <ShieldCheck size={21} />,
              color: "#315efb",
              bg: "#edf2ff",
            },
            {
              label: "Hierarchy levels",
              value: Math.max(...roleNodes.map((role) => role.level)),
              icon: <GitBranch size={21} />,
              color: "#7c3aed",
              bg: "#f2eaff",
            },
            {
              label: "Assigned users",
              value: totalUsers,
              icon: <Users size={21} />,
              color: "#13864b",
              bg: "#e8f8ef",
            },
            {
              label: "Critical roles",
              value: roleNodes.filter((role) => role.level === 1).length,
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
                    width: 42,
                    height: 42,
                    display: "grid",
                    placeItems: "center",
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
                {metric.value.toLocaleString()}
              </div>
            </div>
          ))}
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
            alignItems: "start",
          }}
        >
          <section
            style={{
              minWidth: 0,
              background: "#fff",
              border: "1px solid #e1e7f0",
              borderRadius: 15,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "21px 24px",
                borderBottom: "1px solid #e8edf4",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
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
                    Hierarchy explorer
                  </h2>
                  <p
                    style={{
                      margin: "6px 0 0",
                      fontSize: 12,
                      color: "#7b8aa3",
                    }}
                  >
                    Select any role to inspect its details.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCollapsed([]);
                    setSelectedRole(null);
                    setSearch("");
                    setScopeFilter("All scopes");
                  }}
                  style={buttonStyle}
                >
                  Reset view
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 10,
                  marginTop: 18,
                }}
              >
                <div style={{ position: "relative" }}>
                  <Search
                    size={16}
                    style={{
                      position: "absolute",
                      left: 12,
                      top: 12,
                      color: "#8190a7",
                    }}
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search roles..."
                    aria-label="Search hierarchy roles"
                    style={{ ...inputStyle, paddingLeft: 36 }}
                  />
                </div>

                <select
                  value={scopeFilter}
                  onChange={(event) => setScopeFilter(event.target.value)}
                  aria-label="Filter hierarchy by scope"
                  style={inputStyle}
                >
                  <option>All scopes</option>
                  <option>Global</option>
                  <option>Organization</option>
                  <option>Workspace</option>
                </select>
              </div>
            </div>

            <div style={{ padding: "20px 15px" }}>
              {visibleRoles.length === 0 ? (
                <div
                  style={{
                    padding: 30,
                    textAlign: "center",
                    color: "#7b8aa3",
                    fontSize: 13,
                  }}
                >
                  No roles match your search and scope filters.
                </div>
              ) : (
                visibleRoles
                  .filter((role) => role.parentId === null)
                  .map((role) => renderNode(role))
              )}
            </div>
          </section>

          <div style={{ display: "grid", gap: 20 }}>
            <section
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
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 11,
                    background: "#edf2ff",
                    color: "#315efb",
                  }}
                >
                  <Network size={20} />
                </div>
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 17,
                      color: "#102544",
                    }}
                  >
                    Role details
                  </h2>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 12,
                      color: "#7b8aa3",
                    }}
                  >
                    {selectedRole ? selectedRole.id : "No role selected"}
                  </p>
                </div>
              </div>

              {selectedRole ? (
                <>
                  <h3
                    style={{
                      fontSize: 20,
                      margin: "0 0 8px",
                      color: "#172b4d",
                    }}
                  >
                    {selectedRole.name}
                  </h3>

                  <p
                    style={{
                      margin: "0 0 18px",
                      fontSize: 13,
                      lineHeight: 1.7,
                      color: "#647692",
                    }}
                  >
                    {selectedRole.description}
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: 10,
                    }}
                  >
                    {[
                      ["Hierarchy level", `Level ${selectedRole.level}`],
                      ["Access scope", selectedRole.scope],
                      ["Assigned users", String(selectedRole.users)],
                      ["Permissions", String(selectedRole.permissions)],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        style={{
                          padding: 13,
                          background: "#f5f7fb",
                          borderRadius: 10,
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

                  <div
                    style={{
                      padding: 13,
                      marginTop: 15,
                      borderRadius: 10,
                      background: selectedRole.background,
                      color: selectedRole.color,
                      fontSize: 12,
                      lineHeight: 1.7,
                    }}
                  >
                    {selectedRole.level === 1
                      ? "This is the root role in the illustrative hierarchy."
                      : `This role is displayed at level ${selectedRole.level} in the illustrative hierarchy.`}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedRole(null)}
                    style={{ ...buttonStyle, marginTop: 15 }}
                  >
                    <X size={14} />
                    Clear selection
                  </button>
                </>
              ) : (
                <div
                  style={{
                    padding: "25px 10px",
                    textAlign: "center",
                    color: "#8190a7",
                  }}
                >
                  <Eye
                    size={27}
                    style={{ margin: "0 auto 12px" }}
                  />
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#425875",
                    }}
                  >
                    Select a role
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      lineHeight: 1.7,
                    }}
                  >
                    Click a role in the hierarchy to view its scope,
                    permissions, and assigned users.
                  </p>
                </div>
              )}
            </section>

            <section
              style={{
                background: "#fff",
                border: "1px solid #e1e7f0",
                borderRadius: 15,
                padding: 22,
              }}
            >
              <h2
                style={{
                  margin: "0 0 17px",
                  fontSize: 17,
                  color: "#102544",
                }}
              >
                Access scope guide
              </h2>

              {[
                {
                  name: "Global",
                  description: "Platform-wide access",
                  icon: <Network size={17} />,
                  color: "#315efb",
                  bg: "#edf2ff",
                },
                {
                  name: "Organization",
                  description: "Organization-specific access",
                  icon: <Building2 size={17} />,
                  color: "#7c3aed",
                  bg: "#f2eaff",
                },
                {
                  name: "Workspace",
                  description: "Workspace-specific access",
                  icon: <Layers3 size={17} />,
                  color: "#13864b",
                  bg: "#e8f8ef",
                },
              ].map((item) => (
                <div
                  key={item.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    padding: "12px 0",
                    borderBottom: "1px solid #edf0f5",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 9,
                      color: item.color,
                      background: item.bg,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#304561",
                      }}
                    >
                      {item.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#8190a7",
                        marginTop: 4,
                      }}
                    >
                      {item.description}
                    </div>
                  </div>
                </div>
              ))}

              <div
                style={{
                  display: "flex",
                  gap: 9,
                  alignItems: "flex-start",
                  padding: 12,
                  marginTop: 15,
                  background: "#f5f7fb",
                  borderRadius: 9,
                  color: "#647692",
                  fontSize: 11,
                  lineHeight: 1.7,
                }}
              >
                <Info
                  size={16}
                  style={{ flexShrink: 0, marginTop: 1 }}
                />
                This diagram is an illustrative role relationship model.
                Actual role inheritance and permission propagation must be
                defined by the ModelNow authorization backend.
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
