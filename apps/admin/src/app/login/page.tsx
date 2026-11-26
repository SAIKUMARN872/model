
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  LockKeyhole,
  LoaderCircle,
  Mail,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";

type LoginMethod = "email" | "phone";
type LoginStep = "login" | "otp";

export default function LoginPage() {
  const router = useRouter();

  const [method, setMethod] = useState<LoginMethod>("email");
  const [step, setStep] = useState<LoginStep>("login");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const destination = method === "email" ? email.trim() : phone.trim();

  function generateOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  function selectMethod(nextMethod: LoginMethod) {
    setMethod(nextMethod);
    setStep("login");
    setOtp("");
    setDemoOtp("");
    setError("");
    setNotice("");
  }

  function startOAuth(provider: "google" | "apple") {
    setError(
      `${provider === "google" ? "Google" : "Apple"} sign-in requires OAuth configuration. It is not connected in this frontend demo.`
    );
  }

  function sendDemoOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (method === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError("Please enter a valid email address.");
        return;
      }
    } else {
      const digits = phone.replace(/\D/g, "");

      if (digits.length < 10 || digits.length > 15) {
        setError("Please enter a valid phone number.");
        return;
      }
    }

    setLoading(true);

    window.setTimeout(() => {
      const generatedOtp = generateOtp();

      setDemoOtp(generatedOtp);
      setOtp("");
      setStep("otp");
      setNotice(
        `Demo verification code generated for ${destination}. No email or SMS has been sent.`
      );
      setLoading(false);
    }, 500);
  }

  function verifyDemoOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    if (otp !== demoOtp) {
      setError("Incorrect code. Please check the demo code and try again.");
      return;
    }

    setLoading(true);

    const demoUser = {
      email: method === "email" ? email.trim() : "",
      phone: method === "phone" ? phone.trim() : "",
      name: method === "email" ? email.trim().split("@")[0] : phone.trim(),
      loginMethod: method,
      demo: true,
    };

    localStorage.setItem("modelnow-demo-user", JSON.stringify(demoUser));

    window.setTimeout(() => {
      router.push("/dashboard");
    }, 400);
  }

  function resendDemoOtp() {
    setError("");
    setNotice("");

    setDemoOtp(generateOtp());
    setOtp("");
    setNotice("New demo code generated. No email or SMS has been sent.");
  }

  function backToLogin() {
    setStep("login");
    setOtp("");
    setError("");
    setNotice("");
  }

  return (
    <main className="login-page">
      <div className="background-glow background-glow-one" />
      <div className="background-glow background-glow-two" />

      <section className="login-card">
        <div className="brand">
          <div className="brand-icon">
            <Sparkles size={34} strokeWidth={1.8} />
          </div>

          <h1>ModelNow</h1>

          <p>
            {step === "login"
              ? "Log in or sign up for free"
              : "Securely verify your account"}
          </p>
        </div>

        {step === "login" ? (
          <>
            <div className="social-options">
              <button
                type="button"
                className="social-button"
                onClick={() => startOAuth("google")}
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 48 48"
                  aria-label="Google"
                >
                  <path
                    fill="#4285F4"
                    d="M43.6 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11c-.5 2.7-2.1 5-4.5 6.5v5.5h7.3c4.3-4 6.8-9.7 6.8-16.5Z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 44c5.9 0 10.8-2 14.4-5.4l-7.3-5.5c-2 1.3-4.4 2.1-7.1 2.1-5.5 0-10.2-3.7-11.9-8.7H4.6v5.7C8.2 39.2 15.5 44 24 44Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M12.1 26.5a12 12 0 0 1 0-9V11.8H4.6a20 20 0 0 0 0 20.4l7.5-5.7Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M24 8.8c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 2.2 29.9 0 24 0 15.5 0 8.2 4.8 4.6 11.8l7.5 5.7C13.8 12.5 18.5 8.8 24 8.8Z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                className="social-button"
                onClick={() => startOAuth("apple")}
              >
                <svg
                  width="19"
                  height="22"
                  viewBox="0 0 24 28"
                  fill="currentColor"
                  aria-label="Apple"
                >
                  <path d="M19.8 14.8c0-3.3 2.7-4.9 2.8-5-1.5-2.2-3.9-2.5-4.8-2.6-2-.2-3.9 1.2-4.9 1.2-1 0-2.5-1.2-4.1-1.2-2.1 0-4.1 1.2-5.2 3.1-2.2 3.8-.6 9.4 1.6 12.5 1.1 1.5 2.3 3.2 3.9 3.1 1.6-.1 2.2-1 4.1-1s2.4 1 4.1.9c1.7 0 2.8-1.5 3.8-3.1 1.2-1.7 1.7-3.4 1.7-3.5-.1 0-3-1.2-3-4.4ZM16.5 5.1c.9-1.1 1.5-2.6 1.3-4.1-1.3.1-2.9.9-3.8 2-.8.9-1.5 2.5-1.3 3.9 1.5.1 3-.7 3.8-1.8Z" />
                </svg>
                <span>Continue with Apple</span>
              </button>

              <button
                type="button"
                className="social-button"
                onClick={() => selectMethod("phone")}
              >
                <Smartphone size={19} />
                <span>Continue with phone</span>
              </button>
            </div>

            <div className="divider">
              <span>OR CONTINUE WITH {method === "email" ? "EMAIL" : "PHONE"}</span>
            </div>

            <form onSubmit={sendDemoOtp}>
              {method === "email" ? (
                <div className="field">
                  <label htmlFor="email">Email address</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="field">
                  <label htmlFor="phone">Phone number</label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    required
                  />
                </div>
              )}

              {error && <div className="error-message">{error}</div>}

              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading && <LoaderCircle size={18} className="spinner" />}
                {loading
                  ? "Preparing demo code..."
                  : `Continue with ${method}`}
              </button>
            </form>

            <button
              type="button"
              className="method-switch"
              onClick={() =>
                selectMethod(method === "email" ? "phone" : "email")
              }
            >
              {method === "email" ? (
                <>
                  <Smartphone size={15} />
                  Use phone instead
                </>
              ) : (
                <>
                  <Mail size={15} />
                  Use email instead
                </>
              )}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="back-button"
              onClick={backToLogin}
            >
              <ArrowLeft size={16} />
              Back to login
            </button>

            <h2>Verify your {method}</h2>

            <p className="verify-description">
              Enter the 6-digit verification code for{" "}
              <strong>{destination}</strong>
            </p>

            {notice && <div className="notice-message">{notice}</div>}

            <div className="demo-code">
              <div className="demo-code-label">
                Your frontend demo OTP
              </div>

              <div className="demo-code-value">{demoOtp}</div>

              <div className="demo-code-warning">
                Testing only. This code was generated in your browser.
                It was not sent to your email or phone.
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={verifyDemoOtp}>
              <div className="field">
                <label htmlFor="otp">Verification code</label>

                <input
                  id="otp"
                  className="otp-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading ? (
                  <LoaderCircle size={18} className="spinner" />
                ) : (
                  <CheckCircle2 size={18} />
                )}
                {loading ? "Signing in..." : "Verify and continue"}
              </button>
            </form>

            <button
              type="button"
              className="method-switch"
              onClick={resendDemoOtp}
            >
              Resend demo code
            </button>
          </>
        )}

        <div className="secure-note">
          {step === "login" ? (
            <LockKeyhole size={15} />
          ) : (
            <ShieldCheck size={15} />
          )}
          <span>
            {step === "login"
              ? "Secure access to your workspace"
              : "Frontend demonstration only"}
          </span>
        </div>

        <p className="legal">
          By continuing, your use of ModelNow is subject to applicable
          policies and terms.
        </p>
      </section>

      <style jsx>{`
        .login-page {
          position: relative;
          min-height: 100vh;
          min-height: 100dvh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          overflow: hidden;
          background: #ffffff;
          color: #111827;
          font-family: Arial, Helvetica, sans-serif;
        }

        .background-glow {
          position: fixed;
          width: 450px;
          height: 450px;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          z-index: 0;
        }

        .background-glow-one {
          top: -230px;
          left: -160px;
          background: rgba(14, 165, 233, 0.09);
        }

        .background-glow-two {
          right: -180px;
          bottom: -230px;
          background: rgba(99, 102, 241, 0.09);
        }

        .login-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 460px;
          padding: 38px 36px;
          border: 1px solid #eceef2;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 18px 60px rgba(15, 23, 42, 0.07);
        }

        .brand {
          text-align: center;
          margin-bottom: 30px;
        }

        .brand-icon {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 15px;
          color: #111827;
        }

        .brand h1 {
          margin: 0;
          font-size: 29px;
          line-height: 1.3;
          font-weight: 750;
          letter-spacing: -0.8px;
        }

        .brand p {
          margin: 9px 0 0;
          color: #737b89;
          font-size: 14px;
        }

        .social-options {
          display: flex;
          flex-direction: column;
          gap: 11px;
        }

        button,
        input {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .social-button {
          width: 100%;
          min-height: 51px;
          display: grid;
          grid-template-columns: 28px 1fr 28px;
          align-items: center;
          gap: 8px;
          padding: 12px 15px;
          border: 1px solid #e1e4e9;
          border-radius: 9px;
          background: #ffffff;
          color: #171717;
          font-size: 14px;
          font-weight: 600;
          transition: background 0.18s ease, border-color 0.18s ease;
        }

        .social-button:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .social-button svg {
          justify-self: center;
        }

        .social-button span {
          text-align: center;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 25px 0;
          color: #9299a7;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.8px;
          white-space: nowrap;
        }

        .divider::before,
        .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #e9ebef;
        }

        .field {
          margin-bottom: 16px;
          text-align: left;
        }

        .field label {
          display: block;
          margin-bottom: 9px;
          color: #273248;
          font-size: 13px;
          font-weight: 650;
        }

        .field input {
          width: 100%;
          min-height: 51px;
          padding: 0 15px;
          border: 1px solid #dedfe3;
          border-radius: 9px;
          background: #ffffff;
          color: #161616;
          outline: none;
          font-size: 14px;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }

        .field input::placeholder {
          color: #a1a6b0;
        }

        .field input:focus {
          border-color: #1477e8;
          box-shadow: 0 0 0 3px rgba(20, 119, 232, 0.08);
        }

        .primary-button {
          width: 100%;
          min-height: 53px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 14px 18px;
          border: none;
          border-radius: 10px;
          background: #0878e8;
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
          transition: background 0.18s ease;
        }

        .primary-button:hover {
          background: #0669ce;
        }

        .primary-button:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .method-switch {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 17px;
          padding: 8px;
          border: none;
          background: transparent;
          color: #0878e8;
          font-size: 13px;
          font-weight: 600;
        }

        .method-switch:hover {
          color: #055bb5;
        }

        .secure-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 25px;
          color: #9299a7;
          font-size: 12px;
        }

        .legal {
          max-width: 390px;
          margin: 20px auto 0;
          color: #969ba5;
          font-size: 11px;
          line-height: 1.8;
          text-align: center;
        }

        .error-message,
        .notice-message {
          margin: 0 0 15px;
          padding: 11px 13px;
          border-radius: 8px;
          font-size: 12px;
          line-height: 1.6;
          text-align: left;
          overflow-wrap: anywhere;
        }

        .error-message {
          border: 1px solid #f3cccc;
          background: #fff5f5;
          color: #b42318;
        }

        .notice-message {
          border: 1px solid #dce6ff;
          background: #f2f6ff;
          color: #36558c;
        }

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin: 0 0 22px;
          padding: 6px 0;
          border: none;
          background: transparent;
          color: #6b7280;
          font-size: 13px;
          font-weight: 600;
        }

        .back-button:hover {
          color: #0878e8;
        }

        .login-card h2 {
          margin: 0 0 10px;
          font-size: 23px;
          text-align: center;
        }

        .verify-description {
          margin: 0 0 22px;
          color: #737b89;
          font-size: 13px;
          line-height: 1.7;
          text-align: center;
          overflow-wrap: anywhere;
        }

        .verify-description strong {
          color: #333333;
        }

        .demo-code {
          margin-bottom: 18px;
          padding: 15px;
          border: 1px dashed #b7c9fa;
          border-radius: 10px;
          background: #f7f9ff;
          text-align: center;
        }

        .demo-code-label {
          margin-bottom: 8px;
          color: #65718a;
          font-size: 11px;
        }

        .demo-code-value {
          color: #155ed0;
          font-size: 27px;
          font-weight: 750;
          letter-spacing: 8px;
        }

        .demo-code-warning {
          margin-top: 8px;
          color: #8b94a5;
          font-size: 10px;
          line-height: 1.5;
        }

        .otp-input {
          text-align: center;
          letter-spacing: 12px;
          font-size: 22px !important;
          font-weight: 700;
          padding-left: 25px !important;
        }

        @media (max-width: 520px) {
          .login-page {
            padding: 20px 14px;
          }

          .login-card {
            padding: 30px 22px;
            border-radius: 14px;
          }

          .brand h1 {
            font-size: 26px;
          }
        }

        @media (max-height: 700px) {
          .login-page {
            align-items: flex-start;
          }
        }
      `}</style>
    </main>
  );
}
