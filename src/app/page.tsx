"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  LockKeyhole,
  LogIn,
  MessageSquare,
  Paperclip,
  Plus,
  Send,
  Sparkles,
  X,
} from "lucide-react";

export default function PublicHomePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [pendingMessage, setPendingMessage] = useState("");
  const [showAttachments, setShowAttachments] = useState(false);

  function handleSend(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const message = prompt.trim();
    if (!message) return;

    setPendingMessage(message);
    setShowSignupPrompt(true);
    setShowAttachments(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  function continueSignup() {
    router.push("/signup");
  }

  function continueLogin() {
    router.push("/login");
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#F8FCFF] text-slate-800">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-280px] h-[560px] w-[650px] -translate-x-1/2 rounded-full bg-sky-200/50 blur-[120px]" />
        <div className="absolute bottom-[-220px] right-[-100px] h-[400px] w-[400px] rounded-full bg-blue-100/70 blur-[110px]" />
        <div className="absolute bottom-[-220px] left-[-100px] h-[350px] w-[350px] rounded-full bg-cyan-100/60 blur-[100px]" />
      </div>

      <header className="relative z-20 flex items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center gap-3"
          aria-label="ModelNow home"
        >
          <img
            src="/modelnow-logo.png"
            alt="ModelNow logo"
            className="h-10 w-10 object-contain"
          />
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            Model<span className="text-sky-600">Now</span>
          </span>
        </button>

        <button
          type="button"
          onClick={continueLogin}
          className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-4 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:bg-sky-50"
        >
          <LogIn size={16} />
          Log in
        </button>
      </header>

      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-14 pt-4">
        <div className="flex w-full max-w-5xl flex-col items-center">
          <div className="mb-9 flex flex-col items-center text-center">
            <img
              src="/modelnow-logo.png"
              alt="ModelNow logo"
              className="mb-4 h-[76px] w-[76px] object-contain"
            />
            <h1 className="text-4xl font-semibold tracking-[-0.05em] text-slate-900 sm:text-5xl">
              Model<span className="text-sky-600">Now</span>
            </h1>
          </div>

          <div className="w-full max-w-[760px]">
            <form
              onSubmit={handleSend}
              className="rounded-[24px] border border-sky-100 bg-white/95 p-4 shadow-lg shadow-sky-100/70 transition focus-within:border-sky-300 focus-within:shadow-xl focus-within:shadow-sky-100/80 sm:p-5"
            >
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask ModelNow anything..."
                rows={3}
                aria-label="Enter your message"
className="min-h-[100px] max-h-60 w-full resize-none bg-transparent px-2 py-2 text-base leading-7 text-slate-800 outline-none placeholder:text-slate-400 sm:px-3"
              />

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowAttachments((value) => !value)}
                    aria-label="More options"
                    aria-expanded={showAttachments}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-sky-50 hover:text-sky-700"
                  >
                    <Plus
                      size={19}
                      className={`transition-transform ${showAttachments ? "rotate-45" : ""}`}
                    />
                  </button>

                  {showAttachments && (
                    <div className="absolute bottom-11 left-0 z-30 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAttachments(false);
                          setPendingMessage("Attach files");
                          setShowSignupPrompt(true);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-sky-50"
                      >
                        <Paperclip size={16} className="text-sky-600" />
                        Attach files
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowAttachments(false);
                          setPendingMessage("Explore AI tools");
                          setShowSignupPrompt(true);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-sky-50"
                      >
                        <Sparkles size={16} className="text-sky-600" />
                        Explore AI tools
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="hidden text-xs text-slate-400 sm:inline">
                    Enter to send
                  </span>
                  <button
                    type="submit"
                    disabled={!prompt.trim()}
                    aria-label="Send message"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-600 text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </form>

            <p className="mt-3 text-center text-xs text-slate-500">
              Sign up or log in to continue your conversation.
            </p>
          </div>
        </div>
      </section>

      <footer className="relative z-10 flex flex-col items-center justify-between gap-3 border-t border-sky-100 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:px-8 lg:px-12">
        <p>© {new Date().getFullYear()} ModelNow</p>
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => router.push("/terms")}
            className="transition hover:text-sky-700"
          >
            Terms
          </button>
          <button
            type="button"
            onClick={() => router.push("/privacy")}
            className="transition hover:text-sky-700"
          >
            Privacy
          </button>
        </div>
      </footer>

      {showSignupPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4 py-8 backdrop-blur-sm"
          onClick={() => setShowSignupPrompt(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="signup-dialog-title"
            className="w-full max-w-[390px] rounded-3xl border border-sky-100 bg-white p-6 shadow-2xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                <LockKeyhole size={22} />
              </div>
              <button
                type="button"
                onClick={() => setShowSignupPrompt(false)}
                aria-label="Close dialog"
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <h2
              id="signup-dialog-title"
              className="text-xl font-semibold text-slate-900"
            >
              Sign up to continue
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Create a ModelNow account to continue your conversation and
              access your workspace.
            </p>

            {pendingMessage && (
              <div className="mt-4 flex gap-3 rounded-xl border border-sky-100 bg-sky-50/70 p-3">
                <MessageSquare
                  size={17}
                  className="mt-0.5 shrink-0 text-sky-700"
                />
                <p className="line-clamp-3 break-words text-sm leading-5 text-slate-600">
                  {pendingMessage}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={continueSignup}
              className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              Create account
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              onClick={continueLogin}
              className="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 text-sm font-medium text-slate-700 transition hover:bg-sky-50"
            >
              I already have an account
            </button>
            <p className="mt-4 text-center text-xs text-slate-400">
              Your message is not sent to an AI model in this preview.
            </p>
          </section>
        </div>
      )}
    </main>
  );
}
