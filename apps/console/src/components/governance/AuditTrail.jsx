import React from "react";
import { SearchableTable } from "../ComponentPrimitives.jsx";

export default function AuditTrail({ events = [], className }) {
  const columns = [
    { key: "timestamp", label: "Time" },
    { key: "actor", label: "Actor" },
    { key: "action", label: "Action" },
    { key: "resource", label: "Resource" },
    { key: "outcome", label: "Outcome" }
  ];

  const safeEvents = (Array.isArray(events) ? events : [])
    .filter(event => event !== null && typeof event === "object" && !Array.isArray(event))
    .map(event => ({
      ...event,
      timestamp: event.timestamp == null ? "—" : String(event.timestamp),
      actor: event.actor == null ? "—" : String(event.actor),
      action: event.action == null ? "—" : String(event.action),
      resource: event.resource == null ? "—" : String(event.resource),
      outcome: event.outcome == null ? "—" : String(event.outcome)
    }));

  return <div className={className}><SearchableTable title="Audit trail" description="Recorded events supplied by the caller." columns={columns} rows={safeEvents} /></div>;
}