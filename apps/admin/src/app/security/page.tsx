type SecurityMetric = {
  title: string;
  value: string;
  description: string;
};

type SecurityEvent = {
  id: string;
  type: string;
  source: string;
  severity: "Critical" | "High" | "Medium" | "Low" | "Info";
  status: "Open" | "Investigating" | "Resolved";
  time: string;
};

export default function SecurityPage() {
  const securityMetrics: SecurityMetric[] = [
    {
      title: "Security Score",
      value: "98.7%",
      description: "Overall platform security posture",
    },
    {
      title: "Active Threats",
      value: "3",
      description: "Threats currently under investigation",
    },
    {
      title: "Blocked Requests",
      value: "18,642",
      description: "Suspicious requests blocked today",
    },
    {
      title: "Failed Logins",
      value: "274",
      description: "Failed authentication attempts in 24 hours",
    },
  ];

  const securityEvents: SecurityEvent[] = [
    {
      id: "SEC-1001",
      type: "Suspicious API Activity",
      source: "API Gateway",
      severity: "High",
      status: "Investigating",
      time: "5 minutes ago",
    },
    {
      id: "SEC-1002",
      type: "Multiple Failed Login Attempts",
      source: "Authentication",
      severity: "Medium",
      status: "Open",
      time: "18 minutes ago",
    },
    {
      id: "SEC-1003",
      type: "Blocked Malicious Request",
      source: "Web Application Firewall",
      severity: "Critical",
      status: "Resolved",
      time: "42 minutes ago",
    },
    {
      id: "SEC-1004",
      type: "Unusual Data Access Pattern",
      source: "Data Platform",
      severity: "Medium",
      status: "Investigating",
      time: "1 hour ago",
    },
    {
      id: "SEC-1005",
      type: "Security Scan Completed",
      source: "Security Scanner",
      severity: "Info",
      status: "Resolved",
      time: "2 hours ago",
    },
  ];

  return (
    <main>
      <header>
        <h1>Security Center</h1>

        <p>
          Monitor security posture, authentication activity, threats,
          vulnerabilities, and security events across the ModelNow platform.
        </p>
      </header>

      <section>
        <h2>Security Overview</h2>

        <div>
          {securityMetrics.map((metric) => (
            <article key={metric.title}>
              <h3>{metric.title}</h3>

              <strong>{metric.value}</strong>

              <p>{metric.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>Security Events</h2>

        <table>
          <thead>
            <tr>
              <th>Event ID</th>
              <th>Event Type</th>
              <th>Source</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>

          <tbody>
            {securityEvents.map((event) => (
              <tr key={event.id}>
                <td>{event.id}</td>
                <td>{event.type}</td>
                <td>{event.source}</td>
                <td>{event.severity}</td>
                <td>{event.status}</td>
                <td>{event.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Security Capabilities</h2>

        <ul>
          <li>Authentication monitoring</li>
          <li>Threat detection and response</li>
          <li>API security monitoring</li>
          <li>Security event management</li>
          <li>Vulnerability monitoring</li>
          <li>Suspicious activity detection</li>
          <li>Web application protection</li>
          <li>Security incident management</li>
          <li>Access security monitoring</li>
          <li>Security audit history</li>
        </ul>
      </section>
    </main>
  );
}