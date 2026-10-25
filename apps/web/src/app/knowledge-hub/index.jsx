"use client";

const articles = [
  {
    title: "Getting Started with AI",
    category: "Guide",
  },
  {
    title: "Prompt Engineering",
    category: "Tutorial",
  },
  {
    title: "Model Comparison",
    category: "Documentation",
  },
  {
    title: "Deployment Guide",
    category: "Reference",
  },
];

export default function Knowledge() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Knowledge Base
      </h1>

      <div className="grid gap-4 md:grid-cols-2">
        {articles.map((article) => (
          <div
            key={article.title}
            className="rounded-lg border bg-white p-5 shadow-sm"
          >
            <h2 className="font-semibold text-lg">
              {article.title}
            </h2>

            <p className="mt-2 text-gray-500">
              {article.category}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}