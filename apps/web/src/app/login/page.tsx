"use client";
import Image from "next/image";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Mail,
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { siApple } from "simple-icons";

type LoginStep = "details" | "otp";

export default function LoginPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<LoginStep>("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [providerMessage, setProviderMessage] = useState("");

  function continueWithEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setProviderMessage("");

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setFullName(cleanName);
    setEmail(cleanEmail);
    setOtp("");
    setStep("otp");
  }

  function verifyOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the complete 6-digit code.");
      return;
    }

    // Frontend-only flow. Connect real backend OTP verification here.
    setLoading(true);

    window.setTimeout(() => {
      setLoading(false);
      router.push("/home");
    }, 350);
  }

  function showProviderMessage(provider: string) {
    setProviderMessage(
      `${provider} sign-in is not connected yet.`,
    );
    setError("");
  }

  function goBack() {
    setStep("details");
    setOtp("");
    setError("");
  }

  return (
    <main className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-[3px]">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-heading"
        className="relative my-auto w-full max-w-[390px] rounded-[24px] border border-gray-200 bg-white px-6 py-7 text-[#111827] shadow-2xl sm:px-8"
      >
        <button
          type="button"
          onClick={() => router.push("/")}
          aria-label="Close login"
          className="absolute right-4 top-4 rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-black"
        >
          <X size={19} />
        </button>

    <div className="mb-5 flex justify-center">
  <Image
    src="/modelnow-logo.png"
    alt="ModelNow logo"
    width={64}
    height={64}
    priority
    className="h-16 w-16 object-contain"
  />
</div>

        <h1
          id="login-heading"
          className="text-center text-[25px] font-semibold tracking-tight"
        >
          {step === "details"
            ? "Welcome to ModelNow"
            : "Verify your email"}
        </h1>

        <p className="mx-auto mt-2 max-w-[300px] text-center text-sm leading-6 text-gray-500">
          {step === "details"
            ? "Sign in or create your account to access your AI workspace."
            : `Enter the 6-digit code for ${email}.`}
        </p>

        {step === "details" && (
          <>
            <div className="mt-6 space-y-2.5">
              <button
                type="button"
                onClick={() => showProviderMessage("Google")}
                className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-gray-200 text-sm font-medium transition hover:bg-gray-50"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 48 48"
                  className="h-[18px] w-[18px]"
                >
                  <path
                    fill="#4285F4"
                    d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2l6.5 5.1c3.8-3.5 6.2-8.7 6.2-15Z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 44c5.5 0 10.2-1.8 13.6-4.9l-6.5-5.1c-1.8 1.2-4.1 1.9-7.1 1.9-5.4 0-10-3.6-11.6-8.4l-6.7 5.2C9.1 39.4 16 44 24 44Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M12.4 27.5a12 12 0 0 1 0-7l-6.7-5.2a20 20 0 0 0 0 17.4l6.7-5.2Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M24 12.1c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6.2 29.4 4 24 4 16 4 9.1 8.6 5.7 15.3l6.7 5.2c1.6-4.8 6.2-8.4 11.6-8.4Z"
                  />
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                onClick={() => showProviderMessage("Apple")}
                className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-gray-200 text-sm font-medium transition hover:bg-gray-50"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-[18px] w-[18px] fill-current"
                >
                  <path d={siApple.path} />
                </svg>
                Continue with Apple
              </button>
            </div>

            {providerMessage && (
              <p
                role="status"
                className="mt-3 text-center text-xs leading-5 text-gray-500"
              >
                {providerMessage}
              </p>
            )}

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                Or continue with email
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <form onSubmit={continueWithEmail} className="space-y-3">
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-1.5 block text-xs font-medium text-gray-700"
                >
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={100}
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your full name"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-medium text-gray-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="you@example.com"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
                />
              </div>

              {error && (
                <p role="alert" className="text-xs leading-5 text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#111827] text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Continue with email
                <ArrowRight size={16} />
              </button>
            </form>
          </>
        )}

        {step === "otp" && (
          <>
            <button
              type="button"
              onClick={goBack}
              className="mt-5 flex items-center gap-1.5 text-xs font-medium text-gray-500 transition hover:text-black"
            >
              <ArrowLeft size={15} />
              Change name or email
            </button>

            <form onSubmit={verifyOtp} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="otp"
                  className="mb-1.5 block text-xs font-medium text-gray-700"
                >
                  6-digit verification code
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setError("");
                  }}
                  placeholder="000000"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 text-center text-xl font-semibold tracking-[0.45em] outline-none transition placeholder:tracking-[0.45em] focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100"
                />
              </div>

              {error && (
                <p role="alert" className="text-xs leading-5 text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#111827] text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && (
                  <LoaderCircle size={17} className="animate-spin" />
                )}
                {loading ? "Continuing..." : "Verify and continue"}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>
          </>
        )}

        <footer className="mt-6 flex justify-center gap-5 border-t border-gray-100 pt-4 text-[11px] text-gray-400">
          <a href="/terms" className="transition hover:text-gray-700">
            Terms of Use
          </a>
          <a href="/privacy" className="transition hover:text-gray-700">
            Privacy Policy
          </a>
        </footer>
      </section>
    </main>
  );
}


