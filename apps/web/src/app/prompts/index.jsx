"use client";

const prompts = [
  "Write a blog post",
  "Summarize a PDF",
  "Generate Python code",
  "Create SQL queries",
  "Explain algorithms",
];

export default function Prompts() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Prompt Library
      </h1>

      <div className="space-y-4">
        {prompts.map((prompt) => (
          <div
            key={prompt}
            className="rounded-lg border bg-white p-4 shadow-sm"
          >
            {prompt}
          </div>
        ))}
      </div>
    </div>
  );
}