"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  FileText,
  KeyRound,
  Layers,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Shield,
  ShieldCheck,
  Terminal,
  UserRound,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

const securityModules = [
  {
    id: "guardrails",
    name: "Guardrails",
    description: "Protect agents from unsafe, malformed, or prohibited requests.",
    status: "Active",
    icon: ShieldCheck,
  },
  {
    id: "permissions",
    name: "Permissions",
    description: "Control what agents, users, and tools are allowed to access.",
    status: "Active",
    icon: Lock,
  },
  {
    id: "tool-policies",
    name: "Tool Policies",
    description: "Restrict tool usage and enforce execution policies.",
    status: "Active",
    icon: Settings2,
  },
  {
    id: "authentication",
    name: "Authentication",
    description: "Secure access to agents, APIs, and deployment endpoints.",
    status: "Active",
    icon: KeyRound,
  },
  {
    id: "data-protection",
    name: "Data Protection",
    description: "Protect sensitive data and control data movement.",
    status: "Active",
    icon: Database,
  },
  {
    id: "audit-logs",
    name: "Audit Logs",
    description: "Track security events, changes, and sensitive actions.",
    status: "Active",
    icon: FileText,
  },
];

const securityEvents = [
  {
    id: "SEC-1042",
    type: "Policy Update",
    message: "Tool permission policy updated for Research Agent.",
    actor: "Admin",
    severity: "Low",
    time: "4 min ago",
  },
  {
    id: "SEC-1041",
    type: "Blocked Request",
    message: "Prompt injection attempt blocked by guardrails.",
    actor: "Security Engine",
    severity: "High",
    time: "12 min ago",
  },
  {
    id: "SEC-1040",
    type: "Authentication",
    message: "API key rotation completed successfully.",
    actor: "Admin",
    severity: "Low",
    time: "28 min ago",
  },
  {
    id: "SEC-1039",
    type: "Permission Change",
    message: "Database Agent access scope changed.",
    actor: "Admin",
    severity: "Medium",
    time: "43 min ago",
  },
];

const policies = [
  {
    name: "Prompt Injection Defense",
    status: true,
    description: "Detect and block malicious prompt manipulation.",
  },
  {
    name: "Sensitive Data Protection",
    status: true,
    description: "Detect and protect sensitive information.",
  },
  {
    name: "Tool Permission Enforcement",
    status: true,
    description: "Validate tool permissions before execution.",
  },
  {
    name: "Output Validation",
    status: true,
    description: "Validate generated output before delivery.",
  },
  {
    name: "Human Approval for Critical Actions",
    status: false,
    description: "Require human approval for high-risk operations.",
  },
];

