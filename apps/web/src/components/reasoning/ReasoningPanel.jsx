export default function ReasoningPanel({
  title = "Reasoning",
  steps = [],
}) {
  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>

      {steps.length === 0 ? (
        <p className="text-gray-500">
          No reasoning steps available.
        </p>
      ) : (
        <ol className="list-decimal pl-5 space-y-2">
          {steps.map((step, index) => (
            <li key={index} className="text-gray-700">
              {step}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}