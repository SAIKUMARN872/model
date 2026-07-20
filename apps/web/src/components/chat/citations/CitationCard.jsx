"use client";

import { ExternalLink } from "lucide-react";

export default function CitationCard({
  title = "Reference",
  url = "#",
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
    >
      <div>
        <h4 className="font-semibold">{title}</h4>

        <p className="text-sm text-gray-500">
          Open source
        </p>
      </div>

      <ExternalLink size={18} />
    </a>
  );
}