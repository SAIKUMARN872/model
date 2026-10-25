"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Cpu,
  DollarSign,
  GitBranch,
  Layers,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Target,
  Zap,
} from "lucide-react";

const initialModels = [
  {
    id: "gpt-5",
    name: "GPT-5",
    provider: "OpenAI",
    type: "Reasoning",
    latency: 1.42,
    cost: 0.82,
    quality: 96,
    reliability: 99,
    status: "Healthy",
    color: "bg-slate-900",
  },
  {
    id: "claude-sonnet",
    name: "Claude Sonnet",
    provider: "Anthropic",
    type: "Balanced",
    latency: 1.71,
    cost: 0.58,
    quality: 94,
    reliability: 98,
    status: "Healthy",
    color: "bg-indigo-600",
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    provider: "Google",
    type: "Multimodal",
    latency: 1.26,
    cost: 0.41,
    quality: 91,
    reliability: 97,
    status: "Healthy",
    color: "bg-blue-600",
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    type: "Reasoning",
    latency: 1.89,
    cost: 0.19,
    quality: 89,
    reliability: 95,
    status: "Healthy",
    color: "bg-emerald-600",
  },
];

const initialRules = [
  {
    id: "rule-1",
    name: "Default Production Router",
    condition: "Quality >= 90",
    primary: "GPT-5",
    fallback: "Claude Sonnet",
    enabled: true,
  },
  {
    id: "rule-2",
    name: "Cost Optimized",
    condition: "Cost <= $0.30",
    primary: "DeepSeek V3",
    fallback: "Gemini Pro",
    enabled: true,
  },
  {
    id: "rule-3",
    name: "Low Latency",
    condition: "Latency <= 1.50s",
    primary: "Gemini Pro",
    fallback: "GPT-5",
    enabled: true,
  },
  {
    id: "rule-4",
    name: "Complex Reasoning",
    condition: "Task = reasoning",
    primary: "GPT-5",
    fallback: "Claude Sonnet",
    enabled: true,
  },
];

const initialRequests = [
  {
    id: "REQ-9821",
    task: "Research synthesis",
    selected: "GPT-5",
    latency: "1.38s",
    cost: "$0.82",
    quality: "96",
    status: "Completed",
    time: "2 min ago",
  },
  {
    id: "REQ-9820",
    task: "Customer support",
    selected: "Claude Sonnet",
    latency: "1.63s",
    cost: "$0.57",
    quality: "93",
    status: "Completed",
    time: "4 min ago",
  },
  {
    id: "REQ-9819",
    task: "Document extraction",
    selected: "Gemini Pro",
    latency: "1.21s",
    cost: "$0.39",
    quality: "92",
    status: "Completed",
    time: "6 min ago",
  },
  {
    id: "REQ-9818",
    task: "Code reasoning",
    selected: "GPT-5",
    latency: "1.47s",
    cost: "$0.84",
    quality: "97",
    status: "Completed",
    time: "8 min ago",
  },
];

