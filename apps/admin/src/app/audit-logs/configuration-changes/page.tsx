
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  Eye,
  FileJson,
  FileSpreadsheet,
  Filter,
  GitCompare,
  RefreshCw,
  Search,
  Settings2,
  ShieldAlert,
  X,
} from "lucide-react";

type ConfigEvent = {
  id: string;
  time: string;
  setting: string;
  category: string;
  actor: string;
  resource: string;
  previousValue: string;
  newValue: string;
  environment: string;
  status: "Applied" | "Pending Approval" | "Rejected" | "Rolled Back";
  risk: "High" | "Medium" | "Low";
  organization: string;
  details: string;
};

const initialEvents: ConfigEvent[] = [
  {
    id: "CFG-8001",
    time: "2026-11-04 10:52:18",
    setting: "Default model routing",
    category: "Model Routing",
    actor: "platform-admin",
    resource: "AI Gateway",
    previousValue: "balanced-routing-v1",
    newValue: "cost-optimized-routing-v2",
    environment: "Production",
    status: "Applied",
    risk: "High",
    organization: "ModelNow Workspace",
    details: "The example routing profile was updated to prefer cost efficiency while respecting configured model eligibility and policy constraints.",
  },
  {
    id: "CFG-8002",
    time: "2026-11-04 10:34:42",
    setting: "Provider timeout",
    category: "Provider Settings",
    actor: "ops-admin",
    resource: "Provider: Demo Provider A",
    previousValue: "30 seconds",
    newValue: "45 seconds",
    environment: "Production",
    status: "Applied",
    risk: "Medium",
    organization: "ModelNow Workspace",
    details: "A sample provider timeout change was applied. Verify the actual provider latency and retry behavior after deployment.",
  },
  {
    id: "CFG-8003",
    time: "2026-11-04 10:20:05",
    setting: "Require multi-factor authentication",
    category: "Security",
    actor: "security-admin",
    resource: "Organization authentication",
    previousValue: "Optional",
    newValue: "Required",
    environment: "Production",
    status: "Applied",
    risk: "High",
    organization: "Acme AI",
    details: "The demonstration record shows an authentication policy being strengthened. Real changes should include actor identity and approval evidence.",
  },
  {
    id: "CFG-8004",
    time: "2026-11-04 09:58:31",
    setting: "Context window limit",
    category: "Model Settings",
    actor: "ml-platform-admin",
    resource: "ModelNow Quality 12B",
    previousValue: "16,384 tokens",
    newValue: "32,768 tokens",
    environment: "Staging",
    status: "Pending Approval",
    risk: "Medium",
    organization: "ModelNow Workspace",
    details: "A proposed context window change is awaiting review before it can be applied.",
  },
  {
    id: "CFG-8005",
    time: "2026-11-04 09:40:17",
    setting: "New provider connection",
    category: "Provider Settings",
    actor: "integration-admin",
    resource: "Provider: Demo Provider B",
    previousValue: "Not configured",
    newValue: "Connection configured",
    environment: "Staging",
    status: "Pending Approval",
    risk: "High",
    organization: "Northstar Labs",
    details: "A sample provider integration is awaiting connection verification and approval. Secret credentials are not displayed.",
  },
  {
    id: "CFG-8006",
    time: "2026-11-03 18:27:09",
    setting: "Audit retention period",
    category: "Compliance",
    actor: "compliance-admin",
    resource: "Audit log storage",
    previousValue: "90 days",
    newValue: "365 days",
    environment: "Production",
    status: "Applied",
    risk: "Medium",
    organization: "ModelNow Workspace",
    details: "The illustrative retention setting was increased. Production retention should be checked against legal requirements, storage limits, and deletion policies.",
  },
  {
    id: "CFG-8007",
    time: "2026-11-03 17:51:44",
    setting: "Experimental feature flag",
    category: "Feature Flags",
    actor: "release-manager",
    resource: "Computer Use",
    previousValue: "Disabled",
    newValue: "Enabled",
    environment: "Staging",
    status: "Rejected",
    risk: "High",
    organization: "Acme AI",
    details: "The sample feature flag change was rejected because its review requirements were not met.",
  },
  {
    id: "CFG-8008",
    time: "2026-11-03 16:43:20",
    setting: "Request retry policy",
    category: "Reliability",
    actor: "platform-admin",
    resource: "AI Gateway",
    previousValue: "2 retries",
    newValue: "3 retries",
    environment: "Production",
    status: "Rolled Back",
    risk: "Medium",
    organization: "Bright AI",
    details: "The example retry policy change was rolled back after a simulated reliability review.",
  },
  {
    id: "CFG-8009",
    time: "2026-11-03 15:12:07",
    setting: "Organization usage limit",
    category: "Organization Settings",
    actor: "organization-admin",
    resource: "Workspace limits",
    previousValue: "100,000 requests/day",
    newValue: "150,000 requests/day",
    environment: "Production",
    status: "Applied",
    risk: "Low",
    organization: "Vertex Systems",
    details: "A sample organization request limit was updated in the configuration audit history.",
  },
];

