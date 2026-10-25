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
  GitBranch,
  KeyRound,
  Lock,
  Play,
  Plus,
  RefreshCw,
  Search,
  Server,
  Settings2,
  ShieldCheck,
  Terminal,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

type MCPStatus = "Connected" | "Warning" | "Disconnected";
type MCPTransport = "HTTP" | "SSE" | "STDIO";
type MCPEnvironment = "Production" | "Staging" | "Development";

type MCPServer = {
  id: string;
  name: string;
  description: string;
  status: MCPStatus;
  transport: MCPTransport;
  environment: MCPEnvironment;
  endpoint: string;
  tools: number;
  resources: number;
  prompts: number;
  calls: number;
  successRate: number;
  latency: number;
  owner: string;
  updated: string;
};

const initialServers: MCPServer[] = [
  {
    id: "mcp-001",
    name: "Database MCP",
    description: "Database query and schema tools",
    status: "Connected",
    transport: "HTTP",
    environment: "Production",
    endpoint: "https://mcp.modelnow.ai/database",
    tools: 8,
    resources: 12,
    prompts: 4,
    calls: 18420,
    successRate: 99.8,
    latency: 118,
    owner: "Data Platform",
    updated: "2 min ago",
  },
  {
    id: "mcp-002",
    name: "Browser MCP",
    description: "Browser automation and web interaction tools",
    status: "Connected",
    transport: "SSE",
    environment: "Production",
    endpoint: "https://mcp.modelnow.ai/browser",
    tools: 14,
    resources: 6,
    prompts: 3,
    calls: 12680,
    successRate: 99.2,
    latency: 246,
    owner: "Automation Team",
    updated: "5 min ago",
  },
  {
    id: "mcp-003",
    name: "GitHub MCP",
    description: "Repository, issue and pull request tools",
    status: "Connected",
    transport: "HTTP",
    environment: "Production",
    endpoint: "https://mcp.modelnow.ai/github",
    tools: 21,
    resources: 15,
    prompts: 5,
    calls: 8940,
    successRate: 98.9,
    latency: 164,
    owner: "Developer Platform",
    updated: "11 min ago",
  },
  {
    id: "mcp-004",
    name: "Internal Tools MCP",
    description: "Internal enterprise APIs and actions",
    status: "Warning",
    transport: "HTTP",
    environment: "Staging",
    endpoint: "https://staging-mcp.modelnow.ai/tools",
    tools: 11,
    resources: 8,
    prompts: 2,
    calls: 4680,
    successRate: 96.7,
    latency: 382,
    owner: "Platform Team",
    updated: "24 min ago",
  },
  {
    id: "mcp-005",
    name: "Local Development MCP",
    description: "Local development tools and resources",
    status: "Disconnected",
    transport: "STDIO",
    environment: "Development",
    endpoint: "stdio://local-mcp",
    tools: 6,
    resources: 4,
    prompts: 2,
    calls: 840,
    successRate: 91.2,
    latency: 0,
    owner: "Engineering",
    updated: "2 days ago",
  },
];

const statusStyles: Record<MCPStatus, string> = {
  Connected: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Warning: "border-amber-200 bg-amber-50 text-amber-700",
  Disconnected: "border-red-200 bg-red-50 text-red-700",
};

