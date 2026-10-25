"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  GitBranch,
  Layers,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Terminal,
  TestTube2,
  Zap,
} from "lucide-react";

type NodeStatus = "healthy" | "warning" | "error";

type WorkflowNode = {
  id: string;
  title: string;
  type: string;
  description: string;
  status: NodeStatus;
  x: number;
  y: number;
};

type Connection = {
  from: string;
  to: string;
};

const initialNodes: WorkflowNode[] = [
  {
    id: "trigger",
    title: "User Request",
    type: "Trigger",
    description: "Starts the workflow when a user sends a request.",
    status: "healthy",
    x: 80,
    y: 190,
  },
  {
    id: "agent",
    title: "AI Agent",
    type: "Agent",
    description: "Plans the task and decides which actions are required.",
    status: "healthy",
    x: 340,
    y: 190,
  },
  {
    id: "knowledge",
    title: "Knowledge Search",
    type: "RAG",
    description: "Retrieves relevant information from connected knowledge.",
    status: "healthy",
    x: 600,
    y: 70,
  },
  {
    id: "tool",
    title: "Tool Execution",
    type: "Tool",
    description: "Runs an external tool or API selected by the agent.",
    status: "healthy",
    x: 600,
    y: 310,
  },
  {
    id: "condition",
    title: "Check Result",
    type: "Condition",
    description: "Evaluates the result and selects the next path.",
    status: "warning",
    x: 870,
    y: 190,
  },
  {
    id: "response",
    title: "Final Response",
    type: "Output",
    description: "Returns the final response to the user.",
    status: "healthy",
    x: 1140,
    y: 190,
  },
];

const connections: Connection[] = [
  { from: "trigger", to: "agent" },
  { from: "agent", to: "knowledge" },
  { from: "agent", to: "tool" },
  { from: "knowledge", to: "condition" },
  { from: "tool", to: "condition" },
  { from: "condition", to: "response" },
];

const nodeTypes = [
  "All Nodes",
  "Trigger",
  "Agent",
  "RAG",
  "Tool",
  "Condition",
  "Output",
];

