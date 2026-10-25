"use client";

import {
  CloudUpload,
  Database,
} from "lucide-react";
import {
  useRef,
  type ChangeEvent,
} from "react";

import type { FineTuningDataset } from "./FineTuningHero";

type DatasetUploadCardProps = {
  dataset: FineTuningDataset | null;
  datasetAnalyzing: boolean;
  autopilotRunning: boolean;
  onDatasetChange: (
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
};

const SUPPORTED_EXTENSIONS = [
  ".jsonl",
  ".json",
  ".csv",
  ".txt",
];

export default function DatasetUploadCard({
  dataset,
  datasetAnalyzing,
  autopilotRunning,
  onDatasetChange,
}: DatasetUploadCardProps) {
  const inputRef =
    useRef<HTMLInputElement | null>(null);

  const openUpload = () => {
    if (
      !autopilotRunning &&
      !datasetAnalyzing
    ) {
      inputRef.current?.click();
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <input
        ref={inputRef}
        id="dataset-upload"
        type="file"
        accept={SUPPORTED_EXTENSIONS.join(",")}
        className="hidden"
        onChange={onDatasetChange}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <Database size={22} />
          </div>

          <div className="min-w-0">
            <p className="font-semibold">
              Raw training dataset
            </p>

            {dataset ? (
              <>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                  <span className="break-all font-medium text-slate-700">
                    {dataset.name}
                  </span>

                  <span>•</span>

                  <span>{dataset.size}</span>

                  <span>•</span>

                  <span>
                    {dataset.examples.toLocaleString()}{" "}
                    examples
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                    {dataset.format}
                  </span>

                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                      dataset.quality >= 90
                        ? "bg-emerald-100 text-emerald-700"
                        : dataset.quality >= 70
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {dataset.structuralStatus}
                  </span>
                </div>
              </>
            ) : datasetAnalyzing ? (
              <p className="mt-1 text-sm text-blue-600">
                Inspecting file structure...
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-500">
                Upload JSONL, JSON, CSV or TXT
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={openUpload}
          disabled={
            autopilotRunning ||
            datasetAnalyzing
          }
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CloudUpload size={17} />

          {datasetAnalyzing
            ? "Analyzing..."
            : dataset
              ? "Replace dataset"
              : "Add dataset"}
        </button>
      </div>
    </div>
  );
}