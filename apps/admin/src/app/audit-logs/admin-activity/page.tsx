
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Search,
  RefreshCw,
  Download,
  ShieldCheck,
  Users,
  Settings,
  KeyRound,
  Building2,
  ChevronRight,
  X,
  FileJson,
  FileSpreadsheet,
  Eye,
  Filter,
  Clock3,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

type AdminEvent = {
  id: string;
  time: string;
  admin: string;
  email: string;
  action: string;
  category: string;
  resource: string;
  organization: string;
  ip: string;
  result: "Success" | "Denied" | "Failed";
  details: string;
};

const initialEvents: AdminEvent[] = [
  {
    id: "ADM-10842",
    time: "2026-11-04 10:42:18",
    admin: "Pujitha M.",
    email: "admin@modelnow.example",
    action: "Updated organization settings",
    category: "Configuration",
    resource: "Organization settings",
    organization: "ModelNow Workspace",
    ip: "192.0.2.14",
    result: "Success",
    details: "Updated organization-level configuration options.",
  },
  {
    id: "ADM-10841",
    time: "2026-11-04 10:36:04",
    admin: "Platform Admin",
    email: "platform@modelnow.example",
    action: "Changed user role",
    category: "Permissions",
    resource: "User: demo-user-104",
    organization: "Acme AI",
    ip: "192.0.2.28",
    result: "Success",
    details: "Changed the assigned role for a demo user.",
  },
  {
    id: "ADM-10840",
    time: "2026-11-04 10:21:51",
    admin: "Security Admin",
    email: "security@modelnow.example",
    action: "Reviewed access request",
    category: "Access Control",
    resource: "Access request AR-2081",
    organization: "ModelNow Workspace",
    ip: "192.0.2.37",
    result: "Denied",
    details: "The requested permission was not approved.",
  },
  {
    id: "ADM-10839",
    time: "2026-11-04 09:58:33",
    admin: "Billing Admin",
    email: "billing@modelnow.example",
    action: "Viewed billing records",
    category: "Billing",
    resource: "Billing dashboard",
    organization: "Acme AI",
    ip: "192.0.2.41",
    result: "Success",
    details: "Accessed billing summary and invoice metadata.",
  },
  {
    id: "ADM-10838",
    time: "2026-11-04 09:40:12",
    admin: "Platform Admin",
    email: "platform@modelnow.example",
    action: "Modified API configuration",
    category: "API",
    resource: "API gateway",
    organization: "ModelNow Workspace",
    ip: "192.0.2.28",
    result: "Success",
    details: "Updated a demo API gateway configuration.",
  },
  {
    id: "ADM-10837",
    time: "2026-11-04 09:18:46",
    admin: "Security Admin",
    email: "security@modelnow.example",
    action: "Attempted privileged operation",
    category: "Security",
    resource: "Admin permission policy",
    organization: "Acme AI",
    ip: "192.0.2.37",
    result: "Failed",
    details: "The privileged operation failed during validation.",
  },
  {
    id: "ADM-10836",
    time: "2026-11-04 08:55:29",
    admin: "Organization Admin",
    email: "orgadmin@modelnow.example",
    action: "Invited a team member",
    category: "Users",
    resource: "Invitation INV-4102",
    organization: "Northstar Labs",
    ip: "192.0.2.52",
    result: "Success",
    details: "Created a demo invitation for a new team member.",
  },
  {
    id: "ADM-10835",
    time: "2026-11-04 08:30:07",
    admin: "Platform Admin",
    email: "platform@modelnow.example",
    action: "Exported audit report",
    category: "Audit",
    resource: "Report RPT-1042",
    organization: "ModelNow Workspace",
    ip: "192.0.2.28",
    result: "Success",
    details: "Requested an audit report export.",
  },
];

const categories = [
  "All categories",
  "Configuration",
  "Permissions",
  "Access Control",
  "Billing",
  "API",
  "Security",
  "Users",
  "Audit",
];