export default function MCPPage() {
  const [servers, setServers] = useState<MCPServer[]>(initialServers);

  const [tab, setTab] = useState<
    "servers" | "tools" | "resources" | "security"
  >("servers");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"All" | MCPStatus>("All");
  const [transport, setTransport] =
    useState<"All" | MCPTransport>("All");

  const [selectedServer, setSelectedServer] =
    useState<MCPServer | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [showToolTest, setShowToolTest] = useState(false);

  const filteredServers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return servers.filter((server) => {
      const matchesSearch =
        query.length === 0 ||
        server.name.toLowerCase().includes(query) ||
        server.description.toLowerCase().includes(query) ||
        server.endpoint.toLowerCase().includes(query);

      const matchesStatus =
        status === "All" || server.status === status;

      const matchesTransport =
        transport === "All" || server.transport === transport;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesTransport
      );
    });
  }, [servers, search, status, transport]);

  const metrics = useMemo(() => {
    const connected = servers.filter(
      (server) => server.status === "Connected"
    );

    const tools = servers.reduce(
      (sum, server) => sum + server.tools,
      0
    );

    const resources = servers.reduce(
      (sum, server) => sum + server.resources,
      0
    );

    const calls = servers.reduce(
      (sum, server) => sum + server.calls,
      0
    );

    const averageLatency =
      connected.length > 0
        ? Math.round(
            connected.reduce(
              (sum, server) => sum + server.latency,
              0
            ) / connected.length
          )
        : 0;

    return {
      total: servers.length,
      connected: connected.length,
      tools,
      resources,
      calls,
      averageLatency,
    };
  }, [servers]);

  function toggleServer(server: MCPServer) {
    setServers((current) =>
      current.map((item) =>
        item.id === server.id
          ? {
              ...item,
              status:
                item.status === "Connected"
                  ? "Disconnected"
                  : "Connected",
            }
          : item
      )
    );
  }

  function addServer(server: MCPServer) {
    setServers((current) => [server, ...current]);
    setShowCreate(false);
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-gray-900">
      <div className="mx-auto max-w-[1500px] px-6 py-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <Link
                href="/agent-builder/tools"
                className="flex items-center gap-1 hover:text-gray-900"
              >
                <ArrowLeft size={15} />
                Tools & Actions
              </Link>

              <span>/</span>
              <span>MCP</span>
            </div>

            <h1 className="text-[28px] font-semibold tracking-tight">
              MCP
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Connect Model Context Protocol servers to agents and
              expose tools, resources, and prompts through controlled
              enterprise integrations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/agent-builder/tools"
              className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium hover:bg-gray-50"
            >
              Tool Library
            </Link>

            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-black"
            >
              <Plus size={17} />
              Add MCP Server
            </button>
          </div>
        </header>

        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="MCP Servers"
            value={String(metrics.total)}
            description={`${metrics.connected} connected`}
            icon={<Server size={18} />}
          />

          <MetricCard
            title="Available Tools"
            value={String(metrics.tools)}
            description="Tools exposed by servers"
            icon={<Zap size={18} />}
          />

          <MetricCard
            title="Resources"
            value={String(metrics.resources)}
            description="Context resources available"
            icon={<Database size={18} />}
          />

          <MetricCard
            title="Tool Calls"
            value={metrics.calls.toLocaleString()}
            description={`${metrics.averageLatency} ms avg latency`}
            icon={<Activity size={18} />}
          />
        </section>

        <div className="mb-5 flex gap-2 border-b border-gray-200">
          <Tab
            active={tab === "servers"}
            onClick={() => setTab("servers")}
          >
            Servers
          </Tab>

          <Tab
            active={tab === "tools"}
            onClick={() => setTab("tools")}
          >
            Tools
          </Tab>

          <Tab
            active={tab === "resources"}
            onClick={() => setTab("resources")}
          >
            Resources
          </Tab>

          <Tab
            active={tab === "security"}
            onClick={() => setTab("security")}
          >
            Security
          </Tab>
        </div>

        {tab === "servers" && (
          <>
            <section className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-[520px]">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search MCP servers..."
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gray-400 focus:bg-white"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Select
                    value={status}
                    options={[
                      "All",
                      "Connected",
                      "Warning",
                      "Disconnected",
                    ]}
                    onChange={(value) =>
                      setStatus(value as "All" | MCPStatus)
                    }
                  />

                  <Select
                    value={transport}
                    options={["All", "HTTP", "SSE", "STDIO"]}
                    onChange={(value) =>
                      setTransport(value as "All" | MCPTransport)
                    }
                  />
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="text-sm font-semibold">
                  MCP Servers
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {filteredServers.length} servers
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px] text-left">
                  <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-5 py-3 font-medium">
                        Server
                      </th>
                      <th className="px-4 py-3 font-medium">
                        Transport
                      </th>
                      <th className="px-4 py-3 font-medium">
                        Environment
                      </th>
                      <th className="px-4 py-3 font-medium">
                        Status
                      </th>
                      <th className="px-4 py-3 font-medium">
                        Capabilities
                      </th>
                      <th className="px-4 py-3 font-medium">
                        Calls
                      </th>
                      <th className="px-4 py-3 font-medium">
                        Performance
                      </th>
                      <th className="px-5 py-3 font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredServers.map((server) => (
                      <tr
                        key={server.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <button
                            onClick={() =>
                              setSelectedServer(server)
                            }
                            className="flex items-start gap-3 text-left"
                          >
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600">
                              <Server size={17} />
                            </div>

                            <div>
                              <div className="text-sm font-medium hover:underline">
                                {server.name}
                              </div>

                              <div className="mt-1 text-[11px] text-gray-500">
                                {server.description}
                              </div>

                              <div className="mt-1 font-mono text-[10px] text-gray-400">
                                {server.endpoint}
                              </div>
                            </div>
                          </button>
                        </td>

                        <td className="px-4 py-4">
                          <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                            {server.transport}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] text-gray-600">
                            {server.environment}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusStyles[server.status]}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                server.status === "Connected"
                                  ? "bg-emerald-500"
                                  : server.status === "Warning"
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                              }`}
                            />

                            {server.status}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            <Capability
                              label={`${server.tools} tools`}
                              icon={<Zap size={11} />}
                            />

                            <Capability
                              label={`${server.resources} resources`}
                              icon={<Database size={11} />}
                            />

                            <Capability
                              label={`${server.prompts} prompts`}
                              icon={<FileText size={11} />}
                            />
                          </div>
                        </td>

                        <td className="px-4 py-4 text-xs text-gray-600">
                          {server.calls.toLocaleString()}
                        </td>

                        <td className="px-4 py-4">
                          {server.status === "Disconnected" ? (
                            <span className="text-xs text-gray-400">
                              —
                            </span>
                          ) : (
                            <div>
                              <div className="text-xs font-medium">
                                {server.latency} ms
                              </div>

                              <div className="mt-1 text-[10px] text-gray-400">
                                {server.successRate.toFixed(1)}%
                                success
                              </div>
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                setShowToolTest(true)
                              }
                              className="rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50"
                            >
                              Test
                            </button>

                            <button
                              onClick={() =>
                                setSelectedServer(server)
                              }
                              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                            >
                              <ArrowRight size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredServers.length === 0 && (
                  <div className="px-6 py-16 text-center">
                    <Server
                      size={30}
                      className="mx-auto mb-3 text-gray-300"
                    />

                    <h3 className="text-sm font-medium">
                      No MCP servers found
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Try another search or filter.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {tab === "tools" && (
          <ToolsPanel
            servers={servers}
            onTest={() => setShowToolTest(true)}
          />
        )}

        {tab === "resources" && (
          <ResourcesPanel servers={servers} />
        )}

        {tab === "security" && <SecurityPanel />}
      </div>

      {selectedServer && (
        <ServerModal
          server={selectedServer}
          onClose={() => setSelectedServer(null)}
          onToggle={() => {
            toggleServer(selectedServer);

            setSelectedServer((current) =>
              current
                ? {
                    ...current,
                    status:
                      current.status === "Connected"
                        ? "Disconnected"
                        : "Connected",
                  }
                : null
            );
          }}
          onTest={() => {
            setSelectedServer(null);
            setShowToolTest(true);
          }}
        />
      )}

      {showCreate && (
        <CreateServerModal
          onClose={() => setShowCreate(false)}
          onCreate={addServer}
        />
      )}

      {showToolTest && (
        <ToolTestModal
          servers={servers}
          onClose={() => setShowToolTest(false)}
        />
      )}
    </main>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">
          {title}
        </span>

        <span className="text-gray-500">{icon}</span>
      </div>

      <div className="mt-3 text-2xl font-semibold">{value}</div>

      <div className="mt-1 text-[11px] text-gray-400">
        {description}
      </div>
    </div>
  );
}

function Tab({
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
      className={`border-b-2 px-4 py-2.5 text-sm font-medium ${
        active
          ? "border-gray-900 text-gray-900"
          : "border-transparent text-gray-500 hover:text-gray-800"
      }`}
    >
      {children}
    </button>
  );
}

function Select({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-3 pr-9 text-xs font-medium outline-none"
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

function Capability({
  label,
  icon,
}: {
  label: string;
  icon: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] text-gray-600">
      {icon}
      {label}
    </span>
  );
}

function ToolsPanel({
  servers,
  onTest,
}: {
  servers: MCPServer[];
  onTest: () => void;
}) {
  const tools = [
    {
      name: "query_database",
      server: "Database MCP",
      description: "Execute an approved database query.",
      category: "Database",
    },
    {
      name: "search_web",
      server: "Browser MCP",
      description: "Search and retrieve information from the web.",
      category: "Browser",
    },
    {
      name: "create_issue",
      server: "GitHub MCP",
      description: "Create a GitHub issue with controlled permissions.",
      category: "Developer",
    },
    {
      name: "get_repository",
      server: "GitHub MCP",
      description: "Retrieve repository information.",
      category: "Developer",
    },
    {
      name: "navigate",
      server: "Browser MCP",
      description: "Navigate a browser session to a URL.",
      category: "Browser",
    },
    {
      name: "execute_sql",
      server: "Database MCP",
      description: "Run a validated SQL statement.",
      category: "Database",
    },
  ];

  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-sm font-semibold">MCP Tools</h2>

        <p className="mt-1 text-xs text-gray-500">
          Tools exposed by connected MCP servers.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => (
          <div
            key={tool.name}
            className="rounded-xl border border-gray-200 p-4 hover:border-gray-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-600">
                <Terminal size={17} />
              </div>

              <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] text-gray-500">
                {tool.category}
              </span>
            </div>

            <div className="mt-4 font-mono text-xs font-semibold">
              {tool.name}
            </div>

            <p className="mt-2 text-[11px] leading-5 text-gray-500">
              {tool.description}
            </p>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-[10px] text-gray-400">
                {tool.server}
              </span>

              <button
                onClick={onTest}
                className="rounded-md border border-gray-200 px-2.5 py-1.5 text-[11px] font-medium hover:bg-gray-50"
              >
                Test
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 px-5 py-4 text-[11px] text-gray-500">
        {servers.reduce((sum, server) => sum + server.tools, 0)} tools
        are currently registered across {servers.length} MCP servers.
      </div>
    </section>
  );
}

function ResourcesPanel({
  servers,
}: {
  servers: MCPServer[];
}) {
  const resources = [
    {
      name: "database://schema",
      type: "Database Schema",
      server: "Database MCP",
    },
    {
      name: "github://repositories",
      type: "Repository Data",
      server: "GitHub MCP",
    },
    {
      name: "browser://session",
      type: "Browser Session",
      server: "Browser MCP",
    },
    {
      name: "database://customers",
      type: "Customer Dataset",
      server: "Database MCP",
    },
  ];

  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-sm font-semibold">MCP Resources</h2>

        <p className="mt-1 text-xs text-gray-500">
          Context resources available to connected agents.
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {resources.map((resource) => (
          <div
            key={resource.name}
            className="flex items-center justify-between gap-4 px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600">
                <Database size={16} />
              </div>

              <div>
                <div className="font-mono text-xs font-medium">
                  {resource.name}
                </div>

                <div className="mt-1 text-[11px] text-gray-500">
                  {resource.type} · {resource.server}
                </div>
              </div>
            </div>

            <button className="rounded-md border border-gray-200 px-3 py-1.5 text-[11px] font-medium hover:bg-gray-50">
              Inspect
            </button>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 px-5 py-4 text-[11px] text-gray-500">
        {servers.reduce((sum, server) => sum + server.resources, 0)}{" "}
        total resources registered.
      </div>
    </section>
  );
}

function SecurityPanel() {
  return (
    <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <SecurityCard
        icon={<ShieldCheck size={19} />}
        title="Tool Permissions"
        description="Control which agents can invoke MCP tools."
        status="Enabled"
      />

      <SecurityCard
        icon={<KeyRound size={19} />}
        title="Credential Management"
        description="Keep MCP credentials outside application code."
        status="Managed"
      />

      <SecurityCard
        icon={<Lock size={19} />}
        title="Transport Security"
        description="Protect MCP communication using approved transports."
        status="Protected"
      />

      <SecurityCard
        icon={<Activity size={19} />}
        title="Audit Logging"
        description="Track MCP calls, users, agents and results."
        status="Enabled"
      />

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
        <div className="mb-5 flex items-center gap-3">
          <GitBranch size={19} className="text-gray-600" />

          <div>
            <h2 className="text-sm font-semibold">
              MCP Security Flow
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Every MCP tool call should pass through authorization,
              validation and audit layers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <FlowCard
            number="01"
            title="Agent"
            description="Agent requests MCP tool."
          />

          <FlowCard
            number="02"
            title="Policy"
            description="Permission policy is evaluated."
          />

          <FlowCard
            number="03"
            title="Validation"
            description="Arguments are validated."
          />

          <FlowCard
            number="04"
            title="MCP Server"
            description="Tool executes securely."
          />

          <FlowCard
            number="05"
            title="Audit"
            description="Execution is recorded."
          />
        </div>
      </div>
    </section>
  );
}

function SecurityCard({
  icon,
  title,
  description,
  status,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  status: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-gray-600">
          {icon}
        </div>

        <CheckCircle2 size={18} className="text-emerald-500" />
      </div>

      <h3 className="mt-4 text-sm font-semibold">{title}</h3>

      <p className="mt-1 text-xs leading-5 text-gray-500">
        {description}
      </p>

      <div className="mt-4 text-[11px] font-medium text-emerald-600">
        {status}
      </div>
    </div>
  );
}

function FlowCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="text-[10px] font-semibold text-gray-400">
        {number}
      </div>

      <div className="mt-2 text-xs font-semibold">{title}</div>

      <p className="mt-1 text-[11px] leading-5 text-gray-500">
        {description}
      </p>
    </div>
  );
}

function ServerModal({
  server,
  onClose,
  onToggle,
  onTest,
}: {
  server: MCPServer;
  onClose: () => void;
  onToggle: () => void;
  onTest: () => void;
}) {
  return (
    <Modal title={server.name} onClose={onClose}>
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusStyles[server.status]}`}
          >
            {server.status}
          </span>

          <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px]">
            {server.transport}
          </span>

          <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px]">
            {server.environment}
          </span>
        </div>

        <p className="text-xs leading-5 text-gray-500">
          {server.description}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Detail label="Endpoint" value={server.endpoint} />
          <Detail label="Owner" value={server.owner} />
          <Detail label="Tools" value={String(server.tools)} />
          <Detail
            label="Resources"
            value={String(server.resources)}
          />
          <Detail label="Prompts" value={String(server.prompts)} />
          <Detail
            label="Calls"
            value={server.calls.toLocaleString()}
          />
          <Detail
            label="Success Rate"
            value={`${server.successRate.toFixed(1)}%`}
          />
          <Detail
            label="Latency"
            value={
              server.latency > 0
                ? `${server.latency} ms`
                : "Unavailable"
            }
          />
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <ShieldCheck size={15} />
            MCP Security
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] text-gray-600">
            <div>Authentication: Enabled</div>
            <div>Authorization: RBAC</div>
            <div>Tool validation: Enabled</div>
            <div>Audit logging: Enabled</div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
          <button
            onClick={onToggle}
            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium hover:bg-gray-50"
          >
            {server.status === "Connected"
              ? "Disconnect"
              : "Connect"}
          </button>

          <button
            onClick={onTest}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-black"
          >
            <Play size={14} />
            Test Server
          </button>
        </div>
      </div>
    </Modal>
  );
}

function CreateServerModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (server: MCPServer) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [transport, setTransport] =
    useState<MCPTransport>("HTTP");
  const [environment, setEnvironment] =
    useState<MCPEnvironment>("Development");
  const [endpoint, setEndpoint] = useState("");

  function submit() {
    onCreate({
      id: `mcp-${Date.now()}`,
      name: name || "New MCP Server",
      description:
        description || "Custom Model Context Protocol server",
      status: "Disconnected",
      transport,
      environment,
      endpoint:
        endpoint ||
        (transport === "STDIO"
          ? "stdio://local-mcp"
          : "https://mcp.example.com"),
      tools: 0,
      resources: 0,
      prompts: 0,
      calls: 0,
      successRate: 0,
      latency: 0,
      owner: "Current Workspace",
      updated: "Just now",
    });
  }

  return (
    <Modal title="Add MCP Server" onClose={onClose}>
      <div className="space-y-4">
        <Field label="Server name">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Customer Support MCP"
            className="field"
          />
        </Field>

        <Field label="Description">
          <input
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Tools for customer support workflows"
            className="field"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Transport">
            <select
              value={transport}
              onChange={(event) =>
                setTransport(
                  event.target.value as MCPTransport
                )
              }
              className="field"
            >
              <option>HTTP</option>
              <option>SSE</option>
              <option>STDIO</option>
            </select>
          </Field>

          <Field label="Environment">
            <select
              value={environment}
              onChange={(event) =>
                setEnvironment(
                  event.target.value as MCPEnvironment
                )
              }
              className="field"
            >
              <option>Production</option>
              <option>Staging</option>
              <option>Development</option>
            </select>
          </Field>
        </div>

        <Field label="Endpoint">
          <input
            value={endpoint}
            onChange={(event) =>
              setEndpoint(event.target.value)
            }
            placeholder="https://mcp.example.com"
            className="field font-mono"
          />
        </Field>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-[11px] leading-5 text-gray-500">
          MCP credentials, authentication keys and runtime secrets
          should be connected through the platform secret manager
          rather than stored directly in frontend code.
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-black"
          >
            <Plus size={14} />
            Add MCP Server
          </button>
        </div>
      </div>
    </Modal>
  );
}

