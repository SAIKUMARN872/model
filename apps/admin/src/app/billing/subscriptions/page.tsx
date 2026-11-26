
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Download,
  Users,
  CreditCard,
  RefreshCw,
  AlertTriangle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  CheckCircle2,
  Clock3,
  XCircle,
  PauseCircle,
  Filter,
  ArrowUpRight,
} from "lucide-react";

type SubscriptionStatus =
  | "Active"
  | "Trialing"
  | "Past Due"
  | "Cancelled"
  | "Paused";

type Subscription = {
  id: string;
  customer: string;
  email: string;
  plan: string;
  billingCycle: "Monthly" | "Yearly";
  amount: number;
  status: SubscriptionStatus;
  startDate: string;
  nextBilling: string;
  paymentMethod: string;
};

const initialSubscriptions: Subscription[] = [
  {
    id: "SUB-1001",
    customer: "Olivia Martin",
    email: "olivia@example.com",
    plan: "Pro",
    billingCycle: "Monthly",
    amount: 29,
    status: "Active",
    startDate: "2026-08-02",
    nextBilling: "2026-12-02",
    paymentMethod: "Visa •••• 4242",
  },
  {
    id: "SUB-1002",
    customer: "Jackson Lee",
    email: "jackson@example.com",
    plan: "Plus",
    billingCycle: "Monthly",
    amount: 12,
    status: "Active",
    startDate: "2026-09-01",
    nextBilling: "2026-12-01",
    paymentMethod: "UPI",
  },
  {
    id: "SUB-1003",
    customer: "Isabella Chen",
    email: "isabella@example.com",
    plan: "Business",
    billingCycle: "Yearly",
    amount: 990,
    status: "Trialing",
    startDate: "2026-10-05",
    nextBilling: "2026-11-12",
    paymentMethod: "Mastercard •••• 8810",
  },
  {
    id: "SUB-1004",
    customer: "William Kim",
    email: "william@example.com",
    plan: "Pro",
    billingCycle: "Monthly",
    amount: 29,
    status: "Cancelled",
    startDate: "2026-06-29",
    nextBilling: "2026-10-29",
    paymentMethod: "Visa •••• 9012",
  },
  {
    id: "SUB-1005",
    customer: "Sophia Davis",
    email: "sophia@example.com",
    plan: "Plus",
    billingCycle: "Monthly",
    amount: 12,
    status: "Active",
    startDate: "2026-07-28",
    nextBilling: "2026-12-28",
    paymentMethod: "Visa •••• 2218",
  },
  {
    id: "SUB-1006",
    customer: "Noah Brown",
    email: "noah@example.com",
    plan: "Pro",
    billingCycle: "Monthly",
    amount: 29,
    status: "Past Due",
    startDate: "2026-05-14",
    nextBilling: "2026-11-14",
    paymentMethod: "Mastercard •••• 5521",
  },
  {
    id: "SUB-1007",
    customer: "Ava Wilson",
    email: "ava@example.com",
    plan: "Business",
    billingCycle: "Yearly",
    amount: 990,
    status: "Active",
    startDate: "2026-02-10",
    nextBilling: "2027-02-10",
    paymentMethod: "Visa •••• 7890",
  },
  {
    id: "SUB-1008",
    customer: "Ethan Taylor",
    email: "ethan@example.com",
    plan: "Plus",
    billingCycle: "Monthly",
    amount: 12,
    status: "Paused",
    startDate: "2026-04-18",
    nextBilling: "2026-12-18",
    paymentMethod: "UPI",
  },
  {
    id: "SUB-1009",
    customer: "Mia Anderson",
    email: "mia@example.com",
    plan: "Pro",
    billingCycle: "Monthly",
    amount: 29,
    status: "Active",
    startDate: "2026-10-10",
    nextBilling: "2026-12-10",
    paymentMethod: "Visa •••• 3344",
  },
];

