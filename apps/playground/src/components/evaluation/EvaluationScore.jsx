import React from "react";

export default function EvaluationScore({
  score = 0,
  maxScore = 100,
  label = "Evaluation Score",
}) {
  const safeMax =
    maxScore > 0 ? maxScore : 1;

  const percentage = Math.min(
    Math.max(
      (score / safeMax) * 100,
      0
    ),
    100
  );

  let status = "Needs Improvement";

  if (percentage >= 80) {
    status = "Excellent";
  } else if (percentage >= 60) {
    status = "Good";
  }

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
        }}
      >
        <h3
          style={{
            margin: 0,
          }}
        >
          {label}
        </h3>

        <strong>
          {score}/{maxScore}
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
              percentage >= 80
                ? "#16a34a"
                : percentage >= 60
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
          justifyContent:
            "space-between",
          marginTop: "12px",
        }}
      >
        <span
          style={{
            color: "#64748b",
          }}
        >
          {percentage.toFixed(1)}%
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