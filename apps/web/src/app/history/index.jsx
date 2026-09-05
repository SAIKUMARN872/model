"use client";

export default function History() {
  const history = [
    "Created AI Agent",
    "Uploaded Document",
    "Generated Report",
    "Updated Settings",
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Activity History
      </h1>

      <div className="space-y-3">
        {history.map((item, index) => (
          <div
            key={index}
            className="border rounded-lg p-4"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}