"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  SlidersHorizontal,
  MessageSquareText,
  Sparkles,
  Save,
  RotateCcw,
  Check,
} from "lucide-react";

type ResponseStyle =
  | "balanced"
  | "concise"
  | "detailed"
  | "professional";

type Tone =
  | "friendly"
  | "neutral"
  | "professional"
  | "direct";

export default function CustomizePage() {
  const router = useRouter();

  const [activeSection, setActiveSection] =
    useState("instructions");

  const [name, setName] = useState("");

  const [occupation, setOccupation] = useState("");

  const [instructions, setInstructions] = useState("");

  const [responseStyle, setResponseStyle] =
    useState<ResponseStyle>("balanced");

  const [tone, setTone] =
    useState<Tone>("friendly");

  const [saved, setSaved] = useState(false);

  function saveChanges() {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  function resetChanges() {
    setName("");
    setOccupation("");
    setInstructions("");
    setResponseStyle("balanced");
    setTone("friendly");
  }

  const navigationItems = [
    {
      id: "instructions",
      label: "Custom instructions",
      icon: MessageSquareText,
    },
    {
      id: "profile",
      label: "About you",
      icon: User,
    },
    {
      id: "style",
      label: "Response style",
      icon: SlidersHorizontal,
    },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* HEADER */}
      <header className="flex h-16 items-center justify-between border-b border-slate-200 px-5 md:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Go back"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <h1 className="text-base font-semibold">
              Customize ModelNow
            </h1>

            <p className="text-xs text-slate-400">
              Personalize how ModelNow works for you
            </p>
          </div>
        </div>

        <button
          onClick={saveChanges}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          {saved ? (
            <>
              <Check size={16} />
              Saved
            </>
          ) : (
            <>
              <Save size={16} />
              Save changes
            </>
          )}
        </button>
      </header>

      {/* MAIN */}
      <div className="mx-auto flex w-full max-w-6xl">
        {/* LEFT SETTINGS NAVIGATION */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 px-4 py-8 md:block">
          <div className="mb-6 px-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Customize
            </p>
          </div>

          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              const active =
                activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() =>
                    setActiveSection(item.id)
                  }
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                    active
                      ? "bg-slate-100 font-medium text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    size={17}
                    className={
                      active
                        ? "text-slate-900"
                        : "text-slate-400"
                    }
                  />

                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <button
              onClick={resetChanges}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <RotateCcw size={17} />
              Reset customization
            </button>
          </div>
        </aside>

        {/* CONTENT */}
        <section className="min-w-0 flex-1 px-5 py-8 md:px-10 md:py-12">
          {/* MOBILE NAV */}
          <div className="mb-8 flex gap-2 overflow-x-auto md:hidden">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              const active =
                activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() =>
                    setActiveSection(item.id)
                  }
                  className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  <Icon size={15} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* =====================================================
              CUSTOM INSTRUCTIONS
          ===================================================== */}

          {activeSection === "instructions" && (
            <div className="max-w-3xl">
              <div className="mb-10">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <Sparkles size={22} />
                </div>

                <h2 className="text-2xl font-semibold tracking-tight">
                  Custom instructions
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Tell ModelNow how you want it to respond.
                  These preferences can be used across your
                  conversations.
                </p>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-800">
                    How should ModelNow respond?
                  </label>

                  <textarea
                    value={instructions}
                    onChange={(event) =>
                      setInstructions(
                        event.target.value
                      )
                    }
                    placeholder="For example: Explain things clearly and step by step. Keep technical answers beginner-friendly. Use examples when useful."
                    rows={7}
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    ModelNow will use these instructions when
                    generating responses.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-800">
                    Example
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    “Explain technical topics in simple language,
                    give practical examples, and avoid unnecessary
                    complexity.”
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              ABOUT YOU
          ===================================================== */}

          {activeSection === "profile" && (
            <div className="max-w-3xl">
              <div className="mb-10">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <User size={22} />
                </div>

                <h2 className="text-2xl font-semibold tracking-tight">
                  About you
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Add information that helps ModelNow provide
                  more relevant responses.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-800">
                    What should ModelNow call you?
                  </label>

                  <input
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="Your name"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-800">
                    What do you do?
                  </label>

                  <input
                    value={occupation}
                    onChange={(event) =>
                      setOccupation(
                        event.target.value
                      )
                    }
                    placeholder="For example: Student, Developer, Founder, Designer"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-800">
                    Additional information
                  </label>

                  <textarea
                    placeholder="Add anything else ModelNow should know about you."
                    rows={6}
                    className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-4 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              RESPONSE STYLE
          ===================================================== */}

          {activeSection === "style" && (
            <div className="max-w-3xl">
              <div className="mb-10">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <SlidersHorizontal size={22} />
                </div>

                <h2 className="text-2xl font-semibold tracking-tight">
                  Response style
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Choose how ModelNow should communicate with
                  you.
                </p>
              </div>

              {/* RESPONSE STYLE */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Response length
                </h3>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <StyleCard
                    title="Balanced"
                    description="Clear answers with enough detail to understand the topic."
                    selected={
                      responseStyle === "balanced"
                    }
                    onClick={() =>
                      setResponseStyle("balanced")
                    }
                  />

                  <StyleCard
                    title="Concise"
                    description="Short and direct answers with minimal explanation."
                    selected={
                      responseStyle === "concise"
                    }
                    onClick={() =>
                      setResponseStyle("concise")
                    }
                  />

                  <StyleCard
                    title="Detailed"
                    description="Thorough explanations with examples and context."
                    selected={
                      responseStyle === "detailed"
                    }
                    onClick={() =>
                      setResponseStyle("detailed")
                    }
                  />

                  <StyleCard
                    title="Professional"
                    description="Structured and polished responses for work."
                    selected={
                      responseStyle === "professional"
                    }
                    onClick={() =>
                      setResponseStyle("professional")
                    }
                  />
                </div>
              </div>

              {/* TONE */}
              <div className="mt-10">
                <h3 className="text-sm font-semibold text-slate-900">
                  Tone
                </h3>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <StyleCard
                    title="Friendly"
                    description="Warm, approachable and conversational."
                    selected={
                      tone === "friendly"
                    }
                    onClick={() =>
                      setTone("friendly")
                    }
                  />

                  <StyleCard
                    title="Neutral"
                    description="Clear, balanced and straightforward."
                    selected={
                      tone === "neutral"
                    }
                    onClick={() =>
                      setTone("neutral")
                    }
                  />

                  <StyleCard
                    title="Professional"
                    description="Polished communication suitable for business."
                    selected={
                      tone === "professional"
                    }
                    onClick={() =>
                      setTone("professional")
                    }
                  />

                  <StyleCard
                    title="Direct"
                    description="Get to the point without unnecessary wording."
                    selected={
                      tone === "direct"
                    }
                    onClick={() =>
                      setTone("direct")
                    }
                  />
                </div>
              </div>

              {/* PREVIEW */}
              <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-2">
                  <Sparkles
                    size={17}
                    className="text-slate-600"
                  />

                  <p className="text-sm font-semibold text-slate-800">
                    Preview
                  </p>
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-sm leading-6 text-slate-600">
                    Your selected response style and tone will
                    be applied to future ModelNow conversations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* MOBILE RESET */}
          <div className="mt-10 border-t border-slate-100 pt-6 md:hidden">
            <button
              onClick={resetChanges}
              className="flex items-center gap-2 text-sm text-slate-500"
            >
              <RotateCcw size={16} />
              Reset customization
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   STYLE CARD
========================================================= */

function StyleCard({
  title,
  description,
  selected,
  onClick,
}: {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-2xl border p-5 text-left transition ${
        selected
          ? "border-slate-900 bg-slate-50 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      {selected && (
        <div className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white">
          <Check size={12} />
        </div>
      )}

      <h4 className="pr-7 text-sm font-semibold text-slate-900">
        {title}
      </h4>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </button>
  );
}