
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowDownToLine,
  ArrowUpRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Download,
  FileText,
  Filter,
  History,
  MoreHorizontal,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";

type BillingStatus = "Paid" | "Pending" | "Overdue" | "Draft";
type BillingPlan = "Starter" | "Business" | "Enterprise";

type Invoice = {
  id: string;
  organization: string;
  plan: BillingPlan;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: BillingStatus;
};

type BillingAccount = {
  id: string;
  organization: string;
  plan: BillingPlan;
  monthlySpend: number;
  paymentMethod: string;
  renewalDate: string;
  status: "Active" | "Suspended" | "Trial";
};

const initialInvoices: Invoice[] = [
  {
    id: "INV-2026-1042",
    organization: "Acme Corporation",
    plan: "Enterprise",
    amount: 2499,
    issueDate: "Nov 01, 2026",
    dueDate: "Nov 15, 2026",
    status: "Paid",
  },
  {
    id: "INV-2026-1041",
    organization: "Northstar AI",
    plan: "Business",
    amount: 849,
    issueDate: "Nov 01, 2026",
    dueDate: "Nov 15, 2026",
    status: "Pending",
  },
  {
    id: "INV-2026-1040",
    organization: "Vertex Labs",
    plan: "Enterprise",
    amount: 1899,
    issueDate: "Oct 28, 2026",
    dueDate: "Nov 10, 2026",
    status: "Paid",
  },
  {
    id: "INV-2026-1039",
    organization: "BrightPath",
    plan: "Starter",
    amount: 99,
    issueDate: "Oct 25, 2026",
    dueDate: "Nov 05, 2026",
    status: "Overdue",
  },
  {
    id: "INV-2026-1038",
    organization: "CloudPeak Systems",
    plan: "Business",
    amount: 699,
    issueDate: "Oct 20, 2026",
    dueDate: "Nov 05, 2026",
    status: "Paid",
  },
  {
    id: "INV-2026-1037",
    organization: "NovaWorks",
    plan: "Starter",
    amount: 49,
    issueDate: "Oct 15, 2026",
    dueDate: "Oct 30, 2026",
    status: "Draft",
  },
];

const initialAccounts: BillingAccount[] = [
  {
    id: "org_001",
    organization: "Acme Corporation",
    plan: "Enterprise",
    monthlySpend: 2499,
    paymentMethod: "Visa •••• 4242",
    renewalDate: "Dec 01, 2026",
    status: "Active",
  },
  {
    id: "org_002",
    organization: "Northstar AI",
    plan: "Business",
    monthlySpend: 849,
    paymentMethod: "Mastercard •••• 8210",
    renewalDate: "Dec 01, 2026",
    status: "Active",
  },
  {
    id: "org_003",
    organization: "Vertex Labs",
    plan: "Enterprise",
    monthlySpend: 1899,
    paymentMethod: "Visa •••• 9071",
    renewalDate: "Dec 05, 2026",
    status: "Active",
  },
  {
    id: "org_004",
    organization: "BrightPath",
    plan: "Starter",
    monthlySpend: 99,
    paymentMethod: "No payment method",
    renewalDate: "Nov 25, 2026",
    status: "Suspended",
  },
  {
    id: "org_005",
    organization: "CloudPeak Systems",
    plan: "Business",
    monthlySpend: 699,
    paymentMethod: "Visa •••• 5531",
    renewalDate: "Dec 10, 2026",
    status: "Active",
  },
];

const currencyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const numberFormat = new Intl.NumberFormat("en-US");

