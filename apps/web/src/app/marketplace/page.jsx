"use client";

const apps = [
  {
    name: "AI Chat",
    developer: "OpenAI",
  },
  {
    name: "Image Generator",
    developer: "Community",
  },
  {
    name: "Document Analyzer",
    developer: "Enterprise",
  },
  {
    name: "Research Assistant",
    developer: "AI Labs",
  },
];

export default function MarketplacePage() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">
        AI Marketplace
      </h1>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {apps.map((app) => (
          <div
            key={app.name}
            className="rounded-lg border bg-white p-5 shadow-sm"
          >
            <h2 className="font-semibold">
              {app.name}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {app.developer}
            </p>

            <button className="mt-4 rounded bg-blue-600 px-4 py-2 text-white">
              Install
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}