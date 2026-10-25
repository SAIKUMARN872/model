"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  Code2,
  Database,
  FileText,
  GitBranch,
  Globe2,
  Layers,
  Play,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Terminal,
  Users,
  Zap,
} from "lucide-react";

const nodeGroups = [
  {
    id: "triggers",
    name: "Triggers",
    description: "Start an agent workflow from events or schedules.",
    icon: Play,
    nodes: [
      {
        id: "manual-trigger",
        name: "Manual Trigger",
        description: "Start a workflow manually.",
        category: "Trigger",
        icon: Play,
      },
      {
        id: "schedule-trigger",
        name: "Schedule",
        description: "Run a workflow on a schedule.",
        category: "Trigger",
        icon: Activity,
      },
      {
        id: "webhook-trigger",
        name: "Webhook",
        description: "Start a workflow from an incoming webhook.",
        category: "Trigger",
        icon: Zap,
      },
      {
        id: "event-trigger",
        name: "Event Trigger",
        description: "Start when a platform event occurs.",
        category: "Trigger",
        icon: GitBranch,
      },
    ],
  },
  {
    id: "agents",
    name: "Agents",
    description: "Add intelligent agents to your workflow.",
    icon: Bot,
    nodes: [
      {
        id: "agent",
        name: "Agent",
        description: "Execute an autonomous agent task.",
        category: "Agent",
        icon: Bot,
      },
      {
        id: "sub-agent",
        name: "Sub-Agent",
        description: "Delegate a task to another agent.",
        category: "Agent",
        icon: Users,
      },
      {
        id: "review-agent",
        name: "Review Agent",
        description: "Review output and validate quality.",
        category: "Agent",
        icon: ShieldCheck,
      },
      {
        id: "planner-agent",
        name: "Planner",
        description: "Create and manage execution plans.",
        category: "Agent",
        icon: GitBranch,
      },
    ],
  },
  {
    id: "logic",
    name: "Logic",
    description: "Control decisions and workflow execution.",
    icon: GitBranch,
    nodes: [
      {
        id: "condition",
        name: "Condition",
        description: "Branch based on a rule or expression.",
        category: "Logic",
        icon: GitBranch,
      },
      {
        id: "switch",
        name: "Switch",
        description: "Route execution across multiple branches.",
        category: "Logic",
        icon: GitBranch,
      },
      {
        id: "loop",
        name: "Loop",
        description: "Repeat a workflow step.",
        category: "Logic",
        icon: Activity,
      },
      {
        id: "parallel",
        name: "Parallel",
        description: "Execute multiple branches simultaneously.",
        category: "Logic",
        icon: Layers,
      },
      {
        id: "merge",
        name: "Merge",
        description: "Combine multiple workflow branches.",
        category: "Logic",
        icon: Layers,
      },
    ],
  },
  {
    id: "tools",
    name: "Tools",
    description: "Connect agents to external systems and actions.",
    icon: Settings2,
    nodes: [
      {
        id: "api",
        name: "REST API",
        description: "Call an external REST API.",
        category: "Tool",
        icon: Globe2,
      },
      {
        id: "code",
        name: "Code",
        description: "Execute custom code.",
        category: "Tool",
        icon: Code2,
      },
      {
        id: "terminal",
        name: "Terminal",
        description: "Execute terminal commands.",
        category: "Tool",
        icon: Terminal,
      },
      {
        id: "database",
        name: "Database",
        description: "Query an approved database.",
        category: "Tool",
        icon: Database,
      },
      {
        id: "browser",
        name: "Browser",
        description: "Perform browser automation.",
        category: "Tool",
        icon: Globe2,
      },
    ],
  },
  {
    id: "knowledge",
    name: "Knowledge",
    description: "Add context, memory, and retrieval capabilities.",
    icon: Database,
    nodes: [
      {
        id: "rag",
        name: "RAG",
        description: "Retrieve context from connected knowledge.",
        category: "Knowledge",
        icon: Database,
      },
      {
        id: "document",
        name: "Document",
        description: "Read and process documents.",
        category: "Knowledge",
        icon: FileText,
      },
      {
        id: "memory",
        name: "Memory",
        description: "Read or update agent memory.",
        category: "Knowledge",
        icon: Layers,
      },
      {
        id: "context",
        name: "Context",
        description: "Manage workflow context.",
        category: "Knowledge",
        icon: Database,
      },
    ],
  },
  {
    id: "outputs",
    name: "Outputs",
    description: "Return results or publish workflow outputs.",
    icon: ArrowRight,
    nodes: [
      {
        id: "response",
        name: "Response",
        description: "Return a response to the user.",
        category: "Output",
        icon: ArrowRight,
      },
      {
        id: "webhook-response",
        name: "Webhook Response",
        description: "Return data to a webhook caller.",
        category: "Output",
        icon: Zap,
      },
      {
        id: "notification",
        name: "Notification",
        description: "Send a notification.",
        category: "Output",
        icon: Activity,
      },
      {
        id: "save",
        name: "Save Result",
        description: "Store workflow output.",
        category: "Output",
        icon: Database,
      },
    ],
  },
];

