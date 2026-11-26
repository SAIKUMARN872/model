import React from "react";

function safeText(value, fallback) {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : fallback;
}

function normalizeItems(items) {
  if (!Array.isArray(items)) return [];

  return items.reduce((validItems, item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return validItems;
    }

    const label = safeText(item.label, "Unnamed item");
    const href = typeof item.href === "string" && item.href.trim()
      ? item.href
      : null;
    const shortLabel = safeText(item.shortLabel, label.slice(0, 1) || "•");

    validItems.push({
      item,
      index,
      label,
      href,
      shortLabel,
      disabled: item.disabled === true,
    });

    return validItems;
  }, []);
}

export default function Sidebar({
  title = "Workspace",
  items = [],
  activePath,
  onNavigate,
  collapsed = false,
  className,
}) {
  const safeTitle = safeText(title, "Workspace");
  const safeActivePath = typeof activePath === "string" ? activePath : null;
  const isCollapsed = collapsed === true;
  const canNavigate = typeof onNavigate === "function";
  const normalizedItems = normalizeItems(items);

  return (
    <aside
      className={className}
      aria-label="Workspace navigation"
      style={{
        width: isCollapsed ? 64 : 240,
        minWidth: isCollapsed ? 64 : 180,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {!isCollapsed && (
        <h2 style={{ fontSize: 14, padding: "8px 12px" }}>
          {safeTitle}
        </h2>
      )}

      <nav aria-label={safeTitle} style={{ display: "grid", gap: 4 }}>
        {normalizedItems.map(({ item, index, label, href, shortLabel, disabled }) => {
          const isActive = href !== null && safeActivePath === href;
          const isDisabled = disabled || !canNavigate;
          const key = `${href ?? "no-href"}:${label}:${index}`;

          return (
            <button
              key={key}
              type="button"
              aria-current={isActive ? "page" : undefined}
              aria-label={isCollapsed ? label : undefined}
              title={isCollapsed ? label : undefined}
              disabled={isDisabled}
              onClick={() => {
                if (!isDisabled) onNavigate(item);
              }}
              style={{
                padding: 10,
                textAlign: "left",
                border: 0,
                borderRadius: 8,
                background: isActive ? "var(--line, #293247)" : "transparent",
                color: "inherit",
                cursor: isDisabled ? "not-allowed" : "pointer",
              }}
            >
              {isCollapsed ? shortLabel : label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}