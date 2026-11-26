
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { clearAccessToken } from "../../auth/tokens.jsx";

export default function LogoutPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  function signOut() {
    if (busy) return;

    setBusy(true);

    // Clear the locally stored login token.
    clearAccessToken();

    // Redirect to the sign-in page.
    router.replace("/login");
  }

  return (
    <main className="mn-logout-page">
      <section className="mn-logout-card">
        <div className="mn-logout-icon">
          <ShieldCheck size={25} />
        </div>

        <p className="mn-logout-eyebrow">MODELNOW SECURITY</p>

        <h1>Sign out</h1>

        <p className="mn-logout-description">
          Are you sure you want to sign out of your ModelNow account?
        </p>

        <button
          type="button"
          className="mn-logout-button"
          onClick={signOut}
          disabled={busy}
        >
          {busy ? (
            <LoaderCircle
              size={17}
              className="mn-logout-spinner"
            />
          ) : (
            <LogOut size={17} />
          )}
          {busy ? "Signing out..." : "Sign out"}
        </button>

        <button
          type="button"
          className="mn-logout-cancel"
          onClick={() => router.replace("/")}
          disabled={busy}
        >
          Cancel
        </button>
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

        .mn-logout-spinner {
          animation: mn-logout-spin 1s linear infinite;
        }

        @keyframes mn-logout-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .mn-logout-spinner {
            animation: none;
          }
        }

        @media (max-width: 480px) {
          .mn-logout-card {
            padding: 23px;
          }
        }
      `}</style>
    </main>
  );
}
