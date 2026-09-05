export default function SourceList({
  sources = []
}) {
  return (
    <div className="rounded-lg border p-5">
      <h2 className="font-semibold mb-3">
        Sources
      </h2>

      {sources.length === 0 ? (
        <p className="text-gray-500">
          No sources available.
        </p>
      ) : (
        <ul className="space-y-2">
          {sources.map((source, index) => (
            <li
              key={index}
              className="rounded border p-2"
            >
              {source}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}