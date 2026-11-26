"use client";

import React from "react";
import {
  Gauge,
  Zap,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface LatencyMeterProps {
  latency?: number;
  maxLatency?: number;
  label?: string;
}

export default function LatencyMeter({
  latency = 0,
  maxLatency = 1000,
  label = "Latency",
}: LatencyMeterProps) {
  const safeMax =
    Number.isFinite(maxLatency) && maxLatency > 0
      ? maxLatency
      : 1;

  const safeLatency = Number.isFinite(latency)
    ? Math.max(latency, 0)
    : 0;

  const percentage = Math.min(
    (safeLatency / safeMax) * 100,
    100
  );

  let status = "Fast";
  let statusColor = "#15803d";
  let statusBackground = "#f0fdf4";
  let StatusIcon = CheckCircle2;

  if (safeLatency > 500) {
    status = "Slow";
    statusColor = "#dc2626";
    statusBackground = "#fef2f2";
    StatusIcon = AlertTriangle;
  } else if (safeLatency > 200) {
    status = "Moderate";
    statusColor = "#d97706";
    statusBackground = "#fffbeb";
    StatusIcon = AlertTriangle;
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
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
          }}
        >
          <span
            style={{
              width: "34px",
              height: "34px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#eff6ff",
              color: "#2563eb",
              borderRadius: "9px",
            }}
          >
            <Gauge size={18} />
          </span>

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
                margin: "4px 0 0",
                color: "#94a3b8",
                fontSize: "11px",
              }}
            >
              Response time performance
            </p>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <strong
            style={{
              color: "#172033",
              fontSize: "23px",
              fontWeight: 750,
            }}
          >
            {safeLatency.toFixed(0)}
          </strong>

          <span
            style={{
              color: "#94a3b8",
              fontSize: "12px",
            }}
          >
            {" "}ms
          </span>
        </div>
      </div>

      {/* Progress */}
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

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
          marginTop: "15px",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            color: "#64748b",
            fontSize: "12px",
          }}
        >
          Maximum: {safeMax.toFixed(0)} ms
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
          <Zap size={12} />
          {status}
        </span>
      </div>
    </div>
  );
}