export default function ToolSelector() {
  const tools = [
    "Search",
    "Calculator",
    "Code",
    "Memory"
  ];

  return (
    <div className="rounded-lg border p-6">
      <h2 className="font-semibold mb-3">Tool Selector</h2>

      <ul className="space-y-2">
        {tools.map(tool => (
          <li
            key={tool}
            className="border rounded-md px-3 py-2 hover:bg-gray-100 cursor-pointer"
          >
            {tool}
          </li>
        ))}
      </ul>
    </div>
  );
}