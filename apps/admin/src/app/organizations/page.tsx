type OrganizationMetric = {
  title: string;
  value: string;
  description: string;
};

type Organization = {
  id: string;
  name: string;
  owner: string;
  plan: "Enterprise" | "Business" | "Starter";
  members: number;
  status: "Active" | "Suspended" | "Pending";
  createdAt: string;
};

export default function OrganizationsPage() {
  const organizationMetrics: OrganizationMetric[] = [
    {
      title: "Total Organizations",
      value: "1,284",
      description: "Organizations registered on the platform",
    },
    {
      title: "Active Organizations",
      value: "1,247",
      description: "Organizations currently active",
    },
    {
      title: "Enterprise Accounts",
      value: "186",
      description: "Organizations on enterprise plans",
    },
    {
      title: "Pending Organizations",
      value: "23",
      description: "Organizations awaiting activation",
    },
  ];

  const organizations: Organization[] = [
    {
      id: "ORG-1001",
      name: "Acme Corporation",
      owner: "admin@acme.example",
      plan: "Enterprise",
      members: 842,
      status: "Active",
      createdAt: "January 12, 2026",
    },
    {
      id: "ORG-1002",
      name: "Northstar Technologies",
      owner: "admin@northstar.example",
      plan: "Enterprise",
      members: 624,
      status: "Active",
      createdAt: "February 8, 2026",
    },
    {
      id: "ORG-1003",
      name: "Vertex Labs",
      owner: "owner@vertex.example",
      plan: "Business",
      members: 186,
      status: "Active",
      createdAt: "March 21, 2026",
    },
    {
      id: "ORG-1004",
      name: "CloudWorks",
      owner: "admin@cloudworks.example",
      plan: "Business",
      members: 94,
      status: "Active",
      createdAt: "April 5, 2026",
    },
    {
      id: "ORG-1005",
      name: "Nova Research",
      owner: "owner@novaresearch.example",
      plan: "Starter",
      members: 28,
      status: "Pending",
      createdAt: "July 18, 2026",
    },
  ];

  return (
    <main>
      <header>
        <h1>Organizations</h1>

        <p>
          Manage organizations, enterprise accounts, membership, subscription
          plans, and organizational access across the ModelNow platform.
        </p>
      </header>

      <section>
        <h2>Organization Overview</h2>

        <div>
          {organizationMetrics.map((metric) => (
            <article key={metric.title}>
              <h3>{metric.title}</h3>

              <strong>{metric.value}</strong>

              <p>{metric.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>Organization Directory</h2>

        <table>
          <thead>
            <tr>
              <th>Organization ID</th>
              <th>Name</th>
              <th>Owner</th>
              <th>Plan</th>
              <th>Members</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>

          <tbody>
            {organizations.map((organization) => (
              <tr key={organization.id}>
                <td>{organization.id}</td>
                <td>{organization.name}</td>
                <td>{organization.owner}</td>
                <td>{organization.plan}</td>
                <td>{organization.members}</td>
                <td>{organization.status}</td>
                <td>{organization.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Organization Management</h2>

        <ul>
          <li>Organization lifecycle management</li>
          <li>Enterprise account administration</li>
          <li>Organization membership management</li>
          <li>Subscription and plan management</li>
          <li>Organization access controls</li>
          <li>Workspace administration</li>
          <li>Organization security settings</li>
          <li>Account suspension and activation</li>
          <li>Organization usage monitoring</li>
          <li>Administrative audit history</li>
        </ul>
      </section>
    </main>
  );
}