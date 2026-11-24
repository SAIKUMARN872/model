"use client";

import {
  BarChart3,
  Database,
  FileText,
} from "lucide-react";

import type { FineTuningDataset } from "./FineTuningHero";

type DatasetStatsProps = {
  dataset: FineTuningDataset;
};

export default function DatasetStats({
  dataset,
}: DatasetStatsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <StatCard
        label="Examples"
        value={dataset.examples.toLocaleString()}
        icon={<Database size={15} />}
      />

      <StatCard
        label="File size"
        value={dataset.size}
        icon={<FileText size={15} />}
      />

      <StatCard
        label="Structural score"
        value={`${dataset.quality}%`}
        icon={<BarChart3 size={15} />}
      />
    </div>
  );
}

function StatCard({
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

      <p className="mt-2 text-lg font-bold">
        {value}
      </p>
    </div>
  );
}