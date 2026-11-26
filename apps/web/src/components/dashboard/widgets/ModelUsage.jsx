"use client";

const models = [
  {
    name: "GPT-4",
    usage: 75,
  },
  {
    name: "Claude",
    usage: 60,
  },
  {
    name: "Gemini",
    usage: 45,
  },
];

export default function ModelUsage() {
  return (
    <div className="rounded-xl border bg-white p-5 shadow">

      <h2 className="mb-5 text-lg font-semibold">
        Model Usage
      </h2>

      <div className="space-y-5">

        {models.map((model) => (
          <div key={model.name}>

            <div className="mb-2 flex justify-between">
              <span>{model.name}</span>
              <span>{model.usage}%</span>
            </div>

            <div className="h-3 rounded-full bg-gray-200">

              <div
                className="h-3 rounded-full bg-blue-600"
                style={{ width: `${model.usage}%` }}
              />

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}