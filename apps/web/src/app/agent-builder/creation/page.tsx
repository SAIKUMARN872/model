"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bot,
  Brain,
  Code2,
  FileDown,
  FileJson,
  FilePlus2,
  GitBranch,
  Import,
  Layers3,
  Network,
  Plus,
  Sparkles,
  Upload,
  Workflow,
  Zap,
} from "lucide-react";

const importOptions = [
  {
    title: "Import Existing Agent",
    description:
      "Bring an existing agent configuration, code package, or workflow into ModelNow.",
    href: "/agent-builder/creation/import-duplicate/import-agent",
    icon: Import,
    badge: "Import",
  },
  {
    title: "Create with AI",
    description:
      "Describe what you want your agent to do and let AI generate the initial agent configuration.",
    href: "/agent-builder/creation/create-with-ai",
    icon: Sparkles,
    badge: "AI",
  },
  {
    title: "Visual Builder",
    description:
      "Build agents visually using workflows, tools, conditions, memory, and human approval steps.",
    href: "/agent-builder/creation/visual-builder",
    icon: Workflow,
    badge: "No-Code",
  },
  {
    title: "Pro-Code Builder",
    description:
      "Build production-grade agents with TypeScript, custom tools, APIs, and advanced runtime logic.",
    href: "/agent-builder/creation/pro-code",
    icon: Code2,
    badge: "Pro",
  },
];

const importMethods = [
  {
    title: "Agent JSON",
    description:
      "Import a previously exported ModelNow agent definition.",
    icon: FileJson,
  },
  {
    title: "Code Package",
    description:
      "Bring TypeScript or JavaScript based agents into the platform.",
    icon: Code2,
  },
  {
    title: "GitHub",
    description:
      "Connect an agent repository and continue development in ModelNow.",
    icon: GitBranch,
  },
  {
    title: "Workflow Package",
    description:
      "Import workflows, tools, memory and orchestration configuration.",
    icon: Workflow,
  },
];

const capabilities = [
  {
    title: "Agent Brain",
    description:
      "Preserve planning, reasoning, goals and model-routing configuration.",
    icon: Brain,
  },
  {
    title: "Tools",
    description:
      "Detect APIs, MCP tools, browser automation, databases and custom actions.",
    icon: Zap,
  },
  {
    title: "Memory",
    description:
      "Carry short-term and long-term memory configuration into the new agent.",
    icon: Layers3,
  },
  {
    title: "Workflows",
    description:
      "Reconstruct triggers, conditions, loops, parallel execution and sub-agents.",
    icon: Network,
  },
];

