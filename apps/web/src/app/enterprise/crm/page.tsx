"use client";

import { useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Users,
  UserPlus,
  TrendingUp,
  Bot,
  Workflow,
  Search,
  Plus,
  CheckCircle2,
  X,
  Building2,
  Mail,
  Phone,
  Activity,
  Clock3,
  Sparkles,
  Database,
  Globe,
  FileText,
  ArrowUpRight,
} from "lucide-react";

const leads = [
  {
    company: "Arjun Technologies",
    contact: "Arjun Reddy",
    email: "arjun@example.com",
    status: "Qualified",
    score: 94,
    value: "₹4.8L",
  },
  {
    company: "Nova Solutions",
    contact: "Priya Sharma",
    email: "priya@example.com",
    status: "Contacted",
    score: 82,
    value: "₹2.6L",
  },
  {
    company: "Vertex Systems",
    contact: "Rahul Kumar",
    email: "rahul@example.com",
    status: "New",
    score: 71,
    value: "₹1.8L",
  },
  {
    company: "CloudEdge",
    contact: "Sneha Rao",
    email: "sneha@example.com",
    status: "Qualified",
    score: 91,
    value: "₹3.9L",
  },
];

const activities = [
  {
    title: "AI qualified a new lead",
    description: "Arjun Technologies",
    time: "4 min ago",
  },
  {
    title: "Follow-up email generated",
    description: "Nova Solutions",
    time: "18 min ago",
  },
  {
    title: "Sales workflow completed",
    description: "Vertex Systems",
    time: "32 min ago",
  },
  {
    title: "Lead score updated",
    description: "CloudEdge",
    time: "1 hour ago",
  },
];

