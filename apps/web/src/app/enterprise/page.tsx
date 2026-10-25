"use client";

import { useState } from "react";
import {
  Building2,
  Users,
  BriefcaseBusiness,
  UserRound,
  DollarSign,
  Headphones,
  Bot,
  Workflow,
  Plug,
  ShieldCheck,
  BarChart3,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Activity,
  ChevronRight,
  Settings2,
  Database,
  Globe,
  FileText,
  Zap,
  X,
} from "lucide-react";

type Module = {
  name: string;
  description: string;
  icon: any;
  metric: string;
  status: string;
};

const modules: Module[] = [
  {
    name: "Business Support",
    description: "AI-powered customer and internal support.",
    icon: Headphones,
    metric: "2,840",
    status: "Active",
  },
  {
    name: "CRM",
    description: "Manage leads, customers and relationships.",
    icon: Users,
    metric: "8,420",
    status: "Connected",
  },
  {
    name: "ERP",
    description: "Automate enterprise resource processes.",
    icon: Building2,
    metric: "14",
    status: "Connected",
  },
  {
    name: "HR",
    description: "Automate employee and recruitment workflows.",
    icon: UserRound,
    metric: "1,284",
    status: "Active",
  },
  {
    name: "Sales",
    description: "AI-assisted sales and lead automation.",
    icon: BriefcaseBusiness,
    metric: "3,620",
    status: "Active",
  },
  {
    name: "Finance",
    description: "Invoices, approvals and financial operations.",
    icon: DollarSign,
    metric: "₹42.8L",
    status: "Connected",
  },
];

const integrations = [
  {
    name: "CRM Platform",
    type: "Customer data",
    icon: Users,
    status: "Connected",
  },
  {
    name: "Enterprise Database",
    type: "Database",
    icon: Database,
    status: "Connected",
  },
  {
    name: "Web Services",
    type: "External APIs",
    icon: Globe,
    status: "Connected",
  },
  {
    name: "Document Storage",
    type: "Files & documents",
    icon: FileText,
    status: "Connected",
  },
];

const activity = [
  {
    title: "Customer Support Agent completed workflow",
    module: "Business Support",
    time: "2 min ago",
    status: "Completed",
  },
  {
    title: "New CRM lead qualified by AI",
    module: "CRM",
    time: "8 min ago",
    status: "Completed",
  },
  {
    title: "Finance invoice review completed",
    module: "Finance",
    time: "21 min ago",
    status: "Completed",
  },
  {
    title: "HR onboarding workflow started",
    module: "HR",
    time: "34 min ago",
    status: "Running",
  },
];

