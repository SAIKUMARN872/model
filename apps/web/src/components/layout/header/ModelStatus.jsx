import { CheckCircle } from "lucide-react";

export default function ModelStatus() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <div className="flex flex-col">
        <span className="text-xs text-gray-500">Current Model</span>
        <span className="text-sm font-semibold text-green-700">
          GPT-4 Turbo
        </span>
      </div>
    </div>
  );
}