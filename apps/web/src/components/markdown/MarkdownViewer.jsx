export default function MarkdownViewer({ content = "" }) {
  return (
    <div className="rounded-lg border bg-white p-5">
      <pre className="whitespace-pre-wrap break-words text-sm">
        {content || "Nothing to display."}
      </pre>
    </div>
  );
}