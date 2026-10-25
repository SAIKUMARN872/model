"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Cpu,
  DollarSign,
  Gauge,
  GitBranch,
  Lightbulb,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

type OptimizationStatus = "Active" | "Monitoring" | "Completed";

type OptimizationRule = {
  id: string;
  name: string;
  description: string;
  category: string;
  status: OptimizationStatus;
  impact: string;
  savings: string;
  latency: string;
  confidence: number;
};

type Recommendation = {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedSavings: string;
  latencyImprovement: string;
  confidence: number;
};

const initialRules: OptimizationRule[] = [
  {
    id: "rule-1",
    name: "Model Routing",
    description:
      "Automatically route simple requests to lower-cost models while preserving quality for complex tasks.",
    category: "Cost",
    status: "Active",
    impact: "High",
    savings: "24%",
    latency: "-18%",
    confidence: 96,
  },
  {
    id: "rule-2",
    name: "Prompt Compression",
    description:
      "Reduce unnecessary context and repeated instructions before sending requests to the model.",
    category: "Tokens",
    status: "Active",
    impact: "High",
    savings: "17%",
    latency: "-11%",
    confidence: 93,
  },
  {
    id: "rule-3",
    name: "Context Selection",
    description:
      "Select only the most relevant knowledge chunks instead of sending the complete retrieval result.",
    category: "RAG",
    status: "Active",
    impact: "Medium",
    savings: "12%",
    latency: "-9%",
    confidence: 91,
  },
  {
    id: "rule-4",
    name: "Cache Repeated Requests",
    description:
      "Reuse safe responses for repeated or semantically equivalent requests.",
    category: "Performance",
    status: "Monitoring",
    impact: "Medium",
    savings: "9%",
    latency: "-21%",
    confidence: 87,
  },
  {
    id: "rule-5",
    name: "Tool Call Reduction",
    description:
      "Avoid redundant tool calls by reusing previously retrieved information during a workflow.",
    category: "Agents",
    status: "Completed",
    impact: "Low",
    savings: "6%",
    latency: "-7%",
    confidence: 84,
  },
];

const recommendations: Recommendation[] = [
  {
    id: "rec-1",
    title: "Route classification requests to a smaller model",
    description:
      "The optimization engine detected a large number of low-complexity requests currently using the production model.",
    category: "Model Routing",
    estimatedSavings: "18–25%",
    latencyImprovement: "15–22%",
    confidence: 94,
  },
  {
    id: "rec-2",
    title: "Compress large RAG contexts",
    description:
      "Several workflows are sending more retrieved context than the model needs to answer the request.",
    category: "Context Optimization",
    estimatedSavings: "10–16%",
    latencyImprovement: "8–14%",
    confidence: 91,
  },
  {
    id: "rec-3",
    title: "Enable semantic response caching",
    description:
      "Repeated requests with similar inputs were detected across multiple agent workflows.",
    category: "Caching",
    estimatedSavings: "7–12%",
    latencyImprovement: "18–30%",
    confidence: 88,
  },
];

