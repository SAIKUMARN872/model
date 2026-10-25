"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  FileText,
  KeyRound,
  Lock,
  Play,
  Plus,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Terminal,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

type APIStatus = "Healthy" | "Degraded" | "Offline";
type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type Environment = "Production" | "Staging" | "Development";

type RESTAPI = {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  environment: Environment;
  status: APIStatus;
  method: HTTPMethod;
  requests: number;
  latency: number;
  successRate: number;
  owner: string;
  updated: string;
  auth: string;
};

const initialAPIs: RESTAPI[] = [
  {
    id: "api-001",
    name: "Customer API",
    description: "Customer profiles, accounts and preferences",
    baseUrl: "https://api.modelnow.ai/customers",
    environment: "Production",
    status: "Healthy",
    method: "GET",
    requests: 128450,
    latency: 184,
    successRate: 99.8,
    owner: "Platform Team",
    updated: "8 min ago",
    auth: "OAuth 2.0",
  },
  {
    id: "api-002",
    name: "Orders API",
    description: "Order creation, tracking and fulfillment",
    baseUrl: "https://api.modelnow.ai/orders",
    environment: "Production",
    status: "Healthy",
    method: "POST",
    requests: 94320,
    latency: 241,
    successRate: 99.4,
    owner: "Commerce Team",
    updated: "14 min ago",
    auth: "API Key",
  },
  {
    id: "api-003",
    name: "Analytics API",
    description: "Usage metrics and analytics data",
    baseUrl: "https://api.modelnow.ai/analytics",
    environment: "Staging",
    status: "Degraded",
    method: "GET",
    requests: 52780,
    latency: 486,
    successRate: 97.9,
    owner: "Analytics Team",
    updated: "21 min ago",
    auth: "Bearer Token",
  },
  {
    id: "api-004",
    name: "AI Gateway API",
    description: "Unified gateway for model and AI workloads",
    baseUrl: "https://api.modelnow.ai/ai",
    environment: "Production",
    status: "Healthy",
    method: "POST",
    requests: 256780,
    latency: 328,
    successRate: 99.7,
    owner: "AI Platform",
    updated: "3 min ago",
    auth: "OAuth 2.0",
  },
  {
    id: "api-005",
    name: "Internal Tools API",
    description: "Internal automation and tool integrations",
    baseUrl: "https://internal.modelnow.ai/tools",
    environment: "Development",
    status: "Offline",
    method: "POST",
    requests: 12840,
    latency: 0,
    successRate: 0,
    owner: "Developer Platform",
    updated: "1 hr ago",
    auth: "API Key",
  },
];

const statusStyles: Record<APIStatus, string> = {
  Healthy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Degraded: "bg-amber-50 text-amber-700 border-amber-200",
  Offline: "bg-red-50 text-red-700 border-red-200",
};

const methodStyles: Record<HTTPMethod, string> = {
  GET: "bg-blue-50 text-blue-700",
  POST: "bg-emerald-50 text-emerald-700",
  PUT: "bg-amber-50 text-amber-700",
  PATCH: "bg-purple-50 text-purple-700",
  DELETE: "bg-red-50 text-red-700",
};