function StatusBadge({ status }) {
  const styles = {
    Active: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Inactive: "border-slate-200 bg-slate-50 text-slate-500",
    Low: "border-slate-200 bg-slate-50 text-slate-600",
    Medium: "border-amber-200 bg-amber-50 text-amber-700",
    High: "border-red-200 bg-red-50 text-red-700",
    Healthy: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Warning: "border-amber-200 bg-amber-50 text-amber-700",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        styles[status] || "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition ${
        enabled ? "bg-slate-900" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
          enabled ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

function MetricCard({ label, value, detail, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </span>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
          <Icon size={16} className="text-slate-700" />
        </div>
      </div>

      <div className="mt-3 text-2xl font-semibold text-slate-900">
        {value}
      </div>

      <div className="mt-1 text-xs text-slate-500">{detail}</div>
    </div>
  );
}

function SectionTitle({ title, description, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      {action}
    </div>
  );
}

export default function Security() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedModule, setSelectedModule] = useState("guardrails");
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [securityEventsList, setSecurityEventsList] = useState(
    securityEvents
  );
  const [policyState, setPolicyState] = useState(
    policies.reduce((acc, item) => {
      acc[item.name] = item.status;
      return acc;
    }, {})
  );
  const [scanning, setScanning] = useState(false);

  const selectedModuleData =
    securityModules.find((item) => item.id === selectedModule) ||
    securityModules[0];

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return securityEventsList.filter((event) => {
      const matchesSearch =
        !query ||
        event.type.toLowerCase().includes(query) ||
        event.message.toLowerCase().includes(query) ||
        event.actor.toLowerCase().includes(query);

      const matchesSeverity =
        severityFilter === "All" ||
        event.severity === severityFilter;

      return matchesSearch && matchesSeverity;
    });
  }, [search, severityFilter, securityEventsList]);

  const runSecurityScan = () => {
    setScanning(true);

    setTimeout(() => {
      setScanning(false);

      setSecurityEventsList((current) => [
        {
          id: `SEC-${1043 + current.length}`,
          type: "Security Scan",
          message: "Security scan completed successfully. No critical issues found.",
          actor: "Security Engine",
          severity: "Low",
          time: "Just now",
        },
        ...current,
      ]);
    }, 1600);
  };

  const togglePolicy = (policyName) => {
    setPolicyState((current) => ({
      ...current,
      [policyName]: !current[policyName],
    }));
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <a
                href="/agent-builder"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <ArrowLeft size={17} />
              </a>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
                <Shield size={19} className="text-white" />
              </div>

              <div>
                <h1 className="text-xl font-semibold">
                  Security & Governance
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Protect agents, tools, data, users, and production workloads.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={runSecurityScan}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw
                  size={15}
                  className={scanning ? "animate-spin" : ""}
                />
                {scanning ? "Scanning..." : "Run Security Scan"}
              </button>

              <a
                href="/agent-builder/security/audit-logs"
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Audit Logs
                <ArrowRight size={15} />
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-6 py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            label="Security score"
            value="96%"
            detail="+3.2% this month"
            icon={ShieldCheck}
          />

          <MetricCard
            label="Active policies"
            value="18"
            detail="17 enforced"
            icon={Settings2}
          />

          <MetricCard
            label="Blocked requests"
            value="1,248"
            detail="Last 24 hours"
            icon={AlertTriangle}
          />

          <MetricCard
            label="Protected agents"
            value="24"
            detail="All production agents"
            icon={Bot}
          />

          <MetricCard
            label="Security health"
            value="Healthy"
            detail="No critical incidents"
            icon={CheckCircle2}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          {["overview", "policies", "events", "access"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
                activeTab === tab
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_1fr]">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <SectionTitle
                  title="Security Controls"
                  description="Core security modules protecting the agent platform."
                  action={<StatusBadge status="Healthy" />}
                />

                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {securityModules.map((module) => {
                    const Icon = module.icon;
                    const selected = selectedModule === module.id;

                    return (
                      <button
                        key={module.id}
                        type="button"
                        onClick={() => setSelectedModule(module.id)}
                        className={`rounded-xl border p-4 text-left transition ${
                          selected
                            ? "border-slate-900 bg-slate-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                            <Icon size={17} />
                          </div>

                          {selected && (
                            <CheckCircle2
                              size={16}
                              className="text-emerald-600"
                            />
                          )}
                        </div>

                        <div className="mt-3 text-sm font-semibold">
                          {module.name}
                        </div>

                        <div className="mt-1 text-xs leading-5 text-slate-500">
                          {module.description}
                        </div>

                        <div className="mt-3">
                          <StatusBadge status={module.status} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <SectionTitle
                  title="Selected Control"
                  description="Current security configuration."
                />

                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                      <selectedModuleData.icon
                        size={18}
                        className="text-slate-700"
                      />
                    </div>

                    <div>
                      <div className="text-sm font-semibold">
                        {selectedModuleData.name}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {selectedModuleData.description}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status</span>
                      <span className="font-medium text-emerald-600">
                        Active
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        Enforcement
                      </span>
                      <span className="font-medium">Strict</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Coverage</span>
                      <span className="font-medium">100%</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        Last updated
                      </span>
                      <span className="font-medium">Today</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={16}
                      className="text-emerald-600"
                    />

                    <span className="text-sm font-semibold text-emerald-900">
                      Protection is active
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-emerald-800">
                    This control is currently enforced across production
                    workloads.
                  </p>
                </div>
              </section>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Security Health"
                description="Current health of major security layers."
              />

              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Guardrails", "Operational", ShieldCheck],
                  ["Authentication", "Operational", Lock],
                  ["Tool Policies", "Operational", Settings2],
                  ["Audit Logging", "Operational", FileText],
                ].map(([name, state, Icon]) => (
                  <div
                    key={name}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                        <Icon size={17} />
                      </div>

                      <CheckCircle2
                        size={16}
                        className="text-emerald-600"
                      />
                    </div>

                    <div className="mt-3 text-sm font-semibold">
                      {name}
                    </div>

                    <div className="mt-1 text-xs text-emerald-600">
                      {state}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === "policies" && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle
              title="Security Policies"
              description="Enable or disable platform security policies."
              action={
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white"
                >
                  <Plus size={14} />
                  Add Policy
                </button>
              }
            />

            <div className="mt-5 space-y-3">
              {[
                [
                  "Prompt Injection Defense",
                  "Detect and block malicious prompt manipulation.",
                  true,
                ],
                [
                  "Sensitive Data Protection",
                  "Detect and protect sensitive information.",
                  true,
                ],
                [
                  "Tool Permission Enforcement",
                  "Validate permissions before tool execution.",
                  true,
                ],
                [
                  "Output Validation",
                  "Validate generated output before delivery.",
                  true,
                ],
                [
                  "Human Approval",
                  "Require approval for critical operations.",
                  false,
                ],
                [
                  "Rate Limiting",
                  "Prevent abusive or excessive requests.",
                  true,
                ],
              ].map(([name, description, enabled]) => (
                <div
                  key={name}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck
                      size={18}
                      className="text-slate-700"
                    />

                    <div>
                      <div className="text-sm font-medium">
                        {name}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {description}
                      </div>
                    </div>
                  </div>

                  <Toggle
                    enabled={enabled}
                    onChange={() => {}}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "events" && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle
              title="Security Events"
              description="Recent security-related activity."
            />

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px]">
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  placeholder="Search events..."
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none">
                <option>All severities</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div className="mt-5 space-y-3">
              {securityEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                      {event.severity === "High" ? (
                        <AlertTriangle size={16} />
                      ) : (
                        <Activity size={16} />
                      )}
                    </div>

                    <div>
                      <div className="text-sm font-medium">
                        {event.type}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {event.message}
                      </div>

                      <div className="mt-1 text-[11px] text-slate-400">
                        {event.actor} · {event.time}
                      </div>
                    </div>
                  </div>

                  <StatusBadge status={event.severity} />
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "access" && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Access Control"
                description="Manage who can access agents and security settings."
              />

              <div className="mt-5 space-y-3">
                {[
                  ["Administrators", "Full security management", 4],
                  ["Developers", "Agent and tool configuration", 12],
                  ["Operators", "Runtime and observability", 8],
                  ["Viewers", "Read-only access", 24],
                ].map(([role, description, count]) => (
                  <div
                    key={role}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                        <Users size={17} />
                      </div>

                      <div>
                        <div className="text-sm font-medium">
                          {role}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {description}
                        </div>
                      </div>
                    </div>

                    <span className="text-sm font-semibold">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Security Recommendations"
                description="Recommended improvements for the platform."
              />

              <div className="mt-5 space-y-3">
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex gap-3">
                    <AlertTriangle
                      size={17}
                      className="text-amber-600"
                    />

                    <div>
                      <div className="text-sm font-semibold text-amber-900">
                        Enable human approval
                      </div>

                      <p className="mt-1 text-xs leading-5 text-amber-800">
                        Require manual approval for sensitive production
                        actions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <div className="flex gap-3">
                    <Zap
                      size={17}
                      className="text-blue-600"
                    />

                    <div>
                      <div className="text-sm font-semibold text-blue-900">
                        Review tool permissions
                      </div>

                      <p className="mt-1 text-xs leading-5 text-blue-800">
                        Review agent access to external tools and databases.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex gap-3">
                    <CheckCircle2
                      size={17}
                      className="text-emerald-600"
                    />

                    <div>
                      <div className="text-sm font-semibold text-emerald-900">
                        Encryption is enabled
                      </div>

                      <p className="mt-1 text-xs leading-5 text-emerald-800">
                        Stored platform data is currently protected.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}