const PAGE_SIZE = 6;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const config = {
    Active: {
      icon: CheckCircle2,
      className: "bg-emerald-50 text-emerald-700",
    },
    Trialing: {
      icon: Clock3,
      className: "bg-blue-50 text-blue-700",
    },
    "Past Due": {
      icon: AlertTriangle,
      className: "bg-rose-50 text-rose-700",
    },
    Cancelled: {
      icon: XCircle,
      className: "bg-slate-100 text-slate-600",
    },
    Paused: {
      icon: PauseCircle,
      className: "bg-amber-50 text-amber-700",
    },
  }[status];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      <Icon size={13} />
      {status}
    </span>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof Users;
  iconClass: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <span className={`rounded-lg p-2 ${iconClass}`}>
          <Icon size={19} />
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function exportCsv(records: Subscription[]) {
  const headers = [
    "Subscription ID",
    "Customer",
    "Email",
    "Plan",
    "Billing Cycle",
    "Amount",
    "Status",
    "Start Date",
    "Next Billing",
    "Payment Method",
  ];

  const rows = records.map((item) => [
    item.id,
    item.customer,
    item.email,
    item.plan,
    item.billingCycle,
    String(item.amount),
    item.status,
    item.startDate,
    item.nextBilling,
    item.paymentMethod,
  ]);

  const escapeCell = (value: string) => {
    const safeValue = /^[=+\-@\t\r]/.test(value)
      ? `'${value}`
      : value;

    return `"${safeValue.replace(/"/g, '""')}"`;
  };

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCell).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "modelnow-subscriptions.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

