"use client";

import { ChangeEvent, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Bot,
  Check,
  ChevronDown,
  Code2,
  FileCode2,
  FileJson,
  FileText,
  FolderOpen,
  GitBranch,
  Import,
  Loader2,
  Upload,
  X,
  Zap,
} from "lucide-react";

type ImportSource =
  | "json"
  | "yaml"
  | "typescript"
  | "javascript"
  | "github"
  | "zip";

type ImportedAgent = {
  name: string;
  description: string;
  model: string;
  tools: string[];
  memory: boolean;
  humanApproval: boolean;
  source: string;
};

const sourceOptions: {
  id: ImportSource;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: "json",
    label: "Agent JSON",
    description: "Import an exported ModelNow agent",
    icon: FileJson,
  },
  {
    id: "yaml",
    label: "YAML Configuration",
    description: "Import an agent YAML definition",
    icon: FileText,
  },
  {
    id: "typescript",
    label: "TypeScript",
    description: "Import an agent from TypeScript code",
    icon: FileCode2,
  },
  {
    id: "javascript",
    label: "JavaScript",
    description: "Import an agent from JavaScript code",
    icon: Code2,
  },
  {
    id: "github",
    label: "GitHub Repository",
    description: "Import an agent from a GitHub repository",
    icon: GitBranch,
  },
  {
    id: "zip",
    label: "ZIP Package",
    description: "Import a complete agent package",
    icon: FolderOpen,
  },
];

const defaultTools = [
  "Web Search",
  "Browser Automation",
  "REST API",
  "Database",
  "Code Execution",
  "MCP",
];

