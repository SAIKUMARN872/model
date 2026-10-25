"use client";

import { Settings } from "lucide-react";

type SettingRowProps = {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
};

export default function SettingRow({
  title,
  description,
  enabled,
  onToggle,
}: SettingRowProps) {
  return (
    <div className="flex items-center gap-4 border-b border-[#eeeeef] p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3f4f6]">
        <Settings size={18} />
      </div>

      <div className="flex-1">
        <p className="text-sm font-medium">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-[#80848a]">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-pressed={enabled}
        className={`relative h-6 w-11 rounded-full transition ${
          enabled
            ? "bg-[#17181a]"
            : "bg-[#d6d8dc]"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}