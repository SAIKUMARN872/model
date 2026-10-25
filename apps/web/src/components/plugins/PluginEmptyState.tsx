"use client";

import { Plug } from "lucide-react";

type PluginEmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function PluginEmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: PluginEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#f3f4f6]">
        <Plug size={20} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-[#17181a]">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#85898f]">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-xl bg-[#17181a] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#2b2d30]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}