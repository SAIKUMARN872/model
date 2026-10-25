"use client";

import type {
  Dispatch,
  ReactNode,
  SetStateAction,
} from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Activity,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Code2,
  Database,
  Globe,
  MessageSquare,
  Play,
  Plus,
  Rocket,
  Settings2,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
  X,
} from "lucide-react";

type DeploymentType =
  | "chat"
  | "api"
  | "sdk"
  | "webhooks"
  | "website-embed"
  | "background-agents";

type DeploymentStatus = "Active" | "Draft";

type Deployment = {
  id: string;
  name: string;
  type: DeploymentType;
  status: DeploymentStatus;
  requests: string;
  latency: string;
  created: string;
};

type DeploymentOption = {
  type: DeploymentType;
  title: string;
  description: string;
  icon: typeof MessageSquare;
};

const deployments: Deployment[] = [
  {
    id: "chat-production",
    name: "ModelNow Assistant",
    type: "chat",
    status: "Active",
    requests: "12.8K",
    latency: "420 ms",
    created: "Today",
  },
  {
    id: "customer-agent",
    name: "Customer Support Agent",
    type: "background-agents",
    status: "Active",
    requests: "8.4K",
    latency: "510 ms",
    created: "Yesterday",
  },
  {
    id: "research-agent",
    name: "Research Agent",
    type: "background-agents",
    status: "Active",
    requests: "4.7K",
    latency: "680 ms",
    created: "Sep 16",
  },
  {
    id: "data-api",
    name: "Analytics API",
    type: "api",
    status: "Draft",
    requests: "0",
    latency: "-",
    created: "Sep 15",
  },
];

const deploymentOptions: DeploymentOption[] = [
  {
    type: "chat",
    title: "Chat",
    description:
      "Deploy your agent through a ChatGPT-style interface.",
    icon: MessageSquare,
  },
  {
    type: "api",
    title: "API",
    description:
      "Expose your agent through a production API endpoint.",
    icon: Code2,
  },
  {
    type: "sdk",
    title: "SDK",
    description:
      "Integrate the agent directly into your application.",
    icon: Zap,
  },
  {
    type: "webhooks",
    title: "Webhooks",
    description:
      "Trigger agent workflows from external events.",
    icon: Activity,
  },
  {
    type: "website-embed",
    title: "Website Embed",
    description:
      "Add your AI agent directly to a website.",
    icon: Globe,
  },
  {
    type: "background-agents",
    title: "Background Agents",
    description:
      "Run autonomous agents continuously in the background.",
    icon: Bot,
  },
];

