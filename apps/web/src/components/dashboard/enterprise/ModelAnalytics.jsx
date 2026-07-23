"use client";

const models = [
  {
    name: "GPT-4",
    requests: 3200,
    accuracy: "98%"
  },
  {
    name: "Claude",
    requests: 2800,
    accuracy: "97%"
  },
  {
    name: "Gemini",
    requests: 2100,
    accuracy: "95%"
  },
];

export default function ModelAnalytics() {
  return (
    <div className="rounded-xl border bg-white p-5 shadow">

      <h2 className="mb-5 text-lg font-semibold">
        Model Analytics
      </h2>

      <table className="w-full">

        <thead>
          <tr className="border-b">
            <th className="py-2 text-left">Model</th>
            <th className="py-2 text-left">Requests</th>
            <th className="py-2 text-left">Accuracy</th>
          </tr>
        </thead>

        <tbody>

          {models.map((model) => (
            <tr
              key={model.name}
              className="border-b"
            >
              <td className="py-3">{model.name}</td>
              <td>{model.requests}</td>
              <td>{model.accuracy}</td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}