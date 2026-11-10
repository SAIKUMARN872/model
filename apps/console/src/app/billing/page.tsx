import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CreditCard, ExternalLink, RefreshCw, Search } from "lucide-react";
import { api } from "../../lib/api.js";
import { getResourceEndpoint } from "../../config/console.js";

type Row = Record<string, unknown>;
function errorText(e: unknown) { return e instanceof Error ? e.message : "Unable to load billing records."; }
function textValue(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
  try { return JSON.stringify(v); } catch { return "[unavailable]"; }
}
function parseRows(value: unknown): Row[] | null {
  if (Array.isArray(value)) return value.every(x => x && typeof x === "object" && !Array.isArray(x)) ? value as Row[] : null;
  if (!value || typeof value !== "object") return null;
  const obj = value as Record<string, unknown>;
  for (const k of ["data", "items", "results", "invoices", "billing", "records"]) {
    const v = obj[k];
    if (Array.isArray(v)) return parseRows(v);
    if (v && typeof v === "object") {
      const nested = v as Record<string, unknown>;
      for (const n of ["items", "results", "invoices", "records"]) if (Array.isArray(nested[n])) return parseRows(nested[n]);
    }
  }
  return null;
}
function humanize(k: string) { return k.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()); }
function safeHttpUrl(v: unknown): string | null {
  if (typeof v !== "string" || !v.trim()) return null;
  try { const u = new URL(v); return u.protocol === "https:" || u.protocol === "http:" ? u.href : null; } catch { return null; }
}
export default function BillingPage() {
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [configError, setConfigError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [records, setRecords] = useState<Row[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => { try { setEndpoint(getResourceEndpoint("billing")); } catch (e) { setConfigError(errorText(e)); } }, []);
  const load = useCallback(async () => {
    if (!endpoint) return;
    setLoading(true); setError("");
    try {
      const rows = parseRows(await api.get(endpoint));
      if (rows === null) throw new Error("The billing endpoint returned an unsupported response format.");
      setRecords(rows); setLoaded(true);
    } catch (e) { setRecords(null); setLoaded(false); setError(errorText(e)); }
    finally { setLoading(false); }
  }, [endpoint]);
  useEffect(() => { if (endpoint) void load(); }, [endpoint, load]);

  const columns = useMemo(() => {
    const keys = [...new Set((records ?? []).flatMap(r => Object.keys(r)))];
    const preferred = ["invoiceNumber", "invoice_number", "id", "period", "createdAt", "created_at", "amount", "currency", "status", "dueDate", "due_date"];
    return [...preferred.filter(k => keys.includes(k)), ...keys.filter(k => !preferred.includes(k))].slice(0, 8);
  }, [records]);
  const filtered = useMemo(() => (records ?? []).filter(r => !query.trim() ||
    Object.entries(r).some(([k, v]) => `${k} ${textValue(v)}`.toLowerCase().includes(query.trim().toLowerCase()))), [records, query]);

  return <div className="page-stack">
    <header className="page-heading"><div><div className="page-eyebrow">ACCOUNT &amp; PAYMENTS</div><h1>Billing</h1>
      <p>Inspect billing records returned by your configured API.</p></div>
      <button type="button" className="button button--secondary" onClick={() => void load()} disabled={!endpoint || loading}><RefreshCw size={15} className={loading ? "spin" : ""}/> Refresh</button>
    </header>
    <section className="resource-summary"><div className="resource-summary__icon"><CreditCard size={22}/></div>
      <div><strong>Billing records</strong><p>This view is read-only; it does not perform payment actions.</p></div>
      <div className="resource-summary__right">{loading ? "Loading" : error || configError ? "Unavailable" : loaded ? `${records?.length ?? 0} records` : "Not configured"}</div>
    </section>
    {(configError || error) && <div className="notice notice--error" role="alert"><AlertCircle size={18}/><div><strong>Billing data unavailable</strong><p>{configError || error}</p></div></div>}
    {!endpoint && !configError && <div className="notice"><AlertCircle size={18}/><div><strong>Billing endpoint not configured</strong><p>Set <code>VITE_CONSOLE_ENDPOINT_BILLING</code> to a verified same-origin API path.</p></div></div>}
    {loading && <div className="table-empty" role="status">Loading billing records…</div>}
    {loaded && records?.length === 0 && <div className="table-empty">The API returned no billing records.</div>}
    {loaded && records && records.length > 0 && <section className="data-card" aria-label="Billing records">
      <div className="data-card__toolbar"><div className="data-card__count">{filtered.length} of {records.length} records</div>
        <label className="table-search"><Search size={15}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Filter billing" aria-label="Filter billing"/></label></div>
      <div className="table-scroll"><table><thead><tr>{columns.map(k => <th key={k}>{humanize(k)}</th>)}<th>Invoice</th></tr></thead><tbody>
        {filtered.map((r, i) => {
          const href = safeHttpUrl(r.invoiceUrl ?? r.invoice_url ?? r.hostedInvoiceUrl ?? r.hosted_invoice_url ?? r.pdfUrl ?? r.pdf_url);
          return <tr key={textValue(r.id ?? r.invoiceNumber ?? r.invoice_number ?? i)}>
            {columns.map(k => <td key={k}><span title={textValue(r[k])}>{textValue(r[k])}</span></td>)}
            <td>{href ? <a href={href} target="_blank" rel="noopener noreferrer">Open <ExternalLink size={13}/></a> : "—"}</td>
          </tr>;
        })}
      </tbody></table></div>
      {!filtered.length && <div className="table-empty">No records match your filter.</div>}
    </section>}
    <p className="page-footnote">Invoice links are displayed only when the API returns a valid HTTP(S) URL.</p>
  </div>;
}