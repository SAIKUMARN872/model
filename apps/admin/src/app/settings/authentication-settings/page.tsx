
"use client";

import { useState } from "react";
import {
  ShieldCheck,
  LockKeyhole,
  KeyRound,
  Smartphone,
  Users,
  Clock3,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Fingerprint,
} from "lucide-react";

type AuthConfig = {
  passwordMinLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecialCharacter: boolean;
  passwordExpiry: string;
  passwordHistory: string;
  maxLoginAttempts: string;
  lockoutDuration: string;
  sessionTimeout: string;
  maxConcurrentSessions: string;
  allowRememberMe: boolean;
  requireMfaAdmins: boolean;
  allowAuthenticatorApp: boolean;
  allowEmailOtp: boolean;
  allowSmsOtp: boolean;
  allowSso: boolean;
  allowPasswordLogin: boolean;
  notifyNewLogin: boolean;
  notifyFailedLogin: boolean;
  requireReauthentication: boolean;
};

const defaultConfig: AuthConfig = {
  passwordMinLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialCharacter: true,
  passwordExpiry: "90",
  passwordHistory: "5",
  maxLoginAttempts: "5",
  lockoutDuration: "15",
  sessionTimeout: "60",
  maxConcurrentSessions: "5",
  allowRememberMe: true,
  requireMfaAdmins: true,
  allowAuthenticatorApp: true,
  allowEmailOtp: true,
  allowSmsOtp: false,
  allowSso: true,
  allowPasswordLogin: true,
  notifyNewLogin: true,
  notifyFailedLogin: true,
  requireReauthentication: true,
};

