
"use client";

import { useMemo, useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  LockKeyhole,
  FileCheck2,
  Activity,
  Search,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  Clock3,
  Eye,
  KeyRound,
  Server,
  Users,
  Globe,
  Settings2,
  Ban,
  Fingerprint,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type Severity = "Critical" | "High" | "Medium" | "Low";
type AuditStatus = "Blocked" | "Allowed" | "Reviewed";

type AuditEvent = {
  id: string;
  time: string;
  actor: string;
  action: string;
  resource: string;
  severity: Severity;
  status: AuditStatus;
  source: string;
};

const securityTrend = [
  { time: "09:00", blocked: 18, alerts: 4 },
  { time: "10:00", blocked: 24, alerts: 6 },
  { time: "11:00", blocked: 20, alerts: 3 },
  { time: "12:00", blocked: 36, alerts: 8 },
  { time: "13:00", blocked: 29, alerts: 5 },
  { time: "14:00", blocked: 43, alerts: 9 },
  { time: "15:00", blocked: 32, alerts: 4 },
  { time: "16:00", blocked: 48, alerts: 7 },
  { time: "17:00", blocked: 39, alerts: 5 },
];

const policyDistribution = [
  { name: "Prompt injection", value: 34, color: "#f97316" },
  { name: "Sensitive data", value: 27, color: "#ef4444" },
  { name: "Access control", value: 21, color: "#8b5cf6" },
  { name: "Content policy", value: 18, color: "#06b6d4" },
];

const initialEvents: AuditEvent[] = [
  {
    id: "AUD-1048",
    time: "16:42:18",
    actor: "Agent Service",
    action: "Prompt injection detected",
    resource: "customer-support-agent",
    severity: "Critical",
    status: "Blocked",
    source: "Agent",
  },
  {
    id: "AUD-1047",
    time: "16:39:52",
    actor: "AI Gateway",
    action: "Sensitive data pattern detected",
    resource: "chat-completion",
    severity: "High",
    status: "Blocked",
    source: "Chat",
  },
  {
    id: "AUD-1046",
    time: "16:34:07",
    actor: "Pujitha",
    action: "Policy configuration viewed",
    resource: "enterprise-policy",
    severity: "Low",
    status: "Allowed",
    source: "Console",
  },
  {
    id: "AUD-1045",
    time: "16:28:43",
    actor: "Knowledge Service",
    action: "Document access verified",
    resource: "internal-knowledge-base",
    severity: "Medium",
    status: "Allowed",
    source: "Knowledge Hub",
  },
  {
    id: "AUD-1044",
    time: "16:20:11",
    actor: "Browser Service",
    action: "External domain restricted",
    resource: "unknown-domain",
    severity: "High",
    status: "Blocked",
    source: "Browser",
  },
  {
    id: "AUD-1043",
    time: "16:12:36",
    actor: "Identity Service",
    action: "Access review completed",
    resource: "workspace-members",
    severity: "Low",
    status: "Reviewed",
    source: "Identity",
  },
  {
    id: "AUD-1042",
    time: "15:58:09",
    actor: "Fine-tuning Service",
    action: "Dataset permission checked",
    resource: "training-dataset-08",
    severity: "Medium",
    status: "Allowed",
    source: "Fine-tuning",
  },
];

const initialPolicies = [
  {
    id: "prompt-injection",
    name: "Prompt Injection Protection",
    description: "Detect and block attempts to override system instructions.",
    category: "Input security",
    enabled: true,
    level: "Strict",
  },
  {
    id: "sensitive-data",
    name: "Sensitive Data Protection",
    description: "Flag possible secrets, credentials, and personal data.",
    category: "Data protection",
    enabled: true,
    level: "Strict",
  },
  {
    id: "rbac",
    name: "Role-Based Access Control",
    description: "Restrict access to workspace resources by role.",
    category: "Identity",
    enabled: true,
    level: "Enforced",
  },
  {
    id: "domain-control",
    name: "External Domain Restrictions",
    description: "Restrict agent and browser access to unapproved domains.",
    category: "Network security",
    enabled: false,
    level: "Standard",
  },
  {
    id: "audit",
    name: "Audit Logging",
    description: "Record security events and administrative actions.",
    category: "Compliance",
    enabled: true,
    level: "Continuous",
  },
  {
    id: "model-approval",
    name: "Model Approval Gate",
    description: "Require review before enabling unapproved models.",
    category: "Model governance",
    enabled: true,
    level: "Enforced",
  },
];

const severityStyles: Record<Severity, string> = {
  Critical: "bg-red-500/10 text-red-400 border-red-500/20",
  High: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Low: "bg-sky-500/10 text-sky-400 border-sky-500/20",
};

const statusStyles: Record<AuditStatus, string> = {
  Blocked: "bg-red-500/10 text-red-400",
  Allowed: "bg-emerald-500/10 text-emerald-400",
  Reviewed: "bg-sky-500/10 text-sky-400",
};

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-white/[0.09] bg-[#11141b] ${className}`}
    >
      {children}
    </section>
  );
}

