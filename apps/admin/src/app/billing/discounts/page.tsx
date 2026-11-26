"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgePercent,
  Search,
  Download,
  Eye,
  X,
  Plus,
  CalendarDays,
  CheckCircle2,
  PauseCircle,
  TicketPercent,
} from "lucide-react";

type DiscountStatus = "Active" | "Scheduled" | "Expired" | "Inactive";
type DiscountType = "Percentage" | "Fixed amount";

type Discount = {
  id: string;
  code: string;
  name: string;
  type: DiscountType;
  value: number;
  appliesTo: string;
  usageLimit: number;
  used: number;
  startDate: string;
  endDate: string;
  status: DiscountStatus;
};

const initialDiscounts: Discount[] = [
  {
    id: "DISC-001",
    code: "WELCOME20",
    name: "New Customer Offer",
    type: "Percentage",
    value: 20,
    appliesTo: "All plans",
    usageLimit: 500,
    used: 184,
    startDate: "2026-10-01",
    endDate: "2026-12-31",
    status: "Active",
  },
  {
    id: "DISC-002",
    code: "PRO500",
    name: "Pro Plan Promotion",
    type: "Fixed amount",
    value: 500,
    appliesTo: "ModelNow Pro",
    usageLimit: 200,
    used: 73,
    startDate: "2026-10-15",
    endDate: "2026-11-30",
    status: "Active",
  },
  {
    id: "DISC-003",
    code: "FESTIVE25",
    name: "Festive Season Sale",
    type: "Percentage",
    value: 25,
    appliesTo: "All plans",
    usageLimit: 1000,
    used: 0,
    startDate: "2026-11-15",
    endDate: "2026-12-15",
    status: "Scheduled",
  },
  {
    id: "DISC-004",
    code: "PLUS100",
    name: "Plus Plan Discount",
    type: "Fixed amount",
    value: 100,
    appliesTo: "ModelNow Plus",
    usageLimit: 300,
    used: 246,
    startDate: "2026-09-01",
    endDate: "2026-10-15",
    status: "Expired",
  },
  {
    id: "DISC-005",
    code: "EARLYBIRD",
    name: "Early Access Offer",
    type: "Percentage",
    value: 15,
    appliesTo: "ModelNow Pro",
    usageLimit: 100,
    used: 41,
    startDate: "2026-10-10",
    endDate: "2026-12-10",
    status: "Inactive",
  },
  {
    id: "DISC-006",
    code: "STARTUP10",
    name: "Startup Offer",
    type: "Percentage",
    value: 10,
    appliesTo: "All plans",
    usageLimit: 250,
    used: 96,
    startDate: "2026-10-20",
    endDate: "2027-01-31",
    status: "Active",
  },
];

const statusStyles: Record<DiscountStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Scheduled: "bg-blue-50 text-blue-700 ring-blue-200",
  Expired: "bg-slate-100 text-slate-600 ring-slate-200",
  Inactive: "bg-amber-50 text-amber-700 ring-amber-200",
};

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatValue = (discount: Discount) =>
  discount.type === "Percentage"
    ? `${discount.value}%`
    : `₹${discount.value.toLocaleString("en-IN")}`;

