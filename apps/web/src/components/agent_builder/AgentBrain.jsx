"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  GitBranch,
  Layers,
  Play,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Target,
  TestTube2,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

const models = [
  {
    id: "gpt-5",
    name: "GPT-5",
    provider: "OpenAI",
    role: "Primary reasoning model",
    latency: "1.2s",
    quality: 96,
    cost: "$0.008 / 1K tokens",
  },
  {
    id: "claude",
    name: "Claude Sonnet",
    provider: "Anthropic",
    role: "Long-context reasoning",
    latency: "1.4s",
    quality: 94,
    cost: "$0.006 / 1K tokens",
  },
  {
    id: "gemini",
    name: "Gemini Pro",
    provider: "Google",
    role: "Multimodal reasoning",
    latency: "1.1s",
    quality: 91,
    cost: "$0.004 / 1K tokens",
  },
];

const capabilities = [
  {
    name: "Planning & Reasoning",
    description: "Break complex goals into executable steps.",
    enabled: true,
    score: 94,
  },
  {
    name: "Tool Selection",
    description: "Select the most appropriate tool for each task.",
    enabled: true,
    score: 91,
  },
  {
    name: "Context Management",
    description: "Maintain relevant conversation and task context.",
    enabled: true,
    score: 89,
  },
  {
    name: "Self Evaluation",
    description: "Evaluate intermediate results before continuing.",
    enabled: true,
    score: 86,
  },
  {
    name: "Error Recovery",
    description: "Recover automatically when an action fails.",
    enabled: true,
    score: 88,
  },
  {
    name: "Multi-Agent Collaboration",
    description: "Delegate tasks to specialized agents.",
    enabled: false,
    score: 0,
  },
];

const reasoningSteps = [
  {
    step: "01",
    title: "Understand Goal",
    description: "Identify the user's objective and required outcome.",
    icon: Target,
    status: "completed",
  },
  {
    step: "02",
    title: "Plan",
    description: "Create an execution plan using available tools.",
    icon: GitBranch,
    status: "completed",
  },
  {
    step: "03",
    title: "Execute",
    description: "Run tools and actions required to complete the task.",
    icon: Zap,
    status: "active",
  },
  {
    step: "04",
    title: "Evaluate",
    description: "Check results and determine whether another step is required.",
    icon: TestTube2,
    status: "pending",
  },
];

const memoryLayers = [
  {
    name: "Conversation Memory",
    description: "Recent messages and active task context.",
    size: "24 KB",
    status: "Active",
  },
  {
    name: "Working Memory",
    description: "Temporary information used during execution.",
    size: "18 KB",
    status: "Active",
  },
  {
    name: "Long-Term Memory",
    description: "Persistent user and application knowledge.",
    size: "142 MB",
    status: "Connected",
  },
  {
    name: "Knowledge Base",
    description: "Retrieved information from connected sources.",
    size: "2.4 GB",
    status: "Connected",
  },
];

function MetricCard({ label, value, detail, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
          <Icon size={16} className="text-slate-700" />
        </div>
      </div>

      <div className="mt-3 text-2xl font-semibold text-slate-900">
        {value}
      </div>

      <div className="mt-1 text-xs text-slate-500">{detail}</div>
    </div>
  );
}

