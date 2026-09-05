import { useState } from "react";

export default function SearchInterface() {
  const [query, setQuery] = useState("");

  return (
    <div className="space-y-4">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="border rounded-md w-full p-2"
      />

      <button className="px-4 py-2 bg-black text-white rounded">
        Search
      </button>
    </div>
  );
}