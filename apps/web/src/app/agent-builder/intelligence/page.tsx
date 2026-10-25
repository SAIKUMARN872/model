"use client";

import Link from "next/link";
import {
  Bot,
  Brain,
  GitBranch,
  Wrench,
  Database,
  FlaskConical,
  ShieldCheck,
  Rocket,
  Activity,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

type Section = {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  items: string[];
};

const sections: Section[] = [
  {
    title: "Agent Creation",
    description:
      "Create and configure AI agents using visual and code-based builders.",
    href: "/agent-builder/creation",
    icon: Bot,
    items: [
      "Create with AI",
      "Visual Builder",
      "Pro-Code Builder",
      "Templates",
      "Import / Duplicate Agent",
    ],
  },
  {
    title: "Agent Intelligence",
    description:
      "Configure the reasoning, planning, routing and intelligence layer.",
    href: "/agent-builder/intelligence",
    icon: Brain,
    items: [
      "Agent Brain",
      "Planning & Reasoning",
      "Model Router",
      "Prompt Optimization",
      "Context Optimization",
      "Goal Management",
      "Multi-Agent Collaboration",
    ],
  },
  {
    title: "Workflow Orchestration",
    description:
      "Design complex agent workflows with conditions, loops and approvals.",
    href: "/agent-builder/workflow",
    icon: GitBranch,
    items: [
      "Visual Canvas",
      "Triggers",
      "Conditions",
      "Loops",
      "Parallel Execution",
      "Human Approval",
      "Sub-Agents",
      "Error Recovery",
    ],
  },
  {
    title: "Tools & Actions",
    description:
      "Connect agents to APIs, databases, browsers and custom tools.",
    href: "/agent-builder/tools",
    icon: Wrench,
    items: [
      "MCP",
      "REST APIs",
      "Browser Automation",
      "Computer Use",
      "Database Tools",
      "Code Execution",
      "Custom Tools",
    ],
  },
  {
    title: "Knowledge & Memory",
    description:
      "Give agents access to documents, websites and persistent memory.",
    href: "/agent-builder/knowledge",
    icon: Database,
    items: [
      "RAG",
      "Documents",
      "Websites",
      "Short-Term Memory",
      "Long-Term Memory",
      "Context Management",
    ],
  },
  {
    title: "Testing & Evaluation",
    description:
      "Test agents, evaluate quality and monitor regression performance.",
    href: "/agent-builder/testing",
    icon: FlaskConical,
    items: [
      "Playground",
      "Test Cases",
      "Evaluation Datasets",
      "Trace Viewer",
      "Quality Evaluation",
      "Regression Testing",
    ],
  },
  {
    title: "Security & Governance",
    description:
      "Control permissions, policies, guardrails and enterprise access.",
    href: "/agent-builder/security",
    icon: ShieldCheck,
    items: [
      "Permissions",
      "Tool Policies",
      "Guardrails",
      "Human Approvals",
      "Audit Logs",
      "Enterprise Access Control",
    ],
  },
  {
    title: "Deployment",
    description:
      "Deploy agents through chat, APIs, SDKs, webhooks and embeds.",
    href: "/agent-builder/deployment",
    icon: Rocket,
    items: [
      "Chat",
      "API",
      "SDK",
      "Webhooks",
      "Website Embed",
      "Background Agents",
    ],
  },
  {
    title: "Observability & Optimization",
    description:
      "Monitor executions, cost, latency, tokens and agent performance.",
    href: "/agent-builder/observability",
    icon: Activity,
    items: [
      "Execution Traces",
      "Cost Analytics",
      "Latency Analytics",
      "Token Usage",
      "Success Rate",
      "Agent Versions",
      "AI Optimization Engine",
    ],
  },
];

export default function AgentBuilderPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#111827]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white">
              <Bot size={25} />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold">
                  ModelNow Agent Builder
                </h1>

                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                  Agent Intelligence
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Build, configure, test and deploy production-ready
                AI agents.
              </p>
            </div>
          </div>

          <Link
            href="/agent-builder/creation"
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Bot size={16} />
            Create Agent
          </Link>
        </div>
      </header>

      {/* Main */}
      <div className="mx-auto max-w-[1500px] px-8 py-8">
        {/* Overview */}
        <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-7">
          <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                  Production Ready
                </span>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  9 Modules
                </span>
              </div>

              <h2 className="text-3xl font-semibold tracking-tight">
                Build intelligent AI agents
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-500">
                ModelNow Agent Builder provides everything required
                to create autonomous AI systems, connect tools,
                orchestrate workflows, evaluate performance and
                deploy agents at scale.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <OverviewMetric
                  value="9"
                  label="Core modules"
                />

                <OverviewMetric
                  value="30+"
                  label="Agent capabilities"
                />

                <OverviewMetric
                  value="24/7"
                  label="Runtime monitoring"
                />
              </div>
            </div>

            <div className="rounded-2xl bg-[#111827] p-6 text-white">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                  <Brain size={20} />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Agent Intelligence
                  </p>

                  <p className="text-xs text-gray-400">
                    Central control layer
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <FeatureLine text="Planning & reasoning" />
                <FeatureLine text="Model routing" />
                <FeatureLine text="Context optimization" />
                <FeatureLine text="Multi-agent collaboration" />
                <FeatureLine text="Continuous evaluation" />
              </div>
            </div>
          </div>
        </section>

        {/* Architecture flow */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              Agent Development Flow
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Configure your agent from creation through deployment
              and continuous optimization.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-5">
            <FlowCard
              number="01"
              title="Create"
              icon={<Bot size={18} />}
            />

            <FlowCard
              number="02"
              title="Intelligence"
              icon={<Brain size={18} />}
            />

            <FlowCard
              number="03"
              title="Orchestrate"
              icon={<GitBranch size={18} />}
            />

            <FlowCard
              number="04"
              title="Test"
              icon={<FlaskConical size={18} />}
            />

            <FlowCard
              number="05"
              title="Deploy"
              icon={<Rocket size={18} />}
            />
          </div>
        </section>

        {/* Modules */}
        <section>
          <div className="mb-5">
            <h2 className="text-lg font-semibold">
              Agent Builder Modules
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Select a module to configure a specific part of your
              AI agent.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sections.map((section) => {
              const Icon = section.icon;

              return (
                <Link
                  key={section.title}
                  href={section.href}
                  className="group rounded-2xl border border-gray-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-sm"
                >
                  <div className="mb-5 flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-700 transition group-hover:bg-black group-hover:text-white">
                      <Icon size={21} />
                    </div>

                    <ArrowRight
                      size={18}
                      className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-gray-700"
                    />
                  </div>

                  <h3 className="text-base font-semibold">
                    {section.title}
                  </h3>

                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-500">
                    {section.description}
                  </p>

                  <div className="mt-5 border-t border-gray-100 pt-4">
                    <div className="space-y-2">
                      {section.items.slice(0, 5).map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-2 text-xs text-gray-600"
                        >
                          <CheckCircle2
                            size={13}
                            className="shrink-0 text-gray-400"
                          />

                          <span>{item}</span>
                        </div>
                      ))}

                      {section.items.length > 5 && (
                        <p className="pt-1 text-xs font-medium text-gray-400">
                          +{section.items.length - 5} more
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <CheckCircle2 size={21} />
              </div>

              <div>
                <h2 className="font-semibold">
                  Ready to build your first agent?
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Start with AI-assisted creation or configure
                  every component manually.
                </p>
              </div>
            </div>

            <Link
              href="/agent-builder/creation"
              className="flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
            >
              Start Building
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function OverviewMetric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xl font-semibold">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-500">
        {label}
      </p>
    </div>
  );
}

function FeatureLine({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-300">
      <CheckCircle2
        size={14}
        className="text-green-400"
      />

      <span>{text}</span>
    </div>
  );
}

function FlowCard({
  number,
  title,
  icon,
}: {
  number: string;
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
        {icon}
      </div>

      <div>
        <p className="text-[10px] font-medium text-gray-400">
          STEP {number}
        </p>

        <p className="mt-0.5 text-sm font-semibold">
          {title}
        </p>
      </div>
    </div>
  );
}