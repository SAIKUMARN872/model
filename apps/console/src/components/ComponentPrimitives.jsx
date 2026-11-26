
import React, { useMemo, useState } from "react";

export const ui = {
  panel: {
    minWidth: 0,
    padding: 12,
    border: "1px solid var(--line, #293247)",
    borderRadius: 10,
    background: "var(--panel, #111827)",
    color: "var(--text, #e5e7eb)",
  },

  muted: {
    fontSize: 12,
    color: "var(--muted, #9ca3af)",
  },

  input: {
    boxSizing: "border-box",
    width: "100%",
    padding: "7px 10px",
    border: "1px solid var(--line, #374151)",
    borderRadius: 7,
    background: "var(--input, #0b1220)",
    color: "inherit",
    font: "inherit",
    fontSize: 12,
  },

  button: {
    padding: "7px 10px",
    border: "1px solid var(--line, #374151)",
    borderRadius: 7,
    background: "transparent",
    color: "inherit",
    cursor: "pointer",
    font: "inherit",
  },
};

export function Panel({ title, description, children, className, actions }) {
  return (
    <section className={className} style={ui.panel}>
      {(title || description || actions) && (
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 10,
          }}
        >
          <div>
            {title && (
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                {title}
              </h3>
            )}

            {description && (
              <p style={{ ...ui.muted, margin: "3px 0 0" }}>
                {description}
              </p>
            )}
          </div>

          {actions}
        </header>
      )}

      {children}
    </section>
  );
}

export function EmptyState({
  title = "No data yet",
  description = "Data will appear here when available.",
}) {
  return (
    <div
      role="status"
      style={{
        padding: 16,
        textAlign: "center",
      }}
    >
      <strong style={{ fontSize: 12 }}>{title}</strong>
      <p style={ui.muted}>{description}</p>
    </div>
  );
}

export function DataTable({
  columns = [],
  rows = [],
  emptyTitle = "No records",
  emptyDescription = "No records are available.",
}) {
  const normalized = columns.map((column) =>
    typeof column === "string"
      ? { key: column, label: column }
      : column
  );

  if (!rows.length) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div
      style={{
        width: "100%",
        overflowX: "auto",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "left",
          fontSize: 12,
        }}
      >
        <thead>
          <tr>
            {normalized.map((column) => (
              <th
                key={column.key}
                scope="col"
                style={{
                  padding: "8px 10px",
                  borderBottom: "1px solid var(--line, #293247)",
                  whiteSpace: "nowrap",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--muted, #9ca3af)",
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id ?? row.key ?? index}>
              {normalized.map((column) => (
                <td
                  key={column.key}
                  style={{
                    padding: "8px 10px",
                    borderBottom: "1px solid var(--line, #293247)",
                    overflowWrap: "anywhere",
                    lineHeight: 1.4,
                    fontSize: 12,
                  }}
                >
                  {column.render
                    ? column.render(row[column.key], row)
                    : String(row[column.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MetricValue({
  label,
  value = "—",
  unit = "",
  detail,
  change,
}) {
  return (
    <div>
      <div style={ui.muted}>{label}</div>

      <div
        style={{
          marginTop: 5,
          fontSize: 24,
          fontWeight: 650,
          overflowWrap: "anywhere",
        }}
      >
        {value}
        {unit}
      </div>

      {change != null && (
        <div style={ui.muted}>{change}</div>
      )}

      {detail && (
        <div style={{ ...ui.muted, marginTop: 4 }}>
          {detail}
        </div>
      )}
    </div>
  );
}

export function SimpleChart({
  data = [],
  xKey = "label",
  yKey = "value",
  label = "Series",
  height = 180,
  unit = "",
}) {
  const points = useMemo(
    () =>
      (Array.isArray(data) ? data : [])
        .map((item) => {
          const raw = item?.[yKey];

          if (
            raw == null ||
            (typeof raw === "string" && raw.trim() === "")
          ) {
            return null;
          }

          const y = Number(raw);

          return Number.isFinite(y)
            ? { x: String(item?.[xKey] ?? ""), y }
            : null;
        })
        .filter(Boolean),
    [data, xKey, yKey]
  );

  if (!points.length) {
    return (
      <EmptyState
        title="No chart data"
        description="Provide numeric data points to render this chart."
      />
    );
  }

  const chartHeightValue = Number(height);

  const chartHeight = Number.isFinite(chartHeightValue)
    ? Math.max(100, Math.min(600, chartHeightValue))
    : 180;

  const w = 640;
  const pad = 28;
  const min = Math.min(0, ...points.map((point) => point.y));
  const max = Math.max(0, ...points.map((point) => point.y));
  const range = max - min || 1;

  const coords = points.map((point, index) => ({
    ...point,
    px:
      pad +
      (points.length === 1
        ? (w - 2 * pad) / 2
        : (index * (w - 2 * pad)) / (points.length - 1)),
    py:
      chartHeight -
      pad -
      ((point.y - min) / range) * (chartHeight - 2 * pad),
  }));

  const path = coords
    .map(
      (point, index) =>
        `${index ? "L" : "M"} ${point.px} ${point.py}`
    )
    .join(" ");

  return (
    <div>
      <div style={ui.muted}>{label}</div>

      <svg
        viewBox={`0 0 ${w} ${chartHeight}`}
        role="img"
        aria-label={`${label} line chart`}
        style={{
          width: "100%",
          display: "block",
        }}
      >
        {[0, 0.5, 1].map((value) => (
          <line
            key={value}
            x1={pad}
            x2={w - pad}
            y1={pad + value * (chartHeight - 2 * pad)}
            y2={pad + value * (chartHeight - 2 * pad)}
            stroke="currentColor"
            opacity=".12"
          />
        ))}

        <path
          d={path}
          fill="none"
          stroke="var(--accent, #818cf8)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {coords.map((point, index) => (
          <circle
            key={index}
            cx={point.px}
            cy={point.py}
            r="3.5"
            fill="var(--accent, #818cf8)"
          >
            <title>
              {`${point.x}: ${point.y}${unit}`}
            </title>
          </circle>
        ))}
      </svg>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          ...ui.muted,
        }}
      >
        <span>{coords[0].x}</span>
        <span>{coords[coords.length - 1].x}</span>
      </div>
    </div>
  );
}

export function SearchableTable({
  title,
  description,
  columns = [],
  rows = [],
}) {
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = (Array.isArray(rows) ? rows : []).filter(
    (row) => {
      if (!normalizedQuery) return true;

      try {
        return JSON.stringify(row ?? {})
          .toLowerCase()
          .includes(normalizedQuery);
      } catch {
        return false;
      }
    }
  );

  return (
    <Panel title={title} description={description}>
      <input
        aria-label={`Search ${title || "records"}`}
        placeholder="Search records…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        style={{
          ...ui.input,
          marginBottom: 8,
        }}
      />

      <DataTable
        columns={columns}
        rows={filtered}
      />
    </Panel>
  );
}
