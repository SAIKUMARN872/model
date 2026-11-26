
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

export default function PublicHome() {
  return (
    <main className="public-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .public-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          font-family: Arial, Helvetica, sans-serif;
          color: #111827;
          background: linear-gradient(
            135deg,
            #eaf7ff 0%,
            #cfeeff 48%,
            #f5fbff 100%
          );
        }

        .public-navbar {
          height: 76px;
          flex-shrink: 0;
          padding: 0 7%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.45);
          border-bottom: 1px solid rgba(255, 255, 255, 0.65);
        }

        .public-brand {
          color: #111827;
          font-size: 21px;
          font-weight: 700;
          letter-spacing: -0.7px;
          text-decoration: none;
        }

        .public-login-button,
        .public-center-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 12px 23px;
          border-radius: 9px;
          background: #42ace5;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .public-login-button:hover,
        .public-center-button:hover {
          background: #218fcf;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(33, 143, 207, 0.2);
        }

        .public-center {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 50px 20px;
          text-align: center;
        }

        .public-welcome {
          width: 100%;
          max-width: 850px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .public-symbol {
          color: #35a9e8;
          margin-bottom: 28px;
          filter: drop-shadow(0 5px 12px rgba(53, 169, 232, 0.2));
        }

        .public-welcome h1 {
          margin: 0;
          color: #111827;
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 750;
          letter-spacing: -2px;
        }

        .public-welcome h1 span {
          color: #36a8e5;
        }

        .public-welcome p {
          margin: 20px 0 32px;
          color: #526b85;
          font-size: 16px;
          line-height: 1.7;
        }

        .public-footer {
          flex-shrink: 0;
          padding: 19px 20px;
          text-align: center;
          color: #718ba0;
          font-size: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.65);
          background: rgba(255, 255, 255, 0.3);
        }

        @media (max-width: 600px) {
          .public-navbar {
            height: 66px;
            padding: 0 18px;
          }

          .public-welcome h1 {
            font-size: 36px;
            letter-spacing: -1.2px;
          }

          .public-welcome p {
            font-size: 14px;
          }
        }
      `}</style>

      <header className="public-navbar">
        <Link to="/" className="public-brand">
          ModelNow
        </Link>

        <Link to="/login" className="public-login-button">
          Sign in
          <ArrowRight size={15} />
        </Link>
      </header>

      <section className="public-center">
        <div className="public-welcome">
          <Sparkles
            className="public-symbol"
            size={58}
            strokeWidth={1.6}
          />

          <h1>
            Welcome to <span>ModelNow</span>
          </h1>

          <p>
            Your unified workspace for AI models and intelligent applications.
          </p>

          <Link to="/login" className="public-center-button">
            Get started
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="public-footer">
        © {new Date().getFullYear()} ModelNow. All rights reserved.
      </footer>
    </main>
  );
}
