"use client";

const stats = [
  {
    title: "Policies",
    value: 18,
  },
  {
    title: "Pending Reviews",
    value: 4,
  },
  {
    title: "Approved",
    value: 12,
  },
  {
    title: "Expired",
    value: 2,
  },
];

export default function PolicyDashboard() {
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">
        Policy Dashboard
      </h2>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.title}
            className="rounded-lg border bg-white p-5 shadow-sm"
          >
            <p className="text-gray-500">{item.title}</p>

            <h3 className="mt-2 text-3xl font-bold">
              {item.value}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}