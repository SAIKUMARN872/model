"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Coins,
  Users,
  Activity,
  TrendingUp,
  Search,
  Download,
  Plus,
  X,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";

type CreditStatus = "Healthy" | "Low Credits" | "Exhausted";

type CreditAccount = {
  id: string;
  customer: string;
  email: string;
  plan: string;
  allocated: number;
  used: number;
  updated: string;
};

const initialAccounts: CreditAccount[] = [
  {
    id: "CR-1001",
    customer: "Ananya Sharma",
    email: "ananya@example.com",
    plan: "Plus",
    allocated: 10000,
    used: 4200,
    updated: "2026-11-02",
  },
  {
    id: "CR-1002",
    customer: "Rahul Verma",
    email: "rahul@example.com",
    plan: "Pro",
    allocated: 50000,
    used: 41200,
    updated: "2026-11-02",
  },
  {
    id: "CR-1003",
    customer: "Priya Reddy",
    email: "priya@example.com",
    plan: "Free",
    allocated: 1000,
    used: 850,
    updated: "2026-11-01",
  },
  {
    id: "CR-1004",
    customer: "Arjun Kumar",
    email: "arjun@example.com",
    plan: "Enterprise",
    allocated: 200000,
    used: 175000,
    updated: "2026-11-01",
  },
  {
    id: "CR-1005",
    customer: "Sneha Patel",
    email: "sneha@example.com",
    plan: "Plus",
    allocated: 10000,
    used: 2200,
    updated: "2026-10-31",
  },
  {
    id: "CR-1006",
    customer: "Vikram Rao",
    email: "vikram@example.com",
    plan: "Pro",
    allocated: 50000,
    used: 50000,
    updated: "2026-10-31",
  },
  {
    id: "CR-1007",
    customer: "Meera Nair",
    email: "meera@example.com",
    plan: "Free",
    allocated: 1000,
    used: 300,
    updated: "2026-10-30",
  },
];

function getStatus(account: CreditAccount): CreditStatus {
  if (account.used >= account.allocated) return "Exhausted";

  const remaining = account.allocated - account.used;
  const remainingPercentage = (remaining / account.allocated) * 100;

  return remainingPercentage <= 20 ? "Low Credits" : "Healthy";
}

