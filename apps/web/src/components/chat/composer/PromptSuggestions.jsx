"use client";

const suggestions = [
  "Explain this code",
  "Generate React component",
  "Summarize PDF",
  "Create SQL query",
];

export default function PromptSuggestions() {
  return (
    <div className="mt-4">

      <p className="mb-2 text-sm font-semibold text-gray-600">
        Suggestions
      </p>

      <div className="flex flex-wrap gap-2">

        {suggestions.map((item) => (
          <button
            key={item}
            className="rounded-full border px-4 py-2 text-sm hover:bg-gray-100"
          >
            {item}
          </button>
        ))}

      </div>

    </div>
  );
}