export default function AgentBuilderPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#07070a] text-white">
      <div className="mx-auto min-h-screen max-w-[1500px]">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-white/[0.08] px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
              <Bot className="h-5 w-5 text-violet-300" />
            </div>

            <div>
              <h1 className="text-sm font-semibold">
                ModelNow Agent Builder
              </h1>

              <p className="text-[11px] text-white/35">
                Build, import and deploy intelligent AI agents
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/agent-builder/creation/create-with-ai")
            }
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-500"
          >
            <Plus className="h-4 w-4" />
            Create Agent
          </button>
        </header>

        {/* Content */}
        <section className="px-6 py-8">
          <div className="mx-auto max-w-[1200px]">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-violet-500/[0.12] via-white/[0.025] to-transparent p-8">
              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-500/[0.08] blur-3xl" />

              <div className="relative max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/[0.07] px-3 py-1.5 text-[11px] font-medium text-violet-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Agent Intelligence Platform
                </div>

                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Build agents that can
                  <span className="text-violet-400">
                    {" "}
                    think, act and execute.
                  </span>
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-white/45">
                  ModelNow Agent Builder combines AI-powered agent creation,
                  visual workflows, pro-code development, tools, memory,
                  knowledge, evaluation, security and deployment in one
                  platform.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/agent-builder/creation/create-with-ai",
                      )
                    }
                    className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-white/90"
                  >
                    <Sparkles className="h-4 w-4" />
                    Create with AI
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/agent-builder/creation/import-duplicate/import-agent",
                      )
                    }
                    className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/[0.08]"
                  >
                    <Import className="h-4 w-4" />
                    Import Agent
                  </button>
                </div>
              </div>
            </div>

            {/* Creation */}
            <div className="mt-10">
              <div className="mb-5">
                <h3 className="text-lg font-semibold">
                  Create or Import
                </h3>

                <p className="mt-1 text-xs text-white/35">
                  Start from an existing agent or build one from scratch.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {importOptions.map((option) => {
                  const Icon = option.icon;

                  return (
                    <button
                      key={option.title}
                      type="button"
                      onClick={() => router.push(option.href)}
                      className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 text-left transition hover:-translate-y-0.5 hover:border-violet-500/30 hover:bg-white/[0.045]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                          <Icon className="h-5 w-5" />
                        </div>

                        <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-[10px] text-white/35">
                          {option.badge}
                        </span>
                      </div>

                      <h4 className="mt-5 text-sm font-semibold">
                        {option.title}
                      </h4>

                      <p className="mt-2 text-xs leading-5 text-white/40">
                        {option.description}
                      </p>

                      <div className="mt-5 flex items-center gap-1.5 text-xs font-medium text-violet-300 opacity-70 transition group-hover:opacity-100">
                        Open
                        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Import methods */}
            <div className="mt-10">
              <div className="mb-5">
                <h3 className="text-lg font-semibold">
                  Supported Imports
                </h3>

                <p className="mt-1 text-xs text-white/35">
                  Bring agents and automation systems from different
                  development environments.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {importMethods.map((method) => {
                  const Icon = method.icon;

                  return (
                    <div
                      key={method.title}
                      className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.05] text-white/55">
                        <Icon className="h-4 w-4" />
                      </div>

                      <h4 className="mt-4 text-xs font-semibold text-white/75">
                        {method.title}
                      </h4>

                      <p className="mt-2 text-[11px] leading-5 text-white/30">
                        {method.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Import intelligence */}
            <div className="mt-10">
              <div className="mb-5">
                <h3 className="text-lg font-semibold">
                  Smart Agent Reconstruction
                </h3>

                <p className="mt-1 text-xs text-white/35">
                  ModelNow can analyze an imported package and reconstruct
                  the important parts of the agent.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {capabilities.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                        <Icon className="h-4.5 w-4.5" />
                      </div>

                      <h4 className="mt-4 text-sm font-medium">
                        {item.title}
                      </h4>

                      <p className="mt-2 text-xs leading-5 text-white/35">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Import flow */}
            <div className="mt-10 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                  <Upload className="h-5 w-5 text-emerald-300" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold">
                    Import Flow
                  </h3>

                  <p className="mt-1 text-xs text-white/35">
                    A simple path from existing agent to production.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-5">
                <FlowStep
                  number="01"
                  title="Import"
                  description="Upload or connect"
                />

                <FlowStep
                  number="02"
                  title="Analyze"
                  description="Detect configuration"
                />

                <FlowStep
                  number="03"
                  title="Review"
                  description="Check tools and permissions"
                />

                <FlowStep
                  number="04"
                  title="Test"
                  description="Run in playground"
                />

                <FlowStep
                  number="05"
                  title="Deploy"
                  description="API, Chat or Workflow"
                />
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-2xl border border-violet-500/20 bg-violet-500/[0.05] p-6 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-sm font-semibold">
                  Ready to bring an agent into ModelNow?
                </h3>

                <p className="mt-1 text-xs text-white/35">
                  Import your existing agent and continue developing it
                  with ModelNow Agent Builder.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/agent-builder/creation/import-duplicate/import-agent",
                  )
                }
                className="flex shrink-0 items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-500"
              >
                <FilePlus2 className="h-4 w-4" />
                Start Import
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function FlowStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative rounded-xl border border-white/[0.07] bg-black/20 p-4">
      <div className="text-[10px] font-semibold tracking-wider text-violet-400">
        {number}
      </div>

      <h4 className="mt-3 text-xs font-semibold text-white/75">
        {title}
      </h4>

      <p className="mt-1 text-[10px] leading-4 text-white/30">
        {description}
      </p>
    </div>
  );
}