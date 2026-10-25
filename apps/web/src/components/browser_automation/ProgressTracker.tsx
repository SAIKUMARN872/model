import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { useState } from "react";

type ProgressTrackerProps = {
  activeStep: number;
  completedThrough: number;
  onStepClick?: (stepNumber: number) => void;
};

const steps = [
  "Task Input",
  "Generate Plan",
  "Start Task",
  "Execution",
  "Browser Actions",
  "Approval Required",
  "User Approves",
  "Payment",
  "Invoice / Receipt",
  "Verification",
  "Completed Result",
  "Reminder",
  "Final Activity / History",
];

const stepDescriptions = [
  "Enter the browser automation task you want ModelNow to perform.",
  "Review the generated execution plan before starting the task.",
  "Start the automation workflow.",
  "Monitor the task execution.",
  "View browser actions performed by the automation.",
  "Review the approval request before continuing.",
  "Approve the requested action.",
  "Complete the payment step.",
  "Review the generated invoice or receipt.",
  "Verify the completed transaction or task.",
  "Review the final completed result.",
  "Set or review the task reminder.",
  "Review the final activity and run history.",
];

export default function ProgressTracker({
  activeStep,
  completedThrough,
  onStepClick,
}: ProgressTrackerProps) {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const totalSteps = steps.length;

  const isFullyCompleted =
    completedThrough >= totalSteps;

  const progressPercent = isFullyCompleted
    ? 100
    : Math.max(
        0,
        Math.min(
          100,
          (Math.max(activeStep, completedThrough) /
            totalSteps) *
            100,
        ),
      );

  const handleStepClick = (stepNumber: number) => {
    const nextStep =
      selectedStep === stepNumber ? null : stepNumber;

    setSelectedStep(nextStep);

    if (nextStep !== null) {
      onStepClick?.(nextStep);
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Workflow Progress
          </p>

          <p className="text-xs text-muted-foreground">
            {isFullyCompleted
              ? "13 of 13 steps completed"
              : `Step ${activeStep} of ${totalSteps}`}
          </p>
        </div>

        <span className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          {Math.round(progressPercent)}%
        </span>
      </div>

      <div className="mb-5 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{
            width: `${progressPercent}%`,
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((label, index) => {
          const stepNumber = index + 1;

          const isCompleted =
            stepNumber <= completedThrough;

          const isCurrent =
            !isCompleted &&
            stepNumber === activeStep;

          const isSelected =
            selectedStep === stepNumber;

          return (
            <div
              key={label}
              className="min-w-0"
            >
              <button
                type="button"
                aria-expanded={isSelected}
                aria-current={
                  isCurrent ? "step" : undefined
                }
                onClick={() =>
                  handleStepClick(stepNumber)
                }
                className={[
                  "w-full rounded-xl border p-3 text-left transition-all duration-200",
                  "hover:border-primary/60 hover:bg-primary/5",
                  "focus:outline-none focus:ring-2 focus:ring-primary/30",
                  isCompleted
                    ? "border-primary/30 bg-primary/5"
                    : isCurrent
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-background",
                  isSelected
                    ? "border-primary shadow-sm"
                    : "",
                ].join(" ")}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : isCurrent ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/50" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className={[
                          "text-[11px] font-semibold uppercase tracking-wide",
                          isCompleted || isCurrent
                            ? "text-primary"
                            : "text-muted-foreground",
                        ].join(" ")}
                      >
                        Step {stepNumber}
                      </div>

                      {isSelected ? (
                        <ChevronUp className="h-4 w-4 shrink-0 text-primary" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                    </div>

                    <div
                      className={[
                        "mt-1 text-xs font-medium leading-4",
                        isCompleted
                          ? "text-foreground"
                          : isCurrent
                            ? "text-primary"
                            : "text-muted-foreground",
                      ].join(" ")}
                    >
                      {label}
                    </div>
                  </div>
                </div>
              </button>

              {isSelected && (
                <div className="mt-1 rounded-b-xl border border-t-0 border-border bg-muted/40 px-4 py-3">
                  <p className="text-xs leading-5 text-muted-foreground">
                    {stepDescriptions[index]}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}