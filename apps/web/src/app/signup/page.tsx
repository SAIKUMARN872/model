"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Cpu,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type SignupStep = "details" | "otp" | "success";

export default function SignupPage() {
  const router = useRouter();

  const [step, setStep] = useState<SignupStep>("details");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendAvailable, setResendAvailable] = useState(true);

  function sendOtp(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    setError("");
    setMessage("");

    if (fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    // Frontend preview only. No email is sent yet.
    setLoading(true);

    window.setTimeout(() => {
      setStep("otp");
      setMessage(
        "OTP verification preview is ready. Email delivery will be connected later."
      );
      setLoading(false);
      setResendAvailable(false);

      window.setTimeout(() => {
        setResendAvailable(true);
      }, 30_000);
    }, 500);
  }

  function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter a valid 6-digit OTP.");
      return;
    }

    // Demo-only interaction. Real OTP verification requires a backend.
    setLoading(true);

    window.setTimeout(() => {
      setLoading(false);
      setStep("success");

      window.setTimeout(() => {
        router.replace("/");
      }, 1800);
    }, 500);
  }

  function resendOtp() {
    if (!resendAvailable || loading) return;

    setError("");
    setMessage("Demo OTP flow restarted. Real email delivery is not connected.");
    setOtp("");
    setResendAvailable(false);

    window.setTimeout(() => {
      setResendAvailable(true);
    }, 30_000);
  }

  function changeEmail() {
    setStep("details");
    setOtp("");
    setError("");
    setMessage("");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080B14] px-4 py-10 text-white">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-240px] h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="absolute bottom-[-240px] right-[-100px] h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute left-[-180px] top-1/2 h-[360px] w-[360px] -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[460px]">
        {/* Brand */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mx-auto mb-8 flex items-center justify-center gap-3"
          aria-label="ModelNow home"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-950/40">
            <Cpu size={23} strokeWidth={1.8} />
          </span>

          <span className="text-2xl font-semibold tracking-tight">
            Model<span className="text-blue-400">Now</span>
          </span>
        </button>

        {/* Centered signup card */}
        <section className="rounded-3xl border border-white/10 bg-[#101522]/95 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-9">
          {step !== "success" && (
            <div className="mb-7 flex items-center justify-center gap-2">
              <span
                className={`h-1.5 w-12 rounded-full ${
                  step === "details" ? "bg-blue-500" : "bg-blue-500"
                }`}
              />
              <span
                className={`h-1.5 w-12 rounded-full ${
                  step === "otp" ? "bg-blue-500" : "bg-white/10"
                }`}
              />
            </div>
          )}

          {step === "details" && (
            <>
              <div className="mb-7 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-blue-300">
                  <Sparkles size={27} />
                </div>

                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Create your account
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Get started with ModelNow using your email address.
                </p>
              </div>

              <form onSubmit={sendOtp} className="space-y-5">
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Full name
                  </label>

                  <input
                    id="fullName"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="h-[52px] w-full rounded-xl border border-white/10 bg-[#0B0F19] px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-[52px] w-full rounded-xl border border-white/10 bg-[#0B0F19] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 text-sm font-semibold shadow-lg shadow-blue-950/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Please wait...
                    </>
                  ) : (
                    <>
                      Continue with email
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs text-slate-500">SECURE ACCESS</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <ShieldCheck
                  size={19}
                  className="mt-0.5 shrink-0 text-emerald-400"
                />
                <p className="text-xs leading-5 text-slate-400">
                  Your account details stay private. Email verification will
                  be connected when the backend is ready.
                </p>
              </div>
            </>
          )}

          {step === "otp" && (
            <>
              <button
                type="button"
                onClick={changeEmail}
                className="mb-6 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
              >
                <ArrowLeft size={16} />
                Change email
              </button>

              <div className="mb-7 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-blue-300">
                  <Mail size={26} />
                </div>

                <h1 className="text-2xl font-semibold tracking-tight">
                  Verify your email
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Continue the signup preview for
                </p>

                <p className="mt-1 break-all text-sm font-medium text-blue-300">
                  {email}
                </p>
              </div>

              {message && (
                <p className="mb-5 rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-xs leading-5 text-blue-200">
                  {message}
                </p>
              )}

              <form onSubmit={verifyOtp} className="space-y-5">
                <div>
                  <label
                    htmlFor="otp"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    6-digit verification code
                  </label>

                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="h-[58px] w-full rounded-xl border border-white/10 bg-[#0B0F19] text-center text-2xl font-semibold tracking-[0.45em] text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                    required
                  />
                </div>

                {error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 text-sm font-semibold shadow-lg shadow-blue-950/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify email
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={!resendAvailable || loading}
                  className="text-sm text-blue-300 transition hover:text-blue-200 disabled:cursor-not-allowed disabled:text-slate-600"
                >
                  {resendAvailable
                    ? "Restart verification preview"
                    : "Please wait before trying again"}
                </button>
              </div>
            </>
          )}

          {step === "success" && (
            <div className="py-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
                <CheckCircle2 size={34} />
              </div>

              <h1 className="text-2xl font-semibold tracking-tight">
                You&apos;re all set, {fullName.trim().split(/\s+/)[0]}!
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Your signup preview is complete. Taking you to ModelNow...
              </p>

              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-emerald-300">
                <Check size={16} />
                Preview completed
              </div>

              <button
                type="button"
                onClick={() => router.replace("/")}
                className="mt-7 h-[50px] w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-sm font-semibold transition hover:brightness-110"
              >
                Continue to ModelNow
              </button>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="font-medium text-blue-300 transition hover:text-blue-200"
            >
              Sign in
            </button>
          </p>

          <div className="mt-5 flex items-center justify-center gap-5 text-xs text-slate-500">
            <button
              type="button"
              onClick={() => router.push("/terms")}
              className="transition hover:text-slate-300"
            >
              Terms
            </button>

            <span className="h-1 w-1 rounded-full bg-slate-700" />

            <button
              type="button"
              onClick={() => router.push("/privacy")}
              className="transition hover:text-slate-300"
            >
              Privacy
            </button>
          </div>

          <p className="mt-4 text-[11px] text-slate-600">
            © {new Date().getFullYear()} ModelNow. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}