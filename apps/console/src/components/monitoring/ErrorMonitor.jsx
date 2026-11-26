import React from "react";
import { MetricValue, Panel } from "../ComponentPrimitives.jsx";

function formatMetric(value) {
  if (value == null) return "—";
  if (typeof value === "number") return Number.isFinite(value) ? value : "—";
  if (typeof value === "string" && value.trim().length > 0) return value;
  return "—";
}

export default function ErrorMonitor({ count, rate, detail, className } = {}) {
  const safeClassName = typeof className === "string" ? className : undefined;
  const safeCount = formatMetric(count);
  const safeRate = formatMetric(rate);
  const safeDetail = typeof detail === "string" ? detail : undefined;
  const rateUnit = typeof rate === "number" && Number.isFinite(rate) ? "%" : "";

  return (
    <Panel
      className={safeClassName}
      title="Errors"
      description="Error monitoring"
    >
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <MetricValue label="Error count" value={safeCount} />
        <MetricValue
          label="Error rate"
          value={safeRate}
          unit={rateUnit}
          detail={safeDetail}
        />
      </div>
    </Panel>
  );
}