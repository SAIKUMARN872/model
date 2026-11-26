
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Download,
  Eye,
  FileJson,
  FileSpreadsheet,
  Filter,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

type GovernanceEvent = {
  id: string;
  time: string;
  event: string;
  category: string;
  actor: string;
  resource: string;
  policy: string;
  risk: "Critical" | "High" | "Medium" | "Low";
  status: "Passed" | "Failed" | "Pending Review" | "Approved" | "Rejected";
  organization: string;
  details: string;
};

const initialEvents: GovernanceEvent[] = [
  {
    id: "GOV-7001",
    time: "2026-11-04 10:45:22",
    event: "AI usage policy evaluation",
    category: "Policy Evaluation",
    actor: "AI Gateway",
    resource: "Chat Completion",
    policy: "Enterprise AI Usage Policy",
    risk: "Low",
    status: "Passed",
    organization: "ModelNow Workspace",
    details: "The sample request passed the configured example AI usage policy checks.",
  },
  {
    id: "GOV-7002",
    time: "2026-11-04 10:32:08",
    event: "Sensitive data handling review",
    category: "Data Governance",
    actor: "Governance Engine",
    resource: "Knowledge Hub",
    policy: "Sensitive Data Protection",
    risk: "High",
    status: "Pending Review",
    organization: "Acme AI",
    details: "A sample data-handling event requires a reviewer to confirm the applicable data classification and handling controls.",
  },
  {
    id: "GOV-7003",
    time: "2026-11-04 10:21:41",
    event: "Model approval request",
    category: "Model Approval",
    actor: "ml-platform-admin",
    resource: "ModelNow Quality 12B",
    policy: "Production Model Approval",
    risk: "Medium",
    status: "Approved",
    organization: "ModelNow Workspace",
    details: "An example model approval decision was recorded. Real deployments should link this event to evaluation results and the approving identity.",
  },
  {
    id: "GOV-7004",
    time: "2026-11-04 10:04:13",
    event: "High-risk response detected",
    category: "Risk Assessment",
    actor: "Safety Evaluator",
    resource: "AI Response",
    policy: "Responsible AI Controls",
    risk: "Critical",
    status: "Failed",
    organization: "Northstar Labs",
    details: "The example evaluation marked a response as high risk. The actual response and evaluation evidence should be reviewed in the connected system.",
  },
  {
    id: "GOV-7005",
    time: "2026-11-04 09:51:37",
    event: "Retention policy validation",
    category: "Compliance",
    actor: "Compliance Service",
    resource: "Audit Records",
    policy: "Audit Retention Standard",
    risk: "Low",
    status: "Passed",
    organization: "ModelNow Workspace",
    details: "The sample retention configuration passed its illustrative validation check.",
  },
  {
    id: "GOV-7006",
    time: "2026-11-04 09:26:55",
    event: "Policy exception submitted",
    category: "Policy Exception",
    actor: "organization-admin",
    resource: "Provider Routing",
    policy: "Approved Provider Allowlist",
    risk: "High",
    status: "Pending Review",
    organization: "Bright AI",
    details: "An example exception request is awaiting review by an authorized governance reviewer.",
  },
  {
    id: "GOV-7007",
    time: "2026-11-03 17:42:19",
    event: "Model deployment rejected",
    category: "Model Approval",
    actor: "Governance Reviewer",
    resource: "ModelNow Experimental 4B",
    policy: "Production Model Approval",
    risk: "High",
    status: "Rejected",
    organization: "Acme AI",
    details: "The sample deployment decision was rejected pending additional evaluation evidence.",
  },
  {
    id: "GOV-7008",
    time: "2026-11-03 16:18:02",
    event: "Responsible AI evaluation completed",
    category: "Risk Assessment",
    actor: "Evaluation Service",
    resource: "Model Evaluation Suite",
    policy: "Responsible AI Controls",
    risk: "Medium",
    status: "Passed",
    organization: "ModelNow Workspace",
    details: "A demonstration evaluation completed and recorded its governance outcome.",
  },
  {
    id: "GOV-7009",
    time: "2026-11-03 14:08:46",
    event: "Compliance evidence updated",
    category: "Compliance",
    actor: "compliance-admin",
    resource: "Compliance Register",
    policy: "Evidence Management Standard",
    risk: "Low",
    status: "Approved",
    organization: "Vertex Systems",
    details: "A sample compliance evidence update was approved for the demonstration register.",
  },
];

const categories = [
  "All",
  "Policy Evaluation",
  "Data Governance",
  "Model Approval",
  "Risk Assessment",
  "Compliance",
  "Policy Exception",
];

const statuses = [
  "All",
  "Passed",
  "Failed",
  "Pending Review",
  "Approved",
  "Rejected",
];

const risks = ["All", "Critical", "High", "Medium", "Low"];

