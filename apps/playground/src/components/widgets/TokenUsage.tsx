
"use client";

import React from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Gauge,
} from "lucide-react";

interface TokenUsageProps {
  usedTokens?: number;
  maxTokens?: number;
}

export default function TokenUsage({
  usedTokens = 0,
  maxTokens = 100000,
}: TokenUsageProps) {
  const safeUsed = Number.isFinite(usedTokens)
    ? Math.max(0, usedTokens)
    : 0;

  const safeMax = Number.isFinite(maxTokens)
    ? Math.max(0, maxTokens)
    : 0;

  const percentage =
    safeMax > 0
      ? Math.min((safeUsed / safeMax) * 100, 100)
      : safeUsed > 0
        ? 100
        : 0;

  const remaining = Math.max(safeMax - safeUsed, 0);

  const status =
    percentage >= 90
      ? {
          label: "Critical usage",
          color: "#dc2626",
          background: "#fef2f2",
          icon: AlertTriangle,
        }
      : percentage >= 70
        ? {
            label: "High usage",
            color: "#d97706",
            background: "#fffbeb",
            icon: Activity,
          }
        : {
            label: "Within limit",
            color: "#15803d",
            background: "#f0fdf4",
            icon: CheckCircle2,
          };

  const StatusIcon = status.icon;

  const formatTokens = (value: number) =>
    Math.floor(value).toLocaleString("en-IN");

  return (
    <section
      style={{
        width: "100%",
        padding: "22px",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        boxSizing: "border-box",
        fontFamily: "inherit",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: "19px",
              fontWeight: 700,
            }}
          >
            Token Usage
          </h2>

          <p
            style={{
              margin: "6px 0 0",
              color: "#64748b",
              fontSize: "13px",
            }}
          >
            Monitor token consumption and limits
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "7px 11px",
            background: status.background,
            color: status.color,
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          <StatusIcon size={14} />
          {status.label}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "10px",
          marginTop: "26px",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "12px",
            }}
          >
            Tokens consumed
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              flexWrap: "wrap",
              gap: "6px",
              marginTop: "5px",
            }}
          >
            <strong
              style={{
                color: "#0f172a",
                fontSize: "27px",
                fontWeight: 700,
                letterSpacing: "-0.6px",
              }}
            >
              {formatTokens(safeUsed)}
            </strong>

            <span
              style={{
                color: "#94a3b8",
                fontSize: "13px",
              }}
            >
              / {formatTokens(safeMax)}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            color: "#64748b",
            fontSize: "13px",
          }}
        >
          <Gauge size={16} />
          <strong
            style={{
              color: "#0f172a",
              fontSize: "15px",
            }}
          >
            {percentage.toFixed(1)}%
          </strong>
          used
        </div>
      </div>

      <div
        role="progressbar"
        aria-label="Token usage"
        aria-valuenow={Number(percentage.toFixed(1))}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{
          width: "100%",
          height: "11px",
          marginTop: "19px",
          background: "#f1f5f9",
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            background: status.color,
            borderRadius: "20px",
            transition: "width 0.35s ease",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
          marginTop: "15px",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              color: "#94a3b8",
              fontSize: "11px",
            }}
          >
            Remaining tokens
          </p>

          <strong
            style={{
              display: "block",
              marginTop: "4px",
              color: "#0f172a",
              fontSize: "15px",
            }}
          >
            {formatTokens(remaining)}
          </strong>
        </div>

        <div style={{ textAlign: "right" }}>
          <p
            style={{
              margin: 0,
              color: "#94a3b8",
              fontSize: "11px",
            }}
          >
            Usage limit
          </p>

          <strong
            style={{
              display: "block",
              marginTop: "4px",
              color: "#0f172a",
              fontSize: "15px",
            }}
          >
            {formatTokens(safeMax)}
          </strong>
        </div>
      </div>
    </section>
  );
}
