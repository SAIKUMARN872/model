"use client";

import React from "react";

export default function TokenUsage({
  usedTokens = 0,
  maxTokens = 100000,
}) {
  const safeMax =
    maxTokens > 0 ? maxTokens : 1;

  const percentage = Math.min(
    Math.max(
      (usedTokens / safeMax) * 100,
      0
    ),
    100
  );

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#0f172a",
          }}
        >
          Token Usage
        </h2>

        <strong>
          {usedTokens.toLocaleString("en-IN")} /{" "}
          {maxTokens.toLocaleString("en-IN")}
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
              percentage >= 90
                ? "#dc2626"
                : percentage >= 70
                ? "#f59e0b"
                : "#2563eb",
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
          {percentage.toFixed(1)}% used
        </span>

        <span
          style={{
            color: "#64748b",
          }}
        >
          Remaining:{" "}
          {Math.max(
            maxTokens - usedTokens,
            0
          ).toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
}