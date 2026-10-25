"use client";

const modules = [
  "AI Chat",
  "Agents",
  "Research",
  "Analytics",
  "Documents",
  "Voice",
];

export default function WorkspacePage() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Workspace
      </h1>

      <div className="grid gap-5 md:grid-cols-3">
        {modules.map((module) => (
          <div
            key={module}
            className="rounded-lg border bg-white p-6 text-center shadow-sm hover:shadow-lg"
          >
            <h2 className="text-lg font-semibold">
              {module}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}