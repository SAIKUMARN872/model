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
  Database,
  FileText,
  GitBranch,
  Layers,
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

const nodeGroups = [
  {
    id: "triggers",
    name: "Triggers",
    icon: Play,
    nodes: [
      {
        id: "manual",
        name: "Manual Trigger",
        category: "Trigger",
        description: "Start the workflow manually.",
        icon: Play,
      },
      {
        id: "schedule",
        name: "Schedule",
        category: "Trigger",
        description: "Start the workflow on a schedule.",
        icon: Clock3,
      },
      {
        id: "webhook",
        name: "Webhook",
        category: "Trigger",
        description: "Start when an event is received.",
        icon: Zap,
      },
    ],
  },
  {
    id: "agents",
    name: "Agents",
    icon: Bot,
    nodes: [
      {
        id: "agent",
        name: "Agent",
        category: "Agent",
        description: "Run an autonomous AI agent.",
        icon: Bot,
      },
      {
        id: "sub-agent",
        name: "Sub-Agent",
        category: "Agent",
        description: "Delegate a task to a specialist.",
        icon: Users,
      },
      {
        id: "review",
        name: "Review Agent",
        category: "Agent",
        description: "Review and validate generated output.",
        icon: ShieldCheck,
      },
    ],
  },
  {
    id: "logic",
    name: "Logic",
    icon: GitBranch,
    nodes: [
      {
        id: "condition",
        name: "Condition",
        category: "Logic",
        description: "Branch based on a condition.",
        icon: GitBranch,
      },
      {
        id: "parallel",
        name: "Parallel",
        category: "Logic",
        description: "Execute multiple branches together.",
        icon: Layers,
      },
      {
        id: "loop",
        name: "Loop",
        category: "Logic",
        description: "Repeat a workflow step.",
        icon: RefreshCw,
      },
      {
        id: "merge",
        name: "Merge",
        category: "Logic",
        description: "Combine multiple branches.",
        icon: Layers,
      },
    ],
  },
  {
    id: "tools",
    name: "Tools",
    icon: Settings2,
    nodes: [
      {
        id: "api",
        name: "REST API",
        category: "Tool",
        description: "Call an external API.",
        icon: Settings2,
      },
      {
        id: "database",
        name: "Database",
        category: "Tool",
        description: "Query an approved database.",
        icon: Database,
      },
      {
        id: "code",
        name: "Code Execution",
        category: "Tool",
        description: "Run sandboxed code.",
        icon: Terminal,
      },
      {
        id: "document",
        name: "Document",
        category: "Tool",
        description: "Read and process documents.",
        icon: FileText,
      },
    ],
  },
  {
    id: "outputs",
    name: "Outputs",
    icon: ArrowRight,
    nodes: [
      {
        id: "response",
        name: "Response",
        category: "Output",
        description: "Return a result to the user.",
        icon: ArrowRight,
      },
      {
        id: "save",
        name: "Save Result",
        category: "Output",
        description: "Store the workflow result.",
        icon: Database,
      },
      {
        id: "notification",
        name: "Notification",
        category: "Output",
        description: "Send a notification.",
        icon: Activity,
      },
    ],
  },
];

const initialNodes = [
  {
    id: "node-1",
    template: "manual",
    name: "Manual Trigger",
    category: "Trigger",
    description: "Start workflow manually",
    icon: Play,
    x: 80,
    y: 130,
    status: "Ready",
  },
  {
    id: "node-2",
    template: "agent",
    name: "Research Agent",
    category: "Agent",
    description: "Research and analyze information",
    icon: Bot,
    x: 350,
    y: 130,
    status: "Ready",
  },
  {
    id: "node-3",
    template: "condition",
    name: "Quality Check",
    category: "Logic",
    description: "Validate generated result",
    icon: GitBranch,
    x: 620,
    y: 130,
    status: "Ready",
  },
  {
    id: "node-4",
    template: "response",
    name: "Response",
    category: "Output",
    description: "Return final answer",
    icon: ArrowRight,
    x: 890,
    y: 130,
    status: "Ready",
  },
];

