"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Database,
  DollarSign,
  FileCheck2,
  FileText,
  Globe,
  HandCoins,
  Plus,
  Receipt,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Workflow,
  X,
  Zap,
} from "lucide-react";

type Invoice = {
  id: string;
  customer: string;
  amount: string;
  dueDate: string;
  status: string;
  aiScore: number;
};

type Expense = {
  category: string;
  department: string;
  amount: string;
  status: string;
};

type Approval = {
  title: string;
  requester: string;
  amount: string;
  type: string;
  status: string;
};

type Activity = {
  title: string;
  department: string;
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

const invoiceData: Invoice[] = [
  {
    id: "INV-20841",
    customer: "Acme Technologies",
    amount: "₹8.4L",
    dueDate: "18 Sep 2026",
    status: "Paid",
    aiScore: 98,
  },
  {
    id: "INV-20840",
    customer: "Nova Systems",
    amount: "₹5.8L",
    dueDate: "21 Sep 2026",
    status: "Pending",
    aiScore: 94,
  },
  {
    id: "INV-20839",
    customer: "Vertex Global",
    amount: "₹4.2L",
    dueDate: "25 Sep 2026",
    status: "Pending",
    aiScore: 91,
  },
  {
    id: "INV-20838",
    customer: "CloudMatrix",
    amount: "₹3.6L",
    dueDate: "28 Sep 2026",
    status: "Overdue",
    aiScore: 86,
  },
  {
    id: "INV-20837",
    customer: "FinEdge",
    amount: "₹2.8L",
    dueDate: "02 Oct 2026",
    status: "Processing",
    aiScore: 89,
  },
];

const expenseData: Expense[] = [
  {
    category: "Cloud Infrastructure",
    department: "Engineering",
    amount: "₹4.8L",
    status: "Approved",
  },
  {
    category: "Software Licenses",
    department: "Technology",
    amount: "₹2.4L",
    status: "Pending",
  },
  {
    category: "Travel & Operations",
    department: "Sales",
    amount: "₹1.8L",
    status: "Approved",
  },
  {
    category: "Employee Services",
    department: "HR",
    amount: "₹1.2L",
    status: "Review",
  },
];

const approvalData: Approval[] = [
  {
    title: "Enterprise Cloud Purchase",
    requester: "Engineering",
    amount: "₹6.4L",
    type: "Purchase",
    status: "Pending",
  },
  {
    title: "Sales Travel Budget",
    requester: "Sales",
    amount: "₹1.8L",
    type: "Expense",
    status: "AI Reviewed",
  },
  {
    title: "Software Renewal",
    requester: "Technology",
    amount: "₹2.4L",
    type: "Renewal",
    status: "Pending",
  },
  {
    title: "Vendor Payment",
    requester: "Operations",
    amount: "₹4.2L",
    type: "Payment",
    status: "Approved",
  },
];

const activityData: Activity[] = [
  {
    title: "Invoice automatically processed",
    department: "Finance",
    time: "5 min ago",
    status: "Completed",
  },
  {
    title: "AI detected duplicate invoice",
    department: "Accounts Payable",
    time: "16 min ago",
    status: "Completed",
  },
  {
    title: "Expense approval completed",
    department: "Sales",
    time: "28 min ago",
    status: "Completed",
  },
  {
    title: "Payment risk detected",
    department: "Finance",
    time: "43 min ago",
    status: "Review",
  },
];

const workflowData: WorkflowItem[] = [
  {
    title: "AI Invoice Processing",
    description:
      "Extract invoice data, validate records and automatically process invoices.",
    icon: Receipt,
    status: "Active",
  },
  {
    title: "Expense Automation",
    description:
      "Analyze expenses, classify transactions and identify unusual spending.",
    icon: CreditCard,
    status: "Active",
  },
  {
    title: "AI Financial Approvals",
    description:
      "Review financial requests and route approvals using enterprise policies.",
    icon: FileCheck2,
    status: "Active",
  },
  {
    title: "Payment Automation",
    description:
      "Automate payment validation, scheduling and reconciliation.",
    icon: HandCoins,
    status: "Ready",
  },
];

const agentData: AgentItem[] = [
  {
    title: "Finance Intelligence Agent",
    description:
      "Analyzes financial operations, spending and enterprise performance.",
    icon: Bot,
    status: "Active",
  },
  {
    title: "Invoice Processing Agent",
    description:
      "Reads invoices, extracts information and validates financial records.",
    icon: Receipt,
    status: "Active",
  },
  {
    title: "Expense Analysis Agent",
    description:
      "Analyzes spending patterns and detects unusual expenses.",
    icon: BarChart3,
    status: "Active",
  },
  {
    title: "Financial Forecast Agent",
    description:
      "Forecasts cash flow, revenue and financial performance.",
    icon: TrendingUp,
    status: "Active",
  },
];

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<
    "invoices" | "expenses" | "approvals" | "activities"
  >("invoices");

  const [search, setSearch] = useState("");
  const [showInvoiceModal, setShowInvoiceModal] =
    useState(false);

  const [showAgentModal, setShowAgentModal] =
    useState(false);

  const [selectedAgent, setSelectedAgent] =
    useState<AgentItem | null>(null);

  const filteredInvoices = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return invoiceData;

    return invoiceData.filter(
      (invoice) =>
        invoice.customer.toLowerCase().includes(query) ||
        invoice.id.toLowerCase().includes(query) ||
        invoice.status.toLowerCase().includes(query)
    );
  }, [search]);

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
                <DollarSign
                  size={20}
                  className="text-blue-400"
                />

                <h1 className="text-xl font-bold">
                  Finance
                </h1>
              </div>

              <p className="text-xs text-slate-400">
                Enterprise financial intelligence
              </p>
            </div>

            <span className="hidden rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300 md:block">
              Enterprise Module
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Finance systems operational
            </div>

            <button
              onClick={() => setShowInvoiceModal(true)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold hover:bg-blue-500"
            >
              <Plus size={17} />
              Create Invoice
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
                MODELNOW FINANCE INTELLIGENCE
              </span>
            </div>

            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
              Intelligent financial operations for the enterprise.
            </h2>

            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-400">
              ModelNow automates invoices, expenses, approvals,
              payments, financial analysis and forecasting while
              keeping enterprise controls and governance in place.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500"
              >
                <Plus size={17} />
                Create Invoice
              </button>

              <button
                onClick={() => setActiveTab("approvals")}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
              >
                View Approvals
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* KPI */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Total Revenue"
            value="₹84.6L"
            change="+18.4%"
            icon={TrendingUp}
          />

          <KpiCard
            title="Pending Invoices"
            value="₹16.4L"
            change="-8.2%"
            icon={Receipt}
          />

          <KpiCard
            title="Expenses"
            value="₹10.2L"
            change="+4.6%"
            icon={CreditCard}
          />

          <KpiCard
            title="AI Processed"
            value="92.8%"
            change="+21.6%"
            icon={Bot}
          />
        </section>

        {/* FINANCE AI */}

        <section className="mt-8">
          <SectionHeading
            title="Finance AI Automation"
            description="Automate repetitive financial operations with ModelNow."
          />

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <AutomationCard
              icon={Receipt}
              title="AI Invoice Processing"
              description="Extract and validate invoice information automatically."
              metric="8,420"
              metricLabel="invoices processed"
            />

            <AutomationCard
              icon={Target}
              title="Financial Risk Detection"
              description="Identify duplicate invoices, unusual transactions and risks."
              metric="186"
              metricLabel="risks detected"
            />

            <AutomationCard
              icon={TrendingUp}
              title="AI Forecasting"
              description="Forecast revenue, expenses and cash-flow trends."
              metric="₹32.4L"
              metricLabel="forecast value"
            />
          </div>
        </section>

        {/* FINANCIAL OVERVIEW */}

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  Financial Overview
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Current enterprise financial position
                </p>
              </div>

              <BarChart3
                size={20}
                className="text-blue-400"
              />
            </div>

            <div className="mt-6 space-y-5">
              <FinanceMetric
                label="Revenue"
                value="₹84.6L"
                width="88%"
              />

              <FinanceMetric
                label="Operating expenses"
                value="₹10.2L"
                width="42%"
              />

              <FinanceMetric
                label="Pending receivables"
                value="₹16.4L"
                width="56%"
              />

              <FinanceMetric
                label="Projected cash flow"
                value="₹42.8L"
                width="72%"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  Finance Performance
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  AI-generated financial operations metrics
                </p>
              </div>

              <Sparkles
                size={20}
                className="text-blue-400"
              />
            </div>

            <div className="mt-6 space-y-5">
              <PerformanceRow
                label="Invoice automation"
                value="96%"
                width="96%"
              />

              <PerformanceRow
                label="Payment accuracy"
                value="98%"
                width="98%"
              />

              <PerformanceRow
                label="Expense classification"
                value="94%"
                width="94%"
              />

              <PerformanceRow
                label="Forecast accuracy"
                value="91%"
                width="91%"
              />
            </div>
          </div>
        </section>

        {/* TABS */}

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="flex flex-col gap-4 border-b border-slate-800 p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <TabButton
                active={activeTab === "invoices"}
                onClick={() => setActiveTab("invoices")}
              >
                Invoices
              </TabButton>

              <TabButton
                active={activeTab === "expenses"}
                onClick={() => setActiveTab("expenses")}
              >
                Expenses
              </TabButton>

              <TabButton
                active={activeTab === "approvals"}
                onClick={() => setActiveTab("approvals")}
              >
                Approvals
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
                placeholder="Search finance records..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="p-5">
            {activeTab === "invoices" && (
              <InvoiceTable invoices={filteredInvoices} />
            )}

            {activeTab === "expenses" && (
              <ExpenseTable expenses={expenseData} />
            )}

            {activeTab === "approvals" && (
              <ApprovalList approvals={approvalData} />
            )}

            {activeTab === "activities" && (
              <ActivitiesList activities={activityData} />
            )}
          </div>
        </section>

        {/* WORKFLOWS */}

        <section className="mt-8">
          <SectionHeading
            title="Finance Workflows"
            description="Automate end-to-end financial operations."
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
            title="Finance AI Agents"
            description="Autonomous agents for enterprise financial operations."
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

        {/* INTEGRATIONS */}

        <section className="mt-8">
          <SectionHeading
            title="Finance Integrations"
            description="Connect ModelNow with enterprise financial systems."
          />

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <IntegrationCard
              icon={Database}
              title="Finance Database"
              description="Financial records and transactions"
            />

            <IntegrationCard
              icon={CreditCard}
              title="Payment Gateway"
              description="Payments and collections"
            />

            <IntegrationCard
              icon={FileText}
              title="Accounting System"
              description="Accounting and reconciliation"
            />

            <IntegrationCard
              icon={Globe}
              title="Banking APIs"
              description="Enterprise banking services"
            />
          </div>
        </section>

        {/* SECURITY */}

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <SectionHeading
            title="Finance Security & Governance"
            description="Protect financial data with enterprise controls."
          />

          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SecurityCard
              icon={ShieldCheck}
              title="RBAC"
              description="Role-based financial access"
            />

            <SecurityCard
              icon={FileText}
              title="Audit Logs"
              description="Complete financial activity history"
            />

            <SecurityCard
              icon={Settings2}
              title="Data Policies"
              description="Enterprise finance policies"
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
            <Workflow
              size={20}
              className="text-blue-400"
            />

            <h3 className="text-lg font-semibold">
              ModelNow Finance Architecture
            </h3>
          </div>

          <p className="mt-2 text-sm text-slate-400">
            AI intelligence across the complete financial lifecycle.
          </p>

          <div className="mt-8 grid gap-3 md:grid-cols-6">
            <ArchitectureStep
              icon={Receipt}
              title="Invoice"
              description="Capture"
            />

            <ArchitectureStep
              icon={Bot}
              title="AI Process"
              description="Extract"
            />

            <ArchitectureStep
              icon={Target}
              title="Validate"
              description="Check"
            />

            <ArchitectureStep
              icon={FileCheck2}
              title="Approval"
              description="Review"
            />

            <ArchitectureStep
              icon={HandCoins}
              title="Payment"
              description="Execute"
            />

            <ArchitectureStep
              icon={BarChart3}
              title="Analytics"
              description="Optimize"
            />
          </div>
        </section>

        <footer className="py-10 text-center text-xs text-slate-600">
          ModelNow Finance Intelligence • Enterprise AI Platform
        </footer>
      </div>

      {/* INVOICE MODAL */}

      {showInvoiceModal && (
        <Modal
          title="Create Invoice"
          onClose={() => setShowInvoiceModal(false)}
        >
          <div className="space-y-4">
            <InputField
              label="Customer / Company"
              placeholder="Company name"
            />

            <InputField
              label="Invoice Amount"
              placeholder="₹10,00,000"
            />

            <InputField
              label="Invoice Description"
              placeholder="Enterprise AI services"
            />

            <InputField
              label="Due Date"
              placeholder="DD/MM/YYYY"
            />

            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
              <div className="flex gap-3">
                <Sparkles
                  size={18}
                  className="mt-0.5 text-blue-400"
                />

                <div>
                  <p className="text-sm font-semibold text-blue-300">
                    ModelNow AI validation
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    AI can validate invoice information, identify
                    duplicate invoices and route the invoice for
                    approval.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={() => setShowInvoiceModal(false)}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-500"
              >
                Create Invoice
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
              <AgentMetric value="6,420" label="Tasks" />
              <AgentMetric value="97.2%" label="Success rate" />
              <AgentMetric value="2.1s" label="Avg response" />
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm font-semibold">
                Agent capabilities
              </p>

              <div className="mt-3 space-y-2">
                {[
                  "Understand financial context",
                  "Analyze transactions",
                  "Process enterprise records",
                  "Apply financial policies",
                  "Generate financial insights",
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

      <p className="mt-5 text-sm text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold">
        {value}
      </p>
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

        <p className="text-xs text-slate-500">
          {metricLabel}
        </p>
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

function InvoiceTable({
  invoices,
}: {
  invoices: Invoice[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] text-left">
        <thead>
          <tr className="border-b border-slate-800 text-xs uppercase text-slate-500">
            <th className="pb-3">Invoice</th>
            <th className="pb-3">Customer</th>
            <th className="pb-3">Amount</th>
            <th className="pb-3">AI Score</th>
            <th className="pb-3">Due Date</th>
            <th className="pb-3">Status</th>
          </tr>
        </thead>

        <tbody>
          {invoices.map((invoice) => (
            <tr
              key={invoice.id}
              className="border-b border-slate-800/70 last:border-0"
            >
              <td className="py-4">
                <p className="font-medium">
                  {invoice.id}
                </p>
              </td>

              <td className="py-4 text-sm">
                {invoice.customer}
              </td>

              <td className="py-4 text-sm font-semibold">
                {invoice.amount}
              </td>

              <td className="py-4 text-sm">
                {invoice.aiScore}
              </td>

              <td className="py-4 text-sm text-slate-400">
                {invoice.dueDate}
              </td>

              <td className="py-4">
                <StatusBadge status={invoice.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExpenseTable({
  expenses,
}: {
  expenses: Expense[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-left">
        <thead>
          <tr className="border-b border-slate-800 text-xs uppercase text-slate-500">
            <th className="pb-3">Category</th>
            <th className="pb-3">Department</th>
            <th className="pb-3">Amount</th>
            <th className="pb-3">Status</th>
          </tr>
        </thead>

        <tbody>
          {expenses.map((expense) => (
            <tr
              key={expense.category}
              className="border-b border-slate-800/70 last:border-0"
            >
              <td className="py-4 text-sm font-medium">
                {expense.category}
              </td>

              <td className="py-4 text-sm text-slate-400">
                {expense.department}
              </td>

              <td className="py-4 text-sm font-semibold">
                {expense.amount}
              </td>

              <td className="py-4">
                <StatusBadge status={expense.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ApprovalList({
  approvals,
}: {
  approvals: Approval[];
}) {
  return (
    <div className="space-y-3">
      {approvals.map((approval) => (
        <div
          key={approval.title}
          className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <FileCheck2 size={18} />
            </div>

            <div>
              <p className="font-semibold">
                {approval.title}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {approval.requester} · {approval.type}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold">
              {approval.amount}
            </span>

            <StatusBadge status={approval.status} />
          </div>
        </div>
      ))}
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
          key={`${activity.department}-${activity.time}`}
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
                {activity.department}
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
    value.includes("paid") ||
    value.includes("approved") ||
    value.includes("completed") ||
    value.includes("active")
  ) {
    classes =
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
  }

  if (
    value.includes("pending") ||
    value.includes("processing") ||
    value.includes("review")
  ) {
    classes =
      "border-amber-500/20 bg-amber-500/10 text-amber-400";
  }

  if (value.includes("overdue")) {
    classes =
      "border-red-500/20 bg-red-500/10 text-red-400";
  }

  if (value.includes("ready") || value.includes("ai")) {
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

function FinanceMetric({
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
        <span className="text-slate-400">
          {label}
        </span>

        <span className="font-semibold">
          {value}
        </span>
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
        <span className="text-slate-400">
          {label}
        </span>

        <span className="font-semibold">
          {value}
        </span>
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

function IntegrationCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
          <Icon size={18} />
        </div>

        <span className="text-xs font-medium text-emerald-400">
          Connected
        </span>
      </div>

      <h4 className="mt-4 font-semibold">
        {title}
      </h4>

      <p className="mt-1 text-sm text-slate-500">
        {description}
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

      <p className="mt-4 text-sm font-semibold">
        {title}
      </p>

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

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}