import React from "react";

export default function Navbar({ brand = "ModelNow", items = [], activePath, onNavigate, className }) {
  const safeBrand = typeof brand === "string" && brand.trim() ? brand : "ModelNow";
  const safeItems = Array.isArray(items)
    ? items.filter(item => item !== null && typeof item === "object" && !Array.isArray(item))
    : [];
  const safeActivePath = typeof activePath === "string" ? activePath : null;
  const canNavigate = typeof onNavigate === "function";

  return <nav className={className} aria-label="Primary navigation" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
    <strong>{safeBrand}</strong>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {safeItems.map((item, index) => {
        const label = typeof item.label === "string" && item.label.trim() ? item.label : "Unnamed item";
        const href = typeof item.href === "string" ? item.href : null;
        const isActive = href !== null && safeActivePath === href;
        const isDisabled = item.disabled === true || !canNavigate;

        return <button
          key={`${href ?? "no-href"}-${label}-${index}`}
          type="button"
          aria-current={isActive ? "page" : undefined}
          disabled={isDisabled}
          onClick={() => {
            if (!isDisabled) onNavigate(item);
          }}
          style={{ padding: 8, border: 0, borderRadius: 8, background: isActive ? "var(--line, #293247)" : "transparent", color: "inherit" }}
        >{label}</button>;
      })}
    </div>
  </nav>;
}