export default function DeploymentPage() {
  const router = useRouter();

  const [selectedType, setSelectedType] =
    useState<DeploymentType>("chat");

  const [showCreate, setShowCreate] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const filteredDeployments =
    deployments.filter((deployment) =>
      deployment.name
        .toLowerCase()
        .includes(search.toLowerCase()),
    );

  const getDeploymentPath = (
    type: DeploymentType,
  ) => {
    return `/agent-builder/deployment/${type}`;
  };

  const openDeployment = (
    deployment: Deployment,
  ) => {
    router.push(
      getDeploymentPath(deployment.type),
    );
  };

  const createDeployment = () => {
    setShowCreate(false);

    router.push(
      getDeploymentPath(selectedType),
    );
  };

  return (
    <main className="min-h-screen bg-[#07070a] text-white">
      <div className="mx-auto min-h-screen max-w-[1600px]">

        {/* HEADER */}
        <header className="flex h-16 items-center justify-between border-b border-white/[0.08] bg-[#09090d] px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
              <Rocket className="h-5 w-5 text-violet-300" />
            </div>

            <div>
              <h1 className="text-sm font-semibold">
                Agent Deployment
              </h1>

              <p className="text-[9px] text-white/25">
                Deploy, manage and monitor your AI agents
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/agent-builder/observability/execution-traces",
                )
              }
              className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[9px] text-white/40 transition hover:bg-white/[0.06] hover:text-white"
            >
              <Activity className="h-3.5 w-3.5" />
              Observability
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/agent-builder/deployment/settings",
                )
              }
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/35 transition hover:bg-white/[0.06] hover:text-white"
            >
              <Settings2 className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() =>
                setShowCreate(true)
              }
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-3.5 py-2 text-[9px] font-semibold text-white transition hover:bg-violet-500"
            >
              <Plus className="h-3.5 w-3.5" />
              New Deployment
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <div className="p-6">

          {/* HERO */}
          <section className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-violet-500/[0.08] via-transparent to-transparent p-6">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

              <div className="max-w-2xl">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10">
                    <Sparkles className="h-3.5 w-3.5 text-violet-300" />
                  </span>

                  <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-violet-300/70">
                    ModelNow Runtime
                  </span>
                </div>

                <h2 className="text-2xl font-semibold tracking-tight">
                  Deploy your AI agents anywhere.
                </h2>

                <p className="mt-2 max-w-xl text-[10px] leading-5 text-white/30">
                  Turn your configured agents into production
                  applications, APIs, background workers,
                  website assistants and automated workflows.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <StatusBadge
                    icon={
                      <CheckCircle2 className="h-3 w-3" />
                    }
                    label="Runtime operational"
                  />

                  <StatusBadge
                    icon={
                      <ShieldCheck className="h-3 w-3" />
                    }
                    label="Security enforced"
                  />

                  <StatusBadge
                    icon={
                      <Activity className="h-3 w-3" />
                    }
                    label="Observability enabled"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <MetricCard
                  label="Active Deployments"
                  value="3"
                  icon={
                    <Rocket className="h-4 w-4" />
                  }
                />

                <MetricCard
                  label="Requests"
                  value="25.9K"
                  icon={
                    <Activity className="h-4 w-4" />
                  }
                />

                <MetricCard
                  label="Avg Latency"
                  value="537 ms"
                  icon={
                    <Clock3 className="h-4 w-4" />
                  }
                />

                <MetricCard
                  label="Success Rate"
                  value="99.4%"
                  icon={
                    <CheckCircle2 className="h-4 w-4" />
                  }
                />
              </div>
            </div>
          </section>

          {/* DEPLOYMENT OPTIONS */}
          <section className="mt-6">
            <div className="mb-3">
              <h2 className="text-xs font-semibold">
                Deployment options
              </h2>

              <p className="mt-1 text-[8px] text-white/20">
                Choose how users and systems will interact
                with your agent.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {deploymentOptions.map(
                (option) => {
                  const Icon = option.icon;

                  return (
                    <button
                      key={option.type}
                      type="button"
                      onClick={() => {
                        setSelectedType(option.type);
                        setShowCreate(true);
                      }}
                      className="group rounded-xl border border-white/[0.07] bg-[#0a0a0e] p-4 text-left transition hover:border-violet-500/20 hover:bg-violet-500/[0.03]"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04]">
                          <Icon className="h-4 w-4 text-white/45 group-hover:text-violet-300" />
                        </div>

                        <ChevronRight className="h-4 w-4 text-white/10 transition group-hover:translate-x-0.5 group-hover:text-white/30" />
                      </div>

                      <h3 className="mt-4 text-[10px] font-medium text-white/65">
                        {option.title}
                      </h3>

                      <p className="mt-1 text-[8px] leading-4 text-white/20">
                        {option.description}
                      </p>
                    </button>
                  );
                },
              )}
            </div>
          </section>

          {/* DEPLOYMENTS */}
          <section className="mt-7">
            <div className="mb-3 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-xs font-semibold">
                  Your deployments
                </h2>

                <p className="mt-1 text-[8px] text-white/20">
                  Manage and monitor deployed agents.
                </p>
              </div>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search deployments..."
                className="h-8 w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 text-[8px] text-white/50 outline-none placeholder:text-white/15 focus:border-violet-500/30 sm:w-52"
              />
            </div>

            <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#09090d]">
              <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 border-b border-white/[0.06] px-4 py-3 md:grid">
                <span className="text-[8px] uppercase tracking-wider text-white/15">
                  Deployment
                </span>

                <span className="text-[8px] uppercase tracking-wider text-white/15">
                  Type
                </span>

                <span className="text-[8px] uppercase tracking-wider text-white/15">
                  Requests
                </span>

                <span className="text-[8px] uppercase tracking-wider text-white/15">
                  Latency
                </span>

                <span className="text-[8px] uppercase tracking-wider text-white/15">
                  Status
                </span>

                <span />
              </div>

              {filteredDeployments.length === 0 ? (
                <div className="p-10 text-center">
                  <Database className="mx-auto h-5 w-5 text-white/15" />

                  <p className="mt-3 text-[9px] text-white/30">
                    No deployments found
                  </p>
                </div>
              ) : (
                filteredDeployments.map(
                  (deployment) => (
                    <DeploymentRow
                      key={deployment.id}
                      deployment={deployment}
                      onOpen={() =>
                        openDeployment(
                          deployment,
                        )
                      }
                    />
                  ),
                )
              )}
            </div>
          </section>

          {/* PLATFORM CAPABILITIES */}
          <section className="mt-7 grid gap-3 lg:grid-cols-3">
            <CapabilityCard
              icon={
                <Workflow className="h-4 w-4" />
              }
              title="Agent Runtime"
              description="Execute planning, reasoning, tools, memory and workflows in a managed runtime."
            />

            <CapabilityCard
              icon={
                <ShieldCheck className="h-4 w-4" />
              }
              title="Security & Governance"
              description="Control permissions, tool policies, approvals, guardrails and audit events."
            />

            <CapabilityCard
              icon={
                <Activity className="h-4 w-4" />
              }
              title="Observability"
              description="Track traces, tokens, latency, cost, failures and agent performance."
            />
          </section>
        </div>

        {/* CREATE DEPLOYMENT MODAL */}
        {showCreate && (
          <CreateDeploymentModal
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            onClose={() =>
              setShowCreate(false)
            }
            onCreate={createDeployment}
          />
        )}
      </div>
    </main>
  );
}

