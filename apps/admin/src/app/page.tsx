type WorkspaceMetric = {
  title: string;
  value: string;
  description: string;
};

type Workspace = {
  id: string;
  name: string;
  organization: string;
  owner: string;
  members: number;
  plan: "Enterprise" | "Business" | "Starter";
  status: "Active" | "Suspended" | "Pending";
  lastActivity: string;
};

export default function WorkspacesPage() {
  const workspaceMetrics: WorkspaceMetric[] = [
    {
      title: "Total Workspaces",
      value: "3,842",
      description: "Workspaces created across all organizations",
    },
    {
      title: "Active Workspaces",
      value: "3,614",
      description: "Workspaces with recent activity",
    },
    {
      title: "Total Members",
      value: "24,892",
      description: "Users assigned to platform workspaces",
    },
    {
      title: "Pending Workspaces",
      value: "86",
      description: "Workspaces awaiting activation",
    },
  ];

  const workspaces: Workspace[] = [
    {
      id: "WS-1001",
      name: "AI Research Hub",
      organization: "Acme Corporation",
      owner: "admin@acme.example",
      members: 842,
      plan: "Enterprise",
      status: "Active",
      lastActivity: "2 minutes ago",
    },
    {
      id: "WS-1002",
      name: "Product Engineering",
      organization: "Northstar Technologies",
      owner: "admin@northstar.example",
      members: 624,
      plan: "Enterprise",
      status: "Active",
      lastActivity: "12 minutes ago",
    },
    {
      id: "WS-1003",
      name: "Model Development",
      organization: "Vertex Labs",
      owner: "owner@vertex.example",
      members: 186,
      plan: "Business",
      status: "Active",
      lastActivity: "28 minutes ago",
    },
    {
      id: "WS-1004",
      name: "Data Operations",
      organization: "CloudWorks",
      owner: "admin@cloudworks.example",
      members: 94,
      plan: "Business",
      status: "Active",
      lastActivity: "1 hour ago",
    },
    {
      id: "WS-1005",
      name: "Research Sandbox",
      organization: "Nova Research",
      owner: "owner@novaresearch.example",
      members: 28,
      plan: "Starter",
      status: "Pending",
      lastActivity: "3 hours ago",
    },
    {
      id: "WS-1006",
      name: "Legacy Workspace",
      organization: "Acme Corporation",
      owner: "admin@acme.example",
      members: 16,
      plan: "Business",
      status: "Suspended",
      lastActivity: "5 days ago",
    },
  ];

  return (
    <main>
      <header>
        <h1>Workspace Management</h1>

        <p>
          Manage workspaces, membership, organizational resources, access
          controls, and workspace lifecycle operations across the ModelNow
          platform.
        </p>
      </header>

      <section>
        <h2>Workspace Overview</h2>

        <div>
          {workspaceMetrics.map((metric) => (
            <article key={metric.title}>
              <h3>{metric.title}</h3>

              <strong>{metric.value}</strong>

              <p>{metric.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>Workspace Directory</h2>

        <table>
          <thead>
            <tr>
              <th>Workspace ID</th>
              <th>Name</th>
              <th>Organization</th>
              <th>Owner</th>
              <th>Members</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Last Activity</th>
            </tr>
          </thead>

          <tbody>
            {workspaces.map((workspace) => (
              <tr key={workspace.id}>
                <td>{workspace.id}</td>
                <td>{workspace.name}</td>
                <td>{workspace.organization}</td>
                <td>{workspace.owner}</td>
                <td>{workspace.members}</td>
                <td>{workspace.plan}</td>
                <td>{workspace.status}</td>
                <td>{workspace.lastActivity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Workspace Management Capabilities</h2>

        <ul>
          <li>Workspace lifecycle management</li>
          <li>Workspace creation and provisioning</li>
          <li>Workspace membership management</li>
          <li>Workspace owner management</li>
          <li>Organization-level workspace administration</li>
          <li>Workspace access control</li>
          <li>Workspace activation and suspension</li>
          <li>Workspace usage monitoring</li>
          <li>Workspace security configuration</li>
          <li>Workspace activity audit history</li>
        </ul>
      </section>
    </main>
  );
}