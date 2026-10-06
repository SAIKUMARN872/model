"use client";

import { useState } from "react";

const capabilities = [
  {
    title: "Browser Automation",
    description: "Let ModelNow research websites and complete browser tasks.",
  },
  {
    title: "Computer Use",
    description: "Control supported computer applications and interfaces.",
  },
  {
    title: "Agents & Workflows",
    description: "Build business agents for CRM, ERP, HR, Sales and Finance.",
  },
  {
    title: "Knowledge & RAG",
    description: "Connect enterprise documents, knowledge and data.",
  },
  {
    title: "Multimodal AI",
    description: "Work with text, images, documents, audio and other inputs.",
  },
  {
    title: "Fine-Tuning",
    description: "Adapt models for specialized enterprise workloads.",
  },
];

const menuItems = [
  "Library",
  "Plugins",
  "Projects",
  "Schedule",
  "Customize",
  "Plans",
];

export default function HomePage() {
  const [input, setInput] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-gray-200 bg-gray-50 px-4 py-5 md:flex md:flex-col">
          <div className="mb-8 px-3">
            <div className="text-xl font-bold tracking-tight">ModelNow</div>
            <div className="mt-1 text-xs text-gray-500">
              AI Execution Platform
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item}
                className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-200"
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-1 border-t border-gray-200 pt-4">
            {["Account", "Login", "Settings", "Help & Support"].map((item) => (
              <button
                key={item}
                className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-200"
              >
                {item}
              </button>
            ))}
          </div>
        </aside>

        {/* Main */}
        <section className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="flex h-16 items-center justify-between border-b border-gray-200 px-5 md:px-8">
            <div className="font-semibold md:hidden">ModelNow</div>

            <div className="ml-auto flex items-center gap-2">
              <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">
                Dashboard
              </button>

              <button
                onClick={() => setShowMenu(!showMenu)}
                className="rounded-lg px-3 py-2 text-xl hover:bg-gray-100"
                aria-label="More options"
              >
                ⋮
              </button>
            </div>

            {showMenu && (
              <div className="absolute right-5 top-14 z-20 w-40 rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
                {["Share", "Archive", "Delete"].map((item) => (
                  <button
                    key={item}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </header>

          {/* Chat content */}
          <div className="flex flex-1 flex-col items-center overflow-y-auto px-5 py-12">
            <div className="w-full max-w-4xl">
              <div className="mb-10 text-center">
                <div className="mb-3 text-4xl font-bold tracking-tight">
                  ModelNow
                </div>

                <p className="text-lg text-gray-500">
                  How can I help you today?
                </p>

                <p className="mt-2 text-sm text-gray-400">
                  AI execution optimized for cost, latency and quality.
                </p>
              </div>

              {/* Capability cards */}
              <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {capabilities.map((capability) => (
                  <button
                    key={capability.title}
                    className="rounded-2xl border border-gray-200 p-4 text-left transition hover:border-gray-400 hover:shadow-sm"
                  >
                    <div className="mb-2 font-semibold">
                      {capability.title}
                    </div>

                    <div className="text-sm leading-5 text-gray-500">
                      {capability.description}
                    </div>
                  </button>
                ))}
              </div>

              {/* Composer */}
              <div className="relative rounded-2xl border border-gray-300 bg-white shadow-sm">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask ModelNow anything..."
                  rows={3}
                  className="w-full resize-none rounded-2xl px-5 py-4 pr-5 text-sm outline-none placeholder:text-gray-400"
                />

                <div className="flex items-center justify-between px-4 pb-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="rounded-lg px-3 py-2 text-xl hover:bg-gray-100"
                      aria-label="Add capability"
                    >
                      +
                    </button>

                    <button className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
                      Attach
                    </button>

                    <button className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
                      Voice
                    </button>
                  </div>

                  <button
                    disabled={!input.trim()}
                    className="rounded-xl bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Send
                  </button>
                </div>
              </div>

              {/* Optimization message */}
              <div className="mt-5 text-center text-xs text-gray-400">
                ModelNow automatically selects the appropriate model for your
                request.
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}