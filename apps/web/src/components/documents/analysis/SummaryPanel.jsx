"use client";

export default function SummaryPanel({
  summary = "This document summary will appear here after AI processes the uploaded document.",
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow">

      <h2 className="mb-5 text-lg font-semibold">
        AI Summary
      </h2>

      <div className="rounded-lg bg-gray-50 p-4">

        <p className="leading-7 text-gray-700">
          {summary}
        </p>

      </div>

    </div>
  );
}