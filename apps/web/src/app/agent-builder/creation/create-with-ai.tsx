"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  Brain,
  Check,
  ChevronDown,
  Code2,
  Database,
  Globe,
  Loader2,
  MessageSquare,
  Network,
  Plus,
  ShieldCheck,
  Sparkles,
  Wand2,
  Wrench,
  X,
  Zap,
} from "lucide-react";

type AgentType =
  | "customer-support"
  | "research"
  | "sales"
  | "data"
  | "coding"
  | "custom";

type ModelOption = {
  id: string;
  name: string;
  provider: string;
  description: string;
};

type GeneratedAgent = {
  name: string;
  description: string;
  goal: string;
  instructions: string;
  model: string;
  tools: string[];
  memory: string;
};

const models: ModelOption[] = [
  {
    id: "auto",
    name: "Auto",
    provider: "ModelNow Router",
    description: "Automatically selects the best model for each task.",
  },
  {
    id: "fast",
    name: "Fast Model",
    provider: "ModelNow",
    description: "Optimized for low latency and high-volume tasks.",
  },
  {
    id: "reasoning",
    name: "Reasoning Model",
    provider: "ModelNow",
    description: "Optimized for complex planning and reasoning.",
  },
  {
    id: "quality",
    name: "Quality Model",
    provider: "ModelNow",
    description: "Optimized for high-quality responses.",
  },
];

const agentTypes: {
  id: AgentType;
  title: string;
  description: string;
  icon: typeof Bot;
}[] = [
  {
    id: "customer-support",
    title: "Customer Support",
    description: "Answers customer questions and resolves support requests.",
    icon: MessageSquare,
  },
  {
    id: "research",
    title: "Research Agent",
    description: "Searches information, analyzes sources and creates reports.",
    icon: Globe,
  },
  {
    id: "sales",
    title: "Sales Agent",
    description: "Qualifies leads and assists sales workflows.",
    icon: Zap,
  },
  {
    id: "data",
    title: "Data Analyst",
    description: "Analyzes datasets and produces business insights.",
    icon: Database,
  },
  {
    id: "coding",
    title: "Coding Agent",
    description: "Writes, reviews and explains software code.",
    icon: Code2,
  },
  {
    id: "custom",
    title: "Custom Agent",
    description: "Describe any agent you want ModelNow to build.",
    icon: Wand2,
  },
];

const availableTools = [
  {
    id: "web-search",
    name: "Web Search",
    description: "Search the web for current information.",
    icon: Globe,
  },
  {
    id: "knowledge",
    name: "Knowledge Base",
    description: "Search connected documents and RAG sources.",
    icon: Database,
  },
  {
    id: "api",
    name: "REST APIs",
    description: "Call approved external APIs.",
    icon: Network,
  },
  {
    id: "browser",
    name: "Browser Automation",
    description: "Automate approved browser workflows.",
    icon: Globe,
  },
  {
    id: "code",
    name: "Code Execution",
    description: "Execute approved code for data and computation.",
    icon: Code2,
  },
  {
    id: "mcp",
    name: "MCP Tools",
    description: "Connect Model Context Protocol tools.",
    icon: Wrench,
  },
];

