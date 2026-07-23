"use client";

import { Paperclip } from "lucide-react";

export default function FileUpload() {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100">

      <Paperclip size={18} />

      <span>Upload File</span>

      <input
        type="file"
        className="hidden"
      />

    </label>
  );
}