function StatusBadge({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.02] px-2.5 py-1 text-[8px] text-white/30">
      {icon}
      {label}
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="min-w-[130px] rounded-xl border border-white/[0.07] bg-black/20 p-3">
      <div className="flex items-center justify-between">
        <span className="text-white/20">
          {icon}
        </span>

        <span className="text-[8px] text-white/20">
          Live
        </span>
      </div>

      <p className="mt-3 text-lg font-semibold">
        {value}
      </p>

      <p className="mt-1 text-[8px] text-white/20">
        {label}
      </p>
    </div>
  );
}

function DeploymentRow({
  deployment,
  onOpen,
}: {
  deployment: Deployment;
  onOpen: () => void;
}) {
  const Icon =
    deployment.type === "chat"
      ? MessageSquare
      : deployment.type === "api"
        ? Code2
        : deployment.type === "background-agents"
          ? Bot
          : deployment.type === "website-embed"
            ? Globe
            : Zap;

  const typeLabel =
    deployment.type === "background-agents"
      ? "Background Agent"
      : deployment.type === "website-embed"
        ? "Website Embed"
        : deployment.type.charAt(0).toUpperCase() +
          deployment.type.slice(1);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="grid w-full grid-cols-1 gap-3 border-b border-white/[0.05] px-4 py-4 text-left transition last:border-b-0 hover:bg-white/[0.025] md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] md:items-center md:gap-4"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
          <Icon className="h-4 w-4 text-violet-300" />
        </div>

        <div>
          <p className="text-[9px] font-medium text-white/55">
            {deployment.name}
          </p>

          <p className="mt-1 text-[7px] text-white/15">
            Created {deployment.created}
          </p>
        </div>
      </div>

      <span className="text-[8px] text-white/30">
        {typeLabel}
      </span>

      <span className="text-[8px] text-white/30">
        {deployment.requests}
      </span>

      <span className="text-[8px] text-white/30">
        {deployment.latency}
      </span>

      <span
        className={`flex w-fit items-center gap-1.5 rounded-full px-2 py-1 text-[7px] ${
          deployment.status === "Active"
            ? "bg-emerald-500/[0.08] text-emerald-300"
            : "bg-yellow-500/[0.08] text-yellow-300"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            deployment.status === "Active"
              ? "bg-emerald-400"
              : "bg-yellow-400"
          }`}
        />

        {deployment.status}
      </span>

      <ChevronRight className="hidden h-4 w-4 text-white/15 md:block" />
    </button>
  );
}

function CapabilityCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#09090d] p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
        {icon}
      </div>

      <h3 className="mt-4 text-[10px] font-medium text-white/55">
        {title}
      </h3>

      <p className="mt-1 text-[8px] leading-4 text-white/20">
        {description}
      </p>
    </div>
  );
}

function CreateDeploymentModal({
  selectedType,
  setSelectedType,
  onClose,
  onCreate,
}: {
  selectedType: DeploymentType;
  setSelectedType: Dispatch<
    SetStateAction<DeploymentType>
  >;
  onClose: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm">
      <div className="w-full max-w-[700px] rounded-2xl border border-white/[0.09] bg-[#0b0b10] shadow-2xl">

        <div className="flex items-center justify-between border-b border-white/[0.07] p-5">
          <div>
            <h2 className="text-sm font-semibold">
              Create deployment
            </h2>

            <p className="mt-1 text-[8px] text-white/25">
              Select a deployment target for your agent.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/25 hover:bg-white/[0.05] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-3 p-5 md:grid-cols-2">
          {deploymentOptions.map(
            (option) => {
              const Icon = option.icon;

              const selected =
                selectedType === option.type;

              return (
                <button
                  key={option.type}
                  type="button"
                  onClick={() =>
                    setSelectedType(
                      option.type,
                    )
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    selected
                      ? "border-violet-500/40 bg-violet-500/[0.07]"
                      : "border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04]">
                      <Icon className="h-4 w-4 text-white/45" />
                    </div>

                    {selected && (
                      <CheckCircle2 className="h-4 w-4 text-violet-300" />
                    )}
                  </div>

                  <p className="mt-3 text-[10px] font-medium text-white/55">
                    {option.title}
                  </p>

                  <p className="mt-1 text-[8px] leading-4 text-white/20">
                    {option.description}
                  </p>
                </button>
              );
            },
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/[0.07] p-5">
          <p className="text-[8px] text-white/20">
            Selected:{" "}
            <span className="text-white/40">
              {selectedType}
            </span>
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/[0.08] px-4 py-2 text-[9px] text-white/35 hover:bg-white/[0.04]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onCreate}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-[9px] font-semibold text-white hover:bg-violet-500"
            >
              <Play className="h-3 w-3" />
              Create Deployment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}