const initialEdges = [
  ["node-1", "node-2"],
  ["node-2", "node-3"],
  ["node-3", "node-4"],
];

function NodePaletteItem({ node, onAdd }) {
  const Icon = node.icon;

  return (
    <button
      type="button"
      draggable
      onClick={() => onAdd(node)}
      onDragStart={(event) => {
        event.dataTransfer.setData(
          "application/x-workflow-node",
          JSON.stringify({ template: node.id }),
        );
      }}
      className="group flex w-full items-center gap-3 rounded-lg p-2.5 text-left hover:bg-slate-50"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-slate-900">
        <Icon
          size={15}
          className="text-slate-700 group-hover:text-white"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold text-slate-800">
          {node.name}
        </div>

        <div className="mt-0.5 truncate text-[10px] text-slate-400">
          {node.description}
        </div>
      </div>

      <Plus
        size={13}
        className="text-slate-400 group-hover:text-slate-700"
      />
    </button>
  );
}

function WorkflowNode({
  node,
  selected,
  onSelect,
  onDelete,
}) {
  const Icon = node.icon;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onSelect(node.id);
      }}
      className={`absolute w-[200px] rounded-xl border bg-white p-3 text-left shadow-lg transition ${
        selected
          ? "border-slate-900 ring-2 ring-slate-200"
          : "border-slate-200 hover:border-slate-400"
      }`}
      style={{
        left: node.x,
        top: node.y,
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
          <Icon size={16} className="text-white" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold">
            {node.name}
          </div>

          <div className="mt-1 text-[10px] text-slate-500">
            {node.category}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">
          {node.description}
        </span>

        <span className="flex items-center gap-1 text-[10px] text-emerald-600">
          <CheckCircle2 size={11} />
          {node.status}
        </span>
      </div>

      {selected && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(node.id);
          }}
          className="mt-3 w-full rounded-md border border-red-200 px-2 py-1.5 text-[10px] font-medium text-red-600 hover:bg-red-50"
        >
          Remove node
        </button>
      )}
    </button>
  );
}

function EdgeLayer({ edges, nodes }) {
  const resolvedEdges = edges
    .map(([fromId, toId]) => {
      const from = nodes.find((node) => node.id === fromId);
      const to = nodes.find((node) => node.id === toId);

      return from && to ? { from, to } : null;
    })
    .filter(Boolean);

  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full">
      {resolvedEdges.map(({ from, to }, index) => {
        const x1 = from.x + 200;
        const y1 = from.y + 46;
        const x2 = to.x;
        const y2 = to.y + 46;

        const curve = Math.max(
          35,
          Math.abs(x2 - x1) / 2,
        );

        return (
          <g key={`${from.id}-${to.id}-${index}`}>
            <path
              d={`M ${x1} ${y1} C ${
                x1 + curve
              } ${y1}, ${x2 - curve} ${y2}, ${x2} ${y2}`}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
            />

            <circle
              cx={x2}
              cy={y2}
              r="3"
              fill="#64748b"
            />
          </g>
        );
      })}
    </svg>
  );
}

