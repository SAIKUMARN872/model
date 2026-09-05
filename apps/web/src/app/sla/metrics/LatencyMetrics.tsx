"use client";

const latency = [
  {
    service: "OpenAI",
    value: "210 ms",
  },
  {
    service: "Claude",
    value: "185 ms",
  },
  {
    service: "Gemini",
    value: "240 ms",
  },
  {
    service: "Mistral",
    value: "195 ms",
  },
];

export default function LatencyMetrics() {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-semibold">
        Latency Metrics
      </h2>

      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="py-3 text-left">
              Service
            </th>

            <th className="text-left">
              Average Latency
            </th>
          </tr>
        </thead>

        <tbody>
          {latency.map((item) => (
            <tr
              key={item.service}
              className="border-b"
            >
              <td className="py-3">
                {item.service}
              </td>

              <td>{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}