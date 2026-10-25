"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
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
  Target,
  Terminal,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

const paletteGroups = [
  {
    id: "triggers",
    name: "Triggers",
    icon: Play,
    nodes: [
      {
        id: "manual-trigger",
        name: "Manual Trigger",
        description: "Start the workflow manually.",
        category: "Trigger",
        icon: Play,
      },
      {
        id: "schedule",
        name: "Schedule",
        description: "Start the workflow on a schedule.",
        category: "Trigger",
        icon: Clock3,
      },
      {
        id: "webhook",
        name: "Webhook",
        description: "Start from an incoming event.",
        category: "Trigger",
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
        description: "Run an autonomous AI agent.",
        category: "Agent",
        icon: Bot,
      },
      {
        id: "sub-agent",
        name: "Sub-Agent",
        description: "Delegate work to a specialist agent.",
        category: "Agent",
        icon: Users,
      },
      {
        id: "review",
        name: "Review Agent",
        description: "Review and validate generated output.",
        category: "Agent",
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
        description: "Branch based on a condition.",
        category: "Logic",
        icon: GitBranch,
      },
      {
        id: "parallel",
        name: "Parallel",
        description: "Run multiple branches together.",
        category: "Logic",
        icon: Layers,
      },
      {
        id: "loop",
        name: "Loop",
        description: "Repeat an operation.",
        category: "Logic",
        icon: Activity,
      },
      {
        id: "merge",
        name: "Merge",
        description: "Merge workflow branches.",
        category: "Logic",
        icon: GitBranch,
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
        description: "Call an external service.",
        category: "Tool",
        icon: Settings2,
      },
      {
        id: "database",
        name: "Database",
        description: "Query an approved database.",
        category: "Tool",
        icon: Database,
      },
      {
        id: "code",
        name: "Code",
        description: "Execute sandboxed code.",
        category: "Tool",
        icon: Terminal,
      },
      {
        id: "document",
        name: "Document",
        description: "Read and process a document.",
        category: "Tool",
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
        description: "Return a response to the user.",
        category: "Output",
        icon: ArrowRight,
      },
      {
        id: "save",
        name: "Save Result",
        description: "Store workflow output.",
        category: "Output",
        icon: Database,
      },
      {
        id: "notification",
        name: "Notification",
        description: "Send a notification.",
        category: "Output",
        icon: Activity,
      },
    ],
  },
];

const defaultNodes = [
  {
    id: "node-1",
    paletteId: "manual-trigger",
    name: "Manual Trigger",
    category: "Trigger",
    icon: Play,
    x: 90,
    y: 100,
    status: "Ready",
  },
  {
    id: "node-2",
    paletteId: "agent",
    name: "Research Agent",
    category: "Agent",
    icon: Bot,
    x: 340,
    y: 100,
    status: "Ready",
  },
  {
    id: "node-3",
    paletteId: "condition",
    name: "Quality Check",
    category: "Logic",
    icon: GitBranch,
    x: 610,
    y: 100,
    status: "Ready",
  },
  {
    id: "node-4",
    paletteId: "response",
    name: "Response",
    category: "Output",
    icon: ArrowRight,
    x: 880,
    y: 100,
    status: "Ready",
  },
];

const defaultConnections = [
  ["node-1", "node-2"],
  ["node-2", "node-3"],
  ["node-3", "node-4"],
];

function PaletteItem({ node, onAdd }) {
  const Icon = node.icon;

  return (
    <button
      type="button"
      draggable
      onClick={() => onAdd(node)}
      onDragStart={(event) => {
        event.dataTransfer.setData(
          "application/x-visual-node",
          JSON.stringify({
            id: node.id,
            name: node.name,
            category: node.category,
          }),
        );
      }}
      className="group w-full rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-slate-400 hover:shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-slate-900">
          <Icon
            size={15}
            className="text-slate-700 group-hover:text-white"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold text-slate-900">
            {node.name}
          </div>

          <div className="mt-0.5 truncate text-[10px] text-slate-500">
            {node.description}
          </div>
        </div>

        <Plus
          size={14}
          className="text-slate-400"
        />
      </div>
    </button>
  );
}

