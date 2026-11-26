
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  Download,
  Eye,
  FileJson,
  FileSpreadsheet,
  Filter,
  LockKeyhole,
  RefreshCw,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";

type DataAccessEvent = {
  id: string;
  time: string;
  actor: string;
  actorType: string;
  action: string;
  resource: string;
  resourceType: string;
  classification: "Public" | "Internal" | "Confidential" | "Restricted";
  result: "Granted" | "Denied" | "Reviewed";
  source: string;
  organization: string;
  details: string;
};

const initialEvents: DataAccessEvent[] = [
  {
    id: "DATA-9001",
    time: "2026-11-04 10:51:42",
    actor: "analyst@example.com",
    actorType: "User",
    action: "Document viewed",
    resource: "Employee Handbook.pdf",
    resourceType: "Document",
    classification: "Internal",
    result: "Granted",
    source: "Knowledge Hub",
    organization: "ModelNow Workspace",
    details: "A user viewed a sample internal document through the Knowledge Hub.",
  },
  {
    id: "DATA-9002",
    time: "2026-11-04 10:43:18",
    actor: "ai-agent-demo",
    actorType: "AI Agent",
    action: "Knowledge retrieval",
    resource: "Product Documentation",
    resourceType: "Knowledge Base",
    classification: "Confidential",
    result: "Granted",
    source: "RAG Service",
    organization: "Acme AI",
    details: "An illustrative AI retrieval operation accessed a knowledge resource. Production records should include the requesting task, permission decision, and document references.",
  },
  {
    id: "DATA-9003",
    time: "2026-11-04 10:29:03",
    actor: "user-demo-104",
    actorType: "User",
    action: "File download",
    resource: "Quarterly Report.xlsx",
    resourceType: "File",
    classification: "Confidential",
    result: "Denied",
    source: "Library",
    organization: "Northstar Labs",
    details: "The example file download was denied because the simulated user did not have the required resource permission.",
  },
  {
    id: "DATA-9004",
    time: "2026-11-04 10:17:54",
    actor: "compliance-admin",
    actorType: "Administrator",
    action: "Audit record review",
    resource: "Security Audit Dataset",
    resourceType: "Dataset",
    classification: "Restricted",
    result: "Reviewed",
    source: "Audit Logs",
    organization: "ModelNow Workspace",
    details: "An illustrative administrator review of restricted audit data was recorded.",
  },
  {
    id: "DATA-9005",
    time: "2026-11-04 09:58:26",
    actor: "service-account-demo",
    actorType: "Service Account",
    action: "Dataset query",
    resource: "Model Evaluation Dataset",
    resourceType: "Dataset",
    classification: "Internal",
    result: "Granted",
    source: "Evaluation Service",
    organization: "Bright AI",
    details: "A sample service account queried an internal evaluation dataset.",
  },
  {
    id: "DATA-9006",
    time: "2026-11-04 09:41:12",
    actor: "guest-demo",
    actorType: "User",
    action: "Restricted resource access",
    resource: "Finance Knowledge Base",
    resourceType: "Knowledge Base",
    classification: "Restricted",
    result: "Denied",
    source: "Knowledge Hub",
    organization: "Acme AI",
    details: "The sample request was denied for a restricted knowledge base.",
  },
  {
    id: "DATA-9007",
    time: "2026-11-03 18:34:45",
    actor: "admin@modelnow.example",
    actorType: "Administrator",
    action: "Permission inspection",
    resource: "Organization Documents",
    resourceType: "Document",
    classification: "Internal",
    result: "Reviewed",
    source: "Admin Console",
    organization: "ModelNow Workspace",
    details: "An administrator inspected resource permissions in the illustrative audit history.",
  },
  {
    id: "DATA-9008",
    time: "2026-11-03 17:22:09",
    actor: "browser-agent-demo",
    actorType: "AI Agent",
    action: "File metadata read",
    resource: "Customer Support Guide",
    resourceType: "File",
    classification: "Internal",
    result: "Granted",
    source: "Browser Service",
    organization: "Vertex Systems",
    details: "A demonstration browser agent read file metadata after a simulated access check.",
  },
  {
    id: "DATA-9009",
    time: "2026-11-03 16:10:37",
    actor: "user-demo-209",
    actorType: "User",
    action: "Document preview",
    resource: "Architecture Overview",
    resourceType: "Document",
    classification: "Public",
    result: "Granted",
    source: "Library",
    organization: "Northstar Labs",
    details: "A sample public document preview was opened successfully.",
  },
];