function StatusBadge({ status }) {
  const styles = {
    Healthy: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Active: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Disabled: "border-slate-200 bg-slate-50 text-slate-500",
    Warning: "border-amber-200 bg-amber-50 text-amber-700",
    Error: "border-red-200 bg-red-50 text-red-700",
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

function MetricCard({ label, value, detail, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </span>

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
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      {action}
    </div>
  );
}

function SelectField({ value, onChange, children }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm outline-none focus:border-slate-400"
      >
        {children}
      </select>

      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

function ScoreBar({ value }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-slate-900"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function ModelCard({ model, onUse }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${model.color}`}
          >
            <Cpu size={18} className="text-white" />
          </div>

          <div>
            <div className="text-sm font-semibold">{model.name}</div>
            <div className="mt-1 text-xs text-slate-500">
              {model.provider} · {model.type}
            </div>
          </div>
        </div>

        <StatusBadge status={model.status} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-[11px] text-slate-500">
            Latency
          </div>
          <div className="mt-1 text-sm font-semibold">
            {model.latency}s
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <div className="text-[11px] text-slate-500">
            Cost / request
          </div>
          <div className="mt-1 text-sm font-semibold">
            ${model.cost}
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div>
          <div className="mb-2 flex justify-between text-xs">
            <span className="text-slate-500">Quality</span>
            <span className="font-semibold">{model.quality}%</span>
          </div>
          <ScoreBar value={model.quality} />
        </div>

        <div>
          <div className="mb-2 flex justify-between text-xs">
            <span className="text-slate-500">Reliability</span>
            <span className="font-semibold">
              {model.reliability}%
            </span>
          </div>
          <ScoreBar value={model.reliability} />
        </div>
      </div>

      <button
        type="button"
        onClick={() => onUse(model)}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        Use in Router
        <ArrowRight size={14} />
      </button>
    </div>
  );
}

export default function ModelRouter() {
  const [activeTab, setActiveTab] = useState("overview");
  const [models, setModels] = useState(initialModels);
  const [rules, setRules] = useState(initialRules);
  const [requests, setRequests] = useState(initialRequests);

  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [routingMode, setRoutingMode] = useState("Balanced");
  const [selectedModel, setSelectedModel] = useState(
    initialModels[0].name,
  );
  const [fallbackModel, setFallbackModel] = useState(
    initialModels[1].name,
  );

  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleName, setRuleName] = useState("");
  const [ruleCondition, setRuleCondition] = useState("");
  const [rulePrimary, setRulePrimary] = useState(
    initialModels[0].name,
  );
  const [ruleFallback, setRuleFallback] = useState(
    initialModels[1].name,
  );

  const [simulating, setSimulating] = useState(false);
  const [simulationTask, setSimulationTask] =
    useState("Research and summarize a complex enterprise report.");

  const providers = useMemo(() => {
    return ["All", ...new Set(models.map((model) => model.provider))];
  }, [models]);

  const filteredModels = useMemo(() => {
    const query = search.trim().toLowerCase();

    return models.filter((model) => {
      const matchesSearch =
        query === "" ||
        model.name.toLowerCase().includes(query) ||
        model.provider.toLowerCase().includes(query) ||
        model.type.toLowerCase().includes(query);

      const matchesProvider =
        providerFilter === "All" ||
        model.provider === providerFilter;

      const matchesStatus =
        statusFilter === "All" ||
        model.status === statusFilter;

      return (
        matchesSearch &&
        matchesProvider &&
        matchesStatus
      );
    });
  }, [models, search, providerFilter, statusFilter]);

  const toggleRule = (id) => {
    setRules((current) =>
      current.map((rule) =>
        rule.id === id
          ? { ...rule, enabled: !rule.enabled }
          : rule,
      ),
    );
  };

  const addRule = () => {
    if (!ruleName.trim() || !ruleCondition.trim()) return;

    const newRule = {
      id: `rule-${rules.length + 1}`,
      name: ruleName.trim(),
      condition: ruleCondition.trim(),
      primary: rulePrimary,
      fallback: ruleFallback,
      enabled: true,
    };

    setRules((current) => [...current, newRule]);

    setRuleName("");
    setRuleCondition("");
    setRulePrimary(models[0]?.name || "");
    setRuleFallback(models[1]?.name || models[0]?.name || "");
    setShowRuleModal(false);
  };

  const runSimulation = () => {
    if (simulating) return;

    setSimulating(true);

    window.setTimeout(() => {
      const selected =
        routingMode === "Cost Optimized"
          ? models.find((model) => model.name === "DeepSeek V3") ||
            models[0]
          : routingMode === "Low Latency"
            ? models.find((model) => model.name === "Gemini Pro") ||
              models[0]
            : models.find((model) => model.name === selectedModel) ||
              models[0];

      const nextRequest = {
        id: `REQ-${9822 + requests.length}`,
        task:
          simulationTask.trim() ||
          "Test routing request",
        selected: selected.name,
        latency: `${selected.latency}s`,
        cost: `$${selected.cost}`,
        quality: String(selected.quality),
        status: "Completed",
        time: "Just now",
      };

      setRequests((current) => [nextRequest, ...current]);
      setSimulating(false);
    }, 1200);
  };

  const updateSelectedModel = (model) => {
    setSelectedModel(model.name);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <a
                href="/agent-builder"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <ArrowLeft size={17} />
              </a>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
                <GitBranch
                  size={19}
                  className="text-white"
                />
              </div>

              <div>
                <h1 className="text-xl font-semibold">
                  Model Router
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Dynamically route requests across models using quality,
                  cost, latency, and task requirements.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw size={15} />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => setShowRuleModal(true)}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                <Plus size={15} />
                New Routing Rule
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-6 py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            label="Routing Accuracy"
            value="96.4%"
            detail="+2.8% this month"
            icon={Target}
          />

          <MetricCard
            label="Requests Routed"
            value="48.2K"
            detail="Last 24 hours"
            icon={GitBranch}
          />

          <MetricCard
            label="Avg Latency"
            value="1.42s"
            detail="-18.2% vs baseline"
            icon={Clock3}
          />

          <MetricCard
            label="Cost Saved"
            value="31.8%"
            detail="$4,821 this month"
            icon={DollarSign}
          />

          <MetricCard
            label="Quality"
            value="94.7"
            detail="+5.1% vs baseline"
            icon={BarChart3}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          {["overview", "models", "routing-rules", "simulator"].map(
            (tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
                  activeTab === tab
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tab.replace("-", " ")}
              </button>
            ),
          )}
        </div>

        {activeTab === "overview" && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <SectionTitle
                  title="Routing Strategy"
                  description="Choose how the router decides which model should handle each request."
                  action={<StatusBadge status="Active" />}
                />

                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                  {[
                    {
                      name: "Balanced",
                      description:
                        "Balance quality, latency, and cost.",
                      icon: GitBranch,
                    },
                    {
                      name: "Cost Optimized",
                      description:
                        "Prioritize lower cost while maintaining quality.",
                      icon: DollarSign,
                    },
                    {
                      name: "Low Latency",
                      description:
                        "Prioritize fast responses.",
                      icon: Zap,
                    },
                  ].map((mode) => {
                    const Icon = mode.icon;
                    const selected = routingMode === mode.name;

                    return (
                      <button
                        type="button"
                        key={mode.name}
                        onClick={() => setRoutingMode(mode.name)}
                        className={`rounded-xl border p-4 text-left ${
                          selected
                            ? "border-slate-900 bg-slate-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                            <Icon size={17} />
                          </div>

                          {selected && (
                            <CheckCircle2
                              size={16}
                              className="text-emerald-600"
                            />
                          )}
                        </div>

                        <div className="mt-3 text-sm font-semibold">
                          {mode.name}
                        </div>

                        <div className="mt-1 text-xs leading-5 text-slate-500">
                          {mode.description}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">
                      Primary Model
                    </label>

                    <SelectField
                      value={selectedModel}
                      onChange={(event) =>
                        setSelectedModel(event.target.value)
                      }
                    >
                      {models.map((model) => (
                        <option key={model.id} value={model.name}>
                          {model.name}
                        </option>
                      ))}
                    </SelectField>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">
                      Fallback Model
                    </label>

                    <SelectField
                      value={fallbackModel}
                      onChange={(event) =>
                        setFallbackModel(event.target.value)
                      }
                    >
                      {models.map((model) => (
                        <option key={model.id} value={model.name}>
                          {model.name}
                        </option>
                      ))}
                    </SelectField>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <SectionTitle
                  title="Router Health"
                  description="Current routing infrastructure status."
                />

                <div className="mt-5 space-y-4">
                  {[
                    ["Routing Engine", "Operational", 99],
                    ["Model Availability", "Operational", 98],
                    ["Fallback Handling", "Operational", 100],
                    ["Policy Evaluation", "Operational", 97],
                  ].map(([name, status, value]) => (
                    <div key={name}>
                      <div className="mb-2 flex justify-between">
                        <span className="text-sm font-medium">
                          {name}
                        </span>

                        <span className="text-xs text-emerald-600">
                          {status}
                        </span>
                      </div>

                      <ScoreBar value={value} />
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={16}
                      className="text-emerald-600"
                    />

                    <span className="text-sm font-semibold text-emerald-900">
                      Router operating normally
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-emerald-800">
                    No model availability or routing policy failures detected.
                  </p>
                </div>
              </section>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Available Models"
                description="Models currently connected to the routing layer."
                action={
                  <button
                    type="button"
                    onClick={() => setActiveTab("models")}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    View all
                    <ArrowRight
                      size={13}
                      className="ml-1 inline"
                    />
                  </button>
                }
              />

              <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-4">
                {models.map((model) => (
                  <ModelCard
                    key={model.id}
                    model={model}
                    onUse={updateSelectedModel}
                  />
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Routing Rules"
                description="Rules used to select the optimal model."
                action={
                  <button
                    type="button"
                    onClick={() => setShowRuleModal(true)}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Plus size={14} />
                    Add Rule
                  </button>
                }
              />

              <div className="mt-5 space-y-3">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                        <GitBranch size={17} />
                      </div>

                      <div>
                        <div className="text-sm font-medium">
                          {rule.name}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {rule.condition}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="hidden text-xs text-slate-500 md:block">
                        {rule.primary} → {rule.fallback}
                      </div>

                      <Toggle
                        enabled={rule.enabled}
                        onChange={() => toggleRule(rule.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === "models" && (
          <section className="mt-6">
            <SectionTitle
              title="Model Registry"
              description="Manage and compare models available to the router."
            />

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="relative md:col-span-2">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search models..."
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <SelectField
                value={providerFilter}
                onChange={(event) =>
                  setProviderFilter(event.target.value)
                }
              >
                {providers.map((provider) => (
                  <option key={provider} value={provider}>
                    {provider === "All"
                      ? "All providers"
                      : provider}
                  </option>
                ))}
              </SelectField>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-4">
              {filteredModels.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  onUse={updateSelectedModel}
                />
              ))}
            </div>

            {filteredModels.length === 0 && (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <Cpu
                  size={30}
                  className="mx-auto text-slate-300"
                />

                <div className="mt-3 text-sm font-semibold">
                  No models found
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  Change the search or provider filter.
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === "routing-rules" && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionTitle
              title="Routing Rules"
              description="Configure intelligent model selection policies."
              action={
                <button
                  type="button"
                  onClick={() => setShowRuleModal(true)}
                  className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white"
                >
                  <Plus size={14} />
                  New Rule
                </button>
              }
            />

            <div className="mt-5 space-y-3">
              {rules.map((rule, index) => (
                <div
                  key={rule.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-xs font-semibold text-white">
                        {index + 1}
                      </div>

                      <div>
                        <div className="text-sm font-semibold">
                          {rule.name}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          When {rule.condition}
                        </div>
                      </div>
                    </div>

                    <Toggle
                      enabled={rule.enabled}
                      onChange={() => toggleRule(rule.id)}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <div className="text-[11px] text-slate-500">
                        Condition
                      </div>
                      <div className="mt-1 text-sm font-medium">
                        {rule.condition}
                      </div>
                    </div>

                    <div className="rounded-lg bg-emerald-50 p-3">
                      <div className="text-[11px] text-emerald-700">
                        Primary
                      </div>
                      <div className="mt-1 text-sm font-medium text-emerald-900">
                        {rule.primary}
                      </div>
                    </div>

                    <div className="rounded-lg bg-blue-50 p-3">
                      <div className="text-[11px] text-blue-700">
                        Fallback
                      </div>
                      <div className="mt-1 text-sm font-medium text-blue-900">
                        {rule.fallback}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "simulator" && (
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Routing Simulator"
                description="Test how the router selects a model for a request."
              />

              <div className="mt-5">
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Test Request
                </label>

                <textarea
                  value={simulationTask}
                  onChange={(event) =>
                    setSimulationTask(event.target.value)
                  }
                  rows={6}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-slate-400"
                />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Routing Mode
                  </label>

                  <SelectField
                    value={routingMode}
                    onChange={(event) =>
                      setRoutingMode(event.target.value)
                    }
                  >
                    <option>Balanced</option>
                    <option>Cost Optimized</option>
                    <option>Low Latency</option>
                  </SelectField>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Fallback
                  </label>

                  <SelectField
                    value={fallbackModel}
                    onChange={(event) =>
                      setFallbackModel(event.target.value)
                    }
                  >
                    {models.map((model) => (
                      <option key={model.id} value={model.name}>
                        {model.name}
                      </option>
                    ))}
                  </SelectField>
                </div>
              </div>

              <button
                type="button"
                onClick={runSimulation}
                className="mt-5 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                {simulating ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <Play size={15} />
                )}

                {simulating ? "Simulating..." : "Run Simulation"}
              </button>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                title="Routing Result"
                description="Estimated model selection for the current request."
              />

              <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Selected Model
                </div>

                <div className="mt-2 text-2xl font-semibold">
                  {routingMode === "Cost Optimized"
                    ? "DeepSeek V3"
                    : routingMode === "Low Latency"
                      ? "Gemini Pro"
                      : selectedModel}
                </div>

                <div className="mt-5 space-y-4">
                  {[
                    ["Quality", "94%"],
                    ["Latency", "1.42s"],
                    ["Cost", "$0.41"],
                    ["Reliability", "98%"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="mb-2 flex justify-between text-xs">
                        <span className="text-slate-500">
                          {label}
                        </span>

                        <span className="font-semibold">
                          {value}
                        </span>
                      </div>

                      <ScoreBar
                        value={
                          label === "Quality"
                            ? 94
                            : label === "Reliability"
                              ? 98
                              : label === "Latency"
                                ? 86
                                : 72
                        }
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={16}
                      className="text-emerald-600"
                    />

                    <span className="text-sm font-semibold text-emerald-900">
                      Routing decision ready
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-emerald-800">
                    The router selected the model that best matches the active
                    routing strategy.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      {showRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">
                    Create Routing Rule
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    Define when the router should choose a specific model.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="text-2xl leading-none text-slate-400 hover:text-slate-700"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Rule Name
                </label>

                <input
                  value={ruleName}
                  onChange={(event) =>
                    setRuleName(event.target.value)
                  }
                  placeholder="Example: Enterprise Quality"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Condition
                </label>

                <input
                  value={ruleCondition}
                  onChange={(event) =>
                    setRuleCondition(event.target.value)
                  }
                  placeholder="Example: Quality >= 95"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Primary Model
                  </label>

                  <SelectField
                    value={rulePrimary}
                    onChange={(event) =>
                      setRulePrimary(event.target.value)
                    }
                  >
                    {models.map((model) => (
                      <option key={model.id} value={model.name}>
                        {model.name}
                      </option>
                    ))}
                  </SelectField>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Fallback Model
                  </label>

                  <SelectField
                    value={ruleFallback}
                    onChange={(event) =>
                      setRuleFallback(event.target.value)
                    }
                  >
                    {models.map((model) => (
                      <option key={model.id} value={model.name}>
                        {model.name}
                      </option>
                    ))}
                  </SelectField>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 p-5">
              <button
                type="button"
                onClick={() => setShowRuleModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={addRule}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Create Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}