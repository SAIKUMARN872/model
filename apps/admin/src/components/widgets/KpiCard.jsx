const defaultKpis = [
  {
    id: "KPI-1001",
    title: "Total Users",
    value: "24,892",
    description: "Registered users across the platform",
    trend: "+12.4%",
    trendDirection: "up",
  },
  {
    id: "KPI-1002",
    title: "Active Organizations",
    value: "1,247",
    description: "Organizations currently active",
    trend: "+8.2%",
    trendDirection: "up",
  },
  {
    id: "KPI-1003",
    title: "API Requests",
    value: "18.6M",
    description: "Requests processed this month",
    trend: "+18.7%",
    trendDirection: "up",
  },
  {
    id: "KPI-1004",
    title: "Platform Uptime",
    value: "99.98%",
    description: "Current service availability",
    trend: "+0.02%",
    trendDirection: "up",
  },
];

export default function KPICard({
  title,
  value,
  description,
  trend,
  trendDirection = "up",
  items = defaultKpis,
}) {
  if (title && value) {
    return (
      <article>
        <header>
          <h3>{title}</h3>
        </header>

        <div>
          <strong>{value}</strong>

          {trend && (
            <span>
              {trendDirection === "up" ? "↑" : "↓"} {trend}
            </span>
          )}
        </div>

        {description && (
          <p>{description}</p>
        )}
      </article>
    );
  }

  return (
    <section>
      <header>
        <h2>Platform Performance</h2>

        <p>
          Monitor key performance indicators across the ModelNow platform.
        </p>
      </header>

      <div>
        {items.map((item) => (
          <article key={item.id}>
            <header>
              <h3>{item.title}</h3>
            </header>

            <div>
              <strong>{item.value}</strong>

              <span>
                {item.trendDirection === "up" ? "↑" : "↓"}{" "}
                {item.trend}
              </span>
            </div>

            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}