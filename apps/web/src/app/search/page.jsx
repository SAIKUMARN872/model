"use client";

import { useState } from "react";

const results = [
  "AI Research Report",
  "Machine Learning Guide",
  "GPT-4 Documentation",
  "Enterprise Dashboard",
];

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const filtered = results.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">
        AI Search
      </h1>

      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-6 w-full rounded-lg border p-3"
      />

      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item}
            className="rounded-lg border bg-white p-4 shadow-sm"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}