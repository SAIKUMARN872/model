
"use client";

import { useMemo, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  RefreshCw,
  Download,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Receipt,
  CircleCheck,
  Clock3,
  AlertTriangle,
  Building2,
  CalendarDays,
  Banknote,
} from "lucide-react";

type PaymentStatus = "Paid" | "Pending" | "Failed" | "Refunded";

type Transaction = {
  id: string;
  customer: string;
  email: string;
  plan: string;
  amount: number;
  status: PaymentStatus;
  date: string;
  method: string;
};

const C = {
  bg: "#f7f8fc",
  card: "#ffffff",
  border: "#e7ebf2",
  text: "#182230",
  muted: "#788497",
  blue: "#5269ee",
  green: "#169b68",
  purple: "#8b5cf6",
  teal: "#0891b2",
  orange: "#e99a27",
  red: "#dc5252",
};

const transactions: Transaction[] = [
  { id: "TXN-2081", customer: "Acme Technologies", email: "finance@acme.example", plan: "Enterprise", amount: 24999, status: "Paid", date: "2026-11-04", method: "Card" },
  { id: "TXN-2080", customer: "Northstar AI", email: "billing@northstar.example", plan: "Enterprise", amount: 24999, status: "Paid", date: "2026-11-04", method: "Bank transfer" },
  { id: "TXN-2079", customer: "Vertex Labs", email: "accounts@vertex.example", plan: "Business", amount: 4999, status: "Pending", date: "2026-11-03", method: "UPI" },
  { id: "TXN-2078", customer: "BluePeak Systems", email: "billing@bluepeak.example", plan: "Business", amount: 4999, status: "Failed", date: "2026-11-03", method: "Card" },
  { id: "TXN-2077", customer: "Summit Digital", email: "finance@summit.example", plan: "Starter", amount: 999, status: "Paid", date: "2026-11-02", method: "UPI" },
  { id: "TXN-2076", customer: "Pioneer Analytics", email: "accounts@pioneer.example", plan: "Business", amount: 4999, status: "Refunded", date: "2026-11-02", method: "Card" },
  { id: "TXN-2075", customer: "Orbit Systems", email: "payments@orbit.example", plan: "Enterprise", amount: 24999, status: "Paid", date: "2026-11-01", method: "Bank transfer" },
  { id: "TXN-2074", customer: "Cedar Cloud", email: "billing@cedar.example", plan: "Starter", amount: 999, status: "Pending", date: "2026-10-31", method: "UPI" },
];

const revenueTrend: Record<string, number[]> = {
  "7 days": [38, 45, 42, 59, 54, 72, 88],
  "30 days": [28, 34, 39, 36, 48, 45, 57, 52, 66, 71, 78, 91],
  "90 days": [18, 25, 23, 34, 31, 42, 48, 45, 59, 66, 76, 90],
  "12 months": [20, 24, 29, 26, 34, 40, 38, 49, 55, 63, 74, 89],
};

const css: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", padding: 28, background: C.bg, color: C.text, fontFamily: "Arial, Helvetica, sans-serif" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 },
  eyebrow: { color: C.muted, fontSize: 11, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 8 },
  heading: { margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: -0.7 },
  subtitle: { color: C.muted, fontSize: 13, lineHeight: 1.6, margin: "8px 0 0" },
  button: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 13px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 9, color: "#344054", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  select: { border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 11px", background: "#fff", color: "#344054", fontSize: 12 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))", gap: 15, marginBottom: 18 },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 19, minWidth: 0, boxShadow: "0 2px 8px rgba(15,23,42,.025)" },
  title: { margin: 0, fontSize: 14, fontWeight: 800 },
  muted: { color: C.muted, fontSize: 12 },
  two: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 390px), 1fr))", gap: 18, marginBottom: 18 },
  panelHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 },
  pill: { display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 6, padding: "5px 8px", fontSize: 10, fontWeight: 800, whiteSpace: "nowrap" },
  input: { width: "100%", boxSizing: "border-box", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 11px", fontSize: 12, outline: "none", background: "#fff" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  th: { textAlign: "left", padding: "12px 9px", color: "#8490a2", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.7, borderBottom: "1px solid #edf0f5", whiteSpace: "nowrap" },
  td: { padding: "14px 9px", borderBottom: "1px solid #f0f2f6", verticalAlign: "middle" },
};

