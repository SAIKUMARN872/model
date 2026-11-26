
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clipboard,
  Copy,
  FileKey2,
  Globe,
  Info,
  KeyRound,
  LockKeyhole,
  RefreshCw,
  Save,
  ShieldCheck,
  ShieldEllipsis,
  Users,
  X,
  Zap,
} from "lucide-react";

type Protocol = "SAML 2.0" | "OpenID Connect";
type Tab = "configuration" | "security" | "lifecycle";

type SsoConfig = {
  enabled: boolean;
  protocol: Protocol;
  providerName: string;
  issuer: string;
  loginUrl: string;
  logoutUrl: string;
  certificate: string;
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  emailAttribute: string;
  nameAttribute: string;
  groupAttribute: string;
  requireMfa: boolean;
  enforceSso: boolean;
  allowPasswordLogin: boolean;
  jitProvisioning: boolean;
  autoDeprovision: boolean;
  syncGroups: boolean;
};

const initialConfig: SsoConfig = {
  enabled: false,
  protocol: "SAML 2.0",
  providerName: "",
  issuer: "",
  loginUrl: "",
  logoutUrl: "",
  certificate: "",
  clientId: "",
  clientSecret: "",
  authorizationUrl: "",
  tokenUrl: "",
  userInfoUrl: "",
  emailAttribute: "email",
  nameAttribute: "name",
  groupAttribute: "groups",
  requireMfa: true,
  enforceSso: false,
  allowPasswordLogin: true,
  jitProvisioning: true,
  autoDeprovision: false,
  syncGroups: true,
};

const callbackUrl = "https://console.modelnow.ai/api/auth/sso/callback";
const entityId = "https://console.modelnow.ai/saml/metadata";

const relatedLinks = [
  { label: "Security controls", href: "/enterprise/security" },
  { label: "Role-based access", href: "/enterprise/rbac" },
  { label: "Audit trail", href: "/enterprise/audit" },
  { label: "AI governance", href: "/enterprise/governance" },
  { label: "Compliance controls", href: "/enterprise/compliance" },
  { label: "Service agreements", href: "/enterprise/sla" },
];

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

