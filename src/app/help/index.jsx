"use client";

export default function Help() {
  const topics = [
    "Getting Started",
    "Account Settings",
    "Billing",
    "API Documentation",
    "Support",
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Help Center
      </h1>

      <div className="space-y-3">
        {topics.map((topic) => (
          <div
            key={topic}
            className="border rounded-lg p-4"
          >
            {topic}
          </div>
        ))}
      </div>
    </div>
  );
}