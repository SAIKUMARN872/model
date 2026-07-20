"use client";

const models = [
  {
    name: "GPT-4",
    provider: "OpenAI",
    speed: "Fast",
    accuracy: "98%",
  },
  {
    name: "Claude",
    provider: "Anthropic",
    speed: "Fast",
    accuracy: "97%",
  },
  {
    name: "Gemini",
    provider: "Google",
    speed: "Very Fast",
    accuracy: "96%",
  },
];

export default function ModelCompare() {
  return (
    <div className="rounded-xl border bg-white p-6 shadow">

      <h2 className="mb-6 text-2xl font-bold">
        Compare Models
      </h2>

      <table className="w-full">

        <thead>

          <tr className="border-b">

            <th className="py-3 text-left">Model</th>
            <th className="text-left">Provider</th>
            <th className="text-left">Speed</th>
            <th className="text-left">Accuracy</th>

          </tr>

        </thead>

        <tbody>

          {models.map((model) => (

            <tr
              key={model.name}
              className="border-b hover:bg-gray-50"
            >

              <td className="py-3">{model.name}</td>

              <td>{model.provider}</td>

              <td>{model.speed}</td>

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