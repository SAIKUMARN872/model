"use client";

import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CloudCog,
  Copy,
  Fingerprint,
  GitBranch,
  PackageCheck,
  Rocket,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { useState } from "react";

type ProductionModelCardProps = {
  showModelDetails: boolean;
  onToggleModelDetails: () => void;
  onUseModel: () => void;
};

const releasedModel = {
  name: "ModelNow-Support-v1",
  version: "1.0.0",
  modelId: "modelnow-support-v1",
  releaseId: "rel-modelnow-support-001",
  sourceCandidate: "Candidate B",
  strategy: "Quality optimization",
  status: "Released",
  environment: "Production",
  registryStatus: "Registered",
};

export default function ProductionModelCard({
  showModelDetails,
  onToggleModelDetails,
  onUseModel,
}: ProductionModelCardProps) {
  const [showAccess, setShowAccess] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const handleUseModel = () => {
    setShowAccess(true);
    onUseModel();
  };

  const handleCopyModelId = async () => {
    try {
      await navigator.clipboard.writeText(
        releasedModel.modelId,
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <PackageCheck size={14} />
            Released Model
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              {releasedModel.name}
            </h2>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
              <CheckCircle2 size={14} />
              {releasedModel.status}
            </span>
          </div>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            ModelNow has registered and released the selected
            fine-tuned model for production use.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <Rocket
            size={18}
            className="text-emerald-600"
          />

          <div>
            <p className="text-xs font-medium text-emerald-700">
              Production status
            </p>

            <p className="text-sm font-bold text-emerald-800">
              Released
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReleaseField
          icon={<Tag size={17} />}
          label="Version"
          value={`v${releasedModel.version}`}
        />

        <ReleaseField
          icon={<Fingerprint size={17} />}
          label="Model ID"
          value={releasedModel.modelId}
        />

        <ReleaseField
          icon={<GitBranch size={17} />}
          label="Release ID"
          value={releasedModel.releaseId}
        />

        <ReleaseField
          icon={<CloudCog size={17} />}
          label="Environment"
          value={releasedModel.environment}
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatusField
          label="Source candidate"
          value={releasedModel.sourceCandidate}
        />

        <StatusField
          label="Training strategy"
          value={releasedModel.strategy}
        />

        <StatusField
          label="Registry status"
          value={releasedModel.registryStatus}
          positive
        />
      </div>

      <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600">
            <ShieldCheck size={19} />
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-slate-950">
              Released model is now identified
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              The released production artifact is{" "}
              <span className="font-semibold text-slate-900">
                {releasedModel.name}
              </span>{" "}
              ({releasedModel.version}) with release ID{" "}
              <span className="font-semibold text-slate-900">
                {releasedModel.releaseId}
              </span>
              .
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleUseModel}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Rocket size={16} />
          Use this model
        </button>

        <button
          type="button"
          onClick={onToggleModelDetails}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          {showModelDetails ? (
            <>
              Hide model details
              <ChevronUp size={16} />
            </>
          ) : (
            <>
              View model details
              <ChevronDown size={16} />
            </>
          )}
        </button>
      </div>

      {showAccess && (
        <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                Model access
              </p>

              <h3 className="mt-1 text-lg font-bold text-slate-950">
                {releasedModel.name} is ready for access
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                The frontend has identified the released production
                model. Backend API access can be connected to this model
                identifier.
              </p>
            </div>

            <span className="inline-flex w-fit shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-blue-700">
              Production
            </span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <AccessField
              label="Model ID"
              value={releasedModel.modelId}
            />

            <AccessField
              label="Version"
              value={releasedModel.version}
            />

            <AccessField
              label="Release ID"
              value={releasedModel.releaseId}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCopyModelId}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              <Copy size={15} />

              {copied
                ? "Model ID copied"
                : "Copy model ID"}
            </button>

            <span className="text-xs text-slate-500">
              Backend can use this model ID for API, chat, or deployment
              integration.
            </span>
          </div>
        </div>
      )}

      {showModelDetails && (
        <div className="mt-5 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-2">
          <DetailRow
            label="Released model"
            value={releasedModel.name}
          />

          <DetailRow
            label="Version"
            value={releasedModel.version}
          />

          <DetailRow
            label="Model identifier"
            value={releasedModel.modelId}
          />

          <DetailRow
            label="Release identifier"
            value={releasedModel.releaseId}
          />

          <DetailRow
            label="Selected candidate"
            value={releasedModel.sourceCandidate}
          />

          <DetailRow
            label="Optimization strategy"
            value={releasedModel.strategy}
          />

          <DetailRow
            label="Registry"
            value={releasedModel.registryStatus}
          />

          <DetailRow
            label="Deployment environment"
            value={releasedModel.environment}
          />
        </div>
      )}
    </section>
  );
}

function ReleaseField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}

        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-3 break-all text-sm font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function StatusField({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-2">
        {positive && (
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

function AccessField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-blue-200 bg-white p-4">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-all text-sm font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-all text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}