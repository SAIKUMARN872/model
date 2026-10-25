"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  GitBranch,
  Layers,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Terminal,
  TestTube2,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

type Section = {
  title: string;
  description: string;
  icon: typeof Bot;
  items: {
    name: string;
    description: string;
    href: string;
    icon: typeof Bot;
  }[];
};

const sections: Section[] = [
  {
    title: "Agent Creation",
    description: "Create and configure production-ready AI agents.",
    icon: Bot,
    items: [
      {
        name: "Create with AI",
        description: "Describe your agent and generate its configuration.",
        href: "/agent-builder/creation/create-with-ai",
        icon: Bot,
      },
      {
        name: "Visual Builder",
        description: "Build agents visually using workflow nodes.",
        href: "/agent-builder/creation/visual-builder",
        icon: Layers,
      },
      {
        name: "Pro-Code Builder",
        description: "Create agents with full developer control.",
        href: "/agent-builder/creation/pro-code-builder",
        icon: Terminal,
      },
      {
        name: "Templates",
        description: "Start from reusable agent templates.",
        href: "/agent-builder/creation/templates",
        icon: GitBranch,
      },
      {
        name: "Import / Duplicate Agent",
        description: "Reuse an existing agent configuration.",
        href: "/agent-builder/creation/import-duplicate",
        icon: RefreshCw,
      },
    ],
  },
  {
    title: "Agent Intelligence",
    description: "Control reasoning, planning, models, and context.",
    icon: Zap,
    items: [
      {
        name: "Agent Brain",
        description: "Configure the core intelligence of the agent.",
        href: "/agent-builder/intelligence/agent-brain",
        icon: Bot,
      },
      {
        name: "Planning & Reasoning",
        description: "Configure planning and reasoning behavior.",
        href: "/agent-builder/intelligence/planning-reasoning",
        icon: GitBranch,
      },
      {
        name: "Model Router",
        description: "Route workloads to the right AI model.",
        href: "/agent-builder/intelligence/model-router",
        icon: Layers,
      },
      {
        name: "Prompt Optimization",
        description: "Improve prompts automatically.",
        href: "/agent-builder/intelligence/prompt-optimization",
        icon: Zap,
      },
      {
        name: "Context Optimization",
        description: "Optimize context and token usage.",
        href: "/agent-builder/intelligence/context-optimization",
        icon: Database,
      },
      {
        name: "Goal Management",
        description: "Define and monitor agent goals.",
        href: "/agent-builder/intelligence/goal-management",
        icon: CheckCircle2,
      },
      {
        name: "Multi-Agent Collaboration",
        description: "Coordinate multiple specialized agents.",
        href: "/agent-builder/intelligence/multi-agent-collaboration",
        icon: Users,
      },
    ],
  },
  {
    title: "Workflow Orchestration",
    description: "Design reliable multi-step agent workflows.",
    icon: GitBranch,
    items: [
      {
        name: "Visual Canvas",
        description: "Build workflows using a visual canvas.",
        href: "/agent-builder/workflow/canvas",
        icon: GitBranch,
      },
      {
        name: "Triggers",
        description: "Start workflows from events and schedules.",
        href: "/agent-builder/workflow/triggers",
        icon: Play,
      },
      {
        name: "Conditions",
        description: "Control workflow branches and decisions.",
        href: "/agent-builder/workflow/conditions",
        icon: GitBranch,
      },
      {
        name: "Loops",
        description: "Repeat workflow actions safely.",
        href: "/agent-builder/workflow/loops",
        icon: RefreshCw,
      },
      {
        name: "Parallel Execution",
        description: "Run independent tasks simultaneously.",
        href: "/agent-builder/workflow/parallel-execution",
        icon: Layers,
      },
      {
        name: "Human Approval",
        description: "Add human review and approval steps.",
        href: "/agent-builder/workflow/human-approvals",
        icon: Users,
      },
      {
        name: "Sub-Agents",
        description: "Delegate tasks to specialized agents.",
        href: "/agent-builder/workflow/sub-agents",
        icon: Bot,
      },
      {
        name: "Error Recovery",
        description: "Recover automatically from workflow failures.",
        href: "/agent-builder/workflow/error-recovery",
        icon: ShieldCheck,
      },
    ],
  },
  {
    title: "Tools & Actions",
    description: "Connect agents to tools, APIs, databases, and code.",
    icon: Terminal,
    items: [
      {
        name: "MCP",
        description: "Connect Model Context Protocol servers.",
        href: "/agent-builder/tools/mcp",
        icon: Database,
      },
      {
        name: "REST APIs",
        description: "Connect external REST APIs.",
        href: "/agent-builder/tools/rest-apis",
        icon: Zap,
      },
      {
        name: "Browser Automation",
        description: "Automate browser-based tasks.",
        href: "/agent-builder/tools/browser-automation",
        icon: Layers,
      },
      {
        name: "Computer Use",
        description: "Allow agents to interact with computers.",
        href: "/agent-builder/tools/computer-use",
        icon: Terminal,
      },
      {
        name: "Database Tools",
        description: "Connect SQL and NoSQL databases.",
        href: "/agent-builder/tools/database",
        icon: Database,
      },
      {
        name: "Code Execution",
        description: "Execute controlled code workloads.",
        href: "/agent-builder/tools/code-execution",
        icon: Terminal,
      },
      {
        name: "Custom Tools",
        description: "Create custom actions for agents.",
        href: "/agent-builder/tools/custom-tools",
        icon: Settings2,
      },
    ],
  },
  {
    title: "Knowledge & Memory",
    description: "Give agents access to enterprise knowledge and memory.",
    icon: Database,
    items: [
      {
        name: "RAG",
        description: "Ground responses using retrieval.",
        href: "/agent-builder/knowledge/rag",
        icon: Database,
      },
      {
        name: "Documents",
        description: "Manage document-based knowledge.",
        href: "/agent-builder/knowledge/documents",
        icon: Database,
      },
      {
        name: "Websites",
        description: "Use websites as knowledge sources.",
        href: "/agent-builder/knowledge/websites",
        icon: Search,
      },
      {
        name: "Short-Term Memory",
        description: "Maintain conversation-level memory.",
        href: "/agent-builder/knowledge/short-term-memory",
        icon: Clock3,
      },
      {
        name: "Long-Term Memory",
        description: "Store durable user and agent knowledge.",
        href: "/agent-builder/knowledge/long-term-memory",
        icon: Database,
      },
      {
        name: "Context Management",
        description: "Control context windows and history.",
        href: "/agent-builder/knowledge/context-management",
        icon: Layers,
      },
    ],
  },
  {
    title: "Testing & Evaluation",
    description: "Test, evaluate, and improve agent quality.",
    icon: TestTube2,
    items: [
      {
        name: "Playground",
        description: "Test agents interactively.",
        href: "/agent-builder/testing/playground",
        icon: Play,
      },
      {
        name: "Test Cases",
        description: "Create reusable test scenarios.",
        href: "/agent-builder/testing/test-cases",
        icon: TestTube2,
      },
      {
        name: "Evaluation Datasets",
        description: "Manage evaluation datasets.",
        href: "/agent-builder/testing/evaluation-datasets",
        icon: Database,
      },
      {
        name: "Trace Viewer",
        description: "Inspect complete agent executions.",
        href: "/agent-builder/testing/trace-viewer",
        icon: Activity,
      },
      {
        name: "Quality Evaluation",
        description: "Measure agent response quality.",
        href: "/agent-builder/testing/quality-evaluation",
        icon: CheckCircle2,
      },
      {
        name: "Regression Testing",
        description: "Detect quality regressions between versions.",
        href: "/agent-builder/testing/regression-testing",
        icon: RefreshCw,
      },
    ],
  },
  {
    title: "Security & Governance",
    description: "Protect agents, tools, users, and enterprise data.",
    icon: ShieldCheck,
    items: [
      {
        name: "Permissions",
        description: "Control agent and user permissions.",
        href: "/agent-builder/security/permissions",
        icon: ShieldCheck,
      },
      {
        name: "Tool Policies",
        description: "Control which tools agents can access.",
        href: "/agent-builder/security/tool-policies",
        icon: Settings2,
      },
      {
        name: "Guardrails",
        description: "Protect agent inputs and outputs.",
        href: "/agent-builder/security/guardrails",
        icon: ShieldCheck,
      },
      {
        name: "Human Approvals",
        description: "Require approval for sensitive actions.",
        href: "/agent-builder/security/human-approvals",
        icon: Users,
      },
      {
        name: "Audit Logs",
        description: "Track security and governance events.",
        href: "/agent-builder/security/audit-logs",
        icon: Activity,
      },
      {
        name: "Enterprise Access Control",
        description: "Manage enterprise identities and access.",
        href: "/agent-builder/security/enterprise-access",
        icon: Users,
      },
    ],
  },
  {
    title: "Deployment",
    description: "Deploy agents into production environments.",
    icon: Play,
    items: [
      {
        name: "Chat",
        description: "Deploy agents into conversational interfaces.",
        href: "/agent-builder/deployment/chat",
        icon: Bot,
      },
      {
        name: "API",
        description: "Expose agents through APIs.",
        href: "/agent-builder/deployment/api",
        icon: Terminal,
      },
      {
        name: "SDK",
        description: "Integrate agents into applications.",
        href: "/agent-builder/deployment/sdk",
        icon: Layers,
      },
      {
        name: "Webhooks",
        description: "Trigger and integrate agent workflows.",
        href: "/agent-builder/deployment/webhooks",
        icon: Zap,
      },
      {
        name: "Website Embed",
        description: "Embed agents into websites.",
        href: "/agent-builder/deployment/website-embed",
        icon: Layers,
      },
      {
        name: "Background Agents",
        description: "Run autonomous background workloads.",
        href: "/agent-builder/deployment/background-agents",
        icon: Activity,
      },
    ],
  },
  {
    title: "Observability & Optimization",
    description: "Monitor performance, cost, latency, and reliability.",
    icon: Activity,
    items: [
      {
        name: "Execution Traces",
        description: "Inspect detailed execution traces.",
        href: "/agent-builder/observability/execution-traces",
        icon: Activity,
      },
      {
        name: "Cost Analytics",
        description: "Track and optimize AI spending.",
        href: "/agent-builder/observability/cost-analytics",
        icon: Database,
      },
      {
        name: "Latency Analytics",
        description: "Monitor response and execution latency.",
        href: "/agent-builder/observability/latency-analytics",
        icon: Clock3,
      },
      {
        name: "Token Usage",
        description: "Analyze input and output token usage.",
        href: "/agent-builder/observability/token-usage",
        icon: Layers,
      },
      {
        name: "Success Rate",
        description: "Monitor workflow and agent reliability.",
        href: "/agent-builder/observability/success-rate",
        icon: CheckCircle2,
      },
      {
        name: "Agent Versions",
        description: "Track and compare agent versions.",
        href: "/agent-builder/observability/agent-versions",
        icon: GitBranch,
      },
      {
        name: "AI Optimization Engine",
        description: "Automatically identify optimization opportunities.",
        href: "/agent-builder/observability/ai-optimization",
        icon: Zap,
      },
    ],
  },
];

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
          <Icon size={18} />
        </div>
        <span className="text-xs text-emerald-400">Live</span>
      </div>

      <div className="text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-sm text-white/60">{label}</div>
      <div className="mt-3 text-xs text-white/40">{detail}</div>
    </div>
  );
}

