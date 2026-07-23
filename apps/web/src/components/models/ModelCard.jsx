"use client";

import { Brain, Zap } from "lucide-react";

export default function ModelCard({
  name = "GPT-4",
  provider = "OpenAI",
  description = "Powerful AI model for text generation.",
  speed = "Fast",
}) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow transition hover:shadow-lg">

      <div className="mb-4 flex items-center gap-3">
        <Brain className="text-blue-600" size={30} />

        <div>
          <h2 className="text-xl font-bold">{name}</h2>
          <p className="text-gray-500">{provider}</p>
        </div>
      </div>

      <p className="mb-5 text-gray-600">
        {description}
      </p>

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2">
          <Zap className="text-yellow-500" size={18} />
          <span>{speed}</span>
        </div>

        <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Select
        </button>

      </div>

    </div>
  );
}