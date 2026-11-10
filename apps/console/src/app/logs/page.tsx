import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, FileClock, RefreshCw, Search } from "lucide-react";
import { api, ApiError } from "../../lib/api.js";
import { getResourceEndpoint } from "../../config/console.js";

type Row = Record<string, unknown>;
function errorText(e: unknown): string {
  return e instanceof Error ? e.message : "Unable to load log records.";
}
function textValue(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
  try { return JSON.stringify(v); } catch { return "[unavailable]"; }
}
function parseRows(value: unknown): Row[] | null {
  if (Array.isArray(value)) {
    return value.every(x => x !== null && typeof x === "object" && !Array.isArray(x))
      ? value as Row[] : null;
  }
  if (!value || typeof value !== "object") return null;
  const obj = value as Record<string, unknown>;
  for (const key of ["data", "items", "results", "logs", "records"]) {
    const nested = obj[key];
    if (Array.isArray(nested)) return parseRows(nested);
    if (nested && typeof nested === "object") {
      const child = nested as Record<string, unknown>;
      for (const k of ["items", "results", "logs", "records"]) {
        if (Array.isArray(child[k])) return parseRows(child[k]);
      }
    }
  }
  return null;
}
function humanize(k: string) {
  return k.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
export default function LogsPage() {
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [configError, setConfigError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [records, setRecords] = useState<Row[] | null>(null);
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("all");

  useEffect(() => {
    try { setEndpoint(getResourceEndpoint("logs")); }
    catch (e) { setConfigError(errorText(e)); }
  }, []);

  const load = useCallback(async () => {
    if (!endpoint) return;
    setLoading(true);
    setError("");
    try {
      const result = parseRows(await api.get(endpoint));
      if (result === null) throw new Error("The logs endpoint returned an unsupported response format.");
      setRecords(result);
      setLoaded(true);
    } catch (e) {
      setRecords(null);
      setLoaded(false);
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => { if (endpoint) void load(); }, [endpoint, load]);

  const severities = useMemo(() => [...new Set((records ?? [])
    .map(r => String(r.level ?? r.severity ?? r.status ?? "").toLowerCase())
    .filter(Boolean))].sort(), [records]);

  const filtered = useMemo(() => (records ?? []).filter(row => {
    const q = query.trim().toLowerCase();
    const matches = !q || Object.entries(row).some(([k, v]) =>
      `${k} ${textValue(v)}`.toLowerCase().includes(q));
    const level = String(row.level ?? row.severity ?? row.status ?? "").toLowerCase();
    return matches && (severity === "all" || severity === level);
  }), [records, query, severity]);

  const columns = useMemo(() => {
    const keys = [...new Set((records ?? []).flatMap(r => Object.keys(r)))];
    const preferred = ["timestamp", "createdAt", "created_at", "level", "severity", "message", "event", "status", "requestId"];
    return [...preferred.filter(k => keys.includes(k)), ...keys.filter(k => !preferred.includes(k))].slice(0, 7);
  }, [records]);

  return <div className="page-stack">
    <header className="page-heading">
      <div><div className="page-eyebrow">OBSERVABILITY</div><h1>Logs</h1>
        <p>Inspect event records returned by your configured API.</p></div>
      <button type="button" className="button button--secondary" onClick={() => void load()} disabled={!endpoint || loading}>
        <RefreshCw size={15} className={loading ? "spin" : ""} /> Refresh
      </button>
    </header>
    <section className="resource-summary">
      <div className="resource-summary__icon"><FileClock size={22} /></div>
      <div><strong>API-backed event records</strong><p>Only records returned by the configured endpoint are displayed.</p></div>
      <div className="resource-summary__right">{loading ? "Loading" : error || configError ? "Unavailable" : loaded ? `${records?.length ?? 0} records` : "Not configured"}</div>
    </section>
    {(configError || error) && <div className="notice notice--error" role="alert">
      <AlertCircle size={18} /><div><strong>Unable to load logs</strong><p>{configError || error}</p></div>
    </div>}
    {!endpoint && !configError && <div className="notice"><AlertCircle size={18}/><div>
      <strong>Logs endpoint not configured</strong>
      <p>Set <code>VITE_CONSOLE_ENDPOINT_LOGS</code> to a verified same-origin API path.</p>
    </div></div>}
    {loading && <div className="table-empty" role="status">Loading log records…</div>}
    {loaded && records?.length === 0 && <div className="table-empty">The API returned no log records.</div>}
    {loaded && records && records.length > 0 && <section className="data-card" aria-label="Log records">
      <div className="data-card__toolbar">
        <div className="data-card__count">{filtered.length} of {records.length} records</div>
        <label className="table-search"><Search size={15}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search logs" aria-label="Search logs"/></label>
        <select value={severity} onChange={e => setSeverity(e.target.value)} aria-label="Filter severity">
          <option value="all">All levels</option>{severities.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="table-scroll"><table><thead><tr>{columns.map(k => <th key={k}>{humanize(k)}</th>)}</tr></thead>
        <tbody>{filtered.map((row, i) => <tr key={textValue(row.id ?? row.requestId ?? i)}>
          {columns.map(k => <td key={k}><span title={textValue(row[k])}>{textValue(row[k])}</span></td>)}
        </tr>)}</tbody></table></div>
      {!filtered.length && <div className="table-empty">No records match these filters.</div>}
    </section>}
    <p className="page-footnote">This page does not generate synthetic log events.</p>
  </div>;
}