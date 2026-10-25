"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Code,
  Copy,
  Database,
  Lock,
  Play,
  RefreshCw,
  Server,
  Settings2,
  ShieldCheck,
  Terminal,
  Users,
  Zap,
  XCircle,
} from "lucide-react";

const deploymentChannels = [
  {
    id: "chat",
    name: "Chat",
    description: "Deploy your agent as a conversational chat experience.",
    icon: Bot,
    status: "Ready",
  },
  {
    id: "api",
    name: "API",
    description: "Expose the agent through a production API endpoint.",
    icon: Terminal,
    status: "Ready",
  },
  {
    id: "sdk",
    name: "SDK",
    description: "Integrate the agent into web and application code.",
    icon: Code,
    status: "Ready",
  },
  {
    id: "webhook",
    name: "Webhooks",
    description: "Trigger agent executions from external services.",
    icon: Zap,
    status: "Ready",
  },
  {
    id: "embed",
    name: "Website Embed",
    description: "Embed your agent directly into a website.",
    icon: Server,
    status: "Draft",
  },
  {
    id: "background",
    name: "Background Agent",
    description: "Run autonomous tasks without an active user session.",
    icon: Activity,
    status: "Draft",
  },
];

const environments = [
  {
    id: "production",
    name: "Production",
    description: "Live traffic and customer workloads",
    color: "emerald",
  },
  {
    id: "staging",
    name: "Staging",
    description: "Pre-production testing environment",
    color: "blue",
  },
  {
    id: "development",
    name: "Development",
    description: "Local development and experimentation",
    color: "slate",
  },
];

const versions = [
  {
    id: "v1.4.0",
    version: "v1.4.0",
    status: "Live",
    created: "Today, 10:42 AM",
    traffic: "100%",
    latency: "1.28s",
    success: "98.7%",
  },
  {
    id: "v1.3.2",
    version: "v1.3.2",
    status: "Previous",
    created: "Sep 18, 2026",
    traffic: "0%",
    latency: "1.41s",
    success: "97.9%",
  },
  {
    id: "v1.3.1",
    version: "v1.3.1",
    status: "Archived",
    created: "Sep 12, 2026",
    traffic: "0%",
    latency: "1.48s",
    success: "96.8%",
  },
];

