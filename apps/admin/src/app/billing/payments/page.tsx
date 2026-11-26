
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Download,
  CreditCard,
  CheckCircle2,
  Clock3,
  XCircle,
  Eye,
  ArrowUpRight,
  Wallet,
  CalendarDays,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

type PaymentStatus = "Succeeded" | "Pending" | "Failed" | "Refunded";

type Payment = {
  id: string;
  customer: string;
  email: string;
  amount: number;
  method: string;
  date: string;
  status: PaymentStatus;
};

const initialPayments: Payment[] = [
  {
    id: "PAY-1001",
    customer: "Ananya Sharma",
    email: "ananya@example.com",
    amount: 2499,
    method: "UPI",
    date: "2026-11-02",
    status: "Succeeded",
  },
  {
    id: "PAY-1002",
    customer: "Rahul Verma",
    email: "rahul@example.com",
    amount: 4999,
    method: "Credit Card",
    date: "2026-11-02",
    status: "Succeeded",
  },
  {
    id: "PAY-1003",
    customer: "Priya Reddy",
    email: "priya@example.com",
    amount: 999,
    method: "UPI",
    date: "2026-11-01",
    status: "Pending",
  },
  {
    id: "PAY-1004",
    customer: "Arjun Kumar",
    email: "arjun@example.com",
    amount: 7499,
    method: "Debit Card",
    date: "2026-11-01",
    status: "Failed",
  },
  {
    id: "PAY-1005",
    customer: "Sneha Patel",
    email: "sneha@example.com",
    amount: 2499,
    method: "Net Banking",
    date: "2026-10-31",
    status: "Succeeded",
  },
  {
    id: "PAY-1006",
    customer: "Vikram Rao",
    email: "vikram@example.com",
    amount: 1499,
    method: "UPI",
    date: "2026-10-31",
    status: "Refunded",
  },
  {
    id: "PAY-1007",
    customer: "Meera Nair",
    email: "meera@example.com",
    amount: 4999,
    method: "Credit Card",
    date: "2026-10-30",
    status: "Succeeded",
  },
  {
    id: "PAY-1008",
    customer: "Kiran Reddy",
    email: "kiran@example.com",
    amount: 999,
    method: "UPI",
    date: "2026-10-30",
    status: "Pending",
  },
];

