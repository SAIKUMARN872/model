"use client";

const users = [
  {
    id: 1,
    name: "John Doe",
    role: "Administrator",
  },
  {
    id: 2,
    name: "Sarah Smith",
    role: "Manager",
  },
  {
    id: 3,
    name: "David Lee",
    role: "Developer",
  },
  {
    id: 4,
    name: "Emma Wilson",
    role: "Viewer",
  },
];

export default function UserAccess() {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-semibold">
        User Access
      </h2>

      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="py-3 text-left">User</th>
            <th className="text-left">Role</th>
            <th className="text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b"
            >
              <td className="py-3">{user.name}</td>

              <td>{user.role}</td>

              <td>
                <span className="rounded bg-green-100 px-3 py-1 text-green-700">
                  Active
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}