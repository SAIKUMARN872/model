
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  CreditCard,
  Download,
  FileText,
  Filter,
  Info,
  Layers3,
  RefreshCw,
  Search,
  ShieldCheck,
  Wallet,
  X,
  Zap,
} from "lucide-react";

type TransactionType = "Purchase" | "Allocation" | "Usage" | "Refund";
type TransactionStatus = "Completed" | "Pending" | "Failed";

type CreditTransaction = {
  id: string;
  reference: string;
  description: string;
  type: TransactionType;
  amount: number;
  date: string;
  status: TransactionStatus;
};

type CreditSummary = {
  available: number | null;
  used: number | null;
  allocated: number | null;
  remaining: number | null;
  periodStart: string | null;
  periodEnd: string | null;
};

const initialSummary: CreditSummary = {
  available: null,
  used: null,
  allocated: null,
  remaining: null,
  periodStart: null,
  periodEnd: null,
};

// Connect these values to the authenticated billing API.
// Empty records are intentional until verified server data is available.
const initialTransactions: CreditTransaction[] = [];

const formatCredits = (value: number | null) => {
  if (value === null || !Number.isFinite(value)) return "—";

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "blue",
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ElementType;
  tone?: "blue" | "green" | "orange" | "purple";
}) {
  return (
    <article className="oc-metric-card">
      <div className="oc-metric-top">
        <div className={`oc-metric-icon oc-tone-${tone}`}>
          <Icon size={19} />
        </div>
        <span className="oc-metric-label">{label}</span>
      </div>

      <strong className="oc-metric-value">{value}</strong>
      <p className="oc-metric-detail">{detail}</p>
    </article>
  );
}

function StatusBadge({ status }: { status: TransactionStatus }) {
  const className =
    status === "Completed"
      ? "oc-status-success"
      : status === "Pending"
        ? "oc-status-warning"
        : "oc-status-danger";

  return <span className={`oc-status ${className}`}>{status}</span>;
}

