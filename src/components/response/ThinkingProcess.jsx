export default function ThinkingProcess({
  steps = []
}) {
  return (
    <div className="rounded-lg border bg-white p-5">
      <h2 className="font-semibold mb-3">
        Thinking Process
      </h2>

      {steps.length === 0 ? (
        <p className="text-gray-500">
          No reasoning available.
        </p>
      ) : (
        <ol className="list-decimal pl-5 space-y-2">
          {steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      )}
    </div>
  );
}