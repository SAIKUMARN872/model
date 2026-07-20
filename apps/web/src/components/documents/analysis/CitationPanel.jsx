"use client";

import { ExternalLink } from "lucide-react";

const citations = [
  {
    id: 1,
    title: "OpenAI Documentation",
    source: "https://platform.openai.com/docs",
  },
  {
    id: 2,
    title: "Next.js Documentation",
    source: "https://nextjs.org/docs",
  },
  {
    id: 3,
    title: "React Documentation",
    source: "https://react.dev",
  },
];

export default function CitationPanel() {
  return (
    <div className="rounded-xl border bg-white p-5 shadow">

      <h2 className="mb-5 text-lg font-semibold">
        Citations
      </h2>

      <div className="space-y-4">

        {citations.map((item) => (
          <a
            key={item.id}
            href={item.source}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
          >
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-gray-500">
                {item.source}
              </p>
            </div>

            <ExternalLink size={18} />
          </a>
        ))}

      </div>

    </div>
  );
}