export default function WorkflowCanvasPage() {
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialNodes);
  const [selectedId, setSelectedId] = useState("agent");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Nodes");
  const [zoom, setZoom] = useState(100);
  const [running, setRunning] = useState(false);

  const selectedNode =
    nodes.find((node) => node.id === selectedId) ?? nodes[0];

  const visibleNodes = nodes.filter((node) => {
    const searchMatch =
      node.title.toLowerCase().includes(search.toLowerCase()) ||
      node.description.toLowerCase().includes(search.toLowerCase());

    const typeMatch =
      typeFilter === "All Nodes" || node.type === typeFilter;

    return searchMatch && typeMatch;
  });

  const runWorkflow = () => {
    setRunning(true);

    window.setTimeout(() => {
      setRunning(false);
    }, 1500);
  };

  const addNode = () => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      title: "New Step",
      type: "Agent",
      description: "Configure this workflow step.",
      status: "healthy",
      x: 850,
      y: 450,
    };

    setNodes((current) => [...current, newNode]);
    setSelectedId(newNode.id);
  };

  const updateNode = (key: "title" | "description", value: string) => {
    setNodes((current) =>
      current.map((node) =>
        node.id === selectedId ? { ...node, [key]: value } : node
      )
    );
  };

  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      {/* TOP BAR */}
      <header className="flex h-[62px] items-center justify-between border-b border-white/[0.08] bg-[#0b0c10] px-5">
        <div className="flex items-center gap-3">
          <Link
            href="/agent-builder/workflow"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-gray-400 hover:bg-white/[0.07] hover:text-white"
          >
            <ArrowLeft size={17} />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[15px] font-semibold">
                Workflow Canvas
              </h1>

              <span className="rounded-md border border-yellow-500/20 bg-yellow-500/10 px-2 py-0.5 text-[9px] text-yellow-400">
                Draft
              </span>
            </div>

            <p className="mt-0.5 text-[10px] text-gray-600">
              Customer Support Agent
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runWorkflow}
            disabled={running}
            className="flex h-9 items-center gap-2 rounded-lg bg-white px-4 text-[11px] font-semibold text-black hover:bg-gray-200 disabled:opacity-50"
          >
            {running ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Play size={14} />
            )}

            {running ? "Running..." : "Run Workflow"}
          </button>

          <button className="flex h-9 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-[11px] text-gray-400 hover:bg-white/[0.07] hover:text-white">
            <Settings2 size={14} />
            Settings
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-62px)]">
        {/* LEFT SIDEBAR */}
        <aside className="w-[245px] shrink-0 border-r border-white/[0.08] bg-[#0b0c10]">
          <div className="border-b border-white/[0.08] p-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-600">
              Workflow
            </p>

            <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                  <Layers size={17} />
                </div>

                <div>
                  <p className="text-[11px] font-semibold">
                    Customer Support
                  </p>
                  <p className="text-[9px] text-gray-600">
                    {nodes.length} nodes
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-white/[0.08] p-3">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search nodes..."
                className="h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.025] pl-8 pr-3 text-[10px] text-white outline-none placeholder:text-gray-600 focus:border-violet-500/40"
              />
            </div>

            <div className="relative mt-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-8 w-full appearance-none rounded-lg border border-white/[0.08] bg-[#101116] px-3 pr-8 text-[10px] text-gray-400 outline-none"
              >
                {nodeTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>

              <ChevronDown
                size={12}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
              />
            </div>
          </div>

          <div className="p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-gray-600">
                Nodes
              </span>

              <button
                onClick={addNode}
                className="flex h-6 w-6 items-center justify-center rounded-md text-gray-500 hover:bg-white/[0.06] hover:text-white"
              >
                <Plus size={13} />
              </button>
            </div>

            <div className="space-y-1">
              {visibleNodes.map((node) => (
                <button
                  key={node.id}
                  onClick={() => setSelectedId(node.id)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left ${
                    selectedId === node.id
                      ? "border-violet-500/30 bg-violet-500/[0.08]"
                      : "border-transparent hover:bg-white/[0.035]"
                  }`}
                >
                  <NodeIcon type={node.type} />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-medium text-gray-300">
                      {node.title}
                    </p>

                    <p className="text-[8px] text-gray-600">
                      {node.type}
                    </p>
                  </div>

                  <StatusDot status={node.status} />
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* CANVAS */}
        <section className="relative min-w-0 flex-1 overflow-auto bg-[#07080b]">
          <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(#555_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* CANVAS CONTROLS */}
          <div className="absolute left-5 top-5 z-20 flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-white/[0.08] bg-[#0d0e13]">
              <button
                onClick={() =>
                  setZoom((value) => Math.min(150, value + 10))
                }
                className="h-8 w-8 text-gray-400 hover:text-white"
              >
                +
              </button>

              <span className="px-2 text-[9px] text-gray-500">
                {zoom}%
              </span>

              <button
                onClick={() =>
                  setZoom((value) => Math.max(50, value - 10))
                }
                className="h-8 w-8 text-gray-400 hover:text-white"
              >
                −
              </button>
            </div>
          </div>

          <div
            className="relative h-[760px] min-w-[1400px] origin-top-left"
            style={{
              transform: `scale(${zoom / 100})`,
            }}
          >
            {/* CONNECTIONS */}
            <svg
              className="pointer-events-none absolute left-0 top-0 h-full w-full"
              viewBox="0 0 1400 760"
              preserveAspectRatio="none"
            >
              {connections.map((connection) => {
                const from = nodes.find(
                  (node) => node.id === connection.from
                );

                const to = nodes.find(
                  (node) => node.id === connection.to
                );

                if (!from || !to) return null;

                const startX = from.x + 190;
                const startY = from.y + 55;
                const endX = to.x;
                const endY = to.y + 55;

                const controlX = (startX + endX) / 2;

                return (
                  <path
                    key={`${connection.from}-${connection.to}`}
                    d={`M ${startX} ${startY} C ${controlX} ${startY}, ${controlX} ${endY}, ${endX} ${endY}`}
                    fill="none"
                    stroke="rgba(139,92,246,0.45)"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>

            {/* NODES */}
            {nodes.map((node) => (
              <CanvasNode
                key={node.id}
                node={node}
                selected={selectedId === node.id}
                onClick={() => setSelectedId(node.id)}
              />
            ))}
          </div>

          <div className="absolute bottom-5 left-5 rounded-lg border border-white/[0.08] bg-[#0d0e13]/95 px-3 py-2 text-[9px] text-gray-600">
            Workflow execution graph
          </div>
        </section>

        {/* RIGHT CONFIGURATION */}
        <aside className="w-[300px] shrink-0 border-l border-white/[0.08] bg-[#0b0c10]">
          <div className="border-b border-white/[0.08] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] font-semibold">
                  Node Configuration
                </p>

                <p className="mt-0.5 text-[9px] text-gray-600">
                  Configure selected node
                </p>
              </div>

              <Settings2 size={14} className="text-gray-600" />
            </div>
          </div>

          <div className="h-[calc(100%-65px)] overflow-y-auto p-4">
            {selectedNode && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <NodeIcon type={selectedNode.type} large />

                  <div>
                    <p className="text-[12px] font-semibold">
                      {selectedNode.title}
                    </p>

                    <p className="text-[9px] text-gray-600">
                      {selectedNode.type} node
                    </p>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[9px] font-medium text-gray-500">
                    Node Name
                  </label>

                  <input
                    value={selectedNode.title}
                    onChange={(e) =>
                      updateNode("title", e.target.value)
                    }
                    className="h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 text-[10px] text-gray-300 outline-none focus:border-violet-500/40"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[9px] font-medium text-gray-500">
                    Description
                  </label>

                  <textarea
                    value={selectedNode.description}
                    onChange={(e) =>
                      updateNode("description", e.target.value)
                    }
                    rows={4}
                    className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-[10px] leading-5 text-gray-400 outline-none focus:border-violet-500/40"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[9px] font-medium text-gray-500">
                    Status
                  </label>

                  <div className="flex h-9 items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.025] px-3">
                    <div className="flex items-center gap-2">
                      <StatusDot status={selectedNode.status} />

                      <span className="text-[10px] capitalize text-gray-400">
                        {selectedNode.status}
                      </span>
                    </div>

                    <ChevronDown size={12} className="text-gray-600" />
                  </div>
                </div>

                <div className="border-t border-white/[0.08] pt-4">
                  <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-gray-600">
                    Runtime
                  </p>

                  <div className="space-y-2">
                    <RuntimeRow
                      icon={<Clock3 size={13} />}
                      label="Average latency"
                      value="820 ms"
                    />

                    <RuntimeRow
                      icon={<Activity size={13} />}
                      label="Success rate"
                      value="98.7%"
                    />

                    <RuntimeRow
                      icon={<Zap size={13} />}
                      label="Token usage"
                      value="1,248"
                    />

                    <RuntimeRow
                      icon={<ShieldCheck size={13} />}
                      label="Security"
                      value="Protected"
                    />
                  </div>
                </div>

                <div className="border-t border-white/[0.08] pt-4">
                  <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-gray-600">
                    Connected Nodes
                  </p>

                  <div className="space-y-2">
                    {connections
                      .filter(
                        (connection) =>
                          connection.from === selectedNode.id ||
                          connection.to === selectedNode.id
                      )
                      .map((connection) => {
                        const otherId =
                          connection.from === selectedNode.id
                            ? connection.to
                            : connection.from;

                        const other = nodes.find(
                          (node) => node.id === otherId
                        );

                        if (!other) return null;

                        return (
                          <button
                            key={`${connection.from}-${connection.to}`}
                            onClick={() =>
                              setSelectedId(other.id)
                            }
                            className="flex w-full items-center justify-between rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-left hover:bg-white/[0.05]"
                          >
                            <div className="flex items-center gap-2">
                              <NodeIcon type={other.type} />

                              <div>
                                <p className="text-[9px] font-medium text-gray-300">
                                  {other.title}
                                </p>

                                <p className="text-[8px] text-gray-600">
                                  {other.type}
                                </p>
                              </div>
                            </div>

                            <ArrowRight
                              size={12}
                              className="text-gray-600"
                            />
                          </button>
                        );
                      })}
                  </div>
                </div>

                <div className="rounded-xl border border-violet-500/15 bg-violet-500/[0.04] p-3">
                  <div className="flex gap-2">
                    <TestTube2
                      size={14}
                      className="mt-0.5 shrink-0 text-violet-400"
                    />

                    <div>
                      <p className="text-[10px] font-semibold text-violet-300">
                        Test this node
                      </p>

                      <p className="mt-1 text-[9px] leading-4 text-gray-600">
                        Test this step before deploying the workflow.
                      </p>

                      <Link
                        href="/agent-builder/testing/playground"
                        className="mt-2 inline-flex items-center gap-1 text-[9px] font-medium text-violet-400 hover:text-violet-300"
                      >
                        Open Playground
                        <ArrowRight size={10} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}

function CanvasNode({
  node,
  selected,
  onClick,
}: {
  node: WorkflowNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`absolute w-[190px] rounded-xl border bg-[#101116] p-3 text-left shadow-xl transition ${
        selected
          ? "border-violet-500/50 shadow-violet-500/10"
          : "border-white/[0.08] hover:border-white/[0.18]"
      }`}
      style={{
        left: node.x,
        top: node.y,
      }}
    >
      <div className="flex items-start gap-3">
        <NodeIcon type={node.type} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[10px] font-semibold text-gray-200">
              {node.title}
            </p>

            <StatusDot status={node.status} />
          </div>

          <p className="mt-1 text-[8px] text-gray-600">
            {node.type}
          </p>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-[9px] leading-4 text-gray-500">
        {node.description}
      </p>
    </button>
  );
}

function NodeIcon({
  type,
  large = false,
}: {
  type: string;
  large?: boolean;
}) {
  const size = large ? 18 : 15;

  if (type === "Trigger") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400">
        <Zap size={size} />
      </div>
    );
  }

  if (type === "Agent") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10 text-violet-400">
        <Bot size={size} />
      </div>
    );
  }

  if (type === "RAG") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
        <Database size={size} />
      </div>
    );
  }

  if (type === "Tool") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-orange-500/20 bg-orange-500/10 text-orange-400">
        <Terminal size={size} />
      </div>
    );
  }

  if (type === "Condition") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-yellow-500/20 bg-yellow-500/10 text-yellow-400">
        <GitBranch size={size} />
      </div>
    );
  }

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
      <CheckCircle2 size={size} />
    </div>
  );
}

function StatusDot({ status }: { status: NodeStatus }) {
  const color =
    status === "healthy"
      ? "bg-emerald-400"
      : status === "warning"
        ? "bg-yellow-400"
        : "bg-red-400";

  return <span className={`h-2 w-2 rounded-full ${color}`} />;
}

function RuntimeRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span className="text-gray-600">{icon}</span>
        <span className="text-[9px] text-gray-500">{label}</span>
      </div>

      <span className="text-[9px] font-medium text-gray-300">
        {value}
      </span>
    </div>
  );
}