"use client";

const permissions = [
  {
    module: "Dashboard",
    admin: true,
    manager: true,
    user: true,
  },
  {
    module: "Agents",
    admin: true,
    manager: true,
    user: false,
  },
  {
    module: "Billing",
    admin: true,
    manager: false,
    user: false,
  },
  {
    module: "Settings",
    admin: true,
    manager: false,
    user: false,
  },
];

export default function PermissionMatrix() {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-semibold">
        Permission Matrix
      </h2>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-3 text-left">Module</th>
            <th>Admin</th>
            <th>Manager</th>
            <th>User</th>
          </tr>
        </thead>

        <tbody>
          {permissions.map((item) => (
            <tr
              key={item.module}
              className="border-b"
            >
              <td className="py-3">{item.module}</td>

              <td className="text-center">
                {item.admin ? "✅" : "❌"}
              </td>

              <td className="text-center">
                {item.manager ? "✅" : "❌"}
              </td>

              <td className="text-center">
                {item.user ? "✅" : "❌"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}