import React from "react";
import { SearchableTable } from "../ComponentPrimitives.jsx";

export default function ApiKeyTable({ keys = [], className }) {
  const columns = [
    { key: "name", label: "Name" },
    { key: "prefix", label: "Key prefix" },
    { key: "status", label: "Status" },
    { key: "createdAt", label: "Created" },
    { key: "lastUsedAt", label: "Last used" }
  ];
  const safeKeys = (Array.isArray(keys) ? keys : []).filter(key => key && typeof key === "object" && !Array.isArray(key)).map(({ secret, value, token, apiKey, keyValue, ...metadata }) => metadata);
  return <SearchableTable title="API keys" description="Key metadata only; secret values are excluded." columns={columns} rows={safeKeys} />;
}