"use client";

import Link from "next/link";

export default function DownloadPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Link href="/chat" className="text-2xl font-bold tracking-tight">
            ModelNow
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-gray-600 md:flex">
            <Link href="/chat" className="hover:text-black">
              About
            </Link>
            <Link href="/help" className="hover:text-black">
              Help Center
            </Link>
            <Link href="/release-notes" className="hover:text-black">
              Release notes
            </Link>
          </nav>

          <Link
            href="/chat"
            className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Try ModelNow
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-3xl font-bold text-white">
            M
          </div>

          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            ModelNow apps
          </p>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-7xl">
            Meet ModelNow.
            <br />
            <span className="text-gray-500">AI, wherever you are.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
            Bring ModelNow into your daily workflow. Explore AI tools for
            thinking, creating, researching, and getting work done.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="#desktop"
              className="rounded-full bg-black px-7 py-3.5 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Explore desktop app
            </a>

            <a
              href="#mobile"
              className="rounded-full border border-gray-300 px-7 py-3.5 text-sm font-medium transition hover:bg-gray-100"
            >
              Explore mobile app
            </a>
          </div>
        </div>

        {/* Preview */}
        <div className="mx-auto mt-16 max-w-5xl rounded-3xl border border-gray-200 bg-gray-50 p-3 shadow-sm md:mt-20 md:p-6">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-3 text-sm font-medium text-gray-500">
                ModelNow workspace
              </span>
            </div>

            <div className="grid min-h-[300px] md:grid-cols-[220px_1fr]">
              <aside className="hidden border-r border-gray-200 p-5 md:block">
                <p className="mb-5 text-sm font-semibold">ModelNow</p>
                <div className="space-y-4 text-sm text-gray-500">
                  <p>＋ New chat</p>
                  <p>⌕ Search</p>
                  <p>▤ Library</p>
                  <p>◇ Projects</p>
                  <p>⚙ Settings</p>
                </div>
              </aside>

              <div className="flex flex-col items-center justify-center px-5 py-12 text-center md:px-10">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-2xl">
                  ✦
                </div>

                <h2 className="text-2xl font-semibold">
                  What can we work on?
                </h2>

                <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
                  Ask questions, explore ideas, analyze information, and
                  organize your work with ModelNow.
                </p>

                <div className="mt-8 w-full max-w-xl rounded-2xl border border-gray-300 bg-white p-4 text-left shadow-sm">
                  <p className="text-sm text-gray-400">
                    Message ModelNow...
                  </p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-lg text-gray-500">＋</span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white">
                      ↑
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Desktop */}
      <section id="desktop" className="border-t border-gray-200 px-5 py-20 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-500">
              Desktop
            </p>

            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
              A workspace for your computer.
            </h2>

            <p className="mt-5 max-w-lg leading-7 text-gray-600">
              Keep AI close while you work. ModelNow is designed to help you
              think through ideas, work with information, and manage tasks.
            </p>

            <div className="mt-7 inline-flex cursor-not-allowed items-center gap-3 rounded-full bg-gray-200 px-6 py-3.5 text-sm font-medium text-gray-500">
              <span>↓</span>
              Windows app — Coming soon
            </div>

            <p className="mt-3 text-xs text-gray-500">
              Desktop downloads are not available yet.
            </p>
          </div>

          <div className="flex min-h-[280px] items-center justify-center rounded-3xl bg-gray-100 p-8">
            <div className="w-full max-w-sm rounded-2xl border border-gray-300 bg-white p-6 shadow-lg">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-lg font-bold text-white">
                  M
                </div>
                <div>
                  <p className="font-semibold">ModelNow</p>
                  <p className="text-xs text-gray-500">Your AI workspace</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="h-3 w-full rounded-full bg-gray-100" />
                <div className="h-3 w-4/5 rounded-full bg-gray-100" />
                <div className="h-3 w-3/5 rounded-full bg-gray-100" />
              </div>

              <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                Think. Create. Get things done.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile */}
      <section id="mobile" className="border-t border-gray-200 px-5 py-20 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div className="order-2 flex justify-center md:order-1">
            <div className="w-64 rounded-[2.5rem] border-[7px] border-gray-800 bg-white p-3 shadow-xl">
              <div className="mx-auto mb-5 h-1.5 w-16 rounded-full bg-gray-300" />

              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-xl bg-black font-bold text-white">
                  M
                </div>

                <p className="text-lg font-semibold">Hello!</p>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  What would you like to explore today?
                </p>

                <div className="mt-8 rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-400">
                  Message ModelNow...
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-500">
              Mobile
            </p>

            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
              Take AI with you.
            </h2>

            <p className="mt-5 leading-7 text-gray-600">
              Access your AI workspace on the go. Mobile apps are planned for
              a future ModelNow release.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <span className="cursor-not-allowed rounded-full bg-gray-200 px-5 py-3 text-sm text-gray-500">
                iOS — Coming soon
              </span>

              <span className="cursor-not-allowed rounded-full bg-gray-200 px-5 py-3 text-sm text-gray-500">
                Android — Coming soon
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Browser extension */}
      <section
        id="browser"
        className="border-t border-gray-200 px-5 py-20 md:px-8 md:py-24"
      >
        <div className="mx-auto max-w-5xl rounded-3xl bg-gray-50 p-8 md:p-14">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-500">
                Browser extension
              </p>

              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                ModelNow for your browser.
              </h2>

              <p className="mt-4 max-w-xl leading-7 text-gray-600">
                A browser extension can bring ModelNow tools closer to the
                websites and information you use every day.
              </p>

              <span className="mt-7 inline-block cursor-not-allowed rounded-full bg-gray-200 px-6 py-3 text-sm font-medium text-gray-500">
                Not available yet
              </span>
            </div>

            <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-gray-200 bg-white text-4xl font-bold shadow-sm">
              M
            </div>
          </div>
        </div>
      </section>

      {/* Footer call to action */}
      <section className="border-t border-gray-200 px-5 py-20 text-center md:px-8 md:py-24">
        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
          Make room for better ideas.
        </h2>

        <p className="mx-auto mt-5 max-w-xl leading-7 text-gray-600">
          Start exploring your AI workspace with ModelNow.
        </p>

        <Link
          href="/chat"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-black px-7 py-3.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Try ModelNow <span aria-hidden="true">→</span>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-5 py-8 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-sm text-gray-500 sm:flex-row">
          <p>© {new Date().getFullYear()} ModelNow</p>

          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/help" className="hover:text-black">
              Help Center
            </Link>
            <Link href="/release-notes" className="hover:text-black">
              Release notes
            </Link>
            <Link href="/privacy-center" className="hover:text-black">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}