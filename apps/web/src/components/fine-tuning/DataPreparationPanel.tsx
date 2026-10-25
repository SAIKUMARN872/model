"use client";

import {
  CheckCircle2,
  Database,
  FileCog,
  Filter,
  Split,
  WandSparkles,
} from "lucide-react";

type DataPreparationPanelProps = {
  currentStep: number;
  running: boolean;
  complete: boolean;
};

const PREPARATION_STEP = 3;

const preparationItems = [
  {
    title: "Normalize structure",
    description:
      "Standardize records into the internal training format.",
    icon: FileCog,
  },
  {
    title: "Clean data",
    description:
      "Remove malformed, empty, and unusable examples.",
    icon: Filter,
  },
  {
    title: "Deduplicate",
    description:
      "Reduce repeated examples that can distort training quality.",
    icon: WandSparkles,
  },
  {
    title: "Create training split",
    description:
      "Prepare balanced training and evaluation partitions.",
    icon: Split,
  },
];

export default function DataPreparationPanel({
  currentStep,
  running,
  complete,
}: DataPreparationPanelProps) {
  const isRunning = running && currentStep === PREPARATION_STEP;
  const isComplete = complete || currentStep > PREPARATION_STEP;

  const statusText = isComplete
    ? "Preparation completed"
    : isRunning
      ? "Preparing dataset"
      : "Preparation pending";

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Database size={21} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              Stage 03
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              Dataset Preparation
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              ModelNow automatically prepares validated data for the selected
              training workflow.
            </p>
          </div>
        </div>

        <span
          className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-bold ${
            isComplete
              ? "bg-emerald-100 text-emerald-700"
              : isRunning
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 text-slate-500"
          }`}
        >
          {statusText}
        </span>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {preparationItems.map((item, index) => {
          const Icon = item.icon;

          const itemComplete = isComplete;
          const itemRunning = isRunning && index === 0;

          return (
            <div
              key={item.title}
              className={`rounded-2xl border p-5 transition-all ${
                itemComplete
                  ? "border-emerald-200 bg-emerald-50/60"
                  : itemRunning
                    ? "border-blue-300 bg-blue-50/60 ring-2 ring-blue-100"
                    : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    itemComplete
                      ? "bg-emerald-100 text-emerald-600"
                      : itemRunning
                        ? "bg-blue-100 text-blue-600"
                        : "bg-white text-slate-400"
                  }`}
                >
                  {itemComplete ? (
                    <CheckCircle2 size={19} />
                  ) : (
                    <Icon size={19} />
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-1.5 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <span
                  className={`text-[10px] font-bold uppercase tracking-[0.14em] ${
                    itemComplete
                      ? "text-emerald-600"
                      : itemRunning
                        ? "text-blue-600"
                        : "text-slate-400"
                  }`}
                >
                  {itemComplete
                    ? "Completed"
                    : itemRunning
                      ? "Running"
                      : "Pending"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          ModelNow automation
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Preparation stays automatic. Users provide the business objective
          and raw dataset while ModelNow handles the training-ready data
          transformation.
        </p>
      </div>
    </section>
  );
}