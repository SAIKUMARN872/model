import Toggle from "./Toggle";

type ToggleCardProps = {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
};

export default function ToggleCard({
  title,
  description,
  checked,
  onChange,
}: ToggleCardProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b101b] p-5">
      <div className="min-w-0 pr-6">
        <div className="text-sm font-medium text-white">
          {title}
        </div>

        <div className="mt-1 text-xs leading-5 text-gray-500">
          {description}
        </div>
      </div>

      <Toggle
        checked={checked}
        onChange={onChange}
        label={title}
      />
    </div>
  );
}