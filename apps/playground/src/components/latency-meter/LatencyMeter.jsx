"use client";

import React from "react";

export default function LatencyMeter({
  latency = 0,
  maxLatency = 1000,
  label = "Latency",
}) {
  const safeMax =
    maxLatency > 0 ? maxLatency : 1;

  const percentage = Math.min(
    Math.max(
      (latency / safeMax) * 100,
      0
    ),
    100
  );

  let status = "Fast";

  if (latency > 500) {
    status = "Slow";
  } else if (latency > 200) {
    status = "Moderate";
  }

  return (
    <div
      style={{
        width: "100%",
        padding: "20px",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0 }}>
          {label}
        </h3>

        <strong>
          {latency} ms
        </strong>
      </div>

      <div
        style={{
          width: "100%",
          height: "10px",
          marginTop: "16px",
          backgroundColor: "#e2e8f0",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            backgroundColor:
              latency <= 200
                ? "#16a34a"
                : latency <= 500
                ? "#f59e0b"
                : "#dc2626",
            borderRadius: "10px",
            transition:
              "width 0.3s ease",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "12px",
        }}
      >
        <span
          style={{
            color: "#64748b",
          }}
        >
          Maximum: {maxLatency} ms
        </span>

        <span
          style={{
            fontWeight: 600,
          }}
        >
          {status}
        </span>
      </div>
    </div>
  );
}