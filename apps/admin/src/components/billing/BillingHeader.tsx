
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Plus } from "lucide-react";

type BillingHeaderProps = {
  title: string;
  description: string;
  showBackButton?: boolean;
  actionLabel?: string;
  onAction?: () => void;
};

export default function BillingHeader({
  title,
  description,
  showBackButton = false,
  actionLabel,
  onAction,
}: BillingHeaderProps) {
  const router = useRouter();

  return (
    <header className="mb-6">
      <nav
        aria-label="Breadcrumb"
        className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-500"
      >
        <CreditCard size={15} />
        <span>ModelNow Admin</span>
        <span>/</span>
        <span>Billing</span>
        <span>/</span>
        <span className="font-medium text-slate-700">{title}</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          {showBackButton && (
            <button
              type="button"
              onClick={() => router.push("/billing")}
              aria-label="Back to billing overview"
              className="mt-1 rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {title}
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              {description}
            </p>
          </div>
        </div>

        {actionLabel && (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus size={17} />
            {actionLabel}
          </button>
        )}
      </div>
    </header>
  );
}
