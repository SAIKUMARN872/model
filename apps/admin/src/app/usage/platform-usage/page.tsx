
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Download,
  Globe,
  RefreshCw,
  Search,
  Server,
  Users,
  Zap,
} from "lucide-react";

const usageData = [
  { day: "Mon", requests: 12400, tokens: 820000 },
  { day: "Tue", requests: 15800, tokens: 960000 },
  { day: "Wed", requests: 14200, tokens: 910000 },
  { day: "Thu", requests: 19300, tokens: 1240000 },
  { day: "Fri", requests: 17600, tokens: 1120000 },
  { day: "Sat", requests: 22100, tokens: 1450000 },
  { day: "Sun", requests: 24800, tokens: 1620000 },
];

const services = [
  { name: "AI Chat", requests: 425600, percentage: 38, status: "Healthy" },
  { name: "Model Gateway", requests: 286400, percentage: 26, status: "Healthy" },
  { name: "Agent Workflows", requests: 184200, percentage: 17, status: "Healthy" },
  { name: "Knowledge Hub", requests: 126800, percentage: 11, status: "Warning" },
  { name: "Browser Automation", requests: 86400, percentage: 8, status: "Healthy" },
];

const providers = [
  { name: "OpenAI", requests: "386,200", share: 35, latency: "820 ms" },
  { name: "Anthropic", requests: "298,400", share: 27, latency: "910 ms" },
  { name: "Google AI", requests: "214,600", share: 19, latency: "680 ms" },
  { name: "Meta Llama", requests: "132,800", share: 12, latency: "540 ms" },
  { name: "Other Providers", requests: "76,400", share: 7, latency: "760 ms" },
];

const number = (value: number) => value.toLocaleString("en-US");

