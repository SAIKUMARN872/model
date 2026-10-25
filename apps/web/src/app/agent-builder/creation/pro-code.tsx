"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Code2,
  Copy,
  Database,
  ExternalLink,
  FileCode2,
  GitBranch,
  KeyRound,
  Layers3,
  Play,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trash2,
  Wrench,
  X,
  Zap,
} from "lucide-react";

type ToolItem = {
  id: string;
  name: string;
  description: string;
  category: string;
};

type CodeFile = {
  id: string;
  name: string;
  language: string;
  content: string;
};

const tools: ToolItem[] = [
  {
    id: "web-search",
    name: "Web Search",
    description: "Search the web from the agent.",
    category: "Search",
  },
  {
    id: "browser",
    name: "Browser Automation",
    description: "Automate approved browser tasks.",
    category: "Automation",
  },
  {
    id: "rest",
    name: "REST API",
    description: "Connect external APIs.",
    category: "Integration",
  },
  {
    id: "database",
    name: "Database",
    description: "Query approved databases.",
    category: "Data",
  },
  {
    id: "code",
    name: "Code Execution",
    description: "Execute controlled code tasks.",
    category: "Developer",
  },
  {
    id: "mcp",
    name: "MCP",
    description: "Connect Model Context Protocol tools.",
    category: "Tools",
  },
];

const defaultCode = `import { ModelNowAgent } from "@modelnow/sdk";

const agent = new ModelNowAgent({
  name: "Research Agent",
  model: "gpt-5.6",
  instructions: \`
    You are an enterprise research agent.

    Analyze the user's request,
    gather reliable information,
    reason over the available context,
    and return a concise answer.
  \`,
  tools: [
    "web-search",
    "rest",
  ],
  memory: {
    enabled: true,
  },
});

export default agent;
`;

const runtimeCode = `const result = await agent.run({
  input: "Research the latest market trends",
});

console.log(result);
`;

