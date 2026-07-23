"use client";

import { useState } from "react";
import { Brain, CheckCircle } from "lucide-react";

const models = [
  {
    id: 1,
    name: "GPT-4",
    provider: "OpenAI",
  },
  {
    id: 2,
    name: "Claude 3",
    provider: "Anthropic",
  },
  {
    id: 3,
    name: "Gemini Pro",
    provider: "Google",
  },
  {
    id: 4,
    name: "Llama 3",
    provider: "Meta",
  },
];

export default function ModelSelector() {
  const [selected, setSelected] = useState(models[0]);

  return (
    <div className="rounded-xl border bg-white p-6 shadow">

      <div className="mb-6 flex items-center gap-3">
        <Brain className="text-blue-600" size={28} />

        <h2 className="text-2xl font-bold">
          Select AI Model
        </h2>
      </div>

      <div className="space-y-4">

        {models.map((model) => (

          <button
            key={model.id}
            onClick={() => setSelected(model)}
            className={`w-full rounded-lg border p-4 text-left transition
              ${
                selected.id === model.id
                  ? "border-blue-600 bg-blue-50"
                  : "hover:bg-gray-50"
              }`}
          >

            <div className="flex items-center justify-between">

              <div>

                <h3 className="font-semibold">
                  {model.name}
                </h3>

                <p className="text-sm text-gray-500">
                  {model.provider}
                </p>

              </div>

              {selected.id === model.id && (
                <CheckCircle
                  className="text-green-600"
                  size={22}
                />
              )}

            </div>

          </button>

        ))}

      </div>

      <div className="mt-6 rounded-lg bg-gray-100 p-4">

        <p className="text-sm text-gray-500">
          Selected Model
        </p>

        <h3 className="mt-1 text-lg font-bold">
          {selected.name}
        </h3>

        <p className="text-gray-600">
          {selected.provider}
        </p>

      </div>

    </div>
  );
}