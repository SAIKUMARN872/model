
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Building2,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  DollarSign,
  CalendarDays,
} from "lucide-react";

type EnterpriseStatus =
  | "Active"
  | "Trial"
  | "Past Due"
  | "Suspended"
  | "Cancelled";

type EnterpriseAccount = {
  id: string;
  company: string;
  contactName: string;
  email: string;
  plan: string;
  seats: number;
  monthlyAmount: number;
  currency: string;
  status: EnterpriseStatus;
  billingCycle: "Monthly" | "Annual";
  renewalDate: string;
};

const initialAccounts: EnterpriseAccount[] = [
  {
    id: "ent_001",
    company: "Acme Technologies",
    contactName: "Jordan Lee",
    email: "billing@acme.example",
    plan: "Enterprise Plus",
    seats: 250,
    monthlyAmount: 4999,
    currency: "USD",
    status: "Active",
    billingCycle: "Annual",
    renewalDate: "2027-01-15",
  },
  {
    id: "ent_002",
    company: "Northstar Systems",
    contactName: "Morgan Patel",
    email: "finance@northstar.example",
    plan: "Enterprise",
    seats: 120,
    monthlyAmount: 2499,
    currency: "USD",
    status: "Active",
    billingCycle: "Monthly",
    renewalDate: "2026-11-15",
  },
  {
    id: "ent_003",
    company: "BrightPath Analytics",
    contactName: "Taylor Chen",
    email: "accounts@brightpath.example",
    plan: "Enterprise",
    seats: 85,
    monthlyAmount: 1799,
    currency: "USD",
    status: "Past Due",
    billingCycle: "Monthly",
    renewalDate: "2026-10-25",
  },
  {
    id: "ent_004",
    company: "Vertex Digital",
    contactName: "Alex Morgan",
    email: "finance@vertex.example",
    plan: "Enterprise Plus",
    seats: 400,
    monthlyAmount: 7999,
    currency: "USD",
    status: "Active",
    billingCycle: "Annual",
    renewalDate: "2027-03-01",
  },
  {
    id: "ent_005",
    company: "CloudBridge Labs",
    contactName: "Sam Rivera",
    email: "billing@cloudbridge.example",
    plan: "Enterprise",
    seats: 60,
    monthlyAmount: 999,
    currency: "USD",
    status: "Trial",
    billingCycle: "Monthly",
    renewalDate: "2026-11-20",
  },
  {
    id: "ent_006",
    company: "Summit Data Group",
    contactName: "Jamie Brooks",
    email: "accounts@summit.example",
    plan: "Enterprise",
    seats: 150,
    monthlyAmount: 3299,
    currency: "USD",
    status: "Suspended",
    billingCycle: "Annual",
    renewalDate: "2027-02-10",
  },
  {
    id: "ent_007",
    company: "BlueOak Software",
    contactName: "Casey Kim",
    email: "finance@blueoak.example",
    plan: "Enterprise",
    seats: 95,
    monthlyAmount: 1899,
    currency: "USD",
    status: "Cancelled",
    billingCycle: "Monthly",
    renewalDate: "2026-10-31",
  },
];

