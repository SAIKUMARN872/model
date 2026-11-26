
"use client";

import { useState } from "react";
import {
  SlidersHorizontal,
  Globe,
  Server,
  ShieldCheck,
  Save,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Database,
  Activity,
} from "lucide-react";

type Configuration = {
  environment: string;
  platformUrl: string;
  apiBaseUrl: string;
  deploymentRegion: string;
  logLevel: string;
  maxRequestTimeout: number;
  maxConcurrentRequests: number;
  enableApiAccess: boolean;
  enableRateLimiting: boolean;
  enableAuditLogging: boolean;
  enableHealthChecks: boolean;
};

const initialConfiguration: Configuration = {
  environment: "Production",
  platformUrl: "https://modelnow.ai",
  apiBaseUrl: "https://api.modelnow.ai",
  deploymentRegion: "ap-south-1",
  logLevel: "info",
  maxRequestTimeout: 120,
  maxConcurrentRequests: 100,
  enableApiAccess: true,
  enableRateLimiting: true,
  enableAuditLogging: true,
  enableHealthChecks: true,
};

export default function PlatformConfigurationPage() {
  const [config, setConfig] =
    useState<Configuration>(initialConfiguration);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof Configuration>(
    key: K,
    value: Configuration[K],
  ) {
    setConfig((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function saveConfiguration() {
    try {
      localStorage.setItem(
        "modelnow-platform-configuration",
        JSON.stringify(config),
      );
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }

  function resetConfiguration() {
    setConfig(initialConfiguration);
    setSaved(false);
  }

  function Toggle({
    label,
    description,
    value,
    onChange,
  }: {
    label: string;
    description: string;
    value: boolean;
    onChange: (value: boolean) => void;
  }) {
    return (
      <div className="pc-toggle-row">
        <div className="pc-toggle-copy">
          <strong>{label}</strong>
          <p>{description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={value}
          aria-label={label}
          className={`pc-switch ${value ? "active" : ""}`}
          onClick={() => onChange(!value)}
        />
      </div>
    );
  }

  return (
    <main className="pc-page">
      <style>{`
        * { box-sizing: border-box; }

        .pc-page {
          min-height: 100vh;
          padding: 30px;
          background: #f7f8fc;
          color: #182238;
          font-family: Arial, Helvetica, sans-serif;
        }

        .pc-container { max-width: 1200px; margin: 0 auto; }

        .pc-breadcrumb {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-bottom: 22px;
          color: #81899b;
          font-size: 13px;
        }

        .pc-breadcrumb a {
          color: #5266d9;
          text-decoration: none;
        }

        .pc-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 25px;
        }

        .pc-heading-main {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .pc-heading-icon {
          display: grid;
          place-items: center;
          width: 50px;
          height: 50px;
          flex-shrink: 0;
          border-radius: 14px;
          background: #e9edff;
          color: #4f62d8;
        }

        .pc-heading h1 {
          margin: 0 0 7px;
          font-size: 27px;
          letter-spacing: -0.6px;
        }

        .pc-heading p {
          margin: 0;
          color: #7a8498;
          font-size: 13px;
          line-height: 1.6;
        }

        .pc-actions { display: flex; gap: 10px; }

        .pc-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 40px;
          padding: 0 15px;
          border: 1px solid #dfe4ed;
          border-radius: 9px;
          background: white;
          color: #3d4860;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .pc-button.primary {
          color: white;
          background: #5062d8;
          border-color: #5062d8;
        }

        .pc-button:hover { opacity: .9; }

        .pc-success {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 13px 15px;
          margin-bottom: 20px;
          border: 1px solid #bce8ce;
          border-radius: 10px;
          background: #effbf4;
          color: #187447;
          font-size: 13px;
        }

        .pc-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 22px;
        }

        .pc-summary-card {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 19px;
          border: 1px solid #e7eaf1;
          border-radius: 13px;
          background: white;
        }

        .pc-summary-icon {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          border-radius: 11px;
          background: #f0f2ff;
          color: #5265d9;
        }

        .pc-summary-label {
          margin-bottom: 6px;
          color: #7f889a;
          font-size: 11px;
        }

        .pc-summary-value {
          overflow-wrap: anywhere;
          color: #202a40;
          font-size: 15px;
          font-weight: 700;
        }

        .pc-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 305px;
          gap: 21px;
          align-items: start;
        }

        .pc-main { display: flex; flex-direction: column; gap: 20px; }

        .pc-card {
          overflow: hidden;
          border: 1px solid #e7eaf1;
          border-radius: 14px;
          background: white;
          box-shadow: 0 2px 7px rgba(24,36,70,.025);
        }

        .pc-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 22px;
          border-bottom: 1px solid #edf0f5;
        }

        .pc-card-icon {
          display: grid;
          place-items: center;
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          border-radius: 10px;
          background: #f0f2ff;
          color: #5265d9;
        }

        .pc-card-header h2 { margin: 0 0 5px; font-size: 15px; }

        .pc-card-header p {
          margin: 0;
          color: #858da0;
          font-size: 12px;
          line-height: 1.5;
        }

        .pc-fields {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
          padding: 22px;
        }

        .pc-field { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
        .pc-field.full { grid-column: 1 / -1; }

        .pc-field label {
          color: #39445a;
          font-size: 12px;
          font-weight: 700;
        }

        .pc-field input, .pc-field select {
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

        .pc-field input:focus, .pc-field select:focus {
          border-color: #6677e7;
          box-shadow: 0 0 0 3px rgba(102,119,231,.1);
        }

        .pc-field small {
          color: #9299a9;
          font-size: 11px;
          line-height: 1.5;
        }

        .pc-side { display: flex; flex-direction: column; gap: 18px; }

        .pc-side-card {
          padding: 20px;
          border: 1px solid #e7eaf1;
          border-radius: 14px;
          background: white;
        }

        .pc-side-card h3 { margin: 0 0 15px; font-size: 14px; }

        .pc-toggle-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          padding: 15px 0;
          border-top: 1px solid #edf0f5;
        }

        .pc-toggle-row:first-of-type { padding-top: 0; border-top: 0; }

        .pc-toggle-copy { min-width: 0; }
        .pc-toggle-copy strong { display: block; margin-bottom: 5px; font-size: 12px; }
        .pc-toggle-copy p {
          margin: 0;
          color: #858da0;
          font-size: 11px;
          line-height: 1.6;
        }

        .pc-switch {
          position: relative;
          flex: 0 0 auto;
          width: 38px;
          height: 22px;
          padding: 0;
          border: 0;
          border-radius: 20px;
          background: #cbd1dd;
          cursor: pointer;
        }

        .pc-switch.active { background: #5367df; }

        .pc-switch::after {
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

        .pc-switch.active::after { transform: translateX(16px); }

        .pc-info {
          padding: 13px;
          border-radius: 9px;
          background: #f5f7ff;
          color: #66718b;
          font-size: 12px;
          line-height: 1.7;
        }

        .pc-info strong { color: #394b9b; }

        .pc-status-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          color: #24794f;
          font-size: 12px;
        }

        .pc-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #29b36f;
        }

        .pc-note {
          margin: 0;
          color: #858da0;
          font-size: 12px;
          line-height: 1.7;
        }

        @media (max-width: 1050px) {
          .pc-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .pc-layout { grid-template-columns: minmax(0, 1fr) 270px; }
        }

        @media (max-width: 850px) {
          .pc-layout { grid-template-columns: 1fr; }
          .pc-side { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        @media (max-width: 600px) {
          .pc-page { padding: 18px 14px; }
          .pc-heading { flex-direction: column; }
          .pc-heading h1 { font-size: 23px; }
          .pc-actions { width: 100%; }
          .pc-button { flex: 1; }
          .pc-summary { grid-template-columns: 1fr 1fr; gap: 10px; }
          .pc-summary-card { padding: 13px; gap: 9px; }
          .pc-summary-icon { width: 35px; height: 35px; }
          .pc-summary-value { font-size: 12px; }
          .pc-fields { grid-template-columns: 1fr; padding: 17px; }
          .pc-field.full { grid-column: auto; }
          .pc-side { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="pc-container">
        <div className="pc-breadcrumb">
          <a href="/dashboard">Admin</a>
          <span>/</span>
          <a href="/settings">Settings</a>
          <span>/</span>
          <span>Platform Configuration</span>
        </div>

        <header className="pc-heading">
          <div className="pc-heading-main">
            <div className="pc-heading-icon">
              <SlidersHorizontal size={24} />
            </div>
            <div>
              <h1>Platform Configuration</h1>
              <p>
                Configure environment, API behavior, deployment region,
                and platform-wide controls.
              </p>
            </div>
          </div>

          <div className="pc-actions">
            <button
              type="button"
              className="pc-button"
              onClick={resetConfiguration}
            >
              <RotateCcw size={15} />
              Reset
            </button>
            <button
              type="button"
              className="pc-button primary"
              onClick={saveConfiguration}
            >
              <Save size={15} />
              Save Configuration
            </button>
          </div>
        </header>

        {saved && (
          <div className="pc-success" role="status">
            <CheckCircle2 size={18} />
            Platform configuration saved in this browser.
          </div>
        )}

        <section className="pc-summary">
          <div className="pc-summary-card">
            <div className="pc-summary-icon"><Server size={20} /></div>
            <div>
              <div className="pc-summary-label">Environment</div>
              <div className="pc-summary-value">{config.environment}</div>
            </div>
          </div>

          <div className="pc-summary-card">
            <div className="pc-summary-icon"><Globe size={20} /></div>
            <div>
              <div className="pc-summary-label">Deployment Region</div>
              <div className="pc-summary-value">{config.deploymentRegion}</div>
            </div>
          </div>

          <div className="pc-summary-card">
            <div className="pc-summary-icon"><Activity size={20} /></div>
            <div>
              <div className="pc-summary-label">Request Timeout</div>
              <div className="pc-summary-value">{config.maxRequestTimeout}s</div>
            </div>
          </div>

          <div className="pc-summary-card">
            <div className="pc-summary-icon"><Cpu size={20} /></div>
            <div>
              <div className="pc-summary-label">Concurrent Requests</div>
              <div className="pc-summary-value">
                {config.maxConcurrentRequests}
              </div>
            </div>
          </div>
        </section>

        <div className="pc-layout">
          <div className="pc-main">
            <section className="pc-card">
              <div className="pc-card-header">
                <span className="pc-card-icon"><Server size={19} /></span>
                <div>
                  <h2>Environment & Deployment</h2>
                  <p>Set the platform environment and deployment location.</p>
                </div>
              </div>

              <div className="pc-fields">
                <div className="pc-field">
                  <label htmlFor="environment">Environment</label>
                  <select
                    id="environment"
                    value={config.environment}
                    onChange={(e) => update("environment", e.target.value)}
                  >
                    <option>Development</option>
                    <option>Staging</option>
                    <option>Production</option>
                  </select>
                  <small>Choose the environment this configuration represents.</small>
                </div>

                <div className="pc-field">
                  <label htmlFor="deploymentRegion">Deployment Region</label>
                  <select
                    id="deploymentRegion"
                    value={config.deploymentRegion}
                    onChange={(e) => update("deploymentRegion", e.target.value)}
                  >
                    <option value="ap-south-1">Asia Pacific — Mumbai</option>
                    <option value="ap-southeast-1">Asia Pacific — Singapore</option>
                    <option value="us-east-1">US East — N. Virginia</option>
                    <option value="us-west-2">US West — Oregon</option>
                    <option value="eu-west-1">Europe — Ireland</option>
                  </select>
                </div>

                <div className="pc-field full">
                  <label htmlFor="platformUrl">Platform URL</label>
                  <input
                    id="platformUrl"
                    type="url"
                    value={config.platformUrl}
                    onChange={(e) => update("platformUrl", e.target.value)}
                    placeholder="https://modelnow.ai"
                  />
                </div>

                <div className="pc-field full">
                  <label htmlFor="apiBaseUrl">API Base URL</label>
                  <input
                    id="apiBaseUrl"
                    type="url"
                    value={config.apiBaseUrl}
                    onChange={(e) => update("apiBaseUrl", e.target.value)}
                    placeholder="https://api.example.com"
                  />
                  <small>Configuration value only; this page does not change the actual API endpoint.</small>
                </div>
              </div>
            </section>

            <section className="pc-card">
              <div className="pc-card-header">
                <span className="pc-card-icon"><Activity size={19} /></span>
                <div>
                  <h2>Request & Runtime Limits</h2>
                  <p>Configure request handling values for the platform.</p>
                </div>
              </div>

              <div className="pc-fields">
                <div className="pc-field">
                  <label htmlFor="maxRequestTimeout">
                    Request Timeout (seconds)
                  </label>
                  <input
                    id="maxRequestTimeout"
                    type="number"
                    min={1}
                    max={900}
                    value={config.maxRequestTimeout}
                    onChange={(e) =>
                      update(
                        "maxRequestTimeout",
                        Math.min(900, Math.max(1, Number(e.target.value) || 1)),
                      )
                    }
                  />
                  <small>Allowed range: 1–900 seconds.</small>
                </div>

                <div className="pc-field">
                  <label htmlFor="maxConcurrentRequests">
                    Maximum Concurrent Requests
                  </label>
                  <input
                    id="maxConcurrentRequests"
                    type="number"
                    min={1}
                    max={10000}
                    value={config.maxConcurrentRequests}
                    onChange={(e) =>
                      update(
                        "maxConcurrentRequests",
                        Math.min(10000, Math.max(1, Number(e.target.value) || 1)),
                      )
                    }
                  />
                  <small>Allowed range: 1–10,000 requests.</small>
                </div>

                <div className="pc-field full">
                  <label htmlFor="logLevel">Application Log Level</label>
                  <select
                    id="logLevel"
                    value={config.logLevel}
                    onChange={(e) => update("logLevel", e.target.value)}
                  >
                    <option value="error">Error — errors only</option>
                    <option value="warn">Warning — warnings and errors</option>
                    <option value="info">Info — standard operational logs</option>
                    <option value="debug">Debug — detailed diagnostics</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="pc-card">
              <div className="pc-card-header">
                <span className="pc-card-icon"><ShieldCheck size={19} /></span>
                <div>
                  <h2>Platform Services</h2>
                  <p>Manage the intended availability of platform services.</p>
                </div>
              </div>

              <div className="pc-fields" style={{ display: "block" }}>
                <Toggle
                  label="API Access"
                  description="Allow API access according to configured permissions."
                  value={config.enableApiAccess}
                  onChange={(value) => update("enableApiAccess", value)}
                />
                <Toggle
                  label="Rate Limiting"
                  description="Enable the platform rate-limiting policy."
                  value={config.enableRateLimiting}
                  onChange={(value) => update("enableRateLimiting", value)}
                />
                <Toggle
                  label="Audit Logging"
                  description="Enable the intended recording of administrative activity."
                  value={config.enableAuditLogging}
                  onChange={(value) => update("enableAuditLogging", value)}
                />
                <Toggle
                  label="Health Checks"
                  description="Enable the intended platform health-check feature."
                  value={config.enableHealthChecks}
                  onChange={(value) => update("enableHealthChecks", value)}
                />
              </div>
            </section>
          </div>

          <aside className="pc-side">
            <section className="pc-side-card">
              <h3>Configuration Status</h3>
              <div className="pc-status-row">
                <span className="pc-status-dot" />
                Local configuration ready
              </div>
              <p className="pc-note">
                Values shown here are editable configuration settings. They
                do not change deployed infrastructure until connected to the
                appropriate backend services.
              </p>
            </section>

            <section className="pc-side-card">
              <h3>Service Controls</h3>
              <Toggle
                label="API Access"
                description="Current configuration value"
                value={config.enableApiAccess}
                onChange={(value) => update("enableApiAccess", value)}
              />
              <Toggle
                label="Health Checks"
                description="Current configuration value"
                value={config.enableHealthChecks}
                onChange={(value) => update("enableHealthChecks", value)}
              />
            </section>

            <section className="pc-side-card">
              <h3>Configuration Guidance</h3>
              <div className="pc-info">
                <strong>Important:</strong> Validate environment-specific
                URLs, request limits, and region settings before applying
                them to production.
              </div>
              <p className="pc-note" style={{ marginTop: 14 }}>
                <Database size={14} style={{ display: "inline", marginRight: 5 }} />
                Current storage: browser local storage.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
