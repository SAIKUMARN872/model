
"use client";

import { useMemo, useState } from "react";
import {
  ShieldCheck,
  Search,
  Plus,
  X,
  Edit3,
  Trash2,
  CheckCircle2,
  LockKeyhole,
  RefreshCw,
  Globe,
  Building2,
  BriefcaseBusiness,
  CircleAlert,
  Clock3,
  FileCheck2,
  ChevronRight,
} from "lucide-react";

type PolicyStatus = "Active" | "Disabled" | "Review Required";
type PolicyScope = "Global" | "Organization" | "Workspace";
type Enforcement = "Allow" | "Deny" | "Require Approval";

type AccessPolicy = {
  id: string;
  name: string;
  description: string;
  scope: PolicyScope;
  enforcement: Enforcement;
  status: PolicyStatus;
  priority: number;
  appliesTo: string;
  requireMfa: boolean;
  approvalRequired: boolean;
  updatedAt: string;
};

const initialPolicies: AccessPolicy[] = [
  {
    id: "POL-1001",
    name: "Administrator Access Control",
    description:
      "Controls privileged access to ModelNow administrative features.",
    scope: "Global",
    enforcement: "Allow",
    status: "Active",
    priority: 1,
    appliesTo: "Super Admin",
    requireMfa: true,
    approvalRequired: false,
    updatedAt: "2026-10-30",
  },
  {
    id: "POL-1002",
    name: "Sensitive Action Approval",
    description:
      "Requires approval for high-impact changes to security and platform settings.",
    scope: "Global",
    enforcement: "Require Approval",
    status: "Active",
    priority: 2,
    appliesTo: "Security Admin",
    requireMfa: true,
    approvalRequired: true,
    updatedAt: "2026-10-29",
  },
  {
    id: "POL-1003",
    name: "API Key Management",
    description:
      "Restricts API credential management to authorized security roles.",
    scope: "Organization",
    enforcement: "Allow",
    status: "Active",
    priority: 3,
    appliesTo: "Security Admin",
    requireMfa: true,
    approvalRequired: true,
    updatedAt: "2026-10-28",
  },
  {
    id: "POL-1004",
    name: "Read-Only Analytics",
    description:
      "Limits analytics access to approved reporting and viewing operations.",
    scope: "Workspace",
    enforcement: "Allow",
    status: "Active",
    priority: 4,
    appliesTo: "Analyst",
    requireMfa: false,
    approvalRequired: false,
    updatedAt: "2026-10-27",
  },
  {
    id: "POL-1005",
    name: "Restricted Billing Changes",
    description:
      "Prevents unapproved billing configuration changes.",
    scope: "Organization",
    enforcement: "Require Approval",
    status: "Review Required",
    priority: 5,
    appliesTo: "Finance Admin",
    requireMfa: true,
    approvalRequired: true,
    updatedAt: "2026-10-26",
  },
  {
    id: "POL-1006",
    name: "Unapproved Agent Execution",
    description:
      "Blocks agent workflows that have not passed the required review.",
    scope: "Workspace",
    enforcement: "Deny",
    status: "Active",
    priority: 6,
    appliesTo: "Operator",
    requireMfa: false,
    approvalRequired: true,
    updatedAt: "2026-10-25",
  },
  {
    id: "POL-1007",
    name: "Knowledge Source Changes",
    description:
      "Requires authorization before knowledge sources can be modified.",
    scope: "Workspace",
    enforcement: "Require Approval",
    status: "Active",
    priority: 7,
    appliesTo: "Knowledge Manager",
    requireMfa: false,
    approvalRequired: true,
    updatedAt: "2026-10-24",
  },
];

const scopeOptions: PolicyScope[] = [
  "Global",
  "Organization",
  "Workspace",
];

const enforcementOptions: Enforcement[] = [
  "Allow",
  "Deny",
  "Require Approval",
];