const categories = [
  "All",
  "Model Routing",
  "Provider Settings",
  "Security",
  "Model Settings",
  "Compliance",
  "Feature Flags",
  "Reliability",
  "Organization Settings",
];

const statuses = ["All", "Applied", "Pending Approval", "Rejected", "Rolled Back"];
const risks = ["All", "High", "Medium", "Low"];

export default function ConfigurationChangesPage() {
  const [events, setEvents] = useState(initialEvents);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [risk, setRisk] = useState("All");
  const [selected, setSelected] = useState<ConfigEvent | null>(null);
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return events.filter((event) => {
      const searchable = [
        event.id,
        event.setting,
        event.category,
        event.actor,
        event.resource,
        event.environment,
        event.status,
        event.risk,
        event.organization,
        event.previousValue,
        event.newValue,
      ];

      return (
        (!query || searchable.some((value) => value.toLowerCase().includes(query))) &&
        (category === "All" || event.category === category) &&
        (status === "All" || event.status === status) &&
        (risk === "All" || event.risk === risk)
      );
    });
  }, [events, search, category, status, risk]);

  const appliedCount = events.filter((event) => event.status === "Applied").length;
  const pendingCount = events.filter((event) => event.status === "Pending Approval").length;
  const highRiskCount = events.filter((event) => event.risk === "High").length;
  const rollbackCount = events.filter((event) => event.status === "Rolled Back").length;

  function exportEvents(format: "csv" | "json") {
    const content =
      format === "json"
        ? JSON.stringify(filtered, null, 2)
        : [
            [
              "ID",
              "Timestamp",
              "Setting",
              "Category",
              "Actor",
              "Resource",
              "Previous Value",
              "New Value",
              "Environment",
              "Status",
              "Risk",
              "Organization",
              "Details",
            ].join(","),
            ...filtered.map((event) =>
              [
                event.id,
                event.time,
                event.setting,
                event.category,
                event.actor,
                event.resource,
                event.previousValue,
                event.newValue,
                event.environment,
                event.status,
                event.risk,
                event.organization,
                event.details,
              ]
                .map((value) => `"${String(value).replace(/"/g, '""')}"`)
                .join(",")
            ),
          ].join("\n");

    const blob = new Blob([content], {
      type: format === "json" ? "application/json" : "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `modelnow-configuration-changes.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice(`${filtered.length} configuration records exported as ${format.toUpperCase()}.`);
  }

  function refresh() {
    setEvents([...initialEvents]);
    setSearch("");
    setCategory("All");
    setStatus("All");
    setRisk("All");
    setNotice("Configuration history refreshed using demo data.");
  }

  return (
    <main className="page">
      <div className="breadcrumbs">
        <Link href="/dashboard">Admin</Link>
        <span>/</span>
        <Link href="/audit-logs">Audit Logs</Link>
        <span>/</span>
        <strong>Configuration Changes</strong>
      </div>

      <header className="header">
        <div className="heading">
          <div className="headingIcon"><Settings2 size={23} /></div>
          <div>
            <h1>Configuration Changes</h1>
            <p>
              Track changes to model settings, routing rules, providers,
              organization controls, security policies, and feature flags.
            </p>
          </div>
        </div>

        <div className="headerActions">
          <button className="button secondary" onClick={refresh}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="button primary" onClick={() => exportEvents("csv")}>
            <Download size={15} /> Export CSV
          </button>
        </div>
      </header>

      <div className="noticeBanner">
        <GitCompare size={19} />
        <div>
          <strong>Configuration change history</strong>
          <p>
            Review who changed a setting, its previous and new values, the
            environment, and the approval outcome. The records below are
            demonstration data and are not connected to live configuration systems.
          </p>
        </div>
      </div>

      {notice && (
        <div className="toast">
          <CheckCircle2 size={16} />
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss notification">
            <X size={15} />
          </button>
        </div>
      )}

      <section className="metrics">
        <article className="metric">
          <div className="metricTop">
            <span>Total changes</span>
            <Activity size={18} />
          </div>
          <strong>{events.length}</strong>
          <small>Records in the demo dataset</small>
        </article>

        <article className="metric">
          <div className="metricTop">
            <span>Applied changes</span>
            <CheckCircle2 size={18} className="green" />
          </div>
          <strong>{appliedCount}</strong>
          <small>Marked as applied</small>
        </article>

        <article className="metric">
          <div className="metricTop">
            <span>Pending approval</span>
            <Clock3 size={18} className="purple" />
          </div>
          <strong>{pendingCount}</strong>
          <small>Awaiting review</small>
        </article>

        <article className="metric">
          <div className="metricTop">
            <span>High-risk changes</span>
            <ShieldAlert size={18} className="red" />
          </div>
          <strong>{highRiskCount}</strong>
          <small>{rollbackCount} rolled-back changes</small>
        </article>
      </section>

      <section className="panel">
        <div className="panelHeader">
          <div>
            <h2>Configuration audit history</h2>
            <p>Compare setting changes and inspect the associated audit record.</p>
          </div>
          <div className="exportGroup">
            <button className="button secondary" onClick={() => exportEvents("json")}>
              <FileJson size={15} /> JSON
            </button>
            <button className="button secondary" onClick={() => exportEvents("csv")}>
              <FileSpreadsheet size={15} /> CSV
            </button>
          </div>
        </div>

        <div className="filters">
          <label className="searchBox">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search setting, actor, resource, organization..."
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </label>

          <label className="selectBox">
            <Filter size={15} />
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((option) => (
                <option key={option} value={option}>
                  {option === "All" ? "All categories" : option}
                </option>
              ))}
            </select>
            <ChevronDown size={14} />
          </label>

          <label className="selectBox">
            <Activity size={15} />
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              {statuses.map((option) => (
                <option key={option} value={option}>
                  {option === "All" ? "All statuses" : option}
                </option>
              ))}
            </select>
            <ChevronDown size={14} />
          </label>

          <label className="selectBox">
            <ShieldAlert size={15} />
            <select value={risk} onChange={(event) => setRisk(event.target.value)}>
              {risks.map((option) => (
                <option key={option} value={option}>
                  {option === "All" ? "All risk levels" : option}
                </option>
              ))}
            </select>
            <ChevronDown size={14} />
          </label>
        </div>

        <div className="tableMeta">
          <span>Showing <strong>{filtered.length}</strong> of {events.length} changes</span>
          <span><Settings2 size={14} /> Configuration audit records</span>
        </div>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Setting / ID</th>
                <th>Category</th>
                <th>Actor</th>
                <th>Resource</th>
                <th>Previous value</th>
                <th>New value</th>
                <th>Environment</th>
                <th>Risk</th>
                <th>Status</th>
                <th>Timestamp</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((event) => (
                <tr key={event.id}>
                  <td>
                    <strong>{event.setting}</strong>
                    <small>{event.id}</small>
                  </td>
                  <td><span className="category">{event.category}</span></td>
                  <td><strong>{event.actor}</strong></td>
                  <td>{event.resource}</td>
                  <td><span className="oldValue">{event.previousValue}</span></td>
                  <td><span className="newValue">{event.newValue}</span></td>
                  <td><span className="environment">{event.environment}</span></td>
                  <td>
                    <span className={`risk ${event.risk.toLowerCase()}`}>
                      <span className="dot" /> {event.risk}
                    </span>
                  </td>
                  <td>
                    <span className={`status ${event.status.toLowerCase().replaceAll(" ", "-")}`}>
                      <span className="dot" /> {event.status}
                    </span>
                  </td>
                  <td className="time">{event.time}</td>
                  <td>
                    <button
                      className="iconButton"
                      title="View change details"
                      aria-label={`View ${event.id}`}
                      onClick={() => setSelected(event)}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11}>
                    <div className="empty">
                      <Search size={25} />
                      <strong>No configuration changes found</strong>
                      <span>Try changing your search or filters.</span>
                      <button
                        className="button secondary"
                        onClick={() => {
                          setSearch("");
                          setCategory("All");
                          setStatus("All");
                          setRisk("All");
                        }}
                      >
                        Clear filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <div className="backdrop" onClick={() => setSelected(null)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detailTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="modalHeader">
              <div>
                <span className="eyebrow">CONFIGURATION AUDIT RECORD</span>
                <h2 id="detailTitle">{selected.setting}</h2>
                <p>{selected.id}</p>
              </div>
              <button
                className="iconButton"
                onClick={() => setSelected(null)}
                aria-label="Close details"
              >
                <X size={19} />
              </button>
            </header>

            <div className="modalBody">
              <div className="badges">
                <span className={`risk ${selected.risk.toLowerCase()}`}>
                  <span className="dot" /> {selected.risk} risk
                </span>
                <span className={`status ${selected.status.toLowerCase().replaceAll(" ", "-")}`}>
                  <span className="dot" /> {selected.status}
                </span>
              </div>

              <p className="description">{selected.details}</p>

              <div className="compare">
                <div className="compareCard old">
                  <span>PREVIOUS VALUE</span>
                  <strong>{selected.previousValue}</strong>
                </div>
                <div className="compareArrow"><GitCompare size={19} /></div>
                <div className="compareCard new">
                  <span>NEW VALUE</span>
                  <strong>{selected.newValue}</strong>
                </div>
              </div>

              <div className="detailsGrid">
                <Detail label="Event ID" value={selected.id} />
                <Detail label="Timestamp" value={selected.time} />
                <Detail label="Category" value={selected.category} />
                <Detail label="Actor" value={selected.actor} />
                <Detail label="Resource" value={selected.resource} />
                <Detail label="Environment" value={selected.environment} />
                <Detail label="Organization" value={selected.organization} />
                <Detail label="Status" value={selected.status} />
              </div>

              <div className="reviewHint">
                <ShieldAlert size={17} />
                <p>
                  <strong>Change review guidance</strong>
                  <span>
                    Confirm authorization, approval evidence, configuration version,
                    and deployment outcome before treating this change as verified.
                    This page does not execute configuration changes or rollbacks.
                  </span>
                </p>
              </div>
            </div>

            <footer className="modalFooter">
              <button className="button secondary" onClick={() => setSelected(null)}>
                Close
              </button>
              <button
                className="button primary"
                onClick={() => {
                  const blob = new Blob(
                    [JSON.stringify(selected, null, 2)],
                    { type: "application/json" }
                  );
                  const url = URL.createObjectURL(blob);
                  const anchor = document.createElement("a");
                  anchor.href = url;
                  anchor.download = `${selected.id}.json`;
                  anchor.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download size={15} /> Export record
              </button>
            </footer>
          </section>
        </div>
      )}

      <div className="bottomLink">
        <Link href="/audit-logs"><ArrowLeft size={15} /> Back to Audit Logs</Link>
      </div>

      <style jsx>{`
        * { box-sizing: border-box; }
        .page { min-height: 100vh; padding: 28px; background: #f7f8fc; color: #172033; font-family: Arial, Helvetica, sans-serif; }
        .breadcrumbs { display: flex; align-items: center; gap: 9px; color: #8b94a7; font-size: 12px; margin-bottom: 23px; }
        .breadcrumbs a, .bottomLink a { color: #65718a; text-decoration: none; }
        .breadcrumbs a:hover, .bottomLink a:hover { color: #315bea; }
        .breadcrumbs strong { color: #202b40; font-weight: 600; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 22px; }
        .heading { display: flex; gap: 14px; align-items: flex-start; }
        .headingIcon { width: 46px; height: 46px; border-radius: 13px; display: grid; place-items: center; background: #e9efff; color: #315bea; flex-shrink: 0; }
        h1 { font-size: 27px; letter-spacing: -.7px; margin: 0 0 8px; font-weight: 750; }
        .heading p, .panelHeader p { margin: 0; color: #778198; font-size: 13px; line-height: 1.6; max-width: 720px; }
        .headerActions, .exportGroup { display: flex; gap: 9px; flex-wrap: wrap; }
        .button { border: 1px solid #dfe4ed; border-radius: 9px; padding: 10px 13px; display: inline-flex; gap: 8px; align-items: center; justify-content: center; font-size: 12px; font-weight: 650; cursor: pointer; white-space: nowrap; transition: .15s; }
        .secondary { background: #fff; color: #39455c; }
        .secondary:hover { background: #f3f5fa; border-color: #cbd4e3; }
        .primary { background: #315bea; border-color: #315bea; color: white; }
        .primary:hover { background: #2349cf; }
        .noticeBanner { display: flex; gap: 12px; align-items: flex-start; padding: 15px; margin-bottom: 20px; border: 1px solid #cbd8ff; background: #f1f5ff; color: #3452a1; border-radius: 11px; }
        .noticeBanner > svg { flex-shrink: 0; margin-top: 1px; }
        .noticeBanner strong { font-size: 12px; }
        .noticeBanner p { margin: 5px 0 0; font-size: 12px; line-height: 1.65; color: #566ca7; }
        .toast { display: flex; align-items: center; gap: 9px; padding: 11px 13px; border: 1px solid #bfe8d3; background: #edfbf3; color: #17683c; border-radius: 9px; font-size: 12px; margin-bottom: 16px; }
        .toast span { flex: 1; }
        .toast button { display: flex; border: 0; background: none; color: inherit; cursor: pointer; }
        .metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 15px; margin-bottom: 22px; }
        .metric { background: #fff; border: 1px solid #e7eaf1; border-radius: 13px; padding: 18px; box-shadow: 0 2px 7px #1b2b4a05; min-width: 0; }
        .metricTop { display: flex; justify-content: space-between; align-items: center; color: #758096; font-size: 12px; margin-bottom: 17px; }
        .metricTop svg { color: #8794ad; }
        .metric strong { display: block; font-size: 26px; letter-spacing: -.5px; margin-bottom: 7px; }
        .metric small { color: #929bad; font-size: 11px; line-height: 1.5; }
        .green { color: #16804c !important; }
        .red { color: #dc4545 !important; }
        .purple { color: #805ad5 !important; }
        .panel { background: white; border: 1px solid #e6eaf1; border-radius: 13px; overflow: hidden; box-shadow: 0 2px 7px #1b2b4a05; }
        .panelHeader { display: flex; justify-content: space-between; align-items: center; gap: 18px; padding: 20px 22px; border-bottom: 1px solid #edf0f5; }
        .panelHeader h2 { font-size: 15px; margin: 0 0 6px; font-weight: 750; }
        .panelHeader p { font-size: 12px; }
        .filters { display: flex; gap: 10px; padding: 16px 22px; border-bottom: 1px solid #edf0f5; }
        .searchBox, .selectBox { height: 39px; display: flex; align-items: center; gap: 9px; border: 1px solid #e0e5ee; border-radius: 8px; padding: 0 11px; color: #8791a5; background: white; }
        .searchBox { flex: 1; min-width: 170px; }
        .searchBox input { flex: 1; min-width: 0; border: 0; outline: none; color: #263148; font-size: 12px; background: transparent; }
        .searchBox input::placeholder { color: #a1a9b8; }
        .searchBox button { display: flex; border: 0; background: none; color: #8993a7; cursor: pointer; }
        .selectBox { min-width: 145px; }
        .selectBox select { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; color: #45516a; appearance: none; font-size: 11px; cursor: pointer; }
        .tableMeta { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 13px 22px; font-size: 11px; color: #8490a5; }
        .tableMeta strong { color: #344159; }
        .tableMeta span:last-child { display: flex; align-items: center; gap: 6px; }
        .tableWrap { width: 100%; overflow-x: auto; }
        table { width: 100%; min-width: 1450px; border-collapse: collapse; text-align: left; }
        th { padding: 12px 14px; background: #fafbfe; border-top: 1px solid #edf0f5; border-bottom: 1px solid #edf0f5; color: #8791a5; font-size: 10px; text-transform: uppercase; letter-spacing: .5px; font-weight: 700; white-space: nowrap; }
        td { padding: 14px; border-bottom: 1px solid #f0f2f6; color: #566178; font-size: 11px; white-space: nowrap; }
        tbody tr:last-child td { border-bottom: 0; }
        tbody tr:hover { background: #fafbff; }
        td strong { display: block; color: #2d384e; font-size: 11px; font-weight: 650; }
        td small { display: block; color: #99a1b0; font-size: 10px; margin-top: 5px; }
        .category { display: inline-flex; padding: 5px 8px; border-radius: 6px; background: #f0f3fa; color: #53627d; font-size: 10px; }
        .oldValue, .newValue { display: inline-block; max-width: 190px; overflow: hidden; text-overflow: ellipsis; vertical-align: middle; border-radius: 6px; padding: 6px 8px; font-family: monospace; font-size: 10px; }
        .oldValue { background: #fff0ef; color: #a74343; }
        .newValue { background: #eaf8f0; color: #167548; }
        .environment { padding: 5px 8px; background: #f0f3fa; border-radius: 6px; color: #53627d; font-size: 10px; }
        .risk, .status { display: inline-flex; align-items: center; gap: 6px; padding: 5px 8px; border-radius: 20px; font-size: 10px; font-weight: 650; white-space: nowrap; }
        .dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
        .high { color: #c2410c; background: #fff0e7; }
        .medium { color: #9b6b10; background: #fff7e5; }
        .low { color: #53627d; background: #eef1f6; }
        .applied { color: #16804c; background: #eaf8f0; }
        .pending-approval { color: #9b6b10; background: #fff7e5; }
        .rejected { color: #b42318; background: #feeceb; }
        .rolled-back { color: #6045b5; background: #f0ebff; }
        .time { color: #758096; font-size: 10px; }
        .iconButton { width: 31px; height: 31px; display: inline-grid; place-items: center; border: 1px solid #e5e9f0; border-radius: 8px; background: white; color: #65718a; cursor: pointer; }
        .iconButton:hover { color: #315bea; border-color: #b8c8ff; background: #f4f6ff; }
        .empty { min-height: 220px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: #8994a8; }
        .empty strong { color: #39465e; font-size: 14px; }
        .empty span { font-size: 12px; }
        .backdrop { position: fixed; inset: 0; z-index: 100; background: #10182880; display: flex; justify-content: center; align-items: center; padding: 20px; }
        .modal { width: 100%; max-width: 680px; max-height: 90vh; overflow-y: auto; background: white; border-radius: 15px; box-shadow: 0 20px 70px #0003; }
        .modalHeader { display: flex; justify-content: space-between; align-items: flex-start; padding: 22px; border-bottom: 1px solid #edf0f5; }
        .eyebrow { color: #315bea; font-size: 10px; letter-spacing: 1px; font-weight: 750; }
        .modalHeader h2 { margin: 9px 0 5px; color: #202b40; font-size: 19px; }
        .modalHeader p { margin: 0; color: #8993a7; font-size: 12px; }
        .modalBody { padding: 22px; }
        .badges { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 17px; }
        .description { color: #667189; font-size: 12px; line-height: 1.65; margin: 0 0 20px; }
        .compare { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 12px; margin-bottom: 23px; }
        .compareCard { min-width: 0; padding: 13px; border-radius: 9px; }
        .compareCard span { display: block; font-size: 9px; font-weight: 750; letter-spacing: .6px; margin-bottom: 8px; }
        .compareCard strong { display: block; font-size: 12px; overflow-wrap: anywhere; }
        .compareCard.old { color: #a74343; background: #fff0ef; }
        .compareCard.new { color: #167548; background: #eaf8f0; }
        .compareArrow { color: #7b87a0; }
        .detailsGrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px 22px; }
        .detailLabel { color: #8b95a8; font-size: 10px; margin-bottom: 6px; }
        .detailValue { color: #2f3b52; font-size: 12px; font-weight: 600; overflow-wrap: anywhere; }
        .reviewHint { display: flex; align-items: flex-start; gap: 10px; margin-top: 22px; padding: 13px; border: 1px solid #f1d6a4; background: #fff9ec; color: #855d18; border-radius: 9px; }
        .reviewHint > svg { flex-shrink: 0; margin-top: 1px; }
        .reviewHint p { margin: 0; display: grid; gap: 5px; }
        .reviewHint strong { font-size: 11px; }
        .reviewHint span { font-size: 11px; line-height: 1.6; }
        .modalFooter { display: flex; justify-content: flex-end; gap: 9px; padding: 16px 22px; border-top: 1px solid #edf0f5; }
        .bottomLink { padding-top: 18px; font-size: 12px; }
        .bottomLink a { display: inline-flex; gap: 7px; align-items: center; }
        @media (max-width: 1100px) { .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); } .header { flex-direction: column; } .filters { flex-wrap: wrap; } .searchBox { flex-basis: 100%; } }
        @media (max-width: 700px) { .page { padding: 17px; } .filters { flex-direction: column; } .selectBox { width: 100%; } .panelHeader { align-items: flex-start; flex-direction: column; } .tableMeta { align-items: flex-start; flex-direction: column; } .detailsGrid { grid-template-columns: 1fr; } .headerActions { width: 100%; } .headerActions .button { flex: 1; } .compare { grid-template-columns: 1fr; } .compareArrow { transform: rotate(90deg); justify-self: center; } }
        @media (max-width: 420px) { .metrics { grid-template-columns: 1fr; } h1 { font-size: 23px; } }
      `}</style>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="detailLabel">{label}</div>
      <div className="detailValue">{value}</div>
    </div>
  );
}
