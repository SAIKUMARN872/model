"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Search,
  Download,
  Eye,
  X,
  Receipt,
} from "lucide-react";
import { useRouter } from "next/navigation";

type InvoiceStatus = "Paid" | "Pending" | "Overdue" | "Cancelled";

type Invoice = {
  id: string;
  customer: string;
  email: string;
  plan: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
};

const initialInvoices: Invoice[] = [
  {
    id: "INV-2026-001",
    customer: "Ananya Sharma",
    email: "ananya@example.com",
    plan: "Plus",
    amount: 999,
    issueDate: "2026-11-01",
    dueDate: "2026-11-08",
    status: "Paid",
  },
  {
    id: "INV-2026-002",
    customer: "Rahul Verma",
    email: "rahul@example.com",
    plan: "Pro",
    amount: 2499,
    issueDate: "2026-11-01",
    dueDate: "2026-11-08",
    status: "Pending",
  },
  {
    id: "INV-2026-003",
    customer: "Priya Reddy",
    email: "priya@example.com",
    plan: "Plus",
    amount: 999,
    issueDate: "2026-10-15",
    dueDate: "2026-10-22",
    status: "Overdue",
  },
  {
    id: "INV-2026-004",
    customer: "Arjun Kumar",
    email: "arjun@example.com",
    plan: "Enterprise",
    amount: 9999,
    issueDate: "2026-10-12",
    dueDate: "2026-10-19",
    status: "Paid",
  },
  {
    id: "INV-2026-005",
    customer: "Sneha Patel",
    email: "sneha@example.com",
    plan: "Free",
    amount: 0,
    issueDate: "2026-10-10",
    dueDate: "2026-10-17",
    status: "Paid",
  },
  {
    id: "INV-2026-006",
    customer: "Vikram Rao",
    email: "vikram@example.com",
    plan: "Pro",
    amount: 2499,
    issueDate: "2026-10-05",
    dueDate: "2026-10-12",
    status: "Cancelled",
  },
  {
    id: "INV-2026-007",
    customer: "Meera Nair",
    email: "meera@example.com",
    plan: "Plus",
    amount: 999,
    issueDate: "2026-10-03",
    dueDate: "2026-10-10",
    status: "Paid",
  },
];

