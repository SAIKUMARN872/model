"use client";

import React, { useState } from "react";

export default function Auth({
  onLogin,
  onLogout,
}) {
  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const handleLogin = (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password.trim()) {
      setError(
        "Please enter your password."
      );
      return;
    }

    setIsAuthenticated(true);

    if (onLogin) {
      onLogin({
        email,
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setEmail("");
    setPassword("");

    if (onLogout) {
      onLogout();
    }
  };

  if (isAuthenticated) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "24px",
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
          Welcome
        </h2>

        <p
          style={{
            color: "#64748b",
          }}
        >
          You are logged in as{" "}
          <strong>{email}</strong>
        </p>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "6px",
            backgroundColor: "#dc2626",
            color: "#ffffff",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "400px",
        padding: "24px",
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
        Login
      </h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          placeholder="Enter your email"
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "12px",
            borderRadius: "6px",
            border:
              "1px solid #cbd5e1",
            boxSizing: "border-box",
          }}
        />

        <input
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(
              event.target.value
            )
          }
          placeholder="Enter your password"
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "12px",
            borderRadius: "6px",
            border:
              "1px solid #cbd5e1",
            boxSizing: "border-box",
          }}
        />

        {error && (
          <p
            style={{
              color: "#dc2626",
              fontSize: "14px",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            border: "none",
            borderRadius: "6px",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}