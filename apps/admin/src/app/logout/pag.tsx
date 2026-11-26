"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

export default function LogoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleLogout() {
    setLoading(true);

    try {
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("currentUser");
      sessionStorage.clear();

      router.replace("/login");
    } catch {
      setLoading(false);
    }
  }

  return (
    <main className="logout-page">
      <style jsx>{`
        .logout-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: #fff;
          color: #0d0d0d;
          font-family: Arial, Helvetica, sans-serif;
        }

        .logout-container {
          width: 100%;
          max-width: 384px;
          text-align: center;
        }

        h1 {
          margin: 0 0 18px;
          font-size: 29px;
          line-height: 1.3;
          font-weight: 400;
          letter-spacing: -0.8px;
        }

        .account-card {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 15px 12px;
          margin-bottom: 20px;
          border: 1px solid #dedede;
          border-radius: 16px;
          text-align: left;
        }

        .avatar {
          width: 33px;
          height: 33px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #34485d;
          color: #fff;
          font-size: 12px;
          font-weight: 600;
        }

        .account-info {
          min-width: 0;
        }

        .account-name {
          margin-bottom: 4px;
          color: #111;
          font-size: 14px;
          font-weight: 600;
        }

        .account-email {
          color: #666;
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .description {
          margin: 0 0 20px;
          color: #666;
          font-size: 13px;
          line-height: 1.6;
        }

        .actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        button {
          width: 100%;
          min-height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 20px;
          border-radius: 28px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .logout-button {
          color: #fff;
          background: #0d0d0d;
          border: 1px solid #0d0d0d;
        }

        .logout-button:hover {
          background: #292929;
        }

        .cancel-button {
          color: #0d0d0d;
          background: #fff;
          border: 1px solid #dedede;
        }

        .cancel-button:hover {
          background: #f7f7f7;
        }

        button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .logout-container {
            max-width: 100%;
          }

          h1 {
            font-size: 26px;
          }
        }
      `}</style>

      <section className="logout-container">
        <h1>Log out of ModelNow?</h1>

        <div className="account-card">
          <div className="avatar">MN</div>

          <div className="account-info">
            <div className="account-name">ModelNow Admin</div>
            <div className="account-email">
              Signed in to your ModelNow account
            </div>
          </div>
        </div>

        <p className="description">
          You’ll need to log in again to access your chats
        </p>

        <div className="actions">
          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
            disabled={loading}
          >
            {loading && <LoaderCircle size={17} />}
            {loading ? "Logging out..." : "Log out"}
          </button>

          <button
            type="button"
            className="cancel-button"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </section>
    </main>
  );
}