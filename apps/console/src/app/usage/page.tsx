
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowDownToLine,
  CheckCircle2,
  Clock3,
  Database,
  DollarSign,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";

type UsageRecord = {
  id: string;
  date: string;
  model: string;
  provider: string;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  status: "success" | "failed" | "pending";
};

const DEMO_RECORDS: UsageRecord[] = [
  {
    id: "USG-1001",
    date: "2026-11-17 10:42",
    model: "GPT-4o",
    provider: "OpenAI",
    requests: 1250,
    inputTokens: 245000,
    outputTokens: 128000,
    totalTokens: 373000,
    costUsd: 12.45,
    status: "success",
  },
  {
    id: "USG-1002",
    date: "2026-11-17 10:15",
    model: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    requests: 840,
    inputTokens: 182000,
    outputTokens: 95000,
    totalTokens: 277000,
    costUsd: 9.82,
    status: "success",
  },
  {
    id: "USG-1003",
    date: "2026-11-17 09:50",
    model: "Gemini 2.0 Flash",
    provider: "Google",
    requests: 2100,
    inputTokens: 310000,
    outputTokens: 165000,
    totalTokens: 475000,
    costUsd: 5.36,
    status: "success",
  },
  {
    id: "USG-1004",
    date: "2026-11-17 09:22",
    model: "GPT-4o-mini",
    provider: "OpenAI",
    requests: 1680,
    inputTokens: 220000,
    outputTokens: 110000,
    totalTokens: 330000,
    costUsd: 3.25,
    status: "success",
  },
  {
    id: "USG-1005",
    date: "2026-11-17 08:55",
    model: "Llama 3.3 70B",
    provider: "Together AI",
    requests: 520,
    inputTokens: 98000,
    outputTokens: 54000,
    totalTokens: 152000,
    costUsd: 2.18,
    status: "pending",
  },
  {
    id: "USG-1006",
    date: "2026-11-16 18:40",
    model: "GPT-4o",
    provider: "OpenAI",
    requests: 920,
    inputTokens: 190000,
    outputTokens: 87000,
    totalTokens: 277000,
    costUsd: 8.15,
    status: "success",
  },
  {
    id: "USG-1007",
    date: "2026-11-16 17:30",
    model: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    requests: 340,
    inputTokens: 76000,
    outputTokens: 39000,
    totalTokens: 115000,
    costUsd: 4.12,
    status: "failed",
  },
  {
    id: "USG-1008",
    date: "2026-11-16 16:15",
    model: "Gemini 2.0 Flash",
    provider: "Google",
    requests: 1450,
    inputTokens: 280000,
    outputTokens: 140000,
    totalTokens: 420000,
    costUsd: 4.75,
    status: "success",
  },
];

const numberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const currencyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

function formatNumber(value: number) {
  return numberFormat.format(value);
}

function formatCurrency(value: number) {
  return currencyFormat.format(value);
}