function PaletteGroup({ group, open, onToggle, onAdd }) {
  const Icon = group.icon;

  return (
    <section>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-slate-50"
      >
        <Icon size={15} className="text-slate-600" />

        <span className="flex-1 text-xs font-semibold text-slate-800">
          {group.name}
        </span>

        <ChevronDown
          size={14}
          className={`text-slate-400 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="mt-1 space-y-2 pl-1">
          {group.nodes.map((node) => (
            <PaletteItem
              key={node.id}
              node={node}
              onAdd={onAdd}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function WorkflowNode({ node, selected, onSelect }) {
  const Icon = node.icon;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onSelect(node.id);
      }}
      className={`absolute w-[190px] rounded-xl border bg-white p-3 text-left shadow-lg transition ${
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
          <div className="truncate text-xs font-semibold text-slate-900">
            {node.name}
          </div>

          <div className="mt-1 text-[10px] text-slate-500">
            {node.category}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">
          Node
        </span>

        <span className="flex items-center gap-1 text-[10px] text-emerald-600">
          <CheckCircle2 size={11} />
          {node.status}
        </span>
      </div>
    </button>
  );
}

function ConnectorLine({ from, to }) {
  const x1 = from.x + 190;
  const y1 = from.y + 48;
  const x2 = to.x;
  const y2 = to.y + 48;

  const width = Math.max(40, x2 - x1);
  const curve = Math.max(20, width / 2);

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0 h-full w-full overflow-visible"
    >
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
    </svg>
  );
}

export default function VisualBuilder() {
  const [nodes, setNodes] = useState(defaultNodes);
  const [connections, setConnections] = useState(
    defaultConnections,
  );

  const [selectedNodeId, setSelectedNodeId] =
    useState("node-2");

  const [search, setSearch] = useState("");
  const [openGroups, setOpenGroups] = useState(
    Object.fromEntries(
      paletteGroups.map((group) => [group.id, true]),
    ),
  );

  const [zoom, setZoom] = useState(100);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("canvas");

  const selectedNode =
    nodes.find((node) => node.id === selectedNodeId) ||
    null;

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return paletteGroups;

    return paletteGroups
      .map((group) => ({
        ...group,
        nodes: group.nodes.filter(
          (node) =>
            node.name.toLowerCase().includes(query) ||
            node.description.toLowerCase().includes(query),
        ),
      }))
      .filter((group) => group.nodes.length > 0);
  }, [search]);

  const addNode = (paletteNode) => {
    const lastNode = nodes[nodes.length - 1];

    const newNode = {
      id: `node-${Date.now()}`,
      paletteId: paletteNode.id,
      name: paletteNode.name,
      category: paletteNode.category,
      icon: paletteNode.icon,
      x: Math.min(
        Math.max(90, (lastNode?.x || 80) + 230),
        900,
      ),
      y:
        lastNode && lastNode.x > 700
          ? 260
          : lastNode?.y || 100,
      status: "Ready",
    };

    setNodes((current) => [
      ...current,
      newNode,
    ]);

    if (lastNode) {
      setConnections((current) => [
        ...current,
        [lastNode.id, newNode.id],
      ]);
    }

    setSelectedNodeId(newNode.id);
  };

  const handleCanvasDrop = (event) => {
    event.preventDefault();

    const raw = event.dataTransfer.getData(
      "application/x-visual-node",
    );

    if (!raw) return;

    try {
      const dropped = JSON.parse(raw);

      const paletteNode = paletteGroups
        .flatMap((group) => group.nodes)
        .find((node) => node.id === dropped.id);

      if (paletteNode) {
        addNode(paletteNode);
      }
    } catch {
      // Ignore invalid drag payloads.
    }
  };

  const runWorkflow = () => {
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
    }, 1800);
  };

  const removeSelectedNode = () => {
    if (!selectedNodeId) return;

    setNodes((current) =>
      current.filter(
        (node) => node.id !== selectedNodeId,
      ),
    );

    setConnections((current) =>
      current.filter(
        ([from, to]) =>
          from !== selectedNodeId &&
          to !== selectedNodeId,
      ),
    );

    setSelectedNodeId(null);
  };

  const clearCanvas = () => {
    setNodes([]);
    setConnections([]);
    setSelectedNodeId(null);
  };

  const connectionNodes = connections
    .map(([fromId, toId]) => {
      const from = nodes.find(
        (node) => node.id === fromId,
      );

      const to = nodes.find(
        (node) => node.id === toId,
      );

      return from && to ? { from, to } : null;
    })
    .filter(Boolean);

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
                Visual Builder
              </h1>

              <p className="text-[11px] text-slate-500">
                Build agents visually with connected workflow nodes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearCanvas}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Clear
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

              {running ? "Running..." : "Run Workflow"}
            </button>
          </div>
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white px-5 py-2">
        <div className="flex items-center gap-2">
          {[
            ["canvas", "Canvas"],
            ["logic", "Logic"],
            ["preview", "Preview"],
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

      {activeTab === "canvas" && (
        <div className="grid min-h-[calc(100vh-104px)] grid-cols-[250px_minmax(0,1fr)_290px]">
          <aside className="border-r border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Node Library
              </div>

              <div className="mt-1 text-sm font-semibold">
                Components
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
                  placeholder="Search nodes"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-2 text-xs outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div className="max-h-[calc(100vh-215px)] space-y-4 overflow-y-auto p-3">
              {filteredGroups.map((group) => {
                const Icon = group.icon;
                const open =
                  Boolean(openGroups[group.id]);

                return (
                  <section key={group.id}>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenGroups((current) => ({
                          ...current,
                          [group.id]: !current[group.id],
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
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {open && (
                      <div className="mt-1 space-y-1.5">
                        {group.nodes.map((node) => (
                          <button
                            key={node.id}
                            type="button"
                            draggable
                            onClick={() => addNode(node)}
                            onDragStart={(event) => {
                              event.dataTransfer.setData(
                                "application/x-visual-node",
                                JSON.stringify({
                                  id: node.id,
                                }),
                              );
                            }}
                            className="group flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-slate-50"
                          >
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 group-hover:bg-slate-900">
                              <node.icon
                                size={13}
                                className="text-slate-700 group-hover:text-white"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[11px] font-medium">
                                {node.name}
                              </div>

                              <div className="truncate text-[9px] text-slate-400">
                                {node.category}
                              </div>
                            </div>

                            <Plus
                              size={12}
                              className="text-slate-400"
                            />
                          </button>
                        ))}
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
            onDrop={handleCanvasDrop}
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
              {connectionNodes.map(({ from, to }, index) => (
                <ConnectorLine
                  key={`${from.id}-${to.id}-${index}`}
                  from={from}
                  to={to}
                />
              ))}

              {nodes.map((node) => (
                <WorkflowNode
                  key={node.id}
                  node={node}
                  selected={selectedNodeId === node.id}
                  onSelect={setSelectedNodeId}
                />
              ))}
            </div>

            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white/90 p-10 text-center shadow-sm">
                  <Layers
                    size={34}
                    className="mx-auto text-slate-300"
                  />

                  <div className="mt-3 text-sm font-semibold">
                    Start building your workflow
                  </div>

                  <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                    Add nodes from the library or drag them onto the canvas.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      addNode(paletteGroups[0].nodes[0])
                    }
                    className="mt-4 flex mx-auto items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white"
                  >
                    <Plus size={14} />
                    Add First Node
                  </button>
                </div>
              </div>
            )}

            <div className="absolute bottom-4 left-4 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-sm">
              <div className="flex items-center gap-4 text-[10px] text-slate-500">
                <span>Nodes: {nodes.length}</span>
                <span>Connections: {connections.length}</span>
                <span>Zoom: {zoom}%</span>
              </div>
            </div>
          </section>

          <aside className="border-l border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Configuration
              </div>

              <div className="mt-1 text-sm font-semibold">
                {selectedNode
                  ? selectedNode.name
                  : "Select a node"}
              </div>
            </div>

            {!selectedNode && (
              <div className="p-5 text-center">
                <Settings2
                  size={30}
                  className="mx-auto text-slate-300"
                />

                <div className="mt-3 text-sm font-semibold">
                  No node selected
                </div>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Select a node on the canvas to configure it.
                </p>
              </div>
            )}

            {selectedNode && (
              <div className="space-y-5 p-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
                      <selectedNode.icon
                        size={16}
                        className="text-white"
                      />
                    </div>

                    <div>
                      <div className="text-sm font-semibold">
                        {selectedNode.name}
                      </div>

                      <div className="mt-1 text-[11px] text-slate-500">
                        {selectedNode.category}
                      </div>
                    </div>
                  </div>
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
                    Execution Mode
                  </label>

                  <select className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none">
                    <option>Standard</option>
                    <option>Streaming</option>
                    <option>Parallel</option>
                    <option>Background</option>
                  </select>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                  <div>
                    <div className="text-xs font-medium">
                      Retry on failure
                    </div>

                    <div className="mt-1 text-[10px] text-slate-500">
                      Automatically retry failed execution.
                    </div>
                  </div>

                  <CheckCircle2
                    size={17}
                    className="text-emerald-600"
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                  <div>
                    <div className="text-xs font-medium">
                      Audit logging
                    </div>

                    <div className="mt-1 text-[10px] text-slate-500">
                      Record node execution details.
                    </div>
                  </div>

                  <CheckCircle2
                    size={17}
                    className="text-emerald-600"
                  />
                </div>

                <button
                  type="button"
                  onClick={removeSelectedNode}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Remove Node
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {activeTab === "logic" && (
        <section className="mx-auto max-w-[1200px] p-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <GitBranch size={20} />
              <div>
                <h2 className="text-lg font-semibold">
                  Workflow Logic
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Configure conditions, branches, loops, and parallel execution
                  from the visual workflow.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                [
                  "Conditions",
                  "Route execution using rules.",
                  GitBranch,
                ],
                [
                  "Parallel Execution",
                  "Execute independent tasks together.",
                  Layers,
                ],
                [
                  "Loops",
                  "Repeat tasks until a condition is met.",
                  Activity,
                ],
              ].map(([title, description, Icon]) => (
                <div
                  key={title}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <Icon size={18} />
                  <div className="mt-3 text-sm font-semibold">
                    {title}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeTab === "preview" && (
        <section className="mx-auto max-w-[1200px] p-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Workflow Preview
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review the current workflow before deployment.
                </p>
              </div>

              <button
                type="button"
                onClick={runWorkflow}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white"
              >
                <Play size={14} />
                Test Workflow
              </button>
            </div>

            <div className="mt-6 rounded-xl bg-slate-950 p-5 font-mono text-xs text-slate-200">
              {nodes.length === 0 ? (
                <span>No workflow nodes configured.</span>
              ) : (
                nodes.map((node, index) => (
                  <div
                    key={node.id}
                    className="flex items-center gap-3 py-2"
                  >
                    <span className="text-slate-600">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span>{node.name}</span>

                    <span className="text-slate-500">
                      [{node.category}]
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}