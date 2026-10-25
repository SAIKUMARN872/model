"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  DollarSign,
  FileText,
  GitBranch,
  Layers,
  Play,
  RefreshCw,
  Search,
  Server,
  Settings2,
  ShieldCheck,
  Terminal,
  TestTube2,
  XCircle,
  Zap,
} from "lucide-react";

type ToolStatus = "Healthy" | "Degraded" | "Offline";

type Tool = {
  id: string;
  name: string;
  description: string;
  category: string;
  status: ToolStatus;
  usage: number;
  latency: number;
  successRate: number;
  owner: string;
  updated: string;
  href: string;
};

const initialTools: Tool[] = [
  {
    id: "browser",
    name: "Browser Automation",
    description: "Automate websites, navigation, forms and browser actions.",
    category: "Automation",
    status: "Healthy",
    usage: 12840,
    latency: 620,
    successRate: 98.7,
    owner: "Automation",
    updated: "5 min ago",
    href: "/agent-builder/tools/browser-automation",
  },
  {
    id: "computer",
    name: "Computer Use",
    description: "Allow agents to interact with desktop applications.",
    category: "Automation",
    status: "Healthy",
    usage: 8420,
    latency: 780,
    successRate: 97.9,
    owner: "AI Platform",
    updated: "11 min ago",
    href: "/agent-builder/tools/computer-use",
  },
  {
    id: "code",
    name: "Code Execution",
    description: "Execute isolated code for calculations and data processing.",
    category: "Execution",
    status: "Healthy",
    usage: 18240,
    latency: 310,
    successRate: 99.2,
    owner: "Developer Platform",
    updated: "3 min ago",
    href: "/agent-builder/tools/code-execution",
  },
  {
    id: "mcp",
    name: "MCP",
    description: "Connect Model Context Protocol servers, tools and resources.",
    category: "Integrations",
    status: "Healthy",
    usage: 22640,
    latency: 245,
    successRate: 99.5,
    owner: "Platform Team",
    updated: "2 min ago",
    href: "/agent-builder/tools/mcp",
  },
  {
    id: "rest",
    name: "REST APIs",
    description: "Connect agents to external REST APIs and services.",
    category: "Integrations",
    status: "Healthy",
    usage: 38450,
    latency: 184,
    successRate: 99.8,
    owner: "Integration Team",
    updated: "8 min ago",
    href: "/agent-builder/tools/rest-api",
  },
  {
    id: "database",
    name: "Database",
    description: "Connect agents to databases and execute controlled queries.",
    category: "Data",
    status: "Degraded",
    usage: 14780,
    latency: 428,
    successRate: 97.4,
    owner: "Data Platform",
    updated: "17 min ago",
    href: "/agent-builder/tools/database",
  },
  {
    id: "custom",
    name: "Custom Tools",
    description: "Create reusable tools for custom business operations.",
    category: "Integrations",
    status: "Healthy",
    usage: 9640,
    latency: 290,
    successRate: 98.9,
    owner: "Developer Platform",
    updated: "13 min ago",
    href: "/agent-builder/tools/custom-tools",
  },
];