export default function WorkflowBuilder() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const [selectedNodeId, setSelectedNodeId] =
    useState("node-2");

  const [search, setSearch] = useState("");
  const [openGroups, setOpenGroups] = useState(
    Object.fromEntries(
      nodeGroups.map((group) => [group.id, true]),
    ),
  );

  const [zoom, setZoom] = useState(100);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("builder");

  const [workflowName, setWorkflowName] = useState(
    "Enterprise Research Workflow",
  );

  const [executionMode, setExecutionMode] =
    useState("Sequential");

  const [autoRecovery, setAutoRecovery] =
    useState(true);

  const [testMessage, setTestMessage] = useState(
    "Research the latest customer feedback and summarize the most important issues.",
  );

  const selectedNode =
    nodes.find((node) => node.id === selectedNodeId) ||
    null;

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return nodeGroups;

    return nodeGroups
      .map((group) => ({
        ...group,
        nodes: group.nodes.filter(
          (node) =>
            node.name.toLowerCase().includes(query) ||
            node.description
              .toLowerCase()
              .includes(query) ||
            node.category
              .toLowerCase()
              .includes(query),
        ),
      }))
      .filter((group) => group.nodes.length > 0);
  }, [search]);

  const addNode = (template) => {
    const previous =
      nodes[nodes.length - 1];

    const newNode = {
      id: `node-${Date.now()}`,
      template: template.id,
      name: template.name,
      category: template.category,
      description: template.description,
      icon: template.icon,
      x:
        previous && previous.x >= 850
          ? 100
          : (previous?.x || 80) + 250,
      y:
        previous && previous.x >= 850
          ? 350
          : previous?.y || 130,
      status: "Ready",
    };

    setNodes((current) => [
      ...current,
      newNode,
    ]);

    if (previous) {
      setEdges((current) => [
        ...current,
        [previous.id, newNode.id],
      ]);
    }

    setSelectedNodeId(newNode.id);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const raw = event.dataTransfer.getData(
      "application/x-workflow-node",
    );

    if (!raw) return;

    try {
      const data = JSON.parse(raw);

      const template = nodeGroups
        .flatMap((group) => group.nodes)
        .find((node) => node.id === data.template);

      if (template) {
        addNode(template);
      }
    } catch {
      // Ignore invalid drag payloads.
    }
  };

  const deleteNode = (id) => {
    setNodes((current) =>
      current.filter((node) => node.id !== id),
    );

    setEdges((current) =>
      current.filter(
        ([from, to]) =>
          from !== id && to !== id,
      ),
    );

    if (selectedNodeId === id) {
      setSelectedNodeId(null);
    }
  };

  const runWorkflow = () => {
    if (running) return;

    setRunning(true);

    setNodes((current) =>
      current.map((node, index) => ({
        ...node,
        status: index === 0 ? "Running" : "Ready",
      })),
    );

    window.setTimeout(() => {
      setNodes((current) =>
        current.map((node) => ({
          ...node,
          status: "Ready",
        })),
      );

      setRunning(false);
    }, 1600);
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <a
              href="/agent-builder"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft size={17} />
            </a>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
              <GitBranch
                size={17}
                className="text-white"
              />
            </div>

            <div>
              <h1 className="text-sm font-semibold">
                Workflow Builder
              </h1>

              <p className="text-[11px] text-slate-500">
                Design, connect, test, and deploy agent workflows.
              </p>
            </div>

            <div className="ml-2 rounded-lg border border-slate-200 px-2.5 py-1.5">
              <span className="text-[11px] text-slate-500">
                {workflowName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("test")}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <Activity size={14} />
              Test
            </button>

            <button
              type="button"
              onClick={runWorkflow}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
            >
              {running ? (
                <RefreshCw
                  size={14}
                  className="animate-spin"
                />
              ) : (
                <Play size={14} />
              )}

              {running ? "Running..." : "Run"}
            </button>
          </div>
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white px-5 py-2">
        <div className="flex items-center gap-2">
          {[
            ["builder", "Builder"],
            ["test", "Test"],
            ["logs", "Logs"],
          ].map(([id, label]) => (
            <button
              type="button"
              key={id}
              onClick={() => setActiveTab(id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                activeTab === id
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {label}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setZoom((current) =>
                  Math.max(60, current - 10),
                )
              }
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
            >
              −
            </button>

            <span className="w-12 text-center text-xs text-slate-500">
              {zoom}%
            </span>

            <button
              type="button"
              onClick={() =>
                setZoom((current) =>
                  Math.min(140, current + 10),
                )
              }
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {activeTab === "builder" && (
        <div className="grid min-h-[calc(100vh-104px)] grid-cols-[250px_minmax(0,1fr)_290px]">
          <aside className="border-r border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Components
              </div>

              <div className="mt-1 text-sm font-semibold">
                Workflow Nodes
              </div>

              <div className="relative mt-3">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search nodes..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-2 text-xs outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div className="max-h-[calc(100vh-205px)] space-y-4 overflow-y-auto p-3">
              {filteredGroups.map((group) => {
                const Icon = group.icon;

                return (
                  <section key={group.id}>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenGroups((current) => ({
                          ...current,
                          [group.id]:
                            !current[group.id],
                        }))
                      }
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-slate-50"
                    >
                      <Icon
                        size={14}
                        className="text-slate-600"
                      />

                      <span className="flex-1 text-xs font-semibold">
                        {group.name}
                      </span>

                      <ChevronDown
                        size={13}
                        className={`text-slate-400 transition ${
                          openGroups[group.id]
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>

                    {openGroups[group.id] && (
                      <div className="mt-1 space-y-1">
                        {group.nodes.map((template) => {
                          const TemplateIcon =
                            template.icon;

                          return (
                            <button
                              type="button"
                              key={template.id}
                              draggable
                              onClick={() =>
                                addNode(template)
                              }
                              onDragStart={(event) => {
                                event.dataTransfer.setData(
                                  "application/x-workflow-node",
                                  JSON.stringify({
                                    template: template.id,
                                  }),
                                );
                              }}
                              className="group flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-slate-50"
                            >
                              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 group-hover:bg-slate-900">
                                <TemplateIcon
                                  size={13}
                                  className="text-slate-700 group-hover:text-white"
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="truncate text-[11px] font-medium">
                                  {template.name}
                                </div>

                                <div className="truncate text-[9px] text-slate-400">
                                  {template.category}
                                </div>
                              </div>

                              <Plus
                                size={12}
                                className="text-slate-400"
                              />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </aside>

          <section
            className="relative overflow-hidden bg-slate-100"
            onDragOver={(event) =>
              event.preventDefault()
            }
            onDrop={handleDrop}
            onClick={() => setSelectedNodeId(null)}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(#cbd5e1 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />

            <div
              className="absolute inset-0 origin-top-left"
              style={{
                transform: `scale(${zoom / 100})`,
              }}
            >
              <EdgeLayer
                edges={edges}
                nodes={nodes}
              />

              {nodes.map((node) => (
                <WorkflowNode
                  key={node.id}
                  node={node}
                  selected={
                    selectedNodeId === node.id
                  }
                  onSelect={setSelectedNodeId}
                  onDelete={deleteNode}
                />
              ))}
            </div>

            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
                  <Layers
                    size={34}
                    className="mx-auto text-slate-300"
                  />

                  <div className="mt-3 text-sm font-semibold">
                    Build your workflow
                  </div>

                  <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                    Drag nodes from the component library or click a node to
                    add it to the workflow.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      addNode(
                        paletteGroups[0].nodes[0],
                      )
                    }
                    className="mx-auto mt-4 flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white"
                  >
                    <Plus size={14} />
                    Add Trigger
                  </button>
                </div>
              </div>
            )}

            <div className="absolute bottom-4 left-4 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-sm">
              <div className="flex items-center gap-4 text-[10px] text-slate-500">
                <span>Nodes: {nodes.length}</span>
                <span>Edges: {edges.length}</span>
                <span>Zoom: {zoom}%</span>
              </div>
            </div>
          </section>

          <aside className="border-l border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Workflow Settings
              </div>

              <div className="mt-1 text-sm font-semibold">
                {selectedNode
                  ? selectedNode.name
                  : "Workflow"}
              </div>
            </div>

            {!selectedNode && (
              <div className="space-y-5 p-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Workflow Name
                  </label>

                  <input
                    value={workflowName}
                    onChange={(event) =>
                      setWorkflowName(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Execution Mode
                  </label>

                  <select
                    value={executionMode}
                    onChange={(event) =>
                      setExecutionMode(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none"
                  >
                    <option>Sequential</option>
                    <option>Parallel</option>
                    <option>Hybrid</option>
                  </select>
                </div>

                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      size={15}
                      className="text-emerald-600"
                    />

                    <span className="text-xs font-semibold">
                      Runtime protection
                    </span>
                  </div>

                  <p className="mt-1 text-[10px] leading-5 text-slate-500">
                    Guardrails, tool permissions, retries, and execution logs
                    are enabled.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="text-[10px] uppercase tracking-wide text-slate-400">
                    Workflow Summary
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">
                        Nodes
                      </span>

                      <span className="font-semibold">
                        {nodes.length}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">
                        Connections
                      </span>

                      <span className="font-semibold">
                        {edges.length}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">
                        Status
                      </span>

                      <span className="font-medium text-emerald-600">
                        Ready
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedNode && (
              <div className="space-y-5 p-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  {(() => {
                    const SelectedIcon =
                      selectedNode.icon;

                    return (
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
                          <SelectedIcon
                            size={16}
                            className="text-white"
                          />
                        </div>

                        <div>
                          <div className="text-sm font-semibold">
                            {selectedNode.name}
                          </div>

                          <div className="mt-1 text-[10px] text-slate-500">
                            {selectedNode.category}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Node Name
                  </label>

                  <input
                    defaultValue={selectedNode.name}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Description
                  </label>

                  <textarea
                    defaultValue={selectedNode.description}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Execution Mode
                  </label>

                  <select className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none">
                    <option>Standard</option>
                    <option>Streaming</option>
                    <option>Parallel</option>
                    <option>Background</option>
                  </select>
                </div>

                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="text-[10px] uppercase tracking-wide text-slate-400">
                    Node Runtime
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Retry
                    </span>

                    <CheckCircle2
                      size={15}
                      className="text-emerald-600"
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Audit Logs
                    </span>

                    <CheckCircle2
                      size={15}
                      className="text-emerald-600"
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Guardrails
                    </span>

                    <ShieldCheck
                      size={15}
                      className="text-emerald-600"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    deleteNode(selectedNode.id)
                  }
                  className="flex w-full items-center justify-center rounded-lg border border-red-200 px-3 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Remove Node
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {activeTab === "test" && (
        <section className="mx-auto max-w-[1200px] p-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Play size={19} />

                <div>
                  <h2 className="text-lg font-semibold">
                    Workflow Test
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Send test input through the current workflow.
                  </p>
                </div>
              </div>

              <textarea
                defaultValue="Analyze the latest customer feedback and return the top three issues."
                rows={8}
                className="mt-5 w-full resize-none rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-slate-400"
              />

              <button
                type="button"
                onClick={runWorkflow}
                className="mt-4 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
              >
                <Play size={15} />
                Run Test
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <BarChart3 size={19} />

                <div>
                  <h2 className="text-lg font-semibold">
                    Test Summary
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Current workflow health.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="text-xs text-slate-500">
                    Nodes
                  </div>

                  <div className="mt-1 text-2xl font-semibold">
                    {nodes.length}
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="text-xs text-slate-500">
                    Connections
                  </div>

                  <div className="mt-1 text-2xl font-semibold">
                    {edges.length}
                  </div>
                </div>

                <div className="rounded-xl bg-emerald-50 p-4">
                  <div className="text-xs text-emerald-700">
                    Success
                  </div>

                  <div className="mt-1 text-2xl font-semibold text-emerald-800">
                    98%
                  </div>
                </div>

                <div className="rounded-xl bg-blue-50 p-4">
                  <div className="text-xs text-blue-700">
                    Avg Latency
                  </div>

                  <div className="mt-1 text-2xl font-semibold text-blue-800">
                    2.1s
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "logs" && (
        <section className="mx-auto max-w-[1200px] p-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Terminal size={19} />

              <div>
                <h2 className="text-lg font-semibold">
                  Execution Logs
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Runtime activity for the workflow.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2 rounded-xl bg-slate-950 p-5 font-mono text-xs text-slate-300">
              <div>
                <span className="text-slate-600">
                  10:40:01
                </span>{" "}
                Workflow initialized
              </div>

              <div>
                <span className="text-slate-600">
                  10:40:02
                </span>{" "}
                Trigger executed
              </div>

              <div>
                <span className="text-slate-600">
                  10:40:03
                </span>{" "}
                Research Agent started
              </div>

              <div>
                <span className="text-slate-600">
                  10:40:06
                </span>{" "}
                Quality Check completed
              </div>

              <div>
                <span className="text-emerald-400">
                  10:40:07
                </span>{" "}
                Workflow completed successfully
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}