export default function RESTAPIPage() {
  const [apis, setApis] = useState<RESTAPI[]>(initialAPIs);
  const [activeTab, setActiveTab] = useState<
    "APIs" | "Request Builder" | "Authentication" | "Security"
  >("APIs");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [environmentFilter, setEnvironmentFilter] =
    useState("All Environments");

  const [selectedAPI, setSelectedAPI] = useState<RESTAPI | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const filteredAPIs = useMemo(() => {
    return apis.filter((api) => {
      const matchesSearch =
        api.name.toLowerCase().includes(search.toLowerCase()) ||
        api.description.toLowerCase().includes(search.toLowerCase()) ||
        api.baseUrl.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All Status" || api.status === statusFilter;

      const matchesEnvironment =
        environmentFilter === "All Environments" ||
        api.environment === environmentFilter;

      return matchesSearch && matchesStatus && matchesEnvironment;
    });
  }, [apis, search, statusFilter, environmentFilter]);

  const healthyCount = apis.filter((api) => api.status === "Healthy").length;
  const degradedCount = apis.filter(
    (api) => api.status === "Degraded"
  ).length;

  const totalRequests = apis.reduce((sum, api) => sum + api.requests, 0);

  const averageLatency =
    apis.filter((api) => api.latency > 0).length > 0
      ? Math.round(
          apis
            .filter((api) => api.latency > 0)
            .reduce((sum, api) => sum + api.latency, 0) /
            apis.filter((api) => api.latency > 0).length
        )
      : 0;

  const handleRefresh = () => {
    setApis((current) =>
      current.map((api) => ({
        ...api,
        updated: "Just now",
      }))
    );
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                <Link
                  href="/agent-builder"
                  className="inline-flex items-center gap-1 hover:text-slate-900"
                >
                  <ArrowLeft size={15} />
                  Agent Builder
                </Link>
                <span>/</span>
                <span>Tools & Actions</span>
                <span>/</span>
                <span className="text-slate-900">REST APIs</span>
              </div>

              <h1 className="text-2xl font-semibold tracking-tight">
                REST API Integrations
              </h1>

              <p className="mt-1 max-w-3xl text-sm text-slate-500">
                Connect agents and workflows to external REST APIs with
                authentication, request execution, monitoring and security
                controls.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
              >
                <RefreshCw size={16} />
                Refresh
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                <Plus size={16} />
                Add REST API
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-6 py-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Connected APIs"
            value={String(apis.length)}
            subtitle={`${healthyCount} healthy`}
            icon={<Server size={18} />}
          />

          <MetricCard
            title="Requests"
            value={formatNumber(totalRequests)}
            subtitle="Across connected APIs"
            icon={<Activity size={18} />}
          />

          <MetricCard
            title="Average latency"
            value={`${averageLatency} ms`}
            subtitle="Successful requests"
            icon={<Clock3 size={18} />}
          />

          <MetricCard
            title="Degraded APIs"
            value={String(degradedCount)}
            subtitle="Needs attention"
            icon={<Zap size={18} />}
          />
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5">
            <div className="flex flex-wrap gap-6">
              {[
                "APIs",
                "Request Builder",
                "Authentication",
                "Security",
              ].map((tab) => (
                <Tab
                  key={tab}
                  active={activeTab === tab}
                  label={tab}
                  onClick={() =>
                    setActiveTab(
                      tab as
                        | "APIs"
                        | "Request Builder"
                        | "Authentication"
                        | "Security"
                    )
                  }
                />
              ))}
            </div>
          </div>

          {activeTab === "APIs" && (
            <div>
              <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-5">
                <div className="relative min-w-[260px] flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search APIs..."
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
                  />
                </div>

                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    "All Status",
                    "Healthy",
                    "Degraded",
                    "Offline",
                  ]}
                />

                <Select
                  value={environmentFilter}
                  onChange={setEnvironmentFilter}
                  options={[
                    "All Environments",
                    "Production",
                    "Staging",
                    "Development",
                  ]}
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-5 py-3">API</th>
                      <th className="px-5 py-3">Method</th>
                      <th className="px-5 py-3">Environment</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Requests</th>
                      <th className="px-5 py-3">Latency</th>
                      <th className="px-5 py-3">Success</th>
                      <th className="px-5 py-3">Owner</th>
                      <th className="px-5 py-3">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAPIs.map((api) => (
                      <tr
                        key={api.id}
                        className="border-b border-slate-100 hover:bg-slate-50/60"
                      >
                        <td className="px-5 py-4">
                          <div>
                            <div className="font-medium text-slate-900">
                              {api.name}
                            </div>
                            <div className="mt-1 max-w-[300px] truncate text-xs text-slate-500">
                              {api.baseUrl}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-md px-2 py-1 text-xs font-semibold ${methodStyles[api.method]}`}
                          >
                            {api.method}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {api.environment}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[api.status]}`}
                          >
                            {api.status === "Healthy" ? (
                              <CheckCircle2 size={13} />
                            ) : api.status === "Degraded" ? (
                              <Activity size={13} />
                            ) : (
                              <XCircle size={13} />
                            )}
                            {api.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm font-medium">
                          {formatNumber(api.requests)}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {api.latency ? `${api.latency} ms` : "—"}
                        </td>

                        <td className="px-5 py-4 text-sm font-medium">
                          {api.successRate
                            ? `${api.successRate}%`
                            : "—"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {api.owner}
                        </td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() => setSelectedAPI(api)}
                            className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-950"
                          >
                            Details
                            <ArrowRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredAPIs.length === 0 && (
                  <div className="p-12 text-center">
                    <Server className="mx-auto text-slate-300" size={34} />
                    <p className="mt-3 text-sm font-medium">
                      No APIs found
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Try changing your search or filters.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "Request Builder" && (
            <RequestBuilder onRun={() => setShowRequestModal(true)} />
          )}

          {activeTab === "Authentication" && <AuthenticationPanel />}

          {activeTab === "Security" && <SecurityPanel />}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <InfoCard
            icon={<Terminal size={18} />}
            title="Use REST APIs as agent tools"
            description="Expose endpoints to agents with structured inputs, authentication and response validation."
            href="/agent-builder/tools"
          />

          <InfoCard
            icon={<Database size={18} />}
            title="Connect databases"
            description="Combine REST API calls with database tools inside the same agent workflow."
            href="/agent-builder/tools/database"
          />

          <InfoCard
            icon={<ShieldCheck size={18} />}
            title="Secure API access"
            description="Use secrets, scopes, policies and audit logs to control external API access."
            href="/agent-builder/security"
          />
        </div>
      </div>

      {selectedAPI && (
        <APIDetailModal
          api={selectedAPI}
          onClose={() => setSelectedAPI(null)}
          onTest={() => {
            setSelectedAPI(null);
            setShowRequestModal(true);
          }}
        />
      )}

      {showCreateModal && (
        <CreateAPIModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(api) => {
            setApis((current) => [api, ...current]);
            setShowCreateModal(false);
          }}
        />
      )}

      {showRequestModal && (
        <RequestModal onClose={() => setShowRequestModal(false)} />
      )}
    </main>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">{title}</div>
        <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
          {icon}
        </div>
      </div>

      <div className="mt-3 text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{subtitle}</div>
    </div>
  );
}

function Tab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`border-b-2 px-1 py-4 text-sm font-medium transition ${
        active
          ? "border-slate-900 text-slate-900"
          : "border-transparent text-slate-500 hover:text-slate-900"
      }`}
    >
      {label}
    </button>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-3 pr-9 text-sm outline-none focus:border-slate-400"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

