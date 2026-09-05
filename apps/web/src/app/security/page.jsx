"use client";

const securityItems = [
  {
    title: "Two-Factor Authentication",
    status: "Enabled",
  },
  {
    title: "Encryption",
    status: "AES-256",
  },
  {
    title: "Firewall",
    status: "Active",
  },
  {
    title: "Threat Detection",
    status: "Running",
  },
];

export default function SecurityPage() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Security Center
      </h1>

      <div className="grid gap-4">
        {securityItems.map((item) => (
          <div
            key={item.title}
            className="flex items-center justify-between rounded-lg border bg-white p-5 shadow-sm"
          >
            <span>{item.title}</span>

            <span className="rounded bg-green-100 px-3 py-1 text-green-700">
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}