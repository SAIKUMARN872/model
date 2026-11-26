
"use client";

import { useState, type FormEvent } from "react";

const styles = `
  * { box-sizing: border-box; }

  .mn-login {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 100px 20px 36px;
    position: relative;
    background:
      radial-gradient(ellipse at 8% 8%, rgba(191,219,254,.55), transparent 38%),
      radial-gradient(ellipse at 94% 92%, rgba(219,234,254,.85), transparent 42%),
      linear-gradient(145deg, #ffffff 0%, #f8fbff 48%, #eff6ff 100%);
    color: #111827;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }

  .mn-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    min-height: 72px;
    padding: 0 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255,255,255,.8);
    border-bottom: 1px solid #e8edf4;
    backdrop-filter: blur(12px);
  }

  .mn-header-left,
  .mn-header-right {
    display: flex;
    align-items: center;
    gap: 28px;
  }

  .mn-brand {
    color: #111827;
    font-size: 16px;
    font-weight: 850;
    white-space: nowrap;
    letter-spacing: -.45px;
  }

  .mn-brand-button {
    border: 0;
    padding: 0;
    margin: 0;
    background: transparent;
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    letter-spacing: inherit;
    text-align: left;
    cursor: pointer;
    transition: color .2s ease;
  }

  .mn-brand-button:hover,
  .mn-nav-button:hover {
    color: #2563eb;
  }

  .mn-nav-button {
    border: 0;
    background: transparent;
    color: #475569;
    font: inherit;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    transition: color .2s ease;
  }

  .mn-shell {
    width: 100%;
    max-width: 440px;
  }

  .mn-login-logo {
    display: block;
    width: 110px;
    max-height: 64px;
    object-fit: contain;
    margin: 0 auto 18px;
  }

  .mn-title {
    margin: 0;
    text-align: center;
    font-size: 27px;
    line-height: 1.25;
    letter-spacing: -1px;
    font-weight: 760;
  }

  .mn-subtitle {
    margin: 10px 0 26px;
    text-align: center;
    color: #64748b;
    font-size: 14px;
  }

  .mn-provider {
    position: relative;
    width: 100%;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 16px;
    margin-top: 11px;
    border: 1px solid #dbe3ee;
    border-radius: 11px;
    background: #fff;
    color: #1f2937;
    font: inherit;
    font-size: 14px;
    font-weight: 620;
    cursor: pointer;
  }

  .mn-provider:hover {
    background: #f8fbff;
    border-color: #93b4f7;
  }

  .mn-provider-icon {
    position: absolute;
    left: 15px;
    width: 19px;
    height: 19px;
    display: grid;
    place-items: center;
  }

  .mn-divider {
    display: flex;
    align-items: center;
    gap: 13px;
    margin: 25px 0 21px;
    color: #94a3b8;
    font-size: 10px;
    font-weight: 750;
    letter-spacing: 1.2px;
    white-space: nowrap;
  }

  .mn-divider::before,
  .mn-divider::after {
    content: "";
    height: 1px;
    flex: 1;
    background: #e8edf4;
  }

  .mn-label {
    display: block;
    margin-bottom: 8px;
    color: #334155;
    font-size: 13px;
    font-weight: 650;
  }

  .mn-email {
    width: 100%;
    height: 49px;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    padding: 0 14px;
    color: #0f172a;
    background: #fff;
    font: inherit;
    font-size: 14px;
    margin-bottom: 14px;
  }

  .mn-email:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59,130,246,.12);
  }

  .mn-submit {
    width: 100%;
    min-height: 49px;
    margin-top: 4px;
    border: 0;
    border-radius: 10px;
    background: #2563eb;
    color: #fff;
    font: inherit;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 5px 12px rgba(37,99,235,.17);
  }

  .mn-submit:hover {
    background: #1d4ed8;
  }

  .mn-submit:disabled {
    opacity: .65;
    cursor: not-allowed;
  }

  .mn-notice {
    margin-top: 15px;
    padding: 12px;
    border: 1px solid #bfdbfe;
    border-radius: 9px;
    background: #eff6ff;
    color: #1e40af;
    font-size: 12px;
    line-height: 1.6;
  }

  .mn-notice-error {
    border-color: #fecaca;
    background: #fef2f2;
    color: #991b1b;
  }

  .mn-demo-code {
    display: block;
    margin-top: 8px;
    font-size: 25px;
    font-weight: 800;
    letter-spacing: 7px;
    color: #1d4ed8;
    text-align: center;
  }

  .mn-demo-warning {
    display: block;
    margin-top: 5px;
    font-size: 11px;
    color: #64748b;
    text-align: center;
  }

  .mn-secondary {
    border: 0;
    background: transparent;
    color: #2563eb;
    font: inherit;
    font-size: 12px;
    cursor: pointer;
    padding: 10px 0;
  }

  .mn-security {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    margin: 22px 0 0;
    color: #64748b;
    font-size: 12px;
  }

  .mn-footer {
    margin: 22px 8px 0;
    color: #64748b;
    font-size: 11px;
    line-height: 1.7;
    text-align: center;
  }

  @media(max-width: 600px) {
    .mn-header {
      padding: 0 16px;
    }

    .mn-header-left,
    .mn-header-right {
      gap: 12px;
    }

    .mn-brand {
      font-size: 14px;
    }

    .mn-nav-button {
      font-size: 11px;
    }
  }

  @media(max-width: 480px) {
    .mn-login {
      padding: 90px 14px 22px;
    }

    .mn-title {
      font-size: 24px;
    }
  }
`;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width="19" height="19" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 5)" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.25 5.48-4.73 7.18l7.64 5.93c4.46-4.127.13-10.2 7.13-17.58Z" />
      <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a24 24 0 0 0 0 21.56l7.98-6.19Z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.94-2.13 15.92-5.87l-7.64-5.93c-2.13 1.43-4.85 2.28-8.28 2.28-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true">
      <path d="M16.37 12.2c.02 2.17 1.9 2.9 1.92 2.91-.02.05-.3 1.04-.98 2.06-.59.88-1.2 1.76-2.16 1.78-.94.02-1.24-.57-2.32-.57-1.08 0-1.42.55-2.31.59-.93.03-1.64-.95-2.24-1.83-1.22-1.78-2.15-5.03-.9-7.23a3.48 3.48 0 0 1 2.94-1.79c.92-.02 1.79.62 2.35.62.56 0 1.61-.77 2.72-.66.47.02 1.8.19 2.65 1.43-.07.04-1.58.92-1.57 2.69Z" />
    </svg>
  );
}

function SsoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
    </svg>
  );
}

function generateOtp() {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return String(values[0] % 1000000).padStart(6, "0");
}

export default function ConsoleLoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState<"info" | "error">("info");
  const [busy, setBusy] = useState(false);

  function showDemoProviderMessage(provider: string) {
    setNoticeType("info");
    setNotice(
      `${provider} sign-in will be connected when the authentication backend is integrated.`
    );
  }

  // Keep visitors on the login page when they click the top navigation.
  function openProtectedPage(_path: string) {
    setNoticeType("error");
    setNotice(
      "Please login first to access ModelNow Console, Documentation, and API."
    );
  }

  function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setNoticeType("error");
      setNotice("Enter a valid email address.");
      return;
    }

    setNotice("");

    if (!otpRequested) {
      const code = generateOtp();
      setDemoOtp(code);
      setOtp("");
      setOtpRequested(true);
      setNoticeType("info");
      setNotice(
        "Your demo verification code has been generated. Use this code to continue."
      );
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setNoticeType("error");
      setNotice("Enter the six-digit verification code.");
      return;
    }

    if (otp.trim() !== demoOtp) {
      setNoticeType("error");
      setNotice("Incorrect verification code. Please try again.");
      return;
    }

    setBusy(true);
    sessionStorage.setItem("modelnow-demo-authenticated", "true");
    setNoticeType("info");
    setNotice("Demo verification successful. Opening your dashboard...");

    window.location.assign("/dashboard");
  }

  function resendOtp() {
    const code = generateOtp();
    setDemoOtp(code);
    setOtp("");
    setNoticeType("info");
    setNotice("A new demo verification code has been generated.");
  }

  function changeEmail() {
    setOtpRequested(false);
    setDemoOtp("");
    setOtp("");
    setNotice("");
  }

  return (
    <main className="mn-login">
      <style>{styles}</style>

      <header className="mn-header">
        <div className="mn-header-left">
          <button
            className="mn-brand mn-brand-button"
            type="button"
            onClick={() => openProtectedPage("/dashboard")}
          >
            ModelNow Console
          </button>
        </div>

        <div className="mn-header-right">
          <button
            className="mn-nav-button"
            type="button"
            onClick={() => openProtectedPage("/docs/batch-api")}
          >
            Documentation
          </button>

          <button
            className="mn-nav-button"
            type="button"
            onClick={() => openProtectedPage("/api-keys")}
          >
            API
          </button>
        </div>
      </header>

      <div className="mn-shell">
        <section aria-labelledby="mn-login-title">
          <img
            src="/modelnow-log.jpeg"
            alt="ModelNow logo"
            className="mn-login-logo"
          />

          <h1 className="mn-title" id="mn-login-title">
            API Platform
          </h1>

          <p className="mn-subtitle">Login or sign up for free</p>

          <div aria-label="Sign-in options">
            <button
              className="mn-provider"
              type="button"
              onClick={() => showDemoProviderMessage("Google")}
            >
              <span className="mn-provider-icon">
                <GoogleIcon />
              </span>
              Continue with Google
            </button>

            <button
              className="mn-provider"
              type="button"
              onClick={() => showDemoProviderMessage("Apple")}
            >
              <span className="mn-provider-icon">
                <AppleIcon />
              </span>
              Continue with Apple
            </button>

            <button
              className="mn-provider"
              type="button"
              onClick={() => showDemoProviderMessage("Enterprise SSO")}
            >
              <span className="mn-provider-icon">
                <SsoIcon />
              </span>
              Single sign-on (SSO)
            </button>
          </div>

          <div className="mn-divider">OR CONTINUE WITH EMAIL</div>

          <form onSubmit={submitEmail} noValidate>
            <label className="mn-label" htmlFor="mn-email">
              Email
            </label>

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
                setNotice("");
              }}
              maxLength={254}
              required
              disabled={otpRequested}
            />

            {otpRequested && (
              <>
                <label className="mn-label" htmlFor="mn-otp">
                  Verification code
                </label>

                <input
                  className="mn-email"
                  id="mn-otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  value={otp}
                  onChange={(event) => {
                    setOtp(
                      event.target.value.replace(/\D/g, "").slice(0, 6)
                    );
                    setNotice("");
                  }}
                  required
                  autoFocus
                />
              </>
            )}

            <button className="mn-submit" type="submit" disabled={busy}>
              {busy
                ? "Please wait..."
                : otpRequested
                  ? "Verify code"
                  : "Send verification code"}
            </button>
          </form>

          {otpRequested && (
            <div>
              <div className="mn-notice">
                Demo OTP:
                <strong className="mn-demo-code">{demoOtp}</strong>
                <span className="mn-demo-warning">
                  Frontend testing only. No email is sent.
                </span>
              </div>

              <button
                className="mn-secondary"
                type="button"
                onClick={resendOtp}
              >
                Resend demo code
              </button>
              {" · "}
              <button
                className="mn-secondary"
                type="button"
                onClick={changeEmail}
              >
                Change email
              </button>
            </div>
          )}

          {notice && (
            <div
              className={`mn-notice${noticeType === "error" ? " mn-notice-error" : ""}`}
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
          By continuing, you agree to the applicable platform policies and terms.
          <br />
          Demo authentication — not for production use.
        </footer>
      </div>
    </main>
  );
}
