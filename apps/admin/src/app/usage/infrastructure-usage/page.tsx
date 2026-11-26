
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Cloud,
  Cpu,
  Download,
  Gauge,
  HardDrive,
  MemoryStick,
  Network,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";

type ServiceStatus = "Operational" | "Degraded" | "Offline";

type InfrastructureService = {
  id: string;
  name: string;
  category: string;
  provider: string;
  region: string;
  instances: number;
  cpu: number;
  memory: number;
  storage: number;
  network: number;
  uptime: number;
  latency: number;
  monthlyCost: number;
  status: ServiceStatus;
};

const initialServices: InfrastructureService[] = [
  {
    id: "INF-001",
    name: "AI Gateway",
    category: "API Infrastructure",
    provider: "AWS",
    region: "us-east-1",
    instances: 8,
    cpu: 48,
    memory: 62,
    storage: 41,
    network: 58,
    uptime: 99.99,
    latency: 42,
    monthlyCost: 1840,
    status: "Operational",
  },
  {
    id: "INF-002",
    name: "Model Inference Service",
    category: "Compute",
    provider: "NVIDIA Cloud",
    region: "us-west-2",
    instances: 12,
    cpu: 82,
    memory: 78,
    storage: 56,
    network: 74,
    uptime: 99.95,
    latency: 86,
    monthlyCost: 6480,
    status: "Operational",
  },
  {
    id: "INF-003",
    name: "Knowledge Service",
    category: "Data Infrastructure",
    provider: "Google Cloud",
    region: "us-central1",
    instances: 6,
    cpu: 67,
    memory: 84,
    storage: 73,
    network: 48,
    uptime: 99.91,
    latency: 115,
    monthlyCost: 1320,
    status: "Degraded",
  },
  {
    id: "INF-004",
    name: "Vector Database",
    category: "Database",
    provider: "AWS",
    region: "ap-south-1",
    instances: 4,
    cpu: 39,
    memory: 58,
    storage: 68,
    network: 35,
    uptime: 99.98,
    latency: 28,
    monthlyCost: 960,
    status: "Operational",
  },
  {
    id: "INF-005",
    name: "Agent Orchestrator",
    category: "Compute",
    provider: "Azure",
    region: "eastus",
    instances: 5,
    cpu: 57,
    memory: 66,
    storage: 29,
    network: 62,
    uptime: 99.87,
    latency: 74,
    monthlyCost: 1180,
    status: "Operational",
  },
  {
    id: "INF-006",
    name: "Observability Pipeline",
    category: "Monitoring",
    provider: "AWS",
    region: "eu-west-1",
    instances: 3,
    cpu: 91,
    memory: 88,
    storage: 81,
    network: 86,
    uptime: 99.72,
    latency: 142,
    monthlyCost: 740,
    status: "Degraded",
  },
  {
    id: "INF-007",
    name: "Background Workers",
    category: "Compute",
    provider: "Google Cloud",
    region: "asia-south1",
    instances: 7,
    cpu: 23,
    memory: 34,
    storage: 22,
    network: 28,
    uptime: 99.96,
    latency: 53,
    monthlyCost: 580,
    status: "Operational",
  },
  {
    id: "INF-008",
    name: "Development Sandbox",
    category: "Development",
    provider: "Azure",
    region: "centralindia",
    instances: 0,
    cpu: 0,
    memory: 0,
    storage: 12,
    network: 0,
    uptime: 0,
    latency: 0,
    monthlyCost: 0,
    status: "Offline",
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
    maximumFractionDigits: 0,
  }).format(value);

const number = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

