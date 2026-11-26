import React from "react";
import { MetricValue, Panel } from "../ComponentPrimitives.jsx";

function formatMetric(value) {
  if (value == null) return "—";
  if (typeof value === "number") return Number.isFinite(value) ? value : "—";
  if (typeof value === "string" && value.trim().length > 0) return value;
  return "—";
}

export default function LatencyMonitor({ p50, p95, p99, unit = " ms", className } = {}) {
  const safeUnit = typeof unit === "string" ? unit : "";
  const safeClassName = typeof className === "string" ? className : undefined;

  return (
    <Panel
      className={safeClassName}
      title="Latency"
      description="Request latency percentiles"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
          gap: 16,
        }}
      >
        <MetricValue label="P50" value={formatMetric(p50)} unit={safeUnit} />
        <MetricValue label="P95" value={formatMetric(p95)} unit={safeUnit} />
        <MetricValue label="P99" value={formatMetric(p99)} unit={safeUnit} />
      </div>
    </Panel>
  );
}