const statusStyles: Record<EnterpriseStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Trial: "bg-blue-50 text-blue-700 ring-blue-600/20",
  "Past Due": "bg-amber-50 text-amber-700 ring-amber-600/20",
  Suspended: "bg-rose-50 text-rose-700 ring-rose-600/20",
  Cancelled: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function EnterpriseBillingTable() {
  const [accounts] = useState(initialAccounts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selected, setSelected] = useState<EnterpriseAccount | null>(null);

  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return accounts.filter((account) => {
      const matchesSearch =
        !query ||
        account.company.toLowerCase().includes(query) ||
        account.contactName.toLowerCase().includes(query) ||
        account.email.toLowerCase().includes(query) ||
        account.id.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || account.status === statusFilter;

      const matchesPlan =
        planFilter === "All" || account.plan === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [accounts, search, statusFilter, planFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAccounts.length / pageSize)
  );

  const safePage = Math.min(page, totalPages);

  const visibleAccounts = filteredAccounts.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const activeAccounts = accounts.filter(
    (account) => account.status === "Active"
  );

  const totalSeats = activeAccounts.reduce(
    (total, account) => total + account.seats,
    0
  );

  const monthlyRecurringRevenue = activeAccounts.reduce(
    (total, account) => {
      return (
        total +
        (account.billingCycle === "Annual"
          ? account.monthlyAmount
          : account.monthlyAmount)
      );
    },
    0
  );

  return (
    <section className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Enterprise accounts</p>
            <Building2 size={19} className="text-blue-600" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {accounts.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            All listed enterprise customers
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Active seats</p>
            <Users size={19} className="text-violet-600" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {totalSeats.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Seats across active accounts
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Active account monthly value
            </p>
            <DollarSign size={19} className="text-emerald-600" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {formatCurrency(monthlyRecurringRevenue)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Based on the listed monthly amounts
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Enterprise billing
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Review enterprise plans, seats, and billing dates.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {filteredAccounts.length} accounts
          </span>
        </div>

        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search company, contact, email, or ID..."
              aria-label="Search enterprise accounts"
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            aria-label="Filter enterprise accounts by status"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Trial">Trial</option>
            <option value="Past Due">Past Due</option>
            <option value="Suspended">Suspended</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={planFilter}
            onChange={(event) => {
              setPlanFilter(event.target.value);
              setPage(1);
            }}
            aria-label="Filter enterprise accounts by plan"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="All">All plans</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Enterprise Plus">Enterprise Plus</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 font-medium">Seats</th>
                <th className="px-5 py-3 font-medium">Monthly amount</th>
                <th className="px-5 py-3 font-medium">Billing cycle</th>
                <th className="px-5 py-3 font-medium">Renewal date</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {visibleAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900">
                      {account.company}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {account.contactName}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {account.email}
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-slate-400">
                      {account.id}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-slate-700">
                    {account.plan}
                  </td>

                  <td className="px-5 py-4 text-slate-700">
                    {account.seats.toLocaleString()}
                  </td>

                  <td className="px-5 py-4 font-medium text-slate-900">
                    {formatCurrency(account.monthlyAmount, account.currency)}
                  </td>

                  <td className="px-5 py-4 text-slate-700">
                    {account.billingCycle}
                  </td>

                  <td className="px-5 py-4 text-slate-700">
                    <div className="flex items-center gap-2">
                      <CalendarDays
                        size={15}
                        className="text-slate-400"
                      />
                      {formatDate(account.renewalDate)}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[account.status]}`}
                    >
                      {account.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(account)}
                      aria-label={`View billing details for ${account.company}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      <Eye size={15} />
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {visibleAccounts.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <Building2
                      size={26}
                      className="mx-auto text-slate-300"
                    />
                    <p className="mt-3 font-medium text-slate-800">
                      No enterprise accounts found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Change your filters or search for another account.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Rows per page</span>
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              aria-label="Rows per page"
              className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>

            <span>
              {filteredAccounts.length === 0
                ? "0 results"
                : `${(safePage - 1) * pageSize + 1}–${Math.min(
                    safePage * pageSize,
                    filteredAccounts.length
                  )} of ${filteredAccounts.length}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.max(1, current - 1))
              }
              disabled={safePage <= 1}
              aria-label="Previous page"
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={17} />
            </button>

            <span className="min-w-16 text-center text-sm text-slate-600">
              Page {safePage} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              disabled={safePage >= totalPages}
              aria-label="Next page"
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="enterprise-details-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Enterprise account
                </p>
                <h2
                  id="enterprise-details-title"
                  className="mt-1 text-xl font-semibold text-slate-900"
                >
                  {selected.company}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selected.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close enterprise account details"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Monthly amount</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {formatCurrency(
                  selected.monthlyAmount,
                  selected.currency
                )}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Displayed monthly amount; verify annual billing conventions
                with your backend before using this as recognized MRR.
              </p>
            </div>

            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Billing contact</dt>
                <dd className="text-right font-medium text-slate-800">
                  {selected.contactName}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Email</dt>
                <dd className="break-all text-right text-slate-800">
                  {selected.email}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Plan</dt>
                <dd className="text-right text-slate-800">
                  {selected.plan}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Seats</dt>
                <dd className="text-right text-slate-800">
                  {selected.seats.toLocaleString()}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Billing cycle</dt>
                <dd className="text-right text-slate-800">
                  {selected.billingCycle}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Renewal date</dt>
                <dd className="text-right text-slate-800">
                  {formatDate(selected.renewalDate)}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Status</dt>
                <dd>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[selected.status]}`}
                  >
                    {selected.status}
                  </span>
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs leading-5 text-slate-500">
        Demo records only. This component currently displays local sample data
        and does not retrieve or change live customer subscriptions.
      </p>
    </section>
  );
}
