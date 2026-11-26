export default function CitationList({ citations = [] }) {
  return (
    <div className="rounded-lg border p-4">
      <h2 className="font-semibold mb-3">
        Citations
      </h2>

      {citations.length === 0 ? (
        <p className="text-gray-500">No citations found.</p>
      ) : (
        <ul className="space-y-2">
          {citations.map((citation, index) => (
            <li
              key={index}
              className="border rounded p-2"
            >
              {citation}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}