export default function AuthenticationSettingsPage() {
  const [config, setConfig] = useState<AuthConfig>(defaultConfig);
  const [notice, setNotice] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("password");

  function update<K extends keyof AuthConfig>(key: K, value: AuthConfig[K]) {
    setConfig((current) => ({ ...current, [key]: value }));
  }

  function saveSettings() {
    try {
      localStorage.setItem("modelnow-authentication-settings", JSON.stringify(config));
      setNotice("Authentication settings saved in this browser.");
    } catch {
      setNotice("Unable to save settings in this browser.");
    }
  }

  function resetSettings() {
    setConfig(defaultConfig);
    setNotice("Settings restored to the default values. Save to persist them.");
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
      <div className="auth-toggle-row">
        <div className="auth-toggle-copy">
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={title}
          className={`auth-switch ${checked ? "active" : ""}`}
          onClick={() => onChange(!checked)}
        />
      </div>
    );
  }

  function SelectField({
    label,
    value,
    onChange,
    options,
    description,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { label: string; value: string }[];
    description?: string;
  }) {
    return (
      <div className="auth-field">
        <label>{label}</label>
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {description && <small>{description}</small>}
      </div>
    );
  }

  return (
    <main className="auth-page">
      <style>{`
        .auth-page {
          min-height: 100vh;
          padding: 30px;
          background: #f7f8fc;
          color: #202a40;
          font-family: Arial, Helvetica, sans-serif;
        }

        .auth-container { max-width: 1150px; margin: 0 auto; }

        .auth-breadcrumb {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-bottom: 22px;
          color: #858da0;
          font-size: 13px;
        }

        .auth-breadcrumb a { color: #5265d9; text-decoration: none; }

        .auth-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .auth-title-wrap { display: flex; align-items: center; gap: 14px; }

        .auth-title-icon {
          display: grid;
          place-items: center;
          width: 50px;
          height: 50px;
          flex-shrink: 0;
          border-radius: 14px;
          background: #e9edff;
          color: #5265d9;
        }

        .auth-heading h1 {
          margin: 0 0 7px;
          font-size: 27px;
          letter-spacing: -.6px;
        }

        .auth-heading p {
          max-width: 650px;
          margin: 0;
          color: #7e8799;
          font-size: 13px;
          line-height: 1.6;
        }

        .auth-actions { display: flex; flex-wrap: wrap; gap: 9px; }

        .auth-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 40px;
          padding: 0 14px;
          border: 1px solid #dfe4ed;
          border-radius: 9px;
          background: white;
          color: #414c64;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .auth-button.primary { background: #5265d9; border-color: #5265d9; color: white; }
        .auth-button:hover { opacity: .9; }

        .auth-notice {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 18px;
          padding: 13px 15px;
          border: 1px solid #dce4ff;
          border-radius: 10px;
          background: #f0f3ff;
          color: #4055b5;
          font-size: 13px;
        }

        .auth-banner {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          margin-bottom: 21px;
          padding: 17px;
          border: 1px solid #dce4ff;
          border-radius: 12px;
          background: #f0f3ff;
        }

        .auth-banner-icon {
          display: grid;
          place-items: center;
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          border-radius: 10px;
          background: white;
          color: #5265d9;
        }

        .auth-banner h3 { margin: 0 0 6px; color: #35489e; font-size: 13px; }
        .auth-banner p { margin: 0; color: #6371ad; font-size: 12px; line-height: 1.6; }

        .auth-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 22px;
        }

        .auth-stat {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px;
          border: 1px solid #e7eaf1;
          border-radius: 12px;
          background: white;
        }

        .auth-stat-icon {
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          border-radius: 10px;
          background: #f0f2ff;
          color: #5265d9;
        }

        .auth-stat-label { margin-bottom: 6px; color: #818a9c; font-size: 11px; }
        .auth-stat-value { color: #202a40; font-size: 19px; font-weight: 700; }

        .auth-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 6px;
          margin-bottom: 18px;
          border: 1px solid #e7eaf1;
          border-radius: 11px;
          background: white;
        }

        .auth-tab {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 15px;
          border: 0;
          border-radius: 7px;
          background: transparent;
          color: #6f7890;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .auth-tab.active { background: #edf0ff; color: #485dd0; }

        .auth-card {
          overflow: hidden;
          margin-bottom: 18px;
          border: 1px solid #e7eaf1;
          border-radius: 13px;
          background: white;
          box-shadow: 0 2px 7px rgba(24,36,70,.025);
        }

        .auth-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 20px 22px;
          border-bottom: 1px solid #edf0f5;
        }

        .auth-card-header h2 { margin: 0 0 6px; font-size: 15px; }
        .auth-card-header p { margin: 0; color: #858da0; font-size: 12px; line-height: 1.6; }
        .auth-card-header-icon { color: #5265d9; }

        .auth-fields {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          padding: 22px;
        }

        .auth-field { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
        .auth-field label { color: #39445a; font-size: 12px; font-weight: 700; }

        .auth-field input, .auth-field select {
          width: 100%;
          height: 42px;
          padding: 0 12px;
          border: 1px solid #dfe4ed;
          border-radius: 8px;
          outline: none;
          background: white;
          color: #202a40;
          font-size: 13px;
        }

        .auth-field input:focus, .auth-field select:focus {
          border-color: #6576e7;
          box-shadow: 0 0 0 3px rgba(101,118,231,.1);
        }

        .auth-field small { color: #858da0; font-size: 11px; line-height: 1.5; }

        .auth-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 17px 22px;
          border-bottom: 1px solid #edf0f5;
        }

        .auth-toggle-row:last-child { border-bottom: 0; }
        .auth-toggle-copy strong { display: block; margin-bottom: 5px; font-size: 12px; }
        .auth-toggle-copy p { margin: 0; color: #858da0; font-size: 11px; line-height: 1.6; }

        .auth-switch {
          position: relative;
          width: 38px;
          height: 22px;
          flex: 0 0 auto;
          padding: 0;
          border: 0;
          border-radius: 20px;
          background: #cbd1dd;
          cursor: pointer;
        }

        .auth-switch.active { background: #5265d9; }

        .auth-switch::after {
          content: "";
          position: absolute;
          top: 3px;
          left: 3px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          transition: transform .15s ease;
        }

        .auth-switch.active::after { transform: translateX(16px); }

        .auth-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 16px 22px;
          border-top: 1px solid #edf0f5;
          color: #858da0;
          font-size: 11px;
        }

        .auth-inline-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 9px;
          border-radius: 20px;
          background: #eaf9f0;
          color: #218552;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }

        .auth-preview {
          margin: 0 22px 22px;
          padding: 16px;
          border: 1px solid #e5e8f1;
          border-radius: 10px;
          background: #fafbfe;
        }

        .auth-preview-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 13px;
        }

        .auth-preview-head strong { font-size: 12px; }

        .auth-preview-rule {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 9px 0;
          color: #58647c;
          font-size: 12px;
        }

        .auth-preview-rule svg { color: #218552; }

        .auth-warning {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin: 0 22px 20px;
          padding: 13px;
          border: 1px solid #f3dfb1;
          border-radius: 9px;
          background: #fff9e9;
          color: #94651a;
          font-size: 11px;
          line-height: 1.6;
        }

        .auth-bottom-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          padding: 16px 0 30px;
        }

        .auth-bottom-actions p { margin: 0; color: #858da0; font-size: 11px; line-height: 1.6; }

        @media (max-width: 950px) {
          .auth-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        @media (max-width: 650px) {
          .auth-page { padding: 18px 12px; }
          .auth-heading { flex-direction: column; }
          .auth-heading h1 { font-size: 23px; }
          .auth-actions { width: 100%; }
          .auth-button { flex: 1; }
          .auth-fields { grid-template-columns: 1fr; padding: 17px; }
          .auth-tabs { overflow-x: auto; flex-wrap: nowrap; }
          .auth-tab { white-space: nowrap; }
          .auth-card-header { align-items: flex-start; }
          .auth-toggle-row { padding: 16px; }
          .auth-card-footer { align-items: flex-start; flex-direction: column; }
          .auth-bottom-actions { align-items: flex-start; flex-direction: column; }
        }
      `}</style>

      <div className="auth-container">
        <div className="auth-breadcrumb">
          <a href="/dashboard">Admin</a>
          <span>/</span>
          <a href="/settings">Settings</a>
          <span>/</span>
          <span>Authentication Settings</span>
        </div>

        <header className="auth-heading">
          <div className="auth-title-wrap">
            <div className="auth-title-icon">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1>Authentication Settings</h1>
              <p>
                Configure sign-in methods, password policies, multi-factor
                authentication, and session security.
              </p>
            </div>
          </div>

          <div className="auth-actions">
            <button type="button" className="auth-button" onClick={resetSettings}>
              <RotateCcw size={14} />
              Reset
            </button>
            <button type="button" className="auth-button primary" onClick={saveSettings}>
              <Save size={15} />
              Save Settings
            </button>
          </div>
        </header>

        {notice && (
          <div className="auth-notice" role="status">
            <CheckCircle2 size={17} />
            {notice}
          </div>
        )}

        <section className="auth-banner">
          <div className="auth-banner-icon">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3>Authentication Policy Management</h3>
            <p>
              These controls represent the platform authentication policy.
              Connect them to your identity provider and authentication backend
              before treating them as enforced security controls.
            </p>
          </div>
        </section>

        <section className="auth-stats">
          <div className="auth-stat">
            <div className="auth-stat-icon"><LockKeyhole size={19} /></div>
            <div>
              <div className="auth-stat-label">Minimum Password</div>
              <div className="auth-stat-value">{config.passwordMinLength} chars</div>
            </div>
          </div>
          <div className="auth-stat">
            <div className="auth-stat-icon"><Fingerprint size={19} /></div>
            <div>
              <div className="auth-stat-label">Admin MFA</div>
              <div className="auth-stat-value">{config.requireMfaAdmins ? "Required" : "Optional"}</div>
            </div>
          </div>
          <div className="auth-stat">
            <div className="auth-stat-icon"><Clock3 size={19} /></div>
            <div>
              <div className="auth-stat-label">Session Timeout</div>
              <div className="auth-stat-value">{config.sessionTimeout} min</div>
            </div>
          </div>
          <div className="auth-stat">
            <div className="auth-stat-icon"><KeyRound size={19} /></div>
            <div>
              <div className="auth-stat-label">Login Attempts</div>
              <div className="auth-stat-value">{config.maxLoginAttempts} max</div>
            </div>
          </div>
        </section>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${activeTab === "password" ? "active" : ""}`}
            onClick={() => setActiveTab("password")}
          >
            <LockKeyhole size={15} />
            Password Policy
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === "mfa" ? "active" : ""}`}
            onClick={() => setActiveTab("mfa")}
          >
            <Fingerprint size={15} />
            Multi-Factor Auth
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === "session" ? "active" : ""}`}
            onClick={() => setActiveTab("session")}
          >
            <Clock3 size={15} />
            Sessions & Login
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === "methods" ? "active" : ""}`}
            onClick={() => setActiveTab("methods")}
          >
            <KeyRound size={15} />
            Sign-in Methods
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === "alerts" ? "active" : ""}`}
            onClick={() => setActiveTab("alerts")}
          >
            <AlertTriangle size={15} />
            Security Alerts
          </button>
        </div>

        {activeTab === "password" && (
          <section className="auth-card">
            <div className="auth-card-header">
              <div>
                <h2>Password Policy</h2>
                <p>Define password strength, expiry, and password reuse rules.</p>
              </div>
              <LockKeyhole className="auth-card-header-icon" size={21} />
            </div>

            <div className="auth-fields">
              <div className="auth-field">
                <label htmlFor="authMinLength">Minimum Password Length</label>
                <input
                  id="authMinLength"
                  type="number"
                  min={8}
                  max={128}
                  value={config.passwordMinLength}
                  onChange={(e) =>
                    update(
                      "passwordMinLength",
                      Math.max(8, Math.min(128, Number(e.target.value) || 8)),
                    )
                  }
                />
                <small>Recommended: at least 12 characters.</small>
              </div>

              <SelectField
                label="Password Expiration"
                value={config.passwordExpiry}
                onChange={(value) => update("passwordExpiry", value)}
                options={[
                  { label: "Never expires", value: "never" },
                  { label: "30 days", value: "30" },
                  { label: "60 days", value: "60" },
                  { label: "90 days", value: "90" },
                  { label: "180 days", value: "180" },
                ]}
                description="Set the password rotation policy."
              />

              <SelectField
                label="Password History"
                value={config.passwordHistory}
                onChange={(value) => update("passwordHistory", value)}
                options={[
                  { label: "Do not track", value: "0" },
                  { label: "Last 3 passwords", value: "3" },
                  { label: "Last 5 passwords", value: "5" },
                  { label: "Last 10 passwords", value: "10" },
                  { label: "Last 24 passwords", value: "24" },
                ]}
                description="Prevent reuse of recent passwords."
              />
            </div>

            <Toggle
              title="Require Uppercase Letters"
              description="Passwords must contain at least one uppercase letter."
              checked={config.requireUppercase}
              onChange={(value) => update("requireUppercase", value)}
            />
            <Toggle
              title="Require Lowercase Letters"
              description="Passwords must contain at least one lowercase letter."
              checked={config.requireLowercase}
              onChange={(value) => update("requireLowercase", value)}
            />
            <Toggle
              title="Require Numbers"
              description="Passwords must contain at least one numeric character."
              checked={config.requireNumber}
              onChange={(value) => update("requireNumber", value)}
            />
            <Toggle
              title="Require Special Characters"
              description="Passwords must contain at least one special character."
              checked={config.requireSpecialCharacter}
              onChange={(value) => update("requireSpecialCharacter", value)}
            />

            <div className="auth-card-footer">
              <span>Password rules must also be validated by the server.</span>
              <button
                type="button"
                className="auth-button"
                onClick={() => setShowPreview((current) => !current)}
              >
                {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                {showPreview ? "Hide Preview" : "Preview Policy"}
              </button>
            </div>

            {showPreview && (
              <div className="auth-preview">
                <div className="auth-preview-head">
                  <strong>Current Password Requirements</strong>
                  <span className="auth-inline-badge">
                    <CheckCircle2 size={12} />
                    Policy Preview
                  </span>
                </div>
                <div className="auth-preview-rule">
                  <CheckCircle2 size={14} />
                  At least {config.passwordMinLength} characters
                </div>
                {config.requireUppercase && (
                  <div className="auth-preview-rule">
                    <CheckCircle2 size={14} /> At least one uppercase letter
                  </div>
                )}
                {config.requireLowercase && (
                  <div className="auth-preview-rule">
                    <CheckCircle2 size={14} /> At least one lowercase letter
                  </div>
                )}
                {config.requireNumber && (
                  <div className="auth-preview-rule">
                    <CheckCircle2 size={14} /> At least one number
                  </div>
                )}
                {config.requireSpecialCharacter && (
                  <div className="auth-preview-rule">
                    <CheckCircle2 size={14} /> At least one special character
                  </div>
                )}
                <div className="auth-preview-rule">
                  <CheckCircle2 size={14} />
                  Password history: {config.passwordHistory === "0" ? "not tracked" : `last ${config.passwordHistory} passwords`}
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === "mfa" && (
          <section className="auth-card">
            <div className="auth-card-header">
              <div>
                <h2>Multi-Factor Authentication</h2>
                <p>Configure additional verification methods and admin requirements.</p>
              </div>
              <Fingerprint className="auth-card-header-icon" size={22} />
            </div>

            <Toggle
              title="Require MFA for Administrators"
              description="Require administrators to complete a second verification step when signing in."
              checked={config.requireMfaAdmins}
              onChange={(value) => update("requireMfaAdmins", value)}
            />
            <Toggle
              title="Authenticator App"
              description="Allow time-based one-time passwords from supported authenticator applications."
              checked={config.allowAuthenticatorApp}
              onChange={(value) => update("allowAuthenticatorApp", value)}
            />
            <Toggle
              title="Email One-Time Password"
              description="Allow verification codes to be sent to a verified email address."
              checked={config.allowEmailOtp}
              onChange={(value) => update("allowEmailOtp", value)}
            />
            <Toggle
              title="SMS One-Time Password"
              description="Allow SMS verification. Requires a configured SMS provider."
              checked={config.allowSmsOtp}
              onChange={(value) => update("allowSmsOtp", value)}
            />

            <div className="auth-warning">
              <AlertTriangle size={17} />
              <span>
                Do not enable a verification method until its delivery or validation
                service is configured and tested. Admin MFA enforcement must happen
                in the authentication backend.
              </span>
            </div>
          </section>
        )}

        {activeTab === "session" && (
          <section className="auth-card">
            <div className="auth-card-header">
              <div>
                <h2>Sessions & Login Protection</h2>
                <p>Control session duration, concurrent sessions, and failed-login behavior.</p>
              </div>
              <Clock3 className="auth-card-header-icon" size={22} />
            </div>

            <div className="auth-fields">
              <SelectField
                label="Session Timeout"
                value={config.sessionTimeout}
                onChange={(value) => update("sessionTimeout", value)}
                options={[
                  { label: "15 minutes", value: "15" },
                  { label: "30 minutes", value: "30" },
                  { label: "60 minutes", value: "60" },
                  { label: "120 minutes", value: "120" },
                  { label: "8 hours", value: "480" },
                ]}
                description="Idle session duration before requiring sign-in again."
              />

              <SelectField
                label="Maximum Concurrent Sessions"
                value={config.maxConcurrentSessions}
                onChange={(value) => update("maxConcurrentSessions", value)}
                options={[
                  { label: "1 session", value: "1" },
                  { label: "2 sessions", value: "2" },
                  { label: "3 sessions", value: "3" },
                  { label: "5 sessions", value: "5" },
                  { label: "10 sessions", value: "10" },
                  { label: "Unlimited", value: "unlimited" },
                ]}
              />

              <SelectField
                label="Maximum Failed Login Attempts"
                value={config.maxLoginAttempts}
                onChange={(value) => update("maxLoginAttempts", value)}
                options={[
                  { label: "3 attempts", value: "3" },
                  { label: "5 attempts", value: "5" },
                  { label: "10 attempts", value: "10" },
                  { label: "15 attempts", value: "15" },
                ]}
                description="Failed attempts before temporary lockout."
              />

              <SelectField
                label="Lockout Duration"
                value={config.lockoutDuration}
                onChange={(value) => update("lockoutDuration", value)}
                options={[
                  { label: "5 minutes", value: "5" },
                  { label: "15 minutes", value: "15" },
                  { label: "30 minutes", value: "30" },
                  { label: "60 minutes", value: "60" },
                  { label: "Until admin unlocks", value: "manual" },
                ]}
              />
            </div>

            <Toggle
              title="Allow Remember Me"
              description="Allow users to request persistent sign-in on trusted devices."
              checked={config.allowRememberMe}
              onChange={(value) => update("allowRememberMe", value)}
            />
            <Toggle
              title="Require Reauthentication for Sensitive Actions"
              description="Ask users to verify their identity again before sensitive account or security changes."
              checked={config.requireReauthentication}
              onChange={(value) => update("requireReauthentication", value)}
            />
          </section>
        )}

        {activeTab === "methods" && (
          <section className="auth-card">
            <div className="auth-card-header">
              <div>
                <h2>Sign-in Methods</h2>
                <p>Choose the authentication methods available to platform users.</p>
              </div>
              <KeyRound className="auth-card-header-icon" size={22} />
            </div>

            <Toggle
              title="Email and Password"
              description="Allow users to sign in using a verified email and password."
              checked={config.allowPasswordLogin}
              onChange={(value) => update("allowPasswordLogin", value)}
            />
            <Toggle
              title="Single Sign-On (SSO)"
              description="Allow organization users to sign in through a configured identity provider."
              checked={config.allowSso}
              onChange={(value) => update("allowSso", value)}
            />

            <div className="auth-warning">
              <AlertTriangle size={17} />
              <span>
                Configure SSO separately with your identity provider, including
                callback URLs, issuer validation, signing keys, and account
                provisioning. This toggle alone does not implement SSO.
              </span>
            </div>

            <div className="auth-card-footer">
              <span>Keep at least one tested sign-in method available to administrators.</span>
              <span className="auth-inline-badge">
                <ShieldCheck size={12} />
                Review before disabling
              </span>
            </div>
          </section>
        )}

        {activeTab === "alerts" && (
          <section className="auth-card">
            <div className="auth-card-header">
              <div>
                <h2>Authentication Notifications</h2>
                <p>Choose which authentication events should generate security notifications.</p>
              </div>
              <AlertTriangle className="auth-card-header-icon" size={22} />
            </div>

            <Toggle
              title="Notify on New Login"
              description="Notify users when a new sign-in is detected."
              checked={config.notifyNewLogin}
              onChange={(value) => update("notifyNewLogin", value)}
            />
            <Toggle
              title="Notify on Failed Login"
              description="Notify users or security teams when a sign-in attempt fails."
              checked={config.notifyFailedLogin}
              onChange={(value) => update("notifyFailedLogin", value)}
            />

            <div className="auth-card-footer">
              <span>Notifications require a configured email or security event service.</span>
              <span className="auth-inline-badge">
                <CheckCircle2 size={12} />
                Preferences
              </span>
            </div>
          </section>
        )}

        <div className="auth-bottom-actions">
          <p>
            Settings are stored locally for this UI demo.
            <br />
            Backend enforcement and persistent server storage are not included.
          </p>
          <div className="auth-actions">
            <button type="button" className="auth-button" onClick={resetSettings}>
              <RotateCcw size={14} />
              Reset Defaults
            </button>
            <button type="button" className="auth-button primary" onClick={saveSettings}>
              <Save size={15} />
              Save Authentication Settings
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
