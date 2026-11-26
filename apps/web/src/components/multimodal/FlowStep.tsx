import type { ElementType } from "react";

type FlowStepProps = {
  icon: ElementType;
  text: string;
};

export default function FlowStep({
  icon: Icon,
  text,
}: FlowStepProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">

      <Icon
        size={15}
        className="text-slate-500"
      />

      <span className="text-xs font-medium text-slate-600">
        {text}
      </span>

    </div>
  );
}