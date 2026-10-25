export default function SourceTimeline({
  timeline = []
}) {
  return (
    <div className="rounded-lg border p-5">
      <h2 className="font-semibold mb-3">
        Source Timeline
      </h2>

      {timeline.length === 0 ? (
        <p className="text-gray-500">
          No timeline available.
        </p>
      ) : (
        <ul className="space-y-2">
          {timeline.map((item, index) => (
            <li key={index}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}