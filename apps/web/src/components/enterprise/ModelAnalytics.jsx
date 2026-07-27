"use client";

import { Brain } from "lucide-react";

const models = [
  {
    name: "GPT-4",
    requests: 5400,
    accuracy: "98%",
  },
  {
    name: "Claude",
    requests: 4200,
    accuracy: "97%",
  },
  {
    name: "Gemini",
    requests: 3100,
    accuracy: "96%",
  },
];

export default function ModelAnalytics() {
  return (
    <div className="rounded-xl border bg-white p-6 shadow">

      <div className="mb-6 flex items-center gap-3">
        <Brain className="text-blue-600" size={28} />

        <h2 className="text-2xl font-bold">
          Model Analytics
        </h2>
      </div>

      <table className="w-full">

        <thead>
          <tr className="border-b">
            <th className="py-3 text-left">Model</th>
            <th className="py-3 text-left">Requests</th>
            <th className="py-3 text-left">Accuracy</th>
          </tr>
        </thead>

        <tbody>

          {models.map((model) => (
            <tr
              key={model.name}
              className="border-b hover:bg-gray-50"
            >
              <td className="py-3">
                {model.name}
              </td>

              <td>{model.requests}</td>

              <td className="font-semibold text-green-600">
                {model.accuracy}
              </td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}