import React from "react";
import { Panel, SimpleChart } from "../ComponentPrimitives.jsx";

function safeText(value, fallback) {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : fallback;
}

export default function UsageChart(props = {}) {
  const safeProps = props && typeof props === "object" && !Array.isArray(props)
    ? props
    : {};

  const heightValue = safeProps.height == null || safeProps.height === ""
    ? 180
    : Number(safeProps.height);
  const height = Number.isFinite(heightValue)
    ? Math.min(600, Math.max(100, heightValue))
    : 180;

  const data = Array.isArray(safeProps.data) ? safeProps.data : [];
  const title = safeText(safeProps.title, "Usage");
  const description = safeText(safeProps.description, "Usage over time");
  const className = typeof safeProps.className === "string"
    ? safeProps.className
    : undefined;
  const xKey = safeText(safeProps.xKey, "date");
  const yKey = safeText(safeProps.yKey, "usage");
  const label = safeText(safeProps.label, "Usage");
  const unit = typeof safeProps.unit === "string" ? safeProps.unit : "";

  return (
    <Panel title={title} description={description} className={className}>
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