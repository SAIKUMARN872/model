
"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  BadgeDollarSign,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Download,
  FileText,
  Filter,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";

type Invoice = {
  id: string;
  organization: string;
  date: string;
  amount: number;
  status: "Paid" | "Pending" | "Overdue" | "Draft";
  plan: string;
};

const initialInvoices: Invoice[] = [
  { id: "INV-2026-1048", organization: "Acme AI", date: "2026-11-01", amount: 249, status: "Paid", plan: "Enterprise" },
  { id: "INV-2026-1047", organization: "Northstar Labs", date: "2026-10-28", amount: 499, status: "Pending", plan: "Enterprise" },
  { id: "INV-2026-1046", organization: "Vertex Systems", date: "2026-10-25", amount: 99, status: "Overdue", plan: "Pro" },
  { id: "INV-2026-1045", organization: "ModelNow Internal", date: "2026-10-20", amount: 0, status: "Paid", plan: "Internal" },
  { id: "INV-2026-1044", organization: "BluePeak AI", date: "2026-10-16", amount: 149, status: "Paid", plan: "Pro" },
  { id: "INV-2026-1043", organization: "Quantum Works", date: "2026-10-12", amount: 49, status: "Draft", plan: "Starter" },
];

const initialBillingSettings = {
  currency: "USD",
  billingCycle: "monthly",
  taxRate: "0",
  gracePeriod: "7",
  invoicePrefix: "INV",
  paymentTerms: "15",
  autoRenew: true,
  prorateChanges: true,
  sendInvoices: true,
  sendPaymentReminders: true,
  allowManualPayments: true,
  requirePaymentMethod: true,
  taxEnabled: false,
  dunningEnabled: true,
  issueInvoicesAutomatically: true,
};

type BillingSettings = typeof initialBillingSettings;

const plans = [
  { name: "Free", price: 0, description: "For individuals exploring ModelNow", color: "gray", features: ["Basic AI access", "Usage dashboard", "Community support"] },
  { name: "Starter", price: 49, description: "For small teams getting started", color: "blue", features: ["Higher usage limits", "Team workspace", "Standard support"] },
  { name: "Pro", price: 149, description: "For growing AI-powered teams", color: "purple", features: ["Advanced model routing", "Analytics and monitoring", "Priority support"] },
  { name: "Enterprise", price: 499, description: "For organizations with advanced needs", color: "green", features: ["Organization controls", "Custom policy options", "Enterprise support"] },
];

