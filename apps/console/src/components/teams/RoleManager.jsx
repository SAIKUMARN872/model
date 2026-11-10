import React from "react";

export default function RoleManager({ roles = [], onChange, disabled = false, className }) {
  const safeRoles = (Array.isArray(roles) ? roles : []).filter(role => role && typeof role === "object" && !Array.isArray(role));
  return <section className={className} style={{ display: "grid", gap: 8 }}>
    {!safeRoles.length && <p role="status">No roles configured.</p>}
    {safeRoles.map((role, index) => {
      const name = typeof role.name === "string" && role.name.trim() ? role.name : `Role ${index + 1}`;
      const id = role.id ?? name;
      const checkboxId = `role-enabled-${String(id).replace(/[^a-zA-Z0-9_-]/g, "-")}-${index}`;
      const permissionsCount = Array.isArray(role.permissions) ? role.permissions.length : null;
      return <div key={String(id) + "-" + index} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, border: "1px solid var(--line, #293247)", borderRadius: 8 }}>
        <input id={checkboxId} type="checkbox" checked={Boolean(role.enabled)} disabled={disabled} onChange={e => onChange?.({ ...role, enabled: e.target.checked })} />
        <label htmlFor={checkboxId} style={{ flex: 1, cursor: disabled ? "default" : "pointer" }}><strong>{name}</strong>{role.description && <small style={{ display: "block", opacity: .7 }}>{role.description}</small>}</label>
        {permissionsCount !== null && <small>{permissionsCount} permissions</small>}
      </div>;
    })}
  </section>;
}