function ToolTestModal({
  servers,
  onClose,
}: {
  servers: MCPServer[];
  onClose: () => void;
}) {
  const [server, setServer] = useState(
    servers[0]?.name ?? "Database MCP"
  );

  const [tool, setTool] = useState("query_database");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState("");

  function runTest() {
    setRunning(true);
    setResult("");

    window.setTimeout(() => {
      setRunning(false);
      setResult(
        "Tool executed successfully. MCP request completed in 124 ms."
      );
    }, 900);
  }

  return (
    <Modal title="Test MCP Tool" onClose={onClose}>
      <div className="space-y-4">
        <Field label="MCP Server">
          <select
            value={server}
            onChange={(event) => setServer(event.target.value)}
            className="field"
          >
            {servers.map((item) => (
              <option key={item.id}>{item.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Tool">
          <select
            value={tool}
            onChange={(event) => setTool(event.target.value)}
            className="field"
          >
            <option>query_database</option>
            <option>search_web</option>
            <option>get_repository</option>
            <option>create_issue</option>
            <option>navigate</option>
            <option>execute_sql</option>
          </select>
        </Field>

        <Field label="Arguments">
          <textarea
            defaultValue={`{
  "query": "SELECT * FROM customers LIMIT 10"
}`}
            className="h-32 w-full rounded-lg border border-gray-200 bg-gray-900 p-4 font-mono text-xs text-white outline-none"
          />
        </Field>

        {result && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
            {result}
          </div>
        )}

        <div className="flex justify-end border-t border-gray-200 pt-4">
          <button
            onClick={runTest}
            disabled={running}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white disabled:opacity-60"
          >
            {running ? (
              <>
                <RefreshCw
                  size={14}
                  className="animate-spin"
                />
                Running...
              </>
            ) : (
              <>
                <Play size={14} />
                Run Tool
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
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
      <div className="mb-1.5 text-xs font-medium text-gray-700">
        {label}
      </div>

      {children}
    </label>
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
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div className="text-[10px] uppercase tracking-wide text-gray-400">
        {label}
      </div>

      <div className="mt-1 break-all text-xs text-gray-700">
        {value}
      </div>
    </div>
  );
}

function Modal({
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
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
          <h2 className="text-sm font-semibold">{title}</h2>

          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <span className="text-[20px] leading-none">×</span>
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}