export default function GovernanceEventsPage() {
  const [events, setEvents] = useState(initialEvents);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [risk, setRisk] = useState("All");
  const [selected, setSelected] = useState<GovernanceEvent | null>(null);
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return events.filter((event) => {
      const searchable = [
        event.id,
        event.event,
        event.category,
        event.actor,
        event.resource,
        event.policy,
        event.organization,
        event.status,
        event.risk,
      ];

      return (
        (!query || searchable.some((value) => value.toLowerCase().includes(query))) &&
        (category === "All" || event.category === category) &&
        (status === "All" || event.status === status) &&
        (risk === "All" || event.risk === risk)
      );
    });
  }, [events, search, category, status, risk]);

  const failedCount = events.filter((event) => event.status === "Failed").length;
  const pendingCount = events.filter((event) => event.status === "Pending Review").length;
  const highRiskCount = events.filter((event) =>
    ["Critical", "High"].includes(event.risk)
  ).length;
  const passedCount = events.filter((event) => event.status === "Passed").length;

  function exportEvents(format: "csv" | "json") {
    const content =
      format === "json"
        ? JSON.stringify(filtered, null, 2)
        : [
            [
              "ID",
              "Timestamp",
              "Event",
              "Category",
              "Actor",
              "Resource",
              "Policy",
              "Risk",
              "Status",
              "Organization",
              "Details",
            ].join(","),
            ...filtered.map((event) =>
              [
                event.id,
                event.time,
                event.event,
                event.category,
                event.actor,
                event.resource,
                event.policy,
                event.risk,
                event.status,
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
    anchor.download = `modelnow-governance-events.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice(`${filtered.length} governance events exported as ${format.toUpperCase()}.`);
  }

  function refresh() {
    setEvents([...initialEvents]);
    setSearch("");
    setCategory("All");
    setStatus("All");
    setRisk("All");
    setNotice("Governance events refreshed using demo data.");
  }

  return (
    <main className="page">
      <div className="breadcrumbs">
        <Link href="/dashboard">Admin</Link>
        <span>/</span>
        <Link href="/audit-logs">Audit Logs</Link>
        <span>/</span>
        <strong>Governance Events</strong>
      </div>

      <header className="header">
        <div className="heading">
          <div className="headingIcon"><ShieldCheck size={23} /></div>
          <div>
            <h1>Governance Events</h1>
            <p>
              Track AI policies, compliance evaluations, model approvals,
              risk decisions, and governance exceptions across organizations.
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
        <ClipboardCheck size={19} />
        <div>
          <strong>Governance audit trail</strong>
          <p>
            Use this page to review policy outcomes and approval decisions.
            The displayed records are illustrative frontend data and do not
            represent actual compliance certification or production policy enforcement.
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
            <span>Total governance events</span>
            <Activity size={18} />
          </div>
          <strong>{events.length}</strong>
          <small>Records in the demo dataset</small>
        </article>

        <article className="metric">
          <div className="metricTop">
            <span>Passed evaluations</span>
            <CheckCircle2 size={18} className="green" />
          </div>
          <strong>{passedCount}</strong>
          <small>Events with passed status</small>
        </article>

        <article className="metric">
          <div className="metricTop">
            <span>High-risk events</span>
            <AlertTriangle size={18} className="red" />
          </div>
          <strong>{highRiskCount}</strong>
          <small>{failedCount} failed governance outcomes</small>
        </article>

        <article className="metric">
          <div className="metricTop">
            <span>Pending reviews</span>
            <ClipboardCheck size={18} className="purple" />
          </div>
          <strong>{pendingCount}</strong>
          <small>Awaiting governance review</small>
        </article>
      </section>

      <section className="panel">
        <div className="panelHeader">
          <div>
            <h2>Governance audit history</h2>
            <p>Search and inspect governance decisions and their associated policies.</p>
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
              placeholder="Search event, policy, actor, organization..."
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
            <AlertTriangle size={15} />
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
          <span>Showing <strong>{filtered.length}</strong> of {events.length} events</span>
          <span><ShieldCheck size={14} /> Governance audit records</span>
        </div>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Event / ID</th>
                <th>Category</th>
                <th>Actor</th>
                <th>Resource</th>
                <th>Policy</th>
                <th>Risk</th>
                <th>Outcome</th>
                <th>Organization</th>
                <th>Timestamp</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((event) => (
                <tr key={event.id}>
                  <td>
                    <strong>{event.event}</strong>
                    <small>{event.id}</small>
                  </td>
                  <td><span className="category">{event.category}</span></td>
                  <td><strong>{event.actor}</strong></td>
                  <td>{event.resource}</td>
                  <td>{event.policy}</td>
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
                  <td>{event.organization}</td>
                  <td className="time">{event.time}</td>
                  <td>
                    <button
                      className="iconButton"
                      title="View details"
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
                  <td colSpan={10}>
                    <div className="empty">
                      <Search size={25} />
                      <strong>No governance events found</strong>
                      <span>Try changing the search or filters.</span>
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
                <span className="eyebrow">GOVERNANCE AUDIT RECORD</span>
                <h2 id="detailTitle">{selected.event}</h2>
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

              <div className="description">{selected.details}</div>

              <div className="detailsGrid">
                <Detail label="Event ID" value={selected.id} />
                <Detail label="Timestamp" value={selected.time} />
                <Detail label="Category" value={selected.category} />
                <Detail label="Actor" value={selected.actor} />
                <Detail label="Resource" value={selected.resource} />
                <Detail label="Policy" value={selected.policy} />
                <Detail label="Organization" value={selected.organization} />
                <Detail label="Outcome" value={selected.status} />
              </div>

              <div className="reviewHint">
                <ClipboardCheck size={17} />
                <p>
                  <strong>Governance review guidance</strong>
                  <span>
                    Verify the policy version, decision evidence, reviewer identity,
                    and approval history in the connected governance system.
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
        table { width: 100%; min-width: 1300px; border-collapse: collapse; text-align: left; }
        th { padding: 12px 14px; background: #fafbfe; border-top: 1px solid #edf0f5; border-bottom: 1px solid #edf0f5; color: #8791a5; font-size: 10px; text-transform: uppercase; letter-spacing: .5px; font-weight: 700; white-space: nowrap; }
        td { padding: 14px; border-bottom: 1px solid #f0f2f6; color: #566178; font-size: 11px; white-space: nowrap; }
        tbody tr:last-child td { border-bottom: 0; }
        tbody tr:hover { background: #fafbff; }
        td strong { display: block; color: #2d384e; font-size: 11px; font-weight: 650; }
        td small { display: block; color: #99a1b0; font-size: 10px; margin-top: 5px; }
        .category { display: inline-flex; padding: 5px 8px; border-radius: 6px; background: #f0f3fa; color: #53627d; font-size: 10px; }
        .risk, .status { display: inline-flex; align-items: center; gap: 6px; padding: 5px 8px; border-radius: 20px; font-size: 10px; font-weight: 650; white-space: nowrap; }
        .dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
        .critical { color: #b42318; background: #feeceb; }
        .high { color: #c2410c; background: #fff0e7; }
        .medium { color: #9b6b10; background: #fff7e5; }
        .low { color: #53627d; background: #eef1f6; }
        .passed, .approved { color: #16804c; background: #eaf8f0; }
        .failed, .rejected { color: #b42318; background: #feeceb; }
        .pending-review { color: #9b6b10; background: #fff7e5; }
        .time { color: #758096; font-size: 10px; }
        .iconButton { width: 31px; height: 31px; display: inline-grid; place-items: center; border: 1px solid #e5e9f0; border-radius: 8px; background: white; color: #65718a; cursor: pointer; }
        .iconButton:hover { color: #315bea; border-color: #b8c8ff; background: #f4f6ff; }
        .empty { min-height: 220px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: #8994a8; }
        .empty strong { color: #39465e; font-size: 14px; }
        .empty span { font-size: 12px; }
        .backdrop { position: fixed; inset: 0; z-index: 100; background: #10182880; display: flex; justify-content: center; align-items: center; padding: 20px; }
        .modal { width: 100%; max-width: 650px; max-height: 90vh; overflow-y: auto; background: white; border-radius: 15px; box-shadow: 0 20px 70px #0003; }
        .modalHeader { display: flex; justify-content: space-between; align-items: flex-start; padding: 22px; border-bottom: 1px solid #edf0f5; }
        .eyebrow { color: #315bea; font-size: 10px; letter-spacing: 1px; font-weight: 750; }
        .modalHeader h2 { margin: 9px 0 5px; color: #202b40; font-size: 19px; }
        .modalHeader p { margin: 0; color: #8993a7; font-size: 12px; }
        .modalBody { padding: 22px; }
        .badges { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 17px; }
        .description { padding: 12px 14px; border-radius: 9px; background: #f7f8fc; color: #667189; font-size: 12px; line-height: 1.65; margin-bottom: 20px; }
        .detailsGrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px 22px; }
        .detailLabel { color: #8b95a8; font-size: 10px; margin-bottom: 6px; }
        .detailValue { color: #2f3b52; font-size: 12px; font-weight: 600; overflow-wrap: anywhere; }
        .reviewHint { display: flex; align-items: flex-start; gap: 10px; margin-top: 22px; padding: 13px; border: 1px solid #cbd8ff; background: #f1f5ff; color: #3452a1; border-radius: 9px; }
        .reviewHint > svg { flex-shrink: 0; margin-top: 1px; }
        .reviewHint p { margin: 0; display: grid; gap: 5px; }
        .reviewHint strong { font-size: 11px; }
        .reviewHint span { font-size: 11px; line-height: 1.6; }
        .modalFooter { display: flex; justify-content: flex-end; gap: 9px; padding: 16px 22px; border-top: 1px solid #edf0f5; }
        .bottomLink { padding-top: 18px; font-size: 12px; }
        .bottomLink a { display: inline-flex; gap: 7px; align-items: center; }
        @media (max-width: 1100px) { .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); } .header { flex-direction: column; } .filters { flex-wrap: wrap; } .searchBox { flex-basis: 100%; } }
        @media (max-width: 700px) { .page { padding: 17px; } .filters { flex-direction: column; } .selectBox { width: 100%; } .panelHeader { align-items: flex-start; flex-direction: column; } .tableMeta { align-items: flex-start; flex-direction: column; } .detailsGrid { grid-template-columns: 1fr; } .headerActions { width: 100%; } .headerActions .button { flex: 1; } }
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
