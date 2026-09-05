"use client";

const stats = [
  {
    title: "Availability",
    value: "99.98%",
  },
  {
    title: "Uptime",
    value: "30 Days",
  },
  {
    title: "Incidents",
    value: "3",
  },
  {
    title: "Resolved",
    value: "3",
  },
];

export default function SLAOverview() {
  return (
    <div>
      <h2 className="mb-5 text-xl font-semibold">
        SLA Overview
      </h2>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.title}
            className="rounded-lg border bg-white p-5 shadow-sm"
          >
            <p className="text-gray-500">
              {item.title}
            </p>

            <h3 className="mt-2 text-3xl font-bold">
              {item.value}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}