export default function CRMPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Leads");
  const [showLeadModal, setShowLeadModal] = useState(false);

  const filteredLeads = leads.filter(
    (lead) =>
      lead.company.toLowerCase().includes(search.toLowerCase()) ||
      lead.contact.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <a
              href="/enterprise"
              className="rounded-lg border border-slate-200 p-2 transition hover:bg-slate-100"
            >
              <ArrowLeft size={18} />
            </a>

            <div>
              <div className="flex items-center gap-2">
                <Building2 size={20} />
                <h1 className="text-xl font-bold">CRM</h1>
              </div>

              <p className="text-sm text-slate-500">
                AI-powered customer and sales management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 md:flex">
              <CheckCircle2 size={16} />
              System operational
            </div>

            <button
              onClick={() => setShowLeadModal(true)}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <Plus size={17} />
              Add Lead
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-6 py-7">
        {/* HERO */}
        <section className="mb-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-7">
            <div className="flex flex-col justify-between gap-7 xl:flex-row xl:items-center">
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-600">
                  <Sparkles size={16} />
                  MODELNOW CRM INTELLIGENCE
                </div>

                <h2 className="text-3xl font-bold tracking-tight">
                  AI-powered CRM for your enterprise
                </h2>

                <p className="mt-3 max-w-2xl leading-7 text-slate-500">
                  Manage leads, customers and sales activities using AI agents,
                  intelligent lead scoring and automated workflows.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">
                    <Bot size={17} />
                    AI Assistant
                  </button>

                  <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50">
                    <Workflow size={17} />
                    Workflows
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MiniStat label="Leads" value="8,420" />
                <MiniStat label="Qualified" value="2,184" />
                <MiniStat label="AI Actions" value="12.8K" />
                <MiniStat label="Pipeline" value="₹42.8L" />
              </div>
            </div>
          </div>
        </section>

        {/* KPI */}
        <section className="mb-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            icon={<Users size={20} />}
            title="Total Customers"
            value="8,420"
            change="+18.4%"
          />

          <KpiCard
            icon={<UserPlus size={20} />}
            title="New Leads"
            value="684"
            change="+12.8%"
          />

          <KpiCard
            icon={<TrendingUp size={20} />}
            title="Conversion Rate"
            value="24.8%"
            change="+5.4%"
          />

          <KpiCard
            icon={<Bot size={20} />}
            title="AI Qualified Leads"
            value="2,184"
            change="+31.2%"
          />
        </section>

        {/* AI AUTOMATION */}
        <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                CRM AI Automation
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Intelligent agents automatically handle repetitive CRM
                operations.
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
              <Bot size={21} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <AutomationCard
              icon={<UserPlus size={19} />}
              title="AI Lead Qualification"
              description="Analyze incoming leads and automatically assign qualification scores."
            />

            <AutomationCard
              icon={<Mail size={19} />}
              title="AI Follow-ups"
              description="Generate personalized customer follow-up messages and actions."
            />

            <AutomationCard
              icon={<Workflow size={19} />}
              title="Sales Workflow"
              description="Automatically move qualified leads through your sales pipeline."
            />
          </div>
        </section>

        {/* MAIN CRM */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Tabs */}
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center">
            <div className="flex flex-wrap gap-2">
              {["Leads", "Customers", "Activities"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    activeTab === tab
                      ? "bg-slate-900 text-white"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search CRM..."
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-slate-400 md:w-80"
              />
            </div>
          </div>

          {/* LEADS */}
          {activeTab === "Leads" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">AI Score</th>
                    <th className="px-6 py-4">Pipeline Value</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr
                      key={lead.company}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-5">
                        <div className="font-semibold">
                          {lead.company}
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          Enterprise Lead
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="font-medium">
                          {lead.contact}
                        </div>

                        <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                          <Mail size={13} />
                          {lead.email}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            lead.status === "Qualified"
                              ? "bg-emerald-50 text-emerald-700"
                              : lead.status === "Contacted"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {lead.status}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-slate-900"
                              style={{
                                width: `${lead.score}%`,
                              }}
                            />
                          </div>

                          <span className="text-sm font-bold">
                            {lead.score}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5 font-semibold">
                        {lead.value}
                      </td>

                      <td className="px-6 py-5">
                        <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium hover:bg-slate-50">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredLeads.length === 0 && (
                <div className="p-12 text-center">
                  <Search
                    size={28}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 font-medium">No leads found</p>

                  <p className="mt-1 text-sm text-slate-500">
                    Try another search term.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* CUSTOMERS */}
          {activeTab === "Customers" && (
            <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
              <CustomerCard
                name="Arjun Technologies"
                type="Enterprise Customer"
                value="₹4.8L"
              />

              <CustomerCard
                name="Nova Solutions"
                type="Business Customer"
                value="₹2.6L"
              />

              <CustomerCard
                name="CloudEdge"
                type="Enterprise Customer"
                value="₹3.9L"
              />

              <CustomerCard
                name="Vertex Systems"
                type="Technology Customer"
                value="₹1.8L"
              />
            </div>
          )}

          {/* ACTIVITIES */}
          {activeTab === "Activities" && (
            <div className="divide-y divide-slate-100">
              {activities.map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col justify-between gap-4 px-6 py-5 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
                      <Activity size={18} />
                    </div>

                    <div>
                      <div className="font-medium">
                        {item.title}
                      </div>

                      <div className="mt-1 text-sm text-slate-500">
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Clock3 size={15} />
                    {item.time}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* WORKFLOWS + AGENTS */}
        <section className="mt-7 grid gap-6 lg:grid-cols-2">
          {/* WORKFLOWS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-violet-50 p-2.5 text-violet-600">
                  <Workflow size={20} />
                </div>

                <div>
                  <h2 className="font-semibold">CRM Workflows</h2>

                  <p className="text-sm text-slate-500">
                    Automated business processes
                  </p>
                </div>
              </div>

              <button className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50">
                <Plus size={17} />
              </button>
            </div>

            <WorkflowRow
              name="New Lead Qualification"
              executions="1,284 executions"
            />

            <WorkflowRow
              name="Follow-up Automation"
              executions="864 executions"
            />

            <WorkflowRow
              name="Deal Closing Workflow"
              executions="428 executions"
            />

            <WorkflowRow
              name="Customer Re-engagement"
              executions="316 executions"
            />
          </div>

          {/* AI AGENTS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
                <Bot size={20} />
              </div>

              <div>
                <h2 className="font-semibold">CRM AI Agents</h2>

                <p className="text-sm text-slate-500">
                  Intelligent sales assistants
                </p>
              </div>
            </div>

            <AgentRow
              name="Lead Qualification Agent"
              description="Scores and prioritizes incoming leads"
            />

            <AgentRow
              name="Sales Assistant Agent"
              description="Helps sales teams manage customer actions"
            />

            <AgentRow
              name="Follow-up Agent"
              description="Creates and manages customer follow-ups"
            />

            <AgentRow
              name="CRM Research Agent"
              description="Researches accounts and customer information"
            />
          </div>
        </section>

        {/* INTEGRATIONS */}
        <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">CRM Integrations</h2>

            <p className="mt-1 text-sm text-slate-500">
              Connect ModelNow CRM with enterprise systems and external
              services.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <IntegrationCard
              icon={<Building2 size={19} />}
              name="Salesforce"
              description="CRM Platform"
            />

            <IntegrationCard
              icon={<Users size={19} />}
              name="HubSpot"
              description="Customer Platform"
            />

            <IntegrationCard
              icon={<Database size={19} />}
              name="Enterprise Database"
              description="Customer Data"
            />

            <IntegrationCard
              icon={<Globe size={19} />}
              name="Enterprise API"
              description="REST / GraphQL"
            />
          </div>
        </section>

        {/* ENTERPRISE CRM ARCHITECTURE */}
        <section className="mt-7 rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Sparkles size={16} />
              MODELNOW CRM ARCHITECTURE
            </div>

            <h2 className="mt-2 text-xl font-semibold">
              Intelligent CRM execution layer
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              ModelNow combines enterprise data, AI agents, workflows and
              business systems into one intelligent CRM execution platform.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-5">
            <ArchitectureStep
              number="01"
              title="Customer Data"
              icon={<Users size={19} />}
            />

            <ArchitectureStep
              number="02"
              title="AI Understanding"
              icon={<Bot size={19} />}
            />

            <ArchitectureStep
              number="03"
              title="Decision"
              icon={<Sparkles size={19} />}
            />

            <ArchitectureStep
              number="04"
              title="Workflow"
              icon={<Workflow size={19} />}
            />

            <ArchitectureStep
              number="05"
              title="Action"
              icon={<ArrowUpRight size={19} />}
            />
          </div>
        </section>
      </div>

      {/* ADD LEAD MODAL */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Add New Lead
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create a new CRM lead.
                </p>
              </div>

              <button
                onClick={() => setShowLeadModal(false)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <FormInput
                icon={<Building2 size={16} />}
                placeholder="Company name"
              />

              <FormInput
                icon={<Users size={16} />}
                placeholder="Contact name"
              />

              <FormInput
                icon={<Mail size={16} />}
                placeholder="Email address"
              />

              <FormInput
                icon={<Phone size={16} />}
                placeholder="Phone number"
              />

              <button
                onClick={() => setShowLeadModal(false)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-sm font-medium text-white hover:bg-slate-800"
              >
                <Plus size={17} />
                Create Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* ---------------- COMPONENTS ---------------- */

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}

function KpiCard({
  icon,
  title,
  value,
  change,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  change: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-lg bg-slate-100 p-2.5">
          {icon}
        </div>

        <span className="text-sm font-semibold text-emerald-600">
          {change}
        </span>
      </div>

      <p className="text-sm text-slate-500">{title}</p>

      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function AutomationCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-5 transition hover:border-slate-300 hover:shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
          {icon}
        </div>

        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          Active
        </span>
      </div>

      <h3 className="font-semibold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function CustomerCard({
  name,
  type,
  value,
}: {
  name: string;
  type: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-5 transition hover:shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
          <Users size={18} />
        </div>

        <ArrowUpRight size={17} className="text-slate-400" />
      </div>

      <h3 className="font-semibold">{name}</h3>

      <p className="mt-1 text-sm text-slate-500">{type}</p>

      <p className="mt-4 text-lg font-bold">{value}</p>
    </div>
  );
}

function WorkflowRow({
  name,
  executions,
}: {
  name: string;
  executions: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-4 last:border-0">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-violet-50 p-2 text-violet-600">
          <Workflow size={16} />
        </div>

        <div>
          <p className="text-sm font-medium">{name}</p>
          <p className="mt-1 text-xs text-slate-500">
            {executions}
          </p>
        </div>
      </div>

      <span className="text-xs font-semibold text-emerald-600">
        Active
      </span>
    </div>
  );
}

function AgentRow({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 py-4 last:border-0">
      <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
        <Bot size={17} />
      </div>

      <div>
        <p className="text-sm font-medium">{name}</p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function IntegrationCard({
  icon,
  name,
  description,
}: {
  icon: ReactNode;
  name: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-slate-100 p-2.5">
          {icon}
        </div>

        <div>
          <p className="text-sm font-semibold">{name}</p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <span className="text-xs font-semibold text-emerald-600">
        Connected
      </span>
    </div>
  );
}

function ArchitectureStep({
  number,
  title,
  icon,
}: {
  number: string;
  title: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">
          {number}
        </span>

        <span className="text-slate-300">{icon}</span>
      </div>

      <p className="text-sm font-medium">{title}</p>
    </div>
  );
}

function FormInput({
  icon,
  placeholder,
}: {
  icon: ReactNode;
  placeholder: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-3">
      <span className="text-slate-400">{icon}</span>

      <input
        placeholder={placeholder}
        className="w-full py-3 text-sm outline-none"
      />
    </div>
  );
}