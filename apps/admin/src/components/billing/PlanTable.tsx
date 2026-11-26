
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Plus,
  Check,
} from "lucide-react";

type PlanStatus = "Active" | "Draft" | "Archived";
type BillingInterval = "Monthly" | "Yearly";

type BillingPlan = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: BillingInterval;
  subscribers: number;
  status: PlanStatus;
  features: string[];
};

const samplePlans: BillingPlan[] = [
  {
    id: "PLAN-001",
    name: "ModelNow Free",
    description: "Explore essential AI capabilities.",
    price: 0,
    currency: "USD",
    interval: "Monthly",
    subscribers: 4820,
    status: "Active",
    features: [
      "Limited AI requests",
      "Standard models",
      "Community support",
    ],
  },
  {
    id: "PLAN-002",
    name: "ModelNow Plus",
    description: "For individuals using AI every day.",
    price: 19,
    currency: "USD",
    interval: "Monthly",
    subscribers: 842,
    status: "Active",
    features: [
      "Higher usage limits",
      "Access to advanced models",
      "Knowledge Hub",
    ],
  },
  {
    id: "PLAN-003",
    name: "ModelNow Pro",
    description: "For power users and professionals.",
    price: 49,
    currency: "USD",
    interval: "Monthly",
    subscribers: 316,
    status: "Active",
    features: [
      "Priority model routing",
      "Advanced AI workflows",
      "Higher usage limits",
    ],
  },
  {
    id: "PLAN-004",
    name: "ModelNow Enterprise",
    description: "AI infrastructure for organizations.",
    price: 499,
    currency: "USD",
    interval: "Monthly",
    subscribers: 42,
    status: "Active",
    features: [
      "Team administration",
      "Enterprise analytics",
      "Priority support",
    ],
  },
  {
    id: "PLAN-005",
    name: "ModelNow Plus Annual",
    description: "Annual billing for Plus members.",
    price: 190,
    currency: "USD",
    interval: "Yearly",
    subscribers: 124,
    status: "Active",
    features: [
      "All Plus features",
      "Annual billing",
      "Priority account assistance",
    ],
  },
  {
    id: "PLAN-006",
    name: "Early Access",
    description: "A plan being prepared for launch.",
    price: 29,
    currency: "USD",
    interval: "Monthly",
    subscribers: 0,
    status: "Draft",
    features: [
      "Early access features",
      "Limited beta availability",
    ],
  },
];

const statusStyles: Record<PlanStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Draft: "bg-amber-50 text-amber-700",
  Archived: "bg-slate-100 text-slate-600",
};

type PlanTableProps = {
  plans?: BillingPlan[];
  pageSize?: number;
  onCreatePlan?: () => void;
  onViewPlan?: (plan: BillingPlan) => void;
};

