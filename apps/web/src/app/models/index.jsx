"use client";

const models = [
  {
    name: "GPT-4",
    status: "Active",
  },
  {
    name: "Claude",
    status: "Available",
  },
  {
    name: "Gemini",
    status: "Available",
  },
  {
    name: "Mistral",
    status: "Offline",
  },
];

export default function Models() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">
        AI Models
      </h1>

      <div className="space-y-4">
        {models.map((model) => (
          <div
            key={model.name}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <span>{model.name}</span>

            <span className="rounded bg-green-100 px-3 py-1">
              {model.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}