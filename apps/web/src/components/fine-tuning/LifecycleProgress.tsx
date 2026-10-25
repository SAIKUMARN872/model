"use client";

import {
  CheckCircle2,
  Circle,
  Zap,
} from "lucide-react";
import {
  useEffect,
  useRef,
} from "react";

export type LifecycleState =
  | "pending"
  | "running"
  | "completed";

export type LifecycleStep = {
  id: number;
  title: string;
  description: string;
};

type LifecycleProgressProps = {
  steps: Array<
    LifecycleStep & {
      state: LifecycleState;
    }
  >;
};

export default function LifecycleProgress({
  steps,
}: LifecycleProgressProps) {
  const activeStageRef =
    useRef<HTMLDivElement | null>(null);

  const runningStep = steps.find(
    (step) => step.state === "running",
  );

  useEffect(() => {
    if (!runningStep) {
      return;
    }

    activeStageRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [runningStep?.id]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            ModelNow fine-tuning lifecycle
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            One request. Thirteen automated stages.
          </h2>
        </div>

        <p className="text-sm text-slate-500">
          ModelNow manages the technical lifecycle automatically.
        </p>
      </div>

      {/* Timeline */}
      <div className="mt-8 overflow-x-auto pb-3">
        <div className="flex min-w-max items-start">
          {steps.map((step, index) => {
            const isCompleted =
              step.state === "completed";

            const isRunning =
              step.state === "running";

            const isPending =
              step.state === "pending";

            const isLast =
              index === steps.length - 1;

            const isActive =
              isRunning;

            return (
              <div
                key={step.id}
                ref={
                  isActive
                    ? activeStageRef
                    : undefined
                }
                className="flex items-start"
              >
                {/* Stage */}
                <div className="w-[190px] shrink-0">
                  <div
                    className={`rounded-2xl border p-4 transition-all ${
                      isCompleted
                        ? "border-emerald-200 bg-emerald-50/70"
                        : isRunning
                          ? "border-blue-300 bg-blue-50 shadow-sm ring-2 ring-blue-100"
                          : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    {/* Stage number + state */}
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`text-[11px] font-bold tracking-wide ${
                          isCompleted
                            ? "text-emerald-600"
                            : isRunning
                              ? "text-blue-600"
                              : "text-slate-400"
                        }`}
                      >
                        {String(step.id).padStart(
                          2,
                          "0",
                        )}
                      </span>

                      {isCompleted ? (
                        <CheckCircle2
                          size={18}
                          className="text-emerald-600"
                        />
                      ) : isRunning ? (
                        <Zap
                          size={18}
                          className="text-blue-600"
                        />
                      ) : (
                        <Circle
                          size={15}
                          className="text-slate-300"
                        />
                      )}
                    </div>

                    {/* Title */}
                    <h3
                      className={`mt-4 min-h-[40px] text-sm font-bold leading-5 ${
                        isPending
                          ? "text-slate-500"
                          : "text-slate-950"
                      }`}
                    >
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 min-h-[60px] text-xs leading-5 text-slate-500">
                      {step.description}
                    </p>

                    {/* State */}
                    <div className="mt-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                          isCompleted
                            ? "bg-emerald-100 text-emerald-700"
                            : isRunning
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {isCompleted
                          ? "Completed"
                          : isRunning
                            ? "Running"
                            : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Connector */}
                {!isLast && (
                  <div className="flex w-12 shrink-0 items-center pt-[30px]">
                    <div
                      className={`h-0.5 w-full ${
                        isCompleted
                          ? "bg-emerald-300"
                          : "bg-slate-200"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Completed
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          Running
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          Pending
        </div>

        <div className="ml-auto text-xs text-slate-400">
          {steps.length} lifecycle stages
        </div>
      </div>
    </section>
  );
}