export default function OrganizationBillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [accounts, setAccounts] =
    useState<BillingAccount[]>(initialAccounts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [planFilter, setPlanFilter] = useState("All plans");
  const [activeTab, setActiveTab] = useState<"invoices" | "accounts">(
    "invoices",
  );
  const [notice, setNotice] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(
    null,
  );
  const [selectedAccount, setSelectedAccount] =
    useState<BillingAccount | null>(null);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [newOrganization, setNewOrganization] = useState("");
  const [newPlan, setNewPlan] = useState<BillingPlan>("Business");
  const [newAmount, setNewAmount] = useState("499");
  const [newDueDate, setNewDueDate] = useState("2026-12-15");

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const matchesSearch =
        !query ||
        invoice.id.toLowerCase().includes(query) ||
        invoice.organization.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All statuses" ||
        invoice.status === statusFilter;

      const matchesPlan =
        planFilter === "All plans" || invoice.plan === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [invoices, search, statusFilter, planFilter]);

  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return accounts.filter((account) => {
      const matchesSearch =
        !query ||
        account.organization.toLowerCase().includes(query) ||
        account.id.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All statuses" ||
        account.status === statusFilter;

      const matchesPlan =
        planFilter === "All plans" || account.plan === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [accounts, search, statusFilter, planFilter]);

  const paidRevenue = invoices
    .filter((invoice) => invoice.status === "Paid")
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const outstandingAmount = invoices
    .filter(
      (invoice) =>
        invoice.status === "Pending" || invoice.status === "Overdue",
    )
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const overdueCount = invoices.filter(
    (invoice) => invoice.status === "Overdue",
  ).length;

  const activeAccountCount = accounts.filter(
    (account) => account.status === "Active",
  ).length;

  const monthlyRecurringRevenue = accounts
    .filter((account) => account.status === "Active")
    .reduce((sum, account) => sum + account.monthlySpend, 0);

  function exportInvoices() {
    const headers = [
      "Invoice ID",
      "Organization",
      "Plan",
      "Amount USD",
      "Issue Date",
      "Due Date",
      "Status",
    ];

    const rows = filteredInvoices.map((invoice) => [
      invoice.id,
      invoice.organization,
      invoice.plan,
      invoice.amount,
      invoice.issueDate,
      invoice.dueDate,
      invoice.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-organization-billing.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("Filtered billing report exported.");
  }

  function createInvoice(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amount = Number(newAmount);

    if (!newOrganization.trim() || !Number.isFinite(amount) || amount <= 0) {
      setNotice("Enter a valid organization name and positive invoice amount.");
      return;
    }

    const formattedDueDate = new Date(
      `${newDueDate}T12:00:00`,
    ).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    });

    const invoice: Invoice = {
      id: `INV-DEMO-${Date.now().toString().slice(-6)}`,
      organization: newOrganization.trim(),
      plan: newPlan,
      amount,
      issueDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      dueDate: formattedDueDate,
      status: "Draft",
    };

    setInvoices((current) => [invoice, ...current]);
    setShowCreateInvoice(false);
    setNewOrganization("");
    setNewAmount("499");
    setNewPlan("Business");
    setNotice(
      "Draft invoice added to this demo page. No real invoice or payment was created.",
    );
  }

  function updateInvoiceStatus(id: string, status: BillingStatus) {
    setInvoices((current) =>
      current.map((invoice) =>
        invoice.id === id ? { ...invoice, status } : invoice,
      ),
    );
    setNotice("Invoice status updated in the demo.");
    setSelectedInvoice(null);
  }

  function changeAccountStatus(
    id: string,
    status: BillingAccount["status"],
  ) {
    setAccounts((current) =>
      current.map((account) =>
        account.id === id ? { ...account, status } : account,
      ),
    );
    setNotice(`Billing account status changed to ${status}.`);
    setSelectedAccount(null);
  }

  function refreshBilling() {
    setNotice(
      "Billing view refreshed. Displaying the current sample billing records.",
    );
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("All statuses");
    setPlanFilter("All plans");
  }

  return (
    <main className="org-billing-page">
      <style>{`
        * { box-sizing: border-box; }
        .org-billing-page {
          min-height: 100vh; padding: 30px; background: #f7f8fc;
          color: #182238; font-family: Arial, Helvetica, sans-serif;
        }
        .org-billing-container { max-width: 1480px; margin: 0 auto; }
        .org-billing-breadcrumb { color: #7e899c; font-size: 12px; margin-bottom: 15px; }
        .org-billing-breadcrumb span { color: #315fe8; }
        .org-billing-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          gap: 18px; flex-wrap: wrap; margin-bottom: 25px;
        }
        .org-billing-title { margin: 0 0 8px; font-size: 27px; letter-spacing: -.7px; font-weight: 750; }
        .org-billing-subtitle { margin: 0; color: #7c879c; font-size: 13px; line-height: 1.6; }
        .org-billing-actions { display: flex; gap: 9px; flex-wrap: wrap; }
        .org-billing-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 10px 13px; border: 1px solid #dfe4ed; border-radius: 9px;
          background: #fff; color: #39465e; font-size: 12px; font-weight: 650; cursor: pointer;
        }
        .org-billing-btn:hover { background: #f0f4ff; }
        .org-billing-btn.primary { background: #315fe8; color: #fff; border-color: #315fe8; }
        .org-billing-btn.primary:hover { background: #254fcf; }
        .org-billing-notice {
          display: flex; justify-content: space-between; gap: 10px; padding: 11px 14px;
          margin-bottom: 18px; border-radius: 9px; border: 1px solid #c9d9ff;
          background: #eff4ff; color: #244dbb; font-size: 12px; line-height: 1.5;
        }
        .org-billing-dismiss { border: 0; background: transparent; color: inherit; cursor: pointer; }
        .org-billing-stats {
          display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px; margin-bottom: 22px;
        }
        .org-billing-stat { padding: 19px; border: 1px solid #e8ebf2; border-radius: 13px; background: #fff; }
        .org-billing-stat-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 17px; }
        .org-billing-stat-label { color: #778298; font-size: 12px; }
        .org-billing-stat-icon {
          width: 35px; height: 35px; border-radius: 10px; display: grid;
          place-items: center; background: #edf2ff; color: #315fe8;
        }
        .org-billing-stat-icon.green { background: #eaf8ef; color: #168453; }
        .org-billing-stat-icon.amber { background: #fff5df; color: #9a6400; }
        .org-billing-stat-icon.red { background: #fff0ee; color: #c34438; }
        .org-billing-stat-value { font-size: 25px; font-weight: 750; letter-spacing: -.6px; margin-bottom: 7px; overflow-wrap: anywhere; }
        .org-billing-stat-note { color: #8b95a7; font-size: 11px; line-height: 1.5; }
        .org-billing-callout {
          display: flex; align-items: flex-start; gap: 11px; padding: 14px 16px;
          margin-bottom: 21px; border: 1px solid #e0e7fa; border-radius: 11px;
          background: #f0f4ff; color: #46577d; font-size: 11px; line-height: 1.6;
        }
        .org-billing-callout strong { color: #263c75; }
        .org-billing-panel { border: 1px solid #e8ebf2; border-radius: 13px; background: #fff; overflow: visible; }
        .org-billing-panel-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          gap: 16px; flex-wrap: wrap; padding: 21px; border-bottom: 1px solid #edf0f5;
        }
        .org-billing-panel-title { margin: 0 0 6px; font-size: 15px; font-weight: 750; }
        .org-billing-panel-description { margin: 0; color: #8993a5; font-size: 11px; line-height: 1.5; }
        .org-billing-tabs { display: flex; gap: 6px; padding: 5px; border-radius: 9px; background: #f2f4f9; }
        .org-billing-tab {
          padding: 9px 12px; border: 0; border-radius: 7px; background: transparent;
          color: #707c91; font-size: 11px; font-weight: 650; cursor: pointer;
        }
        .org-billing-tab.active { background: #fff; color: #315fe8; box-shadow: 0 1px 4px #18223812; }
        .org-billing-filters { display: flex; gap: 8px; flex-wrap: wrap; }
        .org-billing-search-wrap { position: relative; }
        .org-billing-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #929bad; }
        .org-billing-search {
          width: 210px; padding: 10px 10px 10px 31px; border: 1px solid #e0e5ee;
          border-radius: 8px; outline: none; font-size: 11px; color: #263248;
        }
        .org-billing-select {
          padding: 10px 11px; border: 1px solid #e0e5ee; border-radius: 8px;
          background: #fff; color: #44516a; font-size: 11px; outline: none;
        }
        .org-billing-search:focus, .org-billing-select:focus, .org-billing-input:focus { border-color: #7898ff; }
        .org-billing-table-scroll { overflow-x: auto; }
        .org-billing-table { width: 100%; border-collapse: collapse; white-space: nowrap; }
        .org-billing-table th {
          padding: 13px 17px; text-align: left; background: #fafbfe;
          color: #8992a4; font-size: 10px; font-weight: 700;
        }
        .org-billing-table td { padding: 15px 17px; border-top: 1px solid #eff1f6; color: #4c5870; font-size: 11px; }
        .org-billing-org { color: #202b40; font-size: 12px; font-weight: 700; }
        .org-billing-sub { color: #929bad; font-size: 10px; margin-top: 5px; }
        .org-billing-plan { display: inline-flex; padding: 5px 8px; border-radius: 6px; background: #f0f3fa; color: #5a6680; font-size: 10px; font-weight: 650; }
        .org-billing-status {
          display: inline-flex; align-items: center; gap: 6px; padding: 5px 8px;
          border-radius: 20px; font-size: 10px; font-weight: 650;
        }
        .org-billing-status.Paid, .org-billing-status.Active { background: #eaf8ef; color: #167747; }
        .org-billing-status.Pending, .org-billing-status.Trial { background: #fff5df; color: #9a6400; }
        .org-billing-status.Overdue, .org-billing-status.Suspended { background: #fff0ee; color: #bd3f34; }
        .org-billing-status.Draft { background: #f0f3fa; color: #68748a; }
        .org-billing-status-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
        .org-billing-amount { color: #202b40; font-weight: 750; }
        .org-billing-payment { display: flex; align-items: center; gap: 7px; }
        .org-billing-icon-btn {
          display: inline-grid; place-items: center; width: 30px; height: 30px;
          border: 1px solid #e3e7ef; border-radius: 7px; background: #fff; color: #65718a; cursor: pointer;
        }
        .org-billing-icon-btn:hover { background: #f1f4fb; color: #315fe8; }
        .org-billing-empty { padding: 38px 20px; text-align: center; color: #8790a3; font-size: 12px; }
        .org-billing-footer {
          display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap;
          padding: 14px 20px; border-top: 1px solid #edf0f5; color: #8790a3; font-size: 11px;
        }
        .org-billing-modal-backdrop {
          position: fixed; inset: 0; z-index: 100; display: grid; place-items: center;
          padding: 18px; background: rgba(15, 23, 42, .48);
        }
        .org-billing-modal {
          width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto;
          border-radius: 15px; background: #fff; box-shadow: 0 25px 80px #0002;
        }
        .org-billing-modal-header {
          display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;
          padding: 22px; border-bottom: 1px solid #edf0f5;
        }
        .org-billing-modal-title { margin: 0 0 6px; font-size: 18px; font-weight: 750; }
        .org-billing-modal-subtitle { margin: 0; color: #8490a4; font-size: 12px; line-height: 1.5; }
        .org-billing-modal-body { padding: 22px; }
        .org-billing-field { display: flex; flex-direction: column; gap: 7px; margin-bottom: 17px; }
        .org-billing-field label { font-size: 12px; color: #46526a; font-weight: 650; }
        .org-billing-input {
          width: 100%; padding: 11px 12px; border: 1px solid #dfe4ed;
          border-radius: 8px; outline: none; background: #fff; color: #202b40; font-size: 12px;
        }
        .org-billing-help { color: #8993a5; font-size: 10px; line-height: 1.5; }
        .org-billing-modal-footer {
          display: flex; justify-content: flex-end; gap: 9px; padding: 16px 22px;
          border-top: 1px solid #edf0f5; background: #fbfcfe; border-radius: 0 0 15px 15px;
        }
        .org-billing-details-row {
          display: flex; justify-content: space-between; gap: 16px; padding: 12px 0;
          border-bottom: 1px solid #edf0f5; font-size: 12px;
        }
        .org-billing-details-row:last-child { border-bottom: 0; }
        .org-billing-detail-label { color: #8790a3; }
        .org-billing-detail-value { color: #253149; font-weight: 650; text-align: right; overflow-wrap: anywhere; }
        @media (max-width: 1050px) { .org-billing-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 650px) {
          .org-billing-page { padding: 17px; }
          .org-billing-title { font-size: 23px; }
          .org-billing-stats { grid-template-columns: 1fr; }
          .org-billing-panel-header { padding: 16px; }
          .org-billing-filters { width: 100%; }
          .org-billing-search-wrap { width: 100%; }
          .org-billing-search { width: 100%; }
          .org-billing-filters select { flex: 1; min-width: 0; }
        }
      `}</style>

      <div className="org-billing-container">
        <div className="org-billing-breadcrumb">
          Organizations / <span>Billing</span>
        </div>

        <header className="org-billing-header">
          <div>
            <h1 className="org-billing-title">Organization Billing</h1>
            <p className="org-billing-subtitle">
              Manage organization plans, invoices, payment status, and recurring spend.
            </p>
          </div>
          <div className="org-billing-actions">
            <button className="org-billing-btn" onClick={refreshBilling}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button className="org-billing-btn" onClick={exportInvoices}>
              <Download size={14} /> Export CSV
            </button>
            <button
              className="org-billing-btn primary"
              onClick={() => setShowCreateInvoice(true)}
            >
              <Plus size={15} /> Create invoice
            </button>
          </div>
        </header>

        {notice && (
          <div className="org-billing-notice" role="status">
            <span>{notice}</span>
            <button
              className="org-billing-dismiss"
              aria-label="Dismiss notification"
              onClick={() => setNotice("")}
            >
              <X size={15} />
            </button>
          </div>
        )}

        <section className="org-billing-stats">
          <div className="org-billing-stat">
            <div className="org-billing-stat-top">
              <span className="org-billing-stat-label">Paid invoices</span>
              <span className="org-billing-stat-icon green"><CheckCircle2 size={18} /></span>
            </div>
            <div className="org-billing-stat-value">{currencyFormat.format(paidRevenue)}</div>
            <div className="org-billing-stat-note">Total of invoices marked paid in the sample</div>
          </div>

          <div className="org-billing-stat">
            <div className="org-billing-stat-top">
              <span className="org-billing-stat-label">Outstanding balance</span>
              <span className="org-billing-stat-icon amber"><Wallet size={18} /></span>
            </div>
            <div className="org-billing-stat-value">{currencyFormat.format(outstandingAmount)}</div>
            <div className="org-billing-stat-note">Pending and overdue invoice amounts</div>
          </div>

          <div className="org-billing-stat">
            <div className="org-billing-stat-top">
              <span className="org-billing-stat-label">Monthly recurring spend</span>
              <span className="org-billing-stat-icon"><Activity size={18} /></span>
            </div>
            <div className="org-billing-stat-value">{currencyFormat.format(monthlyRecurringRevenue)}</div>
            <div className="org-billing-stat-note">Active billing accounts only</div>
          </div>

          <div className="org-billing-stat">
            <div className="org-billing-stat-top">
              <span className="org-billing-stat-label">Overdue invoices</span>
              <span className="org-billing-stat-icon red"><AlertCircle size={18} /></span>
            </div>
            <div className="org-billing-stat-value">{numberFormat.format(overdueCount)}</div>
            <div className="org-billing-stat-note">
              {numberFormat.format(activeAccountCount)} active billing accounts
            </div>
          </div>
        </section>

        <div className="org-billing-callout">
          <ShieldCheck size={17} />
          <div>
            <strong>Billing preview mode.</strong> The figures, invoice records,
            and payment method labels below are sample data. This page does not
            charge customers, process payments, or contact a payment provider.
            Connect a trusted backend and payment provider before production use.
          </div>
        </div>

        <section className="org-billing-panel">
          <div className="org-billing-panel-header">
            <div>
              <h2 className="org-billing-panel-title">
                {activeTab === "invoices" ? "Invoices" : "Billing accounts"}
              </h2>
              <p className="org-billing-panel-description">
                {activeTab === "invoices"
                  ? "Review invoice amounts, due dates, and payment status."
                  : "Review organization plans, renewal dates, and billing status."}
              </p>
            </div>

            <div className="org-billing-tabs">
              <button
                className={`org-billing-tab ${activeTab === "invoices" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("invoices");
                  setStatusFilter("All statuses");
                }}
              >
                <Receipt size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
                Invoices
              </button>
              <button
                className={`org-billing-tab ${activeTab === "accounts" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("accounts");
                  setStatusFilter("All statuses");
                }}
              >
                <Building2 size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
                Billing accounts
              </button>
            </div>
          </div>

          <div className="org-billing-panel-header">
            <div className="org-billing-filters">
              <div className="org-billing-search-wrap">
                <Search size={14} className="org-billing-search-icon" />
                <input
                  className="org-billing-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search invoices or organizations..."
                  aria-label="Search billing records"
                />
              </div>

              <select
                className="org-billing-select"
                value={planFilter}
                onChange={(event) => setPlanFilter(event.target.value)}
                aria-label="Filter by plan"
              >
                <option>All plans</option>
                <option>Starter</option>
                <option>Business</option>
                <option>Enterprise</option>
              </select>

              <select
                className="org-billing-select"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter by status"
              >
                <option>All statuses</option>
                {activeTab === "invoices" ? (
                  <>
                    <option>Paid</option>
                    <option>Pending</option>
                    <option>Overdue</option>
                    <option>Draft</option>
                  </>
                ) : (
                  <>
                    <option>Active</option>
                    <option>Suspended</option>
                    <option>Trial</option>
                  </>
                )}
              </select>

              <button className="org-billing-btn" onClick={resetFilters}>
                <Filter size={13} /> Clear
              </button>
            </div>
          </div>

          {activeTab === "invoices" ? (
            <>
              <div className="org-billing-table-scroll">
                <table className="org-billing-table">
                  <thead>
                    <tr>
                      <th>INVOICE</th>
                      <th>ORGANIZATION</th>
                      <th>PLAN</th>
                      <th>ISSUED</th>
                      <th>DUE DATE</th>
                      <th>AMOUNT</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td>
                          <div className="org-billing-org">{invoice.id}</div>
                          <div className="org-billing-sub">Invoice record</div>
                        </td>
                        <td>{invoice.organization}</td>
                        <td><span className="org-billing-plan">{invoice.plan}</span></td>
                        <td>{invoice.issueDate}</td>
                        <td>{invoice.dueDate}</td>
                        <td><span className="org-billing-amount">{currencyFormat.format(invoice.amount)}</span></td>
                        <td>
                          <span className={`org-billing-status ${invoice.status}`}>
                            <span className="org-billing-status-dot" />
                            {invoice.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="org-billing-icon-btn"
                            onClick={() => setSelectedInvoice(invoice)}
                            aria-label={`View ${invoice.id}`}
                            title="View invoice"
                          >
                            <FileText size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredInvoices.length === 0 && (
                      <tr>
                        <td colSpan={8}>
                          <div className="org-billing-empty">No invoices match your filters.</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="org-billing-footer">
                <span>Showing {filteredInvoices.length} of {invoices.length} invoices</span>
                <span>Currency: USD · Sample data</span>
              </div>
            </>
          ) : (
            <>
              <div className="org-billing-table-scroll">
                <table className="org-billing-table">
                  <thead>
                    <tr>
                      <th>ORGANIZATION</th>
                      <th>PLAN</th>
                      <th>MONTHLY SPEND</th>
                      <th>PAYMENT METHOD</th>
                      <th>NEXT RENEWAL</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((account) => (
                      <tr key={account.id}>
                        <td>
                          <div className="org-billing-org">{account.organization}</div>
                          <div className="org-billing-sub">{account.id}</div>
                        </td>
                        <td><span className="org-billing-plan">{account.plan}</span></td>
                        <td><span className="org-billing-amount">{currencyFormat.format(account.monthlySpend)}</span></td>
                        <td>
                          <span className="org-billing-payment">
                            <CreditCard size={13} />
                            {account.paymentMethod}
                          </span>
                        </td>
                        <td>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <CalendarDays size={12} />
                            {account.renewalDate}
                          </span>
                        </td>
                        <td>
                          <span className={`org-billing-status ${account.status}`}>
                            <span className="org-billing-status-dot" />
                            {account.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="org-billing-icon-btn"
                            onClick={() => setSelectedAccount(account)}
                            aria-label={`View billing for ${account.organization}`}
                            title="View billing account"
                          >
                            <FileText size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredAccounts.length === 0 && (
                      <tr>
                        <td colSpan={7}>
                          <div className="org-billing-empty">No billing accounts match your filters.</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="org-billing-footer">
                <span>Showing {filteredAccounts.length} of {accounts.length} billing accounts</span>
                <span>Renewals are illustrative · no payment provider connected</span>
              </div>
            </>
          )}
        </section>

        {showCreateInvoice && (
          <div className="org-billing-modal-backdrop" onClick={() => setShowCreateInvoice(false)}>
            <section
              className="org-billing-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="org-billing-create-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="org-billing-modal-header">
                <div>
                  <h2 className="org-billing-modal-title" id="org-billing-create-title">Create draft invoice</h2>
                  <p className="org-billing-modal-subtitle">
                    Add a sample invoice record for review.
                  </p>
                </div>
                <button className="org-billing-icon-btn" onClick={() => setShowCreateInvoice(false)} aria-label="Close dialog">
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={createInvoice}>
                <div className="org-billing-modal-body">
                  <div className="org-billing-field">
                    <label htmlFor="billing-organization">Organization</label>
                    <input
                      id="billing-organization"
                      className="org-billing-input"
                      value={newOrganization}
                      onChange={(event) => setNewOrganization(event.target.value)}
                      placeholder="Enter organization name"
                      maxLength={100}
                      required
                    />
                  </div>

                  <div className="org-billing-field">
                    <label htmlFor="billing-plan">Plan</label>
                    <select
                      id="billing-plan"
                      className="org-billing-input"
                      value={newPlan}
                      onChange={(event) => setNewPlan(event.target.value as BillingPlan)}
                    >
                      <option>Starter</option>
                      <option>Business</option>
                      <option>Enterprise</option>
                    </select>
                  </div>

                  <div className="org-billing-field">
                    <label htmlFor="billing-amount">Amount (USD)</label>
                    <input
                      id="billing-amount"
                      className="org-billing-input"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={newAmount}
                      onChange={(event) => setNewAmount(event.target.value)}
                      required
                    />
                  </div>

                  <div className="org-billing-field">
                    <label htmlFor="billing-due-date">Due date</label>
                    <input
                      id="billing-due-date"
                      className="org-billing-input"
                      type="date"
                      value={newDueDate}
                      onChange={(event) => setNewDueDate(event.target.value)}
                      required
                    />
                    <span className="org-billing-help">
                      This form creates a local draft only. It does not send an invoice or charge a customer.
                    </span>
                  </div>
                </div>

                <div className="org-billing-modal-footer">
                  <button type="button" className="org-billing-btn" onClick={() => setShowCreateInvoice(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="org-billing-btn primary">
                    <Plus size={14} /> Add draft
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {selectedInvoice && (
          <div className="org-billing-modal-backdrop" onClick={() => setSelectedInvoice(null)}>
            <section className="org-billing-modal" role="dialog" aria-modal="true" aria-labelledby="org-billing-invoice-title" onClick={(event) => event.stopPropagation()}>
              <div className="org-billing-modal-header">
                <div>
                  <h2 className="org-billing-modal-title" id="org-billing-invoice-title">{selectedInvoice.id}</h2>
                  <p className="org-billing-modal-subtitle">Invoice summary and demo status controls.</p>
                </div>
                <button className="org-billing-icon-btn" onClick={() => setSelectedInvoice(null)} aria-label="Close invoice details">
                  <X size={15} />
                </button>
              </div>

              <div className="org-billing-modal-body">
                {[
                  ["Organization", selectedInvoice.organization],
                  ["Plan", selectedInvoice.plan],
                  ["Amount", currencyFormat.format(selectedInvoice.amount)],
                  ["Issue date", selectedInvoice.issueDate],
                  ["Due date", selectedInvoice.dueDate],
                  ["Current status", selectedInvoice.status],
                ].map(([label, value]) => (
                  <div className="org-billing-details-row" key={label}>
                    <span className="org-billing-detail-label">{label}</span>
                    <span className="org-billing-detail-value">{value}</span>
                  </div>
                ))}

                <div className="org-billing-field" style={{ marginTop: 20, marginBottom: 0 }}>
                  <label htmlFor="invoice-status">Change demo status</label>
                  <select
                    id="invoice-status"
                    className="org-billing-input"
                    value={selectedInvoice.status}
                    onChange={(event) => {
                      const status = event.target.value as BillingStatus;
                      setSelectedInvoice({ ...selectedInvoice, status });
                    }}
                  >
                    <option>Draft</option>
                    <option>Pending</option>
                    <option>Paid</option>
                    <option>Overdue</option>
                  </select>
                </div>
              </div>

              <div className="org-billing-modal-footer">
                <button className="org-billing-btn" onClick={() => setSelectedInvoice(null)}>
                  Cancel
                </button>
                <button
                  className="org-billing-btn primary"
                  onClick={() => updateInvoiceStatus(selectedInvoice.id, selectedInvoice.status)}
                >
                  <CheckCircle2 size={14} /> Save status
                </button>
              </div>
            </section>
          </div>
        )}

        {selectedAccount && (
          <div className="org-billing-modal-backdrop" onClick={() => setSelectedAccount(null)}>
            <section className="org-billing-modal" role="dialog" aria-modal="true" aria-labelledby="org-billing-account-title" onClick={(event) => event.stopPropagation()}>
              <div className="org-billing-modal-header">
                <div>
                  <h2 className="org-billing-modal-title" id="org-billing-account-title">Billing account</h2>
                  <p className="org-billing-modal-subtitle">{selectedAccount.organization}</p>
                </div>
                <button className="org-billing-icon-btn" onClick={() => setSelectedAccount(null)} aria-label="Close billing account">
                  <X size={15} />
                </button>
              </div>

              <div className="org-billing-modal-body">
                {[
                  ["Organization ID", selectedAccount.id],
                  ["Plan", selectedAccount.plan],
                  ["Monthly spend", currencyFormat.format(selectedAccount.monthlySpend)],
                  ["Payment method", selectedAccount.paymentMethod],
                  ["Next renewal", selectedAccount.renewalDate],
                  ["Status", selectedAccount.status],
                ].map(([label, value]) => (
                  <div className="org-billing-details-row" key={label}>
                    <span className="org-billing-detail-label">{label}</span>
                    <span className="org-billing-detail-value">{value}</span>
                  </div>
                ))}
              </div>

              <div className="org-billing-modal-footer">
                <button className="org-billing-btn" onClick={() => setSelectedAccount(null)}>
                  Close
                </button>
                <button
                  className="org-billing-btn primary"
                  onClick={() =>
                    changeAccountStatus(
                      selectedAccount.id,
                      selectedAccount.status === "Suspended" ? "Active" : "Suspended",
                    )
                  }
                >
                  {selectedAccount.status === "Suspended" ? "Reactivate account" : "Suspend account"}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
