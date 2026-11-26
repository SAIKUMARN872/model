
"use client";

import type { ReactNode } from "react";
import { FileSearch, Plus, RefreshCw } from "lucide-react";

export type BillingEmptyStateProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  onReset?: () => void;
  icon?: ReactNode;
  actionIcon?: ReactNode;
  compact?: boolean;
};

export default function BillingEmptyState({
  title = "No records found",
  description = "There are no records to display right now. Try adjusting your filters or check back later.",
  actionLabel,
  onAction,
  onReset,
  icon,
  actionIcon,
  compact = false,
}: BillingEmptyStateProps) {
  return (
    <div
      className={`flex w-full flex-col items-center justify-center text-center ${
        compact ? "px-4 py-8" : "px-6 py-16"
      }`}
      role="status"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500">
        {icon ?? <FileSearch size={25} strokeWidth={1.7} />}
      </div>

      <h3 className="text-base font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {actionIcon ?? <Plus size={16} />}
            {actionLabel}
          </button>
        )}

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
          >
            <RefreshCw size={15} />
            Reset filters
          </button>
        )}
      </div>
    </div>
  );
}
