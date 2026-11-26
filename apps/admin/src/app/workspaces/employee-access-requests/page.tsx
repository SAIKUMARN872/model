
"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  Search,
  RefreshCw,
  Download,
  ShieldCheck,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  X,
  Filter,
  UserRound,
  Building2,
  CalendarDays,
  LockKeyhole,
  Check,
  Ban,
} from "lucide-react";

type RequestStatus = "Pending" | "Approved" | "Rejected";
type AccessLevel = "Read only" | "Standard" | "Elevated" | "Admin";

type AccessRequest = {
  id: string;
  employee: string;
  email: string;
  department: string;
  resource: string;
  accessLevel: AccessLevel;
  reason: string;
  requestedAt: string;
  status: RequestStatus;
  reviewer: string;
};

const initialRequests: AccessRequest[] = [
  {
    id: "AR-1001",
    employee: "Priya Sharma",
    email: "priya.sharma@modelnow.ai",
    department: "Engineering",
    resource: "Production AI Gateway",
    accessLevel: "Elevated",
    reason: "Need access to investigate production API latency.",
    requestedAt: "2026-11-04 09:15",
    status: "Pending",
    reviewer: "Unassigned",
  },
  {
    id: "AR-1002",
    employee: "Rahul Verma",
    email: "rahul.verma@modelnow.ai",
    department: "Data Operations",
    resource: "Customer Analytics",
    accessLevel: "Read only",
    reason: "Need analytics data for the weekly reporting task.",
    requestedAt: "2026-11-04 08:40",
    status: "Pending",
    reviewer: "Unassigned",
  },
  {
    id: "AR-1003",
    employee: "Ananya Reddy",
    email: "ananya.reddy@modelnow.ai",
    department: "AI Research",
    resource: "Model Evaluation Workspace",
    accessLevel: "Standard",
    reason: "Required to run evaluation experiments.",
    requestedAt: "2026-11-03 16:20",
    status: "Approved",
    reviewer: "Workspace Admin",
  },
  {
    id: "AR-1004",
    employee: "Arjun Kumar",
    email: "arjun.kumar@modelnow.ai",
    department: "Engineering",
    resource: "Production Database",
    accessLevel: "Admin",
    reason: "Requesting administrative access for debugging.",
    requestedAt: "2026-11-03 14:10",
    status: "Pending",
    reviewer: "Unassigned",
  },
  {
    id: "AR-1005",
    employee: "Sneha Patel",
    email: "sneha.patel@modelnow.ai",
    department: "Product",
    resource: "Product Roadmap",
    accessLevel: "Standard",
    reason: "Need to update milestones for the next release.",
    requestedAt: "2026-11-03 11:30",
    status: "Rejected",
    reviewer: "Workspace Admin",
  },
  {
    id: "AR-1006",
    employee: "Kiran Rao",
    email: "kiran.rao@modelnow.ai",
    department: "Finance",
    resource: "Billing and Usage Reports",
    accessLevel: "Read only",
    reason: "Required to reconcile monthly usage charges.",
    requestedAt: "2026-11-02 10:05",
    status: "Pending",
    reviewer: "Unassigned",
  },
  {
    id: "AR-1007",
    employee: "Meera Nair",
    email: "meera.nair@modelnow.ai",
    department: "Human Resources",
    resource: "Employee Directory",
    accessLevel: "Elevated",
    reason: "Need additional access to maintain employee records.",
    requestedAt: "2026-11-01 15:45",
    status: "Approved",
    reviewer: "Workspace Admin",
  },
];

const statusColors: Record<RequestStatus, CSSProperties> = {
  Pending: { color: "#92400e", background: "#fef3c7" },
  Approved: { color: "#166534", background: "#dcfce7" },
  Rejected: { color: "#991b1b", background: "#fee2e2" },
};

const accessColors: Record<AccessLevel, CSSProperties> = {
  "Read only": { color: "#475569", background: "#f1f5f9" },
  Standard: { color: "#1d4ed8", background: "#dbeafe" },
  Elevated: { color: "#92400e", background: "#fef3c7" },
  Admin: { color: "#991b1b", background: "#fee2e2" },
};

