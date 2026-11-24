import type { ElementType } from "react";

type OutputCardProps = {
  icon: ElementType;
  title: string;
  description: string;
};

export default function OutputCard({
  icon: Icon,
  title,
  description,
}: OutputCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">

      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
        <Icon size={17} />
      </div>

      <h4 className="mt-3 text-sm font-semibold">
        {title}
      </h4>

      <p className="mt-1 text-[11px] leading-5 text-slate-400">
        {description}
      </p>

    </div>
  );
}