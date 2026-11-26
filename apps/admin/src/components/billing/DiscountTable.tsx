
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Tag,
  Copy,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Percent,
} from "lucide-react";

type DiscountStatus = "Active" | "Scheduled" | "Expired" | "Disabled";
type DiscountType = "Percentage" | "Fixed amount";

type Discount = {
  id: string;
  code: string;
  name: string;
  type: DiscountType;
  value: number;
  status: DiscountStatus;
  redemptions: number;
  maxRedemptions: number | null;
  startDate: string;
  endDate: string;
};

const initialDiscounts: Discount[] = [
  {
    id: "dsc_001",
    code: "WELCOME20",
    name: "Welcome discount",
    type: "Percentage",
    value: 20,
    status: "Active",
    redemptions: 324,
    maxRedemptions: 1000,
    startDate: "2026-10-01",
    endDate: "2026-12-31",
  },
  {
    id: "dsc_002",
    code: "PRO50",
    name: "Pro plan promotion",
    type: "Fixed amount",
    value: 50,
    status: "Active",
    redemptions: 86,
    maxRedemptions: 200,
    startDate: "2026-10-15",
    endDate: "2026-11-30",
  },
  {
    id: "dsc_003",
    code: "EARLY30",
    name: "Early adopter offer",
    type: "Percentage",
    value: 30,
    status: "Expired",
    redemptions: 500,
    maxRedemptions: 500,
    startDate: "2026-06-01",
    endDate: "2026-08-31",
  },
  {
    id: "dsc_004",
    code: "BLACKFRIDAY",
    name: "Black Friday offer",
    type: "Percentage",
    value: 25,
    status: "Scheduled",
    redemptions: 0,
    maxRedemptions: 2000,
    startDate: "2026-11-20",
    endDate: "2026-11-30",
  },
  {
    id: "dsc_005",
    code: "TEAM100",
    name: "Team annual discount",
    type: "Fixed amount",
    value: 100,
    status: "Disabled",
    redemptions: 12,
    maxRedemptions: 100,
    startDate: "2026-09-01",
    endDate: "2026-12-31",
  },
  {
    id: "dsc_006",
    code: "START15",
    name: "Starter plan offer",
    type: "Percentage",
    value: 15,
    status: "Active",
    redemptions: 147,
    maxRedemptions: null,
    startDate: "2026-10-10",
    endDate: "2027-01-10",
  },
];

const statusStyles: Record<DiscountStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Scheduled: "bg-blue-50 text-blue-700 ring-blue-600/20",
  Expired: "bg-slate-100 text-slate-600 ring-slate-500/20",
  Disabled: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function discountValue(discount: Discount) {
  return discount.type === "Percentage"
    ? `${discount.value}%`
    : `$${discount.value.toFixed(2)}`;
}

