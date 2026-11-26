"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  Search,
  Download,
  Eye,
  X,
  RefreshCw,
  CreditCard,
  CheckCircle2,
  Clock3,
} from "lucide-react";

type PaymentStatus = "Failed" | "Retry Scheduled" | "Recovered";

type FailedPayment = {
  id: string;
  customer: string;
  email: string;
  plan: string;
  amount: number;
  date: string;
  reason: string;
  paymentMethod: string;
  attempts: number;
  status: PaymentStatus;
};

const initialPayments: FailedPayment[] = [
  {
    id: "PAY-2026-1048",
    customer: "Rahul Sharma",
    email: "rahul@example.com",
    plan: "ModelNow Pro",
    amount: 4999,
    date: "2026-11-02",
    reason: "Insufficient funds",
    paymentMethod: "Visa ending 4242",
    attempts: 2,
    status: "Failed",
  },
  {
    id: "PAY-2026-1045",
    customer: "Priya Reddy",
    email: "priya@example.com",
    plan: "ModelNow Plus",
    amount: 999,
    date: "2026-11-02",
    reason: "Card declined",
    paymentMethod: "Mastercard ending 1881",
    attempts: 1,
    status: "Retry Scheduled",
  },
  {
    id: "PAY-2026-1042",
    customer: "Arjun Kumar",
    email: "arjun@example.com",
    plan: "ModelNow Pro",
    amount: 4999,
    date: "2026-11-01",
    reason: "Authentication required",
    paymentMethod: "Visa ending 9012",
    attempts: 3,
    status: "Failed",
  },
  {
    id: "PAY-2026-1039",
    customer: "Sneha Patel",
    email: "sneha@example.com",
    plan: "ModelNow Plus",
    amount: 999,
    date: "2026-11-01",
    reason: "Payment gateway timeout",
    paymentMethod: "UPI",
    attempts: 1,
    status: "Retry Scheduled",
  },
  {
    id: "PAY-2026-1035",
    customer: "Kiran Rao",
    email: "kiran@example.com",
    plan: "ModelNow Pro",
    amount: 4999,
    date: "2026-10-31",
    reason: "Expired payment method",
    paymentMethod: "Visa ending 3277",
    attempts: 3,
    status: "Failed",
  },
  {
    id: "PAY-2026-1028",
    customer: "Meera Joshi",
    email: "meera@example.com",
    plan: "ModelNow Plus",
    amount: 999,
    date: "2026-10-29",
    reason: "Insufficient funds",
    paymentMethod: "UPI",
    attempts: 2,
    status: "Recovered",
  },
  {
    id: "PAY-2026-1024",
    customer: "Vikram Reddy",
    email: "vikram@example.com",
    plan: "ModelNow Pro",
    amount: 4999,
    date: "2026-10-28",
    reason: "Card declined",
    paymentMethod: "Mastercard ending 6610",
    attempts: 2,
    status: "Failed",
  },
];

