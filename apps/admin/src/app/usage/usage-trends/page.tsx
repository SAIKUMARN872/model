
"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Download,
  RefreshCw,
  TrendingUp,
  Zap,
} from "lucide-react";

type TrendPoint = {
  label: string;
  requests: number;
  tokens: number;
  cost: number;
  users: number;
};

const dailyData: TrendPoint[] = [
  { label: "01", requests: 12400, tokens: 820000, cost: 82, users: 410 },
  { label: "02", requests: 13800, tokens: 910000, cost: 95, users: 428 },
  { label: "03", requests: 11900, tokens: 780000, cost: 88, users: 405 },
  { label: "04", requests: 15600, tokens: 1040000, cost: 110, users: 452 },
  { label: "05", requests: 17200, tokens: 1180000, cost: 124, users: 480 },
  { label: "06", requests: 16300, tokens: 1090000, cost: 116, users: 469 },
  { label: "07", requests: 18900, tokens: 1320000, cost: 137, users: 502 },
  { label: "08", requests: 19400, tokens: 1400000, cost: 142, users: 515 },
  { label: "09", requests: 18100, tokens: 1250000, cost: 133, users: 496 },
  { label: "10", requests: 21500, tokens: 1510000, cost: 158, users: 548 },
  { label: "11", requests: 22700, tokens: 1620000, cost: 164, users: 561 },
  { label: "12", requests: 20900, tokens: 1490000, cost: 151, users: 540 },
  { label: "13", requests: 23800, tokens: 1700000, cost: 176, users: 584 },
  { label: "14", requests: 25100, tokens: 1820000, cost: 188, users: 602 },
  { label: "15", requests: 24400, tokens: 1760000, cost: 181, users: 594 },
  { label: "16", requests: 26700, tokens: 1940000, cost: 202, users: 623 },
  { label: "17", requests: 27900, tokens: 2030000, cost: 211, users: 641 },
  { label: "18", requests: 26100, tokens: 1880000, cost: 196, users: 618 },
  { label: "19", requests: 29400, tokens: 2180000, cost: 226, users: 669 },
  { label: "20", requests: 30800, tokens: 2290000, cost: 241, users: 687 },
  { label: "21", requests: 29700, tokens: 2210000, cost: 233, users: 676 },
  { label: "22", requests: 32200, tokens: 2400000, cost: 256, users: 708 },
  { label: "23", requests: 31500, tokens: 2330000, cost: 249, users: 699 },
  { label: "24", requests: 34700, tokens: 2590000, cost: 278, users: 741 },
  { label: "25", requests: 36100, tokens: 2720000, cost: 291, users: 759 },
  { label: "26", requests: 34900, tokens: 2630000, cost: 284, users: 748 },
  { label: "27", requests: 38200, tokens: 2890000, cost: 310, users: 790 },
  { label: "28", requests: 39500, tokens: 3010000, cost: 324, users: 812 },
  { label: "29", requests: 37800, tokens: 2870000, cost: 315, users: 801 },
  { label: "30", requests: 42100, tokens: 3240000, cost: 352, users: 850 },
];

const weeklyData: TrendPoint[] = [
  { label: "W1", requests: 82400, tokens: 5620000, cost: 542, users: 840 },
  { label: "W2", requests: 116500, tokens: 8120000, cost: 782, users: 970 },
  { label: "W3", requests: 148300, tokens: 10540000, cost: 1045, users: 1130 },
  { label: "W4", requests: 191600, tokens: 14120000, cost: 1498, users: 1290 },
  { label: "W5", requests: 224700, tokens: 16380000, cost: 1775, users: 1460 },
  { label: "W6", requests: 258200, tokens: 19100000, cost: 2084, users: 1610 },
  { label: "W7", requests: 291400, tokens: 21850000, cost: 2390, users: 1790 },
  { label: "W8", requests: 327100, tokens: 24700000, cost: 2710, users: 1950 },
  { label: "W9", requests: 365800, tokens: 27620000, cost: 3040, users: 2130 },
  { label: "W10", requests: 402600, tokens: 30800000, cost: 3395, users: 2310 },
  { label: "W11", requests: 448100, tokens: 34200000, cost: 3780, users: 2530 },
  { label: "W12", requests: 491500, tokens: 37900000, cost: 4210, users: 2780 },
];

