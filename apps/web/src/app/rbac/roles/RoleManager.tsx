"use client";

const roles = [
  {
    id: 1,
    name: "Administrator",
    users: 4,
  },
  {
    id: 2,
    name: "Manager",
    users: 10,
  },
  {
    id: 3,
    name: "Developer",
    users: 18,
  },
  {
    id: 4,
    name: "Viewer",
    users: 31,
  },
];

export default function RoleManager() {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-semibold">
        Roles
      </h2>

      <div className="space-y-3">
        {roles.map((role) => (
          <div
            key={role.id}
            className="flex items-center justify-between rounded-md border p-4"
          >
            <div>
              <h3 className="font-semibold">
                {role.name}
              </h3>

              <p className="text-sm text-gray-500">
                {role.users} Users
              </p>
            </div>

            <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Manage
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}