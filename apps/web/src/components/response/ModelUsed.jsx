export default function ModelUsed({
  model = "GPT-4"
}) {
  return (
    <div className="inline-flex items-center rounded-full border px-4 py-2 text-sm">
      Model: {model}
    </div>
  );
}