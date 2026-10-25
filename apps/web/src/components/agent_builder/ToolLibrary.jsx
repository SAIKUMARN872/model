"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  Database,
  FileText,
  GitBranch,
  Layers,
  Lock,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Terminal,
  Users,
  Zap,
} from "lucide-react";

const toolGroups = [
  {
    id: "apis",
    name: "APIs & Integrations",
    description: "Connect agents to external services and internal systems.",
    icon: Settings2,
    tools: [
      {
        id: "rest-api",
        name: "REST API",
        description: "Call external REST endpoints.",
        category: "API",
        icon: Settings2,
        status: "Available",
      },
      {
        id: "webhook",
        name: "Webhook",
        description: "Send or receive webhook events.",
        category: "Integration",
        icon: Zap,
        status: "Available",
      },
      {
        id: "http-request",
        name: "HTTP Request",
        description: "Execute custom HTTP requests.",
        category: "API",
        icon: Activity,
        status: "Available",
      },
      {
        id: "internal-api",
        name: "Internal API",
        description: "Connect to internal application services.",
        category: "Integration",
        icon: GitBranch,
        status: "Available",
      },
    ],
  },
  {
    id: "data",
    name: "Data & Databases",
    description: "Read, query, transform, and store application data.",
    icon: Database,
    tools: [
      {
        id: "database-query",
        name: "Database Query",
        description: "Run approved database queries.",
        category: "Database",
        icon: Database,
        status: "Available",
      },
      {
        id: "data-transform",
        name: "Data Transform",
        description: "Transform structured data between workflow steps.",
        category: "Data",
        icon: Layers,
        status: "Available",
      },
      {
        id: "file-storage",
        name: "File Storage",
        description: "Read and write files to connected storage.",
        category: "Storage",
        icon: FileText,
        status: "Available",
      },
      {
        id: "cache",
        name: "Cache",
        description: "Read and write temporary application state.",
        category: "Data",
        icon: Database,
        status: "Available",
      },
    ],
  },
  {
    id: "code",
    name: "Code & Runtime",
    description: "Execute controlled code and runtime operations.",
    icon: Terminal,
    tools: [
      {
        id: "code-execution",
        name: "Code Execution",
        description: "Run sandboxed code.",
        category: "Runtime",
        icon: Terminal,
        status: "Available",
      },
      {
        id: "shell",
        name: "Shell Command",
        description: "Run approved terminal commands.",
        category: "Runtime",
        icon: Terminal,
        status: "Restricted",
      },
      {
        id: "python",
        name: "Python Runtime",
        description: "Execute Python data and automation tasks.",
        category: "Runtime",
        icon: Terminal,
        status: "Available",
      },
      {
        id: "script",
        name: "Custom Script",
        description: "Run reusable platform scripts.",
        category: "Runtime",
        icon: Settings2,
        status: "Available",
      },
    ],
  },
  {
    id: "knowledge",
    name: "Knowledge & Retrieval",
    description: "Give agents access to enterprise knowledge.",
    icon: FileText,
    tools: [
      {
        id: "rag-search",
        name: "RAG Search",
        description: "Retrieve relevant knowledge from indexed sources.",
        category: "RAG",
        icon: Search,
        status: "Available",
      },
      {
        id: "document-search",
        name: "Document Search",
        description: "Search connected enterprise documents.",
        category: "Knowledge",
        icon: FileText,
        status: "Available",
      },
      {
        id: "memory-read",
        name: "Memory Read",
        description: "Read information from agent memory.",
        category: "Memory",
        icon: Layers,
        status: "Available",
      },
      {
        id: "memory-write",
        name: "Memory Write",
        description: "Store approved information in agent memory.",
        category: "Memory",
        icon: Database,
        status: "Available",
      },
    ],
  },
  {
    id: "agents",
    name: "Agent Tools",
    description: "Coordinate and delegate work to other agents.",
    icon: Bot,
    tools: [
      {
        id: "delegate-agent",
        name: "Delegate Agent",
        description: "Assign a task to a specialized sub-agent.",
        category: "Agent",
        icon: Bot,
        status: "Available",
      },
      {
        id: "multi-agent",
        name: "Multi-Agent",
        description: "Coordinate multiple agents in one workflow.",
        category: "Agent",
        icon: Users,
        status: "Available",
      },
      {
        id: "agent-review",
        name: "Agent Review",
        description: "Send output to a review agent.",
        category: "Agent",
        icon: ShieldCheck,
        status: "Available",
      },
    ],
  },
  {
    id: "security",
    name: "Security & Governance",
    description: "Protect tool usage with security policies.",
    icon: ShieldCheck,
    tools: [
      {
        id: "approval",
        name: "Human Approval",
        description: "Require human approval before execution.",
        category: "Governance",
        icon: Users,
        status: "Available",
      },
      {
        id: "permission-check",
        name: "Permission Check",
        description: "Validate access before tool execution.",
        category: "Security",
        icon: Lock,
        status: "Available",
      },
      {
        id: "audit-event",
        name: "Audit Event",
        description: "Record an auditable security event.",
        category: "Governance",
        icon: FileText,
        status: "Available",
      },
    ],
  },
];

