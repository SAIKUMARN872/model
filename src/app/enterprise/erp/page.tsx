"use client";

import { useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Package,
  ShoppingCart,
  Activity,
  CheckCircle2,
  Bot,
  Workflow,
  Plus,
  Search,
  X,
  Database,
  Globe,
  FileText,
  Truck,
  AlertTriangle,
  TrendingUp,
  Boxes,
  ClipboardCheck,
  Clock3,
  Sparkles,
  ArrowUpRight,
  Users,
} from "lucide-react";

const inventory = [
  {
    name: "Enterprise Server Units",
    sku: "SRV-2026-001",
    category: "Hardware",
    stock: 248,
    reorder: 80,
    status: "Healthy",
  },
  {
    name: "AI GPU Modules",
    sku: "GPU-2026-014",
    category: "Infrastructure",
    stock: 64,
    reorder: 20,
    status: "Healthy",
  },
  {
    name: "Network Controllers",
    sku: "NET-2026-087",
    category: "Networking",
    stock: 42,
    reorder: 50,
    status: "Low Stock",
  },
  {
    name: "Storage Modules",
    sku: "STR-2026-031",
    category: "Storage",
    stock: 126,
    reorder: 40,
    status: "Healthy",
  },
];

const orders = [
  {
    id: "ORD-10482",
    customer: "Arjun Technologies",
    items: 18,
    value: "₹4.8L",
    status: "Processing",
  },
  {
    id: "ORD-10481",
    customer: "Nova Solutions",
    items: 12,
    value: "₹2.6L",
    status: "Approved",
  },
  {
    id: "ORD-10480",
    customer: "Vertex Systems",
    items: 8,
    value: "₹1.8L",
    status: "Shipped",
  },
  {
    id: "ORD-10479",
    customer: "CloudEdge",
    items: 24,
    value: "₹3.9L",
    status: "Pending",
  },
];

const approvals = [
  {
    title: "Purchase Order Approval",
    description: "AI infrastructure equipment",
    owner: "Operations",
    amount: "₹8.4L",
    status: "Pending",
  },
  {
    title: "Inventory Replenishment",
    description: "Network Controllers",
    owner: "Supply Chain",
    amount: "₹2.1L",
    status: "Pending",
  },
  {
    title: "Vendor Payment",
    description: "Enterprise Cloud Services",
    owner: "Finance",
    amount: "₹4.6L",
    status: "Approved",
  },
];

const activities = [
  {
    title: "AI detected low inventory",
    description: "Network Controllers",
    time: "5 min ago",
  },
  {
    title: "Purchase order approved",
    description: "ORD-10482",
    time: "18 min ago",
  },
  {
    title: "Shipment workflow completed",
    description: "Vertex Systems",
    time: "32 min ago",
  },
  {
    title: "Vendor record updated",
    description: "Enterprise Cloud Services",
    time: "1 hour ago",
  },
];

