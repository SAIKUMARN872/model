"use client";

import { useEffect, useState } from "react";

type ReviewSettings = {
  automaticReview: boolean;
  reviewTrigger: string;
  exhaustiveReview: boolean;
  useCredits: boolean;
};

const defaultSettings: ReviewSettings = {
  automaticReview: false,
  reviewTrigger: "On PR open",
  exhaustiveReview: false,
  useCredits: false,
};

export default function CodeReviewSettingsPage() {
  const [provider, setProvider] = useState("GitHub");
  const [providerMenu, setProviderMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [triggerMenu, setTriggerMenu] = useState(false);
  const [settings, setSettings] =
    useState<ReviewSettings>(defaultSettings);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("modelnow-code-review-settings");
      if (saved) {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      }
    } catch {
      // Keep default settings if saved data is invalid.
    }
  }, []);

  function update<K extends keyof ReviewSettings>(
    key: K,
    value: ReviewSettings[K]
  ) {
    setSettings((current) => {
      const next = { ...current, [key]: value };
      localStorage.setItem(
        "modelnow-code-review-settings",
        JSON.stringify(next)
      );
      return next;
    });
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-10 pb-12 text-black">
      <h1 className="text-[28px] font-normal tracking-tight">
        Code Review
      </h1>

      <section>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Repositories</h2>
            <p className="mt-1 text-base text-gray-600">
              Choose a repository to configure its automatic reviews
            </p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setProviderMenu(!providerMenu)}
              className="flex items-center gap-3 rounded-full border border-gray-300 bg-[#f7f7f7] px-4 py-2.5 text-base hover:bg-gray-100"
            >
              {provider}
              <span className="text-gray-500">⌄</span>
            </button>

            {providerMenu && (
              <div className="absolute right-0 z-10 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                {["GitHub", "GitLab", "Bitbucket"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setProvider(item);
                      setProviderMenu(false);
                    }}
                    className="block w-full px-4 py-3 text-left text-sm hover:bg-gray-100"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-full border border-gray-300 px-4 py-3.5">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5 shrink-0 text-gray-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <circle cx="10.8" cy="10.8" r="7.2" />
            <path d="m16.2 16.2 4.3 4.3" />
          </svg>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search repositories"
            className="w-full bg-transparent text-base outline-none placeholder:text-gray-500"
          />
        </div>

        <div className="flex min-h-28 items-center justify-center px-4 text-center text-base text-gray-600">
          {search.trim()
            ? `No matching ${provider} repositories.`
            : `Connect a ${provider} account to configure repository reviews`}
        </div>
      </section>

      <section>
        <h2 className="mb-5 text-xl font-semibold">
          Personal preferences
        </h2>

        <div className="rounded-[22px] border border-gray-200 px-5">
          <div className="flex items-center justify-between gap-5 border-b border-gray-200 py-4">
            <div>
              <h3 className="font-semibold">Automatic review</h3>
              <p className="mt-1 text-sm leading-5 text-gray-600">
                If a repository’s review setting differs from your personal
                preference, the repository setting takes priority
              </p>
            </div>
            <Toggle
              checked={settings.automaticReview}
              onChange={(value) => update("automaticReview", value)}
              label="Automatic review"
            />
          </div>

          <div className="flex items-center justify-between gap-5 border-b border-gray-200 py-4">
            <div>
              <h3 className="font-semibold">Review trigger</h3>
              <p className="mt-1 text-sm text-gray-600">
                Choose when ModelNow should review your pull requests
              </p>
            </div>

            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setTriggerMenu(!triggerMenu)}
                className="flex items-center gap-3 rounded-full border border-gray-300 bg-[#f7f7f7] px-4 py-2.5 text-base hover:bg-gray-100"
              >
                {settings.reviewTrigger}
                <span className="text-gray-500">⌄</span>
              </button>

              {triggerMenu && (
                <div className="absolute right-0 z-10 mt-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                  {["On PR open", "On every update", "Manual only"].map(
                    (item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          update("reviewTrigger", item);
                          setTriggerMenu(false);
                        }}
                        className="block w-full px-4 py-3 text-left text-sm hover:bg-gray-100"
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-5 border-b border-gray-200 py-4">
            <div>
              <h3 className="font-semibold">Exhaustive code review</h3>
              <p className="mt-1 text-sm text-gray-600">
                Keep looking for findings until ModelNow stops finding new
                issues
              </p>
            </div>
            <Toggle
              checked={settings.exhaustiveReview}
              onChange={(value) => update("exhaustiveReview", value)}
              label="Exhaustive code review"
            />
          </div>

          <div className="flex items-center justify-between gap-5 py-4">
            <div>
              <h3 className="font-semibold">Use credits for reviews</h3>
              <p className="mt-1 text-sm text-gray-600">
                Allow credits to be consumed for reviews after rate limits
              </p>
            </div>
            <Toggle
              checked={settings.useCredits}
              onChange={(value) => update("useCredits", value)}
              label="Use credits for reviews"
            />
          </div>
        </div>
      </section>

      <p className="text-xs leading-5 text-gray-500">
        Preferences are saved in this browser. Repository listing and
        automatic reviews require Git provider and backend integration.
      </p>
    </main>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
        checked ? "bg-[#3984ff]" : "bg-[#dedede]"
      }`}
    >
      <span
        className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-all ${
          checked ? "left-[19px]" : "left-[3px]"
        }`}
      />
    </button>
  );
}