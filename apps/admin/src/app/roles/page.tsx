type RoleMetric = {
  title: string;
  value: string;
  description: string;
};

type Role = {
  id: string;
  name: string;
  description: string;
  users: number;
  permissions: number;
  scope: "Global" | "Organization" | "Workspace";
  status: "Active" | "Restricted" | "Review Required";
};

export default function RolesPage() {
  const roleMetrics: RoleMetric[] = [
    {
      title: "Total Roles",
      value: "24",
      description: "Roles configured across the platform",
    },
    {
      title: "Active Roles",
      value: "21",
      description: "Roles currently available for assignment",
    },
    {
      title: "Privileged Roles",
      value: "6",
      description: "Roles with elevated administrative access",
    },
    {
      title: "Custom Roles",
      value: "14",
      description: "Organization and workspace-specific roles",
    },
  ];

  const roles: Role[] = [
    {
      id: "ROLE-1001",
      name: "Super Administrator",
      description: "Full platform administration and security access",
      users: 4,
      permissions: 148,
      scope: "Global",
      status: "Active",
    },
    {
      id: "ROLE-1002",
      name: "Platform Administrator",
      description: "Manages platform configuration and operations",
      users: 12,
      permissions: 112,
      scope: "Global",
      status: "Active",
    },
    {
      id: "ROLE-1003",
      name: "Organization Administrator",
      description: "Manages organization resources and members",
      users: 86,
      permissions: 74,
      scope: "Organization",
      status: "Active",
    },
    {
      id: "ROLE-1004",
      name: "Workspace Administrator",
      description: "Manages workspace settings and access",
      users: 248,
      permissions: 52,
      scope: "Workspace",
      status: "Active",
    },
    {
      id: "ROLE-1005",
      name: "Security Auditor",
      description: "Reviews security events and audit activity",
      users: 18,
      permissions: 34,
      scope: "Global",
      status: "Restricted",
    },
    {
      id: "ROLE-1006",
      name: "Billing Administrator",
      description: "Manages billing and subscription operations",
      users: 22,
      permissions: 28,
      scope: "Organization",
      status: "Review Required",
    },
  ];

  return (
    <main>
      <header>
        <h1>Roles &amp; Access Management</h1>

        <p>
          Define role-based access controls, manage administrative privileges,
          and govern user access across the ModelNow platform.
        </p>
      </header>

      <section>
        <h2>Role Overview</h2>

        <div>
          {roleMetrics.map((metric) => (
            <article key={metric.title}>
              <h3>{metric.title}</h3>

              <strong>{metric.value}</strong>

              <p>{metric.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>Role Directory</h2>

        <table>
          <thead>
            <tr>
              <th>Role ID</th>
              <th>Role Name</th>
              <th>Description</th>
              <th>Users</th>
              <th>Permissions</th>
              <th>Scope</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {roles.map((role) => (
              <tr key={role.id}>
                <td>{role.id}</td>
                <td>{role.name}</td>
                <td>{role.description}</td>
                <td>{role.users}</td>
                <td>{role.permissions}</td>
                <td>{role.scope}</td>
                <td>{role.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Role Management Capabilities</h2>

        <ul>
          <li>Role-based access control</li>
          <li>Custom role creation</li>
          <li>Role and permission assignment</li>
          <li>Global access management</li>
          <li>Organization-level role management</li>
          <li>Workspace-level role management</li>
          <li>Privileged role monitoring</li>
          <li>Access approval workflows</li>
          <li>Role lifecycle management</li>
          <li>Role assignment audit history</li>
        </ul>
      </section>
    </main>
  );
}