function StatusPill({
  children,
  status = "neutral",
}: {
  children: React.ReactNode;
  status?: "success" | "warning" | "neutral";
}) {
  return (
    <span className={`sso-status sso-status--${status}`}>
      {children}
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  hint,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  hint?: string;
  multiline?: boolean;
}) {
  return (
    <div className="sso-field">
      <label>
        {label}
        {required && <span className="sso-required"> *</span>}
      </label>

      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={4}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
        />
      )}

      {hint && <p className="sso-field-hint">{hint}</p>}
    </div>
  );
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
    <div className="sso-toggle-row">
      <div className="sso-toggle-copy">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        className={`sso-switch ${checked ? "is-on" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </div>
  );
}

export default function SsoPage() {
  const [activeTab, setActiveTab] = useState<Tab>("configuration");
  const [config, setConfig] = useState<SsoConfig>(initialConfig);
  const [savedConfig, setSavedConfig] = useState<SsoConfig | null>(null);
  const [notice, setNotice] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const update = <K extends keyof SsoConfig>(
    key: K,
    value: SsoConfig[K]
  ) => {
    setConfig((previous) => ({ ...previous, [key]: value }));
    setNotice("");
  };

  const isSaml = config.protocol === "SAML 2.0";

  const requiredFields = useMemo(() => {
    if (isSaml) {
      return [
        { label: "Identity provider name", value: config.providerName },
        { label: "Issuer", value: config.issuer },
        { label: "SSO login URL", value: config.loginUrl },
        { label: "Signing certificate", value: config.certificate },
      ];
    }

    return [
      { label: "Identity provider name", value: config.providerName },
      { label: "Client ID", value: config.clientId },
      { label: "Client secret", value: config.clientSecret },
      { label: "Authorization URL", value: config.authorizationUrl },
      { label: "Token URL", value: config.tokenUrl },
    ];
  }, [config, isSaml]);

  const missingFields = requiredFields.filter(
    (field) => !field.value.trim()
  );

  const readiness = requiredFields.length
    ? Math.round(
        ((requiredFields.length - missingFields.length) /
          requiredFields.length) *
          100
      )
    : 0;

  const urlFields = isSaml
    ? [
        { label: "Issuer", value: config.issuer },
        { label: "SSO login URL", value: config.loginUrl },
        { label: "Logout URL", value: config.logoutUrl },
      ]
    : [
        { label: "Authorization URL", value: config.authorizationUrl },
        { label: "Token URL", value: config.tokenUrl },
        { label: "User info URL", value: config.userInfoUrl },
      ];

  const invalidUrls = urlFields.filter(
    (field) => field.value.trim() && !isValidUrl(field.value)
  );

  const validateConfiguration = () => {
    if (missingFields.length > 0) {
      setNotice(
        `Complete the required fields: ${missingFields
          .map((field) => field.label)
          .join(", ")}.`
      );
      setActiveTab("configuration");
      return false;
    }

    if (invalidUrls.length > 0) {
      setNotice(
        `Enter valid HTTPS URLs for: ${invalidUrls
          .map((field) => field.label)
          .join(", ")}.`
      );
      setActiveTab("configuration");
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateConfiguration()) return;

    // Local frontend demonstration only.
    // Replace with an authenticated backend API request.
    setSavedConfig({ ...config });
    setNotice(
      "Configuration validated locally. Connect a backend API to persist these settings."
    );
  };

  const handleValidate = () => {
    if (!validateConfiguration()) return;

    setNotice(
      "Required fields and HTTPS URL formats passed local validation. Provider connectivity and signatures have not been verified."
    );
  };

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(`${label} copied to clipboard.`);
    } catch {
      setNotice("Clipboard access is unavailable in this browser.");
    }
  };

  const handleEnable = () => {
    if (!config.enabled) {
      setNotice(
        "SSO cannot be activated from this frontend. Complete backend integration and verify the identity provider first."
      );
      return;
    }

    update("enabled", false);
    setNotice("Local SSO preview disabled.");
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "configuration", label: "Configuration", icon: Globe },
    { id: "security", label: "Security", icon: ShieldCheck },
    { id: "lifecycle", label: "User lifecycle", icon: Users },
  ];

  return (
    <main className="sso-page">
      <style>{`
        .sso-page {
          --sso-text: #111827;
          --sso-muted: #64748b;
          --sso-border: #e5e7eb;
          --sso-primary: #315fea;
          --sso-bg: #f8fafc;
          min-height: 100%;
          padding: 28px;
          background: var(--sso-bg);
          color: var(--sso-text);
        }

        .sso-container {
          max-width: 1500px;
          margin: 0 auto;
        }

        .sso-eyebrow {
          margin: 0 0 9px;
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .sso-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .sso-header h1 {
          margin: 0;
          font-size: 27px;
          font-weight: 750;
          letter-spacing: -.7px;
        }

        .sso-description {
          margin: 8px 0 14px;
          color: var(--sso-muted);
          font-size: 13px;
          line-height: 1.65;
        }

        .sso-back {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #475569;
          font-size: 12px;
          font-weight: 650;
          text-decoration: none;
        }

        .sso-back:hover {
          color: var(--sso-primary);
        }

        .sso-header-actions {
          display: flex;
          align-items: center;
          gap: 9px;
          flex-shrink: 0;
        }

        .sso-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 38px;
          padding: 0 13px;
          border: 1px solid var(--sso-border);
          border-radius: 8px;
          background: #fff;
          color: #334155;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: background .15s, border-color .15s;
        }

        .sso-button:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .sso-button:focus-visible,
        .sso-switch:focus-visible,
        .sso-tab:focus-visible {
          outline: 3px solid rgba(49,95,234,.2);
          outline-offset: 2px;
        }

        .sso-button--primary {
          border-color: var(--sso-primary);
          background: var(--sso-primary);
          color: white;
        }

        .sso-button--primary:hover {
          border-color: #244dcc;
          background: #244dcc;
        }

        .sso-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 9px;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 750;
          white-space: nowrap;
        }

        .sso-status--success {
          border-color: #bbf7d0;
          background: #f0fdf4;
          color: #15803d;
        }

        .sso-status--warning {
          border-color: #fde68a;
          background: #fffbeb;
          color: #a16207;
        }

        .sso-status--neutral {
          background: #f8fafc;
          color: #64748b;
        }

        .sso-banner {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          padding: 15px 17px;
          margin-bottom: 20px;
          border: 1px solid #fde68a;
          border-radius: 10px;
          background: #fffbeb;
        }

        .sso-banner > svg {
          flex-shrink: 0;
          margin-top: 2px;
          color: #a16207;
        }

        .sso-banner h2 {
          margin: 0 0 4px;
          color: #78350f;
          font-size: 13px;
          font-weight: 750;
        }

        .sso-banner p {
          margin: 0;
          color: #92400e;
          font-size: 12px;
          line-height: 1.65;
        }

        .sso-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 13px;
          margin-bottom: 20px;
        }

        .sso-metric {
          padding: 15px;
          border: 1px solid var(--sso-border);
          border-radius: 10px;
          background: white;
        }

        .sso-metric-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 13px;
        }

        .sso-metric-icon {
          display: grid;
          width: 32px;
          height: 32px;
          place-items: center;
          border-radius: 8px;
          background: #eff4ff;
          color: var(--sso-primary);
        }

        .sso-metric strong {
          display: block;
          font-size: 19px;
          font-weight: 750;
        }

        .sso-metric span {
          display: block;
          margin-top: 4px;
          color: var(--sso-muted);
          font-size: 11px;
        }

        .sso-progress {
          height: 5px;
          overflow: hidden;
          margin-top: 11px;
          border-radius: 10px;
          background: #e2e8f0;
        }

        .sso-progress > span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: var(--sso-primary);
          transition: width .2s;
        }

        .sso-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 300px;
          gap: 18px;
          align-items: start;
        }

        .sso-main-card,
        .sso-side-card {
          min-width: 0;
          overflow: hidden;
          border: 1px solid var(--sso-border);
          border-radius: 11px;
          background: white;
        }

        .sso-tabs {
          display: flex;
          gap: 5px;
          padding: 10px 15px 0;
          border-bottom: 1px solid var(--sso-border);
        }

        .sso-tab {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 13px 12px;
          border: 0;
          border-bottom: 2px solid transparent;
          background: transparent;
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .sso-tab.active {
          border-bottom-color: var(--sso-primary);
          color: var(--sso-primary);
        }

        .sso-tab-content {
          padding: 22px;
        }

        .sso-section-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }

        .sso-section-heading h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 750;
        }

        .sso-section-heading p {
          margin: 5px 0 0;
          color: var(--sso-muted);
          font-size: 11px;
          line-height: 1.6;
        }

        .sso-protocols {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 23px;
        }

        .sso-protocol {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          border: 1px solid var(--sso-border);
          border-radius: 9px;
          background: white;
          text-align: left;
          cursor: pointer;
        }

        .sso-protocol.selected {
          border-color: var(--sso-primary);
          background: #f5f8ff;
          box-shadow: 0 0 0 2px rgba(49,95,234,.08);
        }

        .sso-protocol-icon {
          display: grid;
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 8px;
          background: #eef2ff;
          color: var(--sso-primary);
        }

        .sso-protocol strong {
          display: block;
          margin-bottom: 4px;
          color: #1e293b;
          font-size: 12px;
        }

        .sso-protocol small {
          color: #64748b;
          font-size: 10px;
        }

        .sso-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 17px;
        }

        .sso-field {
          min-width: 0;
        }

        .sso-field.full {
          grid-column: 1 / -1;
        }

        .sso-field label {
          display: block;
          margin-bottom: 7px;
          color: #334155;
          font-size: 11px;
          font-weight: 750;
        }

        .sso-required {
          color: #dc2626;
        }

        .sso-field input,
        .sso-field textarea {
          box-sizing: border-box;
          width: 100%;
          min-height: 39px;
          padding: 10px 11px;
          border: 1px solid #dce2ea;
          border-radius: 7px;
          outline: none;
          background: #fff;
          color: #1e293b;
          font: inherit;
          font-size: 12px;
        }

        .sso-field textarea {
          min-height: 100px;
          resize: vertical;
          line-height: 1.55;
        }

        .sso-field input:focus,
        .sso-field textarea:focus {
          border-color: var(--sso-primary);
          box-shadow: 0 0 0 3px rgba(49,95,234,.09);
        }

        .sso-field input::placeholder,
        .sso-field textarea::placeholder {
          color: #a0a9b7;
        }

        .sso-field-hint {
          margin: 6px 0 0;
          color: #94a3b8;
          font-size: 10px;
          line-height: 1.5;
        }

        .sso-divider {
          height: 1px;
          margin: 22px 0;
          background: var(--sso-border);
        }

        .sso-subheading {
          margin: 0 0 15px;
          font-size: 13px;
          font-weight: 750;
        }

        .sso-config-values {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 21px;
          padding: 15px;
          border: 1px solid #e5e7eb;
          border-radius: 9px;
          background: #f8fafc;
        }

        .sso-copy-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .sso-copy-row > div {
          min-width: 0;
        }

        .sso-copy-row strong {
          display: block;
          margin-bottom: 5px;
          color: #334155;
          font-size: 11px;
        }

        .sso-copy-row code {
          display: block;
          overflow-wrap: anywhere;
          color: #64748b;
          font-size: 10px;
        }

        .sso-copy-button {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          flex-shrink: 0;
          padding: 7px 9px;
          border: 1px solid #dbe2eb;
          border-radius: 6px;
          background: #fff;
          color: #475569;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .sso-copy-button:hover {
          border-color: #aabce9;
          color: var(--sso-primary);
        }

        .sso-toggle-list {
          border-top: 1px solid var(--sso-border);
        }

        .sso-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 15px 0;
          border-bottom: 1px solid var(--sso-border);
        }

        .sso-toggle-copy h4 {
          margin: 0 0 5px;
          color: #1e293b;
          font-size: 12px;
          font-weight: 750;
        }

        .sso-toggle-copy p {
          margin: 0;
          color: #64748b;
          font-size: 11px;
          line-height: 1.6;
        }

        .sso-switch {
          position: relative;
          width: 39px;
          height: 22px;
          flex-shrink: 0;
          padding: 0;
          border: 0;
          border-radius: 20px;
          background: #cbd5e1;
          cursor: pointer;
          transition: background .18s;
        }

        .sso-switch span {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,.18);
          transition: transform .18s;
        }

        .sso-switch.is-on {
          background: var(--sso-primary);
        }

        .sso-switch.is-on span {
          transform: translateX(17px);
        }

        .sso-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          padding: 15px 22px;
          border-top: 1px solid var(--sso-border);
          background: #fafbfc;
        }

        .sso-actions-note {
          color: #94a3b8;
          font-size: 10px;
        }

        .sso-actions-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .sso-side-card {
          margin-bottom: 14px;
          padding: 17px;
        }

        .sso-side-card h3 {
          margin: 0 0 13px;
          font-size: 13px;
          font-weight: 750;
        }

        .sso-readiness {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 14px;
        }

        .sso-readiness-number {
          font-size: 25px;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .sso-readiness-copy {
          color: #64748b;
          font-size: 10px;
          line-height: 1.5;
        }

        .sso-check-list {
          display: flex;
          flex-direction: column;
          gap: 11px;
          margin-top: 15px;
        }

        .sso-check-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          color: #64748b;
          font-size: 10px;
          line-height: 1.5;
        }

        .sso-check-item svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .sso-related-links {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sso-related-links a {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 9px 8px;
          border-radius: 6px;
          color: #475569;
          font-size: 11px;
          font-weight: 600;
          text-decoration: none;
        }

        .sso-related-links a:hover {
          background: #f1f5f9;
          color: var(--sso-primary);
        }

        .sso-notice {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-bottom: 17px;
          padding: 12px;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          background: #eff6ff;
          color: #1e40af;
          font-size: 11px;
          line-height: 1.6;
        }

        .sso-notice svg {
          flex-shrink: 0;
        }

        .sso-footer {
          margin-top: 17px;
          color: #94a3b8;
          font-size: 10px;
          line-height: 1.6;
        }

        @media(max-width: 1050px) {
          .sso-layout {
            grid-template-columns: 1fr;
          }

          .sso-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media(max-width: 650px) {
          .sso-page {
            padding: 18px 13px;
          }

          .sso-header {
            flex-direction: column;
          }

          .sso-header-actions {
            width: 100%;
          }

          .sso-header-actions .sso-button {
            flex: 1;
          }

          .sso-metrics {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .sso-protocols,
          .sso-form-grid {
            grid-template-columns: 1fr;
          }

          .sso-field.full {
            grid-column: auto;
          }

          .sso-tab-content {
            padding: 16px;
          }

          .sso-tabs {
            overflow-x: auto;
          }

          .sso-tab {
            white-space: nowrap;
            padding: 12px 9px;
          }

          .sso-actions {
            align-items: stretch;
            flex-direction: column;
          }

          .sso-actions-buttons {
            width: 100%;
          }

          .sso-actions-buttons .sso-button {
            flex: 1;
          }
        }
      `}</style>

      <div className="sso-container">
        <header className="sso-header">
          <div>
            <p className="sso-eyebrow">Enterprise / Identity</p>
            <h1>Single Sign-On</h1>
            <p className="sso-description">
              Configure identity federation, authentication policies, and
              organization user lifecycle management.
            </p>
            <Link className="sso-back" href="/enterprise">
              <ArrowLeft size={15} />
              Enterprise overview
            </Link>
          </div>

          <div className="sso-header-actions">
            <StatusPill status="warning">
              <CircleAlert size={12} />
              Verification required
            </StatusPill>
            <button
              type="button"
              className="sso-button"
              onClick={handleValidate}
            >
              <RefreshCw size={14} />
              Validate
            </button>
          </div>
        </header>

        <section className="sso-banner" role="note">
          <ShieldEllipsis size={21} />
          <div>
            <h2>Identity provider verification required</h2>
            <p>
              SSO is not currently verified or activated. Configure your
              identity provider, validate its metadata and signing credentials,
              and complete backend authentication integration before enforcing
              SSO for organization members.
            </p>
          </div>
        </section>

        <section className="sso-metrics">
          <article className="sso-metric">
            <div className="sso-metric-top">
              <div className="sso-metric-icon">
                <Globe size={17} />
              </div>
              <StatusPill>Not verified</StatusPill>
            </div>
            <strong>{config.protocol}</strong>
            <span>Selected federation protocol</span>
          </article>

          <article className="sso-metric">
            <div className="sso-metric-top">
              <div className="sso-metric-icon">
                <KeyRound size={17} />
              </div>
              <StatusPill status="warning">Pending</StatusPill>
            </div>
            <strong>{readiness}%</strong>
            <span>Required configuration completeness</span>
            <div className="sso-progress">
              <span style={{ width: `${readiness}%` }} />
            </div>
          </article>

          <article className="sso-metric">
            <div className="sso-metric-top">
              <div className="sso-metric-icon">
                <ShieldCheck size={17} />
              </div>
              <StatusPill status="warning">Review required</StatusPill>
            </div>
            <strong>{config.requireMfa ? "Required" : "Optional"}</strong>
            <span>Configured MFA policy preference</span>
          </article>

          <article className="sso-metric">
            <div className="sso-metric-top">
              <div className="sso-metric-icon">
                <Users size={17} />
              </div>
              <StatusPill>Not connected</StatusPill>
            </div>
            <strong>{config.jitProvisioning ? "Enabled" : "Disabled"}</strong>
            <span>Just-in-time provisioning preference</span>
          </article>
        </section>

        <div className="sso-layout">
          <section className="sso-main-card">
            <div className="sso-tabs" role="tablist" aria-label="SSO settings">
              {tabs.map((tab) => {
                const Icon = tab.icon;

                return (
                  <button
                    type="button"
                    key={tab.id}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    className={`sso-tab ${
                      activeTab === tab.id ? "active" : ""
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={15} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {activeTab === "configuration" && (
              <div className="sso-tab-content">
                <div className="sso-section-heading">
                  <div>
                    <h2>Identity provider configuration</h2>
                    <p>
                      Select your federation protocol and enter the provider
                      configuration details.
                    </p>
                  </div>
                  <StatusPill status="warning">Not connected</StatusPill>
                </div>

                <h3 className="sso-subheading">Federation protocol</h3>

                <div className="sso-protocols">
                  <button
                    type="button"
                    className={`sso-protocol ${
                      isSaml ? "selected" : ""
                    }`}
                    onClick={() => update("protocol", "SAML 2.0")}
                  >
                    <div className="sso-protocol-icon">
                      <FileKey2 size={18} />
                    </div>
                    <div>
                      <strong>SAML 2.0</strong>
                      <small>XML-based enterprise federation</small>
                    </div>
                    {isSaml && (
                      <CheckCircle2
                        size={16}
                        color="#315fea"
                        style={{ marginLeft: "auto" }}
                      />
                    )}
                  </button>

                  <button
                    type="button"
                    className={`sso-protocol ${
                      !isSaml ? "selected" : ""
                    }`}
                    onClick={() =>
                      update("protocol", "OpenID Connect")
                    }
                  >
                    <div className="sso-protocol-icon">
                      <Globe size={18} />
                    </div>
                    <div>
                      <strong>OpenID Connect</strong>
                      <small>OAuth 2.0-based identity federation</small>
                    </div>
                    {!isSaml && (
                      <CheckCircle2
                        size={16}
                        color="#315fea"
                        style={{ marginLeft: "auto" }}
                      />
                    )}
                  </button>
                </div>

                <div className="sso-divider" />

                <h3 className="sso-subheading">
                  Provider details
                </h3>

                <div className="sso-form-grid">
                  <div className="sso-field full">
                    <Field
                      label="Identity provider name"
                      value={config.providerName}
                      onChange={(value) =>
                        update("providerName", value)
                      }
                      placeholder="e.g. Microsoft Entra ID"
                      required
                    />
                  </div>

                  {isSaml ? (
                    <>
                      <Field
                        label="Issuer / Entity ID"
                        value={config.issuer}
                        onChange={(value) => update("issuer", value)}
                        placeholder="https://identity.example.com/..."
                        required
                        hint="The unique identifier assigned by your identity provider."
                      />

                      <Field
                        label="SSO login URL"
                        value={config.loginUrl}
                        onChange={(value) =>
                          update("loginUrl", value)
                        }
                        placeholder="https://identity.example.com/sso"
                        required
                      />

                      <Field
                        label="Logout URL"
                        value={config.logoutUrl}
                        onChange={(value) =>
                          update("logoutUrl", value)
                        }
                        placeholder="https://identity.example.com/logout"
                      />

                      <div className="sso-field full">
                        <Field
                          label="X.509 signing certificate"
                          value={config.certificate}
                          onChange={(value) =>
                            update("certificate", value)
                          }
                          placeholder="Paste the provider's PEM certificate"
                          required
                          multiline
                          hint="Certificate parsing, trust-chain validation, expiry checks, and signature verification must run on the backend."
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <Field
                        label="Client ID"
                        value={config.clientId}
                        onChange={(value) =>
                          update("clientId", value)
                        }
                        placeholder="Your OIDC application client ID"
                        required
                      />

                      <div className="sso-field">
                        <label>
                          Client secret
                          <span className="sso-required"> *</span>
                        </label>
                        <div style={{ position: "relative" }}>
                          <input
                            type={showSecret ? "text" : "password"}
                            value={config.clientSecret}
                            onChange={(event) =>
                              update("clientSecret", event.target.value)
                            }
                            placeholder="Enter client secret"
                            autoComplete="new-password"
                            style={{ paddingRight: 65 }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowSecret(!showSecret)}
                            style={{
                              position: "absolute",
                              right: 9,
                              top: 10,
                              border: 0,
                              background: "transparent",
                              color: "#315fea",
                              fontSize: 10,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            {showSecret ? "Hide" : "Show"}
                          </button>
                        </div>
                        <p className="sso-field-hint">
                          Demo input only. Never persist client secrets in
                          browser storage or expose them in client-side code.
                        </p>
                      </div>

                      <Field
                        label="Authorization endpoint"
                        value={config.authorizationUrl}
                        onChange={(value) =>
                          update("authorizationUrl", value)
                        }
                        placeholder="https://identity.example.com/authorize"
                        required
                      />

                      <Field
                        label="Token endpoint"
                        value={config.tokenUrl}
                        onChange={(value) => update("tokenUrl", value)}
                        placeholder="https://identity.example.com/token"
                        required
                      />

                      <Field
                        label="User info endpoint"
                        value={config.userInfoUrl}
                        onChange={(value) =>
                          update("userInfoUrl", value)
                        }
                        placeholder="https://identity.example.com/userinfo"
                      />
                    </>
                  )}
                </div>

                <div className="sso-divider" />

                <h3 className="sso-subheading">
                  Attribute mapping
                </h3>

                <div className="sso-form-grid">
                  <Field
                    label="Email attribute"
                    value={config.emailAttribute}
                    onChange={(value) =>
                      update("emailAttribute", value)
                    }
                    placeholder="email"
                    required
                  />

                  <Field
                    label="Display name attribute"
                    value={config.nameAttribute}
                    onChange={(value) =>
                      update("nameAttribute", value)
                    }
                    placeholder="name"
                  />

                  <Field
                    label="Group membership attribute"
                    value={config.groupAttribute}
                    onChange={(value) =>
                      update("groupAttribute", value)
                    }
                    placeholder="groups"
                  />
                </div>

                <div className="sso-config-values">
                  <div className="sso-copy-row">
                    <div>
                      <strong>ModelNow callback URL</strong>
                      <code>{callbackUrl}</code>
                    </div>
                    <button
                      type="button"
                      className="sso-copy-button"
                      onClick={() =>
                        handleCopy(callbackUrl, "Callback URL")
                      }
                    >
                      <Copy size={13} />
                      Copy
                    </button>
                  </div>

                  {isSaml && (
                    <div className="sso-copy-row">
                      <div>
                        <strong>ModelNow Service Provider Entity ID</strong>
                        <code>{entityId}</code>
                      </div>
                      <button
                        type="button"
                        className="sso-copy-button"
                        onClick={() =>
                          handleCopy(entityId, "Entity ID")
                        }
                      >
                        <Copy size={13} />
                        Copy
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="sso-tab-content">
                <div className="sso-section-heading">
                  <div>
                    <h2>Authentication security</h2>
                    <p>
                      Configure security policy preferences for the
                      organization's SSO integration.
                    </p>
                  </div>
                  <StatusPill status="warning">
                    Backend enforcement required
                  </StatusPill>
                </div>

                <div className="sso-notice">
                  <Info size={16} />
                  These settings are frontend preferences only. The
                  authentication service must enforce each policy.
                </div>

                <div className="sso-toggle-list">
                  <Toggle
                    title="Require multi-factor authentication"
                    description="Require an additional authentication factor through the identity provider."
                    checked={config.requireMfa}
                    onChange={(value) =>
                      update("requireMfa", value)
                    }
                  />

                  <Toggle
                    title="Enforce SSO for organization members"
                    description="Require members to authenticate through the configured identity provider."
                    checked={config.enforceSso}
                    onChange={(value) =>
                      update("enforceSso", value)
                    }
                  />

                  <Toggle
                    title="Allow password-based login"
                    description="Keep alternative password login available while SSO is configured."
                    checked={config.allowPasswordLogin}
                    onChange={(value) =>
                      update("allowPasswordLogin", value)
                    }
                  />
                </div>

                <div className="sso-divider" />

                <h3 className="sso-subheading">
                  Security implementation checklist
                </h3>

                <div className="sso-check-list">
                  {[
                    "Validate SAML signatures or OIDC token signatures on the server.",
                    "Validate issuer, audience, state, nonce, and redirect destinations.",
                    "Use secure, HTTP-only session cookies with appropriate SameSite settings.",
                    "Support signing-key rotation and certificate expiration monitoring.",
                    "Protect secrets with server-side encrypted secret storage.",
                    "Prevent replay attacks and unsafe account linking.",
                  ].map((item) => (
                    <div className="sso-check-item" key={item}>
                      <ShieldCheck size={15} color="#315fea" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "lifecycle" && (
              <div className="sso-tab-content">
                <div className="sso-section-heading">
                  <div>
                    <h2>User provisioning and lifecycle</h2>
                    <p>
                      Define how organization users and group memberships
                      should be managed through identity federation.
                    </p>
                  </div>
                  <StatusPill>Not connected</StatusPill>
                </div>

                <div className="sso-toggle-list">
                  <Toggle
                    title="Just-in-time provisioning"
                    description="Create an organization user account when a valid user authenticates for the first time."
                    checked={config.jitProvisioning}
                    onChange={(value) =>
                      update("jitProvisioning", value)
                    }
                  />

                  <Toggle
                    title="Automatic deprovisioning"
                    description="Disable organization access when a trusted lifecycle event indicates that a user has been removed."
                    checked={config.autoDeprovision}
                    onChange={(value) =>
                      update("autoDeprovision", value)
                    }
                  />

                  <Toggle
                    title="Synchronize identity provider groups"
                    description="Map trusted identity provider groups to organization roles through explicit server-side rules."
                    checked={config.syncGroups}
                    onChange={(value) =>
                      update("syncGroups", value)
                    }
                  />
                </div>

                <div className="sso-divider" />

                <h3 className="sso-subheading">
                  Lifecycle implementation checklist
                </h3>

                <div className="sso-check-list">
                  {[
                    "Define a stable external user identifier.",
                    "Verify email ownership and account-linking rules.",
                    "Define group-to-role mapping and default permissions.",
                    "Handle suspended, deleted, and reactivated users.",
                    "Record provisioning and deprovisioning events in the audit trail.",
                  ].map((item) => (
                    <div className="sso-check-item" key={item}>
                      <Users size={15} color="#315fea" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="sso-actions">
              <span className="sso-actions-note">
                {savedConfig
                  ? "A local configuration snapshot exists in this page session."
                  : "Configuration has not been persisted to the backend."}
              </span>

              <div className="sso-actions-buttons">
                <button
                  type="button"
                  className="sso-button"
                  onClick={() => {
                    setConfig(initialConfig);
                    setSavedConfig(null);
                    setNotice("Form reset to its initial values.");
                  }}
                >
                  Reset
                </button>

                <button
                  type="button"
                  className="sso-button sso-button--primary"
                  onClick={handleSave}
                >
                  <Save size={14} />
                  Save configuration
                </button>
              </div>
            </div>
          </section>

          <aside>
            <section className="sso-side-card">
              <h3>Configuration readiness</h3>

              <div className="sso-readiness">
                <div className="sso-readiness-number">
                  {readiness}%
                </div>
                <div className="sso-readiness-copy">
                  Required fields completed
                  <br />
                  {requiredFields.length - missingFields.length} of{" "}
                  {requiredFields.length} completed
                </div>
              </div>

              <div className="sso-progress">
                <span style={{ width: `${readiness}%` }} />
              </div>

              <div className="sso-check-list">
                {requiredFields.map((field) => (
                  <div className="sso-check-item" key={field.label}>
                    {field.value.trim() ? (
                      <CheckCircle2 size={14} color="#16a34a" />
                    ) : (
                      <CircleAlert size={14} color="#d97706" />
                    )}
                    <span>{field.label}</span>
                  </div>
                ))}
              </div>

              {invalidUrls.length > 0 && (
                <div className="sso-notice" style={{ marginTop: 14, marginBottom: 0 }}>
                  <CircleAlert size={15} />
                  <span>
                    {invalidUrls.length} URL field(s) need HTTPS format
                    correction.
                  </span>
                </div>
              )}
            </section>

            <section className="sso-side-card">
              <h3>Connection status</h3>
              <div className="sso-check-list">
                <div className="sso-check-item">
                  <CircleAlert size={14} color="#d97706" />
                  <span>Identity provider connection: Not verified</span>
                </div>
                <div className="sso-check-item">
                  <CircleAlert size={14} color="#d97706" />
                  <span>Signing certificate: Not verified</span>
                </div>
                <div className="sso-check-item">
                  <CircleAlert size={14} color="#d97706" />
                  <span>Authentication callback: Not tested</span>
                </div>
                <div className="sso-check-item">
                  <CircleAlert size={14} color="#d97706" />
                  <span>Backend enforcement: Not confirmed</span>
                </div>
              </div>
            </section>

            <section className="sso-side-card">
              <h3>Related enterprise areas</h3>
              <nav className="sso-related-links">
                {relatedLinks.map((link) => (
                  <Link href={link.href} key={link.href}>
                    {link.label}
                    <ArrowRight size={14} />
                  </Link>
                ))}
              </nav>
            </section>

            <section className="sso-side-card">
              <h3>Need to review?</h3>
              <p style={{
                margin: "0 0 12px",
                color: "#64748b",
                fontSize: 11,
                lineHeight: 1.6,
              }}>
                Review authentication requirements and provider setup before
                enabling organization-wide SSO.
              </p>
              <Link
                href="/enterprise/security"
                className="sso-button"
                style={{ textDecoration: "none", width: "100%" }}
              >
                Review security
                <ArrowRight size={13} />
              </Link>
            </section>
          </aside>
        </div>

        {notice && (
          <div
            className="sso-notice"
            role="status"
            style={{ marginTop: 17, marginBottom: 0 }}
          >
            <Info size={16} />
            <span>{notice}</span>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setNotice("")}
              style={{
                marginLeft: "auto",
                border: 0,
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              <X size={15} />
            </button>
          </div>
        )}

        <p className="sso-footer">
          ModelNow Enterprise Identity · SSO configuration is not active until
          the backend validates and enforces the provider settings. Never send
          provider secrets to an unauthenticated endpoint or store them in
          browser storage.
        </p>
      </div>
    </main>
  );
}
