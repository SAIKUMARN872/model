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
  timestamp: string;
};

type SecurityPanelProps = {
  events?: SecurityEvent[];
};

const defaultSecurityEvents: SecurityEvent[] = [
  {
    id: "SEC-1001",
    type: "Suspicious API Activity",
    source: "API Gateway",
    severity: "High",
    status: "Investigating",
    timestamp: "5 minutes ago",
  },
  {
    id: "SEC-1002",
    type: "Multiple Failed Login Attempts",
    source: "Authentication",
    severity: "Medium",
    status: "Open",
    timestamp: "18 minutes ago",
  },
  {
    id: "SEC-1003",
    type: "Blocked Malicious Request",
    source: "Web Application Firewall",
    severity: "Critical",
    status: "Resolved",
    timestamp: "42 minutes ago",
  },
  {
    id: "SEC-1004",
    type: "Unusual Data Access Pattern",
    source: "Data Platform",
    severity: "Medium",
    status: "Investigating",
    timestamp: "1 hour ago",
  },
  {
    id: "SEC-1005",
    type: "Security Scan Completed",
    source: "Security Scanner",
    severity: "Info",
    status: "Resolved",
    timestamp: "2 hours ago",
  },
];

export default function SecurityPanel({
  events = defaultSecurityEvents,
}: SecurityPanelProps) {
  const securityMetrics: SecurityMetric[] = [
    {
      title: "Security Score",
      value: "98.7%",
      description: "Overall platform security posture",
    },
    {
      title: "Active Threats",
      value: String(
        events.filter(
          (event) =>
            event.status === "Open" ||
            event.status === "Investigating",
        ).length,
      ),
      description: "Security events currently requiring attention",
    },
    {
      title: "Critical Events",
      value: String(
        events.filter(
          (event) => event.severity === "Critical",
        ).length,
      ),
      description: "Critical security events detected",
    },
    {
      title: "Resolved Events",
      value: String(
        events.filter(
          (event) => event.status === "Resolved",
        ).length,
      ),
      description: "Security events successfully resolved",
    },
  ];

  return (
    <section>
      <header>
        <h2>Security Operations</h2>

        <p>
          Monitor threats, security incidents, authentication activity, and
          security controls across the ModelNow platform.
        </p>
      </header>

      <section>
        <h3>Security Overview</h3>

        <div>
          {securityMetrics.map((metric) => (
            <article key={metric.title}>
              <h4>{metric.title}</h4>

              <strong>{metric.value}</strong>

              <p>{metric.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h3>Recent Security Events</h3>

        <div>
          <table>
            <caption>
              Security events requiring monitoring and investigation
            </caption>

            <thead>
              <tr>
                <th scope="col">Event ID</th>
                <th scope="col">Event Type</th>
                <th scope="col">Source</th>
                <th scope="col">Severity</th>
                <th scope="col">Status</th>
                <th scope="col">Timestamp</th>
              </tr>
            </thead>

            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{event.id}</td>
                  <td>{event.type}</td>
                  <td>{event.source}</td>
                  <td>{event.severity}</td>
                  <td>{event.status}</td>
                  <td>{event.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {events.length === 0 && (
          <p>
            No security events are currently available.
          </p>
        )}
      </section>

      <section>
        <h3>Security Controls</h3>

        <ul>
          <li>Multi-factor authentication monitoring</li>
          <li>API security and token monitoring</li>
          <li>Suspicious activity detection</li>
          <li>Authentication event monitoring</li>
          <li>Web application firewall protection</li>
          <li>Security incident investigation</li>
          <li>Vulnerability monitoring</li>
          <li>Security event audit history</li>
        </ul>
      </section>
    </section>
  );
}