export default function BillingSubscriptionsPage() {
  const [subscriptions] = useState(initialSubscriptions);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [planFilter, setPlanFilter] = useState("All plans");
  const [cycleFilter, setCycleFilter] = useState("All cycles");
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<Subscription | null>(null);

  const metrics = useMemo(() => {
    const active = subscriptions.filter((item) => item.status === "Active");
    const trialing = subscriptions.filter((item) => item.status === "Trialing");
    const pastDue = subscriptions.filter((item) => item.status === "Past Due");
    const mrr = active.reduce(
      (total, item) =>
        total + (item.billingCycle === "Yearly" ? item.amount / 12 : item.amount),
      0
    );

    return {
      total: subscriptions.length,
      active: active.length,
      trialing: trialing.length,
      pastDue: pastDue.length,
      mrr,
    };
  }, [subscriptions]);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return subscriptions.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          item.id,
          item.customer,
          item.email,
          item.plan,
          item.paymentMethod,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All statuses" || item.status === statusFilter;

      const matchesPlan =
        planFilter === "All plans" || item.plan === planFilter;

      const matchesCycle =
        cycleFilter === "All cycles" || item.billingCycle === cycleFilter;

      return matchesSearch && matchesStatus && matchesPlan && matchesCycle;
    });
  }, [subscriptions, search, statusFilter, planFilter, cycleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const visibleRecords = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  function resetFilters() {
    setSearch("");
    setStatusFilter("All statuses");
    setPlanFilter("All plans");
    setCycleFilter("All cycles");
    setCurrentPage(1);
  }

  function updateSearch(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  function updateStatus(value: string) {
    setStatusFilter(value);
    setCurrentPage(1);
  }

  function updatePlan(value: string) {
    setPlanFilter(value);
    setCurrentPage(1);
  }

  function updateCycle(value: string) {
    setCycleFilter(value);
    setCurrentPage(1);
  }

  return (
    <div className="min-h-full bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-7">
      {/* Page heading */}
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <CreditCard size={14} />
            <span>Billing</span>
            <span>/</span>
            <span>Subscriptions</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Subscriptions
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Monitor customer subscriptions, plans, renewals, and billing
            statuses from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={() => exportCsv(filtered)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Metrics */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total subscriptions"
          value={metrics.total.toLocaleString()}
          description="All subscription records"
          icon={Users}
          iconClass="bg-blue-50 text-blue-600"
        />

        <MetricCard
          title="Active subscriptions"
          value={metrics.active.toLocaleString()}
          description="Currently active customers"
          icon={CheckCircle2}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <MetricCard
          title="Monthly recurring revenue"
          value={formatCurrency(metrics.mrr)}
          description="Estimated from active sample plans"
          icon={RefreshCw}
          iconClass="bg-violet-50 text-violet-600"
        />

        <MetricCard
          title="Payment attention"
          value={metrics.pastDue.toLocaleString()}
          description={`${metrics.trialing} subscriptions currently trialing`}
          icon={AlertTriangle}
          iconClass="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Subscription table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                All subscriptions
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Search and filter subscription records.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {filtered.length} records
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => updateSearch(event.target.value)}
                placeholder="Search customer or ID..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="relative">
              <Filter
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={statusFilter}
                onChange={(event) => updateStatus(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-blue-500"
              >
                <option>All statuses</option>
                <option>Active</option>
                <option>Trialing</option>
                <option>Past Due</option>
                <option>Cancelled</option>
                <option>Paused</option>
              </select>
            </div>

            <select
              value={planFilter}
              onChange={(event) => updatePlan(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option>All plans</option>
              <option>Free</option>
              <option>Plus</option>
              <option>Pro</option>
              <option>Business</option>
              <option>Enterprise</option>
            </select>

            <select
              value={cycleFilter}
              onChange={(event) => updateCycle(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option>All cycles</option>
              <option>Monthly</option>
              <option>Yearly</option>
            </select>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Reset filters
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4 font-medium">Customer</th>
                <th className="px-5 py-4 font-medium">Plan</th>
                <th className="px-5 py-4 font-medium">Amount</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Start date</th>
                <th className="px-5 py-4 font-medium">Next billing</th>
                <th className="px-5 py-4 text-right font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {visibleRecords.map((item) => (
                <tr
                  key={item.id}
                  className="transition hover:bg-slate-50/80"
                >
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900">
                      {item.customer}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {item.email}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400">
                      {item.id}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-800">
                      {item.plan}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {item.billingCycle}
                    </div>
                  </td>

                  <td className="px-5 py-4 font-medium text-slate-900">
                    {formatCurrency(item.amount)}
                    <span className="block mt-1 text-xs font-normal text-slate-400">
                      {item.billingCycle === "Yearly" ? "per year" : "per month"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={item.status} />
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {formatDate(item.startDate)}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {formatDate(item.nextBilling)}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(item)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {visibleRecords.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-16 text-center"
                  >
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <Search size={19} />
                    </div>
                    <p className="mt-3 text-sm font-medium text-slate-700">
                      No subscriptions found
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4">
          <p className="text-xs text-slate-500">
            {filtered.length === 0
              ? "Showing 0 records"
              : `Showing ${startIndex + 1}–${Math.min(
                  startIndex + PAGE_SIZE,
                  filtered.length
                )} of ${filtered.length} records`}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="px-2 text-xs font-medium text-slate-600">
              Page {safePage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Subscription details modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="subscription-modal-title"
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2
                  id="subscription-modal-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  Subscription details
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Reference: {selected.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                aria-label="Close details"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    {selected.customer}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {selected.email}
                  </p>
                </div>
                <StatusBadge status={selected.status} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Plan", selected.plan],
                  ["Billing cycle", selected.billingCycle],
                  ["Amount", formatCurrency(selected.amount)],
                  ["Payment method", selected.paymentMethod],
                  ["Start date", formatDate(selected.startDate)],
                  ["Next billing", formatDate(selected.nextBilling)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                  >
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-1 break-words text-sm font-medium text-slate-900">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3">
                <div className="flex items-start gap-2">
                  <CalendarDays
                    size={17}
                    className="mt-0.5 text-blue-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Subscription information
                    </p>
                    <p className="mt-1 text-xs leading-5 text-blue-800">
                      These are illustrative records for the admin interface.
                      Live subscription changes require a connected billing
                      backend and server-side authorization.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <span>ModelNow Admin · Billing workspace</span>
        <span className="inline-flex items-center gap-1.5">
          <ArrowUpRight size={13} />
          Illustrative sample data · Backend integration required
        </span>
      </div>
    </div>
  );
}
