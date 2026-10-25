import {
  CheckCircle2,
} from "lucide-react";

import type { ElementType } from "react";

type ArchitectureCardProps = {
  icon: ElementType;
  title: string;
  items: string[];
};

export default function ArchitectureCard({
  icon: Icon,
  title,
  items,
}: ArchitectureCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
          <Icon size={18} />
        </div>

        <h4 className="font-semibold">
          {title}
        </h4>

      </div>

      <div className="mt-4 space-y-2">

        {items.map((item) => (
          <div
            key={item}
            className="flex items-center gap-2 text-xs text-slate-500"
          >
            <CheckCircle2
              size={13}
              className="text-slate-400"
            />

            {item}
          </div>
        ))}

      </div>

    </div>
  );
}