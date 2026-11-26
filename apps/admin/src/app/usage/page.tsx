
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Database,
  Download,
  ExternalLink,
  Gauge,
  Globe2,
  Layers3,
  Search,
  Server,
  ShieldAlert,
  Zap,
  RefreshCw,
  X,
} from "lucide-react";

type UsageStatus = "Healthy" | "Warning" | "Exceeded";
type ReportingPeriod = "7" | "30" | "90";

type UsageMetric = {
  title: string;
  value: string;
  description: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: typeof Activity;
  color: string;
};

type UsageRecord = {
  id: string;
  organization: string;
  resource: string;
  usage: string;
  limit: string;
  utilization: number;
  status: UsageStatus;
};

type ModelUsage = {
  name: string;
  provider: string;
  requests: string;
  tokens: string;
  cost: number;
  latency: number;
  share: number;
  color: string;
};

const periods: { label: string; value: ReportingPeriod }[] = [
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
];

const organizations = [
  "All organizations",
  "Acme Corporation",
  "Northstar Technologies",
  "Vertex Labs",
  "CloudWorks",
  "Nova Research",
];

const requestTrends: Record<ReportingPeriod, number[]> = {
  "7": [42, 55, 48, 68, 61, 82, 74],
  "30": [
    35, 48, 42, 60, 52, 72, 64, 58, 82, 68,
    75, 88, 72, 94, 81, 70, 91, 78, 100, 85,
    76, 89, 68, 96, 84, 72, 92, 80, 100, 88,
  ],
  "90": [
    28, 35, 32, 42, 38, 48, 44, 40, 52, 46,
    55, 49, 58, 53, 62, 57, 66, 60, 70, 64,
    73, 68, 77, 72, 81, 75, 85, 78, 88, 82,
  ],
};

const tokenTrends: Record<ReportingPeriod, number[]> = {
  "7": [32, 45, 40, 58, 53, 72, 68],
  "30": [
    28, 36, 32, 45, 39, 52, 48, 43, 60, 54,
    62, 57, 70, 64, 73, 68, 78, 71, 85, 76,
    70, 82, 75, 91, 80, 74, 88, 81, 95, 86,
  ],
  "90": [
    22, 28, 25, 34, 30, 38, 35, 32, 41, 37,
    45, 40, 48, 43, 52, 47, 56, 50, 59, 54,
    63, 57, 66, 61, 70, 64, 74, 68, 78, 72,
  ],
};

const usageRecords: UsageRecord[] = [
  {
    id: "USE-1001",
    organization: "Acme Corporation",
    resource: "API Requests",
    usage: "4.8M",
    limit: "10M",
    utilization: 48,
    status: "Healthy",
  },
  {
    id: "USE-1002",
    organization: "Northstar Technologies",
    resource: "Model Tokens",
    usage: "186M",
    limit: "250M",
    utilization: 74,
    status: "Warning",
  },
  {
    id: "USE-1003",
    organization: "Vertex Labs",
    resource: "Compute",
    usage: "82 hours",
    limit: "120 hours",
    utilization: 68,
    status: "Healthy",
  },
  {
    id: "USE-1004",
    organization: "CloudWorks",
    resource: "Storage",
    usage: "8.4 TB",
    limit: "10 TB",
    utilization: 84,
    status: "Warning",
  },
  {
    id: "USE-1005",
    organization: "Nova Research",
    resource: "API Requests",
    usage: "1.2M",
    limit: "1M",
    utilization: 120,
    status: "Exceeded",
  },
];

const modelUsage: ModelUsage[] = [
  {
    name: "GPT-5",
    provider: "OpenAI",
    requests: "6.8M",
    tokens: "320M",
    cost: 4280,
    latency: 420,
    share: 42,
    color: "blue",
  },
  {
    name: "Claude",
    provider: "Anthropic",
    requests: "4.2M",
    tokens: "245M",
    cost: 3680,
    latency: 510,
    share: 28,
    color: "purple",
  },
  {
    name: "Gemini",
    provider: "Google",
    requests: "3.1M",
    tokens: "174M",
    cost: 2480,
    latency: 390,
    share: 19,
    color: "green",
  },
  {
    name: "Llama",
    provider: "Open models",
    requests: "1.7M",
    tokens: "103M",
    cost: 840,
    latency: 310,
    share: 11,
    color: "orange",
  },
];

const formatCurrency = (amount: number) =>
  amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

function StatusBadge({ status }: { status: UsageStatus }) {
  return (
    <span className={`usage-status usage-status-${status.toLowerCase()}`}>
      <span className="usage-status-dot" />
      {status}
    </span>
  );
}

function MetricCard({ metric }: { metric: UsageMetric }) {
  const Icon = metric.icon;

  return (
    <article className="usage-metric-card">
      <div className="usage-metric-top">
        <span className={`usage-metric-icon ${metric.color}`}>
          <Icon size={20} />
        </span>
        <span
          className={`usage-change ${
            metric.trend === "down"
              ? "usage-change-down"
              : metric.trend === "up"
                ? "usage-change-up"
                : ""
          }`}
        >
          {metric.trend === "down" ? (
            <ArrowDownRight size={15} />
          ) : metric.trend === "up" ? (
            <ArrowUpRight size={15} />
          ) : null}
          {metric.change}
        </span>
      </div>
      <p className="usage-metric-title">{metric.title}</p>
      <strong className="usage-metric-value">{metric.value}</strong>
      <p className="usage-muted usage-metric-description">
        {metric.description}
      </p>
    </article>
  );
}

