"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  RefreshCw,
  Search,
  Download,
  Eye,
  X,
  CheckCircle2,
  Clock3,
  XCircle,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  Filter,
  ShieldCheck,
} from "lucide-react";

type RefundStatus = "Pending" | "Approved" | "Processed" | "Rejected";

type Refund = {
  id: string;
  paymentId: string;
  customer: string;
  email: string;
  plan: string;
  amount: number;
  reason: string;
  requestedAt: string;
  status: RefundStatus;
};

const initialRefunds: Refund[] = [
  {
    id: "REF-2026-001",
    paymentId: "PAY-2026-1041",
    customer: "Ananya Sharma",
    email: "ananya@example.com",
    plan: "ModelNow Pro",
    amount: 4999,
    reason: "Duplicate payment",
    requestedAt: "2026-10-28",
    status: "Pending",
  },
  {
    id: "REF-2026-002",
    paymentId: "PAY-2026-1038",
    customer: "Rahul Verma",
    email: "rahul@example.com",
    plan: "ModelNow Plus",
    amount: 999,
    reason: "Accidental purchase",
    requestedAt: "2026-10-27",
    status: "Approved",
  },
  {
    id: "REF-2026-003",
    paymentId: "PAY-2026-1029",
    customer: "Priya Reddy",
    email: "priya@example.com",
    plan: "ModelNow Pro",
    amount: 4999,
    reason: "Service issue",
    requestedAt: "2026-10-25",
    status: "Processed",
  },
  {
    id: "REF-2026-004",
    paymentId: "PAY-2026-1022",
    customer: "Kiran Kumar",
    email: "kiran@example.com",
    plan: "ModelNow Plus",
    amount: 999,
    reason: "Incorrect plan",
    requestedAt: "2026-10-24",
    status: "Rejected",
  },
  {
    id: "REF-2026-005",
    paymentId: "PAY-2026-1017",
    customer: "Sneha Patel",
    email: "sneha@example.com",
    plan: "ModelNow Pro",
    amount: 4999,
    reason: "Duplicate payment",
    requestedAt: "2026-10-22",
    status: "Pending",
  },
  {
    id: "REF-2026-006",
    paymentId: "PAY-2026-1008",
    customer: "Arjun Rao",
    email: "arjun@example.com",
    plan: "ModelNow Plus",
    amount: 999,
    reason: "Subscription cancellation",
    requestedAt: "2026-10-20",
    status: "Processed",
  },
  {
    id: "REF-2026-007",
    paymentId: "PAY-2026-0996",
    customer: "Meera Joshi",
    email: "meera@example.com",
    plan: "ModelNow Pro",
    amount: 4999,
    reason: "Service issue",
    requestedAt: "2026-10-18",
    status: "Pending",
  },
];

const statusStyles: Record<RefundStatus, string> = {
  Pending: "bg-amber-50 text-amber-700 ring-amber-200",
  Approved: "bg-blue-50 text-blue-700 ring-blue-200",
  Processed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Rejected: "bg-rose-50 text-rose-700 ring-rose-200",
};

const currency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const PAGE_SIZE = 5;

