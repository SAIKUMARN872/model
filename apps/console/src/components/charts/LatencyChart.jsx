import React from "react";
import { Panel, SimpleChart } from "../ComponentPrimitives.jsx";

function safeText(value, fallback) {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : fallback;
}

function safeKey(value, fallback) {
  return typeof value === "string" && value.length > 0
    ? value
    : fallback;
}

export default function LatencyChart(props = {}) {
  const safeProps = props && typeof props === "object" && !Array.isArray(props)
    ? props
    : {};

  const title = safeText(safeProps.title, "Latency");
  const description = safeText(safeProps.description, "Latency over time");
  const className = typeof safeProps.className === "string"
    ? safeProps.className
    : undefined;
  const label = safeText(safeProps.label, "Latency");
  const unit = typeof safeProps.unit === "string" ? safeProps.unit : "";
  const xKey = safeKey(safeProps.xKey, "date");
  const yKey = safeKey(safeProps.yKey, "latency");
  const data = Array.isArray(safeProps.data) ? safeProps.data : [];
  const height = safeProps.height ?? 180;

  return (
    <Panel
      title={title}
      description={description}
      className={className}
    >
      <SimpleChart
        data={data}
        xKey={xKey}
        yKey={yKey}
        label={label}
        unit={unit}
        height={height}
      />
    </Panel>
  );
}