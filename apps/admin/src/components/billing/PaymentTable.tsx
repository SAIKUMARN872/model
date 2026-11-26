
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  CreditCard,
  Download,
} from "lucide-react";

type PaymentStatus =
  | "Succeeded"
  | "Pending"
  | "Failed"
  | "Refunded";

type PaymentMethod = "Card" | "UPI" | "Net Banking" | "Wallet";

type Payment = {
  id: string;
  customer: string;
  email: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  date: string;
  description: string;
};

const samplePayments: Payment[] = [
  {
    id: "PAY-2001",
    customer: "Aarav Sharma",
    email: "aarav@example.com",
    amount: 49,
    currency: "USD",
    method: "Card",
    status: "Succeeded",
    date: "Nov 02, 2026",
    description: "ModelNow Pro subscription",
  },
  {
    id: "PAY-2002",
    customer: "Priya Reddy",
    email: "priya@example.com",
    amount: 19,
    currency: "USD",
    method: "UPI",
    status: "Succeeded",
    date: "Nov 02, 2026",
    description: "ModelNow Plus subscription",
  },
  {
    id: "PAY-2003",
    customer: "Daniel Wilson",
    email: "daniel@example.com",
    amount: 499,
    currency: "USD",
    method: "Card",
    status: "Pending",
    date: "Nov 01, 2026",
    description: "Enterprise subscription",
  },
  {
    id: "PAY-2004",
    customer: "Sneha Kumar",
    email: "sneha@example.com",
    amount: 19,
    currency: "USD",
    method: "Net Banking",
    status: "Failed",
    date: "Nov 01, 2026",
    description: "ModelNow Plus subscription",
  },
  {
    id: "PAY-2005",
    customer: "Michael Brown",
    email: "michael@example.com",
    amount: 49,
    currency: "USD",
    method: "Card",
    status: "Refunded",
    date: "Oct 31, 2026",
    description: "ModelNow Pro subscription",
  },
  {
    id: "PAY-2006",
    customer: "Ananya Rao",
    email: "ananya@example.com",
    amount: 190,
    currency: "USD",
    method: "UPI",
    status: "Succeeded",
    date: "Oct 30, 2026",
    description: "Annual ModelNow Plus subscription",
  },
  {
    id: "PAY-2007",
    customer: "James Miller",
    email: "james@example.com",
    amount: 49,
    currency: "USD",
    method: "Wallet",
    status: "Pending",
    date: "Oct 29, 2026",
    description: "ModelNow Pro subscription",
  },
  {
    id: "PAY-2008",
    customer: "Kavya Reddy",
    email: "kavya@example.com",
    amount: 19,
    currency: "USD",
    method: "UPI",
    status: "Succeeded",
    date: "Oct 28, 2026",
    description: "ModelNow Plus subscription",
  },
  {
    id: "PAY-2009",
    customer: "Oliver Smith",
    email: "oliver@example.com",
    amount: 490,
    currency: "USD",
    method: "Card",
    status: "Failed",
    date: "Oct 27, 2026",
    description: "Annual ModelNow Pro subscription",
  },
  {
    id: "PAY-2010",
    customer: "Meera Patel",
    email: "meera@example.com",
    amount: 19,
    currency: "USD",
    method: "Net Banking",
    status: "Succeeded",
    date: "Oct 26, 2026",
    description: "ModelNow Plus subscription",
  },
];

const statusStyles: Record<PaymentStatus, string> = {
  Succeeded: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Failed: "bg-rose-50 text-rose-700",
  Refunded: "bg-slate-100 text-slate-600",
};

type PaymentTableProps = {
  payments?: Payment[];
  pageSize?: number;
  onViewPayment?: (payment: Payment) => void;
};

