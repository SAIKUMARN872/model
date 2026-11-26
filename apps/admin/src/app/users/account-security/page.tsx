// ModelNow Admin Users page
"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  LockKeyhole,
  KeyRound,
  Smartphone,
  Search,
  RefreshCw,
  Download,
  Eye,
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Fingerprint,
  Clock3,
  Settings2,
  ChevronRight,
  Activity,
  UserRound,
} from "lucide-react";

type SecurityStatus = "Secure" | "At Risk" | "Review Required";
type MfaStatus = "Enabled" | "Disabled";
type AccountSecurity = {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  status: SecurityStatus;
  mfa: MfaStatus;
  passwordUpdated: string;
  lastLogin: string;
  failedAttempts: number;
  activeSessions: number;
  recoveryEmail: string;
  sso: boolean;
  apiKeys: number;
};

const initialAccounts: AccountSecurity[] = [
  {
    id: "USR-1001",
    name: "Pujitha Marikanti",
    email: "pujitha@example.com",
    role: "Administrator",
    organization: "ModelNow",
    status: "Secure",
    mfa: "Enabled",
    passwordUpdated: "2026-10-20",
    lastLogin: "2026-11-04T09:42:00",
    failedAttempts: 0,
    activeSessions: 2,
    recoveryEmail: "p.recovery@example.com",
    sso: true,
    apiKeys: 3,
  },
  {
    id: "USR-1002",
    name: "Rahul Sharma",
    email: "rahul@example.com",
    role: "Developer",
    organization: "Engineering",
    status: "Secure",
    mfa: "Enabled",
    passwordUpdated: "2026-09-15",
    lastLogin: "2026-11-04T09:35:00",
    failedAttempts: 0,
    activeSessions: 1,
    recoveryEmail: "rahul.backup@example.com",
    sso: false,
    apiKeys: 2,
  },
  {
    id: "USR-1003",
    name: "Ananya Reddy",
    email: "ananya@example.com",
    role: "Workspace Admin",
    organization: "Product",
    status: "Review Required",
    mfa: "Disabled",
    passwordUpdated: "2026-07-10",
    lastLogin: "2026-11-04T09:18:00",
    failedAttempts: 1,
    activeSessions: 3,
    recoveryEmail: "ananya.backup@example.com",
    sso: false,
    apiKeys: 1,
  },
  {
    id: "USR-1004",
    name: "Vikram Patel",
    email: "vikram@example.com",
    role: "Developer",
    organization: "Engineering",
    status: "At Risk",
    mfa: "Disabled",
    passwordUpdated: "2026-04-03",
    lastLogin: "2026-11-04T08:56:00",
    failedAttempts: 6,
    activeSessions: 4,
    recoveryEmail: "",
    sso: false,
    apiKeys: 5,
  },
  {
    id: "USR-1005",
    name: "Sneha Rao",
    email: "sneha@example.com",
    role: "Analyst",
    organization: "Data",
    status: "Secure",
    mfa: "Enabled",
    passwordUpdated: "2026-08-22",
    lastLogin: "2026-11-04T08:40:00",
    failedAttempts: 0,
    activeSessions: 1,
    recoveryEmail: "sneha.backup@example.com",
    sso: true,
    apiKeys: 0,
  },
  {
    id: "USR-1006",
    name: "Arjun Kumar",
    email: "arjun@example.com",
    role: "Member",
    organization: "Customer Success",
    status: "Review Required",
    mfa: "Disabled",
    passwordUpdated: "2026-03-12",
    lastLogin: "2026-11-03T21:30:00",
    failedAttempts: 2,
    activeSessions: 2,
    recoveryEmail: "",
    sso: false,
    apiKeys: 0,
  },
  {
    id: "USR-1007",
    name: "Meera Nair",
    email: "meera@example.com",
    role: "Billing Admin",
    organization: "Finance",
    status: "Secure",
    mfa: "Enabled",
    passwordUpdated: "2026-10-02",
    lastLogin: "2026-11-03T18:20:00",
    failedAttempts: 0,
    activeSessions: 1,
    recoveryEmail: "meera.backup@example.com",
    sso: true,
    apiKeys: 1,
  },
];

