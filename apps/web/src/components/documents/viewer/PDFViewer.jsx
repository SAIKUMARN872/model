"use client";

import { File } from "lucide-react";

export default function PDFViewer({
  fileName = "Sample.pdf",
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow">

      <div className="mb-4 flex items-center gap-3">

        <File
          size={28}
          className="text-red-600"
        />

        <div>
          <h2 className="font-semibold text-lg">
            {fileName}
          </h2>

          <p className="text-sm text-gray-500">
            PDF Document
          </p>
        </div>

      </div>

      <div className="flex h-96 items-center justify-center rounded-lg border bg-gray-100">

        <p className="text-gray-400">
          PDF Preview Area
        </p>

      </div>

    </div>
  );
}