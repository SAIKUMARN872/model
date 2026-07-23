import { ChevronDown } from "lucide-react";

export default function WorkspaceSwitcher() {
  return (
    <div className="p-4 border-b border-slate-700">

      <button
        className="
          w-full
          flex
          justify-between
          items-center
          bg-slate-800
          rounded-lg
          px-4
          py-3
          hover:bg-slate-700
        "
      >
        <div>
          <p className="text-xs text-gray-300">
            Workspace
          </p>

          <p className="font-semibold">
            My AI Team
          </p>
        </div>

        <ChevronDown size={18} />

      </button>

    </div>
  );
}