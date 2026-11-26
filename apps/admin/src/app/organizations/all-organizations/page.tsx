"use client";

import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import {
  Activity,
  ArrowDownToLine,
  Ban,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  Eye,
  Filter,
  Mail,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

type OrganizationPlan = "Enterprise" | "Business" | "Starter";
type OrganizationStatus = "Active" | "Suspended" | "Pending";

type Organization = {
  id: string;
  name: string;
  owner: string;
  plan: OrganizationPlan;
  members: number;
  status: OrganizationStatus;
  createdAt: string;
};

const initialOrganizations: Organization[] = [
  {
    id: "ORG-1001",
    name: "Acme Corporation",
    owner: "admin@acme.example",
    plan: "Enterprise",
    members: 842,
    status: "Active",
    createdAt: "January 12, 2026",
  },
  {
    id: "ORG-1002",
    name: "Northstar Technologies",
    owner: "admin@northstar.example",
    plan: "Enterprise",
    members: 624,
    status: "Active",
    createdAt: "February 8, 2026",
  },
  {
    id: "ORG-1003",
    name: "Vertex Labs",
    owner: "owner@vertex.example",
    plan: "Business",
    members: 186,
    status: "Active",
    createdAt: "March 21, 2026",
  },
  {
    id: "ORG-1004",
    name: "CloudWorks",
    owner: "admin@cloudworks.example",
    plan: "Business",
    members: 94,
    status: "Active",
    createdAt: "April 5, 2026",
  },
  {
    id: "ORG-1005",
    name: "Nova Research",
    owner: "owner@novaresearch.example",
    plan: "Starter",
    members: 28,
    status: "Pending",
    createdAt: "July 18, 2026",
  },
];

const C = {
  blue: "#315FEA",
  text: "var(--admin-text, #172033)",
  muted: "var(--admin-muted, #697386)",
  border: "var(--admin-border, #E3E7EF)",
  card: "var(--admin-card, #FFFFFF)",
  background: "var(--admin-bg, #F7F8FC)",
  green: "#15803D",
  red: "#B42318",
  amber: "#B45309",
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${C.border}`,
  borderRadius: 9,
  padding: "10px 12px",
  fontSize: 13,
  color: C.text,
  background: C.card,
  outline: "none",
};

const buttonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "9px 12px",
  borderRadius: 9,
  fontSize: 12,
  fontWeight: 650,
  cursor: "pointer",
  border: `1px solid ${C.border}`,
  background: C.card,
  color: C.text,
  whiteSpace: "nowrap",
};

const headingStyle: CSSProperties = {
  margin: 0,
  color: C.text,
  fontSize: 15,
  fontWeight: 750,
};

function StatusBadge({ status }: { status: OrganizationStatus }) {
  const styles: Record<
    OrganizationStatus,
    { color: string; background: string; icon: typeof CheckCircle2 }
  > = {
    Active: { color: C.green, background: "#DCFCE7", icon: CheckCircle2 },
    Suspended: { color: C.red, background: "#FEE2E2", icon: Ban },
    Pending: { color: C.amber, background: "#FEF3C7", icon: Clock3 },
  };

  const config = styles[status];
  const Icon = config.icon;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "5px 9px",
        borderRadius: 20,
        color: config.color,
        background: config.background,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      <Icon size={12} />
      {status}
    </span>
  );
}

function PlanBadge({ plan }: { plan: OrganizationPlan }) {
  const styles: Record<OrganizationPlan, { color: string; background: string }> =
    {
      Enterprise: { color: "#4338CA", background: "#EEF2FF" },
      Business: { color: "#0369A1", background: "#E0F2FE" },
      Starter: { color: "#475569", background: "#F1F5F9" },
    };

  return (
    <span
      style={{
        display: "inline-block",
        padding: "5px 9px",
        borderRadius: 7,
        background: styles[plan].background,
        color: styles[plan].color,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {plan}
    </span>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  color,
  background,
}: {
  title: string;
  value: number;
  description: string;
  icon: typeof Building2;
  color: string;
  background: string;
}) {
  return (
    <article
      style={{
        padding: 18,
        minWidth: 0,
        border: `1px solid ${C.border}`,
        borderRadius: 13,
        background: C.card,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <div>
          <p style={{ margin: 0, fontSize: 12, color: C.muted, fontWeight: 600 }}>
            {title}
          </p>
          <div
            style={{
              marginTop: 10,
              color: C.text,
              fontSize: 29,
              fontWeight: 800,
              letterSpacing: "-0.8px",
            }}
          >
            {value.toLocaleString("en-US")}
          </div>
        </div>

        <div
          style={{
            width: 42,
            height: 42,
            display: "grid",
            placeItems: "center",
            borderRadius: 11,
            color,
            background,
            flexShrink: 0,
          }}
        >
          <Icon size={21} />
        </div>
      </div>

      <p style={{ margin: "10px 0 0", fontSize: 11, color: C.muted }}>
        {description}
      </p>
    </article>
  );
}

export default function AllOrganizationsPage() {
  const [organizations, setOrganizations] =
    useState<Organization[]>(initialOrganizations);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Organization | null>(null);
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    name: "",
    owner: "",
    plan: "Starter" as OrganizationPlan,
  });

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return organizations.filter((org) => {
      const matchesSearch =
        !query ||
        org.name.toLowerCase().includes(query) ||
        org.id.toLowerCase().includes(query) ||
        org.owner.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || org.status === statusFilter;
      const matchesPlan = planFilter === "All" || org.plan === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [organizations, search, statusFilter, planFilter]);

  const metrics = useMemo(
    () => [
      {
        title: "Total organizations",
        value: organizations.length,
        description: "Organization records in this demo",
        icon: Building2,
        color: C.blue,
        background: "#EAF0FF",
      },
      {
        title: "Active organizations",
        value: organizations.filter((org) => org.status === "Active").length,
        description: "Currently marked as active",
        icon: CheckCircle2,
        color: C.green,
        background: "#DCFCE7",
      },
      {
        title: "Enterprise accounts",
        value: organizations.filter((org) => org.plan === "Enterprise").length,
        description: "Enterprise plan assignments",
        icon: ShieldCheck,
        color: "#6D4AFF",
        background: "#F0EBFF",
      },
      {
        title: "Pending organizations",
        value: organizations.filter((org) => org.status === "Pending").length,
        description: "Awaiting activation",
        icon: Clock3,
        color: C.amber,
        background: "#FEF3C7",
      },
    ],
    [organizations],
  );

  function openAddForm() {
    setEditingId(null);
    setForm({ name: "", owner: "", plan: "Starter" });
    setFormError("");
    setShowForm(true);
  }

  function openEditForm(org: Organization) {
    setEditingId(org.id);
    setForm({ name: org.name, owner: org.owner, plan: org.plan });
    setFormError("");
    setSelected(null);
    setShowForm(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const name = form.name.trim();
    const owner = form.owner.trim().toLowerCase();

    if (!name || !owner) {
      setFormError("Enter the organization name and owner email.");
      return;
    }

    const duplicate = organizations.some(
      (org) =>
        org.name.toLowerCase() === name.toLowerCase() &&
        org.id !== editingId,
    );

    if (duplicate) {
      setFormError("An organization with this name already exists.");
      return;
    }

    if (editingId) {
      setOrganizations((previous) =>
        previous.map((org) =>
          org.id === editingId
            ? { ...org, name, owner, plan: form.plan }
            : org,
        ),
      );
      setNotice("Organization updated in this demo.");
    } else {
      const maxId = organizations.reduce((max, org) => {
        const match = org.id.match(/\d+$/);
        return Math.max(max, match ? Number(match[0]) : 1000);
      }, 1000);

      const newOrg: Organization = {
        id: `ORG-${maxId + 1}`,
        name,
        owner,
        plan: form.plan,
        members: 1,
        status: "Pending",
        createdAt: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      };

      setOrganizations((previous) => [newOrg, ...previous]);
      setNotice("Organization added with Pending status.");
    }

    setShowForm(false);
    setForm({ name: "", owner: "", plan: "Starter" });
  }

  function changeStatus(org: Organization) {
    const nextStatus: OrganizationStatus =
      org.status === "Active" ? "Suspended" : "Active";

    setOrganizations((previous) =>
      previous.map((item) =>
        item.id === org.id ? { ...item, status: nextStatus } : item,
      ),
    );

    setSelected((previous) =>
      previous?.id === org.id ? { ...previous, status: nextStatus } : previous,
    );

    setNotice(`${org.name} marked ${nextStatus.toLowerCase()} in this demo.`);
  }

  function exportCsv() {
    const headers = [
      "Organization ID",
      "Organization",
      "Owner Email",
      "Plan",
      "Members",
      "Status",
      "Created At",
    ];

    const quote = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const lines = filtered.map((org) =>
      [
        org.id,
        org.name,
        org.owner,
        org.plan,
        org.members,
        org.status,
        org.createdAt,
      ]
        .map(quote)
        .join(","),
    );

    const csv = [headers.map(quote).join(","), ...lines].join("\r\n");
    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "modelnow-organizations.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    setNotice(`${filtered.length} organization records exported.`);
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("All");
    setPlanFilter("All");
  }

  const labelStyle: CSSProperties = {
    display: "block",
    fontSize: 12,
    fontWeight: 650,
    color: C.text,
    marginBottom: 7,
  };

  const cellStyle: CSSProperties = {
    padding: "14px 16px",
    borderBottom: `1px solid ${C.border}`,
    textAlign: "left",
    verticalAlign: "middle",
    fontSize: 12,
    color: C.text,
  };

  const overlayStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    display: "grid",
    placeItems: "center",
    padding: 16,
    background: "rgba(15, 23, 42, 0.48)",
    overflowY: "auto",
  };

  const modalStyle: CSSProperties = {
    width: "100%",
    maxWidth: 500,
    boxSizing: "border-box",
    padding: 23,
    background: C.card,
    color: C.text,
    border: `1px solid ${C.border}`,
    borderRadius: 15,
    boxShadow: "0 24px 80px rgba(15, 23, 42, 0.22)",
  };

  return (
    <main
      style={{
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        padding: "clamp(16px, 2.5vw, 30px)",
        background: C.background,
        color: C.text,
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 25,
        }}
      >
        <div style={{ flex: "1 1 350px", minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              marginBottom: 9,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                display: "grid",
                placeItems: "center",
                borderRadius: 10,
                color: C.blue,
                background: "#EAF0FF",
              }}
            >
              <Building2 size={20} />
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 750,
                color: C.blue,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              ModelNow Administration
            </span>
          </div>

          <h1
            style={{
              margin: "0 0 8px",
              fontSize: "clamp(25px, 3vw, 32px)",
              letterSpacing: "-1px",
              fontWeight: 800,
            }}
          >
            All Organizations
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: 680,
              fontSize: 13,
              lineHeight: 1.7,
              color: C.muted,
            }}
          >
            Manage enterprise accounts, organization owners, memberships,
            subscription plans, and account status.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          style={{
            ...buttonStyle,
            padding: "11px 16px",
            color: "#FFFFFF",
            background: C.blue,
            borderColor: C.blue,
          }}
        >
          <Plus size={16} />
          Add organization
        </button>
      </header>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          padding: "12px 14px",
          marginBottom: 22,
          borderRadius: 10,
          border: "1px solid #C7D7FE",
          background: "#EFF4FF",
          color: "#2445A6",
          fontSize: 12,
          lineHeight: 1.6,
        }}
      >
        <Activity size={17} style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <strong>Demo mode</strong>
          <div>
            Records are stored in page state only. Connect your backend API and
            database before using this page for production administration.
          </div>
        </div>
      </div>

      <section style={{ marginBottom: 27 }}>
        <div style={{ marginBottom: 14 }}>
          <h2 style={headingStyle}>Organization overview</h2>
          <p style={{ fontSize: 12, color: C.muted, margin: "5px 0 0" }}>
            Summary of organizations in the current directory.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))",
            gap: 14,
          }}
        >
          {metrics.map((metric) => (
            <MetricCard key={metric.title} {...metric} />
          ))}
        </div>
      </section>

      <section
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 13,
          overflow: "hidden",
          marginBottom: 25,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            padding: 18,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div>
            <h2 style={headingStyle}>Organization directory</h2>
            <p style={{ fontSize: 12, color: C.muted, margin: "5px 0 0" }}>
              Search, inspect, export, and manage organization accounts.
            </p>
          </div>

          <span
            style={{
              fontSize: 11,
              color: C.muted,
              background: "#F1F5F9",
              padding: "6px 9px",
              borderRadius: 7,
              fontWeight: 650,
            }}
          >
            {filtered.length} of {organizations.length} records
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
            gap: 10,
            padding: 16,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div style={{ position: "relative" }}>
            <Search
              size={16}
              color={C.muted}
              style={{
                position: "absolute",
                left: 11,
                top: 11,
                pointerEvents: "none",
              }}
            />
            <input
              aria-label="Search organizations"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, ID, or owner..."
              style={{ ...inputStyle, paddingLeft: 35 }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <Filter
              size={14}
              color={C.muted}
              style={{
                position: "absolute",
                left: 11,
                top: 12,
                pointerEvents: "none",
              }}
            />
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              style={{
                ...inputStyle,
                appearance: "none",
                paddingLeft: 32,
                paddingRight: 29,
                cursor: "pointer",
              }}
            >
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Pending">Pending</option>
            </select>
            <ChevronDown
              size={14}
              color={C.muted}
              style={{
                position: "absolute",
                right: 10,
                top: 12,
                pointerEvents: "none",
              }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <CreditCard
              size={14}
              color={C.muted}
              style={{
                position: "absolute",
                left: 11,
                top: 12,
                pointerEvents: "none",
              }}
            />
            <select
              aria-label="Filter by plan"
              value={planFilter}
              onChange={(event) => setPlanFilter(event.target.value)}
              style={{
                ...inputStyle,
                appearance: "none",
                paddingLeft: 32,
                paddingRight: 29,
                cursor: "pointer",
              }}
            >
              <option value="All">All plans</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Business">Business</option>
              <option value="Starter">Starter</option>
            </select>
            <ChevronDown
              size={14}
              color={C.muted}
              style={{
                position: "absolute",
                right: 10,
                top: 12,
                pointerEvents: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button type="button" onClick={resetFilters} style={buttonStyle}>
              <RefreshCw size={14} />
              Reset
            </button>
            <button type="button" onClick={exportCsv} style={buttonStyle}>
              <ArrowDownToLine size={14} />
              Export CSV
            </button>
          </div>
        </div>

        <div style={{ overflowX: "auto", width: "100%" }}>
          <table
            style={{
              width: "100%",
              minWidth: 970,
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                {[
                  "Organization",
                  "Owner",
                  "Plan",
                  "Members",
                  "Status",
                  "Created",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      ...cellStyle,
                      color: C.muted,
                      fontSize: 10,
                      fontWeight: 750,
                      textTransform: "uppercase",
                      letterSpacing: "0.6px",
                      paddingTop: 12,
                      paddingBottom: 12,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.map((org) => (
                <tr key={org.id}>
                  <td style={cellStyle}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        minWidth: 190,
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 9,
                          display: "grid",
                          placeItems: "center",
                          background: "#EAF0FF",
                          color: C.blue,
                          flexShrink: 0,
                        }}
                      >
                        <Building2 size={17} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 12 }}>
                          {org.name}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: C.muted,
                            marginTop: 4,
                          }}
                        >
                          {org.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={cellStyle}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Mail size={13} color={C.muted} />
                      {org.owner}
                    </div>
                  </td>

                  <td style={cellStyle}>
                    <PlanBadge plan={org.plan} />
                  </td>

                  <td style={cellStyle}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontWeight: 650,
                      }}
                    >
                      <Users size={14} color={C.muted} />
                      {org.members.toLocaleString("en-US")}
                    </span>
                  </td>

                  <td style={cellStyle}>
                    <StatusBadge status={org.status} />
                  </td>

                  <td style={{ ...cellStyle, whiteSpace: "nowrap" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <CalendarDays size={13} color={C.muted} />
                      {org.createdAt}
                    </span>
                  </td>

                  <td style={cellStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <button
                        type="button"
                        title="View organization"
                        aria-label={`View ${org.name}`}
                        onClick={() => setSelected(org)}
                        style={{ ...buttonStyle, padding: 7 }}
                      >
                        <Eye size={14} />
                      </button>

                      <button
                        type="button"
                        title="Edit organization"
                        aria-label={`Edit ${org.name}`}
                        onClick={() => openEditForm(org)}
                        style={{ ...buttonStyle, padding: 7 }}
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        type="button"
                        title={
                          org.status === "Active"
                            ? "Suspend organization"
                            : "Activate organization"
                        }
                        aria-label={
                          org.status === "Active"
                            ? `Suspend ${org.name}`
                            : `Activate ${org.name}`
                        }
                        onClick={() => changeStatus(org)}
                        style={{
                          ...buttonStyle,
                          padding: 7,
                          color: org.status === "Active" ? C.red : C.green,
                        }}
                      >
                        {org.status === "Active" ? (
                          <Ban size={14} />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: "48px 20px",
                      textAlign: "center",
                      color: C.muted,
                    }}
                  >
                    <Building2
                      size={30}
                      style={{ display: "block", margin: "0 auto 12px" }}
                    />
                    <strong
                      style={{
                        display: "block",
                        fontSize: 14,
                        color: C.text,
                        marginBottom: 6,
                      }}
                    >
                      No organizations found
                    </strong>
                    <span style={{ fontSize: 12 }}>
                      Change your search or filters and try again.
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            padding: "13px 17px",
            borderTop: `1px solid ${C.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 11, color: C.muted }}>
            Showing {filtered.length} organization
            {filtered.length === 1 ? "" : "s"}
          </span>
          <span style={{ fontSize: 11, color: C.muted }}>
            Demo directory · No backend connection
          </span>
        </div>
      </section>

      <section style={{ marginBottom: 25 }}>
        <div style={{ marginBottom: 14 }}>
          <h2 style={headingStyle}>Organization management</h2>
          <p style={{ fontSize: 12, color: C.muted, margin: "5px 0 0" }}>
            Core administrative capabilities across ModelNow.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 12,
          }}
        >
          {[
            {
              title: "Organization lifecycle",
              description: "Review organization status and manage activation.",
              icon: Building2,
            },
            {
              title: "Membership administration",
              description: "Review member counts and organization ownership.",
              icon: Users,
            },
            {
              title: "Subscription management",
              description: "Review plan assignments for each organization.",
              icon: CreditCard,
            },
            {
              title: "Access and security",
              description: "Manage account access and suspension status.",
              icon: ShieldCheck,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                style={{
                  padding: 17,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  background: C.card,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    display: "grid",
                    placeItems: "center",
                    background: "#EEF2FF",
                    color: C.blue,
                    borderRadius: 9,
                    marginBottom: 12,
                  }}
                >
                  <Icon size={18} />
                </div>
                <h3
                  style={{
                    fontSize: 13,
                    fontWeight: 750,
                    margin: "0 0 7px",
                    color: C.text,
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: 11,
                    lineHeight: 1.7,
                    margin: 0,
                    color: C.muted,
                  }}
                >
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {showForm && (
        <div
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowForm(false);
          }}
          style={overlayStyle}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="organization-form-title"
            style={modalStyle}
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
                  id="organization-form-title"
                  style={{ fontSize: 19, fontWeight: 800, margin: "0 0 6px" }}
                >
                  {editingId ? "Edit organization" : "Add organization"}
                </h2>
                <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
                  {editingId
                    ? "Update organization information."
                    : "Create a new organization record."}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close form"
                onClick={() => setShowForm(false)}
                style={{ ...buttonStyle, padding: 7 }}
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="org-name" style={labelStyle}>
                  Organization name *
                </label>
                <input
                  id="org-name"
                  autoFocus
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. Acme Corporation"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label htmlFor="org-owner" style={labelStyle}>
                  Owner email *
                </label>
                <input
                  id="org-owner"
                  type="email"
                  required
                  maxLength={254}
                  value={form.owner}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      owner: event.target.value,
                    }))
                  }
                  placeholder="owner@company.com"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 19 }}>
                <label htmlFor="org-plan" style={labelStyle}>
                  Subscription plan
                </label>
                <select
                  id="org-plan"
                  value={form.plan}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      plan: event.target.value as OrganizationPlan,
                    }))
                  }
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="Starter">Starter</option>
                  <option value="Business">Business</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              {formError && (
                <p
                  role="alert"
                  style={{
                    fontSize: 12,
                    color: C.red,
                    background: "#FEF2F2",
                    padding: 10,
                    borderRadius: 8,
                    margin: "0 0 15px",
                  }}
                >
                  {formError}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  flexWrap: "wrap",
                  gap: 9,
                  paddingTop: 15,
                  borderTop: `1px solid ${C.border}`,
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={buttonStyle}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    ...buttonStyle,
                    background: C.blue,
                    color: "#FFFFFF",
                    borderColor: C.blue,
                  }}
                >
                  <Check size={15} />
                  {editingId ? "Save changes" : "Create organization"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selected && (
        <div
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
          style={overlayStyle}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="organization-details-title"
            style={modalStyle}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    display: "grid",
                    placeItems: "center",
                    background: "#EAF0FF",
                    color: C.blue,
                    borderRadius: 12,
                    flexShrink: 0,
                  }}
                >
                  <Building2 size={24} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h2
                    id="organization-details-title"
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      margin: "0 0 5px",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {selected.name}
                  </h2>
                  <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
                    {selected.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-label="Close organization details"
                onClick={() => setSelected(null)}
                style={{ ...buttonStyle, padding: 7 }}
              >
                <X size={17} />
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 18,
                marginBottom: 20,
              }}
            >
              <StatusBadge status={selected.status} />
              <PlanBadge plan={selected.plan} />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 10,
                marginBottom: 18,
              }}
            >
              {[
                {
                  label: "Members",
                  value: selected.members.toLocaleString("en-US"),
                  icon: Users,
                },
                {
                  label: "Subscription plan",
                  value: selected.plan,
                  icon: CreditCard,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    style={{
                      border: `1px solid ${C.border}`,
                      background: C.background,
                      borderRadius: 10,
                      padding: 14,
                    }}
                  >
                    <Icon size={17} color={C.blue} />
                    <p style={{ fontSize: 11, color: C.muted, margin: "9px 0 5px" }}>
                      {item.label}
                    </p>
                    <strong style={{ fontSize: 16 }}>{item.value}</strong>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                borderTop: `1px solid ${C.border}`,
                paddingTop: 14,
              }}
            >
              <p style={{ fontSize: 11, color: C.muted, margin: "0 0 6px" }}>
                Organization owner
              </p>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  margin: "0 0 15px",
                  overflowWrap: "anywhere",
                }}
              >
                {selected.owner}
              </p>

              <p style={{ fontSize: 11, color: C.muted, margin: "0 0 6px" }}>
                Created on
              </p>
              <p style={{ fontSize: 13, margin: 0 }}>{selected.createdAt}</p>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                flexWrap: "wrap",
                gap: 9,
                marginTop: 22,
                paddingTop: 15,
                borderTop: `1px solid ${C.border}`,
              }}
            >
              <button
                type="button"
                onClick={() => openEditForm(selected)}
                style={buttonStyle}
              >
                <Pencil size={14} />
                Edit
              </button>

              <button
                type="button"
                onClick={() => changeStatus(selected)}
                style={{
                  ...buttonStyle,
                  color: selected.status === "Active" ? C.red : C.green,
                }}
              >
                {selected.status === "Active" ? (
                  <>
                    <Ban size={14} />
                    Suspend
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    Activate
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSelected(null)}
                style={{
                  ...buttonStyle,
                  background: C.blue,
                  borderColor: C.blue,
                  color: "#FFFFFF",
                }}
              >
                Done
              </button>
            </div>
          </section>
        </div>
      )}

      {notice && (
        <div
          role="status"
          style={{
            position: "fixed",
            right: 20,
            bottom: 20,
            zIndex: 1100,
            maxWidth: "calc(100vw - 40px)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "13px 15px",
            background: "#172033",
            color: "#FFFFFF",
            borderRadius: 11,
            boxShadow: "0 10px 35px rgba(15, 23, 42, 0.22)",
            fontSize: 12,
          }}
        >
          <CheckCircle2 size={17} color="#86EFAC" />
          <span>{notice}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
            style={{
              border: 0,
              padding: 3,
              background: "transparent",
              color: "#FFFFFF",
              cursor: "pointer",
            }}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </main>
  );
}