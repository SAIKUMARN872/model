import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, AlertCircle, RefreshCw, Search } from "lucide-react";
import { api } from "../../lib/api.js";
import { getResourceEndpoint } from "../../config/console.js";

type Row = Record<string, unknown>;
function errorText(e: unknown) { return e instanceof Error ? e.message : "Unable to load usage records."; }
function textValue(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
  try { return JSON.stringify(v); } catch { return "[unavailable]"; }
}
function parseRows(value: unknown): Row[] | null {
  if (Array.isArray(value)) return value.every(x => x && typeof x === "object" && !Array.isArray(x)) ? value as Row[] : null;
  if (!value || typeof value !== "object") return null;
  const obj = value as Record<string, unknown>;
  for (const k of ["data", "items", "results", "usage", "records"]) {
    const v = obj[k];
    if (Array.isArray(v)) return parseRows(v);
    if (v && typeof v === "object") {
      const nested = v as Record<string, unknown>;
      for (const n of ["items", "results", "records"]) if (Array.isArray(nested[n])) return parseRows(nested[n]);
    }
  }
  return null;
}
function humanize(k: string) { return k.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()); }
export default function UsagePage() {
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [configError, setConfigError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [records, setRecords] = useState<Row[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => { try { setEndpoint(getResourceEndpoint("usage")); } catch (e) { setConfigError(errorText(e)); } }, []);
  const load = useCallback(async () => {
    if (!endpoint) return;
    setLoading(true); setError("");
    try {
      const rows = parseRows(await api.get(endpoint));
      if (rows === null) throw new Error("The usage endpoint returned an unsupported response format.");
      setRecords(rows); setLoaded(true);
    } catch (e) { setRecords(null); setLoaded(false); setError(errorText(e)); }
    finally { setLoading(false); }
  }, [endpoint]);
  useEffect(() => { if (endpoint) void load(); }, [endpoint, load]);

  const columns = useMemo(() => {
    const keys = [...new Set((records ?? []).flatMap(r => Object.keys(r)))];
    const preferred = ["period", "date", "model", "provider", "requests", "requestCount", "inputTokens", "outputTokens", "totalTokens", "cost", "status"];
    return [...preferred.filter(k => keys.includes(k)), ...keys.filter(k => !preferred.includes(k))].slice(0, 8);
  }, [records]);
  const filtered = useMemo(() => (records ?? []).filter(r => !query.trim() ||
    Object.entries(r).some(([k, v]) => `${k} ${textValue(v)}`.toLowerCase().includes(query.trim().toLowerCase()))), [records, query]);

  return <div className="page-stack">
    <header className="page-heading"><div><div className="page-eyebrow">ACCOUNT METRICS</div><h1>Usage &amp; limits</h1>
      <p>Review usage records and quota data returned by the API.</p></div>
      <button type="button" className="button button--secondary" onClick={() => void load()} disabled={!endpoint || loading}><RefreshCw size={15} className={loading ? "spin" : ""}/> Refresh</button>
    </header>
    <section className="resource-summary"><div className="resource-summary__icon"><Activity size={22}/></div>
      <div><strong>Usage records</strong><p>Totals are not estimated or synthesized.</p></div>
      <div className="resource-summary__right">{loading ? "Loading" : error || configError ? "Unavailable" : loaded ? `${records?.length ?? 0} records` : "Not configured"}</div>
    </section>
    {(configError || error) && <div className="notice notice--error" role="alert"><AlertCircle size={18}/><div><strong>Usage data unavailable</strong><p>{configError || error}</p></div></div>}
    {!endpoint && !configError && <div className="notice"><AlertCircle size={18}/><div><strong>Usage endpoint not configured</strong><p>Set <code>VITE_CONSOLE_ENDPOINT_USAGE</code> to a verified same-origin API path.</p></div></div>}
    {loading && <div className="table-empty" role="status">Loading usage records…</div>}
    {loaded && records?.length === 0 && <div className="table-empty">The API returned no usage records.</div>}
    {loaded && records && records.length > 0 && <section className="data-card" aria-label="Usage records">
      <div className="data-card__toolbar"><div className="data-card__count">{filtered.length} of {records.length} records</div>
        <label className="table-search"><Search size={15}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Filter usage" aria-label="Filter usage"/></label></div>
      <div className="table-scroll"><table><thead><tr>{columns.map(k => <th key={k}>{humanize(k)}</th>)}</tr></thead><tbody>
        {filtered.map((r, i) => <tr key={textValue(r.id ?? r.key ?? i)}>{columns.map(k => <td key={k}><span title={textValue(r[k])}>{textValue(r[k])}</span></td>)}</tr>)}
      </tbody></table></div>
      {!filtered.length && <div className="table-empty">No records match your filter.</div>}
    </section>}
    <p className="page-footnote">Daily usage, token quotas, and request rate limits are separate controls.</p>
  </div>;
}