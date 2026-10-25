"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Code,
  Database,
  FileText,
  Globe,
  KeyRound,
  Lock,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Terminal,
  UserRound,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

type ToolStatus = "Active" | "Draft" | "Disabled" | "Error";
type ToolType = "REST API" | "MCP" | "Database" | "Code" | "Webhook";

type CustomTool = {
  id: string;
  name: string;
  description: string;
  type: ToolType;
  status: ToolStatus;
  endpoint: string;
  method: string;
  version: string;
  latency: number;
  successRate: number;
  calls: number;
  lastUsed: string;
  owner: string;
  auth: string;
  updated: string;
};

const initialTools: CustomTool[] = [
  {
    id: "tool-001",
    name: "Customer Lookup",
    description: "Fetch customer profile and account information.",
    type: "REST API",
    status: "Active",
    endpoint: "/api/customers/{customerId}",
    method: "GET",
    version: "v2",
    latency: 184,
    successRate: 99.4,
    calls: 12480,
    lastUsed: "2 min ago",
    owner: "Platform Team",
    auth: "API Key",
    updated: "Today",
  },
  {
    id: "tool-002",
    name: "Order Search",
    description: "Search orders using customer, status, and date filters.",
    type: "REST API",
    status: "Active",
    endpoint: "/api/orders/search",
    method: "POST",
    version: "v1",
    latency: 231,
    successRate: 98.9,
    calls: 8640,
    lastUsed: "8 min ago",
    owner: "Commerce Team",
    auth: "OAuth 2.0",
    updated: "Today",
  },
  {
    id: "tool-003",
    name: "Postgres Query",
    description: "Run approved read-only queries against analytics data.",
    type: "Database",
    status: "Active",
    endpoint: "postgres://analytics",
    method: "QUERY",
    version: "v1",
    latency: 96,
    successRate: 99.8,
    calls: 6721,
    lastUsed: "14 min ago",
    owner: "Data Team",
    auth: "Service Account",
    updated: "Yesterday",
  },
  {
    id: "tool-004",
    name: "Invoice Generator",
    description: "Generate an invoice PDF from structured billing data.",
    type: "Code",
    status: "Active",
    endpoint: "invoice.generate",
    method: "EXECUTE",
    version: "v3",
    latency: 740,
    successRate: 97.8,
    calls: 3280,
    lastUsed: "22 min ago",
    owner: "Finance Team",
    auth: "JWT",
    updated: "Yesterday",
  },
  {
    id: "tool-005",
    name: "Slack Notification",
    description: "Send operational notifications to approved channels.",
    type: "Webhook",
    status: "Active",
    endpoint: "https://hooks.slack.com/...",
    method: "POST",
    version: "v1",
    latency: 312,
    successRate: 99.1,
    calls: 4210,
    lastUsed: "31 min ago",
    owner: "Operations",
    auth: "Secret",
    updated: "2 days ago",
  },
  {
    id: "tool-006",
    name: "CRM MCP Server",
    description: "Expose CRM actions and resources through MCP.",
    type: "MCP",
    status: "Active",
    endpoint: "mcp://crm-server",
    method: "MCP",
    version: "2026.08",
    latency: 205,
    successRate: 99.2,
    calls: 2890,
    lastUsed: "42 min ago",
    owner: "Platform Team",
    auth: "OAuth 2.0",
    updated: "3 days ago",
  },
  {
    id: "tool-007",
    name: "Email Sender",
    description: "Transactional email tool currently being prepared.",
    type: "REST API",
    status: "Draft",
    endpoint: "/api/email/send",
    method: "POST",
    version: "v1",
    latency: 0,
    successRate: 0,
    calls: 0,
    lastUsed: "Never",
    owner: "Communications",
    auth: "API Key",
    updated: "3 days ago",
  },
  {
    id: "tool-008",
    name: "Legacy Billing Tool",
    description: "Legacy billing integration scheduled for retirement.",
    type: "REST API",
    status: "Disabled",
    endpoint: "/legacy/billing",
    method: "POST",
    version: "v1",
    latency: 0,
    successRate: 0,
    calls: 18240,
    lastUsed: "12 days ago",
    owner: "Finance Team",
    auth: "API Key",
    updated: "1 week ago",
  },
];

