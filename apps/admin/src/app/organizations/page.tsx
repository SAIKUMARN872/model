
"use client";

import { useMemo, useState, type FormEvent, type CSSProperties } from "react";
import {
  Building2,
  Users,
  Search,
  Plus,
  X,
  Eye,
  Pencil,
  ShieldCheck,
  Ban,
  CheckCircle2,
  Clock3,
  ChevronDown,
  Mail,
  CalendarDays,
  CreditCard,
  Activity,
  Filter,
  RefreshCw,
  MoreHorizontal,
  ArrowUpRight,
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

const colors = {
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

const baseInput: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${colors.border}`,
  borderRadius: 9,
  padding: "10px 12px",
  fontSize: 13,
  color: colors.text,
  background: colors.card,
  outline: "none",
};

const buttonBase: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "9px 13px",
  borderRadius: 9,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  border: `1px solid ${colors.border}`,
  background: colors.card,
  color: colors.text,
  whiteSpace: "nowrap",
};

function StatusBadge({ status }: { status: OrganizationStatus }) {
  const config = {
    Active: { color: "#15803D", bg: "#DCFCE7", icon: CheckCircle2 },
    Suspended: { color: "#B42318", bg: "#FEE2E2", icon: Ban },
    Pending: { color: "#B45309", bg: "#FEF3C7", icon: Clock3 },
  };

  const item = config[status];
  const Icon = item.icon;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "5px 9px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        color: item.color,
        background: item.bg,
        whiteSpace: "nowrap",
      }}
    >
      <Icon size={12} />
      {status}
    </span>
  );
}

function PlanBadge({ plan }: { plan: OrganizationPlan }) {
  const config = {
    Enterprise: { color: "#4338CA", bg: "#EEF2FF" },
    Business: { color: "#0369A1", bg: "#E0F2FE" },
    Starter: { color: "#475569", bg: "#F1F5F9" },
  };

  const item = config[plan];

  return (
    <span
      style={{
        display: "inline-block",
        padding: "5px 9px",
        borderRadius: 7,
        background: item.bg,
        color: item.color,
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
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 13,
        padding: 18,
        minWidth: 0,
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
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontSize: 12,
              color: colors.muted,
              margin: 0,
              fontWeight: 600,
            }}
          >
            {title}
          </p>
          <div
            style={{
              fontSize: 29,
              fontWeight: 750,
              color: colors.text,
              marginTop: 11,
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
            borderRadius: 11,
            display: "grid",
            placeItems: "center",
            color,
            background,
            flexShrink: 0,
          }}
        >
          <Icon size={21} />
        </div>
      </div>

      <p style={{ fontSize: 11, color: colors.muted, margin: "10px 0 0" }}>
        {description}
      </p>
    </article>
  );
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] =
    useState<Organization[]>(initialOrganizations);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    name: "",
    owner: "",
    plan: "Starter" as OrganizationPlan,
  });

  const filteredOrganizations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return organizations.filter((organization) => {
      const matchesSearch =
        !query ||
        organization.name.toLowerCase().includes(query) ||
        organization.id.toLowerCase().includes(query) ||
        organization.owner.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || organization.status === statusFilter;

      const matchesPlan =
        planFilter === "All" || organization.plan === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [organizations, search, statusFilter, planFilter]);

  const metrics = useMemo(
    () => [
      {
        title: "Total Organizations",
        value: organizations.length,
        description: "Organizations in this demo directory",
        icon: Building2,
        color: "#315FEA",
        background: "#EAF0FF",
      },
      {
        title: "Active Organizations",
        value: organizations.filter((item) => item.status === "Active").length,
        description: "Currently marked as active",
        icon: CheckCircle2,
        color: "#15803D",
        background: "#DCFCE7",
      },
      {
        title: "Enterprise Accounts",
        value: organizations.filter((item) => item.plan === "Enterprise")
          .length,
        description: "Organizations on Enterprise plans",
        icon: ShieldCheck,
        color: "#6D4AFF",
        background: "#F0EBFF",
      },
      {
        title: "Pending Organizations",
        value: organizations.filter((item) => item.status === "Pending")
          .length,
        description: "Awaiting activation",
        icon: Clock3,
        color: "#B45309",
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

  function openEditForm(organization: Organization) {
    setEditingId(organization.id);
    setForm({
      name: organization.name,
      owner: organization.owner,
      plan: organization.plan,
    });
    setFormError("");
    setSelectedOrganization(null);
    setShowForm(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const name = form.name.trim();
    const owner = form.owner.trim();

    if (!name || !owner) {
      setFormError("Please enter both the organization name and owner email.");
      return;
    }

    const duplicate = organizations.some(
      (item) =>
        item.name.toLowerCase() === name.toLowerCase() &&
        item.id !== editingId,
    );

    if (duplicate) {
      setFormError("An organization with this name already exists.");
      return;
    }

    if (editingId) {
      setOrganizations((previous) =>
        previous.map((item) =>
          item.id === editingId
            ? { ...item, name, owner, plan: form.plan }
            : item,
        ),
      );
      setNotice("Organization updated successfully in this demo.");
    } else {
      const nextNumber =
        Math.max(
          1000,
          ...organizations.map((item) => {
            const match = item.id.match(/\d+$/);
            return match ? Number(match[0]) : 1000;
          }),
        ) + 1;

      const newOrganization: Organization = {
        id: `ORG-${nextNumber}`,
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

      setOrganizations((previous) => [newOrganization, ...previous]);
      setNotice("Organization added as Pending in this demo.");
    }

    setShowForm(false);
    setForm({ name: "", owner: "", plan: "Starter" });
  }

  function changeStatus(organization: Organization) {
    const nextStatus: OrganizationStatus =
      organization.status === "Active" ? "Suspended" : "Active";

    setOrganizations((previous) =>
      previous.map((item) =>
        item.id === organization.id ? { ...item, status: nextStatus } : item,
      ),
    );

    setSelectedOrganization((previous) =>
      previous?.id === organization.id
        ? { ...previous, status: nextStatus }
        : previous,
    );

    setNotice(
      `${organization.name} marked ${nextStatus.toLowerCase()} in this demo.`,
    );
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("All");
    setPlanFilter("All");
  }

  const sectionHeading: CSSProperties = {
    fontSize: 15,
    fontWeight: 750,
    color: colors.text,
    margin: 0,
  };

  const smallLabel: CSSProperties = {
    display: "block",
    fontSize: 12,
    fontWeight: 650,
    color: colors.text,
    marginBottom: 7,
  };

  const cellStyle: CSSProperties = {
    padding: "14px 16px",
    borderBottom: `1px solid ${colors.border}`,
    textAlign: "left",
    verticalAlign: "middle",
    fontSize: 12,
    color: colors.text,
  };

  return (
    <main
      style={{
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        padding: "clamp(16px, 2.5vw, 30px)",
        background: colors.background,
        color: colors.text,
      }}
    >
      {/* Page heading */}
      <header
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 25,
        }}
      >
        <div style={{ minWidth: 0, flex: "1 1 350px" }}>
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
                display: "grid",
                placeItems: "center",
                width: 38,
                height: 38,
                borderRadius: 10,
                color: colors.blue,
                background: "#EAF0FF",
              }}
            >
              <Building2 size={20} />
            </div>

            <span
              style={{
                fontSize: 11,
                fontWeight: 750,
                color: colors.blue,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              ModelNow Administration
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(25px, 3vw, 32px)",
              letterSpacing: "-1px",
              fontWeight: 800,
              margin: "0 0 8px",
              color: colors.text,
            }}
          >
            Organizations
          </h1>

          <p
            style={{
              fontSize: 13,
              lineHeight: 1.7,
              color: colors.muted,
              maxWidth: 680,
              margin: 0,
            }}
          >
            Manage organizations, enterprise accounts, memberships,
            subscription plans, and organizational access across ModelNow.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          style={{
            ...buttonBase,
            background: colors.blue,
            borderColor: colors.blue,
            color: "#FFFFFF",
            padding: "11px 16px",
            alignSelf: "flex-start",
          }}
        >
          <Plus size={16} />
          Add organization
        </button>
      </header>

      {/* Demo notice */}
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
            Organization records and changes on this page are local to the
            current page session. Connect the organization API and database
            before using this page for production administration.
          </div>
        </div>
      </div>

      {/* Metrics */}
      <section style={{ marginBottom: 27 }}>
        <div style={{ marginBottom: 14 }}>
          <h2 style={sectionHeading}>Organization overview</h2>
          <p
            style={{
              fontSize: 12,
              color: colors.muted,
              margin: "5px 0 0",
            }}
          >
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

      {/* Directory */}
      <section
        style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
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
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div>
            <h2 style={sectionHeading}>Organization directory</h2>
            <p
              style={{
                fontSize: 12,
                color: colors.muted,
                margin: "5px 0 0",
              }}
            >
              Search, inspect, and manage organization accounts.
            </p>
          </div>

          <span
            style={{
              fontSize: 11,
              color: colors.muted,
              background: "#F1F5F9",
              padding: "6px 9px",
              borderRadius: 7,
              fontWeight: 650,
            }}
          >
            {filteredOrganizations.length} of {organizations.length} records
          </span>
        </div>

        {/* Search and filters */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
            gap: 10,
            padding: 16,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div style={{ position: "relative" }}>
            <Search
              size={16}
              color={colors.muted}
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
              style={{ ...baseInput, paddingLeft: 35 }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <Filter
              size={14}
              color={colors.muted}
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
                ...baseInput,
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
              color={colors.muted}
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
              color={colors.muted}
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
                ...baseInput,
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
              color={colors.muted}
              style={{
                position: "absolute",
                right: 10,
                top: 12,
                pointerEvents: "none",
              }}
            />
          </div>

          <button
            type="button"
            onClick={resetFilters}
            style={{ ...buttonBase, justifySelf: "start" }}
          >
            <RefreshCw size={14} />
            Reset filters
          </button>
        </div>

        {/* Table */}
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
                      color: colors.muted,
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
              {filteredOrganizations.map((organization) => (
                <tr key={organization.id}>
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
                          color: colors.blue,
                          flexShrink: 0,
                        }}
                      >
                        <Building2 size={17} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 12 }}>
                          {organization.name}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: colors.muted,
                            marginTop: 4,
                          }}
                        >
                          {organization.id}
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
                      <Mail size={13} color={colors.muted} />
                      {organization.owner}
                    </div>
                  </td>

                  <td style={cellStyle}>
                    <PlanBadge plan={organization.plan} />
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
                      <Users size={14} color={colors.muted} />
                      {organization.members.toLocaleString("en-US")}
                    </span>
                  </td>

                  <td style={cellStyle}>
                    <StatusBadge status={organization.status} />
                  </td>

                  <td style={{ ...cellStyle, whiteSpace: "nowrap" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <CalendarDays size={13} color={colors.muted} />
                      {organization.createdAt}
                    </span>
                  </td>

                  <td style={cellStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <button
                        type="button"
                        title="View organization"
                        aria-label={`View ${organization.name}`}
                        onClick={() => setSelectedOrganization(organization)}
                        style={{
                          ...buttonBase,
                          padding: 7,
                          borderRadius: 7,
                        }}
                      >
                        <Eye size={14} />
                      </button>

                      <button
                        type="button"
                        title="Edit organization"
                        aria-label={`Edit ${organization.name}`}
                        onClick={() => openEditForm(organization)}
                        style={{
                          ...buttonBase,
                          padding: 7,
                          borderRadius: 7,
                        }}
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        type="button"
                        title={
                          organization.status === "Active"
                            ? "Suspend organization"
                            : "Activate organization"
                        }
                        aria-label={
                          organization.status === "Active"
                            ? `Suspend ${organization.name}`
                            : `Activate ${organization.name}`
                        }
                        onClick={() => changeStatus(organization)}
                        style={{
                          ...buttonBase,
                          padding: 7,
                          borderRadius: 7,
                          color:
                            organization.status === "Active"
                              ? colors.red
                              : colors.green,
                        }}
                      >
                        {organization.status === "Active" ? (
                          <Ban size={14} />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredOrganizations.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: "48px 20px",
                      textAlign: "center",
                      color: colors.muted,
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
                        color: colors.text,
                        marginBottom: 6,
                      }}
                    >
                      No organizations found
                    </strong>
                    <span style={{ fontSize: 12 }}>
                      Try changing your search or filters.
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
            borderTop: `1px solid ${colors.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 11, color: colors.muted }}>
            Showing {filteredOrganizations.length} organization
            {filteredOrganizations.length === 1 ? "" : "s"}
          </span>
          <span style={{ fontSize: 11, color: colors.muted }}>
            Demo directory · No backend connection
          </span>
        </div>
      </section>

      {/* Organization management capabilities */}
      <section style={{ marginBottom: 25 }}>
        <div style={{ marginBottom: 14 }}>
          <h2 style={sectionHeading}>Organization management</h2>
          <p
            style={{
              fontSize: 12,
              color: colors.muted,
              margin: "5px 0 0",
            }}
          >
            Administrative capabilities for managing organizations across
            ModelNow.
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
              description: "Review organization member counts and ownership.",
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
                  border: `1px solid ${colors.border}`,
                  borderRadius: 12,
                  background: colors.card,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    display: "grid",
                    placeItems: "center",
                    background: "#EEF2FF",
                    color: colors.blue,
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
                    color: colors.text,
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    fontSize: 11,
                    lineHeight: 1.7,
                    margin: 0,
                    color: colors.muted,
                  }}
                >
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Add/Edit organization modal */}
      {showForm && (
        <div
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowForm(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "grid",
            placeItems: "center",
            padding: 16,
            background: "rgba(15, 23, 42, 0.48)",
            overflowY: "auto",
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="organization-form-title"
            style={{
              width: "100%",
              maxWidth: 470,
              boxSizing: "border-box",
              borderRadius: 15,
              padding: 23,
              background: colors.card,
              border: `1px solid ${colors.border}`,
              boxShadow: "0 24px 80px rgba(15, 23, 42, 0.22)",
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
                  id="organization-form-title"
                  style={{
                    fontSize: 19,
                    fontWeight: 800,
                    margin: "0 0 6px",
                    color: colors.text,
                  }}
                >
                  {editingId ? "Edit organization" : "Add organization"}
                </h2>
                <p
                  style={{
                    fontSize: 12,
                    color: colors.muted,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {editingId
                    ? "Update the organization details in this demo."
                    : "Create an organization entry in the demo directory."}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close form"
                onClick={() => setShowForm(false)}
                style={{ ...buttonBase, padding: 7 }}
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="organization-name" style={smallLabel}>
                  Organization name *
                </label>
                <input
                  id="organization-name"
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
                  style={baseInput}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label htmlFor="organization-owner" style={smallLabel}>
                  Owner email *
                </label>
                <input
                  id="organization-owner"
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
                  style={baseInput}
                />
              </div>

              <div style={{ marginBottom: 19 }}>
                <label htmlFor="organization-plan" style={smallLabel}>
                  Subscription plan
                </label>
                <select
                  id="organization-plan"
                  value={form.plan}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      plan: event.target.value as OrganizationPlan,
                    }))
                  }
                  style={{ ...baseInput, cursor: "pointer" }}
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
                    color: colors.red,
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
                  borderTop: `1px solid ${colors.border}`,
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={buttonBase}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    ...buttonBase,
                    background: colors.blue,
                    color: "#FFFFFF",
                    borderColor: colors.blue,
                  }}
                >
                  <CheckCircle2 size={15} />
                  {editingId ? "Save changes" : "Create organization"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Organization details modal */}
      {selectedOrganization && (
        <div
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedOrganization(null);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "grid",
            placeItems: "center",
            padding: 16,
            background: "rgba(15, 23, 42, 0.48)",
            overflowY: "auto",
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="organization-details-title"
            style={{
              width: "100%",
              maxWidth: 500,
              boxSizing: "border-box",
              padding: 23,
              background: colors.card,
              border: `1px solid ${colors.border}`,
              borderRadius: 15,
              boxShadow: "0 24px 80px rgba(15, 23, 42, 0.22)",
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
                    color: colors.blue,
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
                    {selectedOrganization.name}
                  </h2>
                  <p
                    style={{
                      fontSize: 11,
                      color: colors.muted,
                      margin: 0,
                    }}
                  >
                    {selectedOrganization.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-label="Close organization details"
                onClick={() => setSelectedOrganization(null)}
                style={{ ...buttonBase, padding: 7 }}
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
              <StatusBadge status={selectedOrganization.status} />
              <PlanBadge plan={selectedOrganization.plan} />
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
                  value: selectedOrganization.members.toLocaleString("en-US"),
                  icon: Users,
                },
                {
                  label: "Subscription plan",
                  value: selectedOrganization.plan,
                  icon: CreditCard,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    style={{
                      border: `1px solid ${colors.border}`,
                      background: colors.background,
                      borderRadius: 10,
                      padding: 14,
                    }}
                  >
                    <Icon size={17} color={colors.blue} />
                    <p
                      style={{
                        fontSize: 11,
                        color: colors.muted,
                        margin: "9px 0 5px",
                      }}
                    >
                      {item.label}
                    </p>
                    <strong style={{ fontSize: 16 }}>{item.value}</strong>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                borderTop: `1px solid ${colors.border}`,
                paddingTop: 14,
              }}
            >
              <div style={{ marginBottom: 15 }}>
                <p
                  style={{
                    fontSize: 11,
                    color: colors.muted,
                    margin: "0 0 6px",
                  }}
                >
                  Organization owner
                </p>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    margin: 0,
                    overflowWrap: "anywhere",
                  }}
                >
                  {selectedOrganization.owner}
                </p>
              </div>

              <div>
                <p
                  style={{
                    fontSize: 11,
                    color: colors.muted,
                    margin: "0 0 6px",
                  }}
                >
                  Created on
                </p>
                <p style={{ fontSize: 13, margin: 0 }}>
                  {selectedOrganization.createdAt}
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                flexWrap: "wrap",
                gap: 9,
                marginTop: 22,
                paddingTop: 15,
                borderTop: `1px solid ${colors.border}`,
              }}
            >
              <button
                type="button"
                onClick={() => openEditForm(selectedOrganization)}
                style={buttonBase}
              >
                <Pencil size={14} />
                Edit
              </button>

              <button
                type="button"
                onClick={() => changeStatus(selectedOrganization)}
                style={{
                  ...buttonBase,
                  color:
                    selectedOrganization.status === "Active"
                      ? colors.red
                      : colors.green,
                }}
              >
                {selectedOrganization.status === "Active" ? (
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
                onClick={() => setSelectedOrganization(null)}
                style={{
                  ...buttonBase,
                  background: colors.blue,
                  borderColor: colors.blue,
                  color: "#FFFFFF",
                }}
              >
                Done
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Temporary notification */}
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
