import React from "react";
import { SearchableTable } from "../ComponentPrimitives.jsx";

export default function MemberTable({ members = [], className }) {
  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" }
  ];
  return <div className={className}><SearchableTable title="Team members" description="Membership data supplied by the caller." columns={columns} rows={members} /></div>;
}