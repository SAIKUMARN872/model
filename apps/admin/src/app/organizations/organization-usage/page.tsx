
"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Download,
  Filter,
  Gauge,
  Layers3,
  RefreshCw,
  Search,
  Server,
  Sparkles,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";

type UsagePeriod = "24 hours" | "7 days" | "30 days" | "90 days";
type UsageService =
  | "Chat"
  | "Agents"
  | "Knowledge"
  | "Browser"
  | "Computer Use"
  | "Fine-tuning";

type UsageRecord = {
  id: string;
  service: UsageService;
  model: string;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  latency: number;
  status: "Healthy" | "Warning" | "Limited";
  updated: string;
};

const usageRecords: UsageRecord[] = [
  { id: "USG-1041", service: "Chat", model: "GPT-5", requests: 18420, inputTokens: 4280000, outputTokens: 1920000, cost: 148.42, latency: 680, status: "Healthy", updated: "2 min ago" },
  { id: "USG-1042", service: "Agents", model: "Claude Sonnet", requests: 8240, inputTokens: 2940000, outputTokens: 1360000, cost: 126.85, latency: 1120, status: "Healthy", updated: "4 min ago" },
  { id: "USG-1043", service: "Knowledge", model: "Gemini", requests: 12680, inputTokens: 3620000, outputTokens: 840000, cost: 76.31, latency: 490, status: "Healthy", updated: "5 min ago" },
  { id: "USG-1044", service: "Browser", model: "GPT-5", requests: 2160, inputTokens: 760000, outputTokens: 310000, cost: 42.72, latency: 1840, status: "Warning", updated: "8 min ago" },
  { id: "USG-1045", service: "Computer Use", model: "Claude Sonnet", requests: 980, inputTokens: 420000, outputTokens: 192000, cost: 38.16, latency: 2340, status: "Warning", updated: "12 min ago" },
  { id: "USG-1046", service: "Chat", model: "Llama", requests: 14800, inputTokens: 2180000, outputTokens: 1140000, cost: 18.64, latency: 390, status: "Healthy", updated: "14 min ago" },
  { id: "USG-1047", service: "Fine-tuning", model: "ModelNow Quality 12B", requests: 320, inputTokens: 185000, outputTokens: 94000, cost: 64.2, latency: 920, status: "Healthy", updated: "18 min ago" },
  { id: "USG-1048", service: "Agents", model: "GPT-5", requests: 4260, inputTokens: 1180000, outputTokens: 620000, cost: 54.8, latency: 890, status: "Limited", updated: "22 min ago" },
];

const dailyUsage = [
  { day: "Mon", requests: 18200, tokens: 4.1 },
  { day: "Tue", requests: 22400, tokens: 5.3 },
  { day: "Wed", requests: 19800, tokens: 4.8 },
  { day: "Thu", requests: 26700, tokens: 6.2 },
  { day: "Fri", requests: 29400, tokens: 7.1 },
  { day: "Sat", requests: 16200, tokens: 3.7 },
  { day: "Sun", requests: 23800, tokens: 5.6 },
];

const serviceUsage: {
  name: UsageService;
  requests: number;
  percentage: number;
  color: string;
}[] = [
  { name: "Chat", requests: 33220, percentage: 48, color: "#4169ed" },
  { name: "Knowledge", requests: 12680, percentage: 22, color: "#16a37a" },
  { name: "Agents", requests: 12500, percentage: 16, color: "#8b5cf6" },
  { name: "Browser", requests: 2160, percentage: 7, color: "#e9a23b" },
  { name: "Computer Use", requests: 980, percentage: 4, color: "#e26b79" },
  { name: "Fine-tuning", requests: 320, percentage: 3, color: "#64748b" },
];

const modelUsage = [
  { name: "GPT-5", requests: 22680, tokens: "6.76M", share: 42, color: "#4169ed" },
  { name: "Claude Sonnet", requests: 9220, tokens: "4.91M", share: 29, color: "#8b5cf6" },
  { name: "Gemini", requests: 12680, tokens: "4.46M", share: 20, color: "#16a37a" },
  { name: "Llama", requests: 14800, tokens: "3.32M", share: 9, color: "#e9a23b" },
];