const popularTools = [
  {
    id: "popular-rag",
    name: "RAG Search",
    description: "Retrieve enterprise knowledge.",
    category: "RAG",
    icon: Search,
    status: "Available",
  },
  {
    id: "popular-api",
    name: "REST API",
    description: "Call external services.",
    category: "API",
    icon: Settings2,
    status: "Available",
  },
  {
    id: "popular-db",
    name: "Database Query",
    description: "Query approved databases.",
    category: "Database",
    icon: Database,
    status: "Available",
  },
  {
    id: "popular-agent",
    name: "Delegate Agent",
    description: "Delegate work to another agent.",
    category: "Agent",
    icon: Bot,
    status: "Available",
  },
  {
    id: "popular-code",
    name: "Code Execution",
    description: "Run sandboxed code.",
    category: "Runtime",
    icon: Terminal,
    status: "Available",
  },
  {
    id: "popular-approval",
    name: "Human Approval",
    description: "Pause for manual approval.",
    category: "Governance",
    icon: Users,
    status: "Available",
  },
];

function StatusBadge({ status }) {
  const styles = {
    Available: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Restricted: "border-amber-200 bg-amber-50 text-amber-700",
    Disabled: "border-slate-200 bg-slate-50 text-slate-500",
  };

  return (
    <span
      className={`rounded-full border px-2 py-1 text-[10px] font-medium ${
        styles[status] ||
        "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

function ToolItem({ tool, onAdd }) {
  const Icon = tool.icon;

  return (
    <button
      type="button"
      draggable
      onClick={() => onAdd(tool)}
      onDragStart={(event) => {
        event.dataTransfer.setData(
          "application/x-modelnow-tool",
          JSON.stringify({
            id: tool.id,
            name: tool.name,
            category: tool.category,
          }),
        );
      }}
      className="group w-full rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-slate-400 hover:shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-slate-900">
          <Icon
            size={17}
            className="text-slate-700 group-hover:text-white"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-semibold text-slate-900">
              {tool.name}
            </span>

            <Plus
              size={14}
              className="shrink-0 text-slate-400 group-hover:text-slate-900"
            />
          </div>

          <p className="mt-1 text-[11px] leading-5 text-slate-500">
            {tool.description}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <StatusBadge status={tool.status} />

            <span className="text-[10px] text-slate-400">
              {tool.category}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function GroupHeader({ group, open, onToggle }) {
  const Icon = group.icon;

  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-slate-50"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
        <Icon size={16} className="text-slate-700" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-slate-900">
          {group.name}
        </div>

        <div className="mt-0.5 truncate text-[10px] text-slate-500">
          {group.description}
        </div>
      </div>

      <ChevronDown
        size={15}
        className={`shrink-0 text-slate-400 transition ${
          open ? "rotate-180" : ""
        }`}
      />
    </button>
  );
}

export default function ToolLibrary({
  onAddTool,
  initialCategory = "All",
}) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState(initialCategory);
  const [openGroups, setOpenGroups] = useState(
    Object.fromEntries(
      toolGroups.map((group) => [group.id, true]),
    ),
  );
  const [recentTools, setRecentTools] = useState([]);
  const [showPopular, setShowPopular] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const categories = useMemo(() => {
    return [
      "All",
      ...toolGroups.map((group) => group.name),
    ];
  }, []);

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();

    return toolGroups
      .map((group) => {
        const categoryMatches =
          selectedCategory === "All" ||
          selectedCategory === group.name;

        if (!categoryMatches) {
          return {
            ...group,
            tools: [],
          };
        }

        const tools = group.tools.filter((tool) => {
          if (!query) return true;

          return (
            tool.name.toLowerCase().includes(query) ||
            tool.description.toLowerCase().includes(query) ||
            tool.category.toLowerCase().includes(query)
          );
        });

        return {
          ...group,
          tools,
        };
      })
      .filter((group) => group.tools.length > 0);
  }, [search, selectedCategory]);

  const handleAddTool = (tool) => {
    setRecentTools((current) => {
      const next = [
        tool,
        ...current.filter((item) => item.id !== tool.id),
      ];

      return next.slice(0, 5);
    });

    if (typeof onAddTool === "function") {
      onAddTool(tool);
    }
  };

  const toggleGroup = (id) => {
    setOpenGroups((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

  return (
    <aside className="flex h-full min-h-[700px] w-full flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Tool Library
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Add tools to give your agents real capabilities.
            </p>
          </div>

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
            <Settings2
              size={16}
              className="text-white"
            />
          </div>
        </div>

        <div className="relative mt-4">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search tools..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
          />
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[11px] font-medium ${
                selectedCategory === category
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {recentTools.length > 0 && !search && (
          <section className="mb-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Recent
              </h3>

              <button
                type="button"
                onClick={() => setRecentTools([])}
                className="text-[10px] font-medium text-slate-400 hover:text-slate-700"
              >
                Clear
              </button>
            </div>

            <div className="space-y-2">
              {recentTools.map((tool) => (
                <ToolItem
                  key={tool.id}
                  tool={tool}
                  onAdd={handleAddTool}
                />
              ))}
            </div>
          </section>
        )}

        {!search && selectedCategory === "All" && (
          <section className="mb-6">
            <button
              type="button"
              onClick={() =>
                setShowPopular((current) => !current)
              }
              className="mb-2 flex w-full items-center justify-between"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Popular Tools
              </h3>

              <ChevronDown
                size={14}
                className={`text-slate-400 transition ${
                  showPopular ? "rotate-180" : ""
                }`}
              />
            </button>

            {showPopular && (
              <div className="space-y-2">
                {popularTools.map((tool) => (
                  <ToolItem
                    key={tool.id}
                    tool={tool}
                    onAdd={handleAddTool}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        <div className="space-y-5">
          {filteredGroups.map((group) => (
            <section key={group.id}>
              <GroupHeader
                group={{
                  ...group,
                  description: group.description,
                }}
                open={Boolean(openGroups[group.id])}
                onToggle={() =>
                  toggleGroup(group.id)
                }
              />

              {openGroups[group.id] && (
                <div className="mt-2 space-y-2 pl-1">
                  {group.tools.map((tool) => (
                    <ToolItem
                      key={tool.id}
                      tool={tool}
                      onAdd={handleAddTool}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
            <Search
              size={28}
              className="mx-auto text-slate-300"
            />

            <div className="mt-3 text-sm font-semibold text-slate-800">
              No tools found
            </div>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Try another search term or choose a different category.
            </p>
          </div>
        )}

        <section className="mt-6">
          <button
            type="button"
            onClick={() =>
              setShowSettings((current) => !current)
            }
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-3 text-left hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                <Settings2 size={15} />
              </div>

              <div>
                <div className="text-xs font-semibold">
                  Tool Settings
                </div>

                <div className="mt-0.5 text-[10px] text-slate-500">
                  Permissions and execution policies
                </div>
              </div>
            </div>

            <ChevronDown
              size={14}
              className={`text-slate-400 transition ${
                showSettings ? "rotate-180" : ""
              }`}
            />
          </button>

          {showSettings && (
            <div className="mt-2 space-y-2 rounded-xl bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-600">
                  Permission checks
                </span>

                <CheckCircle2
                  size={14}
                  className="text-emerald-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-600">
                  Audit logging
                </span>

                <CheckCircle2
                  size={14}
                  className="text-emerald-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-600">
                  Runtime guardrails
                </span>

                <CheckCircle2
                  size={14}
                  className="text-emerald-600"
                />
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck
            size={16}
            className="mt-0.5 shrink-0 text-emerald-600"
          />

          <div>
            <div className="text-xs font-semibold text-slate-800">
              Secure tool execution
            </div>

            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              Tool permissions, approvals, and audit policies are enforced
              by the Agent Builder runtime.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}