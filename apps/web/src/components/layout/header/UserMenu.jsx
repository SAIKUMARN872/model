import { ChevronDown, UserCircle } from "lucide-react";

export default function UserMenu() {
  return (
    <button className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm hover:bg-gray-50 transition">

      <UserCircle className="h-8 w-8 text-gray-600" />

      <div className="text-left">
        <p className="text-sm font-semibold text-gray-800">
          Harshini
        </p>

        <p className="text-xs text-gray-500">
          Frontend Developer
        </p>
      </div>

      <ChevronDown className="h-4 w-4 text-gray-500" />

    </button>
  );
}