export default function ProCodeBuilderPage() {
  const router = useRouter();

  const [agentName, setAgentName] = useState("Research Agent");
  const [model, setModel] = useState("GPT-5.6");
  const [framework, setFramework] = useState("ModelNow SDK");
  const [runtime, setRuntime] = useState("Node.js");
  const [temperature, setTemperature] = useState("0.2");

  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  const [humanApproval, setHumanApproval] = useState(false);

  const [selectedTools, setSelectedTools] = useState<string[]>([
    "web-search",
    "rest",
  ]);

  const [files, setFiles] = useState<CodeFile[]>([
    {
      id: "agent",
      name: "agent.ts",
      language: "TypeScript",
      content: defaultCode,
    },
    {
      id: "runtime",
      name: "run.ts",
      language: "TypeScript",
      content: runtimeCode,
    },
  ]);

  const [activeFile, setActiveFile] = useState("agent");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [running, setRunning] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const currentFile = useMemo(
    () => files.find((file) => file.id === activeFile) ?? files[0],
    [activeFile, files],
  );

  const toggleTool = (toolId: string) => {
    setSelectedTools((current) =>
      current.includes(toolId)
        ? current.filter((id) => id !== toolId)
        : [...current, toolId],
    );
  };

  const updateCurrentFile = (content: string) => {
    setFiles((current) =>
      current.map((file) =>
        file.id === activeFile ? { ...file, content } : file,
      ),
    );
  };

  const handleCopy = async () => {
    if (!currentFile) return;

    await navigator.clipboard.writeText(currentFile.content);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1600);
  };

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 1800);
  };

  const handleRun = async () => {
    setRunning(true);

    await new Promise((resolve) => setTimeout(resolve, 1400));

    setRunning(false);
  };

  const addFile = () => {
    const id = `file-${Date.now()}`;

    setFiles((current) => [
      ...current,
      {
        id,
        name: "new-agent.ts",
        language: "TypeScript",
        content: `export default async function runAgent() {\n  return "Hello from ModelNow";\n}\n`,
      },
    ]);

    setActiveFile(id);
  };

  const deleteCurrentFile = () => {
    if (!currentFile || files.length === 1) return;

    const remaining = files.filter(
      (file) => file.id !== currentFile.id,
    );

    setFiles(remaining);
    setActiveFile(remaining[0].id);
  };

  const generatedAgentCode = `import { ModelNowAgent } from "@modelnow/sdk";

const agent = new ModelNowAgent({
  name: "${agentName}",
  model: "${model.toLowerCase().replace(/\s+/g, "-")}",
  temperature: ${temperature},
  memory: {
    enabled: ${memoryEnabled},
  },
  streaming: ${streamingEnabled},
  humanApproval: ${humanApproval},
  tools: [
${selectedTools.map((tool) => `    "${tool}",`).join("\n")}
  ],
});

export default agent;
`;

  const insertGeneratedConfig = () => {
    setFiles((current) =>
      current.map((file) =>
        file.id === "agent"
          ? {
              ...file,
              content: generatedAgentCode,
            }
          : file,
      ),
    );

    setActiveFile("agent");
  };

  return (
    <main className="min-h-screen bg-[#07070a] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-white/[0.08] px-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/50 transition hover:bg-white/[0.07] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
              <Code2 className="h-5 w-5 text-violet-300" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold">
                  Pro-Code Builder
                </h1>

                <span className="rounded-full border border-violet-500/20 bg-violet-500/[0.07] px-2 py-0.5 text-[9px] font-medium text-violet-300">
                  PRO
                </span>
              </div>

              <p className="text-[11px] text-white/30">
                Production-grade agent development environment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-[10px] text-white/40 md:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Local workspace
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/65 transition hover:bg-white/[0.07] hover:text-white"
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
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Play className="h-3.5 w-3.5" />
              {running ? "Running..." : "Run Agent"}
            </button>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex min-h-0 flex-1">
          {/* Left Explorer */}
          <aside className="hidden w-[235px] shrink-0 border-r border-white/[0.08] bg-[#09090d] lg:block">
            <div className="border-b border-white/[0.06] px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">
                  Explorer
                </span>

                <button
                  type="button"
                  onClick={addFile}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-white/30 transition hover:bg-white/[0.06] hover:text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="p-2">
              <div className="mb-2 flex items-center gap-2 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/25">
                <ChevronDown className="h-3 w-3" />
                agent
              </div>

              <div className="space-y-0.5">
                {files.map((file) => {
                  const active = activeFile === file.id;

                  return (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => setActiveFile(file.id)}
                      className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left transition ${
                        active
                          ? "bg-violet-500/10 text-violet-300"
                          : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"
                      }`}
                    >
                      <FileCode2 className="h-3.5 w-3.5" />
                      <span className="text-xs">{file.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 border-t border-white/[0.06] p-4">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-white/25">
                <GitBranch className="h-3.5 w-3.5" />
                Source Control
              </div>

              <div className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="text-[10px] text-white/40">
                  main
                </p>

                <p className="mt-1 text-[10px] text-emerald-300/70">
                  Working tree clean
                </p>
              </div>
            </div>
          </aside>

          {/* Editor */}
          <section className="flex min-w-0 flex-1 flex-col bg-[#08080b]">
            {/* Tabs */}
            <div className="flex h-10 shrink-0 items-center border-b border-white/[0.07] bg-[#0a0a0e]">
              {files.map((file) => {
                const active = activeFile === file.id;

                return (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => setActiveFile(file.id)}
                    className={`flex h-full items-center gap-2 border-r border-white/[0.06] px-4 text-[11px] ${
                      active
                        ? "border-t-2 border-t-violet-500 bg-[#08080b] text-white/80"
                        : "text-white/35 hover:text-white/60"
                    }`}
                  >
                    <FileCode2 className="h-3.5 w-3.5 text-blue-300/70" />
                    {file.name}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={addFile}
                className="ml-1 flex h-7 w-7 items-center justify-center rounded-md text-white/25 transition hover:bg-white/[0.05] hover:text-white"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>

              <div className="ml-auto flex items-center gap-1 pr-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex h-7 items-center gap-1.5 rounded-md px-2 text-[10px] text-white/35 transition hover:bg-white/[0.05] hover:text-white/70"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? "Copied" : "Copy"}
                </button>

                <button
                  type="button"
                  onClick={deleteCurrentFile}
                  disabled={files.length === 1}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-white/25 transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Editor body */}
            <div className="min-h-0 flex-1 overflow-auto">
              <div className="flex min-h-full">
                <div className="w-12 shrink-0 select-none border-r border-white/[0.04] bg-[#07070a] py-5 text-right font-mono text-[11px] leading-6 text-white/15">
                  {currentFile?.content.split("\n").map((_, index) => (
                    <div key={index} className="px-3">
                      {index + 1}
                    </div>
                  ))}
                </div>

                <textarea
                  value={currentFile?.content ?? ""}
                  onChange={(event) =>
                    updateCurrentFile(event.target.value)
                  }
                  spellCheck={false}
                  className="min-h-[700px] flex-1 resize-none border-0 bg-[#08080b] p-5 font-mono text-[12px] leading-6 text-white/75 outline-none"
                />
              </div>
            </div>

            {/* Bottom terminal */}
            <div className="hidden h-[170px] shrink-0 border-t border-white/[0.07] bg-[#07070a] md:block">
              <div className="flex h-9 items-center gap-4 border-b border-white/[0.05] px-4">
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-white/60">
                  <Terminal className="h-3.5 w-3.5" />
                  Terminal
                </span>

                <span className="text-[10px] text-white/25">
                  Problems
                </span>

                <span className="text-[10px] text-white/25">
                  Output
                </span>
              </div>

              <div className="p-4 font-mono text-[10px] leading-5 text-white/35">
                <p>
                  <span className="text-emerald-400">
                    $
                  </span>{" "}
                  modelnow agent run
                </p>

                <p className="text-white/25">
                  Loading agent configuration...
                </p>

                {running ? (
                  <>
                    <p className="text-yellow-300/60">
                      Initializing runtime...
                    </p>

                    <p className="text-yellow-300/60">
                      Executing agent tools...
                    </p>
                  </>
                ) : (
                  <p className="text-emerald-300/60">
                    Ready. Run the agent to see execution output.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Right Config */}
          <aside className="hidden w-[330px] shrink-0 overflow-y-auto border-l border-white/[0.08] bg-[#09090d] xl:block">
            <div className="border-b border-white/[0.06] px-5 py-4">
              <h2 className="text-xs font-semibold">
                Agent Configuration
              </h2>

              <p className="mt-1 text-[10px] leading-4 text-white/30">
                Configure runtime behavior without leaving the code
                workspace.
              </p>
            </div>

            <div className="space-y-4 p-5">
              {/* Agent */}
              <ConfigSection title="Agent">
                <ConfigInput
                  label="Name"
                  value={agentName}
                  onChange={setAgentName}
                />

                <ConfigSelect
                  label="Framework"
                  value={framework}
                  onChange={setFramework}
                  options={[
                    "ModelNow SDK",
                    "OpenAI SDK",
                    "Anthropic SDK",
                    "Custom Runtime",
                  ]}
                />
              </ConfigSection>

              {/* Model */}
              <ConfigSection title="Model">
                <ConfigSelect
                  label="Model"
                  value={model}
                  onChange={setModel}
                  options={[
                    "GPT-5.6",
                    "Claude Sonnet",
                    "Gemini Pro",
                    "ModelNow Auto Router",
                  ]}
                />

                <ConfigInput
                  label="Temperature"
                  value={temperature}
                  onChange={setTemperature}
                />
              </ConfigSection>

              {/* Runtime */}
              <ConfigSection title="Runtime">
                <ConfigSelect
                  label="Environment"
                  value={runtime}
                  onChange={setRuntime}
                  options={[
                    "Node.js",
                    "Bun",
                    "Deno",
                    "Edge Runtime",
                  ]}
                />

                <ToggleConfig
                  label="Streaming"
                  description="Stream model responses."
                  enabled={streamingEnabled}
                  onChange={() =>
                    setStreamingEnabled((value) => !value)
                  }
                />

                <ToggleConfig
                  label="Agent Memory"
                  description="Enable persistent context."
                  enabled={memoryEnabled}
                  onChange={() =>
                    setMemoryEnabled((value) => !value)
                  }
                />

                <ToggleConfig
                  label="Human Approval"
                  description="Require approval for sensitive actions."
                  enabled={humanApproval}
                  onChange={() =>
                    setHumanApproval((value) => !value)
                  }
                />
              </ConfigSection>

              {/* Tools */}
              <ConfigSection title="Tools">
                <button
                  type="button"
                  onClick={() => setShowTools((value) => !value)}
                  className="flex w-full items-center justify-between rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <Wrench className="h-3.5 w-3.5 text-violet-300" />
                    <span className="text-[11px] text-white/60">
                      {selectedTools.length} tools selected
                    </span>
                  </div>

                  <ChevronDown
                    className={`h-3.5 w-3.5 text-white/25 transition ${
                      showTools ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showTools && (
                  <div className="space-y-1.5 rounded-lg border border-white/[0.06] bg-black/20 p-2">
                    {tools.map((tool) => {
                      const selected = selectedTools.includes(tool.id);

                      return (
                        <button
                          key={tool.id}
                          type="button"
                          onClick={() => toggleTool(tool.id)}
                          className="flex w-full items-center gap-2 rounded-lg p-2 text-left transition hover:bg-white/[0.04]"
                        >
                          <div
                            className={`flex h-4 w-4 items-center justify-center rounded border ${
                              selected
                                ? "border-violet-500 bg-violet-500"
                                : "border-white/15"
                            }`}
                          >
                            {selected && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="text-[10px] text-white/60">
                              {tool.name}
                            </p>

                            <p className="text-[9px] text-white/25">
                              {tool.category}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </ConfigSection>

              {/* Security */}
              <ConfigSection title="Security">
                <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] p-3">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                      <ShieldCheck className="h-4 w-4 text-emerald-300" />
                    </div>

                    <div>
                      <p className="text-[10px] font-medium text-white/65">
                        Protected Runtime
                      </p>

                      <p className="mt-1 text-[9px] leading-4 text-white/30">
                        Tool permissions and sensitive actions can be
                        controlled through ModelNow policies.
                      </p>
                    </div>
                  </div>
                </div>
              </ConfigSection>

              {/* Advanced */}
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02]">
                <button
                  type="button"
                  onClick={() =>
                    setShowAdvanced((value) => !value)
                  }
                  className="flex w-full items-center justify-between p-4"
                >
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-3.5 w-3.5 text-white/35" />
                    <span className="text-[11px] font-medium text-white/55">
                      Advanced
                    </span>
                  </div>

                  <ChevronDown
                    className={`h-3.5 w-3.5 text-white/25 transition ${
                      showAdvanced ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showAdvanced && (
                  <div className="space-y-3 border-t border-white/[0.06] p-4">
                    <ConfigRow
                      icon={<Database className="h-3.5 w-3.5" />}
                      label="Database"
                      value="Connected"
                    />

                    <ConfigRow
                      icon={<GitBranch className="h-3.5 w-3.5" />}
                      label="Version"
                      value="v1.0.0"
                    />

                    <ConfigRow
                      icon={<Layers3 className="h-3.5 w-3.5" />}
                      label="Runtime"
                      value={runtime}
                    />
                  </div>
                )}
              </div>

              {/* Generated config */}
              <button
                type="button"
                onClick={insertGeneratedConfig}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/[0.06] px-3 py-2.5 text-[11px] font-medium text-violet-300 transition hover:bg-violet-500/[0.1]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Generate Config from Settings
              </button>
            </div>
          </aside>
        </div>

        {/* Status bar */}
        <footer className="flex h-7 items-center justify-between border-t border-white/[0.07] bg-[#08080b] px-4">
          <div className="flex items-center gap-4 text-[9px] text-white/25">
            <span>TypeScript</span>
            <span>{framework}</span>
            <span>{runtime}</span>
          </div>

          <div className="flex items-center gap-4 text-[9px] text-white/25">
            <span>UTF-8</span>
            <span>LF</span>
            <span>ModelNow</span>
          </div>
        </footer>
      </div>
    </main>
  );
}

function ConfigSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-white/25">
        {title}
      </h3>

      <div className="space-y-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
        {children}
      </div>
    </section>
  );
}

function ConfigInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] text-white/40">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-lg border border-white/[0.08] bg-black/20 px-2.5 text-[11px] text-white/70 outline-none transition focus:border-violet-500/40"
      />
    </div>
  );
}

function ConfigSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] text-white/40">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-full appearance-none rounded-lg border border-white/[0.08] bg-black/20 px-2.5 pr-8 text-[11px] text-white/70 outline-none focus:border-violet-500/40"
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
      </div>
    </div>
  );
}

function ToggleConfig({
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

function ConfigRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-white/35">
        {icon}
        <span className="text-[10px]">{label}</span>
      </div>

      <span className="text-[10px] text-emerald-300/60">
        {value}
      </span>
    </div>
  );
}