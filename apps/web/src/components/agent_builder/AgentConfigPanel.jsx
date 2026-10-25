"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Bot,
  Brain,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  GitBranch,
  Info,
  Layers,
  Lock,
  RefreshCw,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

const models = [
  {
    id: "gpt-5",
    name: "GPT-5",
    provider: "OpenAI",
    description: "General-purpose reasoning model",
  },
  {
    id: "claude-sonnet",
    name: "Claude Sonnet",
    provider: "Anthropic",
    description: "Strong reasoning and long-context model",
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    provider: "Google",
    description: "Multimodal and reasoning model",
  },
];

const agentModes = [
  {
    id: "autonomous",
    name: "Autonomous",
    description: "Agent can plan and execute tasks independently",
    icon: Bot,
  },
  {
    id: "guided",
    name: "Guided",
    description: "Agent follows a controlled workflow",
    icon: GitBranch,
  },
  {
    id: "supervised",
    name: "Supervised",
    description: "Human approval is required for critical actions",
    icon: Users,
  },
];

const capabilityOptions = [
  "Planning & Reasoning",
  "Tool Usage",
  "Web Search",
  "Browser Automation",
  "Computer Use",
  "Memory",
  "RAG",
  "Self Evaluation",
  "Error Recovery",
  "Multi-Agent Collaboration",
];

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition ${
        enabled ? "bg-slate-900" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
          enabled ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
        <Icon size={17} className="text-slate-700" />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function StatusPill({ children, tone = "green" }) {
  const styles = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    slate: "border-slate-200 bg-slate-50 text-slate-600",
    red: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        styles[tone]
      }`}
    >
      {children}
    </span>
  );
}

export default function AgentConfigPanel({
  initialConfig,
  onSave,
  onClose,
}) {
  const defaultConfig = {
    name: "Research Agent",
    description: "AI agent for research, analysis, and knowledge tasks.",
    model: "gpt-5",
    mode: "autonomous",
    temperature: 0.2,
    maxTokens: 4096,
    maxSteps: 12,
    timeout: 60,
    memory: true,
    rag: true,
    selfEvaluation: true,
    errorRecovery: true,
    humanApproval: false,
    parallelExecution: true,
    streaming: true,
    guardrails: true,
    logging: true,
    capabilities: [
      "Planning & Reasoning",
      "Tool Usage",
      "Web Search",
      "Memory",
      "RAG",
      "Self Evaluation",
      "Error Recovery",
    ],
    ...initialConfig,
  };

  const [config, setConfig] = useState(defaultConfig);
  const [search, setSearch] = useState("");
  const [modelOpen, setModelOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState("general");

  const selectedModel = useMemo(() => {
    return models.find((model) => model.id === config.model) || models[0];
  }, [config.model]);

  const selectedMode = useMemo(() => {
    return (
      agentModes.find((mode) => mode.id === config.mode) ||
      agentModes[0]
    );
  }, [config.mode]);

  const filteredCapabilities = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return capabilityOptions;
    }

    return capabilityOptions.filter((item) =>
      item.toLowerCase().includes(query)
    );
  }, [search]);

  const updateConfig = (key, value) => {
    setConfig((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
  };

  const toggleCapability = (capability) => {
    setConfig((current) => {
      const exists = current.capabilities.includes(capability);

      return {
        ...current,
        capabilities: exists
          ? current.capabilities.filter((item) => item !== capability)
          : [...current.capabilities, capability],
      };
    });

    setSaved(false);
  };

  const handleSave = () => {
    setSaving(true);
    setSaved(false);

    setTimeout(() => {
      setSaving(false);
      setSaved(true);

      if (typeof onSave === "function") {
        onSave(config);
      }
    }, 700);
  };

  const renderSection = () => {
    if (activeSection === "general") {
      return (
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeader
              icon={Bot}
              title="General Configuration"
              description="Define the identity and purpose of your AI agent."
            />

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600">
                  Agent Name
                </label>

                <input
                  value={config.name}
                  onChange={(event) =>
                    updateConfig("name", event.target.value)
                  }
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  placeholder="Enter agent name"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">
                  Description
                </label>

                <textarea
                  value={config.description}
                  onChange={(event) =>
                    updateConfig("description", event.target.value)
                  }
                  rows={4}
                  className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  placeholder="Describe what this agent does"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">
                  Agent Mode
                </label>

                <div className="relative mt-2">
                  <button
                    type="button"
                    onClick={() => setModeOpen((value) => !value)}
                    className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-3 text-left hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                        <selectedMode.icon size={17} />
                      </div>

                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {selectedMode.name}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {selectedMode.description}
                        </div>
                      </div>
                    </div>

                    <ChevronDown size={16} className="text-slate-400" />
                  </button>

                  {modeOpen && (
                    <div className="absolute z-30 mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                      {agentModes.map((mode) => {
                        const Icon = mode.icon;

                        return (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => {
                              updateConfig("mode", mode.id);
                              setModeOpen(false);
                            }}
                            className="flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-slate-50"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                              <Icon size={15} />
                            </div>

                            <div className="flex-1">
                              <div className="text-sm font-medium text-slate-900">
                                {mode.name}
                              </div>

                              <div className="text-xs text-slate-500">
                                {mode.description}
                              </div>
                            </div>

                            {config.mode === mode.id && (
                              <CheckCircle2
                                size={16}
                                className="text-emerald-600"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeader
              icon={Brain}
              title="Model Configuration"
              description="Choose the primary intelligence model for this agent."
            />

            <div className="relative">
              <button
                type="button"
                onClick={() => setModelOpen((value) => !value)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <Brain size={18} />
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {selectedModel.name}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      {selectedModel.provider} · {selectedModel.description}
                    </div>
                  </div>
                </div>

                <ChevronDown size={17} className="text-slate-400" />
              </button>

              {modelOpen && (
                <div className="absolute z-30 mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                  {models.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        updateConfig("model", model.id);
                        setModelOpen(false);
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

                      {config.model === model.id && (
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

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-[11px] text-slate-500">Latency</div>
                <div className="mt-1 text-sm font-semibold">
                  {selectedModel.id === "gpt-5"
                    ? "1.2s"
                    : selectedModel.id === "claude-sonnet"
                    ? "1.4s"
                    : "1.1s"}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-[11px] text-slate-500">
                  Context
                </div>
                <div className="mt-1 text-sm font-semibold">Large</div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-[11px] text-slate-500">Status</div>
                <div className="mt-1 text-sm font-semibold text-emerald-600">
                  Available
                </div>
              </div>
            </div>
          </section>
        </div>
      );
    }

    if (activeSection === "parameters") {
      return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeader
            icon={SlidersHorizontal}
            title="Runtime Parameters"
            description="Control model behavior, execution limits, and response generation."
          />

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-900">
                    Temperature
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    Lower values produce more deterministic responses.
                  </div>
                </div>

                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium">
                  {Number(config.temperature).toFixed(2)}
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.temperature}
                onChange={(event) =>
                  updateConfig(
                    "temperature",
                    Number(event.target.value)
                  )
                }
                className="mt-4 w-full accent-slate-900"
              />

              <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                <span>Deterministic</span>
                <span>Balanced</span>
                <span>Creative</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">
                Maximum Tokens
              </label>

              <input
                type="number"
                min="256"
                max="32768"
                value={config.maxTokens}
                onChange={(event) =>
                  updateConfig(
                    "maxTokens",
                    Number(event.target.value)
                  )
                }
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">
                Maximum Agent Steps
              </label>

              <input
                type="number"
                min="1"
                max="100"
                value={config.maxSteps}
                onChange={(event) =>
                  updateConfig(
                    "maxSteps",
                    Number(event.target.value)
                  )
                }
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">
                Execution Timeout
              </label>

              <div className="relative mt-2">
                <Clock3
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="number"
                  min="5"
                  max="600"
                  value={config.timeout}
                  onChange={(event) =>
                    updateConfig(
                      "timeout",
                      Number(event.target.value)
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-14 text-sm outline-none focus:border-slate-400"
                />

                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  sec
                </span>
              </div>
            </div>
          </div>
        </section>
      );
    }

    if (activeSection === "capabilities") {
      return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeader
            icon={Zap}
            title="Agent Capabilities"
            description="Choose the intelligence and execution capabilities available to the agent."
          />

          <div className="relative mb-4">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search capabilities..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <div className="divide-y divide-slate-100">
            {filteredCapabilities.map((capability) => {
              const enabled = config.capabilities.includes(capability);

              return (
                <div
                  key={capability}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                      <Zap size={16} className="text-slate-700" />
                    </div>

                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {capability}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {enabled
                          ? "Enabled for this agent"
                          : "Currently disabled"}
                      </div>
                    </div>
                  </div>

                  <Toggle
                    enabled={enabled}
                    onChange={() => toggleCapability(capability)}
                  />
                </div>
              );
            })}
          </div>
        </section>
      );
    }

    if (activeSection === "memory") {
      return (
        <section className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeader
              icon={Database}
              title="Memory & Context"
              description="Configure how the agent stores and retrieves information."
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <Database size={18} className="text-slate-700" />

                  <div>
                    <div className="text-sm font-medium">
                      Conversation Memory
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Keep recent user conversation context.
                    </div>
                  </div>
                </div>

                <Toggle
                  enabled={config.memory}
                  onChange={() =>
                    updateConfig("memory", !config.memory)
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <Brain size={18} className="text-slate-700" />

                  <div>
                    <div className="text-sm font-medium">
                      RAG Knowledge
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Retrieve information from connected knowledge bases.
                    </div>
                  </div>
                </div>

                <Toggle
                  enabled={config.rag}
                  onChange={() => updateConfig("rag", !config.rag)}
                />
              </div>
            </div>
          </section>
        </section>
      );
    }

    if (activeSection === "safety") {
      return (
        <section className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeader
              icon={ShieldCheck}
              title="Security & Safety"
              description="Protect the agent with runtime controls and governance policies."
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-slate-700" />

                  <div>
                    <div className="text-sm font-medium">
                      Guardrails
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Apply safety and validation policies.
                    </div>
                  </div>
                </div>

                <Toggle
                  enabled={config.guardrails}
                  onChange={() =>
                    updateConfig("guardrails", !config.guardrails)
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-slate-700" />

                  <div>
                    <div className="text-sm font-medium">
                      Human Approval
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Require human confirmation for sensitive actions.
                    </div>
                  </div>
                </div>

                <Toggle
                  enabled={config.humanApproval}
                  onChange={() =>
                    updateConfig(
                      "humanApproval",
                      !config.humanApproval
                    )
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <Activity size={18} className="text-slate-700" />

                  <div>
                    <div className="text-sm font-medium">
                      Execution Logging
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Record runtime activity for observability.
                    </div>
                  </div>
                </div>

                <Toggle
                  enabled={config.logging}
                  onChange={() =>
                    updateConfig("logging", !config.logging)
                  }
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex gap-3">
              <Info size={17} className="mt-0.5 text-amber-600" />

              <div>
                <div className="text-sm font-semibold text-amber-900">
                  Production safety
                </div>

                <p className="mt-1 text-xs leading-5 text-amber-800">
                  Human approval and guardrails are recommended for actions
                  that can modify external systems or sensitive data.
                </p>
              </div>
            </div>
          </section>
        </section>
      );
    }

    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionHeader
          icon={Settings2}
          title="Advanced Configuration"
          description="Additional execution and orchestration settings."
        />

        <div className="space-y-3">
          {[
            ["Parallel Execution", "parallelExecution"],
            ["Streaming Responses", "streaming"],
            ["Error Recovery", "errorRecovery"],
            ["Self Evaluation", "selfEvaluation"],
          ].map(([label, key]) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
            >
              <div className="text-sm font-medium">{label}</div>

              <Toggle
                enabled={Boolean(config[key])}
                onChange={() => updateConfig(key, !config[key])}
              />
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="w-full bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
              <Settings2 size={18} className="text-white" />
            </div>

            <div>
              <div className="text-lg font-semibold text-slate-900">
                Agent Configuration
              </div>

              <div className="text-xs text-slate-500">
                Configure the selected agent and runtime behavior.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saved && (
              <StatusPill>
                <CheckCircle2 size={12} className="mr-1 inline" />
                Saved
              </StatusPill>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              {saving ? (
                <RefreshCw size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}

              {saving ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid min-h-[650px] grid-cols-1 xl:grid-cols-[230px_1fr]">
        <aside className="border-b border-slate-200 bg-white p-3 xl:border-b-0 xl:border-r">
          <div className="mb-3 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Configuration
          </div>

          <div className="space-y-1">
            {[
              {
                id: "general",
                label: "General",
                icon: Bot,
              },
              {
                id: "parameters",
                label: "Parameters",
                icon: SlidersHorizontal,
              },
              {
                id: "capabilities",
                label: "Capabilities",
                icon: Zap,
              },
              {
                id: "memory",
                label: "Memory & Context",
                icon: Database,
              },
              {
                id: "safety",
                label: "Security & Safety",
                icon: ShieldCheck,
              },
              {
                id: "advanced",
                label: "Advanced",
                icon: Settings2,
              },
            ].map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-emerald-600" />

              <span className="text-xs font-semibold text-slate-800">
                Agent Runtime
              </span>
            </div>

            <div className="mt-3 space-y-2 text-[11px] text-slate-500">
              <div className="flex justify-between">
                <span>Status</span>
                <span className="font-medium text-emerald-600">
                  Healthy
                </span>
              </div>

              <div className="flex justify-between">
                <span>Version</span>
                <span className="font-medium text-slate-700">
                  v1.4.0
                </span>
              </div>

              <div className="flex justify-between">
                <span>Environment</span>
                <span className="font-medium text-slate-700">
                  Production
                </span>
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0 bg-slate-50 p-5">
          <div className="mx-auto max-w-4xl">{renderSection()}</div>
        </section>
      </div>
    </div>
  );
}