"use client";

import { File } from "lucide-react";

export default function PDFUploader() {
  return (
    <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">

      <File
        size={48}
        className="mx-auto mb-4 text-red-600"
      />

      <h2 className="text-lg font-semibold">
        Upload PDF
      </h2>

      <p className="mb-5 text-gray-500">
        Select your PDF document
      </p>

      <input
        type="file"
        accept=".pdf"
        className="block w-full"
      />

    </div>
  );
}