export default function PlatformUsagePage() {
  const [period, setPeriod] = useState("7");
  const [search, setSearch] = useState("");
  const [refreshed, setRefreshed] = useState(false);

  const filteredServices = useMemo(
    () =>
      services.filter((service) =>
        service.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const maxRequests = Math.max(...usageData.map((item) => item.requests));

  const exportCSV = () => {
    const rows = [
      ["Service", "Requests", "Share", "Status"],
      ...services.map((service) => [
        service.name,
        String(service.requests),
        `${service.percentage}%`,
        service.status,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-platform-usage.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const cardStyle = {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 20,
  } as const;

  const muted = { color: "#64748b", fontSize: 13 } as const;

  return (
    <main style={{ background: "#f8fafc", minHeight: "100vh", padding: 30, color: "#0f172a", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: 1450, margin: "0 auto" }}>
        <Link href="/usage/overview" style={{ color: "#64748b", textDecoration: "none", fontSize: 13 }}>
          ← Usage &amp; Analytics / Overview
        </Link>

        <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16, margin: "22px 0 26px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 750 }}>Platform Usage</h1>
            <p style={{ ...muted, marginTop: 8 }}>Monitor platform-wide activity, service consumption, and infrastructure demand.</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <select value={period} onChange={(event) => setPeriod(event.target.value)} style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 9, background: "#fff", color: "#0f172a" }}>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <button onClick={() => { setRefreshed(true); setTimeout(() => setRefreshed(false), 1800); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 13px", border: "1px solid #cbd5e1", borderRadius: 9, background: "#fff", cursor: "pointer" }}>
              <RefreshCw size={16} /> {refreshed ? "Refreshed" : "Refresh"}
            </button>
            <button onClick={exportCSV} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 13px", border: 0, borderRadius: 9, background: "#2563eb", color: "#fff", cursor: "pointer" }}>
              <Download size={16} /> Export CSV
            </button>
          </div>
        </header>

        <div style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", borderRadius: 10, padding: "12px 15px", fontSize: 12, marginBottom: 22 }}>
          Illustrative dashboard data — connect platform telemetry and billing APIs to display live metrics.
        </div>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(215px, 1fr))", gap: 16, marginBottom: 22 }}>
          {[
            { title: "Total Requests", value: period === "7" ? "1.12M" : period === "30" ? "4.68M" : "13.9M", change: "+12.8%", icon: Activity, color: "#2563eb" },
            { title: "Tokens Processed", value: period === "7" ? "8.12B" : period === "30" ? "31.7B" : "94.2B", change: "+18.4%", icon: Zap, color: "#7c3aed" },
            { title: "Active Users", value: "18,642", change: "+8.2%", icon: Users, color: "#059669" },
            { title: "Average Latency", value: "742 ms", change: "-6.1%", icon: Globe, color: "#d97706" },
          ].map((metric) => {
            const Icon = metric.icon;
            const positive = metric.change.startsWith("+");
            return (
              <article key={metric.title} style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={muted}>{metric.title}</span>
                  <Icon size={20} color={metric.color} />
                </div>
                <div style={{ fontSize: 28, fontWeight: 750, marginTop: 18 }}>{metric.value}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 10, color: metric.title === "Average Latency" ? "#059669" : positive ? "#059669" : "#dc2626", fontSize: 12 }}>
                  {positive ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                  {metric.change} <span style={{ color: "#94a3b8" }}>vs previous period</span>
                </div>
              </article>
            );
          })}
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18, marginBottom: 22 }}>
          <article style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 17 }}>Request Volume</h2>
                <p style={muted}>Daily platform requests</p>
              </div>
              <BarChart3 size={20} color="#2563eb" />
            </div>
            <div style={{ display: "flex", alignItems: "end", gap: 12, height: 190, paddingTop: 18 }}>
              {usageData.map((item) => (
                <div key={item.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "end", height: "100%", gap: 8 }}>
                  <span style={{ fontSize: 10, color: "#64748b" }}>{(item.requests / 1000).toFixed(0)}k</span>
                  <div title={`${number(item.requests)} requests`} style={{ width: "100%", maxWidth: 36, height: `${(item.requests / maxRequests) * 125}px`, minHeight: 8, background: "#3b82f6", borderRadius: "5px 5px 2px 2px" }} />
                  <span style={{ fontSize: 11, color: "#64748b" }}>{item.day}</span>
                </div>
              ))}
            </div>
          </article>

          <article style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 17 }}>Service Distribution</h2>
                <p style={muted}>Share of platform requests</p>
              </div>
              <Server size={20} color="#7c3aed" />
            </div>
            <div style={{ display: "grid", gap: 19, marginTop: 24 }}>
              {services.map((service) => (
                <div key={service.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
                    <span>{service.name}</span><strong>{service.percentage}%</strong>
                  </div>
                  <div style={{ height: 7, borderRadius: 8, background: "#f1f5f9", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${service.percentage}%`, borderRadius: 8, background: "#8b5cf6" }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section style={{ ...cardStyle, marginBottom: 22 }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, margin: 0 }}>Platform Services</h2>
              <p style={muted}>Request volume and service health</p>
            </div>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: 11, top: 12, color: "#94a3b8" }} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search services..." style={{ padding: "10px 12px 10px 34px", border: "1px solid #cbd5e1", borderRadius: 9, outline: "none", width: 220 }} />
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc", color: "#64748b" }}>
                  {["Service", "Requests", "Share", "Status"].map((heading) => (
                    <th key={heading} style={{ padding: 13, borderBottom: "1px solid #e2e8f0", fontWeight: 600 }}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => (
                  <tr key={service.name}>
                    <td style={{ padding: 14, borderBottom: "1px solid #f1f5f9", fontWeight: 600 }}>{service.name}</td>
                    <td style={{ padding: 14, borderBottom: "1px solid #f1f5f9" }}>{number(service.requests)}</td>
                    <td style={{ padding: 14, borderBottom: "1px solid #f1f5f9" }}>{service.percentage}%</td>
                    <td style={{ padding: 14, borderBottom: "1px solid #f1f5f9" }}>
                      <span style={{ display: "inline-block", padding: "5px 9px", borderRadius: 20, fontSize: 11, background: service.status === "Healthy" ? "#dcfce7" : "#fef3c7", color: service.status === "Healthy" ? "#166534" : "#92400e" }}>{service.status}</span>
                    </td>
                  </tr>
                ))}
                {filteredServices.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: 24, textAlign: "center", color: "#64748b" }}>No matching services found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <CalendarDays size={20} color="#2563eb" />
            <div>
              <h2 style={{ fontSize: 18, margin: 0 }}>Provider Request Breakdown</h2>
              <p style={muted}>Illustrative provider distribution and response latency</p>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead><tr style={{ color: "#64748b", background: "#f8fafc" }}>{["Provider", "Requests", "Traffic Share", "Avg. Latency"].map((heading) => <th key={heading} style={{ padding: 13 }}>{heading}</th>)}</tr></thead>
              <tbody>{providers.map((provider) => (
                <tr key={provider.name}>
                  <td style={{ padding: 14, borderTop: "1px solid #e2e8f0", fontWeight: 600 }}>{provider.name}</td>
                  <td style={{ padding: 14, borderTop: "1px solid #e2e8f0" }}>{provider.requests}</td>
                  <td style={{ padding: 14, borderTop: "1px solid #e2e8f0" }}>{provider.share}%</td>
                  <td style={{ padding: 14, borderTop: "1px solid #e2e8f0" }}>{provider.latency}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
