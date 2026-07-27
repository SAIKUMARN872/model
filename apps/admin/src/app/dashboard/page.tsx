type DashboardMetric = {
  title: string;
  value: string;
  change: string;
  description: string;
};

type SystemActivity = {
  id: string;
  service: string;
  event: string;
  status: "Operational" | "Warning" | "Incident";
  time: string;
};

export default function DashboardPage() {
  const metrics: DashboardMetric[] = [
    {
      title: "Active Users",
      value: "24,892",
      change: "+12.4%",
      description: "Compared with the previous 30 days",
    },
    {
      title: "Organizations",
      value: "1,284",
      change: "+8.7%",
      description: "Active organizations on the platform",
    },
    {
      title: "API Requests",
      value: "18.6M",
      change: "+21.3%",
      description: "Requests processed this month",
    },
    {
      title: "Platform Availability",
      value: "99.99%",
      change: "+0.02%",
      description: "Current service availability",
    },
  ];

  const activities: SystemActivity[] = [
    {
      id: "ACT-1001",
      service: "Authentication",
      event: "User authentication service operating normally",
      status: "Operational",
      time: "2 minutes ago",
    },
    {
      id: "ACT-1002",
      service: "API Gateway",
      event: "Request processing within expected latency",
      status: "Operational",
      time: "8 minutes ago",
    },
    {
      id: "ACT-1003",
      service: "Model Runtime",
      event: "Increased model inference latency detected",
      status: "Warning",
      time: "15 minutes ago",
    },
    {
      id: "ACT-1004",
      service: "Data Platform",
      event: "Scheduled data synchronization completed",
      status: "Operational",
      time: "32 minutes ago",
    },
    {
      id: "ACT-1005",
      service: "Security",
      event: "Automated threat detection scan completed",
      status: "Operational",
      time: "1 hour ago",
    },
  ];

  return (
    <main>
      <header>
        <h1>Admin Dashboard</h1>

        <p>
          Monitor platform health, user activity, system performance, security,
          and operational metrics across the ModelNow ecosystem.
        </p>
      </header>

      <section>
        <h2>Platform Overview</h2>

        <div>
          {metrics.map((metric) => (
            <article key={metric.title}>
              <h3>{metric.title}</h3>

              <strong>{metric.value}</strong>

              <p>{metric.change}</p>

              <p>{metric.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>System Health</h2>

        <div>
          <article>
            <h3>API Services</h3>
            <p>Operational</p>
          </article>

          <article>
            <h3>Authentication</h3>
            <p>Operational</p>
          </article>

          <article>
            <h3>Model Runtime</h3>
            <p>Monitoring</p>
          </article>

          <article>
            <h3>Data Infrastructure</h3>
            <p>Operational</p>
          </article>
        </div>
      </section>

      <section>
        <h2>Recent System Activity</h2>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Service</th>
              <th>Event</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>

          <tbody>
            {activities.map((activity) => (
              <tr key={activity.id}>
                <td>{activity.id}</td>
                <td>{activity.service}</td>
                <td>{activity.event}</td>
                <td>{activity.status}</td>
                <td>{activity.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Administration Capabilities</h2>

        <ul>
          <li>User and access management</li>
          <li>Organization management</li>
          <li>Workspace administration</li>
          <li>Platform health monitoring</li>
          <li>Security and audit monitoring</li>
          <li>Compliance management</li>
          <li>Billing and usage management</li>
          <li>API and infrastructure monitoring</li>
          <li>System governance</li>
          <li>Operational analytics</li>
        </ul>
      </section>
    </main>
  );
}