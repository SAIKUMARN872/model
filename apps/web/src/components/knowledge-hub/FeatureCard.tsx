import {
  type ElementType,
  type ReactNode,
} from "react";

type FeatureCardProps = {
  title: string;
  description: string;
  icon: ElementType;
  children?: ReactNode;
};

export default function FeatureCard({
  title,
  description,
  icon: Icon,
  children,
}: FeatureCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b101b] p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
          <Icon size={18} className="text-violet-400" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-white">
            {title}
          </div>

          <div className="mt-1 text-xs leading-5 text-gray-500">
            {description}
          </div>

          {children && (
            <div className="mt-4">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}