const popularNodes = [
  {
    name: "Agent",
    description: "Run an autonomous agent.",
    category: "Agent",
    icon: Bot,
  },
  {
    name: "Condition",
    description: "Branch workflow execution.",
    category: "Logic",
    icon: GitBranch,
  },
  {
    name: "REST API",
    description: "Call an external API.",
    category: "Tool",
    icon: Globe2,
  },
  {
    name: "RAG",
    description: "Retrieve knowledge context.",
    category: "Knowledge",
    icon: Database,
  },
  {
    name: "Code",
    description: "Run custom code.",
    category: "Tool",
    icon: Code2,
  },
  {
    name: "Human Approval",
    description: "Pause for human approval.",
    category: "Control",
    icon: Users,
  },
];

function CategoryBadge({ children }) {
  return (
    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600">
      {children}
    </span>
  );
}

function NodeItem({ node, onAdd, compact = false }) {
  const Icon = node.icon;

  return (
    <button
      type="button"
      onClick={() => onAdd(node)}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData(
          "application/x-modelnow-node",
          JSON.stringify({
            id: node.id,
            name: node.name,
            category: node.category,
          }),
        );
      }}
      className={`group w-full rounded-xl border border-slate-200 bg-white text-left transition hover:border-slate-400 hover:shadow-sm ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 transition group-hover:bg-slate-900">
          <Icon
            size={17}
            className="text-slate-700 group-hover:text-white"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="truncate text-sm font-semibold text-slate-900">
              {node.name}
            </span>

            <Plus
              size={14}
              className="shrink-0 text-slate-400 group-hover:text-slate-900"
            />
          </div>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {node.description}
          </p>

          {!compact && (
            <div className="mt-2">
              <CategoryBadge>{node.category}</CategoryBadge>
            </div>
          )}
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

        <div className="mt-0.5 truncate text-[11px] text-slate-500">
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

export default function NodeLibrary({
  onAddNode,
  initialCategory = "All",
}) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState(initialCategory);
  const [openGroups, setOpenGroups] = useState(
    Object.fromEntries(
      nodeGroups.map((group) => [group.id, true]),
    ),
  );
  const [recentNodes, setRecentNodes] = useState([]);
  const [showPopular, setShowPopular] = useState(true);

  const allNodes = useMemo(() => {
    return nodeGroups.flatMap((group) => group.nodes);
  }, []);

  const categories = useMemo(() => {
    return [
      "All",
      ...nodeGroups.map((group) => group.name),
    ];
  }, []);

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();

    return nodeGroups
      .map((group) => {
        const categoryMatches =
          selectedCategory === "All" ||
          selectedCategory === group.name;

        if (!categoryMatches) {
          return {
            ...group,
            nodes: [],
          };
        }

        const nodes = group.nodes.filter((node) => {
          if (!query) return true;

          return (
            node.name.toLowerCase().includes(query) ||
            node.description.toLowerCase().includes(query) ||
            node.category.toLowerCase().includes(query)
          );
        });

        return {
          ...group,
          nodes,
        };
      })
      .filter((group) => group.nodes.length > 0);
  }, [search, selectedCategory]);

  const handleAddNode = (node) => {
    setRecentNodes((current) => {
      const next = [
        node,
        ...current.filter((item) => item.id !== node.id),
      ];

      return next.slice(0, 5);
    });

    if (typeof onAddNode === "function") {
      onAddNode(node);
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
              Node Library
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Drag nodes into the canvas or click to add.
            </p>
          </div>

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
            <Layers size={16} className="text-white" />
          </div>
        </div>

        <div className="relative mt-4">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search nodes..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
          />
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[11px] font-medium transition ${
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
        {recentNodes.length > 0 && !search && (
          <section className="mb-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Recent
              </h3>

              <button
                type="button"
                onClick={() => setRecentNodes([])}
                className="text-[10px] font-medium text-slate-400 hover:text-slate-700"
              >
                Clear
              </button>
            </div>

            <div className="space-y-2">
              {recentNodes.map((node) => (
                <NodeItem
                  key={node.id}
                  node={node}
                  compact
                  onAdd={handleAddNode}
                />
              ))}
            </div>
          </section>
        )}

        {!search && selectedCategory === "All" && (
          <section className="mb-6">
            <button
              type="button"
              onClick={() => setShowPopular((current) => !current)}
              className="mb-2 flex w-full items-center justify-between"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Popular Nodes
              </h3>

              <ChevronDown
                size={14}
                className={`text-slate-400 transition ${
                  showPopular ? "rotate-180" : ""
                }`}
              />
            </button>

            {showPopular && (
              <div className="grid grid-cols-1 gap-2">
                {popularNodes.map((node) => (
                  <NodeItem
                    key={node.name}
                    node={{
                      ...node,
                      id: node.name
                        .toLowerCase()
                        .replace(/\s+/g, "-"),
                    }}
                    compact
                    onAdd={handleAddNode}
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
                group={group}
                open={Boolean(openGroups[group.id])}
                onToggle={() => toggleGroup(group.id)}
              />

              {openGroups[group.id] && (
                <div className="mt-2 space-y-2 pl-1">
                  {group.nodes.map((node) => (
                    <NodeItem
                      key={node.id}
                      node={node}
                      onAdd={handleAddNode}
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
              No nodes found
            </div>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Try another search term or choose a different category.
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2
            size={16}
            className="mt-0.5 shrink-0 text-emerald-600"
          />

          <div>
            <div className="text-xs font-semibold text-slate-800">
              Connected to Agent Builder
            </div>

            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              Select a node to add it to your workflow. Connect nodes
              together to create multi-step agent execution.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}