"use client";

import type { ElementType } from "react";

type MiniStatProps = {
  label: string;
  value: string | number;
  icon?: ElementType;
};

export default function MiniStat({
  label,
  value,
  icon: Icon,
}: MiniStatProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b101b] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-gray-500">{label}</div>
          <div className="mt-2 text-xl font-semibold text-white">
            {value}
          </div>
        </div>

        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
            <Icon size={17} className="text-violet-400" />
          </div>
        )}
      </div>
    </div>
  );
}