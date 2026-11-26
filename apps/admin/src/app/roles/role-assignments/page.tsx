
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Users,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  RefreshCw,
  UserRound,
  Building2,
  Layers3,
  CalendarDays,
} from "lucide-react";

type AssignmentStatus = "Active" | "Pending" | "Revoked";

type RoleAssignment = {
  id: string;
  user: string;
  email: string;
  role: string;
  scope: "Global" | "Organization" | "Workspace";
  resource: string;
  assignedBy: string;
  assignedAt: string;
  status: AssignmentStatus;
};

const initialAssignments: RoleAssignment[] = [
  {
    id: "ASN-1001",
    user: "Pujitha Marikanti",
    email: "pujitha@example.com",
    role: "Super Administrator",
    scope: "Global",
    resource: "Entire platform",
    assignedBy: "System",
    assignedAt: "Nov 01, 2026",
    status: "Active",
  },
  {
    id: "ASN-1002",
    user: "Sai Kumar",
    email: "saikumar@example.com",
    role: "Platform Administrator",
    scope: "Global",
    resource: "Entire platform",
    assignedBy: "Super Administrator",
    assignedAt: "Oct 29, 2026",
    status: "Active",
  },
  {
    id: "ASN-1003",
    user: "Ananya Reddy",
    email: "ananya@example.com",
    role: "Organization Administrator",
    scope: "Organization",
    resource: "Acme Technologies",
    assignedBy: "Platform Administrator",
    assignedAt: "Oct 28, 2026",
    status: "Active",
  },
  {
    id: "ASN-1004",
    user: "Rahul Sharma",
    email: "rahul@example.com",
    role: "Workspace Administrator",
    scope: "Workspace",
    resource: "Engineering Workspace",
    assignedBy: "Organization Administrator",
    assignedAt: "Oct 27, 2026",
    status: "Active",
  },
  {
    id: "ASN-1005",
    user: "Meghana Rao",
    email: "meghana@example.com",
    role: "Security Auditor",
    scope: "Global",
    resource: "Security and audit",
    assignedBy: "Super Administrator",
    assignedAt: "Oct 26, 2026",
    status: "Pending",
  },
  {
    id: "ASN-1006",
    user: "Arjun Kumar",
    email: "arjun@example.com",
    role: "Billing Administrator",
    scope: "Organization",
    resource: "Acme Technologies",
    assignedBy: "Organization Administrator",
    assignedAt: "Oct 25, 2026",
    status: "Revoked",
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

export default function RoleAssignmentsPage() {
  const [assignments, setAssignments] =
    useState<RoleAssignment[]>(initialAssignments);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [scopeFilter, setScopeFilter] = useState("All scopes");
  const [roleFilter, setRoleFilter] = useState("All roles");
  const [selectedAssignment, setSelectedAssignment] =
    useState<RoleAssignment | null>(null);
  const [notice, setNotice] = useState("");

  const roles = useMemo(
    () => Array.from(new Set(assignments.map((item) => item.role))),
    [assignments],
  );

  const filteredAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return assignments.filter((item) => {
      const matchesSearch =
        !query ||
        item.user.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.role.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        item.resource.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All statuses" || item.status === statusFilter;

      const matchesScope =
        scopeFilter === "All scopes" || item.scope === scopeFilter;

      const matchesRole =
        roleFilter === "All roles" || item.role === roleFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesScope &&
        matchesRole
      );
    });
  }, [assignments, search, statusFilter, scopeFilter, roleFilter]);

  const activeCount = assignments.filter(
    (item) => item.status === "Active",
  ).length;

  const pendingCount = assignments.filter(
    (item) => item.status === "Pending",
  ).length;

  const revokedCount = assignments.filter(
    (item) => item.status === "Revoked",
  ).length;

  function resetFilters() {
    setSearch("");
    setStatusFilter("All statuses");
    setScopeFilter("All scopes");
    setRoleFilter("All roles");
  }

  function updateStatus(
    assignment: RoleAssignment,
    status: AssignmentStatus,
  ) {
    setAssignments((current) =>
      current.map((item) =>
        item.id === assignment.id ? { ...item, status } : item,
      ),
    );

    setSelectedAssignment(null);

    setNotice(
      `Assignment ${assignment.id} updated to ${status}.`,
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
            ModelNow　›　Roles　›　Role Assignments
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
            Role Assignments
          </h1>

          <p
            style={{
              color: "#6b7d98",
              fontSize: 14,
              margin: 0,
              lineHeight: 1.7,
            }}
          >
            Review user-role assignments, access scopes, and assignment
            status across ModelNow.
          </p>
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
            gridTemplateColumns:
              "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {[
            {
              label: "Total assignments",
              value: assignments.length,
              detail: "All recorded assignments",
              icon: <Users size={21} />,
              color: "#315efb",
              bg: "#edf2ff",
            },
            {
              label: "Active assignments",
              value: activeCount,
              detail: "Currently active",
              icon: <CheckCircle2 size={21} />,
              color: "#13864b",
              bg: "#e8f8ef",
            },
            {
              label: "Pending assignments",
              value: pendingCount,
              detail: "Awaiting review",
              icon: <Clock size={21} />,
              color: "#c45b08",
              bg: "#fff3df",
            },
            {
              label: "Revoked assignments",
              value: revokedCount,
              detail: "No longer active",
              icon: <XCircle size={21} />,
              color: "#c0392b",
              bg: "#fff0ee",
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
                Assignment directory
              </h2>

              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 13,
                  color: "#7b8aa3",
                }}
              >
                Showing {filteredAssignments.length} of{" "}
                {assignments.length} assignments
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
              gridTemplateColumns:
                "repeat(auto-fit, minmax(175px, 1fr))",
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
                placeholder="Search user, role, ID..."
                aria-label="Search assignments"
                style={{ ...inputStyle, paddingLeft: 39 }}
              />
            </div>

            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              aria-label="Filter by role"
              style={inputStyle}
            >
              <option>All roles</option>
              {roles.map((role) => (
                <option key={role}>{role}</option>
              ))}
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

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
              style={inputStyle}
            >
              <option>All statuses</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Revoked</option>
            </select>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: 1080,
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr style={{ background: "#f8fafd" }}>
                  {[
                    "USER",
                    "ASSIGNED ROLE",
                    "SCOPE",
                    "RESOURCE",
                    "ASSIGNED BY",
                    "ASSIGNED DATE",
                    "STATUS",
                    "DETAILS",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: "14px 16px",
                        fontSize: 10,
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
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td
                      style={{
                        padding: "16px",
                        borderBottom: "1px solid #edf0f5",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 11,
                            background: "#edf2ff",
                            color: "#315efb",
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          <UserRound size={18} />
                        </div>

                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#172b4d",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {assignment.user}
                          </div>

                          <div
                            style={{
                              fontSize: 11,
                              color: "#8492a8",
                              marginTop: 5,
                            }}
                          >
                            {assignment.email}
                          </div>

                          <div
                            style={{
                              fontSize: 10,
                              color: "#a0aabd",
                              marginTop: 4,
                            }}
                          >
                            {assignment.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td
                      style={{
                        padding: "16px",
                        borderBottom: "1px solid #edf0f5",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 7,
                        }}
                      >
                        <ShieldCheck size={16} color="#315efb" />
                        {assignment.role}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: "16px",
                        borderBottom: "1px solid #edf0f5",
                        fontSize: 12,
                      }}
                    >
                      {assignment.scope}
                    </td>

                    <td
                      style={{
                        padding: "16px",
                        borderBottom: "1px solid #edf0f5",
                        fontSize: 12,
                        color: "#647692",
                      }}
                    >
                      {assignment.resource}
                    </td>

                    <td
                      style={{
                        padding: "16px",
                        borderBottom: "1px solid #edf0f5",
                        fontSize: 11,
                        color: "#647692",
                      }}
                    >
                      {assignment.assignedBy}
                    </td>

                    <td
                      style={{
                        padding: "16px",
                        borderBottom: "1px solid #edf0f5",
                        fontSize: 11,
                        whiteSpace: "nowrap",
                        color: "#647692",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <CalendarDays size={13} />
                        {assignment.assignedAt}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: "16px",
                        borderBottom: "1px solid #edf0f5",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          padding: "6px 9px",
                          borderRadius: 20,
                          fontSize: 10,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                          color:
                            assignment.status === "Active"
                              ? "#087443"
                              : assignment.status === "Pending"
                                ? "#a45a00"
                                : "#b42318",
                          background:
                            assignment.status === "Active"
                              ? "#e8f8ef"
                              : assignment.status === "Pending"
                                ? "#fff3df"
                                : "#fff0ee",
                        }}
                      >
                        {assignment.status}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: "16px",
                        borderBottom: "1px solid #edf0f5",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedAssignment(assignment)}
                        style={{ ...buttonStyle, padding: "8px 10px" }}
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredAssignments.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        padding: 42,
                        textAlign: "center",
                        color: "#7b8aa3",
                      }}
                    >
                      <Users
                        size={28}
                        style={{ margin: "0 auto 10px" }}
                      />
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#334764",
                        }}
                      >
                        No assignments found
                      </div>
                      <p style={{ fontSize: 12 }}>
                        Try changing your search or filters.
                      </p>
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
            marginTop: 22,
          }}
        >
          <div
            style={{
              background: "#fff",
              border: "1px solid #e1e7f0",
              borderRadius: 13,
              padding: 20,
            }}
          >
            <Building2 size={20} color="#315efb" />
            <h3 style={{ fontSize: 14, margin: "12px 0 7px" }}>
              Scoped access
            </h3>
            <p
              style={{
                fontSize: 12,
                color: "#71819a",
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              Keep role assignments limited to the intended platform,
              organization, or workspace.
            </p>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #e1e7f0",
              borderRadius: 13,
              padding: 20,
            }}
          >
            <Layers3 size={20} color="#7c3aed" />
            <h3 style={{ fontSize: 14, margin: "12px 0 7px" }}>
              Assignment review
            </h3>
            <p
              style={{
                fontSize: 12,
                color: "#71819a",
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              Review pending assignments and revoke access when it is no
              longer required.
            </p>
          </div>
        </section>
      </div>

      {selectedAssignment && (
        <div
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedAssignment(null);
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
            aria-labelledby="assignment-details-title"
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
                  id="assignment-details-title"
                  style={{
                    fontSize: 21,
                    margin: "0 0 7px",
                    color: "#102544",
                  }}
                >
                  Assignment details
                </h2>

                <div style={{ fontSize: 12, color: "#8492a8" }}>
                  {selectedAssignment.id}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAssignment(null)}
                aria-label="Close assignment details"
                style={{ ...buttonStyle, padding: 8 }}
              >
                <X size={17} />
              </button>
            </div>

            <div
              style={{
                marginTop: 22,
                padding: 15,
                borderRadius: 11,
                background: "#f5f7fb",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "#edf2ff",
                  color: "#315efb",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <UserRound size={21} />
              </div>

              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>
                  {selectedAssignment.user}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#71819a",
                    marginTop: 5,
                  }}
                >
                  {selectedAssignment.email}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gap: 0, marginTop: 14 }}>
              {[
                ["Role", selectedAssignment.role],
                ["Scope", selectedAssignment.scope],
                ["Resource", selectedAssignment.resource],
                ["Assigned by", selectedAssignment.assignedBy],
                ["Assigned date", selectedAssignment.assignedAt],
                ["Current status", selectedAssignment.status],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 18,
                    padding: "13px 0",
                    borderBottom: "1px solid #edf0f5",
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: "#7b8aa3" }}>{label}</span>
                  <span
                    style={{
                      color: "#243b60",
                      fontWeight: 600,
                      textAlign: "right",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 20,
                padding: 12,
                borderRadius: 9,
                background: "#eef4ff",
                color: "#42639b",
                fontSize: 12,
                lineHeight: 1.7,
              }}
            >
              Status changes on this page affect only the current frontend
              session. Real assignments must be updated and audited by the
              backend.
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 20,
              }}
            >
              {selectedAssignment.status !== "Active" && (
                <button
                  type="button"
                  onClick={() =>
                    updateStatus(selectedAssignment, "Active")
                  }
                  style={{
                    ...buttonStyle,
                    background: "#13864b",
                    color: "#fff",
                    borderColor: "#13864b",
                  }}
                >
                  <CheckCircle2 size={15} />
                  Activate
                </button>
              )}

              {selectedAssignment.status !== "Pending" && (
                <button
                  type="button"
                  onClick={() =>
                    updateStatus(selectedAssignment, "Pending")
                  }
                  style={buttonStyle}
                >
                  <Clock size={15} />
                  Mark pending
                </button>
              )}

              {selectedAssignment.status !== "Revoked" && (
                <button
                  type="button"
                  onClick={() =>
                    updateStatus(selectedAssignment, "Revoked")
                  }
                  style={{
                    ...buttonStyle,
                    color: "#b42318",
                    borderColor: "#f1c6c2",
                  }}
                >
                  <XCircle size={15} />
                  Revoke
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
