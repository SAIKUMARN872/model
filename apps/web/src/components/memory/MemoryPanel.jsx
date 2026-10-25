const memory = [
  "Previous conversation",
  "Saved prompt",
  "Pinned response"
];

export default function MemoryPanel() {
  return (
    <div className="rounded-lg border p-5">
      <h2 className="font-semibold mb-3">
        Memory
      </h2>

      <ul className="space-y-2">
        {memory.map((item) => (
          <li
            key={item}
            className="rounded border p-2"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}