const statusStyles: Record<ToolStatus, string> = {
  Healthy: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Degraded: "border-amber-200 bg-amber-50 text-amber-700",
  Offline: "border-red-200 bg-red-50 text-red-700",
};

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>(initialTools);

  const [activeTab, setActiveTab] = useState<
    "Overview" | "Tool Catalog" | "Runtime"
  >("Overview");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Status");
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  const filteredTools = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tools.filter((tool) => {
      const matchesSearch =
        query.length === 0 ||
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.owner.toLowerCase().includes(query);

      const matchesCategory =
        category === "All Categories" ||
        tool.category === category;

      const matchesStatus =
        status === "All Status" || tool.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [tools, search, category, status]);

  const totalUsage = tools.reduce((sum, tool) => sum + tool.usage, 0);

  const averageLatency =
    tools.length > 0
      ? Math.round(
          tools.reduce((sum, tool) => sum + tool.latency, 0) /
            tools.length
        )
      : 0;

  const healthyTools = tools.filter(
    (tool) => tool.status === "Healthy"
  ).length;

  const degradedTools = tools.filter(
    (tool) => tool.status === "Degraded"
  ).length;

  const refreshTools = () => {
    setTools((current) =>
      current.map((tool) => ({
        ...tool,
        updated: "Just now",
      }))
    );
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                <Link
                  href="/agent-builder"
                  className="hover:text-slate-900"
                >
                  Agent Builder
                </Link>

                <span>/</span>

                <span className="text-slate-900">
                  Tools & Actions
                </span>
              </div>

              <h1 className="text-2xl font-semibold tracking-tight">
                Tools & Actions
              </h1>

              <p className="mt-1 max-w-3xl text-sm text-slate-500">
                Connect agents to APIs, databases, browsers, code
                execution, MCP servers and custom business tools.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={refreshTools}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
              >
                <RefreshCw size={16} />
                Refresh
              </button>

              <Link
                href="/agent-builder/tools/custom-tools"
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                <Zap size={16} />
                Create Tool
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-6 py-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Available tools"
            value={String(tools.length)}
            subtitle={`${healthyTools} healthy integrations`}
            icon={<Server size={18} />}
          />

          <MetricCard
            title="Tool executions"
            value={formatNumber(totalUsage)}
            subtitle="Current tracked usage"
            icon={<Activity size={18} />}
          />

          <MetricCard
            title="Average latency"
            value={`${averageLatency} ms`}
            subtitle="Across active tools"
            icon={<Clock3 size={18} />}
          />

          <MetricCard
            title="Needs attention"
            value={String(degradedTools)}
            subtitle="Degraded integrations"
            icon={<AlertTriangle size={18} />}
          />
        </div>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5">
            <div className="flex flex-wrap gap-7">
              <Tab
                label="Overview"
                active={activeTab === "Overview"}
                onClick={() => setActiveTab("Overview")}
              />

              <Tab
                label="Tool Catalog"
                active={activeTab === "Tool Catalog"}
                onClick={() => setActiveTab("Tool Catalog")}
              />

              <Tab
                label="Runtime"
                active={activeTab === "Runtime"}
                onClick={() => setActiveTab("Runtime")}
              />
            </div>
          </div>

          {activeTab === "Overview" && (
            <Overview
              tools={tools}
              onSelect={setSelectedTool}
            />
          )}

          {activeTab === "Tool Catalog" && (
            <ToolCatalog
              tools={filteredTools}
              search={search}
              category={category}
              status={status}
              onSearch={setSearch}
              onCategory={setCategory}
              onStatus={setStatus}
              onSelect={setSelectedTool}
            />
          )}

          {activeTab === "Runtime" && <Runtime />}
        </section>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <InfoCard
            icon={<GitBranch size={18} />}
            title="Workflow orchestration"
            description="Use tools inside conditions, loops, parallel steps and multi-agent workflows."
            href="/agent-builder/workflow"
          />

          <InfoCard
            icon={<ShieldCheck size={18} />}
            title="Tool policies"
            description="Control which agents can use which tools and enforce runtime policies."
            href="/agent-builder/security/tool-policies"
          />

          <InfoCard
            icon={<BarChart3 size={18} />}
            title="Observability"
            description="Monitor executions, latency, cost, failures and tool traces."
            href="/agent-builder/observability"
          />
        </div>
      </div>

      {selectedTool && (
        <ToolDetailModal
          tool={selectedTool}
          onClose={() => setSelectedTool(null)}
        />
      )}
    </main>
  );
}