function StatusBadge({ status }) {
  const styles = {
    Ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Live: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Previous: "border-blue-200 bg-blue-50 text-blue-700",
    Draft: "border-slate-200 bg-slate-50 text-slate-600",
    Archived: "border-slate-200 bg-slate-50 text-slate-500",
    Deploying: "border-amber-200 bg-amber-50 text-amber-700",
    Failed: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        styles[status] ||
        "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {status}
    </span>
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

export default function AgentDeployment() {
  const [activeTab, setActiveTab] = useState("overview");
  const [environment, setEnvironment] = useState("production");
  const [environmentOpen, setEnvironmentOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState("chat");
  const [autoScale, setAutoScale] = useState(true);
  const [streaming, setStreaming] = useState(true);
  const [authentication, setAuthentication] = useState(true);
  const [logging, setLogging] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState("Live");

  const selectedEnvironment = useMemo(() => {
    return (
      environments.find((item) => item.id === environment) ||
      environments[0]
    );
  }, [environment]);

  const selectedChannelData = useMemo(() => {
    return (
      deploymentChannels.find((item) => item.id === selectedChannel) ||
      deploymentChannels[0]
    );
  }, [selectedChannel]);

  const deployAgent = () => {
    setDeploying(true);
    setDeploymentStatus("Deploying");

    setTimeout(() => {
      setDeploying(false);
      setDeploymentStatus("Live");
    }, 1800);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="border-b border-slate-200 bg-white">
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
                <Server size={19} className="text-white" />
              </div>

              <div>
                <h1 className="text-xl font-semibold">
                  Agent Deployment
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Deploy, manage, and monitor your agent across multiple
                  environments and channels.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/agent-builder/observability/agent-runtime"
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Runtime
                <ArrowRight size={15} />
              </a>

              <button
                type="button"
                onClick={deployAgent}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                {deploying ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <Play size={15} />
                )}

                {deploying ? "Deploying..." : "Deploy Agent"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-6 py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Deployment status"
            value={deploymentStatus}
            detail="Production environment"
            icon={CheckCircle2}
          />

          <MetricCard
            label="Active version"
            value="v1.4.0"
            detail="100% production traffic"
            icon={Bot}
          />

          <MetricCard
            label="Success rate"
            value="98.7%"
            detail="Last 24 hours"
            icon={Activity}
          />

          <MetricCard
            label="Average latency"
            value="1.28s"
            detail="-11% from previous version"
            icon={Clock3}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          {["overview", "channels", "versions", "settings"].map((tab) => (
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
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Deployment Configuration"
                description="Configure the environment and runtime options for your deployed agent."
              />

              <div className="mt-5 space-y-5">
                <div>
                  <label className="text-xs font-medium text-slate-600">
                    Environment
                  </label>

                  <div className="relative mt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEnvironmentOpen((value) => !value)
                      }
                      className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left hover:bg-slate-50"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {selectedEnvironment.name}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {selectedEnvironment.description}
                        </div>
                      </div>

                      <ChevronDown
                        size={17}
                        className="text-slate-400"
                      />
                    </button>

                    {environmentOpen && (
                      <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                        {environments.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setEnvironment(item.id);
                              setEnvironmentOpen(false);
                            }}
                            className="flex w-full items-center justify-between rounded-lg p-3 text-left hover:bg-slate-50"
                          >
                            <div>
                              <div className="text-sm font-medium text-slate-900">
                                {item.name}
                              </div>

                              <div className="text-xs text-slate-500">
                                {item.description}
                              </div>
                            </div>

                            {environment === item.id && (
                              <CheckCircle2
                                size={16}
                                className="text-emerald-600"
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          Auto Scaling
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          Automatically scale instances based on traffic.
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setAutoScale((value) => !value)}
                        className={`relative h-6 w-11 rounded-full ${
                          autoScale ? "bg-slate-900" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                            autoScale ? "left-6" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          Streaming
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          Stream responses to connected clients.
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setStreaming((value) => !value)}
                        className={`relative h-6 w-11 rounded-full ${
                          streaming ? "bg-slate-900" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                            streaming ? "left-6" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          Authentication
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          Protect production deployment endpoints.
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setAuthentication((value) => !value)
                        }
                        className={`relative h-6 w-11 rounded-full ${
                          authentication
                            ? "bg-slate-900"
                            : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                            authentication ? "left-6" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          Runtime Logging
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          Capture deployment and execution logs.
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setLogging((value) => !value)
                        }
                        className={`relative h-6 w-11 rounded-full ${
                          logging ? "bg-slate-900" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                            logging ? "left-6" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Production Health"
                description="Live information from the current deployment."
              />

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2
                      size={17}
                      className="text-emerald-600"
                    />

                    <div>
                      <div className="text-sm font-medium">
                        API Service
                      </div>

                      <div className="text-xs text-slate-500">
                        Endpoint responding normally
                      </div>
                    </div>
                  </div>

                  <StatusBadge status="Live" />
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <Activity
                      size={17}
                      className="text-emerald-600"
                    />

                    <div>
                      <div className="text-sm font-medium">
                        Agent Runtime
                      </div>

                      <div className="text-xs text-slate-500">
                        All runtime workers healthy
                      </div>
                    </div>
                  </div>

                  <StatusBadge status="Ready" />
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <Database
                      size={17}
                      className="text-emerald-600"
                    />

                    <div>
                      <div className="text-sm font-medium">
                        Memory Store
                      </div>

                      <div className="text-xs text-slate-500">
                        Connected to production knowledge
                      </div>
                    </div>
                  </div>

                  <StatusBadge status="Ready" />
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck
                      size={17}
                      className="text-emerald-600"
                    />

                    <div>
                      <div className="text-sm font-medium">
                        Security
                      </div>

                      <div className="text-xs text-slate-500">
                        Authentication and guardrails enabled
                      </div>
                    </div>
                  </div>

                  <StatusBadge status="Ready" />
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2">
                  <Clock3 size={16} className="text-slate-600" />
                  <span className="text-sm font-semibold">
                    Last deployment
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-slate-400">Version</div>
                    <div className="mt-1 font-medium">v1.4.0</div>
                  </div>

                  <div>
                    <div className="text-slate-400">Time</div>
                    <div className="mt-1 font-medium">10:42 AM</div>
                  </div>

                  <div>
                    <div className="text-slate-400">Duration</div>
                    <div className="mt-1 font-medium">42 seconds</div>
                  </div>

                  <div>
                    <div className="text-slate-400">Deployed by</div>
                    <div className="mt-1 font-medium">
                      ModelNow CI/CD
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "channels" && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle
              title="Deployment Channels"
              description="Choose where and how your agent will be available."
            />

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {deploymentChannels.map((channel) => {
                const Icon = channel.icon;
                const selected = selectedChannel === channel.id;

                return (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => setSelectedChannel(channel.id)}
                    className={`rounded-xl border p-4 text-left transition ${
                      selected
                        ? "border-slate-900 bg-slate-50 ring-2 ring-slate-900/5"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                        <Icon size={18} className="text-slate-700" />
                      </div>

                      {selected && (
                        <CheckCircle2
                          size={17}
                          className="text-emerald-600"
                        />
                      )}
                    </div>

                    <div className="mt-4 text-sm font-semibold">
                      {channel.name}
                    </div>

                    <div className="mt-1 text-xs leading-5 text-slate-500">
                      {channel.description}
                    </div>

                    <div className="mt-4">
                      <StatusBadge status={channel.status} />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">
                    Selected channel
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    {selectedChannelData.name} deployment configuration
                  </div>
                </div>

                <StatusBadge status={selectedChannelData.status} />
              </div>

              <div className="mt-4 rounded-lg bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <Settings2 size={15} className="text-slate-600" />
                  <span className="text-sm font-medium">
                    Channel configuration
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div>
                    <div className="text-[11px] text-slate-400">
                      Endpoint
                    </div>
                    <div className="mt-1 text-xs font-medium">
                      /api/agents/research
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-400">
                      Authentication
                    </div>
                    <div className="mt-1 text-xs font-medium">
                      API Key
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-400">
                      Streaming
                    </div>
                    <div className="mt-1 text-xs font-medium">
                      {streaming ? "Enabled" : "Disabled"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "versions" && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle
              title="Agent Versions"
              description="Manage production versions, traffic, and rollback options."
              action={
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white"
                >
                  <Zap size={14} />
                  Create Version
                </button>
              }
            />

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500">
                    <th className="px-3 py-3 font-medium">Version</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium">Created</th>
                    <th className="px-3 py-3 font-medium">Traffic</th>
                    <th className="px-3 py-3 font-medium">Latency</th>
                    <th className="px-3 py-3 font-medium">Success</th>
                    <th className="px-3 py-3 font-medium">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {versions.map((version) => (
                    <tr
                      key={version.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-3 py-4 text-sm font-semibold">
                        {version.version}
                      </td>

                      <td className="px-3 py-4">
                        <StatusBadge status={version.status} />
                      </td>

                      <td className="px-3 py-4 text-xs text-slate-500">
                        {version.created}
                      </td>

                      <td className="px-3 py-4 text-sm">
                        {version.traffic}
                      </td>

                      <td className="px-3 py-4 text-sm">
                        {version.latency}
                      </td>

                      <td className="px-3 py-4 text-sm">
                        {version.success}
                      </td>

                      <td className="px-3 py-4">
                        {version.status !== "Live" ? (
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Rollback
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Current
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "settings" && (
          <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Security"
                description="Production access and security controls."
              />

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <Lock size={17} className="text-slate-700" />
                    <div>
                      <div className="text-sm font-medium">
                        API Authentication
                      </div>
                      <div className="text-xs text-slate-500">
                        Require credentials for deployment access
                      </div>
                    </div>
                  </div>

                  <StatusBadge status="Ready" />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck
                      size={17}
                      className="text-slate-700"
                    />
                    <div>
                      <div className="text-sm font-medium">
                        Guardrails
                      </div>
                      <div className="text-xs text-slate-500">
                        Production safety policies
                      </div>
                    </div>
                  </div>

                  <StatusBadge status="Ready" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Runtime"
                description="Performance and execution configuration."
              />

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <Activity size={17} className="text-slate-700" />

                    <div>
                      <div className="text-sm font-medium">
                        Auto Scaling
                      </div>
                      <div className="text-xs text-slate-500">
                        {autoScale ? "Enabled" : "Disabled"}
                      </div>
                    </div>
                  </div>

                  <StatusBadge
                    status={autoScale ? "Ready" : "Draft"}
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <Database size={17} className="text-slate-700" />

                    <div>
                      <div className="text-sm font-medium">
                        Runtime Logging
                      </div>
                      <div className="text-xs text-slate-500">
                        {logging ? "Enabled" : "Disabled"}
                      </div>
                    </div>
                  </div>

                  <StatusBadge
                    status={logging ? "Ready" : "Draft"}
                  />
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}