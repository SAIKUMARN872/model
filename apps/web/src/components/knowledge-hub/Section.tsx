"use client";

import {
  type ElementType,
  type ReactNode,
} from "react";
import {
  ChevronDown,
  ChevronRight,
} from "lucide-react";

type SectionProps = {
  id: string;
  title: string;
  description: string;
  icon: ElementType;
  expanded: boolean;
  onToggle: (id: string) => void;
  children: ReactNode;
};

export default function Section({
  id,
  title,
  description,
  icon: Icon,
  expanded,
  onToggle,
  children,
}: SectionProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b101b]">
      <button
        onClick={() => onToggle(id)}
        className="flex w-full items-center gap-4 p-5 text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
          <Icon size={19} className="text-violet-400" />
        </div>

        <div className="flex-1">
          <div className="font-medium">{title}</div>

          <div className="mt-1 text-xs text-gray-500">
            {description}
          </div>
        </div>

        {expanded ? (
          <ChevronDown size={18} className="text-gray-500" />
        ) : (
          <ChevronRight size={18} className="text-gray-500" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-white/10 p-5">
          {children}
        </div>
      )}
    </div>
  );
}