import React, { useMemo, useState } from "react";

export const ui = {
  panel: { minWidth: 0, padding: 16, border: "1px solid var(--line, #293247)", borderRadius: 12, background: "var(--panel, #111827)", color: "var(--text, #e5e7eb)" },
  muted: { fontSize: 12, color: "var(--muted, #9ca3af)" },
  input: { boxSizing: "border-box", width: "100%", padding: 9, border: "1px solid var(--line, #374151)", borderRadius: 8, background: "var(--input, #0b1220)", color: "inherit", font: "inherit" },
  button: { padding: "8px 11px", border: "1px solid var(--line, #374151)", borderRadius: 8, background: "transparent", color: "inherit", cursor: "pointer", font: "inherit" }
};

export function Panel({ title, description, children, className, actions }) {
  return <section className={className} style={ui.panel}>
    {(title || description || actions) && <header style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
      <div>{title && <h3 style={{ margin: 0, fontSize: 15 }}>{title}</h3>}{description && <p style={{ ...ui.muted, margin: "5px 0 0" }}>{description}</p>}</div>
      {actions}
    </header>}
    {children}
  </section>;
}

export function EmptyState({ title = "No data yet", description = "Data will appear here when available." }) {
  return <div role="status" style={{ padding: 22, textAlign: "center" }}><strong style={{ fontSize: 13 }}>{title}</strong><p style={ui.muted}>{description}</p></div>;
}

export function DataTable({ columns = [], rows = [], emptyTitle = "No records", emptyDescription = "No records are available." }) {
  const normalized = columns.map(c => typeof c === "string" ? { key: c, label: c } : c);
  if (!rows.length) return <EmptyState title={emptyTitle} description={emptyDescription} />;
  return <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
    <thead><tr>{normalized.map(c => <th key={c.key} scope="col" style={{ padding: 10, borderBottom: "1px solid var(--line, #293247)", whiteSpace: "nowrap" }}>{c.label}</th>)}</tr></thead>
    <tbody>{rows.map((row, i) => <tr key={row.id ?? row.key ?? i}>{normalized.map(c => <td key={c.key} style={{ padding: 10, borderBottom: "1px solid var(--line, #293247)", overflowWrap: "anywhere" }}>{c.render ? c.render(row[c.key], row) : String(row[c.key] ?? "—")}</td>)}</tr>)}</tbody>
  </table></div>;
}

export function MetricValue({ label, value = "—", unit = "", detail, change }) {
  return <div><div style={ui.muted}>{label}</div><div style={{ marginTop: 6, fontSize: 26, fontWeight: 650, overflowWrap: "anywhere" }}>{value}{unit}</div>{change != null && <div style={ui.muted}>{change}</div>}{detail && <div style={{ ...ui.muted, marginTop: 5 }}>{detail}</div>}</div>;
}

export function SimpleChart({ data = [], xKey = "label", yKey = "value", label = "Series", height = 180, unit = "" }) {
  const points = useMemo(() => (Array.isArray(data) ? data : []).map(d => {
    const raw = d?.[yKey];
    if (raw == null || (typeof raw === "string" && raw.trim() === "")) return null;
    const y = Number(raw);
    return Number.isFinite(y) ? { x: String(d?.[xKey] ?? ""), y } : null;
  }).filter(Boolean), [data, xKey, yKey]);
  if (!points.length) return <EmptyState title="No chart data" description="Provide numeric data points to render this chart." />;
  const chartHeightValue = Number(height);
  const chartHeight = Number.isFinite(chartHeightValue) ? Math.max(100, Math.min(600, chartHeightValue)) : 180;
  const w = 640, pad = 28, min = Math.min(0, ...points.map(p => p.y)), max = Math.max(0, ...points.map(p => p.y)), range = max - min || 1;
  const coords = points.map((p, i) => ({ ...p, px: pad + (points.length === 1 ? (w - 2 * pad) / 2 : i * (w - 2 * pad) / (points.length - 1)), py: chartHeight - pad - (p.y - min) / range * (chartHeight - 2 * pad) }));
  const path = coords.map((p, i) => `${i ? "L" : "M"} ${p.px} ${p.py}`).join(" ");
  return <div><div style={ui.muted}>{label}</div><svg viewBox={`0 0 ${w} ${chartHeight}`} role="img" aria-label={`${label} line chart`} style={{ width: "100%", display: "block" }}>
    {[0, .5, 1].map(v => <line key={v} x1={pad} x2={w - pad} y1={pad + v * (chartHeight - 2 * pad)} y2={pad + v * (chartHeight - 2 * pad)} stroke="currentColor" opacity=".12" />)}
    <path d={path} fill="none" stroke="var(--accent, #818cf8)" strokeWidth="2.5" strokeLinejoin="round" />
    {coords.map((p, i) => <circle key={i} cx={p.px} cy={p.py} r="3.5" fill="var(--accent, #818cf8)"><title>{`${p.x}: ${p.y}${unit}`}</title></circle>)}
  </svg><div style={{ display: "flex", justifyContent: "space-between", ...ui.muted }}><span>{coords[0].x}</span><span>{coords[coords.length - 1].x}</span></div></div>;
}

export function SearchableTable({ title, description, columns = [], rows = [] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = (Array.isArray(rows) ? rows : []).filter(row => {
    if (!normalizedQuery) return true;

    try {
      return JSON.stringify(row ?? {}).toLowerCase().includes(normalizedQuery);
    } catch {
      return false;
    }
  });
  return <Panel title={title} description={description}>
    <input aria-label={`Search ${title || "records"}`} placeholder="Search records…" value={query} onChange={e => setQuery(e.target.value)} style={{ ...ui.input, marginBottom: 12 }} />
    <DataTable columns={columns} rows={filtered} />
  </Panel>;
}