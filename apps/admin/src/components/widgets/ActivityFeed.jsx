const defaultActivities = [
  {
    id: "ACT-1001",
    actor: "admin@modelnow.ai",
    action: "Updated organization security policy",
    resource: "Organization",
    status: "Completed",
    time: "2 minutes ago",
  },
  {
    id: "ACT-1002",
    actor: "system",
    action: "Automatic backup completed",
    resource: "Infrastructure",
    status: "Completed",
    time: "10 minutes ago",
  },
  {
    id: "ACT-1003",
    actor: "security@modelnow.ai",
    action: "Blocked suspicious API token",
    resource: "API Gateway",
    status: "Investigating",
    time: "22 minutes ago",
  },
  {
    id: "ACT-1004",
    actor: "billing@modelnow.ai",
    action: "Updated enterprise subscription",
    resource: "Billing",
    status: "Completed",
    time: "1 hour ago",
  },
  {
    id: "ACT-1005",
    actor: "admin@modelnow.ai",
    action: "Created new workspace",
    resource: "Workspace",
    status: "Completed",
    time: "2 hours ago",
  },
];

export default function ActivityFeed({
  activities = defaultActivities,
}) {
  return (
    <section>
      <header>
        <h2>Recent Activity</h2>

        <p>
          Monitor recent administrative, security, system, and platform
          activity across the ModelNow environment.
        </p>
      </header>

      <div>
        {activities.length > 0 ? (
          <ul>
            {activities.map((activity) => (
              <li key={activity.id}>
                <article>
                  <header>
                    <strong>{activity.action}</strong>

                    <span>{activity.status}</span>
                  </header>

                  <p>
                    <strong>Actor:</strong>{" "}
                    {activity.actor}
                  </p>

                  <p>
                    <strong>Resource:</strong>{" "}
                    {activity.resource}
                  </p>

                  <p>
                    <strong>Time:</strong>{" "}
                    {activity.time}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <p>
            No recent activity is available.
          </p>
        )}
      </div>
    </section>
  );
}