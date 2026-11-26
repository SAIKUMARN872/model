"use client";

import { useState } from "react";

export default function DocumentsPage() {
  const docs = [
    "Project Proposal.pdf",
    "Architecture.docx",
    "API Documentation.pdf",
    "Meeting Notes.docx",
  ];

  const [selectedDoc, setSelectedDoc] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">
        Documents
      </h1>

      <div className="space-y-3">
        {docs.map((doc) => (
          <button
            key={doc}
            onClick={() => setSelectedDoc(doc)}
            className="block w-full rounded-lg border bg-white p-4 text-left transition hover:border-blue-500 hover:bg-blue-50"
          >
            <span className="font-medium text-gray-900">
              {doc}
            </span>
          </button>
        ))}
      </div>

      {selectedDoc && (
        <div className="mt-6 rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Selected Document
          </h2>

          <p className="mt-2 text-gray-600">
            {selectedDoc}
          </p>

          <p className="mt-3 text-sm text-gray-500">
            Document viewer will be connected when the backend/document
            service is integrated.
          </p>

          <button
            onClick={() => setSelectedDoc(null)}
            className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}