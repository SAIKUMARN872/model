
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Download,
  FileText,
} from "lucide-react";

type InvoiceStatus =
  | "Paid"
  | "Open"
  | "Overdue"
  | "Void";

type Invoice = {
  id: string;
  customer: string;
  email: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  description: string;
};

const sampleInvoices: Invoice[] = [
  {
    id: "INV-3001",
    customer: "Aarav Sharma",
    email: "aarav@example.com",
    amount: 49,
    currency: "USD",
    status: "Paid",
    issueDate: "Nov 01, 2026",
    dueDate: "Nov 01, 2026",
    description: "ModelNow Pro subscription",
  },
  {
    id: "INV-3002",
    customer: "Priya Reddy",
    email: "priya@example.com",
    amount: 19,
    currency: "USD",
    status: "Paid",
    issueDate: "Nov 01, 2026",
    dueDate: "Nov 08, 2026",
    description: "ModelNow Plus subscription",
  },
  {
    id: "INV-3003",
    customer: "Daniel Wilson",
    email: "daniel@example.com",
    amount: 499,
    currency: "USD",
    status: "Open",
    issueDate: "Nov 02, 2026",
    dueDate: "Nov 16, 2026",
    description: "Enterprise subscription",
  },
  {
    id: "INV-3004",
    customer: "Sneha Kumar",
    email: "sneha@example.com",
    amount: 19,
    currency: "USD",
    status: "Overdue",
    issueDate: "Oct 01, 2026",
    dueDate: "Oct 15, 2026",
    description: "ModelNow Plus subscription",
  },
  {
    id: "INV-3005",
    customer: "Michael Brown",
    email: "michael@example.com",
    amount: 49,
    currency: "USD",
    status: "Paid",
    issueDate: "Oct 25, 2026",
    dueDate: "Nov 01, 2026",
    description: "ModelNow Pro subscription",
  },
  {
    id: "INV-3006",
    customer: "Ananya Rao",
    email: "ananya@example.com",
    amount: 190,
    currency: "USD",
    status: "Open",
    issueDate: "Nov 02, 2026",
    dueDate: "Dec 02, 2026",
    description: "Annual ModelNow Plus subscription",
  },
  {
    id: "INV-3007",
    customer: "James Miller",
    email: "james@example.com",
    amount: 49,
    currency: "USD",
    status: "Void",
    issueDate: "Oct 20, 2026",
    dueDate: "Oct 27, 2026",
    description: "Voided ModelNow Pro invoice",
  },
  {
    id: "INV-3008",
    customer: "Kavya Reddy",
    email: "kavya@example.com",
    amount: 19,
    currency: "USD",
    status: "Paid",
    issueDate: "Oct 18, 2026",
    dueDate: "Oct 25, 2026",
    description: "ModelNow Plus subscription",
  },
];

const statusStyles: Record<InvoiceStatus, string> = {
  Paid: "bg-emerald-50 text-emerald-700",
  Open: "bg-blue-50 text-blue-700",
  Overdue: "bg-rose-50 text-rose-700",
  Void: "bg-slate-100 text-slate-600",
};

type InvoiceTableProps = {
  invoices?: Invoice[];
  pageSize?: number;
  onViewInvoice?: (invoice: Invoice) => void;
};

