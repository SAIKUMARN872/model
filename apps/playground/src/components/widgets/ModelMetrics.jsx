"use client";

import React from "react";

export default function ModelMetrics({
  metrics = {},
}) {
  const defaultMetrics = {
    accuracy: 92,
    latency: 180,
    cost: 0.45,
    tokens: 12500,
  };

  const data = {
    ...defaultMetrics,
    ...metrics,
  };

  return (
    <div
      style={{
        width: "100%",
        padding: "20px",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          color: "#0f172a",
        }}
      >
        Model Metrics
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginTop: "20px",
        }}
      >
        <MetricCard
          title="Accuracy"
          value={`${data.accuracy}%`}
        />

        <MetricCard
          title="Latency"
          value={`${data.latency} ms`}
        />

        <MetricCard
          title="Cost"
          value={`₹${Number(data.cost).toFixed(2)}`}
        />

        <MetricCard
          title="Tokens"
          value={data.tokens.toLocaleString("en-IN")}
        />
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
}) {
  return (
    <div
      style={{
        padding: "16px",
        backgroundColor: "#f8fafc",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "#64748b",
          fontSize: "14px",
        }}
      >
        {title}
      </p>

      <h3
        style={{
          marginTop: "8px",
          marginBottom: 0,
          color: "#0f172a",
        }}
      >
        {value}
      </h3>
    </div>
  );
}