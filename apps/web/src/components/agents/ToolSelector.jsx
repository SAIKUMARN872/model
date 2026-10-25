"use client";

export default function ToolSelector({ selectedTool, onSelectTool }) {
  const tools = [
    "Search",
    "Calculator",
    "Code",
    "Memory",
  ];

  return (
    <div className="rounded-lg border p-6 bg-white shadow-sm">
      <h2 className="font-semibold mb-4 text-xl">
        Tool Selector
      </h2>

      <div className="space-y-3">
        {tools.map((tool) => {
          const isSelected = selectedTool === tool;

          return (
            <button
              key={tool}
              type="button"
              onClick={() => onSelectTool(tool)}
              className={`w-full text-left border rounded-md px-4 py-3 transition ${
                isSelected
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "hover:bg-gray-100"
              }`}
            >
              {tool}
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-md bg-gray-50 p-4">
        {selectedTool ? (
          <p>
            Selected Tool: <strong>{selectedTool}</strong>
          </p>
        ) : (
          <p className="text-gray-500">
            Select a tool to continue.
          </p>
        )}
      </div>
    </div>
  );
}