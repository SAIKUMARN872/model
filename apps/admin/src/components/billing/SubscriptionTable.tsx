
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
} from "lucide-react";

type SubscriptionStatus =
  | "Active"
  | "Trial"
  | "Past Due"
  | "Cancelled";

type Subscription = {
  id: string;
  customer: string;
  email: string;
  plan: string;
  amount: number;
  interval: "Monthly" | "Yearly";
  status: SubscriptionStatus;
  nextBilling: string;
};

const initialSubscriptions: Subscription[] = [
  {
    id: "SUB-1001",
    customer: "Aarav Sharma",
    email: "aarav@example.com",
    plan: "ModelNow Pro",
    amount: 49,
    interval: "Monthly",
    status: "Active",
    nextBilling: "Nov 12, 2026",
  },
  {
    id: "SUB-1002",
    customer: "Priya Reddy",
    email: "priya@example.com",
    plan: "ModelNow Plus",
    amount: 19,
    interval: "Monthly",
    status: "Active",
    nextBilling: "Nov 15, 2026",
  },
  {
    id: "SUB-1003",
    customer: "Daniel Wilson",
    email: "daniel@example.com",
    plan: "ModelNow Enterprise",
    amount: 499,
    interval: "Monthly",
    status: "Active",
    nextBilling: "Nov 18, 2026",
  },
  {
    id: "SUB-1004",
    customer: "Sneha Kumar",
    email: "sneha@example.com",
    plan: "ModelNow Plus",
    amount: 19,
    interval: "Monthly",
    status: "Trial",
    nextBilling: "Nov 20, 2026",
  },
  {
    id: "SUB-1005",
    customer: "Michael Brown",
    email: "michael@example.com",
    plan: "ModelNow Pro",
    amount: 49,
    interval: "Monthly",
    status: "Past Due",
    nextBilling: "Oct 28, 2026",
  },
  {
    id: "SUB-1006",
    customer: "Ananya Rao",
    email: "ananya@example.com",
    plan: "ModelNow Plus",
    amount: 190,
    interval: "Yearly",
    status: "Active",
    nextBilling: "Dec 03, 2026",
  },
  {
    id: "SUB-1007",
    customer: "James Miller",
    email: "james@example.com",
    plan: "ModelNow Pro",
    amount: 49,
    interval: "Monthly",
    status: "Cancelled",
    nextBilling: "—",
  },
  {
    id: "SUB-1008",
    customer: "Kavya Reddy",
    email: "kavya@example.com",
    plan: "ModelNow Plus",
    amount: 19,
    interval: "Monthly",
    status: "Active",
    nextBilling: "Dec 08, 2026",
  },
  {
    id: "SUB-1009",
    customer: "Oliver Smith",
    email: "oliver@example.com",
    plan: "ModelNow Pro",
    amount: 490,
    interval: "Yearly",
    status: "Active",
    nextBilling: "Jan 02, 2027",
  },
  {
    id: "SUB-1010",
    customer: "Meera Patel",
    email: "meera@example.com",
    plan: "ModelNow Plus",
    amount: 19,
    interval: "Monthly",
    status: "Trial",
    nextBilling: "Nov 25, 2026",
  },
];

const statusStyles: Record<SubscriptionStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Trial: "bg-blue-50 text-blue-700",
  "Past Due": "bg-amber-50 text-amber-700",
  Cancelled: "bg-slate-100 text-slate-600",
};

type SubscriptionTableProps = {
  subscriptions?: Subscription[];
  pageSize?: number;
  onViewSubscription?: (subscription: Subscription) => void;
};

