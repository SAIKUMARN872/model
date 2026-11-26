import React from "react";
import { Panel, MetricValue } from "../ComponentPrimitives.jsx";

function safeText(value, fallback) {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : fallback;
}

function formatMetric(value) {
  if (value == null) return "—";
  if (typeof value === "number") return Number.isFinite(value) ? value : "—";
  if (typeof value === "string" && value.trim().length > 0) return value;
  return "—";
}

export default function KpiCard(props = {}) {
  const safeProps = props && typeof props === "object" && !Array.isArray(props)
    ? props
    : {};

  const className = typeof safeProps.className === "string"
    ? safeProps.className
    : undefined;
  const title = safeText(safeProps.title, "KPI");
  const description = safeText(safeProps.description, "Key performance indicator");
  const label = safeText(safeProps.label, "KPI");
  const value = formatMetric(safeProps.value);
  const unit = typeof safeProps.unit === "string" ? safeProps.unit : "";
  const detail = typeof safeProps.detail === "string" ? safeProps.detail : undefined;
  const change =
    typeof safeProps.change === "string" ||
    (typeof safeProps.change === "number" && Number.isFinite(safeProps.change))
      ? safeProps.change
      : undefined;

  return (
    <Panel className={className} title={title} description={description}>
      <MetricValue
        label={label}
        value={value}
        unit={unit}
        detail={detail}
        change={change}
      />
    </Panel>
  );
}