export default function InvoiceTable({
  invoices = sampleInvoices,
  pageSize = 5,
  onViewInvoice,
}: InvoiceTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] =
    useState<Invoice | null>(null);

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const matchesSearch =
        !query ||
        invoice.id.toLowerCase().includes(query) ||
        invoice.customer.toLowerCase().includes(query) ||
        invoice.email.toLowerCase().includes(query) ||
        invoice.description.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  const safePageSize = Math.max(1, pageSize);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInvoices.length / safePageSize),
  );

  const safePage = Math.min(currentPage, totalPages);

  const pageInvoices = filteredInvoices.slice(
    (safePage - 1) * safePageSize,
    safePage * safePageSize,
  );

  const paidTotal = invoices
    .filter((invoice) => invoice.status === "Paid")
    .reduce((total, invoice) => total + invoice.amount, 0);

  const openCount = invoices.filter(
    (invoice) => invoice.status === "Open",
  ).length;

  const overdueCount = invoices.filter(
    (invoice) => invoice.status === "Overdue",
  ).length;

  function formatAmount(amount: number, currency: string) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  function exportCsv() {
    const headers = [
      "Invoice ID",
      "Customer",
      "Email",
      "Amount",
      "Currency",
      "Status",
      "Issue Date",
      "Due Date",
      "Description",
    ];

    const rows = filteredInvoices.map((invoice) => [
      invoice.id,
      invoice.customer,
      invoice.email,
      invoice.amount,
      invoice.currency,
      invoice.status,
      invoice.issueDate,
      invoice.dueDate,
      invoice.description,
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
    link.download = "modelnow-invoices.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function viewInvoice(invoice: Invoice) {
    if (onViewInvoice) {
      onViewInvoice(invoice);
    } else {
      setSelectedInvoice(invoice);
    }
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("All");
    setCurrentPage(1);
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Invoices
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Review billing documents, due dates, and invoice status.
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
          <p className="text-xs text-slate-500">Paid invoice total</p>
          <p className="mt-1 text-xl font-semibold text-emerald-700">
            {formatAmount(paidTotal, invoices[0]?.currency ?? "USD")}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Open invoices</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {openCount}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Overdue invoices</p>
          <p className="mt-1 text-xl font-semibold text-rose-700">
            {overdueCount}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
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
            placeholder="Search invoice ID, customer, or email..."
            aria-label="Search invoices"
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setCurrentPage(1);
          }}
          aria-label="Filter invoices by status"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
        >
          <option value="All">All statuses</option>
          <option value="Paid">Paid</option>
          <option value="Open">Open</option>
          <option value="Overdue">Overdue</option>
          <option value="Void">Void</option>
        </select>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3.5 font-medium">Invoice</th>
              <th className="px-5 py-3.5 font-medium">Customer</th>
              <th className="px-5 py-3.5 font-medium">Amount</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5 font-medium">Issue date</th>
              <th className="px-5 py-3.5 font-medium">Due date</th>
              <th className="px-5 py-3.5 text-right font-medium">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {pageInvoices.map((invoice) => (
              <tr
                key={invoice.id}
                className="transition hover:bg-slate-50/70"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <FileText
                      size={17}
                      className="shrink-0 text-slate-400"
                    />
                    <span className="font-medium text-slate-900">
                      {invoice.id}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {invoice.description}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <div className="font-medium text-slate-800">
                    {invoice.customer}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {invoice.email}
                  </p>
                </td>

                <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-900">
                  {formatAmount(invoice.amount, invoice.currency)}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[invoice.status]}`}
                  >
                    {invoice.status}
                  </span>
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                  {invoice.issueDate}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                  {invoice.dueDate}
                </td>

                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => viewInvoice(invoice)}
                    aria-label={`View invoice ${invoice.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Eye size={14} />
                    View
                  </button>
                </td>
              </tr>
            ))}

            {pageInvoices.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    No invoices found
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Try changing your search or status filter.
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
          {filteredInvoices.length === 0
            ? 0
            : (safePage - 1) * safePageSize + 1}
          {"–"}
          {Math.min(
            safePage * safePageSize,
            filteredInvoices.length,
          )}{" "}
          of {filteredInvoices.length} invoices
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

      {selectedInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onClick={() => setSelectedInvoice(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="invoice-dialog-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3
                  id="invoice-dialog-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  Invoice details
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedInvoice.id}
                </p>
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

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Invoice amount</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {formatAmount(
                  selectedInvoice.amount,
                  selectedInvoice.currency,
                )}
              </p>
              <span
                className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[selectedInvoice.status]}`}
              >
                {selectedInvoice.status}
              </span>
            </div>

            <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                ["Customer", selectedInvoice.customer],
                ["Email", selectedInvoice.email],
                ["Description", selectedInvoice.description],
                ["Issue date", selectedInvoice.issueDate],
                ["Due date", selectedInvoice.dueDate],
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
                onClick={() => setSelectedInvoice(null)}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-slate-100 px-5 py-3">
        <p className="text-xs leading-5 text-slate-400">
          Illustrative invoice data. Connect your billing backend to load
          real invoices and provide downloadable invoice documents.
        </p>
      </div>
    </section>
  );
}