function Panel({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section style={css.card}>
      <div style={css.panelHeader}>
        <div>
          <h2 style={css.title}>{title}</h2>
          {subtitle && <p style={{ ...css.muted, margin: "6px 0 0" }}>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function RevenueOverviewPage() {
  const [period, setPeriod] = useState("30 days");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [query, setQuery] = useState("");
  const [refreshed, setRefreshed] = useState("Just now");
  const [exportMessage, setExportMessage] = useState("");

  const filteredTransactions = useMemo(() => {
    const q = query.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesSearch =
        !q ||
        [
          transaction.id,
          transaction.customer,
          transaction.email,
          transaction.plan,
          transaction.method,
        ].some((value) => value.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "All statuses" ||
        transaction.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [query, statusFilter]);

  const paidTotal = transactions
    .filter((item) => item.status === "Paid")
    .reduce((sum, item) => sum + item.amount, 0);

  function exportCsv() {
    const rows = [
      ["Transaction ID", "Customer", "Email", "Plan", "Amount INR", "Status", "Date", "Method"],
      ...filteredTransactions.map((item) => [
        item.id,
        item.customer,
        item.email,
        item.plan,
        String(item.amount),
        item.status,
        item.date,
        item.method,
      ]),
    ];

    const csv = rows
      .map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(","))
      .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-revenue-overview.csv";
    link.click();
    URL.revokeObjectURL(url);
    setExportMessage(`${filteredTransactions.length} transaction records exported.`);
  }

  const stats = [
    { label: "Total revenue", value: "₹48.6L", change: "+14.8%", note: "Selected reporting period", icon: Wallet, color: C.blue },
    { label: "Monthly recurring revenue", value: "₹12.4L", change: "+9.6%", note: "Recurring subscription revenue", icon: RefreshCw, color: C.green },
    { label: "Annual recurring revenue", value: "₹1.49Cr", change: "+18.2%", note: "Annualized recurring estimate", icon: TrendingUp, color: C.purple },
    { label: "Average revenue / account", value: "₹9,820", change: "+4.3%", note: "Average paid account value", icon: Building2, color: C.teal },
  ];

  const plans = [
    { name: "Enterprise", amount: 2860000, percent: 59, count: 184, color: C.purple },
    { name: "Business", amount: 1570000, percent: 32, count: 426, color: C.blue },
    { name: "Starter", amount: 550000, percent: 9, count: 674, color: C.teal },
  ];

  const statusRows = [
    { label: "Paid", count: 1824, percent: 78, color: C.green },
    { label: "Pending", count: 286, percent: 12, color: C.orange },
    { label: "Failed", count: 164, percent: 7, color: C.red },
    { label: "Refunded", count: 68, percent: 3, color: C.purple },
  ];

  return (
    <main style={css.page}>
      <header style={css.header}>
        <div>
          <div style={css.eyebrow}>ModelNow / Dashboard / Finance</div>
          <h1 style={css.heading}>Revenue Overview</h1>
          <p style={css.subtitle}>
            Monitor subscription revenue, recurring income, plan performance, and payment outcomes.
          </p>
        </div>

        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <select
            aria-label="Reporting period"
            style={css.select}
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
          >
            {["7 days", "30 days", "90 days", "12 months"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <button
            style={css.button}
            onClick={() => {
              setRefreshed("Just now");
              setExportMessage("");
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>

          <button style={css.button} onClick={exportCsv}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </header>

      <div style={{ ...css.card, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 18, background: "#eef2ff", borderColor: "#dfe5ff" }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "#dce4ff", color: C.blue, display: "grid", placeItems: "center" }}>
          <Banknote size={19} />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>Revenue reporting workspace</div>
          <div style={{ ...css.muted, marginTop: 4 }}>
            Period: {period}. Revenue figures are illustrative demo values, not verified financial records.
          </div>
        </div>
        <span style={{ ...css.pill, background: "#fff", color: C.blue }}>DEMO DATA</span>
      </div>

      <div style={css.grid}>
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} style={css.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <span style={{ color: "#667085", fontSize: 12, fontWeight: 700 }}>{item.label}</span>
                <span style={{ width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: 11, background: `${item.color}14`, color: item.color }}>
                  <Icon size={19} />
                </span>
              </div>
              <div style={{ fontSize: 27, fontWeight: 800, letterSpacing: -0.8, marginTop: 17 }}>{item.value}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginTop: 8 }}>
                <span style={{ ...css.pill, background: "#eaf8f0", color: C.green }}>
                  <ArrowUpRight size={12} /> {item.change}
                </span>
                <span style={css.muted}>{item.note}</span>
              </div>
            </article>
          );
        })}
      </div>

      <div style={css.two}>
        <Panel title="Revenue trend" subtitle={`Illustrative revenue index · ${period}`}>
          <div style={{ display: "flex", gap: 18, fontSize: 11, fontWeight: 800, marginBottom: 18 }}>
            <span style={{ color: C.blue }}>● Revenue</span>
            <span style={{ color: C.teal }}>● Subscription growth</span>
          </div>

          <div style={{ height: 185, display: "grid", gridTemplateColumns: `repeat(${revenueTrend[period].length}, minmax(0, 1fr))`, gap: 8, alignItems: "end" }}>
            {revenueTrend[period].map((value, index) => (
              <div key={`${period}-${index}`} style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "end", gap: 8 }}>
                <div
                  title={`Revenue index ${value}`}
                  style={{ width: "100%", maxWidth: 30, height: `${value}%`, minHeight: 5, borderRadius: "5px 5px 0 0", background: `linear-gradient(180deg, ${C.blue}, #a7b2ff)` }}
                />
                <span style={{ fontSize: 9, color: C.muted }}>{index + 1}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Revenue by subscription plan" subtitle="Illustrative contribution by plan">
          {plans.map((plan) => (
            <div key={plan.name} style={{ marginBottom: 21 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 700 }}>{plan.name}</span>
                <strong style={{ fontSize: 12 }}>{formatINR(plan.amount)}</strong>
                <span style={{ fontSize: 11, color: C.muted }}>{plan.percent}%</span>
              </div>
              <div style={{ height: 8, background: "#edf0f5", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ width: `${plan.percent}%`, height: "100%", background: plan.color, borderRadius: 99 }} />
              </div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>{plan.count} illustrative subscriptions</div>
            </div>
          ))}
        </Panel>
      </div>

      <div style={css.two}>
        <Panel title="Payment status" subtitle="Illustrative transaction outcome distribution">
          {statusRows.map((item) => (
            <div key={item.label} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 700 }}>{item.label}</span>
                <strong style={{ fontSize: 12 }}>{item.count}</strong>
                <span style={{ fontSize: 11, color: C.muted }}>{item.percent}%</span>
              </div>
              <div style={{ height: 8, background: "#edf0f5", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ width: `${item.percent}%`, height: "100%", background: item.color, borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </Panel>

        <Panel title="Financial indicators" subtitle="Sample operational finance indicators">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
            {[
              { label: "Paid transactions", value: "1,824", color: C.green, icon: CircleCheck },
              { label: "Pending payments", value: "286", color: C.orange, icon: Clock3 },
              { label: "Failed payments", value: "164", color: C.red, icon: AlertTriangle },
              { label: "Refund requests", value: "68", color: C.purple, icon: Receipt },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} style={{ padding: 14, border: `1px solid ${C.border}`, borderRadius: 11 }}>
                  <Icon size={18} color={item.color} />
                  <div style={{ color: C.muted, fontSize: 11, marginTop: 10 }}>{item.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, marginTop: 7 }}>{item.value}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff8eb", padding: 12, borderRadius: 9, marginTop: 16 }}>
            <AlertTriangle size={17} color={C.orange} />
            <span style={{ fontSize: 11, color: "#805b18", lineHeight: 1.6 }}>
              Connect your payment provider to reconcile payment status, refunds, and settlement amounts.
            </span>
          </div>
        </Panel>
      </div>

      <Panel
        title="Recent transactions"
        subtitle={`${filteredTransactions.length} sample transactions match your search and filters`}
        action={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ position: "relative", minWidth: 180 }}>
              <Search size={14} style={{ position: "absolute", left: 10, top: 11, color: C.muted }} />
              <input
                aria-label="Search transactions"
                placeholder="Search transactions..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                style={{ ...css.input, paddingLeft: 31 }}
              />
            </div>
            <select
              aria-label="Filter by payment status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              style={css.select}
            >
              <option>All statuses</option>
              <option>Paid</option>
              <option>Pending</option>
              <option>Failed</option>
              <option>Refunded</option>
            </select>
          </div>
        }
      >
        {exportMessage && <p role="status" style={{ color: C.green, fontSize: 12 }}>{exportMessage}</p>}

        <div style={{ overflowX: "auto" }}>
          <table style={css.table}>
            <thead>
              <tr>
                {["Transaction", "Customer", "Plan", "Amount", "Payment method", "Status", "Date"].map((label) => (
                  <th key={label} style={css.th}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((item) => {
                const color =
                  item.status === "Paid" ? C.green :
                  item.status === "Pending" ? C.orange :
                  item.status === "Failed" ? C.red : C.purple;

                return (
                  <tr key={item.id}>
                    <td style={css.td}>
                      <div style={{ fontWeight: 800, whiteSpace: "nowrap" }}>{item.id}</div>
                    </td>
                    <td style={css.td}>
                      <div style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{item.customer}</div>
                      <div style={{ color: C.muted, fontSize: 10, marginTop: 4 }}>{item.email}</div>
                    </td>
                    <td style={css.td}>{item.plan}</td>
                    <td style={{ ...css.td, fontWeight: 800, whiteSpace: "nowrap" }}>{formatINR(item.amount)}</td>
                    <td style={{ ...css.td, whiteSpace: "nowrap" }}>{item.method}</td>
                    <td style={css.td}>
                      <span style={{ ...css.pill, background: `${color}15`, color }}>{item.status}</span>
                    </td>
                    <td style={{ ...css.td, whiteSpace: "nowrap", color: C.muted }}>{item.date}</td>
                  </tr>
                );
              })}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ ...css.td, textAlign: "center", color: C.muted }}>
                    No transactions match your search and filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginTop: 14, color: C.muted, fontSize: 11 }}>
          <span>Paid total in displayed sample: {formatINR(paidTotal)}</span>
          <span>Values are illustrative and are not connected to live payments.</span>
        </div>
      </Panel>

      <footer style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginTop: 18, color: C.muted, fontSize: 11 }}>
        <span>ModelNow Admin · Revenue Overview</span>
        <span><CalendarDays size={12} style={{ verticalAlign: "middle", marginRight: 5 }} />Last refreshed: {refreshed}</span>
      </footer>
    </main>
  );
}
