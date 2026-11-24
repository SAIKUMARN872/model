"use client";

import { useEffect, useState } from "react";

export default function StreamingResponse({
  text = "Generating AI response...",
}) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let index = 0;

    const interval = setInterval(() => {
      setDisplayText(text.slice(0, index));

      index++;

      if (index > text.length) {
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className="rounded-xl border bg-gray-50 p-4 shadow-sm">

      <p className="whitespace-pre-wrap text-gray-800">
        {displayText}
      </p>

      <span className="animate-pulse text-blue-600">
        |
      </span>

    </div>
  );
}