function downloadCSV(records: UsageRecord[]) {
  if (!records.length) return;

  const columns: (keyof UsageRecord)[] = [
    "id",
    "date",
    "model",
    "provider",
    "requests",
    "inputTokens",
    "outputTokens",
    "totalTokens",
    "costUsd",
    "status",
  ];

  const escapeCSV = (value: unknown) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const header = columns.map(escapeCSV).join(",");

  const rows = records.map((record) =>
    columns.map((column) => escapeCSV(record[column])).join(",")
  );

  const csv = "\uFEFF" + [header, ...rows].join("\r\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `modelnow-usage-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function UsagePage() {
  const [records, setRecords] = useState<UsageRecord[]>(() =>
    DEMO_RECORDS.map((record) => ({ ...record }))
  );

  const [query, setQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Keep the initial value identical during server and client rendering.
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    setLastRefreshed(new Date());
  }, []);

  const models = useMemo(
    () => [...new Set(records.map((record) => record.model))],
    [records]
  );

  const filteredRecords = useMemo(() => {
    const search = query.trim().toLowerCase();

    return records.filter((record) => {
      const matchesSearch =
        !search ||
        Object.values(record).some((value) =>
          String(value).toLowerCase().includes(search)
        );

      const matchesModel =
        selectedModel === "all" || record.model === selectedModel;

      const matchesStatus =
        selectedStatus === "all" || record.status === selectedStatus;

      return matchesSearch && matchesModel && matchesStatus;
    });
  }, [records, query, selectedModel, selectedStatus]);

  const totals = useMemo(
    () =>
      records.reduce(
        (result, record) => ({
          requests: result.requests + record.requests,
          tokens: result.tokens + record.totalTokens,
          cost: result.cost + record.costUsd,
        }),
        { requests: 0, tokens: 0, cost: 0 }
      ),
    [records]
  );

  const hasFilters =
    query.trim() !== "" ||
    selectedModel !== "all" ||
    selectedStatus !== "all";

  const clearFilters = () => {
    setQuery("");
    setSelectedModel("all");
    setSelectedStatus("all");
  };

  const handleRefresh = () => {
    if (refreshing) return;

    setRefreshing(true);

    setRecords(DEMO_RECORDS.map((record) => ({ ...record })));
    clearFilters();
    setLastRefreshed(new Date());
    setNotification("Demo usage records refreshed successfully.");

    window.setTimeout(() => {
      setRefreshing(false);
    }, 450);
  };

  const handleExport = () => {
    if (!filteredRecords.length) return;

    downloadCSV(filteredRecords);

    setNotification(
      `${filteredRecords.length} usage records exported successfully.`
    );
  };

  const statCards = [
    {
      label: "Total requests",
      value: formatNumber(totals.requests),
      description: "Total reported demo requests",
      icon: Activity,
      color: "blue",
    },
    {
      label: "Total tokens",
      value: formatNumber(totals.tokens),
      description: "Input and output tokens",
      icon: Zap,
      color: "purple",
    },
    {
      label: "Total cost",
      value: formatCurrency(totals.cost),
      description: "Illustrative cost in USD",
      icon: DollarSign,
      color: "green",
    },
    {
      label: "Usage records",
      value: formatNumber(records.length),
      description: "Local demonstration records",
      icon: Database,
      color: "orange",
    },
  ];

  return (
    <div className="usage-page">
      <style jsx>{`
        .usage-page {
          --usage-border: var(--border, #e5e7eb);
          --usage-muted: var(--muted-foreground, #71717a);
          --usage-text: var(--foreground, #18181b);
          color: var(--usage-text);
          width: 100%;
          max-width: 100%;
          padding-bottom: 28px;
        }

        .usage-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 28px;
        }

        .eyebrow {
          color: #64748b;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.3px;
          margin-bottom: 9px;
        }

        .usage-header h1 {
          font-size: 27px;
          line-height: 1.25;
          letter-spacing: -0.8px;
          font-weight: 750;
          margin: 0;
        }

        .subtitle {
          font-size: 13px;
          color: var(--usage-muted);
          margin: 8px 0 0;
          line-height: 1.6;
        }

        .header-actions {
          display: flex;
          gap: 9px;
          align-items: center;
        }

        .action-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 38px;
          padding: 0 14px;
          border: 1px solid var(--usage-border);
          border-radius: 8px;
          background: var(--card, #fff);
          color: var(--usage-text);
          font-size: 12px;
          font-weight: 650;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .action-button:hover:not(:disabled) {
          background: var(--muted, #f4f4f5);
          border-color: #a1a1aa;
          transform: translateY(-1px);
        }

        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .primary-button {
          background: #315fe9;
          color: white;
          border-color: #315fe9;
        }

        .primary-button:hover:not(:disabled) {
          background: #254bc5;
          border-color: #254bc5;
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }

        .section-heading h2 {
          font-size: 15px;
          font-weight: 750;
          margin: 0;
        }

        .section-heading p {
          color: var(--usage-muted);
          font-size: 11px;
          margin: 5px 0 0;
        }

        .demo-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 9px;
          border-radius: 20px;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 10px;
          font-weight: 750;
          letter-spacing: 0.3px;
          white-space: nowrap;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 25px;
        }

        .stat-card {
          min-width: 0;
          border: 1px solid var(--usage-border);
          background: var(--card, #fff);
          border-radius: 11px;
          padding: 18px;
          box-shadow: 0 2px 7px rgba(15, 23, 42, 0.025);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(15, 23, 42, 0.06);
        }

        .stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 17px;
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 9px;
          flex-shrink: 0;
        }

        .stat-icon.blue {
          background: #eff6ff;
          color: #2563eb;
        }

        .stat-icon.purple {
          background: #f5f3ff;
          color: #7c3aed;
        }

        .stat-icon.green {
          background: #ecfdf5;
          color: #059669;
        }

        .stat-icon.orange {
          background: #fff7ed;
          color: #ea580c;
        }

        .stat-label {
          color: var(--usage-muted);
          font-size: 12px;
          font-weight: 550;
        }

        .stat-value {
          font-size: 25px;
          letter-spacing: -0.7px;
          font-weight: 750;
          overflow-wrap: anywhere;
          margin-bottom: 6px;
        }

        .stat-description {
          color: var(--usage-muted);
          font-size: 11px;
        }

        .status-panel {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 15px 17px;
          border: 1px solid var(--usage-border);
          background: var(--card, #fff);
          border-radius: 10px;
          margin-bottom: 25px;
        }

        .status-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .status-icon {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          color: #315fe9;
          background: #eff6ff;
          border-radius: 9px;
        }

        .status-title {
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .status-description {
          color: var(--usage-muted);
          font-size: 11px;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 20px;
          padding: 6px 10px;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 11px;
          font-weight: 650;
          white-space: nowrap;
        }

        .records-card {
          background: var(--card, #fff);
          border: 1px solid var(--usage-border);
          border-radius: 11px;
          overflow: hidden;
          box-shadow: 0 2px 7px rgba(15, 23, 42, 0.025);
        }

        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
          padding: 14px 16px;
          border-bottom: 1px solid var(--usage-border);
        }

        .toolbar-left {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--usage-muted);
          font-size: 12px;
          font-weight: 600;
        }

        .toolbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .search-box {
          height: 36px;
          width: 215px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 10px;
          border: 1px solid var(--usage-border);
          border-radius: 7px;
          color: var(--usage-muted);
          background: var(--background, #fff);
        }

        .search-box:focus-within {
          border-color: #315fe9;
          box-shadow: 0 0 0 2px rgba(49, 95, 233, 0.1);
        }

        .search-box input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: var(--usage-text);
          font-size: 12px;
          min-width: 0;
        }

        .filter-select {
          height: 36px;
          max-width: 165px;
          padding: 0 10px;
          border: 1px solid var(--usage-border);
          border-radius: 7px;
          background: var(--background, #fff);
          color: var(--usage-text);
          font-size: 11px;
          outline: none;
          cursor: pointer;
        }

        .filter-select:focus {
          border-color: #315fe9;
        }

        .table-scroll {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          white-space: nowrap;
        }

        th {
          background: var(--muted, #f8fafc);
          color: var(--usage-muted);
          font-size: 10px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.55px;
          padding: 14px 16px;
          border-bottom: 1px solid var(--usage-border);
        }

        td {
          padding: 14px 16px;
          font-size: 12px;
          border-bottom: 1px solid var(--usage-border);
          max-width: 240px;
        }

        td span {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        tbody tr:last-child td {
          border-bottom: none;
        }

        tbody tr:hover {
          background: var(--muted, #fafafa);
        }

        .record-id {
          color: #315fe9;
          font-weight: 650;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .status-success {
          background: #ecfdf5;
          color: #047857;
        }

        .status-failed {
          background: #fef2f2;
          color: #b91c1c;
        }

        .status-pending {
          background: #fff7ed;
          color: #c2410c;
        }

        .empty-state {
          padding: 48px 20px;
          text-align: center;
        }

        .empty-icon {
          display: grid;
          place-items: center;
          width: 46px;
          height: 46px;
          margin: 0 auto 13px;
          border-radius: 12px;
          color: #64748b;
          background: var(--muted, #f4f4f5);
        }

        .empty-state h3 {
          font-size: 14px;
          margin: 0 0 7px;
          font-weight: 700;
        }

        .empty-state p {
          font-size: 12px;
          color: var(--usage-muted);
          margin: 0;
          line-height: 1.6;
        }

        .notice {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 12px 15px;
          margin-bottom: 18px;
          border: 1px solid #bfdbfe;
          border-radius: 9px;
          background: #eff6ff;
          color: #1e40af;
          font-size: 12px;
        }

        .notice strong {
          display: block;
          margin-bottom: 4px;
        }

        .notice p {
          margin: 0;
          line-height: 1.5;
        }

        .footnote {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 16px;
          color: var(--usage-muted);
          font-size: 11px;
          line-height: 1.5;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 1050px) {
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .usage-header {
            flex-direction: column;
          }

          .header-actions {
            width: 100%;
          }

          .header-actions button {
            flex: 1;
          }

          .usage-header h1 {
            font-size: 23px;
          }

          .stats-grid {
            gap: 9px;
          }

          .stat-card {
            padding: 13px;
          }

          .stat-value {
            font-size: 21px;
          }

          .status-panel {
            align-items: flex-start;
            flex-direction: column;
          }

          .toolbar {
            align-items: stretch;
          }

          .toolbar-right {
            width: 100%;
          }

          .search-box {
            flex: 1;
            width: auto;
          }

          .filter-select {
            max-width: none;
            flex: 1;
          }
        }
      `}</style>

      <header className="usage-header">
        <div>
          <div className="eyebrow">MODELNOW / ACCOUNT</div>
          <h1>Usage &amp; Limits</h1>
          <p className="subtitle">
            Monitor API consumption, token usage, and spending.
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="action-button"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              size={14}
              className={refreshing ? "spin" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            type="button"
            className="action-button primary-button"
            onClick={handleExport}
            disabled={!filteredRecords.length}
          >
            <ArrowDownToLine size={14} />
            Export CSV
          </button>
        </div>
      </header>

      <div className="section-heading">
        <div>
          <h2>Usage overview</h2>
          <p>Overview of the current demonstration usage records.</p>
        </div>

        <span className="demo-tag">DEMO DATA</span>
      </div>

      <section className="stats-grid" aria-label="Usage overview">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="stat-card" key={stat.label}>
              <div className="stat-top">
                <span className="stat-label">{stat.label}</span>

                <div className={`stat-icon ${stat.color}`}>
                  <Icon size={18} />
                </div>
              </div>

              <div className="stat-value">{stat.value}</div>
              <div className="stat-description">{stat.description}</div>
            </div>
          );
        })}
      </section>

      <section className="status-panel">
        <div className="status-left">
          <div className="status-icon">
            <Server size={19} />
          </div>

          <div>
            <div className="status-title">Local usage data</div>

            <div className="status-description">
              {lastRefreshed
                ? `Last refreshed: ${lastRefreshed.toLocaleTimeString()}`
                : "Local demonstration records"}
            </div>
          </div>
        </div>

        <span className="status-pill">
          <CheckCircle2 size={13} />
          Frontend demo
        </span>
      </section>

      {notification && (
        <div className="notice" role="status">
          <CheckCircle2 size={17} />

          <div>
            <strong>{notification}</strong>
            <p>This action was completed using local frontend data.</p>
          </div>

          <button
            type="button"
            onClick={() => setNotification("")}
            aria-label="Dismiss notification"
            style={{
              marginLeft: "auto",
              border: "none",
              background: "transparent",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="section-heading">
        <div>
          <h2>Usage records</h2>
          <p>Search, filter, and export your demonstration records.</p>
        </div>
      </div>

      <section className="records-card" aria-label="Usage records">
        <div className="toolbar">
          <div className="toolbar-left">
            <Database size={15} />
            {filteredRecords.length} of {records.length} records
          </div>

          <div className="toolbar-right">
            <label className="search-box">
              <Search size={15} />

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search records..."
                aria-label="Search usage records"
              />
            </label>

            <select
              className="filter-select"
              value={selectedModel}
              onChange={(event) => setSelectedModel(event.target.value)}
              aria-label="Filter by model"
            >
              <option value="all">All models</option>

              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>

            {hasFilters && (
              <button
                type="button"
                className="action-button"
                onClick={clearFilters}
              >
                <X size={13} />
                Clear
              </button>
            )}
          </div>
        </div>

        {filteredRecords.length > 0 ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Record ID</th>
                  <th>Date</th>
                  <th>Model</th>
                  <th>Provider</th>
                  <th>Requests</th>
                  <th>Input tokens</th>
                  <th>Output tokens</th>
                  <th>Total tokens</th>
                  <th>Cost (USD)</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <span className="record-id">{record.id}</span>
                    </td>

                    <td>{record.date}</td>
                    <td>{record.model}</td>
                    <td>{record.provider}</td>
                    <td>{formatNumber(record.requests)}</td>
                    <td>{formatNumber(record.inputTokens)}</td>
                    <td>{formatNumber(record.outputTokens)}</td>
                    <td>{formatNumber(record.totalTokens)}</td>
                    <td>{formatCurrency(record.costUsd)}</td>

                    <td>
                      <span
                        className={`status-badge status-${record.status}`}
                      >
                        {record.status === "success" && (
                          <CheckCircle2 size={11} />
                        )}

                        {record.status === "failed" && (
                          <AlertCircle size={11} />
                        )}

                        {record.status === "pending" && (
                          <Clock3 size={11} />
                        )}

                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <Search size={21} />
            </div>

            <h3>No matching records</h3>
            <p>Try changing your search or filters.</p>

            {hasFilters && (
              <button
                type="button"
                className="action-button"
                style={{ marginTop: 14 }}
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </section>

      <div className="footnote">
        <ShieldCheck size={14} />
        Demonstration data only. These values are not actual customer usage,
        provider charges, billing records, or enforced account limits.
      </div>
    </div>
  );
}
