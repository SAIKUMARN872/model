type UserMetric = {
  title: string;
  value: string;
  description: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  status: "Active" | "Suspended" | "Pending";
  lastActive: string;
};

export default function UsersPage() {
  const userMetrics: UserMetric[] = [
    {
      title: "Total Users",
      value: "24,892",
      description: "Registered users across the platform",
    },
    {
      title: "Active Users",
      value: "22,614",
      description: "Users active in the last 30 days",
    },
    {
      title: "Administrators",
      value: "186",
      description: "Users with administrative privileges",
    },
    {
      title: "Pending Users",
      value: "342",
      description: "Users awaiting account activation",
    },
  ];

  const users: User[] = [
    {
      id: "USR-1001",
      name: "Alex Morgan",
      email: "alex.morgan@example.com",
      role: "Super Administrator",
      organization: "Acme Corporation",
      status: "Active",
      lastActive: "2 minutes ago",
    },
    {
      id: "USR-1002",
      name: "Jordan Lee",
      email: "jordan.lee@example.com",
      role: "Organization Administrator",
      organization: "Northstar Technologies",
      status: "Active",
      lastActive: "15 minutes ago",
    },
    {
      id: "USR-1003",
      name: "Taylor Smith",
      email: "taylor.smith@example.com",
      role: "Workspace Administrator",
      organization: "Vertex Labs",
      status: "Active",
      lastActive: "32 minutes ago",
    },
    {
      id: "USR-1004",
      name: "Morgan Davis",
      email: "morgan.davis@example.com",
      role: "Security Auditor",
      organization: "CloudWorks",
      status: "Pending",
      lastActive: "1 hour ago",
    },
    {
      id: "USR-1005",
      name: "Casey Wilson",
      email: "casey.wilson@example.com",
      role: "Member",
      organization: "Nova Research",
      status: "Suspended",
      lastActive: "2 days ago",
    },
  ];

  return (
    <main>
      <header>
        <h1>User Management</h1>

        <p>
          Manage platform users, account status, roles, organizational access,
          and authentication activity across the ModelNow platform.
        </p>
      </header>

      <section>
        <h2>User Overview</h2>

        <div>
          {userMetrics.map((metric) => (
            <article key={metric.title}>
              <h3>{metric.title}</h3>

              <strong>{metric.value}</strong>

              <p>{metric.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>User Directory</h2>

        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Organization</th>
              <th>Status</th>
              <th>Last Active</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.organization}</td>
                <td>{user.status}</td>
                <td>{user.lastActive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>User Management Capabilities</h2>

        <ul>
          <li>User account lifecycle management</li>
          <li>User registration and activation</li>
          <li>Role and permission assignment</li>
          <li>Organization membership management</li>
          <li>Account suspension and reactivation</li>
          <li>Authentication activity monitoring</li>
          <li>Privileged user management</li>
          <li>User access reviews</li>
          <li>Identity and access governance</li>
          <li>User activity audit history</li>
        </ul>
      </section>
    </main>
  );
}