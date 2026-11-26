"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  ChevronDown,
  UserRound,
  ShieldCheck,
  LoaderCircle,
} from "lucide-react";

interface CreateKeyPageProps {
  onClose?: () => void;
  onCreate?: (
    name: string,
    expires: string,
    account: string
  ) => void | Promise<void>;
  creating?: boolean;
  error?: string;
}

export default function CreateKeyPage({
  onClose,
  onCreate,
  creating = false,
  error = "",
}: CreateKeyPageProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [expires, setExpires] = useState("Never");
  const [account, setAccount] = useState("Personal account");
  const [accountOpen, setAccountOpen] = useState(false);

  const [internalCreating, setInternalCreating] = useState(false);
  const [internalError, setInternalError] = useState("");

  const isCreating = creating || internalCreating;
  const displayError = error || internalError;

  const accounts = [
    "Personal account",
    "Not linked",
    "Create a service account",
  ];

  const handleClose = () => {
    if (isCreating) return;
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim() || isCreating) return;

    if (onCreate) {
      await onCreate(name.trim(), expires, account);
      return;
    }

    try {
      setInternalCreating(true);
      setInternalError("");

      // Update this endpoint path to match your backend API route
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          expires,
          account,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to create API key");
      }

      handleClose();
    } catch (err: any) {
      setInternalError(err.message || "Something went wrong while creating the key.");
    } finally {
      setInternalCreating(false);
    }
  };

  const styles = {
    overlay: {
      position: "fixed" as const,
      inset: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.38)",
      backdropFilter: "blur(1px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "12px",
      boxSizing: "border-box" as const,
      fontFamily: "Arial, sans-serif",
      overflow: "hidden",
      zIndex: 9999,
    },
    modal: {
      width: "100%",
      maxWidth: "420px",
      maxHeight: "90vh",
      background: "#ffffff",
      borderRadius: "15px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column" as const,
      boxShadow: "0 15px 45px rgba(0,0,0,0.20)",
      color: "#202936",
    },
    header: {
      padding: "20px",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      flexShrink: 0,
    },
    heading: {
      fontSize: "20px",
      fontWeight: 700,
      margin: 0,
      color: "#202124",
    },
    description: {
      fontSize: "13px",
      color: "#7b8493",
      marginTop: "10px",
      marginBottom: 0,
    },
    close: {
      border: "none",
      background: "transparent",
      cursor: isCreating ? "not-allowed" : "pointer",
      padding: 0,
      color: "#202936",
    },
    form: {
      display: "flex",
      flexDirection: "column" as const,
      flex: 1,
      minHeight: 0,
    },
    body: {
      padding: "20px",
      overflowY: "auto" as const,
      flex: 1,
      minHeight: 0,
    },
    field: {
      marginBottom: "20px",
    },
    label: {
      display: "block",
      fontSize: "13px",
      fontWeight: 600,
      marginBottom: "10px",
      color: "#202936",
    },
    input: {
      width: "100%",
      height: "48px",
      border: "1px solid #d5d9df",
      borderRadius: "10px",
      padding: "0 13px",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box" as const,
      background: "#ffffff",
      color: "#202936",
    },
    select: {
      width: "100%",
      height: "48px",
      border: "1px solid #d5d9df",
      borderRadius: "10px",
      padding: "0 13px",
      fontSize: "14px",
      background: "#ffffff",
      color: "#202936",
      outline: "none",
      cursor: "pointer",
    },
    accountButton: {
      width: "100%",
      height: "52px",
      border: "1px solid #d5d9df",
      borderRadius: "10px",
      padding: "0 13px",
      background: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      cursor: "pointer",
      fontSize: "14px",
      color: "#202936",
    },
    avatar: {
      width: "34px",
      height: "34px",
      borderRadius: "50%",
      background: "#edf3ff",
      color: "#3867d6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    dropdown: {
      position: "absolute" as const,
      top: "58px",
      left: 0,
      width: "100%",
      background: "#ffffff",
      border: "1px solid #e1e5eb",
      borderRadius: "10px",
      boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
      zIndex: 10,
      overflow: "hidden",
    },
    dropdownItem: {
      display: "block",
      width: "100%",
      padding: "13px",
      textAlign: "left" as const,
      border: "none",
      background: "#ffffff",
      fontSize: "13px",
      cursor: "pointer",
      color: "#202936",
    },
    scopeCard: {
      minHeight: "75px",
      border: "1px solid #e0e3e8",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      padding: "13px",
      gap: "13px",
      boxSizing: "border-box" as const,
    },
    footer: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px",
      padding: "15px 20px 20px",
      borderTop: "1px solid #e5e7eb",
      flexShrink: 0,
      background: "#ffffff",
    },
    cancel: {
      height: "42px",
      padding: "0 17px",
      border: "1px solid #d1d5db",
      borderRadius: "10px",
      background: "#f8f8f8",
      color: "#333333",
      fontSize: "13px",
      fontWeight: 600,
      cursor: isCreating ? "not-allowed" : "pointer",
    },
    create: {
      height: "42px",
      padding: "0 18px",
      border: "none",
      borderRadius: "10px",
      background: name.trim() && !isCreating ? "#315fe8" : "#999999",
      color: "#ffffff",
      fontSize: "13px",
      fontWeight: 600,
      cursor: name.trim() && !isCreating ? "pointer" : "not-allowed",
      display: "flex",
      alignItems: "center",
      gap: "7px",
    },
  };

  return (
    <main
      style={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isCreating) {
          handleClose();
        }
      }}
    >
      <section
        style={styles.modal}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header style={styles.header}>
          <div>
            <h1 style={styles.heading}>Create API key</h1>

            <p style={styles.description}>
              Create a key to authenticate your ModelNow API requests.
            </p>
          </div>

          <button
            type="button"
            aria-label="Close"
            style={styles.close}
            disabled={isCreating}
            onClick={handleClose}
          >
            <X size={21} />
          </button>
        </header>

        <form onSubmit={handleCreate} style={styles.form}>
          <div style={styles.body}>
            <div style={styles.field}>
              <label style={styles.label}>Name</label>

              <input
                style={styles.input}
                type="text"
                placeholder="my-secret-key"
                value={name}
                maxLength={100}
                disabled={isCreating}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Expires</label>

              <select
                style={styles.select}
                value={expires}
                disabled={isCreating}
                onChange={(e) => setExpires(e.target.value)}
              >
                <option value="Never">Never</option>
                <option value="30 days">30 days</option>
                <option value="60 days">60 days</option>
                <option value="90 days">90 days</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Linked account</label>

              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  style={styles.accountButton}
                  disabled={isCreating}
                  onClick={() => setAccountOpen(!accountOpen)}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span style={styles.avatar}>
                      <UserRound size={19} />
                    </span>

                    {account}
                  </span>

                  <ChevronDown size={18} />
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
            </div>

            <div>
              <label style={styles.label}>Scope</label>

              <div style={styles.scopeCard}>
                <ShieldCheck size={21} />

                <div>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      margin: "0 0 7px",
                    }}
                  >
                    Workspace
                  </p>

                  <p
                    style={{
                      fontSize: "13px",
                      color: "#7b8493",
                      margin: 0,
                    }}
                  >
                    Access resources in your current workspace
                  </p>
                </div>
              </div>
            </div>

            {displayError && (
              <p
                role="alert"
                style={{
                  marginTop: 16,
                  padding: 12,
                  borderRadius: 8,
                  background: "#fff1f0",
                  color: "#b42318",
                  fontSize: 13,
                }}
              >
                {displayError}
              </p>
            )}
          </div>

          <footer style={styles.footer}>
            <button
              type="button"
              style={styles.cancel}
              disabled={isCreating}
              onClick={handleClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={styles.create}
              disabled={!name.trim() || isCreating}
            >
              {isCreating && (
                <LoaderCircle
                  size={15}
                  style={{
                    animation: "mn-create-spin 1s linear infinite",
                  }}
                />
              )}

              {isCreating ? "Creating..." : "Create key"}
            </button>
          </footer>
        </form>
      </section>

      <style>
        {`
          @keyframes mn-create-spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </main>
  );
}