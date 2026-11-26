
"use client";

import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  BrainCircuit,
  CircleDollarSign,
  Database,
  Gauge,
  Zap,
} from "lucide-react";

const metrics = [
  {
    title: "Total Requests",
    value: "1.28M",
    detail: "Illustrative data",
    icon: Activity,
    color: "#2563eb",
  },
  {
    title: "Tokens Processed",
    value: "842.6M",
    detail: "Input + output tokens",
    icon: BrainCircuit,
    color: "#7c3aed",
  },
  {
    title: "Estimated AI Cost",
    value: "$12,480",
    detail: "Sample cost data",
    icon: CircleDollarSign,
    color: "#059669",
  },
  {
    title: "Infrastructure",
    value: "68.4%",
    detail: "Illustrative utilization",
    icon: Gauge,
    color: "#d97706",
  },
];

const sections = [
  { title: "Platform Usage", href: "/usage/platform-usage", icon: Activity },
  { title: "User Usage", href: "/usage/user-usage", icon: Database },
  {
    title: "Organization Usage",
    href: "/usage/organization-usage",
    icon: Database,
  },
  { title: "API Usage", href: "/usage/api-usage", icon: Zap },
  {
    title: "AI Model Usage",
    href: "/usage/ai-model-usage",
    icon: BrainCircuit,
  },
  {
    title: "AI Provider Usage",
    href: "/usage/ai-provider-usage",
    icon: Database,
  },
  {
    title: "Token Analytics",
    href: "/usage/token-analytics",
    icon: BrainCircuit,
  },
  {
    title: "Credit Analytics",
    href: "/usage/credit-analytics",
    icon: CircleDollarSign,
  },
  { title: "GPU Usage", href: "/usage/gpu-usage", icon: Gauge },
  {
    title: "Infrastructure Usage",
    href: "/usage/infrastructure-usage",
    icon: Database,
  },
  {
    title: "Cost Analytics",
    href: "/usage/cost-analytics",
    icon: CircleDollarSign,
  },
  {
    title: "Revenue Analytics",
    href: "/usage/revenue-analytics",
    icon: CircleDollarSign,
  },
  {
    title: "Usage Trends",
    href: "/usage/usage-trends",
    icon: Activity,
  },
  {
    title: "Usage Reports",
    href: "/usage/usage-reports",
    icon: Database,
  },
  {
    title: "Analytics Settings",
    href: "/usage/analytics-settings",
    icon: Gauge,
  },
];

export default function UsageOverviewPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "32px",
        color: "#0f172a",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1440, margin: "0 auto" }}>
        <Link
          href="/dashboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "#64748b",
            textDecoration: "none",
            marginBottom: 24,
            fontSize: 14,
          }}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 28,
          }}
        >
          <div>
            <h1 style={{ fontSize: 30, margin: 0, fontWeight: 750 }}>
              Usage &amp; Analytics
            </h1>
            <p style={{ color: "#64748b", marginTop: 9 }}>
              Monitor platform consumption, AI activity, infrastructure, and
              spending.
            </p>
          </div>
          <span
            style={{
              background: "#eff6ff",
              color: "#1d4ed8",
              borderRadius: 8,
              padding: "9px 13px",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            SAMPLE DASHBOARD DATA
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 18,
            marginBottom: 32,
          }}
        >
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <section
                key={metric.title}
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 14,
                  padding: 22,
                  boxShadow: "0 2px 8px rgba(15,23,42,0.03)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  <span style={{ color: "#64748b", fontSize: 14 }}>
                    {metric.title}
                  </span>
                  <Icon color={metric.color} size={21} />
                </div>
                <div style={{ fontSize: 29, fontWeight: 750 }}>
                  {metric.value}
                </div>
                <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 0 }}>
                  {metric.detail}
                </p>
              </section>
            );
          })}
        </div>

        <div style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 20, marginBottom: 6 }}>
            Usage Analytics Modules
          </h2>
          <p style={{ color: "#64748b", fontSize: 14 }}>
            Open a section to explore its usage and reporting dashboard.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: 16,
          }}
        >
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <Link
                key={section.href}
                href={section.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: 19,
                  color: "#0f172a",
                  textDecoration: "none",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    flexShrink: 0,
                    borderRadius: 10,
                    background: "#eff6ff",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Icon size={20} color="#2563eb" />
                </div>
                <span style={{ fontSize: 14, fontWeight: 650 }}>
                  {section.title}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