export default function EnterprisePage() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);

  const selected =
    modules.find((module) => module.name === selectedModule) || null;

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
      {/* TOP HEADER */}

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-7">
        <div>
          <h1 className="text-base font-semibold">Enterprise Hub</h1>

          <p className="text-xs text-slate-500">
            Centralized AI operations for your enterprise
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Enterprise systems operational
          </div>

          <button
            onClick={() => setShowIntegrationModal(true)}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-medium text-white hover:bg-slate-800"
          >
            <Plug size={15} />
            Add Integration
          </button>
        </div>
      </header>

      <div className="p-7">
        {/* HERO */}

        <section className="mb-7 rounded-3xl border border-slate-200 bg-white p-7">
          <div className="flex items-start justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-semibold text-white">
                  MODELNOW ENTERPRISE
                </span>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700">
                  Production Workspace
                </span>
              </div>

              <h2 className="text-3xl font-bold tracking-tight">
                One AI platform for your entire enterprise.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Connect business systems, AI agents, workflows, knowledge,
                automation and enterprise controls through one intelligent
                platform.
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowIntegrationModal(true)}
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-medium text-white"
                >
                  <Plug size={15} />
                  Connect System
                </button>

                <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  <Settings2 size={15} />
                  Enterprise Settings
                </button>
              </div>
            </div>

            <div className="hidden h-28 w-28 items-center justify-center rounded-3xl bg-slate-100 md:flex">
              <Building2 size={48} className="text-slate-700" />
            </div>
          </div>
        </section>

        {/* KPI */}

        <section className="mb-7 grid grid-cols-4 gap-4">
          <MetricCard
            icon={<Activity size={18} />}
            label="AI Operations"
            value="24.8K"
            change="+18.4%"
          />

          <MetricCard
            icon={<Workflow size={18} />}
            label="Active Workflows"
            value="42"
            change="+7 this month"
          />

          <MetricCard
            icon={<Bot size={18} />}
            label="AI Agents"
            value="18"
            change="+5 this month"
          />

          <MetricCard
            icon={<DollarSign size={18} />}
            label="Estimated Savings"
            value="₹8.4L"
            change="+24.8%"
          />
        </section>

        {/* BUSINESS MODULES */}

        <section className="mb-7">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              Enterprise Business Modules
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              AI capabilities organized around your core business functions.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {modules.map((module) => {
              const Icon = module.icon;
              const isSelected = selectedModule === module.name;

              return (
                <button
                  key={module.name}
                  onClick={() => setSelectedModule(module.name)}
                  className={`rounded-2xl border p-5 text-left transition ${
                    isSelected
                      ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                        isSelected ? "bg-white/10" : "bg-slate-100"
                      }`}
                    >
                      <Icon size={20} />
                    </div>

                    <ChevronRight
                      size={17}
                      className={
                        isSelected
                          ? "text-white/60"
                          : "text-slate-400"
                      }
                    />
                  </div>

                  <p className="text-sm font-semibold">{module.name}</p>

                  <p
                    className={`mt-1 text-xs leading-5 ${
                      isSelected
                        ? "text-white/60"
                        : "text-slate-500"
                    }`}
                  >
                    {module.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isSelected
                          ? "text-white"
                          : "text-slate-800"
                      }`}
                    >
                      {module.metric}
                    </span>

                    <span
                      className={`text-[10px] font-semibold ${
                        isSelected
                          ? "text-emerald-300"
                          : "text-emerald-600"
                      }`}
                    >
                      ● {module.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* SELECTED MODULE */}

        {selected && (
          <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                    <selected.icon size={19} />
                  </div>

                  <div>
                    <h2 className="text-base font-semibold">
                      {selected.name}
                    </h2>

                    <p className="text-xs text-slate-500">
                      Enterprise AI module
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm text-slate-600">
                  {selected.description}
                </p>
              </div>

              <button
                onClick={() => setSelectedModule(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <QuickAction
                icon={<Bot size={17} />}
                title="AI Agents"
                description="Manage intelligent agents"
              />

              <QuickAction
                icon={<Workflow size={17} />}
                title="Workflows"
                description="Automate business processes"
              />

              <QuickAction
                icon={<Database size={17} />}
                title="Data"
                description="Access enterprise data"
              />
            </div>
          </section>
        )}

        {/* AI AUTOMATION + SECURITY */}

        <section className="mb-7 grid grid-cols-2 gap-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">
                  AI Automation
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Enterprise-wide intelligent automation
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <Bot size={19} />
              </div>
            </div>

            <AutomationRow
              title="AI Agents"
              value="18 active"
              percentage="82%"
            />

            <AutomationRow
              title="Agent Workflows"
              value="42 active"
              percentage="74%"
            />

            <AutomationRow
              title="Browser Automation"
              value="16 running"
              percentage="61%"
            />

            <AutomationRow
              title="Knowledge & RAG"
              value="28 sources"
              percentage="88%"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">
                  Security & Governance
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Enterprise controls and access management
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <ShieldCheck size={19} />
              </div>
            </div>

            <SecurityRow title="Identity & Access" />
            <SecurityRow title="Role Based Access Control" />
            <SecurityRow title="Audit Logging" />
            <SecurityRow title="Data Governance" />
            <SecurityRow title="Policy Enforcement" />
          </div>
        </section>

        {/* INTEGRATIONS */}

        <section className="mb-7">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Enterprise Integrations
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Connect ModelNow with your enterprise systems.
              </p>
            </div>

            <button
              onClick={() => setShowIntegrationModal(true)}
              className="text-xs font-medium text-slate-700 hover:text-slate-900"
            >
              Manage integrations →
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {integrations.map((integration) => {
              const Icon = integration.icon;

              return (
                <div
                  key={integration.name}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                      <Icon size={18} />
                    </div>

                    <CheckCircle2
                      size={17}
                      className="text-emerald-500"
                    />
                  </div>

                  <p className="text-sm font-semibold">
                    {integration.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {integration.type}
                  </p>

                  <p className="mt-4 text-[10px] font-semibold text-emerald-600">
                    {integration.status}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ACTIVITY */}

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Enterprise Activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Recent AI and workflow operations.
              </p>
            </div>

            <button className="text-xs font-medium text-slate-700">
              View all →
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {activity.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-slate-100 px-5 py-4 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                    <Activity size={16} />
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      {item.title}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      {item.module} · {item.time}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    item.status === "Completed"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* INTEGRATION MODAL */}

      {showIntegrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h3 className="text-base font-semibold">
                  Connect Enterprise System
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Connect a business system to ModelNow.
                </p>
              </div>

              <button
                onClick={() => setShowIntegrationModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-6">
              <IntegrationOption
                icon={<Users size={18} />}
                title="CRM"
                description="Customer systems"
              />

              <IntegrationOption
                icon={<Database size={18} />}
                title="Database"
                description="SQL / enterprise data"
              />

              <IntegrationOption
                icon={<Globe size={18} />}
                title="REST API"
                description="External services"
              />

              <IntegrationOption
                icon={<FileText size={18} />}
                title="File Storage"
                description="Documents and files"
              />

              <IntegrationOption
                icon={<Zap size={18} />}
                title="Webhook"
                description="Event-driven systems"
              />

              <IntegrationOption
                icon={<Settings2 size={18} />}
                title="Custom Connector"
                description="Enterprise integration"
              />
            </div>

            <div className="flex justify-end border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setShowIntegrationModal(false)}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-medium text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* ==========================================
   METRIC CARD
========================================== */

function MetricCard({
  icon,
  label,
  value,
  change,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
          {icon}
        </div>

        <ArrowUpRight
          size={15}
          className="text-emerald-500"
        />
      </div>

      <p className="mt-4 text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-[11px] font-medium text-emerald-600">
        {change}
      </p>
    </div>
  );
}

/* ==========================================
   QUICK ACTION
========================================== */

function QuickAction({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button className="rounded-xl border border-slate-200 p-4 text-left hover:bg-slate-50">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
        {icon}
      </div>

      <p className="text-xs font-semibold">
        {title}
      </p>

      <p className="mt-1 text-[10px] text-slate-500">
        {description}
      </p>
    </button>
  );
}

/* ==========================================
   AUTOMATION ROW
========================================== */

function AutomationRow({
  title,
  value,
  percentage,
}: {
  title: string;
  value: string;
  percentage: string;
}) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-700">
          {title}
        </span>

        <span className="text-[10px] text-slate-400">
          {value}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-800"
          style={{ width: percentage }}
        />
      </div>
    </div>
  );
}

/* ==========================================
   SECURITY ROW
========================================== */

function SecurityRow({
  title,
}: {
  title: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 last:mb-0">
      <div className="flex items-center gap-3">
        <ShieldCheck
          size={15}
          className="text-slate-500"
        />

        <span className="text-xs font-medium text-slate-700">
          {title}
        </span>
      </div>

      <span className="text-[10px] font-semibold text-emerald-600">
        Enabled
      </span>
    </div>
  );
}

/* ==========================================
   INTEGRATION OPTION
========================================== */

function IntegrationOption({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button className="rounded-xl border border-slate-200 p-4 text-left hover:border-slate-300 hover:bg-slate-50">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
        {icon}
      </div>

      <p className="text-xs font-semibold">
        {title}
      </p>

      <p className="mt-1 text-[10px] text-slate-500">
        {description}
      </p>
    </button>
  );
}