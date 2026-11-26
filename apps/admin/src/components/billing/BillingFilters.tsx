
"use client";

import {
  Search,
  RotateCcw,
  CalendarDays,
  Filter,
  X,
} from "lucide-react";

export type BillingFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  statuses?: string[];
  startDate?: string;
  onStartDateChange?: (value: string) => void;
  endDate?: string;
  onEndDateChange?: (value: string) => void;
  onReset?: () => void;
  searchPlaceholder?: string;
  showDateFilters?: boolean;
  resultCount?: number;
};

export default function BillingFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  statuses = ["All", "Active", "Pending", "Failed", "Cancelled"],
  startDate = "",
  onStartDateChange,
  endDate = "",
  onEndDateChange,
  onReset,
  searchPlaceholder = "Search billing records...",
  showDateFilters = true,
  resultCount,
}: BillingFiltersProps) {
  const hasFilters =
    search.trim() !== "" ||
    status !== "All" ||
    startDate !== "" ||
    endDate !== "";

  function resetFilters() {
    if (onReset) {
      onReset();
      return;
    }

    onSearchChange("");
    onStatusChange("All");
    onStartDateChange?.("");
    onEndDateChange?.("");
  }

  return (
    <section
      aria-label="Billing filters"
      className="rounded-xl border border-slate-200 bg-white p-4"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter size={17} className="text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-800">
            Filters
          </h2>
          {hasFilters && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
              Applied
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {typeof resultCount === "number" && (
            <span className="text-xs text-slate-500">
              {resultCount.toLocaleString()} results
            </span>
          )}

          <button
            type="button"
            onClick={resetFilters}
            disabled={!hasFilters}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="relative min-w-0">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Search billing records"
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="relative min-w-0">
          <Filter
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            aria-label="Filter by status"
            className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All statuses" : item}
              </option>
            ))}
          </select>
        </div>

        {showDateFilters && (
          <>
            <label className="relative block min-w-0">
              <CalendarDays
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(event) =>
                  onStartDateChange?.(event.target.value)
                }
                aria-label="Start date"
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="relative block min-w-0">
              <CalendarDays
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) =>
                  onEndDateChange?.(event.target.value)
                }
                aria-label="End date"
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </>
        )}
      </div>

      {showDateFilters && (startDate || endDate) && (
        <p className="mt-3 text-xs text-slate-500">
          Date range: {startDate || "Any date"} — {endDate || "Any date"}
        </p>
      )}
    </section>
  );
}
