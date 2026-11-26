"use client";

export default function CodeBlock({
  code = "",
  language = "javascript",
}) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-green-300">
      <code className={`language-${language}`}>
        {code}
      </code>
    </pre>
  );
}