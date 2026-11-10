import React from "react";

function safeText(value, fallback) {
  if (typeof value === "string" && value.trim().length > 0) return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function safeTimestamp(value) {
  if (value == null || value === "") return "Time unavailable";

  try {
    const date = new Date(value);
    return Number.isFinite(date.getTime())
      ? date.toLocaleString()
      : "Time unavailable";
  } catch {
    return "Time unavailable";
  }
}

export default function ActivityFeed(props = {}) {
  const safeProps = props && typeof props === "object" && !Array.isArray(props)
    ? props
    : {};
  const items = Array.isArray(safeProps.items) ? safeProps.items : [];
  const safeItems = items.filter(
    item => item !== null && typeof item === "object" && !Array.isArray(item)
  );
  const className = typeof safeProps.className === "string"
    ? safeProps.className
    : undefined;
  const emptyMessage = safeText(safeProps.emptyMessage, "No recent activity.");
  const usedKeys = new Set();

  return (
    <section className={className} aria-label="Activity feed">
      {!safeItems.length ? (
        <p role="status" style={{ opacity: 0.7 }}>{emptyMessage}</p>
      ) : (
        <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
          {safeItems.map((item, index) => {
            const candidateKey =
              typeof item.id === "string" && item.id.trim().length > 0
                ? item.id
                : typeof item.id === "number" && Number.isFinite(item.id)
                  ? String(item.id)
                  : null;
            const baseKey = candidateKey ?? `activity-${index}`;
            const key = usedKeys.has(baseKey) ? `activity-${index}-${baseKey}` : baseKey;
            usedKeys.add(key);

            const title = safeText(item.title, safeText(item.action, safeText(item.message, "Activity")));
            const description = item.description == null
              ? null
              : safeText(item.description, "");
            const formattedTime = safeTimestamp(item.timestamp);

            return (
              <li
                key={key}
                style={{ paddingBottom: 12, borderBottom: "1px solid var(--line, #293247)" }}
              >
                <strong style={{ fontSize: 13 }}>{title}</strong>
                {description !== null && description !== "" && (
                  <p style={{ margin: "4px 0", fontSize: 12, opacity: 0.8 }}>
                    {description}
                  </p>
                )}
                <div style={{ fontSize: 11, opacity: 0.65 }}>{formattedTime}</div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}