function RequestBuilder({ onRun }: { onRun: () => void }) {
  const [method, setMethod] = useState<HTTPMethod>("GET");
  const [url, setUrl] = useState(
    "https://api.modelnow.ai/v1/customers"
  );
  const [body, setBody] = useState(
    '{\n  "customerId": "cus_123"\n}'
  );

  return (
    <div className="grid gap-6 p-5 lg:grid-cols-[1fr_360px]">
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Request Builder</h2>
          <p className="mt-1 text-sm text-slate-500">
            Build and test REST requests before connecting them to an
            agent.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200">
          <div className="flex gap-2 border-b border-slate-200 p-3">
            <select
              value={method}
              onChange={(e) =>
                setMethod(e.target.value as HTTPMethod)
              }
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold"
            >
              {["GET", "POST", "PUT", "PATCH", "DELETE"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />

            <button
              onClick={onRun}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              <Play size={15} />
              Send
            </button>
          </div>

          <div className="grid gap-4 p-4">
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Headers
              </div>

              <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <input
                  placeholder="Header name"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <input
                  placeholder="Header value"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <button className="rounded-lg border border-slate-200 px-3 text-sm">
                  <Plus size={15} />
                </button>
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Request body
              </div>

              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={9}
                className="w-full rounded-lg border border-slate-200 bg-slate-950 p-4 font-mono text-sm text-slate-100 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="font-semibold">Runtime configuration</h3>

        <div className="mt-5 space-y-4">
          <RuntimeRow
            label="Authentication"
            value="OAuth 2.0"
          />
          <RuntimeRow
            label="Timeout"
            value="30 seconds"
          />
          <RuntimeRow
            label="Retries"
            value="3 attempts"
          />
          <RuntimeRow
            label="Response validation"
            value="JSON schema"
          />
          <RuntimeRow
            label="Logging"
            value="Enabled"
          />
        </div>

        <button
          onClick={onRun}
          className="mt-6 w-full rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200"
        >
          Test Request
        </button>
      </div>
    </div>
  );
}

function RuntimeRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm font-medium text-slate-800">
        {value}
      </span>
    </div>
  );
}

function AuthenticationPanel() {
  return (
    <div className="p-5">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Authentication</h2>
        <p className="mt-1 text-sm text-slate-500">
          Configure secure authentication for external REST API
          connections.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AuthCard
          icon={<KeyRound size={19} />}
          title="API Keys"
          description="Store and rotate API credentials securely."
        />

        <AuthCard
          icon={<Lock size={19} />}
          title="OAuth 2.0"
          description="Use delegated authorization for external services."
        />

        <AuthCard
          icon={<ShieldCheck size={19} />}
          title="Bearer Tokens"
          description="Attach secure bearer tokens to requests."
        />

        <AuthCard
          icon={<Users size={19} />}
          title="Service Accounts"
          description="Use managed identities for machine-to-machine access."
        />
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-emerald-600" size={20} />
          <div>
            <h3 className="font-semibold">Secret management</h3>
            <p className="mt-1 text-sm text-slate-500">
              API credentials are stored separately from workflow
              configuration and are never exposed to agent prompts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-5 hover:border-slate-300">
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
        {icon}
      </div>

      <h3 className="font-semibold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <button className="mt-4 text-sm font-medium text-slate-800">
        Configure →
      </button>
    </div>
  );
}

