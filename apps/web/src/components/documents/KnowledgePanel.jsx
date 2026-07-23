"use client";

const knowledge = [
  "Document uploaded successfully",
  "Text extracted",
  "Key entities identified",
  "Summary generated",
  "Ready for AI questions",
];

export default function KnowledgePanel() {
  return (
    <div className="rounded-xl border bg-white p-5 shadow">

      <h2 className="mb-5 text-lg font-semibold">
        Knowledge Panel
      </h2>

      <ul className="space-y-3">

        {knowledge.map((item, index) => (
          <li
            key={index}
            className="rounded-lg border p-3 hover:bg-gray-50"
          >
            {item}
          </li>
        ))}

      </ul>

    </div>
  );
}