function Overview({
  tools,
  onSelect,
}: {
  tools: Tool[];
  onSelect: (tool: Tool) => void;
}) {
  return (
    <div className="p-5">
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <QuickTool
          icon={<GitBranch size={20} />}
          title="MCP"
          description="Connect MCP servers and expose tools and resources."
          href="/agent-builder/tools/mcp"
        />

        <QuickTool
          icon={<Terminal size={20} />}
          title="Code Execution"
          description="Run isolated code for calculations and processing."
          href="/agent-builder/tools/code-execution"
        />

        <QuickTool
          icon={<Database size={20} />}
          title="Database"
          description="Connect controlled database operations to agents."
          href="/agent-builder/tools/database"
        />

        <QuickTool
          icon={<Layers size={20} />}
          title="REST APIs"
          description="Call external REST APIs from workflows."
          href="/agent-builder/tools/rest-api"
        />
      </div>

      <div className="mt-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">
              Tool health
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current health and execution performance of connected
              tools.
            </p>
          </div>

          <Link
            href="/agent-builder/observability"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-950"
          >
            View observability
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid gap-3">
          {tools.map((tool) => (
            <button
              type="button"
              key={tool.id}
              onClick={() => onSelect(tool)}
              className="flex w-full flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 text-left hover:border-slate-300 hover:bg-slate-50"
            >
              <div className="flex min-w-0 items-center gap-3">
                <ToolIcon name={tool.name} />

                <div className="min-w-0">
                  <div className="font-medium">{tool.name}</div>

                  <div className="mt-1 truncate text-xs text-slate-500">
                    {tool.description}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <MiniStat
                  label="Usage"
                  value={formatNumber(tool.usage)}
                />

                <MiniStat
                  label="Latency"
                  value={`${tool.latency} ms`}
                />

                <StatusBadge status={tool.status} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ToolCatalog({
  tools,
  search,
  category,
  status,
  onSearch,
  onCategory,
  onStatus,
  onSelect,
}: {
  tools: Tool[];
  search: string;
  category: string;
  status: string;
  onSearch: (value: string) => void;
  onCategory: (value: string) => void;
  onStatus: (value: string) => void;
  onSelect: (tool: Tool) => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-3 border-b border-slate-100 p-5">
        <div className="relative min-w-[280px] flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search tools..."
            className="w-full rounded-lg border border-slate-200 px-9 py-2.5 text-sm outline-none focus:border-slate-400"
          />
        </div>

        <Select
          value={category}
          onChange={onCategory}
          options={[
            "All Categories",
            "Automation",
            "Execution",
            "Integrations",
            "Data",
          ]}
        />

        <Select
          value={status}
          onChange={onStatus}
          options={[
            "All Status",
            "Healthy",
            "Degraded",
            "Offline",
          ]}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Tool</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Executions</th>
              <th className="px-5 py-3">Latency</th>
              <th className="px-5 py-3">Success</th>
              <th className="px-5 py-3">Owner</th>
              <th className="px-5 py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {tools.map((tool) => (
              <tr
                key={tool.id}
                className="border-b border-slate-100 hover:bg-slate-50/60"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <ToolIcon name={tool.name} />

                    <div>
                      <div className="font-medium">{tool.name}</div>

                      <div className="mt-1 max-w-[320px] truncate text-xs text-slate-500">
                        {tool.description}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4 text-sm text-slate-600">
                  {tool.category}
                </td>

                <td className="px-5 py-4">
                  <StatusBadge status={tool.status} />
                </td>

                <td className="px-5 py-4 text-sm font-medium">
                  {formatNumber(tool.usage)}
                </td>

                <td className="px-5 py-4 text-sm text-slate-600">
                  {tool.latency} ms
                </td>

                <td className="px-5 py-4 text-sm font-medium">
                  {tool.successRate}%
                </td>

                <td className="px-5 py-4 text-sm text-slate-600">
                  {tool.owner}
                </td>

                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => onSelect(tool)}
                    className="inline-flex items-center gap-1 text-sm font-medium hover:text-slate-600"
                  >
                    Details
                    <ArrowRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tools.length === 0 && (
          <div className="p-12 text-center">
            <Server
              size={34}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-medium">
              No tools found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Runtime() {
  const runtimeRows = [
    ["Active executions", "42", "Normal"],
    ["Queued executions", "7", "Normal"],
    ["Failed executions", "2", "Attention"],
    ["Average tool latency", "384 ms", "Normal"],
    ["Rate-limit events", "3", "Attention"],
    ["Policy blocks", "8", "Protected"],
  ];

  return (
    <div className="p-5">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">
          Tool Runtime
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Live runtime signals for agent tool execution.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2">
            <Activity size={18} />
            <h3 className="font-semibold">
              Runtime health
            </h3>
          </div>

          <div className="mt-5 space-y-4">
            {runtimeRows.map(([label, value, state]) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0"
              >
                <span className="text-sm text-slate-500">
                  {label}
                </span>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">
                    {value}
                  </span>

                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                      state === "Attention"
                        ? "bg-amber-50 text-amber-700"
                        : state === "Protected"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {state}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} />
            <h3 className="font-semibold">
              Execution pipeline
            </h3>
          </div>

          <div className="mt-5 space-y-3">
            <PipelineStep
              number="01"
              title="Tool selection"
              description="Agent selects an allowed tool."
              icon={<Bot size={16} />}
            />

            <PipelineStep
              number="02"
              title="Policy validation"
              description="Permissions and security policies are checked."
              icon={<ShieldCheck size={16} />}
            />

            <PipelineStep
              number="03"
              title="Execution"
              description="Tool executes with runtime limits."
              icon={<Play size={16} />}
            />

            <PipelineStep
              number="04"
              title="Trace & response"
              description="Result is logged and returned to the agent."
              icon={<FileText size={16} />}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <RuntimeCard
          icon={<DollarSign size={18} />}
          title="Cost controls"
          value="Enabled"
          description="Execution budgets and usage monitoring are active."
        />

        <RuntimeCard
          icon={<Settings2 size={18} />}
          title="Timeout policy"
          value="30 seconds"
          description="Long-running tool calls are automatically terminated."
        />

        <RuntimeCard
          icon={<TestTube2 size={18} />}
          title="Evaluation"
          value="Continuous"
          description="Tool execution quality is continuously monitored."
        />
      </div>
    </div>
  );
}

function PipelineStep({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-slate-200 p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
        {icon}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-slate-400">
            {number}
          </span>

          <span className="text-sm font-medium">
            {title}
          </span>
        </div>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function RuntimeCard({
  icon,
  title,
  value,
  description,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 text-slate-700">
        {icon}
        <span className="text-sm font-medium">
          {title}
        </span>
      </div>

      <div className="mt-3 text-lg font-semibold">
        {value}
      </div>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function QuickTool({
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
      className="rounded-xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          {icon}
        </div>

        <ArrowRight
          size={16}
          className="text-slate-400"
        />
      </div>

      <h3 className="mt-4 font-semibold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </Link>
  );
}

function ToolIcon({ name }: { name: string }) {
  if (name === "Browser Automation") {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        <Server size={18} />
      </div>
    );
  }

  if (name === "Computer Use") {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
        <Layers size={18} />
      </div>
    );
  }

  if (name === "Code Execution") {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
        <Terminal size={18} />
      </div>
    );
  }

  if (name === "MCP") {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
        <GitBranch size={18} />
      </div>
    );
  }

  if (name === "REST APIs") {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
        <Zap size={18} />
      </div>
    );
  }

  if (name === "Database") {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
        <Database size={18} />
      </div>
    );
  }

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
      <Settings2 size={18} />
    </div>
  );
}

function StatusBadge({ status }: { status: ToolStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}
    >
      {status === "Healthy" && (
        <CheckCircle2 size={13} />
      )}

      {status === "Degraded" && (
        <Activity size={13} />
      )}

      {status === "Offline" && (
        <XCircle size={13} />
      )}

      {status}
    </span>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="hidden text-right sm:block">
      <div className="text-[10px] uppercase tracking-wide text-slate-400">
        {label}
      </div>

      <div className="mt-1 text-xs font-semibold text-slate-700">
        {value}
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

        <ArrowRight
          size={16}
          className="text-slate-400"
        />
      </div>

      <h3 className="mt-4 font-semibold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </Link>
  );
}

function ToolDetailModal({
  tool,
  onClose,
}: {
  tool: Tool;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <ToolIcon name={tool.name} />

            <div>
              <h2 className="font-semibold">
                {tool.name}
              </h2>

              <p className="text-xs text-slate-500">
                {tool.category}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <span className="text-xl leading-none">
              ×
            </span>
          </button>
        </div>

        <div className="space-y-5 p-5">
          <p className="text-sm leading-6 text-slate-600">
            {tool.description}
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Detail
              label="Status"
              value={tool.status}
            />

            <Detail
              label="Executions"
              value={formatNumber(tool.usage)}
            />

            <Detail
              label="Latency"
              value={`${tool.latency} ms`}
            />

            <Detail
              label="Success rate"
              value={`${tool.successRate}%`}
            />
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={17} />
              <span className="font-medium">
                Runtime protection
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <SecurityRow
                label="Permission policy"
                value="Active"
              />

              <SecurityRow
                label="Execution timeout"
                value="30 seconds"
              />

              <SecurityRow
                label="Audit logging"
                value="Enabled"
              />

              <SecurityRow
                label="Response validation"
                value="Enabled"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Link
              href={tool.href}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium"
            >
              Open Tool
              <ArrowRight size={15} />
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-sm font-medium text-emerald-700">
        {value}
      </span>
    </div>
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
        <div className="text-sm text-slate-500">
          {title}
        </div>

        <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
          {icon}
        </div>
      </div>

      <div className="mt-3 text-2xl font-semibold">
        {value}
      </div>

      <div className="mt-1 text-xs text-slate-500">
        {subtitle}
      </div>
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
      type="button"
      onClick={onClick}
      className={`border-b-2 px-1 py-4 text-sm font-medium ${
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
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-3 pr-9 text-sm outline-none focus:border-slate-400"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
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
      <div className="text-xs text-slate-500">
        {label}
      </div>

      <div className="mt-1 text-sm font-semibold">
        {value}
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