const limits = [
  { label: "Monthly AI spend", used: 570.1, total: 1000, unit: "currency", detail: "$570.10 of $1,000.00" },
  { label: "Monthly requests", used: 82120, total: 150000, unit: "requests", detail: "82,120 of 150,000 requests" },
  { label: "Monthly token budget", used: 20.2, total: 30, unit: "tokens", detail: "20.2M of 30M tokens" },
];

const cardStyle: CSSProperties = {
  border: "1px solid #e7ebf3",
  borderRadius: 12,
  background: "#fff",
  minWidth: 0,
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatTokens(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return formatNumber(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function OrganizationUsagePage() {
  const [period, setPeriod] = useState<UsagePeriod>("30 days");
  const [serviceFilter, setServiceFilter] = useState("All services");
  const [modelFilter, setModelFilter] = useState("All models");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<UsageRecord | null>(null);
  const [refreshMessage, setRefreshMessage] = useState("");
  const [showAllServices, setShowAllServices] = useState(false);

  const filteredRecords = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return usageRecords.filter((record) => {
      const matchesService = serviceFilter === "All services" || record.service === serviceFilter;
      const matchesModel = modelFilter === "All models" || record.model === modelFilter;
      const matchesStatus = statusFilter === "All statuses" || record.status === statusFilter;
      const matchesSearch =
        !normalizedSearch ||
        [record.id, record.service, record.model, record.status]
          .some((value) => value.toLowerCase().includes(normalizedSearch));

      return matchesService && matchesModel && matchesStatus && matchesSearch;
    });
  }, [search, serviceFilter, modelFilter, statusFilter]);

  const periodMultiplier: Record<UsagePeriod, number> = {
    "24 hours": 0.035,
    "7 days": 0.24,
    "30 days": 1,
    "90 days": 2.7,
  };

  const multiplier = periodMultiplier[period];
  const totalRequests = Math.round(82120 * multiplier);
  const totalTokens = 20_200_000 * multiplier;
  const totalCost = 570.1 * multiplier;
  const avgLatency = period === "24 hours" ? 720 : 840;
  const activeServices = 6;
  const displayedServices = showAllServices ? serviceUsage : serviceUsage.slice(0, 4);

  function exportCsv() {
    const headers = ["Usage ID", "Service", "Model", "Requests", "Input tokens", "Output tokens", "Cost USD", "Latency ms", "Status"];
    const rows = filteredRecords.map((record) => [
      record.id,
      record.service,
      record.model,
      record.requests,
      record.inputTokens,
      record.outputTokens,
      record.cost.toFixed(2),
      record.latency,
      record.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-organization-usage.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setRefreshMessage("Usage report exported.");
  }

  function refreshPreview() {
    setRefreshMessage("Preview refreshed. Connect the usage API to load live organization metrics.");
  }

  const statusClass = (status: UsageRecord["status"]) =>
    status === "Healthy" ? "healthy" : status === "Warning" ? "warning" : "limited";

  return (
    <main className="org-usage-page">
      <style>{`
        .org-usage-page { min-height: 100vh; padding: 28px; background: #f7f8fc; color: #182238; font-family: Arial, Helvetica, sans-serif; }
        .org-usage-container { max-width: 1450px; margin: 0 auto; }
        .org-usage-breadcrumb { margin-bottom: 14px; color: #8993a6; font-size: 12px; }
        .org-usage-breadcrumb span { color: #315fe8; }
        .org-usage-header { display:flex; justify-content:space-between; align-items:flex-start; gap:18px; flex-wrap:wrap; margin-bottom:23px; }
        .org-usage-title { margin:0 0 8px; font-size:27px; font-weight:750; letter-spacing:-.7px; }
        .org-usage-subtitle { margin:0; color:#818ca0; font-size:12px; line-height:1.7; }
        .org-usage-actions { display:flex; gap:9px; flex-wrap:wrap; }
        .org-usage-btn { display:inline-flex; align-items:center; justify-content:center; gap:7px; padding:10px 12px; border:1px solid #dfe5ef; border-radius:8px; background:#fff; color:#46536a; font-size:11px; font-weight:650; cursor:pointer; }
        .org-usage-btn:hover { background:#f2f5fc; }
        .org-usage-btn.primary { background:#315fe8; color:#fff; border-color:#315fe8; }
        .org-usage-period { display:flex; align-items:center; gap:3px; padding:4px; border:1px solid #e3e8f1; border-radius:9px; background:#fff; }
        .org-usage-period button { padding:7px 9px; border:0; border-radius:6px; background:transparent; color:#78849a; font-size:10px; cursor:pointer; }
        .org-usage-period button.active { background:#edf2ff; color:#315fe8; font-weight:750; }
        .org-usage-banner { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:12px 15px; margin-bottom:18px; border:1px solid #dfe7ff; border-radius:9px; background:#f2f5ff; color:#59698c; font-size:11px; line-height:1.6; }
        .org-usage-banner strong { color:#2d477f; }
        .org-usage-banner button { border:0; background:transparent; color:#6477a1; cursor:pointer; }
        .org-usage-kpis { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; margin-bottom:18px; }
        .org-usage-kpi { padding:17px; border:1px solid #e7ebf3; border-radius:12px; background:#fff; min-width:0; }
        .org-usage-kpi-top { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:17px; }
        .org-usage-kpi-label { color:#7e8a9f; font-size:11px; }
        .org-usage-kpi-icon { display:grid; place-items:center; width:34px; height:34px; border-radius:9px; background:#edf2ff; color:#315fe8; }
        .org-usage-kpi-value { margin-bottom:8px; font-size:25px; font-weight:750; letter-spacing:-.6px; overflow-wrap:anywhere; }
        .org-usage-kpi-bottom { display:flex; align-items:center; gap:5px; color:#8993a6; font-size:10px; line-height:1.6; }
        .org-usage-up { color:#14875b; font-weight:700; }
        .org-usage-down { color:#cb7a32; font-weight:700; }
        .org-usage-grid { display:grid; grid-template-columns:minmax(0,1.6fr) minmax(290px,1fr); gap:17px; margin-bottom:18px; }
        .org-usage-card { min-width:0; border:1px solid #e7ebf3; border-radius:12px; background:#fff; overflow:hidden; }
        .org-usage-card-header { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; padding:19px 20px; border-bottom:1px solid #edf0f5; }
        .org-usage-card-title { margin:0 0 6px; font-size:13px; font-weight:750; }
        .org-usage-card-description { margin:0; color:#8993a6; font-size:10px; line-height:1.6; }
        .org-usage-card-body { padding:20px; }
        .org-usage-legend { display:flex; flex-wrap:wrap; gap:13px; margin-bottom:18px; }
        .org-usage-legend-item { display:flex; align-items:center; gap:6px; color:#7d899d; font-size:10px; }
        .org-usage-dot { width:8px; height:8px; border-radius:3px; }
        .org-usage-chart { display:flex; align-items:flex-end; gap:12px; height:175px; padding:10px 0 0; border-bottom:1px solid #e9edf4; background:repeating-linear-gradient(to bottom,transparent 0,transparent 42px,#edf0f6 43px,#edf0f6 44px); }
        .org-usage-chart-col { display:flex; flex:1; min-width:0; height:100%; flex-direction:column; align-items:center; justify-content:flex-end; gap:8px; }
        .org-usage-bars { display:flex; align-items:flex-end; justify-content:center; gap:4px; width:100%; height:calc(100% - 21px); }
        .org-usage-bar { width:33%; max-width:22px; min-width:5px; border-radius:4px 4px 0 0; transition:height .2s; }
        .org-usage-chart-label { color:#8993a6; font-size:10px; padding-bottom:8px; }
        .org-usage-model-row { margin-bottom:17px; }
        .org-usage-model-row:last-child { margin-bottom:0; }
        .org-usage-model-top { display:flex; justify-content:space-between; gap:10px; margin-bottom:8px; color:#46536a; font-size:11px; }
        .org-usage-model-name { display:flex; align-items:center; gap:7px; font-weight:650; }
        .org-usage-model-count { color:#7e8a9f; white-space:nowrap; }
        .org-usage-progress { height:7px; border-radius:20px; background:#edf0f6; overflow:hidden; }
        .org-usage-progress-fill { height:100%; border-radius:20px; }
        .org-usage-service-list { display:grid; gap:16px; }
        .org-usage-service-top { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:7px; font-size:11px; }
        .org-usage-service-name { display:flex; align-items:center; gap:8px; color:#46536a; font-weight:650; }
        .org-usage-service-value { color:#8490a4; font-size:10px; white-space:nowrap; }
        .org-usage-limits { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; margin-bottom:18px; }
        .org-usage-limit { padding:18px; border:1px solid #e7ebf3; border-radius:12px; background:#fff; }
        .org-usage-limit-title { margin-bottom:12px; color:#69768d; font-size:11px; font-weight:650; }
        .org-usage-limit-value { margin-bottom:12px; font-size:19px; font-weight:750; overflow-wrap:anywhere; }
        .org-usage-limit-meta { display:flex; justify-content:space-between; gap:8px; margin-top:8px; color:#8792a5; font-size:10px; }
        .org-usage-table-card { border:1px solid #e7ebf3; border-radius:12px; background:#fff; overflow:hidden; }
        .org-usage-table-toolbar { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; padding:17px 20px; border-bottom:1px solid #edf0f5; }
        .org-usage-search { display:flex; align-items:center; gap:8px; width:245px; max-width:100%; padding:9px 11px; border:1px solid #dfe5ef; border-radius:8px; color:#8993a6; }
        .org-usage-search input { width:100%; border:0; outline:none; background:transparent; color:#263248; font-size:11px; }
        .org-usage-filter-row { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .org-usage-select { max-width:100%; padding:9px 10px; border:1px solid #dfe5ef; border-radius:8px; background:#fff; color:#536078; font-size:10px; }
        .org-usage-table-wrap { overflow-x:auto; }
        .org-usage-table { width:100%; border-collapse:collapse; white-space:nowrap; }
        .org-usage-table th { padding:12px 15px; background:#fafbfe; color:#8993a6; font-size:9px; font-weight:750; text-align:left; text-transform:uppercase; letter-spacing:.45px; }
        .org-usage-table td { padding:14px 15px; border-top:1px solid #edf0f5; color:#536078; font-size:10px; }
        .org-usage-table tbody tr:hover { background:#fafbff; }
        .org-usage-id { color:#315fe8; font-weight:700; }
        .org-usage-status { display:inline-flex; align-items:center; gap:5px; padding:5px 8px; border-radius:20px; font-size:9px; font-weight:750; }
        .org-usage-status.healthy { background:#eaf8ef; color:#187747; }
        .org-usage-status.warning { background:#fff4df; color:#98621a; }
        .org-usage-status.limited { background:#fff0f0; color:#b53e42; }
        .org-usage-detail-btn { padding:6px 9px; border:1px solid #e0e6f0; border-radius:6px; background:#fff; color:#536078; cursor:pointer; font-size:10px; }
        .org-usage-empty { padding:35px 15px !important; text-align:center; color:#8993a6 !important; }
        .org-usage-table-footer { display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; padding:13px 20px; border-top:1px solid #edf0f5; color:#8993a6; font-size:10px; }
        .org-usage-modal-backdrop { position:fixed; inset:0; z-index:100; display:grid; place-items:center; padding:18px; background:#0f172a7a; }
        .org-usage-modal { width:100%; max-width:490px; border-radius:13px; background:#fff; overflow:hidden; }
        .org-usage-modal-header { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:19px 21px; border-bottom:1px solid #edf0f5; }
        .org-usage-modal-header h2 { margin:0; font-size:15px; }
        .org-usage-modal-close { display:grid; place-items:center; width:30px; height:30px; border:0; border-radius:7px; background:#f3f5fa; cursor:pointer; }
        .org-usage-modal-body { padding:21px; }
        .org-usage-detail-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:13px; }
        .org-usage-detail-item { padding:12px; border:1px solid #edf0f5; border-radius:8px; }
        .org-usage-detail-label { margin-bottom:7px; color:#8993a6; font-size:10px; }
        .org-usage-detail-value { color:#263248; font-size:13px; font-weight:750; overflow-wrap:anywhere; }
        .org-usage-disclaimer { padding:13px 15px; margin-top:17px; border:1px solid #f0dfbd; border-radius:9px; background:#fff9ed; color:#87621f; font-size:10px; line-height:1.7; }
        @media(max-width:1050px) { .org-usage-kpis { grid-template-columns:repeat(2,minmax(0,1fr)); } .org-usage-grid { grid-template-columns:1fr; } }
        @media(max-width:650px) { .org-usage-page { padding:15px; } .org-usage-title { font-size:23px; } .org-usage-kpis { grid-template-columns:1fr 1fr; gap:9px; } .org-usage-kpi { padding:13px; } .org-usage-kpi-value { font-size:20px; } .org-usage-limits { grid-template-columns:1fr; } .org-usage-card-header,.org-usage-card-body { padding:15px; } .org-usage-table-toolbar { padding:14px; } .org-usage-search { width:100%; } .org-usage-table-footer { padding:13px; } .org-usage-banner { align-items:flex-start; } }
      `}</style>

      <div className="org-usage-container">
        <div className="org-usage-breadcrumb">Organizations / <span>Usage</span></div>

        <header className="org-usage-header">
          <div>
            <h1 className="org-usage-title">Organization Usage</h1>
            <p className="org-usage-subtitle">
              Monitor AI consumption, model requests, cost, latency, and service utilization.
            </p>
          </div>
          <div className="org-usage-actions">
            <div className="org-usage-period" aria-label="Usage reporting period">
              {(["24 hours", "7 days", "30 days", "90 days"] as UsagePeriod[]).map((item) => (
                <button key={item} className={period === item ? "active" : ""} onClick={() => setPeriod(item)}>
                  {item}
                </button>
              ))}
            </div>
            <button className="org-usage-btn" onClick={refreshPreview}><RefreshCw size={13} /> Refresh</button>
            <button className="org-usage-btn primary" onClick={exportCsv}><Download size={13} /> Export CSV</button>
          </div>
        </header>

        {refreshMessage && (
          <div className="org-usage-banner" role="status">
            <span><CheckCircle2 size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 7 }} />{refreshMessage}</span>
            <button onClick={() => setRefreshMessage("")} aria-label="Dismiss message"><X size={14} /></button>
          </div>
        )}

        <div className="org-usage-banner">
          <span><Activity size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: 8 }} /><strong>Sample organization data:</strong> These metrics are illustrative UI values, not live usage or verified billing records.</span>
          <span>{period} <CalendarDays size={13} style={{ display: "inline", verticalAlign: "middle", marginLeft: 5 }} /></span>
        </div>

        <section className="org-usage-kpis">
          <div className="org-usage-kpi">
            <div className="org-usage-kpi-top"><span className="org-usage-kpi-label">Total requests</span><div className="org-usage-kpi-icon"><Zap size={17} /></div></div>
            <div className="org-usage-kpi-value">{formatNumber(totalRequests)}</div>
            <div className="org-usage-kpi-bottom"><ArrowUpRight size={13} className="org-usage-up" /><span className="org-usage-up">12.8%</span> vs previous period</div>
          </div>
          <div className="org-usage-kpi">
            <div className="org-usage-kpi-top"><span className="org-usage-kpi-label">Tokens processed</span><div className="org-usage-kpi-icon"><Layers3 size={17} /></div></div>
            <div className="org-usage-kpi-value">{formatTokens(totalTokens)}</div>
            <div className="org-usage-kpi-bottom"><ArrowUpRight size={13} className="org-usage-up" /><span className="org-usage-up">8.4%</span> vs previous period</div>
          </div>
          <div className="org-usage-kpi">
            <div className="org-usage-kpi-top"><span className="org-usage-kpi-label">Estimated AI cost</span><div className="org-usage-kpi-icon"><CircleDollarSign size={17} /></div></div>
            <div className="org-usage-kpi-value">{formatCurrency(totalCost)}</div>
            <div className="org-usage-kpi-bottom"><ArrowDownRight size={13} className="org-usage-up" /><span className="org-usage-up">4.2%</span> vs previous period</div>
          </div>
          <div className="org-usage-kpi">
            <div className="org-usage-kpi-top"><span className="org-usage-kpi-label">Average latency</span><div className="org-usage-kpi-icon"><Clock3 size={17} /></div></div>
            <div className="org-usage-kpi-value">{formatNumber(avgLatency)} <span style={{ fontSize: 12, color: "#8993a6", fontWeight: 500 }}>ms</span></div>
            <div className="org-usage-kpi-bottom"><ArrowDownRight size={13} className="org-usage-up" /><span className="org-usage-up">6.1%</span> faster than previous period</div>
          </div>
        </section>

        <section className="org-usage-grid">
          <div className="org-usage-card">
            <div className="org-usage-card-header">
              <div><h2 className="org-usage-card-title">Usage trends</h2><p className="org-usage-card-description">Daily request volume and token consumption · sample 7-day breakdown</p></div>
              <BarChart3 size={18} color="#7e8ca5" />
            </div>
            <div className="org-usage-card-body">
              <div className="org-usage-legend">
                <div className="org-usage-legend-item"><span className="org-usage-dot" style={{ background: "#4169ed" }} />Requests</div>
                <div className="org-usage-legend-item"><span className="org-usage-dot" style={{ background: "#16a37a" }} />Tokens (millions)</div>
              </div>
              <div className="org-usage-chart">
                {dailyUsage.map((item) => (
                  <div className="org-usage-chart-col" key={item.day}>
                    <div className="org-usage-bars">
                      <div className="org-usage-bar" title={`${formatNumber(item.requests)} requests`} style={{ height: `${(item.requests / 30000) * 100}%`, background: "#4169ed" }} />
                      <div className="org-usage-bar" title={`${item.tokens}M tokens`} style={{ height: `${(item.tokens / 8) * 100}%`, background: "#16a37a" }} />
                    </div>
                    <span className="org-usage-chart-label">{item.day}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 15, color: "#8993a6", fontSize: 10 }}>
                <span>Daily activity</span><span>Peak: Friday</span>
              </div>
            </div>
          </div>

          <div className="org-usage-card">
            <div className="org-usage-card-header">
              <div><h2 className="org-usage-card-title">Model consumption</h2><p className="org-usage-card-description">Share of illustrative model usage</p></div>
              <Sparkles size={18} color="#7e8ca5" />
            </div>
            <div className="org-usage-card-body">
              {modelUsage.map((model) => (
                <div className="org-usage-model-row" key={model.name}>
                  <div className="org-usage-model-top">
                    <span className="org-usage-model-name"><span className="org-usage-dot" style={{ background: model.color }} />{model.name}</span>
                    <span className="org-usage-model-count">{model.tokens} tokens</span>
                  </div>
                  <div className="org-usage-progress"><div className="org-usage-progress-fill" style={{ width: `${model.share}%`, background: model.color }} /></div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, color: "#929bad", fontSize: 9 }}>
                    <span>{formatNumber(model.requests)} requests</span><span>{model.share}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="org-usage-grid">
          <div className="org-usage-card">
            <div className="org-usage-card-header">
              <div><h2 className="org-usage-card-title">Service utilization</h2><p className="org-usage-card-description">Request distribution across organization services</p></div>
              <Server size={17} color="#7e8ca5" />
            </div>
            <div className="org-usage-card-body">
              <div className="org-usage-service-list">
                {displayedServices.map((service) => (
                  <div key={service.name}>
                    <div className="org-usage-service-top">
                      <span className="org-usage-service-name"><span className="org-usage-dot" style={{ background: service.color }} />{service.name}</span>
                      <span className="org-usage-service-value">{formatNumber(service.requests)} requests · {service.percentage}%</span>
                    </div>
                    <div className="org-usage-progress"><div className="org-usage-progress-fill" style={{ width: `${service.percentage}%`, background: service.color }} /></div>
                  </div>
                ))}
              </div>
              <button className="org-usage-btn" style={{ width: "100%", marginTop: 20 }} onClick={() => setShowAllServices((value) => !value)}>
                {showAllServices ? "Show fewer services" : "View all services"} <ChevronDown size={13} style={{ transform: showAllServices ? "rotate(180deg)" : undefined }} />
              </button>
            </div>
          </div>

          <div className="org-usage-card">
            <div className="org-usage-card-header">
              <div><h2 className="org-usage-card-title">Usage limits</h2><p className="org-usage-card-description">Illustrative monthly budget and consumption</p></div>
              <Gauge size={18} color="#7e8ca5" />
            </div>
            <div className="org-usage-card-body">
              {limits.map((limit) => {
                const percentage = Math.min(100, (limit.used / limit.total) * 100);
                const color = percentage >= 85 ? "#d94e52" : percentage >= 65 ? "#e9a23b" : "#16a37a";
                return (
                  <div className="org-usage-model-row" key={limit.label}>
                    <div className="org-usage-model-top"><span>{limit.label}</span><strong style={{ color: "#34415a" }}>{Math.round(percentage)}%</strong></div>
                    <div className="org-usage-progress"><div className="org-usage-progress-fill" style={{ width: `${percentage}%`, background: color }} /></div>
                    <div style={{ marginTop: 6, color: "#8993a6", fontSize: 10 }}>{limit.detail}</div>
                  </div>
                );
              })}
              <div className="org-usage-disclaimer">Usage limits shown here are examples. They do not block requests or trigger billing alerts until connected to backend enforcement.</div>
            </div>
          </div>
        </section>

        <section className="org-usage-table-card">
          <div className="org-usage-card-header">
            <div><h2 className="org-usage-card-title">Usage records</h2><p className="org-usage-card-description">Search and inspect sample service-level usage records.</p></div>
            <span style={{ color: "#8993a6", fontSize: 10 }}>{filteredRecords.length} records</span>
          </div>
          <div className="org-usage-table-toolbar">
            <div className="org-usage-search"><Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search service, model, ID..." /></div>
            <div className="org-usage-filter-row">
              <button className="org-usage-btn" onClick={() => setShowFilters((value) => !value)}><Filter size={13} /> Filters</button>
              <select className="org-usage-select" value={serviceFilter} onChange={(event) => setServiceFilter(event.target.value)}>
                {["All services", "Chat", "Agents", "Knowledge", "Browser", "Computer Use", "Fine-tuning"].map((value) => <option key={value}>{value}</option>)}
              </select>
              <select className="org-usage-select" value={modelFilter} onChange={(event) => setModelFilter(event.target.value)}>
                {["All models", "GPT-5", "Claude Sonnet", "Gemini", "Llama", "ModelNow Quality 12B"].map((value) => <option key={value}>{value}</option>)}
              </select>
              {showFilters && (
                <>
                  <select className="org-usage-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                    {["All statuses", "Healthy", "Warning", "Limited"].map((value) => <option key={value}>{value}</option>)}
                  </select>
                  <button className="org-usage-btn" onClick={() => { setServiceFilter("All services"); setModelFilter("All models"); setStatusFilter("All statuses"); setSearch(""); }}>Clear</button>
                </>
              )}
            </div>
          </div>
          <div className="org-usage-table-wrap">
            <table className="org-usage-table">
              <thead>
                <tr>
                  <th>Usage ID</th><th>Service</th><th>Model</th><th>Requests</th><th>Input tokens</th><th>Output tokens</th><th>Cost</th><th>Latency</th><th>Status</th><th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td><span className="org-usage-id">{record.id}</span></td>
                    <td>{record.service}</td>
                    <td>{record.model}</td>
                    <td>{formatNumber(record.requests)}</td>
                    <td>{formatTokens(record.inputTokens)}</td>
                    <td>{formatTokens(record.outputTokens)}</td>
                    <td>{formatCurrency(record.cost)}</td>
                    <td>{formatNumber(record.latency)} ms</td>
                    <td><span className={`org-usage-status ${statusClass(record.status)}`}><span className="org-usage-dot" style={{ background: "currentColor", width: 6, height: 6 }} />{record.status}</span></td>
                    <td><button className="org-usage-detail-btn" onClick={() => setSelectedRecord(record)}>View</button></td>
                  </tr>
                ))}
                {filteredRecords.length === 0 && <tr><td colSpan={10} className="org-usage-empty">No usage records match these filters.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="org-usage-table-footer">
            <span>Showing {filteredRecords.length} of {usageRecords.length} sample records</span>
            <span>Currency: USD · Tokens are illustrative</span>
          </div>
        </section>

        {selectedRecord && (
          <div className="org-usage-modal-backdrop" onClick={() => setSelectedRecord(null)}>
            <section className="org-usage-modal" role="dialog" aria-modal="true" aria-labelledby="org-usage-detail-title" onClick={(event) => event.stopPropagation()}>
              <div className="org-usage-modal-header">
                <h2 id="org-usage-detail-title">Usage record details</h2>
                <button className="org-usage-modal-close" onClick={() => setSelectedRecord(null)} aria-label="Close details"><X size={15} /></button>
              </div>
              <div className="org-usage-modal-body">
                <div style={{ marginBottom: 17, color: "#315fe8", fontSize: 11, fontWeight: 750 }}>{selectedRecord.id}</div>
                <div className="org-usage-detail-grid">
                  <div className="org-usage-detail-item"><div className="org-usage-detail-label">Service</div><div className="org-usage-detail-value">{selectedRecord.service}</div></div>
                  <div className="org-usage-detail-item"><div className="org-usage-detail-label">Model</div><div className="org-usage-detail-value">{selectedRecord.model}</div></div>
                  <div className="org-usage-detail-item"><div className="org-usage-detail-label">Requests</div><div className="org-usage-detail-value">{formatNumber(selectedRecord.requests)}</div></div>
                  <div className="org-usage-detail-item"><div className="org-usage-detail-label">Estimated cost</div><div className="org-usage-detail-value">{formatCurrency(selectedRecord.cost)}</div></div>
                  <div className="org-usage-detail-item"><div className="org-usage-detail-label">Input tokens</div><div className="org-usage-detail-value">{formatNumber(selectedRecord.inputTokens)}</div></div>
                  <div className="org-usage-detail-item"><div className="org-usage-detail-label">Output tokens</div><div className="org-usage-detail-value">{formatNumber(selectedRecord.outputTokens)}</div></div>
                  <div className="org-usage-detail-item"><div className="org-usage-detail-label">Average latency</div><div className="org-usage-detail-value">{formatNumber(selectedRecord.latency)} ms</div></div>
                  <div className="org-usage-detail-item"><div className="org-usage-detail-label">Status</div><div className="org-usage-detail-value">{selectedRecord.status}</div></div>
                </div>
                <div className="org-usage-disclaimer"><Clock3 size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: 5 }} />Last sample update: {selectedRecord.updated}. This is demonstration data and is not a live event timestamp.</div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