function SectionHeader({
  title,
  description,
  action,
  href,
}: {
  title: string;
  description?: string;
  action?: string;
  href?: string;
}) {
  return (
    <div className="usage-section-header">
      <div>
        <h2>{title}</h2>
        {description && <p className="usage-muted">{description}</p>}
      </div>
      {action && href && (
        <Link className="usage-text-link" href={href}>
          {action}
          <ExternalLink size={14} />
        </Link>
      )}
    </div>
  );
}

function TrendChart({
  values,
  color,
  label,
}: {
  values: number[];
  color: string;
  label: string;
}) {
  const width = 600;
  const height = 190;
  const padding = 12;
  const max = Math.max(...values);
  const min = Math.min(...values);

  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y =
        height -
        padding -
        ((value - min) / (max - min || 1)) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const pointList = points.split(" ");
  const firstPoint = pointList[0] ?? "0,0";
  const lastPoint = pointList[pointList.length - 1] ?? "600,0";
  const lastX = lastPoint.split(",")[0];
  const gradientId = `usage-gradient-${color.replace("#", "")}`;

  return (
    <svg
      className="usage-chart-svg"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={label}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {[35, 75, 115, 155].map((y) => (
        <line
          key={y}
          x1="0"
          y1={y}
          x2={width}
          y2={y}
          stroke="currentColor"
          strokeOpacity="0.12"
          strokeDasharray="4 5"
        />
      ))}

      <polygon
        points={`${firstPoint} ${points} ${lastX},${height}`}
        fill={`url(#${gradientId})`}
      />

      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function UtilizationBar({ value }: { value: number }) {
  const safeValue = Math.min(value, 100);
  const color =
    value >= 100 ? "#dc2626" : value >= 75 ? "#d97706" : "#16a34a";

  return (
    <div
      className="usage-progress"
      role="progressbar"
      aria-label={`Resource utilization ${value}%`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
    >
      <span
        className="usage-progress-fill"
        style={{ width: `${safeValue}%`, backgroundColor: color }}
      />
    </div>
  );
}

export default function UsagePage() {
  const [period, setPeriod] = useState<ReportingPeriod>("30");
  const [selectedOrganization, setSelectedOrganization] =
    useState("All organizations");
  const [searchQuery, setSearchQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return usageRecords.filter((record) => {
      const matchesOrganization =
        selectedOrganization === "All organizations" ||
        record.organization === selectedOrganization;

      const matchesSearch =
        !query ||
        record.id.toLowerCase().includes(query) ||
        record.organization.toLowerCase().includes(query) ||
        record.resource.toLowerCase().includes(query) ||
        record.status.toLowerCase().includes(query);

      return matchesOrganization && matchesSearch;
    });
  }, [selectedOrganization, searchQuery]);

  const usageMetrics: UsageMetric[] = [
    {
      title: "Total Requests",
      value: period === "7" ? "4.3M" : period === "90" ? "53.0M" : "18.6M",
      change: "+21.3%",
      description: `Illustrative requests for the last ${period} days`,
      trend: "up",
      icon: Activity,
      color: "usage-blue",
    },
    {
      title: "Model Tokens",
      value:
        period === "7"
          ? "193.8M"
          : period === "90"
            ? "2.40B"
            : "842.7M",
      change: "+14.8%",
      description: "Input and output tokens processed",
      trend: "up",
      icon: BrainCircuit,
      color: "usage-purple",
    },
    {
      title: "Compute Usage",
      value: "64.8%",
      change: "+3.2%",
      description: "Illustrative infrastructure utilization",
      trend: "up",
      icon: Server,
      color: "usage-green",
    },
    {
      title: "Storage Usage",
      value: "42.3 TB",
      change: "-1.4%",
      description: "Illustrative total storage consumed",
      trend: "down",
      icon: Database,
      color: "usage-orange",
    },
  ];

  const totalEstimatedCost = useMemo(() => {
    const base = modelUsage.reduce((total, model) => total + model.cost, 0);
    if (period === "7") return Math.round(base * 0.23);
    if (period === "90") return Math.round(base * 2.85);
    return base;
  }, [period]);

  const requests = requestTrends[period];
  const tokens = tokenTrends[period];

  function exportReport() {
    const rows: (string | number)[][] = [
      ["ModelNow Usage & Analytics Report"],
      ["Reporting period", `Last ${period} days`],
      ["Organization filter", selectedOrganization],
      ["Generated at", new Date().toISOString()],
      ["Data source", "Illustrative frontend sample data"],
      [],
      [
        "Usage ID",
        "Organization",
        "Resource",
        "Usage",
        "Limit",
        "Utilization",
        "Status",
      ],
      ...filteredRecords.map((record) => [
        record.id,
        record.organization,
        record.resource,
        record.usage,
        record.limit,
        `${record.utilization}%`,
        record.status,
      ]),
      [],
      [
        "Model",
        "Provider",
        "Requests",
        "Tokens",
        "Estimated cost USD",
        "Latency ms",
        "Share",
      ],
      ...modelUsage.map((model) => [
        model.name,
        model.provider,
        model.requests,
        model.tokens,
        model.cost,
        model.latency,
        `${model.share}%`,
      ]),
      [],
      ["Trend point", "Request trend index", "Token trend index"],
      ...requestTrends[period].map((request, index) => [
        index + 1,
        request,
        tokenTrends[period][index] ?? "",
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `modelnow-usage-${period}-days.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setNotice("Usage report exported successfully.");
  }

  function refreshAnalytics() {
    setRefreshKey((current) => current + 1);
    setNotice("Sample analytics view refreshed.");
  }

  return (
    <main className="usage-page" key={refreshKey}>
      <style jsx global>{`
        .usage-page {
          --usage-text: #172033;
          --usage-muted: #697586;
          --usage-border: #e6eaf0;
          --usage-surface: #ffffff;
          --usage-background: #f7f9fc;
          --usage-primary: #315fea;
          color: var(--usage-text);
          width: 100%;
          max-width: 1800px;
          margin: 0 auto;
          padding: 28px;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 14px;
          box-sizing: border-box;
        }

        .usage-page *,
        .usage-page *::before,
        .usage-page *::after {
          box-sizing: border-box;
        }

        .usage-page button,
        .usage-page input,
        .usage-page select {
          font: inherit;
        }

        .usage-muted {
          color: var(--usage-muted);
          margin: 6px 0 0;
          line-height: 1.6;
        }

        .usage-demo-notice {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 14px 16px;
          margin-bottom: 24px;
          border: 1px solid #dce6ff;
          border-radius: 12px;
          background: #f2f6ff;
          color: #233d7b;
        }

        .usage-demo-icon {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          flex: 0 0 32px;
          border-radius: 9px;
          background: #e0e9ff;
          color: #315fea;
        }

        .usage-demo-copy {
          display: block;
          margin-top: 4px;
          color: #52658e;
          line-height: 1.55;
        }

        .usage-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 22px;
        }

        .usage-eyebrow {
          margin-bottom: 9px;
          color: #536cae;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .usage-header h1 {
          margin: 0;
          color: var(--usage-text);
          font-size: clamp(27px, 3vw, 34px);
          font-weight: 750;
          letter-spacing: -1.1px;
          line-height: 1.2;
        }

        .usage-header p {
          max-width: 760px;
          margin: 10px 0 0;
          color: var(--usage-muted);
          font-size: 14px;
          line-height: 1.7;
        }

        .usage-header-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }

        .usage-button {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          min-height: 40px;
          padding: 0 14px;
          border: 1px solid var(--usage-border);
          border-radius: 9px;
          background: #fff;
          color: #334155;
          cursor: pointer;
          font-weight: 650;
          white-space: nowrap;
          transition: background 0.15s ease, border-color 0.15s ease;
        }

        .usage-button:hover {
          background: #f6f8fb;
          border-color: #cbd5e1;
        }

        .usage-button-primary {
          color: #fff;
          background: var(--usage-primary);
          border-color: var(--usage-primary);
        }

        .usage-button-primary:hover {
          background: #244dc9;
          border-color: #244dc9;
        }

        .usage-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          padding: 13px 0;
          margin-bottom: 20px;
          border-top: 1px solid var(--usage-border);
          border-bottom: 1px solid var(--usage-border);
          color: var(--usage-muted);
          font-size: 12px;
        }

        .usage-meta-item {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        .usage-live-label {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #137448;
          font-weight: 700;
        }

        .usage-live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #16a34a;
          box-shadow: 0 0 0 3px #dcfce7;
        }

        .usage-meta-spacer {
          flex: 1;
        }

        .usage-select-wrap,
        .usage-search-wrap {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 38px;
          padding: 0 10px;
          border: 1px solid var(--usage-border);
          border-radius: 9px;
          background: #fff;
          color: #64748b;
        }

        .usage-select-wrap select {
          width: 100%;
          min-width: 100px;
          border: 0;
          outline: 0;
          background: transparent;
          color: #334155;
          cursor: pointer;
        }

        .usage-search-wrap input {
          width: 100%;
          min-width: 120px;
          border: 0;
          outline: 0;
          background: transparent;
          color: var(--usage-text);
        }

        .usage-select-wrap:focus-within,
        .usage-search-wrap:focus-within {
          border-color: #8ca9ff;
          box-shadow: 0 0 0 3px #315fea15;
        }

        .usage-action-notice {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 11px 13px;
          margin-bottom: 18px;
          border: 1px solid #bde8d0;
          border-radius: 9px;
          background: #f0fdf4;
          color: #166534;
        }

        .usage-notice-dismiss {
          display: grid;
          place-items: center;
          width: 25px;
          height: 25px;
          margin-left: auto;
          border: 0;
          border-radius: 6px;
          background: transparent;
          color: inherit;
          cursor: pointer;
        }

        .usage-notice-dismiss:hover {
          background: #dcfce7;
        }

        .usage-metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 30px;
        }

        .usage-metric-card,
        .usage-panel,
        .usage-service-card,
        .usage-shortcut-card {
          min-width: 0;
          border: 1px solid var(--usage-border);
          border-radius: 13px;
          background: var(--usage-surface);
          box-shadow: 0 2px 8px #17203304;
        }

        .usage-metric-card {
          padding: 19px;
          transition: box-shadow 0.15s ease, transform 0.15s ease;
        }

        .usage-metric-card:hover {
          box-shadow: 0 8px 24px #1720330b;
          transform: translateY(-1px);
        }

        .usage-metric-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          margin-bottom: 17px;
        }

        .usage-metric-icon,
        .usage-chart-icon,
        .usage-model-marker,
        .usage-usage-icon,
        .usage-shortcut-icon,
        .usage-service-icon {
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          border-radius: 10px;
        }

        .usage-metric-icon {
          width: 40px;
          height: 40px;
        }

        .usage-blue {
          color: #315fea;
          background: #eaf0ff;
        }

        .usage-purple {
          color: #8154d9;
          background: #f2ebff;
        }

        .usage-green {
          color: #14804a;
          background: #e5f8ed;
        }

        .usage-orange {
          color: #c56a12;
          background: #fff1df;
        }

        .usage-change {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
        }

        .usage-change-up {
          color: #15803d;
        }

        .usage-change-down {
          color: #15803d;
        }

        .usage-metric-title {
          margin: 0 0 8px;
          color: #64748b;
          font-size: 12px;
          font-weight: 650;
        }

        .usage-metric-value {
          display: block;
          overflow-wrap: anywhere;
          color: #172033;
          font-size: clamp(24px, 2.1vw, 30px);
          font-weight: 750;
          letter-spacing: -0.8px;
          line-height: 1.2;
        }

        .usage-metric-description {
          min-height: 34px;
          font-size: 11px;
        }

        .usage-section {
          margin-top: 30px;
        }

        .usage-section-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 15px;
        }

        .usage-section-header h2 {
          margin: 0;
          color: #172033;
          font-size: 17px;
          font-weight: 750;
          letter-spacing: -0.35px;
        }

        .usage-section-header p {
          font-size: 12px;
        }

        .usage-text-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #315fea;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
        }

        .usage-text-link:hover {
          color: #244dc9;
          text-decoration: underline;
        }

        .usage-chart-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .usage-panel {
          padding: 20px;
        }

        .usage-panel-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
        }

        .usage-panel-label {
          display: block;
          color: #7b8798;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          line-height: 1.6;
        }

        .usage-chart-value {
          margin-top: 7px;
          color: #172033;
          font-size: 25px;
          font-weight: 750;
          letter-spacing: -0.7px;
          line-height: 1.25;
        }

        .usage-inline-positive {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          margin-top: 6px;
          color: #16804a;
          font-size: 11px;
          font-weight: 700;
        }

        .usage-chart-icon {
          width: 40px;
          height: 40px;
        }

        .usage-chart-wrap {
          height: 190px;
          margin-top: 19px;
        }

        .usage-chart-svg {
          display: block;
          width: 100%;
          height: 100%;
          overflow: visible;
          color: #64748b;
        }

        .usage-chart-axis {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: 7px;
          color: #8a94a5;
          font-size: 10px;
        }

        .usage-model-summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--usage-border);
        }

        .usage-model-summary .usage-chart-value {
          font-size: 23px;
        }

        .usage-model-list {
          display: flex;
          flex-direction: column;
          gap: 0;
          margin-top: 7px;
        }

        .usage-model-row {
          display: grid;
          grid-template-columns: minmax(150px, 1.2fr) minmax(110px, 1fr) 90px 72px;
          align-items: center;
          gap: 18px;
          padding: 15px 0;
          border-bottom: 1px solid #eef1f5;
        }

        .usage-model-row:last-child {
          border-bottom: 0;
        }

        .usage-model-name {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .usage-model-marker {
          width: 36px;
          height: 36px;
        }

        .usage-marker-blue {
          color: #315fea;
          background: #eaf0ff;
        }

        .usage-marker-purple {
          color: #8154d9;
          background: #f2ebff;
        }

        .usage-marker-green {
          color: #14804a;
          background: #e5f8ed;
        }

        .usage-marker-orange {
          color: #c56a12;
          background: #fff1df;
        }

        .usage-model-name strong,
        .usage-model-name small {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .usage-model-name strong {
          font-size: 12px;
          font-weight: 750;
        }

        .usage-model-name small {
          margin-top: 4px;
          color: #8490a1;
          font-size: 11px;
        }

        .usage-model-share {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 0;
        }

        .usage-model-share small {
          min-width: 30px;
          color: #64748b;
          font-size: 11px;
          text-align: right;
        }

        .usage-model-bar,
        .usage-progress {
          overflow: hidden;
          width: 100%;
          height: 7px;
          border-radius: 999px;
          background: #edf0f5;
        }

        .usage-model-bar-fill,
        .usage-progress-fill {
          display: block;
          height: 100%;
          border-radius: inherit;
          transition: width 0.25s ease;
        }

        .usage-fill-blue {
          background: #4263eb;
        }

        .usage-fill-purple {
          background: #8b5cf6;
        }

        .usage-fill-green {
          background: #16a34a;
        }

        .usage-fill-orange {
          background: #f59e0b;
        }

        .usage-model-requests {
          color: #263247;
          font-size: 12px;
          text-align: right;
        }

        .usage-model-latency {
          color: #64748b;
          font-size: 12px;
          text-align: right;
        }

        .usage-footnote {
          margin: 12px 0 0;
          padding-top: 14px;
          border-top: 1px solid #eef1f5;
          color: #8993a2;
          font-size: 11px;
          line-height: 1.6;
        }

        .usage-cost-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        }

        .usage-usage-card {
          padding: 19px;
        }

        .usage-usage-icon {
          width: 40px;
          height: 40px;
          margin-bottom: 14px;
        }

        .usage-usage-value {
          margin-top: 8px;
          color: #172033;
          font-size: 25px;
          font-weight: 750;
          letter-spacing: -0.6px;
        }

        .usage-table-panel {
          padding: 0;
          overflow: hidden;
        }

        .usage-table-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          padding: 15px 17px;
          border-bottom: 1px solid var(--usage-border);
        }

        .usage-table-filters {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          flex-wrap: wrap;
        }

        .usage-table-filters .usage-select-wrap {
          min-width: 220px;
        }

        .usage-table-filters .usage-search-wrap {
          flex: 1 1 260px;
          max-width: 440px;
        }

        .usage-table-scroll {
          width: 100%;
          overflow-x: auto;
        }

        .usage-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          white-space: nowrap;
        }

        .usage-table thead {
          background: #f8fafc;
        }

        .usage-table th {
          padding: 13px 16px;
          color: #748094;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.65px;
          text-transform: uppercase;
        }

        .usage-table td {
          padding: 15px 16px;
          border-top: 1px solid #eef1f5;
          color: #4a5568;
          font-size: 12px;
        }

        .usage-table tbody tr:hover {
          background: #fbfcfe;
        }

        .usage-table .usage-id {
          color: #315fea;
          font-weight: 750;
        }

        .usage-table .usage-organization {
          color: #263247;
          font-weight: 650;
        }

        .usage-status {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 5px 9px;
          border: 1px solid transparent;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 750;
        }

        .usage-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .usage-status-healthy {
          border-color: #c6f0d5;
          background: #f0fdf4;
          color: #15803d;
        }

        .usage-status-warning {
          border-color: #fde4ad;
          background: #fffbeb;
          color: #a16207;
        }

        .usage-status-exceeded {
          border-color: #fecaca;
          background: #fef2f2;
          color: #b91c1c;
        }

        .usage-table-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 13px 17px;
          border-top: 1px solid var(--usage-border);
          color: #7b8798;
          font-size: 11px;
        }

        .usage-clear-button {
          border: 0;
          background: transparent;
          color: #315fea;
          cursor: pointer;
          font-size: 11px;
          font-weight: 750;
        }

        .usage-clear-button:hover {
          text-decoration: underline;
        }

        .usage-service-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 15px;
        }

        .usage-service-card {
          padding: 18px;
        }

        .usage-service-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }

        .usage-service-icon {
          width: 38px;
          height: 38px;
          background: #fff1df;
          color: #c56a12;
        }

        .usage-service-card h3 {
          margin: 0;
          color: #263247;
          font-size: 13px;
          font-weight: 750;
        }

        .usage-service-card > p {
          min-height: 40px;
          font-size: 11px;
        }

        .usage-service-footer {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: 16px;
          color: #7b8798;
          font-size: 11px;
        }

        .usage-service-footer strong {
          color: #344054;
          text-align: right;
        }

        .usage-shortcuts-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .usage-shortcut-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 17px;
          text-align: left;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .usage-shortcut-card:hover {
          border-color: #c7d5ff;
          box-shadow: 0 5px 16px #315fea0b;
        }

        .usage-shortcut-icon {
          width: 40px;
          height: 40px;
          background: #edf2ff;
          color: #315fea;
        }

        .usage-shortcut-copy {
          display: block;
          min-width: 0;
        }

        .usage-shortcut-copy strong,
        .usage-shortcut-copy small {
          display: block;
        }

        .usage-shortcut-copy strong {
          color: #263247;
          font-size: 12px;
          font-weight: 750;
        }

        .usage-shortcut-copy small {
          margin-top: 5px;
          color: #8490a1;
          font-size: 11px;
          line-height: 1.5;
        }

        .usage-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 34px;
          padding: 18px 0 5px;
          border-top: 1px solid var(--usage-border);
          color: #8490a1;
          font-size: 11px;
        }

        .usage-footer span {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        .usage-empty {
          padding: 32px 18px !important;
          color: #8490a1 !important;
          text-align: center;
        }

        .usage-sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        @media (max-width: 1200px) {
          .usage-page {
            padding: 22px;
          }

          .usage-metrics-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .usage-service-grid,
          .usage-shortcuts-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .usage-model-row {
            grid-template-columns: minmax(130px, 1fr) minmax(100px, 1fr) 80px 65px;
            gap: 12px;
          }
        }

        @media (max-width: 760px) {
          .usage-page {
            padding: 15px;
          }

          .usage-header {
            flex-direction: column;
            gap: 16px;
          }

          .usage-header-actions {
            width: 100%;
          }

          .usage-header-actions .usage-button {
            flex: 1;
          }

          .usage-meta {
            align-items: flex-start;
          }

          .usage-meta-spacer {
            display: none;
          }

          .usage-meta > .usage-select-wrap {
            width: 100%;
          }

          .usage-chart-grid,
          .usage-cost-grid {
            grid-template-columns: 1fr;
          }

          .usage-model-summary {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .usage-model-summary > div {
            padding-bottom: 12px;
            border-bottom: 1px solid #eef1f5;
          }

          .usage-model-summary > div:last-child {
            padding-bottom: 0;
            border-bottom: 0;
          }

          .usage-model-row {
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 12px;
          }

          .usage-model-share {
            grid-column: 1 / 2;
            grid-row: 2;
          }

          .usage-model-requests {
            grid-column: 2;
            grid-row: 1;
          }

          .usage-model-latency {
            grid-column: 2;
            grid-row: 2;
          }

          .usage-service-grid,
          .usage-shortcuts-grid {
            grid-template-columns: 1fr;
          }

          .usage-table-toolbar {
            align-items: stretch;
          }

          .usage-table-filters {
            width: 100%;
          }

          .usage-table-filters .usage-select-wrap,
          .usage-table-filters .usage-search-wrap {
            width: 100%;
            max-width: none;
            flex-basis: 100%;
          }

          .usage-footer {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 430px) {
          .usage-metrics-grid {
            grid-template-columns: 1fr;
          }

          .usage-metric-card {
            padding: 17px;
          }

          .usage-section-header {
            flex-direction: column;
          }

          .usage-panel {
            padding: 15px;
          }

          .usage-chart-value {
            font-size: 23px;
          }

          .usage-table-footer {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <div className="usage-demo-notice">
        <span className="usage-demo-icon">
          <Activity size={17} />
        </span>
        <span>
          <strong>Analytics preview</strong>
          <span className="usage-demo-copy">
            Usage, token, cost, and performance values are illustrative sample
            data, not live billing or telemetry.
          </span>
        </span>
      </div>

      <header className="usage-header">
        <div>
          <div className="usage-eyebrow">MODELNOW PLATFORM</div>
          <h1>Usage &amp; Analytics</h1>
          <p>
            Understand API consumption, model performance, resource
            utilization, and estimated costs across your organizations.
          </p>
        </div>

        <div className="usage-header-actions">
          <button
            type="button"
            className="usage-button"
            onClick={refreshAnalytics}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            type="button"
            className="usage-button usage-button-primary"
            onClick={exportReport}
          >
            <Download size={16} />
            Export report
          </button>
        </div>
      </header>

      <div className="usage-meta">
        <span className="usage-live-label">
          <span className="usage-live-dot" />
          Sample analytics
        </span>

        <span className="usage-meta-item">
          <Clock3 size={14} />
          Reporting period: {period} days
        </span>

        <span className="usage-meta-spacer" />

        <label className="usage-select-wrap">
          <span className="usage-sr-only">Reporting period</span>
          <select
            value={period}
            onChange={(event) => {
              setPeriod(event.target.value as ReportingPeriod);
              setNotice("");
            }}
            aria-label="Reporting period"
          >
            {periods.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <ChevronDown size={15} />
        </label>
      </div>

      {notice && (
        <div className="usage-action-notice" role="status">
          <CheckCircle2 size={17} />
          <span>{notice}</span>
          <button
            type="button"
            className="usage-notice-dismiss"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <section className="usage-metrics-grid" aria-label="Usage metrics">
        {usageMetrics.map((metric) => (
          <MetricCard key={metric.title} metric={metric} />
        ))}
      </section>

      <section className="usage-section">
        <SectionHeader
          title="Usage trends"
          description={`Illustrative request and token activity over the last ${period} days`}
        />

        <div className="usage-chart-grid">
          <article className="usage-panel">
            <div className="usage-panel-heading">
              <div>
                <span className="usage-panel-label">API REQUEST TREND</span>
                <div className="usage-chart-value">
                  {period === "7" ? "4.3M" : period === "90" ? "53.0M" : "18.6M"}
                </div>
                <span className="usage-inline-positive">
                  <ArrowUpRight size={14} />
                  21.3%
                </span>
              </div>
              <span className="usage-chart-icon usage-blue">
                <Activity size={19} />
              </span>
            </div>

            <div className="usage-chart-wrap">
              <TrendChart
                values={requests}
                color="#4263eb"
                label={`Illustrative API request trend for ${period} days`}
              />
            </div>

            <div className="usage-chart-axis">
              <span>Start</span>
              <span>Mid-period</span>
              <span>Current period</span>
            </div>
          </article>

          <article className="usage-panel">
            <div className="usage-panel-heading">
              <div>
                <span className="usage-panel-label">
                  TOKEN CONSUMPTION TREND
                </span>
                <div className="usage-chart-value">
                  {period === "7"
                    ? "193.8M"
                    : period === "90"
                      ? "2.40B"
                      : "842.7M"}
                </div>
                <span className="usage-inline-positive">
                  <ArrowUpRight size={14} />
                  14.8%
                </span>
              </div>
              <span className="usage-chart-icon usage-purple">
                <BrainCircuit size={19} />
              </span>
            </div>

            <div className="usage-chart-wrap">
              <TrendChart
                values={tokens}
                color="#8b5cf6"
                label={`Illustrative token consumption trend for ${period} days`}
              />
            </div>

            <div className="usage-chart-axis">
              <span>Start</span>
              <span>Mid-period</span>
              <span>Current period</span>
            </div>
          </article>
        </div>
      </section>

      <section className="usage-section">
        <SectionHeader
          title="Model usage breakdown"
          description="Compare requests, token consumption, estimated costs, and latency by model"
        />

        <article className="usage-panel">
          <div className="usage-model-summary">
            <div>
              <span className="usage-panel-label">MODELS DISPLAYED</span>
              <div className="usage-chart-value">4</div>
            </div>
            <div>
              <span className="usage-panel-label">ESTIMATED COST</span>
              <div className="usage-chart-value">
                {formatCurrency(totalEstimatedCost)}
              </div>
            </div>
            <div>
              <span className="usage-panel-label">AVERAGE LATENCY</span>
              <div className="usage-chart-value">
                {Math.round(
                  modelUsage.reduce((sum, model) => sum + model.latency, 0) /
                    modelUsage.length,
                )}{" "}
                ms
              </div>
            </div>
          </div>

          <div className="usage-model-list">
            {modelUsage.map((model) => (
              <div className="usage-model-row" key={model.name}>
                <div className="usage-model-name">
                  <span
                    className={`usage-model-marker usage-marker-${model.color}`}
                  >
                    <Layers3 size={17} />
                  </span>
                  <span>
                    <strong>{model.name}</strong>
                    <small>{model.provider}</small>
                  </span>
                </div>

                <div className="usage-model-share">
                  <div className="usage-model-bar">
                    <span
                      className={`usage-model-bar-fill usage-fill-${model.color}`}
                      style={{ width: `${model.share}%` }}
                    />
                  </div>
                  <small>{model.share}%</small>
                </div>

                <strong className="usage-model-requests">
                  {model.requests}
                </strong>
                <span className="usage-model-latency">{model.latency} ms</span>
              </div>
            ))}
          </div>

          <p className="usage-footnote">
            Model usage and cost values are examples only. Actual pricing
            depends on provider rates, model configuration, and measured
            input/output token counts.
          </p>
        </article>
      </section>

      <section className="usage-section">
        <SectionHeader
          title="Cost analytics"
          description={`Illustrative model cost distribution for the last ${period} days`}
          action="View billing"
          href="/billing"
        />

        <div className="usage-cost-grid">
          <article className="usage-panel usage-usage-card">
            <span className="usage-usage-icon usage-orange">
              <CircleDollarSign size={20} />
            </span>
            <p className="usage-panel-label">ESTIMATED MODEL COST</p>
            <div className="usage-usage-value">
              {formatCurrency(totalEstimatedCost)}
            </div>
            <p className="usage-muted">
              Illustrative cost for the selected period
            </p>
          </article>

          <article className="usage-panel usage-usage-card">
            <span className="usage-usage-icon usage-blue">
              <Zap size={20} />
            </span>
            <p className="usage-panel-label">COST PER 1K REQUESTS</p>
            <div className="usage-usage-value">$0.71</div>
            <p className="usage-muted">Example efficiency indicator</p>
          </article>

          <article className="usage-panel usage-usage-card">
            <span className="usage-usage-icon usage-green">
              <Gauge size={20} />
            </span>
            <p className="usage-panel-label">RESOURCE UTILIZATION</p>
            <div className="usage-usage-value">64.8%</div>
            <p className="usage-muted">Illustrative compute utilization</p>
          </article>
        </div>

        <article className="usage-panel">
          <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 750 }}>
            Estimated cost by model
          </h3>

          <div className="usage-model-list">
            {modelUsage.map((model) => {
              const scaledCost =
                period === "7"
                  ? Math.round(model.cost * 0.23)
                  : period === "90"
                    ? Math.round(model.cost * 2.85)
                    : model.cost;

              const totalBaseCost = modelUsage.reduce(
                (sum, item) => sum + item.cost,
                0,
              );
              const costShare = (model.cost / totalBaseCost) * 100;

              return (
                <div className="usage-model-row" key={model.name}>
                  <div className="usage-model-name">
                    <span
                      className={`usage-model-marker usage-marker-${model.color}`}
                    >
                      <CircleDollarSign size={17} />
                    </span>
                    <span>
                      <strong>{model.name}</strong>
                      <small>{model.provider}</small>
                    </span>
                  </div>

                  <div className="usage-model-share">
                    <div className="usage-model-bar">
                      <span
                        className={`usage-model-bar-fill usage-fill-${model.color}`}
                        style={{ width: `${costShare}%` }}
                      />
                    </div>
                    <small>{Math.round(costShare)}%</small>
                  </div>

                  <strong className="usage-model-requests">
                    {formatCurrency(scaledCost)}
                  </strong>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="usage-section">
        <SectionHeader
          title="Organization resource monitoring"
          description="Search organizations and review quota utilization"
        />

        <div className="usage-panel usage-table-panel">
          <div className="usage-table-toolbar">
            <div className="usage-table-filters">
              <label className="usage-select-wrap">
                <Globe2 size={15} />
                <span className="usage-sr-only">Filter organization</span>
                <select
                  value={selectedOrganization}
                  onChange={(event) =>
                    setSelectedOrganization(event.target.value)
                  }
                  aria-label="Filter organization"
                >
                  {organizations.map((organization) => (
                    <option key={organization} value={organization}>
                      {organization}
                    </option>
                  ))}
                </select>
                <ChevronDown size={15} />
              </label>

              <label className="usage-search-wrap">
                <Search size={15} />
                <span className="usage-sr-only">Search usage records</span>
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search organization, resource or status"
                  aria-label="Search usage records"
                />
              </label>
            </div>
          </div>

          <div className="usage-table-scroll">
            <table className="usage-table">
              <thead>
                <tr>
                  <th>Usage ID</th>
                  <th>Organization</th>
                  <th>Resource</th>
                  <th>Usage</th>
                  <th>Limit</th>
                  <th>Utilization</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="usage-id">{record.id}</td>
                    <td className="usage-organization">
                      {record.organization}
                    </td>
                    <td>{record.resource}</td>
                    <td>{record.usage}</td>
                    <td>{record.limit}</td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 9,
                          minWidth: 125,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <UtilizationBar value={record.utilization} />
                        </div>
                        <strong>{record.utilization}%</strong>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={record.status} />
                    </td>
                  </tr>
                ))}

                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={7} className="usage-empty">
                      No usage records match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="usage-table-footer">
            <span>
              Showing {filteredRecords.length} of {usageRecords.length} sample
              records
            </span>
            <button
              type="button"
              className="usage-clear-button"
              onClick={() => {
                setSelectedOrganization("All organizations");
                setSearchQuery("");
              }}
            >
              Clear filters
            </button>
          </div>
        </div>
      </section>

      <section className="usage-section">
        <SectionHeader
          title="Usage alerts"
          description="Sample quota conditions that may require administrator attention"
        />

        <div className="usage-service-grid">
          {usageRecords
            .filter(
              (record) =>
                record.status === "Warning" || record.status === "Exceeded",
            )
            .map((record) => (
              <article className="usage-service-card" key={record.id}>
                <div className="usage-service-top">
                  <span className="usage-service-icon">
                    <ShieldAlert size={19} />
                  </span>
                  <StatusBadge status={record.status} />
                </div>

                <h3>{record.organization}</h3>
                <p className="usage-muted">
                  {record.resource} usage is at {record.utilization}% of the
                  configured example limit.
                </p>

                <div className="usage-service-footer">
                  <span>Usage / limit</span>
                  <strong>
                    {record.usage} / {record.limit}
                  </strong>
                </div>

                <div style={{ marginTop: 13 }}>
                  <UtilizationBar value={record.utilization} />
                </div>
              </article>
            ))}
        </div>
      </section>

      <section className="usage-section">
        <SectionHeader
          title="Usage monitoring capabilities"
          description="Core areas for enterprise consumption and resource governance"
        />

        <div className="usage-shortcuts-grid">
          {[
            {
              title: "API request monitoring",
              description: "Track request volume and trends",
              icon: Activity,
            },
            {
              title: "Model token tracking",
              description: "Monitor input and output consumption",
              icon: BrainCircuit,
            },
            {
              title: "Compute monitoring",
              description: "Review infrastructure utilization",
              icon: Server,
            },
            {
              title: "Storage monitoring",
              description: "Understand storage consumption",
              icon: Database,
            },
            {
              title: "Quota monitoring",
              description: "Identify approaching usage limits",
              icon: Gauge,
            },
            {
              title: "Cost analytics",
              description: "Compare estimated provider costs",
              icon: CircleDollarSign,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <article className="usage-shortcut-card" key={item.title}>
                <span className="usage-shortcut-icon">
                  <Icon size={19} />
                </span>
                <span className="usage-shortcut-copy">
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </span>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="usage-footer">
        <span>
          <Activity size={14} />
          ModelNow Usage &amp; Analytics
        </span>
        <span>
          Preview data · Last {period} days · {filteredRecords.length} matching
          records
        </span>
      </footer>
    </main>
  );
}
