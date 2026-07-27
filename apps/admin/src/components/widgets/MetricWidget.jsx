const defaultMetrics = [
  {
    id: "METRIC-1001",
    label: "Total Requests",
    value: "18.6M",
    description: "API requests processed this month",
    change: "+18.7%",
    trend: "up",
  },
  {
    id: "METRIC-1002",
    label: "Active Users",
    value: "24,892",
    description: "Users active during the current period",
    change: "+12.4%",
    trend: "up",
  },
  {
    id: "METRIC-1003",
    label: "Average Latency",
    value: "142 ms",
    description: "Average platform response time",
    change: "-8.3%",
    trend: "down",
  },
  {
    id: "METRIC-1004",
    label: "Error Rate",
    value: "0.18%",
    description: "Percentage of failed platform requests",
    change: "-2.1%",
    trend: "down",
  },
];

export default function MetricWidget({
  label,
  value,
  description,
  change,
  trend,
  metrics = defaultMetrics,
}) {
  if (label && value) {
    return (
      <article>
        <header>
          <h3>{label}</h3>
        </header>

        <div>
          <strong>{value}</strong>

          {change && (
            <span>
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}{" "}
              {change}
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
        <h2>Platform Metrics</h2>

        <p>
          Monitor important operational metrics and performance indicators
          across the ModelNow platform.
        </p>
      </header>

      <div>
        {metrics.map((metric) => (
          <article key={metric.id}>
            <header>
              <h3>{metric.label}</h3>
            </header>

            <div>
              <strong>{metric.value}</strong>

              <span>
                {metric.trend === "up"
                  ? "↑"
                  : metric.trend === "down"
                    ? "↓"
                    : "→"}{" "}
                {metric.change}
              </span>
            </div>

            <p>{metric.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}