function EmptyState({
  title,
  description,
  icon: Icon = FileText,
}: {
  title: string;
  description: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="oc-empty-state">
      <div className="oc-empty-icon">
        <Icon size={22} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default function OrganizationCreditsPage() {
  const [summary] = useState<CreditSummary>(initialSummary);
  const [transactions] = useState<CreditTransaction[]>(initialTransactions);
  const [search, setSearch] = useState("");
  const [transactionType, setTransactionType] = useState("All types");
  const [transactionStatus, setTransactionStatus] = useState("All statuses");
  const [activeTab, setActiveTab] = useState<
    "transactions" | "allocation" | "usage"
  >("transactions");
  const [notice, setNotice] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesSearch =
        !query ||
        [
          transaction.id,
          transaction.reference,
          transaction.description,
          transaction.type,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesType =
        transactionType === "All types" ||
        transaction.type === transactionType;

      const matchesStatus =
        transactionStatus === "All statuses" ||
        transaction.status === transactionStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [transactions, search, transactionType, transactionStatus]);

  const utilization =
    summary.allocated !== null &&
    summary.allocated > 0 &&
    summary.used !== null
      ? Math.min(100, Math.max(0, (summary.used / summary.allocated) * 100))
      : null;

  const clearFilters = () => {
    setSearch("");
    setTransactionType("All types");
    setTransactionStatus("All statuses");
  };

  const refreshData = async () => {
    setRefreshing(true);
    setNotice("");

    try {
      // Replace this with the authenticated billing API request.
      await new Promise((resolve) => window.setTimeout(resolve, 400));

      setNotice(
        "Billing API is not connected. Credit balances and transactions have not been refreshed."
      );
    } finally {
      setRefreshing(false);
    }
  };

  const exportTransactions = () => {
    if (filteredTransactions.length === 0) {
      setNotice("There are no transaction records available to export.");
      return;
    }

    const headers = [
      "Transaction ID",
      "Reference",
      "Description",
      "Type",
      "Credits",
      "Date",
      "Status",
    ];

    const rows = filteredTransactions.map((item) => [
      item.id,
      item.reference,
      item.description,
      item.type,
      item.amount,
      item.date,
      item.status,
    ]);

    const escapeCsv = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "modelnow-organization-credits.csv";
    anchor.click();

    URL.revokeObjectURL(url);
    setNotice("Credit transaction CSV exported.");
  };

  return (
    <main className="oc-page">
      <style>{`
        .oc-page {
          --oc-text: #111827;
          --oc-muted: #64748b;
          --oc-border: #e5e7eb;
          --oc-primary: #315fea;
          min-height: 100%;
          padding: 28px;
          background: #f8fafc;
          color: var(--oc-text);
        }

        .oc-container {
          max-width: 1500px;
          margin: 0 auto;
        }

        .oc-back {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 22px;
          color: #64748b;
          font-size: 12px;
          font-weight: 650;
          text-decoration: none;
        }

        .oc-back:hover {
          color: var(--oc-primary);
        }

        .oc-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 23px;
        }

        .oc-heading {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .oc-heading-icon {
          display: grid;
          width: 45px;
          height: 45px;
          flex-shrink: 0;
          place-items: center;
          border: 1px solid #dbe5ff;
          border-radius: 11px;
          background: #eff4ff;
          color: var(--oc-primary);
        }

        .oc-eyebrow {
          margin: 0 0 6px;
          color: #64748b;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .oc-header h1 {
          margin: 0;
          font-size: 26px;
          font-weight: 750;
          letter-spacing: -.6px;
        }

        .oc-description {
          margin: 7px 0 0;
          color: var(--oc-muted);
          font-size: 13px;
          line-height: 1.6;
        }

        .oc-header-actions {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .oc-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 37px;
          padding: 0 12px;
          border: 1px solid #dce2eb;
          border-radius: 8px;
          background: #fff;
          color: #334155;
          font-size: 11px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          transition: background .15s, border-color .15s;
        }

        .oc-button:hover {
          border-color: #bfcbe0;
          background: #f8fafc;
        }

        .oc-button:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .oc-button-primary {
          border-color: var(--oc-primary);
          background: var(--oc-primary);
          color: #fff;
        }

        .oc-button-primary:hover {
          border-color: #244dcc;
          background: #244dcc;
          color: #fff;
        }

        .oc-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 9px;
          border: 1px solid;
          border-radius: 30px;
          font-size: 10px;
          font-weight: 750;
          white-space: nowrap;
        }

        .oc-status-success {
          border-color: #bbf7d0;
          background: #f0fdf4;
          color: #15803d;
        }

        .oc-status-warning {
          border-color: #fde68a;
          background: #fffbeb;
          color: #a16207;
        }

        .oc-status-danger {
          border-color: #fecaca;
          background: #fef2f2;
          color: #b91c1c;
        }

        .oc-status-neutral {
          border-color: #e2e8f0;
          background: #f8fafc;
          color: #64748b;
        }

        .oc-notice {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 13px 15px;
          margin-bottom: 19px;
          border: 1px solid #bfdbfe;
          border-radius: 9px;
          background: #eff6ff;
          color: #1e40af;
          font-size: 11px;
          line-height: 1.6;
        }

        .oc-notice svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .oc-notice button {
          margin-left: auto;
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
        }

        .oc-overview {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 13px;
          margin-bottom: 19px;
        }

        .oc-metric-card {
          min-width: 0;
          padding: 17px;
          border: 1px solid var(--oc-border);
          border-radius: 11px;
          background: #fff;
        }

        .oc-metric-top {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .oc-metric-icon {
          display: grid;
          width: 35px;
          height: 35px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 9px;
        }

        .oc-tone-blue {
          background: #eff4ff;
          color: #315fea;
        }

        .oc-tone-green {
          background: #ecfdf5;
          color: #059669;
        }

        .oc-tone-orange {
          background: #fff7ed;
          color: #ea580c;
        }

        .oc-tone-purple {
          background: #f5f3ff;
          color: #7c3aed;
        }

        .oc-metric-label {
          color: #64748b;
          font-size: 11px;
          font-weight: 650;
        }

        .oc-metric-value {
          display: block;
          overflow: hidden;
          color: #111827;
          font-size: 25px;
          font-weight: 800;
          letter-spacing: -.7px;
          text-overflow: ellipsis;
        }

        .oc-metric-detail {
          margin: 6px 0 0;
          color: #94a3b8;
          font-size: 10px;
          line-height: 1.5;
        }

        .oc-content-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: 18px;
          align-items: start;
        }

        .oc-panel {
          min-width: 0;
          border: 1px solid var(--oc-border);
          border-radius: 11px;
          background: #fff;
        }

        .oc-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 17px 19px;
          border-bottom: 1px solid var(--oc-border);
        }

        .oc-panel-header h2 {
          margin: 0;
          font-size: 14px;
          font-weight: 750;
        }

        .oc-panel-header p {
          margin: 5px 0 0;
          color: #94a3b8;
          font-size: 10px;
        }

        .oc-panel-body {
          padding: 18px;
        }

        .oc-utilization {
          padding: 18px;
          margin-bottom: 14px;
          border: 1px solid var(--oc-border);
          border-radius: 10px;
          background: #fff;
        }

        .oc-utilization-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 13px;
        }

        .oc-utilization-heading h3 {
          margin: 0;
          font-size: 13px;
          font-weight: 750;
        }

        .oc-utilization-heading strong {
          font-size: 17px;
          font-weight: 800;
        }

        .oc-progress {
          height: 9px;
          overflow: hidden;
          border-radius: 20px;
          background: #edf0f5;
        }

        .oc-progress span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: var(--oc-primary);
          transition: width .2s;
        }

        .oc-progress-caption {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: 9px;
          color: #94a3b8;
          font-size: 10px;
        }

        .oc-summary-list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .oc-summary-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #edf0f4;
          font-size: 11px;
        }

        .oc-summary-row:last-child {
          border-bottom: 0;
        }

        .oc-summary-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
        }

        .oc-summary-value {
          color: #1e293b;
          font-weight: 750;
        }

        .oc-period {
          padding: 14px;
          margin-bottom: 15px;
          border: 1px solid var(--oc-border);
          border-radius: 9px;
          background: #fafbfc;
        }

        .oc-period-label {
          margin-bottom: 7px;
          color: #94a3b8;
          font-size: 10px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: .5px;
        }

        .oc-period-value {
          color: #334155;
          font-size: 12px;
          font-weight: 700;
        }

        .oc-tabs {
          display: flex;
          gap: 5px;
          padding: 0 17px;
          border-bottom: 1px solid var(--oc-border);
        }

        .oc-tab {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 14px 10px;
          border: 0;
          border-bottom: 2px solid transparent;
          background: transparent;
          color: #64748b;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .oc-tab.active {
          border-bottom-color: var(--oc-primary);
          color: var(--oc-primary);
        }

        .oc-table-toolbar {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;
          padding: 15px 17px;
          border-bottom: 1px solid var(--oc-border);
        }

        .oc-search {
          position: relative;
          flex: 1;
          min-width: 180px;
        }

        .oc-search svg {
          position: absolute;
          top: 50%;
          left: 11px;
          color: #94a3b8;
          transform: translateY(-50%);
          pointer-events: none;
        }

        .oc-search input {
          box-sizing: border-box;
          width: 100%;
          height: 37px;
          padding: 0 34px;
          border: 1px solid #dce2eb;
          border-radius: 7px;
          outline: none;
          background: #fff;
          color: #1e293b;
          font-size: 11px;
        }

        .oc-search input:focus,
        .oc-select:focus {
          border-color: var(--oc-primary);
          box-shadow: 0 0 0 3px rgba(49,95,234,.08);
        }

        .oc-select {
          height: 37px;
          padding: 0 10px;
          border: 1px solid #dce2eb;
          border-radius: 7px;
          outline: none;
          background: white;
          color: #475569;
          font-size: 10px;
          cursor: pointer;
        }

        .oc-table-wrap {
          overflow-x: auto;
        }

        .oc-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          white-space: nowrap;
        }

        .oc-table th {
          padding: 12px 15px;
          border-bottom: 1px solid var(--oc-border);
          background: #fafbfc;
          color: #64748b;
          font-size: 10px;
          font-weight: 750;
        }

        .oc-table td {
          padding: 14px 15px;
          border-bottom: 1px solid #edf0f4;
          color: #475569;
          font-size: 10px;
        }

        .oc-table tr:last-child td {
          border-bottom: 0;
        }

        .oc-transaction-id {
          color: #315fea;
          font-weight: 750;
        }

        .oc-credit-amount {
          color: #1e293b;
          font-weight: 750;
        }

        .oc-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 39px 20px;
          text-align: center;
        }

        .oc-empty-icon {
          display: grid;
          width: 43px;
          height: 43px;
          margin-bottom: 12px;
          place-items: center;
          border-radius: 11px;
          background: #f1f5f9;
          color: #64748b;
        }

        .oc-empty-state h3 {
          margin: 0 0 6px;
          color: #334155;
          font-size: 13px;
          font-weight: 750;
        }

        .oc-empty-state p {
          max-width: 370px;
          margin: 0;
          color: #94a3b8;
          font-size: 11px;
          line-height: 1.6;
        }

        .oc-side-links {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .oc-side-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 12px;
          border: 1px solid var(--oc-border);
          border-radius: 8px;
          color: #475569;
          font-size: 11px;
          font-weight: 700;
          text-decoration: none;
          transition: border-color .15s, background .15s;
        }

        .oc-side-link:hover {
          border-color: #c4d2f8;
          background: #f8faff;
          color: var(--oc-primary);
        }

        .oc-side-link-label {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .oc-info {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          padding: 12px;
          margin-top: 14px;
          border: 1px solid #dbeafe;
          border-radius: 8px;
          background: #f5f9ff;
          color: #475569;
          font-size: 10px;
          line-height: 1.6;
        }

        .oc-info svg {
          flex-shrink: 0;
          color: var(--oc-primary);
        }

        .oc-footnote {
          margin-top: 18px;
          color: #94a3b8;
          font-size: 10px;
          line-height: 1.6;
        }

        @media(max-width: 1100px) {
          .oc-content-grid {
            grid-template-columns: 1fr;
          }

          .oc-overview {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media(max-width: 650px) {
          .oc-page {
            padding: 17px 13px;
          }

          .oc-header {
            flex-direction: column;
          }

          .oc-header-actions {
            width: 100%;
          }

          .oc-header-actions > * {
            flex: 1;
          }

          .oc-overview {
            gap: 9px;
          }

          .oc-metric-card {
            padding: 12px;
          }

          .oc-metric-value {
            font-size: 21px;
          }

          .oc-table-toolbar {
            align-items: stretch;
          }

          .oc-search {
            flex-basis: 100%;
          }

          .oc-select {
            flex: 1;
          }

          .oc-tabs {
            overflow-x: auto;
          }
        }
      `}</style>

      <div className="oc-container">
        <Link href="/" className="oc-back">
          <ArrowLeft size={15} />
          Dashboard
        </Link>

        <header className="oc-header">
          <div className="oc-heading">
            <div className="oc-heading-icon">
              <CreditCard size={22} />
            </div>

            <div>
              <p className="oc-eyebrow">Billing and usage</p>
              <h1>Organization Credits</h1>
              <p className="oc-description">
                Monitor your organization's credit balance, allocations,
                consumption, and transaction history.
              </p>
            </div>
          </div>

          <div className="oc-header-actions">
            <span className="oc-status oc-status-warning">
              <CircleAlert size={12} />
              Billing not connected
            </span>

            <button
              type="button"
              className="oc-button"
              onClick={refreshData}
              disabled={refreshing}
            >
              <RefreshCw
                size={14}
                className={refreshing ? "oc-spinning" : ""}
              />
              {refreshing ? "Checking..." : "Refresh"}
            </button>
          </div>
        </header>

        {notice && (
          <div className="oc-notice" role="status">
            <Info size={16} />
            <span>{notice}</span>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setNotice("")}
            >
              <X size={15} />
            </button>
          </div>
        )}

        <section className="oc-overview" aria-label="Credit overview">
          <MetricCard
            label="Available credits"
            value={formatCredits(summary.available)}
            detail="Current verified organization balance"
            icon={Wallet}
            tone="blue"
          />

          <MetricCard
            label="Credits used"
            value={formatCredits(summary.used)}
            detail="Confirmed usage for this billing period"
            icon={ArrowUpRight}
            tone="orange"
          />

          <MetricCard
            label="Credits allocated"
            value={formatCredits(summary.allocated)}
            detail="Total credits assigned to the organization"
            icon={Layers3}
            tone="purple"
          />

          <MetricCard
            label="Credits remaining"
            value={formatCredits(summary.remaining)}
            detail="Balance after confirmed consumption"
            icon={ArrowDownLeft}
            tone="green"
          />
        </section>

        <div className="oc-content-grid">
          <section className="oc-panel">
            <div className="oc-panel-header">
              <div>
                <h2>Credit activity</h2>
                <p>Organization credit transactions and account activity</p>
              </div>

              <button
                type="button"
                className="oc-button"
                onClick={exportTransactions}
              >
                <Download size={14} />
                Export CSV
              </button>
            </div>

            <div className="oc-tabs" role="tablist" aria-label="Credit activity">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "transactions"}
                className={`oc-tab ${
                  activeTab === "transactions" ? "active" : ""
                }`}
                onClick={() => setActiveTab("transactions")}
              >
                <Activity size={14} />
                Transactions
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "allocation"}
                className={`oc-tab ${
                  activeTab === "allocation" ? "active" : ""
                }`}
                onClick={() => setActiveTab("allocation")}
              >
                <Layers3 size={14} />
                Allocations
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "usage"}
                className={`oc-tab ${
                  activeTab === "usage" ? "active" : ""
                }`}
                onClick={() => setActiveTab("usage")}
              >
                <Zap size={14} />
                Usage breakdown
              </button>
            </div>

            {activeTab === "transactions" && (
              <>
                <div className="oc-table-toolbar">
                  <div className="oc-search">
                    <Search size={15} />
                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search transactions..."
                      aria-label="Search transactions"
                    />
                  </div>

                  <select
                    className="oc-select"
                    value={transactionType}
                    onChange={(event) =>
                      setTransactionType(event.target.value)
                    }
                    aria-label="Filter by transaction type"
                  >
                    <option>All types</option>
                    <option>Purchase</option>
                    <option>Allocation</option>
                    <option>Usage</option>
                    <option>Refund</option>
                  </select>

                  <select
                    className="oc-select"
                    value={transactionStatus}
                    onChange={(event) =>
                      setTransactionStatus(event.target.value)
                    }
                    aria-label="Filter by transaction status"
                  >
                    <option>All statuses</option>
                    <option>Completed</option>
                    <option>Pending</option>
                    <option>Failed</option>
                  </select>
                </div>

                {filteredTransactions.length > 0 ? (
                  <div className="oc-table-wrap">
                    <table className="oc-table">
                      <thead>
                        <tr>
                          <th>Transaction</th>
                          <th>Description</th>
                          <th>Type</th>
                          <th>Credits</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((transaction) => (
                          <tr key={transaction.id}>
                            <td>
                              <span className="oc-transaction-id">
                                {transaction.reference}
                              </span>
                            </td>
                            <td>{transaction.description}</td>
                            <td>{transaction.type}</td>
                            <td>
                              <span className="oc-credit-amount">
                                {formatCredits(transaction.amount)}
                              </span>
                            </td>
                            <td>{formatDate(transaction.date)}</td>
                            <td>
                              <StatusBadge status={transaction.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : transactions.length === 0 ? (
                  <EmptyState
                    title="No credit transactions available"
                    description="Transaction records will appear here when the authenticated billing service provides organization credit activity."
                    icon={CreditCard}
                  />
                ) : (
                  <EmptyState
                    title="No matching transactions"
                    description="Try changing your search term or transaction filters."
                    icon={Search}
                  />
                )}

                {(search ||
                  transactionType !== "All types" ||
                  transactionStatus !== "All statuses") && (
                  <div style={{ padding: "0 17px 15px" }}>
                    <button
                      type="button"
                      className="oc-button"
                      onClick={clearFilters}
                    >
                      <X size={13} />
                      Clear filters
                    </button>
                  </div>
                )}
              </>
            )}

            {activeTab === "allocation" && (
              <div className="oc-panel-body">
                <EmptyState
                  title="No allocation records available"
                  description="Organization credit allocations, assigned amounts, recipients, and allocation dates will appear here after billing data is connected."
                  icon={Layers3}
                />
              </div>
            )}

            {activeTab === "usage" && (
              <div className="oc-panel-body">
                <EmptyState
                  title="Usage breakdown unavailable"
                  description="Verified credit consumption by model, API, project, and service will appear here when usage records are available."
                  icon={Activity}
                />
              </div>
            )}
          </section>

          <aside>
            <section className="oc-utilization">
              <div className="oc-utilization-heading">
                <h3>Credit utilization</h3>
                <strong>
                  {utilization === null
                    ? "—"
                    : `${utilization.toFixed(1)}%`}
                </strong>
              </div>

              <div
                className="oc-progress"
                role="progressbar"
                aria-label="Credit utilization"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={utilization ?? 0}
              >
                <span
                  style={{
                    width: utilization === null ? "0%" : `${utilization}%`,
                  }}
                />
              </div>

              <div className="oc-progress-caption">
                <span>Used credits</span>
                <span>Allocated credits</span>
              </div>

              <div className="oc-info">
                <Info size={15} />
                Utilization will be calculated when verified allocation and
                usage values are available.
              </div>
            </section>

            <section className="oc-panel" style={{ marginBottom: 14 }}>
              <div className="oc-panel-header">
                <h2>Credit summary</h2>
              </div>

              <div className="oc-panel-body">
                <div className="oc-period">
                  <div className="oc-period-label">Billing period</div>
                  <div className="oc-period-value">
                    {summary.periodStart && summary.periodEnd
                      ? `${formatDate(summary.periodStart)} – ${formatDate(
                          summary.periodEnd
                        )}`
                      : "Not available"}
                  </div>
                </div>

                <div className="oc-summary-list">
                  <div className="oc-summary-row">
                    <span className="oc-summary-label">
                      <Wallet size={14} />
                      Available balance
                    </span>
                    <strong className="oc-summary-value">
                      {formatCredits(summary.available)}
                    </strong>
                  </div>

                  <div className="oc-summary-row">
                    <span className="oc-summary-label">
                      <ArrowUpRight size={14} />
                      Total consumption
                    </span>
                    <strong className="oc-summary-value">
                      {formatCredits(summary.used)}
                    </strong>
                  </div>

                  <div className="oc-summary-row">
                    <span className="oc-summary-label">
                      <Layers3 size={14} />
                      Total allocation
                    </span>
                    <strong className="oc-summary-value">
                      {formatCredits(summary.allocated)}
                    </strong>
                  </div>
                </div>
              </div>
            </section>

            <section className="oc-panel">
              <div className="oc-panel-header">
                <h2>Billing shortcuts</h2>
              </div>

              <div className="oc-panel-body">
                <div className="oc-side-links">
                  <Link href="/pricing" className="oc-side-link">
                    <span className="oc-side-link-label">
                      <CreditCard size={16} />
                      View plans
                    </span>
                    <ArrowRight size={15} />
                  </Link>

                  <Link href="/spend" className="oc-side-link">
                    <span className="oc-side-link-label">
                      <Activity size={16} />
                      Monthly spend
                    </span>
                    <ArrowRight size={15} />
                  </Link>
                </div>

                <div className="oc-info">
                  <ShieldCheck size={15} />
                  Credit balances and financial transactions must be verified
                  by the billing backend. This page does not modify balances.
                </div>
              </div>
            </section>
          </aside>
        </div>

        <p className="oc-footnote">
          ModelNow Billing · Credit information is displayed only when
          supplied by an authenticated billing service. Pending transactions
          should not be treated as confirmed balances.
        </p>
      </div>
    </main>
  );
}
