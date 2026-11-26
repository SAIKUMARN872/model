"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Database,
  FileCheck2,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

export type DatasetValidationResult = {
  formatValid: boolean;
  structureValid: boolean;
  contentValid: boolean;
  minimumExamplesMet: boolean;
  duplicateRisk: "low" | "medium" | "high";
  qualityScore: number;
  issues: string[];
  warnings: string[];
};

type DatasetValidationPanelProps = {
  validation: DatasetValidationResult;
  analyzing: boolean;
};

export default function DatasetValidationPanel({
  validation,
  analyzing,
}: DatasetValidationPanelProps) {
  const hasBlockingIssues =
    validation.issues.length > 0;

  const hasWarnings =
    validation.warnings.length > 0;

  const qualityLabel =
    validation.qualityScore >= 90
      ? "Healthy"
      : validation.qualityScore >= 70
        ? "Needs review"
        : "Needs attention";

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Validation & quality
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            ModelNow validation gate
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            ModelNow checks the uploaded dataset before allowing
            the training lifecycle to continue.
          </p>
        </div>

        <div
          className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${
            analyzing
              ? "bg-blue-50 text-blue-700"
              : hasBlockingIssues
                ? "bg-red-50 text-red-700"
                : hasWarnings
                  ? "bg-amber-50 text-amber-700"
                  : "bg-emerald-50 text-emerald-700"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              analyzing
                ? "bg-blue-500"
                : hasBlockingIssues
                  ? "bg-red-500"
                  : hasWarnings
                    ? "bg-amber-500"
                    : "bg-emerald-500"
            }`}
          />

          {analyzing
            ? "Analyzing"
            : hasBlockingIssues
              ? "Validation failed"
              : hasWarnings
                ? "Review recommended"
                : "Validation passed"}
        </div>
      </div>

      {/* Quality score */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
              <Database size={20} />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Dataset quality score
              </p>

              <p className="mt-1 text-2xl font-bold">
                {validation.qualityScore}%
              </p>
            </div>
          </div>

          <span
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              validation.qualityScore >= 90
                ? "bg-emerald-100 text-emerald-700"
                : validation.qualityScore >= 70
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
            }`}
          >
            {qualityLabel}
          </span>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full transition-all ${
              validation.qualityScore >= 90
                ? "bg-emerald-500"
                : validation.qualityScore >= 70
                  ? "bg-amber-500"
                  : "bg-red-500"
            }`}
            style={{
              width: `${validation.qualityScore}%`,
            }}
          />
        </div>
      </div>

      {/* Validation checks */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ValidationCheck
          label="Format"
          passed={validation.formatValid}
          icon={<FileCheck2 size={16} />}
        />

        <ValidationCheck
          label="Structure"
          passed={validation.structureValid}
          icon={<Database size={16} />}
        />

        <ValidationCheck
          label="Content"
          passed={validation.contentValid}
          icon={<ShieldCheck size={16} />}
        />

        <ValidationCheck
          label="Minimum examples"
          passed={validation.minimumExamplesMet}
          icon={<CheckCircle2 size={16} />}
        />
      </div>

      {/* Duplicate risk */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500">
              Duplicate risk
            </p>

            <p className="mt-1 text-sm font-semibold">
              {validation.duplicateRisk
                .charAt(0)
                .toUpperCase() +
                validation.duplicateRisk.slice(1)}
            </p>
          </div>

          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
              validation.duplicateRisk === "low"
                ? "bg-emerald-100 text-emerald-700"
                : validation.duplicateRisk === "medium"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
            }`}
          >
            {validation.duplicateRisk}
          </span>
        </div>
      </div>

      {/* Issues */}
      {validation.issues.length > 0 && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <TriangleAlert
              size={18}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>
              <p className="font-semibold text-red-950">
                Blocking validation issues
              </p>

              <div className="mt-2 space-y-2">
                {validation.issues.map((issue) => (
                  <p
                    key={issue}
                    className="text-sm leading-5 text-red-800"
                  >
                    {issue}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0 text-amber-600"
            />

            <div>
              <p className="font-semibold text-amber-950">
                Validation warnings
              </p>

              <div className="mt-2 space-y-2">
                {validation.warnings.map((warning) => (
                  <p
                    key={warning}
                    className="text-sm leading-5 text-amber-800"
                  >
                    {warning}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!analyzing &&
        !hasBlockingIssues &&
        !hasWarnings && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            <CheckCircle2 size={17} />
            Dataset passed the ModelNow validation gate.
          </div>
        )}
    </section>
  );
}

function ValidationCheck({
  label,
  passed,
  icon,
}: {
  label: string;
  passed: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        passed
          ? "border-emerald-200 bg-emerald-50/60"
          : "border-red-200 bg-red-50"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={
            passed
              ? "text-emerald-600"
              : "text-red-600"
          }
        >
          {icon}
        </span>

        <span className="text-xs font-semibold">
          {label}
        </span>
      </div>

      <p
        className={`mt-2 text-sm font-bold ${
          passed
            ? "text-emerald-700"
            : "text-red-700"
        }`}
      >
        {passed ? "Passed" : "Failed"}
      </p>
    </div>
  );
}