function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function Badge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export default function SecurityGovernancePage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "policies" | "audit" | "access"
  >("overview");

  const [events, setEvents] = useState(initialEvents);
  const [policies, setPolicies] = useState(initialPolicies);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [policyFilter, setPolicyFilter] = useState("All");
  const [notice, setNotice] = useState("");
  const [lastRefresh, setLastRefresh] = useState("Just now");
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  const enabledPolicies = policies.filter((policy) => policy.enabled).length;

  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        !term ||
        [
          event.id,
          event.actor,
          event.action,
          event.resource,
          event.source,
        ].some((value) => value.toLowerCase().includes(term));

      const matchesSeverity =
        severityFilter === "All" || event.severity === severityFilter;

      const matchesStatus =
        statusFilter === "All" || event.status === statusFilter;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [events, search, severityFilter, statusFilter]);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  };

  const togglePolicy = (id: string) => {
    setPolicies((current) =>
      current.map((policy) =>
        policy.id === id
          ? { ...policy, enabled: !policy.enabled }
          : policy
      )
    );

    const policy = policies.find((item) => item.id === id);

    if (policy) {
      showNotice(
        `${policy.name}: ${policy.enabled ? "disabled" : "enabled"} in this demo.`
      );
    }
  };

  const exportAudit = () => {
    const headers = [
      "ID",
      "Time",
      "Actor",
      "Action",
      "Resource",
      "Severity",
      "Status",
      "Source",
    ];

    const rows = filteredEvents.map((event) => [
      event.id,
      event.time,
      event.actor,
      event.action,
      event.resource,
      event.severity,
      event.status,
      event.source,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-security-audit.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const refreshEvents = () => {
    setLastRefresh(new Date().toLocaleTimeString());
    showNotice("Demo security data refreshed.");
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "policies", label: "Policies", icon: ShieldCheck },
    { id: "audit", label: "Audit trail", icon: FileCheck2 },
    { id: "access", label: "Access control", icon: Users },
  ] as const;

  return (
    <main className="min-h-screen bg-[#090b10] p-4 text-slate-200 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3">
              <ShieldCheck className="h-7 w-7 text-violet-300" />
            </div>
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Security & Governance
                </h1>
                <Badge className="border-violet-400/20 bg-violet-500/10 text-violet-300">
                  Enterprise
                </Badge>
              </div>
              <p className="max-w-2xl text-sm text-slate-400">
                Monitor AI security events, enforce policies, manage access,
                and maintain an auditable governance trail.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge className="border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
              <span className="mr-2 h-2 w-2 rounded-full bg-emerald-400" />
              Demo environment
            </Badge>
            <button
              onClick={refreshEvents}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#151923] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </header>

        {notice && (
          <div className="flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 py-3 text-sm text-violet-200">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {notice}
          </div>
        )}

        <div className="flex gap-1 overflow-x-auto border-b border-white/10">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm transition ${
                  activeTab === tab.id
                    ? "border-violet-400 text-white"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Security events",
                  value: "1,284",
                  change: "+8.2%",
                  description: "Across monitored services",
                  icon: Activity,
                  color: "text-violet-300",
                  iconBg: "bg-violet-500/10",
                },
                {
                  label: "Threats blocked",
                  value: "96.8%",
                  change: "+1.4%",
                  description: "Of detected policy violations",
                  icon: ShieldCheck,
                  color: "text-emerald-300",
                  iconBg: "bg-emerald-500/10",
                },
                {
                  label: "High-risk alerts",
                  value: "12",
                  change: "4 critical",
                  description: "Require review",
                  icon: ShieldAlert,
                  color: "text-orange-300",
                  iconBg: "bg-orange-500/10",
                },
                {
                  label: "Policies enabled",
                  value: `${enabledPolicies}/${policies.length}`,
                  change: "Policy coverage",
                  description: "Configured in this demo",
                  icon: LockKeyhole,
                  color: "text-sky-300",
                  iconBg: "bg-sky-500/10",
                },
              ].map((metric) => {
                const Icon = metric.icon;

                return (
                  <Card key={metric.label} className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-slate-400">{metric.label}</p>
                        <p className="mt-3 text-3xl font-bold text-white">
                          {metric.value}
                        </p>
                      </div>
                      <div className={`rounded-xl p-2.5 ${metric.iconBg}`}>
                        <Icon className={`h-5 w-5 ${metric.color}`} />
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs text-slate-500">
                        {metric.description}
                      </span>
                      <span className="text-xs font-medium text-slate-300">
                        {metric.change}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              <Card className="p-5 xl:col-span-2">
                <SectionHeading
                  title="Security activity"
                  subtitle="Illustrative blocked requests and detected alerts by hour."
                  action={
                    <Badge className="border-white/10 bg-white/5 text-slate-300">
                      Last 9 hours
                    </Badge>
                  }
                />
                <div className="h-[290px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={securityTrend}>
                      <defs>
                        <linearGradient
                          id="blockedGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#8b5cf6"
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8b5cf6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        stroke="#ffffff10"
                        strokeDasharray="4 4"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="time"
                        stroke="#64748b"
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                      />
                      <YAxis
                        stroke="#64748b"
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                        width={32}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#151923",
                          border: "1px solid #ffffff20",
                          borderRadius: 12,
                          color: "#fff",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="blocked"
                        name="Blocked requests"
                        stroke="#a78bfa"
                        strokeWidth={2}
                        fill="url(#blockedGradient)"
                      />
                      <Area
                        type="monotone"
                        dataKey="alerts"
                        name="Alerts"
                        stroke="#fb923c"
                        strokeWidth={2}
                        fill="transparent"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-5">
                <SectionHeading
                  title="Policy violations"
                  subtitle="Illustrative distribution by category."
                />
                <div className="h-[230px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={policyDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="48%"
                        innerRadius={58}
                        outerRadius={86}
                        paddingAngle={4}
                      >
                        {policyDistribution.map((item) => (
                          <Cell key={item.name} fill={item.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#151923",
                          border: "1px solid #ffffff20",
                          borderRadius: 12,
                          color: "#fff",
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        wrapperStyle={{ fontSize: 11, color: "#94a3b8" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="p-5">
                <SectionHeading
                  title="Security controls"
                  subtitle="Current configuration in this demo."
                  action={
                    <button
                      onClick={() => setActiveTab("policies")}
                      className="text-sm text-violet-300 hover:text-violet-200"
                    >
                      Manage policies →
                    </button>
                  }
                />
                <div className="space-y-3">
                  {policies.slice(0, 4).map((policy) => (
                    <div
                      key={policy.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="rounded-lg bg-white/5 p-2">
                          <LockKeyhole className="h-4 w-4 text-slate-300" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            {policy.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {policy.category}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={
                          policy.enabled
                            ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                            : "border-white/10 bg-white/5 text-slate-400"
                        }
                      >
                        {policy.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5">
                <SectionHeading
                  title="Latest security events"
                  subtitle="Most recent illustrative audit records."
                  action={
                    <button
                      onClick={() => setActiveTab("audit")}
                      className="text-sm text-violet-300 hover:text-violet-200"
                    >
                      View audit trail →
                    </button>
                  }
                />
                <div className="space-y-3">
                  {events.slice(0, 4).map((event) => (
                    <button
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className="flex w-full items-start gap-3 rounded-xl p-2 text-left transition hover:bg-white/[0.04]"
                    >
                      <div
                        className={`mt-0.5 rounded-lg p-2 ${
                          event.severity === "Critical" ||
                          event.severity === "High"
                            ? "bg-red-500/10 text-red-300"
                            : "bg-slate-500/10 text-slate-300"
                        }`}
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {event.action}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {event.actor} · {event.time}
                        </p>
                      </div>
                      <Badge className={severityStyles[event.severity]}>
                        {event.severity}
                      </Badge>
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "policies" && (
          <div className="space-y-5">
            <SectionHeading
              title="Security policies"
              subtitle="Enable or disable example controls. Changes are local to this page."
              action={
                <button
                  onClick={() => showNotice("Policy creation requires backend support.")}
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-400"
                >
                  <Settings2 className="h-4 w-4" />
                  Add policy
                </button>
              }
            />

            <div className="grid gap-4 lg:grid-cols-2">
              {policies.map((policy) => (
                <Card key={policy.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="rounded-xl bg-violet-500/10 p-3">
                        <ShieldCheck className="h-5 w-5 text-violet-300" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {policy.name}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-slate-400">
                          {policy.description}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => togglePolicy(policy.id)}
                      aria-label={`${policy.enabled ? "Disable" : "Enable"} ${policy.name}`}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                        policy.enabled ? "bg-violet-500" : "bg-slate-700"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                          policy.enabled ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge className="border-white/10 bg-white/5 text-slate-300">
                        {policy.category}
                      </Badge>
                      <Badge className="border-white/10 bg-white/5 text-slate-300">
                        {policy.level}
                      </Badge>
                    </div>
                    <Badge
                      className={
                        policy.enabled
                          ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                          : "border-white/10 bg-white/5 text-slate-400"
                      }
                    >
                      {policy.enabled ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "audit" && (
          <div className="space-y-5">
            <SectionHeading
              title="Audit trail"
              subtitle={`${filteredEvents.length} matching records · Last refreshed ${lastRefresh}`}
              action={
                <button
                  onClick={exportAudit}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#151923] px-4 py-2.5 text-sm text-white hover:bg-white/10"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              }
            />

            <Card className="p-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search events, actors, resources..."
                    className="w-full rounded-xl border border-white/10 bg-[#0c0f15] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-400/50"
                  />
                </div>
                <select
                  value={severityFilter}
                  onChange={(event) => setSeverityFilter(event.target.value)}
                  className="rounded-xl border border-white/10 bg-[#0c0f15] px-3 py-2.5 text-sm text-white outline-none"
                >
                  <option value="All">All severities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-xl border border-white/10 bg-[#0c0f15] px-3 py-2.5 text-sm text-white outline-none"
                >
                  <option value="All">All statuses</option>
                  <option value="Blocked">Blocked</option>
                  <option value="Allowed">Allowed</option>
                  <option value="Reviewed">Reviewed</option>
                </select>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left text-sm">
                  <thead className="border-b border-white/10 bg-white/[0.025] text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Event ID / Time</th>
                      <th className="px-5 py-4">Actor</th>
                      <th className="px-5 py-4">Action / Resource</th>
                      <th className="px-5 py-4">Severity</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Source</th>
                      <th className="px-5 py-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {filteredEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-white/[0.025]">
                        <td className="px-5 py-4">
                          <p className="font-medium text-white">{event.id}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {event.time}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-slate-300">
                          {event.actor}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-white">
                            {event.action}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {event.resource}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <Badge className={severityStyles[event.severity]}>
                            {event.severity}
                          </Badge>
                        </td>
                        <td className="px-5 py-4">
                          <Badge
                            className={`border-transparent ${statusStyles[event.status]}`}
                          >
                            {event.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-slate-400">
                          {event.source}
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setSelectedEvent(event)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
                            aria-label={`View ${event.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredEvents.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-12 text-center text-slate-500"
                        >
                          No audit events match these filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "access" && (
          <div className="space-y-5">
            <SectionHeading
              title="Access control"
              subtitle="Example identity, role, and service access configuration."
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Workspace members",
                  value: "18",
                  detail: "Example member count",
                  icon: Users,
                },
                {
                  label: "Roles configured",
                  value: "4",
                  detail: "Owner, Admin, Member, Viewer",
                  icon: KeyRound,
                },
                {
                  label: "Service identities",
                  value: "6",
                  detail: "Example machine identities",
                  icon: Server,
                },
                {
                  label: "Public endpoints",
                  value: "2",
                  detail: "Review exposure regularly",
                  icon: Globe,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <Card key={item.label} className="p-5">
                    <Icon className="h-5 w-5 text-violet-300" />
                    <p className="mt-4 text-sm text-slate-400">{item.label}</p>
                    <p className="mt-2 text-3xl font-bold text-white">
                      {item.value}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">{item.detail}</p>
                  </Card>
                );
              })}
            </div>

            <Card className="p-5">
              <SectionHeading
                title="Role permissions"
                subtitle="Illustrative permissions matrix. This does not enforce actual access."
              />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="py-3 pr-4">Permission</th>
                      <th className="px-3 py-3">Owner</th>
                      <th className="px-3 py-3">Admin</th>
                      <th className="px-3 py-3">Member</th>
                      <th className="px-3 py-3">Viewer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {[
                      ["Manage workspace", true, true, false, false],
                      ["Manage security policies", true, true, false, false],
                      ["Use AI services", true, true, true, false],
                      ["View audit trail", true, true, false, true],
                      ["Manage billing", true, false, false, false],
                    ].map((row) => (
                      <tr key={String(row[0])}>
                        <td className="py-4 pr-4 text-slate-300">
                          {row[0]}
                        </td>
                        {row.slice(1).map((allowed, index) => (
                          <td className="px-3 py-4" key={index}>
                            {allowed ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-amber-500/10 p-3">
                  <Fingerprint className="h-5 w-5 text-amber-300" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">
                    Identity and access integrations
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Connect your identity provider, configure SSO and MFA, and
                    enforce least-privilege permissions in the backend before
                    using this page for production administration.
                  </p>
                  <button
                    onClick={() =>
                      showNotice(
                        "Identity provider integration requires backend configuration."
                      )
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/5"
                  >
                    Configure integration
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {selectedEvent && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setSelectedEvent(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="event-dialog-title"
              className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#11141b] p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-500">{selectedEvent.id}</p>
                  <h2
                    id="event-dialog-title"
                    className="mt-2 text-lg font-semibold text-white"
                  >
                    {selectedEvent.action}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="rounded-lg px-2 py-1 text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  ["Time", selectedEvent.time],
                  ["Actor", selectedEvent.actor],
                  ["Resource", selectedEvent.resource],
                  ["Source", selectedEvent.source],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between gap-4 border-b border-white/[0.07] pb-3 text-sm"
                  >
                    <span className="text-slate-500">{label}</span>
                    <span className="text-right text-slate-200">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between gap-4 pt-1 text-sm">
                  <span className="text-slate-500">Severity</span>
                  <Badge className={severityStyles[selectedEvent.severity]}>
                    {selectedEvent.severity}
                  </Badge>
                </div>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-slate-500">Outcome</span>
                  <Badge
                    className={`border-transparent ${statusStyles[selectedEvent.status]}`}
                  >
                    {selectedEvent.status}
                  </Badge>
                </div>
              </div>

              <p className="mt-5 rounded-xl border border-amber-400/20 bg-amber-500/5 p-3 text-xs leading-5 text-amber-200">
                This is a sample audit record. A production audit trail should
                be generated and stored by a trusted backend service.
              </p>
            </div>
          </div>
        )}

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-5 text-xs text-slate-500">
          <span>ModelNow · Security & Governance</span>
          <span className="flex items-center gap-2">
            <Clock3 className="h-3.5 w-3.5" />
            Last refresh: {lastRefresh}
          </span>
        </footer>
      </div>
    </main>
  );
}
