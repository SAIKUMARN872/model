
"use client";

import { useEffect, useState } from "react";
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
  Loader2,
  AlertCircle,
  Trash2,
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

type UserPreferences = {
  name: string;
  occupation: string;
  additionalInfo: string;
  instructions: string;
  responseStyle: ResponseStyle;
  tone: Tone;
};

const STORAGE_KEY = "modelnow-user-preferences";

const DEFAULT_PREFERENCES: UserPreferences = {
  name: "",
  occupation: "",
  additionalInfo: "",
  instructions: "",
  responseStyle: "balanced",
  tone: "friendly",
};

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
] as const;

type SectionId = (typeof navigationItems)[number]["id"];

export default function CustomizePage() {
  const router = useRouter();

  const [activeSection, setActiveSection] =
    useState<SectionId>("instructions");

  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showResetConfirmation, setShowResetConfirmation] =
    useState(false);

  // Load saved preferences when the page opens.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored) as Partial<UserPreferences>;

        setPreferences({
          ...DEFAULT_PREFERENCES,
          ...parsed,
        });
      }
    } catch (err) {
      console.error("Failed to load ModelNow preferences:", err);
      setError("Unable to load your saved preferences.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  function updatePreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
    setError("");
  }

  // Save all preferences together.
  async function saveChanges() {
    setIsSaving(true);
    setSaved(false);
    setError("");

    try {
      const cleanedPreferences: UserPreferences = {
        name: preferences.name.trim(),
        occupation: preferences.occupation.trim(),
        additionalInfo: preferences.additionalInfo.trim(),
        instructions: preferences.instructions.trim(),
        responseStyle: preferences.responseStyle,
        tone: preferences.tone,
      };

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(cleanedPreferences)
      );

      setPreferences(cleanedPreferences);
      setSaved(true);
    } catch (err) {
      console.error("Failed to save ModelNow preferences:", err);
      setError("Unable to save your preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  function resetChanges() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setPreferences(DEFAULT_PREFERENCES);
      setSaved(false);
      setError("");
      setShowResetConfirmation(false);
    } catch (err) {
      console.error("Failed to reset preferences:", err);
      setError("Unable to reset your preferences.");
    }
  }

  const hasChanges = !saved;

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 md:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
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
          type="button"
          onClick={saveChanges}
          disabled={isLoading || isSaving || !hasChanges}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : saved ? (
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

      {/* MAIN LAYOUT */}
      <div className="mx-auto flex w-full max-w-6xl">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 px-4 py-8 md:block">
          <div className="mb-6 px-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Customize
            </p>
          </div>

          <Navigation
            activeSection={activeSection}
            onSelect={setActiveSection}
          />

          <div className="mt-8 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={() => setShowResetConfirmation(true)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-500 transition hover:bg-slate-50 hover:text-red-600"
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
              const active = activeSection === item.id;

              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={15} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* LOADING */}
          {isLoading ? (
            <div className="flex min-h-72 items-center justify-center gap-3 text-sm text-slate-500">
              <Loader2 size={20} className="animate-spin" />
              Loading your preferences...
            </div>
          ) : (
            <>
              {/* STATUS MESSAGES */}
              {error && (
                <div
                  role="alert"
                  className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              {saved && (
                <div
                  role="status"
                  className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
                >
                  <Check size={18} />
                  Your preferences have been saved on this browser.
                </div>
              )}

              {/* CUSTOM INSTRUCTIONS */}
              {activeSection === "instructions" && (
                <div className="max-w-3xl">
                  <SectionHeader
                    icon={<Sparkles size={22} />}
                    title="Custom instructions"
                    description="Tell ModelNow how you want it to respond. Your preferences can be reused across conversations."
                  />

                  <div className="space-y-8">
                    <div>
                      <label
                        htmlFor="custom-instructions"
                        className="mb-2 block text-sm font-medium text-slate-800"
                      >
                        How should ModelNow respond?
                      </label>

                      <textarea
                        id="custom-instructions"
                        value={preferences.instructions}
                        onChange={(event) =>
                          updatePreference("instructions", event.target.value)
                        }
                        placeholder="For example: Explain things clearly and step by step. Keep technical answers beginner-friendly. Use examples when useful."
                        rows={7}
                        maxLength={5000}
                        className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                      />

                      <div className="mt-2 flex justify-between gap-3 text-xs text-slate-400">
                        <span>
                          These instructions describe your preferred answers.
                        </span>
                        <span className="shrink-0 tabular-nums">
                          {preferences.instructions.length}/5000
                        </span>
                      </div>
                    </div>

                    <ExampleBox>
                      Explain technical topics in simple language, give practical examples, and avoid unnecessary complexity.
                    </ExampleBox>
                  </div>
                </div>
              )}

              {/* ABOUT YOU */}
              {activeSection === "profile" && (
                <div className="max-w-3xl">
                  <SectionHeader
                    icon={<User size={22} />}
                    title="About you"
                    description="Add information that helps ModelNow provide more relevant responses."
                  />

                  <div className="space-y-6">
                    <InputField
                      label="What should ModelNow call you?"
                      value={preferences.name}
                      placeholder="Your name"
                      maxLength={100}
                      onChange={(value) => updatePreference("name", value)}
                    />

                    <InputField
                      label="What do you do?"
                      value={preferences.occupation}
                      placeholder="For example: Student, Developer, Founder, Designer"
                      maxLength={150}
                      onChange={(value) => updatePreference("occupation", value)}
                    />

                    <div>
                      <label
                        htmlFor="additional-info"
                        className="mb-2 block text-sm font-medium text-slate-800"
                      >
                        Additional information
                      </label>

                      <textarea
                        id="additional-info"
                        value={preferences.additionalInfo}
                        onChange={(event) =>
                          updatePreference("additionalInfo", event.target.value)
                        }
                        placeholder="Add anything else ModelNow should know about your preferences, goals, or background."
                        rows={6}
                        maxLength={3000}
                        className="w-full resize-y rounded-2xl border border-slate-200 px-4 py-4 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                      />

                      <p className="mt-2 text-right text-xs text-slate-400 tabular-nums">
                        {preferences.additionalInfo.length}/3000
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* RESPONSE STYLE */}
              {activeSection === "style" && (
                <div className="max-w-3xl">
                  <SectionHeader
                    icon={<SlidersHorizontal size={22} />}
                    title="Response style"
                    description="Choose how ModelNow should communicate with you."
                  />

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Response length
                    </h3>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <StyleCard
                        title="Balanced"
                        description="Clear answers with enough detail to understand the topic."
                        selected={preferences.responseStyle === "balanced"}
                        onClick={() =>
                          updatePreference("responseStyle", "balanced")
                        }
                      />

                      <StyleCard
                        title="Concise"
                        description="Short and direct answers with minimal explanation."
                        selected={preferences.responseStyle === "concise"}
                        onClick={() =>
                          updatePreference("responseStyle", "concise")
                        }
                      />

                      <StyleCard
                        title="Detailed"
                        description="Thorough explanations with examples and context."
                        selected={preferences.responseStyle === "detailed"}
                        onClick={() =>
                          updatePreference("responseStyle", "detailed")
                        }
                      />

                      <StyleCard
                        title="Professional"
                        description="Structured and polished responses for work."
                        selected={preferences.responseStyle === "professional"}
                        onClick={() =>
                          updatePreference("responseStyle", "professional")
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-10">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Tone
                    </h3>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <StyleCard
                        title="Friendly"
                        description="Warm, approachable and conversational."
                        selected={preferences.tone === "friendly"}
                        onClick={() => updatePreference("tone", "friendly")}
                      />

                      <StyleCard
                        title="Neutral"
                        description="Clear, balanced and straightforward."
                        selected={preferences.tone === "neutral"}
                        onClick={() => updatePreference("tone", "neutral")}
                      />

                      <StyleCard
                        title="Professional"
                        description="Polished communication suitable for business."
                        selected={preferences.tone === "professional"}
                        onClick={() =>
                          updatePreference("tone", "professional")
                        }
                      />

                      <StyleCard
                        title="Direct"
                        description="Get to the point without unnecessary wording."
                        selected={preferences.tone === "direct"}
                        onClick={() => updatePreference("tone", "direct")}
                      />
                    </div>
                  </div>

                  {/* PREVIEW */}
                  <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center gap-2">
                      <Sparkles size={17} className="text-slate-600" />
                      <p className="text-sm font-semibold text-slate-800">
                        Your response preferences
                      </p>
                    </div>

                    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-sm leading-6 text-slate-600">
                        ModelNow will aim to respond in a{" "}
                        <strong>{preferences.responseStyle}</strong> style
                        using a{" "}
                        <strong>{preferences.tone}</strong> tone.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* MOBILE RESET */}
          <div className="mt-10 border-t border-slate-100 pt-6 md:hidden">
            <button
              type="button"
              onClick={() => setShowResetConfirmation(true)}
              className="flex items-center gap-2 text-sm text-slate-500 transition hover:text-red-600"
            >
              <RotateCcw size={16} />
              Reset customization
            </button>
          </div>
        </section>
      </div>

      {/* RESET CONFIRMATION */}
      {showResetConfirmation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowResetConfirmation(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Trash2 size={20} />
            </div>

            <h2
              id="reset-title"
              className="mt-4 text-lg font-semibold text-slate-900"
            >
              Reset customization?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This will remove your saved preferences from this browser and
              restore the default settings.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirmation(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={resetChanges}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Reset preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   NAVIGATION
========================================================= */

function Navigation({
  activeSection,
  onSelect,
}: {
  activeSection: SectionId;
  onSelect: (section: SectionId) => void;
}) {
  return (
    <nav className="space-y-1" aria-label="Customization sections">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const active = activeSection === item.id;

        return (
          <button
            type="button"
            key={item.id}
            onClick={() => onSelect(item.id)}
            aria-current={active ? "page" : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
              active
                ? "bg-slate-100 font-medium text-slate-900"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Icon
              size={17}
              className={active ? "text-slate-900" : "text-slate-400"}
            />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-10">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
        {icon}
      </div>

      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   INPUT FIELD
========================================================= */

function InputField({
  label,
  value,
  placeholder,
  maxLength,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  maxLength: number;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-800">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
      />
    </div>
  );
}

/* =========================================================
   EXAMPLE BOX
========================================================= */

function ExampleBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm font-medium text-slate-800">Example</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{children}</p>
    </div>
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
      type="button"
      onClick={onClick}
      aria-pressed={selected}
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
