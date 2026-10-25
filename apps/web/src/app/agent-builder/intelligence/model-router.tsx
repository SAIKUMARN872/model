"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Brain,
  Route,
  Plus,
  CheckCircle2,
  Circle,
  Settings2,
  Zap,
  DollarSign,
  Clock3,
  BarChart3,
  Activity,
  ChevronDown,
  Edit3,
  Trash2,
  ArrowUp,
  ArrowDown,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Server,
  Gauge,
  Target,
} from "lucide-react";

type RoutingMode =
  | "Automatic"
  | "Cost Optimized"
  | "Quality First"
  | "Latency First";

type ModelStatus = "Active" | "Standby" | "Disabled";

type ModelConfig = {
  id: number;
  name: string;
  provider: string;
  purpose: string;
  status: ModelStatus;
  quality: number;
  latency: number;
  cost: number;
  context: string;
  priority: number;
};

type RouteRule = {
  id: number;
  name: string;
  condition: string;
  target: string;
  enabled: boolean;
};

export default function ModelRouterPage() {
  const [routingMode, setRoutingMode] =
    useState<RoutingMode>("Automatic");

  const [fallbackEnabled, setFallbackEnabled] =
    useState(true);

  const [loadBalancing, setLoadBalancing] =
    useState(true);

  const [costGuard, setCostGuard] =
    useState(true);

  const [qualityThreshold, setQualityThreshold] =
    useState(80);

  const [latencyThreshold, setLatencyThreshold] =
    useState(1200);

  const [showAdvanced, setShowAdvanced] =
    useState(false);

  const [saved, setSaved] = useState(false);

  const [models, setModels] = useState<ModelConfig[]>([
    {
      id: 1,
      name: "GPT-5.6",
      provider: "OpenAI",
      purpose: "Complex reasoning",
      status: "Active",
      quality: 96,
      latency: 920,
      cost: 0.42,
      context: "400K",
      priority: 1,
    },
    {
      id: 2,
      name: "Claude Sonnet",
      provider: "Anthropic",
      purpose: "Long-context analysis",
      status: "Active",
      quality: 93,
      latency: 780,
      cost: 0.31,
      context: "200K",
      priority: 2,
    },
    {
      id: 3,
      name: "Gemini Pro",
      provider: "Google",
      purpose: "Multimodal tasks",
      status: "Active",
      quality: 91,
      latency: 690,
      cost: 0.24,
      context: "1M",
      priority: 3,
    },
    {
      id: 4,
      name: "Fast Model",
      provider: "ModelNow",
      purpose: "Simple requests",
      status: "Standby",
      quality: 84,
      latency: 280,
      cost: 0.06,
      context: "128K",
      priority: 4,
    },
  ]);

  const [rules, setRules] = useState<RouteRule[]>([
    {
      id: 1,
      name: "Complex Reasoning",
      condition: "Reasoning score > 80",
      target: "GPT-5.6",
      enabled: true,
    },
    {
      id: 2,
      name: "Long Context",
      condition: "Context > 100K tokens",
      target: "Gemini Pro",
      enabled: true,
    },
    {
      id: 3,
      name: "Low Latency",
      condition: "Latency requirement < 500ms",
      target: "Fast Model",
      enabled: true,
    },
    {
      id: 4,
      name: "Cost Sensitive",
      condition: "Budget mode enabled",
      target: "Fast Model",
      enabled: true,
    },
  ]);

  const activeModels = models.filter(
    (model) => model.status === "Active"
  ).length;

  const averageQuality = useMemo(() => {
    if (models.length === 0) {
      return 0;
    }

    return Math.round(
      models.reduce(
        (total, model) => total + model.quality,
        0
      ) / models.length
    );
  }, [models]);

  const averageLatency = useMemo(() => {
    if (models.length === 0) {
      return 0;
    }

    return Math.round(
      models.reduce(
        (total, model) => total + model.latency,
        0
      ) / models.length
    );
  }, [models]);

  const averageCost = useMemo(() => {
    if (models.length === 0) {
      return 0;
    }

    return (
      models.reduce(
        (total, model) => total + model.cost,
        0
      ) / models.length
    ).toFixed(2);
  }, [models]);

  const toggleRule = (id: number) => {
    setRules((items) =>
      items.map((rule) =>
        rule.id === id
          ? {
              ...rule,
              enabled: !rule.enabled,
            }
          : rule
      )
    );
  };

  const toggleModelStatus = (id: number) => {
    setModels((items) =>
      items.map((model) => {
        if (model.id !== id) {
          return model;
        }

        return {
          ...model,
          status:
            model.status === "Active"
              ? "Disabled"
              : "Active",
        };
      })
    );
  };

  const deleteModel = (id: number) => {
    setModels((items) =>
      items.filter((model) => model.id !== id)
    );
  };

  const addModel = () => {
    const nextId =
      models.length > 0
        ? Math.max(...models.map((model) => model.id)) + 1
        : 1;

    setModels((items) => [
      ...items,
      {
        id: nextId,
        name: "New Model",
        provider: "Custom",
        purpose: "General purpose",
        status: "Standby",
        quality: 80,
        latency: 1000,
        cost: 0.15,
        context: "128K",
        priority: nextId,
      },
    ]);
  };

  const movePriority = (
    id: number,
    direction: "up" | "down"
  ) => {
    setModels((items) => {
      const sorted = [...items].sort(
        (a, b) => a.priority - b.priority
      );

      const index = sorted.findIndex(
        (model) => model.id === id
      );

      const targetIndex =
        direction === "up"
          ? index - 1
          : index + 1;

      if (
        index < 0 ||
        targetIndex < 0 ||
        targetIndex >= sorted.length
      ) {
        return items;
      }

      const current = sorted[index];
      const target = sorted[targetIndex];

      const currentPriority = current.priority;

      current.priority = target.priority;
      target.priority = currentPriority;

      return sorted;
    });
  };

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#111827]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
              <Route size={23} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">
                  Model Router
                </h1>

                <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                  Agent Intelligence
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Dynamically select the best AI model based on
                quality, cost, latency and task requirements.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-2 text-sm font-medium text-green-600">
                <CheckCircle2 size={16} />
                Configuration saved
              </span>
            )}

            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              <CheckCircle2 size={16} />
              Save Configuration
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-8 py-8">
        <section className="mb-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<Server size={18} />}
            title="Active Models"
            value={`${activeModels}`}
            description="Available for routing"
          />

          <MetricCard
            icon={<Target size={18} />}
            title="Average Quality"
            value={`${averageQuality}%`}
            description="Model quality score"
          />

          <MetricCard
            icon={<Clock3 size={18} />}
            title="Average Latency"
            value={`${averageLatency}ms`}
            description="Across configured models"
          />

          <MetricCard
            icon={<DollarSign size={18} />}
            title="Average Cost"
            value={`$${averageCost}`}
            description="Estimated cost per request"
          />
        </section>

        <div className="grid gap-7 xl:grid-cols-[1fr_380px]">
          <div className="space-y-7">
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Brain size={20} />
                </div>

                <div>
                  <h2 className="font-semibold">
                    Routing Strategy
                  </h2>

                  <p className="text-sm text-gray-500">
                    Decide how the router selects models for each
                    request.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <RoutingModeButton
                  active={routingMode === "Automatic"}
                  icon={<Sparkles size={18} />}
                  title="Automatic"
                  description="AI selects the best model using task requirements."
                  onClick={() =>
                    setRoutingMode("Automatic")
                  }
                />

                <RoutingModeButton
                  active={
                    routingMode === "Cost Optimized"
                  }
                  icon={<DollarSign size={18} />}
                  title="Cost Optimized"
                  description="Prefer the lowest-cost model that meets quality requirements."
                  onClick={() =>
                    setRoutingMode("Cost Optimized")
                  }
                />

                <RoutingModeButton
                  active={
                    routingMode === "Quality First"
                  }
                  icon={<BarChart3 size={18} />}
                  title="Quality First"
                  description="Prefer the highest-quality model for difficult tasks."
                  onClick={() =>
                    setRoutingMode("Quality First")
                  }
                />

                <RoutingModeButton
                  active={
                    routingMode === "Latency First"
                  }
                  icon={<Gauge size={18} />}
                  title="Latency First"
                  description="Prefer the fastest available model."
                  onClick={() =>
                    setRoutingMode("Latency First")
                  }
                />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">
                    Model Pool
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Models available to the routing engine.
                  </p>
                </div>

                <button
                  onClick={addModel}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium hover:bg-gray-50"
                >
                  <Plus size={14} />
                  Add Model
                </button>
              </div>

              <div className="space-y-3">
                {models
                  .sort(
                    (a, b) =>
                      a.priority - b.priority
                  )
                  .map((model, index) => (
                    <ModelRow
                      key={model.id}
                      model={model}
                      index={index}
                      onToggle={() =>
                        toggleModelStatus(model.id)
                      }
                      onDelete={() =>
                        deleteModel(model.id)
                      }
                      onMoveUp={() =>
                        movePriority(
                          model.id,
                          "up"
                        )
                      }
                      onMoveDown={() =>
                        movePriority(
                          model.id,
                          "down"
                        )
                      }
                    />
                  ))}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <SlidersHorizontal size={20} />
                </div>

                <div>
                  <h2 className="font-semibold">
                    Routing Rules
                  </h2>

                  <p className="text-sm text-gray-500">
                    Define conditions that influence model
                    selection.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {rules.map((rule) => (
                  <RuleRow
                    key={rule.id}
                    rule={rule}
                    onToggle={() =>
                      toggleRule(rule.id)
                    }
                  />
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <button
                onClick={() =>
                  setShowAdvanced(!showAdvanced)
                }
                className="flex w-full items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                    <Settings2 size={19} />
                  </div>

                  <div className="text-left">
                    <h2 className="font-semibold">
                      Advanced Router Settings
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Configure fallback, balancing and budget
                      controls.
                    </p>
                  </div>
                </div>

                <ChevronDown
                  size={20}
                  className={`text-gray-400 transition ${
                    showAdvanced ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showAdvanced && (
                <div className="mt-6 space-y-4 border-t border-gray-100 pt-6">
                  <SettingToggle
                    title="Automatic Fallback"
                    description="Switch to another model when the selected model fails."
                    enabled={fallbackEnabled}
                    onToggle={() =>
                      setFallbackEnabled(
                        !fallbackEnabled
                      )
                    }
                  />

                  <SettingToggle
                    title="Load Balancing"
                    description="Distribute requests across available models."
                    enabled={loadBalancing}
                    onToggle={() =>
                      setLoadBalancing(
                        !loadBalancing
                      )
                    }
                  />

                  <SettingToggle
                    title="Cost Guard"
                    description="Prevent routing to expensive models when budget limits are reached."
                    enabled={costGuard}
                    onToggle={() =>
                      setCostGuard(!costGuard)
                    }
                  />

                  <div className="rounded-xl border border-gray-200 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          Minimum Quality Score
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Models below this score will not be selected.
                        </p>
                      </div>

                      <span className="text-sm font-semibold">
                        {qualityThreshold}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={qualityThreshold}
                      onChange={(event) =>
                        setQualityThreshold(
                          Number(event.target.value)
                        )
                      }
                      className="w-full accent-black"
                    />
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          Maximum Latency
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Prefer models that respond within this limit.
                        </p>
                      </div>

                      <span className="text-sm font-semibold">
                        {latencyThreshold}ms
                      </span>
                    </div>

                    <input
                      type="range"
                      min="200"
                      max="3000"
                      step="100"
                      value={latencyThreshold}
                      onChange={(event) =>
                        setLatencyThreshold(
                          Number(event.target.value)
                        )
                      }
                      className="w-full accent-black"
                    />
                  </div>
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-7">
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">
                    Router Status
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Current routing configuration
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600">
                  <Activity size={17} />
                </div>
              </div>

              <div className="space-y-4">
                <StatusRow
                  label="Routing Mode"
                  value={routingMode}
                />

                <StatusRow
                  label="Active Models"
                  value={`${activeModels}`}
                />

                <StatusRow
                  label="Fallback"
                  value={
                    fallbackEnabled
                      ? "Enabled"
                      : "Disabled"
                  }
                />

                <StatusRow
                  label="Load Balancing"
                  value={
                    loadBalancing
                      ? "Enabled"
                      : "Disabled"
                  }
                />

                <StatusRow
                  label="Cost Guard"
                  value={
                    costGuard
                      ? "Enabled"
                      : "Disabled"
                  }
                />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-5 font-semibold">
                Routing Performance
              </h2>

              <PerformanceMetric
                icon={<BarChart3 size={17} />}
                label="Quality Score"
                value={`${averageQuality}%`}
                progress={averageQuality}
              />

              <PerformanceMetric
                icon={<Clock3 size={17} />}
                label="Latency Efficiency"
                value={`${Math.max(
                  0,
                  100 -
                    Math.round(
                      averageLatency / 30
                    )
                )}%`}
                progress={Math.max(
                  0,
                  100 -
                    Math.round(
                      averageLatency / 30
                    )
                )}
              />

              <PerformanceMetric
                icon={<DollarSign size={17} />}
                label="Cost Efficiency"
                value={`$${averageCost}`}
                progress={Math.max(
                  10,
                  Math.min(
                    100,
                    100 -
                      Math.round(
                        Number(averageCost) * 100
                      )
                  )
                )}
              />
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-5 font-semibold">
                Quality Threshold
              </h2>

              <div className="mb-4 flex items-end justify-between">
                <div>
                  <p className="text-3xl font-semibold">
                    {qualityThreshold}%
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Minimum accepted quality
                  </p>
                </div>

                <ShieldCheck
                  size={22}
                  className="text-gray-400"
                />
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-black"
                  style={{
                    width: `${qualityThreshold}%`,
                  }}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 font-semibold">
                Quick Actions
              </h2>

              <div className="space-y-2">
                <QuickAction
                  icon={<Plus size={16} />}
                  title="Add Model"
                  onClick={addModel}
                />

                <QuickAction
                  icon={<Route size={16} />}
                  title="Test Routing"
                />

                <QuickAction
                  icon={<BarChart3 size={16} />}
                  title="Routing Analytics"
                />

                <QuickAction
                  icon={<Settings2 size={16} />}
                  title="Router Settings"
                  onClick={() =>
                    setShowAdvanced(true)
                  }
                />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function MetricCard({
  icon,
  title,
  value,
  description,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
        {icon}
      </div>

      <p className="text-xs font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-semibold">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-400">
        {description}
      </p>
    </div>
  );
}

function RoutingModeButton({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition ${
        active
          ? "border-black bg-gray-50"
          : "border-gray-200 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            active
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {icon}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">
              {title}
            </span>

            {active && (
              <CheckCircle2
                size={14}
                className="text-green-600"
              />
            )}
          </div>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

function ModelRow({
  model,
  index,
  onToggle,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  model: ModelConfig;
  index: number;
  onToggle: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const statusClass =
    model.status === "Active"
      ? "bg-green-50 text-green-700"
      : model.status === "Standby"
        ? "bg-yellow-50 text-yellow-700"
        : "bg-gray-100 text-gray-500";

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-500">
          {String(index + 1).padStart(2, "0")}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">
              {model.name}
            </h3>

            <span className="text-[10px] text-gray-400">
              {model.provider}
            </span>

            <span
              className={`rounded-full px-2 py-1 text-[10px] font-medium ${statusClass}`}
            >
              {model.status}
            </span>
          </div>

          <p className="mt-1 text-xs text-gray-500">
            {model.purpose}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SmallMetric
              label="Quality"
              value={`${model.quality}%`}
            />

            <SmallMetric
              label="Latency"
              value={`${model.latency}ms`}
            />

            <SmallMetric
              label="Cost"
              value={`$${model.cost}`}
            />

            <SmallMetric
              label="Context"
              value={model.context}
            />
          </div>
        </div>

        <div className="hidden items-center gap-1 sm:flex">
          <button
            onClick={onMoveUp}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            title="Move up"
          >
            <ArrowUp size={14} />
          </button>

          <button
            onClick={onMoveDown}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            title="Move down"
          >
            <ArrowDown size={14} />
          </button>

          <button
            onClick={onToggle}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            title="Toggle model"
          >
            <CheckCircle2 size={15} />
          </button>

          <button
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            title="Edit model"
          >
            <Edit3 size={15} />
          </button>

          <button
            onClick={onDelete}
            className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
            title="Delete model"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SmallMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] text-gray-400">
        {label}
      </p>

      <p className="mt-0.5 text-xs font-semibold text-gray-700">
        {value}
      </p>
    </div>
  );
}

function RuleRow({
  rule,
  onToggle,
}: {
  rule: RouteRule;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
      <div className="flex items-start gap-3">
        {rule.enabled ? (
          <CheckCircle2
            size={18}
            className="mt-0.5 text-green-500"
          />
        ) : (
          <Circle
            size={18}
            className="mt-0.5 text-gray-300"
          />
        )}

        <div>
          <p className="text-sm font-medium">
            {rule.name}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {rule.condition}
          </p>

          <p className="mt-2 text-[11px] font-medium text-gray-700">
            Route to: {rule.target}
          </p>
        </div>
      </div>

      <button
        onClick={onToggle}
        className={`relative h-6 w-11 shrink-0 rounded-full ${
          rule.enabled ? "bg-black" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            rule.enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function SettingToggle({
  title,
  description,
  enabled,
  onToggle,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
      <div>
        <p className="text-sm font-medium">
          {title}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          {description}
        </p>
      </div>

      <button
        onClick={onToggle}
        className={`relative h-6 w-11 shrink-0 rounded-full ${
          enabled ? "bg-black" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function PerformanceMetric({
  icon,
  label,
  value,
  progress,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  progress: number;
}) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">
            {icon}
          </span>

          <span className="text-xs font-medium text-gray-600">
            {label}
          </span>
        </div>

        <span className="text-xs font-semibold">
          {value}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-black transition-all"
          style={{
            width: `${Math.max(
              0,
              Math.min(100, progress)
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

function StatusRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
      <span className="text-xs text-gray-500">
        {label}
      </span>

      <span className="text-xs font-medium text-gray-800">
        {value}
      </span>
    </div>
  );
}

function QuickAction({
  icon,
  title,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-left text-sm hover:bg-gray-50"
    >
      <span className="text-gray-500">
        {icon}
      </span>

      <span className="font-medium">
        {title}
      </span>
    </button>
  );
}