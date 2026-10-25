"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Clock3,
  DollarSign,
  FileText,
  Globe,
  Handshake,
  KanbanSquare,
  Mail,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  Users,
  Workflow,
  X,
  Zap,
} from "lucide-react";

type Lead = {
  id: string;
  company: string;
  contact: string;
  role: string;
  source: string;
  score: number;
  value: string;
  status: string;
};

type Opportunity = {
  id: string;
  company: string;
  deal: string;
  stage: string;
  owner: string;
  value: string;
  probability: number;
};

type Activity = {
  title: string;
  company: string;
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

type IntegrationItem = {
  name: string;
  description: string;
  icon: React.ElementType;
  status: string;
};

const leadData: Lead[] = [
  {
    id: "LD-1048",
    company: "Acme Technologies",
    contact: "Rahul Sharma",
    role: "VP Operations",
    source: "Website",
    score: 94,
    value: "₹18.5L",
    status: "Hot",
  },
  {
    id: "LD-1047",
    company: "Nova Systems",
    contact: "Priya Reddy",
    role: "CTO",
    source: "Referral",
    score: 89,
    value: "₹12.8L",
    status: "Hot",
  },
  {
    id: "LD-1046",
    company: "Vertex Global",
    contact: "Arjun Mehta",
    role: "Head of Sales",
    source: "LinkedIn",
    score: 82,
    value: "₹9.4L",
    status: "Qualified",
  },
  {
    id: "LD-1045",
    company: "CloudMatrix",
    contact: "Sneha Kapoor",
    role: "IT Director",
    source: "Campaign",
    score: 76,
    value: "₹7.2L",
    status: "Qualified",
  },
  {
    id: "LD-1044",
    company: "FinEdge",
    contact: "Vikram Rao",
    role: "CEO",
    source: "Website",
    score: 68,
    value: "₹5.8L",
    status: "New",
  },
];

const opportunityData: Opportunity[] = [
  {
    id: "OP-2081",
    company: "Acme Technologies",
    deal: "Enterprise AI Platform",
    stage: "Negotiation",
    owner: "Ananya",
    value: "₹18.5L",
    probability: 85,
  },
  {
    id: "OP-2080",
    company: "Nova Systems",
    deal: "AI Automation Suite",
    stage: "Proposal",
    owner: "Rahul",
    value: "₹12.8L",
    probability: 70,
  },
  {
    id: "OP-2079",
    company: "Vertex Global",
    deal: "Model Intelligence",
    stage: "Qualified",
    owner: "Priya",
    value: "₹9.4L",
    probability: 55,
  },
  {
    id: "OP-2078",
    company: "CloudMatrix",
    deal: "Enterprise Automation",
    stage: "Discovery",
    owner: "Arjun",
    value: "₹7.2L",
    probability: 35,
  },
];

const activityData: Activity[] = [
  {
    title: "AI follow-up email generated",
    company: "Acme Technologies",
    type: "Follow-up",
    time: "4 min ago",
    status: "Completed",
  },
  {
    title: "Lead qualified by AI",
    company: "Nova Systems",
    type: "Lead Scoring",
    time: "12 min ago",
    status: "Completed",
  },
  {
    title: "Proposal sent automatically",
    company: "Vertex Global",
    type: "Sales Workflow",
    time: "26 min ago",
    status: "Completed",
  },
  {
    title: "New enterprise lead detected",
    company: "FinEdge",
    type: "Lead Generation",
    time: "41 min ago",
    status: "New",
  },
  {
    title: "Deal moved to negotiation",
    company: "Acme Technologies",
    type: "Pipeline",
    time: "1 hr ago",
    status: "Completed",
  },
];

const workflowData: WorkflowItem[] = [
  {
    title: "AI Lead Qualification",
    description:
      "Automatically analyze new leads, score intent and prioritize high-value prospects.",
    icon: Target,
    status: "Active",
  },
  {
    title: "AI Sales Follow-up",
    description:
      "Generate personalized follow-ups based on customer context and previous interactions.",
    icon: Mail,
    status: "Active",
  },
  {
    title: "Opportunity Management",
    description:
      "Track deals, predict conversion probability and identify pipeline risks.",
    icon: KanbanSquare,
    status: "Active",
  },
  {
    title: "Proposal Automation",
    description:
      "Generate proposals and route them through enterprise approval workflows.",
    icon: FileText,
    status: "Ready",
  },
];

const agentData: AgentItem[] = [
  {
    title: "Sales Intelligence Agent",
    description:
      "Analyzes pipeline, prospects and revenue opportunities.",
    icon: Bot,
    status: "Active",
  },
  {
    title: "Lead Qualification Agent",
    description:
      "Scores leads using intent, company signals and engagement.",
    icon: Target,
    status: "Active",
  },
  {
    title: "Sales Follow-up Agent",
    description:
      "Creates personalized customer communication and follow-ups.",
    icon: Mail,
    status: "Active",
  },
  {
    title: "Revenue Forecast Agent",
    description:
      "Analyzes pipeline probability and forecasts expected revenue.",
    icon: TrendingUp,
    status: "Active",
  },
];

const integrationData: IntegrationItem[] = [
  {
    name: "CRM Platform",
    description: "Customer and opportunity data",
    icon: Users,
    status: "Connected",
  },
  {
    name: "Email Services",
    description: "Sales communication and follow-ups",
    icon: Mail,
    status: "Connected",
  },
  {
    name: "Enterprise Database",
    description: "Sales and customer records",
    icon: BriefcaseBusiness,
    status: "Connected",
  },
  {
    name: "Web Services",
    description: "External sales and enrichment APIs",
    icon: Globe,
    status: "Connected",
  },
];

export default function SalesPage() {
  const [activeTab, setActiveTab] = useState<
    "leads" | "opportunities" | "activities"
  >("leads");

  const [search, setSearch] = useState("");
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentItem | null>(null);
  const [leadCreated, setLeadCreated] = useState(false);

  const filteredLeads = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return leadData;

    return leadData.filter(
      (lead) =>
        lead.company.toLowerCase().includes(query) ||
        lead.contact.toLowerCase().includes(query) ||
        lead.role.toLowerCase().includes(query) ||
        lead.status.toLowerCase().includes(query)
    );
  }, [search]);

  const filteredOpportunities = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return opportunityData;

    return opportunityData.filter(
      (opportunity) =>
        opportunity.company.toLowerCase().includes(query) ||
        opportunity.deal.toLowerCase().includes(query) ||
        opportunity.stage.toLowerCase().includes(query)
    );
  }, [search]);

  function createLead() {
    setLeadCreated(true);
    setShowLeadModal(false);

    setTimeout(() => {
      setLeadCreated(false);
    }, 2500);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/enterprise"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:bg-slate-800"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <Handshake size={20} className="text-blue-400" />
                <h1 className="text-xl font-bold">Sales</h1>
              </div>

              <p className="text-xs text-slate-400">
                Enterprise revenue intelligence
              </p>
            </div>

            <span className="hidden rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300 md:block">
              Enterprise Module
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Sales systems operational
            </div>

            <button
              onClick={() => setShowLeadModal(true)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              <Plus size={17} />
              Add Lead
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
                MODELNOW SALES INTELLIGENCE
              </span>
            </div>

            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
              AI-powered sales operations for enterprise teams.
            </h2>

            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-400">
              ModelNow connects leads, opportunities, sales agents, workflows,
              customer intelligence and revenue analytics into one intelligent
              sales platform.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => setShowLeadModal(true)}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500"
              >
                <Plus size={17} />
                Create Lead
              </button>

              <button
                onClick={() => setActiveTab("opportunities")}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
              >
                View Pipeline
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* KPI */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Pipeline Value"
            value="₹48.9L"
            change="+18.6%"
            icon={DollarSign}
          />

          <KpiCard
            title="Active Leads"
            value="1,846"
            change="+12.4%"
            icon={Users}
          />

          <KpiCard
            title="Conversion Rate"
            value="28.6%"
            change="+6.8%"
            icon={Target}
          />

          <KpiCard
            title="AI Qualified Leads"
            value="684"
            change="+24.2%"
            icon={Bot}
          />
        </section>

        {/* AI AUTOMATION */}
        <section className="mt-8">
          <SectionHeading
            title="Sales AI Automation"
            description="ModelNow agents automate repetitive sales operations."
          />

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <AutomationCard
              icon={Target}
              title="AI Lead Scoring"
              description="Automatically identify high-intent prospects."
              metric="684"
              metricLabel="qualified leads"
            />

            <AutomationCard
              icon={Mail}
              title="AI Follow-ups"
              description="Generate contextual customer communication."
              metric="1,284"
              metricLabel="follow-ups automated"
            />

            <AutomationCard
              icon={TrendingUp}
              title="Revenue Intelligence"
              description="Predict pipeline outcomes and revenue."
              metric="₹14.2L"
              metricLabel="forecast pipeline"
            />
          </div>
        </section>

        {/* PIPELINE */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h3 className="text-lg font-semibold">Sales Pipeline</h3>
              <p className="mt-1 text-sm text-slate-400">
                Current opportunity distribution across sales stages.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-400">
              <BarChart3 size={17} />
              Total pipeline ₹48.9L
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <PipelineStage
              title="Discovery"
              count="18"
              value="₹8.4L"
              width="38%"
            />

            <PipelineStage
              title="Qualified"
              count="14"
              value="₹11.8L"
              width="54%"
            />

            <PipelineStage
              title="Proposal"
              count="9"
              value="₹13.5L"
              width="72%"
            />

            <PipelineStage
              title="Negotiation"
              count="6"
              value="₹15.2L"
              width="88%"
            />
          </div>
        </section>

        {/* TABS */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="flex flex-col gap-4 border-b border-slate-800 p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <TabButton
                active={activeTab === "leads"}
                onClick={() => setActiveTab("leads")}
              >
                Leads
              </TabButton>

              <TabButton
                active={activeTab === "opportunities"}
                onClick={() => setActiveTab("opportunities")}
              >
                Opportunities
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
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search sales records..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="p-5">
            {activeTab === "leads" && (
              <LeadsTable leads={filteredLeads} />
            )}

            {activeTab === "opportunities" && (
              <OpportunitiesTable
                opportunities={filteredOpportunities}
              />
            )}

            {activeTab === "activities" && (
              <ActivitiesList activities={activityData} />
            )}
          </div>
        </section>

        {/* WORKFLOWS */}
        <section className="mt-8">
          <SectionHeading
            title="Sales Workflows"
            description="Automate complete sales processes with ModelNow."
          />

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {workflowData.map((workflow) => (
              <WorkflowCard key={workflow.title} workflow={workflow} />
            ))}
          </div>
        </section>

        {/* AI AGENTS */}
        <section className="mt-8">
          <SectionHeading
            title="Sales AI Agents"
            description="Autonomous agents that support enterprise revenue teams."
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

        {/* REVENUE ANALYTICS */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Revenue Forecast</h3>
                <p className="mt-1 text-sm text-slate-400">
                  AI-estimated revenue for the current quarter.
                </p>
              </div>

              <TrendingUp size={20} className="text-emerald-400" />
            </div>

            <div className="mt-6 flex items-end gap-3">
              <span className="text-4xl font-bold">₹32.4L</span>
              <span className="mb-1 text-sm font-semibold text-emerald-400">
                +21.8%
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <ForecastRow label="Committed" value="₹18.2L" width="82%" />
              <ForecastRow label="Best case" value="₹9.6L" width="58%" />
              <ForecastRow label="Upside" value="₹4.6L" width="34%" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Sales Performance</h3>
                <p className="mt-1 text-sm text-slate-400">
                  AI-generated performance indicators.
                </p>
              </div>

              <BarChart3 size={20} className="text-blue-400" />
            </div>

            <div className="mt-6 space-y-5">
              <PerformanceRow
                label="Lead response"
                value="92%"
                width="92%"
              />

              <PerformanceRow
                label="Qualification accuracy"
                value="89%"
                width="89%"
              />

              <PerformanceRow
                label="Follow-up completion"
                value="94%"
                width="94%"
              />

              <PerformanceRow
                label="Pipeline health"
                value="86%"
                width="86%"
              />
            </div>
          </div>
        </section>

        {/* INTEGRATIONS */}
        <section className="mt-8">
          <SectionHeading
            title="Sales Integrations"
            description="Connect ModelNow with enterprise sales systems."
          />

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {integrationData.map((integration) => (
              <IntegrationCard
                key={integration.name}
                integration={integration}
              />
            ))}
          </div>
        </section>

        {/* SECURITY */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <SectionHeading
            title="Sales Security & Governance"
            description="Enterprise controls protect sales data and customer information."
          />

          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SecurityCard
              icon={ShieldCheck}
              title="RBAC"
              description="Role-based sales access"
            />

            <SecurityCard
              icon={FileText}
              title="Audit Logs"
              description="Complete sales activity history"
            />

            <SecurityCard
              icon={Settings2}
              title="Data Policies"
              description="Enterprise data controls"
            />

            <SecurityCard
              icon={CheckCircle2}
              title="SSO"
              description="Enterprise identity integration"
            />
          </div>
        </section>

        {/* ARCHITECTURE */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
          <div className="flex items-center gap-2">
            <Workflow size={20} className="text-blue-400" />
            <h3 className="text-lg font-semibold">
              ModelNow Sales Architecture
            </h3>
          </div>

          <p className="mt-2 text-sm text-slate-400">
            AI intelligence connects the entire enterprise sales lifecycle.
          </p>

          <div className="mt-8 grid gap-3 md:grid-cols-6">
            <ArchitectureStep
              icon={UserRound}
              title="Lead"
              description="Capture"
            />

            <ArchitectureArrow />

            <ArchitectureStep
              icon={Target}
              title="AI Score"
              description="Qualify"
            />

            <ArchitectureArrow />

            <ArchitectureStep
              icon={Bot}
              title="AI Agent"
              description="Automate"
            />

            <ArchitectureArrow />

            <ArchitectureStep
              icon={KanbanSquare}
              title="Pipeline"
              description="Manage"
            />

            <ArchitectureArrow />

            <ArchitectureStep
              icon={DollarSign}
              title="Revenue"
              description="Forecast"
            />

            <ArchitectureArrow />

            <ArchitectureStep
              icon={BarChart3}
              title="Analytics"
              description="Optimize"
            />
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-10 text-center text-xs text-slate-600">
          ModelNow Sales Intelligence • Enterprise AI Platform
        </footer>
      </div>

      {/* ADD LEAD MODAL */}
      {showLeadModal && (
        <Modal
          title="Create Sales Lead"
          onClose={() => setShowLeadModal(false)}
        >
          <div className="space-y-4">
            <InputField label="Company Name" placeholder="Company name" />
            <InputField label="Contact Name" placeholder="Contact name" />
            <InputField label="Job Role" placeholder="VP Sales / CTO / CEO" />
            <InputField label="Email" placeholder="contact@company.com" />

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Estimated Value"
                placeholder="₹10L"
              />

              <InputField
                label="Lead Source"
                placeholder="Website / Referral"
              />
            </div>

            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
              <div className="flex gap-3">
                <Sparkles
                  size={18}
                  className="mt-0.5 shrink-0 text-blue-400"
                />

                <div>
                  <p className="text-sm font-semibold text-blue-300">
                    ModelNow AI will qualify this lead
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    AI can analyze company information, intent signals and
                    engagement to generate a lead score.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setShowLeadModal(false)}
                className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={createLead}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-500"
              >
                Create Lead
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
                  <p className="font-semibold">{selectedAgent.title}</p>
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
              <AgentMetric value="2,840" label="Tasks" />
              <AgentMetric value="96.4%" label="Success rate" />
              <AgentMetric value="1.8s" label="Avg response" />
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm font-semibold">Agent capabilities</p>

              <div className="mt-3 space-y-2">
                {[
                  "Understand sales context",
                  "Analyze customer signals",
                  "Execute sales workflows",
                  "Update enterprise records",
                  "Generate sales insights",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm text-slate-400"
                  >
                    <CheckCircle2 size={15} className="text-emerald-400" />
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

      {/* SUCCESS MESSAGE */}
      {leadCreated && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-slate-900 px-5 py-4 shadow-2xl">
          <CheckCircle2 size={20} className="text-emerald-400" />

          <div>
            <p className="text-sm font-semibold">
              Lead created successfully
            </p>

            <p className="text-xs text-slate-400">
              AI qualification is ready for the new lead.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

/* =========================
   COMPONENTS
========================= */

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

        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
          <ArrowUpRight size={13} />
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
      <p className="mt-1 text-sm text-slate-400">{description}</p>
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
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-blue-500/30">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          <Icon size={20} />
        </div>

        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="text-xs text-slate-500">AI automation</p>
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

function PipelineStage({
  title,
  count,
  value,
  width,
}: {
  title: string;
  count: string;
  value: string;
  width: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{title}</p>
        <span className="text-xs text-slate-500">{count} deals</span>
      </div>

      <p className="mt-3 text-lg font-bold">{value}</p>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-blue-500"
          style={{ width }}
        />
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
      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-blue-600 text-white"
          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function LeadsTable({ leads }: { leads: Lead[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] text-left">
        <thead>
          <tr className="border-b border-slate-800 text-xs uppercase text-slate-500">
            <th className="pb-3 font-medium">Lead</th>
            <th className="pb-3 font-medium">Contact</th>
            <th className="pb-3 font-medium">Source</th>
            <th className="pb-3 font-medium">AI Score</th>
            <th className="pb-3 font-medium">Value</th>
            <th className="pb-3 font-medium">Status</th>
          </tr>
        </thead>

        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead.id}
              className="border-b border-slate-800/70 last:border-0"
            >
              <td className="py-4">
                <p className="font-medium">{lead.company}</p>
                <p className="mt-1 text-xs text-slate-500">{lead.id}</p>
              </td>

              <td className="py-4">
                <p className="text-sm">{lead.contact}</p>
                <p className="mt-1 text-xs text-slate-500">{lead.role}</p>
              </td>

              <td className="py-4 text-sm text-slate-400">
                {lead.source}
              </td>

              <td className="py-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${lead.score}%` }}
                    />
                  </div>

                  <span className="text-sm font-semibold">
                    {lead.score}
                  </span>
                </div>
              </td>

              <td className="py-4 text-sm font-semibold">
                {lead.value}
              </td>

              <td className="py-4">
                <StatusBadge status={lead.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OpportunitiesTable({
  opportunities,
}: {
  opportunities: Opportunity[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left">
        <thead>
          <tr className="border-b border-slate-800 text-xs uppercase text-slate-500">
            <th className="pb-3 font-medium">Company</th>
            <th className="pb-3 font-medium">Opportunity</th>
            <th className="pb-3 font-medium">Stage</th>
            <th className="pb-3 font-medium">Owner</th>
            <th className="pb-3 font-medium">Value</th>
            <th className="pb-3 font-medium">Probability</th>
          </tr>
        </thead>

        <tbody>
          {opportunities.map((opportunity) => (
            <tr
              key={opportunity.id}
              className="border-b border-slate-800/70 last:border-0"
            >
              <td className="py-4">
                <p className="font-medium">{opportunity.company}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {opportunity.id}
                </p>
              </td>

              <td className="py-4 text-sm text-slate-300">
                {opportunity.deal}
              </td>

              <td className="py-4">
                <StatusBadge status={opportunity.stage} />
              </td>

              <td className="py-4 text-sm text-slate-400">
                {opportunity.owner}
              </td>

              <td className="py-4 text-sm font-semibold">
                {opportunity.value}
              </td>

              <td className="py-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${opportunity.probability}%`,
                      }}
                    />
                  </div>

                  <span className="text-xs text-slate-400">
                    {opportunity.probability}%
                  </span>
                </div>
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
          key={`${activity.company}-${activity.time}`}
          className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Zap size={17} />
            </div>

            <div>
              <p className="text-sm font-semibold">{activity.title}</p>

              <p className="mt-1 text-xs text-slate-500">
                {activity.company} · {activity.type}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-slate-500">
              <Clock3 size={13} />
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
  const normalized = status.toLowerCase();

  let classes =
    "border-slate-700 bg-slate-800 text-slate-300";

  if (
    normalized === "hot" ||
    normalized === "active" ||
    normalized === "completed"
  ) {
    classes =
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
  }

  if (
    normalized === "qualified" ||
    normalized === "proposal" ||
    normalized === "ready"
  ) {
    classes =
      "border-blue-500/20 bg-blue-500/10 text-blue-400";
  }

  if (
    normalized === "new" ||
    normalized === "discovery"
  ) {
    classes =
      "border-amber-500/20 bg-amber-500/10 text-amber-400";
  }

  if (normalized === "negotiation") {
    classes =
      "border-purple-500/20 bg-purple-500/10 text-purple-400";
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
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-blue-500/30">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          <Icon size={19} />
        </div>

        <StatusBadge status={workflow.status} />
      </div>

      <h4 className="mt-5 font-semibold">{workflow.title}</h4>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {workflow.description}
      </p>

      <button className="mt-5 flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300">
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

        <span className="flex items-center gap-1 text-xs text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {agent.status}
        </span>
      </div>

      <h4 className="mt-5 font-semibold">{agent.title}</h4>

      <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-400">
        {agent.description}
      </p>

      <button
        onClick={onOpen}
        className="mt-5 flex items-center gap-1 text-sm font-semibold text-blue-400 hover:text-blue-300"
      >
        Open agent
        <ArrowUpRight size={15} />
      </button>
    </div>
  );
}

function ForecastRow({
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
        <span className="font-semibold text-slate-200">{value}</span>
      </div>

      <div className="h-2 rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-blue-500"
          style={{ width }}
        />
      </div>
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

function IntegrationCard({
  integration,
}: {
  integration: IntegrationItem;
}) {
  const Icon = integration.icon;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
          <Icon size={18} />
        </div>

        <span className="text-xs font-medium text-emerald-400">
          {integration.status}
        </span>
      </div>

      <h4 className="mt-4 font-semibold">{integration.name}</h4>

      <p className="mt-1 text-sm text-slate-500">
        {integration.description}
      </p>
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

      <p className="mt-1 text-xs leading-5 text-slate-500">
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

      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function ArchitectureArrow() {
  return (
    <div className="hidden items-center justify-center md:flex">
      <ChevronRight size={18} className="text-slate-600" />
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
      <p className="mt-1 text-xs text-slate-500">{label}</p>
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