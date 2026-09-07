type UsageMetric = {
  title: string;
  value: string;
  description: string;
};

type UsageRecord = {
  id: string;
  organization: string;
  resource: string;
  usage: string;
  limit: string;
  utilization: string;
  status: "Healthy" | "Warning" | "Exceeded";
};

export default function UsagePage() {
  const usageMetrics: UsageMetric[] = [
    {
      title: "Total Requests",
      value: "18.6M",
      description: "API and platform requests this month",
    },
    {
      title: "Model Tokens",
      value: "842.7M",
      description: "Tokens processed across all models",
    },
    {
      title: "Compute Usage",
      value: "64.8%",
      description: "Current infrastructure utilization",
    },
    {
      title: "Storage Usage",
      value: "42.3 TB",
      description: "Total platform storage consumed",
    },
  ];

  const usageRecords: UsageRecord[] = [
    {
      id: "USE-1001",
      organization: "Acme Corporation",
      resource: "API Requests",
      usage: "4.8M",
      limit: "10M",
      utilization: "48%",
      status: "Healthy",
    },
    {
      id: "USE-1002",
      organization: "Northstar Technologies",
      resource: "Model Tokens",
      usage: "186M",
      limit: "250M",
      utilization: "74%",
      status: "Warning",
    },
    {
      id: "USE-1003",
      organization: "Vertex Labs",
      resource: "Compute",
      usage: "82 hours",
      limit: "120 hours",
      utilization: "68%",
      status: "Healthy",
    },
    {
      id: "USE-1004",
      organization: "CloudWorks",
      resource: "Storage",
      usage: "8.4 TB",
      limit: "10 TB",
      utilization: "84%",
      status: "Warning",
    },
    {
      id: "USE-1005",
      organization: "Nova Research",
      resource: "API Requests",
      usage: "1.2M",
      limit: "1M",
      utilization: "120%",
      status: "Exceeded",
    },
  ];

  return (
    <main>
      <header>
        <h1>Usage &amp; Resource Monitoring</h1>

        <p>
          Monitor API activity, model consumption, compute resources, storage,
          and usage limits across the ModelNow platform.
        </p>
      </header>

      <section>
        <h2>Usage Overview</h2>

        <div>
          {usageMetrics.map((metric) => (
            <article key={metric.title}>
              <h3>{metric.title}</h3>

              <strong>{metric.value}</strong>

              <p>{metric.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>Organization Usage</h2>

        <table>
          <thead>
            <tr>
              <th>Usage ID</th>
              <th>Organization</th>
              <th>Resource</th>
              <th>Usage</th>
              <th>Limit</th>
              <th>Utilization</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {usageRecords.map((record) => (
              <tr key={record.id}>
                <td>{record.id}</td>
                <td>{record.organization}</td>
                <td>{record.resource}</td>
                <td>{record.usage}</td>
                <td>{record.limit}</td>
                <td>{record.utilization}</td>
                <td>{record.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Usage Monitoring Capabilities</h2>

        <ul>
          <li>API request monitoring</li>
          <li>Model token usage tracking</li>
          <li>Compute resource monitoring</li>
          <li>Storage consumption tracking</li>
          <li>Organization usage monitoring</li>
          <li>Usage limit management</li>
          <li>Resource utilization alerts</li>
          <li>Quota and capacity monitoring</li>
          <li>Usage trend analysis</li>
          <li>Enterprise resource governance</li>
        </ul>
      </section>
    </main>
  );
}