import React, { useMemo, useState } from "react";

export default function LogViewer({ logs = [], className, maxHeight = 420 }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("all");
  const safeLogs = Array.isArray(logs)
    ? logs.filter(log => log !== null && (typeof log === "string" || (typeof log === "object" && !Array.isArray(log))))
    : [];

  const formatLog = log => {
    if (typeof log === "string") return log;
    try {
      const serialized = JSON.stringify(log, null, 2);
      return serialized === undefined ? "[Log entry unavailable]" : serialized;
    } catch {
      return "[Log entry cannot be serialized]";
    }
  };

  const safeMaxHeight = Number.isFinite(Number(maxHeight)) && Number(maxHeight) > 0
    ? Math.min(Number(maxHeight), 2000)
    : 420;

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return safeLogs.filter(log => {
      const text = formatLog(log).toLowerCase();
      const rawLevel = typeof log === "object" ? log.level : "info";
      const actual = typeof rawLevel === "string" ? rawLevel.toLowerCase() : "info";
      return text.includes(normalizedQuery) && (level === "all" || actual === level);
    });
  }, [safeLogs, query, level]);

  return <section className={className}>
    <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
      <input aria-label="Search logs" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search logs…" style={{ flex: 1, minWidth: 140, padding: 9 }} />
      <select aria-label="Log level" value={level} onChange={e => setLevel(e.target.value)}><option value="all">All levels</option><option value="error">Error</option><option value="warn">Warning</option><option value="info">Info</option><option value="debug">Debug</option></select>
    </div>
    <div style={{ maxHeight: safeMaxHeight, overflow: "auto", padding: 12, border: "1px solid var(--line, #293247)", borderRadius: 10, fontFamily: "ui-monospace, monospace", fontSize: 12 }}>
      {filtered.length ? filtered.map((log, i) => <div key={typeof log.id === "string" || typeof log.id === "number" ? log.id : i} style={{ padding: "5px 0", borderBottom: "1px solid var(--line, #293247)", overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>{formatLog(log)}</div>) : <p role="status">No matching log entries.</p>}
    </div>
  </section>;
}