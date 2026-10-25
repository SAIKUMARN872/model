export default function PromptCard({
  title = "Untitled Prompt",
  description = "No description"
}) {
  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-lg">
        {title}
      </h3>

      <p className="mt-2 text-gray-600">
        {description}
      </p>

      <button className="mt-4 rounded bg-black px-4 py-2 text-white">
        Use Prompt
      </button>
    </div>
  );
}