export default function DiscountTable() {
  const [discounts, setDiscounts] = useState(initialDiscounts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selected, setSelected] = useState<Discount | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");
  const [formError, setFormError] = useState("");

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [discountType, setDiscountType] =
    useState<DiscountType>("Percentage");
  const [value, setValue] = useState("20");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [startDate, setStartDate] = useState("2026-11-01");
  const [endDate, setEndDate] = useState("2026-12-31");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return discounts.filter((discount) => {
      const matchesSearch =
        !query ||
        discount.code.toLowerCase().includes(query) ||
        discount.name.toLowerCase().includes(query) ||
        discount.id.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || discount.status === statusFilter;

      const matchesType =
        typeFilter === "All" || discount.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [discounts, search, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleDiscounts = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  function resetPage() {
    setPage(1);
  }

  async function copyCode(discountCode: string) {
    try {
      await navigator.clipboard.writeText(discountCode);
      setCopiedCode(discountCode);
      window.setTimeout(() => setCopiedCode(""), 1600);
    } catch {
      setCopiedCode("");
    }
  }

  function createDiscount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const normalizedCode = code.trim().toUpperCase();
    const numericValue = Number(value);
    const maximum = maxRedemptions.trim()
      ? Number(maxRedemptions)
      : null;

    if (!/^[A-Z0-9_-]{3,30}$/.test(normalizedCode)) {
      setFormError(
        "Use 3–30 letters, numbers, hyphens, or underscores for the code."
      );
      return;
    }

    if (
      discounts.some(
        (discount) => discount.code.toUpperCase() === normalizedCode
      )
    ) {
      setFormError("That discount code already exists.");
      return;
    }

    if (!name.trim()) {
      setFormError("Enter a discount name.");
      return;
    }

    if (
      !Number.isFinite(numericValue) ||
      numericValue <= 0 ||
      (discountType === "Percentage" && numericValue > 100)
    ) {
      setFormError(
        discountType === "Percentage"
          ? "Percentage must be greater than 0 and no more than 100."
          : "Enter a fixed discount amount greater than 0."
      );
      return;
    }

    if (
      maximum !== null &&
      (!Number.isInteger(maximum) || maximum < 1)
    ) {
      setFormError("Maximum redemptions must be a positive whole number.");
      return;
    }

    if (!startDate || !endDate || endDate < startDate) {
      setFormError("End date must be on or after the start date.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const status: DiscountStatus =
      endDate < today
        ? "Expired"
        : startDate > today
          ? "Scheduled"
          : "Active";

    const newDiscount: Discount = {
      id: `dsc_${Date.now()}`,
      code: normalizedCode,
      name: name.trim(),
      type: discountType,
      value: numericValue,
      status,
      redemptions: 0,
      maxRedemptions: maximum,
      startDate,
      endDate,
    };

    setDiscounts((current) => [newDiscount, ...current]);
    setSearch("");
    setStatusFilter("All");
    setTypeFilter("All");
    setPage(1);
    setShowCreate(false);
    setCode("");
    setName("");
    setDiscountType("Percentage");
    setValue("20");
    setMaxRedemptions("");
    setStartDate("2026-11-01");
    setEndDate("2026-12-31");
  }

  function toggleDiscount(discount: Discount) {
    const nextStatus: DiscountStatus =
      discount.status === "Disabled" ? "Active" : "Disabled";

    setDiscounts((current) =>
      current.map((item) =>
        item.id === discount.id
          ? { ...item, status: nextStatus }
          : item
      )
    );

    setSelected((current) =>
      current?.id === discount.id
        ? { ...current, status: nextStatus }
        : current
    );
  }

  return (
    <section className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total discounts</p>
            <Tag size={18} className="text-blue-600" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {discounts.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Codes in this workspace
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Active discounts</p>
            <Check size={18} className="text-emerald-600" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {discounts.filter((item) => item.status === "Active").length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Currently marked active
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total redemptions</p>
            <Percent size={18} className="text-violet-600" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {discounts
              .reduce((total, item) => total + item.redemptions, 0)
              .toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Across listed discount codes
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
          <div>
            <h2 className="font-semibold text-slate-900">Discount codes</h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage promotions and redemption limits.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setFormError("");
              setShowCreate(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} />
            Create discount
          </button>
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
                resetPage();
              }}
              placeholder="Search code, name, or ID..."
              aria-label="Search discount codes"
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              resetPage();
            }}
            aria-label="Filter by status"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Expired">Expired</option>
            <option value="Disabled">Disabled</option>
          </select>

          <select
            value={typeFilter}
            onChange={(event) => {
              setTypeFilter(event.target.value);
              resetPage();
            }}
            aria-label="Filter by discount type"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="All">All types</option>
            <option value="Percentage">Percentage</option>
            <option value="Fixed amount">Fixed amount</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Discount</th>
                <th className="px-5 py-3 font-medium">Value</th>
                <th className="px-5 py-3 font-medium">Redemptions</th>
                <th className="px-5 py-3 font-medium">Validity</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {visibleDiscounts.map((discount) => (
                <tr key={discount.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900">
                      {discount.name}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <code>{discount.code}</code>
                      <button
                        type="button"
                        onClick={() => void copyCode(discount.code)}
                        title="Copy discount code"
                        aria-label={`Copy ${discount.code}`}
                        className="rounded p-1 hover:bg-slate-200"
                      >
                        {copiedCode === discount.code ? (
                          <Check size={13} className="text-emerald-600" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                    </div>
                  </td>

                  <td className="px-5 py-4 font-medium text-slate-900">
                    {discountValue(discount)}
                    <div className="mt-1 text-xs font-normal text-slate-500">
                      {discount.type}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-slate-700">
                    {discount.redemptions.toLocaleString()}
                    <div className="mt-1 text-xs text-slate-500">
                      {discount.maxRedemptions === null
                        ? "No limit"
                        : `of ${discount.maxRedemptions.toLocaleString()}`}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-slate-700">
                    <div>{formatDate(discount.startDate)}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      to {formatDate(discount.endDate)}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[discount.status]}`}
                    >
                      {discount.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelected(discount)}
                        title="View discount"
                        aria-label={`View ${discount.code}`}
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleDiscount(discount)}
                        disabled={
                          discount.status === "Expired" ||
                          discount.status === "Scheduled"
                        }
                        className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {discount.status === "Disabled" ? "Enable" : "Disable"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {visibleDiscounts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <Tag size={25} className="mx-auto text-slate-300" />
                    <p className="mt-3 font-medium text-slate-800">
                      No discount codes found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Try another search or create a new discount.
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
              className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm"
              aria-label="Rows per page"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <span>
              {filtered.length === 0
                ? "0 results"
                : `${(safePage - 1) * pageSize + 1}–${Math.min(
                    safePage * pageSize,
                    filtered.length
                  )} of ${filtered.length}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
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

      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowCreate(false);
          }}
        >
          <form
            onSubmit={createDiscount}
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Create discount
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add a promotional code to this workspace.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                aria-label="Close create discount form"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Discount code
                <input
                  required
                  value={code}
                  onChange={(event) => setCode(event.target.value.toUpperCase())}
                  maxLength={30}
                  placeholder="WELCOME20"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal uppercase outline-none focus:border-blue-500"
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Discount name
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Welcome offer"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500"
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Discount type
                <select
                  value={discountType}
                  onChange={(event) =>
                    setDiscountType(event.target.value as DiscountType)
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-blue-500"
                >
                  <option value="Percentage">Percentage</option>
                  <option value="Fixed amount">Fixed amount (USD)</option>
                </select>
              </label>

              <label className="text-sm font-medium text-slate-700">
                Value {discountType === "Percentage" ? "(%)" : "(USD)"}
                <input
                  required
                  type="number"
                  min="0.01"
                  max={discountType === "Percentage" ? 100 : undefined}
                  step="0.01"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500"
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Start date
                <input
                  required
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500"
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                End date
                <input
                  required
                  type="date"
                  min={startDate}
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500"
                />
              </label>

              <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                Maximum redemptions (optional)
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={maxRedemptions}
                  onChange={(event) =>
                    setMaxRedemptions(event.target.value)
                  }
                  placeholder="Leave empty for unlimited"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500"
                />
              </label>
            </div>

            {formError && (
              <p
                role="alert"
                className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700"
              >
                {formError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Create discount
              </button>
            </div>
          </form>
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Discount details
                </p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                  {selected.code}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selected.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close discount details"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Discount value</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {discountValue(selected)}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Redemptions</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {selected.redemptions.toLocaleString()}
                </p>
              </div>
            </div>

            <dl className="mt-5 space-y-3 text-sm">
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
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Maximum redemptions</dt>
                <dd className="text-right text-slate-800">
                  {selected.maxRedemptions === null
                    ? "Unlimited"
                    : selected.maxRedemptions.toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Start date</dt>
                <dd className="text-right text-slate-800">
                  {formatDate(selected.startDate)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">End date</dt>
                <dd className="text-right text-slate-800">
                  {formatDate(selected.endDate)}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex justify-end gap-3">
              {selected.status !== "Expired" &&
                selected.status !== "Scheduled" && (
                  <button
                    type="button"
                    onClick={() => toggleDiscount(selected)}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {selected.status === "Disabled" ? "Enable code" : "Disable code"}
                  </button>
                )}
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs leading-5 text-slate-500">
        Demo data only. Creating or disabling a code updates this page&apos;s
        local state; it does not create or change a live payment-provider coupon.
      </p>
    </section>
  );
}
