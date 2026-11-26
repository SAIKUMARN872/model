"use client";

import { useState } from "react";
import {
  Building2,
  Users,
  BriefcaseBusiness,
  TrendingUp,
  Wallet,
  Package,
  Headphones,
  Megaphone,
  ShieldCheck,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Zap,
  Settings,
  Search,
  Plus,
  Bot,
  Database,
  Globe,
  FileText,
  X,
} from "lucide-react";

type Module = {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: "Active" | "Ready";
  usage: string;
};

const modules: Module[] = [
  {
    id: "hr",
    name: "HR",
    description: "Employee support, recruitment, onboarding and HR workflows.",
    icon: Users,
    status: "Active",
    usage: "1,248 requests",
  },
  {
    id: "crm",
    name: "CRM",
    description: "Customer data, leads, follow-ups and relationship management.",
    icon: BriefcaseBusiness,
    status: "Active",
    usage: "842 requests",
  },
  {
    id: "sales",
    name: "Sales",
    description: "Sales intelligence, lead qualification and pipeline assistance.",
    icon: TrendingUp,
    status: "Active",
    usage: "674 requests",
  },
  {
    id: "finance",
    name: "Finance",
    description: "Financial analysis, reporting and finance operations.",
    icon: Wallet,
    status: "Ready",
    usage: "328 requests",
  },
  {
    id: "erp",
    name: "ERP",
    description: "Connect business operations, inventory and enterprise systems.",
    icon: Package,
    status: "Ready",
    usage: "219 requests",
  },
  {
    id: "support",
    name: "Customer Support",
    description: "AI-powered customer service and support automation.",
    icon: Headphones,
    status: "Active",
    usage: "2,431 requests",
  },
  {
    id: "marketing",
    name: "Marketing",
    description: "Campaign planning, content generation and marketing insights.",
    icon: Megaphone,
    status: "Ready",
    usage: "456 requests",
  },
  {
    id: "security",
    name: "Security & Access",
    description: "Enterprise permissions, access control and governance.",
    icon: ShieldCheck,
    status: "Active",
    usage: "98 policies",
  },
];

const stats = [
  {
    label: "AI Requests",
    value: "12,486",
    change: "+18.4%",
    icon: BarChart3,
  },
  {
    label: "Active Users",
    value: "1,248",
    change: "+12.8%",
    icon: Users,
  },
  {
    label: "Automated Tasks",
    value: "3,842",
    change: "+24.6%",
    icon: Zap,
  },
  {
    label: "Cost Saved",
    value: "$8,420",
    change: "+21.3%",
    icon: Wallet,
  },
];