export default function DiscountsPage() {
  const router = useRouter();

  const [discounts, setDiscounts] =
    useState<Discount[]>(initialDiscounts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedDiscount, setSelectedDiscount] =
    useState<Discount | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    code: "",
    name: "",
    type: "Percentage" as DiscountType,
    value: "10",
    appliesTo: "All plans",
    usageLimit: "100",
    startDate: "2026-11-03",
    endDate: "2026-12-31",
  });

  const stats = useMemo(() => {
    const active = discounts.filter(
      (discount) => discount.status === "Active",
    );

    return {
      total: discounts.length,
      active: active.length,
      totalUsed: discounts.reduce(
        (sum, discount) => sum + discount.used,
        0,
      ),
      availableUses: active.reduce(
        (sum, discount) =>
          sum + Math.max(0, discount.usageLimit - discount.used),
        0,
      ),
    };
  }, [discounts]);

  const filteredDiscounts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return discounts.filter((discount) => {
      const matchesSearch =
        !query ||
        discount.code.toLowerCase().includes(query) ||
        discount.name.toLowerCase().includes(query) ||
        discount.appliesTo.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || discount.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [discounts, search, statusFilter]);

  function createDiscount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const code = form.code.trim().toUpperCase();
    const value = Number(form.value);
    const usageLimit = Number(form.usageLimit);

    if (!code || !form.name.trim()) {
      setNotice("Enter a discount code and campaign name.");
      return;
    }

    if (
      discounts.some(
        (discount) => discount.code.toLowerCase() === code.toLowerCase(),
      )
    ) {
      setNotice("This discount code already exists.");
      return;
    }

    if (
      !Number.isFinite(value) ||
      value <= 0 ||
      !Number.isFinite(usageLimit) ||
      usageLimit < 1
    ) {
      setNotice("Enter a valid discount value and usage limit.");
      return;
    }

    if (form.type === "Percentage" && value > 100) {
      setNotice("Percentage discounts cannot exceed 100%.");
      return;
    }

    if (form.endDate < form.startDate) {
      setNotice("The end date must be on or after the start date.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const status: DiscountStatus =
      form.endDate < today
        ? "Expired"
        : form.startDate > today
          ? "Scheduled"
          : "Active";

    const newDiscount: Discount = {
      id: `DISC-${String(Date.now()).slice(-6)}`,
      code,
      name: form.name.trim(),
      type: form.type,
      value,
      appliesTo: form.appliesTo,
      usageLimit: Math.floor(usageLimit),
      used: 0,
      startDate: form.startDate,
      endDate: form.endDate,
      status,
    };

    setDiscounts((current) => [newDiscount, ...current]);
    setShowCreateForm(false);
    setForm({
      code: "",
      name: "",
      type: "Percentage",
      value: "10",
      appliesTo: "All plans",
      usageLimit: "100",
      startDate: "2026-11-03",
      endDate: "2026-12-31",
    });
    setNotice(`Discount code ${code} created in demo mode.`);
  }

  function toggleDiscount(id: string) {
    setDiscounts((current) =>
      current.map((discount) => {
        if (discount.id !== id) return discount;

        const status: DiscountStatus =
          discount.status === "Inactive" ? "Active" : "Inactive";

        return { ...discount, status };
      }),
    );

    setSelectedDiscount((current) => {
      if (!current || current.id !== id) return current;

      return {
        ...current,
        status: current.status === "Inactive" ? "Active" : "Inactive",
      };
    });

    setNotice("Discount status updated in demo mode.");
  }

  function exportCSV() {
    const headers = [
      "ID",
      "Code",
      "Campaign",
      "Type",
      "Value",
      "Applies To",
      "Usage Limit",
      "Used",
      "Start Date",
      "End Date",
      "Status",
    ];

    const rows = filteredDiscounts.map((discount) => [
      discount.id,
      discount.code,
      discount.name,
      discount.type,
      discount.value,
      discount.appliesTo,
      discount.usageLimit,
      discount.used,
      discount.startDate,
      discount.endDate,
      discount.status,
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
    link.download = "modelnow-discounts.csv";
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
                <span className="text-blue-600">Discounts</span>
              </div>

              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Discounts & Promotions
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Create promotional codes and manage campaign usage.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={exportCSV}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50"
            >
              <Download size={17} />
              Export CSV
            </button>

            <button
              onClick={() => {
                setNotice("");
                setShowCreateForm(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus size={17} />
              Create discount
            </button>
          </div>
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
            title="Total Campaigns"
            value={String(stats.total)}
            description="All discount codes"
            icon={<TicketPercent size={20} />}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Active Campaigns"
            value={String(stats.active)}
            description="Currently enabled in demo"
            icon={<CheckCircle2 size={20} />}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Total Redemptions"
            value={stats.totalUsed.toLocaleString("en-IN")}
            description="Recorded sample usage"
            icon={<BadgePercent size={20} />}
            iconClass="bg-violet-50 text-violet-600"
          />

          <StatCard
            title="Remaining Uses"
            value={stats.availableUses.toLocaleString("en-IN")}
            description="Available uses across active campaigns"
            icon={<CalendarDays size={20} />}
            iconClass="bg-amber-50 text-amber-600"
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-semibold">Discount campaigns</h2>
              <p className="mt-1 text-sm text-slate-500">
                Search codes, inspect usage, and manage campaign status.
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
                  placeholder="Search code or campaign..."
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 sm:w-72"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              >
                <option value="All">All statuses</option>
                <option value="Active">Active</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Expired">Expired</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Campaign</th>
                  <th className="px-5 py-4 font-semibold">Code</th>
                  <th className="px-5 py-4 font-semibold">Discount</th>
                  <th className="px-5 py-4 font-semibold">Usage</th>
                  <th className="px-5 py-4 font-semibold">Valid until</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-right font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredDiscounts.map((discount) => {
                  const usagePercent =
                    discount.usageLimit > 0
                      ? Math.min(
                          100,
                          (discount.used / discount.usageLimit) * 100,
                        )
                      : 0;

                  return (
                    <tr
                      key={discount.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {discount.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {discount.appliesTo}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-2.5 py-1.5 font-mono text-xs font-bold tracking-wide">
                          {discount.code}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-semibold">
                        {formatValue(discount)}
                        <p className="mt-1 text-xs font-normal text-slate-500">
                          {discount.type}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs text-slate-600">
                            {discount.used}/{discount.usageLimit}
                          </span>
                          <span className="text-xs text-slate-400">
                            {Math.round(usagePercent)}%
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(discount.endDate)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[discount.status]}`}
                        >
                          {discount.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedDiscount(discount)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Eye size={15} />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredDiscounts.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      No discount campaigns match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
            Showing {filteredDiscounts.length} of {discounts.length} campaigns
          </div>
        </section>

        <section className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <BadgePercent size={20} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <h3 className="text-sm font-semibold text-amber-900">
              Demo mode
            </h3>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              Campaigns are stored in local component state. Connecting
              discount validation to checkout requires backend APIs, server-side
              validation, usage-limit enforcement, and subscription/payment
              integration.
            </p>
          </div>
        </section>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-discount-title"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 p-5">
              <div>
                <h2 id="create-discount-title" className="text-xl font-bold">
                  Create discount
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Configure a new promotional code.
                </p>
              </div>
              <button
                onClick={() => setShowCreateForm(false)}
                aria-label="Close create discount form"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={createDiscount} className="space-y-4 p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Discount code">
                  <input
                    required
                    value={form.code}
                    onChange={(event) =>
                      setForm({ ...form, code: event.target.value })
                    }
                    placeholder="e.g. LAUNCH20"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Campaign name">
                  <input
                    required
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    placeholder="Launch promotion"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Discount type">
                  <select
                    value={form.type}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        type: event.target.value as DiscountType,
                      })
                    }
                    className="form-input"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed amount">Fixed amount (₹)</option>
                  </select>
                </FormField>

                <FormField label={form.type === "Percentage" ? "Percentage" : "Amount (₹)"}>
                  <input
                    required
                    type="number"
                    min="1"
                    max={form.type === "Percentage" ? 100 : undefined}
                    value={form.value}
                    onChange={(event) =>
                      setForm({ ...form, value: event.target.value })
                    }
                    className="form-input"
                  />
                </FormField>

                <FormField label="Applies to">
                  <select
                    value={form.appliesTo}
                    onChange={(event) =>
                      setForm({ ...form, appliesTo: event.target.value })
                    }
                    className="form-input"
                  >
                    <option>All plans</option>
                    <option>ModelNow Plus</option>
                    <option>ModelNow Pro</option>
                    <option>ModelNow Enterprise</option>
                  </select>
                </FormField>

                <FormField label="Maximum redemptions">
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={form.usageLimit}
                    onChange={(event) =>
                      setForm({ ...form, usageLimit: event.target.value })
                    }
                    className="form-input"
                  />
                </FormField>

                <FormField label="Start date">
                  <input
                    required
                    type="date"
                    value={form.startDate}
                    onChange={(event) =>
                      setForm({ ...form, startDate: event.target.value })
                    }
                    className="form-input"
                  />
                </FormField>

                <FormField label="End date">
                  <input
                    required
                    type="date"
                    min={form.startDate}
                    value={form.endDate}
                    onChange={(event) =>
                      setForm({ ...form, endDate: event.target.value })
                    }
                    className="form-input"
                  />
                </FormField>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Create campaign
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selectedDiscount && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedDiscount(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="discount-details-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Discount details
                </p>
                <h2
                  id="discount-details-title"
                  className="mt-1 text-xl font-bold"
                >
                  {selectedDiscount.name}
                </h2>
              </div>

              <button
                onClick={() => setSelectedDiscount(null)}
                aria-label="Close discount details"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Discount code</p>
                <p className="mt-1 font-mono text-2xl font-bold">
                  {selectedDiscount.code}
                </p>
                <p className="mt-2 text-lg font-semibold text-blue-600">
                  {formatValue(selectedDiscount)}
                </p>
                <span
                  className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[selectedDiscount.status]}`}
                >
                  {selectedDiscount.status}
                </span>
              </div>

              <DetailRow label="Campaign ID" value={selectedDiscount.id} />
              <DetailRow label="Applies to" value={selectedDiscount.appliesTo} />
              <DetailRow
                label="Redemptions"
                value={`${selectedDiscount.used} of ${selectedDiscount.usageLimit}`}
              />
              <DetailRow
                label="Start date"
                value={formatDate(selectedDiscount.startDate)}
              />
              <DetailRow
                label="End date"
                value={formatDate(selectedDiscount.endDate)}
              />

              {selectedDiscount.status !== "Expired" &&
                selectedDiscount.status !== "Scheduled" && (
                  <button
                    onClick={() => toggleDiscount(selectedDiscount.id)}
                    className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      selectedDiscount.status === "Inactive"
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "border border-amber-200 text-amber-700 hover:bg-amber-50"
                    }`}
                  >
                    {selectedDiscount.status === "Inactive"
                      ? "Activate discount (demo)"
                      : "Deactivate discount (demo)"}
                  </button>
                )}

              <p className="text-xs leading-5 text-slate-500">
                Changes apply only to this page&apos;s temporary state.
              </p>
            </div>
          </section>
        </div>
      )}

      <style jsx>{`
        .form-input {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 0.65rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
          background: white;
        }

        .form-input:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgb(219 234 254);
        }
      `}</style>
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

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
    </label>
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