"use client";

export default function DocumentsPage() {
  const docs = [
    "Project Proposal.pdf",
    "Architecture.docx",
    "API Documentation.pdf",
    "Meeting Notes.docx",
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Documents
      </h1>

      <div className="space-y-3">
        {docs.map((doc) => (
          <div
            key={doc}
            className="border rounded-lg p-4"
          >
            {doc}
          </div>
        ))}
      </div>
    </div>
  );
}