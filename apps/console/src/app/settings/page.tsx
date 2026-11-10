import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, RefreshCw, Settings2 } from "lucide-react";
import { api } from "../../lib/api.js";
import { getResourceEndpoint } from "../../config/console.js";

type Item = { key: string; value: unknown };
function errorText(e: unknown) { return e instanceof Error ? e.message : "Unable to load settings."; }
function settingsFrom(payload: unknown): Item[] | null {
  let data = payload;
  if (data && typeof data === "object" && !Array.isArray(data) && Object.prototype.hasOwnProperty.call(data, "data")) {
    data = (data as Record<string, unknown>).data;
  }
  if (Array.isArray(data)) {
    if (!data.every(x => x && typeof x === "object" && !Array.isArray(x))) return null;
    return (data as Record<string, unknown>[]).map((r, i) => ({
      key: String(r.key ?? r.name ?? r.id ?? `setting-${i + 1}`),
      value: r.value ?? r.settingValue ?? r.setting_value ?? r
    }));
  }
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  for (const k of ["settings", "preferences", "items", "results"]) {
    if (Array.isArray(obj[k])) return settingsFrom(obj[k]);
  }
  return Object.entries(obj).map(([key, value]) => ({ key, value }));
}
function valueText(v: unknown) {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
  try { return JSON.stringify(v, null, 2); } catch { return "[unavailable]"; }
}
export default function SettingsPage() {
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [configError, setConfigError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<Item[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => { try { setEndpoint(getResourceEndpoint("settings")); } catch (e) { setConfigError(errorText(e)); } }, []);
  const load = useCallback(async () => {
    if (!endpoint) return;
    setLoading(true); setError("");
    try {
      const result = settingsFrom(await api.get(endpoint));
      if (result === null) throw new Error("The settings endpoint returned an unsupported response format.");
      setItems(result); setLoaded(true);
    } catch (e) { setItems(null); setLoaded(false); setError(errorText(e)); }
    finally { setLoading(false); }
  }, [endpoint]);
  useEffect(() => { if (endpoint) void load(); }, [endpoint, load]);

  const filtered = useMemo(() => (items ?? []).filter(item =>
    `${item.key} ${valueText(item.value)}`.toLowerCase().includes(query.trim().toLowerCase())
  ), [items, query]);

  return <div className="page-stack">
    <header className="page-heading"><div><div className="page-eyebrow">WORKSPACE</div><h1>Settings</h1>
      <p>Review settings returned by your configured API.</p></div>
      <button type="button" className="button button--secondary" onClick={() => void load()} disabled={!endpoint || loading}><RefreshCw size={15} className={loading ? "spin" : ""}/> Refresh</button>
    </header>
    <section className="resource-summary"><div className="resource-summary__icon"><Settings2 size={22}/></div>
      <div><strong>Persisted settings</strong><p>This page is read-only.</p></div>
      <div className="resource-summary__right">{loading ? "Loading" : error || configError ? "Unavailable" : loaded ? `${items?.length ?? 0} settings` : "Not configured"}</div>
    </section>
    {(configError || error) && <div className="notice notice--error" role="alert"><AlertCircle size={18}/><div><strong>Settings unavailable</strong><p>{configError || error}</p></div></div>}
    {!endpoint && !configError && <div className="notice"><AlertCircle size={18}/><div><strong>Settings endpoint not configured</strong><p>Set <code>VITE_CONSOLE_ENDPOINT_SETTINGS</code> to a verified same-origin API path.</p></div></div>}
    {loading && <div className="table-empty" role="status">Loading settings…</div>}
    {loaded && items?.length === 0 && <div className="table-empty">The API returned no settings.</div>}
    {loaded && items && items.length > 0 && <section className="data-card" aria-label="Settings">
      <div className="data-card__toolbar"><div className="data-card__count">{filtered.length} of {items.length} settings</div>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Filter settings" aria-label="Filter settings"/></div>
      <div className="table-scroll"><table><thead><tr><th>Setting</th><th>Current value</th></tr></thead><tbody>
        {filtered.map(item => <tr key={item.key}><th scope="row">{item.key}</th><td><pre className="response-json">{valueText(item.value)}</pre></td></tr>)}
      </tbody></table></div>
      {!filtered.length && <div className="table-empty">No settings match your filter.</div>}
    </section>}
    <p className="page-footnote">No settings are changed by this page.</p>
  </div>;
}