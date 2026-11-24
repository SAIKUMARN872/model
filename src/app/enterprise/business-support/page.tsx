"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Globe,
  Headphones,
  Mail,
  MessageSquare,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Workflow,
  X,
  Zap,
} from "lucide-react";

type SupportTicket = {
  id: string;
  customer: string;
  subject: string;
  priority: string;
  status: string;
  aiScore: number;
  time: string;
};

type Activity = {
  title: string;
  customer: string;
  type: string;
  time: string;
  status: string;
};

type WorkflowItem = {
  title: string;
  description: string;
  icon: React.ElementType;
  status: string;
};

type AgentItem = {
  title: string;
  description: string;
  icon: React.ElementType;
  status: string;
};

const ticketData: SupportTicket[] = [
  {
    id: "TKT-10482",
    customer: "Acme Technologies",
    subject: "Enterprise AI integration support",
    priority: "High",
    status: "In Progress",
    aiScore: 96,
    time: "4 min ago",
  },
  {
    id: "TKT-10481",
    customer: "Nova Systems",
    subject: "Account configuration request",
    priority: "Medium",
    status: "AI Resolved",
    aiScore: 92,
    time: "12 min ago",
  },
  {
    id: "TKT-10480",
    customer: "Vertex Global",
    subject: "API usage clarification",
    priority: "Low",
    status: "Resolved",
    aiScore: 88,
    time: "24 min ago",
  },
  {
    id: "TKT-10479",
    customer: "CloudMatrix",
    subject: "Billing and subscription question",
    priority: "High",
    status: "Assigned",
    aiScore: 84,
    time: "38 min ago",
  },
  {
    id: "TKT-10478",
    customer: "FinEdge",
    subject: "Security documentation request",
    priority: "Medium",
    status: "Open",
    aiScore: 79,
    time: "52 min ago",
  },
];

const activityData: Activity[] = [
  {
    title: "Customer question resolved by AI",
    customer: "Nova Systems",
    type: "AI Support",
    time: "6 min ago",
    status: "Completed",
  },
  {
    title: "Support ticket automatically classified",
    customer: "Acme Technologies",
    type: "AI Classification",
    time: "14 min ago",
    status: "Completed",
  },
  {
    title: "Escalation sent to support team",
    customer: "CloudMatrix",
    type: "Escalation",
    time: "28 min ago",
    status: "Completed",
  },
  {
    title: "Knowledge article recommended",
    customer: "Vertex Global",
    type: "Knowledge",
    time: "42 min ago",
    status: "Completed",
  },
];

const workflowData: WorkflowItem[] = [
  {
    title: "AI Ticket Classification",
    description:
      "Automatically classify incoming support requests by topic, priority and intent.",
    icon: Target,
    status: "Active",
  },
  {
    title: "AI Customer Resolution",
    description:
      "Resolve common customer questions using enterprise knowledge and RAG.",
    icon: Bot,
    status: "Active",
  },
  {
    title: "Smart Escalation",
    description:
      "Route complex issues to the correct team based on context and urgency.",
    icon: Workflow,
    status: "Active",
  },
  {
    title: "Customer Follow-up",
    description:
      "Automatically generate contextual follow-ups after support interactions.",
    icon: Mail,
    status: "Ready",
  },
];

const agentData: AgentItem[] = [
  {
    title: "Customer Support Agent",
    description:
      "Handles customer questions, troubleshooting and support requests.",
    icon: Headphones,
    status: "Active",
  },
  {
    title: "Knowledge Agent",
    description:
      "Searches enterprise knowledge and retrieves relevant answers.",
    icon: FileText,
    status: "Active",
  },
  {
    title: "Ticket Routing Agent",
    description:
      "Classifies and routes support requests to the correct teams.",
    icon: Workflow,
    status: "Active",
  },
  {
    title: "Customer Success Agent",
    description:
      "Analyzes customer interactions and identifies follow-up opportunities.",
    icon: Users,
    status: "Active",
  },
];

