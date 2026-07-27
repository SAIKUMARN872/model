type PermissionMetric = {
  title: string;
  value: string;
  description: string;
};

type Permission = {
  id: string;
  name: string;
  resource: string;
  action: string;
  scope: "Global" | "Organization" | "Workspace";
  status: "Active" | "Restricted" | "Review Required";
};

export default function PermissionsPage() {
  const permissionMetrics: PermissionMetric[] = [
    {
      title: "Total Permissions",
      value: "148",
      description: "Permissions configured across the platform",
    },
    {
      title: "Active Roles",
      value: "24",
      description: "Roles currently assigned to users",
    },
    {
      title: "Privileged Access",
      value: "86",
      description: "Users with elevated permissions",
    },
    {
      title: "Pending Reviews",
      value: "12",
      description: "Access permissions awaiting review",
    },
  ];

  const permissions: Permission[] = [
    {
      id: "PERM-1001",
      name: "Manage Users",
      resource: "Users",
      action: "Create, Read, Update, Delete",
      scope: "Global",
      status: "Active",
    },
    {
      id: "PERM-1002",
      name: "Manage Organizations",
      resource: "Organizations",
      action: "Create, Read, Update, Delete",
      scope: "Global",
      status: "Active",
    },
    {
      id: "PERM-1003",
      name: "Manage Workspaces",
      resource: "Workspaces",
      action: "Create, Read, Update, Delete",
      scope: "Organization",
      status: "Active",
    },
    {
      id: "PERM-1004",
      name: "View Audit Logs",
      resource: "Audit",
      action: "Read",
      scope: "Global",
      status: "Active",
    },
    {
      id: "PERM-1005",
      name: "Manage Billing",
      resource: "Billing",
      action: "Read, Update",
      scope: "Organization",
      status: "Restricted",
    },
    {
      id: "PERM-1006",
      name: "Manage AI Models",
      resource: "Models",
      action: "Read, Update",
      scope: "Workspace",
      status: "Review Required",
    },
  ];

  return (
    <main>
      <header>
        <h1>Permissions &amp; Access Control</h1>

        <p>
          Manage role-based access control, platform permissions, privileged
          access, and authorization policies across the ModelNow platform.
        </p>
      </header>

      <section>
        <h2>Access Overview</h2>

        <div>
          {permissionMetrics.map((metric) => (
            <article key={metric.title}>
              <h3>{metric.title}</h3>

              <strong>{metric.value}</strong>

              <p>{metric.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>Permission Directory</h2>

        <table>
          <thead>
            <tr>
              <th>Permission ID</th>
              <th>Permission</th>
              <th>Resource</th>
              <th>Action</th>
              <th>Scope</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {permissions.map((permission) => (
              <tr key={permission.id}>
                <td>{permission.id}</td>
                <td>{permission.name}</td>
                <td>{permission.resource}</td>
                <td>{permission.action}</td>
                <td>{permission.scope}</td>
                <td>{permission.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Access Control Capabilities</h2>

        <ul>
          <li>Role-based access control</li>
          <li>Fine-grained permissions</li>
          <li>Privileged access management</li>
          <li>Organization-level authorization</li>
          <li>Workspace-level authorization</li>
          <li>Permission review workflows</li>
          <li>Access approval and revocation</li>
          <li>Least-privilege enforcement</li>
          <li>Administrative access monitoring</li>
          <li>Permission audit history</li>
        </ul>
      </section>
    </main>
  );
}