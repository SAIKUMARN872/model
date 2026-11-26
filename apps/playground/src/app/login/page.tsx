
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, Lock, Sparkles, ArrowLeft } from "lucide-react";
import "./login.css";

type LoginStep = "login" | "email-otp" | "phone-otp" | "success";

export default function LoginPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<LoginStep>("login");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const handleEmail = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !email.includes("@")) {
      setMessage("Please enter a valid email address.");
      return;
    }

    setMessage("");
    setOtp("");
    setStep("email-otp");
  };

  const handlePhone = (e: React.FormEvent) => {
    e.preventDefault();

    if (phone.replace(/\D/g, "").length < 10) {
      setMessage("Please enter a valid phone number.");
      return;
    }

    setMessage("");
    setOtp("");
    setStep("phone-otp");
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      setMessage("Please enter a valid 6-digit OTP.");
      return;
    }

    // Demo verification only.
    // Connect real email/SMS OTP verification through the backend later.
    setMessage("");
    setStep("success");
  };

  const handleSocialLogin = (provider: string) => {
    setMessage(
      `${provider} login will be available after backend authentication integration.`
    );
  };

  const handleContinue = () => {
    navigate("/chat", { replace: true });
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-brand-icon">
          <Sparkles size={31} strokeWidth={1.8} />
        </div>

        {step === "login" && (
          <>
            <div className="login-heading">
              <h1>ModelNow</h1>
              <p>Login or sign up for free</p>
            </div>

            <div className="login-options">
              <button
                className="social-login-button"
                onClick={() => handleSocialLogin("Google")}
                type="button"
              >
                <svg className="google-logo" viewBox="0 0 48 48">
                  <path
                    fill="#4285F4"
                    d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11c-.5 2.5-1.9 4.6-4 6v5h6.5c3.8-3.5 6.1-8.6 6.1-14.7z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.5-5c-1.8 1.2-4.1 2-7 2-5.3 0-9.8-3.6-11.4-8.4H5.9v5.2C9.2 39.6 16 44 24 44z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M12.6 27.8a12 12 0 0 1 0-7.6V15H5.9a20 20 0 0 0 0 18z"
                  />
                  <path
                    fill="#EA4335"
                    d="M24 11.8c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 5.8 29.5 4 24 4 16 4 9.2 8.4 5.9 15l6.7 5.2c1.6-4.8 6.1-8.4 11.4-8.4z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                className="social-login-button"
                onClick={() => handleSocialLogin("Apple")}
                type="button"
              >
                <svg className="apple-logo" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M16.37 12.23c.02 2.3 2.02 3.06 2.04 3.07-.02.05-.32 1.1-1.05 2.18-.63.93-1.29 1.85-2.32 1.87-1.01.02-1.34-.6-2.5-.6-1.17 0-1.54.58-2.5.62-1 .04-1.76-1-2.4-1.93-1.3-1.9-2.3-5.36-.96-7.7.67-1.16 1.87-1.9 3.18-1.92.99-.02 1.92.67 2.5.67.58 0 1.7-.83 2.87-.71.49.02 1.86.2 2.74 1.5-.07.04-1.64.96-1.62 2.95ZM14.48 5.94c.52-.63.87-1.5.78-2.37-.75.03-1.66.5-2.2 1.13-.48.55-.9 1.43-.79 2.28.84.07 1.69-.42 2.21-1.04Z"
                  />
                </svg>
                <span>Continue with Apple</span>
              </button>

              <button
                className="social-login-button"
                onClick={() => {
                  setMessage("");
                  setStep("phone-otp");
                }}
                type="button"
              >
                <Phone size={19} strokeWidth={1.8} />
                <span>Continue with phone</span>
              </button>
            </div>

            <div className="login-divider">
              <span />
              <p>OR CONTINUE WITH EMAIL</p>
              <span />
            </div>

            <form className="login-form" onSubmit={handleEmail}>
              <label htmlFor="login-email">Email</label>
              <div className="login-input-wrap">
                <Mail size={18} />
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button className="login-primary-button" type="submit">
                Continue with email
              </button>
            </form>
          </>
        )}

        {step === "phone-otp" && (
          <>
            <div className="login-heading">
              <h1>Continue with phone</h1>
              <p>Enter your phone number to continue</p>
            </div>

            <form className="login-form" onSubmit={handlePhone}>
              <label htmlFor="login-phone">Phone number</label>
              <div className="login-input-wrap">
                <Phone size={18} />
                <input
                  id="login-phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <button className="login-primary-button" type="submit">
                Continue with phone
              </button>
            </form>
          </>
        )}

        {step === "email-otp" && (
          <>
            <div className="login-heading">
              <h1>Verify your email</h1>
              <p>Enter the 6-digit verification code</p>
              <small>{email}</small>
            </div>

            <form className="login-form" onSubmit={handleVerifyOtp}>
              <label htmlFor="email-otp">Verification code</label>
              <input
                id="email-otp"
                className="otp-input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                required
              />

              <button className="login-primary-button" type="submit">
                Verify email
              </button>
            </form>
          </>
        )}

        {step === "success" && (
          <div className="login-success">
            <div className="success-icon">✓</div>
            <h1>You're all set!</h1>
            <p>Your demo verification is complete.</p>
            <button
              className="login-primary-button"
              onClick={handleContinue}
              type="button"
            >
              Continue to Playground
            </button>
          </div>
        )}

        {message && <p className="login-message">{message}</p>}

        {step !== "login" && step !== "success" && (
          <button
            className="login-back-button"
            type="button"
            onClick={() => {
              setMessage("");
              setOtp("");
              setStep("login");
            }}
          >
            <ArrowLeft size={16} />
            Back to login
          </button>
        )}

        <div className="login-security">
          <Lock size={15} />
          <span>Secure access to your workspace</span>
        </div>

        <p className="login-terms">
          By continuing, use of the platform is subject to your
          organization's applicable policies and terms.
        </p>
      </div>
    </main>
  );
}
