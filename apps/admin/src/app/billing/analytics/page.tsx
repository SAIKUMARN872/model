"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  CreditCard,
  IndianRupee,
  RefreshCw,
  Download,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Wallet,
} from "lucide-react";

type Period = "7 days" | "30 days" | "90 days" | "12 months";

type MonthData = {
  month: string;
  revenue: number;
  previous: number;
  payments: number;
  refunds: number;
};

const monthlyData: MonthData[] = [
  { month: "Dec", revenue: 82000, previous: 67000, payments: 112, refunds: 4000 },
  { month: "Jan", revenue: 96000, previous: 74000, payments: 128, refunds: 3500 },
  { month: "Feb", revenue: 88000, previous: 79000, payments: 119, refunds: 5200 },
  { month: "Mar", revenue: 124000, previous: 92000, payments: 161, refunds: 6100 },
  { month: "Apr", revenue: 116000, previous: 98000, payments: 154, refunds: 4800 },
  { month: "May", revenue: 143000, previous: 108000, payments: 183, refunds: 7200 },
  { month: "Jun", revenue: 132000, previous: 113000, payments: 174, refunds: 5500 },
  { month: "Jul", revenue: 159000, previous: 124000, payments: 207, refunds: 6900 },
  { month: "Aug", revenue: 151000, previous: 132000, payments: 198, refunds: 8200 },
  { month: "Sep", revenue: 178000, previous: 144000, payments: 229, refunds: 7400 },
  { month: "Oct", revenue: 194000, previous: 158000, payments: 251, refunds: 9100 },
  { month: "Nov", revenue: 213000, previous: 171000, payments: 276, refunds: 8600 },
];

const recentTransactions = [
  {
    id: "PAY-2026-1051",
    customer: "Ananya Sharma",
    plan: "ModelNow Pro",
    amount: 4999,
    date: "2026-11-02",
    status: "Succeeded",
  },
  {
    id: "PAY-2026-1050",
    customer: "Rahul Verma",
    plan: "ModelNow Plus",
    amount: 999,
    date: "2026-11-02",
    status: "Succeeded",
  },
  {
    id: "PAY-2026-1048",
    customer: "Priya Reddy",
    plan: "ModelNow Pro",
    amount: 4999,
    date: "2026-11-02",
    status: "Failed",
  },
  {
    id: "PAY-2026-1047",
    customer: "Kiran Kumar",
    plan: "ModelNow Plus",
    amount: 999,
    date: "2026-11-01",
    status: "Pending",
  },
  {
    id: "PAY-2026-1046",
    customer: "Meera Joshi",
    plan: "ModelNow Pro",
    amount: 4999,
    date: "2026-11-01",
    status: "Succeeded",
  },
];

const planData = [
  { name: "ModelNow Pro", revenue: 52, amount: 1107600 },
  { name: "ModelNow Plus", revenue: 29, amount: 617700 },
  { name: "Enterprise", revenue: 19, amount: 404700 },
];

