"use client";

import {
  BrainCircuit,
  CheckCircle2,
  Cpu,
  Gauge,
  Layers3,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";

type TrainingStrategyPanelProps = {
  selectedStrategy: string;
  baseModel: string;
  computeProfile: string;
  currentStep: number;
  running: boolean;
  complete: boolean;
  smallDataMode?: boolean;
  onStrategySelect?: (strategy: string) => void;
};

const TRAINING_STEP = 4;

const strategies = [
  {
    name: "LoRA",
    shortName: "LoRA",
    description:
      "Parameter-efficient adaptation with lower training overhead.",
    icon: Layers3,
  },
  {
    name: "QLoRA",
    shortName: "QLoRA",
    description:
      "Memory-efficient fine-tuning for larger models and constrained compute.",
    icon: Cpu,
  },
  {
    name: "PEFT",
    shortName: "PEFT",
    description:
      "Parameter-efficient tuning selected when adapter-based training is appropriate.",
    icon: Gauge,
  },
  {
    name: "Full Fine-Tuning",
    shortName: "Full",
    description:
      "Full-parameter optimization considered when deeper model adaptation is justified.",
    icon: BrainCircuit,
  },
];

export default function TrainingStrategyPanel({
  selectedStrategy,
  baseModel,
  computeProfile,
  currentStep,
  running,
  complete,
  smallDataMode = false,
  onStrategySelect,
}: TrainingStrategyPanelProps) {
  const [localSelectedStrategy, setLocalSelectedStrategy] =
    useState(selectedStrategy);

  const previousSelectedStrategy =
    useRef(selectedStrategy);

  useEffect(() => {
    if (
      previousSelectedStrategy.current !==
      selectedStrategy
    ) {
      setLocalSelectedStrategy(
        selectedStrategy,
      );

      previousSelectedStrategy.current =
        selectedStrategy;
    }
  }, [selectedStrategy]);

  const isTrainingStage =
    running && currentStep === TRAINING_STEP;

  const trainingCompleted =
    complete || currentStep > TRAINING_STEP;

  const trainingPending =
    !running &&
    !complete &&
    currentStep < TRAINING_STEP;

  // Strategy can be changed before a new training run.
  // It becomes locked only while training is actively running.
  const strategySelectionLocked = running;

  const status = trainingCompleted
    ? {
        label: "Training complete",
        dot: "bg-emerald-500",
        badge:
          "bg-emerald-50 text-emerald-700",
      }
    : isTrainingStage
      ? {
          label: "Training in progress",
          dot: "bg-blue-500",
          badge:
            "bg-blue-50 text-blue-700",
        }
      : trainingPending
        ? {
            label: "Waiting for training",
            dot: "bg-slate-400",
            badge:
              "bg-slate-100 text-slate-600",
          }
        : {
            label: "Training configured",
            dot: "bg-violet-500",
            badge:
              "bg-violet-50 text-violet-700",
          };

  const activeComputeProfile = smallDataMode
    ? "ModelNow small-data managed GPU profile"
    : computeProfile;

  const decisionMode = smallDataMode
    ? "ModelNow managed · small-data"
    : "ModelNow managed";

  const resourceOptimization =
    smallDataMode
      ? "Small-data optimization"
      : "Automatic";

  const handleStrategyClick = (
    strategy: string,
  ) => {
    if (strategySelectionLocked) {
      return;
    }

    setLocalSelectedStrategy(strategy);

    onStrategySelect?.(strategy);
  };

  return (
    <section
      className={`rounded-3xl border bg-white p-6 shadow-sm transition-all sm:p-8 ${
        isTrainingStage
          ? "border-blue-300 ring-2 ring-blue-100"
          : trainingCompleted
            ? "border-emerald-200"
            : "border-slate-200"
      }`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            <Sparkles size={14} />
            ModelNow Training Engine
          </div>

          <h2 className="mt-4 text-2xl font-bold tracking-tight">
            Training strategy managed by ModelNow
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Select the training strategy you want
            ModelNow to use before the next training run.
          </p>
        </div>

        <div
          className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${status.badge}`}
        >
          <span
            className={`h-2 w-2 rounded-full ${status.dot}`}
          />

          {status.label}
        </div>
      </div>

      {smallDataMode && (
        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
              <Sparkles size={18} />
            </div>

            <div>
              <p className="font-semibold text-slate-950">
                Small-data optimization enabled
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                ModelNow is using a conservative training profile
                designed for smaller datasets.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <SmallDataSignal
              label="Adaptation"
              value="Conservative"
            />

            <SmallDataSignal
              label="Validation"
              value="Enhanced"
            />

            <SmallDataSignal
              label="Optimization"
              value="Small-data profile"
            />
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <InfoCard
          label="Base model"
          value={baseModel}
          icon={<BrainCircuit size={16} />}
        />

        <InfoCard
          label="Compute"
          value={activeComputeProfile}
          icon={<Cpu size={16} />}
        />

        <InfoCard
          label="Decision mode"
          value={decisionMode}
          icon={<ShieldCheck size={16} />}
        />
      </div>

      <div
        className={`mt-6 rounded-2xl border p-5 ${
          isTrainingStage
            ? "border-blue-200 bg-blue-50"
            : trainingCompleted
              ? "border-emerald-200 bg-emerald-50"
              : "border-purple-200 bg-purple-50"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white ${
              isTrainingStage
                ? "text-blue-600"
                : trainingCompleted
                  ? "text-emerald-600"
                  : "text-purple-600"
            }`}
          >
            {trainingCompleted ? (
              <CheckCircle2 size={18} />
            ) : (
              <Zap size={18} />
            )}
          </div>

          <div>
            <p className="font-semibold text-slate-950">
              Selected strategy
            </p>

            <p className="mt-1 text-lg font-bold">
              {localSelectedStrategy}
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              {running
                ? smallDataMode
                  ? "ModelNow is executing the selected strategy with the small-data optimization profile."
                  : "ModelNow is executing the selected training strategy."
                : trainingCompleted
                  ? "Training has completed. You can select another strategy for the next training run."
                  : "The selected strategy will be passed to the backend when training begins."}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">
              Available training strategies
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Choose LoRA, QLoRA, PEFT, or Full Fine-Tuning.
            </p>
          </div>

          <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
            {strategySelectionLocked
              ? "Selection locked during training"
              : "Select one"}
          </span>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {strategies.map((strategy) => {
            const Icon = strategy.icon;

            const isSelected =
              strategy.name ===
              localSelectedStrategy;

            return (
              <button
                key={strategy.name}
                type="button"
                onClick={() =>
                  handleStrategyClick(
                    strategy.name,
                  )
                }
                disabled={
                  strategySelectionLocked
                }
                aria-pressed={isSelected}
                className={`group rounded-2xl border p-5 text-left transition ${
                  isSelected
                    ? "border-blue-400 bg-blue-50 ring-2 ring-blue-100"
                    : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/60"
                } ${
                  strategySelectionLocked
                    ? "cursor-not-allowed opacity-70"
                    : "cursor-pointer"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white ${
                      isSelected
                        ? "text-blue-600"
                        : "text-slate-500 group-hover:text-blue-600"
                    }`}
                  >
                    <Icon size={18} />
                  </div>

                  {isSelected && (
                    <CheckCircle2
                      size={18}
                      className="text-blue-600"
                    />
                  )}
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-950">
                  {strategy.shortName}
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {strategy.description}
                </p>

                <div className="mt-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                      isSelected
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {isSelected
                      ? "Selected"
                      : "Available"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <EngineStatus
          label="Checkpoint management"
          value="Automatic"
        />

        <EngineStatus
          label="Experiment orchestration"
          value="Automatic"
        />

        <EngineStatus
          label="Resource optimization"
          value={resourceOptimization}
        />
      </div>
    </section>
  );
}

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}

        <span className="text-xs font-medium">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function SmallDataSignal({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-blue-200 bg-white/80 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function EngineStatus({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-2">
        <CheckCircle2
          size={15}
          className="text-emerald-600"
        />

        <span className="text-sm font-semibold">
          {value}
        </span>
      </div>
    </div>
  );
}