const statusClass: Record<SecurityStatus, string> = {
  Secure: "secure",
  "At Risk": "risk",
  "Review Required": "review",
};

function MetricCard({
  title,
  value,
  description,
  icon,
  tone,
}: {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
  tone: string;
}) {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <span>{title}</span>
        <span className={`metric-icon ${tone}`}>{icon}</span>
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-description">{description}</div>
    </div>
  );
}

export default function AccountSecurityPage() {
  const [accounts, setAccounts] =
    useState<AccountSecurity[]>(initialAccounts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [mfaFilter, setMfaFilter] = useState("All");
  const [selected, setSelected] = useState<AccountSecurity | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [notice, setNotice] = useState("");
  const [confirmAccount, setConfirmAccount] =
    useState<AccountSecurity | null>(null);

  const secureCount = accounts.filter(
    (account) => account.status === "Secure"
  ).length;
  const riskCount = accounts.filter(
    (account) => account.status === "At Risk"
  ).length;
  const mfaCount = accounts.filter(
    (account) => account.mfa === "Enabled"
  ).length;
  const missingRecoveryCount = accounts.filter(
    (account) => !account.recoveryEmail
  ).length;

  const filteredAccounts = useMemo(() => {
    const query = search.toLowerCase();

    return accounts.filter((account) => {
      const matchesSearch = [
        account.id,
        account.name,
        account.email,
        account.role,
        account.organization,
      ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All" || account.status === statusFilter;

      const matchesMfa = mfaFilter === "All" || account.mfa === mfaFilter;

      return matchesSearch && matchesStatus && matchesMfa;
    });
  }, [accounts, search, statusFilter, mfaFilter]);

  const formatDate = (value: string) =>
    new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setMfaFilter("All");
  };

  const toggleMfa = (account: AccountSecurity) => {
    const nextMfa: MfaStatus =
      account.mfa === "Enabled" ? "Disabled" : "Enabled";

    const updated: AccountSecurity = {
      ...account,
      mfa: nextMfa,
      status:
        nextMfa === "Enabled" && account.failedAttempts < 5
          ? "Secure"
          : nextMfa === "Disabled"
            ? "Review Required"
            : account.status,
    };

    setAccounts((current) =>
      current.map((item) => (item.id === account.id ? updated : item))
    );
    setSelected(updated);
    setNotice(
      `MFA marked ${nextMfa.toLowerCase()} for ${account.name} in the local demo.`
    );
  };

  const resetFailedAttempts = (account: AccountSecurity) => {
    const updated = {
      ...account,
      failedAttempts: 0,
      status:
        account.mfa === "Enabled" ? ("Secure" as const) : ("Review Required" as const),
    };

    setAccounts((current) =>
      current.map((item) => (item.id === account.id ? updated : item))
    );
    setSelected(updated);
    setConfirmAccount(null);
    setNotice(`Failed-attempt counter reset for ${account.name} in the local demo.`);
  };

  const exportCsv = () => {
    const headers = [
      "User ID",
      "Name",
      "Email",
      "Role",
      "Organization",
      "Security Status",
      "MFA",
      "Password Updated",
      "Last Login",
      "Failed Attempts",
      "Active Sessions",
      "Recovery Email",
      "SSO",
      "API Keys",
    ];

    const escapeCsv = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const rows = filteredAccounts.map((account) =>
      [
        account.id,
        account.name,
        account.email,
        account.role,
        account.organization,
        account.status,
        account.mfa,
        account.passwordUpdated,
        account.lastLogin,
        account.failedAttempts,
        account.activeSessions,
        account.recoveryEmail || "Not configured",
        account.sso ? "Enabled" : "Disabled",
        account.apiKeys,
      ]
        .map(escapeCsv)
        .join(",")
    );

    const blob = new Blob(
      [[headers.map(escapeCsv).join(","), ...rows].join("\n")],
      { type: "text/csv;charset=utf-8;" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-account-security.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="security-page">
      <header className="page-header">
        <div>
          <div className="breadcrumb">
            Admin <span>/</span> Users <span>/</span> Account Security
          </div>
          <h1>Account Security</h1>
          <p className="subtitle">
            Review account protection, multi-factor authentication, password
            hygiene, and sign-in risk indicators.
          </p>
        </div>
        <div className="header-actions">
          <button className="button secondary" onClick={resetFilters}>
            <RefreshCw size={16} />
            Reset
          </button>
          <button className="button primary" onClick={exportCsv}>
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </header>

      {notice && (
        <div className="notice">
          <CheckCircle2 size={17} />
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="demo-banner">
        <AlertTriangle size={18} />
        <div>
          <strong>Security dashboard uses sample data</strong>
          <p>
            Changes are local UI demonstrations only. Connect authentication,
            identity, and audit services before relying on these controls.
          </p>
        </div>
      </div>

      <section className="metrics-grid">
        <MetricCard
          title="Secure Accounts"
          value={String(secureCount)}
          description="Marked as secure"
          icon={<ShieldCheck size={19} />}
          tone="green"
        />
        <MetricCard
          title="Accounts at Risk"
          value={String(riskCount)}
          description="Require security attention"
          icon={<ShieldAlert size={19} />}
          tone="red"
        />
        <MetricCard
          title="MFA Enabled"
          value={`${mfaCount}/${accounts.length}`}
          description="Accounts with MFA enabled"
          icon={<Smartphone size={19} />}
          tone="blue"
        />
        <MetricCard
          title="Recovery Not Configured"
          value={String(missingRecoveryCount)}
          description="Missing recovery email"
          icon={<KeyRound size={19} />}
          tone="orange"
        />
      </section>

      <section className="security-score-card">
        <div className="score-icon">
          <Fingerprint size={24} />
        </div>
        <div className="score-copy">
          <h2>Account protection coverage</h2>
          <p>
            Percentage of listed accounts with multi-factor authentication
            enabled.
          </p>
        </div>
        <div className="score-display">
          <strong>
            {accounts.length
              ? Math.round((mfaCount / accounts.length) * 100)
              : 0}
            %
          </strong>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${
                  accounts.length
                    ? (mfaCount / accounts.length) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </section>

      <section className="content-card">
        <div className="section-header">
          <div>
            <h2>User security inventory</h2>
            <p>Inspect account security posture and review potential issues.</p>
          </div>
          <button
            className={`button secondary ${showFilters ? "filter-active" : ""}`}
            onClick={() => setShowFilters((current) => !current)}
          >
            <Settings2 size={16} />
            Filters
          </button>
        </div>

        <div className="toolbar">
          <div className="search-field">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, user ID, organization..."
            />
          </div>
          <span className="result-count">
            {filteredAccounts.length} accounts
          </span>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <label>
              Security status
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option>All</option>
                <option>Secure</option>
                <option>At Risk</option>
                <option>Review Required</option>
              </select>
            </label>
            <label>
              MFA status
              <select
                value={mfaFilter}
                onChange={(event) => setMfaFilter(event.target.value)}
              >
                <option>All</option>
                <option>Enabled</option>
                <option>Disabled</option>
              </select>
            </label>
            <button className="clear-button" onClick={resetFilters}>
              Clear filters
            </button>
          </div>
        )}

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>USER</th>
                <th>SECURITY STATUS</th>
                <th>MFA</th>
                <th>FAILED LOGINS</th>
                <th>LAST LOGIN</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((account) => (
                <tr key={account.id}>
                  <td>
                    <div className="user-cell">
                      <div className="avatar">
                        {account.name
                          .split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="user-name">{account.name}</div>
                        <div className="muted">{account.email}</div>
                        <div className="user-meta">
                          {account.id} · {account.role}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`security-pill ${statusClass[account.status]}`}
                    >
                      <span className="status-dot" />
                      {account.status}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`mfa-pill ${
                        account.mfa === "Enabled" ? "mfa-on" : "mfa-off"
                      }`}
                    >
                      {account.mfa === "Enabled" ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <XCircle size={14} />
                      )}
                      {account.mfa}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`attempt-count ${
                        account.failedAttempts >= 5
                          ? "attempt-danger"
                          : account.failedAttempts > 0
                            ? "attempt-warning"
                            : ""
                      }`}
                    >
                      {account.failedAttempts}
                    </span>
                  </td>
                  <td>
                    <div className="last-login">{formatDate(account.lastLogin)}</div>
                    <div className="muted">{account.organization}</div>
                  </td>
                  <td>
                    <button
                      className="view-button"
                      onClick={() => setSelected(account)}
                    >
                      <Eye size={15} />
                      Review
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAccounts.length === 0 && (
            <div className="empty-state">
              <Search size={30} />
              <h3>No accounts found</h3>
              <p>Try changing your search or filter criteria.</p>
              <button className="button secondary" onClick={resetFilters}>
                Clear filters
              </button>
            </div>
          )}
        </div>

        <div className="table-footer">
          <span>
            Showing {filteredAccounts.length} of {accounts.length} accounts
          </span>
          <span>Sample security records</span>
        </div>
      </section>

      <section className="recommendations">
        <div className="recommendation-heading">
          <div className="recommendation-icon">
            <Activity size={19} />
          </div>
          <div>
            <h2>Recommended security reviews</h2>
            <p>Suggested follow-ups based on the sample account records.</p>
          </div>
        </div>
        <div className="recommendation-grid">
          <div className="recommendation-item">
            <div className="recommendation-symbol red">
              <ShieldAlert size={17} />
            </div>
            <div>
              <strong>Review repeated failed logins</strong>
              <p>
                {accounts.filter((account) => account.failedAttempts >= 5).length}{" "}
                account(s) have five or more failed attempts.
              </p>
            </div>
          </div>
          <div className="recommendation-item">
            <div className="recommendation-symbol orange">
              <Smartphone size={17} />
            </div>
            <div>
              <strong>Enable multi-factor authentication</strong>
              <p>
                {accounts.filter((account) => account.mfa === "Disabled").length}{" "}
                account(s) have MFA disabled.
              </p>
            </div>
          </div>
          <div className="recommendation-item">
            <div className="recommendation-symbol blue">
              <KeyRound size={17} />
            </div>
            <div>
              <strong>Configure account recovery</strong>
              <p>
                {missingRecoveryCount} account(s) are missing a recovery email.
              </p>
            </div>
          </div>
        </div>
      </section>

      {selected && (
        <div
          className="modal-backdrop"
          onClick={() => setSelected(null)}
          role="presentation"
        >
          <div
            className="details-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-security-title"
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">ACCOUNT SECURITY</span>
                <h2 id="account-security-title">Security review</h2>
                <p>{selected.id}</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setSelected(null)}
                aria-label="Close security review"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-user">
              <div className="large-avatar">
                {selected.name
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <div>
                <strong>{selected.name}</strong>
                <span>{selected.email}</span>
                <span>
                  {selected.role} · {selected.organization}
                </span>
              </div>
              <span className={`security-pill ${statusClass[selected.status]}`}>
                {selected.status}
              </span>
            </div>

            <div className="detail-grid">
              <Detail label="MFA status" value={selected.mfa} />
              <Detail
                label="Failed login attempts"
                value={String(selected.failedAttempts)}
              />
              <Detail
                label="Active sessions"
                value={String(selected.activeSessions)}
              />
              <Detail
                label="API keys"
                value={String(selected.apiKeys)}
              />
              <Detail
                label="Password last updated"
                value={selected.passwordUpdated}
              />
              <Detail
                label="Last login"
                value={formatDate(selected.lastLogin)}
              />
              <Detail
                label="Single sign-on"
                value={selected.sso ? "Enabled" : "Disabled"}
              />
              <Detail
                label="Recovery email"
                value={selected.recoveryEmail || "Not configured"}
              />
            </div>

            <div className="modal-actions">
              <button
                className="button secondary"
                onClick={() => setConfirmAccount(selected)}
              >
                <RefreshCw size={15} />
                Reset failed attempts
              </button>
              <button
                className="button primary"
                onClick={() => toggleMfa(selected)}
              >
                <ShieldCheck size={15} />
                {selected.mfa === "Enabled" ? "Disable MFA" : "Enable MFA"}
              </button>
            </div>

            <p className="modal-disclaimer">
              These controls update demo state only and do not change a real
              user's authentication configuration.
            </p>
          </div>
        </div>
      )}

      {confirmAccount && (
        <div
          className="modal-backdrop"
          onClick={() => setConfirmAccount(null)}
          role="presentation"
        >
          <div
            className="confirm-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-attempts-title"
          >
            <div className="confirm-icon">
              <RefreshCw size={21} />
            </div>
            <h2 id="reset-attempts-title">Reset failed login attempts?</h2>
            <p>
              Reset the displayed failed-login counter for{" "}
              <strong>{confirmAccount.name}</strong>? This is a local demo
              action only.
            </p>
            <div className="confirm-actions">
              <button
                className="button secondary"
                onClick={() => setConfirmAccount(null)}
              >
                Cancel
              </button>
              <button
                className="button primary"
                onClick={() => resetFailedAttempts(confirmAccount)}
              >
                Confirm reset
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .security-page {
          min-height: 100vh;
          padding: 28px;
          background: #f8fafc;
          color: #111827;
          font-family: Arial, Helvetica, sans-serif;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 22px;
        }

        .breadcrumb {
          margin-bottom: 12px;
          color: #6b7280;
          font-size: 12px;
        }

        .breadcrumb span {
          margin: 0 7px;
          color: #c4c8d0;
        }

        h1 {
          margin: 0 0 8px;
          font-size: 28px;
          font-weight: 750;
          letter-spacing: -0.8px;
        }

        .subtitle {
          max-width: 700px;
          margin: 0;
          color: #6b7280;
          font-size: 13px;
          line-height: 1.6;
        }

        .header-actions {
          display: flex;
          gap: 8px;
          padding-top: 25px;
          flex-shrink: 0;
        }

        .button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 37px;
          padding: 9px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 650;
          cursor: pointer;
          transition: background 0.15s;
        }

        .button.secondary {
          background: white;
          color: #374151;
        }

        .button.secondary:hover {
          background: #f3f4f6;
        }

        .button.primary {
          background: #315fea;
          border-color: #315fea;
          color: white;
        }

        .button.primary:hover {
          background: #244bd0;
        }

        .notice {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
          padding: 12px 14px;
          border: 1px solid #bbf7d0;
          border-radius: 9px;
          background: #f0fdf4;
          color: #166534;
          font-size: 12px;
        }

        .notice span {
          flex: 1;
          line-height: 1.5;
        }

        .notice button {
          display: flex;
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
        }

        .demo-banner {
          display: flex;
          gap: 11px;
          align-items: flex-start;
          margin-bottom: 20px;
          padding: 14px 16px;
          border: 1px solid #fed7aa;
          border-radius: 10px;
          background: #fff7ed;
          color: #9a3412;
        }

        .demo-banner > svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .demo-banner strong {
          font-size: 12px;
        }

        .demo-banner p {
          margin: 5px 0 0;
          color: #9a5a31;
          font-size: 11px;
          line-height: 1.6;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .metric-card {
          min-width: 0;
          padding: 17px;
          border: 1px solid #e5e7eb;
          border-radius: 11px;
          background: white;
        }

        .metric-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 9px;
          color: #6b7280;
          font-size: 12px;
          font-weight: 600;
        }

        .metric-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 35px;
          height: 35px;
          flex-shrink: 0;
          border-radius: 9px;
        }

        .green {
          background: #ecfdf5;
          color: #059669;
        }

        .red {
          background: #fef2f2;
          color: #dc2626;
        }

        .blue {
          background: #eff6ff;
          color: #2563eb;
        }

        .orange {
          background: #fff7ed;
          color: #ea580c;
        }

        .metric-value {
          margin-top: 12px;
          font-size: 29px;
          font-weight: 750;
          letter-spacing: -0.8px;
        }

        .metric-description {
          margin-top: 5px;
          color: #9ca3af;
          font-size: 11px;
        }

        .security-score-card {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 22px;
          padding: 18px 20px;
          border: 1px solid #dbeafe;
          border-radius: 11px;
          background: #eff6ff;
        }

        .score-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          border-radius: 10px;
          background: white;
          color: #315fea;
        }

        .score-copy {
          flex: 1;
          min-width: 0;
        }

        .score-copy h2 {
          margin: 0 0 5px;
          font-size: 13px;
        }

        .score-copy p {
          margin: 0;
          color: #4b638c;
          font-size: 11px;
          line-height: 1.6;
        }

        .score-display {
          width: 155px;
          flex-shrink: 0;
        }

        .score-display strong {
          display: block;
          margin-bottom: 8px;
          color: #1d4ed8;
          font-size: 22px;
          text-align: right;
        }

        .progress-track {
          height: 7px;
          overflow: hidden;
          border-radius: 10px;
          background: #dbeafe;
        }

        .progress-fill {
          height: 100%;
          border-radius: inherit;
          background: #315fea;
          transition: width 0.2s;
        }

        .content-card {
          overflow: visible;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: white;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 21px 22px;
        }

        .section-header h2 {
          margin: 0 0 6px;
          font-size: 16px;
        }

        .section-header p {
          margin: 0;
          color: #6b7280;
          font-size: 12px;
          line-height: 1.5;
        }

        .filter-active {
          background: #eff6ff !important;
          border-color: #bfdbfe !important;
          color: #1d4ed8 !important;
        }

        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 0 22px 16px;
        }

        .search-field {
          display: flex;
          align-items: center;
          gap: 9px;
          width: 100%;
          max-width: 480px;
          height: 38px;
          padding: 0 11px;
          border: 1px solid #dfe3e8;
          border-radius: 8px;
          color: #9ca3af;
        }

        .search-field:focus-within {
          border-color: #93aef9;
          box-shadow: 0 0 0 3px #315fea12;
        }

        .search-field input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: #111827;
          font-size: 12px;
        }

        .result-count {
          color: #6b7280;
          font-size: 11px;
          white-space: nowrap;
        }

        .filters-panel {
          display: flex;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 14px;
          padding: 15px 22px;
          border-top: 1px solid #eef0f3;
          border-bottom: 1px solid #eef0f3;
          background: #f9fafb;
        }

        .filters-panel label {
          display: flex;
          flex-direction: column;
          gap: 7px;
          color: #6b7280;
          font-size: 11px;
          font-weight: 650;
        }

        .filters-panel select {
          min-width: 155px;
          height: 35px;
          padding: 0 10px;
          border: 1px solid #d1d5db;
          border-radius: 7px;
          background: white;
          color: #374151;
          font-size: 12px;
          outline: none;
        }

        .clear-button {
          height: 35px;
          padding: 0 8px;
          border: 0;
          background: transparent;
          color: #315fea;
          font-size: 12px;
          font-weight: 650;
          cursor: pointer;
        }

        .table-scroll {
          overflow-x: auto;
          border-top: 1px solid #eef0f3;
        }

        table {
          width: 100%;
          min-width: 930px;
          border-collapse: collapse;
          text-align: left;
        }

        thead {
          background: #f9fafb;
        }

        th {
          padding: 13px 16px;
          color: #6b7280;
          font-size: 10px;
          font-weight: 750;
          letter-spacing: 0.45px;
          white-space: nowrap;
        }

        td {
          padding: 15px 16px;
          border-top: 1px solid #f0f1f3;
          vertical-align: middle;
          font-size: 12px;
        }

        tbody tr:hover {
          background: #fbfcff;
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 220px;
        }

        .avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 37px;
          height: 37px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #eef2ff;
          color: #4338ca;
          font-size: 11px;
          font-weight: 750;
        }

        .user-name {
          color: #111827;
          font-size: 12px;
          font-weight: 650;
          white-space: nowrap;
        }

        .muted {
          display: block;
          margin-top: 5px;
          color: #9ca3af;
          font-size: 10px;
          white-space: nowrap;
        }

        .user-meta {
          margin-top: 5px;
          color: #6b7280;
          font-size: 10px;
        }

        .security-pill,
        .mfa-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 9px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }

        .security-pill.secure {
          background: #ecfdf5;
          color: #047857;
        }

        .security-pill.risk {
          background: #fef2f2;
          color: #b91c1c;
        }

        .security-pill.review {
          background: #fff7ed;
          color: #c2410c;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .mfa-on {
          background: #ecfdf5;
          color: #047857;
        }

        .mfa-off {
          background: #fef2f2;
          color: #b91c1c;
        }

        .attempt-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 27px;
          padding: 5px 7px;
          border-radius: 6px;
          background: #f3f4f6;
          color: #374151;
          font-size: 11px;
          font-weight: 700;
        }

        .attempt-warning {
          background: #fff7ed;
          color: #c2410c;
        }

        .attempt-danger {
          background: #fef2f2;
          color: #b91c1c;
        }

        .last-login {
          color: #374151;
          font-size: 11px;
          white-space: nowrap;
        }

        .view-button {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 7px 9px;
          border: 1px solid #e5e7eb;
          border-radius: 7px;
          background: white;
          color: #4b5563;
          font-size: 11px;
          font-weight: 650;
          cursor: pointer;
          white-space: nowrap;
        }

        .view-button:hover {
          border-color: #bfdbfe;
          background: #f8faff;
          color: #315fea;
        }

        .table-footer {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 15px 22px;
          border-top: 1px solid #eef0f3;
          color: #6b7280;
          font-size: 11px;
        }

        .empty-state {
          padding: 50px 20px;
          color: #9ca3af;
          text-align: center;
        }

        .empty-state svg {
          margin-bottom: 12px;
        }

        .empty-state h3 {
          margin: 0 0 7px;
          color: #374151;
          font-size: 15px;
        }

        .empty-state p {
          margin: 0 0 17px;
          font-size: 12px;
        }

        .recommendations {
          margin-top: 22px;
          padding: 21px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: white;
        }

        .recommendation-heading {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 18px;
        }

        .recommendation-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 9px;
          background: #eff6ff;
          color: #2563eb;
        }

        .recommendation-heading h2 {
          margin: 0 0 5px;
          font-size: 15px;
        }

        .recommendation-heading p {
          margin: 0;
          color: #6b7280;
          font-size: 11px;
        }

        .recommendation-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .recommendation-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 14px;
          border: 1px solid #eef0f3;
          border-radius: 9px;
        }

        .recommendation-symbol {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          border-radius: 8px;
        }

        .recommendation-symbol.red {
          background: #fef2f2;
          color: #dc2626;
        }

        .recommendation-symbol.orange {
          background: #fff7ed;
          color: #ea580c;
        }

        .recommendation-symbol.blue {
          background: #eff6ff;
          color: #2563eb;
        }

        .recommendation-item strong {
          color: #374151;
          font-size: 11px;
          line-height: 1.5;
        }

        .recommendation-item p {
          margin: 5px 0 0;
          color: #6b7280;
          font-size: 10px;
          line-height: 1.6;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #0f172a80;
        }

        .details-modal {
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 14px;
          background: white;
          box-shadow: 0 25px 80px #0002;
        }

        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          padding: 22px 24px 17px;
          border-bottom: 1px solid #eef0f3;
        }

        .eyebrow {
          display: block;
          margin-bottom: 7px;
          color: #315fea;
          font-size: 10px;
          font-weight: 750;
          letter-spacing: 0.8px;
        }

        .modal-header h2 {
          margin: 0 0 6px;
          font-size: 20px;
        }

        .modal-header p {
          margin: 0;
          color: #9ca3af;
          font-size: 11px;
        }

        .icon-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border: 1px solid #eef0f3;
          border-radius: 7px;
          background: white;
          color: #6b7280;
          cursor: pointer;
        }

        .icon-button:hover {
          background: #f3f4f6;
          color: #111827;
        }

        .modal-user {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 17px 24px;
          background: #fafafa;
        }

        .large-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #eef2ff;
          color: #4338ca;
          font-size: 12px;
          font-weight: 750;
        }

        .modal-user > div:nth-child(2) {
          display: flex;
          flex: 1;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .modal-user strong {
          color: #111827;
          font-size: 13px;
        }

        .modal-user span:not(.security-pill) {
          color: #6b7280;
          font-size: 10px;
          overflow-wrap: anywhere;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0 24px;
          padding: 14px 24px;
        }

        .detail-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 10px 0;
          border-bottom: 1px solid #f0f1f3;
          min-width: 0;
        }

        .detail-row span {
          color: #6b7280;
          font-size: 11px;
        }

        .detail-row strong {
          color: #111827;
          font-size: 12px;
          font-weight: 650;
          overflow-wrap: anywhere;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 8px;
          padding: 0 24px 15px;
        }

        .modal-disclaimer {
          margin: 0;
          padding: 0 24px 22px;
          color: #9ca3af;
          font-size: 10px;
          line-height: 1.6;
        }

        .confirm-modal {
          width: 100%;
          max-width: 410px;
          padding: 25px;
          border-radius: 14px;
          background: white;
          box-shadow: 0 25px 80px #0002;
        }

        .confirm-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 43px;
          height: 43px;
          margin-bottom: 15px;
          border-radius: 11px;
          background: #eff6ff;
          color: #315fea;
        }

        .confirm-modal h2 {
          margin: 0 0 9px;
          font-size: 18px;
        }

        .confirm-modal p {
          margin: 0;
          color: #6b7280;
          font-size: 12px;
          line-height: 1.7;
        }

        .confirm-modal p strong {
          color: #374151;
        }

        .confirm-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 22px;
        }

        @media (max-width: 1050px) {
          .metrics-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .recommendation-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .security-page {
            padding: 18px 12px;
          }

          .page-header {
            flex-direction: column;
          }

          .header-actions {
            padding-top: 0;
          }

          .security-score-card {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .score-display {
            width: 100%;
          }

          .score-display strong {
            text-align: left;
          }

          .section-header,
          .toolbar {
            padding-left: 14px;
            padding-right: 14px;
          }

          .table-footer {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .metrics-grid {
            gap: 9px;
          }

          .metric-card {
            padding: 12px;
          }

          .metric-header {
            font-size: 11px;
          }

          .metric-value {
            font-size: 25px;
          }

          .header-actions {
            flex-wrap: wrap;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }

          .modal-user {
            align-items: flex-start;
            flex-wrap: wrap;
          }
        }
      `}</style>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}