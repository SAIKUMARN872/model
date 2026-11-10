import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, LogOut, LoaderCircle, ShieldCheck } from "lucide-react";
import { api, ApiError } from "../../lib/api.js";

const LOGOUT_ENDPOINT =
  import.meta.env.VITE_CONSOLE_AUTH_LOGOUT_ENDPOINT ||
  "/api/v1/auth0/logout";

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Unable to sign out. Please try again.";
}

export default function LogoutPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      await api.post(LOGOUT_ENDPOINT, {});
      navigate("/login", { replace: true });
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mn-logout-page">
      <section className="mn-logout-card" aria-labelledby="mn-logout-title">
        <div className="mn-logout-icon" aria-hidden="true">
          <ShieldCheck size={25} />
        </div>

        <p className="mn-logout-eyebrow">MODELNOW SECURITY</p>
        <h1 id="mn-logout-title">Sign out</h1>
        <p className="mn-logout-description">
          End your current ModelNow console session on this device.
        </p>

        {error && (
          <div className="mn-logout-error" role="alert">
            <AlertCircle size={18} aria-hidden="true" />
            <p>{error}</p>
          </div>
        )}

        <button
          type="button"
          className="mn-logout-button"
          onClick={() => void signOut()}
          disabled={busy}
        >
          {busy ? (
            <LoaderCircle size={17} className="mn-logout-spinner" aria-hidden="true" />
          ) : (
            <LogOut size={17} aria-hidden="true" />
          )}
          {busy ? "Signing out..." : "Sign out"}
        </button>

        <button
          type="button"
          className="mn-logout-cancel"
          onClick={() => navigate("/", { replace: true })}
          disabled={busy}
        >
          Cancel
        </button>

        <p className="mn-logout-note">
          Your session is revoked by the API. If the API request fails, this
          page will report the error instead of claiming that you signed out.
        </p>
      </section>

      <style>{`
        .mn-logout-page {
          box-sizing: border-box;
          min-height: 75vh;
          display: grid;
          place-items: center;
          padding: 28px 18px;
          background: #fff;
          color: #171717;
        }
        .mn-logout-card {
          width: 100%;
          max-width: 430px;
          padding: 30px;
          border: 1px solid #e5e5e5;
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 8px 28px rgb(0 0 0 / 4%);
        }
        .mn-logout-icon {
          display: grid;
          width: 46px;
          height: 46px;
          place-items: center;
          margin-bottom: 22px;
          border-radius: 12px;
          background: #f5f5f5;
          color: #262626;
        }
        .mn-logout-eyebrow {
          margin: 0 0 8px;
          color: #737373;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .09em;
        }
        .mn-logout-card h1 {
          margin: 0;
          font-size: 28px;
          line-height: 1.25;
          letter-spacing: -.035em;
        }
        .mn-logout-description {
          margin: 11px 0 24px;
          color: #666;
          font-size: 14px;
          line-height: 1.7;
        }
        .mn-logout-button,
        .mn-logout-cancel {
          box-sizing: border-box;
          width: 100%;
          min-height: 43px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          border-radius: 8px;
          font: inherit;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .mn-logout-button {
          border: 1px solid #171717;
          background: #171717;
          color: #fff;
        }
        .mn-logout-button:hover:not(:disabled) {
          background: #404040;
        }
        .mn-logout-cancel {
          margin-top: 9px;
          border: 1px solid #e5e5e5;
          background: #fff;
          color: #404040;
        }
        .mn-logout-cancel:hover:not(:disabled) {
          background: #fafafa;
        }
        .mn-logout-button:disabled,
        .mn-logout-cancel:disabled {
          cursor: not-allowed;
          opacity: .6;
        }
        .mn-logout-button:focus-visible,
        .mn-logout-cancel:focus-visible {
          outline: 2px solid #525252;
          outline-offset: 3px;
        }
        .mn-logout-error {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin: 0 0 16px;
          padding: 12px;
          border: 1px solid #fecaca;
          border-radius: 8px;
          background: #fef2f2;
          color: #991b1b;
          font-size: 13px;
          line-height: 1.6;
        }
        .mn-logout-error svg {
          flex: 0 0 auto;
          margin-top: 1px;
        }
        .mn-logout-error p {
          margin: 0;
          overflow-wrap: anywhere;
        }
        .mn-logout-note {
          margin: 20px 0 0;
          color: #737373;
          font-size: 11px;
          line-height: 1.65;
        }
        .mn-logout-spinner {
          animation: mn-logout-spin 1s linear infinite;
        }
        @keyframes mn-logout-spin {
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .mn-logout-spinner { animation: none; }
        }
        @media (max-width: 480px) {
          .mn-logout-card { padding: 23px; }
        }
      `}</style>
    </main>
  );
}