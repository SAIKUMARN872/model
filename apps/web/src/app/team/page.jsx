"use client";

const team = [
  {
    name: "John Doe",
    role: "Administrator",
  },
  {
    name: "Sarah Smith",
    role: "Developer",
  },
  {
    name: "David Lee",
    role: "Designer",
  },
  {
    name: "Emma Wilson",
    role: "Analyst",
  },
];

export default function TeamPage() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Team Members
      </h1>

      <div className="space-y-4">
        {team.map((member) => (
          <div
            key={member.name}
            className="rounded-lg border bg-white p-5 shadow-sm"
          >
            <h2 className="font-semibold">
              {member.name}
            </h2>

            <p className="text-gray-500">
              {member.role}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}