"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bot,
  Brain,
  Check,
  ChevronDown,
  Clock3,
  Code2,
  Database,
  GitBranch,
  Globe,
  GripVertical,
  Layers3,
  MessageSquare,
  MousePointer2,
  Network,
  Play,
  Plus,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  Wrench,
  X,
  Zap,
} from "lucide-react";

type NodeType =
  | "trigger"
  | "llm"
  | "tool"
  | "condition"
  | "memory"
  | "human"
  | "agent"
  | "output";

type WorkflowNode = {
  id: string;
  type: NodeType;
  title: string;
  description: string;
  x: number;
  y: number;
  icon: React.ComponentType<{ className?: string }>;
};

type NodeLibraryItem = {
  type: NodeType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

const nodeLibrary: NodeLibraryItem[] = [
  {
    type: "trigger",
    title: "Trigger",
    description: "Start the workflow",
    icon: Zap,
  },
  {
    type: "llm",
    title: "AI Model",
    description: "Reason and generate",
    icon: Brain,
  },
  {
    type: "tool",
    title: "Tool",
    description: "Call an external tool",
    icon: Wrench,
  },
  {
    type: "condition",
    title: "Condition",
    description: "Branch workflow logic",
    icon: GitBranch,
  },
  {
    type: "memory",
    title: "Memory",
    description: "Read or write memory",
    icon: Database,
  },
  {
    type: "human",
    title: "Human Approval",
    description: "Request human approval",
    icon: UserCheck,
  },
  {
    type: "agent",
    title: "Sub-Agent",
    description: "Delegate to another agent",
    icon: Bot,
  },
  {
    type: "output",
    title: "Output",
    description: "Return the result",
    icon: MessageSquare,
  },
];

const initialNodes: WorkflowNode[] = [
  {
    id: "trigger-1",
    type: "trigger",
    title: "User Request",
    description: "When a user sends a message",
    x: 70,
    y: 80,
    icon: Zap,
  },
  {
    id: "model-1",
    type: "llm",
    title: "Agent Brain",
    description: "Plan and reason over the request",
    x: 340,
    y: 80,
    icon: Brain,
  },
  {
    id: "tool-1",
    type: "tool",
    title: "Web Search",
    description: "Search trusted sources",
    x: 620,
    y: 80,
    icon: Globe,
  },
  {
    id: "output-1",
    type: "output",
    title: "Final Response",
    description: "Return answer to the user",
    x: 900,
    y: 80,
    icon: MessageSquare,
  },
];

const initialConnections = [
  ["trigger-1", "model-1"],
  ["model-1", "tool-1"],
  ["tool-1", "output-1"],
];

export default function VisualBuilderPage() {
  const router = useRouter();

  const [nodes, setNodes] =
    useState<WorkflowNode[]>(initialNodes);

  const [connections, setConnections] = useState<
    string[][]
  >(initialConnections);

  const [selectedNode, setSelectedNode] =
    useState<string | null>("model-1");

  const [search, setSearch] = useState("");
  const [running, setRunning] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showLibrary, setShowLibrary] = useState(true);
  const [showSettings, setShowSettings] = useState(true);
  const [zoom, setZoom] = useState(100);

  const [agentName, setAgentName] =
    useState("Customer Intelligence Agent");

  const [model, setModel] = useState("GPT-5.6");
  const [temperature, setTemperature] = useState("0.2");
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [humanApproval, setHumanApproval] = useState(false);

  const selectedNodeData = useMemo(
    () =>
      nodes.find((node) => node.id === selectedNode) ??
      null,
    [nodes, selectedNode],
  );

  const filteredLibrary = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return nodeLibrary;
    }

    return nodeLibrary.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query),
    );
  }, [search]);

  const addNode = (item: NodeLibraryItem) => {
    const id = `${item.type}-${Date.now()}`;

    const maxY = nodes.reduce(
      (max, node) => Math.max(max, node.y),
      80,
    );

    const newNode: WorkflowNode = {
      id,
      type: item.type,
      title: item.title,
      description: item.description,
      x: 180 + (nodes.length % 3) * 280,
      y: maxY + (nodes.length % 3 === 0 ? 170 : 0),
      icon: item.icon,
    };

    setNodes((current) => [...current, newNode]);
    setSelectedNode(id);
  };

  const deleteSelectedNode = () => {
    if (!selectedNode) return;

    setNodes((current) =>
      current.filter((node) => node.id !== selectedNode),
    );

    setConnections((current) =>
      current.filter(
        ([from, to]) =>
          from !== selectedNode && to !== selectedNode,
      ),
    );

    setSelectedNode(null);
  };

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 1600);
  };

  const handleRun = async () => {
    setRunning(true);

    await new Promise((resolve) =>
      setTimeout(resolve, 1600),
    );

    setRunning(false);
  };

  const connectSelectedTo = (nodeId: string) => {
    if (!selectedNode || selectedNode === nodeId) return;

    const exists = connections.some(
      ([from, to]) =>
        from === selectedNode && to === nodeId,
    );

    if (!exists) {
      setConnections((current) => [
        ...current,
        [selectedNode, nodeId],
      ]);
    }
  };

  return (
    <main className="min-h-screen bg-[#07070a] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1700px] flex-col">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#09090d] px-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/50 transition hover:bg-white/[0.07] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
              <Network className="h-5 w-5 text-violet-300" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold">
                  Visual Agent Builder
                </h1>

                <span className="rounded-full border border-violet-500/20 bg-violet-500/[0.07] px-2 py-0.5 text-[9px] text-violet-300">
                  NO-CODE
                </span>
              </div>

              <p className="text-[11px] text-white/30">
                Design agent workflows visually
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLibrary((value) => !value)}
              className="hidden items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[11px] text-white/50 transition hover:bg-white/[0.07] hover:text-white lg:flex"
            >
              <Layers3 className="h-3.5 w-3.5" />
              Nodes
            </button>

            <button
              type="button"
              onClick={() =>
                setShowSettings((value) => !value)
              }
              className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[11px] text-white/50 transition hover:bg-white/[0.07] hover:text-white"
            >
              <Settings2 className="h-3.5 w-3.5" />
              Settings
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[11px] font-medium text-white/60 transition hover:bg-white/[0.07] hover:text-white"
            >
              {saved ? (
                <Check className="h-3.5 w-3.5 text-emerald-300" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {saved ? "Saved" : "Save"}
            </button>

            <button
              type="button"
              onClick={handleRun}
              disabled={running}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-3.5 py-2 text-[11px] font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Play className="h-3.5 w-3.5" />
              {running ? "Running..." : "Test Agent"}
            </button>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex min-h-0 flex-1">
          {/* Node Library */}
          {showLibrary && (
            <aside className="hidden w-[245px] shrink-0 border-r border-white/[0.08] bg-[#09090d] lg:block">
              <div className="border-b border-white/[0.06] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xs font-semibold">
                      Node Library
                    </h2>

                    <p className="mt-1 text-[10px] text-white/30">
                      Drag or add building blocks
                    </p>
                  </div>

                  <Layers3 className="h-4 w-4 text-white/25" />
                </div>

                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search nodes..."
                    className="h-9 w-full rounded-lg border border-white/[0.07] bg-black/20 pl-9 pr-3 text-[10px] text-white/70 outline-none placeholder:text-white/20 focus:border-violet-500/40"
                  />
                </div>
              </div>

              <div className="space-y-1.5 overflow-y-auto p-3">
                {filteredLibrary.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => addNode(item)}
                      className="group flex w-full items-center gap-3 rounded-xl border border-transparent bg-white/[0.02] p-3 text-left transition hover:border-violet-500/20 hover:bg-violet-500/[0.05]"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-white/45 transition group-hover:bg-violet-500/10 group-hover:text-violet-300">
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-white/65">
                          {item.title}
                        </p>

                        <p className="mt-1 text-[9px] leading-4 text-white/25">
                          {item.description}
                        </p>
                      </div>

                      <Plus className="h-3.5 w-3.5 text-white/15 transition group-hover:text-violet-300" />
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-white/[0.06] p-3">
                <div className="rounded-xl border border-violet-500/15 bg-violet-500/[0.04] p-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-violet-300" />

                    <span className="text-[10px] font-medium text-violet-200">
                      AI Build
                    </span>
                  </div>

                  <p className="mt-2 text-[9px] leading-4 text-white/30">
                    Describe a workflow and let ModelNow generate
                    the initial canvas.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/agent-builder/creation/create-with-ai",
                      )
                    }
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-violet-500/20 bg-violet-500/[0.08] py-2 text-[9px] font-medium text-violet-300"
                  >
                    Create with AI
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </aside>
          )}

          {/* Canvas */}
          <section className="relative min-w-0 flex-1 overflow-hidden bg-[#07070a]">
            {/* Canvas toolbar */}
            <div className="absolute left-4 right-4 top-4 z-20 flex items-center justify-between">
              <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0b0b10]/90 p-1.5 backdrop-blur">
                <button
                  type="button"
                  onClick={() =>
                    setZoom((value) =>
                      Math.max(50, value - 10),
                    )
                  }
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:bg-white/[0.06] hover:text-white"
                >
                  −
                </button>

                <span className="w-10 text-center text-[10px] text-white/45">
                  {zoom}%
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setZoom((value) =>
                      Math.min(150, value + 10),
                    )
                  }
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:bg-white/[0.06] hover:text-white"
                >
                  +
                </button>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0b0b10]/90 px-3 py-2 backdrop-blur">
                <Activity className="h-3.5 w-3.5 text-emerald-300" />
                <span className="text-[10px] text-white/40">
                  Workflow ready
                </span>
              </div>
            </div>

            {/* Grid */}
            <div
              className="absolute inset-0 overflow-auto"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.09) 1px, transparent 1px)",
                backgroundSize: `${20 * (zoom / 100)}px ${20 * (zoom / 100)}px`,
              }}
            >
              <div
                className="relative min-h-[900px] min-w-[1250px]"
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: "top left",
                }}
              >
                {/* Connection lines */}
                <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
                  {connections.map(([fromId, toId]) => {
                    const from = nodes.find(
                      (node) => node.id === fromId,
                    );
                    const to = nodes.find(
                      (node) => node.id === toId,
                    );

                    if (!from || !to) return null;

                    const startX = from.x + 205;
                    const startY = from.y + 55;
                    const endX = to.x;
                    const endY = to.y + 55;

                    const controlOffset =
                      Math.max(
                        60,
                        Math.abs(endX - startX) / 2,
                      );

                    return (
                      <path
                        key={`${fromId}-${toId}`}
                        d={`M ${startX} ${startY} C ${
                          startX + controlOffset
                        } ${startY}, ${
                          endX - controlOffset
                        } ${endY}, ${endX} ${endY}`}
                        fill="none"
                        stroke="rgba(139,92,246,0.55)"
                        strokeWidth="2"
                      />
                    );
                  })}
                </svg>

                {/* Nodes */}
                {nodes.map((node) => {
                  const Icon = node.icon;
                  const selected = selectedNode === node.id;

                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node.id)}
                      className={`absolute w-[205px] cursor-pointer rounded-xl border bg-[#0c0c11] shadow-2xl transition ${
                        selected
                          ? "border-violet-500/60 shadow-violet-500/10"
                          : "border-white/[0.1] hover:border-white/[0.2]"
                      }`}
                      style={{
                        left: node.x,
                        top: node.y,
                      }}
                    >
                      <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
                            <Icon className="h-3.5 w-3.5" />
                          </div>

                          <span className="text-[10px] font-medium text-white/70">
                            {node.title}
                          </span>
                        </div>

                        <GripVertical className="h-3.5 w-3.5 text-white/15" />
                      </div>

                      <div className="p-3">
                        <p className="text-[9px] leading-4 text-white/30">
                          {node.description}
                        </p>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="rounded-md bg-white/[0.04] px-1.5 py-1 text-[8px] text-white/25">
                            {node.type}
                          </span>

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              connectSelectedTo(node.id);
                            }}
                            className="text-[8px] text-violet-300/60 hover:text-violet-300"
                          >
                            Connect
                          </button>
                        </div>
                      </div>

                      {/* Ports */}
                      {node.type !== "trigger" && (
                        <div className="absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-violet-400/60 bg-[#0c0c11]" />
                      )}

                      {node.type !== "output" && (
                        <div className="absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-violet-400/60 bg-[#0c0c11]" />
                      )}
                    </div>
                  );
                })}

                {/* Empty canvas hint */}
                {nodes.length === 0 && (
                  <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10">
                      <Network className="h-6 w-6 text-violet-300" />
                    </div>

                    <h3 className="mt-4 text-sm font-semibold">
                      Start building your agent
                    </h3>

                    <p className="mt-2 max-w-sm text-xs leading-5 text-white/30">
                      Add nodes from the library to create your first
                      workflow.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Canvas bottom status */}
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0b0b10]/90 px-3 py-2 backdrop-blur">
              <MousePointer2 className="h-3.5 w-3.5 text-white/30" />
              <span className="text-[9px] text-white/35">
                Select a node to configure it
              </span>
            </div>

            {/* Delete selected */}
            {selectedNode && (
              <button
                type="button"
                onClick={deleteSelectedNode}
                className="absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-xl border border-red-500/15 bg-red-500/[0.05] px-3 py-2 text-[9px] text-red-300/70 transition hover:bg-red-500/[0.1] hover:text-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Node
              </button>
            )}
          </section>

          {/* Configuration */}
          {showSettings && (
            <aside className="hidden w-[310px] shrink-0 overflow-y-auto border-l border-white/[0.08] bg-[#09090d] xl:block">
              <div className="border-b border-white/[0.06] p-5">
                <h2 className="text-xs font-semibold">
                  Agent Configuration
                </h2>

                <p className="mt-1 text-[10px] leading-4 text-white/30">
                  Configure the agent and selected workflow node.
                </p>
              </div>

              <div className="space-y-5 p-5">
                {/* Agent */}
                <section>
                  <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-white/25">
                    Agent
                  </h3>

                  <div className="space-y-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                    <div>
                      <label className="mb-1.5 block text-[10px] text-white/40">
                        Agent Name
                      </label>

                      <input
                        value={agentName}
                        onChange={(event) =>
                          setAgentName(event.target.value)
                        }
                        className="h-9 w-full rounded-lg border border-white/[0.08] bg-black/20 px-2.5 text-[11px] text-white/70 outline-none focus:border-violet-500/40"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] text-white/40">
                        Model
                      </label>

                      <div className="relative">
                        <select
                          value={model}
                          onChange={(event) =>
                            setModel(event.target.value)
                          }
                          className="h-9 w-full appearance-none rounded-lg border border-white/[0.08] bg-black/20 px-2.5 pr-8 text-[11px] text-white/70 outline-none focus:border-violet-500/40"
                        >
                          <option>GPT-5.6</option>
                          <option>Claude Sonnet</option>
                          <option>Gemini Pro</option>
                          <option>ModelNow Auto Router</option>
                        </select>

                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
                      </div>
                    </div>

                    <ToggleRow
                      label="Agent Memory"
                      description="Remember useful context."
                      enabled={memoryEnabled}
                      onChange={() =>
                        setMemoryEnabled((value) => !value)
                      }
                    />

                    <ToggleRow
                      label="Human Approval"
                      description="Require approval for sensitive actions."
                      enabled={humanApproval}
                      onChange={() =>
                        setHumanApproval((value) => !value)
                      }
                    />
                  </div>
                </section>

                {/* Selected Node */}
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.13em] text-white/25">
                      Selected Node
                    </h3>

                    {selectedNodeData && (
                      <span className="rounded-md bg-violet-500/10 px-2 py-1 text-[8px] text-violet-300">
                        {selectedNodeData.type}
                      </span>
                    )}
                  </div>

                  {selectedNodeData ? (
                    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
                          <selectedNodeData.icon className="h-4 w-4 text-violet-300" />
                        </div>

                        <div>
                          <p className="text-[11px] font-medium text-white/70">
                            {selectedNodeData.title}
                          </p>

                          <p className="mt-1 text-[9px] text-white/30">
                            {selectedNodeData.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div>
                          <label className="mb-1.5 block text-[9px] text-white/35">
                            Node Name
                          </label>

                          <input
                            value={selectedNodeData.title}
                            onChange={(event) => {
                              const value =
                                event.target.value;

                              setNodes((current) =>
                                current.map((node) =>
                                  node.id === selectedNodeData.id
                                    ? {
                                        ...node,
                                        title: value,
                                      }
                                    : node,
                                ),
                              );
                            }}
                            className="h-8 w-full rounded-lg border border-white/[0.07] bg-black/20 px-2.5 text-[10px] text-white/60 outline-none focus:border-violet-500/40"
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-[9px] text-white/35">
                            Description
                          </label>

                          <textarea
                            value={selectedNodeData.description}
                            onChange={(event) => {
                              const value =
                                event.target.value;

                              setNodes((current) =>
                                current.map((node) =>
                                  node.id === selectedNodeData.id
                                    ? {
                                        ...node,
                                        description: value,
                                      }
                                    : node,
                                ),
                              );
                            }}
                            rows={3}
                            className="w-full resize-none rounded-lg border border-white/[0.07] bg-black/20 px-2.5 py-2 text-[10px] leading-4 text-white/60 outline-none focus:border-violet-500/40"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-white/[0.08] p-5 text-center">
                      <Settings2 className="mx-auto h-5 w-5 text-white/20" />

                      <p className="mt-3 text-[10px] text-white/30">
                        Select a node to configure it.
                      </p>
                    </div>
                  )}
                </section>

                {/* Runtime */}
                <section>
                  <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-white/25">
                    Runtime
                  </h3>

                  <div className="space-y-2 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                    <ConfigInfo
                      icon={<Clock3 className="h-3.5 w-3.5" />}
                      label="Expected latency"
                      value="~1.8s"
                    />

                    <ConfigInfo
                      icon={<Zap className="h-3.5 w-3.5" />}
                      label="Estimated cost"
                      value="$0.004 / run"
                    />

                    <ConfigInfo
                      icon={<Activity className="h-3.5 w-3.5" />}
                      label="Nodes"
                      value={`${nodes.length}`}
                    />

                    <ConfigInfo
                      icon={<GitBranch className="h-3.5 w-3.5" />}
                      label="Connections"
                      value={`${connections.length}`}
                    />
                  </div>
                </section>

                {/* Security */}
                <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                      <ShieldCheck className="h-4 w-4 text-emerald-300" />
                    </div>

                    <div>
                      <p className="text-[10px] font-medium text-white/60">
                        Secure Workflow
                      </p>

                      <p className="mt-1 text-[9px] leading-4 text-white/30">
                        Tool permissions, human approval and governance
                        policies can be applied before deployment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>

        {/* Bottom status */}
        <footer className="flex h-7 shrink-0 items-center justify-between border-t border-white/[0.07] bg-[#08080b] px-4">
          <div className="flex items-center gap-4 text-[9px] text-white/25">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Workflow ready
            </span>

            <span>Visual Builder</span>

            <span>{nodes.length} nodes</span>
          </div>

          <div className="flex items-center gap-4 text-[9px] text-white/25">
            <span>{zoom}%</span>
            <span>ModelNow</span>
          </div>
        </footer>
      </div>

      {/* Test notification */}
      {running && (
        <div className="fixed bottom-10 right-5 z-50 flex items-center gap-3 rounded-xl border border-violet-500/20 bg-[#0d0d13] px-4 py-3 shadow-2xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
            <Play className="h-3.5 w-3.5 animate-pulse text-violet-300" />
          </div>

          <div>
            <p className="text-[11px] font-medium text-white/70">
              Running workflow
            </p>

            <p className="mt-1 text-[9px] text-white/30">
              Executing agent nodes...
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

function ToggleRow({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[10px] font-medium text-white/60">
          {label}
        </p>

        <p className="mt-0.5 text-[9px] text-white/25">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={`relative h-5 w-9 shrink-0 rounded-full transition ${
          enabled ? "bg-violet-600" : "bg-white/10"
        }`}
        aria-label={`Toggle ${label}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            enabled ? "left-[18px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function ConfigInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg px-2 py-2">
      <div className="flex items-center gap-2 text-white/30">
        {icon}
        <span className="text-[9px]">{label}</span>
      </div>

      <span className="text-[9px] text-white/50">
        {value}
      </span>
    </div>
  );
}