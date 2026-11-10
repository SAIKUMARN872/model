import { useState } from "react";
import { api } from "../../lib/api.js";
import { consoleConfig } from "../../config/console.js";

const styles = `
  * { box-sizing: border-box; }
  .mn-login {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 36px 20px;
    background:
      radial-gradient(ellipse at 8% 8%, rgba(191,219,254,.55), transparent 38%),
      radial-gradient(ellipse at 94% 92%, rgba(219,234,254,.85), transparent 42%),
      linear-gradient(145deg, #ffffff 0%, #f8fbff 48%, #eff6ff 100%);
    color: #111827;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .mn-shell { width: 100%; max-width: 440px; }

.mn-login-logo { display: block; width: 110px; max-height: 64px; object-fit: contain; margin: 0 auto 18px; }
.mn-title { margin: 0; text-align: center; font-size: 27px; line-height: 1.25; letter-spacing: -1px; font-weight: 760; }
  .mn-subtitle { margin: 10px 0 26px; text-align: center; color: #64748b; font-size: 14px; line-height: 1.6; }
  .mn-provider {
    position: relative; width: 100%; min-height: 48px; display: flex; align-items: center;
    justify-content: center; gap: 11px; padding: 12px 16px; margin-top: 11px;
    border: 1px solid #dbe3ee; border-radius: 11px; background: #fff;
    color: #1f2937; font: inherit; font-size: 14px; font-weight: 620;
    cursor: pointer; transition: border-color .15s, background .15s, box-shadow .15s;
  }
  .mn-provider:hover { background: #f8fbff; border-color: #93b4f7; }
  .mn-provider:focus-visible, .mn-email:focus-visible, .mn-submit:focus-visible {
    outline: 3px solid rgba(59,130,246,.3); outline-offset: 2px;
  }
  .mn-provider:disabled, .mn-submit:disabled { opacity: .65; cursor: not-allowed; }
  .mn-provider-icon { position: absolute; left: 15px; width: 19px; height: 19px; display: grid; place-items: center; }
  .mn-divider { display: flex; align-items: center; gap: 13px; margin: 25px 0 21px; color: #94a3b8; font-size: 10px; font-weight: 750; letter-spacing: 1.2px; white-space: nowrap; }
  .mn-divider::before, .mn-divider::after { content: ""; height: 1px; flex: 1; background: #e8edf4; }
  .mn-label { display: block; margin-bottom: 8px; color: #334155; font-size: 13px; font-weight: 650; }
  .mn-email {
    width: 100%; height: 49px; border: 1px solid #cbd5e1; border-radius: 10px;
    padding: 0 14px; color: #0f172a; background: #fff; font: inherit; font-size: 14px;
    transition: border-color .15s, box-shadow .15s;
  }
  .mn-email::placeholder { color: #94a3b8; }
  .mn-email:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.12); }
  .mn-submit {
    width: 100%; min-height: 49px; margin-top: 14px; border: 0; border-radius: 10px;
    background: #2563eb; color: #fff; font: inherit; font-size: 14px; font-weight: 700;
    cursor: pointer; box-shadow: 0 5px 12px rgba(37,99,235,.17);
    transition: background .15s, transform .15s;
  }
  .mn-submit:hover { background: #1d4ed8; }
  .mn-submit:active { transform: translateY(1px); }
  .mn-notice { margin-top: 15px; padding: 11px 12px; border: 1px solid #bfdbfe; border-radius: 9px; background: #eff6ff; color: #1e40af; font-size: 12px; line-height: 1.55; }
  .mn-notice-error { border-color: #fecaca; background: #fef2f2; color: #991b1b; }
  .mn-security { display: flex; align-items: center; justify-content: center; gap: 7px; margin: 22px 0 0; color: #64748b; font-size: 12px; }
  .mn-footer { margin: 22px 8px 0; color: #64748b; font-size: 11px; line-height: 1.7; text-align: center; }
  .mn-footer strong { color: #475569; font-weight: 650; }
  @media (max-width: 480px) {
    .mn-login { padding: 22px 14px; align-items: flex-start; }
    .mn-shell { margin: auto 0; }

.mn-title { font-size: 24px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .mn-provider, .mn-submit, .mn-email { transition: none; }
  }
`;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width="19" height="19" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 5)"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.25 5.48-4.73 7.18l7.64 5.93c4.46-4.12 7.13-10.2 7.13-17.58Z"/>
      <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a24 24 0 0 0 0 21.56l7.98-6.19Z" transform="translate(0 5)"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.94-2.13 15.92-5.87l-7.64-5.93c-2.13 1.43-4.85 2.28-8.28 2.28-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" transform="translate(0 -1)"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true">
      <path d="M16.37 12.2c.02 2.17 1.9 2.9 1.92 2.91-.02.05-.3 1.04-.98 2.06-.59.88-1.2 1.76-2.16 1.78-.94.02-1.24-.57-2.32-.57-1.08 0-1.42.55-2.31.59-.93.03-1.64-.95-2.24-1.83-1.22-1.78-2.15-5.03-.9-7.23a3.48 3.48 0 0 1 2.94-1.79c.92-.02 1.79.62 2.35.62.56 0 1.61-.77 2.72-.66.47.02 1.8.19 2.65 1.43-.07.04-1.58.92-1.57 2.69ZM14.58 6.29a3.43 3.43 0 0 0 .8-2.46 3.49 3.49 0 0 0-2.25 1.16 3.2 3.2 0 0 0-.82 2.37 2.88 2.88 0 0 0 2.27-1.07Z"/>
    </svg>
  );
}

function SsoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2"/>
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>
    </svg>
  );
}

export default function ConsoleLoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("info");

  function authPath(path) {
    return `${consoleConfig.apiBaseUrl}/api/v1/auth0${path}`;
  }

  function startOAuthLogin(provider, connection) {
    setNotice("");
    const url = new URL(authPath("/oauth/start"), window.location.origin);
    url.searchParams.set("provider", provider);
    if (connection) url.searchParams.set("connection", connection);
    window.location.assign(url.toString());
  }

  async function submitEmail(event) {
    event.preventDefault();
    if (busy) return;

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setNoticeType("error");
      setNotice("Enter a valid email address.");
      return;
    }

    setBusy(true);
    setNotice("");
    try {
      if (!otpRequested) {
        await api.post("/api/v1/auth0/email/request", { email: normalizedEmail });
        setOtpRequested(true);
        setNoticeType("info");
        setNotice("If this address is eligible, a verification code will be sent. Check your email.");
      } else {
        if (!/^\d{6,10}$/.test(otp.trim())) {
          setNoticeType("error");
          setNotice("Enter the verification code from your email.");
          return;
        }

        await api.post("/api/v1/auth0/email/verify", {
          email: normalizedEmail,
          otp: otp.trim()
        });
        setNoticeType("info");
        setNotice("Verification accepted. Checking your ModelNow session...");
        window.location.assign("/");
      }
    } catch (error) {
      setNoticeType("error");
      setNotice(
        error?.message ||
        "Sign-in could not be completed. Check the server configuration and try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mn-login">
      <style>{styles}</style>
      <div className="mn-shell">
<section aria-labelledby="mn-login-title">
          <img src="/modelnow-log.jpeg" alt="ModelNow logo" className="mn-login-logo" />
          <h1 className="mn-title" id="mn-login-title">API Platform</h1>
          <p className="mn-subtitle">Login or sign up for free</p>

          <div aria-label="Sign-in options">
            <button
              className="mn-provider"
              type="button"
              onClick={() => startOAuthLogin("google")}
            >
              <span className="mn-provider-icon"><GoogleIcon /></span>
              Continue with Google
            </button>

            <button
              className="mn-provider"
              type="button"
              onClick={() => startOAuthLogin("apple")}
            >
              <span className="mn-provider-icon"><AppleIcon /></span>
              Continue with Apple
            </button>

            <button
              className="mn-provider"
              type="button"
              onClick={() => {
                const connection = window.prompt("Enter your configured enterprise SSO connection name");
                if (connection && connection.trim()) startOAuthLogin("enterprise", connection.trim());
              }}
            >
              <span className="mn-provider-icon"><SsoIcon /></span>
              Single sign-on (SSO)
            </button>
          </div>

          <div className="mn-divider">OR CONTINUE WITH EMAIL</div>

          <form onSubmit={submitEmail} noValidate>
            <label className="mn-label" htmlFor="mn-email">Email</label>
            <input
              className="mn-email"
              id="mn-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (noticeType === "error") setNotice("");
              }}
              maxLength={254}
              required
              aria-describedby={notice ? "mn-login-notice" : undefined}
            />
            {otpRequested && (
              <>
                <label className="mn-label" htmlFor="mn-otp">Verification code</label>
                <input
                  className="mn-email"
                  id="mn-otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={10}
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                  required
                />
              </>
            )}            <button className="mn-submit" type="submit" disabled={busy}>
              {busy ? "Please wait..." : otpRequested ? "Verify code" : "Send verification code"}
            </button>
          </form>

          {notice && (
            <div
              className={`mn-notice${noticeType === "error" ? " mn-notice-error" : ""}`}
              id="mn-login-notice"
              role={noticeType === "error" ? "alert" : "status"}
              aria-live="polite"
            >
              {notice}
            </div>
          )}

          <div className="mn-security">
            <SsoIcon />
            <span>Secure access to your workspace</span>
          </div>
        </section>

        <footer className="mn-footer">

          By continuing, use of the platform is subject to your organizationÃ¢â‚¬â„¢s
          applicable policies and terms.
        </footer>
      </div>
    </main>
  );
}