export default function AIOptimizationPage() {
  const [rules, setRules] = useState<OptimizationRule[]>(initialRules);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState("2 minutes ago");

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("Cost");

  const categories = [
    "All",
    "Cost",
    "Tokens",
    "RAG",
    "Performance",
    "Agents",
  ];

  const filteredRules = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rules.filter((rule) => {
      const matchesSearch =
        !query ||
        rule.name.toLowerCase().includes(query) ||
        rule.description.toLowerCase().includes(query) ||
        rule.category.toLowerCase().includes(query);

      const matchesCategory =
        category === "All" || rule.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [rules, search, category]);

  const activeRules = rules.filter(
    (rule) => rule.status === "Active",
  ).length;

  const totalSavings = rules.reduce(
    (sum, rule) => sum + Number(rule.savings.replace("%", "")),
    0,
  );

  const runOptimization = () => {
    setRunning(true);

    setTimeout(() => {
      setRunning(false);
      setLastRun("just now");
    }, 1200);
  };

  const createRule = () => {
    if (!newName.trim()) return;

    const newRule: OptimizationRule = {
      id: `rule-${Date.now()}`,
      name: newName.trim(),
      description:
        newDescription.trim() ||
        "Custom AI optimization rule created for the agent platform.",
      category: newCategory,
      status: "Monitoring",
      impact: "Medium",
      savings: "5%",
      latency: "-4%",
      confidence: 80,
    };

    setRules((current) => [newRule, ...current]);
    setNewName("");
    setNewDescription("");
    setNewCategory("Cost");
    setShowCreate(false);
  };

  const toggleRule = (id: string) => {
    setRules((current) =>
      current.map((rule) =>
        rule.id === id
          ? {
              ...rule,
              status:
                rule.status === "Active"
                  ? "Monitoring"
                  : "Active",
            }
          : rule,
      ),
    );
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#111827]">
      <div className="mx-auto max-w-[1500px] px-6 py-6">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/agent-builder/observability"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-[#6b7280] transition hover:bg-[#f3f4f6]"
            >
              <ArrowLeft size={17} />
            </Link>

            <div>
              <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                <span>Observability</span>
                <span>/</span>
                <span className="text-[#111827]">
                  AI Optimization Engine
                </span>
              </div>

              <h1 className="mt-1 text-[25px] font-semibold tracking-[-0.02em]">
                AI Optimization Engine
              </h1>

              <p className="mt-1 text-sm text-[#6b7280]">
                Automatically identify opportunities to reduce cost,
                latency, and token usage while maintaining quality.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runOptimization}
              disabled={running}
              className="flex h-10 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 text-sm font-medium text-[#374151] transition hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={running ? "animate-spin" : ""}
              />
              {running ? "Analyzing..." : "Run optimization"}
            </button>

            <button
              onClick={() => setShowCreate(true)}
              className="flex h-10 items-center gap-2 rounded-lg bg-[#111827] px-4 text-sm font-medium text-white transition hover:bg-[#1f2937]"
            >
              <SlidersHorizontal size={16} />
              Create rule
            </button>
          </div>
        </header>

        <section className="mb-6 grid grid-cols-4 gap-4">
          <MetricCard
            label="Estimated savings"
            value={`${totalSavings}%`}
            subtitle="Across active rules"
            icon={<DollarSign size={17} />}
            trend="+8.4%"
          />

          <MetricCard
            label="Latency improvement"
            value="16.8%"
            subtitle="Average reduction"
            icon={<Clock3 size={17} />}
            trend="+4.2%"
          />

          <MetricCard
            label="Token efficiency"
            value="23.4%"
            subtitle="Tokens avoided"
            icon={<Zap size={17} />}
            trend="+6.1%"
          />

          <MetricCard
            label="Active rules"
            value={activeRules.toString()}
            subtitle="Currently optimizing"
            icon={<Activity size={17} />}
            trend="Stable"
          />
        </section>

        <section className="mb-6 rounded-xl border border-[#e5e7eb] bg-white p-5">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef2ff] text-[#4f46e5]">
                  <Cpu size={18} />
                </div>

                <div>
                  <h2 className="text-base font-semibold">
                    Optimization overview
                  </h2>
                  <p className="text-xs text-[#6b7280]">
                    AI-driven optimization across your agent
                    infrastructure.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#6b7280]">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Engine active
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <OptimizationOverview
              title="Cost optimization"
              value="24.6%"
              description="Estimated reduction in model spend"
              progress={78}
              icon={<DollarSign size={16} />}
            />

            <OptimizationOverview
              title="Latency optimization"
              value="16.8%"
              description="Average response-time reduction"
              progress={66}
              icon={<Gauge size={16} />}
            />

            <OptimizationOverview
              title="Quality preservation"
              value="98.1%"
              description="Quality maintained after optimization"
              progress={98}
              icon={<Target size={16} />}
            />
          </div>
        </section>

        <div className="grid grid-cols-[minmax(0,1fr)_390px] gap-5">
          <section className="rounded-xl border border-[#e5e7eb] bg-white">
            <div className="border-b border-[#eef0f3] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold">
                    Optimization rules
                  </h2>
                  <p className="mt-1 text-xs text-[#6b7280]">
                    Rules continuously applied to your AI workloads.
                  </p>
                </div>

                <span className="rounded-full bg-[#f3f4f6] px-2.5 py-1 text-[11px] font-medium text-[#6b7280]">
                  Last analysis: {lastRun}
                </span>
              </div>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
                  />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search optimization rules..."
                    className="h-9 w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] pl-9 pr-3 text-sm outline-none focus:bg-white"
                  />
                </div>

                <div className="relative w-40">
                  <select
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value)
                    }
                    className="h-9 w-full appearance-none rounded-lg border border-[#e5e7eb] bg-white px-3 pr-8 text-xs font-medium text-[#374151] outline-none"
                  >
                    {categories.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>

                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
                  />
                </div>
              </div>
            </div>

            <div className="divide-y divide-[#eef0f3]">
              {filteredRules.map((rule) => (
                <OptimizationRuleRow
                  key={rule.id}
                  rule={rule}
                  onToggle={() => toggleRule(rule.id)}
                />
              ))}

              {filteredRules.length === 0 && (
                <div className="p-10 text-center text-sm text-[#6b7280]">
                  No optimization rules found.
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-xl border border-[#e5e7eb] bg-white">
              <div className="flex items-center justify-between border-b border-[#eef0f3] px-4 py-3">
                <div>
                  <h2 className="text-sm font-semibold">
                    AI recommendations
                  </h2>
                  <p className="mt-1 text-[11px] text-[#9ca3af]">
                    Suggestions generated from workload patterns.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowRecommendations(
                      !showRecommendations,
                    )
                  }
                  className="text-xs font-medium text-[#6b7280]"
                >
                  {showRecommendations ? "Hide" : "Show"}
                </button>
              </div>

              {showRecommendations && (
                <div className="divide-y divide-[#eef0f3]">
                  {recommendations.map((recommendation) => (
                    <RecommendationCard
                      key={recommendation.id}
                      recommendation={recommendation}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-xl border border-[#e5e7eb] bg-white p-4">
              <div className="mb-4 flex items-center gap-2">
                <Lightbulb size={17} className="text-amber-500" />
                <h2 className="text-sm font-semibold">
                  Optimization strategy
                </h2>
              </div>

              <div className="space-y-3">
                <StrategyRow
                  label="Cost priority"
                  value="High"
                />
                <StrategyRow
                  label="Latency priority"
                  value="High"
                />
                <StrategyRow
                  label="Quality protection"
                  value="Strict"
                />
                <StrategyRow
                  label="Automatic deployment"
                  value="Disabled"
                />
              </div>

              <Link
                href="/agent-builder/observability"
                className="mt-4 flex items-center justify-between rounded-lg border border-[#e5e7eb] px-3 py-2.5 text-xs font-medium text-[#374151] hover:bg-[#f9fafb]"
              >
                View optimization traces
                <ArrowRight size={14} />
              </Link>
            </section>

            <section className="rounded-xl border border-[#e5e7eb] bg-white p-4">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck
                  size={17}
                  className="text-emerald-600"
                />
                <h2 className="text-sm font-semibold">
                  Safety guardrails
                </h2>
              </div>

              <div className="space-y-3">
                <GuardrailRow
                  label="Quality regression protection"
                  enabled
                />
                <GuardrailRow
                  label="Cost increase protection"
                  enabled
                />
                <GuardrailRow
                  label="Production auto-deploy"
                  enabled={false}
                />
              </div>
            </section>
          </aside>
        </div>
      </div>

      {showCreate && (
        <Modal
          title="Create optimization rule"
          onClose={() => setShowCreate(false)}
        >
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-medium text-[#374151]">
                Rule name
              </label>

              <input
                value={newName}
                onChange={(event) =>
                  setNewName(event.target.value)
                }
                placeholder="Example: Smart model routing"
                className="h-10 w-full rounded-lg border border-[#e5e7eb] px-3 text-sm outline-none focus:border-[#9ca3af]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-[#374151]">
                Category
              </label>

              <div className="relative">
                <select
                  value={newCategory}
                  onChange={(event) =>
                    setNewCategory(event.target.value)
                  }
                  className="h-10 w-full appearance-none rounded-lg border border-[#e5e7eb] bg-white px-3 pr-9 text-sm outline-none"
                >
                  {categories
                    .filter((item) => item !== "All")
                    .map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-[#374151]">
                Description
              </label>

              <textarea
                value={newDescription}
                onChange={(event) =>
                  setNewDescription(event.target.value)
                }
                rows={4}
                placeholder="Describe what this optimization rule should improve..."
                className="w-full resize-none rounded-lg border border-[#e5e7eb] px-3 py-2.5 text-sm outline-none focus:border-[#9ca3af]"
              />
            </div>

            <div className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb] p-3 text-xs leading-5 text-[#6b7280]">
              New rules start in monitoring mode. The optimization
              engine will evaluate their impact before they are
              activated.
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="h-9 rounded-lg border border-[#e5e7eb] px-4 text-sm font-medium text-[#374151]"
              >
                Cancel
              </button>

              <button
                onClick={createRule}
                className="h-9 rounded-lg bg-[#111827] px-4 text-sm font-medium text-white"
              >
                Create rule
              </button>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
}

function MetricCard({
  label,
  value,
  subtitle,
  icon,
  trend,
}: {
  label: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
  trend: string;
}) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3f4f6] text-[#6b7280]">
          {icon}
        </div>

        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
          {trend.startsWith("+") ? (
            <TrendingUp size={12} />
          ) : (
            <Activity size={12} />
          )}
          {trend}
        </span>
      </div>

      <p className="mt-4 text-xs font-medium text-[#6b7280]">
        {label}
      </p>

      <p className="mt-1 text-[24px] font-semibold">{value}</p>

      <p className="mt-1 text-[11px] text-[#9ca3af]">
        {subtitle}
      </p>
    </div>
  );
}

function OptimizationOverview({
  title,
  value,
  description,
  progress,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  progress: number;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] p-4">
      <div className="flex items-center gap-2 text-[#6b7280]">
        {icon}
        <span className="text-xs font-medium">{title}</span>
      </div>

      <div className="mt-3 flex items-end justify-between">
        <span className="text-[22px] font-semibold">{value}</span>
        <span className="text-[11px] text-[#9ca3af]">
          optimized
        </span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#eef0f3]">
        <div
          className="h-full rounded-full bg-[#111827]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-2 text-[11px] leading-4 text-[#9ca3af]">
        {description}
      </p>
    </div>
  );
}

function OptimizationRuleRow({
  rule,
  onToggle,
}: {
  rule: OptimizationRule;
  onToggle: () => void;
}) {
  return (
    <div className="p-4 transition hover:bg-[#fafafa]">
      <div className="flex items-start justify-between gap-5">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f3f4f6] text-[#6b7280]">
            <GitBranch size={17} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">{rule.name}</h3>
              <StatusBadge status={rule.status} small />
            </div>

            <p className="mt-1 max-w-[620px] text-xs leading-5 text-[#6b7280]">
              {rule.description}
            </p>

            <div className="mt-3 flex items-center gap-4 text-[11px]">
              <span className="rounded-md bg-[#f3f4f6] px-2 py-1 font-medium text-[#6b7280]">
                {rule.category}
              </span>

              <span className="flex items-center gap-1 text-emerald-600">
                <TrendingDown size={12} />
                {rule.savings} savings
              </span>

              <span className="flex items-center gap-1 text-blue-600">
                <Clock3 size={12} />
                {rule.latency} latency
              </span>

              <span className="text-[#9ca3af]">
                {rule.confidence}% confidence
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="text-right">
            <p className="text-[11px] text-[#9ca3af]">Impact</p>
            <p className="mt-1 text-xs font-semibold">
              {rule.impact}
            </p>
          </div>

          <button
            onClick={onToggle}
            className={`relative h-6 w-11 rounded-full transition ${
              rule.status === "Active"
                ? "bg-[#111827]"
                : "bg-[#d1d5db]"
            }`}
            aria-label={`Toggle ${rule.name}`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                rule.status === "Active"
                  ? "left-6"
                  : "left-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({
  recommendation,
}: {
  recommendation: Recommendation;
}) {
  return (
    <div className="p-4">
      <div className="mb-2 flex items-start gap-2">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
          <Lightbulb size={14} />
        </div>

        <div>
          <h3 className="text-xs font-semibold leading-4">
            {recommendation.title}
          </h3>

          <span className="mt-1 inline-block rounded-md bg-[#f3f4f6] px-2 py-1 text-[10px] font-medium text-[#6b7280]">
            {recommendation.category}
          </span>
        </div>
      </div>

      <p className="text-[11px] leading-5 text-[#6b7280]">
        {recommendation.description}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-[#f9fafb] p-2.5">
          <p className="text-[10px] text-[#9ca3af]">
            Estimated savings
          </p>
          <p className="mt-1 text-xs font-semibold text-emerald-600">
            {recommendation.estimatedSavings}
          </p>
        </div>

        <div className="rounded-lg bg-[#f9fafb] p-2.5">
          <p className="text-[10px] text-[#9ca3af]">
            Latency improvement
          </p>
          <p className="mt-1 text-xs font-semibold text-blue-600">
            {recommendation.latencyImprovement}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] text-[#9ca3af]">
          Confidence {recommendation.confidence}%
        </span>

        <button className="flex items-center gap-1 text-[11px] font-medium text-[#374151]">
          Review
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}

function StrategyRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[#6b7280]">{label}</span>
      <span className="text-xs font-semibold text-[#111827]">
        {value}
      </span>
    </div>
  );
}

function GuardrailRow({
  label,
  enabled,
}: {
  label: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-[#6b7280]">{label}</span>

      <span
        className={`flex items-center gap-1.5 text-[11px] font-medium ${
          enabled ? "text-emerald-600" : "text-[#9ca3af]"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            enabled ? "bg-emerald-500" : "bg-[#9ca3af]"
          }`}
        />
        {enabled ? "Enabled" : "Disabled"}
      </span>
    </div>
  );
}

function StatusBadge({
  status,
  small = false,
}: {
  status: OptimizationStatus;
  small?: boolean;
}) {
  const styles = {
    Active: "bg-emerald-50 text-emerald-700",
    Monitoring: "bg-amber-50 text-amber-700",
    Completed: "bg-blue-50 text-blue-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${
        small ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"
      } ${styles[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "Active"
            ? "bg-emerald-500"
            : status === "Monitoring"
              ? "bg-amber-500"
              : "bg-blue-500"
        }`}
      />
      {status}
    </span>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-xl border border-[#e5e7eb] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#eef0f3] px-5 py-4">
          <h2 className="text-base font-semibold">{title}</h2>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7280] hover:bg-[#f3f4f6]"
          >
            <span className="text-[20px] leading-none">×</span>
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}