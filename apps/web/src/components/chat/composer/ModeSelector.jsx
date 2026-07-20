"use client";

import { useState } from "react";

const modes = [
  "Chat",
  "Research",
  "Code",
  "Vision",
];

export default function ModeSelector() {
  const [selected, setSelected] = useState("Chat");

  return (
    <div className="flex flex-wrap gap-3">

      {modes.map((mode) => (
        <button
          key={mode}
          onClick={() => setSelected(mode)}
          className={`rounded-lg px-4 py-2 text-sm transition ${
            selected === mode
              ? "bg-blue-600 text-white"
              : "border hover:bg-gray-100"
          }`}
        >
          {mode}
        </button>
      ))}

    </div>
  );
}