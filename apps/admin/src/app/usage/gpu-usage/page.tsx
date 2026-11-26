
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Cpu,
  Download,
  Gauge,
  HardDrive,
  Layers3,
  MemoryStick,
  RefreshCw,
  Search,
  Server,
  Thermometer,
  X,
  Zap,
} from "lucide-react";

type GpuRecord = {
  id: string;
  name: string;
  provider: string;
  region: string;
  workload: string;
  gpuType: string;
  count: number;
  utilization: number;
  memory: number;
  temperature: number;
  power: number;
  costPerHour: number;
  status: "Healthy" | "Warning" | "Offline";
};

const initialRecords: GpuRecord[] = [
  {
    id: "gpu-cluster-001",
    name: "Production Inference A",
    provider: "NVIDIA Cloud",
    region: "us-east-1",
    workload: "Model inference",
    gpuType: "NVIDIA H100",
    count: 8,
    utilization: 87,
    memory: 78,
    temperature: 72,
    power: 81,
    costPerHour: 24.8,
    status: "Healthy",
  },
  {
    id: "gpu-cluster-002",
    name: "Training Cluster B",
    provider: "CoreWeave",
    region: "us-west-2",
    workload: "Fine-tuning",
    gpuType: "NVIDIA A100",
    count: 16,
    utilization: 94,
    memory: 91,
    temperature: 82,
    power: 93,
    costPerHour: 38.4,
    status: "Warning",
  },
  {
    id: "gpu-cluster-003",
    name: "Embedding Workers",
    provider: "AWS",
    region: "ap-south-1",
    workload: "Embeddings",
    gpuType: "NVIDIA L4",
    count: 4,
    utilization: 54,
    memory: 48,
    temperature: 61,
    power: 49,
    costPerHour: 5.2,
    status: "Healthy",
  },
  {
    id: "gpu-cluster-004",
    name: "Batch Processing C",
    provider: "Google Cloud",
    region: "us-central1",
    workload: "Batch inference",
    gpuType: "NVIDIA A100",
    count: 8,
    utilization: 68,
    memory: 63,
    temperature: 67,
    power: 65,
    costPerHour: 19.2,
    status: "Healthy",
  },
  {
    id: "gpu-cluster-005",
    name: "Development Sandbox",
    provider: "Azure",
    region: "eastus",
    workload: "Development",
    gpuType: "NVIDIA T4",
    count: 2,
    utilization: 12,
    memory: 21,
    temperature: 43,
    power: 18,
    costPerHour: 1.6,
    status: "Offline",
  },
  {
    id: "gpu-cluster-006",
    name: "Realtime Agent Pool",
    provider: "NVIDIA Cloud",
    region: "eu-west-1",
    workload: "Agent inference",
    gpuType: "NVIDIA H100",
    count: 4,
    utilization: 76,
    memory: 70,
    temperature: 69,
    power: 73,
    costPerHour: 12.4,
    status: "Healthy",
  },
];

const C = {
  bg: "#f7f8fc",
  card: "#ffffff",
  border: "#e5e7eb",
  text: "#111827",
  muted: "#6b7280",
  blue: "#315fea",
};

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

