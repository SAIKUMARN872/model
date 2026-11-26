
"use client";

import React from "react";
import {
  Activity,
  Gauge,
  IndianRupee,
  Layers,
  TrendingUp,
} from "lucide-react";

interface ModelMetricsData {
  accuracy?: number;
  latency?: number;
  cost?: number;
  tokens?: number;
}

interface ModelMetricsProps {
  metrics?: ModelMetricsData;
}

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  accent: string;
  background: string;
}

export default function ModelMetrics({
  metrics = {},
}: ModelMetricsProps) {
  const defaultMetrics: Required<ModelMetricsData> = {
    accuracy: 92,
    latency: 180,
    cost: 0.45,
    tokens: 12500,
  };

  const data = {
    ...defaultMetrics,
    ...metrics,
  };

  const safeAccuracy = Number.isFinite(data.accuracy)
    ? Math.max(0, Math.min(data.accuracy, 100))
    : 0;

  const safeLatency = Number.isFinite(data.latency)
    ? Math.max(0, data.latency)
    : 0;

  const safeCost = Number.isFinite(data.cost)
    ? Math.max(0, data.cost)
    : 0;

  const safeTokens = Number.isFinite(data.tokens)
    ? Math.max(0, data.tokens)
    : 0;

  const metricCards: MetricCardProps[] = [
    {
      title: "Accuracy",
      value: `${safeAccuracy.toFixed(1)}%`,
      description: "Model response accuracy",
      icon: TrendingUp,
      accent: "#16a34a",
      background: "#f0fdf4",
    },
    {
      title: "Latency",
      value: `${safeLatency.toLocaleString("en-IN")} ms`,
      description: "Average response time",
      icon: Gauge,
      accent: "#2563eb",
      background: "#eff6ff",
    },
    {
      title: "Cost",
      value: `₹${safeCost.toFixed(2)}`,
      description: "Estimated execution cost",
      icon: IndianRupee,
      accent: "#9333ea",
      background: "#faf5ff",
    },
    {
      title: "Tokens",
      value: Math.floor(safeTokens).toLocaleString("en-IN"),
      description: "Total tokens processed",
      icon: Layers,
      accent: "#ea580c",
      background: "#fff7ed",
    },
  ];

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
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "22px",
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
            Model Metrics
          </h2>

          <p
            style={{
              margin: "6px 0 0",
              color: "#64748b",
              fontSize: "13px",
            }}
          >
            Performance and resource utilization
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "7px 11px",
            background: "#f0fdf4",
            border: "1px solid #dcfce7",
            borderRadius: "20px",
            color: "#15803d",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          <Activity size={14} />
          Performance overview
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px",
        }}
      >
        {metricCards.map((metric) => (
          <MetricCard
            key={metric.title}
            {...metric}
          />
        ))}
      </div>
    </section>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  accent,
  background,
}: MetricCardProps) {
  return (
    <div
      style={{
        minWidth: 0,
        padding: "17px",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "11px",
        boxSizing: "border-box",
        transition: "border-color 0.2s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <span
          style={{
            color: "#64748b",
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          {title}
        </span>

        <div
          style={{
            width: "34px",
            height: "34px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background,
            color: accent,
            borderRadius: "9px",
            flexShrink: 0,
          }}
        >
          <Icon size={18} />
        </div>
      </div>

      <h3
        style={{
          margin: "15px 0 5px",
          color: "#0f172a",
          fontSize: "25px",
          fontWeight: 700,
          letterSpacing: "-0.5px",
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </h3>

      <p
        style={{
          margin: 0,
          color: "#94a3b8",
          fontSize: "12px",
        }}
      >
        {description}
      </p>
    </div>
  );
}
