type GovernanceMetric = {
  title: string;
  value: string;
  description: string;
};

type GovernancePolicy = {
  id: string;
  name: string;
  owner: string;
  status: "Active" | "Under Review" | "Draft";
  lastUpdated: string;
};

export default function GovernancePage() {
  const governanceMetrics: GovernanceMetric[] = [
    {
      title: "Active Policies",
      value: "42",
      description: "Policies currently enforced",
    },
    {
      title: "Pending Reviews",
      value: "7",
      description: "Policies awaiting review",
    },
    {
      title: "Control Coverage",
      value: "96%",
      description: "Governance controls covered",
    },
    {
      title: "Policy Violations",
      value: "6",
      description: "Violations requiring attention",
    },
  ];

  const governancePolicies: GovernancePolicy[] = [
    {
      id: "POL-1001",
      name: "Access Control Policy",
      owner: "Security Team",
      status: "Active",
      lastUpdated: "July 20, 2026",
    },
    {
      id: "POL-1002",
      name: "Data Retention Policy",
      owner: "Compliance Team",
      status: "Active",
      lastUpdated: "July 18, 2026",
    },
    {
      id: "POL-1003",
      name: "AI Model Usage Policy",
      owner: "AI Governance Team",
      status: "Under Review",
      lastUpdated: "July 15, 2026",
    },
    {
      id: "POL-1004",
      name: "Third-Party Risk Policy",
      owner: "Risk Management",
      status: "Active",
      lastUpdated: "July 12, 2026",
    },
    {
      id: "POL-1005",
      name: "Responsible AI Policy",
      owner: "AI Governance Team",
      status: "Draft",
      lastUpdated: "July 10, 2026",
    },
  ];

  return (
    <main>
      <header>
        <h1>Governance Center</h1>

        <p>
          Manage organizational policies, governance controls, risk oversight,
          accountability, and responsible AI practices across the ModelNow
          platform.
        </p>
      </header>

      <section>
        <h2>Governance Overview</h2>

        <div>
          {governanceMetrics.map((metric) => (
            <article key={metric.title}>
              <h3>{metric.title}</h3>

              <strong>{metric.value}</strong>

              <p>{metric.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>Policy Management</h2>

        <table>
          <thead>
            <tr>
              <th>Policy ID</th>
              <th>Policy Name</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Last Updated</th>
            </tr>
          </thead>

          <tbody>
            {governancePolicies.map((policy) => (
              <tr key={policy.id}>
                <td>{policy.id}</td>
                <td>{policy.name}</td>
                <td>{policy.owner}</td>
                <td>{policy.status}</td>
                <td>{policy.lastUpdated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Governance Capabilities</h2>

        <ul>
          <li>Policy lifecycle management</li>
          <li>Governance control monitoring</li>
          <li>Risk oversight and accountability</li>
          <li>AI governance management</li>
          <li>Responsible AI policy enforcement</li>
          <li>Access and authorization governance</li>
          <li>Data governance and retention controls</li>
          <li>Third-party risk oversight</li>
          <li>Policy review and approval workflows</li>
          <li>Governance reporting and evidence management</li>
        </ul>
      </section>
    </main>
  );
}