import React from "react";

export default function PolicyViewer({ policy, title = "Policy", className }) {
  if (policy === null || typeof policy !== "object" || Array.isArray(policy)) {
    return <section className={className}><p role="status">No valid policy provided.</p></section>;
  }

  const entries = Object.entries(policy);
  const formatValue = value => {
    if (value == null) return "—";
    if (typeof value === "string") return value;
    if (typeof value !== "object") return String(value);

    try {
      const serialized = JSON.stringify(value, null, 2);
      return serialized === undefined ? String(value) : serialized;
    } catch {
      return "[Value cannot be serialized]";
    }
  };

  return <section className={className} style={{ padding: 14, border: "1px solid var(--line, #293247)", borderRadius: 10 }}>
    <h3 style={{ marginTop: 0, fontSize: 14 }}>{String(title)}</h3>
    {!entries.length
      ? <p role="status">Policy has no fields.</p>
      : <dl style={{ display: "grid", gridTemplateColumns: "minmax(100px, 1fr) minmax(0, 2fr)", gap: 10 }}>
        {entries.map(([key, value]) => <React.Fragment key={key}>
          <dt style={{ fontSize: 12, opacity: .7, overflowWrap: "anywhere" }}>{key}</dt>
          <dd style={{ margin: 0, fontSize: 13, overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>{formatValue(value)}</dd>
        </React.Fragment>)}
      </dl>}
  </section>;
}