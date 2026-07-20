"use client";

const questions = [
  "What is the main topic?",
  "Summarize this document.",
  "List important keywords.",
  "Explain the conclusion.",
  "Generate interview questions.",
];

export default function QuestionPanel() {
  return (
    <div className="rounded-xl border bg-white p-5 shadow">

      <h2 className="mb-5 text-lg font-semibold">
        Suggested Questions
      </h2>

      <div className="space-y-3">

        {questions.map((question, index) => (
          <button
            key={index}
            className="w-full rounded-lg border p-3 text-left transition hover:bg-blue-50"
          >
            {question}
          </button>
        ))}

      </div>

    </div>
  );
}