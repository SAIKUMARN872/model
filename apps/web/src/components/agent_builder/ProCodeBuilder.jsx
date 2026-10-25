"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clipboard,
  FileCode,
  FileText,
  Folder,
  GitBranch,
  Layers,
  Play,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  Terminal,
  Upload,
  Users,
  Zap,
} from "lucide-react";

const initialFiles = [
  {
    id: "agent",
    name: "agent.ts",
    type: "typescript",
    content: `import { Agent } from "@modelnow/agents";

const agent = new Agent({
  name: "ResearchAgent",
  model: "gpt-5",
  instructions: \`
    You are an enterprise research agent.
    Search approved sources, analyze findings,
    and return concise structured answers.
  \`,
});

export default agent;
`,
  },
  {
    id: "tools",
    name: "tools.ts",
    type: "typescript",
    content: `import { tool } from "@modelnow/tools";

export const searchWeb = tool({
  name: "searchWeb",
  description: "Search approved web sources.",
  async execute(input) {
    return {
      query: input.query,
      results: [],
    };
  },
});
`,
  },
  {
    id: "config",
    name: "config.ts",
    type: "typescript",
    content: `export const config = {
  temperature: 0.2,
  maxTokens: 2000,
  timeout: 30000,
  retries: 2,
};
`,
  },
  {
    id: "workflow",
    name: "workflow.ts",
    type: "typescript",
    content: `import agent from "./agent";
import { searchWeb } from "./tools";

export async function runWorkflow(input) {
  const research = await agent.run({
    input,
    tools: [searchWeb],
  });

  return research;
}
`,
  },
  {
    id: "env",
    name: ".env.example",
    type: "env",
    content: `MODELNOW_API_KEY=your_api_key_here
MODEL_NAME=gpt-5
ENVIRONMENT=development
`,
  },
];

const initialLogs = [
  {
    time: "10:41:21",
    type: "info",
    message: "Development environment initialized.",
  },
  {
    time: "10:41:22",
    type: "success",
    message: "Agent configuration loaded successfully.",
  },
  {
    time: "10:41:24",
    type: "info",
    message: "Connected to ModelNow runtime.",
  },
];

function FileIcon({ type }) {
  if (type === "typescript") {
    return <FileCode size={15} className="text-blue-600" />;
  }

  if (type === "env") {
    return <Settings2 size={15} className="text-amber-600" />;
  }

  return <FileText size={15} className="text-slate-500" />;
}

