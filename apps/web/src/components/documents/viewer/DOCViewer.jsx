"use client";

import { FileText } from "lucide-react";

export default function DOCViewer({
  fileName = "Document.docx",
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow">

      <div className="mb-4 flex items-center gap-3">
        <FileText className="text-blue-600" size={28} />

        <div>
          <h2 className="font-semibold text-lg">
            {fileName}
          </h2>

          <p className="text-sm text-gray-500">
            Microsoft Word Document
          </p>
        </div>
      </div>

      <div className="flex h-96 items-center justify-center rounded-lg border bg-gray-50">
        <p className="text-gray-400">
          DOCX Preview Area
        </p>
      </div>

    </div>
  );
}