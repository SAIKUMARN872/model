"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Ban,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  ExternalLink,
  Globe,
  MoreHorizontal,
  Plus,
  RefreshCw,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

type OrgStatus = "Active" | "Pending" | "Suspended";
type OrgPlan = "Enterprise" | "Business" | "Starter";

type Organization = {
  id: string;
  name: string;
  domain: string;
  owner: string;
  plan: OrgPlan;
  members: number;
  status: OrgStatus;
  createdAt: string;
  usage: number;
};

const initialOrganizations: Organization[] = [
  {
    id: "ORG-1001",
    name: "Acme Corporation",
    domain: "acme.example",
    owner: "admin@acme.example",
    plan: "Enterprise",
    members: 842,
    status: "Active",
    createdAt: "Jan 12, 2026",
    usage: 78,
  },
  {
    id: "ORG-1002",
    name: "Northstar Technologies",
    domain: "northstar.example",
    owner: "admin@northstar.example",
    plan: "Enterprise",
    members: 624,
    status: "Active",
    createdAt: "Feb 8, 2026",
    usage: 64,
  },
  {
    id: "ORG-1003",
    name: "Vertex Labs",
    domain: "vertex.example",
    owner: "owner@vertex.example",
    plan: "Business",
    members: 186,
    status: "Active",
    createdAt: "Mar 21, 2026",
    usage: 52,
  },
  {
    id: "ORG-1004",
    name: "CloudWorks",
    domain: "cloudworks.example",
    owner: "admin@cloudworks.example",
    plan: "Business",
    members: 94,
    status: "Active",
    createdAt: "Apr 5, 2026",
    usage: 37,
  },
  {
    id: "ORG-1005",
    name: "Nova Research",
    domain: "novaresearch.example",
    owner: "owner@novaresearch.example",
    plan: "Starter",
    members: 28,
    status: "Pending",
    createdAt: "Jul 18, 2026",
    usage: 12,
  },
  {
    id: "ORG-1006",
    name: "BluePeak Analytics",
    domain: "bluepeak.example",
    owner: "it@bluepeak.example",
    plan: "Business",
    members: 73,
    status: "Suspended",
    createdAt: "Aug 2, 2026",
    usage: 0,
  },
];

const C = {
  blue: "#315FEA",
  text: "var(--admin-text, #172033)",
  muted: "var(--admin-muted, #697386)",
  border: "var(--admin-border, #E3E7EF)",
  card: "var(--admin-card, #FFFFFF)",
  bg: "var(--admin-bg, #F7F8FC)",
  green: "#15803D",
  red: "#B42318",
  amber: "#B45309",
  purple: "#6D4AFF",
};

const cardStyle: CSSProperties = {
  border: `1px solid ${C.border}`,
  borderRadius: 13,
  background: C.card,
  minWidth: 0,
};

const buttonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  border: `1px solid ${C.border}`,
  borderRadius: 9,
  padding: "9px 12px",
  background: C.card,
  color: C.text,
  fontSize: 12,
  fontWeight: 650,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

function PanelTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
        flexWrap: "wrap",
        marginBottom: 17,
      }}
    >
      <div>
        <h2
          style={{
            fontSize: 15,
            fontWeight: 750,
            color: C.text,
            margin: 0,
          }}
        >
          {title}
        </h2>
        {description && (
          <p
            style={{
              color: C.muted,
              fontSize: 11,
              lineHeight: 1.6,
              margin: "5px 0 0",
            }}
          >
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

function StatusBadge({ status }: { status: OrgStatus }) {
  const config: Record<
    OrgStatus,
    { color: string; background: string; icon: typeof CheckCircle2 }
  > = {
    Active: {
      color: C.green,
      background: "#DCFCE7",
      icon: CheckCircle2,
    },
    Pending: {
      color: C.amber,
      background: "#FEF3C7",
      icon: Clock3,
    },
    Suspended: {
      color: C.red,
      background: "#FEE2E2",
      icon: Ban,
    },
  };

  const item = config[status];
  const Icon = item.icon;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        borderRadius: 20,
        padding: "5px 8px",
        background: item.background,
        color: item.color,
        fontSize: 10,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      <Icon size={11} />
      {status}
    </span>
  );
}

function ProgressBar({
  value,
  color = C.blue,
}: {
  value: number;
  color?: string;
}) {
  return (
    <div
      style={{
        height: 7,
        width: "100%",
        background: "#E9EDF5",
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${Math.max(0, Math.min(100, value))}%`,
          background: color,
          borderRadius: 20,
          transition: "width 200ms ease",
        }}
      />
    </div>
  );
}

export default function OrganizationOverviewPage() {
  const [organizations, setOrganizations] =
    useState<Organization[]>(initialOrganizations);
  const [period, setPeriod] = useState("30 days");
  const [notice, setNotice] = useState("");
  const [showActivity, setShowActivity] = useState(false);

  const metrics = useMemo(() => {
    const active = organizations.filter((org) => org.status === "Active");
    const enterprise = organizations.filter(
      (org) => org.plan === "Enterprise",
    );

    return [
      {
        title: "Total organizations",
        value: organizations.length,
        description: "All registered organization records",
        icon: Building2,
        color: C.blue,
        bg: "#EAF0FF",
        trend: "+12.5%",
        trendUp: true,
      },
      {
        title: "Active organizations",
        value: active.length,
        description: "Currently active accounts",
        icon: CheckCircle2,
        color: C.green,
        bg: "#DCFCE7",
        trend: "+8.2%",
        trendUp: true,
      },
      {
        title: "Total members",
        value: organizations.reduce((sum, org) => sum + org.members, 0),
        description: "Members across all listed organizations",
        icon: Users,
        color: C.purple,
        bg: "#F0EBFF",
        trend: "+16.4%",
        trendUp: true,
      },
      {
        title: "Enterprise accounts",
        value: enterprise.length,
        description: "Organizations on Enterprise plans",
        icon: ShieldCheck,
        color: C.amber,
        bg: "#FEF3C7",
        trend: "+4.6%",
        trendUp: true,
      },
    ];
  }, [organizations]);

  const totalOrganizations = organizations.length || 1;

  const planData = useMemo(() => {
    const plans: OrgPlan[] = ["Enterprise", "Business", "Starter"];
    const colors: Record<OrgPlan, string> = {
      Enterprise: C.purple,
      Business: C.blue,
      Starter: "#94A3B8",
    };

    return plans.map((plan) => {
      const count = organizations.filter((org) => org.plan === plan).length;
      return {
        plan,
        count,
        percent: Math.round((count / totalOrganizations) * 100),
        color: colors[plan],
      };
    });
  }, [organizations, totalOrganizations]);

  const statusData = useMemo(() => {
    const statuses: OrgStatus[] = ["Active", "Pending", "Suspended"];
    const colors: Record<OrgStatus, string> = {
      Active: C.green,
      Pending: C.amber,
      Suspended: C.red,
    };

    return statuses.map((status) => ({
      status,
      count: organizations.filter((org) => org.status === status).length,
      color: colors[status],
    }));
  }, [organizations]);

  const recentOrganizations = useMemo(
    () =>
      [...organizations].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [organizations],
  );

  const activityItems = [
    {
      title: "Organization directory reviewed",
      detail: "Admin reviewed organization records",
      time: "Today · 10:42 AM",
      icon: Building2,
      color: C.blue,
    },
    {
      title: "Enterprise account monitored",
      detail: "Acme Corporation · Usage review",
      time: "Today · 09:25 AM",
      icon: Activity,
      color: C.purple,
    },
    {
      title: "Pending organization identified",
      detail: "Nova Research · Awaiting activation",
      time: "Yesterday · 04:10 PM",
      icon: Clock3,
      color: C.amber,
    },
    {
      title: "Security status updated",
      detail: "BluePeak Analytics · Suspended",
      time: "Aug 2, 2026",
      icon: ShieldCheck,
      color: C.red,
    },
  ];

  function exportReport() {
    const headers = [
      "Organization ID",
      "Organization",
      "Domain",
      "Owner",
      "Plan",
      "Members",
      "Status",
      "Usage Percent",
    ];

    const quote = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const rows = organizations.map((org) =>
      [
        org.id,
        org.name,
        org.domain,
        org.owner,
        org.plan,
        org.members,
        org.status,
        org.usage,
      ]
        .map(quote)
        .join(","),
    );

    const csv = [headers.map(quote).join(","), ...rows].join("\r\n");
    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "modelnow-organization-overview.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    setNotice("Organization overview report exported.");
  }

  function refreshOverview() {
    setNotice("Overview refreshed using the current demo data.");
  }

  function updateStatus(org: Organization) {
    const nextStatus: OrgStatus =
      org.status === "Active" ? "Suspended" : "Active";

    setOrganizations((previous) =>
      previous.map((item) =>
        item.id === org.id ? { ...item, status: nextStatus } : item,
      ),
    );

    setNotice(`${org.name} marked ${nextStatus.toLowerCase()} in this demo.`);
  }

  return (
    <main
      style={{
        boxSizing: "border-box",
        width: "100%",
        minWidth: 0,
        padding: "clamp(16px, 2.5vw, 30px)",
        background: C.bg,
        color: C.text,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div style={{ flex: "1 1 350px", minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
              color: C.blue,
              fontSize: 11,
              fontWeight: 750,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            <Building2 size={16} />
            ModelNow Administration
          </div>

          <h1
            style={{
              margin: "0 0 8px",
              fontSize: "clamp(25px, 3vw, 32px)",
              fontWeight: 800,
              letterSpacing: "-1px",
            }}
          >
            Organization Overview
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: 700,
              fontSize: 13,
              lineHeight: 1.7,
              color: C.muted,
            }}
          >
            Monitor organization growth, membership, subscription distribution,
            and account health from one administrative workspace.
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button
            type="button"
            onClick={refreshOverview}
            style={buttonStyle}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            type="button"
            onClick={exportReport}
            style={{
              ...buttonStyle,
              color: "#FFFFFF",
              background: C.blue,
              borderColor: C.blue,
            }}
          >
            <Download size={14} />
            Export report
          </button>
        </div>
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
          <strong>Demo analytics</strong>
          <div>
            Organization counts and status breakdowns are calculated from
            sample records in this page. Trend percentages and activity entries
            are illustrative and are not connected to production analytics.
          </div>
        </div>
      </div>

      <section style={{ marginBottom: 25 }}>
        <PanelTitle
          title="Organization performance"
          description="Key metrics from the current organization directory."
          action={
            <select
              aria-label="Reporting period"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              style={{
                ...buttonStyle,
                appearance: "auto",
                fontWeight: 600,
              }}
            >
              <option>7 days</option>
              <option>30 days</option>
              <option>90 days</option>
              <option>12 months</option>
            </select>
          }
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 14,
          }}
        >
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const TrendIcon = metric.trendUp ? ArrowUpRight : ArrowDownRight;

            return (
              <article
                key={metric.title}
                style={{ ...cardStyle, padding: 18 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.muted,
                        margin: 0,
                      }}
                    >
                      {metric.title}
                    </p>
                    <div
                      style={{
                        fontSize: 29,
                        fontWeight: 800,
                        letterSpacing: "-0.8px",
                        marginTop: 11,
                      }}
                    >
                      {metric.value.toLocaleString("en-US")}
                    </div>
                  </div>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                      borderRadius: 11,
                      color: metric.color,
                      background: metric.bg,
                    }}
                  >
                    <Icon size={21} />
                  </div>
                </div>

                <p
                  style={{
                    fontSize: 11,
                    color: C.muted,
                    margin: "10px 0 0",
                    lineHeight: 1.5,
                  }}
                >
                  {metric.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    marginTop: 13,
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.green,
                  }}
                >
                  <TrendIcon size={14} />
                  {metric.trend}
                  <span style={{ color: C.muted, fontWeight: 500 }}>
                    vs previous period
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 330px), 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <article style={{ ...cardStyle, padding: 20 }}>
          <PanelTitle
            title="Subscription distribution"
            description="Organization counts by subscription plan."
          />

          <div style={{ display: "grid", gap: 21 }}>
            {planData.map((item) => (
              <div key={item.plan}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    marginBottom: 9,
                    fontSize: 12,
                  }}
                >
                  <span style={{ fontWeight: 650 }}>{item.plan}</span>
                  <span style={{ color: C.muted }}>
                    {item.count} organizations · {item.percent}%
                  </span>
                </div>
                <ProgressBar value={item.percent} color={item.color} />
              </div>
            ))}
          </div>

          <div
            style={{
              borderTop: `1px solid ${C.border}`,
              marginTop: 24,
              paddingTop: 16,
              display: "flex",
              alignItems: "center",
              gap: 9,
              color: C.muted,
              fontSize: 11,
            }}
          >
            <CreditCard size={16} color={C.blue} />
            Plan assignments across {organizations.length} organization records
          </div>
        </article>

        <article style={{ ...cardStyle, padding: 20 }}>
          <PanelTitle
            title="Account health"
            description="Current status of listed organization accounts."
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 9,
            }}
          >
            {statusData.map((item) => (
              <div
                key={item.status}
                style={{
                  padding: "13px 10px",
                  borderRadius: 10,
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: item.color,
                    marginBottom: 10,
                  }}
                />
                <div style={{ fontSize: 23, fontWeight: 800 }}>
                  {item.count}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: C.muted,
                    marginTop: 4,
                  }}
                >
                  {item.status}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 23 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                fontSize: 12,
                marginBottom: 9,
              }}
            >
              <span style={{ fontWeight: 650 }}>Active account rate</span>
              <strong>
                {Math.round(
                  (organizations.filter((org) => org.status === "Active")
                    .length /
                    totalOrganizations) *
                    100,
                )}
                %
              </strong>
            </div>
            <ProgressBar
              value={
                (organizations.filter((org) => org.status === "Active").length /
                  totalOrganizations) *
                100
              }
              color={C.green}
            />
          </div>

          <p
            style={{
              margin: "13px 0 0",
              color: C.muted,
              fontSize: 11,
              lineHeight: 1.6,
            }}
          >
            Review pending and suspended organizations regularly to maintain
            accurate access and account status.
          </p>
        </article>
      </section>

      <section style={{ ...cardStyle, padding: 20, marginBottom: 24 }}>
        <PanelTitle
          title="Recent organizations"
          description="Organization records ordered by their creation dates."
          action={
            <button
              type="button"
              onClick={() =>
                (window.location.href = "/organizations/all-organizations")
              }
              style={buttonStyle}
            >
              All organizations
              <ArrowRight size={14} />
            </button>
          }
        />

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: 720,
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ background: C.bg }}>
                {["Organization", "Plan", "Members", "Status", "Created"].map(
                  (heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: "12px 13px",
                        textAlign: "left",
                        borderBottom: `1px solid ${C.border}`,
                        color: C.muted,
                        fontSize: 10,
                        fontWeight: 750,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody>
              {recentOrganizations.map((org) => (
                <tr key={org.id}>
                  <td
                    style={{
                      padding: "14px 13px",
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 9,
                          display: "grid",
                          placeItems: "center",
                          color: C.blue,
                          background: "#EAF0FF",
                          flexShrink: 0,
                        }}
                      >
                        <Building2 size={16} />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: C.text,
                          }}
                        >
                          {org.name}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: C.muted,
                            marginTop: 4,
                          }}
                        >
                          {org.id} · {org.domain}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td
                    style={{
                      padding: "14px 13px",
                      borderBottom: `1px solid ${C.border}`,
                      fontSize: 12,
                    }}
                  >
                    {org.plan}
                  </td>

                  <td
                    style={{
                      padding: "14px 13px",
                      borderBottom: `1px solid ${C.border}`,
                      fontSize: 12,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Users size={13} color={C.muted} />
                      {org.members.toLocaleString("en-US")}
                    </span>
                  </td>

                  <td
                    style={{
                      padding: "14px 13px",
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    <StatusBadge status={org.status} />
                  </td>

                  <td
                    style={{
                      padding: "14px 13px",
                      borderBottom: `1px solid ${C.border}`,
                      fontSize: 11,
                      color: C.muted,
                      whiteSpace: "nowrap",
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
                      {org.createdAt}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 330px), 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <article style={{ ...cardStyle, padding: 20 }}>
          <PanelTitle
            title="Organization activity"
            description="Illustrative administrative activity entries."
            action={
              <button
                type="button"
                onClick={() => setShowActivity(true)}
                style={buttonStyle}
              >
                View all
                <ArrowRight size={13} />
              </button>
            }
          />

          <div style={{ display: "grid", gap: 19 }}>
            {activityItems.slice(0, 3).map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  style={{ display: "flex", alignItems: "flex-start", gap: 11 }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 9,
                      background: C.bg,
                      color: item.color,
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: C.text,
                      }}
                    >
                      {item.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: C.muted,
                        marginTop: 4,
                      }}
                    >
                      {item.detail}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: C.muted,
                        marginTop: 5,
                      }}
                    >
                      {item.time}
                    </div>
                  </div>
                  {index === 0 && (
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: C.blue,
                        flexShrink: 0,
                        marginTop: 5,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </article>

        <article style={{ ...cardStyle, padding: 20 }}>
          <PanelTitle
            title="Administrative shortcuts"
            description="Common destinations for organization administration."
          />

          <div style={{ display: "grid", gap: 9 }}>
            {[
              {
                title: "Organization members",
                description: "Review membership and ownership",
                href: "/organizations/organization-members",
                icon: Users,
              },
              {
                title: "Teams & departments",
                description: "Organize teams and departments",
                href: "/organizations/teams-departments",
                icon: Building2,
              },
              {
                title: "Organization billing",
                description: "Review subscription and billing settings",
                href: "/organizations/organization-billing",
                icon: CreditCard,
              },
              {
                title: "Organization security",
                description: "Review access and security controls",
                href: "/organizations/organization-security",
                icon: ShieldCheck,
              },
              {
                title: "Invitations",
                description: "Review organization invitations",
                href: "/organizations/invitations",
                icon: MailIcon,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => (window.location.href = item.href)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    padding: 12,
                    width: "100%",
                    textAlign: "left",
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    background: C.card,
                    cursor: "pointer",
                    color: C.text,
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 9,
                      color: C.blue,
                      background: "#EAF0FF",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>
                      {item.title}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: C.muted,
                        marginTop: 4,
                      }}
                    >
                      {item.description}
                    </div>
                  </div>
                  <ArrowRight size={15} color={C.muted} />
                </button>
              );
            })}
          </div>
        </article>
      </section>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "13px 15px",
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          background: C.card,
          color: C.muted,
          fontSize: 11,
          lineHeight: 1.6,
        }}
      >
        <Globe size={16} color={C.blue} />
        <span>
          Reporting period: <strong style={{ color: C.text }}>{period}</strong>.
          Production metrics require a connected analytics service.
        </span>
      </div>

      {showActivity && (
        <div
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowActivity(false);
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
            aria-labelledby="activity-modal-title"
            style={{
              width: "100%",
              maxWidth: 540,
              maxHeight: "85vh",
              overflowY: "auto",
              padding: 22,
              background: C.card,
              color: C.text,
              border: `1px solid ${C.border}`,
              borderRadius: 15,
              boxShadow: "0 24px 80px rgba(15, 23, 42, 0.22)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div>
                <h2
                  id="activity-modal-title"
                  style={{ fontSize: 18, fontWeight: 800, margin: "0 0 5px" }}
                >
                  Organization activity
                </h2>
                <p style={{ margin: 0, fontSize: 11, color: C.muted }}>
                  Sample activity for the overview page.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowActivity(false)}
                aria-label="Close activity"
                style={{ ...buttonStyle, padding: 7 }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "grid", gap: 17 }}>
              {activityItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 11,
                      paddingBottom: 15,
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        display: "grid",
                        placeItems: "center",
                        background: C.bg,
                        color: item.color,
                        borderRadius: 10,
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={17} />
                    </div>
                    <div>
                      <strong style={{ fontSize: 12 }}>{item.title}</strong>
                      <p
                        style={{
                          fontSize: 11,
                          color: C.muted,
                          margin: "5px 0",
                        }}
                      >
                        {item.detail}
                      </p>
                      <span style={{ fontSize: 10, color: C.muted }}>
                        {item.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowActivity(false)}
              style={{
                ...buttonStyle,
                width: "100%",
                marginTop: 18,
                padding: 11,
              }}
            >
              Close
            </button>
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

function MailIcon({ size = 16 }: { size?: number }) {
  return <ExternalLink size={size} />;
}