const currency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const compactCurrency = (amount: number) => {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(amount >= 1000000 ? 0 : 1)}L`;
  }
  if (amount >= 1000) return `₹${Math.round(amount / 1000)}K`;
  return `₹${amount}`;
};

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function BillingAnalyticsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("12 months");
  const [transactionFilter, setTransactionFilter] = useState("All");

  const visibleMonths = useMemo(() => {
    if (period === "7 days") return monthlyData.slice(-1);
    if (period === "30 days") return monthlyData.slice(-2);
    if (period === "90 days") return monthlyData.slice(-3);
    return monthlyData;
  }, [period]);

  const revenueTotal = visibleMonths.reduce(
    (sum, month) => sum + month.revenue,
    0,
  );

  const previousTotal = visibleMonths.reduce(
    (sum, month) => sum + month.previous,
    0,
  );

  const growth =
    previousTotal > 0
      ? ((revenueTotal - previousTotal) / previousTotal) * 100
      : 0;

  const paymentTotal = visibleMonths.reduce(
    (sum, month) => sum + month.payments,
    0,
  );

  const refundTotal = visibleMonths.reduce(
    (sum, month) => sum + month.refunds,
    0,
  );

  const transactions = recentTransactions.filter(
    (transaction) =>
      transactionFilter === "All" ||
      transaction.status === transactionFilter,
  );

  function exportCSV() {
    const headers = [
      "Payment ID",
      "Customer",
      "Plan",
      "Amount INR",
      "Date",
      "Status",
    ];

    const rows = transactions.map((transaction) => [
      transaction.id,
      transaction.customer,
      transaction.plan,
      transaction.amount,
      transaction.date,
      transaction.status,
    ]);

    const escapeCSV = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-billing-analytics.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <button
              onClick={() => router.push("/billing")}
              aria-label="Back to billing"
              className="mt-1 rounded-xl border border-slate-200 bg-white p-2.5 transition hover:bg-slate-100"
            >
              <ArrowLeft size={19} />
            </button>

            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>Billing</span>
                <span>/</span>
                <span className="text-blue-600">Analytics</span>
              </div>

              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Billing Analytics
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Understand revenue, payments, subscriptions, and refunds.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value as Period)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400"
              aria-label="Analytics period"
            >
              <option value="7 days">Last 7 days</option>
              <option value="30 days">Last 30 days</option>
              <option value="90 days">Last 90 days</option>
              <option value="12 months">Last 12 months</option>
            </select>

            <button
              onClick={exportCSV}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Download size={17} />
              Export CSV
            </button>
          </div>
        </header>

        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <CalendarDays size={18} className="mt-0.5 shrink-0 text-blue-600" />
          <p className="text-sm leading-6 text-blue-900">
            <strong>Selected period:</strong> {period}. The visualizations
            below use illustrative sample records. The short-period selections
            show the latest available sample buckets, not live daily totals.
          </p>
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Revenue"
            value={currency(revenueTotal)}
            subtitle={`${growth >= 0 ? "+" : ""}${growth.toFixed(1)}% vs. comparison data`}
            icon={<IndianRupee size={20} />}
            iconClass="bg-blue-50 text-blue-600"
            trend={growth >= 0 ? "up" : "down"}
          />

          <MetricCard
            title="Payment Transactions"
            value={paymentTotal.toLocaleString("en-IN")}
            subtitle="Recorded successful transactions"
            icon={<CreditCard size={20} />}
            iconClass="bg-violet-50 text-violet-600"
          />

          <MetricCard
            title="Refund Amount"
            value={currency(refundTotal)}
            subtitle="Recorded refund sample"
            icon={<RefreshCw size={20} />}
            iconClass="bg-amber-50 text-amber-600"
          />

          <MetricCard
            title="Average Revenue per Payment"
            value={currency(paymentTotal ? revenueTotal / paymentTotal : 0)}
            subtitle="Revenue divided by transaction count"
            icon={<Wallet size={20} />}
            iconClass="bg-emerald-50 text-emerald-600"
          />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-semibold">Revenue trend</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Revenue and comparison values by sample period
                </p>
              </div>
              <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                {period}
              </span>
            </div>

            <div className="mt-7 flex h-64 items-end gap-2 border-b border-l border-slate-200 px-2 pb-0 pt-4 sm:gap-4">
              {visibleMonths.map((item) => {
                const max = Math.max(
                  ...visibleMonths.map((month) =>
                    Math.max(month.revenue, month.previous),
                  ),
                );

                const revenueHeight = (item.revenue / max) * 100;
                const previousHeight = (item.previous / max) * 100;

                return (
                  <div
                    key={item.month}
                    className="flex h-full min-w-0 flex-1 flex-col justify-end"
                  >
                    <div className="flex h-full items-end justify-center gap-1">
                      <div
                        title={`${item.month}: ${currency(item.previous)} comparison`}
                        className="w-2/5 max-w-8 rounded-t-md bg-slate-300 transition-all sm:w-1/3"
                        style={{ height: `${previousHeight}%` }}
                      />
                      <div
                        title={`${item.month}: ${currency(item.revenue)} revenue`}
                        className="w-2/5 max-w-8 rounded-t-md bg-blue-600 transition-all sm:w-1/3"
                        style={{ height: `${revenueHeight}%` }}
                      />
                    </div>
                    <span className="mt-2 truncate text-center text-xs text-slate-500">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-5 text-xs text-slate-600">
              <Legend color="bg-blue-600" label="Revenue" />
              <Legend color="bg-slate-300" label="Comparison" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold">Revenue by plan</h2>
            <p className="mt-1 text-sm text-slate-500">
              Illustrative plan revenue distribution
            </p>

            <div className="mt-6 space-y-6">
              {planData.map((plan) => (
                <div key={plan.name}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">{plan.name}</span>
                    <span className="text-sm font-semibold">
                      {plan.revenue}%
                    </span>
                  </div>

                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${plan.revenue}%` }}
                    />
                  </div>

                  <p className="mt-1.5 text-xs text-slate-500">
                    {currency(plan.amount)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Highest revenue plan</p>
              <p className="mt-1 font-semibold">ModelNow Pro</p>
              <p className="mt-1 text-xs text-slate-500">
                Based on illustrative sample data.
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h2 className="font-semibold">Payment health</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Transaction outcomes in the sample dataset
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <ProgressRow
                label="Succeeded"
                value={3}
                total={5}
                color="bg-emerald-500"
              />
              <ProgressRow
                label="Pending"
                value={1}
                total={5}
                color="bg-amber-500"
              />
              <ProgressRow
                label="Failed"
                value={1}
                total={5}
                color="bg-rose-500"
              />
            </div>

            <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-100 p-4">
              <span className="text-sm text-slate-600">
                Sample payment success rate
              </span>
              <span className="text-xl font-bold text-emerald-600">60%</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <CircleAlert size={20} />
              </div>
              <div>
                <h2 className="font-semibold">Refund overview</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Refund activity in the selected sample buckets
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">Refund amount</span>
                <span className="font-semibold">{currency(refundTotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">Refund records</span>
                <span className="font-semibold">
                  {visibleMonths.length === 12 ? "12" : visibleMonths.length}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Average refund per record
                </span>
                <span className="font-semibold">
                  {currency(refundTotal / Math.max(visibleMonths.length, 1))}
                </span>
              </div>
            </div>

            <button
              onClick={() => router.push("/billing/refunds")}
              className="mt-6 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold transition hover:bg-slate-50"
            >
              View refund management
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold">Recent transactions</h2>
              <p className="mt-1 text-sm text-slate-500">
                Review sample payment records.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                value={transactionFilter}
                onChange={(event) => setTransactionFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                aria-label="Transaction status filter"
              >
                <option value="All">All statuses</option>
                <option value="Succeeded">Succeeded</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>

              <button
                onClick={() => router.push("/billing/payments")}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50"
              >
                View all payments
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Payment</th>
                  <th className="px-5 py-4 font-semibold">Customer</th>
                  <th className="px-5 py-4 font-semibold">Plan</th>
                  <th className="px-5 py-4 font-semibold">Amount</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold">{transaction.id}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(transaction.date)}
                      </p>
                    </td>
                    <td className="px-5 py-4">{transaction.customer}</td>
                    <td className="px-5 py-4 text-slate-600">
                      {transaction.plan}
                    </td>
                    <td className="px-5 py-4 font-semibold">
                      {currency(transaction.amount)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          transaction.status === "Succeeded"
                            ? "bg-emerald-50 text-emerald-700"
                            : transaction.status === "Failed"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {transactions.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      No transactions match this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <BarChart3
            size={20}
            className="mt-0.5 shrink-0 text-amber-600"
          />
          <div>
            <h3 className="text-sm font-semibold text-amber-900">
              Sample analytics
            </h3>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              All figures are illustrative and are not live business metrics.
              Revenue chart totals, transaction counts, plan breakdowns, and
              payment records use separate sample datasets. For production,
              connect this page to billing APIs and calculate metrics using
              consistent date ranges, successful payments, actual refunds, and
              verified subscription records.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  iconClass,
  trend,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  iconClass: string;
  trend?: "up" | "down";
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
          <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
            {trend === "up" && (
              <TrendingUp size={14} className="text-emerald-600" />
            )}
            {trend === "down" && (
              <TrendingDown size={14} className="text-rose-600" />
            )}
            {subtitle}
          </p>
        </div>
        <div className={`rounded-xl p-3 ${iconClass}`}>{icon}</div>
      </div>
    </div>
  );
}

function ProgressRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold">
          {value} ({Math.round(percentage)}%)
        </span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-sm ${color}`} />
      <span>{label}</span>
    </div>
  );
}