export default function BillingSettingsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [settings, setSettings] = useState<BillingSettings>(initialBillingSettings);
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState({
    organization: "",
    amount: "",
    plan: "Starter",
    date: new Date().toISOString().slice(0, 10),
  });

  const paidRevenue = invoices
    .filter((invoice) => invoice.status === "Paid")
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const pendingRevenue = invoices
    .filter((invoice) => invoice.status === "Pending")
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const overdueRevenue = invoices
    .filter((invoice) => invoice.status === "Overdue")
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((invoice) => {
        const matchesSearch = `${invoice.id} ${invoice.organization} ${invoice.plan}`
          .toLowerCase()
          .includes(search.toLowerCase());

        const matchesStatus =
          statusFilter === "All" || invoice.status === statusFilter;

        return matchesSearch && matchesStatus;
      }),
    [invoices, search, statusFilter],
  );

  function updateSetting<K extends keyof BillingSettings>(
    key: K,
    value: BillingSettings[K],
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function saveSettings() {
    try {
      localStorage.setItem("modelnow-billing-settings", JSON.stringify(settings));
      localStorage.setItem("modelnow-billing-invoices", JSON.stringify(invoices));
      setNotice(
        "Billing settings saved in this browser. Connect your billing backend and payment provider for production transactions.",
      );
    } catch {
      setNotice("Unable to save billing settings in this browser.");
    }
  }

  function createInvoice() {
    const amount = Number(draft.amount);

    if (!draft.organization.trim()) {
      setNotice("Enter an organization name.");
      return;
    }

    if (!draft.amount.trim() || !Number.isFinite(amount) || amount < 0) {
      setNotice("Enter a valid invoice amount.");
      return;
    }

    const newInvoice: Invoice = {
      id: `INV-2026-${String(Date.now()).slice(-6)}`,
      organization: draft.organization.trim(),
      date: draft.date,
      amount,
      status: "Draft",
      plan: draft.plan,
    };

    setInvoices((current) => [newInvoice, ...current]);
    setDraft({
      organization: "",
      amount: "",
      plan: "Starter",
      date: new Date().toISOString().slice(0, 10),
    });
    setShowInvoiceModal(false);
    setActiveTab("invoices");
    setNotice("Draft invoice created in the local demo.");
  }

  function updateInvoiceStatus(id: string, status: Invoice["status"]) {
    setInvoices((current) =>
      current.map((invoice) =>
        invoice.id === id ? { ...invoice, status } : invoice,
      ),
    );
  }

  function exportInvoices() {
    const headers = [
      "Invoice ID",
      "Organization",
      "Date",
      "Amount",
      "Currency",
      "Plan",
      "Status",
    ];

    const rows = filteredInvoices.map((invoice) => [
      invoice.id,
      invoice.organization,
      invoice.date,
      invoice.amount,
      settings.currency,
      invoice.plan,
      invoice.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-billing-invoices.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("Invoice report exported.");
  }

  function resetDemo() {
    setInvoices(initialInvoices);
    setSettings(initialBillingSettings);
    setSearch("");
    setStatusFilter("All");
    setNotice("Billing demo data has been reset.");
  }

  function formatMoney(amount: number) {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: settings.currency,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `$${amount.toFixed(2)}`;
    }
  }

  function Toggle({
    title,
    description,
    checked,
    onChange,
  }: {
    title: string;
    description: string;
    checked: boolean;
    onChange: (value: boolean) => void;
  }) {
    return (
      <div className="billing-toggle">
        <div>
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={title}
          className={`billing-switch ${checked ? "on" : ""}`}
          onClick={() => onChange(!checked)}
        />
      </div>
    );
  }

  function Metric({
    title,
    value,
    caption,
    icon,
    tone = "blue",
  }: {
    title: string;
    value: string;
    caption: string;
    icon: React.ReactNode;
    tone?: string;
  }) {
    return (
      <div className="billing-metric">
        <div className={`billing-metric-icon ${tone}`}>{icon}</div>
        <div>
          <p>{title}</p>
          <strong>{value}</strong>
          <small>{caption}</small>
        </div>
      </div>
    );
  }

  return (
    <main className="billing-page">
      <style>{`
        .billing-page{min-height:100vh;padding:30px;background:#f7f8fc;color:#202a40;font-family:Arial,Helvetica,sans-serif}
        .billing-container{max-width:1280px;margin:0 auto}
        .billing-breadcrumb{display:flex;gap:9px;flex-wrap:wrap;margin-bottom:22px;color:#858da0;font-size:13px}
        .billing-breadcrumb a{color:#5265d9;text-decoration:none}
        .billing-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:25px}
        .billing-heading-main{display:flex;align-items:center;gap:14px}
        .billing-heading-icon{display:grid;place-items:center;width:50px;height:50px;flex-shrink:0;border-radius:14px;background:#e9edff;color:#5265d9}
        .billing-heading h1{margin:0 0 7px;font-size:27px;letter-spacing:-.6px}
        .billing-heading p{max-width:700px;margin:0;color:#7e8799;font-size:13px;line-height:1.7}
        .billing-actions{display:flex;flex-wrap:wrap;gap:9px}
        .billing-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:39px;padding:0 13px;border:1px solid #dfe4ed;border-radius:9px;background:white;color:#414c64;font-size:12px;font-weight:600;cursor:pointer}
        .billing-btn.primary{background:#5265d9;border-color:#5265d9;color:white}
        .billing-btn:disabled{opacity:.5;cursor:not-allowed}
        .billing-notice{display:flex;align-items:flex-start;gap:10px;margin-bottom:18px;padding:13px 15px;border:1px solid #dce4ff;border-radius:10px;background:#f0f3ff;color:#4055b5;font-size:12px;line-height:1.6}
        .billing-warning{display:flex;gap:12px;margin-bottom:20px;padding:15px;border:1px solid #f3dfb1;border-radius:11px;background:#fff9e9;color:#94651a;font-size:12px;line-height:1.7}
        .billing-warning strong{display:block;margin-bottom:4px}
        .billing-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:22px}
        .billing-metric{display:flex;gap:13px;padding:19px;border:1px solid #e7eaf1;border-radius:12px;background:white}
        .billing-metric-icon{display:grid;place-items:center;width:41px;height:41px;flex-shrink:0;border-radius:10px;background:#edf0ff;color:#5265d9}
        .billing-metric-icon.green{background:#e8f8ef;color:#258452}
        .billing-metric-icon.orange{background:#fff5df;color:#a36e12}
        .billing-metric-icon.red{background:#fff0f0;color:#c24141}
        .billing-metric p{margin:2px 0 7px;color:#818a9c;font-size:11px}
        .billing-metric strong{font-size:23px;letter-spacing:-.3px}
        .billing-metric small{display:block;margin-top:6px;color:#929aab;font-size:10px;line-height:1.5}
        .billing-tabs{display:flex;flex-wrap:wrap;gap:6px;padding:6px;margin-bottom:18px;border:1px solid #e7eaf1;border-radius:11px;background:white}
        .billing-tab{display:inline-flex;align-items:center;gap:8px;padding:11px 14px;border:0;border-radius:7px;background:transparent;color:#6f7890;font-size:12px;font-weight:600;cursor:pointer}
        .billing-tab.active{background:#edf0ff;color:#485dd0}
        .billing-card{overflow:hidden;margin-bottom:18px;border:1px solid #e7eaf1;border-radius:13px;background:white;box-shadow:0 2px 7px rgba(24,36,70,.025)}
        .billing-card-header{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:20px 22px;border-bottom:1px solid #edf0f5}
        .billing-card-header h2{margin:0 0 6px;font-size:15px}
        .billing-card-header p{margin:0;color:#858da0;font-size:12px;line-height:1.6}
        .billing-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:16px 22px;border-bottom:1px solid #edf0f5}
        .billing-search{position:relative;flex:1 1 220px;min-width:180px}
        .billing-search svg{position:absolute;top:12px;left:12px;color:#929bad}
        .billing-search input{width:100%;height:40px;padding:0 12px 0 37px;border:1px solid #dfe4ed;border-radius:8px;outline:none;font-size:12px}
        .billing-filter{height:40px;min-width:135px;padding:0 12px;border:1px solid #dfe4ed;border-radius:8px;background:white;color:#4b566d;font-size:12px}
        .billing-table-wrap{overflow-x:auto}
        .billing-table{width:100%;border-collapse:collapse;text-align:left;white-space:nowrap}
        .billing-table th{padding:14px 16px;background:#fafbfe;color:#7f889a;font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase}
        .billing-table td{padding:15px 16px;border-top:1px solid #edf0f5;color:#4b566d;font-size:12px}
        .billing-table strong{color:#263149}
        .billing-muted{margin-top:5px;color:#8991a2;font-size:10px}
        .billing-badge{display:inline-flex;align-items:center;gap:5px;padding:5px 9px;border-radius:20px;background:#f0f1f5;color:#697386;font-size:10px;font-weight:700}
        .billing-badge.paid{background:#eaf9f0;color:#218552}
        .billing-badge.pending{background:#fff5df;color:#9a6a12}
        .billing-badge.overdue{background:#fff0f0;color:#c24141}
        .billing-badge.draft{background:#edf0ff;color:#5265d9}
        .billing-icon-btn{display:grid;place-items:center;width:32px;height:32px;border:1px solid #e4e8f0;border-radius:7px;background:white;color:#66718a;cursor:pointer}
        .billing-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 22px;border-top:1px solid #edf0f5;color:#858da0;font-size:11px}
        .billing-empty{padding:42px 20px;text-align:center;color:#858da0;font-size:13px}
        .billing-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:17px;padding:22px}
        .billing-field{display:flex;flex-direction:column;gap:8px;min-width:0}
        .billing-field label{color:#39445a;font-size:12px;font-weight:700}
        .billing-field input,.billing-field select{width:100%;height:42px;padding:0 12px;border:1px solid #dfe4ed;border-radius:8px;outline:none;background:white;color:#202a40;font:inherit;font-size:12px}
        .billing-field input:focus,.billing-field select:focus{border-color:#8290ed;box-shadow:0 0 0 3px #edf0ff}
        .billing-field small{color:#8991a2;font-size:11px;line-height:1.6}
        .billing-field.full{grid-column:1/-1}
        .billing-toggle{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:17px 22px;border-bottom:1px solid #edf0f5}
        .billing-toggle:last-child{border-bottom:0}
        .billing-toggle strong{display:block;margin-bottom:5px;font-size:12px}
        .billing-toggle p{margin:0;color:#858da0;font-size:11px;line-height:1.6}
        .billing-switch{position:relative;width:38px;height:22px;flex:0 0 auto;padding:0;border:0;border-radius:20px;background:#cbd1dd;cursor:pointer}
        .billing-switch.on{background:#5265d9}
        .billing-switch:after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:white;transition:transform .15s ease}
        .billing-switch.on:after{transform:translateX(16px)}
        .billing-plan-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;padding:20px}
        .billing-plan{display:flex;flex-direction:column;padding:18px;border:1px solid #e7eaf1;border-radius:12px;background:#fff}
        .billing-plan.featured{border-color:#aeb9ff;box-shadow:0 0 0 2px #f0f2ff}
        .billing-plan h3{margin:0 0 8px;font-size:15px}
        .billing-plan p{min-height:35px;margin:0 0 17px;color:#858da0;font-size:11px;line-height:1.6}
        .billing-plan-price{margin-bottom:15px;font-size:26px;font-weight:700}
        .billing-plan-price span{color:#858da0;font-size:11px;font-weight:400}
        .billing-plan ul{display:grid;gap:11px;margin:0 0 20px;padding:0;list-style:none}
        .billing-plan li{display:flex;align-items:flex-start;gap:7px;color:#5d677c;font-size:11px;line-height:1.5}
        .billing-plan li svg{flex-shrink:0;color:#258452}
        .billing-plan .billing-btn{margin-top:auto}
        .billing-modal-backdrop{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:20px;background:rgba(20,28,48,.45)}
        .billing-modal{width:100%;max-width:500px;overflow:hidden;border:1px solid #e7eaf1;border-radius:15px;background:white;box-shadow:0 20px 70px rgba(20,28,48,.2)}
        .billing-modal-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:20px 22px;border-bottom:1px solid #edf0f5}
        .billing-modal-header h2{margin:0;font-size:17px}
        .billing-modal-body{padding:22px}
        .billing-modal-actions{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:9px;margin-top:22px}
        @media(max-width:1050px){.billing-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.billing-plan-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:650px){.billing-page{padding:18px 12px}.billing-heading{flex-direction:column}.billing-heading h1{font-size:23px}.billing-actions{width:100%}.billing-btn{flex:1}.billing-tabs{overflow-x:auto;flex-wrap:nowrap}.billing-tab{white-space:nowrap}.billing-form-grid{grid-template-columns:1fr}.billing-field.full{grid-column:auto}.billing-plan-grid{grid-template-columns:1fr}.billing-footer{align-items:flex-start;flex-direction:column}}
      `}</style>

      <div className="billing-container">
        <div className="billing-breadcrumb">
          <a href="/dashboard">Admin</a><span>/</span>
          <a href="/settings">Settings</a><span>/</span>
          <span>Billing Settings</span>
        </div>

        <header className="billing-heading">
          <div className="billing-heading-main">
            <div className="billing-heading-icon"><CreditCard size={24} /></div>
            <div>
              <h1>Billing Settings</h1>
              <p>
                Manage subscription plans, invoice settings, payment policies,
                billing preferences, and organization revenue records.
              </p>
            </div>
          </div>
          <div className="billing-actions">
            <button type="button" className="billing-btn" onClick={resetDemo}>
              <RefreshCw size={14} />Reset Demo
            </button>
            <button type="button" className="billing-btn" onClick={exportInvoices}>
              <Download size={14} />Export Invoices
            </button>
            <button type="button" className="billing-btn primary" onClick={saveSettings}>
              <CheckCircle2 size={14} />Save Settings
            </button>
          </div>
        </header>

        {notice && (
          <div className="billing-notice" role="status">
            <CheckCircle2 size={17} />
            <span style={{ flex: 1 }}>{notice}</span>
            <button type="button" className="billing-icon-btn" aria-label="Dismiss notification" onClick={() => setNotice("")}><X size={14} /></button>
          </div>
        )}

        <div className="billing-warning">
          <ShieldCheck size={19} />
          <div>
            <strong>Billing administration demo</strong>
            This page currently manages sample data in the browser. Production
            subscriptions, invoice issuance, tax calculations, payment collection,
            refunds, and subscription changes must be processed and verified by
            your backend and payment provider.
          </div>
        </div>

        <section className="billing-metrics">
          <Metric title="Collected Revenue" value={formatMoney(paidRevenue)} caption="Paid demo invoices" icon={<CircleDollarSign size={19} />} tone="green" />
          <Metric title="Pending Payments" value={formatMoney(pendingRevenue)} caption="Awaiting payment" icon={<Wallet size={19} />} tone="orange" />
          <Metric title="Overdue Amount" value={formatMoney(overdueRevenue)} caption="Requires follow-up" icon={<ArrowDownToLine size={19} />} tone="red" />
          <Metric title="Invoice Records" value={String(invoices.length)} caption={`${invoices.filter((invoice) => invoice.status === "Paid").length} marked as paid`} icon={<FileText size={19} />} />
        </section>

        <div className="billing-tabs">
          <button type="button" className={`billing-tab ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}><TrendingUp size={15} />Overview</button>
          <button type="button" className={`billing-tab ${activeTab === "plans" ? "active" : ""}`} onClick={() => setActiveTab("plans")}><BadgeDollarSign size={15} />Subscription Plans</button>
          <button type="button" className={`billing-tab ${activeTab === "invoices" ? "active" : ""}`} onClick={() => setActiveTab("invoices")}><FileText size={15} />Invoices</button>
          <button type="button" className={`billing-tab ${activeTab === "policies" ? "active" : ""}`} onClick={() => setActiveTab("policies")}><Settings2 size={15} />Billing Policies</button>
        </div>

        {activeTab === "overview" && (
          <>
            <section className="billing-card">
              <div className="billing-card-header">
                <div><h2>Billing Overview</h2><p>Summary of billing activity represented by the current sample invoices.</p></div>
                <CalendarDays size={20} color="#5265d9" />
              </div>
              <div className="billing-form-grid">
                <div className="billing-field">
                  <label>Default Currency</label>
                  <select value={settings.currency} onChange={(event) => updateSetting("currency", event.target.value)}>
                    <option value="USD">USD — US Dollar</option>
                    <option value="INR">INR — Indian Rupee</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="GBP">GBP — British Pound</option>
                  </select>
                  <small>Currency display preference for this demo. Production billing requires a consistent currency per invoice.</small>
                </div>
                <div className="billing-field">
                  <label>Default Billing Cycle</label>
                  <select value={settings.billingCycle} onChange={(event) => updateSetting("billingCycle", event.target.value)}>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  <small>Default cycle offered to new subscriptions.</small>
                </div>
              </div>
              <div className="billing-breakdown" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 14, padding: 22 }}>
                <div style={{ padding: 17, border: "1px solid #e7eaf1", borderRadius: 10, background: "#fcfcff" }}>
                  <span style={{ display: "block", marginBottom: 8, color: "#858da0", fontSize: 11 }}>Paid invoices</span>
                  <strong style={{ fontSize: 22 }}>{invoices.filter((invoice) => invoice.status === "Paid").length}</strong>
                </div>
                <div style={{ padding: 17, border: "1px solid #e7eaf1", borderRadius: 10, background: "#fcfcff" }}>
                  <span style={{ display: "block", marginBottom: 8, color: "#858da0", fontSize: 11 }}>Pending invoices</span>
                  <strong style={{ fontSize: 22 }}>{invoices.filter((invoice) => invoice.status === "Pending").length}</strong>
                </div>
                <div style={{ padding: 17, border: "1px solid #e7eaf1", borderRadius: 10, background: "#fcfcff" }}>
                  <span style={{ display: "block", marginBottom: 8, color: "#858da0", fontSize: 11 }}>Overdue invoices</span>
                  <strong style={{ fontSize: 22 }}>{invoices.filter((invoice) => invoice.status === "Overdue").length}</strong>
                </div>
              </div>
              <div className="billing-footer">
                <span>These figures are calculated from sample invoice records, not live accounting data.</span>
                <button type="button" className="billing-btn primary" onClick={() => setActiveTab("invoices")}>View Invoices <ArrowUpRight size={14} /></button>
              </div>
            </section>

            <section className="billing-card">
              <div className="billing-card-header">
                <div><h2>Recent Invoices</h2><p>Latest billing records and their current statuses.</p></div>
                <button type="button" className="billing-btn" onClick={() => setActiveTab("invoices")}>View all</button>
              </div>
              <div className="billing-table-wrap">
                <table className="billing-table">
                  <thead><tr><th>Invoice</th><th>Organization</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                  <tbody>
                    {invoices.slice(0, 4).map((invoice) => (
                      <tr key={invoice.id}>
                        <td><strong>{invoice.id}</strong></td>
                        <td>{invoice.organization}</td>
                        <td>{invoice.date}</td>
                        <td><strong>{formatMoney(invoice.amount)}</strong></td>
                        <td><span className={`billing-badge ${invoice.status.toLowerCase()}`}>{invoice.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {activeTab === "plans" && (
          <section className="billing-card">
            <div className="billing-card-header">
              <div><h2>Subscription Plans</h2><p>Review illustrative pricing tiers for ModelNow subscriptions.</p></div>
              <BadgeDollarSign size={21} color="#5265d9" />
            </div>
            <div className="billing-plan-grid">
              {plans.map((plan) => (
                <div key={plan.name} className={`billing-plan ${plan.name === "Pro" ? "featured" : ""}`}>
                  <h3>{plan.name}</h3>
                  <p>{plan.description}</p>
                  <div className="billing-plan-price">
                    {formatMoney(plan.price)}<span> / month</span>
                  </div>
                  <ul>
                    {plan.features.map((feature) => (
                      <li key={feature}><CheckCircle2 size={14} />{feature}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className={`billing-btn ${plan.name === "Pro" ? "primary" : ""}`}
                    onClick={() => setNotice(`${plan.name} is an illustrative plan. Connect the subscription backend before activating it.`)}
                  >
                    {plan.name === "Enterprise" ? "Contact Sales" : "View Plan"}
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="billing-footer">
              <span>Prices are placeholders. Confirm product pricing and entitlements before launch.</span>
              <button type="button" className="billing-btn" onClick={() => setActiveTab("policies")}>Plan Policies</button>
            </div>
          </section>
        )}

        {activeTab === "invoices" && (
          <section className="billing-card">
            <div className="billing-card-header">
              <div><h2>Invoice Management</h2><p>Search, filter, export, and update the status of sample invoice records.</p></div>
              <button type="button" className="billing-btn primary" onClick={() => setShowInvoiceModal(true)}><Plus size={14} />Create Invoice</button>
            </div>
            <div className="billing-toolbar">
              <div className="billing-search">
                <Search size={16} />
                <input aria-label="Search invoices" placeholder="Search invoice or organization..." value={search} onChange={(event) => setSearch(event.target.value)} />
              </div>
              <select aria-label="Filter invoices by status" className="billing-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="All">All statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
                <option value="Draft">Draft</option>
              </select>
              <button type="button" className="billing-btn" onClick={exportInvoices}><Download size={14} />Export</button>
            </div>
            <div className="billing-table-wrap">
              <table className="billing-table">
                <thead><tr><th>Invoice ID</th><th>Organization</th><th>Plan</th><th>Date</th><th>Amount</th><th>Status</th><th>Change Status</th></tr></thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td><strong>{invoice.id}</strong></td>
                      <td>{invoice.organization}</td>
                      <td>{invoice.plan}</td>
                      <td>{invoice.date}</td>
                      <td><strong>{formatMoney(invoice.amount)}</strong></td>
                      <td><span className={`billing-badge ${invoice.status.toLowerCase()}`}>{invoice.status}</span></td>
                      <td>
                        <select
                          aria-label={`Change status for ${invoice.id}`}
                          className="billing-filter"
                          value={invoice.status}
                          onChange={(event) => updateInvoiceStatus(invoice.id, event.target.value as Invoice["status"])}
                        >
                          <option value="Draft">Draft</option>
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredInvoices.length === 0 && <div className="billing-empty">No invoices match your search or filter.</div>}
            </div>
            <div className="billing-footer">
              <span>Showing {filteredInvoices.length} of {invoices.length} invoices</span>
              <span>Status changes are local demo changes only.</span>
            </div>
          </section>
        )}

        {activeTab === "policies" && (
          <>
            <section className="billing-card">
              <div className="billing-card-header">
                <div><h2>Invoice &amp; Payment Policies</h2><p>Configure defaults for invoices, subscription renewals, and payment collection.</p></div>
                <Settings2 size={21} color="#5265d9" />
              </div>
              <div className="billing-form-grid">
                <div className="billing-field">
                  <label htmlFor="invoicePrefix">Invoice Number Prefix</label>
                  <input id="invoicePrefix" value={settings.invoicePrefix} onChange={(event) => updateSetting("invoicePrefix", event.target.value)} maxLength={12} />
                  <small>Prefix for future invoice numbers.</small>
                </div>
                <div className="billing-field">
                  <label htmlFor="paymentTerms">Payment Terms (Days)</label>
                  <input id="paymentTerms" type="number" min="0" max="365" value={settings.paymentTerms} onChange={(event) => updateSetting("paymentTerms", event.target.value)} />
                  <small>Number of days before payment is due.</small>
                </div>
                <div className="billing-field">
                  <label htmlFor="gracePeriod">Grace Period (Days)</label>
                  <input id="gracePeriod" type="number" min="0" max="90" value={settings.gracePeriod} onChange={(event) => updateSetting("gracePeriod", event.target.value)} />
                  <small>Grace period before configured service restrictions.</small>
                </div>
                <div className="billing-field">
                  <label htmlFor="taxRate">Tax Rate (%)</label>
                  <input id="taxRate" type="number" min="0" max="100" step="0.01" value={settings.taxRate} onChange={(event) => updateSetting("taxRate", event.target.value)} disabled={!settings.taxEnabled} />
                  <small>Configure only after validating applicable tax rules with your finance team.</small>
                </div>
              </div>
              <Toggle title="Automatic Subscription Renewal" description="Offer automatic renewal for eligible subscriptions." checked={settings.autoRenew} onChange={(value) => updateSetting("autoRenew", value)} />
              <Toggle title="Prorate Subscription Changes" description="Calculate prorated charges or credits when plans change mid-cycle." checked={settings.prorateChanges} onChange={(value) => updateSetting("prorateChanges", value)} />
              <Toggle title="Automatically Issue Invoices" description="Generate invoices through the billing backend when billing events occur." checked={settings.issueInvoicesAutomatically} onChange={(value) => updateSetting("issueInvoicesAutomatically", value)} />
              <Toggle title="Send Invoice Emails" description="Send invoice notifications to configured billing contacts." checked={settings.sendInvoices} onChange={(value) => updateSetting("sendInvoices", value)} />
              <Toggle title="Payment Reminder Emails" description="Send reminders for pending and overdue invoices." checked={settings.sendPaymentReminders} onChange={(value) => updateSetting("sendPaymentReminders", value)} />
              <Toggle title="Allow Manual Payments" description="Allow approved administrators to record supported offline payment events." checked={settings.allowManualPayments} onChange={(value) => updateSetting("allowManualPayments", value)} />
              <Toggle title="Require a Payment Method" description="Require a valid payment method where the selected plan or policy needs one." checked={settings.requirePaymentMethod} onChange={(value) => updateSetting("requirePaymentMethod", value)} />
              <Toggle title="Enable Tax Calculation" description="Enable tax calculation only after tax configuration is validated server-side." checked={settings.taxEnabled} onChange={(value) => updateSetting("taxEnabled", value)} />
              <Toggle title="Failed Payment Recovery" description="Enable a backend-managed retry and notification workflow for failed payments." checked={settings.dunningEnabled} onChange={(value) => updateSetting("dunningEnabled", value)} />
              <div className="billing-footer">
                <span>Policy changes should be validated and audited by the billing backend.</span>
                <button type="button" className="billing-btn primary" onClick={saveSettings}><CheckCircle2 size={14} />Save Policies</button>
              </div>
            </section>

            <section className="billing-card">
              <div className="billing-card-header">
                <div><h2>Payment Provider Integration</h2><p>Production connection status and responsibilities.</p></div>
                <ShieldCheck size={21} color="#5265d9" />
              </div>
              <div style={{ padding: 22, display: "grid", gap: 16 }}>
                {[
                  ["Payment gateway", "Connect your chosen provider through a secure server-side integration."],
                  ["Webhook verification", "Verify provider signatures before updating payment or subscription status."],
                  ["Idempotency", "Prevent duplicate charges and duplicate invoice events on retries."],
                  ["Audit trail", "Record administrative changes, payment events, refunds, and subscription transitions."],
                ].map(([title, description]) => (
                  <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ display: "grid", placeItems: "center", width: 32, height: 32, flexShrink: 0, borderRadius: 9, background: "#edf0ff", color: "#5265d9" }}><ShieldCheck size={16} /></div>
                    <div><strong style={{ display: "block", marginBottom: 5, fontSize: 12 }}>{title}</strong><p style={{ margin: 0, color: "#858da0", fontSize: 11, lineHeight: 1.7 }}>{description}</p></div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        <div className="billing-footer" style={{ padding: "12px 0 30px", borderTop: 0 }}>
          <span>ModelNow Admin · Billing Settings</span>
          <button type="button" className="billing-btn primary" onClick={saveSettings}><CheckCircle2 size={14} />Save All Changes</button>
        </div>
      </div>

      {showInvoiceModal && (
        <div className="billing-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowInvoiceModal(false);
        }}>
          <section className="billing-modal" role="dialog" aria-modal="true" aria-labelledby="create-invoice-title">
            <div className="billing-modal-header">
              <h2 id="create-invoice-title">Create Draft Invoice</h2>
              <button type="button" className="billing-icon-btn" aria-label="Close dialog" onClick={() => setShowInvoiceModal(false)}><X size={14} /></button>
            </div>
            <div className="billing-modal-body">
              <div style={{ display: "grid", gap: 16 }}>
                <div className="billing-field">
                  <label htmlFor="invoiceOrg">Organization Name</label>
                  <input id="invoiceOrg" value={draft.organization} onChange={(event) => setDraft((current) => ({ ...current, organization: event.target.value }))} placeholder="Enter organization name" />
                </div>
                <div className="billing-field">
                  <label htmlFor="invoiceAmount">Amount ({settings.currency})</label>
                  <input id="invoiceAmount" type="number" min="0" step="0.01" value={draft.amount} onChange={(event) => setDraft((current) => ({ ...current, amount: event.target.value }))} placeholder="0.00" />
                </div>
                <div className="billing-field">
                  <label htmlFor="invoicePlan">Subscription Plan</label>
                  <select id="invoicePlan" value={draft.plan} onChange={(event) => setDraft((current) => ({ ...current, plan: event.target.value }))}>
                    {plans.map((plan) => <option key={plan.name} value={plan.name}>{plan.name}</option>)}
                  </select>
                </div>
                <div className="billing-field">
                  <label htmlFor="invoiceDate">Invoice Date</label>
                  <input id="invoiceDate" type="date" value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} />
                </div>
              </div>
              <div className="billing-modal-actions">
                <button type="button" className="billing-btn" onClick={() => setShowInvoiceModal(false)}>Cancel</button>
                <button type="button" className="billing-btn primary" onClick={createInvoice}><Plus size={14} />Create Draft</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
