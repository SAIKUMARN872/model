"use client";

export default function AgentBuilder({ selected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-lg border p-6 shadow-sm transition ${
        selected
          ? "border-blue-500 bg-blue-50"
          : "bg-white hover:bg-gray-50"
      }`}
    >
      <h2 className="text-xl font-semibold">
        Agent Builder
      </h2>

      <p className="mt-2 text-gray-500">
        Configure and build AI agents.
      </p>

      {selected && (
        <div className="mt-5 rounded-md border bg-white p-4">
          <h3 className="font-semibold">
            Agent Builder
          </h3>

          <p className="mt-2 text-gray-600">
            Configure your AI agent by selecting tools,
            memory and workflow options.
          </p>

          <div className="mt-4 space-y-2">
            <div className="rounded border p-3">
              Agent Name
            </div>

            <div className="rounded border p-3">
              Select Tools
            </div>

            <div className="rounded border p-3">
              Configure Memory
            </div>

            <button
              type="button"
              className="mt-2 rounded-md border px-4 py-2 hover:bg-gray-100"
              onClick={(event) => event.stopPropagation()}
            >
              Create Agent
            </button>
          </div>
        </div>
      )}
    </div>
  );
}