export default function CreateWithAIPage() {
  const [prompt, setPrompt] = useState("");
  const [agentType, setAgentType] = useState<AgentType>("custom");
  const [model, setModel] = useState("auto");
  const [selectedTools, setSelectedTools] = useState<string[]>([
    "web-search",
  ]);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [longTermMemory, setLongTermMemory] = useState(false);
  const [humanApproval, setHumanApproval] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAgent, setGeneratedAgent] =
    useState<GeneratedAgent | null>(null);
  const [error, setError] = useState("");

  const selectedModel = useMemo(
    () => models.find((item) => item.id === model) ?? models[0],
    [model],
  );

  function toggleTool(toolId: string) {
    setSelectedTools((current) =>
      current.includes(toolId)
        ? current.filter((item) => item !== toolId)
        : [...current, toolId],
    );
  }

  function getDefaultPrompt() {
    const type = agentTypes.find((item) => item.id === agentType);

    return `Create a ${type?.title ?? "Custom Agent"} that can ${
      type?.description.toLowerCase() ??
      "help users complete business tasks autonomously"
    }.`;
  }

  function generateAgent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const finalPrompt = prompt.trim() || getDefaultPrompt();

    if (!finalPrompt) {
      setError("Describe what you want your agent to do.");
      return;
    }

    setError("");
    setIsGenerating(true);
    setGeneratedAgent(null);

    window.setTimeout(() => {
      const type = agentTypes.find((item) => item.id === agentType);

      const toolNames = selectedTools
        .map(
          (toolId) =>
            availableTools.find((tool) => tool.id === toolId)?.name,
        )
        .filter(Boolean) as string[];

      setGeneratedAgent({
        name:
          type?.title === "Custom Agent"
            ? "New ModelNow Agent"
            : `${type?.title} Agent`,
        description: finalPrompt,
        goal: finalPrompt,
        instructions:
          "Understand the user's goal, plan the required steps, select the appropriate tools, execute approved actions, validate the result, and return a clear final response.",
        model: selectedModel.name,
        tools: toolNames,
        memory: memoryEnabled
          ? longTermMemory
            ? "Short-term + long-term memory"
            : "Short-term memory"
          : "Memory disabled",
      });

      setIsGenerating(false);
    }, 1200);
  }

  function clearPrompt() {
    setPrompt("");
    setError("");
    setGeneratedAgent(null);
  }

  return (
    <main className="min-h-screen bg-[#0b0d10] text-white">
      <div className="border-b border-white/10 bg-[#0b0d10]/95 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15">
                <Sparkles className="h-5 w-5 text-violet-400" />
              </div>

              <div>
                <h1 className="text-lg font-semibold">
                  Create Agent with AI
                </h1>
                <p className="text-xs text-gray-500">
                  Describe your agent and ModelNow will generate its architecture.
                </p>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
              AI Builder
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-gray-400">
              Draft
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-6 lg:grid-cols-[280px_minmax(0,1fr)_340px]">
        {/* LEFT PANEL */}
        <aside className="rounded-2xl border border-white/10 bg-[#101318] p-4">
          <div className="mb-5">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">
              Agent Creation
            </p>

            <h2 className="text-sm font-semibold">
              What are you building?
            </h2>
          </div>

          <div className="space-y-2">
            {agentTypes.map((type) => {
              const Icon = type.icon;
              const active = agentType === type.id;

              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setAgentType(type.id)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    active
                      ? "border-violet-500/40 bg-violet-500/10"
                      : "border-transparent bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        active
                          ? "bg-violet-500/20 text-violet-400"
                          : "bg-white/[0.05] text-gray-400"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm font-medium">{type.title}</div>
                      <div className="mt-1 text-[11px] leading-4 text-gray-500">
                        {type.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* CENTER */}
        <section className="min-w-0">
          <form onSubmit={generateAgent}>
            <div className="rounded-2xl border border-white/10 bg-[#101318] p-5">
              <div className="mb-5">
                <div className="mb-2 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-violet-400" />
                  <h2 className="font-semibold">Describe your agent</h2>
                </div>

                <p className="text-sm text-gray-500">
                  Tell ModelNow what the agent should achieve. The AI builder
                  will turn the description into goals, instructions, tools,
                  memory and workflow configuration.
                </p>
              </div>

              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Example: Build an AI customer support agent that reads our product documentation, searches the knowledge base, answers customer questions, creates support tickets when necessary, and asks for human approval before making account changes."
                  className="min-h-[210px] w-full resize-none rounded-xl border border-white/10 bg-[#0b0d10] p-4 pr-12 text-sm leading-6 text-white outline-none transition placeholder:text-gray-600 focus:border-violet-500/50"
                />

                {prompt && (
                  <button
                    type="button"
                    onClick={clearPrompt}
                    className="absolute right-3 top-3 rounded-lg p-2 text-gray-500 hover:bg-white/5 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {error && (
                <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                  {error}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  "Build a research agent",
                  "Create a support agent",
                  "Create a sales agent",
                  "Build a data analyst",
                ].map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setPrompt(example)}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-gray-400 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    {example}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Sparkles className="h-4 w-4 text-violet-400" />
                  AI will generate the initial agent architecture
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Building...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Generate Agent
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* GENERATED AGENT */}
          {generatedAgent && (
            <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-[#101318]">
              <div className="flex items-center justify-between border-b border-white/10 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                    <Check className="h-5 w-5 text-emerald-400" />
                  </div>

                  <div>
                    <h2 className="font-semibold">
                      {generatedAgent.name}
                    </h2>
                    <p className="text-xs text-gray-500">
                      Initial architecture generated successfully
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs hover:bg-white/[0.06]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add to Builder
                </button>
              </div>

              <div className="grid gap-4 p-5 md:grid-cols-2">
                <GeneratedCard
                  icon={Bot}
                  title="Agent Goal"
                  value={generatedAgent.goal}
                />

                <GeneratedCard
                  icon={Brain}
                  title="Agent Brain"
                  value={generatedAgent.instructions}
                />

                <GeneratedCard
                  icon={Zap}
                  title="Model Router"
                  value={generatedAgent.model}
                />

                <GeneratedCard
                  icon={Wrench}
                  title="Tools"
                  value={
                    generatedAgent.tools.length
                      ? generatedAgent.tools.join(", ")
                      : "No tools selected"
                  }
                />

                <GeneratedCard
                  icon={Database}
                  title="Memory"
                  value={generatedAgent.memory}
                />

                <GeneratedCard
                  icon={Sparkles}
                  title="Next Step"
                  value="Open Visual Builder to refine the generated workflow."
                />
              </div>

              <div className="border-t border-white/10 p-5">
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium hover:bg-violet-500"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Open Visual Builder
                  </button>

                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm hover:bg-white/[0.06]"
                  >
                    <Code2 className="h-4 w-4" />
                    Open Pro-Code
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* RIGHT PANEL */}
        <aside className="space-y-4">
          {/* MODEL */}
          <div className="rounded-2xl border border-white/10 bg-[#101318] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-medium">Model Router</span>
              </div>

              <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-400">
                Active
              </span>
            </div>

            <div className="relative">
              <select
                value={model}
                onChange={(event) => setModel(event.target.value)}
                className="w-full appearance-none rounded-xl border border-white/10 bg-[#0b0d10] px-3 py-3 pr-10 text-sm outline-none focus:border-violet-500/40"
              >
                {models.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-gray-500" />
            </div>

            <p className="mt-2 text-[11px] leading-4 text-gray-500">
              {selectedModel.description}
            </p>
          </div>

          {/* TOOLS */}
          <div className="rounded-2xl border border-white/10 bg-[#101318] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-medium">Tools & Actions</span>
              </div>

              <span className="text-[11px] text-gray-500">
                {selectedTools.length} selected
              </span>
            </div>

            <div className="space-y-2">
              {availableTools.map((tool) => {
                const Icon = tool.icon;
                const selected = selectedTools.includes(tool.id);

                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => toggleTool(tool.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                      selected
                        ? "border-violet-500/30 bg-violet-500/10"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        selected
                          ? "bg-violet-500/20 text-violet-400"
                          : "bg-white/[0.05] text-gray-500"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium">{tool.name}</div>
                      <div className="mt-0.5 text-[10px] text-gray-500">
                        {tool.description}
                      </div>
                    </div>

                    {selected && (
                      <Check className="h-4 w-4 text-violet-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* MEMORY */}
          <div className="rounded-2xl border border-white/10 bg-[#101318] p-4">
            <div className="mb-4 flex items-center gap-2">
              <Database className="h-4 w-4 text-violet-400" />
              <span className="text-sm font-medium">Knowledge & Memory</span>
            </div>

            <ToggleRow
              label="Memory"
              description="Remember context during conversations."
              checked={memoryEnabled}
              onChange={setMemoryEnabled}
            />

            <ToggleRow
              label="Long-term Memory"
              description="Persist useful information across sessions."
              checked={longTermMemory}
              onChange={setLongTermMemory}
            />
          </div>

          {/* GOVERNANCE */}
          <div className="rounded-2xl border border-white/10 bg-[#101318] p-4">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-violet-400" />
              <span className="text-sm font-medium">
                Security & Governance
              </span>
            </div>

            <ToggleRow
              label="Human Approval"
              description="Require approval before sensitive actions."
              checked={humanApproval}
              onChange={setHumanApproval}
            />

            <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <div className="flex items-center gap-2 text-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-gray-300">Default guardrails</span>
              </div>

              <p className="mt-1 text-[10px] leading-4 text-gray-500">
                Tool permissions and sensitive actions can be configured after
                generation.
              </p>
            </div>
          </div>

          {/* ADVANCED */}
          <div className="rounded-2xl border border-white/10 bg-[#101318]">
            <button
              type="button"
              onClick={() => setShowAdvanced((value) => !value)}
              className="flex w-full items-center justify-between p-4"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-medium">
                  Advanced Intelligence
                </span>
              </div>

              <ChevronDown
                className={`h-4 w-4 text-gray-500 transition ${
                  showAdvanced ? "rotate-180" : ""
                }`}
              />
            </button>

            {showAdvanced && (
              <div className="space-y-2 border-t border-white/10 p-4">
                <AdvancedItem
                  icon={Brain}
                  title="Planning & Reasoning"
                  description="Enable multi-step planning."
                />

                <AdvancedItem
                  icon={Zap}
                  title="Prompt Optimization"
                  description="Optimize instructions automatically."
                />

                <AdvancedItem
                  icon={Database}
                  title="Context Optimization"
                  description="Reduce unnecessary context and tokens."
                />

                <AdvancedItem
                  icon={Network}
                  title="Multi-Agent Collaboration"
                  description="Allow specialized sub-agents."
                />
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}

function GeneratedCard({
  icon: Icon,
  title,
  value,
}: {
  icon: typeof Bot;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-violet-400" />
        <span className="text-xs font-medium text-gray-300">{title}</span>
      </div>

      <p className="text-xs leading-5 text-gray-500">{value}</p>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/5 py-3 last:border-0">
      <div>
        <div className="text-xs font-medium text-gray-300">{label}</div>
        <div className="mt-1 text-[10px] leading-4 text-gray-500">
          {description}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        aria-label={label}
        className={`relative h-5 w-9 shrink-0 rounded-full transition ${
          checked ? "bg-violet-600" : "bg-white/10"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-[18px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function AdvancedItem({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Brain;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-left transition hover:bg-white/[0.05]"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
        <Icon className="h-4 w-4 text-violet-400" />
      </div>

      <div>
        <div className="text-xs font-medium text-gray-300">{title}</div>
        <div className="mt-1 text-[10px] text-gray-500">{description}</div>
      </div>
    </button>
  );
}