const classifications = [
  "All",
  "Public",
  "Internal",
  "Confidential",
  "Restricted",
];

const results = ["All", "Granted", "Denied", "Reviewed"];

const resourceTypes = [
  "All",
  "Document",
  "Knowledge Base",
  "File",
  "Dataset",
];

const actorTypes = [
  "All",
  "User",
  "Administrator",
  "AI Agent",
  "Service Account",
];

export default function DataAccessLogsPage() {
  const [events, setEvents] = useState(initialEvents);
  const [search, setSearch] = useState("");
  const [classification, setClassification] = useState("All");
  const [result, setResult] = useState("All");
  const [resourceType, setResourceType] = useState("All");
  const [actorType, setActorType] = useState("All");
  const [selected, setSelected] = useState<DataAccessEvent | null>(null);
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return events.filter((event) => {
      const searchable = [
        event.id,
        event.actor,
        event.actorType,
        event.action,
        event.resource,
        event.resourceType,
        event.classification,
        event.result,
        event.source,
        event.organization,
      ];

      return (
        (!query || searchable.some((value) => value.toLowerCase().includes(query))) &&
        (classification === "All" || event.classification === classification) &&
        (result === "All" || event.result === result) &&
        (resourceType === "All" || event.resourceType === resourceType) &&
        (actorType === "All" || event.actorType === actorType)
      );
    });
  }, [events, search, classification, result, resourceType, actorType]);

  const grantedCount = events.filter((event) => event.result === "Granted").length;
  const deniedCount = events.filter((event) => event.result === "Denied").length;
  const restrictedCount = events.filter(
    (event) => event.classification === "Restricted"
  ).length;
  const confidentialCount = events.filter((event) =>
    ["Confidential", "Restricted"].includes(event.classification)
  ).length;

  function exportEvents(format: "csv" | "json") {
    const content =
      format === "json"
        ? JSON.stringify(filtered, null, 2)
        : [
            [
              "ID",
              "Timestamp",
              "Actor",
              "Actor Type",
              "Action",
              "Resource",
              "Resource Type",
              "Classification",
              "Result",
              "Source",
              "Organization",
              "Details",
            ].join(","),
            ...filtered.map((event) =>
              [
                event.id,
                event.time,
                event.actor,
                event.actorType,
                event.action,
                event.resource,
                event.resourceType,
                event.classification,
                event.result,
                event.source,
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
    anchor.download = `modelnow-data-access-logs.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice(`${filtered.length} data access records exported as ${format.toUpperCase()}.`);
  }

  function refresh() {
    setEvents([...initialEvents]);
    setSearch("");
    setClassification("All");
    setResult("All");
    setResourceType("All");
    setActorType("All");
    setNotice("Data access logs refreshed using demo data.");
  }

  return (
    <main className="page">
      <div className="breadcrumbs">
        <Link href="/dashboard">Admin</Link>
        <span>/</span>
        <Link href="/audit-logs">Audit Logs</Link>
        <span>/</span>
        <strong>Data Access Logs</strong>
      </div>

      <header className="header">
        <div className="heading">
          <div className="headingIcon"><Database size={23} /></div>
          <div>
            <h1>Data Access Logs</h1>
            <p>
              Audit access to enterprise documents, knowledge bases, files,
              datasets, and sensitive resources across ModelNow.
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
        <LockKeyhole size={19} />
        <div>
          <strong>Data access visibility</strong>
          <p>
            Review access decisions and resource classifications. These records
            are frontend demonstration data; real auditing requires backend
            event capture, resource-level authorization, and organization-scoped access.
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
            <span>Total access events</span>
            <Activity size={18} />
          </div>
          <strong>{events.length}</strong>
          <small>Records in the demo dataset</small>
        </article>

        <article className="metric">
          <div className="metricTop">
            <span>Access granted</span>
            <CheckCircle2 size={18} className="green" />
          </div>
          <strong>{grantedCount}</strong>
          <small>Successful sample access decisions</small>
        </article>

        <article className="metric">
          <div className="metricTop">
            <span>Access denied</span>
            <ShieldAlert size={18} className="red" />
          </div>
          <strong>{deniedCount}</strong>
          <small>Denied sample requests</small>
        </article>

        <article className="metric">
          <div className="metricTop">
            <span>Sensitive resources</span>
            <LockKeyhole size={18} className="purple" />
          </div>
          <strong>{confidentialCount}</strong>
          <small>{restrictedCount} restricted resources</small>
        </article>
      </section>

      <section className="panel">
        <div className="panelHeader">
          <div>
            <h2>Data access history</h2>
            <p>Inspect the actor, action, resource classification, and access result.</p>
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
              placeholder="Search actor, resource, action, organization..."
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </label>

          <label className="selectBox">
            <Filter size={15} />
            <select
              value={classification}
              onChange={(event) => setClassification(event.target.value)}
            >
              {classifications.map((option) => (
                <option key={option} value={option}>
                  {option === "All" ? "All classifications" : option}
                </option>
              ))}
            </select>
            <ChevronDown size={14} />
          </label>

          <label className="selectBox">
            <Activity size={15} />
            <select value={result} onChange={(event) => setResult(event.target.value)}>
              {results.map((option) => (
                <option key={option} value={option}>
                  {option === "All" ? "All results" : option}
                </option>
              ))}
            </select>
            <ChevronDown size={14} />
          </label>

          <label className="selectBox">
            <Database size={15} />
            <select
              value={resourceType}
              onChange={(event) => setResourceType(event.target.value)}
            >
              {resourceTypes.map((option) => (
                <option key={option} value={option}>
                  {option === "All" ? "All resource types" : option}
                </option>
              ))}
            </select>
            <ChevronDown size={14} />
          </label>

          <label className="selectBox">
            <Eye size={15} />
            <select value={actorType} onChange={(event) => setActorType(event.target.value)}>
              {actorTypes.map((option) => (
                <option key={option} value={option}>
                  {option === "All" ? "All actor types" : option}
                </option>
              ))}
            </select>
            <ChevronDown size={14} />
          </label>
        </div>

        <div className="tableMeta">
          <span>Showing <strong>{filtered.length}</strong> of {events.length} events</span>
          <span><Database size={14} /> Data access audit records</span>
        </div>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Event / ID</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Resource type</th>
                <th>Classification</th>
                <th>Result</th>
                <th>Source</th>
                <th>Organization</th>
                <th>Timestamp</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((event) => (
                <tr key={event.id}>
                  <td>
                    <strong>{event.id}</strong>
                    <small>{event.actorType}</small>
                  </td>
                  <td><strong>{event.actor}</strong></td>
                  <td>{event.action}</td>
                  <td><strong>{event.resource}</strong></td>
                  <td><span className="category">{event.resourceType}</span></td>
                  <td>
                    <span className={`classification ${event.classification.toLowerCase()}`}>
                      <span className="dot" /> {event.classification}
                    </span>
                  </td>
                  <td>
                    <span className={`result ${event.result.toLowerCase()}`}>
                      <span className="dot" /> {event.result}
                    </span>
                  </td>
                  <td>{event.source}</td>
                  <td>{event.organization}</td>
                  <td className="time">{event.time}</td>
                  <td>
                    <button
                      className="iconButton"
                      title="View access details"
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
                      <strong>No data access events found</strong>
                      <span>Try changing your search or filters.</span>
                      <button
                        className="button secondary"
                        onClick={() => {
                          setSearch("");
                          setClassification("All");
                          setResult("All");
                          setResourceType("All");
                          setActorType("All");
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
                <span className="eyebrow">DATA ACCESS AUDIT RECORD</span>
                <h2 id="detailTitle">{selected.action}</h2>
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
                <span className={`classification ${selected.classification.toLowerCase()}`}>
                  <span className="dot" /> {selected.classification}
                </span>
                <span className={`result ${selected.result.toLowerCase()}`}>
                  <span className="dot" /> {selected.result}
                </span>
              </div>

              <p className="description">{selected.details}</p>

              <div className="detailsGrid">
                <Detail label="Event ID" value={selected.id} />
                <Detail label="Timestamp" value={selected.time} />
                <Detail label="Actor" value={selected.actor} />
                <Detail label="Actor type" value={selected.actorType} />
                <Detail label="Action" value={selected.action} />
                <Detail label="Resource" value={selected.resource} />
                <Detail label="Resource type" value={selected.resourceType} />
                <Detail label="Classification" value={selected.classification} />
                <Detail label="Access result" value={selected.result} />
                <Detail label="Source service" value={selected.source} />
                <Detail label="Organization" value={selected.organization} />
              </div>

              <div className="reviewHint">
                <LockKeyhole size={17} />
                <p>
                  <strong>Data protection reminder</strong>
                  <span>
                    Apply organization-scoped authorization and data classification
                    checks before granting access. Avoid storing document contents,
                    credentials, or sensitive personal data in audit event payloads.
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
        .filters { display: flex; flex-wrap: wrap; gap: 10px; padding: 16px 22px; border-bottom: 1px solid #edf0f5; }
        .searchBox, .selectBox { height: 39px; display: flex; align-items: center; gap: 9px; border: 1px solid #e0e5ee; border-radius: 8px; padding: 0 11px; color: #8791a5; background: white; }
        .searchBox { flex: 1 1 240px; min-width: 170px; }
        .searchBox input { flex: 1; min-width: 0; border: 0; outline: none; color: #263148; font-size: 12px; background: transparent; }
        .searchBox input::placeholder { color: #a1a9b8; }
        .searchBox button { display: flex; border: 0; background: none; color: #8993a7; cursor: pointer; }
        .selectBox { flex: 1 1 150px; min-width: 140px; }
        .selectBox select { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; color: #45516a; appearance: none; font-size: 11px; cursor: pointer; }
        .tableMeta { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 13px 22px; font-size: 11px; color: #8490a5; }
        .tableMeta strong { color: #344159; }
        .tableMeta span:last-child { display: flex; align-items: center; gap: 6px; }
        .tableWrap { width: 100%; overflow-x: auto; }
        table { width: 100%; min-width: 1400px; border-collapse: collapse; text-align: left; }
        th { padding: 12px 14px; background: #fafbfe; border-top: 1px solid #edf0f5; border-bottom: 1px solid #edf0f5; color: #8791a5; font-size: 10px; text-transform: uppercase; letter-spacing: .5px; font-weight: 700; white-space: nowrap; }
        td { padding: 14px; border-bottom: 1px solid #f0f2f6; color: #566178; font-size: 11px; white-space: nowrap; }
        tbody tr:last-child td { border-bottom: 0; }
        tbody tr:hover { background: #fafbff; }
        td strong { display: block; color: #2d384e; font-size: 11px; font-weight: 650; }
        td small { display: block; color: #99a1b0; font-size: 10px; margin-top: 5px; }
        .category { display: inline-flex; padding: 5px 8px; border-radius: 6px; background: #f0f3fa; color: #53627d; font-size: 10px; }
        .classification, .result { display: inline-flex; align-items: center; gap: 6px; padding: 5px 8px; border-radius: 20px; font-size: 10px; font-weight: 650; white-space: nowrap; }
        .dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
        .public { color: #53627d; background: #eef1f6; }
        .internal { color: #3158a6; background: #edf3ff; }
        .confidential { color: #9b6b10; background: #fff7e5; }
        .restricted { color: #b42318; background: #feeceb; }
        .granted { color: #16804c; background: #eaf8f0; }
        .denied { color: #b42318; background: #feeceb; }
        .reviewed { color: #6045b5; background: #f0ebff; }
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
        .description { padding: 12px 14px; border-radius: 9px; background: #f7f8fc; color: #667189; font-size: 12px; line-height: 1.65; margin: 0 0 20px; }
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
        @media (max-width: 1100px) { .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); } .header { flex-direction: column; } .filters { flex-wrap: wrap; } }
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
