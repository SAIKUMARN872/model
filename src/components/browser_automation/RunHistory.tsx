"use client";

import {
  CheckCircle2,
  Clock3,
  History,
  RotateCcw,
  Trash2,
  XCircle,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState } from "react";

export type RunHistoryStatus =
  | "completed"
  | "cancelled"
  | "failed";

export type RunHistoryItem = {
  id: string;
  task: string;
  status: RunHistoryStatus;
  executionTime: number;
  createdAt: number;
  summary?: string;
};

type RunHistoryProps = {
  maxItems?: number;
  onLoadTask?: (task: string) => void;
};

const STORAGE_KEY =
  "modelnow-browser-automation-history";

function readHistory(): RunHistoryItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(
      STORAGE_KEY,
    );

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

export function saveRunToHistory(
  item: RunHistoryItem,
) {
  if (typeof window === "undefined") {
    return;
  }

  const current = readHistory();

  const filtered = current.filter(
    (entry) => entry.id !== item.id,
  );

  const updated = [item, ...filtered].slice(
    0,
    50,
  );

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updated),
  );

  window.dispatchEvent(
    new Event("modelnow-history-updated"),
  );
}

function formatDate(timestamp: number) {
  try {
    return new Date(timestamp).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  } catch {
    return "Unknown date";
  }
}

function formatExecutionTime(
  executionTime: number,
) {
  if (executionTime < 1000) {
    return `${executionTime}ms`;
  }

  return `${(executionTime / 1000).toFixed(2)}s`;
}

function getStatusStyles(
  status: RunHistoryStatus,
) {
  switch (status) {
    case "completed":
      return {
        card: "border-emerald-200 bg-emerald-50/30",
        icon: "bg-emerald-50 text-emerald-600",
        badge:
          "bg-emerald-50 text-emerald-700",
        label: "Completed",
        description:
          "Task finished successfully",
      };

    case "cancelled":
      return {
        card: "border-slate-200 bg-slate-50/60",
        icon: "bg-slate-100 text-slate-600",
        badge:
          "bg-slate-100 text-slate-700",
        label: "Cancelled",
        description:
          "Task was cancelled before completion",
      };

    case "failed":
      return {
        card: "border-red-200 bg-red-50/30",
        icon: "bg-red-50 text-red-600",
        badge: "bg-red-50 text-red-700",
        label: "Failed",
        description:
          "Task could not be completed",
      };
  }
}

function StatusIcon({
  status,
}: {
  status: RunHistoryStatus;
}) {
  if (status === "completed") {
    return <CheckCircle2 size={20} />;
  }

  if (status === "failed") {
    return <XCircle size={20} />;
  }

  return <Clock3 size={20} />;
}

export default function RunHistory({
  maxItems = 10,
  onLoadTask,
}: RunHistoryProps) {
  const [history, setHistory] =
    useState<RunHistoryItem[]>([]);

  const [isOpen, setIsOpen] =
    useState(false);

  useEffect(() => {
    const loadHistory = () => {
      setHistory(readHistory());
    };

    loadHistory();

    window.addEventListener(
      "storage",
      loadHistory,
    );

    window.addEventListener(
      "modelnow-history-updated",
      loadHistory,
    );

    return () => {
      window.removeEventListener(
        "storage",
        loadHistory,
      );

      window.removeEventListener(
        "modelnow-history-updated",
        loadHistory,
      );
    };
  }, []);

  const visibleHistory =
    history.slice(0, maxItems);

  const completedCount =
    history.filter(
      (item) => item.status === "completed",
    ).length;

  const cancelledCount =
    history.filter(
      (item) => item.status === "cancelled",
    ).length;

  const failedCount =
    history.filter(
      (item) => item.status === "failed",
    ).length;

  const clearHistory = () => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(
      STORAGE_KEY,
    );

    setHistory([]);

    window.dispatchEvent(
      new Event("modelnow-history-updated"),
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* History Header */}
      <button
        type="button"
        onClick={() =>
          setIsOpen((value) => !value)
        }
        className="group flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-slate-50 sm:p-5"
        aria-expanded={isOpen}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <History size={19} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900">
                Run History
              </h2>

              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                {history.length}
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Recent browser automation executions.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {history.length > 0 && (
            <span className="hidden text-xs font-medium text-slate-400 sm:block">
              {isOpen
                ? "Hide history"
                : "View history"}
            </span>
          )}

          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition group-hover:bg-slate-100">
            <ChevronDown
              size={17}
              className={`transition-transform duration-200 ${
                isOpen
                  ? "rotate-180"
                  : "rotate-0"
              }`}
            />
          </div>
        </div>
      </button>

      {/* Expanded History */}
      {isOpen && (
        <div className="border-t border-slate-200">

          {/* Summary */}
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 sm:p-5">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Total
              </p>

              <p className="mt-1 text-lg font-bold text-slate-900">
                {history.length}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Completed
              </p>

              <p className="mt-1 text-lg font-bold text-emerald-600">
                {completedCount}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Cancelled
              </p>

              <p className="mt-1 text-lg font-bold text-slate-700">
                {cancelledCount}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Failed
              </p>

              <p className="mt-1 text-lg font-bold text-red-600">
                {failedCount}
              </p>
            </div>
          </div>

          {/* History Actions */}
          {history.length > 0 && (
            <div className="flex justify-end px-4 pb-4 sm:px-5">
              <button
                type="button"
                onClick={clearHistory}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
              >
                <Trash2 size={14} />
                Clear
              </button>
            </div>
          )}

          {/* History Items */}
          {visibleHistory.length > 0 ? (
            <div className="space-y-3 border-t border-slate-200 p-4 sm:p-5">
              {visibleHistory.map((item) => {
                const styles =
                  getStatusStyles(
                    item.status,
                  );

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-4 sm:p-5 ${styles.card}`}
                  >
                    <div className="flex flex-col gap-4">

                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
                        >
                          <StatusIcon
                            status={item.status}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <h3 className="break-words text-sm font-semibold text-slate-900">
                                {item.task}
                              </h3>

                              <p className="mt-1 text-xs text-slate-500">
                                {styles.description}
                              </p>
                            </div>

                            <span
                              className={`inline-flex w-fit shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${styles.badge}`}
                            >
                              {styles.label}
                            </span>
                          </div>

                          {item.summary && (
                            <div className="mt-4 rounded-xl bg-white/70 p-3 text-xs leading-5 text-slate-600">
                              {item.summary}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 size={14} />
                            {formatExecutionTime(
                              item.executionTime,
                            )}
                          </span>

                          <span>
                            {formatDate(
                              item.createdAt,
                            )}
                          </span>
                        </div>

                        {onLoadTask && (
                          <button
                            type="button"
                            onClick={() =>
                              onLoadTask(
                                item.task,
                              )
                            }
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                          >
                            <RotateCcw size={15} />
                            Run again
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border-t border-slate-200 p-8 text-center">
              <History
                size={24}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-semibold text-slate-700">
                No run history yet
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Completed, cancelled, and failed browser
                automation runs will appear here.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}