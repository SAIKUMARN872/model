"use client";

import { FileText } from "lucide-react";

export default function DOCXUploader() {
  return (
    <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">

      <FileText
        size={48}
        className="mx-auto mb-4 text-blue-600"
      />

      <h2 className="text-lg font-semibold">
        Upload DOCX File
      </h2>

      <p className="mb-5 text-gray-500">
        Drag & Drop or Choose a DOCX file
      </p>

      <input
        type="file"
        accept=".doc,.docx"
        className="block w-full"
      />

    </div>
  );
}