const monthlyData: TrendPoint[] = [
  { label: "Jun", requests: 280000, tokens: 21000000, cost: 8200, users: 1450 },
  { label: "Jul", requests: 340000, tokens: 25800000, cost: 9400, users: 1670 },
  { label: "Aug", requests: 390000, tokens: 29400000, cost: 10800, users: 1890 },
  { label: "Sep", requests: 470000, tokens: 35800000, cost: 12600, users: 2180 },
  { label: "Oct", requests: 580000, tokens: 44200000, cost: 14900, users: 2510 },
  { label: "Nov", requests: 650000, tokens: 50100000, cost: 17200, users: 2890 },
];

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const compact = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export default function UsageTrendsPage() {
  const [range, setRange] = useState("30 days");
  const [metric, setMetric] = useState<"requests" | "tokens" | "cost" | "users">("requests");
  const [showComparison, setShowComparison] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("Just now");

  const data = useMemo(() => {
    if (range === "7 days") return dailyData.slice(-7);
    if (range === "90 days") return weeklyData;
    if (range === "12 months") return monthlyData;
    return dailyData;
  }, [range]);

  const currentTotal = data.reduce((sum, item) => sum + item[metric], 0);
  const previousTotal = data.reduce((sum, item) => sum + item[metric] * 0.88, 0);
  const change = previousTotal ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;
  const maxValue = Math.max(...data.map((item) => item[metric]), 1);

  const metrics = [
    { id: "requests" as const, label: "API Requests", icon: Activity, color: "#6366f1", suffix: "" },
    { id: "tokens" as const, label: "Tokens Processed", icon: Zap, color: "#0ea5e9", suffix: "" },
    { id: "cost" as const, label: "Estimated Cost", icon: BarChart3, color: "#10b981", suffix: "" },
    { id: "users" as const, label: "Active Users", icon: TrendingUp, color: "#f59e0b", suffix: "" },
  ];

  const formatMetric = (value: number) =>
    metric === "cost" ? money(value) : compact(value);

  const panel: CSSProperties = {
    border: "1px solid var(--border, #e5e7eb)",
    borderRadius: 14,
    background: "var(--panel, #fff)",
    padding: 20,
    minWidth: 0,
  };

  const input: CSSProperties = {
    height: 40,
    border: "1px solid var(--border, #d1d5db)",
    borderRadius: 9,
    padding: "0 12px",
    background: "var(--panel, #fff)",
    color: "var(--foreground, #111827)",
    fontSize: 13,
    outline: "none",
  };

  const button: CSSProperties = {
    height: 39,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    border: "1px solid var(--border, #d1d5db)",
    borderRadius: 9,
    padding: "0 13px",
    background: "var(--panel, #fff)",
    color: "var(--foreground, #111827)",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  };

  const muted: CSSProperties = {
    color: "var(--muted-foreground, #6b7280)",
    fontSize: 12,
  };

  const exportCsv = () => {
    const headers = ["Period", "Requests", "Tokens", "Cost USD", "Active Users"];
    const rows = data.map((item) => [
      item.label,
      item.requests,
      item.tokens,
      item.cost,
      item.users,
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-usage-trends.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const refresh = () => setLastUpdated(new Date().toLocaleTimeString());

  return (
    <main
      style={{
        maxWidth: 1600,
        margin: "0 auto",
        padding: "28px clamp(16px, 3vw, 32px)",
        color: "var(--foreground, #111827)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 20,
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ ...muted, marginBottom: 8 }}>
            <Link href="/usage" style={{ color: "inherit", textDecoration: "none" }}>
              Usage &amp; Analytics
            </Link>{" "}
            / Usage Trends
          </div>
          <h1 style={{ fontSize: "clamp(25px, 3vw, 32px)", fontWeight: 750, letterSpacing: "-0.8px", margin: "0 0 8px" }}>
            Usage Trends
          </h1>
          <p style={{ ...muted, fontSize: 14, margin: 0 }}>
            Explore usage patterns, growth, and operational demand over time.
          </p>
        </div>

        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <button style={button} onClick={refresh}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button style={button} onClick={exportCsv}>
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      <section style={{ ...panel, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <CalendarDays size={17} color="#6366f1" />
        <span style={{ fontSize: 13, fontWeight: 650 }}>Time range</span>
        <select
          value={range}
          onChange={(event) => setRange(event.target.value)}
          aria-label="Time range"
          style={{ ...input, width: 170 }}
        >
          <option>7 days</option>
          <option>30 days</option>
          <option>90 days</option>
          <option>12 months</option>
        </select>

        <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={showComparison}
            onChange={(event) => setShowComparison(event.target.checked)}
          />
          Show comparison
        </label>

        <span style={{ ...muted, marginLeft: "auto" }}>Last refreshed: {lastUpdated}</span>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))", gap: 16, marginBottom: 22 }}>
        {metrics.map((item) => {
          const Icon = item.icon;
          const total = data.reduce((sum, point) => sum + point[item.id], 0);

          return (
            <button
              key={item.id}
              onClick={() => setMetric(item.id)}
              style={{
                ...panel,
                textAlign: "left",
                cursor: "pointer",
                border: metric === item.id ? `1px solid ${item.color}` : "1px solid var(--border, #e5e7eb)",
                boxShadow: metric === item.id ? `0 0 0 2px ${item.color}18` : "none",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <span style={muted}>{item.label}</span>
                <Icon size={19} color={item.color} />
              </div>
              <div style={{ fontSize: 27, fontWeight: 750, letterSpacing: "-0.8px" }}>
                {item.id === "cost" ? money(total) : compact(total)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 10, fontSize: 12, color: "#059669" }}>
                <ArrowUpRight size={14} />
                {change.toFixed(1)}% compared with baseline
              </div>
            </button>
          );
        })}
      </section>

      <section style={{ ...panel, marginBottom: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap", marginBottom: 22 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px" }}>
              {metrics.find((item) => item.id === metric)?.label} over time
            </h2>
            <p style={{ ...muted, margin: 0 }}>
              {range} · {data.length} plotted intervals
            </p>
          </div>
          <span style={{ ...muted, display: "inline-flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: "#6366f1" }} />
            Current period
            {showComparison && (
              <>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: "#cbd5e1", marginLeft: 8 }} />
                Comparison
              </>
            )}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: range === "30 days" ? 4 : 12, height: 260, padding: "12px 0 0", borderBottom: "1px solid var(--border, #e5e7eb)" }}>
          {data.map((item, index) => {
            const value = item[metric];
            const height = (value / maxValue) * 100;
            const comparisonHeight = height * 0.88;

            return (
              <div key={item.label} style={{ flex: 1, minWidth: 0, height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 2 }}>
                {showComparison && (
                  <div
                    title={`${item.label} comparison: ${formatMetric(value * 0.88)}`}
                    style={{
                      width: range === "30 days" ? "38%" : "43%",
                      height: `${comparisonHeight}%`,
                      minHeight: 2,
                      background: "#cbd5e1",
                      borderRadius: "4px 4px 0 0",
                    }}
                  />
                )}
                <div
                  title={`${item.label}: ${formatMetric(value)}`}
                  style={{
                    width: showComparison ? "43%" : "75%",
                    height: `${height}%`,
                    minHeight: 2,
                    background: index === data.length - 1 ? "#4f46e5" : "#818cf8",
                    borderRadius: "4px 4px 0 0",
                  }}
                />
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 10, ...muted }}>
          <span>{data[0]?.label}</span>
          {data.length > 4 && <span>{data[Math.floor(data.length / 3)]?.label}</span>}
          {data.length > 4 && <span>{data[Math.floor((data.length * 2) / 3)]?.label}</span>}
          <span>{data[data.length - 1]?.label}</span>
        </div>

        <div style={{ marginTop: 22, padding: 15, borderRadius: 10, background: "var(--muted, #f8fafc)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <TrendingUp size={18} color="#059669" />
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontWeight: 650, fontSize: 13 }}>Trend summary</div>
            <div style={{ ...muted, marginTop: 4 }}>
              The sample series increases across the selected intervals. Connect production telemetry to calculate actual growth and comparison periods.
            </div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 750, color: "#059669" }}>
            +{change.toFixed(1)}%
          </div>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: 18, marginBottom: 22 }}>
        <div style={panel}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>Period summary</h2>
          <p style={{ ...muted, margin: "0 0 18px" }}>Totals for the selected sample range</p>

          {[
            ["API requests", compact(data.reduce((sum, item) => sum + item.requests, 0))],
            ["Tokens processed", compact(data.reduce((sum, item) => sum + item.tokens, 0))],
            ["Estimated cost", money(data.reduce((sum, item) => sum + item.cost, 0))],
            ["Active user observations", compact(data.reduce((sum, item) => sum + item.users, 0))],
          ].map(([label, value]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "14px 0", borderBottom: "1px solid var(--border, #e5e7eb)", fontSize: 13 }}>
              <span style={muted}>{label}</span>
              <span style={{ fontWeight: 700 }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={panel}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>Usage insights</h2>
          <p style={{ ...muted, margin: "0 0 18px" }}>Signals to monitor in production</p>

          {[
            {
              title: "Request growth",
              description: "Track request spikes by route, tenant, and application.",
              icon: Activity,
              color: "#6366f1",
            },
            {
              title: "Token efficiency",
              description: "Compare tokens per request across models and workloads.",
              icon: Zap,
              color: "#0ea5e9",
            },
            {
              title: "Cost control",
              description: "Identify rising spend and configure budget alerts.",
              icon: BarChart3,
              color: "#d97706",
            },
          ].map((insight) => {
            const Icon = insight.icon;

            return (
              <div key={insight.title} style={{ display: "flex", gap: 12, padding: "13px 0", borderBottom: "1px solid var(--border, #e5e7eb)" }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: `${insight.color}15`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Icon size={17} color={insight.color} />
                </div>
                <div>
                  <div style={{ fontWeight: 650, fontSize: 13 }}>{insight.title}</div>
                  <div style={{ ...muted, marginTop: 4, lineHeight: 1.6 }}>{insight.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ ...panel, display: "flex", gap: 12, alignItems: "flex-start" }}>
        <BarChart3 size={19} color="#6366f1" style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 650, fontSize: 13, marginBottom: 5 }}>Illustrative trend data</div>
          <p style={{ ...muted, lineHeight: 1.7, margin: 0 }}>
            This page uses static sample data to demonstrate the trends interface. The comparison series is calculated from a fixed baseline, not actual previous-period records. Connect the usage events, token metering, billing, and user analytics APIs for accurate production trends. Refresh currently updates the timestamp only.
          </p>
        </div>
      </section>
    </main>
  );
}
