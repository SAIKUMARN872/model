type AuditMetric = {
  title: string;
  value: string;
  description: string;
};

type AuditEvent = {
  id: string;
  actor: string;
  action: string;
  resource: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  timestamp: string;
};

export default function AuditPage(): React.JSX.Element {
  const metrics: AuditMetric[] = [
    {
      title: "Total Events",
      value: "128,642",
      description: "Audit events recorded",
    },
    {
      title: "Critical Alerts",
      value: "18",
      description: "Immediate investigation required",
    },
    {
      title: "Failed Logins",
      value: "274",
      description: "Last 24 hours",
    },
    {
      title: "Policy Violations",
      value: "6",
      description: "Pending review",
    },
  ];

  const events: AuditEvent[] = [
    {
      id: "AUD-1001",
      actor: "admin@modelnow.ai",
      action: "Updated organization security policy",
      resource: "Organization",
      severity: "Medium",
      timestamp: "2 minutes ago",
    },
    {
      id: "AUD-1002",
      actor: "system",
      action: "Infrastructure backup completed",
      resource: "Infrastructure",
      severity: "Low",
      timestamp: "12 minutes ago",
    },
    {
      id: "AUD-1003",
      actor: "security@modelnow.ai",
      action: "Blocked suspicious API key",
      resource: "API Gateway",
      severity: "High",
      timestamp: "28 minutes ago",
    },
    {
      id: "AUD-1004",
      actor: "billing@modelnow.ai",
      action: "Enterprise billing updated",
      resource: "Billing",
      severity: "Low",
      timestamp: "1 hour ago",
    },
  ];

  return (
    <main>
      <header>
        <h1>Audit Center</h1>
        <p>
          Monitor platform activity, security events, compliance logs, and
          administrative actions across ModelNow.
        </p>
      </header>

      <section>
        <h2>Platform Overview</h2>

        {metrics.map((metric) => (
          <article key={metric.title}>
            <h3>{metric.title}</h3>
            <strong>{metric.value}</strong>
            <p>{metric.description}</p>
          </article>
        ))}
      </section>

      <section>
        <h2>Recent Audit Events</h2>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Severity</th>
              <th>Time</th>
            </tr>
          </thead>

          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{event.id}</td>
                <td>{event.actor}</td>
                <td>{event.action}</td>
                <td>{event.resource}</td>
                <td>{event.severity}</td>
                <td>{event.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Audit Capabilities</h2>

        <ul>
          <li>User authentication history</li>
          <li>Role and permission tracking</li>
          <li>Organization activity logs</li>
          <li>API request auditing</li>
          <li>Model usage monitoring</li>
          <li>Security incident timeline</li>
          <li>Compliance reporting</li>
          <li>Immutable audit history</li>
          <li>Log export</li>
          <li>Real-time event monitoring</li>
        </ul>
      </section>
    </main>
  );
}
