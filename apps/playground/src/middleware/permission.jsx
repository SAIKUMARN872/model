"use client";

import React, { useState } from "react";

export default function Permission({
  permissions = [],
  onChange,
}) {
  const defaultPermissions = [
    {
      id: "read",
      name: "Read",
      description:
        "Allows the user to view resources.",
      enabled: true,
    },
    {
      id: "write",
      name: "Write",
      description:
        "Allows the user to create and update resources.",
      enabled: false,
    },
    {
      id: "delete",
      name: "Delete",
      description:
        "Allows the user to delete resources.",
      enabled: false,
    },
    {
      id: "admin",
      name: "Admin",
      description:
        "Allows the user to manage system settings.",
      enabled: false,
    },
  ];

  const [items, setItems] =
    useState(
      permissions.length > 0
        ? permissions
        : defaultPermissions
    );

  const togglePermission = (id) => {
    const updatedPermissions =
      items.map((permission) =>
        permission.id === id
          ? {
              ...permission,
              enabled:
                !permission.enabled,
            }
          : permission
      );

    setItems(updatedPermissions);

    if (onChange) {
      onChange(updatedPermissions);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        padding: "20px",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border:
          "1px solid #e2e8f0",
        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          color: "#0f172a",
        }}
      >
        Permissions
      </h2>

      <p
        style={{
          color: "#64748b",
        }}
      >
        Manage access permissions for
        this user or role.
      </p>

      <div
        style={{
          display: "grid",
          gap: "12px",
          marginTop: "20px",
        }}
      >
        {items.map((permission) => (
          <div
            key={permission.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              gap: "16px",
              padding: "16px",
              border:
                "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  color: "#0f172a",
                }}
              >
                {permission.name}
              </h3>

              <p
                style={{
                  margin:
                    "6px 0 0",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                {
                  permission.description
                }
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                togglePermission(
                  permission.id
                )
              }
              style={{
                minWidth: "80px",
                padding: "8px 12px",
                border: "none",
                borderRadius: "6px",
                backgroundColor:
                  permission.enabled
                    ? "#16a34a"
                    : "#94a3b8",
                color: "#ffffff",
                cursor: "pointer",
              }}
            >
              {permission.enabled
                ? "Enabled"
                : "Disabled"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}