"use client";

import { useState } from "react";
import PDFUploader from "../PDFUploader";
import DOCXUploader from "../DOCXUploader";
import FilePreview from "../FilePreview";
import KnowledgePanel from "../KnowledgePanel";
import DocumentChat from "../DocumentChat";

export default function DocumentWorkspace() {
  const [uploaded, setUploaded] = useState(false);

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">
        Document Workspace
      </h1>

      {!uploaded ? (
        <div className="grid gap-6 md:grid-cols-2">
          <PDFUploader />
          <DOCXUploader />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <FilePreview />
          <KnowledgePanel />
        </div>
      )}

      <div className="flex justify-center">

        <button
          onClick={() => setUploaded(!uploaded)}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          {uploaded ? "Reset Workspace" : "Simulate Upload"}
        </button>

      </div>

      {uploaded && <DocumentChat />}

    </div>
  );
}