export default function PlanTable({
  plans = samplePlans,
  pageSize = 5,
  onCreatePlan,
  onViewPlan,
}: PlanTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [intervalFilter, setIntervalFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPlan, setSelectedPlan] =
    useState<BillingPlan | null>(null);

  const filteredPlans = useMemo(() => {
    const query = search.trim().toLowerCase();

    return plans.filter((plan) => {
      const matchesSearch =
        !query ||
        plan.id.toLowerCase().includes(query) ||
        plan.name.toLowerCase().includes(query) ||
        plan.description.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || plan.status === statusFilter;

      const matchesInterval =
        intervalFilter === "All" || plan.interval === intervalFilter;

      return matchesSearch && matchesStatus && matchesInterval;
    });
  }, [plans, search, statusFilter, intervalFilter]);

  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredPlans.length / safePageSize),
  );
  const safePage = Math.min(currentPage, totalPages);

  const pagePlans = filteredPlans.slice(
    (safePage - 1) * safePageSize,
    safePage * safePageSize,
  );

  const activePlans = plans.filter(
    (plan) => plan.status === "Active",
  ).length;

  const totalSubscribers = plans
    .filter((plan) => plan.status === "Active")
    .reduce((total, plan) => total + plan.subscribers, 0);

  function formatPrice(plan: BillingPlan) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: plan.currency,
      maximumFractionDigits: 2,
    }).format(plan.price);
  }

  function openPlan(plan: BillingPlan) {
    if (onViewPlan) {
      onViewPlan(plan);
    } else {
      setSelectedPlan(plan);
    }
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("All");
    setIntervalFilter("All");
    setCurrentPage(1);
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Billing plans
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage subscription tiers, pricing, and plan availability.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreatePlan}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus size={17} />
          Create plan
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 border-b border-slate-100 p-4 sm:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Total plans</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {plans.length}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Active plans</p>
          <p className="mt-1 text-xl font-semibold text-emerald-700">
            {activePlans}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">
            Subscribers across active plans
          </p>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {totalSubscribers.toLocaleString("en-US")}
          </p>
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
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search plans..."
            aria-label="Search billing plans"
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter plans by status"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>

          <select
            value={intervalFilter}
            onChange={(event) => {
              setIntervalFilter(event.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter plans by billing interval"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="All">All intervals</option>
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </select>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3.5 font-medium">Plan</th>
              <th className="px-5 py-3.5 font-medium">Price</th>
              <th className="px-5 py-3.5 font-medium">Subscribers</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5 font-medium">Plan ID</th>
              <th className="px-5 py-3.5 text-right font-medium">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {pagePlans.map((plan) => (
              <tr
                key={plan.id}
                className="transition hover:bg-slate-50/70"
              >
                <td className="px-5 py-4">
                  <div className="font-medium text-slate-900">
                    {plan.name}
                  </div>
                  <div className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                    {plan.description}
                  </div>
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <span className="font-semibold text-slate-900">
                    {formatPrice(plan)}
                  </span>
                  <span className="ml-1 text-xs text-slate-500">
                    /{plan.interval === "Yearly" ? "year" : "month"}
                  </span>
                </td>

                <td className="px-5 py-4 font-medium text-slate-700">
                  {plan.subscribers.toLocaleString("en-US")}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[plan.status]}`}
                  >
                    {plan.status}
                  </span>
                </td>

                <td className="px-5 py-4 text-xs text-slate-500">
                  {plan.id}
                </td>

                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => openPlan(plan)}
                    aria-label={`View ${plan.name}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Eye size={14} />
                    View
                  </button>
                </td>
              </tr>
            ))}

            {pagePlans.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    No plans found
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Try changing your search or filters.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
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
          {filteredPlans.length === 0
            ? 0
            : (safePage - 1) * safePageSize + 1}
          {"–"}
          {Math.min(safePage * safePageSize, filteredPlans.length)} of{" "}
          {filteredPlans.length} plans
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() =>
              setCurrentPage((page) => Math.max(1, page - 1))
            }
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
              setCurrentPage((page) =>
                Math.min(totalPages, page + 1),
              )
            }
            aria-label="Next page"
            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      {selectedPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onClick={() => setSelectedPlan(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-dialog-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3
                  id="plan-dialog-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  {selectedPlan.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedPlan.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                aria-label="Close plan details"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              {selectedPlan.description}
            </p>

            <div className="mt-4 rounded-xl bg-blue-50 p-4">
              <p className="text-sm text-blue-700">Plan price</p>
              <p className="mt-1 text-2xl font-semibold text-blue-950">
                {formatPrice(selectedPlan)}
                <span className="ml-1 text-sm font-normal">
                  /{selectedPlan.interval === "Yearly" ? "year" : "month"}
                </span>
              </p>
            </div>

            <div className="mt-5">
              <h4 className="text-sm font-semibold text-slate-900">
                Included features
              </h4>

              <ul className="mt-3 space-y-2">
                {selectedPlan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <Check
                      size={17}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-lg border border-slate-100 p-3">
              <span className="text-sm text-slate-500">
                Subscribers
              </span>
              <span className="text-sm font-semibold text-slate-900">
                {selectedPlan.subscribers.toLocaleString("en-US")}
              </span>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
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