const statusStyles: Record<PaymentStatus, string> = {
  Failed: "bg-rose-50 text-rose-700 ring-rose-200",
  "Retry Scheduled": "bg-amber-50 text-amber-700 ring-amber-200",
  Recovered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const currency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function FailedPaymentsPage() {
  const router = useRouter();

  const [payments, setPayments] =
    useState<FailedPayment[]>(initialPayments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedPayment, setSelectedPayment] =
    useState<FailedPayment | null>(null);
  const [notice, setNotice] = useState("");

  const stats = useMemo(() => {
    const failed = payments.filter((p) => p.status === "Failed");
    const scheduled = payments.filter(
      (p) => p.status === "Retry Scheduled",
    );
    const recovered = payments.filter((p) => p.status === "Recovered");

    return {
      failedCount: failed.length,
      failedAmount: failed.reduce((sum, p) => sum + p.amount, 0),
      scheduledCount: scheduled.length,
      recoveredCount: recovered.length,
      recoveredAmount: recovered.reduce((sum, p) => sum + p.amount, 0),
    };
  }, [payments]);

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesSearch =
        !query ||
        payment.id.toLowerCase().includes(query) ||
        payment.customer.toLowerCase().includes(query) ||
        payment.email.toLowerCase().includes(query) ||
        payment.reason.toLowerCase().includes(query) ||
        payment.plan.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || payment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payments, search, statusFilter]);

  function updatePaymentStatus(id: string, status: PaymentStatus) {
    setPayments((current) =>
      current.map((payment) =>
        payment.id === id ? { ...payment, status } : payment,
      ),
    );

    setSelectedPayment((current) =>
      current?.id === id ? { ...current, status } : current,
    );

    setNotice(`${id} marked as ${status}. Demo-only status update.`);
  }

  function scheduleRetry(payment: FailedPayment) {
    updatePaymentStatus(payment.id, "Retry Scheduled");
    setPayments((current) =>
      current.map((item) =>
        item.id === payment.id
          ? { ...item, attempts: item.attempts + 1 }
          : item,
      ),
    );
    setSelectedPayment((current) =>
      current?.id === payment.id
        ? { ...current, status: "Retry Scheduled", attempts: current.attempts + 1 }
        : current,
    );
    setNotice(
      `Retry recorded for ${payment.id}. No real payment attempt was made.`,
    );
  }

  function exportCSV() {
    const headers = [
      "Payment ID",
      "Customer",
      "Email",
      "Plan",
      "Amount INR",
      "Date",
      "Failure Reason",
      "Payment Method",
      "Attempts",
      "Status",
    ];

    const rows = filteredPayments.map((payment) => [
      payment.id,
      payment.customer,
      payment.email,
      payment.plan,
      payment.amount,
      payment.date,
      payment.reason,
      payment.paymentMethod,
      payment.attempts,
      payment.status,
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
    link.download = "modelnow-failed-payments.csv";
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
                <span className="text-blue-600">Failed Payments</span>
              </div>

              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Failed Payments
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Investigate payment failures and track recovery attempts.
              </p>
            </div>
          </div>

          <button
            onClick={exportCSV}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50"
          >
            <Download size={17} />
            Export CSV
          </button>
        </header>

        {notice && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <span>{notice}</span>
            <button
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
              className="rounded-lg p-1 hover:bg-blue-100"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Failed Transactions"
            value={String(stats.failedCount)}
            description={`${currency(stats.failedAmount)} associated with failed records`}
            icon={<AlertTriangle size={20} />}
            iconClass="bg-rose-50 text-rose-600"
          />

          <StatCard
            title="Retry Scheduled"
            value={String(stats.scheduledCount)}
            description="Awaiting retry in the demo workflow"
            icon={<Clock3 size={20} />}
            iconClass="bg-amber-50 text-amber-600"
          />

          <StatCard
            title="Recovered Payments"
            value={String(stats.recoveredCount)}
            description={`${currency(stats.recoveredAmount)} marked recovered`}
            icon={<CheckCircle2 size={20} />}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Total Records"
            value={String(payments.length)}
            description="Sample payment records"
            icon={<CreditCard size={20} />}
            iconClass="bg-blue-50 text-blue-600"
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-semibold">Payment failure records</h2>
              <p className="mt-1 text-sm text-slate-500">
                Search by payment, customer, plan, or failure reason.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search payment or customer..."
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 sm:w-72"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              >
                <option value="All">All statuses</option>
                <option value="Failed">Failed</option>
                <option value="Retry Scheduled">Retry Scheduled</option>
                <option value="Recovered">Recovered</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Payment</th>
                  <th className="px-5 py-4 font-semibold">Customer</th>
                  <th className="px-5 py-4 font-semibold">Amount</th>
                  <th className="px-5 py-4 font-semibold">Failure reason</th>
                  <th className="px-5 py-4 font-semibold">Attempts</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-right font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">
                        {payment.id}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(payment.date)}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium">{payment.customer}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {payment.email}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {currency(payment.amount)}
                      <p className="mt-1 text-xs font-normal text-slate-500">
                        {payment.plan}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {payment.reason}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {payment.attempts}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[payment.status]}`}
                      >
                        {payment.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Eye size={15} />
                        Review
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredPayments.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      No payment records match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
            Showing {filteredPayments.length} of {payments.length} records
          </div>
        </section>

        <section className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle
            size={20}
            className="mt-0.5 shrink-0 text-amber-600"
          />
          <div>
            <h3 className="text-sm font-semibold text-amber-900">
              Demo mode
            </h3>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              These are sample records. Retry actions only update local
              component state. Real payment retries must be handled by a
              secure backend and payment provider, with idempotency controls,
              customer consent where required, and verified transaction status.
            </p>
          </div>
        </section>
      </div>

      {selectedPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedPayment(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-details-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Payment investigation
                </p>
                <h2
                  id="payment-details-title"
                  className="mt-1 text-xl font-bold"
                >
                  {selectedPayment.id}
                </h2>
              </div>

              <button
                onClick={() => setSelectedPayment(null)}
                aria-label="Close payment details"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Transaction amount</p>
                <p className="mt-1 text-3xl font-bold">
                  {currency(selectedPayment.amount)}
                </p>
                <span
                  className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[selectedPayment.status]}`}
                >
                  {selectedPayment.status}
                </span>
              </div>

              <DetailRow label="Customer" value={selectedPayment.customer} />
              <DetailRow label="Email" value={selectedPayment.email} />
              <DetailRow label="Plan" value={selectedPayment.plan} />
              <DetailRow label="Failure reason" value={selectedPayment.reason} />
              <DetailRow
                label="Payment method"
                value={selectedPayment.paymentMethod}
              />
              <DetailRow
                label="Transaction date"
                value={formatDate(selectedPayment.date)}
              />
              <DetailRow
                label="Attempts"
                value={String(selectedPayment.attempts)}
              />

              {selectedPayment.status === "Failed" && (
                <button
                  onClick={() => scheduleRetry(selectedPayment)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <RefreshCw size={17} />
                  Schedule retry (demo)
                </button>
              )}

              {selectedPayment.status === "Retry Scheduled" && (
                <button
                  onClick={() =>
                    updatePaymentStatus(selectedPayment.id, "Recovered")
                  }
                  className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Mark as recovered (demo)
                </button>
              )}

              <p className="text-xs leading-5 text-slate-500">
                Demo workflow only. No payment is attempted, collected, or
                verified by this action.
              </p>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
  iconClass,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
          <p className="mt-2 text-xs text-slate-500">{description}</p>
        </div>
        <div className={`rounded-xl p-3 ${iconClass}`}>{icon}</div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="max-w-[65%] text-right font-medium text-slate-800">
        {value}
      </span>
    </div>
  );
}