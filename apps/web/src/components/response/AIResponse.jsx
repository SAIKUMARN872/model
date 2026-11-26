export default function AIResponse({
  response = "No response generated yet."
}) {
  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-3">
        AI Response
      </h2>

      <div className="whitespace-pre-wrap text-gray-700">
        {response}
      </div>
    </div>
  );
}