export default function SubscriptionTable({
  subscriptions = initialSubscriptions,
  pageSize = 5,
  onViewSubscription,
}: SubscriptionTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);

  const filteredSubscriptions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return subscriptions.filter((subscription) => {
      const matchesSearch =
        !query ||
        subscription.id.toLowerCase().includes(query) ||
        subscription.customer.toLowerCase().includes(query) ||
        subscription.email.toLowerCase().includes(query) ||
        subscription.plan.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        subscription.status === statusFilter;

      const matchesPlan =
        planFilter === "All" ||
        subscription.plan === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [subscriptions, search, statusFilter, planFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSubscriptions.length / pageSize),
  );

  const safePage = Math.min(currentPage, totalPages);

  const pageSubscriptions = filteredSubscriptions.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const activeCount = subscriptions.filter(
    (subscription) => subscription.status === "Active",
  ).length;

  const formatAmount = (amount: number) =>
    `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

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

  function viewSubscription(subscription: Subscription) {
    if (onViewSubscription) {
      onViewSubscription(subscription);
    } else {
      setSelectedSubscription(subscription);
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Subscriptions
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage customer plans, billing cycles, and subscription status.
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
          <span className="text-slate-500">Active </span>
          <span className="font-semibold text-slate-900">
            {activeCount}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => updateSearch(event.target.value)}
            placeholder="Search customer, email, plan, or ID..."
            aria-label="Search subscriptions"
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(event) => updateStatus(event.target.value)}
            aria-label="Filter by subscription status"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Trial">Trial</option>
            <option value="Past Due">Past Due</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={planFilter}
            onChange={(event) => updatePlan(event.target.value)}
            aria-label="Filter by subscription plan"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="All">All plans</option>
            <option value="ModelNow Plus">ModelNow Plus</option>
            <option value="ModelNow Pro">ModelNow Pro</option>
            <option value="ModelNow Enterprise">
              ModelNow Enterprise
            </option>
          </select>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3.5 font-medium">Customer</th>
              <th className="px-5 py-3.5 font-medium">Plan</th>
              <th className="px-5 py-3.5 font-medium">Amount</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5 font-medium">Next billing</th>
              <th className="px-5 py-3.5 text-right font-medium">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {pageSubscriptions.map((subscription) => (
              <tr
                key={subscription.id}
                className="transition hover:bg-slate-50/70"
              >
                <td className="px-5 py-4">
                  <div className="font-medium text-slate-900">
                    {subscription.customer}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {subscription.email}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    {subscription.id}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="font-medium text-slate-800">
                    {subscription.plan}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {subscription.interval}
                  </div>
                </td>

                <td className="px-5 py-4 font-medium text-slate-800">
                  {formatAmount(subscription.amount)}
                  <span className="ml-1 text-xs font-normal text-slate-500">
                    /{subscription.interval === "Yearly" ? "year" : "month"}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[subscription.status]}`}
                  >
                    {subscription.status}
                  </span>
                </td>

                <td className="px-5 py-4 text-slate-600">
                  {subscription.nextBilling}
                </td>

                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => viewSubscription(subscription)}
                    aria-label={`View ${subscription.customer}'s subscription`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Eye size={14} />
                    View
                  </button>
                </td>
              </tr>
            ))}

            {pageSubscriptions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center">
                  <div className="text-sm font-medium text-slate-700">
                    No subscriptions found
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Try changing your search or filters.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("All");
                      setPlanFilter("All");
                      setCurrentPage(1);
                    }}
                    className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Clear filters
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
        <p className="text-sm text-slate-500">
          Showing{" "}
          {filteredSubscriptions.length === 0
            ? 0
            : (safePage - 1) * pageSize + 1}
          {"–"}
          {Math.min(safePage * pageSize, filteredSubscriptions.length)} of{" "}
          {filteredSubscriptions.length} subscriptions
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            aria-label="Previous page"
            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={17} />
          </button>

          <span className="px-2 text-sm text-slate-600">
            Page {safePage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            aria-label="Next page"
            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      {selectedSubscription && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onClick={() => setSelectedSubscription(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="subscription-dialog-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3
                  id="subscription-dialog-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  Subscription details
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedSubscription.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSubscription(null)}
                aria-label="Close subscription details"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                ["Customer", selectedSubscription.customer],
                ["Email", selectedSubscription.email],
                ["Plan", selectedSubscription.plan],
                ["Billing cycle", selectedSubscription.interval],
                ["Amount", formatAmount(selectedSubscription.amount)],
                ["Status", selectedSubscription.status],
                ["Next billing", selectedSubscription.nextBilling],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg bg-slate-50 p-3"
                >
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSubscription(null)}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