function escapeCSV(value: string | number) {
  let text = String(value);

  if (/^[\s]*[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

export default function RefundsPage() {
  const router = useRouter();

  const [refunds, setRefunds] = useState<Refund[]>(initialRefunds);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedRefund, setSelectedRefund] =
    useState<Refund | null>(null);
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(1);

  const stats = useMemo(() => {
    const pending = refunds.filter(
      (refund) => refund.status === "Pending",
    );

    const processed = refunds.filter(
      (refund) => refund.status === "Processed",
    );

    return {
      total: refunds.length,
      pending: pending.length,
      approved: refunds.filter(
        (refund) => refund.status === "Approved",
      ).length,
      rejected: refunds.filter(
        (refund) => refund.status === "Rejected",
      ).length,
      processed: processed.length,
      pendingAmount: pending.reduce(
        (sum, refund) => sum + refund.amount,
        0,
      ),
      processedAmount: processed.reduce(
        (sum, refund) => sum + refund.amount,
        0,
      ),
    };
  }, [refunds]);

  const filteredRefunds = useMemo(() => {
    const query = search.trim().toLowerCase();

    return refunds.filter((refund) => {
      const searchableText = [
        refund.id,
        refund.paymentId,
        refund.customer,
        refund.email,
        refund.plan,
        refund.reason,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        refund.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [refunds, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRefunds.length / PAGE_SIZE),
  );

  const paginatedRefunds = filteredRefunds.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  function updateRefundStatus(
    id: string,
    status: RefundStatus,
  ) {
    setRefunds((current) =>
      current.map((refund) =>
        refund.id === id
          ? { ...refund, status }
          : refund,
      ),
    );

    setSelectedRefund((current) =>
      current?.id === id
        ? { ...current, status }
        : current,
    );

    setNotice(
      `${id} updated to ${status}. Demo-only change.`,
    );
  }

  function exportCSV() {
    const headers = [
      "Refund ID",
      "Payment ID",
      "Customer",
      "Email",
      "Plan",
      "Amount INR",
      "Reason",
      "Requested At",
      "Status",
    ];

    const rows = filteredRefunds.map((refund) => [
      refund.id,
      refund.paymentId,
      refund.customer,
      refund.email,
      refund.plan,
      refund.amount,
      refund.reason,
      refund.requestedAt,
      refund.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "modelnow-refunds.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(
      () => URL.revokeObjectURL(url),
      1000,
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}

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
                <span className="font-medium text-blue-600">
                  Refunds
                </span>
              </div>

              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Refund Management
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Review refund requests, manage approvals, and track
                refund status.
              </p>
            </div>
          </div>

          <button
            onClick={exportCSV}
            disabled={filteredRefunds.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={17} />
            Export CSV
          </button>
        </header>

        {/* NOTIFICATION */}

        {notice && (
          <div
            role="status"
            className="flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800"
          >
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

        {/* STATISTICS */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Requests"
            value={String(stats.total)}
            description="All refund requests"
            icon={<RefreshCw size={20} />}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Pending Review"
            value={String(stats.pending)}
            description={`${currency(stats.pendingAmount)} awaiting review`}
            icon={<Clock3 size={20} />}
            iconClass="bg-amber-50 text-amber-600"
          />

          <StatCard
            title="Refunds Processed"
            value={String(stats.processed)}
            description={`${stats.approved} approved, ${stats.rejected} rejected`}
            icon={<CheckCircle2 size={20} />}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Processed Amount"
            value={currency(stats.processedAmount)}
            description="Total marked as processed"
            icon={<IndianRupee size={20} />}
            iconClass="bg-violet-50 text-violet-600"
          />
        </section>

        {/* REFUND TABLE */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-semibold">
                Refund Requests
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Search, filter, and review individual refund cases.
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
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search refund, customer, reason..."
                  aria-label="Search refund requests"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 sm:w-80"
                />
              </div>

              <div className="relative">
                <Filter
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setPage(1);
                  }}
                  aria-label="Filter by refund status"
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-sm outline-none focus:border-blue-400 sm:w-44"
                >
                  <option value="All">All statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Processed">Processed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Refund</th>
                  <th className="px-5 py-4 font-semibold">Customer</th>
                  <th className="px-5 py-4 font-semibold">Plan</th>
                  <th className="px-5 py-4 font-semibold">Amount</th>
                  <th className="px-5 py-4 font-semibold">Requested</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-right font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {paginatedRefunds.map((refund) => (
                  <tr
                    key={refund.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">
                        {refund.id}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {refund.paymentId}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium">
                        {refund.customer}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {refund.email}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {refund.plan}
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {currency(refund.amount)}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {refund.requestedAt}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={refund.status} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedRefund(refund)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Eye size={15} />
                        Review
                      </button>
                    </td>
                  </tr>
                ))}

                {paginatedRefunds.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      <RefreshCw
                        size={28}
                        className="mx-auto mb-3 text-slate-300"
                      />

                      <p className="font-medium">
                        No refund requests found
                      </p>

                      <p className="mt-1 text-xs">
                        Try changing your search or status filter.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}

          <div className="flex flex-col justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center">
            <p className="text-xs text-slate-500">
              Showing{" "}
              {filteredRefunds.length === 0
                ? 0
                : (page - 1) * PAGE_SIZE + 1}
              {"–"}
              {Math.min(
                page * PAGE_SIZE,
                filteredRefunds.length,
              )}{" "}
              of {filteredRefunds.length} requests
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setPage((current) => Math.max(1, current - 1))
                }
                disabled={page === 1}
                aria-label="Previous page"
                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={17} />
              </button>

              <span className="px-2 text-xs font-medium text-slate-600">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setPage((current) =>
                    Math.min(totalPages, current + 1),
                  )
                }
                disabled={page >= totalPages}
                aria-label="Next page"
                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </section>

        {/* DEMO NOTICE */}

        <section className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <ShieldCheck
            size={20}
            className="mt-0.5 shrink-0 text-amber-600"
          />

          <div>
            <h3 className="text-sm font-semibold text-amber-900">
              Demo data and refund processing
            </h3>

            <p className="mt-1 text-sm leading-6 text-amber-800">
              This page uses sample refund records. Status changes
              update only local frontend state. Actual refunds require
              backend authorization, payment-provider integration,
              audit logs, and server-side verification.
            </p>
          </div>
        </section>
      </div>

      {/* REFUND DETAILS MODAL */}

      {selectedRefund && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedRefund(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="refund-modal-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Refund review
                </p>

                <h2
                  id="refund-modal-title"
                  className="mt-1 text-xl font-bold"
                >
                  {selectedRefund.id}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Payment: {selectedRefund.paymentId}
                </p>
              </div>

              <button
                onClick={() => setSelectedRefund(null)}
                aria-label="Close refund details"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  Refund amount
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {currency(selectedRefund.amount)}
                </p>

                <div className="mt-3">
                  <StatusBadge status={selectedRefund.status} />
                </div>
              </div>

              <DetailRow
                label="Customer"
                value={selectedRefund.customer}
              />

              <DetailRow
                label="Email"
                value={selectedRefund.email}
              />

              <DetailRow
                label="Plan"
                value={selectedRefund.plan}
              />

              <DetailRow
                label="Reason"
                value={selectedRefund.reason}
              />

              <DetailRow
                label="Requested date"
                value={selectedRefund.requestedAt}
              />

              {selectedRefund.status === "Pending" && (
                <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                  <button
                    onClick={() =>
                      updateRefundStatus(
                        selectedRefund.id,
                        "Approved",
                      )
                    }
                    className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Approve request
                  </button>

                  <button
                    onClick={() =>
                      updateRefundStatus(
                        selectedRefund.id,
                        "Rejected",
                      )
                    }
                    className="rounded-xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                  >
                    Reject request
                  </button>
                </div>
              )}

              {selectedRefund.status === "Approved" && (
                <button
                  onClick={() =>
                    updateRefundStatus(
                      selectedRefund.id,
                      "Processed",
                    )
                  }
                  className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Mark as processed (demo)
                </button>
              )}

              <p className="text-xs leading-5 text-slate-500">
                Demo workflow only. No payment provider is contacted
                and no money is transferred.
              </p>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function StatusBadge({
  status,
}: {
  status: RefundStatus;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[status]}`}
    >
      {status}
    </span>
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
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{title}</p>

          <p className="mt-2 break-words text-2xl font-bold tracking-tight">
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className={`shrink-0 rounded-xl p-3 ${iconClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 text-sm last:border-0">
      <span className="shrink-0 text-slate-500">{label}</span>

      <span className="max-w-[65%] break-words text-right font-medium text-slate-800">
        {value}
      </span>
    </div>
  );
}