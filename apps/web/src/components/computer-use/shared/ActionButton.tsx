import type { ComponentType } from "react";

type ActionButtonProps = {
  icon: ComponentType<{ size?: number }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
};

export default function ActionButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
        danger
          ? "border-red-200 text-red-600 hover:bg-red-50"
          : "border-slate-200 hover:bg-slate-50"
      }`}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}