function SecurityPanel() {
  const rows = [
    ["TLS encryption", "Enabled"],
    ["Secret isolation", "Enabled"],
    ["Request audit logs", "Enabled"],
    ["Response validation", "Enabled"],
    ["Rate limiting", "Enabled"],
    ["Domain allowlist", "Enabled"],
  ];

  return (
    <div className="p-5">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">API Security</h2>
        <p className="mt-1 text-sm text-slate-500">
          Protect REST API integrations with runtime controls and
          governance policies.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200">
        {rows.map(([label, status]) => (
          <div
            key={label}
            className="flex items-center justify-between border-b border-slate-100 px-5 py-4 last:border-0"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck size={17} className="text-emerald-600" />
              <span className="text-sm font-medium">{label}</span>
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
              <CheckCircle2 size={14} />
              {status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  description,
  href,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
          {icon}
        </div>
        <ArrowRight size={16} className="text-slate-400" />
      </div>

      <h3 className="mt-4 font-semibold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </Link>
  );
}

function APIDetailModal({
  api,
  onClose,
  onTest,
}: {
  api: RESTAPI;
  onClose: () => void;
  onTest: () => void;
}) {
  return (
    <Modal title={api.name} onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-lg bg-slate-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Base URL
          </div>
          <div className="mt-2 break-all font-mono text-sm text-slate-800">
            {api.baseUrl}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Detail label="Environment" value={api.environment} />
          <Detail label="Method" value={api.method} />
          <Detail label="Authentication" value={api.auth} />
          <Detail label="Owner" value={api.owner} />
          <Detail label="Latency" value={`${api.latency} ms`} />
          <Detail label="Success rate" value={`${api.successRate}%`} />
        </div>

        <div className="rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2">
            <FileText size={17} />
            <span className="font-medium">Description</span>
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {api.description}
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium"
          >
            Close
          </button>

          <button
            onClick={onTest}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            <Play size={15} />
            Test API
          </button>
        </div>
      </div>
    </Modal>
  );
}

function CreateAPIModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (api: RESTAPI) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [method, setMethod] = useState<HTTPMethod>("GET");
  const [environment, setEnvironment] =
    useState<Environment>("Development");
  const [auth, setAuth] = useState("API Key");

  const handleCreate = () => {
    if (!name.trim() || !baseUrl.trim()) return;

    const newAPI: RESTAPI = {
      id: `api-${Date.now()}`,
      name,
      description: description || "REST API integration",
      baseUrl,
      environment,
      status: "Healthy",
      method,
      requests: 0,
      latency: 0,
      successRate: 100,
      owner: "Current Workspace",
      updated: "Just now",
      auth,
    };

    onCreate(newAPI);
  };

  return (
    <Modal title="Add REST API" onClose={onClose}>
      <div className="space-y-4">
        <Field
          label="API name"
          value={name}
          onChange={setName}
          placeholder="Customer API"
        />

        <Field
          label="Base URL"
          value={baseUrl}
          onChange={setBaseUrl}
          placeholder="https://api.example.com"
        />

        <Field
          label="Description"
          value={description}
          onChange={setDescription}
          placeholder="What this API is used for"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Default method"
            value={method}
            options={["GET", "POST", "PUT", "PATCH", "DELETE"]}
            onChange={(value) =>
              setMethod(value as HTTPMethod)
            }
          />

          <SelectField
            label="Environment"
            value={environment}
            options={[
              "Production",
              "Staging",
              "Development",
            ]}
            onChange={(value) =>
              setEnvironment(value as Environment)
            }
          />
        </div>

        <SelectField
          label="Authentication"
          value={auth}
          options={[
            "API Key",
            "OAuth 2.0",
            "Bearer Token",
            "Service Account",
          ]}
          onChange={setAuth}
        />

        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium"
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            disabled={!name.trim() || !baseUrl.trim()}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Create API
          </button>
        </div>
      </div>
    </Modal>
  );
}

function RequestModal({ onClose }: { onClose: () => void }) {
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);

  const runRequest = () => {
    setRunning(true);
    setCompleted(false);

    setTimeout(() => {
      setRunning(false);
      setCompleted(true);
    }, 800);
  };

  return (
    <Modal title="Test REST API Request" onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-sm text-slate-100">
          <div className="text-emerald-400">
            POST /v1/customers
          </div>
          <div className="mt-3 text-slate-400">
            Authorization: Bearer ••••••••••
          </div>
          <div className="mt-1 text-slate-400">
            Content-Type: application/json
          </div>
        </div>

        {completed && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <CheckCircle2 size={16} />
              Request completed successfully
            </div>

            <div className="mt-2 text-xs text-emerald-700">
              Status: 200 OK · Latency: 184 ms
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <SmallMetric label="Status" value={completed ? "200" : "Ready"} />
          <SmallMetric label="Latency" value={completed ? "184 ms" : "—"} />
          <SmallMetric label="Retries" value="0" />
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium"
          >
            Close
          </button>

          <button
            onClick={runRequest}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {running ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Play size={15} />
                Send Request
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function SmallMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm outline-none focus:border-slate-400"
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>

        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}