type AuditEvent = {
  id: string;
  actor: string;
  action: string;
  resource: string;
  severity: "Critical" | "High" | "Medium" | "Low" | "Info";
  status: "Open" | "Investigating" | "Resolved";
  timestamp: string;
};

type AuditViewProps = {
  events?: AuditEvent[];
};

const defaultAuditEvents: AuditEvent[] = [
  {
    id: "AUD-1001",
    actor: "admin@modelnow.ai",
    action: "Updated organization security policy",
    resource: "Organization",
    severity: "Medium",
    status: "Resolved",
    timestamp: "2 minutes ago",
  },
  {
    id: "AUD-1002",
    actor: "system",
    action: "Automatic infrastructure backup completed",
    resource: "Infrastructure",
    severity: "Info",
    status: "Resolved",
    timestamp: "10 minutes ago",
  },
  {
    id: "AUD-1003",
    actor: "security@modelnow.ai",
    action: "Blocked suspicious API token",
    resource: "API Gateway",
    severity: "High",
    status: "Investigating",
    timestamp: "22 minutes ago",
  },
  {
    id: "AUD-1004",
    actor: "billing@modelnow.ai",
    action: "Updated enterprise subscription",
    resource: "Billing",
    severity: "Low",
    status: "Resolved",
    timestamp: "1 hour ago",
  },
  {
    id: "AUD-1005",
    actor: "security@modelnow.ai",
    action: "Detected multiple failed authentication attempts",
    resource: "Authentication",
    severity: "Critical",
    status: "Open",
    timestamp: "2 hours ago",
  },
];

export default function AuditView({
  events = defaultAuditEvents,
}: AuditViewProps) {
  return (
    <section>
      <header>
        <h2>Audit Activity</h2>

        <p>
          Review administrative actions, security events, system activity, and
          compliance-related events across the ModelNow platform.
        </p>
      </header>

      <div>
        <p>
          <strong>Total Events:</strong> {events.length}
        </p>

        <p>
          <strong>Open Events:</strong>{" "}
          {events.filter((event) => event.status === "Open").length}
        </p>

        <p>
          <strong>Investigating:</strong>{" "}
          {events.filter((event) => event.status === "Investigating").length}
        </p>

        <p>
          <strong>Resolved:</strong>{" "}
          {events.filter((event) => event.status === "Resolved").length}
        </p>
      </div>

      <div>
        <table>
          <thead>
            <tr>
              <th>Event ID</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Timestamp</th>
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
                <td>{event.status}</td>
                <td>{event.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}