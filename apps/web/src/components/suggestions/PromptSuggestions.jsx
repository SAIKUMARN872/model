const suggestions = [
  "Explain AI",
  "Summarize this document",
  "Write Python code",
  "Generate a React component"
];

export default function PromptSuggestions() {
  return (
    <div className="rounded-lg border p-5">
      <h2 className="font-semibold mb-3">
        Prompt Suggestions
      </h2>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((item) => (
          <button
            key={item}
            className="rounded-full border px-4 py-2 hover:bg-gray-100"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}