export default function EnterpriseHubPage() {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showConnectors, setShowConnectors] = useState(false);

  const filteredModules = modules.filter((module) =>
    module.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Building2 size={21} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">ModelNow</h1>
              <p className="text-xs text-slate-500">Enterprise AI</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            <a
              href="/chat"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600 transition hover:bg-slate-100"
            >
              <Bot size={18} />
              Chat
            </a>

            <a
              href="/intelligence"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600 transition hover:bg-slate-100"
            >
              <Zap size={18} />
              Intelligence
            </a>

            <a
              href="/documents"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600 transition hover:bg-slate-100"
            >
              <FileText size={18} />
              Documents
            </a>

            <a
              href="/agents"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600 transition hover:bg-slate-100"
            >
              <Bot size={18} />
              Agents
            </a>

            <a
              href="/models"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600 transition hover:bg-slate-100"
            >
              <Database size={18} />
              Models
            </a>

            <div className="my-4 border-t border-slate-200" />

            <div className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Enterprise
            </div>

            <a
              href="/enterprise-hub"
              className="flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
            >
              <Building2 size={18} />
              Enterprise Hub
            </a>

            <a
              href="/agent-workflows"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600 transition hover:bg-slate-100"
            >
              <BriefcaseBusiness size={18} />
              Agent Workflows
            </a>

            <a
              href="/browser-automation"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600 transition hover:bg-slate-100"
            >
              <Globe size={18} />
              Browser Automation
            </a>

            <a
              href="/fine-tuning"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600 transition hover:bg-slate-100"
            >
              <Settings size={18} />
              Fine-tuning
            </a>
          </nav>

          {/* Bottom */}
          <div className="border-t border-slate-200 p-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span className="text-sm font-semibold">Enterprise Ready</span>
              </div>
              <p className="text-xs leading-5 text-slate-500">
                Centralized AI operations for your organization.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <section className="lg:ml-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur md:px-8">
          <div>
            <p className="text-xs font-medium text-slate-400">
              ModelNow Enterprise
            </p>
            <h2 className="text-lg font-bold">Enterprise Hub</h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowConnectors(true)}
              className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:flex"
            >
              <Globe size={16} />
              Connectors
            </button>

            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Create AI Workspace</span>
              <span className="sm:hidden">Create</span>
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-7xl p-5 md:p-8">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-3xl bg-slate-900 p-7 text-white md:p-10">
            <div className="relative z-10 max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Enterprise AI Platform
              </div>

              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                One AI platform for your entire business.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                ModelNow connects AI models, agents, business systems,
                automation and enterprise knowledge into one intelligent
                workspace.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="/chat"
                  className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Open AI Chat
                  <ArrowRight size={16} />
                </a>

                <button
                  onClick={() => setShowCreate(true)}
                  className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Create Workspace
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />
            <div className="absolute -right-10 -bottom-28 h-80 w-80 rounded-full border border-white/10" />
          </section>

          {/* Stats */}
          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                      <Icon size={19} />
                    </div>

                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600">
                      {stat.change}
                    </span>
                  </div>

                  <p className="mt-5 text-sm text-slate-500">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                </div>
              );
            })}
          </section>

          {/* Business modules */}
          <section className="mt-8">
            <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-bold">Business AI Modules</h2>
                <p className="mt-1 text-sm text-slate-500">
                  AI capabilities organized around your business functions.
                </p>
              </div>

              <div className="relative w-full md:w-72">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search modules..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {filteredModules.map((module) => {
                const Icon = module.icon;

                return (
                  <button
                    key={module.id}
                    onClick={() => setSelectedModule(module)}
                    className="group text-left"
                  >
                    <div className="h-full rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 transition group-hover:bg-slate-900 group-hover:text-white">
                          <Icon size={20} />
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            module.status === "Active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {module.status}
                        </span>
                      </div>

                      <h3 className="mt-5 font-bold">{module.name}</h3>

                      <p className="mt-2 min-h-[60px] text-sm leading-6 text-slate-500">
                        {module.description}
                      </p>

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="text-xs text-slate-400">
                          {module.usage}
                        </span>

                        <ArrowRight
                          size={16}
                          className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-900"
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredModules.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <Search className="mx-auto text-slate-400" size={28} />
                <h3 className="mt-4 font-semibold">No modules found</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Try searching for another business function.
                </p>
              </div>
            )}
          </section>

          {/* AI architecture */}
          <section className="mt-8 grid gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-bold">Enterprise AI Architecture</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    How ModelNow connects intelligence across your organization.
                  </p>
                </div>

                <div className="hidden rounded-xl bg-slate-100 p-2 sm:block">
                  <Building2 size={19} />
                </div>
              </div>

              <div className="mt-7 grid gap-3 md:grid-cols-4">
                {[
                  ["01", "User Request", "Chat / API"],
                  ["02", "AI Orchestrator", "Plan & Route"],
                  ["03", "Enterprise Systems", "CRM / ERP / HR"],
                  ["04", "AI Execution", "Agent / Model"],
                ].map(([number, title, subtitle]) => (
                  <div key={number} className="relative">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <span className="text-xs font-bold text-slate-400">
                        {number}
                      </span>
                      <h3 className="mt-3 text-sm font-bold">{title}</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {subtitle}
                      </p>
                    </div>

                    {number !== "04" && (
                      <ArrowRight
                        size={15}
                        className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 text-slate-400 md:block"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* System status */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="font-bold">System Status</h2>
              <p className="mt-1 text-sm text-slate-500">
                Current ModelNow services.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  ["AI Orchestrator", "Operational"],
                  ["Model Router", "Operational"],
                  ["Agent Engine", "Operational"],
                  ["Knowledge Search", "Operational"],
                  ["Enterprise Connectors", "Ready"],
                ].map(([name, status]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <span className="text-sm font-medium">{name}</span>
                    </div>

                    <span className="text-xs font-medium text-slate-500">
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Quick actions */}
          <section className="mt-8">
            <div className="mb-4">
              <h2 className="text-xl font-bold">Quick Actions</h2>
              <p className="mt-1 text-sm text-slate-500">
                Start common enterprise AI workflows.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Bot,
                  title: "Create AI Agent",
                  text: "Build a business-specific AI agent.",
                  action: () => setShowCreate(true),
                },
                {
                  icon: Globe,
                  title: "Connect System",
                  text: "Connect CRM, ERP, APIs or databases.",
                  action: () => setShowConnectors(true),
                },
                {
                  icon: FileText,
                  title: "Analyze Documents",
                  text: "Use AI across enterprise files.",
                  action: () => {
                    window.location.href = "/documents";
                  },
                },
                {
                  icon: BarChart3,
                  title: "View Analytics",
                  text: "Monitor AI usage and performance.",
                  action: () => {
                    window.location.href = "/analytics";
                  },
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.title}
                    onClick={item.action}
                    className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                      <Icon size={19} />
                    </div>

                    <h3 className="mt-4 font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {item.text}
                    </p>

                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-slate-700">
                      Open
                      <ArrowRight size={14} />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-10 border-t border-slate-200 py-6">
            <div className="flex flex-col justify-between gap-2 text-xs text-slate-400 md:flex-row">
              <p>ModelNow Enterprise AI Platform</p>
              <p>Frontend workspace • Backend integration pending</p>
            </div>
          </footer>
        </div>
      </section>

      {/* Module Modal */}
      {selectedModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                  {(() => {
                    const Icon = selectedModule.icon;
                    return <Icon size={20} />;
                  })()}
                </div>

                <div>
                  <h2 className="font-bold">{selectedModule.name}</h2>
                  <p className="text-xs text-slate-500">
                    Enterprise AI Module
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedModule(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <p className="text-sm leading-6 text-slate-600">
                {selectedModule.description}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-400">Status</p>
                <p className="mt-1 font-semibold">{selectedModule.status}</p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-400">Usage</p>
                <p className="mt-1 font-semibold">{selectedModule.usage}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedModule(null)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
              >
                Close
              </button>

              <button
                onClick={() => setSelectedModule(null)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
              >
                Open Module
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Workspace Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">Create AI Workspace</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Create a dedicated AI workspace for your business team.
                </p>
              </div>

              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Workspace name
                </label>
                <input
                  placeholder="e.g. Acme HR AI"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Business function
                </label>

                <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none">
                  <option>HR</option>
                  <option>CRM</option>
                  <option>Sales</option>
                  <option>Finance</option>
                  <option>ERP</option>
                  <option>Customer Support</option>
                  <option>Marketing</option>
                  <option>Research</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
              >
                Create Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connectors Modal */}
      {showConnectors && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">Enterprise Connectors</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Connect ModelNow with your existing business systems.
                </p>
              </div>

              <button
                onClick={() => setShowConnectors(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "CRM",
                "ERP",
                "REST API",
                "SQL Database",
                "Cloud Storage",
                "HR System",
              ].map((connector) => (
                <button
                  key={connector}
                  onClick={() => setShowConnectors(false)}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                      <Database size={16} />
                    </div>

                    <span className="text-sm font-semibold">
                      {connector}
                    </span>
                  </div>

                  <Plus size={16} className="text-slate-400" />
                </button>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
              <Clock3 size={15} />
              Real connector authentication will be connected through the
              backend.
            </div>
          </div>
        </div>
      )}
    </main>
  );
}