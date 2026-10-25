"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  FileText,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

type TaskResultPanelProps = {
  task: string;
  executionTime: number;
  onRunAnother: () => void;
};

type TaskType =
  | "movie"
  | "shopping"
  | "travel"
  | "food"
  | "general";

function getTaskType(task: string): TaskType {
  const value = task.toLowerCase();

  if (
    value.includes("movie") ||
    value.includes("film") ||
    value.includes("cinema") ||
    value.includes("ticket")
  ) {
    return "movie";
  }

  if (
    value.includes("laptop") ||
    value.includes("computer") ||
    value.includes("phone") ||
    value.includes("product") ||
    value.includes("buy") ||
    value.includes("shopping")
  ) {
    return "shopping";
  }

  if (
    value.includes("flight") ||
    value.includes("hotel") ||
    value.includes("travel") ||
    value.includes("trip")
  ) {
    return "travel";
  }

  if (
    value.includes("restaurant") ||
    value.includes("food") ||
    value.includes("order") ||
    value.includes("delivery")
  ) {
    return "food";
  }

  return "general";
}

function getResultData(task: string) {
  const type = getTaskType(task);

  switch (type) {
    case "movie":
      return {
        category: "Movie booking",
        title: "Movie tickets prepared",
        description:
          "The requested movie booking flow was completed and verified.",
        details: [
          ["Movie", "Tonight's Featured Movie"],
          ["Showtime", "8:30 PM"],
          ["Seats", "2 seats"],
          ["Theater", "ModelNow Cinema"],
          ["Total", "₹480"],
        ],
      };

    case "shopping":
      return {
        category: "Shopping task",
        title: "Product checkout prepared",
        description:
          "The requested product was found, reviewed, and prepared for checkout.",
        details: [
          ["Product", "Laptop Pro"],
          ["Quantity", "1"],
          ["Price", "$899"],
          ["Delivery", "Standard delivery"],
          ["Status", "Verified"],
        ],
      };

    case "travel":
      return {
        category: "Travel booking",
        title: "Travel option verified",
        description:
          "The requested travel flow was completed and the selected option was verified.",
        details: [
          ["Route", "Best available route"],
          ["Date", "Selected travel date"],
          ["Passengers", "1"],
          ["Status", "Verified"],
        ],
      };

    case "food":
      return {
        category: "Food order",
        title: "Food order prepared",
        description:
          "The requested restaurant and order flow were completed and verified.",
        details: [
          ["Restaurant", "Top rated option"],
          ["Items", "Prepared order"],
          ["Delivery", "Available"],
          ["Status", "Verified"],
        ],
      };

    default:
      return {
        category: "Browser automation",
        title: "Task completed successfully",
        description:
          "The requested automation workflow completed and the result was verified.",
        details: [
          ["Task", task || "Browser automation task"],
          ["Status", "Completed"],
          ["Verification", "Passed"],
        ],
      };
  }
}

function formatExecutionTime(milliseconds: number) {
  if (milliseconds <= 0) {
    return "Completed";
  }

  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }

  const totalSeconds = milliseconds / 1000;

  if (totalSeconds < 60) {
    return `${totalSeconds.toFixed(2)}s`;
  }

  const totalWholeSeconds = Math.floor(totalSeconds);
  const minutes = Math.floor(totalWholeSeconds / 60);
  const seconds = totalWholeSeconds % 60;

  if (seconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${seconds}s`;
}

export default function TaskResultPanel({
  task,
  executionTime,
  onRunAnother,
}: TaskResultPanelProps) {
  const [showDetails, setShowDetails] = useState(true);

  const result = getResultData(task);

  const toggleDetails = () => {
    setShowDetails((value) => !value);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
      {/* Success header */}
      <div className="border-b border-emerald-200 bg-emerald-50 px-5 py-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                {result.category}
              </p>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-emerald-700 shadow-sm">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </span>
            </div>

            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              {result.title}
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              {result.description}
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <ResultStat
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Status"
            value="Completed"
            valueClass="text-slate-900"
          />

          <ResultStat
            icon={<Clock3 className="h-4 w-4" />}
            label="Execution"
            value={formatExecutionTime(executionTime)}
            valueClass="text-slate-900"
          />

          <ResultStat
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Verification"
            value="Passed"
            valueClass="text-emerald-600"
          />
        </div>

        {/* User request */}
        {task.trim() && (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Completed request
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-700">
              {task}
            </p>
          </div>
        )}

        {/* Result details */}
        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={toggleDetails}
            className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-slate-50"
            aria-expanded={showDetails}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-500" />

              <div>
                <span className="block text-sm font-semibold text-slate-900">
                  Result details
                </span>

                <span className="mt-0.5 block text-[11px] text-slate-400">
                  {showDetails
                    ? "Details are visible"
                    : "Details are hidden"}
                </span>
              </div>
            </div>

            {showDetails ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </button>

          {showDetails && (
            <div className="border-t border-slate-200">
              {result.details.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 last:border-b-0"
                >
                  <span className="text-sm text-slate-500">
                    {label}
                  </span>

                  <span className="max-w-[65%] text-right text-sm font-semibold text-slate-900">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completion message */}
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
          <CheckCircle2
            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
          />

          <div>
            <p className="text-xs font-semibold text-emerald-900">
              Automation completed
            </p>

            <p className="mt-1 text-xs leading-5 text-emerald-700">
              ModelNow completed the workflow and verified the
              final browser state.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5">
          <button
            type="button"
            onClick={onRunAnother}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99]"
          >
            <RotateCcw className="h-4 w-4" />
            Run Another Task
          </button>
        </div>
      </div>
    </section>
  );
}

function ResultStat({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        {icon}
        {label}
      </div>

      <p
        className={`mt-2 text-sm font-semibold ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}