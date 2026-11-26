
"use client";

import { useState } from "react";
import {
  X,
  ChevronDown,
  UserRound,
} from "lucide-react";

export default function ExploreApiKeys({ onClose }) {
  const [name, setName] = useState("");
  const [expires, setExpires] = useState("30 days");
  const [account, setAccount] = useState("Personal account");
  const [accountOpen, setAccountOpen] = useState(false);

  const accounts = [
    "Personal account",
    "Not linked",
    "Create a service account",
  ];

  const styles = {
    overlay: {
      position: "fixed",
      inset: 0,
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "12px",
      boxSizing: "border-box",
      background: "transparent",
      overflow: "hidden",
      fontFamily: "Arial, sans-serif",
    },

    modal: {
      width: "100%",
      maxWidth: "590px",
      maxHeight: "80vh",
      background: "#ffffff",
      borderRadius: "12px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      boxShadow: "0 12px 35px rgba(0,0,0,0.18)",
      color: "#202124",
    },

    header: {
      padding: "19px 24px 13px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexShrink: 0,
    },

    heading: {
      fontSize: "23px",
      fontWeight: 700,
      margin: 0,
    },

    close: {
      border: "none",
      background: "transparent",
      cursor: "pointer",
      padding: 0,
      color: "#333333",
      display: "flex",
      alignItems: "center",
    },

    body: {
      padding: "8px 24px 14px",
      overflowY: "auto",
      overflowX: "hidden",
      flex: 1,
      minHeight: 0,
    },

    field: {
      marginBottom: "15px",
    },

    label: {
      display: "block",
      fontSize: "15px",
      fontWeight: 600,
      marginBottom: "7px",
      color: "#202124",
    },

    input: {
      width: "100%",
      height: "40px",
      border: "1px solid #d5d9df",
      borderRadius: "9px",
      padding: "0 12px",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
      background: "#ffffff",
      color: "#202124",
    },

    accountButton: {
      width: "100%",
      height: "40px",
      border: "1px solid #d5d9df",
      borderRadius: "9px",
      padding: "0 10px",
      background: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      cursor: "pointer",
      fontSize: "14px",
      color: "#202124",
      boxSizing: "border-box",
    },

    avatar: {
      width: "26px",
      height: "26px",
      borderRadius: "50%",
      background: "#eeeeee",
      color: "#555555",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },

    helper: {
      fontSize: "12px",
      color: "#929292",
      margin: "8px 0 0",
      lineHeight: 1.45,
    },

    dropdown: {
      position: "absolute",
      top: "44px",
      left: 0,
      width: "100%",
      background: "#ffffff",
      border: "1px solid #e1e5eb",
      borderRadius: "9px",
      boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
      zIndex: 10,
      overflow: "hidden",
    },

    dropdownItem: {
      display: "block",
      width: "100%",
      padding: "10px 12px",
      textAlign: "left",
      border: "none",
      fontSize: "13px",
      cursor: "pointer",
      color: "#202124",
    },

    scopeButton: {
      width: "100%",
      height: "40px",
      border: "1px solid #d5d9df",
      borderRadius: "9px",
      padding: "0 12px",
      background: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      color: "#202124",
      fontSize: "14px",
      boxSizing: "border-box",
    },

    footer: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "9px",
      padding: "12px 24px 17px",
      flexShrink: 0,
      background: "#ffffff",
      borderTop: "1px solid #f0f0f0",
    },

    cancel: {
      height: "37px",
      padding: "0 16px",
      border: "1px solid #d5d5d5",
      borderRadius: "8px",
      background: "#ffffff",
      color: "#333333",
      fontSize: "13px",
      fontWeight: 600,
      cursor: "pointer",
    },

    create: {
      height: "37px",
      padding: "0 17px",
      border: "none",
      borderRadius: "8px",
      background: name.trim() ? "#315fe8" : "#cccccc",
      color: "#ffffff",
      fontSize: "13px",
      fontWeight: 600,
      cursor: name.trim() ? "pointer" : "not-allowed",
    },
  };

  return (
    <main style={styles.overlay}>
      <section
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <header style={styles.header}>
          <h1 style={styles.heading}>Create API key</h1>

          <button
            type="button"
            aria-label="Close"
            style={styles.close}
            onClick={onClose}
          >
            <X size={21} />
          </button>
        </header>

        {/* FORM */}
        <div style={styles.body}>
          {/* NAME */}
          <div style={styles.field}>
            <label style={styles.label}>Name</label>

            <input
              style={styles.input}
              type="text"
              placeholder="my-secret-key"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* EXPIRES */}
          <div style={styles.field}>
            <label style={styles.label}>Expires</label>

            <select
              style={styles.input}
              value={expires}
              onChange={(e) => setExpires(e.target.value)}
            >
              <option value="Never">Never</option>
              <option value="30 days">30 days</option>
              <option value="60 days">60 days</option>
              <option value="90 days">90 days</option>
            </select>
          </div>

          {/* LINKED ACCOUNT */}
          <div style={styles.field}>
            <label style={styles.label}>Linked account</label>

            <div style={{ position: "relative" }}>
              <button
                type="button"
                style={styles.accountButton}
                onClick={() => setAccountOpen(!accountOpen)}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                  }}
                >
                  <span style={styles.avatar}>
                    <UserRound size={15} />
                  </span>

                  {account}
                </span>

                <ChevronDown size={17} color="#888888" />
              </button>

              {accountOpen && (
                <div style={styles.dropdown}>
                  {accounts.map((item) => (
                    <button
                      type="button"
                      key={item}
                      style={{
                        ...styles.dropdownItem,
                        background:
                          account === item ? "#f3f6fc" : "#ffffff",
                      }}
                      onClick={() => {
                        setAccount(item);
                        setAccountOpen(false);
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p style={styles.helper}>
              Requests with this key act as your personal account.
            </p>
          </div>

          {/* SCOPE */}
          <div>
            <label style={styles.label}>Scope</label>

            <div style={styles.scopeButton}>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <UserRound size={17} color="#6655ff" />
                Default workspace
              </span>

              <ChevronDown size={17} color="#888888" />
            </div>

            <p style={styles.helper}>
              This key only works in{" "}
              <strong style={{ color: "#444444" }}>Default</strong>{" "}
              workspace and can't use the Admin API.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <footer style={styles.footer}>
          <button
            type="button"
            style={styles.cancel}
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            style={styles.create}
            disabled={!name.trim()}
          >
            Create key
          </button>
        </footer>
      </section>
    </main>
  );
}