function SectionCard({
  section,
  expanded,
  onToggle,
}: {
  section: Section;
  expanded: boolean;
  onToggle: () => void;
}) {
  const Icon = section.icon;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-white/[0.035]"
      >
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
            <Icon size={19} />
          </div>

          <div className="min-w-0">
            <div className="text-base font-semibold text-white">
              {section.title}
            </div>
            <div className="mt-1 text-sm text-white/45">
              {section.description}
            </div>
          </div>
        </div>

        <ChevronDown
          size={18}
          className={`shrink-0 text-white/45 transition ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="border-t border-white/10 p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {section.items.map((item) => {
              const ItemIcon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-xl border border-white/10 bg-black/10 p-4 transition hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06]">
                      <ItemIcon size={16} />
                    </div>

                    <ArrowRight
                      size={16}
                      className="text-white/25 transition group-hover:translate-x-1 group-hover:text-white/70"
                    />
                  </div>

                  <div className="mt-4 text-sm font-medium text-white">
                    {item.name}
                  </div>

                  <div className="mt-1 text-xs leading-5 text-white/40">
                    {item.description}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AgentBuilderPage() {
  const [search, setSearch] = useState("");
  const [expandedSection, setExpandedSection] = useState(
    "Workflow Orchestration",
  );

  const filteredSections = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return sections;
    }

    return sections
      .map((section) => {
        const sectionMatches =
          section.title.toLowerCase().includes(query) ||
          section.description.toLowerCase().includes(query);

        const filteredItems = section.items.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query),
        );

        return {
          ...section,
          items: sectionMatches ? section.items : filteredItems,
        };
      })
      .filter((section) => section.items.length > 0);
  }, [search]);

  const totalCapabilities = sections.reduce(
    (total, section) => total + section.items.length,
    0,
  );

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="mx-auto max-w-[1500px] px-5 py-6 md:px-8">
        <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/60 transition hover:bg-white/[0.07] hover:text-white"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/35">
                ModelNow
              </div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                Agent Builder
              </h1>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/agent-builder/testing/playground"
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.07] hover:text-white"
            >
              <Play size={15} />
              Open Playground
            </Link>

            <Link
              href="/agent-builder/creation/create-with-ai"
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-white/90"
            >
              <Plus size={15} />
              Create Agent
            </Link>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.025] to-transparent p-7 md:p-10">
          <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-white/[0.04] blur-3xl" />

          <div className="relative max-w-4xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/55">
              <Bot size={14} />
              Enterprise AI Agent Platform
            </div>

            <h2 className="max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
              Build, test, deploy, and optimize intelligent AI agents.
            </h2>

            <p className="mt-5 max-w-3xl text-sm leading-7 text-white/50 md:text-base">
              ModelNow Agent Builder brings agent creation, reasoning,
              workflows, tools, knowledge, evaluation, security, deployment,
              and observability into one production-ready platform.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/agent-builder/creation/create-with-ai"
                className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-black"
              >
                <Bot size={16} />
                Create with AI
                <ArrowRight size={15} />
              </Link>

              <Link
                href="/agent-builder/creation/visual-builder"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-5 py-3 text-sm font-medium text-white/75 hover:bg-white/[0.05]"
              >
                <GitBranch size={16} />
                Visual Builder
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Bot}
            label="Agent capabilities"
            value={String(totalCapabilities)}
            detail="Across creation, intelligence, workflow, tools and operations"
          />
          <StatCard
            icon={Activity}
            label="Execution monitoring"
            value="24/7"
            detail="Traces, latency, cost, tokens and reliability"
          />
          <StatCard
            icon={ShieldCheck}
            label="Security controls"
            value="6"
            detail="Permissions, policies, guardrails and governance"
          />
          <StatCard
            icon={TestTube2}
            label="Evaluation"
            value="Continuous"
            detail="Playground, datasets, traces and regression testing"
          />
        </section>

        <section className="mt-8">
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold">Agent capabilities</h3>
              <p className="mt-1 text-sm text-white/40">
                Explore every layer of the ModelNow agent platform.
              </p>
            </div>

            <div className="relative w-full lg:w-[340px]">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search capabilities..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.035] py-2.5 pl-9 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/20"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredSections.map((section) => (
              <SectionCard
                key={section.title}
                section={section}
                expanded={
                  search.trim().length > 0 ||
                  expandedSection === section.title
                }
                onToggle={() =>
                  setExpandedSection((current) =>
                    current === section.title ? "" : section.title,
                  )
                }
              />
            ))}

            {filteredSections.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-12 text-center">
                <XCircle
                  size={28}
                  className="mx-auto text-white/30"
                />
                <div className="mt-4 text-sm font-medium text-white">
                  No capabilities found
                </div>
                <div className="mt-1 text-xs text-white/40">
                  Try a different search term.
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          <Link
            href="/agent-builder/testing/trace-viewer"
            className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:bg-white/[0.045]"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
                <Activity size={18} />
              </div>
              <ArrowRight
                size={17}
                className="text-white/25 transition group-hover:translate-x-1 group-hover:text-white/70"
              />
            </div>
            <h3 className="mt-5 text-sm font-semibold">Observability</h3>
            <p className="mt-2 text-xs leading-5 text-white/40">
              Inspect agent executions, traces, failures, latency, token
              usage, and cost.
            </p>
          </Link>

          <Link
            href="/agent-builder/testing/quality-evaluation"
            className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:bg-white/[0.045]"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
                <TestTube2 size={18} />
              </div>
              <ArrowRight
                size={17}
                className="text-white/25 transition group-hover:translate-x-1 group-hover:text-white/70"
              />
            </div>
            <h3 className="mt-5 text-sm font-semibold">Evaluation</h3>
            <p className="mt-2 text-xs leading-5 text-white/40">
              Benchmark quality, groundedness, safety, consistency, and
              instruction following.
            </p>
          </Link>

          <Link
            href="/agent-builder/security/guardrails"
            className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:bg-white/[0.045]"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
                <ShieldCheck size={18} />
              </div>
              <ArrowRight
                size={17}
                className="text-white/25 transition group-hover:translate-x-1 group-hover:text-white/70"
              />
            </div>
            <h3 className="mt-5 text-sm font-semibold">Security & Governance</h3>
            <p className="mt-2 text-xs leading-5 text-white/40">
              Protect agents with permissions, tool policies, guardrails,
              approvals, and audit logs.
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
}