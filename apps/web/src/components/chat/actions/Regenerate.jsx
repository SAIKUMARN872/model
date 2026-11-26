"use client";

import { RotateCw } from "lucide-react";

export default function Regenerate({ onRegenerate }) {
  return (
    <button
      onClick={onRegenerate}
      className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-100 transition"
    >
      <RotateCw size={16} />
      Regenerate
    </button>
  );
}