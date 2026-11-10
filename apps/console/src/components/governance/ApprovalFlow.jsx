import React from "react";

export default function ApprovalFlow({ approvals = [], onApprove, onReject, disabled = false, className }) {
  const safeApprovals = (Array.isArray(approvals) ? approvals : [])
    .filter(item => item !== null && typeof item === "object" && !Array.isArray(item));

  return <section className={className} style={{ display: "grid", gap: 10 }}>
    {!safeApprovals.length && <p role="status">No pending approvals.</p>}
    {safeApprovals.map((item, index) => {
      const status = item.status == null ? "pending" : String(item.status);
      const isPending = status.trim().toLowerCase() === "pending";
      const title = item.title ?? item.action ?? "Approval request";

      return <article key={item.id ?? `approval-${index}`} style={{ padding: 12, border: "1px solid var(--line, #293247)", borderRadius: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <strong>{String(title)}</strong>
          <span>{status}</span>
        </div>
        {item.description != null && <p style={{ fontSize: 13 }}>{String(item.description)}</p>}
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" disabled={disabled || !isPending || typeof onApprove !== "function"} onClick={() => onApprove(item)}>Approve</button>
          <button type="button" disabled={disabled || !isPending || typeof onReject !== "function"} onClick={() => onReject(item)}>Reject</button>
        </div>
      </article>;
    })}
  </section>;
}