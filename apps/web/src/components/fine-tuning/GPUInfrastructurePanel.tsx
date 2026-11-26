"use client";

import {
  Activity,
  CheckCircle2,
  Cpu,
  Database,
  Gauge,
  Server,
  ShieldCheck,
  Zap,
} from "lucide-react";

type GPUInfrastructurePanelProps = {
  currentStep: number;
  running: boolean;
  complete: boolean;
  smallDataMode?: boolean;
};

const TRAINING_STEP = 4;

export default function GPUInfrastructurePanel({
  currentStep,
  running,
  complete,
  smallDataMode = false,
}: GPUInfrastructurePanelProps) {
  const isTrainingStage =
    running && currentStep === TRAINING_STEP;

  const trainingCompleted =
    complete || currentStep > TRAINING_STEP;

  const infrastructureActive =
    isTrainingStage || trainingCompleted;

  const status = trainingCompleted
    ? {
        label: "Infrastructure ready",
        badge: "bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
      }
    : isTrainingStage
      ? {
          label: "GPU infrastructure active",
          badge: "bg-blue-50 text-blue-700",
          dot: "bg-blue-500",
        }
      : {
          label: "Infrastructure prepared",
          badge: "bg-slate-100 text-slate-600",
          dot: "bg-slate-400",
        };

  const gpuProfile = smallDataMode
    ? "Small-data GPU profile"
    : "ModelNow managed GPU profile";

  const gpuType = smallDataMode
    ? "Efficient adaptation GPU"
    : "ModelNow automatic GPU selection";

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
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700">
            <Server size={14} />
            GPU Infrastructure
          </div>

          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
            ModelNow managed training infrastructure
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            ModelNow prepares and manages the compute environment required
            for the selected fine-tuning workflow.
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

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <InfrastructureCard
          label="GPU profile"
          value={gpuProfile}
          icon={<Cpu size={18} />}
        />

        <InfrastructureCard
          label="GPU selection"
          value={gpuType}
          icon={<Zap size={18} />}
        />

        <InfrastructureCard
          label="Compute orchestration"
          value="Automatic"
          icon={<Activity size={18} />}
        />

        <InfrastructureCard
          label="Resource monitoring"
          value="Active"
          icon={<Gauge size={18} />}
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <ResourceStatus
          label="GPU availability"
          value={
            infrastructureActive
              ? "Allocated"
              : "Prepared"
          }
        />

        <ResourceStatus
          label="Training storage"
          value="Managed"
          icon={<Database size={15} />}
        />

        <ResourceStatus
          label="Runtime protection"
          value="Enabled"
          icon={<ShieldCheck size={15} />}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-600">
            {infrastructureActive ? (
              <CheckCircle2 size={18} />
            ) : (
              <Server size={18} />
            )}
          </div>

          <div>
            <p className="font-semibold text-slate-950">
              {infrastructureActive
                ? "Training infrastructure is active"
                : "Training infrastructure is prepared"}
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              ModelNow handles GPU allocation, training storage,
              runtime preparation and resource monitoring automatically.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfrastructureCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
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

      <p className="mt-3 text-sm font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function ResourceStatus({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-2">
        {icon ?? (
          <CheckCircle2
            size={15}
            className="text-emerald-600"
          />
        )}

        <span className="text-sm font-semibold text-slate-900">
          {value}
        </span>
      </div>
    </div>
  );
}