const statusStyles: Record<CreditStatus, string> = {
  Healthy: "bg-emerald-50 text-emerald-700",
  "Low Credits": "bg-amber-50 text-amber-700",
  Exhausted: "bg-red-50 text-red-700",
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-IN").format(value);

const formatDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function CreditsUsagePage() {
  const router = useRouter();

  const [accounts, setAccounts] = useState<CreditAccount[]>(initialAccounts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAllocateForm, setShowAllocateForm] = useState(false);
  const [selectedAccount, setSelectedAccount] =
    useState<CreditAccount | null>(null);
  const [selectedId, setSelectedId] = useState(initialAccounts[0].id);
  const [allocationAmount, setAllocationAmount] = useState("1000");
  const [formError, setFormError] = useState("");

  const totalAllocated = accounts.reduce(
    (sum, account) => sum + account.allocated,
    0
  );

  const totalUsed = accounts.reduce((sum, account) => sum + account.used, 0);

  const totalRemaining = totalAllocated - totalUsed;

  const lowCreditCount = accounts.filter(
    (account) => getStatus(account) === "Low Credits"
  ).length;

  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return accounts.filter((account) => {
      const matchesSearch =
        !query ||
        account.id.toLowerCase().includes(query) ||
        account.customer.toLowerCase().includes(query) ||
        account.email.toLowerCase().includes(query) ||
        account.plan.toLowerCase().includes(query);

      const status = getStatus(account);
      const matchesStatus =
        statusFilter === "All" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [accounts, search, statusFilter]);

  function exportCSV() {
    const headers = [
      "Account ID",
      "Customer",
      "Email",
      "Plan",
      "Allocated Credits",
      "Used Credits",
      "Remaining Credits",
      "Usage Percentage",
      "Status",
      "Last Updated",
    ];

    const rows = filteredAccounts.map((account) => {
      const remaining = Math.max(account.allocated - account.used, 0);
      const usage = account.allocated
        ? ((account.used / account.allocated) * 100).toFixed(1)
        : "0";

      return [
        account.id,
        account.customer,
        account.email,
        account.plan,
        String(account.allocated),
        String(account.used),
        String(remaining),
        `${usage}%`,
        getStatus(account),
        account.updated,
      ];
    });

    const escapeCSV = (value: string) => `"${value.replace(/"/g, '""')}"`;

    const csv = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "modelnow-credits-usage.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  function allocateCredits(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const amount = Number(allocationAmount);

    if (
      allocationAmount.trim() === "" ||
      !Number.isSafeInteger(amount) ||
      amount <= 0
    ) {
      setFormError("Enter a valid positive whole number of credits.");
      return;
    }

    setAccounts((current) =>
      current.map((account) =>
        account.id === selectedId
          ? {
              ...account,
              allocated: account.allocated + amount,
              updated: new Date().toLocaleDateString("en-CA"),
            }
          : account
      )
    );

    setShowAllocateForm(false);
    setAllocationAmount("1000");
  }

  const summaryCards = [
    {
      title: "Total Allocated",
      value: formatNumber(totalAllocated),
      subtitle: "Credits assigned to accounts",
      icon: Coins,
      iconStyle: "bg-blue-50 text-blue-600",
    },
    {
      title: "Credits Used",
      value: formatNumber(totalUsed),
      subtitle: "Consumed across all accounts",
      icon: Activity,
      iconStyle: "bg-violet-50 text-violet-600",
    },
    {
      title: "Credits Remaining",
      value: formatNumber(totalRemaining),
      subtitle: "Available within current allocations",
      icon: TrendingUp,
      iconStyle: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Low-Credit Accounts",
      value: formatNumber(lowCreditCount),
      subtitle: "May need additional credits",
      icon: AlertTriangle,
      iconStyle: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <main className="min-h-screen space-y-7 bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <button
            type="button"
            onClick={() => router.push("/billing")}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
          >
            <ArrowLeft size={16} />
            Back to Billing
          </button>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Credits & Usage
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Monitor credit allocations, consumption, remaining balances, and
            usage across ModelNow accounts.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download size={16} />
            Export CSV
          </button>

          <button
            type="button"
            onClick={() => {
              setFormError("");
              setShowAllocateForm(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={17} />
            Allocate credits
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>
                  <p className="mt-3 text-2xl font-bold">{card.value}</p>
                </div>

                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconStyle}`}
                >
                  <Icon size={21} />
                </span>
              </div>

              <p className="mt-3 text-xs text-slate-500">{card.subtitle}</p>
            </article>
          );
        })}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold">Credit consumption</h2>
            <p className="mt-1 text-sm text-slate-500">
              Overall allocation and consumption across all listed accounts.
            </p>
          </div>

          <span className="text-sm font-semibold text-slate-700">
            {totalAllocated > 0
              ? ((totalUsed / totalAllocated) * 100).toFixed(1)
              : "0"}
            % used
          </span>
        </div>

        <div
          className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-label="Overall credit consumption"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={
            totalAllocated > 0
              ? Math.min((totalUsed / totalAllocated) * 100, 100)
              : 0
          }
        >
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{
              width: `${
                totalAllocated > 0
                  ? Math.min((totalUsed / totalAllocated) * 100, 100)
                  : 0
              }%`,
            }}
          />
        </div>

        <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-slate-500">
          <span>{formatNumber(totalUsed)} credits used</span>
          <span>{formatNumber(totalRemaining)} credits remaining</span>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold">Account usage</h2>
            <p className="mt-1 text-sm text-slate-500">
              Review credit balances and usage by customer.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search accounts..."
                aria-label="Search credit accounts"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter accounts by credit status"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All statuses</option>
              <option value="Healthy">Healthy</option>
              <option value="Low Credits">Low Credits</option>
              <option value="Exhausted">Exhausted</option>
            </select>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Account</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Allocated</th>
                <th className="px-4 py-3 font-semibold">Used</th>
                <th className="px-4 py-3 font-semibold">Remaining</th>
                <th className="px-4 py-3 font-semibold">Usage</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.map((account) => {
                const remaining = Math.max(
                  account.allocated - account.used,
                  0
                );

                const usagePercentage =
                  account.allocated > 0
                    ? Math.min((account.used / account.allocated) * 100, 100)
                    : 0;

                const status = getStatus(account);

                return (
                  <tr key={account.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-slate-800">
                        {account.customer}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {account.email}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {account.id}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      {account.plan}
                    </td>

                    <td className="px-4 py-4 text-sm font-medium">
                      {formatNumber(account.allocated)}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      {formatNumber(account.used)}
                    </td>

                    <td className="px-4 py-4 text-sm font-semibold text-slate-800">
                      {formatNumber(remaining)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${
                              usagePercentage >= 90
                                ? "bg-red-500"
                                : usagePercentage >= 70
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                            }`}
                            style={{ width: `${usagePercentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">
                          {usagePercentage.toFixed(0)}%
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
                      >
                        {status}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedAccount(account)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredAccounts.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    No accounts match your search or selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
          Showing {filteredAccounts.length} of {accounts.length} accounts
        </div>
      </section>

      {showAllocateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <form
            onSubmit={allocateCredits}
            className="w-full max-w-md space-y-5 rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Allocate credits</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add credits to a customer&apos;s existing allocation.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAllocateForm(false)}
                aria-label="Close allocation form"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Customer account
              </label>

              <select
                value={selectedId}
                onChange={(event) => setSelectedId(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.customer} — {account.id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Additional credits
              </label>

              <input
                type="number"
                min="1"
                step="1"
                required
                value={allocationAmount}
                onChange={(event) => setAllocationAmount(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {formError && (
              <p role="alert" className="text-sm text-red-600">
                {formError}
              </p>
            )}

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowAllocateForm(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Allocate
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedAccount && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onClick={() => setSelectedAccount(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="credit-details-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Credit account
                </p>
                <h2
                  id="credit-details-title"
                  className="mt-1 text-xl font-bold"
                >
                  {selectedAccount.customer}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAccount(null)}
                aria-label="Close account details"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Remaining credits</p>
              <p className="mt-1 text-3xl font-bold">
                {formatNumber(
                  Math.max(
                    selectedAccount.allocated - selectedAccount.used,
                    0
                  )
                )}
              </p>
              <span
                className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[getStatus(selectedAccount)]}`}
              >
                {getStatus(selectedAccount)}
              </span>
            </div>

            <dl className="mt-5 space-y-3">
              {[
                ["Account ID", selectedAccount.id],
                ["Email", selectedAccount.email],
                ["Subscription plan", selectedAccount.plan],
                ["Allocated credits", formatNumber(selectedAccount.allocated)],
                ["Used credits", formatNumber(selectedAccount.used)],
                ["Last updated", formatDate(selectedAccount.updated)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3"
                >
                  <dt className="text-sm text-slate-500">{label}</dt>
                  <dd className="text-right text-sm font-medium text-slate-800">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            <button
              type="button"
              onClick={() => setSelectedAccount(null)}
              className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Done
            </button>
          </section>
        </div>
      )}

      <footer className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Users size={18} />
        </span>

        <div>
          <p className="text-sm font-semibold text-slate-800">
            Credit usage data
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            This page uses sample account data and temporary frontend state.
            Credit allocation and consumption must be validated and stored by
            the backend before use with real customer accounts.
          </p>
        </div>
      </footer>
    </main>
  );
}