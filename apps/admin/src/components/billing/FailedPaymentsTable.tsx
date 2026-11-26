
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  AlertTriangle,
  RefreshCw,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Clock,
  CheckCircle2,
} from "lucide-react";

type FailureStatus = "Failed" | "Retrying" | "Recovered";
type FailureReason =
  | "Insufficient funds"
  | "Card declined"
  | "Expired card"
  | "Authentication required"
  | "Processing error";

type FailedPayment = {
  id: string;
  customer: string;
  email: string;
  amount: number;
  currency: string;
  method: string;
  reason: FailureReason;
  failedAt: string;
  attempts: number;
  status: FailureStatus;
};

const initialPayments: FailedPayment[] = [
  {
    id: "pay_fail_001",
    customer: "Olivia Martin",
    email: "olivia@example.com",
    amount: 49,
    currency: "USD",
    method: "Visa •••• 4242",
    reason: "Insufficient funds",
    failedAt: "2026-11-02T08:35:00",
    attempts: 2,
    status: "Failed",
  },
  {
    id: "pay_fail_002",
    customer: "Noah Williams",
    email: "noah@example.com",
    amount: 99,
    currency: "USD",
    method: "Mastercard •••• 8210",
    reason: "Card declined",
    failedAt: "2026-11-02T07:15:00",
    attempts: 3,
    status: "Failed",
  },
  {
    id: "pay_fail_003",
    customer: "Emma Davis",
    email: "emma@example.com",
    amount: 29,
    currency: "USD",
    method: "Visa •••• 1932",
    reason: "Expired card",
    failedAt: "2026-11-01T16:40:00",
    attempts: 1,
    status: "Failed",
  },
  {
    id: "pay_fail_004",
    customer: "Liam Wilson",
    email: "liam@example.com",
    amount: 199,
    currency: "USD",
    method: "Amex •••• 1008",
    reason: "Authentication required",
    failedAt: "2026-11-01T14:10:00",
    attempts: 2,
    status: "Retrying",
  },
  {
    id: "pay_fail_005",
    customer: "Sophia Brown",
    email: "sophia@example.com",
    amount: 49,
    currency: "USD",
    method: "Visa •••• 6074",
    reason: "Processing error",
    failedAt: "2026-10-31T11:25:00",
    attempts: 1,
    status: "Recovered",
  },
  {
    id: "pay_fail_006",
    customer: "Ethan Taylor",
    email: "ethan@example.com",
    amount: 99,
    currency: "USD",
    method: "Mastercard •••• 5139",
    reason: "Insufficient funds",
    failedAt: "2026-10-30T09:20:00",
    attempts: 3,
    status: "Failed",
  },
  {
    id: "pay_fail_007",
    customer: "Ava Anderson",
    email: "ava@example.com",
    amount: 29,
    currency: "USD",
    method: "Visa •••• 7741",
    reason: "Card declined",
    failedAt: "2026-10-29T18:45:00",
    attempts: 2,
    status: "Failed",
  },
];

