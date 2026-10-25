"use client";

import {
  CheckCircle2,
  Cpu,
  Info,
  Sparkles,
  Zap,
} from "lucide-react";

type ModelSelectionPanelProps = {
  currentStep: number;
  running: boolean;
  complete: boolean;
  expertMode?: boolean;
  selectedModelId: string;
  onModelSelect: (modelId: string) => void;
  onContinueToTraining: () => void;
};

export const modelOptions = [
  {
    id: "modelnow-foundation-8b",
    name: "ModelNow-Foundation-8B",
    version: "8B",
    family: "ModelNow Foundation",
    context: "128K context",
    profile: "Balanced quality and efficiency",
    description:
      "Recommended foundation model for balanced adaptation quality, training efficiency and production serving.",
  },
  {
    id: "modelnow-quality-12b",
    name: "ModelNow-Quality-12B",
    version: "12B",
    family: "ModelNow Quality",
    context: "128K context",
    profile: "Higher quality focus",
    description:
      "Larger foundation profile intended for objectives where adaptation quality is the primary priority.",
  },
  {
    id: "modelnow-efficient-4b",
    name: "ModelNow-Efficient-4B",
    version: "4B",
    family: "ModelNow Efficient",
    context: "64K context",
    profile: "Lower resource profile",
    description:
      "Efficient foundation profile designed for lower training and serving resource requirements.",
  },
];

export default function ModelSelectionPanel({
  currentStep,
  running,
  complete,
  expertMode = false,
  selectedModelId,
  onModelSelect,
  onContinueToTraining,
}: ModelSelectionPanelProps) {
  const selectedModel =
    modelOptions.find(
      (model) => model.id === selectedModelId,
    ) ?? modelOptions[0];

  const selectionRunning =
    running && currentStep === 3;

  const selectionComplete =
    complete || currentStep > 3;

  const status = selectionComplete
    ? {
        label: "Model selected",
        badge: "bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
      }
    : selectionRunning
      ? {
          label: "Selecting foundation model",
          badge: "bg-blue-50 text-blue-700",
          dot: "bg-blue-500",
        }
      : {
          label: "Automatic selection",
          badge: "bg-slate-100 text-slate-600",
          dot: "bg-slate-400",
        };

  const canContinue =
    Boolean(selectedModelId) &&
    !selectionRunning;

  return (
    <section
      className={`rounded-3xl border bg-white p-6 shadow-sm transition-all sm:p-8 ${
        selectionRunning
          ? "border-blue-300 ring-2 ring-blue-100"
          : selectionComplete
            ? "border-emerald-200"
            : "border-slate-200"
      }`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
            <Cpu size={14} />
            Model Selection
          </div>

          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
            Foundation model selection
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            ModelNow provides an automatic recommendation. You can
            select another available foundation model when needed.
          </p>
        </div>

        <div
          className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${status.badge}`}
        >
          <span
            className={`h-2 w-2 rounded-full ${status.dot}`}
          />

          {status.label}
        </div>
      </div>

      {/* Selected model */}
      <div className="mt-8 rounded-3xl border border-violet-200 bg-violet-50/60 p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-violet-700">
              <Sparkles size={14} />
              Selected foundation model
            </div>

            <h3 className="mt-4 text-2xl font-bold text-slate-950">
              {selectedModel.name}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {selectedModel.description}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-full bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-700">
            <CheckCircle2 size={14} />
            Selected
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ModelField
            label="Model family"
            value={selectedModel.family}
          />

          <ModelField
            label="Parameter profile"
            value={selectedModel.version}
          />

          <ModelField
            label="Context"
            value={selectedModel.context}
          />

          <ModelField
            label="Resource profile"
            value={selectedModel.profile}
          />
        </div>
      </div>

      {/* Model options */}
      <div className="mt-6">
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-900">
            Available foundation models
          </p>

          <p className="text-xs text-slate-500">
            Click a model to select it
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {modelOptions.map((model) => {
            const isSelected =
              selectedModelId === model.id;

            return (
              <button
                key={model.id}
                type="button"
                onClick={() =>
                  onModelSelect(model.id)
                }
                disabled={selectionRunning}
                aria-pressed={isSelected}
                className={`rounded-2xl border p-5 text-left transition ${
                  isSelected
                    ? "border-violet-300 bg-violet-50 ring-2 ring-violet-100"
                    : "border-slate-200 bg-slate-50 hover:border-violet-200 hover:bg-violet-50/40"
                } ${
                  selectionRunning
                    ? "cursor-not-allowed opacity-70"
                    : "cursor-pointer"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-violet-600">
                    <Cpu size={18} />
                  </div>

                  {isSelected && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 size={13} />
                      Selected
                    </span>
                  )}
                </div>

                <h4 className="mt-4 font-semibold text-slate-950">
                  {model.name}
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {model.description}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <MiniField
                    label="Parameters"
                    value={model.version}
                  />

                  <MiniField
                    label="Context"
                    value={model.context}
                  />
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <Zap size={14} />
                  {model.profile}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Decision information */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <DecisionCard
          label="Selection mode"
          value={
            expertMode
              ? "Automatic + Expert View"
              : "Automatic"
          }
          icon={<Sparkles size={16} />}
        />

        <DecisionCard
          label="Objective fit"
          value="Compatible"
          icon={<CheckCircle2 size={16} />}
        />

        <DecisionCard
          label="Training compatibility"
          value="QLoRA compatible"
          icon={<Zap size={16} />}
        />
      </div>

      {/* Why selected */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-start gap-3">
          <Info
            size={18}
            className="mt-0.5 shrink-0 text-slate-500"
          />

          <div>
            <p className="font-semibold text-slate-900">
              Why this model was selected
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              ModelNow considers dataset characteristics, the business
              objective, expected quality, training efficiency and
              infrastructure compatibility when evaluating the
              foundation model options.
            </p>
          </div>
        </div>
      </div>

      {/* Current selection */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
          <CheckCircle2 size={16} />
          {selectedModel.name}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600">
          Model selection is ready
        </div>
      </div>

      {/* Backend handoff */}
      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-slate-900">
            Ready to continue
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            The selected foundation model is ready to be passed to the
            training workflow.
          </p>
        </div>

        <button
          type="button"
          onClick={onContinueToTraining}
          disabled={!canContinue}
          className={`shrink-0 rounded-xl px-5 py-3 text-sm font-semibold transition ${
            canContinue
              ? "bg-slate-950 text-white hover:bg-slate-800"
              : "cursor-not-allowed bg-slate-200 text-slate-400"
          }`}
        >
          Continue to training
        </button>
      </div>
    </section>
  );
}

function ModelField({
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

      <p className="mt-2 break-words text-sm font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function MiniField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[11px] font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xs font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function DecisionCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}

        <span className="text-xs font-medium">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}