export default function ImportAgentPage() {
  const [selectedSource, setSelectedSource] =
    useState<ImportSource>("json");

  const [file, setFile] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [agentName, setAgentName] = useState("");
  const [agentDescription, setAgentDescription] = useState("");

  const [model, setModel] = useState("GPT-5.6");
  const [selectedTools, setSelectedTools] = useState<string[]>([
    "Web Search",
  ]);

  const [memory, setMemory] = useState(true);
  const [humanApproval, setHumanApproval] = useState(false);
  const [overwriteExisting, setOverwriteExisting] = useState(false);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [isImporting, setIsImporting] = useState(false);
  const [isImported, setIsImported] = useState(false);
  const [error, setError] = useState("");

  const selectedSourceData = useMemo(
    () => sourceOptions.find((item) => item.id === selectedSource),
    [selectedSource],
  );

  const toggleTool = (tool: string) => {
    setSelectedTools((current) =>
      current.includes(tool)
        ? current.filter((item) => item !== tool)
        : [...current, tool],
    );
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;

    setFile(selectedFile);
    setError("");
    setIsImported(false);

    if (selectedFile && !agentName) {
      const nameWithoutExtension = selectedFile.name.replace(
        /\.[^/.]+$/,
        "",
      );

      setAgentName(nameWithoutExtension);
    }
  };

  const validateImport = () => {
    if (!agentName.trim()) {
      setError("Please enter an agent name.");
      return false;
    }

    if (
      ["json", "yaml", "typescript", "javascript", "zip"].includes(
        selectedSource,
      ) &&
      !file
    ) {
      setError("Please select an agent file to import.");
      return false;
    }

    if (selectedSource === "github" && !githubUrl.trim()) {
      setError("Please enter a GitHub repository URL.");
      return false;
    }

    return true;
  };

  const handleImport = async () => {
    setError("");

    if (!validateImport()) {
      return;
    }

    setIsImporting(true);
    setIsImported(false);

    await new Promise((resolve) => setTimeout(resolve, 1400));

    setIsImporting(false);
    setIsImported(true);
    setShowPreview(true);
  };

  const resetImport = () => {
    setFile(null);
    setGithubUrl("");
    setAgentName("");
    setAgentDescription("");
    setIsImported(false);
    setShowPreview(false);
    setError("");
  };

  return (
    <main className="min-h-screen bg-[#07070a] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1500px] flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-white/[0.08] px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/60 transition hover:bg-white/[0.07] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-violet-400" />
                <h1 className="text-sm font-semibold">
                  Import Agent
                </h1>
              </div>
              <p className="mt-0.5 text-xs text-white/40">
                Bring an existing agent into ModelNow
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/[0.06] px-3 py-1.5 text-xs text-violet-300">
            <Import className="h-3.5 w-3.5" />
            Agent Import
          </div>
        </header>

        {/* Main */}
        <div className="flex flex-1">
          {/* Left source panel */}
          <aside className="w-[290px] shrink-0 border-r border-white/[0.08] p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold">Import Source</h2>
              <p className="mt-1 text-xs leading-5 text-white/40">
                Choose how you want to bring your existing agent into
                ModelNow.
              </p>
            </div>

            <div className="space-y-2">
              {sourceOptions.map((source) => {
                const Icon = source.icon;
                const active = selectedSource === source.id;

                return (
                  <button
                    key={source.id}
                    type="button"
                    onClick={() => {
                      setSelectedSource(source.id);
                      setFile(null);
                      setGithubUrl("");
                      setError("");
                      setIsImported(false);
                      setShowPreview(false);
                    }}
                    className={`group w-full rounded-xl border p-3 text-left transition ${
                      active
                        ? "border-violet-500/40 bg-violet-500/[0.09]"
                        : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          active
                            ? "bg-violet-500/15 text-violet-300"
                            : "bg-white/[0.05] text-white/45"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-xs font-medium ${
                              active
                                ? "text-white"
                                : "text-white/75"
                            }`}
                          >
                            {source.label}
                          </span>

                          {active && (
                            <Check className="h-3.5 w-3.5 text-violet-400" />
                          )}
                        </div>

                        <p className="mt-1 text-[11px] leading-4 text-white/35">
                          {source.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-300" />
                <span className="text-xs font-medium">
                  Smart Import
                </span>
              </div>

              <p className="mt-2 text-[11px] leading-5 text-white/35">
                ModelNow automatically detects models, tools, memory,
                workflows and configuration from supported agent
                packages.
              </p>
            </div>
          </aside>

          {/* Center */}
          <section className="min-w-0 flex-1 p-7">
            <div className="mx-auto max-w-[760px]">
              <div className="mb-7">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-violet-400">
                  {selectedSourceData?.label}
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Import your existing agent
                </h2>

                <p className="mt-2 max-w-[620px] text-sm leading-6 text-white/45">
                  Import your agent configuration and continue building
                  it inside the ModelNow Agent Builder.
                </p>
              </div>

              {/* File / GitHub input */}
              {selectedSource === "github" ? (
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05]">
                      <GitBranch className="h-5 w-5 text-white/65" />
                    </div>

                    <div>
                      <h3 className="text-sm font-medium">
                        GitHub Repository
                      </h3>
                      <p className="text-xs text-white/35">
                        Enter the repository containing your agent.
                      </p>
                    </div>
                  </div>

                  <input
                    value={githubUrl}
                    onChange={(event) =>
                      setGithubUrl(event.target.value)
                    }
                    placeholder="https://github.com/organization/agent"
                    className="h-12 w-full rounded-xl border border-white/[0.09] bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-violet-500/50"
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                      <Upload className="h-5 w-5 text-violet-300" />
                    </div>

                    <div>
                      <h3 className="text-sm font-medium">
                        Upload Agent
                      </h3>
                      <p className="text-xs text-white/35">
                        Select your agent configuration or package.
                      </p>
                    </div>
                  </div>

                  <label className="group flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.13] bg-black/20 px-6 text-center transition hover:border-violet-500/40 hover:bg-violet-500/[0.03]">
                    <input
                      type="file"
                      className="hidden"
                      accept={
                        selectedSource === "json"
                          ? ".json,application/json"
                          : selectedSource === "yaml"
                            ? ".yaml,.yml"
                            : selectedSource === "typescript"
                              ? ".ts,.tsx"
                              : selectedSource === "javascript"
                                ? ".js,.jsx"
                                : ".zip"
                      }
                      onChange={handleFileChange}
                    />

                    {file ? (
                      <>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                          <Check className="h-6 w-6" />
                        </div>

                        <p className="mt-4 text-sm font-medium text-white">
                          {file.name}
                        </p>

                        <p className="mt-1 text-xs text-white/35">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>

                        <span className="mt-4 text-xs text-violet-300">
                          Choose another file
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.05] text-white/45 transition group-hover:bg-violet-500/10 group-hover:text-violet-300">
                          <Upload className="h-5 w-5" />
                        </div>

                        <p className="mt-4 text-sm font-medium text-white/80">
                          Drop your agent file here
                        </p>

                        <p className="mt-1 text-xs text-white/35">
                          or click to browse from your computer
                        </p>

                        <p className="mt-4 text-[11px] text-white/20">
                          Supported:{" "}
                          {selectedSource === "json"
                            ? ".json"
                            : selectedSource === "yaml"
                              ? ".yaml, .yml"
                              : selectedSource === "typescript"
                                ? ".ts, .tsx"
                                : selectedSource === "javascript"
                                  ? ".js, .jsx"
                                  : ".zip"}
                        </p>
                      </>
                    )}
                  </label>
                </div>
              )}

              {/* Agent details */}
              <div className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <div className="mb-5">
                  <h3 className="text-sm font-medium">
                    Agent Details
                  </h3>
                  <p className="mt-1 text-xs text-white/35">
                    Review the basic identity of the imported agent.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-medium text-white/60">
                      Agent Name
                    </label>

                    <input
                      value={agentName}
                      onChange={(event) =>
                        setAgentName(event.target.value)
                      }
                      placeholder="e.g. Customer Support Agent"
                      className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 px-3.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-violet-500/50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium text-white/60">
                      Description
                    </label>

                    <textarea
                      value={agentDescription}
                      onChange={(event) =>
                        setAgentDescription(event.target.value)
                      }
                      rows={4}
                      placeholder="Describe what this agent does..."
                      className="w-full resize-none rounded-xl border border-white/[0.08] bg-black/20 px-3.5 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-violet-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              {showPreview && (
                <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                      <Check className="h-5 w-5 text-emerald-300" />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold">
                        Agent ready to import
                      </h3>
                      <p className="mt-1 text-xs text-white/40">
                        Configuration has been detected and is ready
                        for the Agent Builder.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <PreviewStat label="Model" value={model} />
                    <PreviewStat
                      label="Tools"
                      value={`${selectedTools.length}`}
                    />
                    <PreviewStat
                      label="Memory"
                      value={memory ? "Enabled" : "Disabled"}
                    />
                    <PreviewStat
                      label="Approval"
                      value={
                        humanApproval ? "Required" : "Automatic"
                      }
                    />
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-4">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />

                  <p className="text-xs leading-5 text-red-200/80">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="ml-auto text-white/30 transition hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={resetImport}
                  className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-xs font-medium text-white/60 transition hover:bg-white/[0.05] hover:text-white"
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={handleImport}
                  disabled={isImporting}
                  className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : isImported ? (
                    <>
                      <Check className="h-4 w-4" />
                      Imported
                    </>
                  ) : (
                    <>
                      <Import className="h-4 w-4" />
                      Import Agent
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* Right configuration panel */}
          <aside className="hidden w-[310px] shrink-0 border-l border-white/[0.08] p-5 xl:block">
            <div className="mb-5">
              <h2 className="text-sm font-semibold">
                Import Configuration
              </h2>
              <p className="mt-1 text-xs leading-5 text-white/35">
                Configure how ModelNow should initialize this agent.
              </p>
            </div>

            {/* Model */}
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
              <label className="mb-2 block text-xs font-medium text-white/55">
                Default Model
              </label>

              <div className="relative">
                <select
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  className="h-10 w-full appearance-none rounded-lg border border-white/[0.08] bg-black/20 px-3 pr-9 text-xs text-white outline-none focus:border-violet-500/50"
                >
                  <option>GPT-5.6</option>
                  <option>Claude Sonnet</option>
                  <option>Gemini Pro</option>
                  <option>ModelNow Auto Router</option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
              </div>
            </div>

            {/* Tools */}
            <div className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
              <div className="mb-3">
                <h3 className="text-xs font-medium text-white/70">
                  Tools
                </h3>
                <p className="mt-1 text-[11px] text-white/30">
                  Select tools available to the imported agent.
                </p>
              </div>

              <div className="space-y-1.5">
                {defaultTools.map((tool) => {
                  const selected = selectedTools.includes(tool);

                  return (
                    <button
                      key={tool}
                      type="button"
                      onClick={() => toggleTool(tool)}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition hover:bg-white/[0.04]"
                    >
                      <span className="text-[11px] text-white/55">
                        {tool}
                      </span>

                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded border ${
                          selected
                            ? "border-violet-500 bg-violet-500 text-white"
                            : "border-white/15 bg-transparent"
                        }`}
                      >
                        {selected && (
                          <Check className="h-3 w-3" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Memory */}
            <div className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
              <h3 className="mb-3 text-xs font-medium text-white/70">
                Memory
              </h3>

              <ToggleRow
                label="Agent Memory"
                description="Allow the agent to remember context."
                enabled={memory}
                onChange={() => setMemory((value) => !value)}
              />

              <div className="my-3 border-t border-white/[0.06]" />

              <ToggleRow
                label="Human Approval"
                description="Require approval for sensitive actions."
                enabled={humanApproval}
                onChange={() =>
                  setHumanApproval((value) => !value)
                }
              />
            </div>

            {/* Advanced */}
            <div className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.02]">
              <button
                type="button"
                onClick={() => setShowAdvanced((value) => !value)}
                className="flex w-full items-center justify-between p-4"
              >
                <div>
                  <h3 className="text-xs font-medium text-white/70">
                    Advanced Options
                  </h3>
                  <p className="mt-1 text-[11px] text-white/30">
                    Additional import behavior.
                  </p>
                </div>

                <ChevronDown
                  className={`h-4 w-4 text-white/30 transition ${
                    showAdvanced ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showAdvanced && (
                <div className="border-t border-white/[0.06] p-4">
                  <ToggleRow
                    label="Overwrite Existing"
                    description="Replace an agent with the same name."
                    enabled={overwriteExisting}
                    onChange={() =>
                      setOverwriteExisting((value) => !value)
                    }
                  />
                </div>
              )}
            </div>

            {/* Security */}
            <div className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Check className="h-4 w-4 text-emerald-300" />
                </div>

                <div>
                  <h3 className="text-xs font-medium text-white/70">
                    Safe Import
                  </h3>
                  <p className="mt-1 text-[11px] leading-5 text-white/30">
                    Imported tools and permissions should be reviewed
                    before production deployment.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
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
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-white/65">
          {label}
        </p>

        <p className="mt-1 text-[10px] leading-4 text-white/30">
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

function PreviewStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
      <p className="text-[10px] uppercase tracking-wider text-white/25">
        {label}
      </p>
      <p className="mt-1 text-xs font-medium text-white/75">
        {value}
      </p>
    </div>
  );
}