"use client";

export default function ContextViewer({
  title = "Conversation Context",
  context = [],
}) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">

      <h2 className="mb-4 text-lg font-semibold">
        {title}
      </h2>

      {context.length === 0 ? (
        <p className="text-gray-500">
          No context available.
        </p>
      ) : (
        <ul className="space-y-2">
          {context.map((item, index) => (
            <li
              key={index}
              className="rounded-lg border p-3"
            >
              {item}
            </li>
          ))}
        </ul>
      )}

    </div>
  );
}