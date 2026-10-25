"use client";

import { useState } from "react";
import {
  Brain,
  Sparkles,
  Target,
  Lightbulb,
  ShieldCheck,
  Zap,
  Settings2,
  Database,
  MessageSquare,
  Activity,
  ChevronRight,
  Plus,
  SlidersHorizontal,
  CheckCircle2,
} from "lucide-react";

type BrainCapability = {
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  enabled: boolean;
};

type MemoryItem = {
  id: number;
  type: string;
  description: string;
  enabled: boolean;
};

export default function AgentBrainPage() {
  const [agentName, setAgentName] = useState("Customer Support Agent");
  const [model, setModel] = useState("GPT-5.6");
  const [temperature, setTemperature] = useState(0.3);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [reasoning, setReasoning] = useState(true);
  const [planning, setPlanning] = useState(true);
  const [memory, setMemory] = useState(true);
  const [autoOptimize, setAutoOptimize] = useState(true);

  const [capabilities, setCapabilities] = useState<BrainCapability[]>([
    {
      title: "Reasoning",
      description:
        "Analyze complex requests and break problems into logical steps.",
      icon: Brain,
      enabled: true,
    },
    {
      title: "Planning",
      description:
        "Create an execution plan before running multi-step tasks.",
      icon: Target,
      enabled: true,
    },
    {
      title: "Context Awareness",
      description:
        "Use conversation history and relevant context to improve responses.",
      icon: MessageSquare,
      enabled: true,
    },
    {
      title: "Goal Management",
      description:
        "Track the agent's objectives and maintain focus during execution.",
      icon: Target,
      enabled: true,
    },
    {
      title: "Self Optimization",
      description:
        "Automatically improve prompts, routing and execution efficiency.",
      icon: Sparkles,
      enabled: true,
    },
    {
      title: "Safety Guardrails",
      description:
        "Apply configurable safety and policy rules before actions.",
      icon: ShieldCheck,
      enabled: true,
    },
  ]);

  const [memories, setMemories] = useState<MemoryItem[]>([
    {
      id: 1,
      type: "Conversation Memory",
      description: "Remember important information from the current conversation.",
      enabled: true,
    },
    {
      id: 2,
      type: "User Preferences",
      description: "Store relevant user preferences for future interactions.",
      enabled: true,
    },
    {
      id: 3,
      type: "Long-Term Memory",
      description: "Persist selected information across future sessions.",
      enabled: false,
    },
  ]);

  const toggleCapability = (title: string) => {
    setCapabilities((items) =>
      items.map((item) =>
        item.title === title
          ? { ...item, enabled: !item.enabled }
          : item
      )
    );
  };

  const toggleMemory = (id: number) => {
    setMemories((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, enabled: !item.enabled }
          : item
      )
    );
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#111827]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
              <Brain size={23} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">Agent Brain</h1>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                  Intelligence
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Configure reasoning, planning, memory and intelligence for your
                AI agent.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Test Agent
            </button>

            <button className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800">
              <CheckCircle2 size={16} />
              Save Configuration
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-8 py-8">
        {/* Agent configuration */}
        <section className="mb-7 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Agent Configuration</h2>
              <p className="mt-1 text-sm text-gray-500">
                Define the core intelligence configuration of this agent.
              </p>
            </div>

            <Settings2 size={20} className="text-gray-400" />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Agent Name
              </label>

              <input
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Intelligence Model
              </label>

              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-400"
              >
                <option>GPT-5.6</option>
                <option>GPT-5.6 Mini</option>
                <option>Claude Sonnet</option>
                <option>Gemini Pro</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Execution Mode
              </label>

              <select className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-400">
                <option>Autonomous</option>
                <option>Human in the Loop</option>
                <option>Supervised</option>
              </select>
            </div>
          </div>
        </section>

        {/* Main grid */}
        <div className="grid gap-7 xl:grid-cols-[1fr_380px]">
          {/* Left */}
          <div className="space-y-7">
            {/* Brain capabilities */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <Sparkles size={20} />
                  </div>

                  <div>
                    <h2 className="font-semibold">Brain Capabilities</h2>
                    <p className="text-sm text-gray-500">
                      Select the intelligence capabilities available to the
                      agent.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {capabilities.map((capability) => {
                  const Icon = capability.icon;

                  return (
                    <div
                      key={capability.title}
                      className={`rounded-xl border p-5 transition ${
                        capability.enabled
                          ? "border-gray-300 bg-white"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                            <Icon size={19} />
                          </div>

                          <div>
                            <h3 className="text-sm font-semibold">
                              {capability.title}
                            </h3>

                            <p className="mt-1 text-xs leading-5 text-gray-500">
                              {capability.description}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            toggleCapability(capability.title)
                          }
                          className={`relative ml-3 h-6 w-11 shrink-0 rounded-full transition ${
                            capability.enabled
                              ? "bg-black"
                              : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                              capability.enabled
                                ? "left-6"
                                : "left-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Reasoning settings */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Lightbulb size={20} />
                </div>

                <div>
                  <h2 className="font-semibold">Reasoning & Planning</h2>
                  <p className="text-sm text-gray-500">
                    Control how the agent thinks and plans before taking
                    actions.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
                  <div>
                    <p className="text-sm font-medium">Advanced Reasoning</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Allow deeper reasoning for complex tasks.
                    </p>
                  </div>

                  <button
                    onClick={() => setReasoning(!reasoning)}
                    className={`relative h-6 w-11 rounded-full ${
                      reasoning ? "bg-black" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white ${
                        reasoning ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
                  <div>
                    <p className="text-sm font-medium">Task Planning</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Generate a structured execution plan before starting.
                    </p>
                  </div>

                  <button
                    onClick={() => setPlanning(!planning)}
                    className={`relative h-6 w-11 rounded-full ${
                      planning ? "bg-black" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white ${
                        planning ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
                  <div>
                    <p className="text-sm font-medium">Auto Optimization</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Optimize prompts and model selection automatically.
                    </p>
                  </div>

                  <button
                    onClick={() => setAutoOptimize(!autoOptimize)}
                    className={`relative h-6 w-11 rounded-full ${
                      autoOptimize ? "bg-black" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white ${
                        autoOptimize ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Memory */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    <Database size={20} />
                  </div>

                  <div>
                    <h2 className="font-semibold">Agent Memory</h2>
                    <p className="text-sm text-gray-500">
                      Configure what information the agent can remember.
                    </p>
                  </div>
                </div>

                <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium hover:bg-gray-50">
                  <Plus size={14} />
                  Add Memory
                </button>
              </div>

              <div className="space-y-3">
                {memories.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-gray-200 p-4"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.type}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {item.description}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleMemory(item.id)}
                      className={`relative h-6 w-11 rounded-full ${
                        item.enabled ? "bg-black" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white ${
                          item.enabled ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right sidebar */}
          <aside className="space-y-7">
            {/* Brain status */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-semibold">Brain Status</h2>

                <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Active
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-gray-500">Intelligence</span>
                    <span className="font-medium">92%</span>
                  </div>

                  <div className="h-2 rounded-full bg-gray-100">
                    <div className="h-2 w-[92%] rounded-full bg-black" />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-gray-500">Reasoning</span>
                    <span className="font-medium">88%</span>
                  </div>

                  <div className="h-2 rounded-full bg-gray-100">
                    <div className="h-2 w-[88%] rounded-full bg-black" />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-gray-500">Memory</span>
                    <span className="font-medium">74%</span>
                  </div>

                  <div className="h-2 rounded-full bg-gray-100">
                    <div className="h-2 w-[74%] rounded-full bg-black" />
                  </div>
                </div>
              </div>
            </section>

            {/* Model settings */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                  <SlidersHorizontal size={17} />
                </div>

                <div>
                  <h2 className="font-semibold">Model Parameters</h2>
                  <p className="text-xs text-gray-500">
                    Fine-tune agent behavior.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="mb-2 flex justify-between">
                    <label className="text-xs font-medium text-gray-600">
                      Temperature
                    </label>

                    <span className="text-xs font-semibold">
                      {temperature.toFixed(1)}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) =>
                      setTemperature(Number(e.target.value))
                    }
                    className="w-full accent-black"
                  />

                  <div className="mt-1 flex justify-between text-[10px] text-gray-400">
                    <span>Precise</span>
                    <span>Creative</span>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between">
                    <label className="text-xs font-medium text-gray-600">
                      Max Output Tokens
                    </label>

                    <span className="text-xs font-semibold">
                      {maxTokens}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="512"
                    max="8192"
                    step="512"
                    value={maxTokens}
                    onChange={(e) =>
                      setMaxTokens(Number(e.target.value))
                    }
                    className="w-full accent-black"
                  />
                </div>
              </div>
            </section>

            {/* Intelligence pipeline */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-5 font-semibold">Intelligence Pipeline</h2>

              <div className="space-y-3">
                {[
                  {
                    label: "Input",
                    icon: MessageSquare,
                  },
                  {
                    label: "Context",
                    icon: Database,
                  },
                  {
                    label: "Reasoning",
                    icon: Brain,
                  },
                  {
                    label: "Planning",
                    icon: Target,
                  },
                  {
                    label: "Action",
                    icon: Zap,
                  },
                  {
                    label: "Response",
                    icon: Activity,
                  },
                ].map((step, index, array) => {
                  const Icon = step.icon;

                  return (
                    <div key={step.label}>
                      <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-700 shadow-sm">
                          <Icon size={15} />
                        </div>

                        <span className="text-sm font-medium">
                          {step.label}
                        </span>

                        <CheckCircle2
                          size={15}
                          className="ml-auto text-green-500"
                        />
                      </div>

                      {index < array.length - 1 && (
                        <div className="ml-7 h-3 border-l border-dashed border-gray-300" />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Quick actions */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 font-semibold">Quick Actions</h2>

              <div className="space-y-2">
                {[
                  "Open Playground",
                  "Test Reasoning",
                  "View Memory",
                  "Optimize Agent",
                ].map((action) => (
                  <button
                    key={action}
                    className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-left text-sm hover:bg-gray-50"
                  >
                    <span>{action}</span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </button>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}