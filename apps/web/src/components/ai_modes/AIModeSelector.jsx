const modes = [
  "Chat",
  "Research",
  "Document",
  "Agent"
];

export default function AIModeSelector() {
  return (
    <div className="flex gap-3 flex-wrap">
      {modes.map((mode) => (
        <button
          key={mode}
          className="border px-4 py-2 rounded hover:bg-gray-100"
        >
          {mode}
        </button>
      ))}
    </div>
  );
}