export default function InfrastructureUsagePage() {
  const [services] = useState(initialServices);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [providerFilter, setProviderFilter] = useState("All providers");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [sortBy, setSortBy] = useState("cpu");
  const [period, setPeriod] = useState("Last 24 hours");
  const [selected, setSelected] = useState<InfrastructureService | null>(null);
  const [refreshNotice, setRefreshNotice] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return services
      .filter((service) => {
        const matchesSearch =
          !query ||
          service.name.toLowerCase().includes(query) ||
          service.id.toLowerCase().includes(query) ||
          service.provider.toLowerCase().includes(query) ||
          service.region.toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === "All statuses" ||
          service.status === statusFilter;

        const matchesProvider =
          providerFilter === "All providers" ||
          service.provider === providerFilter;

        const matchesCategory =
          categoryFilter === "All categories" ||
          service.category === categoryFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesProvider &&
          matchesCategory
        );
      })
      .sort((a, b) => {
        if (sortBy === "memory") return b.memory - a.memory;
        if (sortBy === "storage") return b.storage - a.storage;
        if (sortBy === "network") return b.network - a.network;
        if (sortBy === "latency") return b.latency - a.latency;
        if (sortBy === "cost") return b.monthlyCost - a.monthlyCost;
        return b.cpu - a.cpu;
      });
  }, [
    services,
    search,
    statusFilter,
    providerFilter,
    categoryFilter,
    sortBy,
  ]);

  const metrics = useMemo(() => {
    const operational = filtered.filter(
      (service) => service.status !== "Offline"
    );
    const activeInstances = operational.reduce(
      (sum, service) => sum + service.instances,
      0
    );

    const weightedAverage = (key: "cpu" | "memory" | "storage" | "network") =>
      activeInstances
        ? operational.reduce(
            (sum, service) => sum + service[key] * service.instances,
            0
          ) / activeInstances
        : 0;

    return {
      totalServices: filtered.length,
      operational: filtered.filter(
        (service) => service.status === "Operational"
      ).length,
      degraded: filtered.filter(
        (service) => service.status === "Degraded"
      ).length,
      offline: filtered.filter((service) => service.status === "Offline")
        .length,
      instances: activeInstances,
      cpu: weightedAverage("cpu"),
      memory: weightedAverage("memory"),
      storage: weightedAverage("storage"),
      network: weightedAverage("network"),
      monthlyCost: filtered.reduce(
        (sum, service) => sum + service.monthlyCost,
        0
      ),
      averageUptime: operational.length
        ? operational.reduce((sum, service) => sum + service.uptime, 0) /
          operational.length
        : 0,
      averageLatency: operational.length
        ? operational.reduce((sum, service) => sum + service.latency, 0) /
          operational.length
        : 0,
    };
  }, [filtered]);

  const categorySummary = useMemo(() => {
    const groups: Record<string, { count: number; cost: number; instances: number }> =
      {};

    filtered.forEach((service) => {
      if (!groups[service.category]) {
        groups[service.category] = { count: 0, cost: 0, instances: 0 };
      }

      groups[service.category].count += 1;
      groups[service.category].cost += service.monthlyCost;
      groups[service.category].instances += service.instances;
    });

    return Object.entries(groups).sort((a, b) => b[1].cost - a[1].cost);
  }, [filtered]);

  const exportCsv = () => {
    const headers = [
      "ID",
      "Service",
      "Category",
      "Provider",
      "Region",
      "Instances",
      "CPU %",
      "Memory %",
      "Storage %",
      "Network %",
      "Uptime %",
      "Latency ms",
      "Monthly Cost USD",
      "Status",
    ];

    const rows = filtered.map((service) => [
      service.id,
      service.name,
      service.category,
      service.provider,
      service.region,
      service.instances,
      service.cpu,
      service.memory,
      service.storage,
      service.network,
      service.uptime,
      service.latency,
      service.monthlyCost,
      service.status,
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
    anchor.download = "modelnow-infrastructure-usage.csv";
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
    boxSizing: "border-box" as const,
    width: "100%",
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

  const statusStyle = (status: ServiceStatus) => {
    const colors = {
      Operational: { background: "#dcfce7", color: "#166534" },
      Degraded: { background: "#fef3c7", color: "#92400e" },
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
      ...colors[status],
    };
  };

  const utilizationColor = (value: number) => {
    if (value >= 85) return "#dc2626";
    if (value >= 70) return "#d97706";
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
              <span style={{ color: C.text }}>Infrastructure Usage</span>
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(25px, 3vw, 32px)",
                fontWeight: 750,
                letterSpacing: "-1px",
              }}
            >
              Infrastructure Usage
            </h1>
            <p
              style={{
                margin: "9px 0 0",
                color: C.muted,
                fontSize: 14,
                lineHeight: 1.6,
                maxWidth: 750,
              }}
            >
              Track service health, compute capacity, CPU and memory usage,
              storage, network activity, latency, and infrastructure spending.
            </p>
          </div>

          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              style={{ ...inputStyle, width: "auto", minWidth: 145 }}
              aria-label="Infrastructure reporting period"
            >
              <option>Last hour</option>
              <option>Last 24 hours</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
            <button
              type="button"
              onClick={() => setRefreshNotice(true)}
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

        {refreshNotice && (
          <div
            style={{
              marginBottom: 18,
              padding: 12,
              border: "1px solid #bfdbfe",
              borderRadius: 9,
              background: "#eff6ff",
              color: "#1d4ed8",
              fontSize: 12,
            }}
          >
            Demo infrastructure data refreshed. Connect monitoring and cloud
            provider APIs to display live metrics.
          </div>
        )}

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
            gap: 15,
            marginBottom: 22,
          }}
        >
          {[
            {
              label: "Infrastructure Services",
              value: number(metrics.totalServices),
              note: "Services matching current filters",
              icon: Server,
              color: "#315fea",
              bg: "#eef2ff",
            },
            {
              label: "Operational",
              value: number(metrics.operational),
              note: `${metrics.degraded} degraded · ${metrics.offline} offline`,
              icon: CheckCircle2,
              color: "#15803d",
              bg: "#dcfce7",
            },
            {
              label: "Active Instances",
              value: number(metrics.instances),
              note: "Across non-offline services",
              icon: Cpu,
              color: "#7c3aed",
              bg: "#f3e8ff",
            },
            {
              label: "CPU Utilization",
              value: `${metrics.cpu.toFixed(1)}%`,
              note: "Instance-weighted average",
              icon: Gauge,
              color: "#c2410c",
              bg: "#ffedd5",
            },
            {
              label: "Memory Utilization",
              value: `${metrics.memory.toFixed(1)}%`,
              note: "Instance-weighted average",
              icon: MemoryStick,
              color: "#0369a1",
              bg: "#e0f2fe",
            },
            {
              label: "Monthly Cost",
              value: money(metrics.monthlyCost),
              note: "Illustrative monthly estimate",
              icon: Cloud,
              color: "#6d28d9",
              bg: "#ede9fe",
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
                alignItems: "center",
                gap: 12,
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
                  Resource utilization
                </h2>
                <p
                  style={{
                    margin: "6px 0 0",
                    color: C.muted,
                    fontSize: 11,
                  }}
                >
                  Average usage across filtered services
                </p>
              </div>
              <Activity size={19} color={C.blue} />
            </div>

            {[
              { label: "CPU", value: metrics.cpu, icon: Cpu },
              { label: "Memory", value: metrics.memory, icon: MemoryStick },
              { label: "Storage", value: metrics.storage, icon: HardDrive },
              { label: "Network", value: metrics.network, icon: Network },
            ].map((resource) => {
              const Icon = resource.icon;

              return (
                <div key={resource.label} style={{ marginTop: 22 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 12,
                        fontWeight: 650,
                      }}
                    >
                      <Icon size={15} color={C.muted} />
                      {resource.label}
                    </span>
                    <strong
                      style={{
                        fontSize: 12,
                        color: utilizationColor(resource.value),
                      }}
                    >
                      {resource.value.toFixed(1)}%
                    </strong>
                  </div>
                  <div
                    style={{
                      height: 9,
                      background: "#eef0f5",
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${resource.value}%`,
                        height: "100%",
                        borderRadius: 10,
                        background: utilizationColor(resource.value),
                      }}
                    />
                  </div>
                </div>
              );
            })}

            <div
              style={{
                marginTop: 22,
                padding: 12,
                background: "#f9fafb",
                borderRadius: 9,
                color: C.muted,
                fontSize: 11,
                lineHeight: 1.6,
              }}
            >
              Resource averages are weighted by active instance count.
              Thresholds are illustrative and should be configured to match
              your production workloads.
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
                  Cost by infrastructure category
                </h2>
                <p
                  style={{
                    margin: "6px 0 0",
                    color: C.muted,
                    fontSize: 11,
                  }}
                >
                  Estimated monthly allocation
                </p>
              </div>
              <Zap size={19} color="#c2410c" />
            </div>

            {categorySummary.map(([category, details]) => {
              const percentage = metrics.monthlyCost
                ? (details.cost / metrics.monthlyCost) * 100
                : 0;

              return (
                <div key={category} style={{ marginTop: 21 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "center",
                      marginBottom: 8,
                      fontSize: 12,
                    }}
                  >
                    <strong>{category}</strong>
                    <span style={{ color: C.muted }}>
                      {money(details.cost)}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      background: "#eef0f5",
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${percentage}%`,
                        background: "#315fea",
                        borderRadius: 10,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      marginTop: 7,
                      color: C.muted,
                      fontSize: 10,
                    }}
                  >
                    {details.count} services · {details.instances} instances ·{" "}
                    {percentage.toFixed(1)}% of displayed cost
                  </div>
                </div>
              );
            })}

            <div
              style={{
                marginTop: 24,
                padding: 14,
                borderRadius: 10,
                background: "#f9fafb",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span
                style={{
                  width: 38,
                  height: 38,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 10,
                  background: "#eef2ff",
                  color: C.blue,
                  flexShrink: 0,
                }}
              >
                <Cloud size={18} />
              </span>
              <div>
                <div style={{ color: C.muted, fontSize: 11 }}>
                  Total estimated monthly cost
                </div>
                <div style={{ fontSize: 23, fontWeight: 750, marginTop: 4 }}>
                  {money(metrics.monthlyCost)}
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
                Infrastructure inventory
              </h2>
              <p
                style={{
                  margin: "6px 0 0",
                  color: C.muted,
                  fontSize: 12,
                }}
              >
                Service-level capacity and operational health
              </p>
            </div>

            <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
              <div style={{ position: "relative", width: "min(100%, 230px)" }}>
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
                  placeholder="Search services or regions..."
                  style={{ ...inputStyle, paddingLeft: 34 }}
                />
              </div>

              <select
                value={providerFilter}
                onChange={(event) => setProviderFilter(event.target.value)}
                style={{ ...inputStyle, width: "auto", maxWidth: 170 }}
                aria-label="Filter by cloud provider"
              >
                <option>All providers</option>
                {[...new Set(services.map((service) => service.provider))].map(
                  (provider) => (
                    <option key={provider}>{provider}</option>
                  )
                )}
              </select>

              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                style={{ ...inputStyle, width: "auto", maxWidth: 180 }}
                aria-label="Filter by infrastructure category"
              >
                <option>All categories</option>
                {[...new Set(services.map((service) => service.category))].map(
                  (category) => (
                    <option key={category}>{category}</option>
                  )
                )}
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                style={{ ...inputStyle, width: "auto" }}
                aria-label="Filter by service status"
              >
                <option>All statuses</option>
                <option>Operational</option>
                <option>Degraded</option>
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
              {filtered.length} services found
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
                <option value="cpu">CPU utilization</option>
                <option value="memory">Memory utilization</option>
                <option value="storage">Storage utilization</option>
                <option value="network">Network utilization</option>
                <option value="latency">Latency</option>
                <option value="cost">Monthly cost</option>
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
                    "Service",
                    "Category",
                    "Provider / Region",
                    "Instances",
                    "CPU",
                    "Memory",
                    "Storage",
                    "Network",
                    "Uptime",
                    "Latency",
                    "Monthly Cost",
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
                {filtered.map((service) => (
                  <tr key={service.id}>
                    <td
                      style={{
                        padding: 14,
                        borderBottom: `1px solid ${C.border}`,
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700 }}>
                        {service.name}
                      </div>
                      <div
                        style={{
                          marginTop: 4,
                          color: C.muted,
                          fontSize: 10,
                        }}
                      >
                        {service.id}
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
                      {service.category}
                    </td>
                    <td
                      style={{
                        padding: 14,
                        borderBottom: `1px solid ${C.border}`,
                      }}
                    >
                      <div style={{ fontSize: 11 }}>{service.provider}</div>
                      <div
                        style={{
                          marginTop: 4,
                          color: C.muted,
                          fontSize: 10,
                        }}
                      >
                        {service.region}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: 14,
                        borderBottom: `1px solid ${C.border}`,
                        fontSize: 11,
                      }}
                    >
                      {service.instances}
                    </td>
                    {[service.cpu, service.memory, service.storage, service.network].map(
                      (value, index) => (
                        <td
                          key={`${service.id}-${index}`}
                          style={{
                            padding: 14,
                            borderBottom: `1px solid ${C.border}`,
                            minWidth: 85,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 650,
                              marginBottom: 6,
                            }}
                          >
                            {value}%
                          </div>
                          <div
                            style={{
                              width: 55,
                              height: 5,
                              borderRadius: 10,
                              background: "#eef0f5",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${value}%`,
                                height: "100%",
                                background: utilizationColor(value),
                              }}
                            />
                          </div>
                        </td>
                      )
                    )}
                    <td
                      style={{
                        padding: 14,
                        borderBottom: `1px solid ${C.border}`,
                        fontSize: 11,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {service.uptime ? `${service.uptime}%` : "—"}
                    </td>
                    <td
                      style={{
                        padding: 14,
                        borderBottom: `1px solid ${C.border}`,
                        fontSize: 11,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {service.latency ? `${service.latency} ms` : "—"}
                    </td>
                    <td
                      style={{
                        padding: 14,
                        borderBottom: `1px solid ${C.border}`,
                        fontSize: 11,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {money(service.monthlyCost)}
                    </td>
                    <td
                      style={{
                        padding: 14,
                        borderBottom: `1px solid ${C.border}`,
                      }}
                    >
                      <span style={statusStyle(service.status)}>
                        {service.status === "Operational" ? (
                          <CheckCircle2 size={11} />
                        ) : (
                          <CircleAlert size={11} />
                        )}
                        {service.status}
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
                        onClick={() => setSelected(service)}
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
                      colSpan={13}
                      style={{
                        padding: 40,
                        textAlign: "center",
                        color: C.muted,
                        fontSize: 13,
                      }}
                    >
                      No infrastructure services match your filters.
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
            <span>{filtered.length} services displayed</span>
            <span>
              {metrics.instances} active instances ·{" "}
              {money(metrics.monthlyCost)} estimated monthly
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
          <strong>Demo data:</strong> Service health, resource usage, uptime,
          latency, instance counts, and costs are illustrative. The selected
          period is a display control; it does not query historical metrics.
          Connect your cloud providers and monitoring system for real-time
          infrastructure analytics.
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
            ["GPU Usage", "/usage/gpu-usage"],
            ["Cost Analytics", "/usage/cost-analytics"],
            ["Usage Trends", "/usage/usage-trends"],
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
            aria-labelledby="infrastructure-detail-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 620,
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
                  <Server size={21} />
                </span>
                <h2
                  id="infrastructure-detail-title"
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
                  {selected.id} · {selected.provider} · {selected.region}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                style={{ ...buttonStyle, padding: 8 }}
                aria-label="Close infrastructure details"
              >
                <X size={17} />
              </button>
            </div>

            <div style={{ marginTop: 18, marginBottom: 16 }}>
              <span style={statusStyle(selected.status)}>
                {selected.status === "Operational" ? (
                  <CheckCircle2 size={11} />
                ) : (
                  <CircleAlert size={11} />
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
                ["Category", selected.category],
                ["Provider", selected.provider],
                ["Region", selected.region],
                ["Instances", String(selected.instances)],
                ["CPU usage", `${selected.cpu}%`],
                ["Memory usage", `${selected.memory}%`],
                ["Storage usage", `${selected.storage}%`],
                ["Network usage", `${selected.network}%`],
                ["Uptime", selected.uptime ? `${selected.uptime}%` : "—"],
                ["Latency", selected.latency ? `${selected.latency} ms` : "—"],
                ["Monthly cost", money(selected.monthlyCost)],
                ["Estimated annual cost", money(selected.monthlyCost * 12)],
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
                marginTop: 18,
                padding: 12,
                borderRadius: 9,
                background: "#f9fafb",
                display: "flex",
                gap: 9,
                alignItems: "flex-start",
                color: C.muted,
                fontSize: 11,
                lineHeight: 1.6,
              }}
            >
              <ShieldCheck size={16} color={C.blue} />
              <span>
                These details use local sample records. Live health checks,
                logs, alerts, and provider billing require backend integration.
              </span>
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
