import React from "react";

export default function CostMeter({
  currentCost = 0,
  maxCost = 100,
  currency = "INR",
}) {
  const safeMax =
    maxCost > 0 ? maxCost : 1;

  const percentage = Math.min(
    Math.max(
      (currentCost / safeMax) * 100,
      0
    ),
    100
  );

  const formattedCost =
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
    }).format(currentCost);

  const formattedMaxCost =
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
    }).format(maxCost);

  return (
    <div
      style={{
        width: "100%",
        padding: "20px",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border:
          "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <h3
          style={{
            margin: 0,
          }}
        >
          Cost Usage
        </h3>

        <span
          style={{
            fontWeight: 600,
          }}
        >
          {formattedCost} /{" "}
          {formattedMaxCost}
        </span>
      </div>

      <div
        style={{
          width: "100%",
          height: "10px",
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

      <p
        style={{
          marginTop: "10px",
          marginBottom: 0,
          color: "#64748b",
        }}
      >
        {percentage.toFixed(1)}% of
        your cost limit used
      </p>
    </div>
  );
}