const statusOptions: PolicyStatus[] = [
  "Active",
  "Disabled",
  "Review Required",
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

function getStatusStyle(status: PolicyStatus): React.CSSProperties {
  if (status === "Active") {
    return {
      color: "#15803d",
      background: "#dcfce7",
      border: "1px solid #bbf7d0",
    };
  }

  if (status === "Disabled") {
    return {
      color: "#6b7280",
      background: "#f3f4f6",
      border: "1px solid #e5e7eb",
    };
  }

  return {
    color: "#a16207",
    background: "#fef3c7",
    border: "1px solid #fde68a",
  };
}

function getEnforcementStyle(
  enforcement: Enforcement
): React.CSSProperties {
  if (enforcement === "Deny") {
    return {
      color: "#b91c1c",
      background: "#fee2e2",
    };
  }

  if (enforcement === "Require Approval") {
    return {
      color: "#a16207",
      background: "#fef3c7",
    };
  }

  return {
    color: "#15803d",
    background: "#dcfce7",
  };
}

function ScopeIcon({ scope }: { scope: PolicyScope }) {
  if (scope === "Global") return <Globe size={15} />;
  if (scope === "Organization") return <Building2 size={15} />;
  return <BriefcaseBusiness size={15} />;
}

export default function AccessPoliciesPage() {
  const [policies, setPolicies] =
    useState<AccessPolicy[]>(initialPolicies);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [scopeFilter, setScopeFilter] = useState("All");
  const [enforcementFilter, setEnforcementFilter] = useState("All");
  const [approvalOnly, setApprovalOnly] = useState(false);

  const [selected, setSelected] = useState<AccessPolicy | null>(null);
  const [editing, setEditing] = useState<AccessPolicy | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    scope: "Global" as PolicyScope,
    enforcement: "Allow" as Enforcement,
    status: "Active" as PolicyStatus,
    priority: 10,
    appliesTo: "Super Admin",
    requireMfa: false,
    approvalRequired: false,
  });

  const filteredPolicies = useMemo(() => {
    const term = search.trim().toLowerCase();

    return policies
      .filter((policy) => {
        const matchesSearch =
          !term ||
          policy.id.toLowerCase().includes(term) ||
          policy.name.toLowerCase().includes(term) ||
          policy.description.toLowerCase().includes(term) ||
          policy.appliesTo.toLowerCase().includes(term);

        const matchesStatus =
          statusFilter === "All" || policy.status === statusFilter;

        const matchesScope =
          scopeFilter === "All" || policy.scope === scopeFilter;

        const matchesEnforcement =
          enforcementFilter === "All" ||
          policy.enforcement === enforcementFilter;

        const matchesApproval =
          !approvalOnly || policy.approvalRequired;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesScope &&
          matchesEnforcement &&
          matchesApproval
        );
      })
      .sort((a, b) => a.priority - b.priority);
  }, [
    policies,
    search,
    statusFilter,
    scopeFilter,
    enforcementFilter,
    approvalOnly,
  ]);

  const activeCount = policies.filter(
    (policy) => policy.status === "Active"
  ).length;

  const approvalCount = policies.filter(
    (policy) => policy.approvalRequired
  ).length;

  const reviewCount = policies.filter(
    (policy) => policy.status === "Review Required"
  ).length;

  const mfaCount = policies.filter(
    (policy) => policy.requireMfa
  ).length;

  function openCreateForm() {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      scope: "Global",
      enforcement: "Allow",
      status: "Active",
      priority: Math.max(0, ...policies.map((p) => p.priority)) + 1,
      appliesTo: "Super Admin",
      requireMfa: false,
      approvalRequired: false,
    });
    setNotice("");
    setShowForm(true);
  }

  function openEditForm(policy: AccessPolicy) {
    setEditing(policy);
    setForm({
      name: policy.name,
      description: policy.description,
      scope: policy.scope,
      enforcement: policy.enforcement,
      status: policy.status,
      priority: policy.priority,
      appliesTo: policy.appliesTo,
      requireMfa: policy.requireMfa,
      approvalRequired: policy.approvalRequired,
    });
    setSelected(null);
    setNotice("");
    setShowForm(true);
  }

  function savePolicy() {
    if (!form.name.trim()) {
      setNotice("Enter a policy name.");
      return;
    }

    const updatedAt = new Date().toISOString().slice(0, 10);

    if (editing) {
      const updated: AccessPolicy = {
        ...editing,
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        priority: Math.max(1, Number(form.priority) || 1),
        updatedAt,
      };

      setPolicies((current) =>
        current.map((policy) =>
          policy.id === editing.id ? updated : policy
        )
      );

      setNotice("Access policy updated in local demo data.");
    } else {
      const created: AccessPolicy = {
        id: `POL-${Date.now().toString().slice(-6)}`,
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        priority: Math.max(1, Number(form.priority) || 1),
        updatedAt,
      };

      setPolicies((current) => [...current, created]);
      setNotice("Access policy created in local demo data.");
    }

    setShowForm(false);
    setEditing(null);
  }

  function changeStatus(id: string, status: PolicyStatus) {
    setPolicies((current) =>
      current.map((policy) =>
        policy.id === id
          ? {
              ...policy,
              status,
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : policy
      )
    );

    setSelected((current) =>
      current?.id === id ? { ...current, status } : current
    );

    setNotice("Policy status updated in local demo data.");
  }

  function deletePolicy(policy: AccessPolicy) {
    if (
      !window.confirm(
        `Delete "${policy.name}" from the local demo?`
      )
    ) {
      return;
    }

    setPolicies((current) =>
      current.filter((item) => item.id !== policy.id)
    );

    setSelected(null);
    setNotice("Policy deleted from local demo data.");
  }

  function resetDemo() {
    setPolicies(initialPolicies);
    setSearch("");
    setStatusFilter("All");
    setScopeFilter("All");
    setEnforcementFilter("All");
    setApprovalOnly(false);
    setSelected(null);
    setShowForm(false);
    setEditing(null);
    setNotice("Demo data has been reset.");
  }

  const cardStyle: React.CSSProperties = {
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
              <ShieldCheck size={16} />
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
              Access Policies
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
              Define how access is evaluated across ModelNow.
              Configure policy scope, enforcement, approvals, and
              additional security requirements.
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
                color: "#fff",
                background: blue,
                borderColor: blue,
              }}
              onClick={openCreateForm}
            >
              <Plus size={16} />
              Create policy
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
              label: "Total policies",
              value: policies.length,
              detail: "Configured access rules",
              icon: ShieldCheck,
              color: "#315fea",
              bg: "#eff6ff",
            },
            {
              label: "Active policies",
              value: activeCount,
              detail: "Currently marked active",
              icon: CheckCircle2,
              color: "#15803d",
              bg: "#dcfce7",
            },
            {
              label: "Approval required",
              value: approvalCount,
              detail: "Policies requiring approval",
              icon: FileCheck2,
              color: "#a16207",
              bg: "#fef3c7",
            },
            {
              label: "MFA policies",
              value: mfaCount,
              detail: "Marked as requiring MFA",
              icon: LockKeyhole,
              color: "#7c3aed",
              bg: "#ede9fe",
            },
            {
              label: "Pending review",
              value: reviewCount,
              detail: "Require administrator review",
              icon: CircleAlert,
              color: "#b91c1c",
              bg: "#fee2e2",
            },
          ].map((metric) => {
            const Icon = metric.icon;

            return (
              <div key={metric.label} style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
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
                Policy configuration
              </h2>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: 12,
                  margin: "5px 0 0",
                }}
              >
                Policies are ordered by priority, with lower numbers
                shown first.
              </p>
            </div>

            <button
              type="button"
              style={buttonStyle}
              onClick={() => setApprovalOnly((value) => !value)}
            >
              <FileCheck2 size={15} />
              {approvalOnly ? "Show all policies" : "Approval policies"}
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(175px, 1fr))",
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
                placeholder="Search policies..."
                aria-label="Search access policies"
                style={{ ...inputStyle, paddingLeft: 35 }}
              />
            </div>

            <select
              value={scopeFilter}
              onChange={(event) => setScopeFilter(event.target.value)}
              aria-label="Filter by scope"
              style={inputStyle}
            >
              <option value="All">All scopes</option>
              {scopeOptions.map((scope) => (
                <option key={scope} value={scope}>
                  {scope}
                </option>
              ))}
            </select>

            <select
              value={enforcementFilter}
              onChange={(event) =>
                setEnforcementFilter(event.target.value)
              }
              aria-label="Filter by enforcement"
              style={inputStyle}
            >
              <option value="All">All enforcement types</option>
              {enforcementOptions.map((enforcement) => (
                <option key={enforcement} value={enforcement}>
                  {enforcement}
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
                minWidth: 1050,
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {[
                    "Policy",
                    "Scope",
                    "Enforcement",
                    "Applies to",
                    "Security",
                    "Priority",
                    "Status",
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
                {filteredPolicies.map((policy) => (
                  <tr key={policy.id}>
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
                          <ShieldCheck size={17} />
                        </span>

                        <div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                            }}
                          >
                            {policy.name}
                          </div>
                          <div
                            style={{
                              color: "#9ca3af",
                              fontSize: 11,
                              marginTop: 4,
                            }}
                          >
                            {policy.id}
                          </div>
                          <div
                            style={{
                              color: "#6b7280",
                              fontSize: 11,
                              marginTop: 5,
                              maxWidth: 300,
                              lineHeight: 1.5,
                            }}
                          >
                            {policy.description}
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
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          color: "#4b5563",
                          fontSize: 12,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <ScopeIcon scope={policy.scope} />
                        {policy.scope}
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
                          ...getEnforcementStyle(policy.enforcement),
                          display: "inline-flex",
                          padding: "5px 8px",
                          borderRadius: 7,
                          fontSize: 10,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {policy.enforcement}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: 12,
                      }}
                    >
                      {policy.appliesTo}
                    </td>

                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gap: 6,
                          fontSize: 10,
                          color: "#6b7280",
                        }}
                      >
                        {policy.requireMfa && (
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                              color: "#7c3aed",
                            }}
                          >
                            <LockKeyhole size={12} />
                            MFA
                          </span>
                        )}
                        {policy.approvalRequired && (
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                              color: "#a16207",
                            }}
                          >
                            <FileCheck2 size={12} />
                            Approval
                          </span>
                        )}
                        {!policy.requireMfa &&
                          !policy.approvalRequired && "Standard"}
                      </div>
                    </td>

                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      P{policy.priority}
                    </td>

                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <span
                        style={{
                          ...getStatusStyle(policy.status),
                          display: "inline-flex",
                          padding: "5px 8px",
                          borderRadius: 20,
                          fontSize: 10,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {policy.status}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: "15px 14px",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelected(policy)}
                        style={{
                          ...buttonStyle,
                          padding: "7px 9px",
                          color: blue,
                        }}
                      >
                        Details
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredPolicies.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        textAlign: "center",
                        padding: 40,
                        color: "#6b7280",
                        fontSize: 13,
                      }}
                    >
                      No access policies match your filters.
                      <div style={{ marginTop: 12 }}>
                        <button
                          type="button"
                          style={buttonStyle}
                          onClick={() => {
                            setSearch("");
                            setStatusFilter("All");
                            setScopeFilter("All");
                            setEnforcementFilter("All");
                            setApprovalOnly(false);
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
            Demo data only. Policy settings are not enforced by your
            backend until server-side policy evaluation is implemented.
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
              <Globe size={18} color={blue} />
              <h3 style={{ fontSize: 13, margin: 0 }}>
                Policy scope
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
              Define whether a rule applies across the platform, to
              an organization, or within a specific workspace.
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
              <Clock3 size={18} color="#a16207" />
              <h3 style={{ fontSize: 13, margin: 0 }}>
                Approval workflows
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
              Use approval requirements for high-impact operations
              such as billing changes, API key management, and security
              configuration.
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
                Enforce policies server-side
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
              The backend must evaluate identity, scope, role,
              enforcement, and approval requirements for protected
              requests.
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
            background: "rgba(15,23,42,.35)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Access policy details"
            style={{
              width: "min(470px, 100%)",
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
                  ACCESS POLICY
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
                aria-label="Close policy details"
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
              {selected.description}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginTop: 18,
              }}
            >
              {[
                ["Scope", selected.scope],
                ["Enforcement", selected.enforcement],
                ["Applies to", selected.appliesTo],
                ["Priority", `P${selected.priority}`],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e5e7eb",
                    borderRadius: 9,
                    padding: 12,
                  }}
                >
                  <div
                    style={{
                      color: "#9ca3af",
                      fontSize: 11,
                      marginBottom: 6,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      color: "#111827",
                      fontSize: 12,
                      fontWeight: 650,
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 22 }}>
              <label
                htmlFor="policy-status"
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                Policy status
              </label>
              <select
                id="policy-status"
                value={selected.status}
                onChange={(event) =>
                  changeStatus(
                    selected.id,
                    event.target.value as PolicyStatus
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
            </div>

            <div
              style={{
                display: "grid",
                gap: 10,
                marginTop: 20,
              }}
            >
              {[
                {
                  label: "Multi-factor authentication",
                  enabled: selected.requireMfa,
                },
                {
                  label: "Approval required",
                  enabled: selected.approvalRequired,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    padding: 12,
                    border: "1px solid #e5e7eb",
                    borderRadius: 9,
                    fontSize: 12,
                    color: item.enabled ? "#15803d" : "#6b7280",
                  }}
                >
                  {item.enabled ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <CircleAlert size={16} />
                  )}
                  {item.label}: {item.enabled ? "Enabled" : "Not enabled"}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 9, marginTop: 24 }}>
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
                Edit policy
              </button>

              <button
                type="button"
                style={{
                  ...buttonStyle,
                  color: "#b91c1c",
                }}
                onClick={() => deletePolicy(selected)}
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
            aria-label={editing ? "Edit access policy" : "Create access policy"}
            style={{
              width: "min(680px, 100%)",
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
                justifyContent: "space-between",
                alignItems: "flex-start",
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
                  {editing ? "Edit access policy" : "Create access policy"}
                </h2>
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: 12,
                    lineHeight: 1.6,
                    margin: "7px 0 0",
                  }}
                >
                  Define the scope, enforcement behavior, and security
                  requirements for this policy.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close policy form"
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
                  "repeat(auto-fit, minmax(210px, 1fr))",
                gap: 14,
              }}
            >
              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  htmlFor="policy-name"
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 7,
                  }}
                >
                  Policy name *
                </label>
                <input
                  id="policy-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. Production Workspace Access"
                  style={inputStyle}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  htmlFor="policy-description"
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
                  id="policy-description"
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Describe the access rule..."
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="policy-scope"
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 7,
                  }}
                >
                  Policy scope
                </label>
                <select
                  id="policy-scope"
                  value={form.scope}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      scope: event.target.value as PolicyScope,
                    }))
                  }
                  style={inputStyle}
                >
                  {scopeOptions.map((scope) => (
                    <option key={scope} value={scope}>
                      {scope}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="policy-enforcement"
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 7,
                  }}
                >
                  Enforcement
                </label>
                <select
                  id="policy-enforcement"
                  value={form.enforcement}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      enforcement: event.target.value as Enforcement,
                    }))
                  }
                  style={inputStyle}
                >
                  {enforcementOptions.map((enforcement) => (
                    <option key={enforcement} value={enforcement}>
                      {enforcement}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="policy-role"
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 7,
                  }}
                >
                  Applies to role
                </label>
                <select
                  id="policy-role"
                  value={form.appliesTo}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      appliesTo: event.target.value,
                    }))
                  }
                  style={inputStyle}
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="policy-status-form"
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
                  id="policy-status-form"
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as PolicyStatus,
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

              <div>
                <label
                  htmlFor="policy-priority"
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 7,
                  }}
                >
                  Priority
                </label>
                <input
                  id="policy-priority"
                  type="number"
                  min={1}
                  value={form.priority}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      priority: Number(event.target.value),
                    }))
                  }
                  style={inputStyle}
                />
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: 11,
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              >
                <input
                  type="checkbox"
                  checked={form.requireMfa}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      requireMfa: event.target.checked,
                    }))
                  }
                />
                Require MFA
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: 11,
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              >
                <input
                  type="checkbox"
                  checked={form.approvalRequired}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      approvalRequired: event.target.checked,
                    }))
                  }
                />
                Require approval
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
                onClick={savePolicy}
              >
                <CheckCircle2 size={15} />
                {editing ? "Save changes" : "Create policy"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