const statusStyles: Record<InvoiceStatus, string> = {
  Paid: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Overdue: "bg-red-50 text-red-700",
  Cancelled: "bg-slate-100 text-slate-600",
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

export default function InvoicesPage() {
  const router = useRouter();

  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const matchesSearch =
        !query ||
        invoice.id.toLowerCase().includes(query) ||
        invoice.customer.toLowerCase().includes(query) ||
        invoice.email.toLowerCase().includes(query) ||
        invoice.plan.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  const paidInvoices = invoices.filter(
    (invoice) => invoice.status === "Paid"
  );
  const pendingInvoices = invoices.filter(
    (invoice) => invoice.status === "Pending"
  );
  const overdueInvoices = invoices.filter(
    (invoice) => invoice.status === "Overdue"
  );

  const paidTotal = paidInvoices.reduce(
    (total, invoice) => total + invoice.amount,
    0
  );

  const outstandingTotal = invoices
    .filter(
      (invoice) =>
        invoice.status === "Pending" || invoice.status === "Overdue"
    )
    .reduce((total, invoice) => total + invoice.amount, 0);

  function exportCSV() {
    const headers = [
      "Invoice ID",
      "Customer",
      "Email",
      "Plan",
      "Amount (INR)",
      "Issue Date",
      "Due Date",
      "Status",
    ];

    const rows = filteredInvoices.map((invoice) => [
      invoice.id,
      invoice.customer,
      invoice.email,
      invoice.plan,
      String(invoice.amount),
      invoice.issueDate,
      invoice.dueDate,
      invoice.status,
    ]);

    const escapeCSV = (value: string) =>
      `"${value.replace(/"/g, '""')}"`;

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
    link.download = "modelnow-invoices.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  function markAsPaid(invoiceId: string) {
    setInvoices((current) =>
      current.map((invoice) =>
        invoice.id === invoiceId && invoice.status === "Pending"
          ? { ...invoice, status: "Paid" }
          : invoice
      )
    );

    setSelectedInvoice((current) =>
      current?.id === invoiceId && current.status === "Pending"
        ? { ...current, status: "Paid" }
        : current
    );
  }

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
            Invoices
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Review invoices, track outstanding balances, and monitor payment
            status across ModelNow subscriptions.
          </p>
        </div>

        <button
          type="button"
          onClick={exportCSV}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Download size={17} />
          Export CSV
        </button>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Total Invoices",
            value: invoices.length,
            subtitle: "All recorded invoices",
            icon: FileText,
            style: "bg-blue-50 text-blue-600",
          },
          {
            title: "Paid Invoices",
            value: paidInvoices.length,
            subtitle: formatCurrency(paidTotal) + " collected",
            icon: CheckCircle2,
            style: "bg-emerald-50 text-emerald-600",
          },
          {
            title: "Pending Invoices",
            value: pendingInvoices.length,
            subtitle: "Awaiting payment",
            icon: Clock3,
            style: "bg-amber-50 text-amber-600",
          },
          {
            title: "Overdue Invoices",
            value: overdueInvoices.length,
            subtitle: formatCurrency(
              overdueInvoices.reduce((sum, invoice) => sum + invoice.amount, 0)
            ) + " overdue",
            icon: AlertCircle,
            style: "bg-red-50 text-red-600",
          },
        ].map((card) => {
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
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.style}`}
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
            <h2 className="text-lg font-semibold">Invoice register</h2>
            <p className="mt-1 text-sm text-slate-500">
              Search, filter, and inspect invoice records.
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
                placeholder="Search invoices..."
                aria-label="Search invoices"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter invoices by status"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">All statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Invoice</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Issue date</th>
                <th className="px-4 py-3 font-semibold">Due date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="transition hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-slate-800">
                      {invoice.id}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {invoice.plan} plan
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-slate-800">
                      {invoice.customer}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {invoice.email}
                    </p>
                  </td>

                  <td className="px-4 py-4 text-sm font-semibold">
                    {formatCurrency(invoice.amount)}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {formatDate(invoice.issueDate)}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {formatDate(invoice.dueDate)}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[invoice.status]}`}
                    >
                      {invoice.status}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedInvoice(invoice)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {filteredInvoices.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-sm text-slate-500"
                  >
                    No invoices match your search or selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <span>
            Showing {filteredInvoices.length} of {invoices.length} invoices
          </span>
          <span>Outstanding balance: {formatCurrency(outstandingTotal)}</span>
        </div>
      </section>

      {selectedInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onClick={() => setSelectedInvoice(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="invoice-details-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Receipt size={20} />
                </span>
                <div>
                  <h2
                    id="invoice-details-title"
                    className="text-xl font-bold"
                  >
                    Invoice details
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedInvoice.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                aria-label="Close invoice details"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Invoice amount</p>
              <p className="mt-1 text-3xl font-bold">
                {formatCurrency(selectedInvoice.amount)}
              </p>
              <span
                className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[selectedInvoice.status]}`}
              >
                {selectedInvoice.status}
              </span>
            </div>

            <dl className="mt-5 space-y-3">
              {[
                ["Customer", selectedInvoice.customer],
                ["Email", selectedInvoice.email],
                ["Plan", selectedInvoice.plan],
                ["Issue date", formatDate(selectedInvoice.issueDate)],
                ["Due date", formatDate(selectedInvoice.dueDate)],
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

            {selectedInvoice.status === "Pending" && (
              <button
                type="button"
                onClick={() => markAsPaid(selectedInvoice.id)}
                className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Mark as paid (demo)
              </button>
            )}

            <button
              type="button"
              onClick={() => setSelectedInvoice(null)}
              className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </section>
        </div>
      )}

      <footer className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <FileText size={18} />
        </span>

        <div>
          <p className="text-sm font-semibold text-slate-800">
            Invoice data status
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            These are sample invoice records. Live invoice generation, tax
            calculations, payment confirmation, and PDF downloads require
            backend integration.
          </p>
        </div>
      </footer>
    </main>
  );
}