const compact = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export default function GpuUsagePage() {
  const [records] = useState(initialRecords);
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("All providers");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [gpuFilter, setGpuFilter] = useState("All GPU types");
  const [sortBy, setSortBy] = useState("utilization");
  const [period, setPeriod] = useState("Last 24 hours");
  const [selected, setSelected] = useState<GpuRecord | null>(null);
  const [refreshed, setRefreshed] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records
      .filter((item) => {
        const matchesSearch =
          !query ||
          item.name.toLowerCase().includes(query) ||
          item.id.toLowerCase().includes(query) ||
          item.gpuType.toLowerCase().includes(query) ||
          item.workload.toLowerCase().includes(query) ||
          item.region.toLowerCase().includes(query);

        const matchesProvider =
          providerFilter === "All providers" ||
          item.provider === providerFilter;

        const matchesStatus =
          statusFilter === "All statuses" || item.status === statusFilter;

        const matchesGpu =
          gpuFilter === "All GPU types" || item.gpuType === gpuFilter;

        return matchesSearch && matchesProvider && matchesStatus && matchesGpu;
      })
      .sort((a, b) => {
        if (sortBy === "memory") return b.memory - a.memory;
        if (sortBy === "temperature") return b.temperature - a.temperature;
        if (sortBy === "cost") return b.costPerHour - a.costPerHour;
        if (sortBy === "power") return b.power - a.power;
        return b.utilization - a.utilization;
      });
  }, [records, search, providerFilter, statusFilter, gpuFilter, sortBy]);

  const metrics = useMemo(() => {
    const online = filtered.filter((item) => item.status !== "Offline");
    const gpuCount = online.reduce((sum, item) => sum + item.count, 0);
    const weightedUtilization = gpuCount
      ? online.reduce(
          (sum, item) => sum + item.utilization * item.count,
          0
        ) / gpuCount
      : 0;

    const weightedMemory = gpuCount
      ? online.reduce((sum, item) => sum + item.memory * item.count, 0) /
        gpuCount
      : 0;

    const hourlyCost = online.reduce(
      (sum, item) => sum + item.costPerHour,
      0
    );

    return {
      gpuCount,
      clusterCount: online.length,
      weightedUtilization,
      weightedMemory,
      hourlyCost,
      dailyCost: hourlyCost * 24,
      warnings: filtered.filter((item) => item.status === "Warning").length,
      offline: filtered.filter((item) => item.status === "Offline").length,
      averageTemperature: online.length
        ? online.reduce((sum, item) => sum + item.temperature, 0) /
          online.length
        : 0,
    };
  }, [filtered]);

  const providerSummary = useMemo(() => {
    const groups: Record<
      string,
      { provider: string; clusters: number; gpus: number; utilization: number }
    > = {};

    filtered.forEach((item) => {
      if (!groups[item.provider]) {
        groups[item.provider] = {
          provider: item.provider,
          clusters: 0,
          gpus: 0,
          utilization: 0,
        };
      }

      groups[item.provider].clusters += 1;

      if (item.status !== "Offline") {
        groups[item.provider].gpus += item.count;
        groups[item.provider].utilization += item.utilization * item.count;
      }
    });

    return Object.values(groups).map((group) => ({
      ...group,
      utilization: group.gpus
        ? group.utilization / group.gpus
        : 0,
    }));
  }, [filtered]);

  const exportCsv = () => {
    const headers = [
      "Cluster ID",
      "Cluster Name",
      "Provider",
      "Region",
      "Workload",
      "GPU Type",
      "GPU Count",
      "Utilization %",
      "Memory Usage %",
      "Temperature C",
      "Power Usage %",
      "Estimated Cost Per Hour USD",
      "Status",
    ];

    const rows = filtered.map((item) => [
      item.id,
      item.name,
      item.provider,
      item.region,
      item.workload,
      item.gpuType,
      item.count,
      item.utilization,
      item.memory,
      item.temperature,
      item.power,
      item.costPerHour,
      item.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-gpu-usage.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const cardStyle = {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 14,
    padding: 20,
    minWidth: 0,
  } as const;

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: "10px 12px",
    border: `1px solid ${C.border}`,
    borderRadius: 9,
    background: "#fff",
    color: C.text,
    fontSize: 12,
    outline: "none",
  };

  const buttonStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "9px 13px",
    border: `1px solid ${C.border}`,
    borderRadius: 9,
    background: "#fff",
    color: C.text,
    fontSize: 12,
    fontWeight: 650,
    cursor: "pointer",
  } as const;

  const statusStyle = (status: GpuRecord["status"]) => {
    const styles = {
      Healthy: { background: "#dcfce7", color: "#166534" },
      Warning: { background: "#fef3c7", color: "#92400e" },
      Offline: { background: "#fee2e2", color: "#991b1b" },
    };

    return {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "5px 9px",
      borderRadius: 20,
      fontSize: 10,
      fontWeight: 750,
      whiteSpace: "nowrap" as const,
      ...styles[status],
    };
  };

  const utilizationColor = (value: number) => {
    if (value >= 90) return "#dc2626";
    if (value >= 75) return "#d97706";
    return "#15803d";
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "28px clamp(16px, 3vw, 36px)",
        background: C.bg,
        color: C.text,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ maxWidth: 1500, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 18,
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                fontSize: 12,
                color: C.muted,
                marginBottom: 12,
              }}
            >
              <Link
                href="/usage/overview"
                style={{ color: C.muted, textDecoration: "none" }}
              >
                Usage & Analytics
              </Link>
              <span>/</span>
              <span style={{ color: C.text }}>GPU Usage</span>
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(25px, 3vw, 32px)",
                fontWeight: 750,
                letterSpacing: "-1px",
              }}
            >
              GPU Usage
            </h1>
            <p
              style={{
                margin: "9px 0 0",
                color: C.muted,
                fontSize: 14,
                lineHeight: 1.6,
                maxWidth: 720,
              }}
            >
              Monitor accelerator utilization, GPU memory, temperature, power,
              workloads, and estimated compute spending across clusters.
            </p>
          </div>

          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              style={{ ...inputStyle, width: "auto", minWidth: 145 }}
              aria-label="GPU reporting period"
            >
              <option>Last hour</option>
              <option>Last 24 hours</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
            <button
              type="button"
              onClick={() => setRefreshed(true)}
              style={buttonStyle}
            >
              <RefreshCw size={14} />
              Refresh
            </button>
            <button
              type="button"
              onClick={exportCsv}
              style={{
                ...buttonStyle,
                background: C.blue,
                borderColor: C.blue,
                color: "#fff",
              }}
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </header>

        {refreshed && (
          <div
            style={{
              padding: 12,
              marginBottom: 18,
              borderRadius: 9,
              border: "1px solid #bfdbfe",
              background: "#eff6ff",
              color: "#1d4ed8",
              fontSize: 12,
            }}
          >
            Demo GPU records refreshed. Connect your infrastructure monitoring
            API for live telemetry.
          </div>
        )}

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))",
            gap: 15,
            marginBottom: 22,
          }}
        >
          {[
            {
              label: "Active GPUs",
              value: compact(metrics.gpuCount),
              note: `${metrics.clusterCount} active clusters`,
              icon: Cpu,
              color: "#315fea",
              bg: "#eef2ff",
            },
            {
              label: "GPU Utilization",
              value: `${metrics.weightedUtilization.toFixed(1)}%`,
              note: "GPU-count weighted average",
              icon: Gauge,
              color: "#15803d",
              bg: "#dcfce7",
            },
            {
              label: "Memory Utilization",
              value: `${metrics.weightedMemory.toFixed(1)}%`,
              note: "Reported GPU memory usage",
              icon: MemoryStick,
              color: "#7c3aed",
              bg: "#f3e8ff",
            },
            {
              label: "Estimated Hourly Cost",
              value: money(metrics.hourlyCost),
              note: "Illustrative compute estimate",
              icon: Zap,
              color: "#c2410c",
              bg: "#ffedd5",
            },
            {
              label: "Avg. Temperature",
              value: `${metrics.averageTemperature.toFixed(1)}°C`,
              note: "Average across active clusters",
              icon: Thermometer,
              color: "#0369a1",
              bg: "#e0f2fe",
            },
            {
              label: "Health Alerts",
              value: String(metrics.warnings + metrics.offline),
              note: `${metrics.warnings} warnings · ${metrics.offline} offline`,
              icon: AlertTriangle,
              color: "#b45309",
              bg: "#fef3c7",
            },
          ].map((metric) => {
            const Icon = metric.icon;

            return (
              <article key={metric.label} style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 12, color: C.muted }}>
                    {metric.label}
                  </span>
                  <span
                    style={{
                      display: "grid",
                      placeItems: "center",
                      width: 35,
                      height: 35,
                      borderRadius: 10,
                      background: metric.bg,
                      color: metric.color,
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={17} />
                  </span>
                </div>
                <div
                  style={{
                    marginTop: 17,
                    fontSize: "clamp(22px, 2vw, 28px)",
                    fontWeight: 750,
                    letterSpacing: "-0.7px",
                    overflowWrap: "anywhere",
                  }}
                >
                  {metric.value}
                </div>
                <div
                  style={{
                    marginTop: 7,
                    fontSize: 11,
                    color: C.muted,
                  }}
                >
                  {metric.note}
                </div>
              </article>
            );
          })}
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
            gap: 18,
            marginBottom: 22,
          }}
        >
          <article style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
                  GPU utilization by cluster
                </h2>
                <p
                  style={{
                    margin: "6px 0 0",
                    color: C.muted,
                    fontSize: 11,
                  }}
                >
                  Reported utilization percentages
                </p>
              </div>
              <Activity size={19} color={C.blue} />
            </div>

            {filtered.map((item) => (
              <div key={item.id} style={{ marginTop: 21 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 8,
                    fontSize: 11,
                  }}
                >
                  <div>
                    <strong>{item.name}</strong>
                    <div
                      style={{
                        color: C.muted,
                        fontSize: 10,
                        marginTop: 4,
                      }}
                    >
                      {item.gpuType} · {item.count} GPUs
                    </div>
                  </div>
                  <strong
                    style={{
                      color: utilizationColor(item.utilization),
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.utilization}%
                  </strong>
                </div>
                <div
                  style={{
                    height: 9,
                    borderRadius: 10,
                    background: "#eef0f5",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${item.utilization}%`,
                      background: utilizationColor(item.utilization),
                      borderRadius: 10,
                    }}
                  />
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <p style={{ fontSize: 12, color: C.muted }}>
                No matching GPU clusters.
              </p>
            )}

            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                marginTop: 22,
                fontSize: 10,
                color: C.muted,
              }}
            >
              <span>Healthy: below 75%</span>
              <span>Elevated: 75–89%</span>
              <span>High: 90% and above</span>
            </div>
          </article>

          <article style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
                  Provider capacity
                </h2>
                <p
                  style={{
                    margin: "6px 0 0",
                    color: C.muted,
                    fontSize: 11,
                  }}
                >
                  Active accelerator allocation
                </p>
              </div>
              <Layers3 size={19} color="#7c3aed" />
            </div>

            {providerSummary.map((provider) => (
              <div key={provider.provider} style={{ marginTop: 22 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    fontSize: 12,
                    marginBottom: 8,
                  }}
                >
                  <strong>{provider.provider}</strong>
                  <span style={{ color: C.muted }}>
                    {provider.gpus} GPUs
                  </span>
                </div>
                <div
                  style={{
                    height: 8,
                    borderRadius: 10,
                    background: "#eef0f5",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${provider.utilization}%`,
                      borderRadius: 10,
                      background: "#8b5cf6",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 7,
                    fontSize: 10,
                    color: C.muted,
                  }}
                >
                  <span>{provider.clusters} clusters</span>
                  <span>{provider.utilization.toFixed(1)}% utilization</span>
                </div>
              </div>
            ))}

            <div
              style={{
                marginTop: 23,
                borderRadius: 10,
                background: "#f9fafb",
                padding: 13,
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <Server size={17} color={C.blue} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>
                  Estimated daily compute spend
                </div>
                <div
                  style={{
                    fontSize: 21,
                    fontWeight: 750,
                    marginTop: 5,
                  }}
                >
                  {money(metrics.dailyCost)}
                </div>
                <div
                  style={{
                    color: C.muted,
                    fontSize: 10,
                    marginTop: 4,
                  }}
                >
                  Based on current sample hourly rates × 24 hours.
                </div>
              </div>
            </div>
          </article>
        </section>

        <section style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: 20,
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 14,
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                GPU cluster inventory
              </h2>
              <p
                style={{
                  margin: "6px 0 0",
                  color: C.muted,
                  fontSize: 12,
                }}
              >
                Resource utilization, hardware details, and health status
              </p>
            </div>

            <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
              <div style={{ position: "relative", width: "min(100%, 235px)" }}>
                <Search
                  size={15}
                  style={{
                    position: "absolute",
                    left: 11,
                    top: 12,
                    color: C.muted,
                  }}
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search cluster, GPU, region..."
                  style={{ ...inputStyle, paddingLeft: 34 }}
                />
              </div>
              <select
                value={providerFilter}
                onChange={(event) => setProviderFilter(event.target.value)}
                style={{ ...inputStyle, width: "auto", maxWidth: 180 }}
                aria-label="Filter by provider"
              >
                <option>All providers</option>
                {[...new Set(records.map((item) => item.provider))].map(
                  (provider) => (
                    <option key={provider}>{provider}</option>
                  )
                )}
              </select>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                style={{ ...inputStyle, width: "auto" }}
                aria-label="Filter by health status"
              >
                <option>All statuses</option>
                <option>Healthy</option>
                <option>Warning</option>
                <option>Offline</option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              padding: "12px 18px",
              background: "#fafbff",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <span style={{ fontSize: 11, color: C.muted }}>
              {filtered.length} clusters found
            </span>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 11,
                color: C.muted,
              }}
            >
              Sort by
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                style={{ ...inputStyle, width: "auto", padding: "7px 10px" }}
              >
                <option value="utilization">GPU utilization</option>
                <option value="memory">Memory usage</option>
                <option value="temperature">Temperature</option>
                <option value="power">Power usage</option>
                <option value="cost">Hourly cost</option>
              </select>
            </label>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: 1100,
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {[
                    "Cluster",
                    "Provider / Region",
                    "GPU Hardware",
                    "Workload",
                    "GPU Count",
                    "Utilization",
                    "Memory",
                    "Temperature",
                    "Power",
                    "Cost / Hour",
                    "Status",
                    "Details",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: "13px 14px",
                        borderBottom: `1px solid ${C.border}`,
                        color: C.muted,
                        fontSize: 10,
                        fontWeight: 750,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td
                      style={{
                        padding: 14,
                        borderBottom: `1px solid ${C.border}`,
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700 }}>
                        {item.name}
                      </div>
                      <div
                        style={{
                          color: C.muted,
                          fontSize: 10,
                          marginTop: 4,
                        }}
                      >
                        {item.id}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: 14,
                        borderBottom: `1px solid ${C.border}`,
                      }}
                    >
                      <div style={{ fontSize: 11 }}>{item.provider}</div>
                      <div
                        style={{
                          color: C.muted,
                          fontSize: 10,
                          marginTop: 4,
                        }}
                      >
                        {item.region}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: 14,
                        borderBottom: `1px solid ${C.border}`,
                        fontSize: 11,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.gpuType}
                    </td>
                    <td
                      style={{
                        padding: 14,
                        borderBottom: `1px solid ${C.border}`,
                        fontSize: 11,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.workload}
                    </td>
                    <td
                      style={{
                        padding: 14,
                        borderBottom: `1px solid ${C.border}`,
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {item.count}
                    </td>
                    <td
                      style={{
                        padding: 14,
                        borderBottom: `1px solid ${C.border}`,
                        minWidth: 120,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          marginBottom: 6,
                        }}
                      >
                        {item.utilization}%
                      </div>
                      <div
                        style={{
                          height: 5,
                          background: "#eef0f5",
                          borderRadius: 10,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${item.utilization}%`,
                            background: utilizationColor(item.utilization),
                          }}
                        />
                      </div>
                    </td>
                    <td
                      style={{
                        padding: 14,
                        borderBottom: `1px solid ${C.border}`,
                        fontSize: 11,
                      }}
                    >
                      {item.memory}%
                    </td>
                    <td
                      style={{
                        padding: 14,
                        borderBottom: `1px solid ${C.border}`,
                        fontSize: 11,
                        color: item.temperature >= 80 ? "#dc2626" : C.text,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.temperature}°C
                    </td>
                    <td
                      style={{
                        padding: 14,
                        borderBottom: `1px solid ${C.border}`,
                        fontSize: 11,
                      }}
                    >
                      {item.power}%
                    </td>
                    <td
                      style={{
                        padding: 14,
                        borderBottom: `1px solid ${C.border}`,
                        fontSize: 11,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {money(item.costPerHour)}
                    </td>
                    <td
                      style={{
                        padding: 14,
                        borderBottom: `1px solid ${C.border}`,
                      }}
                    >
                      <span style={statusStyle(item.status)}>
                        {item.status === "Healthy" ? (
                          <CheckCircle2 size={11} />
                        ) : (
                          <AlertTriangle size={11} />
                        )}
                        {item.status}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: 14,
                        borderBottom: `1px solid ${C.border}`,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelected(item)}
                        style={{ ...buttonStyle, padding: "7px 9px" }}
                      >
                        View
                        <ArrowUpRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={12}
                      style={{
                        padding: 40,
                        textAlign: "center",
                        color: C.muted,
                        fontSize: 13,
                      }}
                    >
                      No GPU clusters match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
              padding: "13px 18px",
              borderTop: `1px solid ${C.border}`,
              color: C.muted,
              fontSize: 11,
            }}
          >
            <span>{filtered.length} clusters displayed</span>
            <span>
              {metrics.gpuCount} active GPUs · {money(metrics.hourlyCost)}/hour
            </span>
          </div>
        </section>

        <div
          style={{
            marginTop: 18,
            padding: 14,
            borderRadius: 10,
            border: "1px solid #fde68a",
            background: "#fffbeb",
            color: "#92400e",
            fontSize: 11,
            lineHeight: 1.7,
          }}
        >
          <strong>Demo data:</strong> GPU counts, utilization, temperatures,
          memory, power, cluster health, and hourly rates are illustrative.
          The reporting period is a display control only. Connect your cloud
          provider APIs and GPU monitoring agents for live infrastructure data.
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginTop: 20,
          }}
        >
          {[
            ["Usage Overview", "/usage/overview"],
            ["Infrastructure Usage", "/usage/infrastructure-usage"],
            ["Cost Analytics", "/usage/cost-analytics"],
            ["AI Model Usage", "/usage/ai-model-usage"],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 12px",
                borderRadius: 9,
                border: `1px solid ${C.border}`,
                background: "#fff",
                color: C.text,
                textDecoration: "none",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {label}
              <ArrowUpRight size={13} />
            </Link>
          ))}
        </div>
      </div>

      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(17, 24, 39, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="gpu-detail-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 600,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 24px 70px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <div>
                <span
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: 43,
                    height: 43,
                    borderRadius: 11,
                    background: "#eef2ff",
                    color: C.blue,
                    marginBottom: 14,
                  }}
                >
                  <Cpu size={21} />
                </span>
                <h2
                  id="gpu-detail-title"
                  style={{ margin: 0, fontSize: 22, letterSpacing: "-0.5px" }}
                >
                  {selected.name}
                </h2>
                <p
                  style={{
                    margin: "7px 0 0",
                    color: C.muted,
                    fontSize: 12,
                  }}
                >
                  {selected.id} · {selected.region}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                style={{ ...buttonStyle, padding: 8 }}
                aria-label="Close GPU details"
              >
                <X size={17} />
              </button>
            </div>

            <div style={{ marginTop: 18, marginBottom: 16 }}>
              <span style={statusStyle(selected.status)}>
                {selected.status === "Healthy" ? (
                  <CheckCircle2 size={11} />
                ) : (
                  <AlertTriangle size={11} />
                )}
                {selected.status}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 12,
              }}
            >
              {[
                ["Provider", selected.provider],
                ["GPU hardware", selected.gpuType],
                ["GPU count", String(selected.count)],
                ["Workload", selected.workload],
                ["GPU utilization", `${selected.utilization}%`],
                ["Memory usage", `${selected.memory}%`],
                ["Temperature", `${selected.temperature}°C`],
                ["Power usage", `${selected.power}%`],
                ["Estimated hourly cost", money(selected.costPerHour)],
                ["Estimated daily cost", money(selected.costPerHour * 24)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    padding: 13,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      color: C.muted,
                      fontSize: 10,
                      marginBottom: 7,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 750,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 20,
              }}
            >
              <button
                type="button"
                onClick={() => setSelected(null)}
                style={{
                  ...buttonStyle,
                  background: C.blue,
                  color: "#fff",
                  borderColor: C.blue,
                }}
              >
                Close details
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