export default function BusinessSupportPage() {
  const [activeTab, setActiveTab] = useState<
    "tickets" | "activities"
  >("tickets");

  const [search, setSearch] = useState("");
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [selectedAgent, setSelectedAgent] =
    useState<AgentItem | null>(null);

  const filteredTickets = ticketData.filter((ticket) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      ticket.customer.toLowerCase().includes(query) ||
      ticket.subject.toLowerCase().includes(query) ||
      ticket.priority.toLowerCase().includes(query) ||
      ticket.status.toLowerCase().includes(query)
    );
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* HEADER */}

      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/enterprise"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <Headphones size={20} className="text-blue-400" />
                <h1 className="text-xl font-bold">
                  Business Support
                </h1>
              </div>

              <p className="text-xs text-slate-400">
                AI-powered customer and business support
              </p>
            </div>

            <span className="hidden rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300 md:block">
              Enterprise Module
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Support systems operational
            </div>

            <button
              onClick={() => setShowTicketModal(true)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold hover:bg-blue-500"
            >
              <Plus size={17} />
              New Ticket
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-6 py-8">
        {/* HERO */}

        <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 p-8">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative max-w-4xl">
            <div className="mb-4 flex items-center gap-2 text-blue-400">
              <Sparkles size={20} />
              <span className="text-sm font-semibold">
                MODELNOW BUSINESS SUPPORT
              </span>
            </div>

            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
              Intelligent support for every customer interaction.
            </h2>

            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-400">
              ModelNow understands customer intent, searches enterprise
              knowledge, resolves common requests and automatically
              routes complex issues to the right team.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => setShowTicketModal(true)}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500"
              >
                <Plus size={17} />
                Create Support Ticket
              </button>

              <button
                onClick={() => setActiveTab("activities")}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
              >
                View Activity
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* KPI */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Active Tickets"
            value="284"
            change="+12.8%"
            icon={MessageSquare}
          />

          <KpiCard
            title="AI Resolved"
            value="2,840"
            change="+24.6%"
            icon={Bot}
          />

          <KpiCard
            title="Resolution Rate"
            value="94.2%"
            change="+8.4%"
            icon={CheckCircle2}
          />

          <KpiCard
            title="Avg Response"
            value="1.8 min"
            change="-31.2%"
            icon={Clock3}
          />
        </section>

        {/* AI AUTOMATION */}

        <section className="mt-8">
          <SectionHeading
            title="Support AI Automation"
            description="Automate customer support from request to resolution."
          />

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <AutomationCard
              icon={Bot}
              title="AI Resolution"
              description="Resolve repetitive customer requests automatically."
              metric="2,840"
              metricLabel="requests resolved"
            />

            <AutomationCard
              icon={Target}
              title="Intent Detection"
              description="Understand customer intent and prioritize requests."
              metric="96.4%"
              metricLabel="intent accuracy"
            />

            <AutomationCard
              icon={Zap}
              title="Smart Escalation"
              description="Send complex requests to the correct enterprise team."
              metric="186"
              metricLabel="smart escalations"
            />
          </div>
        </section>

        {/* TABS */}

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="flex flex-col gap-4 border-b border-slate-800 p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-2">
              <TabButton
                active={activeTab === "tickets"}
                onClick={() => setActiveTab("tickets")}
              >
                Tickets
              </TabButton>

              <TabButton
                active={activeTab === "activities"}
                onClick={() => setActiveTab("activities")}
              >
                Activities
              </TabButton>
            </div>

            <div className="relative w-full md:w-80">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search support..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="p-5">
            {activeTab === "tickets" ? (
              <TicketTable tickets={filteredTickets} />
            ) : (
              <ActivitiesList activities={activityData} />
            )}
          </div>
        </section>

        {/* WORKFLOWS */}

        <section className="mt-8">
          <SectionHeading
            title="Support Workflows"
            description="Automate complete support operations."
          />

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {workflowData.map((workflow) => (
              <WorkflowCard
                key={workflow.title}
                workflow={workflow}
              />
            ))}
          </div>
        </section>

        {/* AGENTS */}

        <section className="mt-8">
          <SectionHeading
            title="Support AI Agents"
            description="Autonomous agents for customer and internal support."
          />

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {agentData.map((agent) => (
              <AgentCard
                key={agent.title}
                agent={agent}
                onOpen={() => {
                  setSelectedAgent(agent);
                  setShowAgentModal(true);
                }}
              />
            ))}
          </div>
        </section>

        {/* KNOWLEDGE */}

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <FileText size={20} />
              </div>

              <div>
                <h3 className="font-semibold">
                  Knowledge & RAG
                </h3>

                <p className="text-sm text-slate-500">
                  AI-powered enterprise knowledge
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <InfoRow label="Knowledge sources" value="128" />
              <InfoRow label="Indexed documents" value="24,840" />
              <InfoRow label="AI retrieval accuracy" value="96.8%" />
              <InfoRow label="Answers generated" value="18,420" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <TrendingSupport />
              </div>

              <div>
                <h3 className="font-semibold">
                  Support Performance
                </h3>

                <p className="text-sm text-slate-500">
                  AI-generated support metrics
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <PerformanceRow
                label="Customer satisfaction"
                value="96%"
                width="96%"
              />

              <PerformanceRow
                label="First response success"
                value="93%"
                width="93%"
              />

              <PerformanceRow
                label="AI resolution"
                value="94%"
                width="94%"
              />

              <PerformanceRow
                label="Knowledge accuracy"
                value="97%"
                width="97%"
              />
            </div>
          </div>
        </section>

        {/* SECURITY */}

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <SectionHeading
            title="Support Security & Governance"
            description="Protect customer conversations and enterprise support data."
          />

          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SecurityCard
              icon={ShieldCheck}
              title="RBAC"
              description="Role-based support access"
            />

            <SecurityCard
              icon={FileText}
              title="Audit Logs"
              description="Complete support history"
            />

            <SecurityCard
              icon={Settings2}
              title="Data Policies"
              description="Enterprise data controls"
            />

            <SecurityCard
              icon={CheckCircle2}
              title="SSO"
              description="Enterprise identity"
            />
          </div>
        </section>

        {/* ARCHITECTURE */}

        <section className="mt-8 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
          <div className="flex items-center gap-2">
            <Workflow size={20} className="text-blue-400" />

            <h3 className="text-lg font-semibold">
              ModelNow Support Architecture
            </h3>
          </div>

          <p className="mt-2 text-sm text-slate-400">
            From customer request to intelligent resolution.
          </p>

          <div className="mt-8 grid gap-3 md:grid-cols-5">
            <ArchitectureStep
              icon={MessageSquare}
              title="Request"
              description="Customer asks"
            />

            <ArchitectureStep
              icon={Target}
              title="Understand"
              description="Detect intent"
            />

            <ArchitectureStep
              icon={DatabaseIcon}
              title="Knowledge"
              description="Retrieve context"
            />

            <ArchitectureStep
              icon={Bot}
              title="AI Agent"
              description="Resolve"
            />

            <ArchitectureStep
              icon={CheckCircle2}
              title="Outcome"
              description="Complete"
            />
          </div>
        </section>

        <footer className="py-10 text-center text-xs text-slate-600">
          ModelNow Business Support • Enterprise AI Platform
        </footer>
      </div>

      {/* NEW TICKET MODAL */}

      {showTicketModal && (
        <Modal
          title="Create Support Ticket"
          onClose={() => setShowTicketModal(false)}
        >
          <div className="space-y-4">
            <InputField
              label="Customer / Company"
              placeholder="Company name"
            />

            <InputField
              label="Subject"
              placeholder="Support request subject"
            />

            <InputField
              label="Customer Email"
              placeholder="customer@company.com"
            />

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-400">
                Issue Description
              </label>

              <textarea
                rows={4}
                placeholder="Describe the customer issue..."
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>

            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
              <div className="flex gap-3">
                <Sparkles className="mt-0.5 text-blue-400" size={18} />

                <div>
                  <p className="text-sm font-semibold text-blue-300">
                    ModelNow AI will classify this ticket
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    AI can identify intent, priority, team and possible
                    resolution automatically.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setShowTicketModal(false)}
                className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={() => setShowTicketModal(false)}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-500"
              >
                Create Ticket
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* AGENT MODAL */}

      {showAgentModal && selectedAgent && (
        <Modal
          title={selectedAgent.title}
          onClose={() => {
            setShowAgentModal(false);
            setSelectedAgent(null);
          }}
        >
          <div className="space-y-5">
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                  <selectedAgent.icon size={21} />
                </div>

                <div>
                  <p className="font-semibold">
                    {selectedAgent.title}
                  </p>

                  <p className="text-xs text-emerald-400">
                    ● Agent operational
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-300">
                {selectedAgent.description}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <AgentMetric value="8,420" label="Tasks" />
              <AgentMetric value="96.4%" label="Success rate" />
              <AgentMetric value="1.8s" label="Avg response" />
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm font-semibold">
                Agent capabilities
              </p>

              <div className="mt-3 space-y-2">
                {[
                  "Understand customer intent",
                  "Search enterprise knowledge",
                  "Resolve support requests",
                  "Route complex issues",
                  "Generate support insights",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm text-slate-400"
                  >
                    <CheckCircle2
                      size={15}
                      className="text-emerald-400"
                    />

                    {item}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowAgentModal(false)}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold hover:bg-blue-500"
            >
              Close Agent
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function KpiCard({
  title,
  value,
  change,
  icon: Icon,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          <Icon size={19} />
        </div>

        <span className="text-xs font-semibold text-emerald-400">
          {change}
        </span>
      </div>

      <p className="mt-5 text-sm text-slate-400">{title}</p>

      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h3 className="text-xl font-semibold">{title}</h3>

      <p className="mt-1 text-sm text-slate-400">
        {description}
      </p>
    </div>
  );
}

function AutomationCard({
  icon: Icon,
  title,
  description,
  metric,
  metricLabel,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          <Icon size={20} />
        </div>

        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="text-xs text-slate-500">
            AI automation
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-400">
        {description}
      </p>

      <div className="mt-5 border-t border-slate-800 pt-4">
        <p className="text-xl font-bold">{metric}</p>
        <p className="text-xs text-slate-500">{metricLabel}</p>
      </div>
    </div>
  );
}

function TabButton({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium ${
        active
          ? "bg-blue-600 text-white"
          : "text-slate-400 hover:bg-slate-800"
      }`}
    >
      {children}
    </button>
  );
}

function TicketTable({
  tickets,
}: {
  tickets: SupportTicket[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left">
        <thead>
          <tr className="border-b border-slate-800 text-xs uppercase text-slate-500">
            <th className="pb-3">Ticket</th>
            <th className="pb-3">Customer</th>
            <th className="pb-3">Priority</th>
            <th className="pb-3">AI Score</th>
            <th className="pb-3">Status</th>
            <th className="pb-3">Updated</th>
          </tr>
        </thead>

        <tbody>
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              className="border-b border-slate-800/70 last:border-0"
            >
              <td className="py-4">
                <p className="font-medium">{ticket.id}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {ticket.subject}
                </p>
              </td>

              <td className="py-4 text-sm">
                {ticket.customer}
              </td>

              <td className="py-4">
                <StatusBadge status={ticket.priority} />
              </td>

              <td className="py-4">
                <span className="font-semibold">
                  {ticket.aiScore}
                </span>
              </td>

              <td className="py-4">
                <StatusBadge status={ticket.status} />
              </td>

              <td className="py-4 text-sm text-slate-500">
                {ticket.time}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActivitiesList({
  activities,
}: {
  activities: Activity[];
}) {
  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={`${activity.customer}-${activity.time}`}
          className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Zap size={17} />
            </div>

            <div>
              <p className="text-sm font-semibold">
                {activity.title}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {activity.customer} · {activity.type}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500">
              {activity.time}
            </span>

            <StatusBadge status={activity.status} />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const value = status.toLowerCase();

  let classes =
    "border-slate-700 bg-slate-800 text-slate-300";

  if (
    value.includes("active") ||
    value.includes("completed") ||
    value.includes("resolved")
  ) {
    classes =
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
  }

  if (
    value.includes("high") ||
    value.includes("progress")
  ) {
    classes =
      "border-red-500/20 bg-red-500/10 text-red-400";
  }

  if (
    value.includes("medium") ||
    value.includes("assigned")
  ) {
    classes =
      "border-amber-500/20 bg-amber-500/10 text-amber-400";
  }

  if (
    value.includes("low") ||
    value.includes("open") ||
    value.includes("ready")
  ) {
    classes =
      "border-blue-500/20 bg-blue-500/10 text-blue-400";
  }

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${classes}`}
    >
      {status}
    </span>
  );
}

function WorkflowCard({
  workflow,
}: {
  workflow: WorkflowItem;
}) {
  const Icon = workflow.icon;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          <Icon size={19} />
        </div>

        <StatusBadge status={workflow.status} />
      </div>

      <h4 className="mt-5 font-semibold">
        {workflow.title}
      </h4>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {workflow.description}
      </p>

      <button className="mt-5 flex items-center gap-1 text-xs font-semibold text-blue-400">
        Configure workflow
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

function AgentCard({
  agent,
  onOpen,
}: {
  agent: AgentItem;
  onOpen: () => void;
}) {
  const Icon = agent.icon;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          <Icon size={20} />
        </div>

        <span className="text-xs text-emerald-400">
          ● {agent.status}
        </span>
      </div>

      <h4 className="mt-5 font-semibold">
        {agent.title}
      </h4>

      <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-400">
        {agent.description}
      </p>

      <button
        onClick={onOpen}
        className="mt-5 flex items-center gap-1 text-sm font-semibold text-blue-400"
      >
        Open agent
        <ArrowUpRight size={15} />
      </button>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span className="text-sm font-semibold">
        {value}
      </span>
    </div>
  );
}

function PerformanceRow({
  label,
  value,
  width,
}: {
  label: string;
  value: string;
  width: string;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>

      <div className="h-2 rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width }}
        />
      </div>
    </div>
  );
}

function SecurityCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
        <Icon size={17} />
      </div>

      <p className="mt-4 text-sm font-semibold">{title}</p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>

      <div className="mt-3 flex items-center gap-1 text-xs text-emerald-400">
        <CheckCircle2 size={13} />
        Enabled
      </div>
    </div>
  );
}

function ArchitectureStep({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
        <Icon size={18} />
      </div>

      <p className="mt-3 text-sm font-semibold">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

function AgentMetric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-center">
      <p className="text-xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-slate-500">
        {label}
      </p>
    </div>
  );
}

function InputField({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-slate-400">
        {label}
      </label>

      <input
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-blue-500"
      />
    </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h3 className="font-semibold">{title}</h3>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X size={17} />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function TrendingSupport() {
  return <Sparkles size={20} />;
}

function DatabaseIcon() {
  return <Globe size={18} />;
}