export default function EmployeeAccessRequestsPage() {
  const [requests, setRequests] = useState(initialRequests);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<AccessRequest | null>(null);
  const [confirmRequest, setConfirmRequest] =
    useState<AccessRequest | null>(null);
  const [decision, setDecision] = useState<"Approved" | "Rejected">(
    "Approved"
  );
  const [notice, setNotice] = useState("");

  const stats = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((r) => r.status === "Pending").length,
      approved: requests.filter((r) => r.status === "Approved").length,
      rejected: requests.filter((r) => r.status === "Rejected").length,
    }),
    [requests]
  );

  const departments = useMemo(
    () => Array.from(new Set(requests.map((r) => r.department))),
    [requests]
  );

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesSearch =
        !query ||
        [
          request.id,
          request.employee,
          request.email,
          request.department,
          request.resource,
          request.accessLevel,
          request.reason,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All" || request.status === statusFilter;

      const matchesDepartment =
        departmentFilter === "All" ||
        request.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [requests, search, statusFilter, departmentFilter]);

  function reviewRequest(request: AccessRequest, nextStatus: RequestStatus) {
    if (nextStatus === "Pending") return;

    setRequests((current) =>
      current.map((item) =>
        item.id === request.id
          ? {
              ...item,
              status: nextStatus,
              reviewer: "Workspace Admin",
            }
          : item
      )
    );

    setNotice(
      `${request.id} was marked ${nextStatus.toLowerCase()} in this demo.`
    );
    setConfirmRequest(null);
    setSelected(null);
  }

  function exportCsv() {
    const columns: (keyof AccessRequest)[] = [
      "id",
      "employee",
      "email",
      "department",
      "resource",
      "accessLevel",
      "reason",
      "requestedAt",
      "status",
      "reviewer",
    ];

    const escapeCsv = (value: string) =>
      `"${value.replace(/"/g, '""')}"`;

    const csv = [
      columns.join(","),
      ...filteredRequests.map((request) =>
        columns.map((key) => escapeCsv(request[key])).join(",")
      ),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-employee-access-requests.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  const cardStyle: CSSProperties = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 20,
    minWidth: 0,
  };

  const buttonStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    minHeight: 38,
    padding: "0 12px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    background: "#fff",
    color: "#374151",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 650,
    whiteSpace: "nowrap",
  };

  const inputStyle: CSSProperties = {
    height: 40,
    padding: "0 12px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    background: "#fff",
    color: "#111827",
    fontSize: 13,
    outline: "none",
  };

  const iconButtonStyle: CSSProperties = {
    width: 34,
    height: 34,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    background: "#fff",
    color: "#475569",
    cursor: "pointer",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "28px clamp(14px, 3vw, 32px)",
        background: "#f8fafc",
        color: "#111827",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1450, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#64748b",
                fontSize: 12,
                marginBottom: 10,
              }}
            >
              <ShieldCheck size={15} />
              Admin / Workspace / Security
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(25px, 3vw, 32px)",
                letterSpacing: "-0.8px",
              }}
            >
              Employee Access Requests
            </h1>
            <p
              style={{
                color: "#64748b",
                fontSize: 14,
                lineHeight: 1.6,
                margin: "9px 0 0",
              }}
            >
              Review employee requests for workspace resources and elevated
              permissions.
            </p>
          </div>

          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            <button
              style={buttonStyle}
              onClick={() =>
                setNotice("Request list refreshed from the current demo data.")
              }
            >
              <RefreshCw size={15} /> Refresh
            </button>
            <button style={buttonStyle} onClick={exportCsv}>
              <Download size={15} /> Export CSV
            </button>
          </div>
        </header>

        {notice && (
          <div
            role="status"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              padding: 13,
              marginBottom: 18,
              borderRadius: 10,
              border: "1px solid #bfdbfe",
              background: "#eff6ff",
              color: "#1d4ed8",
              fontSize: 13,
            }}
          >
            <span>{notice}</span>
            <button
              aria-label="Dismiss notification"
              onClick={() => setNotice("")}
              style={{
                border: 0,
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 14,
            marginBottom: 24,
          }}
        >
          {[
            {
              label: "Total Requests",
              value: stats.total,
              icon: UserRound,
              color: "#2563eb",
              background: "#eff6ff",
            },
            {
              label: "Awaiting Review",
              value: stats.pending,
              icon: Clock3,
              color: "#b45309",
              background: "#fef3c7",
            },
            {
              label: "Approved",
              value: stats.approved,
              icon: CheckCircle2,
              color: "#15803d",
              background: "#dcfce7",
            },
            {
              label: "Rejected",
              value: stats.rejected,
              icon: XCircle,
              color: "#b91c1c",
              background: "#fee2e2",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <section key={item.label} style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 13, color: "#64748b" }}>
                    {item.label}
                  </span>
                  <span
                    style={{
                      width: 38,
                      height: 38,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 10,
                      background: item.background,
                      color: item.color,
                    }}
                  >
                    <Icon size={19} />
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 750,
                    marginTop: 14,
                  }}
                >
                  {item.value}
                </div>
                <div
                  style={{
                    color: "#64748b",
                    fontSize: 12,
                    marginTop: 5,
                  }}
                >
                  Workspace access workflow
                </div>
              </section>
            );
          })}
        </div>

        {stats.pending > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: 16,
              marginBottom: 20,
              border: "1px solid #fde68a",
              borderRadius: 12,
              background: "#fffbeb",
            }}
          >
            <AlertTriangle
              size={20}
              color="#b45309"
              style={{ flexShrink: 0 }}
            />
            <div>
              <div
                style={{
                  color: "#92400e",
                  fontSize: 14,
                  fontWeight: 750,
                }}
              >
                Requests need review
              </div>
              <p
                style={{
                  color: "#92400e",
                  fontSize: 12,
                  lineHeight: 1.6,
                  margin: "5px 0 0",
                }}
              >
                {stats.pending} request(s) are awaiting a decision. Check the
                requested resource and access level before approving elevated
                or administrative permissions.
              </p>
            </div>
          </div>
        )}

        <section
          style={{
            ...cardStyle,
            padding: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
              padding: 20,
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 17 }}>
                Access request queue
              </h2>
              <p
                style={{
                  margin: "6px 0 0",
                  color: "#64748b",
                  fontSize: 12,
                }}
              >
                {filteredRequests.length} of {requests.length} requests
              </p>
            </div>
            <button
              style={buttonStyle}
              onClick={() => setShowFilters((current) => !current)}
            >
              <Filter size={15} /> Filters
            </button>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              padding: 16,
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <div style={{ position: "relative", flex: "1 1 260px" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  color: "#94a3b8",
                }}
              />
              <input
                aria-label="Search access requests"
                placeholder="Search employee, resource, department..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                style={{
                  ...inputStyle,
                  width: "100%",
                  paddingLeft: 38,
                }}
              />
            </div>

            {showFilters && (
              <>
                <select
                  aria-label="Filter by request status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  style={{ ...inputStyle, minWidth: 145 }}
                >
                  <option value="All">All statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <select
                  aria-label="Filter by department"
                  value={departmentFilter}
                  onChange={(event) =>
                    setDepartmentFilter(event.target.value)
                  }
                  style={{ ...inputStyle, minWidth: 175 }}
                >
                  <option value="All">All departments</option>
                  {departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>

                <button
                  style={buttonStyle}
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("All");
                    setDepartmentFilter("All");
                  }}
                >
                  Reset
                </button>
              </>
            )}
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: 1050,
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {[
                    "EMPLOYEE",
                    "RESOURCE",
                    "ACCESS LEVEL",
                    "REQUESTED",
                    "STATUS",
                    "ACTIONS",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: "13px 16px",
                        color: "#64748b",
                        fontSize: 10,
                        letterSpacing: "0.6px",
                        whiteSpace: "nowrap",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td style={cellStyle}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            flexShrink: 0,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: 10,
                            background: "#eff6ff",
                            color: "#2563eb",
                            fontSize: 12,
                            fontWeight: 750,
                          }}
                        >
                          {request.employee
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>
                            {request.employee}
                          </div>
                          <div
                            style={{
                              color: "#64748b",
                              fontSize: 11,
                              marginTop: 4,
                            }}
                          >
                            {request.email}
                          </div>
                          <div
                            style={{
                              color: "#94a3b8",
                              fontSize: 10,
                              marginTop: 4,
                            }}
                          >
                            {request.id} · {request.department}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={cellStyle}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Building2 size={16} color="#64748b" />
                        <span style={{ fontSize: 12 }}>
                          {request.resource}
                        </span>
                      </div>
                    </td>
                    <td style={cellStyle}>
                      <span
                        style={{
                          ...accessColors[request.accessLevel],
                          display: "inline-flex",
                          padding: "5px 9px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {request.accessLevel}
                      </span>
                    </td>
                    <td style={cellStyle}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 12,
                          color: "#475569",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <CalendarDays size={14} />
                        {request.requestedAt}
                      </div>
                    </td>
                    <td style={cellStyle}>
                      <span
                        style={{
                          ...statusColors[request.status],
                          display: "inline-flex",
                          padding: "5px 9px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td style={cellStyle}>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          alignItems: "center",
                        }}
                      >
                        <button
                          title="View request details"
                          aria-label={`View ${request.id}`}
                          style={iconButtonStyle}
                          onClick={() => setSelected(request)}
                        >
                          <Eye size={15} />
                        </button>
                        {request.status === "Pending" && (
                          <>
                            <button
                              title="Approve request"
                              aria-label={`Approve ${request.id}`}
                              style={{
                                ...iconButtonStyle,
                                color: "#15803d",
                                borderColor: "#bbf7d0",
                              }}
                              onClick={() => {
                                setDecision("Approved");
                                setConfirmRequest(request);
                              }}
                            >
                              <Check size={15} />
                            </button>
                            <button
                              title="Reject request"
                              aria-label={`Reject ${request.id}`}
                              style={{
                                ...iconButtonStyle,
                                color: "#b91c1c",
                                borderColor: "#fecaca",
                              }}
                              onClick={() => {
                                setDecision("Rejected");
                                setConfirmRequest(request);
                              }}
                            >
                              <Ban size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRequests.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: 50,
                        textAlign: "center",
                        color: "#64748b",
                      }}
                    >
                      <Search
                        size={27}
                        style={{ margin: "0 auto 12px", opacity: 0.6 }}
                      />
                      <div style={{ fontWeight: 700, color: "#334155" }}>
                        No requests found
                      </div>
                      <p style={{ fontSize: 12 }}>
                        Try a different search or reset your filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div
            style={{
              padding: "14px 18px",
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              flexWrap: "wrap",
              color: "#64748b",
              fontSize: 11,
            }}
          >
            <span>
              Showing {filteredRequests.length} of {requests.length} requests
            </span>
            <span>Demo records · Local state only</span>
          </div>
        </section>

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: 15,
            marginTop: 18,
            background: "#f1f5f9",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            color: "#475569",
            fontSize: 12,
            lineHeight: 1.7,
          }}
        >
          <LockKeyhole size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>Security integration note:</strong> Approvals and
            rejections currently update only this page&apos;s local state.
            Production access control must verify administrator permissions,
            persist decisions in the backend, enforce resource permissions, and
            record audit events.
          </div>
        </div>
      </div>

      {selected && (
        <div style={overlayStyle} onClick={() => setSelected(null)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="request-details-title"
            style={modalStyle}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={modalHeaderStyle}>
              <div>
                <h2
                  id="request-details-title"
                  style={{ margin: 0, fontSize: 19 }}
                >
                  Access request details
                </h2>
                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#64748b",
                    fontSize: 12,
                  }}
                >
                  {selected.id}
                </p>
              </div>
              <button
                style={iconButtonStyle}
                aria-label="Close details"
                onClick={() => setSelected(null)}
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
                  paddingBottom: 18,
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 12,
                    background: "#eff6ff",
                    color: "#2563eb",
                    fontWeight: 750,
                  }}
                >
                  {selected.employee
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 750, fontSize: 15 }}>
                    {selected.employee}
                  </div>
                  <div
                    style={{
                      color: "#64748b",
                      fontSize: 12,
                      marginTop: 5,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {selected.email}
                  </div>
                </div>
                <span
                  style={{
                    ...statusColors[selected.status],
                    padding: "5px 9px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {selected.status}
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: 12,
                  marginTop: 20,
                }}
              >
                {[
                  ["Department", selected.department],
                  ["Resource", selected.resource],
                  ["Access level", selected.accessLevel],
                  ["Requested at", selected.requestedAt],
                  ["Reviewer", selected.reviewer],
                ].map(([label, value]) => (
                  <div key={label} style={detailBoxStyle}>
                    <div style={detailLabelStyle}>{label}</div>
                    <div style={detailValueStyle}>{value}</div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  padding: 14,
                  marginTop: 14,
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                }}
              >
                <div style={detailLabelStyle}>Business justification</div>
                <p
                  style={{
                    margin: "7px 0 0",
                    fontSize: 13,
                    lineHeight: 1.7,
                    color: "#334155",
                  }}
                >
                  {selected.reason}
                </p>
              </div>

              {selected.status === "Pending" && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 9,
                    flexWrap: "wrap",
                    marginTop: 22,
                  }}
                >
                  <button
                    style={buttonStyle}
                    onClick={() => setSelected(null)}
                  >
                    Close
                  </button>
                  <button
                    style={{
                      ...buttonStyle,
                      background: "#b91c1c",
                      color: "#fff",
                      borderColor: "#b91c1c",
                    }}
                    onClick={() => {
                      setDecision("Rejected");
                      setConfirmRequest(selected);
                      setSelected(null);
                    }}
                  >
                    <Ban size={14} /> Reject
                  </button>
                  <button
                    style={{
                      ...buttonStyle,
                      background: "#15803d",
                      color: "#fff",
                      borderColor: "#15803d",
                    }}
                    onClick={() => {
                      setDecision("Approved");
                      setConfirmRequest(selected);
                      setSelected(null);
                    }}
                  >
                    <Check size={14} /> Approve
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {confirmRequest && (
        <div style={overlayStyle}>
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="decision-title"
            style={{ ...modalStyle, maxWidth: 440 }}
          >
            <div style={{ padding: 24 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 12,
                  background: decision === "Approved" ? "#dcfce7" : "#fee2e2",
                  color: decision === "Approved" ? "#15803d" : "#b91c1c",
                  marginBottom: 16,
                }}
              >
                {decision === "Approved" ? (
                  <CheckCircle2 size={22} />
                ) : (
                  <AlertTriangle size={22} />
                )}
              </div>
              <h2
                id="decision-title"
                style={{ margin: "0 0 10px", fontSize: 19 }}
              >
                {decision} this access request?
              </h2>
              <p
                style={{
                  color: "#64748b",
                  fontSize: 13,
                  lineHeight: 1.7,
                  margin: "0 0 22px",
                }}
              >
                {decision === "Approved"
                  ? `You are about to mark ${confirmRequest.employee}'s request for ${confirmRequest.accessLevel.toLowerCase()} access to ${confirmRequest.resource} as approved.`
                  : `You are about to mark ${confirmRequest.employee}'s request for ${confirmRequest.resource} as rejected.`}{" "}
                This demo action does not change real backend permissions.
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 9,
                }}
              >
                <button
                  style={buttonStyle}
                  onClick={() => setConfirmRequest(null)}
                >
                  Cancel
                </button>
                <button
                  style={{
                    ...buttonStyle,
                    color: "#fff",
                    background: decision === "Approved" ? "#15803d" : "#b91c1c",
                    borderColor: decision === "Approved" ? "#15803d" : "#b91c1c",
                  }}
                  onClick={() => reviewRequest(confirmRequest, decision)}
                >
                  {decision === "Approved" ? (
                    <Check size={14} />
                  ) : (
                    <Ban size={14} />
                  )}
                  Confirm {decision.toLowerCase()}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

const cellStyle: CSSProperties = {
  padding: "15px 16px",
  borderBottom: "1px solid #f1f5f9",
  verticalAlign: "middle",
};

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  background: "rgba(15, 23, 42, 0.55)",
  backdropFilter: "blur(3px)",
};

const modalStyle: CSSProperties = {
  width: "100%",
  maxWidth: 680,
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#fff",
  borderRadius: 16,
  boxShadow: "0 24px 70px rgba(15, 23, 42, 0.25)",
};

const modalHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  padding: "20px 22px",
  borderBottom: "1px solid #e5e7eb",
};

const detailBoxStyle: CSSProperties = {
  padding: 12,
  background: "#f8fafc",
  border: "1px solid #e5e7eb",
  borderRadius: 9,
  minWidth: 0,
};

const detailLabelStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 11,
  marginBottom: 7,
};

const detailValueStyle: CSSProperties = {
  color: "#111827",
  fontSize: 12,
  fontWeight: 650,
  overflowWrap: "anywhere",
};
