"use client";

import { Copy } from "lucide-react";

export default function CopyResponse({ text = "" }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Response copied!");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-100 transition"
    >
      <Copy size={16} />
      Copy
    </button>
  );
}