function SectionTitle({ title, description, action }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>

        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      {action}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    active: "bg-blue-50 text-blue-700 border-blue-200",
    pending: "bg-slate-50 text-slate-500 border-slate-200",
    Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Connected: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        styles[status] || "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

export default function AgentBrain() {
  const [selectedModel, setSelectedModel] = useState("gpt-5");
  const [temperature, setTemperature] = useState(0.2);
  const [autoPlanning, setAutoPlanning] = useState(true);
  const [selfEvaluation, setSelfEvaluation] = useState(true);
  const [adaptiveRouting, setAdaptiveRouting] = useState(true);
  const [search, setSearch] = useState("");
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [running, setRunning] = useState(false);

  const activeModel = useMemo(() => {
    return (
      models.find((model) => model.id === selectedModel) || models[0]
    );
  }, [selectedModel]);

  const filteredCapabilities = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return capabilities;
    }

    return capabilities.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }, [search]);

  const runBrainTest = () => {
    setRunning(true);

    setTimeout(() => {
      setRunning(false);
    }, 1400);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <a
                href="/agent-builder"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
              >
                <ArrowLeft size={17} />
              </a>

              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900">
                    <Brain size={18} className="text-white" />
                  </div>

                  <h1 className="text-xl font-semibold">Agent Brain</h1>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Configure how your agent reasons, plans, selects models, and
                  makes decisions.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/agent-builder/intelligence/model-router"
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Model Router
                <ArrowRight size={15} />
              </a>

              <button
                type="button"
                onClick={runBrainTest}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                {running ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <Play size={15} />
                )}

                {running ? "Testing..." : "Run Brain Test"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-6 py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Reasoning quality"
            value="94%"
            detail="+6.2% from previous version"
            icon={Brain}
          />

          <MetricCard
            label="Decision accuracy"
            value="91.8%"
            detail="Across 1,248 evaluations"
            icon={Target}
          />

          <MetricCard
            label="Avg reasoning time"
            value="1.28s"
            detail="-14% after optimization"
            icon={Clock3}
          />

          <MetricCard
            label="Brain status"
            value="Healthy"
            detail="All intelligence modules operational"
            icon={Activity}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle
              title="Reasoning Configuration"
              description="Control the agent's reasoning strategy and decision-making behavior."
              action={
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Settings2 size={14} />
                  Advanced Settings
                </button>
              }
            />

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900">
                      Automatic Planning
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Automatically break complex requests into steps.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAutoPlanning((value) => !value)}
                    className={`relative h-6 w-11 rounded-full transition ${
                      autoPlanning ? "bg-slate-900" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                        autoPlanning ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900">
                      Self Evaluation
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Validate results before completing a task.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelfEvaluation((value) => !value)}
                    className={`relative h-6 w-11 rounded-full transition ${
                      selfEvaluation ? "bg-slate-900" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                        selfEvaluation ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900">
                      Adaptive Model Routing
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Select models dynamically based on task complexity.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAdaptiveRouting((value) => !value)}
                    className={`relative h-6 w-11 rounded-full transition ${
                      adaptiveRouting ? "bg-slate-900" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                        adaptiveRouting ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="font-medium text-slate-900">
                  Reasoning Depth
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {["Fast", "Balanced", "Deep"].map((item, index) => (
                    <button
                      key={item}
                      type="button"
                      className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                        index === 1
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900">
                    Reasoning Temperature
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    Controls response variation during reasoning.
                  </div>
                </div>

                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                  {temperature.toFixed(2)}
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={temperature}
                onChange={(event) =>
                  setTemperature(Number(event.target.value))
                }
                className="mt-4 w-full accent-slate-900"
              />

              <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                <span>Deterministic</span>
                <span>Balanced</span>
                <span>Creative</span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle
              title="Primary Model"
              description="The model used as the agent's main reasoning engine."
            />

            <div className="relative mt-5">
              <button
                type="button"
                onClick={() => setShowModelMenu((value) => !value)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <Brain size={18} />
                  </div>

                  <div>
                    <div className="font-semibold text-slate-900">
                      {activeModel.name}
                    </div>

                    <div className="text-xs text-slate-500">
                      {activeModel.provider} · {activeModel.role}
                    </div>
                  </div>
                </div>

                <ChevronDown size={17} className="text-slate-400" />
              </button>

              {showModelMenu && (
                <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                  {models.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        setSelectedModel(model.id);
                        setShowModelMenu(false);
                      }}
                      className="flex w-full items-center justify-between rounded-lg p-3 text-left hover:bg-slate-50"
                    >
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {model.name}
                        </div>

                        <div className="text-xs text-slate-500">
                          {model.provider}
                        </div>
                      </div>

                      {model.id === selectedModel && (
                        <CheckCircle2
                          size={16}
                          className="text-emerald-600"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <span className="text-xs text-slate-500">Quality</span>
                <span className="text-sm font-semibold">
                  {activeModel.quality}%
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <span className="text-xs text-slate-500">
                  Average latency
                </span>

                <span className="text-sm font-semibold">
                  {activeModel.latency}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <span className="text-xs text-slate-500">
                  Estimated cost
                </span>

                <span className="text-sm font-semibold">
                  {activeModel.cost}
                </span>
              </div>
            </div>

            <a
              href="/agent-builder/intelligence/model-router"
              className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <GitBranch size={17} className="text-slate-700" />

                <div>
                  <div className="text-sm font-medium text-slate-900">
                    Configure Model Router
                  </div>

                  <div className="text-xs text-slate-500">
                    Add fallback and task-based routing.
                  </div>
                </div>
              </div>

              <ArrowRight size={16} className="text-slate-400" />
            </a>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionTitle
            title="Reasoning Pipeline"
            description="The execution process used by the agent brain."
            action={
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                <CheckCircle2 size={14} />
                Pipeline healthy
              </div>
            }
          />

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {reasoningSteps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.step}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                      <Icon size={17} className="text-slate-700" />
                    </div>

                    <StatusBadge status={step.status} />
                  </div>

                  <div className="mt-4 text-xs font-semibold text-slate-400">
                    STEP {step.step}
                  </div>

                  <div className="mt-1 font-semibold text-slate-900">
                    {step.title}
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle
              title="Intelligence Capabilities"
              description="Enable or disable capabilities available to the agent brain."
              action={
                <div className="relative">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search capability..."
                    className="w-52 rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-xs outline-none focus:border-slate-400"
                  />
                </div>
              }
            />

            <div className="mt-5 divide-y divide-slate-100">
              {filteredCapabilities.map((capability) => (
                <div
                  key={capability.name}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                      <Zap size={16} className="text-slate-700" />
                    </div>

                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {capability.name}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {capability.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {capability.enabled && (
                      <span className="text-xs font-medium text-slate-500">
                        {capability.score}%
                      </span>
                    )}

                    <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-800"
                        style={{
                          width: `${capability.score}%`,
                        }}
                      />
                    </div>

                    {capability.enabled ? (
                      <CheckCircle2
                        size={17}
                        className="text-emerald-600"
                      />
                    ) : (
                      <XCircle size={17} className="text-slate-300" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle
              title="Memory & Context"
              description="Information sources available to the agent brain."
            />

            <div className="mt-5 space-y-3">
              {memoryLayers.map((memory) => (
                <div
                  key={memory.name}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                      <Database size={16} className="text-slate-700" />
                    </div>

                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {memory.name}
                      </div>

                      <div className="mt-1 max-w-[280px] text-xs text-slate-500">
                        {memory.description}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <StatusBadge status={memory.status} />

                    <div className="mt-1 text-[11px] text-slate-400">
                      {memory.size}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionTitle
            title="Brain Runtime"
            description="Live health information for the intelligence layer."
          />

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Activity size={14} />
                Active reasoning tasks
              </div>

              <div className="mt-2 text-xl font-semibold">24</div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Users size={14} />
                Active agents
              </div>

              <div className="mt-2 text-xl font-semibold">8</div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Layers size={14} />
                Context utilization
              </div>

              <div className="mt-2 text-xl font-semibold">62%</div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck size={14} />
                Safety checks
              </div>

              <div className="mt-2 text-xl font-semibold">100%</div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-emerald-600" />

                <span className="text-sm font-semibold">
                  Intelligence services healthy
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Reasoning Engine</span>
                  <span className="text-emerald-600">Operational</span>
                </div>

                <div className="flex justify-between">
                  <span>Model Router</span>
                  <span className="text-emerald-600">Operational</span>
                </div>

                <div className="flex justify-between">
                  <span>Memory Manager</span>
                  <span className="text-emerald-600">Operational</span>
                </div>

                <div className="flex justify-between">
                  <span>Evaluation Engine</span>
                  <span className="text-emerald-600">Operational</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle size={17} className="text-amber-500" />

                <span className="text-sm font-semibold">
                  Optimization opportunities
                </span>
              </div>

              <div className="mt-3 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-amber-400" />

                  <div className="text-xs text-slate-600">
                    Context utilization is above the recommended 60% target.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-blue-400" />

                  <div className="text-xs text-slate-600">
                    Adaptive routing could reduce model cost for simple tasks.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-slate-400" />

                  <div className="text-xs text-slate-600">
                    Enable multi-agent collaboration for complex workflows.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <a
            href="/agent-builder/intelligence/planning-reasoning"
            className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-sm"
          >
            <Brain size={18} className="text-slate-700" />

            <div className="mt-3 text-sm font-semibold">
              Planning & Reasoning
            </div>

            <div className="mt-1 text-xs text-slate-500">
              Configure planning strategies and reasoning behavior.
            </div>
          </a>

          <a
            href="/agent-builder/intelligence/prompt-optimization"
            className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-sm"
          >
            <Zap size={18} className="text-slate-700" />

            <div className="mt-3 text-sm font-semibold">
              Prompt Optimization
            </div>

            <div className="mt-1 text-xs text-slate-500">
              Improve prompts for quality, cost, and latency.
            </div>
          </a>

          <a
            href="/agent-builder/intelligence/multi-agent-collaboration"
            className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-sm"
          >
            <Users size={18} className="text-slate-700" />

            <div className="mt-3 text-sm font-semibold">
              Multi-Agent Collaboration
            </div>

            <div className="mt-1 text-xs text-slate-500">
              Coordinate specialist agents for complex tasks.
            </div>
          </a>
        </div>
      </div>
    </main>
  );
}