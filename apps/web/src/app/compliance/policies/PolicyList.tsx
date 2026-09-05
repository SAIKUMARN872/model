"use client";

const policies = [
  {
    id: 1,
    name: "Security Policy",
    status: "Active",
  },
  {
    id: 2,
    name: "Privacy Policy",
    status: "Active",
  },
  {
    id: 3,
    name: "AI Usage Policy",
    status: "Review",
  },
  {
    id: 4,
    name: "Data Governance",
    status: "Draft",
  },
];

export default function PolicyList() {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">
        Policies
      </h2>

      <div className="space-y-3">
        {policies.map((policy) => (
          <div
            key={policy.id}
            className="flex items-center justify-between rounded border p-3"
          >
            <span>{policy.name}</span>

            <span className="rounded bg-blue-100 px-3 py-1 text-sm">
              {policy.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}