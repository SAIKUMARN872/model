"use client";

import { FileText } from "lucide-react";

export default function FilePreview({
  fileName = "sample.pdf",
  fileSize = "2.5 MB",
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow">

      <div className="flex items-center gap-4">

        <div className="rounded-lg bg-blue-100 p-3">
          <FileText className="text-blue-600" size={32} />
        </div>

        <div>
          <h2 className="text-lg font-semibold">
            {fileName}
          </h2>

          <p className="text-sm text-gray-500">
            {fileSize}
          </p>
        </div>

      </div>

      <div className="mt-5 h-64 rounded-lg border bg-gray-50 flex items-center justify-center">
        <span className="text-gray-400">
          Document Preview
        </span>
      </div>

    </div>
  );
}