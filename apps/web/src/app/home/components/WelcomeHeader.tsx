"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock3,
  MoreVertical,
  Pin,
  Share2,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type WelcomeHeaderProps = {
  chatTitle?: string;
  isPinned?: boolean;
  onTogglePin?: () => void;
  onShare?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
};

export default function WelcomeHeader({
  isPinned = false,
  onTogglePin,
  onShare,
  onArchive,
  onDelete,
}: WelcomeHeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleMenuAction(action: string) {
    setMenuOpen(false);

    switch (action) {
      case "pin":
        onTogglePin?.();
        break;

      case "share":
        onShare?.();
        break;

      case "archive":
        onArchive?.();
        break;

      case "delete":
        onDelete?.();
        break;
    }
  }

  return (
    <header className="relative z-40 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-7">
      <div className="min-w-0">
        <h2 className="font-semibold text-slate-900">
          ModelNow
        </h2>

        <p className="text-xs text-slate-400">
          AI Workspace
        </p>
      </div>

      <div className="relative flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Dashboard
        </button>

        <button
          type="button"
          aria-label="Chat options"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
            menuOpen
              ? "bg-slate-900 text-white"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          <MoreVertical size={19} />
        </button>

        {menuOpen && (
          <>
            <button
              type="button"
              aria-label="Close chat options"
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setMenuOpen(false)}
            />

            <div
              role="menu"
              aria-label="Chat actions"
              className="absolute right-0 top-11 z-50 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
            >
              <MenuItem
                icon={Pin}
                label={isPinned ? "Unpin Chat" : "Pin Chat"}
                onClick={() => handleMenuAction("pin")}
              />

              <MenuItem
                icon={Share2}
                label="Share"
                onClick={() => handleMenuAction("share")}
              />

              <MenuItem
                icon={Clock3}
                label="Archive"
                onClick={() => handleMenuAction("archive")}
              />

              <div className="my-1 border-t border-slate-100" />

              <MenuItem
                icon={Trash2}
                label="Delete"
                onClick={() => handleMenuAction("delete")}
                danger
              />
            </div>
          </>
        )}
      </div>
    </header>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      <Icon
        size={16}
        className={danger ? "text-red-500" : "text-slate-500"}
      />

      <span>{label}</span>
    </button>
  );
}