export default function PaymentTable({
  payments = samplePayments,
  pageSize = 5,
  onViewPayment,
}: PaymentTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] =
    useState<Payment | null>(null);

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesSearch =
        !query ||
        payment.id.toLowerCase().includes(query) ||
        payment.customer.toLowerCase().includes(query) ||
        payment.email.toLowerCase().includes(query) ||
        payment.description.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || payment.status === statusFilter;

      const matchesMethod =
        methodFilter === "All" || payment.method === methodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [payments, search, statusFilter, methodFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPayments.length / Math.max(1, pageSize)),
  );

  const safePage = Math.min(currentPage, totalPages);
  const safePageSize = Math.max(1, pageSize);

  const pagePayments = filteredPayments.slice(
    (safePage - 1) * safePageSize,
    safePage * safePageSize,
  );

  const succeededAmount = payments
    .filter((payment) => payment.status === "Succeeded")
    .reduce((total, payment) => total + payment.amount, 0);

  const formatAmount = (amount: number, currency: string) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  function exportCsv() {
    const headers = [
      "Payment ID",
      "Customer",
      "Email",
      "Amount",
      "Currency",
      "Payment Method",
      "Status",
      "Date",
      "Description",
    ];

    const rows = filteredPayments.map((payment) => [
      payment.id,
      payment.customer,
      payment.email,
      payment.amount,
      payment.currency,
      payment.method,
      payment.status,
      payment.date,
      payment.description,
    ]);

    const escapeCsv = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "modelnow-payments.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function viewPayment(payment: Payment) {
    if (onViewPayment) {
      onViewPayment(payment);
    } else {
      setSelectedPayment(payment);
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Payments
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Review transactions, payment methods, and payment outcomes.
          </p>
        </div>

        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 border-b border-slate-100 p-4 sm:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Total transactions</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {payments.length}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Successful transactions</p>
          <p className="mt-1 text-xl font-semibold text-emerald-700">
            {payments.filter((payment) => payment.status === "Succeeded").length}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">
            Successful amount in sample data
          </p>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {formatAmount(
              succeededAmount,
              payments[0]?.currency ?? "USD",
            )}
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
            placeholder="Search payment ID, customer, or email..."
            aria-label="Search payments"
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
            aria-label="Filter payments by status"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
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
            aria-label="Filter payments by method"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="All">All methods</option>
            <option value="Card">Card</option>
            <option value="UPI">UPI</option>
            <option value="Net Banking">Net Banking</option>
            <option value="Wallet">Wallet</option>
          </select>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3.5 font-medium">Transaction</th>
              <th className="px-5 py-3.5 font-medium">Customer</th>
              <th className="px-5 py-3.5 font-medium">Amount</th>
              <th className="px-5 py-3.5 font-medium">Method</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5 font-medium">Date</th>
              <th className="px-5 py-3.5 text-right font-medium">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {pagePayments.map((payment) => (
              <tr
                key={payment.id}
                className="transition hover:bg-slate-50/70"
              >
                <td className="px-5 py-4">
                  <div className="font-medium text-slate-900">
                    {payment.id}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {payment.description}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="font-medium text-slate-800">
                    {payment.customer}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {payment.email}
                  </div>
                </td>

                <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-900">
                  {formatAmount(payment.amount, payment.currency)}
                </td>

                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-2 text-slate-600">
                    <CreditCard size={15} className="text-slate-400" />
                    {payment.method}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[payment.status]}`}
                  >
                    {payment.status}
                  </span>
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                  {payment.date}
                </td>

                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => viewPayment(payment)}
                    aria-label={`View payment ${payment.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Eye size={14} />
                    View
                  </button>
                </td>
              </tr>
            ))}

            {pagePayments.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    No payments found
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Try a different search or filter.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("All");
                      setMethodFilter("All");
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
          {filteredPayments.length === 0
            ? 0
            : (safePage - 1) * safePageSize + 1}
          {"–"}
          {Math.min(safePage * safePageSize, filteredPayments.length)} of{" "}
          {filteredPayments.length} payments
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

      {selectedPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onClick={() => setSelectedPayment(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-dialog-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3
                  id="payment-dialog-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  Payment details
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedPayment.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                aria-label="Close payment details"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Payment amount</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {formatAmount(
                  selectedPayment.amount,
                  selectedPayment.currency,
                )}
              </p>
              <span
                className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[selectedPayment.status]}`}
              >
                {selectedPayment.status}
              </span>
            </div>

            <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                ["Customer", selectedPayment.customer],
                ["Email", selectedPayment.email],
                ["Payment method", selectedPayment.method],
                ["Transaction date", selectedPayment.date],
                ["Description", selectedPayment.description],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-slate-100 p-3"
                >
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="mt-1 break-words text-sm font-medium text-slate-900">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
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