const statusStyles: Record<PaymentStatus, string> = {
  Succeeded: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  Failed: "bg-red-50 text-red-700 ring-1 ring-red-100",
  Refunded: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function PaymentsPage() {
  const [payments] = useState<Payment[]>(initialPayments);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const pageSize = 5;

  const succeededPayments = payments.filter(
    (payment) => payment.status === "Succeeded"
  );

  const pendingPayments = payments.filter(
    (payment) => payment.status === "Pending"
  );

  const failedPayments = payments.filter(
    (payment) => payment.status === "Failed"
  );

  const refundedPayments = payments.filter(
    (payment) => payment.status === "Refunded"
  );

  const totalCollected = succeededPayments.reduce(
    (total, payment) => total + payment.amount,
    0
  );

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesSearch =
        !query ||
        payment.id.toLowerCase().includes(query) ||
        payment.customer.toLowerCase().includes(query) ||
        payment.email.toLowerCase().includes(query) ||
        payment.method.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || payment.status === statusFilter;

      const matchesMethod =
        methodFilter === "All" || payment.method === methodFilter;

      const matchesStartDate =
        !startDate || payment.date >= startDate;

      const matchesEndDate =
        !endDate || payment.date <= endDate;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesMethod &&
        matchesStartDate &&
        matchesEndDate
      );
    });
  }, [payments, search, statusFilter, methodFilter, startDate, endDate]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPayments.length / pageSize)
  );

  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;

    return filteredPayments.slice(startIndex, startIndex + pageSize);
  }, [filteredPayments, currentPage]);

  const summaryCards = [
    {
      title: "Total Transactions",
      value: payments.length.toLocaleString("en-IN"),
      subtitle: "All recorded transactions",
      icon: CreditCard,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Total Collected",
      value: formatCurrency(totalCollected),
      subtitle: "From successful payments",
      icon: Wallet,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Successful Payments",
      value: succeededPayments.length.toLocaleString("en-IN"),
      subtitle: "Completed transactions",
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Pending Payments",
      value: pendingPayments.length.toLocaleString("en-IN"),
      subtitle: "Awaiting confirmation",
      icon: Clock3,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Failed Payments",
      value: failedPayments.length.toLocaleString("en-IN"),
      subtitle: "Require investigation",
      icon: XCircle,
      color: "bg-red-50 text-red-600",
    },
  ];

  function resetFilters() {
    setSearch("");
    setStatusFilter("All");
    setMethodFilter("All");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  }

  function exportCSV() {
    const headers = [
      "Transaction ID",
      "Customer",
      "Email",
      "Amount (INR)",
      "Payment Method",
      "Date",
      "Status",
    ];

    const safeCSVValue = (value: string) => {
      const safeValue = /^[=+\-@]/.test(value) ? `'${value}` : value;
      return `"${safeValue.replace(/"/g, '""')}"`;
    };

    const rows = filteredPayments.map((payment) => [
      payment.id,
      payment.customer,
      payment.email,
      payment.amount.toString(),
      payment.method,
      payment.date,
      payment.status,
    ]);

    const csv = [
      headers.map(safeCSVValue).join(","),
      ...rows.map((row) => row.map(safeCSVValue).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "modelnow-payments.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const firstVisible =
    filteredPayments.length === 0
      ? 0
      : (currentPage - 1) * pageSize + 1;

  const lastVisible = Math.min(
    currentPage * pageSize,
    filteredPayments.length
  );

  return (
    <main className="min-h-screen space-y-7 bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      {/* Page Header */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <Wallet size={16} />
            <span>Billing</span>
            <span>/</span>
            <span className="font-medium text-slate-700">Payments</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Payments
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Monitor transactions, review payment statuses, and track payment
            activity across ModelNow.
          </p>
        </div>

        <button
          type="button"
          onClick={exportCSV}
          disabled={filteredPayments.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={17} />
          Export CSV
        </button>
      </header>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>
                  <p className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-900">
                    {card.value}
                  </p>
                </div>

                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.color}`}
                >
                  <Icon size={21} />
                </span>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                {card.subtitle}
              </p>
            </article>
          );
        })}
      </section>

      {/* Transaction Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Payment Transactions
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Search, filter, and review recorded payment activity.
              </p>
            </div>

            <span className="w-fit rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {filteredPayments.length} transactions found
            </span>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <div className="relative xl:col-span-2">
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
                placeholder="Search ID, customer, email..."
                aria-label="Search transactions"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter payments by status"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All statuses</option>
              <option value="Succeeded">Succeeded</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>

            <select
              value={methodFilter}
              onChange={(event) => {
                setMethodFilter(event.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by payment method"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All methods</option>
              <option value="UPI">UPI</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Net Banking">Net Banking</option>
            </select>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <RotateCcw size={15} />
              Reset filters
            </button>
          </div>

          {/* Date Filters */}
          <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <CalendarDays size={17} />
              Date range
            </div>

            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="payment-start-date"
                  className="mb-1 block text-xs text-slate-500"
                >
                  From
                </label>
                <input
                  id="payment-start-date"
                  type="date"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(event) => {
                    setStartDate(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="payment-end-date"
                  className="mb-1 block text-xs text-slate-500"
                >
                  To
                </label>
                <input
                  id="payment-end-date"
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(event) => {
                    setEndDate(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Filter size={14} />
              <span>Filters apply to the export too</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-4 font-semibold">Transaction</th>
                <th className="px-5 py-4 font-semibold">Customer</th>
                <th className="px-5 py-4 font-semibold">Amount</th>
                <th className="px-5 py-4 font-semibold">Payment Method</th>
                <th className="px-5 py-4 font-semibold">Date</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 text-right font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <span className="font-semibold text-slate-800">
                      {payment.id}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-slate-800">
                      {payment.customer}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {payment.email}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                    {formatCurrency(payment.amount)}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {payment.method}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {formatDate(payment.date)}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[payment.status]}`}
                    >
                      {payment.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedPayment(payment)}
                      aria-label={`View ${payment.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {paginatedPayments.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-16 text-center"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <Search size={22} />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No payments found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Try changing your search or filter criteria.
                    </p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Clear all filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-800">{firstVisible}</span>
            {" "}to{" "}
            <span className="font-semibold text-slate-800">{lastVisible}</span>
            {" "}of{" "}
            <span className="font-semibold text-slate-800">{filteredPayments.length}</span>
            {" "}transactions
          </p>

          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1 || filteredPayments.length === 0}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={15} />
              Previous
            </button>

            <span className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={
                currentPage >= totalPages || filteredPayments.length === 0
              }
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* Payment Information */}
      <section className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600">
          <ArrowUpRight size={18} />
        </span>

        <div>
          <p className="text-sm font-semibold text-slate-800">
            Payment data status
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            This page currently uses sample transactions for frontend
            demonstration. Connect your payment backend and payment provider
            to display live transactions, verify payment status, and process
            refunds securely.
          </p>
        </div>
      </section>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedPayment(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-details-title"
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Transaction details
                </p>
                <h2
                  id="payment-details-title"
                  className="mt-1 text-xl font-bold text-slate-900"
                >
                  {selectedPayment.id}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                aria-label="Close payment details"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-6">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Payment amount</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                  {formatCurrency(selectedPayment.amount)}
                </p>
                <span
                  className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[selectedPayment.status]}`}
                >
                  {selectedPayment.status}
                </span>
              </div>

              <h3 className="mb-4 mt-6 text-sm font-semibold text-slate-900">
                Transaction information
              </h3>

              <dl className="space-y-4">
                {[
                  ["Transaction ID", selectedPayment.id],
                  ["Customer", selectedPayment.customer],
                  ["Email address", selectedPayment.email],
                  ["Payment method", selectedPayment.method],
                  ["Transaction date", formatDate(selectedPayment.date)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0"
                  >
                    <dt className="text-sm text-slate-500">{label}</dt>
                    <dd className="break-all text-right text-sm font-medium text-slate-800">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