const typeIcon: Record<ToolType, ReactNode> = {
  "REST API": <Globe size={16} />,
  MCP: <Zap size={16} />,
  Database: <Database size={16} />,
  Code: <Code size={16} />,
  Webhook: <Terminal size={16} />,
};

const statusClass: Record<ToolStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Draft: "bg-amber-50 text-amber-700 border-amber-200",
  Disabled: "bg-gray-100 text-gray-600 border-gray-200",
  Error: "bg-red-50 text-red-700 border-red-200",
};

export default function CustomToolsPage() {
  const [tools, setTools] = useState<CustomTool[]>(initialTools);
  const [activeTab, setActiveTab] = useState<"tools" | "templates" | "permissions">(
    "tools"
  );
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | ToolType>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | ToolStatus>("All");
  const [selectedTool, setSelectedTool] = useState<CustomTool | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showTest, setShowTest] = useState<CustomTool | null>(null);

  const filteredTools = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tools.filter((tool) => {
      const matchesSearch =
        !query ||
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.endpoint.toLowerCase().includes(query);

      const matchesType = typeFilter === "All" || tool.type === typeFilter;
      const matchesStatus =
        statusFilter === "All" || tool.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [tools, search, typeFilter, statusFilter]);

  const metrics = useMemo(() => {
    const active = tools.filter((tool) => tool.status === "Active").length;
    const totalCalls = tools.reduce((sum, tool) => sum + tool.calls, 0);

    const activeTools = tools.filter(
      (tool) => tool.status === "Active" && tool.successRate > 0
    );

    const successRate =
      activeTools.length > 0
        ? activeTools.reduce((sum, tool) => sum + tool.successRate, 0) /
          activeTools.length
        : 0;

    const latencyTools = tools.filter(
      (tool) => tool.status === "Active" && tool.latency > 0
    );

    const latency =
      latencyTools.length > 0
        ? Math.round(
            latencyTools.reduce((sum, tool) => sum + tool.latency, 0) /
              latencyTools.length
          )
        : 0;

    return {
      total: tools.length,
      active,
      totalCalls,
      successRate,
      latency,
    };
  }, [tools]);

  function toggleToolStatus(tool: CustomTool) {
    setTools((current) =>
      current.map((item) =>
        item.id === tool.id
          ? {
              ...item,
              status: item.status === "Active" ? "Disabled" : "Active",
            }
          : item
      )
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#111827]">
      <div className="mx-auto max-w-[1500px] px-6 py-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <Link
                href="/agent-builder/tools"
                className="flex items-center gap-1 hover:text-gray-900"
              >
                <ArrowLeft size={15} />
                Agent Builder
              </Link>
              <span>/</span>
              <span>Tools & Actions</span>
            </div>

            <h1 className="text-[28px] font-semibold tracking-tight">
              Custom Tools
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Build, configure, test, secure, and manage tools that AI agents can
              use to interact with your systems.
            </p>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-black"
          >
            <Plus size={17} />
            Create Tool
          </button>
        </header>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total Tools"
            value={metrics.total.toLocaleString()}
            icon={<WrenchIcon />}
            description="Configured tools"
          />

          <MetricCard
            title="Active Tools"
            value={metrics.active.toLocaleString()}
            icon={<CheckCircle2 size={18} />}
            description="Ready for agents"
          />

          <MetricCard
            title="Tool Calls"
            value={metrics.totalCalls.toLocaleString()}
            icon={<Activity size={18} />}
            description="Across active integrations"
          />

          <MetricCard
            title="Avg Success Rate"
            value={`${metrics.successRate.toFixed(1)}%`}
            icon={<ShieldCheck size={18} />}
            description={`Avg latency ${metrics.latency} ms`}
          />
        </div>

        <div className="mb-5 flex flex-wrap gap-2 border-b border-gray-200">
          <TabButton
            active={activeTab === "tools"}
            onClick={() => setActiveTab("tools")}
          >
            Custom Tools
          </TabButton>

          <TabButton
            active={activeTab === "templates"}
            onClick={() => setActiveTab("templates")}
          >
            Tool Templates
          </TabButton>

          <TabButton
            active={activeTab === "permissions"}
            onClick={() => setActiveTab("permissions")}
          >
            Permissions
          </TabButton>
        </div>

        {activeTab === "tools" && (
          <>
            <section className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative min-w-0 flex-1 lg:max-w-[520px]">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search tools, endpoints, descriptions..."
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <FilterSelect
                    value={typeFilter}
                    onChange={(value) =>
                      setTypeFilter(value as "All" | ToolType)
                    }
                    options={[
                      "All",
                      "REST API",
                      "MCP",
                      "Database",
                      "Code",
                      "Webhook",
                    ]}
                  />

                  <FilterSelect
                    value={statusFilter}
                    onChange={(value) =>
                      setStatusFilter(value as "All" | ToolStatus)
                    }
                    options={["All", "Active", "Draft", "Disabled", "Error"]}
                  />
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
                <div>
                  <h2 className="text-sm font-semibold">Tool Registry</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    {filteredTools.length} tools matching current filters
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Runtime integrations
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left">
                  <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-5 py-3 font-medium">Tool</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Performance</th>
                      <th className="px-4 py-3 font-medium">Calls</th>
                      <th className="px-4 py-3 font-medium">Owner</th>
                      <th className="px-4 py-3 font-medium">Updated</th>
                      <th className="px-5 py-3 font-medium">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredTools.map((tool) => (
                      <tr
                        key={tool.id}
                        className="transition hover:bg-gray-50/70"
                      >
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setSelectedTool(tool)}
                            className="text-left"
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600">
                                {typeIcon[tool.type]}
                              </div>

                              <div>
                                <div className="text-sm font-medium text-gray-900 hover:underline">
                                  {tool.name}
                                </div>
                                <div className="mt-1 max-w-[300px] truncate text-xs text-gray-500">
                                  {tool.description}
                                </div>
                                <div className="mt-1 font-mono text-[10px] text-gray-400">
                                  {tool.endpoint}
                                </div>
                              </div>
                            </div>
                          </button>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            {typeIcon[tool.type]}
                            {tool.type}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusClass[tool.status]}`}
                          >
                            {tool.status}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          {tool.status === "Active" ? (
                            <div>
                              <div className="text-xs font-medium text-gray-800">
                                {tool.successRate.toFixed(1)}%
                              </div>
                              <div className="mt-1 text-[10px] text-gray-400">
                                {tool.latency} ms avg
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>

                        <td className="px-4 py-4 text-xs text-gray-600">
                          {tool.calls.toLocaleString()}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <UserRound size={14} />
                            {tool.owner}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-xs text-gray-500">
                          {tool.updated}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setShowTest(tool)}
                              className="rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                            >
                              Test
                            </button>

                            <button
                              onClick={() => setSelectedTool(tool)}
                              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                              title="Open tool"
                            >
                              <ArrowRight size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredTools.length === 0 && (
                  <div className="px-6 py-16 text-center">
                    <Search
                      size={28}
                      className="mx-auto mb-3 text-gray-300"
                    />
                    <h3 className="text-sm font-medium text-gray-800">
                      No tools found
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Try changing your search or filters.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <InfoCard
                icon={<ShieldCheck size={18} />}
                title="Secure tool execution"
                description="Every custom tool can define authentication, permissions, input validation, and runtime policies before agents can invoke it."
                href="/agent-builder/security/tool-policies"
              />

              <InfoCard
                icon={<Activity size={18} />}
                title="Observe every invocation"
                description="Monitor execution traces, latency, failures, token usage, and cost for every tool call."
                href="/agent-builder/observability/execution-traces"
              />

              <InfoCard
                icon={<Settings2 size={18} />}
                title="Connect to agents"
                description="Expose approved tools to your agents through the Agent Builder tool library and permission policies."
                href="/agent-builder/tools"
              />
            </section>
          </>
        )}

        {activeTab === "templates" && (
          <ToolTemplates onCreate={() => setShowCreate(true)} />
        )}

        {activeTab === "permissions" && <PermissionsPanel />}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4">
          <div>
            <div className="text-sm font-medium">Tool execution health</div>
            <div className="mt-1 text-xs text-gray-500">
              Runtime services are operating normally.
            </div>
          </div>

          <div className="flex items-center gap-5 text-xs">
            <HealthItem label="API Gateway" status="Healthy" />
            <HealthItem label="Tool Runtime" status="Healthy" />
            <HealthItem label="Secrets" status="Healthy" />
          </div>
        </div>
      </div>

      {selectedTool && (
        <ToolDetailModal
          tool={selectedTool}
          onClose={() => setSelectedTool(null)}
          onToggle={() => {
            toggleToolStatus(selectedTool);
            setSelectedTool((current) =>
              current
                ? {
                    ...current,
                    status:
                      current.status === "Active" ? "Disabled" : "Active",
                  }
                : null
            );
          }}
          onTest={() => {
            setSelectedTool(null);
            setShowTest(selectedTool);
          }}
        />
      )}

      {showTest && (
        <TestToolModal
          tool={showTest}
          onClose={() => setShowTest(null)}
        />
      )}

      {showCreate && (
        <CreateToolModal
          onClose={() => setShowCreate(false)}
          onCreate={(tool) => {
            setTools((current) => [tool, ...current]);
            setShowCreate(false);
          }}
        />
      )}
    </main>
  );
}

function WrenchIcon() {
  return <Settings2 size={18} />;
}

function MetricCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">{title}</span>
        <span className="text-gray-500">{icon}</span>
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-[11px] text-gray-400">{description}</div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`border-b-2 px-4 py-2.5 text-sm font-medium transition ${
        active
          ? "border-gray-900 text-gray-900"
          : "border-transparent text-gray-500 hover:text-gray-800"
      }`}
    >
      {children}
    </button>
  );
}

function FilterSelect({
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
        onChange={(event) => onChange(event.target.value)}
        className="appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-3 pr-9 text-xs font-medium text-gray-700 outline-none hover:border-gray-300 focus:border-gray-400"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
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
      className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md"
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600">
        {icon}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <ArrowRight
          size={15}
          className="text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-gray-800"
        />
      </div>

      <p className="mt-2 text-xs leading-5 text-gray-500">{description}</p>
    </Link>
  );
}

function HealthItem({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  return (
    <div className="flex items-center gap-2 text-gray-600">
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
      <span>{label}</span>
      <span className="font-medium text-emerald-600">{status}</span>
    </div>
  );
}

function ToolTemplates({ onCreate }: { onCreate: () => void }) {
  const templates = [
    {
      title: "REST API Tool",
      description:
        "Connect an authenticated REST endpoint and expose structured actions to agents.",
      icon: <Globe size={18} />,
    },
    {
      title: "MCP Tool",
      description:
        "Connect an MCP server and expose approved resources and actions.",
      icon: <Zap size={18} />,
    },
    {
      title: "Database Tool",
      description:
        "Create a controlled database action with read-only or approved write access.",
      icon: <Database size={18} />,
    },
    {
      title: "Code Execution Tool",
      description:
        "Run isolated code for calculations, transformations, and data processing.",
      icon: <Code size={18} />,
    },
    {
      title: "Webhook Tool",
      description:
        "Trigger external systems through secure webhook integrations.",
      icon: <Terminal size={18} />,
    },
    {
      title: "Document Tool",
      description:
        "Create document-processing actions for files and structured content.",
      icon: <FileText size={18} />,
    },
  ];

  return (
    <section>
      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold">Tool Templates</h2>
        <p className="mt-1 text-sm text-gray-500">
          Start with a preconfigured integration pattern and customize it for
          your agent runtime.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <button
            key={template.title}
            onClick={onCreate}
            className="group rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-gray-300 hover:shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600">
                {template.icon}
              </div>
              <ArrowRight
                size={16}
                className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-gray-800"
              />
            </div>

            <h3 className="text-sm font-semibold">{template.title}</h3>

            <p className="mt-2 text-xs leading-5 text-gray-500">
              {template.description}
            </p>

            <div className="mt-4 text-xs font-medium text-gray-700">
              Use template →
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function PermissionsPanel() {
  return (
    <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <ShieldCheck size={19} className="text-gray-600" />
          <div>
            <h2 className="text-sm font-semibold">Tool Permission Model</h2>
            <p className="mt-1 text-xs text-gray-500">
              Control which agents can invoke each custom tool.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <PermissionRow
            title="Agent-level permissions"
            description="Allow or deny individual agents."
          />
          <PermissionRow
            title="Team-level permissions"
            description="Apply policies across a team or workspace."
          />
          <PermissionRow
            title="Environment restrictions"
            description="Separate development, staging, and production access."
          />
          <PermissionRow
            title="Human approval"
            description="Require approval before sensitive actions."
          />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <Lock size={19} className="text-gray-600" />
          <div>
            <h2 className="text-sm font-semibold">Security Controls</h2>
            <p className="mt-1 text-xs text-gray-500">
              Protect credentials and external actions.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <SecurityRow
            icon={<KeyRound size={15} />}
            title="Secret management"
            value="Managed"
          />
          <SecurityRow
            icon={<ShieldCheck size={15} />}
            title="Input validation"
            value="Enabled"
          />
          <SecurityRow
            icon={<Users size={15} />}
            title="RBAC"
            value="Enabled"
          />
          <SecurityRow
            icon={<Activity size={15} />}
            title="Audit logging"
            value="Enabled"
          />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
        <h2 className="text-sm font-semibold">Runtime Flow</h2>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-5">
          <FlowStep number="01" title="Agent" description="Requests a tool" />
          <FlowStep number="02" title="Policy" description="Checks permissions" />
          <FlowStep number="03" title="Validation" description="Validates inputs" />
          <FlowStep number="04" title="Execution" description="Runs the tool" />
          <FlowStep number="05" title="Trace" description="Records result" />
        </div>
      </div>
    </section>
  );
}

function PermissionRow({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
      <div>
        <div className="text-xs font-medium text-gray-800">{title}</div>
        <div className="mt-1 text-[11px] text-gray-500">{description}</div>
      </div>
      <CheckCircle2 size={17} className="text-emerald-500" />
    </div>
  );
}

function SecurityRow({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
      <div className="flex items-center gap-2 text-xs text-gray-700">
        <span className="text-gray-500">{icon}</span>
        {title}
      </div>
      <span className="text-[11px] font-medium text-emerald-600">{value}</span>
    </div>
  );
}

function FlowStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="text-[10px] font-semibold text-gray-400">{number}</div>
      <div className="mt-2 text-xs font-semibold">{title}</div>
      <div className="mt-1 text-[11px] text-gray-500">{description}</div>
    </div>
  );
}

function ToolDetailModal({
  tool,
  onClose,
  onToggle,
  onTest,
}: {
  tool: CustomTool;
  onClose: () => void;
  onToggle: () => void;
  onTest: () => void;
}) {
  return (
    <ModalShell title={tool.name} onClose={onClose}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusClass[tool.status]}`}
          >
            {tool.status}
          </span>

          <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] text-gray-600">
            {tool.type}
          </span>

          <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] text-gray-600">
            {tool.version}
          </span>
        </div>

        <p className="text-sm leading-6 text-gray-600">{tool.description}</p>

        <div className="grid grid-cols-2 gap-3">
          <DetailItem label="Endpoint" value={tool.endpoint} mono />
          <DetailItem label="Method" value={tool.method} />
          <DetailItem label="Authentication" value={tool.auth} />
          <DetailItem label="Owner" value={tool.owner} />
          <DetailItem
            label="Success Rate"
            value={
              tool.successRate ? `${tool.successRate.toFixed(1)}%` : "Not tested"
            }
          />
          <DetailItem
            label="Latency"
            value={tool.latency ? `${tool.latency} ms` : "Not tested"}
          />
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <ShieldCheck size={15} />
            Runtime security
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-gray-600">
            <div>Input validation: Enabled</div>
            <div>Secrets: Managed</div>
            <div>Audit logging: Enabled</div>
            <div>Permission policy: Applied</div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
          <button
            onClick={onToggle}
            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            {tool.status === "Active" ? "Disable Tool" : "Enable Tool"}
          </button>

          <button
            onClick={onTest}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-black"
          >
            <Play size={14} />
            Test Tool
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function TestToolModal({
  tool,
  onClose,
}: {
  tool: CustomTool;
  onClose: () => void;
}) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  function runTest() {
    setRunning(true);
    setResult(null);

    window.setTimeout(() => {
      setRunning(false);
      setResult(
        tool.status === "Active"
          ? "Tool execution completed successfully."
          : "Tool cannot be executed because it is not active."
      );
    }, 900);
  }

  return (
    <ModalShell title={`Test: ${tool.name}`} onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="text-xs font-medium text-gray-700">Endpoint</div>
          <div className="mt-2 break-all font-mono text-xs text-gray-500">
            {tool.endpoint}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-700">
            Test payload
          </label>

          <textarea
            defaultValue={`{\n  "customerId": "cus_1024"\n}`}
            className="mt-2 h-36 w-full rounded-lg border border-gray-200 bg-white p-3 font-mono text-xs outline-none focus:border-gray-400"
          />
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-xs text-gray-500">
            {result ?? "Run a test request against the configured tool."}
          </div>

          <button
            onClick={runTest}
            disabled={running}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white disabled:opacity-60"
          >
            {running ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play size={14} />
                Run Test
              </>
            )}
          </button>
        </div>

        {result && (
          <div
            className={`rounded-lg border p-4 text-xs ${
              result.includes("successfully")
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {result}
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function CreateToolModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (tool: CustomTool) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ToolType>("REST API");
  const [endpoint, setEndpoint] = useState("");
  const [method, setMethod] = useState("POST");
  const [auth, setAuth] = useState("API Key");

  function createTool() {
    const tool: CustomTool = {
      id: `tool-${Date.now()}`,
      name: name.trim() || "Untitled Custom Tool",
      description:
        description.trim() || "Custom tool created from the ModelNow tool builder.",
      type,
      status: "Draft",
      endpoint: endpoint.trim() || "/api/custom-tool",
      method,
      version: "v1",
      latency: 0,
      successRate: 0,
      calls: 0,
      lastUsed: "Never",
      owner: "Current Workspace",
      auth,
      updated: "Just now",
    };

    onCreate(tool);
  }

  return (
    <ModalShell title="Create Custom Tool" onClose={onClose}>
      <div className="space-y-4">
        <Field label="Tool name">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Customer Lookup"
            className="input-style"
          />
        </Field>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What can this tool do?"
            className="input-style h-24 resize-none"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Tool type">
            <select
              value={type}
              onChange={(event) => setType(event.target.value as ToolType)}
              className="input-style"
            >
              <option>REST API</option>
              <option>MCP</option>
              <option>Database</option>
              <option>Code</option>
              <option>Webhook</option>
            </select>
          </Field>

          <Field label="Method">
            <select
              value={method}
              onChange={(event) => setMethod(event.target.value)}
              className="input-style"
            >
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>PATCH</option>
              <option>DELETE</option>
              <option>QUERY</option>
              <option>EXECUTE</option>
            </select>
          </Field>
        </div>

        <Field label="Endpoint">
          <input
            value={endpoint}
            onChange={(event) => setEndpoint(event.target.value)}
            placeholder="/api/custom-tool"
            className="input-style font-mono"
          />
        </Field>

        <Field label="Authentication">
          <select
            value={auth}
            onChange={(event) => setAuth(event.target.value)}
            className="input-style"
          >
            <option>API Key</option>
            <option>OAuth 2.0</option>
            <option>JWT</option>
            <option>Service Account</option>
            <option>Secret</option>
            <option>None</option>
          </select>
        </Field>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-[11px] leading-5 text-gray-500">
          New tools are created as <strong>Draft</strong>. Configure
          permissions, credentials, schemas, and validation before enabling
          production execution.
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={createTool}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-black"
          >
            <Plus size={14} />
            Create Tool
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 text-xs font-medium text-gray-700">{label}</div>
      {children}
    </label>
  );
}

function DetailItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div className="text-[10px] uppercase tracking-wide text-gray-400">
        {label}
      </div>
      <div
        className={`mt-1 text-xs text-gray-700 ${
          mono ? "break-all font-mono" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
          <h2 className="text-sm font-semibold">{title}</h2>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close"
          >
            <span className="text-[20px] leading-none">×</span>
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}