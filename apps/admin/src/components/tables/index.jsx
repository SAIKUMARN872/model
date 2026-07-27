export default function Tables() {
  const users = [
    {
      id: "USR-001",
      name: "Aarav Sharma",
      email: "aarav@example.com",
      role: "Administrator",
      status: "Active",
      lastActive: "2 minutes ago",
    },
    {
      id: "USR-002",
      name: "Priya Reddy",
      email: "priya@example.com",
      role: "Developer",
      status: "Active",
      lastActive: "15 minutes ago",
    },
    {
      id: "USR-003",
      name: "Rahul Kumar",
      email: "rahul@example.com",
      role: "Viewer",
      status: "Inactive",
      lastActive: "2 hours ago",
    },
    {
      id: "USR-004",
      name: "Ananya Patel",
      email: "ananya@example.com",
      role: "Security Analyst",
      status: "Active",
      lastActive: "5 minutes ago",
    },
  ];

  return (
    <section>
      <header>
        <div>
          <h2>Users</h2>
          <p>Manage users, roles, access, and account activity.</p>
        </div>
      </header>

      <div>
        <table>
          <thead>
            <tr>
              <th scope="col">User ID</th>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Role</th>
              <th scope="col">Status</th>
              <th scope="col">Last Active</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.status}</td>
                <td>{user.lastActive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}