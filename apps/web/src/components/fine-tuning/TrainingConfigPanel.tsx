"use client";

import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Cpu,
  Gauge,
  Settings2,
  Sparkles,
} from "lucide-react";

type TrainingConfigPanelProps = {
  currentStep: number;
  running: boolean;
  complete: boolean;
  smallDataMode?: boolean;
};

const TRAINING_STEP = 4;

export default function TrainingConfigPanel({
  currentStep,
  running,
  complete,
  smallDataMode = false,
}: TrainingConfigPanelProps) {
  const isTrainingStage =
    running && currentStep === TRAINING_STEP;

  const trainingCompleted =
    complete || currentStep > TRAINING_STEP;

  const status = trainingCompleted
    ? {
        label: "Configuration locked",
        badge: "bg-emerald-50 text-emerald-700",
      }
    : isTrainingStage
      ? {
          label: "Training configuration active",
          badge: "bg-blue-50 text-blue-700",
        }
      : {
          label: "Automatically configured",
          badge: "bg-slate-100 text-slate-600",
        };

  const configuration = smallDataMode
    ? {
        epochs: "3",
        learningRate: "1.0e-4",
        batchSize: "Small adaptive batch",
        sequenceLength: "ModelNow automatic",
      }
    : {
        epochs: "3",
        learningRate: "2.0e-4",
        batchSize: "ModelNow automatic",
        sequenceLength: "ModelNow automatic",
      };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
            <Settings2 size={14} />
            Training Configuration
          </div>

          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
            Configure Training
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            ModelNow automatically selects the training configuration
            based on the dataset, objective, selected strategy and compute
            profile.
          </p>
        </div>

        <span
          className={`inline-flex w-fit shrink-0 rounded-full px-3 py-2 text-xs font-semibold ${status.badge}`}
        >
          {status.label}
        </span>
      </div>

      {smallDataMode && (
        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <Sparkles
              size={18}
              className="mt-0.5 shrink-0 text-blue-600"
            />

            <div>
              <p className="text-sm font-semibold text-slate-950">
                Small-data configuration active
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                ModelNow is using a more conservative configuration for
                this smaller training dataset.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ConfigCard
          label="Epochs"
          value={configuration.epochs}
          description="Training passes"
          icon={<BarChart3 size={18} />}
        />

        <ConfigCard
          label="Learning rate"
          value={configuration.learningRate}
          description="Parameter update rate"
          icon={<Gauge size={18} />}
        />

        <ConfigCard
          label="Batch size"
          value={configuration.batchSize}
          description="Examples per training step"
          icon={<Cpu size={18} />}
        />

        <ConfigCard
          label="Sequence length"
          value={configuration.sequenceLength}
          description="Context window used for training"
          icon={<Clock3 size={18} />}
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatusCard
          label="Optimizer"
          value="ModelNow automatic"
        />

        <StatusCard
          label="Warmup"
          value="ModelNow automatic"
        />

        <StatusCard
          label="Checkpointing"
          value="Automatic"
        />
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <CheckCircle2
          size={18}
          className="mt-0.5 shrink-0 text-emerald-600"
        />

        <p className="text-sm leading-6 text-slate-600">
          These parameters are selected automatically by ModelNow.
          Expert users can inspect the configuration through Expert View.
        </p>
      </div>
    </section>
  );
}

function ConfigCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}

        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-3 text-lg font-bold text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function StatusCard({
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

      <p className="mt-2 text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}