export default function AdminActivityPage() {
  const [events, setEvents] = useState(initialEvents);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [result, setResult] = useState("All results");
  const [selected, setSelected] = useState<AdminEvent | null>(null);
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        !query ||
        [
          event.id,
          event.admin,
          event.email,
          event.action,
          event.category,
          event.resource,
          event.organization,
          event.ip,
        ].some((value) => value.toLowerCase().includes(query));

      return (
        matchesSearch &&
        (category === "All categories" || event.category === category) &&
        (result === "All results" || event.result === result)
      );
    });
  }, [events, search, category, result]);

  const successful = events.filter((event) => event.result === "Success").length;
  const denied = events.filter((event) => event.result === "Denied").length;
  const failed = events.filter((event) => event.result === "Failed").length;
  const uniqueAdmins = new Set(events.map((event) => event.email)).size;

  function exportEvents(format: "csv" | "json") {
    const rows = filtered.map((event) => ({
      eventId: event.id,
      timestamp: event.time,
      administrator: event.admin,
      email: event.email,
      action: event.action,
      category: event.category,
      resource: event.resource,
      organization: event.organization,
      ipAddress: event.ip,
      result: event.result,
      details: event.details,
    }));

    const content =
      format === "json"
        ? JSON.stringify(rows, null, 2)
        : [
            Object.keys(rows[0] ?? { eventId: "" }).join(","),
            ...rows.map((row) =>
              Object.values(row)
                .map((value) => `"${String(value).replace(/"/g, '""')}"`)
                .join(",")
            ),
          ].join("\n");

    const blob = new Blob([content], {
      type: format === "json" ? "application/json" : "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `modelnow-admin-activity.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice(`${filtered.length} demo records exported as ${format.toUpperCase()}.`);
  }

  function refresh() {
    setEvents([...initialEvents]);
    setSearch("");
    setCategory("All categories");
    setResult("All results");
    setNotice("Admin activity refreshed with sample data.");
  }

  return (
    <main className="page">
      <div className="breadcrumbs">
        <Link href="/dashboard">Admin</Link>
        <ChevronRight size={14} />
        <Link href="/audit-logs">Audit Logs</Link>
        <ChevronRight size={14} />
        <strong>Admin Activity</strong>
      </div>

      <header className="header">
        <div className="titleArea">
          <div className="titleIcon"><ShieldCheck size={24} /></div>
          <div>
            <h1>Admin Activity</h1>
            <p>Monitor privileged actions, administrator changes, and sensitive operations across ModelNow.</p>
          </div>
        </div>
        <div className="headerActions">
          <button className="button secondary" onClick={refresh}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="button secondary" onClick={() => exportEvents("csv")}>
            <FileSpreadsheet size={15} /> Export CSV
          </button>
          <button className="button primary" onClick={() => exportEvents("json")}>
            <FileJson size={15} /> Export JSON
          </button>
        </div>
      </header>

      {notice && (
        <div className="notice">
          <CheckCircle2 size={16} />
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss notification"><X size={15} /></button>
        </div>
      )}

      <section className="metrics">
        <article className="metric">
          <div className="metricTop"><span>Total admin events</span><Activity size={18} /></div>
          <strong>{events.length}</strong>
          <small>Records in current demo dataset</small>
        </article>
        <article className="metric">
          <div className="metricTop"><span>Successful actions</span><CheckCircle2 size={18} className="green" /></div>
          <strong>{successful}</strong>
          <small>Completed operations</small>
        </article>
        <article className="metric">
          <div className="metricTop"><span>Denied / failed</span><AlertTriangle size={18} className="red" /></div>
          <strong>{denied + failed}</strong>
          <small>{denied} denied · {failed} failed</small>
        </article>
        <article className="metric">
          <div className="metricTop"><span>Unique administrators</span><Users size={18} className="blue" /></div>
          <strong>{uniqueAdmins}</strong>
          <small>Distinct demo identities</small>
        </article>
      </section>

      <section className="quickGrid">
        <div className="quickCard">
          <div className="quickIcon purple"><Settings size={19} /></div>
          <div><strong>Configuration changes</strong><p>Workspace and platform settings</p></div>
          <span>{events.filter((event) => event.category === "Configuration").length}</span>
        </div>
        <div className="quickCard">
          <div className="quickIcon orange"><KeyRound size={19} /></div>
          <div><strong>Permission operations</strong><p>Roles and access decisions</p></div>
          <span>{events.filter((event) => event.category === "Permissions" || event.category === "Access Control").length}</span>
        </div>
        <div className="quickCard">
          <div className="quickIcon blue"><Building2 size={19} /></div>
          <div><strong>Organizations affected</strong><p>Workspaces in the sample dataset</p></div>
          <span>{new Set(events.map((event) => event.organization)).size}</span>
        </div>
      </section>

      <section className="panel">
        <div className="panelHeader">
          <div>
            <h2>Administrator event history</h2>
            <p>Search and review administrative actions and their outcomes.</p>
          </div>
          <span className="sampleBadge">Demo data</span>
        </div>

        <div className="filters">
          <label className="searchBox">
            <Search size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search admin, action, resource, organization..."
            />
          </label>
          <label className="selectBox">
            <Filter size={15} />
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="selectBox">
            <Activity size={15} />
            <select value={result} onChange={(event) => setResult(event.target.value)}>
              <option>All results</option>
              <option>Success</option>
              <option>Denied</option>
              <option>Failed</option>
            </select>
          </label>
        </div>

        <div className="tableInfo">
          <span><strong>{filtered.length}</strong> matching events</span>
          <span><Clock3 size={14} /> Latest events first</span>
        </div>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Event / Time</th>
                <th>Administrator</th>
                <th>Action</th>
                <th>Category</th>
                <th>Resource</th>
                <th>Organization</th>
                <th>Result</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((event) => (
                <tr key={event.id}>
                  <td><strong>{event.id}</strong><small>{event.time}</small></td>
                  <td><strong>{event.admin}</strong><small>{event.email}</small></td>
                  <td className="actionCell">{event.action}</td>
                  <td><span className="category">{event.category}</span></td>
                  <td>{event.resource}</td>
                  <td>{event.organization}</td>
                  <td><span className={`status ${event.result.toLowerCase()}`}><span className="dot" />{event.result}</span></td>
                  <td>
                    <button className="detailsButton" onClick={() => setSelected(event)}>
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8}>
                  <div className="empty">
                    <Search size={25} />
                    <strong>No matching admin events</strong>
                    <span>Try a different search term or filter.</span>
                    <button className="button secondary" onClick={() => { setSearch(""); setCategory("All categories"); setResult("All results"); }}>Clear filters</button>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <div className="backdrop" onClick={() => setSelected(null)}>
          <section className="modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <header className="modalHeader">
              <div>
                <span className="eyebrow">ADMIN AUDIT EVENT</span>
                <h2>{selected.action}</h2>
                <p>{selected.id} · {selected.time}</p>
              </div>
              <button className="closeButton" onClick={() => setSelected(null)} aria-label="Close"><X size={18} /></button>
            </header>
            <div className="modalBody">
              <div className="detailGrid">
                <div><span>Administrator</span><strong>{selected.admin}</strong></div>
                <div><span>Email</span><strong>{selected.email}</strong></div>
                <div><span>Category</span><strong>{selected.category}</strong></div>
                <div><span>Result</span><strong className={`resultText ${selected.result.toLowerCase()}`}>{selected.result}</strong></div>
                <div><span>Resource</span><strong>{selected.resource}</strong></div>
                <div><span>Organization</span><strong>{selected.organization}</strong></div>
                <div><span>Source IP</span><strong>{selected.ip}</strong></div>
                <div><span>Event ID</span><strong>{selected.id}</strong></div>
              </div>
              <div className="descriptionBox"><span>Event details</span><p>{selected.details}</p></div>
              <div className="securityNote"><ShieldCheck size={17} /><span>In production, verify event integrity and enforce access controls before revealing sensitive audit details.</span></div>
            </div>
            <footer className="modalFooter">
              <button className="button secondary" onClick={() => setSelected(null)}>Close</button>
              <button className="button primary" onClick={() => {
                const row = selected;
                const blob = new Blob([JSON.stringify(row, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const anchor = document.createElement("a");
                anchor.href = url;
                anchor.download = `${row.id}.json`;
                anchor.click();
                URL.revokeObjectURL(url);
              }}><Download size={15} /> Export event</button>
            </footer>
          </section>
        </div>
      )}

      <div className="bottomLink"><Link href="/audit-logs"><Activity size={15} /> Back to Audit Logs</Link></div>

      <style jsx>{`
        * { box-sizing: border-box; }
        .page { min-height: 100vh; padding: 27px; background: #f7f8fc; color: #1c2639; font-family: Arial, Helvetica, sans-serif; }
        .breadcrumbs { display: flex; align-items: center; gap: 8px; color: #98a2b3; font-size: 11px; margin-bottom: 23px; }
        .breadcrumbs a, .bottomLink a { color: #6b7890; text-decoration: none; }
        .breadcrumbs a:hover, .bottomLink a:hover { color: #315bea; }
        .breadcrumbs strong { color: #2d394f; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 22px; }
        .titleArea { display: flex; gap: 14px; align-items: flex-start; }
        .titleIcon { width: 47px; height: 47px; display: grid; place-items: center; flex-shrink: 0; color: #315bea; background: #eaf0ff; border-radius: 13px; }
        h1 { margin: 0 0 8px; font-size: 27px; font-weight: 750; letter-spacing: -.7px; }
        .titleArea p { margin: 0; max-width: 710px; color: #7b869a; font-size: 12px; line-height: 1.7; }
        .headerActions { display: flex; flex-wrap: wrap; gap: 8px; }
        .button { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 10px 12px; border: 1px solid #dfe4ed; border-radius: 8px; font-size: 11px; font-weight: 700; white-space: nowrap; cursor: pointer; }
        .secondary { background: white; color: #46536a; }
        .secondary:hover { background: #f4f6fa; }
        .primary { background: #315bea; color: white; border-color: #315bea; }
        .primary:hover { background: #2449ca; }
        .notice { display: flex; align-items: center; gap: 9px; margin-bottom: 17px; padding: 12px 14px; border: 1px solid #bce8cd; border-radius: 9px; color: #167343; background: #effbf4; font-size: 11px; }
        .notice span { flex: 1; }
        .notice button { display: flex; border: 0; background: none; color: inherit; cursor: pointer; }
        .metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 18px; }
        .metric { padding: 17px; border: 1px solid #e6eaf1; border-radius: 12px; background: white; min-width: 0; box-shadow: 0 2px 7px #18274704; }
        .metricTop { display: flex; justify-content: space-between; align-items: center; gap: 8px; color: #7b869a; font-size: 11px; margin-bottom: 16px; }
        .metricTop svg { color: #8794aa; }
        .metric strong { display: block; font-size: 26px; letter-spacing: -.5px; margin-bottom: 7px; }
        .metric small { color: #929bad; font-size: 10px; }
        .green { color: #16804c !important; }
        .blue { color: #315bea !important; }
        .red { color: #c43d3d !important; }
        .quickGrid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 13px; margin-bottom: 20px; }
        .quickCard { display: flex; align-items: center; gap: 11px; padding: 15px; border: 1px solid #e6eaf1; border-radius: 11px; background: white; min-width: 0; }
        .quickIcon { display: grid; place-items: center; width: 39px; height: 39px; border-radius: 10px; flex-shrink: 0; }
        .purple { color: #7950c7; background: #f3edff; }
        .orange { color: #c27a1b; background: #fff2e2; }
        .quickIcon.blue { color: #315bea; background: #edf2ff; }
        .quickCard > div:nth-child(2) { flex: 1; min-width: 0; }
        .quickCard strong { display: block; color: #354158; font-size: 11px; margin-bottom: 5px; }
        .quickCard p { margin: 0; color: #909aab; font-size: 10px; line-height: 1.5; }
        .quickCard > span:last-child { display: grid; place-items: center; min-width: 28px; height: 28px; padding: 0 7px; border-radius: 7px; background: #f3f5fa; color: #45516a; font-size: 11px; font-weight: 750; }
        .panel { background: white; border: 1px solid #e6eaf1; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 7px #18274704; }
        .panelHeader { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 19px 21px; border-bottom: 1px solid #edf0f5; }
        .panelHeader h2 { margin: 0 0 6px; font-size: 14px; font-weight: 750; }
        .panelHeader p { margin: 0; color: #8792a5; font-size: 11px; line-height: 1.6; }
        .sampleBadge { padding: 6px 9px; color: #966515; background: #fff6df; border-radius: 20px; font-size: 10px; font-weight: 700; white-space: nowrap; }
        .filters { display: flex; flex-wrap: wrap; gap: 10px; padding: 15px 21px; border-bottom: 1px solid #edf0f5; }
        .searchBox, .selectBox { display: flex; align-items: center; gap: 8px; height: 38px; padding: 0 10px; border: 1px solid #dfe4ed; border-radius: 8px; color: #8792a5; }
        .searchBox { flex: 1 1 270px; }
        .searchBox input { width: 100%; min-width: 0; border: 0; outline: 0; color: #354158; font-size: 11px; background: transparent; }
        .searchBox input::placeholder { color: #a0a8b7; }
        .selectBox { flex: 0 1 180px; background: white; }
        .selectBox select { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; color: #566178; font-size: 11px; cursor: pointer; }
        .tableInfo { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 13px 21px; color: #8994a8; font-size: 10px; }
        .tableInfo strong { color: #344159; }
        .tableInfo span:last-child { display: flex; align-items: center; gap: 6px; }
        .tableWrap { overflow-x: auto; width: 100%; }
        table { width: 100%; min-width: 1130px; border-collapse: collapse; text-align: left; }
        th { padding: 12px; background: #fafbfe; border-top: 1px solid #edf0f5; border-bottom: 1px solid #edf0f5; color: #8792a5; font-size: 9px; font-weight: 750; text-transform: uppercase; letter-spacing: .45px; white-space: nowrap; }
        td { padding: 14px 12px; border-bottom: 1px solid #f0f2f6; color: #65718a; font-size: 10px; white-space: nowrap; }
        tbody tr:last-child td { border-bottom: 0; }
        tbody tr:hover { background: #fafbff; }
        td strong { display: block; color: #344159; font-size: 10px; font-weight: 700; }
        td small { display: block; margin-top: 5px; color: #929bad; font-size: 9px; }
        .actionCell { color: #3e4b62; font-weight: 600; }
        .category { display: inline-flex; padding: 5px 7px; background: #f0f3fa; border-radius: 6px; color: #586680; font-size: 9px; }
        .status { display: inline-flex; align-items: center; gap: 6px; padding: 5px 7px; border-radius: 20px; font-size: 9px; font-weight: 700; }
        .dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
        .success { color: #16804c; background: #eaf8f0; }
        .denied { color: #a66b12; background: #fff5df; }
        .failed { color: #b42318; background: #feeceb; }
        .detailsButton { display: inline-flex; align-items: center; gap: 5px; padding: 6px 8px; border: 1px solid #dfe4ed; border-radius: 6px; background: white; color: #315bea; font-size: 10px; font-weight: 650; cursor: pointer; }
        .detailsButton:hover { background: #f1f5ff; }
        .empty { min-height: 220px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 11px; color: #8994a8; }
        .empty strong { color: #354158; font-size: 13px; }
        .empty span { font-size: 11px; }
        .backdrop { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; background: #10182880; }
        .modal { width: 100%; max-width: 650px; max-height: 90vh; overflow-y: auto; border-radius: 14px; background: white; box-shadow: 0 20px 70px #0003; }
        .modalHeader { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; padding: 21px; border-bottom: 1px solid #edf0f5; }
        .eyebrow { color: #315bea; font-size: 9px; letter-spacing: 1px; font-weight: 750; }
        .modalHeader h2 { margin: 8px 0 5px; color: #29364d; font-size: 18px; }
        .modalHeader p { margin: 0; color: #8993a7; font-size: 11px; }
        .closeButton { display: grid; place-items: center; width: 32px; height: 32px; border: 1px solid #e0e5ed; border-radius: 8px; background: white; color: #66738a; cursor: pointer; }
        .modalBody { padding: 21px; }
        .detailGrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 18px; }
        .detailGrid > div { display: flex; flex-direction: column; gap: 7px; padding: 13px 0; border-bottom: 1px solid #edf0f5; min-width: 0; }
        .detailGrid span, .descriptionBox > span { color: #8993a7; font-size: 10px; }
        .detailGrid strong { color: #354158; font-size: 11px; overflow-wrap: anywhere; }
        .resultText.success { background: none; }
        .resultText.denied { background: none; }
        .resultText.failed { background: none; }
        .descriptionBox { margin-top: 17px; padding: 14px; background: #f7f8fc; border: 1px solid #edf0f5; border-radius: 9px; }
        .descriptionBox p { margin: 8px 0 0; color: #536078; font-size: 11px; line-height: 1.7; }
        .securityNote { display: flex; align-items: flex-start; gap: 9px; margin-top: 13px; padding: 12px; border: 1px solid #d6e0ff; border-radius: 8px; background: #f2f5ff; color: #3d58a3; font-size: 10px; line-height: 1.6; }
        .securityNote svg { flex-shrink: 0; }
        .modalFooter { display: flex; justify-content: flex-end; gap: 8px; padding: 15px 21px; border-top: 1px solid #edf0f5; }
        .bottomLink { padding-top: 18px; font-size: 11px; }
        .bottomLink a { display: inline-flex; align-items: center; gap: 7px; }
        @media (max-width: 1100px) { .header { flex-direction: column; } .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 700px) { .page { padding: 16px; } .quickGrid { grid-template-columns: 1fr; } .headerActions { width: 100%; } .headerActions .button { flex: 1; } .filters { flex-direction: column; } .selectBox { flex: auto; } .panelHeader { align-items: flex-start; } .tableInfo { align-items: flex-start; flex-direction: column; } }
        @media (max-width: 420px) { .metrics { grid-template-columns: 1fr; } h1 { font-size: 23px; } .detailGrid { grid-template-columns: 1fr; } .headerActions { flex-direction: column; } .headerActions .button { width: 100%; } }
      `}</style>
    </main>
  );
}
