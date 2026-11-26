import React from "react";
import { CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";

interface EvaluationScoreProps {
  score?: number;
  maxScore?: number;
  label?: string;
}

export default function EvaluationScore({
  score = 0,
  maxScore = 100,
  label = "Evaluation Score",
}: EvaluationScoreProps) {
  const safeMax = maxScore > 0 ? maxScore : 1;

  const safeScore = Number.isFinite(score) ? score : 0;

  const percentage = Math.min(
    Math.max((safeScore / safeMax) * 100, 0),
    100
  );

  const displayScore = Math.min(Math.max(safeScore, 0), safeMax);

  let status = "Needs Improvement";
  let statusColor = "#dc2626";
  let statusBackground = "#fef2f2";
  let StatusIcon = AlertCircle;

  if (percentage >= 80) {
    status = "Excellent";
    statusColor = "#15803d";
    statusBackground = "#f0fdf4";
    StatusIcon = CheckCircle2;
  } else if (percentage >= 60) {
    status = "Good";
    statusColor = "#d97706";
    statusBackground = "#fffbeb";
    StatusIcon = TrendingUp;
  }

  return (
    <div
      style={{
        width: "100%",
        padding: "22px",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              color: "#172033",
              fontSize: "15px",
              fontWeight: 700,
            }}
          >
            {label}
          </h3>

          <p
            style={{
              margin: "5px 0 0",
              color: "#94a3b8",
              fontSize: "12px",
            }}
          >
            Overall performance
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <strong
            style={{
              color: "#172033",
              fontSize: "23px",
              fontWeight: 750,
            }}
          >
            {displayScore}
          </strong>

          <span
            style={{
              color: "#94a3b8",
              fontSize: "13px",
            }}
          >
            {" "}/ {safeMax}
          </span>
        </div>
      </div>

      <div
        style={{
          width: "100%",
          height: "9px",
          marginTop: "22px",
          background: "#f1f5f9",
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            background: statusColor,
            borderRadius: "20px",
            transition: "width 0.4s ease",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
          marginTop: "14px",
        }}
      >
        <span
          style={{
            color: "#64748b",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          {percentage.toFixed(1)}%
        </span>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 10px",
            borderRadius: "20px",
            background: statusBackground,
            color: statusColor,
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          <StatusIcon size={14} />
          {status}
        </span>
      </div>
    </div>
  );
}