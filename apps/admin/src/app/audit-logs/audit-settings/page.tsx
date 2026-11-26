
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Database,
  Download,
  FileText,
  LockKeyhole,
  RefreshCw,
  Save,
  Settings2,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Users,
} from "lucide-react";

type SettingToggleProps = {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
};

function SettingToggle({
  title,
  description,
  checked,
  onChange,
  disabled = false,
}: SettingToggleProps) {
  return (
    <div className="settingRow">
      <div className="settingCopy">
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      <button
        type="button"
        className={`toggle ${checked ? "enabled" : ""}`}
        onClick={onChange}
        disabled={disabled}
        aria-pressed={checked}
        aria-label={`${title}: ${checked ? "enabled" : "disabled"}`}
      >
        {checked ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
      </button>
    </div>
  );
}

export default function AuditSettingsPage() {
  const [retention, setRetention] = useState("365");
  const [captureLevel, setCaptureLevel] = useState("Detailed");
  const [exportFormat, setExportFormat] = useState("CSV and JSON");
  const [maskingLevel, setMaskingLevel] = useState("Sensitive fields");
  const [settings, setSettings] = useState({
    captureUserActivity: true,
    captureAdminActivity: true,
    captureAuthentication: true,
    captureApiRequests: true,
    captureModelEvents: true,
    captureDataAccess: true,
    captureConfigurationChanges: true,
    captureSecurityEvents: true,
    captureFailedEvents: true,
    maskSensitiveData: true,
    requireExportApproval: true,
    restrictExportsToAdmins: true,
    notifyFailedLogins: true,
    notifyPermissionChanges: true,
    notifyRetentionChanges: true,
    notifyExportRequests: false,
    integrityChecks: true,
    immutableRecords: true,
  });
  const [saved, setSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState("Not saved in this session");
  const [confirmReset, setConfirmReset] = useState(false);

  function updateSetting(key: keyof typeof settings) {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
    setSaved(false);
  }

  function saveSettings() {
    setSaved(true);
    setLastSaved(new Date().toLocaleString());
  }

  function resetSettings() {
    setRetention("365");
    setCaptureLevel("Detailed");
    setExportFormat("CSV and JSON");
    setMaskingLevel("Sensitive fields");
    setSettings({
      captureUserActivity: true,
      captureAdminActivity: true,
      captureAuthentication: true,
      captureApiRequests: true,
      captureModelEvents: true,
      captureDataAccess: true,
      captureConfigurationChanges: true,
      captureSecurityEvents: true,
      captureFailedEvents: true,
      maskSensitiveData: true,
      requireExportApproval: true,
      restrictExportsToAdmins: true,
      notifyFailedLogins: true,
      notifyPermissionChanges: true,
      notifyRetentionChanges: true,
      notifyExportRequests: false,
      integrityChecks: true,
      immutableRecords: true,
    });
    setSaved(false);
    setConfirmReset(false);
  }

  const enabledCount = Object.values(settings).filter(Boolean).length;

  return (
    <main className="page">
      <div className="breadcrumbs">
        <Link href="/dashboard">Admin</Link>
        <ChevronRight size={13} />
        <Link href="/audit-logs">Audit Logs</Link>
        <ChevronRight size={13} />
        <strong>Audit Settings</strong>
      </div>

      <header className="pageHeader">
        <div className="titleLine">
          <div className="titleIcon"><Settings2 size={24} /></div>
          <div>
            <h1>Audit Settings</h1>
            <p>
              Configure audit event collection, retention, data protection,
              export access, and compliance monitoring.
            </p>
          </div>
        </div>
        <div className="headerActions">
          <button className="button secondary" onClick={resetSettings}>
            <RefreshCw size={15} /> Reset defaults
          </button>
          <button className="button primary" onClick={saveSettings}>
            <Save size={16} /> Save settings
          </button>
        </div>
      </header>

      {saved && (
        <div className="successBanner">
          <CheckCircle2 size={18} />
          <div>
            <strong>Settings saved for this session</strong>
            <p>
              This frontend demo has updated its local page state. Backend
              persistence and enforcement are not connected.
            </p>
          </div>
          <Check size={18} />
        </div>
      )}

      <section className="overviewGrid">
        <article className="overviewCard">
          <div className="overviewTop"><span>Event collection</span><Activity size={18} /></div>
          <strong>{enabledCount} <small>/ 18</small></strong>
          <p>Configuration switches enabled</p>
          <div className="progress"><span style={{ width: `${(enabledCount / 18) * 100}%` }} /></div>
        </article>
        <article className="overviewCard">
          <div className="overviewTop"><span>Retention period</span><Clock3 size={18} /></div>
          <strong>{retention} <small>days</small></strong>
          <p>Configured audit record retention</p>
          <div className="miniInfo"><ShieldCheck size={14} /> Retention policy</div>
        </article>
        <article className="overviewCard">
          <div className="overviewTop"><span>Data protection</span><LockKeyhole size={18} /></div>
          <strong>{settings.maskSensitiveData ? "Enabled" : "Disabled"}</strong>
          <p>Demo sensitive-data masking setting</p>
          <div className={`miniInfo ${settings.maskSensitiveData ? "good" : "warning"}`}>
            {settings.maskSensitiveData ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
            {settings.maskSensitiveData ? "Masking configured" : "Review masking policy"}
          </div>
        </article>
        <article className="overviewCard">
          <div className="overviewTop"><span>Last saved</span><Database size={18} /></div>
          <strong className="savedValue">{saved ? "Just now" : "—"}</strong>
          <p>{lastSaved}</p>
          <div className="miniInfo"><Settings2 size={14} /> Session state only</div>
        </article>
      </section>

      <div className="contentGrid">
        <div className="mainColumn">
          <section className="panel">
            <div className="panelHeader">
              <div className="panelIcon blue"><Activity size={19} /></div>
              <div className="panelHeading">
                <h2>Event collection</h2>
                <p>Choose which platform activities should be captured by the audit service.</p>
              </div>
              <span className="sectionTag">01</span>
            </div>
            <div className="settingList">
              <SettingToggle
                title="User activity"
                description="Capture user actions, session activity, and workspace operations."
                checked={settings.captureUserActivity}
                onChange={() => updateSetting("captureUserActivity")}
              />
              <SettingToggle
                title="Administrator activity"
                description="Record privileged actions and administrative changes."
                checked={settings.captureAdminActivity}
                onChange={() => updateSetting("captureAdminActivity")}
              />
              <SettingToggle
                title="Authentication events"
                description="Record sign-ins, sign-outs, failed logins, and authentication events."
                checked={settings.captureAuthentication}
                onChange={() => updateSetting("captureAuthentication")}
              />
              <SettingToggle
                title="API requests"
                description="Capture API access, HTTP methods, response codes, and request metadata."
                checked={settings.captureApiRequests}
                onChange={() => updateSetting("captureApiRequests")}
              />
              <SettingToggle
                title="AI model events"
                description="Record model selection, inference requests, routing, and evaluation activity."
                checked={settings.captureModelEvents}
                onChange={() => updateSetting("captureModelEvents")}
              />
              <SettingToggle
                title="Data access"
                description="Track access to files, knowledge sources, and protected resources."
                checked={settings.captureDataAccess}
                onChange={() => updateSetting("captureDataAccess")}
              />
              <SettingToggle
                title="Configuration changes"
                description="Record changes to workspace, provider, policy, and platform settings."
                checked={settings.captureConfigurationChanges}
                onChange={() => updateSetting("captureConfigurationChanges")}
              />
              <SettingToggle
                title="Security events"
                description="Capture suspicious activity, denied access, and security alerts."
                checked={settings.captureSecurityEvents}
                onChange={() => updateSetting("captureSecurityEvents")}
              />
              <SettingToggle
                title="Failed operations"
                description="Include failed actions and rejected requests for troubleshooting."
                checked={settings.captureFailedEvents}
                onChange={() => updateSetting("captureFailedEvents")}
              />
            </div>
          </section>

          <section className="panel">
            <div className="panelHeader">
              <div className="panelIcon purple"><Database size={19} /></div>
              <div className="panelHeading">
                <h2>Retention and storage</h2>
                <p>Configure how long audit records should be retained.</p>
              </div>
              <span className="sectionTag">02</span>
            </div>
            <div className="formContent">
              <label className="field">
                <span>Audit record retention</span>
                <select value={retention} onChange={(event) => { setRetention(event.target.value); setSaved(false); }}>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365">365 days</option>
                  <option value="730">730 days (2 years)</option>
                  <option value="1095">1095 days (3 years)</option>
                  <option value="0">Indefinite retention</option>
                </select>
                <small>Actual deletion and retention enforcement require backend jobs and an approved retention policy.</small>
              </label>

              <label className="field">
                <span>Capture detail level</span>
                <select value={captureLevel} onChange={(event) => { setCaptureLevel(event.target.value); setSaved(false); }}>
                  <option value="Minimal">Minimal — event and result</option>
                  <option value="Standard">Standard — actor and resource metadata</option>
                  <option value="Detailed">Detailed — expanded event metadata</option>
                </select>
                <small>Avoid collecting secrets, passwords, access tokens, or unnecessary personal data.</small>
              </label>

              <div className="retentionNotice">
                <AlertTriangle size={17} />
                <div>
                  <strong>Retention policy reminder</strong>
                  <p>Align retention with contractual obligations, applicable law, and your organization&apos;s data minimization policy.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panelHeader">
              <div className="panelIcon green"><LockKeyhole size={19} /></div>
              <div className="panelHeading">
                <h2>Data protection</h2>
                <p>Configure sensitive data handling and audit record integrity options.</p>
              </div>
              <span className="sectionTag">03</span>
            </div>
            <div className="settingList">
              <SettingToggle
                title="Mask sensitive fields"
                description="Configure redaction for sensitive values before they are stored or exported."
                checked={settings.maskSensitiveData}
                onChange={() => updateSetting("maskSensitiveData")}
              />
              <SettingToggle
                title="Integrity verification"
                description="Enable the intended audit integrity verification workflow."
                checked={settings.integrityChecks}
                onChange={() => updateSetting("integrityChecks")}
              />
              <SettingToggle
                title="Immutable audit records"
                description="Configure the intended append-only record policy for production storage."
                checked={settings.immutableRecords}
                onChange={() => updateSetting("immutableRecords")}
              />
            </div>
            <div className="formContent">
              <label className="field">
                <span>Masking policy</span>
                <select value={maskingLevel} onChange={(event) => { setMaskingLevel(event.target.value); setSaved(false); }}>
                  <option value="Sensitive fields">Sensitive fields — tokens, secrets, credentials</option>
                  <option value="Strict">Strict — redact sensitive and personal fields</option>
                  <option value="Minimal">Minimal — redact credentials only</option>
                </select>
              </label>
            </div>
          </section>

          <section className="panel">
            <div className="panelHeader">
              <div className="panelIcon orange"><Download size={19} /></div>
              <div className="panelHeading">
                <h2>Export controls</h2>
                <p>Set the intended format and access restrictions for audit exports.</p>
              </div>
              <span className="sectionTag">04</span>
            </div>
            <div className="formContent">
              <label className="field">
                <span>Allowed export formats</span>
                <select value={exportFormat} onChange={(event) => { setExportFormat(event.target.value); setSaved(false); }}>
                  <option value="CSV and JSON">CSV and JSON</option>
                  <option value="CSV only">CSV only</option>
                  <option value="JSON only">JSON only</option>
                </select>
              </label>
            </div>
            <div className="settingList">
              <SettingToggle
                title="Require approval for exports"
                description="Require an authorized reviewer before sensitive audit exports are released."
                checked={settings.requireExportApproval}
                onChange={() => updateSetting("requireExportApproval")}
              />
              <SettingToggle
                title="Restrict exports to administrators"
                description="Limit audit export permissions to authorized administrator roles."
                checked={settings.restrictExportsToAdmins}
                onChange={() => updateSetting("restrictExportsToAdmins")}
              />
            </div>
          </section>

          <section className="panel">
            <div className="panelHeader">
              <div className="panelIcon yellow"><Bell size={19} /></div>
              <div className="panelHeading">
                <h2>Alerts and notifications</h2>
                <p>Choose which events should trigger an audit notification.</p>
              </div>
              <span className="sectionTag">05</span>
            </div>
            <div className="settingList">
              <SettingToggle
                title="Repeated failed sign-ins"
                description="Notify the security team about repeated authentication failures."
                checked={settings.notifyFailedLogins}
                onChange={() => updateSetting("notifyFailedLogins")}
              />
              <SettingToggle
                title="Permission changes"
                description="Notify when user roles, access permissions, or privileges change."
                checked={settings.notifyPermissionChanges}
                onChange={() => updateSetting("notifyPermissionChanges")}
              />
              <SettingToggle
                title="Retention policy changes"
                description="Notify administrators when audit retention settings are modified."
                checked={settings.notifyRetentionChanges}
                onChange={() => updateSetting("notifyRetentionChanges")}
              />
              <SettingToggle
                title="Export requests"
                description="Notify designated reviewers when an audit export is requested."
                checked={settings.notifyExportRequests}
                onChange={() => updateSetting("notifyExportRequests")}
              />
            </div>
          </section>
        </div>

        <aside className="sideColumn">
          <section className="sidePanel">
            <div className="sideTitle"><ShieldCheck size={18} /><h3>Configuration status</h3></div>
            <div className="statusLine">
              <span>Audit collection</span>
              <span className="pill greenPill">Configured</span>
            </div>
            <div className="statusLine">
              <span>Data masking</span>
              <span className={`pill ${settings.maskSensitiveData ? "greenPill" : "redPill"}`}>
                {settings.maskSensitiveData ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="statusLine">
              <span>Export approval</span>
              <span className={`pill ${settings.requireExportApproval ? "greenPill" : "yellowPill"}`}>
                {settings.requireExportApproval ? "Required" : "Not required"}
              </span>
            </div>
            <div className="statusLine">
              <span>Integrity checks</span>
              <span className={`pill ${settings.integrityChecks ? "greenPill" : "yellowPill"}`}>
                {settings.integrityChecks ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="statusLine">
              <span>Record immutability</span>
              <span className={`pill ${settings.immutableRecords ? "greenPill" : "yellowPill"}`}>
                {settings.immutableRecords ? "Configured" : "Disabled"}
              </span>
            </div>
            <p className="sideFootnote">These statuses reflect UI configuration only, not verified backend enforcement.</p>
          </section>

          <section className="sidePanel">
            <div className="sideTitle"><Users size={18} /><h3>Access governance</h3></div>
            <p className="sideDescription">Recommended controls for managing access to audit data.</p>
            <ul className="checkList">
              <li><CheckCircle2 size={15} /> Role-based permissions</li>
              <li><CheckCircle2 size={15} /> Separation of duties</li>
              <li><CheckCircle2 size={15} /> Export activity monitoring</li>
              <li><CheckCircle2 size={15} /> Periodic access reviews</li>
            </ul>
            <Link className="sideLink" href="/governance">Open Governance <ChevronRight size={14} /></Link>
          </section>

          <section className="sidePanel">
            <div className="sideTitle"><FileText size={18} /><h3>Audit resources</h3></div>
            <Link className="resourceLink" href="/audit-logs">
              <span className="resourceIcon"><Activity size={16} /></span>
              <span><strong>Audit overview</strong><small>Review audit activity</small></span>
              <ChevronRight size={15} />
            </Link>
            <Link className="resourceLink" href="/audit-logs/export-reports">
              <span className="resourceIcon"><Download size={16} /></span>
              <span><strong>Export & Reports</strong><small>Generate report exports</small></span>
              <ChevronRight size={15} />
            </Link>
          </section>

          <section className="sidePanel lastSaved">
            <div className="sideTitle"><SlidersHorizontal size={18} /><h3>Change summary</h3></div>
            <p>Enabled switches: <strong>{enabledCount} / 18</strong></p>
            <p>Retention: <strong>{retention === "0" ? "Indefinite" : `${retention} days`}</strong></p>
            <p>Detail level: <strong>{captureLevel}</strong></p>
            <p>Export format: <strong>{exportFormat}</strong></p>
            <p>Masking policy: <strong>{maskingLevel}</strong></p>
            <div className="saveTime"><Clock3 size={14} /> {lastSaved}</div>
          </section>
        </aside>
      </div>

      <div className="footerActions">
        <div><Shield size={16} /><span>Review configuration changes before applying them in production.</span></div>
        <div className="footerButtons">
          <button className="button secondary" onClick={() => setConfirmReset(true)}><Trash2 size={15} /> Reset all</button>
          <button className="button primary" onClick={saveSettings}><Save size={15} /> Save changes</button>
        </div>
      </div>

      {confirmReset && (
        <div className="confirmBackdrop" onClick={() => setConfirmReset(false)}>
          <div className="confirmModal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="confirmIcon"><AlertTriangle size={22} /></div>
            <h2>Reset audit settings?</h2>
            <p>All current controls will return to their default demo values. This action only affects this page&apos;s current state.</p>
            <div className="confirmActions">
              <button className="button secondary" onClick={() => setConfirmReset(false)}>Cancel</button>
              <button className="button danger" onClick={resetSettings}>Reset settings</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        * { box-sizing: border-box; }
        .page { min-height: 100vh; padding: 27px; background: #f7f8fc; color: #1c2639; font-family: Arial, Helvetica, sans-serif; }
        .breadcrumbs { display: flex; align-items: center; gap: 8px; color: #9aa3b3; font-size: 11px; margin-bottom: 24px; }
        .breadcrumbs a { color: #68758c; text-decoration: none; }
        .breadcrumbs a:hover { color: #315bea; }
        .breadcrumbs strong { color: #29364d; font-weight: 650; }
        .pageHeader { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 23px; }
        .titleLine { display: flex; align-items: flex-start; gap: 14px; }
        .titleIcon { display: grid; place-items: center; width: 47px; height: 47px; flex-shrink: 0; color: #315bea; background: #eaf0ff; border-radius: 13px; }
        h1 { margin: 0 0 8px; font-size: 27px; font-weight: 750; letter-spacing: -.7px; }
        .titleLine p { max-width: 720px; margin: 0; color: #7b869a; font-size: 12px; line-height: 1.7; }
        .headerActions { display: flex; gap: 9px; flex-wrap: wrap; }
        .button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 1px solid #dfe4ed; border-radius: 8px; padding: 10px 13px; font-size: 11px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: .15s; }
        .secondary { background: white; color: #46536a; }
        .secondary:hover { background: #f4f6fa; border-color: #cbd4e3; }
        .primary { color: white; background: #315bea; border-color: #315bea; }
        .primary:hover { background: #2449cb; }
        .danger { color: white; background: #c83232; border-color: #c83232; }
        .danger:hover { background: #a92121; }
        .successBanner { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 19px; padding: 13px 16px; border: 1px solid #b9e8cc; border-radius: 10px; color: #187344; background: #effbf4; }
        .successBanner > svg:last-child { margin-left: auto; }
        .successBanner strong { font-size: 12px; }
        .successBanner p { margin: 5px 0 0; color: #4c8869; font-size: 11px; line-height: 1.5; }
        .overviewGrid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 20px; }
        .overviewCard { padding: 17px; background: white; border: 1px solid #e6eaf1; border-radius: 12px; min-width: 0; box-shadow: 0 2px 7px #18274704; }
        .overviewTop { display: flex; justify-content: space-between; align-items: center; color: #7c879b; font-size: 11px; margin-bottom: 16px; }
        .overviewTop svg { color: #8794aa; }
        .overviewCard > strong { display: block; margin-bottom: 7px; color: #222e43; font-size: 25px; letter-spacing: -.5px; }
        .overviewCard > strong small { font-size: 12px; color: #8a95a8; font-weight: 500; }
        .overviewCard > strong.savedValue { font-size: 23px; }
        .overviewCard > p { margin: 0 0 12px; color: #929bad; font-size: 10px; line-height: 1.5; }
        .progress { height: 5px; background: #edf0f6; border-radius: 8px; overflow: hidden; }
        .progress span { display: block; height: 100%; background: #315bea; border-radius: 8px; transition: width .2s; }
        .miniInfo { display: flex; align-items: center; gap: 6px; color: #69778f; font-size: 10px; }
        .miniInfo.good { color: #17804b; }
        .miniInfo.warning { color: #bd7717; }
        .contentGrid { display: grid; grid-template-columns: minmax(0, 1fr) 290px; align-items: start; gap: 19px; }
        .mainColumn, .sideColumn { display: flex; flex-direction: column; gap: 17px; min-width: 0; }
        .panel, .sidePanel { background: white; border: 1px solid #e6eaf1; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 7px #18274704; }
        .panelHeader { display: flex; align-items: center; gap: 12px; padding: 17px 19px; border-bottom: 1px solid #edf0f5; }
        .panelIcon { display: grid; place-items: center; width: 38px; height: 38px; flex-shrink: 0; border-radius: 10px; }
        .panelIcon.blue { color: #315bea; background: #edf2ff; }
        .panelIcon.purple { color: #7950c7; background: #f4efff; }
        .panelIcon.green { color: #17804b; background: #eaf8f0; }
        .panelIcon.orange { color: #c27a1b; background: #fff4e6; }
        .panelIcon.yellow { color: #a77a13; background: #fff9e6; }
        .panelHeading { flex: 1; min-width: 0; }
        .panelHeading h2 { margin: 0 0 5px; font-size: 13px; font-weight: 750; }
        .panelHeading p { margin: 0; color: #8993a7; font-size: 10px; line-height: 1.6; }
        .sectionTag { display: grid; place-items: center; width: 27px; height: 27px; flex-shrink: 0; color: #8994a8; background: #f5f6fa; border-radius: 7px; font-size: 10px; font-weight: 750; }
        .settingList { padding: 0 19px; }
        .settingRow { display: flex; align-items: center; gap: 18px; padding: 15px 0; border-bottom: 1px solid #f0f2f6; }
        .settingRow:last-child { border-bottom: 0; }
        .settingCopy { flex: 1; min-width: 0; }
        .settingCopy strong { display: block; margin-bottom: 5px; color: #354158; font-size: 11px; font-weight: 700; }
        .settingCopy p { margin: 0; color: #8a95a8; font-size: 10px; line-height: 1.6; }
        .toggle { display: inline-flex; flex-shrink: 0; align-items: center; border: 0; padding: 0; background: transparent; color: #a5adbb; cursor: pointer; }
        .toggle.enabled { color: #315bea; }
        .toggle:disabled { opacity: .5; cursor: not-allowed; }
        .formContent { padding: 18px 19px; display: flex; flex-direction: column; gap: 17px; }
        .field { display: flex; flex-direction: column; gap: 8px; }
        .field > span { color: #46536a; font-size: 11px; font-weight: 700; }
        .field select { width: 100%; min-height: 39px; padding: 0 11px; color: #354158; background: white; border: 1px solid #dfe4ed; border-radius: 8px; font-size: 11px; outline: none; }
        .field select:focus { border-color: #8ea6ff; box-shadow: 0 0 0 3px #315bea12; }
        .field small { color: #929bad; font-size: 10px; line-height: 1.6; }
        .retentionNotice { display: flex; align-items: flex-start; gap: 10px; padding: 13px; border: 1px solid #f1dfb2; border-radius: 9px; background: #fffaf0; color: #a16c12; }
        .retentionNotice svg { flex-shrink: 0; }
        .retentionNotice strong { font-size: 11px; }
        .retentionNotice p { margin: 5px 0 0; color: #92733e; font-size: 10px; line-height: 1.6; }
        .sidePanel { padding: 17px; }
        .sideTitle { display: flex; align-items: center; gap: 9px; margin-bottom: 15px; color: #315bea; }
        .sideTitle h3 { margin: 0; color: #2d394f; font-size: 12px; font-weight: 750; }
        .statusLine { display: flex; justify-content: space-between; align-items: center; gap: 9px; padding: 11px 0; border-bottom: 1px solid #f0f2f6; color: #69758b; font-size: 10px; }
        .statusLine:last-of-type { border-bottom: 0; }
        .pill { display: inline-flex; padding: 5px 7px; border-radius: 20px; font-size: 9px; font-weight: 750; white-space: nowrap; }
        .greenPill { color: #167544; background: #eaf8f0; }
        .redPill { color: #b42318; background: #feeceb; }
        .yellowPill { color: #966515; background: #fff5dc; }
        .sideFootnote { margin: 13px 0 0; color: #9aa3b2; font-size: 9px; line-height: 1.6; }
        .sideDescription { color: #8b95a8; font-size: 10px; line-height: 1.6; margin: -5px 0 13px; }
        .checkList { list-style: none; display: flex; flex-direction: column; gap: 12px; margin: 0 0 16px; padding: 0; }
        .checkList li { display: flex; align-items: center; gap: 8px; color: #5d6a81; font-size: 10px; }
        .checkList svg { color: #17804b; flex-shrink: 0; }
        .sideLink { display: flex; align-items: center; justify-content: space-between; padding-top: 13px; border-top: 1px solid #edf0f5; color: #315bea; text-decoration: none; font-size: 10px; font-weight: 700; }
        .resourceLink { display: flex; align-items: center; gap: 10px; padding: 11px 0; border-bottom: 1px solid #f0f2f6; color: #6d7990; text-decoration: none; }
        .resourceLink:last-child { border-bottom: 0; padding-bottom: 0; }
        .resourceIcon { display: grid; place-items: center; width: 32px; height: 32px; flex-shrink: 0; background: #f1f4fb; border-radius: 8px; color: #315bea; }
        .resourceLink > span:nth-child(2) { flex: 1; display: grid; gap: 4px; }
        .resourceLink strong { color: #3b4860; font-size: 10px; }
        .resourceLink small { color: #929bad; font-size: 9px; }
        .resourceLink > svg { color: #a0a8b6; }
        .lastSaved > p { display: flex; justify-content: space-between; gap: 8px; margin: 0; padding: 9px 0; border-bottom: 1px solid #f0f2f6; color: #8490a5; font-size: 10px; }
        .lastSaved > p strong { color: #45516a; text-align: right; font-size: 10px; }
        .saveTime { display: flex; align-items: center; gap: 6px; margin-top: 13px; color: #8d97a9; font-size: 9px; }
        .footerActions { display: flex; justify-content: space-between; align-items: center; gap: 14px; margin-top: 20px; padding: 15px 17px; background: white; border: 1px solid #e6eaf1; border-radius: 11px; }
        .footerActions > div:first-child { display: flex; align-items: center; gap: 9px; color: #7f8aa0; font-size: 10px; line-height: 1.5; }
        .footerActions > div:first-child svg { color: #315bea; flex-shrink: 0; }
        .footerButtons { display: flex; gap: 9px; }
        .confirmBackdrop { position: fixed; inset: 0; z-index: 120; display: grid; place-items: center; padding: 20px; background: #10182880; }
        .confirmModal { width: 100%; max-width: 410px; padding: 24px; border-radius: 14px; background: white; box-shadow: 0 20px 70px #0003; }
        .confirmIcon { display: grid; place-items: center; width: 43px; height: 43px; margin-bottom: 15px; color: #b87516; background: #fff5df; border-radius: 11px; }
        .confirmModal h2 { margin: 0 0 9px; color: #28354a; font-size: 17px; }
        .confirmModal p { margin: 0; color: #7e899d; font-size: 11px; line-height: 1.7; }
        .confirmActions { display: flex; justify-content: flex-end; gap: 9px; margin-top: 22px; }
        @media (max-width: 1150px) { .contentGrid { grid-template-columns: minmax(0, 1fr) 260px; } .overviewGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 900px) { .contentGrid { grid-template-columns: 1fr; } .sideColumn { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; } }
        @media (max-width: 650px) { .page { padding: 16px; } .pageHeader { flex-direction: column; } .headerActions { width: 100%; } .headerActions .button { flex: 1; } .overviewGrid { grid-template-columns: 1fr 1fr; gap: 9px; } .overviewCard { padding: 13px; } .panelHeader { padding: 14px; } .settingList, .formContent { padding-left: 14px; padding-right: 14px; } .settingRow { gap: 9px; } .sideColumn { grid-template-columns: 1fr; } .footerActions { flex-direction: column; align-items: stretch; } .footerButtons { width: 100%; } .footerButtons .button { flex: 1; } }
        @media (max-width: 390px) { .overviewGrid { grid-template-columns: 1fr; } h1 { font-size: 23px; } .titleLine { gap: 10px; } .sectionTag { display: none; } .confirmActions { flex-direction: column-reverse; } .confirmActions .button { width: 100%; } }
      `}</style>
    </main>
  );
}