export default function ERPPage() {
  const [activeTab, setActiveTab] = useState("Inventory");
  const [search, setSearch] = useState("");
  const [showOrderModal, setShowOrderModal] = useState(false);

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
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
                <Package size={20} />
                <h1 className="text-xl font-bold">ERP</h1>
              </div>

              <p className="text-sm text-slate-500">
                AI-powered enterprise resource management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 md:flex">
              <CheckCircle2 size={16} />
              System operational
            </div>

            <button
              onClick={() => setShowOrderModal(true)}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Plus size={17} />
              Create Order
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-6 py-7">
        {/* HERO */}
        <section className="mb-7 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-7">
            <div className="flex flex-col justify-between gap-7 xl:flex-row xl:items-center">
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-600">
                  <Sparkles size={16} />
                  MODELNOW ERP INTELLIGENCE
                </div>

                <h2 className="text-3xl font-bold tracking-tight">
                  Intelligent ERP for your enterprise
                </h2>

                <p className="mt-3 max-w-2xl leading-7 text-slate-500">
                  Manage inventory, orders, operations and approvals with AI
                  agents and automated enterprise workflows.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">
                    <Bot size={17} />
                    ERP AI Assistant
                  </button>

                  <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50">
                    <Workflow size={17} />
                    Automations
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MiniStat label="Inventory" value="42.8K" />
                <MiniStat label="Orders" value="1,284" />
                <MiniStat label="Approvals" value="86" />
                <MiniStat label="Operations" value="98.4%" />
              </div>
            </div>
          </div>
        </section>

        {/* KPI CARDS */}
        <section className="mb-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            icon={<Boxes size={20} />}
            title="Inventory Items"
            value="42,840"
            change="+8.4%"
          />

          <KpiCard
            icon={<ShoppingCart size={20} />}
            title="Active Orders"
            value="1,284"
            change="+14.2%"
          />

          <KpiCard
            icon={<TrendingUp size={20} />}
            title="Operations Efficiency"
            value="98.4%"
            change="+6.8%"
          />

          <KpiCard
            icon={<ClipboardCheck size={20} />}
            title="Pending Approvals"
            value="86"
            change="-18.4%"
          />
        </section>

        {/* AI AUTOMATION */}
        <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                ERP AI Automation
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                ModelNow AI agents monitor and automate enterprise operations.
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
              <Bot size={21} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <AutomationCard
              icon={<Boxes size={19} />}
              title="Inventory Intelligence"
              description="Monitor stock levels and predict replenishment requirements."
            />

            <AutomationCard
              icon={<ShoppingCart size={19} />}
              title="Order Automation"
              description="Process orders and automatically trigger downstream workflows."
            />

            <AutomationCard
              icon={<ClipboardCheck size={19} />}
              title="AI Approvals"
              description="Analyze enterprise requests and route approvals intelligently."
            />
          </div>
        </section>

        {/* OPERATIONS OVERVIEW */}
        <section className="mb-7 grid gap-6 lg:grid-cols-3">
          <OperationCard
            icon={<Truck size={20} />}
            title="Supply Chain"
            value="96.8%"
            description="On-time delivery"
          />

          <OperationCard
            icon={<Activity size={20} />}
            title="Operations"
            value="98.4%"
            description="Process efficiency"
          />

          <OperationCard
            icon={<AlertTriangle size={20} />}
            title="Exceptions"
            value="24"
            description="Requires attention"
          />
        </section>

        {/* MAIN ERP TABLE */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* TABS */}
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center">
            <div className="flex flex-wrap gap-2">
              {["Inventory", "Orders", "Approvals", "Activities"].map(
                (tab) => (
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
                )
              )}
            </div>

            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${activeTab.toLowerCase()}...`}
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-slate-400 md:w-80"
              />
            </div>
          </div>

          {/* INVENTORY */}
          {activeTab === "Inventory" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">SKU</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Reorder Level</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredInventory.map((item) => (
                    <tr
                      key={item.sku}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-6 py-5">
                        <div className="font-semibold">{item.name}</div>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-500">
                        {item.sku}
                      </td>

                      <td className="px-6 py-5 text-sm">
                        {item.category}
                      </td>

                      <td className="px-6 py-5">
                        <span className="font-semibold">
                          {item.stock}
                        </span>
                        <span className="ml-1 text-xs text-slate-400">
                          units
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-500">
                        {item.reorder}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            item.status === "Healthy"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ORDERS */}
          {activeTab === "Orders" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-4">Order</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Items</th>
                    <th className="px-6 py-4">Value</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-6 py-5 font-semibold">
                        {order.id}
                      </td>

                      <td className="px-6 py-5">
                        {order.customer}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-500">
                        {order.items}
                      </td>

                      <td className="px-6 py-5 font-semibold">
                        {order.value}
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* APPROVALS */}
          {activeTab === "Approvals" && (
            <div className="divide-y divide-slate-100">
              {approvals.map((approval) => (
                <div
                  key={approval.title}
                  className="flex flex-col justify-between gap-5 px-6 py-5 lg:flex-row lg:items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-violet-50 p-2.5 text-violet-600">
                      <ClipboardCheck size={19} />
                    </div>

                    <div>
                      <p className="font-medium">{approval.title}</p>

                      <p className="mt-1 text-sm text-slate-500">
                        {approval.description}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Owner: {approval.owner}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div>
                      <p className="text-sm font-semibold">
                        {approval.amount}
                      </p>
                    </div>

                    <StatusBadge status={approval.status} />
                  </div>
                </div>
              ))}
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
                      <p className="font-medium">{item.title}</p>

                      <p className="mt-1 text-sm text-slate-500">
                        {item.description}
                      </p>
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

        {/* WORKFLOWS + AI AGENTS */}
        <section className="mt-7 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-violet-50 p-2.5 text-violet-600">
                  <Workflow size={20} />
                </div>

                <div>
                  <h2 className="font-semibold">ERP Workflows</h2>

                  <p className="text-sm text-slate-500">
                    Automated enterprise processes
                  </p>
                </div>
              </div>

              <button className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50">
                <Plus size={17} />
              </button>
            </div>

            <WorkflowRow
              name="Purchase Order Approval"
              executions="428 executions"
            />

            <WorkflowRow
              name="Inventory Replenishment"
              executions="316 executions"
            />

            <WorkflowRow
              name="Order Processing"
              executions="864 executions"
            />

            <WorkflowRow
              name="Shipment Automation"
              executions="284 executions"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
                <Bot size={20} />
              </div>

              <div>
                <h2 className="font-semibold">ERP AI Agents</h2>

                <p className="text-sm text-slate-500">
                  Intelligent enterprise assistants
                </p>
              </div>
            </div>

            <AgentRow
              name="Inventory Intelligence Agent"
              description="Monitors stock and predicts replenishment"
            />

            <AgentRow
              name="Order Processing Agent"
              description="Automates order validation and processing"
            />

            <AgentRow
              name="Operations Agent"
              description="Monitors enterprise operations"
            />

            <AgentRow
              name="Procurement Agent"
              description="Assists purchasing and vendor workflows"
            />
          </div>
        </section>

        {/* INTEGRATIONS */}
        <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">ERP Integrations</h2>

            <p className="mt-1 text-sm text-slate-500">
              Connect ModelNow ERP with enterprise systems and services.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <IntegrationCard
              icon={<Database size={19} />}
              name="Enterprise Database"
              description="Operational data"
            />

            <IntegrationCard
              icon={<Globe size={19} />}
              name="ERP API"
              description="REST / GraphQL"
            />

            <IntegrationCard
              icon={<Truck size={19} />}
              name="Logistics Platform"
              description="Shipping & delivery"
            />

            <IntegrationCard
              icon={<FileText size={19} />}
              name="Document System"
              description="Invoices & documents"
            />
          </div>
        </section>

        {/* ARCHITECTURE */}
        <section className="mt-7 rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Sparkles size={16} />
              MODELNOW ERP ARCHITECTURE
            </div>

            <h2 className="mt-2 text-xl font-semibold">
              Intelligent enterprise execution layer
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              ModelNow combines enterprise data, AI agents, workflows and
              operational systems into one intelligent ERP platform.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-5">
            <ArchitectureStep
              number="01"
              title="Enterprise Data"
              icon={<Database size={19} />}
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
              title="Execution"
              icon={<ArrowUpRight size={19} />}
            />
          </div>
        </section>
      </div>

      {/* CREATE ORDER MODAL */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Create New Order
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create an enterprise order.
                </p>
              </div>

              <button
                onClick={() => setShowOrderModal(false)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <FormInput
                icon={<UsersIcon />}
                placeholder="Customer name"
              />

              <FormInput
                icon={<Package size={16} />}
                placeholder="Product / service"
              />

              <FormInput
                icon={<ShoppingCart size={16} />}
                placeholder="Quantity"
              />

              <FormInput
                icon={<FileText size={16} />}
                placeholder="Order value"
              />

              <button
                onClick={() => setShowOrderModal(false)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-sm font-medium text-white hover:bg-slate-800"
              >
                <Plus size={17} />
                Create Order
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

function OperationCard({
  icon,
  title,
  value,
  description,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div className="rounded-lg bg-slate-100 p-2.5">
          {icon}
        </div>

        <ArrowUpRight size={17} className="text-slate-400" />
      </div>

      <p className="text-sm text-slate-500">{title}</p>

      <p className="mt-1 text-2xl font-bold">{value}</p>

      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "Approved" || status === "Shipped"
      ? "bg-emerald-50 text-emerald-700"
      : status === "Processing"
        ? "bg-blue-50 text-blue-700"
        : "bg-amber-50 text-amber-700";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${styles}`}
    >
      {status}
    </span>
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

function UsersIcon() {
  return <Users size={16} />;
}