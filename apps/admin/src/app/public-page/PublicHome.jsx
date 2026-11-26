
"use client";

import Link from "next/link";

export default function PublicHome() {
  return (
    <main className="public-home">
      <section className="welcome-section">
        <span className="eyebrow">MODELNOW ADMINISTRATION</span>

        <h1>
          Welcome to ModelNow
          <br />
          <span>Admin Console</span>
        </h1>

        <p>
          Manage your AI platform, organizations, users, models,
          infrastructure and platform operations from one place.
        </p>

        <Link href="/login" className="primary-button">
          Sign in to Admin Console
        </Link>
      </section>

      <footer className="public-footer">
        © {new Date().getFullYear()} ModelNow. All rights reserved.
      </footer>

      <style jsx>{`
        .public-home {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          background:
            radial-gradient(
              ellipse at 15% 15%,
              rgba(186, 230, 253, 0.42),
              transparent 48%
            ),
            radial-gradient(
              ellipse at 85% 80%,
              rgba(219, 234, 254, 0.48),
              transparent 52%
            ),
            linear-gradient(135deg, #f0faff 0%, #ffffff 50%, #f5f9ff 100%);
          color: #0f172a;
          font-family: Arial, sans-serif;
        }

        .welcome-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 24px;
          text-align: center;
        }

        .eyebrow {
          color: #1685d5;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
        }

        h1 {
          margin: 22px 0 16px;
          font-size: clamp(34px, 5vw, 52px);
          line-height: 1.18;
          letter-spacing: -1.5px;
          color: #111827;
        }

        h1 span {
          color: #2588e8;
        }

        .welcome-section p {
          max-width: 570px;
          margin: 0 0 30px;
          color: #64748b;
          font-size: 15px;
          line-height: 1.8;
        }

        .primary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 25px;
          border: 1px solid #2588e8;
          border-radius: 8px;
          background: #2588e8;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition:
            background 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.2s ease;
        }

        .primary-button:hover {
          background: #1475cf;
          box-shadow: 0 6px 18px rgba(37, 136, 232, 0.2);
          transform: translateY(-1px);
        }

        .public-footer {
          padding: 22px;
          border-top: 1px solid rgba(186, 211, 235, 0.55);
          color: #94a3b8;
          font-size: 12px;
          text-align: center;
          background: rgba(255, 255, 255, 0.45);
        }

        @media (max-width: 600px) {
          .welcome-section {
            padding: 60px 20px;
          }

          h1 {
            font-size: 35px;
          }

          .welcome-section p {
            font-size: 14px;
          }
        }
      `}</style>
    </main>
  );
}