const statusStyles: Record<FailureStatus, string> = {
  Failed: "bg-rose-50 text-rose-700 ring-rose-600/20",
  Retrying: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Recovered: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function FailedPaymentsTable() {
  const [payments, setPayments] = useState(initialPayments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [reasonFilter, setReasonFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selected, setSelected] = useState<FailedPayment | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesSearch =
        !query ||
        payment.id.toLowerCase().includes(query) ||
        payment.customer.toLowerCase().includes(query) ||
        payment.email.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || payment.status === statusFilter;

      const matchesReason =
        reasonFilter === "All" || payment.reason === reasonFilter;

      return matchesSearch && matchesStatus && matchesReason;
    });
  }, [payments, search, statusFilter, reasonFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPayments.length / pageSize)
  );
  const safePage = Math.min(page, totalPages);

  const visiblePayments = filteredPayments.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const failedPayments = payments.filter(
    (payment) => payment.status === "Failed"
  );

  const failedValue = failedPayments.reduce(
    (total, payment) => total + payment.amount,
    0
  );

  const recoveredCount = payments.filter(
    (payment) => payment.status === "Recovered"
  ).length;

  function retryPayment(payment: FailedPayment) {
    if (payment.status !== "Failed" || retryingId) return;

    setRetryingId(payment.id);
    setNotice("");

    // Demo behavior only: this does not contact a payment provider.
    setPayments((current) =>
      current.map((item) =>
        item.id === payment.id
          ? { ...item, status: "Retrying" }
          : item
      )
    );

    setSelected((current) =>
      current?.id === payment.id
        ? { ...current, status: "Retrying" }
        : current
    );

    setRetryingId(null);
    setNotice(
      `Demo retry marked for ${payment.id}. No real payment was attempted.`
    );
  }

  function exportCsv() {
    const headers = [
      "Payment ID",
      "Customer",
      "Email",
      "Amount",
      "Currency",
      "Payment Method",
      "Failure Reason",
      "Failed At",
      "Attempts",
      "Status",
    ];

    const rows = filteredPayments.map((payment) => [
      payment.id,
      payment.customer,
      payment.email,
      payment.amount,
      payment.currency,
      payment.method,
      payment.reason,
      payment.failedAt,
      payment.attempts,
      payment.status,
    ]);

    const escapeCsv = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "modelnow-failed-payments.csv";
    anchor.click();

    URL.revokeObjectURL(url);
  }

  return (
    <section className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Failed payments</p>
            <AlertTriangle size={19} className="text-rose-600" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {failedPayments.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Currently marked failed
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Outstanding failed value</p>
            <CreditCard size={19} className="text-amber-600" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {formatCurrency(failedValue, "USD")}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Sum of failed sample records
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Recovered payments</p>
            <CheckCircle2 size={19} className="text-emerald-600" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {recoveredCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Marked recovered in this demo
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Failed payments
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Investigate payment failures and review retry status.
            </p>
          </div>

          <button
            type="button"
            onClick={exportCsv}
            className="rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Export CSV
          </button>
        </div>

        {notice && (
          <div
            role="status"
            className="border-b border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800"
          >
            {notice}
          </div>
        )}

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
              placeholder="Search customer, email, or payment ID..."
              aria-label="Search failed payments"
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by payment status"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="All">All statuses</option>
            <option value="Failed">Failed</option>
            <option value="Retrying">Retrying</option>
            <option value="Recovered">Recovered</option>
          </select>

          <select
            value={reasonFilter}
            onChange={(event) => {
              setReasonFilter(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by failure reason"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="All">All reasons</option>
            <option value="Insufficient funds">Insufficient funds</option>
            <option value="Card declined">Card declined</option>
            <option value="Expired card">Expired card</option>
            <option value="Authentication required">
              Authentication required
            </option>
            <option value="Processing error">Processing error</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Failure reason</th>
                <th className="px-5 py-3 font-medium">Failed at</th>
                <th className="px-5 py-3 font-medium">Attempts</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {visiblePayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900">
                      {payment.customer}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {payment.email}
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-slate-400">
                      {payment.id}
                    </div>
                  </td>

                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {formatCurrency(payment.amount, payment.currency)}
                    <div className="mt-1 text-xs font-normal text-slate-500">
                      {payment.method}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-slate-700">
                    {payment.reason}
                  </td>

                  <td className="px-5 py-4 text-slate-700">
                    {formatDate(payment.failedAt)}
                  </td>

                  <td className="px-5 py-4 text-slate-700">
                    {payment.attempts}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[payment.status]}`}
                    >
                      {payment.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelected(payment)}
                        title="View payment details"
                        aria-label={`View ${payment.id}`}
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => retryPayment(payment)}
                        disabled={
                          payment.status !== "Failed" ||
                          retryingId !== null
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        <RefreshCw size={13} />
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {visiblePayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <AlertTriangle
                      size={26}
                      className="mx-auto text-slate-300"
                    />
                    <p className="mt-3 font-medium text-slate-800">
                      No matching payments
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Try changing the search term or filters.
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
              {filteredPayments.length === 0
                ? "0 results"
                : `${(safePage - 1) * pageSize + 1}–${Math.min(
                    safePage * pageSize,
                    filteredPayments.length
                  )} of ${filteredPayments.length}`}
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
            aria-labelledby="failed-payment-details-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Payment details
                </p>
                <h2
                  id="failed-payment-details-title"
                  className="mt-1 text-xl font-semibold text-slate-900"
                >
                  {selected.id}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close payment details"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Payment amount</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {formatCurrency(selected.amount, selected.currency)}
              </p>
              <span
                className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[selected.status]}`}
              >
                {selected.status}
              </span>
            </div>

            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Customer</dt>
                <dd className="text-right font-medium text-slate-800">
                  {selected.customer}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Email</dt>
                <dd className="break-all text-right text-slate-800">
                  {selected.email}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Payment method</dt>
                <dd className="text-right text-slate-800">
                  {selected.method}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Failure reason</dt>
                <dd className="text-right text-slate-800">
                  {selected.reason}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Last failure</dt>
                <dd className="text-right text-slate-800">
                  {formatDate(selected.failedAt)}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Attempts</dt>
                <dd className="text-right text-slate-800">
                  {selected.attempts}
                </dd>
              </div>
            </dl>

            {selected.status === "Failed" && (
              <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <div className="flex items-start gap-2">
                  <Clock size={17} className="mt-0.5 shrink-0" />
                  <p>
                    Check the failure reason and your payment provider&apos;s
                    retry policy before attempting another charge.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              {selected.status === "Failed" && (
                <button
                  type="button"
                  onClick={() => retryPayment(selected)}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <RefreshCw size={15} />
                  Mark retrying (demo)
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs leading-5 text-slate-500">
        Sample data only. Retry changes the local display status; it does not
        charge a customer or contact the payment provider.
      </p>
    </section>
  );
}
