export default function ToolExecution({
  tool = "Unknown Tool",
  status = "Idle"
}) {
  return (
    <div className="rounded-lg border p-5 bg-white">
      <h2 className="font-semibold">
        {tool}
      </h2>

      <p className="mt-2 text-gray-600">
        Status: {status}
      </p>
    </div>
  );
}