function StatusBadge({ status }) {
  const styles = {
    Ready: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Running: "border-blue-200 bg-blue-50 text-blue-700",
    Error: "border-red-200 bg-red-50 text-red-700",
    Draft: "border-slate-200 bg-slate-50 text-slate-600",
    Saved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        styles[status] ||
        "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

function MetricCard({ label, value, detail, icon: Icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
          {label}
        </span>

        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
          <Icon size={14} className="text-slate-700" />
        </div>
      </div>

      <div className="mt-2 text-lg font-semibold text-slate-900">
        {value}
      </div>

      <div className="mt-0.5 text-[11px] text-slate-500">
        {detail}
      </div>
    </div>
  );
}

function ToolbarButton({ icon: Icon, label, onClick, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-100"
      }`}
      title={label}
    >
      <Icon size={14} />
      <span className="hidden lg:inline">{label}</span>
    </button>
  );
}

function LineNumberEditor({ value, onChange }) {
  const lines = value.split("\n");

  return (
    <div className="flex h-full min-h-[460px] overflow-hidden bg-[#0f172a]">
      <div className="w-12 shrink-0 border-r border-slate-700/60 bg-[#111827] py-4 text-right font-mono text-[12px] leading-6 text-slate-500">
        {lines.map((_, index) => (
          <div key={index} className="pr-3">
            {index + 1}
          </div>
        ))}
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        className="h-full min-h-[460px] flex-1 resize-none bg-transparent px-4 py-4 font-mono text-[13px] leading-6 text-slate-100 outline-none"
      />
    </div>
  );
}

export default function ProCodeBuilder() {
  const [files, setFiles] = useState(initialFiles);
  const [selectedFileId, setSelectedFileId] = useState("agent");
  const [search, setSearch] = useState("");
  const [activePanel, setActivePanel] = useState("console");
  const [runtimeStatus, setRuntimeStatus] = useState("Ready");
  const [logs, setLogs] = useState(initialLogs);
  const [previewOutput, setPreviewOutput] = useState(
    "Run the agent to see output here.",
  );
  const [showSettings, setShowSettings] = useState(false);
  const [environment, setEnvironment] = useState("Development");
  const [model, setModel] = useState("GPT-5");
  const [autoSave, setAutoSave] = useState(true);

  const selectedFile =
    files.find((file) => file.id === selectedFileId) ||
    files[0];

  const filteredFiles = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return files;

    return files.filter((file) =>
      file.name.toLowerCase().includes(query),
    );
  }, [files, search]);

  const updateSelectedFile = (content) => {
    setFiles((current) =>
      current.map((file) =>
        file.id === selectedFileId
          ? { ...file, content }
          : file,
      ),
    );
  };

  const addLog = (type, message) => {
    const now = new Date();

    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setLogs((current) => [
      ...current.slice(-15),
      {
        time,
        type,
        message,
      },
    ]);
  };

  const saveProject = () => {
    setRuntimeStatus("Saved");

    addLog(
      "success",
      "Project files saved successfully.",
    );

    window.setTimeout(() => {
      setRuntimeStatus("Ready");
    }, 1000);
  };

  const validateProject = () => {
    const hasAgent = files.some(
      (file) => file.name === "agent.ts",
    );

    const hasConfig = files.some(
      (file) => file.name === "config.ts",
    );

    if (!hasAgent || !hasConfig) {
      setRuntimeStatus("Error");
      addLog(
        "error",
        "Validation failed: required project files are missing.",
      );
      return;
    }

    setRuntimeStatus("Ready");

    addLog(
      "success",
      "Validation completed with no blocking errors.",
    );
  };

  const runProject = () => {
    setRuntimeStatus("Running");
    setActivePanel("console");

    addLog(
      "info",
      `Starting agent in ${environment} environment using ${model}.`,
    );

    window.setTimeout(() => {
      setPreviewOutput(
        JSON.stringify(
          {
            status: "success",
            agent: "ResearchAgent",
            model,
            environment,
            result:
              "Agent execution completed successfully.",
            latency: "1.42s",
            tokens: 684,
          },
          null,
          2,
        ),
      );

      addLog(
        "success",
        "Agent execution completed successfully.",
      );

      setRuntimeStatus("Ready");
    }, 1600);
  };

  const deployProject = () => {
    setRuntimeStatus("Running");

    addLog(
      "info",
      "Preparing production deployment.",
    );

    window.setTimeout(() => {
      addLog(
        "success",
        "Deployment package created successfully.",
      );

      setRuntimeStatus("Ready");
    }, 1300);
  };

  const createFile = () => {
    const baseName = `new-file-${files.length + 1}.ts`;

    const newFile = {
      id: `file-${Date.now()}`,
      name: baseName,
      type: "typescript",
      content: `export default async function handler(input) {
  return {
    success: true,
    input,
  };
}
`,
    };

    setFiles((current) => [...current, newFile]);
    setSelectedFileId(newFile.id);

    addLog(
      "info",
      `Created ${baseName}.`,
    );
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
              <Terminal size={17} className="text-white" />
            </div>

            <div>
              <h1 className="text-sm font-semibold">
                Pro-Code Builder
              </h1>

              <p className="text-[11px] text-slate-500">
                Production agent development environment
              </p>
            </div>

            <div className="ml-2">
              <StatusBadge status={runtimeStatus} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ToolbarButton
              icon={CheckCircle2}
              label="Validate"
              onClick={validateProject}
            />

            <ToolbarButton
              icon={Save}
              label="Save"
              onClick={saveProject}
            />

            <ToolbarButton
              icon={Settings2}
              label="Settings"
              active={showSettings}
              onClick={() =>
                setShowSettings((current) => !current)
              }
            />

            <button
              type="button"
              onClick={runProject}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
            >
              <Play size={14} />
              Run
            </button>
          </div>
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white px-5 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <ToolbarButton
            icon={GitBranch}
            label="Agent"
            active={!showSettings}
            onClick={() => setShowSettings(false)}
          />

          <ToolbarButton
            icon={Zap}
            label="Runtime"
            onClick={() => setShowSettings(true)}
          />

          <ToolbarButton
            icon={ShieldCheck}
            label="Security"
            onClick={() => setShowSettings(true)}
          />

          <div className="ml-auto flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Runtime connected
            </span>

            <span>
              Auto-save: {autoSave ? "On" : "Off"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid min-h-[calc(100vh-104px)] grid-cols-[250px_minmax(0,1fr)_310px]">
        <aside className="border-r border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Explorer
                </div>

                <div className="mt-1 text-sm font-semibold">
                  Agent Project
                </div>
              </div>

              <button
                type="button"
                onClick={createFile}
                className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-slate-100"
                title="New file"
              >
                <Plus size={15} />
              </button>
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
                placeholder="Search files"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-2 text-xs outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <div className="p-3">
            <div className="mb-2 flex items-center gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              <ChevronDown size={12} />
              src
            </div>

            <div className="space-y-1">
              {filteredFiles.map((file) => (
                <button
                  type="button"
                  key={file.id}
                  onClick={() => setSelectedFileId(file.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs ${
                    selectedFileId === file.id
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <FileIcon type={file.type} />

                  <span className="truncate">
                    {file.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Project Health
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Build</span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 size={13} />
                  Passing
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Security</span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 size={13} />
                  Protected
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Runtime</span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <Activity size={13} />
                  Healthy
                </span>
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0 bg-[#0f172a]">
          <div className="flex h-11 items-center justify-between border-b border-slate-700/60 bg-[#111827] px-4">
            <div className="flex items-center gap-3">
              <FileIcon type={selectedFile.type} />

              <span className="text-xs font-medium text-slate-200">
                {selectedFile.name}
              </span>

              <span className="text-[10px] text-slate-500">
                UTF-8
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(
                    selectedFile.content,
                  );

                  addLog(
                    "success",
                    `Copied ${selectedFile.name} to clipboard.`,
                  );
                }}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white"
                title="Copy code"
              >
                <Clipboard size={14} />
              </button>

              <button
                type="button"
                onClick={() =>
                  addLog(
                    "info",
                    `Refreshing ${selectedFile.name}.`,
                  )
                }
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white"
                title="Refresh"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          <LineNumberEditor
            value={selectedFile.content}
            onChange={updateSelectedFile}
          />

          <div className="border-t border-slate-700/60 bg-[#111827]">
            <div className="flex items-center gap-1 border-b border-slate-700/60 px-3">
              {[
                ["console", "Console"],
                ["preview", "Preview"],
                ["trace", "Trace"],
              ].map(([id, label]) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => setActivePanel(id)}
                  className={`px-3 py-2 text-[11px] font-medium ${
                    activePanel === id
                      ? "border-b-2 border-white text-white"
                      : "text-slate-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="max-h-[205px] min-h-[170px] overflow-y-auto p-3 font-mono text-[11px]">
              {activePanel === "console" && (
                <div className="space-y-1.5">
                  {logs.map((log, index) => (
                    <div
                      key={`${log.time}-${index}`}
                      className="flex gap-3"
                    >
                      <span className="text-slate-600">
                        {log.time}
                      </span>

                      <span
                        className={
                          log.type === "error"
                            ? "text-red-400"
                            : log.type === "success"
                              ? "text-emerald-400"
                              : "text-slate-300"
                        }
                      >
                        {log.message}
                      </span>
                    </div>
                  ))}

                  {runtimeStatus === "Running" && (
                    <div className="flex items-center gap-2 text-blue-400">
                      <RefreshCw
                        size={12}
                        className="animate-spin"
                      />
                      Executing agent...
                    </div>
                  )}
                </div>
              )}

              {activePanel === "preview" && (
                <pre className="whitespace-pre-wrap text-slate-200">
                  {previewOutput}
                </pre>
              )}

              {activePanel === "trace" && (
                <div className="space-y-2 text-slate-300">
                  <div>
                    01{" "}
                    <span className="text-slate-500">
                      initialize-runtime
                    </span>
                  </div>
                  <div>
                    02{" "}
                    <span className="text-slate-500">
                      load-agent-config
                    </span>
                  </div>
                  <div>
                    03{" "}
                    <span className="text-slate-500">
                      resolve-model
                    </span>
                  </div>
                  <div>
                    04{" "}
                    <span className="text-slate-500">
                      execute-tools
                    </span>
                  </div>
                  <div>
                    05{" "}
                    <span className="text-slate-500">
                      generate-response
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="border-l border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <Settings2
                size={16}
                className="text-slate-700"
              />

              <span className="text-sm font-semibold">
                Runtime Configuration
              </span>
            </div>

            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              Configure how the agent runs in the current environment.
            </p>
          </div>

          <div className="space-y-5 p-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Environment
              </label>

              <select
                value={environment}
                onChange={(event) =>
                  setEnvironment(event.target.value)
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none"
              >
                <option>Development</option>
                <option>Staging</option>
                <option>Production</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Model
              </label>

              <select
                value={model}
                onChange={(event) =>
                  setModel(event.target.value)
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none"
              >
                <option>GPT-5</option>
                <option>Claude Sonnet</option>
                <option>Gemini Pro</option>
                <option>DeepSeek V3</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Temperature
              </label>

              <div className="rounded-lg border border-slate-200 p-3">
                <div className="mb-2 flex justify-between text-xs">
                  <span>0.20</span>
                  <span className="text-slate-400">Focused</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  defaultValue="0.2"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Max Tokens
              </label>

              <input
                defaultValue="2000"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none"
              />
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={15}
                  className="text-emerald-600"
                />

                <span className="text-xs font-semibold">
                  Security enabled
                </span>
              </div>

              <p className="mt-1 text-[11px] leading-5 text-slate-500">
                Tool permissions, audit logging, and runtime guardrails are
                enabled.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                saveProject();
                addLog(
                  "success",
                  "Runtime configuration saved.",
                );
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white"
            >
              <Save size={14} />
              Save Configuration
            </button>
          </div>

          {showSettings && (
            <div className="mx-4 mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle
                  size={15}
                  className="mt-0.5 text-blue-600"
                />

                <div>
                  <div className="text-xs font-semibold text-blue-900">
                    Advanced settings
                  </div>

                  <p className="mt-1 text-[11px] leading-5 text-blue-800">
                    Runtime configuration is currently shown in the right
                    panel.
                  </p>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}